// Contact form handler for thelakes.network (a Vercel Function; the rest of
// the site is static). Replaces contact.php, which Vercel cannot run.

// Where every message goes. Damian, 11 Nov 2026: the Lakes network sites show
// no email address; all enquiries go to this one inbox.
const DELIVERY_EMAIL = "damian@churchtownmedia.co.uk";

// Sender. thelakes.network has no MX and no Resend DNS records, so mail sent
// FROM it fails. Southport Guide's domain is verified in Resend, so we send
// from its noreply address under the network's name. Change this once
// thelakes.network is verified in Resend.
const FROM_EMAIL = "The Lakes Network <noreply@southportguide.co.uk>";

const RESEND_URL = "https://api.resend.com/emails";

const ENQUIRY_TYPES = [
  "Advertising",
  "Free listing in The Lakes Guide",
  "Partnership opportunity",
  "Press or media",
  "General enquiry",
];
const DEFAULT_ENQUIRY_TYPE = "General enquiry";
const LIMITS = { name: 200, message: 5000 };
// Hidden field that people never see or fill. Bots that fill every field do.
const HONEYPOT_FIELD = "website";
const FAILED = "Sorry, your message could not be sent. Please try again later.";

const EMAIL_RE = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;

function isValidEmail(value) {
  return typeof value === "string" && value.length <= 254 && EMAIL_RE.test(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const oneLine = (value) => String(value ?? "").replace(/[\r\n]+/g, " ").trim();
const str = (value) => (typeof value === "string" ? value.trim() : "");

function normaliseEnquiryType(value) {
  return ENQUIRY_TYPES.includes(value) ? value : DEFAULT_ENQUIRY_TYPE;
}

function buildEnquiryEmail({ name, email, enquiry, message }) {
  return {
    from: FROM_EMAIL,
    to: [DELIVERY_EMAIL],
    reply_to: isValidEmail(email) ? email : undefined,
    subject: `[The Lakes Network] ${oneLine(enquiry)} from ${oneLine(name)}`,
    html:
      `<p><strong>Site:</strong> The Lakes Network (thelakes.network)</p>` +
      `<p><strong>Name:</strong> ${escapeHtml(name)}</p>` +
      `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` +
      `<p><strong>Enquiry type:</strong> ${escapeHtml(enquiry)}</p>` +
      `<p><strong>Message:</strong><br>${escapeHtml(message).replace(/\r?\n/g, "<br>")}</p>` +
      `<p>Reply to this email to answer the enquirer.</p>`,
  };
}

// Returns { error } like the Resend SDK: null when Resend accepted the mail.
async function sendEnquiryEmail(apiKey, mail, fetchImpl = fetch) {
  const res = await fetchImpl(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(mail),
  });
  if (res.ok) return { error: null };
  const body = await res.json().catch(() => ({}));
  return { error: { name: body.name ?? `http_${res.status}`, message: body.message ?? res.statusText } };
}

// Logs the error's name and message only: never the enquirer's details.
function logSendError(error) {
  const e = error ?? {};
  console.error("Contact email failed:", String(e.name ?? "Error"), String(e.message ?? ""));
}

// The page posts JSON with fetch. Without JavaScript the form posts
// urlencoded and gets a redirect back to the page with a status flag.
function reply(req, res, status, payload) {
  const wantsJson = String(req.headers["content-type"] ?? "").includes("application/json");
  if (wantsJson) {
    res.status(status).json(payload);
    return;
  }
  res.writeHead(303, { Location: status === 200 ? "/?sent=1#contact" : "/?error=1#contact" });
  res.end();
}

async function handler(req, res, { fetchImpl = fetch, apiKey = process.env.RESEND_API_KEY } = {}) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  // A filled honeypot means a bot: answer as if sent, send nothing.
  if (str(body[HONEYPOT_FIELD])) {
    reply(req, res, 200, { success: true });
    return;
  }

  const name = str(body.name);
  const email = str(body.email);
  const message = str(body.message);
  const enquiry = normaliseEnquiryType(body.enquiry);

  if (!name || !email || !message) {
    reply(req, res, 400, { error: "Name, email and message are required." });
    return;
  }
  if (!isValidEmail(email)) {
    reply(req, res, 400, { error: "Please enter a valid email address." });
    return;
  }
  if (name.length > LIMITS.name || message.length > LIMITS.message) {
    reply(req, res, 400, { error: `Name or message is too long (message max ${LIMITS.message} characters).` });
    return;
  }

  if (!apiKey) {
    logSendError({ name: "ConfigError", message: "RESEND_API_KEY is not set" });
    reply(req, res, 502, { error: FAILED });
    return;
  }

  try {
    const { error } = await sendEnquiryEmail(apiKey, buildEnquiryEmail({ name, email, enquiry, message }), fetchImpl);
    if (error) {
      logSendError(error);
      reply(req, res, 502, { error: FAILED });
      return;
    }
  } catch (err) {
    logSendError(err);
    reply(req, res, 502, { error: FAILED });
    return;
  }

  reply(req, res, 200, { success: true });
}

module.exports = handler;
module.exports.DELIVERY_EMAIL = DELIVERY_EMAIL;
module.exports.FROM_EMAIL = FROM_EMAIL;
module.exports.ENQUIRY_TYPES = ENQUIRY_TYPES;
module.exports.buildEnquiryEmail = buildEnquiryEmail;
module.exports.escapeHtml = escapeHtml;
module.exports.isValidEmail = isValidEmail;
module.exports.logSendError = logSendError;

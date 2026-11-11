// Contact form checks (11 Nov 2026). Run: node --test tests/contact.test.mjs
// Not deployed (.vercelignore). Sends nothing: Resend is replaced by a fake fetch.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handler = require("../api/contact.js");
const { DELIVERY_EMAIL, FROM_EMAIL, ENQUIRY_TYPES, buildEnquiryEmail, escapeHtml, isValidEmail, logSendError } = handler;
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const base = { name: "n", email: "e@x.co", enquiry: "General enquiry", message: "m" };

function call(body, { json = true, method = "POST", status = 200, resendBody = {}, apiKey = "k" } = {}) {
  const sent = [];
  const fetchImpl = async (url, init) => {
    sent.push({ url, init });
    return new Response(JSON.stringify(resendBody), { status });
  };
  const res = {
    code: 200, headers: {}, payload: undefined,
    status(c) { this.code = c; return this; },
    json(p) { this.payload = p; return this; },
    setHeader(k, v) { this.headers[k] = v; },
    writeHead(c, h) { this.code = c; Object.assign(this.headers, h); },
    end() {},
  };
  const req = { method, body, headers: { "content-type": json ? "application/json" : "application/x-www-form-urlencoded" } };
  return handler(req, res, { fetchImpl, apiKey }).then(() => ({ res, sent }));
}

test("the form delivers to damian@churchtownmedia.co.uk from the verified stand-in sender", async () => {
  assert.equal(DELIVERY_EMAIL, "damian@churchtownmedia.co.uk");
  assert.equal(FROM_EMAIL, "The Lakes Network <noreply@southportguide.co.uk>");
  const { res, sent } = await call(base);
  assert.equal(res.code, 200);
  assert.deepEqual(res.payload, { success: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, "https://api.resend.com/emails");
  const mail = JSON.parse(sent[0].init.body);
  assert.deepEqual(mail.to, [DELIVERY_EMAIL]);
  assert.equal(mail.from, FROM_EMAIL);
  assert.equal(mail.reply_to, "e@x.co");
});

test("a refused send is reported to the visitor, not hidden", async () => {
  const { res } = await call(base, { status: 403, resendBody: { name: "validation_error", message: "domain not verified" } });
  assert.equal(res.code, 502);
  assert.match(res.payload.error, /could not be sent/);
  const noKey = await call(base, { apiKey: "" });
  assert.equal(noKey.res.code, 502);
  assert.equal(noKey.sent.length, 0);
});

test("without JavaScript the form gets a redirect back to the page", async () => {
  const ok = await call(base, { json: false });
  assert.equal(ok.res.code, 303);
  assert.equal(ok.res.headers.Location, "/?sent=1#contact");
  const bad = await call({ ...base, email: "nope" }, { json: false });
  assert.equal(bad.res.headers.Location, "/?error=1#contact");
});

test("required fields, honeypot, method and enquiry type", async () => {
  for (const f of ["name", "email", "message"]) {
    const { res, sent } = await call({ ...base, [f]: "" });
    assert.equal(res.code, 400, f);
    assert.equal(sent.length, 0);
  }
  const bot = await call({ ...base, website: "http://spam" });
  assert.equal(bot.res.code, 200);
  assert.equal(bot.sent.length, 0, "honeypot must not send");
  const get = await call(base, { method: "GET" });
  assert.equal(get.res.code, 405);
  const odd = await call({ ...base, enquiry: "<b>x</b>" });
  assert.match(JSON.parse(odd.sent[0].init.body).subject, /General enquiry/);
});

test("the page's form posts to the function with the fields it reads", () => {
  const html = read("index.html");
  assert.match(html, /<form action="\/api\/contact" method="post" id="contact-form">/);
  for (const f of ["name", "email", "enquiry", "message", "website"]) assert.match(html, new RegExp(`name="${f}"`), f);
  const select = html.match(/<select id="enquiry" name="enquiry">([\s\S]*?)<\/select>/)[1];
  assert.deepEqual([...select.matchAll(/value="([^"]+)"/g)].map((m) => m[1]), ENQUIRY_TYPES);
});

test("every typed value is escaped in the html", () => {
  assert.equal(escapeHtml(`&<>"'`), "&amp;&lt;&gt;&quot;&#39;");
  const evil = "<script>x</script>&";
  for (const field of ["name", "email", "enquiry", "message"]) {
    const html = buildEnquiryEmail({ ...base, [field]: evil }).html;
    assert.ok(!html.includes("<script>"), field + " not escaped");
    assert.ok(html.includes("&lt;script&gt;x&lt;/script&gt;&amp;"), field + " missing escaped text");
  }
});

test("reply_to is the enquirer's address; unsafe addresses are rejected; subject is one line", () => {
  for (const bad of ["a@b.co, c@d.co", "a@b.co\nBcc: x@y.co", "a b@c.co", "<a@b.co>", "nodomain", "a@b", "x".repeat(250) + "@b.co"]) {
    assert.equal(isValidEmail(bad), false, bad);
    assert.equal(buildEnquiryEmail({ ...base, email: bad }).reply_to, undefined, bad);
  }
  assert.doesNotMatch(buildEnquiryEmail({ ...base, name: "a\r\nBcc: x" }).subject, /[\r\n]/);
});

test("logSendError logs only the error's name and message", () => {
  const calls = [];
  const orig = console.error;
  console.error = (...args) => calls.push(args);
  try {
    logSendError({ name: "validation_error", message: "domain not verified", to: "secret@x.co", body: "private text" });
  } finally {
    console.error = orig;
  }
  const out = calls[0].join(" ");
  assert.match(out, /validation_error/);
  assert.doesNotMatch(out, /secret@x\.co|private text/);
});

test("no address of ours is printed on the site, and no resend.dev sender", () => {
  const ours = /[A-Za-z0-9._%+-]+@(?:[a-z0-9-]+\.)*(?:thelakes\.network|thelakesguide\.co\.uk|hikethelakes\.com|thelakeswildlife\.co\.uk|churchtownmedia\.co\.uk|southportguide\.co\.uk)/gi;
  const files = readdirSync(new URL("..", import.meta.url)).filter((f) => !f.startsWith(".") && statSync(new URL(`../${f}`, import.meta.url)).isFile());
  for (const f of files.filter((f) => /\.(html|txt|xml|json|js|php)$/.test(f))) {
    assert.deepEqual(read(f).match(ours) ?? [], [], `${f} prints an address`);
  }
  const fn = read("api/contact.js").replace(/^\s*\/\/.*$/gm, "");
  assert.deepEqual((fn.match(ours) ?? []).map((a) => a.toLowerCase()), ["damian@churchtownmedia.co.uk", "noreply@southportguide.co.uk"]);
  assert.ok(!fn.includes("resend.dev"));
  assert.ok(!files.includes("contact.php"), "contact.php is gone");
});

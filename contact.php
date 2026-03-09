<?php
/**
 * Contact form handler for thelakes.network
 * Deploys to Hostinger public_html alongside index.html
 * Sends to hello@thelakes.network
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: /');
  exit;
}

$name = isset($_POST['name']) ? trim(htmlspecialchars($_POST['name'])) : '';
$email = isset($_POST['email']) ? trim(htmlspecialchars($_POST['email'])) : '';
$enquiry = isset($_POST['enquiry']) ? trim(htmlspecialchars($_POST['enquiry'])) : 'General';
$message = isset($_POST['message']) ? trim(htmlspecialchars($_POST['message'])) : '';

if (empty($name) || empty($email) || empty($message)) {
  header('Location: /?error=missing');
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  header('Location: /?error=invalid');
  exit;
}

$to = 'hello@thelakes.network';
$subject = 'The Lakes Network: ' . $enquiry . ' from ' . $name;
$body = "Enquiry type: " . $enquiry . "\n\n";
$body .= "From: " . $name . " <" . $email . ">\n\n";
$body .= "Message:\n" . $message . "\n";

$headers = [
  'From: ' . $name . ' <' . $email . '>',
  'Reply-To: ' . $email,
  'X-Mailer: PHP/' . phpversion(),
  'Content-Type: text/plain; charset=UTF-8'
];

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
  header('Location: /?sent=1');
} else {
  header('Location: /?error=send');
}
exit;

<?php
/**
 * LIIT Lighting design-visit form handler (Namecheap shared hosting).
 * Emails each request to the business inbox. No database, no cookies.
 *
 * Before going live:
 *  1. In cPanel > Email Accounts, create bookings@liitlighting.com (sending address only).
 *  2. Turn on SPF and DKIM for liitlighting.com (cPanel > Email Deliverability).
 */

date_default_timezone_set('America/Chicago');

// ---- Settings ----
$TO_EMAIL   = '52weekslighting@gmail.com';   // where requests arrive
$FROM_EMAIL = 'bookings@liitlighting.com';   // sending address on your domain
$FROM_NAME  = 'LIIT Lighting Website';
$MAX_PER_HOUR = 5;                           // per visitor IP

// ---- Helpers ----
$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function respond($ok, $error = '') {
    global $wantsJson;
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        if (!$ok) http_response_code($error === '' ? 500 : 400);
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    } else {
        header('Location: ' . ($ok ? '/thank-you.html' : '/?error=1#book'), true, 303);
    }
    exit;
}

function field($key, $max) {
    $v = isset($_POST[$key]) ? (string) $_POST[$key] : '';
    $v = trim(preg_replace('/[\r\n\t]+/', ' ', $v));   // blocks header injection
    $v = preg_replace('/[\x00-\x1F\x7F]/u', '', $v);
    if (function_exists('mb_substr')) return mb_substr($v, 0, $max, 'UTF-8');
    return substr($v, 0, $max);
}

function allowed($value, $options) {
    return in_array($value, $options, true) ? $value : '';
}

// ---- Method check ----
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: /#book', true, 303);
    exit;
}

// ---- Spam checks (invisible to real visitors) ----
// 1. Honeypot: bots fill every field, people never see this one.
if (!empty($_POST['website'])) respond(true);   // pretend success, send nothing

// 2. Timing: real people take more than a few seconds to fill the form.
$ts = isset($_POST['ts']) ? (int) $_POST['ts'] : 0;
$age = time() - $ts;
if ($ts <= 0 || $age < 4 || $age > 86400) {
    respond(false, 'Please wait a moment and try sending again, or call or text (515) 329-6403.');
}

// 3. Rate limit per IP address (stored as a hash in the server temp folder).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlFile = rtrim(sys_get_temp_dir(), '/') . '/liit_rl_' . hash('sha256', $ip . 'liit-form');
$now = time();
$hits = [];
if (is_readable($rlFile)) {
    $hits = array_filter(array_map('intval', explode(',', (string) @file_get_contents($rlFile))),
        function ($t) use ($now) { return $t > $now - 3600; });
}
if (count($hits) >= $MAX_PER_HOUR) {
    respond(false, 'We\'ve received several requests from you already. Please call or text (515) 329-6403.');
}

// ---- Validate fields ----
$name  = field('name', 100);
$phone = field('phone', 30);
$email = field('email', 160);
$city  = field('city', 100);

$type  = allowed(field('type', 20),  ['Home', 'Business']);
$use   = allowed(field('use', 40),   ['Everyday glow', 'Holidays', 'Game day', 'Safety', 'Selling soon']);
$scope = allowed(field('scope', 40), ['Front roofline', 'Front + sides', 'All the way around', 'Not sure yet']);
$when  = allowed(field('when', 40),  ['This week', 'Next 2 weeks', 'Before the holidays', 'Just exploring']);
$area  = allowed(field('area', 60),  ['Des Moines metro', 'Iowa Great Lakes (Okoboji)', 'Somewhere else in Iowa']);
$visit = allowed(field('visit', 10), ['10am', '12pm', '2pm', '4pm', '6pm']);

$digits = preg_replace('/\D/', '', $phone);

if (strlen($name) < 2) respond(false, 'Enter your name so we know who to ask for.');
if ($phone === '' && $email === '') respond(false, 'Add a phone number or an email so we can reach you.');
if ($phone !== '' && (strlen($digits) < 10 || strlen($digits) > 15)) respond(false, 'Enter a phone number with area code, like (515) 555-0123.');
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, 'Enter an email like you@example.com.');
if (preg_match('#https?://#i', $name . ' ' . $city)) respond(false, 'Please remove links from your name and city.');

// ---- Build the email ----
$subjectName = $name . ($city !== '' ? ', ' . $city : '');
$subject = 'New design visit request: ' . $subjectName;
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$lines = [
    'New design visit request from liitlighting.com',
    '',
    'Name:      ' . $name,
    'Phone:     ' . ($phone !== '' ? $phone : '(not given)'),
    'Email:     ' . ($email !== '' ? $email : '(not given)'),
    'City:      ' . ($city !== '' ? $city : '(not given)'),
    'Area:      ' . ($area !== '' ? $area : '(not given)'),
    '',
    'Property:  ' . ($type !== '' ? $type : '(not chosen)'),
    'Use:       ' . ($use !== '' ? $use : '(not chosen)'),
    'Coverage:  ' . ($scope !== '' ? $scope : '(not chosen)'),
    'Timing:    ' . ($when !== '' ? $when : '(not chosen)'),
    'Preferred visit time: ' . ($visit !== '' ? $visit : '(not chosen)'),
    '',
    'Sent ' . date('D, M j, Y g:i a T'),
];
$body = implode("\r\n", $lines);

$headers = [
    'From: ' . $FROM_NAME . ' <' . $FROM_EMAIL . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
if ($email !== '') $headers[] = 'Reply-To: ' . $email;

$sent = @mail($TO_EMAIL, $encodedSubject, $body, implode("\r\n", $headers), '-f' . $FROM_EMAIL);

if (!$sent) respond(false, 'Your plan didn\'t send. Please try again, or call or text (515) 329-6403.');

$hits[] = $now;
@file_put_contents($rlFile, implode(',', $hits), LOCK_EX);
respond(true);

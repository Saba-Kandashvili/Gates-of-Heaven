<?php
session_start();
require 'db.php';

$username = trim($_POST['username']);
$password = $_POST['password'];
$confirm = $_POST['confirm'];

if ($password !== $confirm) {
    die("Passwords do not match.");
}

if (strlen($password) < 4) {
    die("Password too short.");
}

$hashed = password_hash($password, PASSWORD_DEFAULT);

// Check if username exists
$stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    die("Username already taken.");
}

// Insert new user
$stmt = $db->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
$stmt->execute([$username, $hashed]);

$_SESSION['username'] = $username;
header("Location: ../index.html");
exit;
?>

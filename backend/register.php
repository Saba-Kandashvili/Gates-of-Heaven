<?php
session_start();
require 'db.php';

$username = trim($_POST['username']);
$password = $_POST['password'];
$confirm = $_POST['confirm'];

if ($password !== $confirm) {
    $_SESSION['error_message'] = "Passwords do not match.";
    header("Location: ../join.html");
    exit;
}

if (strlen($password) < 4) {
    $_SESSION['error_message'] = "Password must be at least 4 characters long.";
    header("Location: ../join.html");
    exit;
}

$hashed = password_hash($password, PASSWORD_DEFAULT);

// username must be unique
$stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    $_SESSION['error_message'] = "Username already taken.";
    header("Location: ../join.html");
    exit;
}

// insert to db
$stmt = $db->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
$stmt->execute([$username, $hashed]);


$_SESSION['username'] = $username;
$_SESSION['user_id'] = $db->lastInsertId();

header("Location: ../profile.html"); // go to profile ig
exit;
?>
<?php
session_start();
require 'db.php';

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

$stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    // Success: create session & cookie
    $_SESSION['username'] = $username;
    $_SESSION['user_id'] = $user['id'];
    setcookie('last_login', date('Y-m-d H:i:s'), time() + 3600, '/');
    
    header("Location: ../profile.html");
    exit;
} else {
    echo "Invalid username or password.";
}
?>

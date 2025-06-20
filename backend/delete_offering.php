<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    die("Not logged in");
}

$user_id = $_SESSION['user_id'];
$prayer_id = $_POST['prayer_id'] ?? null;


$stmt = $db->prepare("SELECT file_name FROM prayers WHERE id = ? AND user_id = ?");
$stmt->execute([$prayer_id, $user_id]);
$prayer = $stmt->fetch();

if ($prayer && $prayer['file_name']) {
    $file_path = __DIR__ . '/../uploads/' . $prayer['file_name'];
    if (file_exists($file_path)) {
        unlink($file_path); // actually delete the file
    }

    //remove from db as well
    $stmt = $db->prepare("UPDATE prayers SET file_name = NULL WHERE id = ?");
    $stmt->execute([$prayer_id]);
}

header("Location: ../profile.html");
exit;
?>

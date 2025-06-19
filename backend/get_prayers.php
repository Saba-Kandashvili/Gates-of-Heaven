<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $db->prepare("SELECT id, reason, message, file_name, created FROM prayers WHERE user_id = ? ORDER BY created DESC");
$stmt->execute([$user_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>

<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    die("Not logged in.");
}

$user_id = $_SESSION['user_id'];
$prayer_id = $_POST['prayer_id'] ?? null;

$allowed_ext = ['doc', 'docx', 'bmp', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'];

if (isset($_FILES['new_offering']) && $_FILES['new_offering']['error'] === UPLOAD_ERR_OK) {
    $file_tmp = $_FILES['new_offering']['tmp_name'];
    $original_name = basename($_FILES['new_offering']['name']);
    $ext = pathinfo($original_name, PATHINFO_EXTENSION);

    if (!in_array(strtolower($ext), $allowed_ext)) {
        die("Unsupported file type. Only Microsoft formats accepted in this holy domain.");
    }

    // Get existing file name to delete
    $stmt = $db->prepare("SELECT file_name FROM prayers WHERE id = ? AND user_id = ?");
    $stmt->execute([$prayer_id, $user_id]);
    $prayer = $stmt->fetch();

    if (!$prayer) {
        die("Prayer not found.");
    }

    if ($prayer['file_name']) {
        $old_file = __DIR__ . '/../uploads/' . $prayer['file_name'];
        if (file_exists($old_file)) {
            unlink($old_file);
        }
    }

    // Save new file
    $new_name = uniqid() . '_' . $original_name;
    $destination = __DIR__ . '/../uploads/' . $new_name;

    if (!move_uploaded_file($file_tmp, $destination)) {
        die("File could not be saved. Bill Gates has rejected your offering.");
    }

    // Update database
    $stmt = $db->prepare("UPDATE prayers SET file_name = ? WHERE id = ?");
    $stmt->execute([$new_name, $prayer_id]);
}

header("Location: ../profile.html");
exit;
?>

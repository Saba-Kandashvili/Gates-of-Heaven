<?php
session_start();
require 'db.php';

require 'require_login.php';

$user_id = $_SESSION['user_id'];
$reason = $_POST['reason'] ?? '';
$message = trim($_POST['message'] ?? '');
$file_name = null;

$allowed_ext = ['doc', 'docx', 'bmp', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'];

if (isset($_FILES['offering']) && $_FILES['offering']['error'] === UPLOAD_ERR_OK) {
    $file_tmp = $_FILES['offering']['tmp_name'];
    $original_name = basename($_FILES['offering']['name']);
    $ext = pathinfo($original_name, PATHINFO_EXTENSION);

    if (in_array(strtolower($ext), $allowed_ext)) {
        $new_name = uniqid() . '_' . $original_name;
        $destination = __DIR__ . '/../uploads/' . $new_name;
        if (!move_uploaded_file($file_tmp, $destination)) {
            die("Upload failed. The Lord could not bless this file.");
}
        $file_name = $new_name;
    } else {
        die("Only Microsoft file formats are accepted by His Holiness.");
    }
}

$stmt = $db->prepare("INSERT INTO prayers (user_id, reason, message, file_name) VALUES (?, ?, ?, ?)");
$stmt->execute([$user_id, $reason, $message, $file_name]);

header("Location: ../profile.html");
exit;
?>

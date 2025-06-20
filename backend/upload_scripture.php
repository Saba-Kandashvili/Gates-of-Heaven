<?php
session_start();
require 'db.php';
require 'require_login.php'; // onnly logged in users should be able to access this

$target_dir = __DIR__; 
$target_file = $target_dir . '/scriptures.txt';
$upload_ok = 1;
$status_message = '';

if (isset($_FILES['scripture_file'])) {
    // upload errors
    if ($_FILES['scripture_file']['error'] !== UPLOAD_ERR_OK) {
        $status_message = 'upload_error';
        $upload_ok = 0;
    }

    // only txt allowed
    $file_type = pathinfo(basename($_FILES['scripture_file']['name']), PATHINFO_EXTENSION);
    if (strtolower($file_type) != 'txt') {
        $status_message = 'invalid_type';
        $upload_ok = 0;
    }

    // all checks passed, upload the txt file
    if ($upload_ok) {
        if (move_uploaded_file($_FILES['scripture_file']['tmp_name'], $target_file)) {
            $status_message = 'success';
        } else {
            $status_message = 'move_failed';
        }
    }
} else {
    $status_message = 'no_file';
}

// redirect to scripture page with status
header('Location: ../scripture.html?status=' . $status_message);
exit;
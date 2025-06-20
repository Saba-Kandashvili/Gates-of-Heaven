<?php

$is_logged_in = false;

if (isset($_SESSION['user_id'])) {
    // user id must be valid in the db
    $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    if ($stmt->fetch()) {
        $is_logged_in = true;
    }
}

if (!$is_logged_in) {
    //invallid session
    session_unset();
    session_destroy();
    
    // redirect to login
    header('Location: ../login.html');
    exit;
}
?>
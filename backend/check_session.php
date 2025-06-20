<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

// user id must exist in the session
if (isset($_SESSION['user_id'])) {
    // if session is cached but user was deleted int he db
    $stmt = $db->prepare("SELECT id, username FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if ($user) {
        // double check the validity of the user
        echo json_encode([
            'loggedIn' => true,
            'username' => $user['username']
        ]);
        exit;
    }
}

// code should only get here if osmethings invalid so destroy the seeion
session_unset();
session_destroy();

echo json_encode(['loggedIn' => false]);
?>
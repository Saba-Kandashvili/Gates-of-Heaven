<?php
session_start();
require_once 'db.php'; // Use require_once to be safe

header('Content-Type: application/json');

// Check if a user ID exists in the session
if (isset($_SESSION['user_id'])) {
    // A session variable exists, but is the user still valid in the DB?
    $stmt = $db->prepare("SELECT id, username FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if ($user) {
        // Yes, the user is valid.
        echo json_encode([
            'loggedIn' => true,
            'username' => $user['username']
        ]);
        exit;
    }
}

// If we reach here, the session is invalid or the user doesn't exist.
// Destroy the invalid session to clean up.
session_unset();
session_destroy();

echo json_encode(['loggedIn' => false]);
?>
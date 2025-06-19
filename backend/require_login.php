<?php
// This script assumes a session has already been started by the script that includes it.
// It also assumes the $db variable is available from a 'require db.php' call.

$is_logged_in = false;

if (isset($_SESSION['user_id'])) {
    // Check if the user ID from the session is valid in the database
    $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    if ($stmt->fetch()) {
        // User is valid and logged in
        $is_logged_in = true;
    }
}

// If the user is not logged in after all checks, handle it.
if (!$is_logged_in) {
    // Destroy any potentially invalid session data
    session_unset();
    session_destroy();
    
    // Redirect to the login page
    header('Location: ../login.html');
    exit;
}
?>
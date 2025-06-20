<?php
session_start();

header('Content-Type: text/plain');

if (isset($_SESSION['error_message'])) {
    echo $_SESSION['error_message'];
    // message should not appear after refresh
    unset($_SESSION['error_message']);
}
?>
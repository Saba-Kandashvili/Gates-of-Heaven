<?php
require 'db.php';

// users table
$db->exec("CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)");

// prayers table
$db->exec("CREATE TABLE IF NOT EXISTS prayers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  reason TEXT,
  message TEXT,
  file_name TEXT,
  created DATETIME DEFAULT CURRENT_TIMESTAMP
)");

echo "Database initialized.";
?>

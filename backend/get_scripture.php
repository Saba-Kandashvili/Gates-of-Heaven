<?php
header('Content-Type: text/plain');

$filePath = __DIR__ . '/scriptures.txt';

if (file_exists($filePath)) {
    // This demonstrates the "file reading" requirement
    echo file_get_contents($filePath);
} else {
    echo 'The sacred texts could not be found. Please consult a system administrator.';
}
?>
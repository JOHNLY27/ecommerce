<?php
// Simple DB helper to read .env and provide PDO connection
function readEnv($path) {
    $env = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (!strpos($line, '=')) continue;
        [$k, $v] = array_map('trim', explode('=', $line, 2));
        $v = trim($v, "\"'");
        $env[$k] = $v;
    }
    return $env;
}

function getPdo() {
    $env = readEnv(__DIR__ . '/../.env');
    $host = $env['DB_HOST'] ?? '127.0.0.1';
    $port = $env['DB_PORT'] ?? '3306';
    $db = $env['DB_DATABASE'] ?? 'laravel';
    $user = $env['DB_USERNAME'] ?? 'root';
    $pass = $env['DB_PASSWORD'] ?? '';

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    try {
        $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    } catch (Exception $e) {
        fwrite(STDERR, "DB connection error: " . $e->getMessage() . "\n");
        exit(1);
    }
    return $pdo;
}

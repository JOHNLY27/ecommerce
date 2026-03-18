<?php
require __DIR__ . '/db_helpers.php';
$pdo = getPdo();
$stmt = $pdo->query('SELECT id, name, created_at, updated_at FROM categories ORDER BY id ASC');
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT) . "\n";

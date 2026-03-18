<?php
require __DIR__ . '/db_helpers.php';
$pdo = getPdo();
$stmt = $pdo->query("SELECT p.id, p.name, p.category_id, c.name as category_name, p.is_sale FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_sale = 1 OR c.name = 'SALE'");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT) . "\n";

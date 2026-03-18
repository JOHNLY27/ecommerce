<?php
$db = __DIR__ . '/../database/database.sqlite';
$pdo = new PDO('sqlite:' . $db);
$stmt = $pdo->query('SELECT id, name, email FROM users');
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo "{$r['id']}\t{$r['name']}\t{$r['email']}\n";
}

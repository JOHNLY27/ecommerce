<?php
$db = __DIR__ . '/../database/database.sqlite';
if (!file_exists($db)) {
    echo "NO_DB\n";
    exit(1);
}
try {
    $pdo = new PDO('sqlite:' . $db);
    $tables = ['users', 'products', 'orders', 'order_items'];
    foreach ($tables as $t) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as c FROM \"$t\"");
            $c = $stmt ? $stmt->fetchColumn() : 0;
            echo "$t:" . ($c === false ? 0 : $c) . "\n";
        } catch (Exception $e) {
            echo "$t:ERROR\n";
        }
    }
} catch (Exception $e) {
    echo 'CONNECT_ERROR:' . $e->getMessage() . "\n";
}

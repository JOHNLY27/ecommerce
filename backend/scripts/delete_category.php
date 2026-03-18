<?php
require __DIR__ . '/db_helpers.php';
if ($argc < 2) {
    fwrite(STDERR, "Usage: php delete_category.php <id> [--reassign=<target_id>]\n");
    exit(1);
}
$id = (int)$argv[1];
$reassign = null;
foreach ($argv as $arg) {
    if (strpos($arg, '--reassign=') === 0) {
        $reassign = (int)substr($arg, strlen('--reassign='));
    }
}
$pdo = getPdo();
$pdo->beginTransaction();
try {
    // check category exists
    $stmt = $pdo->prepare('SELECT id, name FROM categories WHERE id = ?');
    $stmt->execute([$id]);
    $cat = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$cat) {
        throw new Exception("Category id $id not found");
    }
    // reassign products if requested
    if ($reassign) {
        $stmt = $pdo->prepare('SELECT id FROM categories WHERE id = ?');
        $stmt->execute([$reassign]);
        if (!$stmt->fetch()) {
            throw new Exception("Reassign target id $reassign not found");
        }
        $update = $pdo->prepare('UPDATE products SET category_id = ? WHERE category_id = ?');
        $update->execute([$reassign, $id]);
    } else {
        // set category_id to null
        $update = $pdo->prepare('UPDATE products SET category_id = NULL WHERE category_id = ?');
        $update->execute([$id]);
    }
    // delete category
    $del = $pdo->prepare('DELETE FROM categories WHERE id = ?');
    $del->execute([$id]);
    $pdo->commit();
    echo "Deleted category id $id ({$cat['name']}).\n";
    if ($reassign) echo "Products reassigned to $reassign.\n";
} catch (Exception $e) {
    $pdo->rollBack();
    fwrite(STDERR, "Error: " . $e->getMessage() . "\n");
    exit(1);
}

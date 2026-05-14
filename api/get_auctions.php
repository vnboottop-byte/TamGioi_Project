<?php
session_start(); header('Content-Type: application/json'); require_once '../db.php';

// Chỉ lấy những món đang bán (selling)
$sql = "SELECT a.id as auction_id, a.seller_name, a.price_gold, a.created_at, 
               s.name, s.model_url, s.item_type, s.required_class, s.bonus_damage, s.bonus_hp 
        FROM auction_house a 
        JOIN shop_items s ON a.item_id = s.id 
        WHERE a.status = 'selling' 
        ORDER BY a.id DESC";

$res = $conn->query($sql);
$data = [];
while ($row = $res->fetch_assoc()) { $data[] = $row; }

// Lấy thêm số vàng của người xem
$gold = 0;
if (isset($_SESSION['user'])) {
    $r = $conn->query("SELECT game_gold FROM game_characters WHERE username = '{$_SESSION['user']}'")->fetch_assoc();
    if ($r) $gold = $r['game_gold'];
}

echo json_encode(['status' => 'success', 'data' => $data, 'my_gold' => $gold, 'my_name' => $_SESSION['user'] ?? '']);
?>
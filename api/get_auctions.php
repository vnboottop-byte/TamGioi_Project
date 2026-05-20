<?php
session_start(); header('Content-Type: application/json'); require_once '../db.php';

// 1. MÁY QUÉT 24H: Đẩy đồ treo quá 1 ngày vào Hộp Thư Rác
$conn->query("UPDATE auction_house SET status = 'expired' WHERE status = 'selling' AND created_at < (NOW() - INTERVAL 1 DAY)");




// 2. Lấy danh sách đang bán (Hỗ trợ cả Vật phẩm và Tiền tệ)
$sql = "SELECT a.id as auction_id, a.seller_name, a.item_id, a.price_gold, a.created_at, a.upgrade_level, a.item_type as auction_type,
               s.name, s.model_url, s.item_type, s.required_class, s.bonus_damage, s.bonus_hp, s.bonus_speed 
        FROM auction_house a 
        LEFT JOIN shop_items s ON a.item_id = s.id 
        WHERE a.status = 'selling' 
        ORDER BY a.id DESC";





$res = $conn->query($sql);
$data = [];
while ($row = $res->fetch_assoc()) { $data[] = $row; }

// 3. Lấy số dư 2 ví của người chơi (Vàng & Linh Thạch)
$gold = 0; $linh_thach = 0;
if (isset($_SESSION['user'])) {
    $user = $_SESSION['user'];
    $r = $conn->query("SELECT game_gold FROM game_characters WHERE username = '$user'")->fetch_assoc();
    if ($r) $gold = $r['game_gold'];
    
    $u = $conn->query("SELECT balance FROM users WHERE username = '$user'")->fetch_assoc();
    if ($u) $linh_thach = $u['balance'];
}

echo json_encode(['status' => 'success', 'data' => $data, 'my_gold' => $gold, 'my_linh_thach' => $linh_thach, 'my_name' => $_SESSION['user'] ?? '']);
?>
<?php
// FILE: api/get_inventory.php
session_start(); header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) { echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập!']); exit; }
$username = $_SESSION['user'];

// 🌟 Lấy thêm Ví tiền cày cuốc (game_gold)
$stmt_gold = $conn->query("SELECT game_gold FROM game_characters WHERE username = '$username'");
$game_gold = ($stmt_gold && $stmt_gold->num_rows > 0) ? $stmt_gold->fetch_assoc()['game_gold'] : 0;

// 🌟 BẢN VÁ: Lấy thêm Ví Linh Thạch (balance) từ bảng users giống bên Chợ Đen
$stmt_bal = $conn->query("SELECT balance FROM users WHERE username = '$username'");
$balance = ($stmt_bal && $stmt_bal->num_rows > 0) ? $stmt_bal->fetch_assoc()['balance'] : 0;
// Lấy đồ đạc kèm theo Chỉ số và Yêu cầu Phái




// 🌟 MÓC CHỈ SỐ THỰC TẾ (ĐÃ GIÁM ĐỊNH) TỪ TÚI ĐỒ THAY VÌ TỪ SHOP
$sql = "SELECT inv.id as inv_id, inv.item_id, inv.item_type, inv.is_equipped, inv.upgrade_level,
               inv.bonus_damage, inv.bonus_hp, inv.bonus_speed,
               shop.name, shop.model_url, shop.required_class, shop.price 
        FROM user_inventory inv
        JOIN shop_items shop ON inv.item_id = shop.id 
        WHERE inv.username = ? 
        ORDER BY inv.is_equipped DESC, inv.id DESC";




$stmt = $conn->prepare($sql); $stmt->bind_param("s", $username); $stmt->execute();
$res = $stmt->get_result();
$items = [];
while ($row = $res->fetch_assoc()) { $items[] = $row; }

echo json_encode(['status' => 'success', 'data' => $items, 'game_gold' => $game_gold, 'balance' => $balance]);
?>
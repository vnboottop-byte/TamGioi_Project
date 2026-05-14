<?php
// FILE: api/get_inventory.php
session_start(); header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) { echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập!']); exit; }
$username = $_SESSION['user'];

// 🌟 Lấy thêm Ví tiền cày cuốc (game_gold)
$stmt_gold = $conn->query("SELECT game_gold FROM game_characters WHERE username = '$username'");
$game_gold = ($stmt_gold && $stmt_gold->num_rows > 0) ? $stmt_gold->fetch_assoc()['game_gold'] : 0;

// Lấy đồ đạc kèm theo Chỉ số và Yêu cầu Phái
$sql = "SELECT inv.id as inv_id, inv.item_id, inv.item_type, inv.is_equipped, 
               shop.name, shop.model_url, shop.required_class, shop.bonus_damage, shop.bonus_hp, shop.price 
        FROM user_inventory inv 
        JOIN shop_items shop ON inv.item_id = shop.id 
        WHERE inv.username = ? 
        ORDER BY inv.is_equipped DESC, inv.id DESC";

$stmt = $conn->prepare($sql); $stmt->bind_param("s", $username); $stmt->execute();
$res = $stmt->get_result();
$items = [];
while ($row = $res->fetch_assoc()) { $items[] = $row; }

echo json_encode(['status' => 'success', 'data' => $items, 'game_gold' => $game_gold]);
?>
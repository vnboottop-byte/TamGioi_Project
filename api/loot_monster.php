<?php
// FILE: api/loot_monster.php (BẢN V9 - CHỐNG LẠM PHÁT BẰNG GIỚI HẠN VÒNG LẶP)
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || !isset($_POST['monster_level'])) exit;

$user = $_SESSION['user'];
$lvl = intval($_POST['monster_level']);

$conn->begin_transaction();
try {
    // ==========================================
    // 1. 💰 XỬ LÝ RỚT VÀNG (100 -> 500 x Cấp Boss)
    // ==========================================
    $gold = rand(100, 500) * $lvl;
    $conn->query("UPDATE game_characters SET game_gold = game_gold + $gold WHERE username = '$user'");

    $item_dropped_name = null;
    $item_dropped_type = null;

    // ==========================================
    // 2. 🎁 VÒNG QUAY NHÂN PHẨM (ĐÃ BỌC THÉP CHỐNG LẠM PHÁT)
    // ==========================================
    
    // 🌟 BÍ THUẬT CHỐNG LẠM PHÁT: Chỉ cho con Boss này "bốc thăm" ngẫu nhiên TỐI ĐA 3 MÓN trong Shop để xét duyệt.
    $res = $conn->query("SELECT id, name, item_type, price, required_class FROM shop_items ORDER BY RAND() LIMIT 3");
    
    $buff_level = 1.0 + ($lvl * 0.02);

    while ($item = $res->fetch_assoc()) {
        $price = intval($item['price']);
        $base_rate = 0;

        // 🌟 ĐÃ NERF TỶ LỆ GỐC CHO HARDCORE HƠN THEO Ý SẾP
        if ($price >= 1000000) {
            $base_rate = 0.0001; // 0.0001% (Cực hiếm, ra được là gào thét)
        } elseif ($price >= 500000) {
            $base_rate = 0.01;   // 0.01%
        } elseif ($price >= 200000) {
            $base_rate = 0.1;    // 0.1%
        } elseif ($price >= 100000) {
            $base_rate = 0.5;    // 0.5%
        } elseif ($price >= 10000) {
            $base_rate = 2.0;    // 2%
        } else {
            $base_rate = 5.0;    // Đồ cùi (<= 1000) -> 5%
        }

        $final_rate = $base_rate * $buff_level;
        
        // 🎲 BÓC THĂM (0.0001% tới 100.0000%)
        $randomNumber = rand(1, 1000000) / 10000; 

        if ($randomNumber <= $final_rate) {
            // 🌟 TRÚNG THƯỞNG!
            $item_id = $item['id'];
            $item_type = $item['item_type'];
            
            $insert = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped) VALUES (?, ?, ?, 0)");
            $insert->bind_param("sis", $user, $item_id, $item_type);
            $insert->execute();

            $item_dropped_name = $item['name'];
            $item_dropped_type = $item['item_type'];
            
            break; // 🛑 Chỉ rớt tối đa 1 món!
        }
    }

    $conn->commit();
    echo json_encode(['status' => 'success', 'gold' => $gold, 'item_name' => $item_dropped_name, 'item_type' => $item_dropped_type]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error']);
}
?>
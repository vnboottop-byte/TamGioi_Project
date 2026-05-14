<?php
// FILE: api/loot_monster.php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || !isset($_POST['monster_level'])) exit;
$user = $_SESSION['user'];
$lvl = intval($_POST['monster_level']);
$boss_name = isset($_POST['monster_name']) ? $_POST['monster_name'] : '';

$conn->begin_transaction();
try {
    // 1. 💰 XỬ LÝ RỚT VÀNG (Giao động từ 100 -> 500 x Cấp Boss)
    $gold = rand(100, 500) * $lvl;
    $conn->query("UPDATE game_characters SET game_gold = game_gold + $gold WHERE username = '$user'");

    $item_dropped_name = null;
    $item_dropped_type = null;

    // 2. 🎁 XỬ LÝ RỚT ĐỒ (VÒNG QUAY NHÂN PHẨM)
    if (!empty($boss_name)) {
        // Lấy tất cả danh sách đồ mà con Boss này có thể rớt
        $stmt = $conn->prepare("SELECT d.item_id, d.drop_rate, s.name, s.item_type FROM monster_drops d JOIN shop_items s ON d.item_id = s.id WHERE d.monster_name = ?");
        $stmt->bind_param("s", $boss_name);
        $stmt->execute();
        $drops = $stmt->get_result();

        while ($drop = $drops->fetch_assoc()) {
            $rate = floatval($drop['drop_rate']);
            
            // Thuật toán quay số (Tỉ lệ 0.001% tới 100%)
            // Rand từ 1 đến 100,000 (Tương đương 3 số thập phân)
            $randomNumber = rand(1, 100000) / 1000; 

            if ($randomNumber <= $rate) {
                // TRÚNG ĐỘC ĐẮC! Bỏ đồ vào túi người chơi
                $item_id = $drop['item_id'];
                $item_type = $drop['item_type'];
                
                $insert = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped) VALUES (?, ?, ?, 0)");
                $insert->bind_param("sis", $user, $item_id, $item_type);
                $insert->execute();

                $item_dropped_name = $drop['name'];
                $item_dropped_type = $drop['item_type'];
                break; // 🌟 Tránh rớt 2 đồ 1 lúc, rớt 1 món là thoát vòng lặp ngay!
            }
        }
    }

    $conn->commit();
    echo json_encode(['status' => 'success', 'gold' => $gold, 'item_name' => $item_dropped_name, 'item_type' => $item_dropped_type]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error']);
}
?>
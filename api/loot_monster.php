<?php
// FILE: api/loot_monster.php (BẢN V8 - LÒ QUAY NHÂN PHẨM TOÀN CẦU TỰ ĐỘNG)
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
    // 2. 🎁 VÒNG QUAY NHÂN PHẨM (RỚT VẬT PHẨM GLOBAL)
    // ==========================================
    
    // Kéo TOÀN BỘ kho hàng ra, Xáo trộn ngẫu nhiên (ORDER BY RAND()) để đảm bảo công bằng cho mọi món đồ!
    $res = $conn->query("SELECT id, name, item_type, price, required_class FROM shop_items ORDER BY RAND()");
    
    // Hệ số Buff Level: Quái cấp càng cao, tỷ lệ rớt đồ càng được nhân lên
    // Ví dụ: Mỗi level tăng 2% cơ hội. Boss Level 50 sẽ nhân đôi (x2) tỷ lệ gốc!
    $buff_level = 1.0 + ($lvl * 0.02);

    while ($item = $res->fetch_assoc()) {
        $price = intval($item['price']);
        $base_rate = 0;

        // 🌟 BỘ LỌC TỶ LỆ CHUẨN CỦA SẾP DỰA THEO GIÁ (Niêm yết Shop)
        if ($price >= 1000000) {
            $base_rate = 0.0005; // 0.0005%
        } elseif ($price >= 500000) {
            $base_rate = 0.05;   // 0.05%
        } elseif ($price >= 200000) {
            $base_rate = 1.0;    // 1%
        } elseif ($price >= 100000) {
            $base_rate = 2.0;    // 2%
        } elseif ($price >= 10000) {
            $base_rate = 5.0;    // 5%
        } else {
            $base_rate = 10.0;   // Đồ cùi (<= 1000) -> 10%
        }

        // Tỷ lệ cuối cùng = Tỷ lệ gốc x Hệ số Level Boss
        $final_rate = $base_rate * $buff_level;

        // 🎲 BÓC THĂM NHÂN PHẨM (Độ chia cực nhỏ: từ 0.0001 đến 100.0000)
        // Rand từ 1 đến 1,000,000, sau đó chia cho 10,000
        $randomNumber = rand(1, 1000000) / 10000; 

        if ($randomNumber <= $final_rate) {
            // 🌟 TRÚNG ĐỘC ĐẮC! Bỏ đồ vào túi người chơi
            $item_id = $item['id'];
            $item_type = $item['item_type'];
            
            $insert = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped) VALUES (?, ?, ?, 0)");
            $insert->bind_param("sis", $user, $item_id, $item_type);
            $insert->execute();

            $item_dropped_name = $item['name'];
            $item_dropped_type = $item['item_type'];
            
            // 🛑 LÁ CHẮN CHỐNG LẠM PHÁT: Giết 1 con Boss chỉ rớt tối đa 1 món! Rớt xong là vỡ vòng lặp ngay!
            break; 
        }
    }

    $conn->commit();
    echo json_encode(['status' => 'success', 'gold' => $gold, 'item_name' => $item_dropped_name, 'item_type' => $item_dropped_type]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error']);
}
?>
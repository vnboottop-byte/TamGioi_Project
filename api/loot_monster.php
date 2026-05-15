<?php
// FILE: api/loot_monster.php (BẢN V15 - CÀY CUỐC HARDCORE, CHỐNG LẠM PHÁT TUYỆT ĐỐI)
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || !isset($_POST['monster_level'])) exit;

$user = $_SESSION['user'];
$lvl = intval($_POST['monster_level']);

$conn->begin_transaction();
try {
    // ==========================================
    // 1. 💰 XỬ LÝ RỚT VÀNG (Lúc nào cũng rớt: 100 -> 500 x Cấp Boss)
    // ==========================================
    $gold = rand(100, 500) * $lvl;
    $conn->query("UPDATE game_characters SET game_gold = game_gold + $gold WHERE username = '$user'");

    $item_dropped_name = null;
    $item_dropped_type = null;
    $item_dropped_model = null;

    // ==========================================
    // 2. 🎁 VÒNG QUAY NHÂN PHẨM (RẤT KHẮC NGHIỆT)
    // ==========================================
    
    // 🌟 NERF 1: 80% khả năng con Boss KHÔNG CÓ ĐỒ, chỉ rớt vàng! (Chỉ 20% được đi tiếp)
    $co_rot_do_khong = rand(1, 100); 

    if ($co_rot_do_khong <= 20) {
        
        // 🌟 NERF 2: Chỉ lấy đúng 1 món ngẫu nhiên trong Shop ra để xét duyệt (LIMIT 1)
        $res = $conn->query("SELECT id, name, item_type, price, required_class, model_url FROM shop_items ORDER BY RAND() LIMIT 1");
        
        // 🌟 NERF 3: Buff level giảm một nửa (Chỉ còn 1% mỗi cấp Boss)
        $buff_level = 1.0 + ($lvl * 0.01);

        if ($item = $res->fetch_assoc()) {
            $price = intval($item['price']);
            $base_rate = 0;

            // 🌟 NERF 4: Ép tỷ lệ rớt thê thảm chuẩn MMO
            if ($price >= 1000000) {
                $base_rate = 0.0001; // 0.0001% (Chí Tôn - Đánh triệu con mới ra)
            } elseif ($price >= 500000) {
                $base_rate = 0.005;  // 0.005% (Thú cưỡi xịn - Khó hơn lên trời)
            } elseif ($price >= 200000) {
                $base_rate = 0.02;   // 0.02% 
            } elseif ($price >= 100000) {
                $base_rate = 0.1;    // 0.1% 
            } elseif ($price >= 10000) {
                $base_rate = 0.5;    // 0.5% (Vũ khí trung bình)
            } else {
                $base_rate = 2.0;    // 2.0% (Đồ cùi - Trăm con rớt 2 cái)
            }

            $final_rate = $base_rate * $buff_level;
            
            // 🎲 Quay số từ 0.0001% đến 100.0000%
            $randomNumber = rand(1, 1000000) / 10000; 

            if ($randomNumber <= $final_rate) {
                // TRÚNG ĐỘC ĐẮC!
                $item_id = $item['id'];
                $item_type = $item['item_type'];
                
                $insert = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped) VALUES (?, ?, ?, 0)");
                $insert->bind_param("sis", $user, $item_id, $item_type);
                $insert->execute();

                $item_dropped_name = $item['name'];
                $item_dropped_type = $item['item_type'];
                $item_dropped_model = $item['model_url'];
            }
        }
    }

    $conn->commit();
    echo json_encode([
        'status' => 'success', 
        'gold' => $gold, 
        'item_name' => $item_dropped_name, 
        'item_type' => $item_dropped_type,
        'item_model' => $item_dropped_model
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error']);
}
?>
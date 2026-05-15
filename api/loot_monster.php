<?php
// FILE: api/loot_monster.php (BẢN V17 - QUÁI THƯỜNG CHỈ RỚT ĐỒ < 50K)
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
    $item_dropped_model = null;

    // ==========================================
    // 2. 🎁 VÒNG QUAY NHÂN PHẨM (ĐÃ KHÓA ĐỒ VIP)
    // ==========================================
    
    // 60% khả năng quái rớt rương (Nới lỏng để rơi đồ cùi nhiều cho vui)
    $co_rot_do_khong = rand(1, 100); 

    if ($co_rot_do_khong <= 60) {
        
        // 🌟 BÍ THUẬT: Ép lệnh SQL chỉ được bốc các món đồ có giá < 50.000 VND
        $res = $conn->query("SELECT id, name, item_type, price, required_class, model_url FROM shop_items WHERE price < 50000 ORDER BY RAND() LIMIT 2");
        
        // Buff level (1% mỗi cấp quái)
        $buff_level = 1.0 + ($lvl * 0.01);

        while ($item = $res->fetch_assoc()) {
            $price = intval($item['price']);
            $base_rate = 0;

            // 🌟 CHỈ CÒN 2 MỐC TỈ LỆ CHO ĐỒ BÌNH DÂN
            if ($price >= 10000) {
                $base_rate = 4.0;    // 4.0% (Vũ khí hạng trung 10k - 49k)
            } else {
                $base_rate = 10.0;   // 10.0% (Đồ cùi dưới 10k - Rớt lặt vặt liên tục)
            }

            $final_rate = $base_rate * $buff_level;
            
            // 🎲 Quay số từ 0.0001% đến 100.0000%
            $randomNumber = rand(1, 1000000) / 10000; 

            if ($randomNumber <= $final_rate) {
                // TRÚNG THƯỞNG!
                $item_id = $item['id'];
                $item_type = $item['item_type'];
                
                $insert = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped) VALUES (?, ?, ?, 0)");
                $insert->bind_param("sis", $user, $item_id, $item_type);
                $insert->execute();

                $item_dropped_name = $item['name'];
                $item_dropped_type = $item['item_type'];
                $item_dropped_model = $item['model_url'];
                
                break; // Chỉ cho rớt tối đa 1 món trong số 2 món được bốc ra
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
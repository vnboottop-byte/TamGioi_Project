<?php
// FILE: api/loot_monster.php (BẢN V23 - 100% RỚT VÀNG, CHUẨN 17 VẠN/NGÀY)
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || !isset($_POST['monster_id'])) exit;

$user = $_SESSION['user'];
$boss_id = intval($_POST['monster_id']); 

$conn->begin_transaction();
try {
    // 1. LẤY THÔNG TIN BOSS TỪ DB
    $stmtBoss = $conn->prepare("SELECT level, name FROM map_monsters WHERE id = ? FOR UPDATE");
    $stmtBoss->bind_param("i", $boss_id);
    $stmtBoss->execute();
    $bossData = $stmtBoss->get_result()->fetch_assoc();
    
    if (!$bossData) throw new Exception("Boss không tồn tại!");
    
    $lvl = intval($bossData['level']);
    $tenBoss = $bossData['name'];

    // ==========================================
    // 2. 💰 XỬ LÝ RỚT VÀNG (100% RỚT VÀNG CHO MỌI CON BOSS)
    // Trung bình cấp 100 rớt ~60 Vàng. Cày 2880 con/ngày = ~17 Vạn Vàng.
    // ==========================================
    $gold = 0;
    
    if ($lvl < 10) { $gold = rand(3, 8); }                 // Tân thủ cấp 1-9: rớt 3-8 Vàng
    elseif ($lvl < 20) { $gold = rand(8, 14); }            // Cấp 10-19: rớt 8-14 Vàng
    elseif ($lvl < 30) { $gold = rand(14, 20); }           
    elseif ($lvl < 40) { $gold = rand(20, 26); }
    elseif ($lvl < 50) { $gold = rand(26, 32); }
    elseif ($lvl < 60) { $gold = rand(32, 38); }
    elseif ($lvl < 70) { $gold = rand(38, 46); }
    elseif ($lvl < 80) { $gold = rand(46, 54); }
    elseif ($lvl < 90) { $gold = rand(54, 60); }
    else { $gold = rand(58, 65); }                         // Max cấp 90-100: rớt 58-65 Vàng

    // Cập nhật Vàng trực tiếp cho người chơi (Bảo đảm con nào cũng rớt)
    if ($gold > 0) {
        $conn->query("UPDATE game_characters SET game_gold = game_gold + $gold WHERE username = '$user'");
    }

    $item_dropped_name = null;
    $item_dropped_type = null;
    $item_dropped_model = null;

    // ==========================================
    // 3. 🎁 VÒNG QUAY NHÂN PHẨM TRANG BỊ
    // Tỷ lệ rớt đồ: 15% (Đánh 10 con rớt 1-2 món rác để mang đi rã lấy Vàng)
    // ==========================================
    if (rand(1, 100) <= 15) {
        $res = $conn->query("SELECT id, name, item_type, price, required_class, model_url FROM shop_items WHERE price < 50000 ORDER BY RAND() LIMIT 1");
        
        if ($item = $res->fetch_assoc()) {
            $item_id = $item['id'];
            $item_type = $item['item_type'];
            
            // 🌟 ĐỒ NHẶT TỪ QUÁI LÀ ĐỒ CHƯA GIÁM ĐỊNH (Mặc định 0,0,0)
            $insert = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped, bonus_damage, bonus_hp, bonus_speed) VALUES (?, ?, ?, 0, 0, 0, 0)");
            $insert->bind_param("sis", $user, $item_id, $item_type);
            $insert->execute();

            $item_dropped_name = $item['name'];
            $item_dropped_type = $item['item_type'];
            $item_dropped_model = $item['model_url'];
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
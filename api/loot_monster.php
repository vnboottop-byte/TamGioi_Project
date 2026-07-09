<?php
// FILE: api/loot_monster.php (BẢN VÁ AAA - CHỐNG HACK IN TIỀN TỶ)
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || !isset($_POST['monster_id'])) exit;

$user = $_SESSION['user'];
$boss_id = intval($_POST['monster_id']); 

$conn->begin_transaction();
try {
    // 1. LẤY THÔNG TIN BOSS
    $stmtBoss = $conn->prepare("SELECT level, name, hp, death_time FROM map_monsters WHERE id = ? FOR UPDATE");
    $stmtBoss->bind_param("i", $boss_id);
    $stmtBoss->execute();
    $bossData = $stmtBoss->get_result()->fetch_assoc();
    
    if (!$bossData) throw new Exception("Boss không tồn tại!");
    
    // 🛑 LÁ CHẮN BẢO MẬT 1: BOSS CHƯA CHẾT THÌ KHÔNG CÓ QUÀ!
    if (intval($bossData['hp']) > 0) {
        throw new Exception("Hacker à? Boss chưa chết lấy gì rớt đồ!");
    }

    $death_time = intval($bossData['death_time']);
    
    // 🛑 LÁ CHẮN BẢO MẬT 2: CHỐNG NHẶT 2 LẦN TRONG 1 VÒNG ĐỜI CỦA BOSS
    // Ta lưu death_time của con boss này vào Session của người chơi. 
    // Nếu trùng -> Tức là nó đã nhận quà của lần chết này rồi -> Cấm nhận tiếp!
    if (isset($_SESSION['looted_bosses'][$boss_id]) && $_SESSION['looted_bosses'][$boss_id] == $death_time) {
        throw new Exception("Đã nhặt đồ rồi, không được tham lam!");
    }
    
    // Đánh dấu là đã nhặt
    $_SESSION['looted_bosses'][$boss_id] = $death_time;

    $lvl = intval($bossData['level']);
    // ... TỪ ĐOẠN NÀY TRỞ XUỐNG SẾP GIỮ NGUYÊN CODE RỚT VÀNG & RỚT ĐỒ NHƯ CŨ ...
    // ==========================================
    // 2. 💰 XỬ LÝ RỚT VÀNG (100% RỚT VÀNG CHO MỌI CON BOSS)
    $gold = 0;
    if ($lvl < 10) { $gold = rand(3, 8); }                 
    elseif ($lvl < 20) { $gold = rand(8, 14); }            
    elseif ($lvl < 30) { $gold = rand(14, 20); }           
    elseif ($lvl < 40) { $gold = rand(20, 26); }
    elseif ($lvl < 50) { $gold = rand(26, 32); }
    elseif ($lvl < 60) { $gold = rand(32, 38); }
    elseif ($lvl < 70) { $gold = rand(38, 46); }
    elseif ($lvl < 80) { $gold = rand(46, 54); }
    elseif ($lvl < 90) { $gold = rand(54, 60); }
    else { $gold = rand(58, 65); }                         

    if ($gold > 0) {
        $conn->query("UPDATE game_characters SET game_gold = game_gold + $gold WHERE username = '$user'");
    }

    $item_dropped_name = null;
    $item_dropped_type = null;
    $item_dropped_model = null;

    if (rand(1, 100) <= 15) {
        $res = $conn->query("SELECT id, name, item_type, price, required_class, model_url FROM shop_items WHERE price < 50000 ORDER BY RAND() LIMIT 1");
        
        if ($item = $res->fetch_assoc()) {
            $insert = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped, bonus_damage, bonus_hp, bonus_speed) VALUES (?, ?, ?, 0, 0, 0, 0)");
            $insert->bind_param("sis", $user, $item['id'], $item['item_type']);
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
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
<?php
// FILE: api/loot_monster.php (CHỈNH SỬA: CHIA VÀNG & EXP CHO PT, LAST HIT ĂN ĐỒ)
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || !isset($_POST['monster_id'])) exit;

$user = $_SESSION['user'];
$boss_id = intval($_POST['monster_id']); 

$conn->begin_transaction();
try {
    $stmtBoss = $conn->prepare("SELECT level, name, hp, death_time FROM map_monsters WHERE id = ? FOR UPDATE");
    $stmtBoss->bind_param("i", $boss_id);
    $stmtBoss->execute();
    $bossData = $stmtBoss->get_result()->fetch_assoc();
    
    if (!$bossData) throw new Exception("Boss không tồn tại!");
    if (intval($bossData['hp']) > 0) throw new Exception("Boss chưa chết!");

    $death_time = intval($bossData['death_time']);
    if (isset($_SESSION['looted_bosses'][$boss_id]) && $_SESSION['looted_bosses'][$boss_id] == $death_time) {
        throw new Exception("Đã nhặt đồ rồi!");
    }
    $_SESSION['looted_bosses'][$boss_id] = $death_time;

    $lvl = intval($bossData['level']);
    
    // TÍNH TỔNG VÀNG & EXP RỚT RA TỪ BOSS NÀY
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
    
    $exp = $lvl * 20;

    // KIỂM TRA TỔ ĐỘI ĐỂ CHIA ĐỀU VÀNG & EXP
    $stmtInfo = $conn->prepare("SELECT party_id, zone_id FROM game_characters WHERE username = ?");
    $stmtInfo->bind_param("s", $user);
    $stmtInfo->execute();
    $uData = $stmtInfo->get_result()->fetch_assoc();
    
    $pid = intval($uData['party_id']);
    $zone = $uData['zone_id'];
    
    $is_party = false;
    $gold_chia = $gold;
    $exp_chia = $exp;

    if ($gold > 0 || $exp > 0) {
        if ($pid > 0) {
            $qCount = $conn->query("SELECT COUNT(*) as cnt FROM game_characters WHERE party_id=$pid AND zone_id='$zone'");
            $soNguoi = intval($qCount->fetch_assoc()['cnt']);
            if ($soNguoi < 1) $soNguoi = 1;

            $gold_chia = floor($gold / $soNguoi);
            $exp_chia = floor($exp / $soNguoi);
            $is_party = true;

            // Bơm Vàng vào DB cho cả đội (EXP sẽ do Client tự gọi hàm để nhảy hiệu ứng)
            $conn->query("UPDATE game_characters SET game_gold = game_gold + $gold_chia WHERE party_id=$pid AND zone_id='$zone'");
        } else {
            $conn->query("UPDATE game_characters SET game_gold = game_gold + $gold_chia WHERE username = '$user'");
        }
    }

    // XỬ LÝ RỚT VẬT PHẨM (CHỈ KẺ KẾT LIỄU MỚI ĐƯỢC THÊM VÀO TÚI ĐỒ)
    $item_dropped_name = null; $item_dropped_type = null; $item_dropped_model = null;

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
        'gold_chia' => $gold_chia, 
        'exp_chia' => $exp_chia,
        'boss_level' => $lvl,
        'is_party' => $is_party,
        'item_name' => $item_dropped_name, 
        'item_type' => $item_dropped_type,
        'item_model' => $item_dropped_model
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
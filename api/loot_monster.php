<?php
// FILE: api/loot_monster.php (BẢN V22 - SIÊU HARDCORE 17 VẠN/NGÀY)
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
    // 2. 💰 XỬ LÝ RỚT VÀNG (CÓ CON RỚT, CÓ CON KHÔNG)
    // Tỷ lệ rớt vàng: 50%
    // Đỉnh cao cày cuốc: 1 ngày cắm AFK max cấp chỉ được 17 Vạn Vàng!
    // ==========================================
    $gold = 0;
    if (rand(1, 100) <= 50) { 
        if ($lvl < 10) { $gold = rand(5, 10); }               // Tân thủ: ~7 xu
        elseif ($lvl < 20) { $gold = rand(10, 20); }          // Cấp 10-19: ~15 xu
        elseif ($lvl < 30) { $gold = rand(20, 30); }
        elseif ($lvl < 40) { $gold = rand(30, 40); }
        elseif ($lvl < 50) { $gold = rand(40, 50); }
        elseif ($lvl < 60) { $gold = rand(50, 70); }
        elseif ($lvl < 70) { $gold = rand(70, 90); }
        elseif ($lvl < 80) { $gold = rand(90, 110); }
        elseif ($lvl < 90) { $gold = rand(110, 130); }
        else { $gold = rand(130, 160); }                      // Cấp 90-100: ~145 xu
    }

    // Nếu có rớt Vàng thì mới cộng vào túi
    if ($gold > 0) {
        $conn->query("UPDATE game_characters SET game_gold = game_gold + $gold WHERE username = '$user'");
    }

    $item_dropped_name = null;
    $item_dropped_type = null;
    $item_dropped_model = null;

    // ==========================================
    // 3. 🎁 VÒNG QUAY NHÂN PHẨM TRANG BỊ
    // Tỷ lệ rớt đồ cũng hạ xuống mức chua xót (Chỉ 15%)
    // ==========================================
    if (rand(1, 100) <= 15) {
        $res = $conn->query("SELECT id, name, item_type, price, required_class, model_url FROM shop_items WHERE price < 50000 ORDER BY RAND() LIMIT 1");
        
        if ($item = $res->fetch_assoc()) {
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
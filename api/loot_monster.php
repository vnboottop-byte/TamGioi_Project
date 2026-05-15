<?php
// FILE: api/loot_monster.php (BẢN V9.1 - GỬI LINK 3D CHO CLIENT)
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || !isset($_POST['monster_level'])) exit;

$user = $_SESSION['user'];
$lvl = intval($_POST['monster_level']);

$conn->begin_transaction();
try {
    $gold = rand(100, 500) * $lvl;
    $conn->query("UPDATE game_characters SET game_gold = game_gold + $gold WHERE username = '$user'");

    $item_dropped_name = null;
    $item_dropped_type = null;
    $item_dropped_model = null; // 🌟 Thêm biến chứa Model 3D

    // 🌟 Rút thêm cột model_url từ CSDL
    $res = $conn->query("SELECT id, name, item_type, price, required_class, model_url FROM shop_items ORDER BY RAND() LIMIT 3");
    
    $buff_level = 1.0 + ($lvl * 0.02);

    while ($item = $res->fetch_assoc()) {
        $price = intval($item['price']);
        $base_rate = 0;

        if ($price >= 1000000) { $base_rate = 0.0001; }
        elseif ($price >= 500000) { $base_rate = 0.01; }
        elseif ($price >= 200000) { $base_rate = 0.1; }
        elseif ($price >= 100000) { $base_rate = 0.5; }
        elseif ($price >= 10000) { $base_rate = 2.0; }
        else { $base_rate = 5.0; }

        $final_rate = $base_rate * $buff_level;
        $randomNumber = rand(1, 1000000) / 10000; 

        if ($randomNumber <= $final_rate) {
            $item_id = $item['id'];
            $item_type = $item['item_type'];
            
            $insert = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped) VALUES (?, ?, ?, 0)");
            $insert->bind_param("sis", $user, $item_id, $item_type);
            $insert->execute();

            $item_dropped_name = $item['name'];
            $item_dropped_type = $item['item_type'];
            $item_dropped_model = $item['model_url']; // 🌟 Gắn Link 3D
            break; 
        }
    }

    $conn->commit();
    echo json_encode([
        'status' => 'success', 
        'gold' => $gold, 
        'item_name' => $item_dropped_name, 
        'item_type' => $item_dropped_type,
        'item_model' => $item_dropped_model // 🌟 Đóng gói ném về Frontend
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error']);
}
?>
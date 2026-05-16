<?php
// FILE: api/craft_stone.php (LÒ ĐÚC TINH THẠCH TỰ ĐỘNG)
session_start(); header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) { echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập!']); exit; }

$user = $_SESSION['user'];
$stones_json = isset($_POST['stones']) ? $_POST['stones'] : '[]';
$stone_ids = json_decode($stones_json, true);

if (count($stone_ids) !== 3) {
    echo json_encode(['status' => 'error', 'msg' => 'Trận pháp yêu cầu chính xác 3 viên Tinh Thạch!']); exit;
}

$conn->begin_transaction();
try {
    // 1. Kiểm tra Vàng
    $stmtUser = $conn->prepare("SELECT game_gold FROM game_characters WHERE username = ? FOR UPDATE");
    $stmtUser->bind_param("s", $user); $stmtUser->execute();
    $userData = $stmtUser->get_result()->fetch_assoc();
    if (!$userData) throw new Exception("Không tìm thấy dữ liệu nhân vật!");
    $current_gold = intval($userData['game_gold']);

    // 2. Kéo 3 viên đá ra kiểm tra (Chống hack truyền ID bậy bạ)
    $placeholders = implode(',', array_fill(0, 3, '?'));
    $types = str_repeat('i', 3) . 's'; 
    $sqlStones = "SELECT inv.id, shop.name, shop.model_url FROM user_inventory inv JOIN shop_items shop ON inv.item_id = shop.id WHERE inv.id IN ($placeholders) AND inv.username = ? AND inv.item_type = 'material' AND inv.is_equipped = 0 FOR UPDATE";
    $stmtStones = $conn->prepare($sqlStones);
    $params = $stone_ids; $params[] = $user;
    $stmtStones->bind_param($types, ...$params);
    $stmtStones->execute();
    $resStones = $stmtStones->get_result();

    $valid_stones = [];
    while ($row = $resStones->fetch_assoc()) { $valid_stones[] = $row; }
    
    if (count($valid_stones) !== 3) throw new Exception("Đá không hợp lệ, không thuộc về Sếp hoặc đang được sử dụng!");

    // 3. Phân tích Cấp Đá & Đảm bảo 3 viên cùng cấp
    preg_match('/\d+/', $valid_stones[0]['name'], $m1); $cap1 = !empty($m1) ? intval($m1[0]) : 1;
    preg_match('/\d+/', $valid_stones[1]['name'], $m2); $cap2 = !empty($m2) ? intval($m2[0]) : 1;
    preg_match('/\d+/', $valid_stones[2]['name'], $m3); $cap3 = !empty($m3) ? intval($m3[0]) : 1;

    if ($cap1 !== $cap2 || $cap2 !== $cap3) throw new Exception("Tẩu hỏa nhập ma! 3 viên Tinh thạch phải có cấp độ y hệt nhau!");

    // 4. Trừ tiền (Cấp mục tiêu x 3 Vàng)
    $new_level = $cap1 + 1;
    $cost = $new_level * 3;
    
    $new_gold = $current_gold - $cost;
    $conn->query("UPDATE game_characters SET game_gold = $new_gold WHERE username = '$user'");

    // 5. Đốt 3 viên cũ
    $ids_to_delete = implode(',', array_column($valid_stones, 'id'));
    $conn->query("DELETE FROM user_inventory WHERE id IN ($ids_to_delete)");

    // 6. 🌟 TRÍ TUỆ NHÂN TẠO: TÌM HOẶC TỰ ĐỘNG TẠO ĐÁ MỚI TRONG SHOP
    $new_level = $cap1 + 1;
    $new_name = "Tinh Thạch Cấp " . $new_level;
    $model_url = $valid_stones[0]['model_url']; // Dùng lại model 3D cũ

    $stmtFind = $conn->prepare("SELECT id FROM shop_items WHERE name = ? AND item_type = 'material'");
    $stmtFind->bind_param("s", $new_name); $stmtFind->execute();
    $resFind = $stmtFind->get_result();

    $new_item_id = 0;
    if ($resFind->num_rows > 0) {
        $new_item_id = $resFind->fetch_assoc()['id']; // Đã có trong Shop (VD: Cấp 2, Cấp 3)
    } else {
        // Chưa có -> Khai sinh mã hàng hóa mới toanh vào Cửa hàng!
        $new_price = 1000 * pow(3, $new_level - 1); // Định giá chuẩn cho viên mới
        $stmtCreate = $conn->prepare("INSERT INTO shop_items (name, item_type, price, model_url, category, required_class) VALUES (?, 'material', ?, ?, 'NGUYENLIEU', 'ALL')");
        $stmtCreate->bind_param("sis", $new_name, $new_price, $model_url);
        $stmtCreate->execute();
        $new_item_id = $stmtCreate->insert_id;
    }

    // 7. Nhét viên đá cấp cao vừa đúc vào túi người chơi
    $stmtGive = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped) VALUES (?, ?, 'material', 0)");
    $stmtGive->bind_param("si", $user, $new_item_id);
    $stmtGive->execute();

    $conn->commit();
    echo json_encode(['status' => 'success', 'new_level' => $new_level, 'new_gold' => $new_gold]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
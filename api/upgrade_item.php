<?php
// FILE: api/upgrade_item.php (TÒA ÁN TỐI CAO - CHỐNG HACK ĐẬP ĐỒ)
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập!']);
    exit;
}

$user = $_SESSION['user'];
$item_id = isset($_POST['item_id']) ? intval($_POST['item_id']) : 0;
$stones_json = isset($_POST['stones']) ? $_POST['stones'] : '[]';
$stone_ids = json_decode($stones_json, true);

if ($item_id <= 0) {
    echo json_encode(['status' => 'error', 'msg' => 'Vật phẩm không hợp lệ!']);
    exit;
}

$conn->begin_transaction();
try {
    // 1. Khóa Ví Tiền & Kiểm tra Vàng
    $stmtUser = $conn->prepare("SELECT game_gold FROM game_characters WHERE username = ? FOR UPDATE");
    $stmtUser->bind_param("s", $user);
    $stmtUser->execute();
    $userData = $stmtUser->get_result()->fetch_assoc();
    if (!$userData) throw new Exception("Không tìm thấy dữ liệu nhân vật!");
    $current_gold = intval($userData['game_gold']);

    // 2. Khóa Vũ Khí & Kiểm tra điều kiện
    $stmtItem = $conn->prepare("SELECT inv.id, inv.upgrade_level, shop.price, shop.item_type FROM user_inventory inv JOIN shop_items shop ON inv.item_id = shop.id WHERE inv.id = ? AND inv.username = ? AND inv.is_equipped = 0 FOR UPDATE");
    $stmtItem->bind_param("is", $item_id, $user);
    $stmtItem->execute();
    $mainItem = $stmtItem->get_result()->fetch_assoc();
    
    if (!$mainItem) throw new Exception("Vật phẩm không tồn tại hoặc Sếp đang mặc trên người (Phải tháo ra mới đập được)!");
    if (!in_array($mainItem['item_type'], ['weapon', 'weapon2', 'mount', 'model'])) throw new Exception("Loại vật phẩm này không thể đập!");

    $current_lvl = intval($mainItem['upgrade_level']);
    if ($current_lvl >= 15) throw new Exception("Pháp bảo đã đạt Chí Tôn +15!");

    // 3. Tính toán tiền Vàng (Thuế Lò Rèn)
    $price_goc = intval($mainItem['price']);
    $cost = floor($price_goc * ($current_lvl + 1) * 0.1);
    if ($cost < 1000) $cost = 1000;

    if ($current_gold < $cost) throw new Exception("Sếp không đủ Linh Thạch! Yêu cầu " . number_format($cost) . " Vàng.");






    // 4. Khóa Tinh Thạch & Tính điểm chuẩn
    $total_stone_score = 0;
    $valid_stone_ids = []; 
    
    if (!empty($stone_ids) && is_array($stone_ids)) {
        $stone_ids = array_slice($stone_ids, 0, 6);
        $placeholders = implode(',', array_fill(0, count($stone_ids), '?'));
        $types = str_repeat('i', count($stone_ids)) . 's'; 
        
        $sqlStones = "SELECT inv.id, shop.name FROM user_inventory inv JOIN shop_items shop ON inv.item_id = shop.id WHERE inv.id IN ($placeholders) AND inv.username = ? AND inv.item_type = 'material' AND inv.is_equipped = 0 FOR UPDATE";
        $stmtStones = $conn->prepare($sqlStones);
        
        $params = $stone_ids;
        $params[] = $user;
        $stmtStones->bind_param($types, ...$params);
        $stmtStones->execute();
        $resStones = $stmtStones->get_result();
        
        while ($stone = $resStones->fetch_assoc()) {
            $valid_stone_ids[] = $stone['id'];
            preg_match('/\d+/', $stone['name'], $matches);
            $capDa = !empty($matches) ? intval($matches[0]) : 1;
            
            // 🌟 ĐIỂM CHUẨN KIẾM THẾ (Hệ số 10/3)
            $diem = pow(10/3, $capDa - 1) * 100;
            $total_stone_score += $diem;
        }
    }

    // 5. Tái lập Tỷ Lệ Thực Tế
    $target_lvl = $current_lvl + 1;
    $diemYeuCau = pow(10/3, $target_lvl - 1) * 100;

    $phanTramThucTe = ($total_stone_score / $diemYeuCau) * 100;
    
    // 6. Tính Phí Luyện Hóa: Dựa theo tổng điểm đá bỏ vào x (Giá Gốc / 100)
    $price_goc = intval($mainItem['price']);
    if ($price_goc <= 0) $price_goc = 10000;
    


    // 6. Tính Phí Luyện Hóa KIẾM THẾ: 1 Điểm Đá = 1 Vàng
    $cost = floor($total_stone_score);
    if ($cost < 1 && $total_stone_score > 0) $cost = 1;
    if ($total_stone_score == 0) $cost = 0;

    if ($current_gold < $cost) throw new Exception("Sếp không đủ Linh Thạch! Yêu cầu " . number_format($cost) . " Vàng.");

    // 7. MÁY QUAY XỔ SỐ CHỐNG HACK
    $rand_val = rand(1, 10000) / 100; 
    $is_success = ($rand_val <= $phanTramThucTe);




    $new_lvl = $current_lvl;
    $drop_level = false;

    // 🌟 BIẾN LƯU TRỮ CHỈ SỐ GIÁM ĐỊNH MỚI
    $new_bonus_dmg = null; $new_bonus_hp = null; $new_bonus_spd = null;
    $is_giam_dinh = false; $diem_giam_dinh = 0; // Thêm Biến soi nhân phẩm

    if ($is_success) {
        $new_lvl = $current_lvl + 1; 

        // 🌟 LÕI GIÁM ĐỊNH NGẪU NHIÊN: CHỈ KÍCH HOẠT KHI TỪ +0 LÊN +1
        if ($current_lvl == 0) {
            $tongDiemTiemNang = rand(80, 120); // 120 là Cực phẩm
            $is_giam_dinh = true;
            $diem_giam_dinh = $tongDiemTiemNang;
     
     
     
     
            $r1 = rand(1, 99); $r2 = rand(1, 99);
            $minR = min($r1, $r2); $maxR = max($r1, $r2);

            $phanDmg = $minR / 100;
            $phanHp = ($maxR - $minR) / 100;
            $phanSpd = (100 - $maxR) / 100;

            $new_bonus_dmg = floor($tongDiemTiemNang * $phanDmg * 2);
            $new_bonus_hp = floor($tongDiemTiemNang * $phanHp * 20);
            $new_bonus_spd = floor($tongDiemTiemNang * $phanSpd * 0.2);
        }
    } else {
        // Rớt cấp Hardcore
        if ($current_lvl >= 6 && $current_lvl <= 9) { $new_lvl = $current_lvl - 1; $drop_level = true; } 
        else if ($current_lvl >= 11 && $current_lvl <= 14) { $new_lvl = 10; $drop_level = true; }
    }

    // 8. THỰC THI THAY ĐỔI XUỐNG DATABASE
    $new_gold = $current_gold - $cost;
    $conn->query("UPDATE game_characters SET game_gold = $new_gold WHERE username = '$user'");

    if (count($valid_stone_ids) > 0) {
        $ids_to_delete = implode(',', $valid_stone_ids);
        $conn->query("DELETE FROM user_inventory WHERE id IN ($ids_to_delete)");
    }

    if ($new_lvl !== $current_lvl) {
        // 🌟 NẾU CÓ GIÁM ĐỊNH THÌ LẤY CHỈ SỐ GỐC (VIP) "+" CỘNG THÊM VỚI CHỈ SỐ NGẪU NHIÊN!
        if ($new_bonus_dmg !== null) {
            $conn->query("UPDATE user_inventory SET 
                          upgrade_level = $new_lvl, 
                          bonus_damage = bonus_damage + $new_bonus_dmg, 
                          bonus_hp = bonus_hp + $new_bonus_hp, 
                          bonus_speed = bonus_speed + $new_bonus_spd 
                          WHERE id = $item_id");
        } else {
            $conn->query("UPDATE user_inventory SET upgrade_level = $new_lvl WHERE id = $item_id");
        }
    }












    $conn->commit();
    echo json_encode([
        'status' => 'success',
        'result' => $is_success ? 'SUCCESS' : 'FAIL',
        'old_level' => $current_lvl,
        'new_level' => $new_lvl,
        'drop_level' => $drop_level,
        'new_gold' => $new_gold,
        'is_giam_dinh' => $is_giam_dinh,
        'diem_giam_dinh' => $diem_giam_dinh
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>





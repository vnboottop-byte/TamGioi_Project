<?php
// FILE: api/toggle_equip.php (BẢN VÁ CẬP NHẬT LỰC CHIẾN)
session_start(); header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) exit;
$username = $_SESSION['user'];
$data = json_decode(file_get_contents('php://input'), true);
$inv_id = intval($data['inv_id']);
$action = $data['action']; // 'equip' hoặc 'unequip'

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("SELECT inv.item_type, shop.model_url, shop.required_class FROM user_inventory inv JOIN shop_items shop ON inv.item_id = shop.id WHERE inv.id = ? AND inv.username = ?");
    $stmt->bind_param("is", $inv_id, $username);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    if (!$item) throw new Exception("Không tìm thấy đồ!");

    $type = $item['item_type'];
    $url = $item['model_url'];

    $col = "";
    if ($type === 'weapon') $col = "current_weapon_url";
    elseif ($type === 'weapon2') $col = "current_weapon2_url";
    elseif ($type === 'mount') $col = "current_mount_url";
    elseif ($type === 'model') $col = "current_model_url";


    if ($action === 'equip') {
        $conn->query("UPDATE user_inventory SET is_equipped = 0 WHERE username = '$username' AND item_type = '$type'");
        $conn->query("UPDATE user_inventory SET is_equipped = 1 WHERE id = $inv_id");
        if ($col) $conn->query("UPDATE game_characters SET $col = '$url' WHERE username = '$username'");

        // 🌟 KIẾM HIỆP ĐOẠT XÁ KÉP KHI MẶC ĐỒ
        if ($type === 'model') {
            if ($item['required_class'] === 'ALL') {
                $tenFileGoc = basename($url); 
                $tenKhongDuoi = pathinfo($tenFileGoc, PATHINFO_FILENAME);
                $mangTen = explode('_', $tenKhongDuoi);
                $tenNhanVat = end($mangTen);
                $js_doc_quyen = "js/" . strtolower($tenNhanVat) . ".js";
                $conn->query("UPDATE game_characters SET custom_script = '$js_doc_quyen' WHERE username = '$username'");
            } else {
                // Đoạt xá chéo hệ phái
                // Đoạt xá Chéo Phái: Load JS chuẩn theo mã Hệ Phái từ DB
                $map_js = [
                    'TU_TIEN' => 'js/phai_tutien.js',
                    'LUYEN_THE' => 'js/phai_luyenthe.js',
                    'CUNG_TEN' => 'js/phai_cungthu.js',
                    'PHAP_SU' => 'js/phai_phapsu.js',
                    'SIEUANHHUNG' => 'js/phai_lazer.js',
                    'SUNG_DAN' => 'js/phai_bansung.js'
                ];
                $js_doc_quyen = isset($map_js[$item['required_class']]) ? $map_js[$item['required_class']] : null;
                if ($js_doc_quyen) {
                    $conn->query("UPDATE game_characters SET custom_script = '$js_doc_quyen' WHERE username = '$username'");
                }
            }
        }
        } else {
        $conn->query("UPDATE user_inventory SET is_equipped = 0 WHERE id = $inv_id");
        if ($col) $conn->query("UPDATE game_characters SET $col = '' WHERE username = '$username'");

        // BẢN VÁ: Nếu lột Ngoại trang (Skin) ra thì phải xóa sạch võ công Đoạt xá, trở về bản ngã!
        if ($type === 'model') {
            $conn->query("UPDATE game_characters SET custom_script = NULL WHERE username = '$username'");
        }
    }


    // ==========================================
    // 🌟 BẢN VÁ AAA: TÍNH LẠI MÁU, DAME, TỐC ĐÁNH, TỐC CHẠY CHUẨN KIẾM THẾ
    // ==========================================
    // Cần Select thêm item_type và bonus_speed
    $stmt_wp = $conn->prepare("SELECT s.item_type, s.bonus_hp, s.bonus_damage, s.bonus_speed, i.upgrade_level FROM user_inventory i JOIN shop_items s ON i.item_id = s.id WHERE i.username = ? AND i.is_equipped = 1");
    $stmt_wp->bind_param("s", $username); $stmt_wp->execute();
    $res_wp = $stmt_wp->get_result();
    
    $buff_hp = 0; $buff_dmg = 0; $buff_spd = 0; $buff_cdr = 0;
    $heSoKiemThe = [1.0, 1.05, 1.12, 1.22, 1.35, 1.50, 1.70, 1.95, 2.25, 2.60, 3.10, 3.70, 4.50, 5.50, 6.80, 8.50];
    
    while($wp = $res_wp->fetch_assoc()) {
        $lvl_wp = (int)$wp['upgrade_level'];
        $heSoCong = isset($heSoKiemThe[$lvl_wp]) ? $heSoKiemThe[$lvl_wp] : 1.0;
        
        $buff_hp += (int)$wp['bonus_hp'] * $heSoCong;
        $buff_dmg += (int)$wp['bonus_damage'] * $heSoCong;
        
        // Tính Tốc độ (Tách riêng Vũ Khí = Hồi chiêu | Thú cưỡi = Chạy)
        $tocDo = (float)$wp['bonus_speed'] * $heSoCong;
        if ($wp['item_type'] === 'mount') {
            $buff_spd += $tocDo;
        } else if ($wp['item_type'] === 'weapon' || $wp['item_type'] === 'weapon2') {
            $buff_cdr += $tocDo;
        }
    }

    $stmt_user = $conn->prepare("SELECT level FROM game_characters WHERE username = ?");
    $stmt_user->bind_param("s", $username); $stmt_user->execute();
    $uData = $stmt_user->get_result()->fetch_assoc();
    $lvl = (int)$uData['level'];

    // Ráp tổng lực
    $hp_max_moi = 1000 + (($lvl - 1) * 30) + $buff_hp;
    $damage_moi = 100 + (($lvl - 1) * 3) + $buff_dmg;
    
    // Ráp Tốc độ (Chuẩn 1 Điểm = 1%)
    $speed_moi = 1.0 + ($buff_spd * 0.01);
    $cdr_moi = $buff_cdr * 0.01;
    if ($cdr_moi > 0.4) $cdr_moi = 0.4; // Khóa trần 40% giảm hồi chiêu

    $conn->query("UPDATE game_characters SET hp_max = $hp_max_moi, damage = $damage_moi WHERE username = '$username'");

    $conn->commit();
    
    // Gói toàn bộ 4 chỉ số trả về cho game
    echo json_encode(['status' => 'success', 'new_damage' => $damage_moi, 'new_hp' => $hp_max_moi, 'new_speed' => $speed_moi, 'new_cdr' => $cdr_moi]);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error']);
}
?>
     


    
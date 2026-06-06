<?php
// File: api/mua_hang.php
session_start();
header('Content-Type: application/json');
require_once '../db.php'; 

// 1. KIỂM TRA ĐĂNG NHẬP (Sếp dùng $_SESSION['user'] theo chuẩn cũ của Sếp)
if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Đạo hữu vui lòng Nhập Thánh (Đăng nhập) trước!']);
    exit;
}

$username = $_SESSION['user'];
$item_id = isset($_POST['item_id']) ? intval($_POST['item_id']) : 0;

if ($item_id <= 0) {
    echo json_encode(['status' => 'error', 'msg' => 'Mã vật phẩm không hợp lệ!']);
    exit;
}

// 🌟 BẮT ĐẦU TRANSACTION BỌC THÉP
$conn->begin_transaction();

try {

    // 3. SOI GIÁ TIỀN TỪ CỬA HÀNG
    $stmt_item = $conn->prepare("SELECT * FROM shop_items WHERE id = ?");
    $stmt_item->bind_param("i", $item_id);
    $stmt_item->execute();
    $item = $stmt_item->get_result()->fetch_assoc();

    if (!$item) {
        throw new Exception('Vật phẩm này không tồn tại trong Tam Giới!');
    }

    // =========================================================
    // 🌟 CHỐT CHẶN BẢO MẬT: KIỂM TRA MÔN PHÁI TRƯỚC KHI MUA
    // =========================================================
    $stmt_phai = $conn->prepare("SELECT c.faction_code FROM game_characters gc JOIN game_classes c ON gc.class_id = c.id WHERE gc.username = ?");
    $stmt_phai->bind_param("s", $username);
    $stmt_phai->execute();
    $res_phai = $stmt_phai->get_result()->fetch_assoc();
    $phai_cua_toi = $res_phai ? $res_phai['faction_code'] : '';

    

    // 4. KIỂM TRA SỐ DƯ BALANCE BẢNG USERS (Khóa dòng này lại để chống hack auto-click)
    $stmt_user = $conn->prepare("SELECT balance FROM users WHERE username = ? FOR UPDATE");
    $stmt_user->bind_param("s", $username);
    $stmt_user->execute();
    $user = $stmt_user->get_result()->fetch_assoc();

    if (!$user) {
        throw new Exception('Lỗi: Không tìm thấy tài khoản của Sếp!');
    }

    if (intval($user['balance']) < intval($item['price'])) {
        throw new Exception('Không đủ Balance! Cần ' . number_format($item['price']) . ' VNĐ.');
    }

    // 5. TRỪ TIỀN VÀO CỘT BALANCE
    $new_balance = intval($user['balance']) - intval($item['price']);
    $stmt_update_tien = $conn->prepare("UPDATE users SET balance = ? WHERE username = ?");
    $stmt_update_tien->bind_param("is", $new_balance, $username);
    $stmt_update_tien->execute();

    // 6. NHÉT ĐỒ VÀO TÚI (KÈM THEO CHỈ SỐ GỐC VIP CỦA MÓN ĐỒ TỪ SHOP)
    $stmt_add_ruong = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped, bonus_damage, bonus_hp, bonus_speed) VALUES (?, ?, ?, 0, ?, ?, ?)");
    $stmt_add_ruong->bind_param("sisiii", $username, $item_id, $item['item_type'], $item['bonus_damage'], $item['bonus_hp'], $item['bonus_speed']);
    $stmt_add_ruong->execute();

    // 🌟 7. AUTO-EQUIP (MÌ ĂN LIỀN): CẬP NHẬT THẲNG VÀO NHÂN VẬT VÀ TÚI ĐỒ
    $column = "";
    if ($item['item_type'] === 'weapon') $column = "current_weapon_url";
    elseif ($item['item_type'] === 'mount') $column = "current_mount_url";
    elseif ($item['item_type'] === 'weapon2') $column = "current_weapon2_url"; // 🎯 Đã nhận diện vũ khí phụ!
    elseif ($item['item_type'] === 'model') $column = "current_model_url";

   if ($column != "") {
        // A. Cập nhật Model vào nhân vật
        $stmt_eq = $conn->prepare("UPDATE game_characters SET $column = ? WHERE username = ?");
        $stmt_eq->bind_param("ss", $item['model_url'], $username);
        $stmt_eq->execute();

        // B. Phải lột đồ CÙNG LOẠI cũ trong túi ra trước
        $stmt_off = $conn->prepare("UPDATE user_inventory SET is_equipped = 0 WHERE username = ? AND item_type = ?");
        $stmt_off->bind_param("ss", $username, $item['item_type']);
        $stmt_off->execute();

        // C. Mặc món đồ VỪA MUA vào người
        $new_inv_id = $stmt_add_ruong->insert_id;
        $stmt_on = $conn->prepare("UPDATE user_inventory SET is_equipped = 1 WHERE id = ?");
        $stmt_on->bind_param("i", $new_inv_id);
        $stmt_on->execute();

        // 🌟 BẢN VÁ 1: NẾU LÀ SKIN ĐOẠT XÁ (ALL) THÌ ÉP CUSTOM_SCRIPT VÀO NGƯỜI
        if ($item['item_type'] === 'model' && $item['required_class'] === 'ALL') {
            $tenFileGoc = basename($item['model_url']); 
            $tenKhongDuoi = pathinfo($tenFileGoc, PATHINFO_FILENAME);
            $mangTen = explode('_', $tenKhongDuoi);
            $tenNhanVat = end($mangTen);
            $js_doc_quyen = "js/" . strtolower($tenNhanVat) . ".js";
            $conn->query("UPDATE game_characters SET custom_script = '$js_doc_quyen' WHERE username = '$username'");
        } else if ($item['item_type'] === 'model' && $item['required_class'] !== 'ALL') {
            $conn->query("UPDATE game_characters SET custom_script = NULL WHERE username = '$username'");
        }

        // 🌟 BẢN VÁ 2: CẬP NHẬT LẠI MÁU VÀ DAME NGAY TỨC KHẮC
        $stmt_wp = $conn->prepare("SELECT s.bonus_hp, s.bonus_damage, i.upgrade_level FROM user_inventory i JOIN shop_items s ON i.item_id = s.id WHERE i.username = ? AND i.is_equipped = 1");
        $stmt_wp->bind_param("s", $username); $stmt_wp->execute();
        $res_wp = $stmt_wp->get_result();
        
        $buff_hp = 0; $buff_dmg = 0;
        $heSoKiemThe = [1.0, 1.05, 1.12, 1.22, 1.35, 1.50, 1.70, 1.95, 2.25, 2.60, 3.10, 3.70, 4.50, 5.50, 6.80, 8.50];
        
        while($wp = $res_wp->fetch_assoc()) {
            $lvl_wp = (int)$wp['upgrade_level'];
            $heSoCong = isset($heSoKiemThe[$lvl_wp]) ? $heSoKiemThe[$lvl_wp] : 1.0;
            $buff_hp += (int)$wp['bonus_hp'] * $heSoCong;
            $buff_dmg += (int)$wp['bonus_damage'] * $heSoCong;
        }

        $stmt_user = $conn->prepare("SELECT level FROM game_characters WHERE username = ?");
        $stmt_user->bind_param("s", $username); $stmt_user->execute();
        $uData = $stmt_user->get_result()->fetch_assoc();
        $lvl = (int)$uData['level'];

        $hp_max_moi = 1000 + (($lvl - 1) * 30) + $buff_hp;
        $damage_moi = 100 + (($lvl - 1) * 3) + $buff_dmg;

        $conn->query("UPDATE game_characters SET hp_max = $hp_max_moi, damage = $damage_moi WHERE username = '$username'");
    }

    // 🌟 CHỐT GIAO DỊCH THÀNH CÔNG VÀ NÉM INFO VỀ CHO CLIENT
    $conn->commit();
    echo json_encode([
        'status' => 'success', 
        'msg' => '🎉 Mua thành công ' . $item['name'] . '!', 
        'tien_con_lai' => $new_balance,
        'item_type' => $item['item_type'],
        'model_url' => $item['model_url'],
        'new_damage' => isset($damage_moi) ? $damage_moi : null,
        'new_hp' => isset($hp_max_moi) ? $hp_max_moi : null
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
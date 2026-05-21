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

    // Nếu món đồ KHÔNG PHẢI dành cho mọi người, VÀ CŨNG KHÔNG PHẢI của phái mình -> Đuổi!
    if ($item['required_class'] !== 'ALL' && $item['required_class'] !== $phai_cua_toi) {
        throw new Exception('Pháp bảo này không dành cho hệ phái của bạn. Cưỡng ép luyện hóa sẽ tẩu hỏa nhập ma!');
    }
    // =========================================================

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

        // C. Mặc món đồ VỪA MUA vào người (cập nhật ID túi đồ vừa sinh ra ở Bước 6)
        $new_inv_id = $stmt_add_ruong->insert_id;
        $stmt_on = $conn->prepare("UPDATE user_inventory SET is_equipped = 1 WHERE id = ?");
        $stmt_on->bind_param("i", $new_inv_id);
        $stmt_on->execute();
    }

    // 🌟 CHỐT GIAO DỊCH THÀNH CÔNG
    $conn->commit();
    echo json_encode([
        'status' => 'success', 
        'msg' => '🎉 Mua thành công ' . $item['name'] . '!', 
        'tien_con_lai' => $new_balance
    ]);

} catch (Exception $e) {
    // NẾU CÓ BẤT KỲ LỖI GÌ HOẶC THIẾU TIỀN -> HỦY BỎ MỌI THAO TÁC SQL (Rollback)
    $conn->rollback();
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
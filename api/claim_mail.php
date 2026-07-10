<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || !isset($_POST['mail_id'])) { echo json_encode(['status' => 'error']); exit; }
$username = $_SESSION['user'];
$mail_id = (int)$_POST['mail_id'];

$stmt = $conn->prepare("SELECT * FROM user_mailbox WHERE id = ? AND username = ? AND is_claimed = 0");
$stmt->bind_param("is", $mail_id, $username);
$stmt->execute();
$mail = $stmt->get_result()->fetch_assoc();

if (!$mail) { echo json_encode(['status' => 'error', 'msg' => 'Thư không tồn tại hoặc đã bị xóa!']); exit; }

$conn->begin_transaction();
try {
    $stmt_del = $conn->prepare("DELETE FROM user_mailbox WHERE id = ?");
    $stmt_del->bind_param("i", $mail_id);
    $stmt_del->execute();

    $msg = "Đã xóa thư!";
    
    if ($mail['item_id'] > 0) {
        $stmt_item = $conn->prepare("SELECT name FROM shop_items WHERE id = ?");
        $stmt_item->bind_param("i", $mail['item_id']);
        $stmt_item->execute();
        $item = $stmt_item->get_result()->fetch_assoc();

        if ($item) {
            $stmt_inv = $conn->prepare("INSERT INTO user_inventory (username, item_id) VALUES (?, ?)");
            $stmt_inv->bind_param("si", $username, $mail['item_id']);
            $stmt_inv->execute();
            $msg = "Thu thập thành công: " . $item['name'];
        }
    }



    // 🌟 ĐÃ SỬA THÀNH 'game_gold'
    if (isset($mail['game_gold']) && $mail['game_gold'] > 0) {
        // Đã đổi SET gold = gold + ?  THÀNH  SET game_gold = game_gold + ?
        $stmt_gold = $conn->prepare("UPDATE game_characters SET game_gold = game_gold + ? WHERE username = ?");
        $stmt_gold->bind_param("is", $mail['game_gold'], $username);
        $stmt_gold->execute();
        $msg .= " và " . number_format($mail['game_gold']) . " Vàng";
    }

    // ========================================================
    // 🌟 RÚT EXP VÀ TRẢ VỀ CHO CLIENT (ĐỂ BỘ NÃO GAME TỰ CỘNG VÀ XÉT LÊN CẤP)
    // ========================================================
    $exp_thuong = 0;
    if (isset($mail['game_exp']) && $mail['game_exp'] > 0) {
        $exp_thuong = (int)$mail['game_exp'];
        $msg .= " và " . number_format($exp_thuong) . " EXP";
    }
    // ========================================================

    $conn->commit();
    // Bơm thêm biến exp_gained vào JSON trả về để rom.php bắt lấy
    echo json_encode(['status' => 'success', 'msg' => $msg, 'exp_gained' => $exp_thuong]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi hệ thống!']);
}
?>
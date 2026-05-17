<?php
// FILE: api/sell_auction.php (BẢN V3 - BÁN LINH THẠCH)
session_start(); header('Content-Type: application/json'); require_once '../db.php';
if (!isset($_SESSION['user'])) exit;

$user = $_SESSION['user'];
$type_sell = isset($_POST['type_sell']) ? $_POST['type_sell'] : 'item';

$conn->begin_transaction();
try {
    if ($type_sell === 'currency') {
        // --- LUỒNG BÁN LINH THẠCH ---
        $amount_lt = intval($_POST['amount_lt']); // Lượng LT muốn bán
        $rate = intval($_POST['rate']);            // Tỷ giá 1 LT = ? Vàng
        
        if ($amount_lt <= 0 || $rate <= 0) throw new Exception("Dữ liệu không hợp lệ!");

        $stmtLT = $conn->prepare("SELECT balance FROM users WHERE username = ? FOR UPDATE");
        $stmtLT->bind_param("s", $user); $stmtLT->execute();
        $userData = $stmtLT->get_result()->fetch_assoc();
        
        if (!$userData || $userData['balance'] < $amount_lt) throw new Exception("Sếp không đủ Linh Thạch để đăng lên sàn!");

        // Trừ Linh Thạch
        $conn->query("UPDATE users SET balance = balance - $amount_lt WHERE username = '$user'");

        // Đẩy lên sàn: item_id = Lượng LT còn lại, price_gold = Tỷ giá
        $in = $conn->prepare("INSERT INTO auction_house (seller_name, item_id, item_type, price_gold, upgrade_level) VALUES (?, ?, 'currency', ?, 0)");
        $in->bind_param("sii", $user, $amount_lt, $rate);
        $in->execute();

    } else {
        // --- LUỒNG BÁN ĐỒ VẬT BÌNH THƯỜNG --- (Như cũ)
        // ... Code bán đồ cũ ...
    }
    $conn->commit(); echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
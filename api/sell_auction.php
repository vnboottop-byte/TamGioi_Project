<?php
session_start(); header('Content-Type: application/json'); require_once '../db.php';
if (!isset($_SESSION['user'])) exit;

$user = $_SESSION['user'];
$type_sell = isset($_POST['type_sell']) ? $_POST['type_sell'] : 'item';
$phi_moi_gioi = 50; 

$conn->begin_transaction();
try {
    if ($type_sell === 'currency') {
        // --- ĐĂNG BÁN LINH THẠCH ---
        $amount_lt = intval($_POST['amount_lt']); 
        $rate = intval($_POST['rate']);           
        
        if ($amount_lt <= 0 || $rate <= 0) throw new Exception("Dữ liệu không hợp lệ!");

        // Lấy ví Linh Thạch & Ví Vàng
        $stmtLT = $conn->prepare("SELECT balance FROM users WHERE username = ? FOR UPDATE");
        $stmtLT->bind_param("s", $user); $stmtLT->execute();
        $userLT = $stmtLT->get_result()->fetch_assoc();

        $stmtG = $conn->prepare("SELECT game_gold FROM game_characters WHERE username = ?");
        $stmtG->bind_param("s", $user); $stmtG->execute();
        $userG = $stmtG->get_result()->fetch_assoc();
        
        if (!$userLT || $userLT['balance'] < $amount_lt) throw new Exception("Không đủ Linh Thạch!");
        if (!$userG || $userG['game_gold'] < $phi_moi_gioi) throw new Exception("Cần $phi_moi_gioi Vàng nộp thuế sàn!");

        // Trừ tiền
        $conn->query("UPDATE users SET balance = balance - $amount_lt WHERE username = '$user'");
        $conn->query("UPDATE game_characters SET game_gold = game_gold - $phi_moi_gioi WHERE username = '$user'");

        // Lên sàn: item_id = Số LT, price_gold = Tỷ giá
        $in = $conn->prepare("INSERT INTO auction_house (seller_name, item_id, item_type, price_gold, upgrade_level) VALUES (?, ?, 'currency', ?, 0)");
        $in->bind_param("sii", $user, $amount_lt, $rate);
        $in->execute();

    } else {
        // --- ĐĂNG BÁN PHÁP BẢO ---
        $inv_id = intval($_POST['inv_id']);
        $price = intval($_POST['price_gold']);
        
        if ($price <= 0) throw new Exception("Giá bán phải lớn hơn 0!");

        $stmt = $conn->prepare("SELECT item_id, item_type, is_equipped, upgrade_level FROM user_inventory WHERE id = ? AND username = ?");
        $stmt->bind_param("is", $inv_id, $user); $stmt->execute();
        $item = $stmt->get_result()->fetch_assoc();

        if (!$item || $item['is_equipped'] == 1) throw new Exception("Không tìm thấy vật phẩm hoặc đang mặc!");

        $conn->query("UPDATE game_characters SET game_gold = game_gold - $phi_moi_gioi WHERE username = '$user'");

        $in = $conn->prepare("INSERT INTO auction_house (seller_name, item_id, item_type, price_gold, upgrade_level) VALUES (?, ?, ?, ?, ?)");
        $in->bind_param("sisii", $user, $item['item_id'], $item['item_type'], $price, $item['upgrade_level']);
        $in->execute();

        $conn->query("DELETE FROM user_inventory WHERE id = $inv_id");
    }

    $conn->commit(); echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
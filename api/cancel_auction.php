<?php
session_start(); header('Content-Type: application/json'); require_once '../db.php';
if (!isset($_SESSION['user'])) exit;

$user = $_SESSION['user'];
$auction_id = intval($_POST['auction_id']);

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("SELECT * FROM auction_house WHERE id = ? AND seller_name = ? AND status = 'selling' FOR UPDATE");
    $stmt->bind_param("is", $auction_id, $user); $stmt->execute();
    $auction = $stmt->get_result()->fetch_assoc();

    if (!$auction) throw new Exception("Giao dịch không tồn tại hoặc đã bị mua!");

    if ($auction['item_type'] === 'currency') {
        // Trả Linh Thạch chưa bán hết về ví
        $lt_remaining = intval($auction['item_id']);
        $conn->query("UPDATE users SET balance = balance + $lt_remaining WHERE username = '$user'");
    } else {
        // Trả Pháp bảo về túi y nguyên chỉ số
        $in = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped, upgrade_level, bonus_damage, bonus_hp, bonus_speed) VALUES (?, ?, ?, 0, ?, ?, ?, ?)");
        $in->bind_param("sisiiii", $user, $auction['item_id'], $auction['item_type'], $auction['upgrade_level'], $auction['bonus_damage'], $auction['bonus_hp'], $auction['bonus_speed']);
        $in->execute();
    }

    $conn->query("UPDATE auction_house SET status = 'canceled' WHERE id = $auction_id");

    $conn->commit(); echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
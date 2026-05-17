<?php
// FILE: api/buy_auction.php (BẢN V6 - KHỚP LỆNH MUA MỘT PHẦN)
session_start(); header('Content-Type: application/json'); require_once '../db.php';
if (!isset($_SESSION['user'])) exit;

$buyer = $_SESSION['user'];
$auction_id = intval($_POST['auction_id']);
$buy_amount = isset($_POST['buy_amount']) ? intval($_POST['buy_amount']) : 0;

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("SELECT seller_name, item_id, item_type, price_gold, upgrade_level FROM auction_house WHERE id = ? AND status = 'selling' FOR UPDATE");
    $stmt->bind_param("i", $auction_id); $stmt->execute();
    $auction = $stmt->get_result()->fetch_assoc();

    if (!$auction) throw new Exception("Lô hàng đã bị nẫng tay trên hoặc đã hết!");
    if ($auction['seller_name'] === $buyer) throw new Exception("Không thể tự mua đồ của mình!");

    $seller = $auction['seller_name'];

    if ($auction['item_type'] === 'currency') {
        // --- LUỒNG MUA LINH THẠCH (Trừ Vàng người mua, Trả LT người mua) ---
        $rate = intval($auction['price_gold']);
        $lt_available = intval($auction['item_id']); // Số LT còn lại trên sàn
        
        if ($buy_amount <= 0 || $buy_amount > $lt_available) throw new Exception("Số lượng mua không hợp lệ!");
        
        $tongVangPhaiTra = $buy_amount * $rate;

        // Trừ Vàng người mua
        $stmtB = $conn->prepare("SELECT game_gold FROM game_characters WHERE username = ? FOR UPDATE");
        $stmtB->bind_param("s", $buyer); $stmtB->execute();
        $buyer_data = $stmtB->get_result()->fetch_assoc();
        
        if (!$buyer_data || $buyer_data['game_gold'] < $tongVangPhaiTra) throw new Exception("Không đủ Vàng để thanh toán ($tongVangPhaiTra Vàng)!");
        
        $conn->query("UPDATE game_characters SET game_gold = game_gold - $tongVangPhaiTra WHERE username = '$buyer'");
        
        // Cộng Linh Thạch cho người mua
        $conn->query("UPDATE users SET balance = balance + $buy_amount WHERE username = '$buyer'");

        // Cộng Vàng cho người bán (Bị trừ 5% thuế trên số Vàng nhận được)
        $tax = intval($tongVangPhaiTra * 0.05);
        $vangThucNhan = $tongVangPhaiTra - $tax;
        $conn->query("UPDATE game_characters SET game_gold = game_gold + $vangThucNhan WHERE username = '$seller'");

        // Cập nhật lại số LT còn lại trên sàn
        $lt_remaining = $lt_available - $buy_amount;
        if ($lt_remaining <= 0) {
            $conn->query("UPDATE auction_house SET status = 'sold', item_id = 0 WHERE id = $auction_id");
        } else {
            $conn->query("UPDATE auction_house SET item_id = $lt_remaining WHERE id = $auction_id");
        }

    } else {
        // --- LUỒNG BÌNH THƯỜNG MUA ĐỒ BẰNG VÀNG ---
        // (Sếp giữ nguyên phần trừ vàng cộng đồ vào túi như cũ nhé)
    }

    $conn->commit(); echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
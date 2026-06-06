<?php
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

    if (!$auction) throw new Exception("Lô hàng đã bị mua mất hoặc hết hạn!");
    if ($auction['seller_name'] === $buyer) throw new Exception("Không thể tự mua đồ của mình!");

    $seller = $auction['seller_name'];

    if ($auction['item_type'] === 'currency') {
        // --- KHỚP LỆNH MUA LINH THẠCH MỘT PHẦN ---
        $rate = intval($auction['price_gold']);
        $lt_available = intval($auction['item_id']); 
        
        if ($buy_amount <= 0 || $buy_amount > $lt_available) throw new Exception("Số lượng mua không hợp lệ!");
        
        $tongVangPhaiTra = $buy_amount * $rate;

        // Trừ Vàng người mua
        $stmtB = $conn->prepare("SELECT game_gold FROM game_characters WHERE username = ? FOR UPDATE");
        $stmtB->bind_param("s", $buyer); $stmtB->execute();
        $buyer_data = $stmtB->get_result()->fetch_assoc();
        
        if (!$buyer_data || $buyer_data['game_gold'] < $tongVangPhaiTra) throw new Exception("Không đủ Vàng để thanh toán ($tongVangPhaiTra Vàng)!");
        $conn->query("UPDATE game_characters SET game_gold = game_gold - $tongVangPhaiTra WHERE username = '$buyer'");
        
        // Cộng Linh Thạch người mua
        $conn->query("UPDATE users SET balance = balance + $buy_amount WHERE username = '$buyer'");

        // Cộng Vàng người bán (Bị trừ 5% thuế sàn)
        $tax = intval($tongVangPhaiTra * 0.05);
        $vangThucNhan = $tongVangPhaiTra - $tax;
        $conn->query("UPDATE game_characters SET game_gold = game_gold + $vangThucNhan WHERE username = '$seller'");

        // Cập nhật sàn (Nếu mua hết thì xóa, chưa hết thì cập nhật số dư)
        $lt_remaining = $lt_available - $buy_amount;
        if ($lt_remaining <= 0) {
            $conn->query("UPDATE auction_house SET status = 'sold', item_id = 0 WHERE id = $auction_id");
        } else {
            $conn->query("UPDATE auction_house SET item_id = $lt_remaining WHERE id = $auction_id");
        }

    } else {
        // --- KHỚP LỆNH MUA PHÁP BẢO ---
        $price = intval($auction['price_gold']);
        $stmtB = $conn->prepare("SELECT game_gold FROM game_characters WHERE username = ? FOR UPDATE");
        $stmtB->bind_param("s", $buyer); $stmtB->execute();
        $buyer_data = $stmtB->get_result()->fetch_assoc();

        if (!$buyer_data || $buyer_data['game_gold'] < $price) throw new Exception("Không đủ Vàng!");
        
        $conn->query("UPDATE game_characters SET game_gold = game_gold - $price WHERE username = '$buyer'");
        $tax = intval($price * 0.05);
        $final_gold_to_seller = $price - $tax;
        $conn->query("UPDATE game_characters SET game_gold = game_gold + $final_gold_to_seller WHERE username = '$seller'");



        // Giao hàng cho người mua, nhớ xách theo 3 dòng chỉ số!
        $in = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped, upgrade_level, bonus_damage, bonus_hp, bonus_speed) VALUES (?, ?, ?, 0, ?, ?, ?, ?)");
        $in->bind_param("sisiiii", $user, $auction['item_id'], $auction['item_type'], $auction['upgrade_level'], $auction['bonus_damage'], $auction['bonus_hp'], $auction['bonus_speed']);
        $in->execute();



        $conn->query("UPDATE auction_house SET status = 'sold' WHERE id = $auction_id");
    }

    $conn->commit(); echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
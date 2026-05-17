<?php
// FILE: api/buy_auction.php (BẢN V5 - TÍCH HỢP SÀN CHỨNG KHOÁN TIỀN TỆ)
session_start(); header('Content-Type: application/json'); require_once '../db.php';
if (!isset($_SESSION['user'])) exit;

$buyer = $_SESSION['user'];
$auction_id = intval($_POST['auction_id']);

$conn->begin_transaction();
try {
    // 1. Khóa Chợ Đấu Giá 
    $stmt = $conn->prepare("SELECT seller_name, item_id, item_type, price_gold, upgrade_level FROM auction_house WHERE id = ? AND status = 'selling' FOR UPDATE");
    $stmt->bind_param("i", $auction_id); $stmt->execute();
    $auction = $stmt->get_result()->fetch_assoc();

    if (!$auction) throw new Exception("Món hàng này đã bị nẫng tay trên hoặc đã hết hạn!");
    if ($auction['seller_name'] === $buyer) throw new Exception("Tẩu hỏa nhập ma! Không thể tự mua đồ của chính mình!");

    $seller = $auction['seller_name'];

    // ==========================================
    // 🌟 LUỒNG 1: MUA BÁN TIỀN TỆ (VÀNG <==> LINH THẠCH)
    // Quy tắc Database: 
    // - item_type = 'currency'
    // - item_id = Số VÀNG (game_gold) người bán đang treo
    // - price_gold = Số LINH THẠCH (balance) người mua phải trả
    // ==========================================
    if ($auction['item_type'] === 'currency') {
        
        $soLinhThachPhaiTra = intval($auction['price_gold']);
        $soVangNhanDuoc = intval($auction['item_id']);

        // A. Kiểm tra ví Linh Thạch (Tiền Nạp) của Đại gia (Người mua)
        $stmtBuyerBal = $conn->prepare("SELECT balance FROM users WHERE username = ? FOR UPDATE");
        $stmtBuyerBal->bind_param("s", $buyer); $stmtBuyerBal->execute();
        $buyerBal = $stmtBuyerBal->get_result()->fetch_assoc();
        
        if (!$buyerBal || $buyerBal['balance'] < $soLinhThachPhaiTra) {
            throw new Exception("Sếp không đủ Thượng Phẩm Linh Thạch (Tiền Nạp) để mua gói Vàng này!");
        }

        // B. Trừ Linh Thạch người mua, Cộng Vàng cho người mua
        $conn->query("UPDATE users SET balance = balance - $soLinhThachPhaiTra WHERE username = '$buyer'");
        $conn->query("UPDATE game_characters SET game_gold = game_gold + $soVangNhanDuoc WHERE username = '$buyer'");

        // C. Cộng Linh Thạch cho Dân cày (Người bán) - Thuế sàn Linh Thạch 5%
        $taxLinhThach = intval($soLinhThachPhaiTra * 0.05);
        $linhThachThucNhan = $soLinhThachPhaiTra - $taxLinhThach;
        $conn->query("UPDATE users SET balance = balance + $linhThachThucNhan WHERE username = '$seller'");

    } 
    // ==========================================
    // ⚔️ LUỒNG 2: MUA BÁN PHÁP BẢO BÌNH THƯỜNG (BẰNG VÀNG)
    // ==========================================
    else {
        $price = intval($auction['price_gold']);

        // A. Khóa và trừ Vàng người mua
        $stmtB = $conn->prepare("SELECT game_gold FROM game_characters WHERE username = ? FOR UPDATE");
        $stmtB->bind_param("s", $buyer); $stmtB->execute();
        $buyer_data = $stmtB->get_result()->fetch_assoc();

        if (!$buyer_data || $buyer_data['game_gold'] < $price) throw new Exception("Không đủ Vàng để mua pháp bảo này!");
        $conn->query("UPDATE game_characters SET game_gold = game_gold - $price WHERE username = '$buyer'");

        // B. Cộng Vàng cho người bán (Thuế 5%)
        $tax = intval($price * 0.05);
        $final_gold_to_seller = $price - $tax;
        $conn->query("UPDATE game_characters SET game_gold = game_gold + $final_gold_to_seller WHERE username = '$seller'");

        // C. Nhét pháp bảo vào túi người Mua
        $in = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped, upgrade_level) VALUES (?, ?, ?, 0, ?)");
        $in->bind_param("sisi", $buyer, $auction['item_id'], $auction['item_type'], $auction['upgrade_level']);
        $in->execute();
    }

    // ==========================================
    // CHUNG: Đổi trạng thái Chợ (Thành sold)
    // ==========================================
    $conn->query("UPDATE auction_house SET status = 'sold' WHERE id = $auction_id");

    $conn->commit(); 
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback(); 
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
<?php
// FILE: api/sell_auction.php (BẢN V2 - THU THUẾ & TREO VÀNG)
session_start(); header('Content-Type: application/json'); require_once '../db.php';
if (!isset($_SESSION['user'])) exit;

$user = $_SESSION['user'];
$type_sell = isset($_POST['type_sell']) ? $_POST['type_sell'] : 'item';
$phi_moi_gioi = 50; 

$conn->begin_transaction();
try {
    $stmtGold = $conn->prepare("SELECT game_gold FROM game_characters WHERE username = ? FOR UPDATE");
    $stmtGold->bind_param("s", $user); $stmtGold->execute();
    $userData = $stmtGold->get_result()->fetch_assoc();
    if (!$userData) throw new Exception("Không tìm thấy dữ liệu nhân vật!");
    
    $current_gold = intval($userData['game_gold']);

    if ($type_sell === 'currency') {
        // --- LUỒNG BÁN VÀNG ---
        $amount_gold = intval($_POST['amount_gold']); // Lượng Vàng muốn bán
        $price_linh_thach = intval($_POST['price_linh_thach']); // Giá thu về
        
        if ($amount_gold <= 0 || $price_linh_thach <= 0) throw new Exception("Số lượng không hợp lệ!");
        if ($current_gold < ($amount_gold + $phi_moi_gioi)) throw new Exception("Không đủ Vàng để bán và nộp phí ($phi_moi_gioi Vàng)!");

        // Trừ Vàng (Số bán + Phí)
        $conn->query("UPDATE game_characters SET game_gold = game_gold - ($amount_gold + $phi_moi_gioi) WHERE username = '$user'");

        // Đẩy lên chợ: item_id = lượng Vàng, price_gold = giá Linh thạch
        $in = $conn->prepare("INSERT INTO auction_house (seller_name, item_id, item_type, price_gold, upgrade_level) VALUES (?, ?, 'currency', ?, 0)");
        $in->bind_param("sii", $user, $amount_gold, $price_linh_thach);
        $in->execute();

    } else {
        // --- LUỒNG BÁN PHÁP BẢO CŨ ---
        $inv_id = intval($_POST['inv_id']);
        $price = intval($_POST['price_gold']);
        
        if ($price <= 0) throw new Exception("Giá bán phải lớn hơn 0!");
        if ($current_gold < $phi_moi_gioi) throw new Exception("Sếp cần $phi_moi_gioi Vàng nộp thuế sàn!");

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
<?php
session_start(); 
header('Content-Type: application/json'); 
require_once '../db.php';

// ==========================================
// 1. MÁY QUÉT AUTO-REFUND (BẢN VÁ: TRẢ THẲNG ĐỒ VỀ TÚI/VÍ SAU 3 PHÚT)
// ==========================================
// Lấy danh sách các món đồ đang ế quá 3 phút (Sếp test xong thì đổi số 3 MINUTE thành 1 DAY nhé)
$sql_expired = "SELECT id, seller_name, item_id, item_type, upgrade_level FROM auction_house WHERE status = 'selling' AND created_at < (NOW() - INTERVAL 3 MINUTE)";
$res_expired = $conn->query($sql_expired);

if ($res_expired && $res_expired->num_rows > 0) {
    $conn->begin_transaction();
    try {
        while ($row = $res_expired->fetch_assoc()) {
            $auc_id = $row['id'];
            $seller = $row['seller_name'];
            
            if ($row['item_type'] === 'currency') {
                // 💰 NẾU LÀ TIỀN: Trả Linh Thạch dội ngược về Ví của người bán
                $lt_amount = intval($row['item_id']);
                $conn->query("UPDATE users SET balance = balance + $lt_amount WHERE username = '$seller'");
            } else {
                // ⚔️ NẾU LÀ ĐỒ: Trả Pháp bảo / Thú cưỡi / Ngoại trang về Túi Càn Khôn
                $in = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped, upgrade_level) VALUES (?, ?, ?, 0, ?)");
                $in->bind_param("sisi", $seller, $row['item_id'], $row['item_type'], $row['upgrade_level']);
                $in->execute();
            }
            
            // Đánh dấu là đã thu hồi (returned) để lần sau không quét lại nữa
            $conn->query("UPDATE auction_house SET status = 'returned' WHERE id = $auc_id");
        }
        $conn->commit();
    } catch (Exception $e) {
        $conn->rollback();
    }
}

// ==========================================
// 2. LẤY DANH SÁCH HÀNG ĐANG BÁN TRÊN SÀN
// ==========================================
$sql = "SELECT a.id as auction_id, a.seller_name, a.item_id, a.price_gold, a.created_at, a.upgrade_level, a.item_type as auction_type,
               s.name, s.model_url, s.item_type, s.required_class, s.bonus_damage, s.bonus_hp, s.bonus_speed 
        FROM auction_house a 
        LEFT JOIN shop_items s ON a.item_id = s.id 
        WHERE a.status = 'selling' 
        ORDER BY a.id DESC";

$res = $conn->query($sql);
$data = [];
if ($res) {
    while ($row = $res->fetch_assoc()) { 
        $data[] = $row; 
    }
}

// ==========================================
// 3. LẤY SỐ DƯ VÍ CỦA NGƯỜI CHƠI ĐỂ HIỂN THỊ TRÊN GIAO DIỆN CHỢ
// ==========================================
$gold = 0; $linh_thach = 0;
if (isset($_SESSION['user'])) {
    $user = $_SESSION['user'];
    $r = $conn->query("SELECT game_gold FROM game_characters WHERE username = '$user'")->fetch_assoc();
    if ($r) $gold = $r['game_gold'];
    
    $u = $conn->query("SELECT balance FROM users WHERE username = '$user'")->fetch_assoc();
    if ($u) $linh_thach = $u['balance'];
}

echo json_encode(['status' => 'success', 'data' => $data, 'my_gold' => $gold, 'my_linh_thach' => $linh_thach, 'my_name' => $_SESSION['user'] ?? '']);
?>
<?php
session_start(); 
header('Content-Type: application/json'); 
require_once '../db.php';

// 🌟 Khởi tạo biến đếm báo cáo cho Sếp
$refunded_items = 0;
$refunded_lt = 0;

// ==========================================
// 1. MÁY QUÉT AUTO-REFUND 
// ==========================================
// Đang đặt 3 MINUTE để test, Sếp nhớ đổi thành 1 DAY sau khi test xong nhé
$sql_expired = "SELECT id, seller_name, item_id, item_type, upgrade_level, bonus_damage, bonus_hp, bonus_speed FROM auction_house WHERE status = 'selling' AND created_at < (NOW() - INTERVAL 24 HOUR)";
$res_expired = $conn->query($sql_expired);

if ($res_expired && $res_expired->num_rows > 0) {
    $conn->begin_transaction();
    try {
        while ($row = $res_expired->fetch_assoc()) {
            $auc_id = $row['id'];
            $seller = $row['seller_name'];
            
            if ($row['item_type'] === 'currency') {
                $lt_amount = intval($row['item_id']);
                $conn->query("UPDATE users SET balance = balance + $lt_amount WHERE username = '$seller'");
                
                // Ghi nhận nếu là đồ của chính người đang mở chợ
                if (isset($_SESSION['user']) && $seller === $_SESSION['user']) $refunded_lt += $lt_amount;
                
            } else {
                // Đóng gói đồ trả về kèm đầy đủ 3 Dòng Chỉ Số
                $in = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped, upgrade_level, bonus_damage, bonus_hp, bonus_speed) VALUES (?, ?, ?, 0, ?, ?, ?, ?)");
                $in->bind_param("sisiiii", $seller, $row['item_id'], $row['item_type'], $row['upgrade_level'], $row['bonus_damage'], $row['bonus_hp'], $row['bonus_speed']);
                $in->execute();
                
                // Ghi nhận nếu là đồ của chính người đang mở chợ
                if (isset($_SESSION['user']) && $seller === $_SESSION['user']) $refunded_items++;
            }
            
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
               a.bonus_damage, a.bonus_hp, a.bonus_speed, 
               s.name, s.model_url, s.required_class
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
// 3. LẤY SỐ DƯ VÍ
// ==========================================
$gold = 0; $linh_thach = 0;
if (isset($_SESSION['user'])) {
    $user = $_SESSION['user'];
    $r = $conn->query("SELECT game_gold FROM game_characters WHERE username = '$user'")->fetch_assoc();
    if ($r) $gold = $r['game_gold'];
    
    $u = $conn->query("SELECT balance FROM users WHERE username = '$user'")->fetch_assoc();
    if ($u) $linh_thach = $u['balance'];
}

// 🌟 Xuất thêm báo cáo refund ra cho Javascript đọc
echo json_encode([
    'status' => 'success', 
    'data' => $data, 
    'my_gold' => $gold, 
    'my_linh_thach' => $linh_thach, 
    'my_name' => $_SESSION['user'] ?? '',
    'refunded_items' => $refunded_items,
    'refunded_lt' => $refunded_lt
]);
?>
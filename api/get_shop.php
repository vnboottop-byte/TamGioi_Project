<?php
// BƯỚC 1: Bật bộ đệm tàng hình để chặn mọi rác HTML/khoảng trắng từ db.php làm vỡ JSON
ob_start();
session_start();
require_once '../db.php';
$buffer_garbage = ob_get_clean(); // Hút sạch rác đi

// BƯỚC 2: Định dạng chuẩn API
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập!']);
    exit;
}

$username = $_SESSION['user'];

try {
    // 🌟 1. TRA CỨU MÔN PHÁI CỦA NGƯỜI CHƠI (Nối bảng cực chuẩn)
    $stmt_phai = $conn->prepare("SELECT c.faction_code FROM game_characters gc JOIN game_classes c ON gc.class_id = c.id WHERE gc.username = ?");
    $stmt_phai->bind_param("s", $username);
    $stmt_phai->execute();
    $res_phai = $stmt_phai->get_result()->fetch_assoc();
    
    // Lấy ra mã phái (VD: TU_TIEN, CUNG_TEN...). Nếu lỗi thì để rỗng.
    $phai_cua_toi = $res_phai ? $res_phai['faction_code'] : '';

    // 🌟 2. QUÉT KHO HÀNG (Mở khóa toàn bộ Ngoại trang 'model' cho phép Đoạt Xá)
    // Các đồ khác (weapon, mount) thì vẫn chỉ hiện ALL hoặc ĐÚNG PHÁI
    $sql = "SELECT * FROM shop_items WHERE item_type = 'model' OR required_class = 'ALL' OR required_class = ? ORDER BY item_type DESC, price ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $phai_cua_toi);

    $stmt->execute();
    $res = $stmt->get_result();

    if (!$res) throw new Exception("Lỗi Database: " . $conn->error);

    $items = [];
    while ($row = $res->fetch_assoc()) {
        $row['item_type'] = trim(strtolower($row['item_type']));
        $items[] = $row;
    }

    echo json_encode([
        'status' => 'success', 
        'total' => count($items), 
        'data' => $items,
        'phai_cua_toi' => $phai_cua_toi, // Trả về UI để Debug nếu cần
        'debug_garbage' => $buffer_garbage 
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
exit;
?>
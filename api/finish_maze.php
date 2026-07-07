<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) { echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập']); exit; }
$username = $_SESSION['user'];
$level_vua_qua = isset($_POST['level_vua_qua']) ? (int)$_POST['level_vua_qua'] : 0;

if ($level_vua_qua <= 0) exit;

// 1. 🛑 CHECK NHẬN QUÀ TRONG THÁNG (Mỗi tháng 1 lần)
$stmt = $conn->prepare("SELECT id FROM maze_records WHERE username = ? AND maze_level = ? AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
$stmt->bind_param("si", $username, $level_vua_qua);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['status' => 'error', 'msg' => 'Ải này bạn đã nhận quà trong tháng này rồi! (Vẫn lưu kỷ lục đua Top)']);
    // Vẫn insert bảng thành tích đua Top nhưng return không gửi thư nữa
    $conn->query("INSERT INTO maze_records (username, maze_level, time_passed) VALUES ('$username', $level_vua_qua, 0)");
    exit;
}

// 2. 🏆 GHI KỶ LỤC LẦN ĐẦU TIÊN TRONG THÁNG
$stmt_insert = $conn->prepare("INSERT INTO maze_records (username, maze_level, time_passed) VALUES (?, ?, 0)");
$stmt_insert->bind_param("si", $username, $level_vua_qua);
$stmt_insert->execute();

// 3. 🎲 THUẬT TOÁN GACHA TÌM QUÀ RANDOM THEO TRỊ GIÁ TRONG SHOP
$min_price = 0; $max_price = 0;
if ($level_vua_qua == 1) { $min_price = 10000; $max_price = 60000; }     // Trị giá ~ 50k
elseif ($level_vua_qua == 2) { $min_price = 60000; $max_price = 120000; } // Trị giá ~ 100k
elseif ($level_vua_qua == 3) { $min_price = 120000; $max_price = 170000;} // Trị giá ~ 150k
elseif ($level_vua_qua == 4) { $min_price = 170000; $max_price = 220000;} // Trị giá ~ 200k
else { $min_price = 220000; $max_price = 999999999; }                     // Trị giá > 200k

$shop_item_id = 0;
$gold_fallback = 0;

// Lấy ngẫu nhiên 1 món đồ trong tầm giá
$sql_random = "SELECT id, name FROM shop_items WHERE price_gold BETWEEN $min_price AND $max_price ORDER BY RAND() LIMIT 1";
$res_random = $conn->query($sql_random);

if ($res_random && $row_item = $res_random->fetch_assoc()) {
    $shop_item_id = $row_item['id'];
    $item_name = $row_item['name'];
    $content = "Cung hỉ đạo hữu đã xuất sắc phá đảo Mê Cung LV$level_vua_qua! Hệ thống gửi tặng bạn món thần binh ngẫu nhiên: [ $item_name ]. Mau mở ra xem!";
} else {
    // 🛡️ BẢO HIỂM: Nhỡ trong Shop sếp không có món nào đúng tầm giá đó, quy ra tiền mặt trả luôn để không bị lỗi!
    $gold_fallback = $level_vua_qua * 50000;
    $content = "Cung hỉ đạo hữu vượt Mê Cung LV$level_vua_qua! Do kho hàng hết vật phẩm phù hợp, hệ thống đền bù cho bạn $gold_fallback Linh Thạch. Mời nhận lấy!";
}

// 4. 💌 GỬI VÀO HỘP THƯ
$title = "🎁 Phần Thưởng Vượt Ải LV$level_vua_qua";
$stmt_mail = $conn->prepare("INSERT INTO user_mailbox (username, title, content, item_id, gold) VALUES (?, ?, ?, ?, ?)");
$stmt_mail->bind_param("sssii", $username, $title, $content, $shop_item_id, $gold_fallback);
$stmt_mail->execute();

echo json_encode(['status' => 'success', 'msg' => 'Phá đảo thành công! Phần thưởng đã được gửi vào Hộp Thư!']);
?>
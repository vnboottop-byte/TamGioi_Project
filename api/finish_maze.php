<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

// Tắt hiển thị lỗi bừa bãi làm hỏng định dạng JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Bật chế độ bắt lỗi của CSDL để không bị sập 500
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    if (!isset($_SESSION['user'])) {
        echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập']);
        exit;
    }

    $username = $_SESSION['user'];
    $level_vua_qua = isset($_POST['level_vua_qua']) ? (int)$_POST['level_vua_qua'] : 0;

    if ($level_vua_qua <= 0) {
        echo json_encode(['status' => 'error', 'msg' => 'Dữ liệu Level Mê cung không hợp lệ!']);
        exit;
    }

    // 1. Kiểm tra đã nhận quà trong tháng chưa
    $stmt = $conn->prepare("SELECT id FROM maze_records WHERE username = ? AND maze_level = ? AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
    $stmt->bind_param("si", $username, $level_vua_qua);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows > 0) {
        // Đã nhận rồi -> Vẫn lưu kỷ lục mới để đua Top thời gian nhưng không gửi thư nữa
        $conn->query("INSERT INTO maze_records (username, maze_level, time_passed) VALUES ('$username', $level_vua_qua, 0)");
        echo json_encode(['status' => 'error', 'msg' => 'Ải này bạn đã nhận quà trong tháng này rồi! (Hệ thống chỉ lưu kỷ lục đua Top)']);
        exit;
    }

    // 2. Ghi kỷ lục lần đầu trong tháng
    $stmt_insert = $conn->prepare("INSERT INTO maze_records (username, maze_level, time_passed) VALUES (?, ?, 0)");
    $stmt_insert->bind_param("si", $username, $level_vua_qua);
    $stmt_insert->execute();

    // 3. Thuật toán Gacha tìm Quà Random theo Trị giá
    $min_price = 0; $max_price = 0;
    if ($level_vua_qua == 1) { $min_price = 10000; $max_price = 60000; }     
    elseif ($level_vua_qua == 2) { $min_price = 60000; $max_price = 120000; } 
    elseif ($level_vua_qua == 3) { $min_price = 120000; $max_price = 170000;} 
    elseif ($level_vua_qua == 4) { $min_price = 170000; $max_price = 220000;} 
    else { $min_price = 220000; $max_price = 999999999; }                     

    $shop_item_id = 0;
    $gold_fallback = 0; // Đây là cột phụ trong bảng thư, lát nhận quà mình quy đổi thành Balance (Linh Thạch)
    
    try {
        // 🌟 BẢN VÁ: Đã sửa price_gold thành chữ price theo đúng chuẩn CSDL của Sếp
        $sql_random = "SELECT id, name FROM shop_items WHERE price BETWEEN $min_price AND $max_price ORDER BY RAND() LIMIT 1";
        $res_random = $conn->query($sql_random);
        
        if ($res_random && $row_item = $res_random->fetch_assoc()) {
            $shop_item_id = $row_item['id'];
            $item_name = $row_item['name'];
            $content = "Cung hỉ đạo hữu đã xuất sắc phá đảo Mê Cung LV$level_vua_qua! Hệ thống gửi tặng bạn món thần binh ngẫu nhiên: [ $item_name ]. Mau mở ra xem!";
        } else {
            throw new Exception("Không có đồ");
        }
    } catch (Throwable $exShop) {
        // Lỗi CSDL hoặc Shop không có đồ phù hợp -> Chuyển sang phát tiền Linh Thạch!
        $gold_fallback = $level_vua_qua * 50000;
        $content = "Cung hỉ đạo hữu vượt Mê Cung LV$level_vua_qua! Kho hàng hiện hết vật phẩm phù hợp, hệ thống đền bù cho bạn ".number_format($gold_fallback)." Linh Thạch. Mời nhận lấy!";
    }

    // 4. Gửi Hộp Thư
    $title = "🎁 Phần Thưởng Vượt Ải LV$level_vua_qua";
    $stmt_mail = $conn->prepare("INSERT INTO user_mailbox (username, title, content, item_id, gold) VALUES (?, ?, ?, ?, ?)");
    $stmt_mail->bind_param("sssii", $username, $title, $content, $shop_item_id, $gold_fallback);
    $stmt_mail->execute();

    echo json_encode(['status' => 'success', 'msg' => 'Phá đảo thành công! Quà đã gửi vào Hộp Thư!']);

} catch (Throwable $e) {
    // 🛑 NẾU CÓ LỖI SẬP SERVER, BẮT LẠI VÀ IN RA MÀN HÌNH GAME
    echo json_encode(['status' => 'error', 'msg' => 'LỖI MÁY CHỦ: ' . $e->getMessage()]);
}
?>
<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

// Tắt hiển thị lỗi bừa bãi làm hỏng định dạng JSON, chỉ trả về JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

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

    // ========================================================
    // 🌟 BẢO HIỂM 1: TỰ ĐỘNG TẠO BẢNG NẾU SẾP QUÊN CHẠY SQL
    // ========================================================
    $conn->query("CREATE TABLE IF NOT EXISTS `maze_records` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `username` varchar(50) NOT NULL,
      `maze_level` int(11) NOT NULL DEFAULT 1,
      `time_passed` int(11) NOT NULL,
      `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $conn->query("CREATE TABLE IF NOT EXISTS `user_mailbox` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `username` varchar(50) NOT NULL,
      `title` varchar(255) NOT NULL,
      `content` text NOT NULL,
      `item_id` int(11) DEFAULT 0,
      `gold` int(11) DEFAULT 0,
      `is_claimed` tinyint(1) DEFAULT 0,
      `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // ========================================================
    // 🛡️ BẮT ĐẦU XỬ LÝ LOGIC
    // ========================================================
    $safe_user = $conn->real_escape_string($username);
    
    // 1. Kiểm tra kỷ lục trong tháng
    $check_sql = "SELECT id FROM maze_records WHERE username = '$safe_user' AND maze_level = $level_vua_qua AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())";
    $res_check = $conn->query($check_sql);
    
    if ($res_check && $res_check->num_rows > 0) {
        // Đã nhận rồi -> Vẫn lưu kỷ lục mới để đua Top thời gian nhưng không gửi thư nữa
        $conn->query("INSERT INTO maze_records (username, maze_level, time_passed) VALUES ('$safe_user', $level_vua_qua, 0)");
        echo json_encode(['status' => 'error', 'msg' => 'Ải này bạn đã nhận quà trong tháng này rồi! (Hệ thống chỉ lưu Kỷ lục đua Top)']);
        exit;
    }

    // 2. Ghi kỷ lục lần đầu
    $conn->query("INSERT INTO maze_records (username, maze_level, time_passed) VALUES ('$safe_user', $level_vua_qua, 0)");

    // 3. TÌM CỘT GIÁ TIỀN CHUẨN TRONG SHOP CỦA SẾP
    $price_col = 'price'; // Mặc định
    $col_check = $conn->query("SHOW COLUMNS FROM shop_items");
    if ($col_check) {
        while ($c = $col_check->fetch_assoc()) {
            if ($c['Field'] === 'price_balance') $price_col = 'price_balance';
        }
    }

    $min_price = 0; $max_price = 0;
    if ($level_vua_qua == 1) { $min_price = 10000; $max_price = 60000; }     
    elseif ($level_vua_qua == 2) { $min_price = 60000; $max_price = 120000; } 
    elseif ($level_vua_qua == 3) { $min_price = 120000; $max_price = 170000;} 
    elseif ($level_vua_qua == 4) { $min_price = 170000; $max_price = 220000;} 
    else { $min_price = 220000; $max_price = 999999999; }

    $shop_item_id = 0;
    $gold_fallback = 0;
    $item_name = "";

    // 4. Lấy ngẫu nhiên đồ trong tầm giá
    $sql_random = "SELECT id, name FROM shop_items WHERE $price_col BETWEEN $min_price AND $max_price ORDER BY RAND() LIMIT 1";
    $res_random = $conn->query($sql_random);

    if ($res_random && $row_item = $res_random->fetch_assoc()) {
        $shop_item_id = $row_item['id'];
        $item_name = $row_item['name'];
        $content = "Cung hỉ đạo hữu đã xuất sắc phá đảo Mê Cung LV$level_vua_qua! Hệ thống gửi tặng bạn món thần binh ngẫu nhiên: [ $item_name ]. Mau mở ra xem!";
    } else {
        // Hết hàng -> Quy ra Linh Thạch trả luôn!
        $gold_fallback = $level_vua_qua * 50000;
        $content = "Cung hỉ đạo hữu vượt Mê Cung LV$level_vua_qua! Kho hàng hiện hết vật phẩm phù hợp, hệ thống đền bù cho bạn ".number_format($gold_fallback)." Linh Thạch. Mời nhận lấy!";
    }

    $title = "🎁 Phần Thưởng Vượt Ải LV$level_vua_qua";
    
    // 5. Gửi thư (Bọc thép an toàn)
    $stmt_mail = $conn->prepare("INSERT INTO user_mailbox (username, title, content, item_id, gold) VALUES (?, ?, ?, ?, ?)");
    if ($stmt_mail) {
        $stmt_mail->bind_param("sssii", $username, $title, $content, $shop_item_id, $gold_fallback);
        $stmt_mail->execute();
        echo json_encode(['status' => 'success', 'msg' => 'Phá đảo thành công! Quà đã gửi vào Hộp Thư!']);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Lỗi kết nối tạo thư: ' . $conn->error]);
    }

} catch (Throwable $e) {
    // 🛑 NẾU CÓ BẤT KỲ LỖI GÌ, TRẢ VỀ ĐÚNG CHUẨN JSON CHO GAME ĐỌC!
    echo json_encode(['status' => 'error', 'msg' => 'LỖI PHP: ' . $e->getMessage()]);
}
?>
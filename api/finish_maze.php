<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

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

    $safe_user = $conn->real_escape_string($username);
    
    // 1. Kiểm tra đã đi chưa
    $check_sql = "SELECT id FROM maze_records WHERE username = '$safe_user' AND maze_level = $level_vua_qua AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())";
    $res_check = $conn->query($check_sql);
    
    if ($res_check && $res_check->num_rows > 0) {
        echo json_encode(['status' => 'error', 'msg' => 'Ải này bạn đã nhận quà trong tháng này rồi!']);
        exit;
    }

    // 2. Tìm cột giá tiền chuẩn trong shop_items
    $price_col = 'price'; 
    $col_check = $conn->query("SHOW COLUMNS FROM shop_items");
    if ($col_check) {
        while ($c = $col_check->fetch_assoc()) {
            if ($c['Field'] === 'price_balance') $price_col = 'price_balance';
        }
    }

    $min_price = 0; $max_price = 0;
    if ($level_vua_qua == 1) { $min_price = 50000; $max_price = 50000; }     
    elseif ($level_vua_qua == 2) { $min_price = 60000; $max_price = 120000; } 
    elseif ($level_vua_qua == 3) { $min_price = 120000; $max_price = 170000;} 
    elseif ($level_vua_qua == 4) { $min_price = 170000; $max_price = 220000;} 
    else { $min_price = 220000; $max_price = 999999999; }

    $shop_item_id = 0;
    $gold_fallback = 0;

    $sql_random = "SELECT id, name FROM shop_items WHERE $price_col BETWEEN $min_price AND $max_price ORDER BY RAND() LIMIT 1";
    $res_random = $conn->query($sql_random);

    if ($res_random && $row_item = $res_random->fetch_assoc()) {
        $shop_item_id = $row_item['id'];
        $item_name = $row_item['name'];
        $content = "Cung hỉ đạo hữu đã xuất sắc phá đảo Mê Cung LV$level_vua_qua! Hệ thống gửi tặng bạn món thần binh ngẫu nhiên: [ $item_name ]. Mau mở ra xem!";
    } else {
        $gold_fallback = $level_vua_qua * 50000;
        $content = "Cung hỉ đạo hữu vượt Mê Cung LV$level_vua_qua! Kho hàng hiện hết vật phẩm phù hợp, hệ thống đền bù cho bạn ".number_format($gold_fallback)." Linh Thạch. Mời nhận lấy!";
    }

    $title = "🎁 Phần Thưởng Vượt Ải LV$level_vua_qua";
    
    // 🌟 BẢN VÁ TỐI THƯỢNG: ĐỔI 'gold' THÀNH 'game_gold' ĐÚNG VỚI SQL CỦA SẾP
    $stmt_mail = $conn->prepare("INSERT INTO user_mailbox (username, title, content, item_id, game_gold) VALUES (?, ?, ?, ?, ?)");
    if ($stmt_mail) {
        $stmt_mail->bind_param("sssii", $safe_user, $title, $content, $shop_item_id, $gold_fallback);
        $stmt_mail->execute();
        
        // Chỉ lưu Kỷ lục khi đã gửi thư thành công (Không bị mất oan vé đi)
        $conn->query("INSERT INTO maze_records (username, maze_level, time_passed) VALUES ('$safe_user', $level_vua_qua, 0)");

        echo json_encode(['status' => 'success', 'msg' => 'Phá đảo thành công! Quà đã gửi vào Hộp Thư!']);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Lỗi kết nối tạo thư: ' . $conn->error]);
    }

} catch (Throwable $e) {
    echo json_encode(['status' => 'error', 'msg' => 'LỖI PHP: ' . $e->getMessage()]);
}
?>
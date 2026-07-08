<?php
// FILE: api/chat.php (BẢN BỌC THÉP VÀ ĐỔI TÊN BẢNG THÀNH tamgioi_chat)
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Vui lòng đăng nhập']);
    exit;
}
$username = $_SESSION['user'];

// Giải phóng Session để game không bị lag
session_write_close();

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Bọc thép toàn bộ quy trình Database
try {
    if ($action === 'send') {
        $channel = isset($_POST['channel']) ? $conn->real_escape_string($_POST['channel']) : 'WORLD';
        $channel_id = isset($_POST['channel_id']) ? (int)$_POST['channel_id'] : 0;
        $message = isset($_POST['message']) ? trim($_POST['message']) : '';

        if ($message === '') {
            echo json_encode(['status' => 'error', 'msg' => 'Tin nhắn trống']); exit;
        }
        
        $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

        if ($channel === 'GUILD' && $channel_id == 0) {
             echo json_encode(['status' => 'error', 'msg' => 'Sếp chưa gia nhập Bang Hội!']); exit;
        }
        if ($channel === 'PARTY' && $channel_id == 0) {
             echo json_encode(['status' => 'error', 'msg' => 'Sếp đang không ở trong Tổ đội!']); exit;
        }

        // ĐÃ ĐỔI TÊN BẢNG THÀNH tamgioi_chat
        $stmt = $conn->prepare("INSERT INTO tamgioi_chat (sender, channel, channel_id, message) VALUES (?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("ssis", $username, $channel, $channel_id, $message);
            $stmt->execute();
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'msg' => 'Lỗi SQL: Bảng tamgioi_chat chưa tồn tại!']);
        }
    } 
    elseif ($action === 'get') {
        $channel = isset($_GET['channel']) ? $conn->real_escape_string($_GET['channel']) : 'WORLD';
        $channel_id = isset($_GET['channel_id']) ? (int)$_GET['channel_id'] : 0;
        
        // ĐÃ ĐỔI TÊN BẢNG THÀNH tamgioi_chat
        $sql = "SELECT sender, message FROM tamgioi_chat WHERE channel = '$channel' AND channel_id = $channel_id ORDER BY id DESC LIMIT 30";
        $res = $conn->query($sql);
        
        $messages = [];
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $messages[] = $row;
            }
        }
        
        $messages = array_reverse($messages);
        echo json_encode(['status' => 'success', 'data' => $messages]);
    }
} catch (\Throwable $e) {
    // Bắt chặt mọi lỗi Fatal của PHP và trả về JSON chuẩn
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi DB: Bảng tamgioi_chat có thể chưa được tạo!']);
}
?>
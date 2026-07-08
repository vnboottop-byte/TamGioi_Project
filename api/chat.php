<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Vui lòng đăng nhập']);
    exit;
}
$username = $_SESSION['user'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'send') {
    $channel = isset($_POST['channel']) ? $conn->real_escape_string($_POST['channel']) : 'WORLD';
    $channel_id = isset($_POST['channel_id']) ? (int)$_POST['channel_id'] : 0;
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    if ($message === '') {
        echo json_encode(['status' => 'error', 'msg' => 'Tin nhắn trống']); exit;
    }
    
    // Lọc thô tục (XSS)
    $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

    // Nếu gửi kênh Bang hoặc Party thì kiểm tra xem người chơi có Bang/Party đó không (Đề phòng Hack)
    // Sẽ ráp điều kiện này chặt hơn khi chúng ta làm Database cho Bang & Party
    if ($channel === 'GUILD' && $channel_id == 0) {
         echo json_encode(['status' => 'error', 'msg' => 'Sếp chưa gia nhập Bang Hội nào!']); exit;
    }
    if ($channel === 'PARTY' && $channel_id == 0) {
         echo json_encode(['status' => 'error', 'msg' => 'Sếp đang không ở trong Tổ đội nào!']); exit;
    }

    $stmt = $conn->prepare("INSERT INTO chat_messages (sender, channel, channel_id, message) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssis", $username, $channel, $channel_id, $message);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Lỗi gửi tin']);
    }
} 
elseif ($action === 'get') {
    $channel = isset($_GET['channel']) ? $conn->real_escape_string($_GET['channel']) : 'WORLD';
    $channel_id = isset($_GET['channel_id']) ? (int)$_GET['channel_id'] : 0;
    
    // Lấy 30 tin nhắn gần nhất của kênh đó
    $sql = "SELECT sender, message FROM chat_messages WHERE channel = '$channel' AND channel_id = $channel_id ORDER BY id DESC LIMIT 30";
    $res = $conn->query($sql);
    
    $messages = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $messages[] = $row;
        }
    }
    
    // Đảo ngược mảng để tin cũ nằm trên, tin mới nằm dưới
    $messages = array_reverse($messages);
    echo json_encode(['status' => 'success', 'data' => $messages]);
}
?>
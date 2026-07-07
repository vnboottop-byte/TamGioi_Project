<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) { echo json_encode(['status' => 'error']); exit; }
$username = $_SESSION['user'];

// Nếu chỉ kiểm tra chấm đỏ
if (isset($_GET['count_only'])) {
    $stmt = $conn->prepare("SELECT COUNT(id) as c FROM user_mailbox WHERE username = ? AND is_claimed = 0");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $c = $stmt->get_result()->fetch_assoc()['c'];
    echo json_encode(['status' => 'success', 'count' => $c]);
    exit;
}

// Lấy danh sách thư chưa đọc
$stmt = $conn->prepare("SELECT * FROM user_mailbox WHERE username = ? AND is_claimed = 0 ORDER BY id DESC");
$stmt->bind_param("s", $username);
$stmt->execute();
$res = $stmt->get_result();
$data = [];
while($row = $res->fetch_assoc()){ $data[] = $row; }

echo json_encode(['status' => 'success', 'data' => $data]);
?>
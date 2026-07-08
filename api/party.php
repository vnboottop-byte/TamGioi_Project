<?php
// FILE: api/party.php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) { echo json_encode(['status'=>'error']); exit; }
$username = $_SESSION['user'];
$action = isset($_POST['action']) ? $_POST['action'] : '';

if ($action === 'join') {
    $leader = isset($_POST['leader']) ? $conn->real_escape_string($_POST['leader']) : '';
    if (empty($leader)) exit;

    $conn->begin_transaction();
    try {
        // 1. Soi xem Đội trưởng đang mang ID Tổ đội số mấy?
        $res = $conn->query("SELECT party_id FROM game_characters WHERE username = '$leader' FOR UPDATE");
        $leaderData = $res->fetch_assoc();
        
        if (!$leaderData) throw new Exception("Không tìm thấy đội trưởng.");

        $party_id = (int)$leaderData['party_id'];
        
        // 2. Nếu Đội trưởng chưa có nhóm (ID = 0) -> Sáng tạo ra nhóm mới!
        if ($party_id === 0) {
            $party_id = rand(10000, 99999); // Bốc ngẫu nhiên 1 mã 5 số
            $conn->query("UPDATE game_characters SET party_id = $party_id WHERE username = '$leader'");
        }

        // 3. Đóng mộc ID Nhóm đó lên lưng mình!
        $conn->query("UPDATE game_characters SET party_id = $party_id WHERE username = '$username'");
        
        $conn->commit();
        echo json_encode(['status'=>'success', 'party_id' => $party_id]);
    } catch(Exception $e) {
        $conn->rollback();
        echo json_encode(['status'=>'error', 'msg'=>$e->getMessage()]);
    }
}
?>
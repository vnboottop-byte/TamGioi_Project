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
        $res = $conn->query("SELECT party_id FROM game_characters WHERE username = '$leader' FOR UPDATE");
        $leaderData = $res->fetch_assoc();
        if (!$leaderData) throw new Exception("Không tìm thấy đội trưởng.");

        $party_id = (int)$leaderData['party_id'];
        if ($party_id === 0) {
            $party_id = rand(10000, 99999); 
            $conn->query("UPDATE game_characters SET party_id = $party_id WHERE username = '$leader'");
        }

        $conn->query("UPDATE game_characters SET party_id = $party_id WHERE username = '$username'");
        $conn->commit();
        echo json_encode(['status'=>'success', 'party_id' => $party_id]);
    } catch(Exception $e) {
        $conn->rollback();
        echo json_encode(['status'=>'error', 'msg'=>$e->getMessage()]);
    }
} 
elseif ($action === 'leave') {
    // Xóa ID Nhóm của bản thân (Trả về Cô độc = 0)
    $conn->query("UPDATE game_characters SET party_id = 0 WHERE username = '$username'");
    echo json_encode(['status'=>'success']);
}
?>
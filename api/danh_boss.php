<?php
// FILE: api/danh_boss.php (BẢN V2.0 - ATOMIC DAMAGE)
session_start();
header('Content-Type: application/json');
require_once '../db.php'; 

if (!isset($_SESSION['user'])) { echo json_encode(['status' => 'error']); exit; }

$boss_id = isset($_POST['boss_id']) ? intval($_POST['boss_id']) : 0;
$damage = isset($_POST['damage']) ? floatval($_POST['damage']) : 0;

if ($boss_id <= 0 || $damage <= 0) { echo json_encode(['status' => 'error']); exit; }

$conn->begin_transaction();
try {
    // 1. Khóa dòng Boss này lại, không cho ai đụng vào trong lúc tính toán
    $stmt = $conn->prepare("SELECT hp, max_hp FROM map_monsters WHERE id = ? FOR UPDATE");
    $stmt->bind_param("i", $boss_id);
    $stmt->execute();
    $boss = $stmt->get_result()->fetch_assoc();

    if (!$boss || $boss['hp'] <= 0) {
        $conn->rollback(); 
        echo json_encode(['status' => 'dead', 'hp' => 0]); exit;
    }

    // 2. Trừ máu
    $new_hp = max(0, $boss['hp'] - $damage);
    $death_time = ($new_hp == 0) ? time() : 0;

    // 3. Cập nhật SQL
    $update = $conn->prepare("UPDATE map_monsters SET hp = ?, death_time = ? WHERE id = ?");
    $update->bind_param("iii", $new_hp, $death_time, $boss_id);
    $update->execute();
    $conn->commit();

    echo json_encode(['status' => 'success', 'hp' => $new_hp, 'is_dead' => ($new_hp == 0)]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error']);
}
?>
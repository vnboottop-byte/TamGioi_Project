<?php
// File: api/danh_nguoi.php (TÒA ÁN PVP - CHỐNG BẤT TỬ KHI RỚT MẠNG)
session_start();
header('Content-Type: application/json');
require_once '../db.php'; 

if (!isset($_SESSION['user'])) exit;

$attacker = $_SESSION['user'];
$victim = isset($_POST['victim']) ? $_POST['victim'] : '';

if ($attacker === $victim) exit; // Không tự tự sát

$conn->begin_transaction();
try {
    // 1. Lấy Damage thật của thằng Đánh
    $stmt_att = $conn->prepare("SELECT damage, level FROM game_characters WHERE username = ?");
    $stmt_att->bind_param("s", $attacker);
    $stmt_att->execute();
    $att_data = $stmt_att->get_result()->fetch_assoc();
    $real_damage = $att_data['damage'] + ($att_data['level'] * 5); // Tự chỉnh công thức PvP

    // 2. Lấy Máu thật của Nạn nhân
    $stmt_vic = $conn->prepare("SELECT hp_current, hp_max, char_name FROM game_characters WHERE username = ? FOR UPDATE");
    $stmt_vic->bind_param("s", $victim);
    $stmt_vic->execute();
    $vic_data = $stmt_vic->get_result()->fetch_assoc();

    if (!$vic_data || $vic_data['hp_current'] <= 0) {
        $conn->rollback(); echo json_encode(['status' => 'dead']); exit;
    }

    // 3. Phán quyết trừ máu
    $new_hp = max(0, $vic_data['hp_current'] - $real_damage);
    $stmt_update = $conn->prepare("UPDATE game_characters SET hp_current = ? WHERE username = ?");
    $stmt_update->bind_param("is", $new_hp, $victim);
    $stmt_update->execute();
    
    $conn->commit();
    echo json_encode(['status' => 'success', 'new_hp' => $new_hp, 'is_dead' => ($new_hp === 0)]);
} catch (Exception $e) {
    $conn->rollback();
}
?>
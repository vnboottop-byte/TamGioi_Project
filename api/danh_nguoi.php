<?php
// File: api/danh_nguoi.php (TÒA ÁN PVP - ĐẠI ĐỒNG BỘ V2)
session_start();
header('Content-Type: application/json');
require_once '../db.php'; 

if (!isset($_SESSION['user'])) exit;

$attacker = $_SESSION['user'];
$victim = isset($_POST['victim']) ? $_POST['victim'] : '';

if ($attacker === $victim) exit; // Không tự sát

$conn->begin_transaction();
try {
    // 🌟 1. LẤY SÁT THƯƠNG TỔNG TỪ DATABASE (Đã được rom.php và thang_cap.php cập nhật sẵn)
    $stmt_att = $conn->prepare("SELECT damage FROM game_characters WHERE username = ?");
    $stmt_att->bind_param("s", $attacker);
    $stmt_att->execute();
    $att_data = $stmt_att->get_result()->fetch_assoc();
    
    // Gây dame trực tiếp luôn!
    $real_damage = (int)$att_data['damage']; 

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
<?php
session_start();
require_once '../db.php'; // Trỏ cho đúng file kết nối SQL của Sếp

$user = $_SESSION['user'] ?? '';
$hp = isset($_POST['hp']) ? (int)$_POST['hp'] : -1;

if ($user && $hp >= 0) {
    // Lưu máu hiện tại vào database
    $stmt = $conn->prepare("UPDATE game_characters SET hp_current = ? WHERE username = ?");
    $stmt->bind_param("is", $hp, $user);
    $stmt->execute();
}
?>
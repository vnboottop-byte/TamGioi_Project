<?php
session_start();
require_once '../db.php';

// Chỉ chạy khi đã đăng nhập
if (!isset($_SESSION['user'])) exit;

$username = $_SESSION['user'];
$x = isset($_POST['x']) ? floatval($_POST['x']) : 0;
$y = isset($_POST['y']) ? floatval($_POST['y']) : 0;
$z = isset($_POST['z']) ? floatval($_POST['z']) : 0;

// 🌟 ĐẬP TỌA ĐỘ VÀO BẢNG GAME_CHARACTERS (Hoặc đổi thành bảng 'users' nếu cột last_pos của Sếp nằm ở đó)
$stmt = $conn->prepare("UPDATE game_characters SET last_pos_x = ?, last_pos_y = ?, last_pos_z = ?, last_update = NOW() WHERE username = ?");
$stmt->bind_param("ddds", $x, $y, $z, $username);
$stmt->execute();
?>
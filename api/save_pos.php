<?php
session_start();
require_once '../db.php';

if (!isset($_SESSION['user'])) exit;

$username = $_SESSION['user'];
$x = isset($_POST['x']) ? floatval($_POST['x']) : 0;
$y = isset($_POST['y']) ? floatval($_POST['y']) : 0;
$z = isset($_POST['z']) ? floatval($_POST['z']) : 0;
// 🌟 NHẬN ZONE_ID
$zone_id = isset($_POST['zone_id']) ? $_POST['zone_id'] : 'TRUNG_CHAU';

$stmt = $conn->prepare("UPDATE game_characters SET last_pos_x = ?, last_pos_y = ?, last_pos_z = ?, zone_id = ?, last_update = NOW() WHERE username = ?");
$stmt->bind_param("dddss", $x, $y, $z, $zone_id, $username);
$stmt->execute();
?>
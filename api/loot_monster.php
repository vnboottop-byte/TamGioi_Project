<?php
session_start(); require_once '../db.php';
if (!isset($_SESSION['user']) || !isset($_POST['monster_level'])) exit;
$user = $_SESSION['user'];
$lvl = intval($_POST['monster_level']);

// Random vàng từ 100 -> 500 x Cấp độ Boss
$gold = rand(100, 500) * $lvl;
$conn->query("UPDATE game_characters SET game_gold = game_gold + $gold WHERE username = '$user'");
echo json_encode(['status' => 'success', 'gold' => $gold]);
?>
<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) { echo json_encode(['allies'=>[]]); exit; }
$username = $_SESSION['user'];

$res = $conn->query("SELECT party_id, guild_id FROM game_characters WHERE username='$username'");
$row = $res->fetch_assoc();
$pid = (int)$row['party_id'];
$gid = (int)$row['guild_id'];

$allies = [];
// Nếu Sếp có ID Tổ đội hoặc ID Bang hội
if ($pid > 0 || $gid > 0) {
    $sql = "SELECT username FROM game_characters WHERE (party_id = $pid AND party_id > 0) OR (guild_id = $gid AND guild_id > 0)";
    $q = $conn->query($sql);
    if ($q) {
        while ($r = $q->fetch_assoc()) {
            if ($r['username'] !== $username) {
                $allies[] = $r['username']; // Đưa tên anh em vào danh sách đen (không được chém)
            }
        }
    }
}

echo json_encode([
    'status' => 'success',
    'party_id' => $pid,
    'guild_id' => $gid,
    'allies' => $allies
]);
?>
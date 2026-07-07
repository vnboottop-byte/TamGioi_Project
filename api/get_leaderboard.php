<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

$type = isset($_GET['type']) ? $_GET['type'] : 'luc_chien';
$data = [];

if ($type === 'luc_chien') {
    // ⚔️ TOP CHIẾN THẦN: Tự động nhân Hệ số (Damage * 8 + HP * 0.8) cực mượt
    $sql = "SELECT char_name, level, (damage * 8 + hp_max * 0.8) AS score 
            FROM game_characters 
            ORDER BY score DESC LIMIT 10";
    $res = $conn->query($sql);
    while ($row = $res->fetch_assoc()) {
        $data[] = ['name' => $row['char_name'], 'level' => $row['level'], 'score' => number_format(round($row['score'])) . ' Pts'];
    }
} 
elseif ($type === 'sat_thu') {
    // ☠️ TOP SÁT THỦ MARINEFORD: Chỉ lấy người có mạng > 0
    $sql = "SELECT char_name, event_kills AS score 
            FROM game_characters 
            WHERE event_kills > 0 
            ORDER BY event_kills DESC LIMIT 10";
    $res = $conn->query($sql);
    while ($row = $res->fetch_assoc()) {
        $data[] = ['name' => $row['char_name'], 'score' => $row['score'] . ' Mạng'];
    }
} 
elseif ($type === 'me_cung') {
    // 🧩 TOP MÊ CUNG: Ai Ải cao hơn lên trước, ai thời gian ít hơn lên trước (Reset hàng tháng)
    $sql = "SELECT gc.char_name, MAX(m.maze_level) as max_lv, MIN(m.time_passed) as best_time 
            FROM maze_records m
            JOIN game_characters gc ON m.username = gc.username
            WHERE MONTH(m.created_at) = MONTH(CURRENT_DATE())
            GROUP BY m.username
            ORDER BY max_lv DESC, best_time ASC LIMIT 10";
    $res = $conn->query($sql);
    while ($row = $res->fetch_assoc()) {
        $data[] = ['name' => $row['char_name'], 'score' => 'Ải ' . $row['max_lv']];
    }
}

echo json_encode(['status' => 'success', 'data' => $data]);
?>
<?php
header('Content-Type: application/json');
require_once '../db.php';

$zone = isset($_GET['zone']) ? $_GET['zone'] : 'TRUNG_CHAU';
$now = time();
$respawn_time = 600; 

// 🌟 LỌC QUÁI THEO MAP
$stmt = $conn->prepare("SELECT * FROM map_monsters WHERE zone_id = ? ORDER BY id DESC");
$stmt->bind_param("s", $zone);
$stmt->execute();
$res = $stmt->get_result();

$bosses = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        if ($row['hp'] <= 0) {
            $time_passed = $now - (int)$row['death_time'];
            if ($time_passed >= $respawn_time) {
                $update_stmt = $conn->prepare("UPDATE map_monsters SET hp = max_hp, death_time = 0 WHERE id = ?");
                $update_stmt->bind_param("i", $row['id']);
                $update_stmt->execute();
                $row['hp'] = $row['max_hp']; $row['death_time'] = 0; $row['respawn_in_seconds'] = 0;
            } else {
                $row['respawn_in_seconds'] = max(0, $respawn_time - $time_passed); 
            }
        } else { $row['respawn_in_seconds'] = 0; }
        $bosses[] = $row;
    }
    echo json_encode(['status' => 'success', 'data' => $bosses]);
} else { echo json_encode(['status' => 'error']); }
?>
<?php
// File: api/get_bosses.php (BẢN V61 - AUTO RESPAWN TỪ SERVER + SẮP XẾP ADMIN)
header('Content-Type: application/json');
require_once '../db.php';

// 🌟 ĐÃ THÊM ORDER BY id DESC: Đưa Boss mới nhất lên đầu danh sách để dễ sửa!
$res = $conn->query("SELECT * FROM map_monsters ORDER BY id DESC");
$bosses = [];
$now = time();
$respawn_time = 600; // 🌟 CHUẨN 10 PHÚT LÀ 600 GIÂY

if ($res) {
    while ($row = $res->fetch_assoc()) {
        if ($row['hp'] <= 0) {
            $time_passed = $now - (int)$row['death_time'];
            
            // 🌟 NẾU ĐÃ QUA 10 PHÚT -> TỰ ĐỘNG HỒI SINH LUÔN TẠI SERVER
            if ($time_passed >= $respawn_time) {
                $update_stmt = $conn->prepare("UPDATE map_monsters SET hp = max_hp, death_time = 0 WHERE id = ?");
                $update_stmt->bind_param("i", $row['id']);
                $update_stmt->execute();
                
                $row['hp'] = $row['max_hp'];
                $row['death_time'] = 0;
                $row['respawn_in_seconds'] = 0;
            } else {
                $row['respawn_in_seconds'] = max(0, $respawn_time - $time_passed); 
            }
        } else {
            $row['respawn_in_seconds'] = 0;
        }
        $bosses[] = $row;
    }
    echo json_encode(['status' => 'success', 'data' => $bosses]);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi SQL!']);
}
?>
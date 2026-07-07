<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập']);
    exit;
}

$username = $conn->real_escape_string($_SESSION['user']);
$today = date('Y-m-d');

// 1. Kiểm tra xem hôm nay ĐÃ TẠO 30 nhiệm vụ chưa?
$check_sql = "SELECT id FROM user_quests WHERE username = '$username' AND quest_date = '$today'";
$res_check = $conn->query($check_sql);

if ($res_check->num_rows == 0) {
    // 🌟 CHƯA CÓ -> TẠO MỚI NGẪU NHIÊN 30 VÒNG
    // 🌟 BẢN VÁ AAA: THÊM LỆNH THIÊU RỤI TẤT CẢ NHIỆM VỤ CỦA NHỮNG NGÀY TRƯỚC ĐÓ ĐỂ CHỐNG NỔ DATABASE
    $conn->query("DELETE FROM user_quests WHERE username = '$username' AND quest_date < '$today'");

    // TẠO MỚI NGẪU NHIÊN 30 VÒNG CHO HÔM NAY
    $bosses = [];
    // Chỉ bốc những Boss không phải hệ TRANG_TRI
    $res_boss = $conn->query("SELECT name FROM map_monsters WHERE class_code != 'TRANG_TRI' GROUP BY name");
    if ($res_boss) {
        while ($row = $res_boss->fetch_assoc()) {
            $bosses[] = $row['name'];
        }
    }
    if (count($bosses) == 0) $bosses = ['Boss Ẩn']; // Fallback an toàn

    $conn->begin_transaction();
    try {
        for ($i = 1; $i <= 30; $i++) {
            // Tỷ lệ: 15% Nhiệm vụ đi Đồ Sát (PK), 85% Nhiệm vụ Săn Boss
            $is_pk = (rand(1, 100) <= 15); 
            
            if ($is_pk) {
                $q_type = 'KILL_PLAYER';
                $t_name = 'Người Chơi Khác';
                $req_amt = rand(1, 5); // Đồ sát 1-5 người
            } else {
                $q_type = 'KILL_BOSS';
                $t_name = $bosses[array_rand($bosses)]; // Bốc đại 1 con Boss
                $req_amt = rand(5, 15); // Săn 5-15 con
            }

            $stmt = $conn->prepare("INSERT INTO user_quests (username, quest_index, quest_type, target_name, required_amount, quest_date) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sissis", $username, $i, $q_type, $t_name, $req_amt, $today);
            $stmt->execute();
        }
        $conn->commit();
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['status' => 'error', 'msg' => 'Lỗi khởi tạo nhiệm vụ!']);
        exit;
    }
}

// 2. LẤY NHIỆM VỤ CỦA VÒNG HIỆN TẠI (Vòng nhỏ nhất chưa được trả thưởng)
$sql_current = "SELECT * FROM user_quests WHERE username = '$username' AND quest_date = '$today' AND status != 'REWARDED' ORDER BY quest_index ASC LIMIT 1";
$res_current = $conn->query($sql_current);

if ($res_current && $res_current->num_rows > 0) {
    $quest = $res_current->fetch_assoc();
    echo json_encode([
        'status' => 'success', 
        'quest' => $quest,
        'completed_all' => false
    ]);
} else {
    // Nếu không còn nhiệm vụ nào chứng tỏ Sếp đã cày xong 30 vòng!
    echo json_encode([
        'status' => 'success', 
        'completed_all' => true
    ]);
}
?>
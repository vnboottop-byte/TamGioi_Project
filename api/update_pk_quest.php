<?php
// FILE: api/update_pk_quest.php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập']);
    exit;
}

$attacker = $_SESSION['user'];
$victim = isset($_POST['victim']) ? $_POST['victim'] : '';

if (empty($victim) || $attacker === $victim) {
    echo json_encode(['status' => 'error', 'msg' => 'Mục tiêu không hợp lệ']);
    exit;
}

$conn->begin_transaction();
try {
    $today_q = date('Y-m-d');
    $stmt_q = $conn->prepare("SELECT * FROM user_quests WHERE username = ? AND quest_date = ? AND status = 'ACTIVE' ORDER BY quest_index ASC LIMIT 1");
    $stmt_q->bind_param("ss", $attacker, $today_q);
    $stmt_q->execute();
    $quest = $stmt_q->get_result()->fetch_assoc();

    if ($quest && $quest['quest_type'] === 'KILL_PLAYER') {
        $quest_id = $quest['id'];
        $new_amount = $quest['current_amount'] + 1;
        
        if ($new_amount >= $quest['required_amount']) {
            // HOÀN THÀNH -> CHỐT ĐƠN VÀ PHÁT THƯỞNG
            $conn->query("UPDATE user_quests SET current_amount = required_amount, status = 'REWARDED' WHERE id = $quest_id");

            $price_col = 'price'; 
            $col_check = $conn->query("SHOW COLUMNS FROM shop_items");
            if ($col_check) { while ($c = $col_check->fetch_assoc()) { if ($c['Field'] === 'price_balance') $price_col = 'price_balance'; } }

            $sql_random = "SELECT id, name FROM shop_items WHERE $price_col BETWEEN 20000 AND 40000 ORDER BY RAND() LIMIT 1";
            $res_random = $conn->query($sql_random);
            $shop_item_id = 0;
            
            if ($res_random && $row_item = $res_random->fetch_assoc()) {
                $shop_item_id = $row_item['id'];
                $item_name = $row_item['name'];
                $content = "Hảo thủ đoạn! Chúc mừng đạo hữu đã hoàn thành Nhiệm vụ PK (Vòng " . $quest['quest_index'] . ")! Hệ thống gửi tặng bạn [ $item_name ] và 5.000 Vàng.";
            } else {
                $content = "Hảo thủ đoạn! Chúc mừng đạo hữu hoàn thành Nhiệm vụ PK (Vòng " . $quest['quest_index'] . ")! Kho đồ hiện trống, gửi đền bù 5.000 Vàng.";
            }

            $title = "🎁 Thưởng Nhiệm Vụ Vòng " . $quest['quest_index'];
            $game_gold_reward = 5000; 
            
            $stmt_mail = $conn->prepare("INSERT INTO user_mailbox (username, title, content, item_id, game_gold) VALUES (?, ?, ?, ?, ?)");
            $stmt_mail->bind_param("sssii", $attacker, $title, $content, $shop_item_id, $game_gold_reward);
            $stmt_mail->execute();
            
            $conn->commit();
            echo json_encode(['status' => 'success', 'msg' => 'Hoàn thành nhiệm vụ PK']);
        } else {
            // CHƯA XONG -> TĂNG TIẾN ĐỘ
            $conn->query("UPDATE user_quests SET current_amount = $new_amount WHERE id = $quest_id");
            $conn->commit();
            echo json_encode(['status' => 'success', 'msg' => 'Đã cập nhật tiến độ']);
        }
    } else {
        $conn->rollback();
        echo json_encode(['status' => 'ignored', 'msg' => 'Không có nhiệm vụ PK đang active']);
    }
} catch (\Throwable $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
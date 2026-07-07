<?php
// File: api/danh_nguoi.php (TÒA ÁN PVP - ĐẠI ĐỒNG BỘ V2)
session_start();
header('Content-Type: application/json');
require_once '../db.php'; 

if (!isset($_SESSION['user'])) exit;

$attacker = $_SESSION['user'];
$victim = isset($_POST['victim']) ? $_POST['victim'] : '';

if ($attacker === $victim) exit; // Không tự sát

$conn->begin_transaction();
try {
    // 🌟 1. LẤY SÁT THƯƠNG TỔNG TỪ DATABASE (Đã được rom.php và thang_cap.php cập nhật sẵn)
    $stmt_att = $conn->prepare("SELECT damage FROM game_characters WHERE username = ?");
    $stmt_att->bind_param("s", $attacker);
    $stmt_att->execute();
    $att_data = $stmt_att->get_result()->fetch_assoc();
    
    // Gây dame trực tiếp luôn!
    $real_damage = (int)$att_data['damage']; 

    // 2. Lấy Máu thật của Nạn nhân
    $stmt_vic = $conn->prepare("SELECT hp_current, hp_max, char_name FROM game_characters WHERE username = ? FOR UPDATE");
    $stmt_vic->bind_param("s", $victim);
    $stmt_vic->execute();
    $vic_data = $stmt_vic->get_result()->fetch_assoc();

    if (!$vic_data || $vic_data['hp_current'] <= 0) {
        $conn->rollback(); echo json_encode(['status' => 'dead']); exit;
    }

    // 3. Phán quyết trừ máu
    $new_hp = max(0, $vic_data['hp_current'] - $real_damage);
    $stmt_update = $conn->prepare("UPDATE game_characters SET hp_current = ? WHERE username = ?");
    $stmt_update->bind_param("is", $new_hp, $victim);



    $stmt_update->execute();
    
    // ==========================================
    // ☠️ SỰ KIỆN LOẠN CHIẾN MARINEFORD (CHỦ NHẬT 18H-21H)
    // ==========================================
    if ($new_hp === 0) { // CHỈ TÍNH KHI ĐÁNH CHẾT (MÁU = 0)
       


       // ==========================================
    // 📜 CẢM BIẾN NHIỆM VỤ HÀNG NGÀY (ĐỒ SÁT PK)
    // ==========================================
    $today_q = date('Y-m-d');
    $stmt_q = $conn->prepare("SELECT * FROM user_quests WHERE username = ? AND quest_date = ? AND status = 'ACTIVE' ORDER BY quest_index ASC LIMIT 1");
    $stmt_q->bind_param("ss", $attacker, $today_q);
    $stmt_q->execute();
    $quest = $stmt_q->get_result()->fetch_assoc();

    // Kiểm tra xem Nhiệm vụ có phải là GIẾT NGƯỜI CHƠI KHÁC không?
    if ($quest && $quest['quest_type'] === 'KILL_PLAYER') {
        $quest_id = $quest['id'];
        $new_amount = $quest['current_amount'] + 1;
        
        if ($new_amount >= $quest['required_amount']) {
            // HOÀN THÀNH -> PHÁT THƯỞNG
            $conn->query("UPDATE user_quests SET current_amount = required_amount, status = 'REWARDED' WHERE id = $quest_id");

            $price_col = 'price'; 
            $col_check = $conn->query("SHOW COLUMNS FROM shop_items");
            if ($col_check) { while ($c = $col_check->fetch_assoc()) { if ($c['Field'] === 'price_balance') $price_col = 'price_balance'; } }

            // Bốc quà từ 20k đến 40k
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
            $game_gold_reward = 5000; // 🌟 5K VÀNG CÀY CUỐC
            
            $stmt_mail = $conn->prepare("INSERT INTO user_mailbox (username, title, content, item_id, game_gold) VALUES (?, ?, ?, ?, ?)");
            $stmt_mail->bind_param("sssii", $attacker, $title, $content, $shop_item_id, $game_gold_reward);
            $stmt_mail->execute();
        } else {
            // CHƯA XONG -> CHỈ TĂNG TIẾN ĐỘ
            $conn->query("UPDATE user_quests SET current_amount = $new_amount WHERE id = $quest_id");
        }
    }
    // ==========================================




        $current_day = (int)date('w'); // 0 = Chủ Nhật
        $current_hour = (int)date('H'); // Lấy giờ hiện tại (0-23)

        // Kiểm tra xem có đúng khung giờ Vàng không?
        if ($current_day === 0 && $current_hour >= 18 && $current_hour <= 20) {
            
            // Lấy thông tin Khu vực và Thành tích của Sát thủ
            $stmt_zone = $conn->prepare("SELECT zone_id, event_kills, last_event_date FROM game_characters WHERE username = ?");
            $stmt_zone->bind_param("s", $attacker);
            $stmt_zone->execute();
            $att_info = $stmt_zone->get_result()->fetch_assoc();
            
            // Nếu kẻ sát nhân đúng là đang ở MARINE_FORD
            if ($att_info && $att_info['zone_id'] === 'MARINE_FORD') {
                $today = date('Y-m-d');
                
                if ($att_info['last_event_date'] !== $today) {
                    // Nếu mạng cuối cùng không phải hôm nay -> Tự động Reset về 1 mạng cho tuần mới
                    $stmt_ev = $conn->prepare("UPDATE game_characters SET event_kills = 1, last_event_date = ? WHERE username = ?");
                    $stmt_ev->bind_param("ss", $today, $attacker);
                    $stmt_ev->execute();
                } else {
                    // Nếu vẫn là hôm nay -> Cộng dồn mạng
                    $stmt_ev = $conn->prepare("UPDATE game_characters SET event_kills = event_kills + 1 WHERE username = ?");
                    $stmt_ev->bind_param("s", $attacker);
                    $stmt_ev->execute();
                }
            }
        }
    }
    // ==========================================

    $conn->commit();
    


    echo json_encode(['status' => 'success', 'new_hp' => $new_hp, 'is_dead' => ($new_hp === 0)]);
} catch (Exception $e) {
    $conn->rollback();
}
?>
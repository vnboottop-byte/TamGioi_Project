<?php
// File: api/danh_nguoi.php (TÒA ÁN PVP - BẢN BỌC THÉP CHỐNG LỖI V3)
session_start();
header('Content-Type: application/json');
require_once '../db.php'; 

if (!isset($_SESSION['user'])) exit;

$attacker = $_SESSION['user'];
$victim = isset($_POST['victim']) ? $_POST['victim'] : '';

if ($attacker === $victim) exit; // Không tự sát

// Giải phóng Session sớm để game không bị kẹt khi gọi nhiều API cùng lúc
session_write_close();

$conn->begin_transaction();
try {
    // 1. LẤY SÁT THƯƠNG TỔNG
    $stmt_att = $conn->prepare("SELECT damage FROM game_characters WHERE username = ?");
    $stmt_att->bind_param("s", $attacker);
    $stmt_att->execute();
    $att_data = $stmt_att->get_result()->fetch_assoc();
    $real_damage = (int)$att_data['damage']; 

    // 2. LẤY MÁU NẠN NHÂN VÀ KHÓA DÒNG
    $stmt_vic = $conn->prepare("SELECT hp_current, hp_max, char_name FROM game_characters WHERE username = ? FOR UPDATE");
    $stmt_vic->bind_param("s", $victim);
    $stmt_vic->execute();
    $vic_data = $stmt_vic->get_result()->fetch_assoc();

    if (!$vic_data || $vic_data['hp_current'] <= 0) {
        $conn->rollback(); echo json_encode(['status' => 'dead']); exit;
    }

    // 3. TRỪ MÁU
    $new_hp = max(0, $vic_data['hp_current'] - $real_damage);
    $stmt_update = $conn->prepare("UPDATE game_characters SET hp_current = ? WHERE username = ?");
    $stmt_update->bind_param("is", $new_hp, $victim);
    $stmt_update->execute();
    
    // ==========================================
    // ☠️ KHI NẠN NHÂN TỬ TRẬN (MÁU = 0)
    // ==========================================
    if ($new_hp === 0) {
        
        // --- A. SỰ KIỆN LOẠN CHIẾN MARINEFORD (BỌC THÉP) ---
        try {
            $current_day = (int)date('w'); // 0 = Chủ Nhật
            $current_hour = (int)date('H');
            if ($current_day === 0 && $current_hour >= 18 && $current_hour <= 20) {
                // Kiểm tra xem các cột sự kiện có tồn tại không trước khi gọi
                $stmt_zone = $conn->prepare("SELECT zone_id, event_kills, last_event_date FROM game_characters WHERE username = ?");
                if ($stmt_zone) {
                    $stmt_zone->bind_param("s", $attacker);
                    $stmt_zone->execute();
                    $att_info = $stmt_zone->get_result()->fetch_assoc();
                    
                    if ($att_info && isset($att_info['zone_id']) && $att_info['zone_id'] === 'MARINE_FORD') {
                        $today = date('Y-m-d');
                        if ($att_info['last_event_date'] !== $today) {
                            $conn->query("UPDATE game_characters SET event_kills = 1, last_event_date = '$today' WHERE username = '$attacker'");
                        } else {
                            $conn->query("UPDATE game_characters SET event_kills = event_kills + 1 WHERE username = '$attacker'");
                        }
                    }
                }
            }
        } catch (\Throwable $th) { /* Im lặng bỏ qua nếu DB chưa cấu hình Sự kiện */ }

        // --- B. CẢM BIẾN NHIỆM VỤ HÀNG NGÀY (BỌC THÉP) ---
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
                    

                    // ==========================================
                    // 🌟 THÊM MỚI: TÍNH EXP ĐỘNG (1 Mạng = 1000 EXP)
                    // ==========================================
                    $game_exp_reward = intval($quest['required_amount']) * 1000;

                    if ($res_random && $row_item = $res_random->fetch_assoc()) {
                        $shop_item_id = $row_item['id'];
                        $item_name = $row_item['name'];
                        $content = "Hảo thủ đoạn! Chúc mừng đạo hữu đã hoàn thành Nhiệm vụ PK (Vòng " . $quest['quest_index'] . ")! Hệ thống gửi tặng bạn [ $item_name ], 5.000 Vàng và " . number_format($game_exp_reward) . " EXP.";
                    } else {
                        $content = "Hảo thủ đoạn! Chúc mừng đạo hữu hoàn thành Nhiệm vụ PK (Vòng " . $quest['quest_index'] . ")! Kho đồ hiện trống, gửi đền bù 5.000 Vàng và " . number_format($game_exp_reward) . " EXP.";
                    }

                    $title = "🎁 Thưởng Nhiệm Vụ Vòng " . $quest['quest_index'];
                    $game_gold_reward = 5000; 
                    
                    // Gửi vào bưu điện (Đã sửa câu SQL để thêm cột game_exp)
                    $stmt_mail = $conn->prepare("INSERT INTO user_mailbox (username, title, content, item_id, game_gold, game_exp) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt_mail->bind_param("sssiii", $attacker, $title, $content, $shop_item_id, $game_gold_reward, $game_exp_reward);
                    $stmt_mail->execute();


                } else {
                    // CHƯA XONG -> TĂNG TIẾN ĐỘ
                    $conn->query("UPDATE user_quests SET current_amount = $new_amount WHERE id = $quest_id");
                }
            }
        } catch (\Throwable $th) { /* Lỗi nhiệm vụ cũng không làm gián đoạn việc giết người */ }
    }
    // ==========================================

    $conn->commit();
    echo json_encode(['status' => 'success', 'new_hp' => $new_hp, 'is_dead' => ($new_hp === 0)]);
} catch (\Throwable $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
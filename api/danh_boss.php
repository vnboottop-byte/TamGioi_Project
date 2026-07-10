<?php
// FILE: api/danh_boss.php (BẢN V2.0 - ATOMIC DAMAGE + TÍCH HỢP NHIỆM VỤ HÀNG NGÀY)
session_start();
header('Content-Type: application/json');
require_once '../db.php'; 

if (!isset($_SESSION['user'])) { echo json_encode(['status' => 'error']); exit; }

$username = $_SESSION['user']; // Cần dùng cho Nhiệm vụ
session_write_close();

$boss_id = isset($_POST['boss_id']) ? intval($_POST['boss_id']) : 0;
$damage = isset($_POST['damage']) ? floatval($_POST['damage']) : 0;

if ($boss_id <= 0 || $damage <= 0) { echo json_encode(['status' => 'error']); exit; }

$conn->begin_transaction();
try {
    // 🌟 BẢN VÁ: Lấy thêm cột 'name' để soi Cảm biến Nhiệm Vụ
    $stmt = $conn->prepare("SELECT hp, max_hp, name FROM map_monsters WHERE id = ? FOR UPDATE");
    $stmt->bind_param("i", $boss_id);
    $stmt->execute();
    $boss = $stmt->get_result()->fetch_assoc();

    if (!$boss || $boss['hp'] <= 0) {
        $conn->rollback(); 
        echo json_encode(['status' => 'dead', 'hp' => 0]); exit;
    }

    $new_hp = max(0, $boss['hp'] - $damage);
    $death_time = ($new_hp == 0) ? time() : 0;

    $stmt_up = $conn->prepare("UPDATE map_monsters SET hp = ?, death_time = ? WHERE id = ?");
    $stmt_up->bind_param("iii", $new_hp, $death_time, $boss_id);
    $stmt_up->execute();

    // ==========================================
    // 📜 CẢM BIẾN NHIỆM VỤ HÀNG NGÀY (SĂN BOSS)
    // ==========================================
    if ($new_hp == 0) { // CHỈ TÍNH ĐIỂM KHI BOSS CHẾT (MÁU = 0)
        $today = date('Y-m-d');
        // Tìm nhiệm vụ đang làm hiện tại
        $stmt_q = $conn->prepare("SELECT * FROM user_quests WHERE username = ? AND quest_date = ? AND status = 'ACTIVE' ORDER BY quest_index ASC LIMIT 1");
        $stmt_q->bind_param("ss", $username, $today);
        $stmt_q->execute();
        $quest = $stmt_q->get_result()->fetch_assoc();

        // Kiểm tra xem Nhiệm vụ có phải là SĂN BOSS và trùng TÊN BOSS không?
        if ($quest && $quest['quest_type'] === 'KILL_BOSS' && $quest['target_name'] === $boss['name']) {
            $quest_id = $quest['id'];
            $new_amount = $quest['current_amount'] + 1;
            
            if ($new_amount >= $quest['required_amount']) {
                // HOÀN THÀNH -> CHỐT ĐƠN VÀ PHÁT THƯỞNG
                $conn->query("UPDATE user_quests SET current_amount = required_amount, status = 'REWARDED' WHERE id = $quest_id");

                // Lọc giá tiền chuẩn của Shop
                $price_col = 'price'; 
                $col_check = $conn->query("SHOW COLUMNS FROM shop_items");
                if ($col_check) { while ($c = $col_check->fetch_assoc()) { if ($c['Field'] === 'price_balance') $price_col = 'price_balance'; } }

                // Bốc thăm 1 món từ 20k đến 40k
                $sql_random = "SELECT id, name FROM shop_items WHERE $price_col BETWEEN 20000 AND 40000 ORDER BY RAND() LIMIT 1";
                $res_random = $conn->query($sql_random);
                $shop_item_id = 0;
                


                // ==========================================
                    // 🌟 THÊM MỚI: TẶNG 2000 EXP CỐ ĐỊNH
                    // ==========================================
                    $game_exp_reward = 2000; 

                    if ($res_random && $row_item = $res_random->fetch_assoc()) {
                        $shop_item_id = $row_item['id'];
                        $item_name = $row_item['name'];
                        $content = "Chúc mừng đạo hữu đã hoàn thành Nhiệm vụ Săn Boss (Vòng " . $quest['quest_index'] . ")! Hệ thống gửi tặng bạn [ $item_name ], 5.000 Vàng và " . number_format($game_exp_reward) . " EXP.";
                    } else {
                        $content = "Chúc mừng đạo hữu đã hoàn thành Nhiệm vụ Săn Boss (Vòng " . $quest['quest_index'] . ")! Kho đồ hiện hết vật phẩm phù hợp, hệ thống gửi đền bù 5.000 Vàng và " . number_format($game_exp_reward) . " EXP.";
                    }

                    $title = "🎁 Thưởng Nhiệm Vụ Ngày " . $quest['quest_index'];
                    $game_gold_reward = 5000; // 🌟 CHUẨN VÀNG TRONG GAME (game_gold)
                    
                    // Gửi vào bưu điện (Đã sửa câu SQL để thêm cột game_exp)
                    $stmt_mail = $conn->prepare("INSERT INTO user_mailbox (username, title, content, item_id, game_gold, game_exp) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt_mail->bind_param("sssiii", $username, $title, $content, $shop_item_id, $game_gold_reward, $game_exp_reward);
                    $stmt_mail->execute();


            } else {
                // CHƯA XONG -> CHỈ TĂNG ĐIỂM TIẾN ĐỘ
                $conn->query("UPDATE user_quests SET current_amount = $new_amount WHERE id = $quest_id");
            }
        }
    }
    // ==========================================

    $conn->commit();
    echo json_encode(['status' => 'success', 'hp' => $new_hp]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>
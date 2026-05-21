<?php
// File: api/thang_cap.php (ĐẠI ĐỒNG BỘ CHỈ SỐ V2)
ob_start(); 
session_start();
require_once '../db.php'; 

error_reporting(0); ini_set('display_errors', 0);

if (!isset($_SESSION['user']) || !isset($_POST['exp_nhan_vao'])) {
    ob_clean(); echo json_encode(['status' => 'error', 'msg' => 'Thiếu dữ liệu']); exit;
}

$username = $_SESSION['user'];
$exp_goc = (int)$_POST['exp_nhan_vao'];
$target_level = isset($_POST['target_level']) ? (int)$_POST['target_level'] : 1; 

// 🌟 BẢN VÁ: Mở khóa Session ngay lập tức để chống đứng Server!
session_write_close();

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("SELECT level, exp FROM game_characters WHERE username = ? FOR UPDATE");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($row = $res->fetch_assoc()) {
        $level = (int)$row['level'];
        
        $chenh_lech = $level - $target_level;
        $ty_le_nhan = 1.0; 
        if ($chenh_lech > 10) $ty_le_nhan = 0.1; elseif ($chenh_lech > 5) $ty_le_nhan = 0.5; 

        $exp_thuc_nhan = floor($exp_goc * $ty_le_nhan);
        if ($exp_thuc_nhan < 1) $exp_thuc_nhan = 1; 

        $exp = (int)$row['exp'] + $exp_thuc_nhan; 
        $exp_can_thiet = pow($level, 2) * 1000; 
        $da_thang_cap = false;

        while ($exp >= $exp_can_thiet) {
            $exp -= $exp_can_thiet; 
            $level++;
            $da_thang_cap = true;
            $exp_can_thiet = pow($level, 2) * 1000; 
        }




        // 🌟 NẾU LÊN CẤP -> TÍNH LẠI TOÀN BỘ MÁU VÀ DAME CÓ ĐÍNH KÈM CẤP ĐỘ ĐẬP ĐỒ (+15)
        $hp_max_moi = 1000; $damage_moi = 100;
        if ($da_thang_cap) {
            $stmt_wp = $conn->prepare("SELECT s.bonus_hp, s.bonus_damage, i.upgrade_level FROM user_inventory i JOIN shop_items s ON i.item_id = s.id WHERE i.username = ? AND i.is_equipped = 1");
            $stmt_wp->bind_param("s", $username); $stmt_wp->execute();
            $res_wp = $stmt_wp->get_result();
            
            $buff_hp = 0; $buff_dmg = 0;
            while($wp = $res_wp->fetch_assoc()) {
                $heSoCong = 1.0 + ((int)$wp['upgrade_level'] * 0.05);
                $buff_hp += (int)$wp['bonus_hp'] * $heSoCong;
                $buff_dmg += (int)$wp['bonus_damage'] * $heSoCong;
            }
            
            // TỔNG LỰC = GỐC (Cấp) + BUFF ĐÃ NHÂN CẤP ĐỘ (+15)
            $hp_max_moi = 1000 + (($level - 1) * 30) + $buff_hp;
            $damage_moi = 100 + (($level - 1) * 3) + $buff_dmg;

            $update = $conn->prepare("UPDATE game_characters SET level = ?, exp = ?, hp_max = ?, damage = ?, hp_current = ? WHERE username = ?");
            $update->bind_param("iiiiss", $level, $exp, $hp_max_moi, $damage_moi, $hp_max_moi, $username); 
            $update->execute();
        } else {
            // Không lên cấp thì chỉ lưu EXP
            $update = $conn->prepare("UPDATE game_characters SET exp = ? WHERE username = ?");
            $update->bind_param("is", $exp, $username); 
            $update->execute();
        }

        $conn->commit(); 

        ob_clean(); 
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success', 'thang_cap' => $da_thang_cap, 'level' => $level, 'exp' => $exp, 'exp_can_thiet' => $exp_can_thiet,
            'hp_max' => $hp_max_moi, 'damage' => $damage_moi, 'exp_thuc_nhan' => $exp_thuc_nhan 
        ]);
    } else { $conn->rollback(); ob_clean(); echo json_encode(['status' => 'error']); }
} catch (Exception $e) { $conn->rollback(); ob_clean(); echo json_encode(['status' => 'error']); }
?>
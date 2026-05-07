<?php
// 📦 MODULE: XỬ LÝ THĂNG CẤP (BẢN VÁ LỖI KẸT XE RACE CONDITION)
ob_start(); 
session_start();
require_once '../db.php'; 

error_reporting(0);
ini_set('display_errors', 0);

if (!isset($_SESSION['user']) || !isset($_POST['exp_nhan_vao'])) {
    ob_clean();
    echo json_encode(['status' => 'error', 'msg' => 'Thiếu dữ liệu']); exit;
}

$username = $_SESSION['user'];
$exp_goc = (int)$_POST['exp_nhan_vao'];
$target_level = isset($_POST['target_level']) ? (int)$_POST['target_level'] : 1; 

// 🌟 BÍ THUẬT XẾP HÀNG: Bắt buộc các yêu cầu cộng EXP phải nối đuôi nhau!
$conn->begin_transaction();

try {
    // 🌟 LỆNH "FOR UPDATE": Khóa dòng dữ liệu của Sếp lại. 
    // Nếu có 5 con Boss chết cùng lúc, 5 lệnh sẽ chạy lần lượt từng cái một, không bị ghi đè!
    $stmt = $conn->prepare("SELECT level, exp, hp_max, damage FROM game_characters WHERE username = ? FOR UPDATE");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($row = $res->fetch_assoc()) {
        $level = (int)$row['level'];
        $hp_max = (int)$row['hp_max'];
        $damage = (int)$row['damage'];

        $chenh_lech = $level - $target_level;
        $ty_le_nhan = 1.0; 
        if ($chenh_lech > 10) $ty_le_nhan = 0.1; 
        elseif ($chenh_lech > 5) $ty_le_nhan = 0.5; 

        $exp_thuc_nhan = floor($exp_goc * $ty_le_nhan);
        if ($exp_thuc_nhan < 1) $exp_thuc_nhan = 1; 

        // 🌟 Cộng dồn an toàn tuyệt đối
        $exp = (int)$row['exp'] + $exp_thuc_nhan; 
        $exp_can_thiet = pow($level, 2) * 1000; 
        $da_thang_cap = false;

        while ($exp >= $exp_can_thiet) {
            $exp -= $exp_can_thiet; 
            $level++;
            $hp_max += 30;  
            $damage += 3;   
            $da_thang_cap = true;
            $exp_can_thiet = pow($level, 2) * 1000; 
        }

        $update = $conn->prepare("UPDATE game_characters SET level = ?, exp = ?, hp_max = ?, damage = ?, hp_current = ? WHERE username = ?");
        $update->bind_param("iiiiis", $level, $exp, $hp_max, $damage, $hp_max, $username); 
        $update->execute();

        // 🌟 XỬ LÝ XONG MỚI MỞ KHÓA CHO ĐỨA TIẾP THEO
        $conn->commit(); 

        ob_clean(); 
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'thang_cap' => $da_thang_cap,
            'level' => $level,
            'exp' => $exp,
            'exp_can_thiet' => $exp_can_thiet,
            'hp_max' => $hp_max,
            'damage' => $damage,
            'exp_thuc_nhan' => $exp_thuc_nhan 
        ]);
    } else {
        $conn->rollback();
        ob_clean();
        echo json_encode(['status' => 'error']);
    }
} catch (Exception $e) {
    // Nếu có lỗi mạng thì hủy bỏ giao dịch, không làm hỏng dữ liệu
    $conn->rollback();
    ob_clean();
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi DB']);
}
?>
<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../db.php'; // Sếp nhớ trỏ đúng file kết nối SQL của Sếp

$user = trim($_POST['username'] ?? '');
$pass = trim($_POST['password'] ?? '');
$char_name = trim($_POST['char_name'] ?? '');
$class_id = intval($_POST['class_id'] ?? 0);

if (!$user || !$pass || !$char_name || !$class_id) {
    die(json_encode(["status" => "error", "message" => "Vui lòng điền đầy đủ thông tin!"]));
}

try {
    // 1. KIỂM TRA TÀI KHOẢN ĐÃ TỒN TẠI CHƯA
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($row = $res->fetch_assoc()) {
        // --- KỊCH BẢN 1: TÀI KHOẢN ĐÃ TỒN TẠI ---
        if (password_verify($pass, $row['password'])) {
            
            // Đăng nhập đúng pass. Kiểm tra xem nó có nhân vật chưa.
            $stmtChar = $conn->prepare("SELECT username FROM game_characters WHERE username = ?");
            $stmtChar->bind_param("s", $user);
            $stmtChar->execute();
            if ($stmtChar->get_result()->num_rows === 0) {
                // Có nick nhưng chưa có nhân vật -> Tạo nhân vật cho nó
                $stmtClass = $conn->prepare("SELECT * FROM game_classes WHERE id = ?");
                $stmtClass->bind_param("i", $class_id);
                $stmtClass->execute();
                $classData = $stmtClass->get_result()->fetch_assoc();
                
                if ($classData) {
                    $stmtInsChar = $conn->prepare("INSERT INTO game_characters (username, char_name, class_id, hp_max, hp_current, mana_current, damage, current_model_url, current_weapon_url, current_mount_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '')");
                    $stmtInsChar->bind_param("ssiiiiiss", $user, $char_name, $class_id, $classData['base_hp'], $classData['base_hp'], $classData['base_mana'], $classData['base_damage'], $classData['default_model'], $classData['default_weapon']);
                    $stmtInsChar->execute();
                }
            }
            
            // XONG -> LƯU SESSION
            $_SESSION['user'] = $user;
            echo json_encode(["status" => "success", "message" => "Đăng nhập thành công!"]);
            exit;
            
        } else {
            die(json_encode(["status" => "error", "message" => "Tài khoản đã tồn tại nhưng sai Mật Khẩu!"]));
        }
    } else {
        // --- KỊCH BẢN 2: TÀI KHOẢN CHƯA CÓ -> TẠO MỚI (ĐĂNG KÝ) ---
        
        $conn->begin_transaction();
        
        // A. Tạo tài khoản trong users
        $hashPass = password_hash($pass, PASSWORD_BCRYPT);
        $stmtUser = $conn->prepare("INSERT INTO users (username, password, created_at, role) VALUES (?, ?, NOW(), 'user')");
        $stmtUser->bind_param("ss", $user, $hashPass);
        $stmtUser->execute();

        // B. Lấy chỉ số gốc của Phái
        $stmtClass = $conn->prepare("SELECT * FROM game_classes WHERE id = ?");
        $stmtClass->bind_param("i", $class_id);
        $stmtClass->execute();
        $classData = $stmtClass->get_result()->fetch_assoc();

        if (!$classData) {
            $conn->rollback();
            die(json_encode(["status" => "error", "message" => "Hệ phái không hợp lệ!"]));
        }

        // C. Tạo nhân vật trong game_characters
        $stmtChar = $conn->prepare("INSERT INTO game_characters (username, char_name, class_id, hp_max, hp_current, mana_current, damage, current_model_url, current_weapon_url, current_mount_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '')");
        $stmtChar->bind_param("ssiiiiiss", $user, $char_name, $class_id, $classData['base_hp'], $classData['base_hp'], $classData['base_mana'], $classData['base_damage'], $classData['default_model'], $classData['default_weapon']);
        $stmtChar->execute();

        $conn->commit();

        // D. LƯU SESSION VÀ VÀO GAME
        $_SESSION['user'] = $user;
        echo json_encode(["status" => "success", "message" => "Tạo nhân vật thành công!"]);
    }
} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    echo json_encode(["status" => "error", "message" => "Lỗi máy chủ: " . $e->getMessage()]);
}
?>
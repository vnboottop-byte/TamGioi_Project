<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../db.php'; // Đổi lại đúng file db.php của Sếp

$action = $_POST['action'] ?? '';
$user = trim($_POST['username'] ?? '');
$pass = trim($_POST['password'] ?? '');

if (!$user || !$pass) die(json_encode(["status" => "error", "message" => "Thiếu Tài khoản hoặc Mật khẩu!"]));

try {
    // ==========================================
    // 1. CHỨC NĂNG ĐĂNG NHẬP
    // ==========================================
    if ($action === 'login') {
        $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
        $stmt->bind_param("s", $user); $stmt->execute();
        $res = $stmt->get_result();

        if ($row = $res->fetch_assoc()) {
            if (password_verify($pass, $row['password'])) {
                // Kiểm tra xem nó có nhân vật chưa (Tránh lỗi tài khoản ảo)
             
                $stmtChar = $conn->prepare("SELECT username FROM game_characters WHERE username = ?");
              
                $stmtChar->bind_param("s", $user); $stmtChar->execute();
                if ($stmtChar->get_result()->num_rows === 0) {
                    die(json_encode(["status" => "error", "message" => "Tài khoản chưa có nhân vật! Vui lòng tạo tài khoản mới!"]));
                }
                
                $_SESSION['user'] = $user;
                
                // 🌟 PHÁT THẺ BÀI KHI ĐĂNG NHẬP
                $token = bin2hex(random_bytes(16)); 
                $_SESSION['session_token'] = $token; 
                $stmt_token = $conn->prepare("UPDATE users SET session_token = ? WHERE username = ?");
                $stmt_token->bind_param("ss", $token, $user);
                $stmt_token->execute();

                die(json_encode(["status" => "success", "message" => "Đăng nhập thành công!"]));
            } else {
                die(json_encode(["status" => "error", "message" => "Sai mật khẩu!"]));
            }
        } else {
            die(json_encode(["status" => "error", "message" => "Tài khoản không tồn tại!"]));
        }
    } 
    // ==========================================
    // 2. CHỨC NĂNG ĐĂNG KÝ (TẠO USER + TẠO CHAR)
    // ==========================================
    else if ($action === 'register') {
        $char_name = trim($_POST['char_name'] ?? '');
        $class_id = intval($_POST['class_id'] ?? 0);

        if (!$char_name || !$class_id) die(json_encode(["status" => "error", "message" => "Thiếu Tên nhân vật hoặc Hệ Phái!"]));

        // Check trùng lặp username
        $stmtCheck = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmtCheck->bind_param("s", $user); $stmtCheck->execute();
        if ($stmtCheck->get_result()->num_rows > 0) {
            die(json_encode(["status" => "error", "message" => "Tên tài khoản này đã có người sử dụng!"]));
        }

        $conn->begin_transaction();
        
        // A. Lưu vào Users
        $hashPass = password_hash($pass, PASSWORD_BCRYPT);
        $stmtUser = $conn->prepare("INSERT INTO users (username, password, created_at, role) VALUES (?, ?, NOW(), 'user')");
        $stmtUser->bind_param("ss", $user, $hashPass);
        $stmtUser->execute();

        // B. Lấy chỉ số Phái
        $stmtClass = $conn->prepare("SELECT * FROM game_classes WHERE id = ?");
        $stmtClass->bind_param("i", $class_id); $stmtClass->execute();
        $classData = $stmtClass->get_result()->fetch_assoc();

        if (!$classData) { $conn->rollback(); die(json_encode(["status" => "error", "message" => "Hệ phái không hợp lệ!"])); }

        // C. Lưu vào Game_characters
        // C. Lưu vào Game_characters (ÉP THẲNG TỌA ĐỘ TÂN THỦ VÀO NAM DU)
        $stmtChar = $conn->prepare("INSERT INTO game_characters (username, char_name, class_id, hp_max, hp_current, mana_current, damage, current_model_url, current_weapon_url, current_mount_url, zone_id, last_pos_x, last_pos_y, last_pos_z) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', 'ENIES_LOBBY', 0, 90, -49)");
        $stmtChar->bind_param("ssiiiiiss", $user, $char_name, $class_id, $classData['base_hp'], $classData['base_hp'], $classData['base_mana'], $classData['base_damage'], $classData['default_model'], $classData['default_weapon']);
        $stmtChar->execute();

        $conn->commit();
        $_SESSION['user'] = $user;

        // 🌟 PHÁT THẺ BÀI CHO TÂN THỦ VỪA LẬP NICK XONG
        $token = bin2hex(random_bytes(16)); 
        $_SESSION['session_token'] = $token; 
        $stmt_token = $conn->prepare("UPDATE users SET session_token = ? WHERE username = ?");
        $stmt_token->bind_param("ss", $token, $user);
        $stmt_token->execute();

        die(json_encode(["status" => "success", "message" => "Lập phái thành công!"]));
    }
} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    die(json_encode(["status" => "error", "message" => "Lỗi máy chủ: " . $e->getMessage()]));
}
?>
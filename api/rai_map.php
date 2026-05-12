<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

// Chỉ có Admin mới được rải Map
if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'Admin') {
    echo json_encode(['status' => 'error', 'msg' => 'Chỉ Admin mới có quyền Sáng Thế!']);
    exit;
}

if (!isset($_FILES['map_file'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Sếp chưa chọn file Map .glb kìa!']);
    exit;
}

$x = isset($_POST['x']) ? floatval($_POST['x']) : 0;
$y = isset($_POST['y']) ? floatval($_POST['y']) : 0;
$z = isset($_POST['z']) ? floatval($_POST['z']) : 0;
$scale = isset($_POST['scale']) ? floatval($_POST['scale']) : 1;
$rot_y = isset($_POST['rot_y']) ? floatval($_POST['rot_y']) : 0;

// 🌟 NHẬN ZONE VÀ GRAVITY
$zone_id = isset($_POST['zone_id']) ? $_POST['zone_id'] : 'TRUNG_CHAU';
$gravity_type = isset($_POST['gravity_type']) ? $_POST['gravity_type'] : 'CAU';

// Tạo thư mục MAP riêng biệt
$upload_dir = '../uploads/maps/';
if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

$file_name = time() . '_' . basename($_FILES['map_file']['name']);
$target_file = $upload_dir . $file_name;
$db_url = 'uploads/maps/' . $file_name; // Đường dẫn lưu vào SQL

if (move_uploaded_file($_FILES['map_file']['tmp_name'], $target_file)) {
    // 🌟 THÊM CỘT gravity_type VÀO LỆNH SQL
    $stmt = $conn->prepare("INSERT INTO map_chunks (name, model_url, pos_x, pos_y, pos_z, rot_y, scale, zone_id, gravity_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $name = "Map_" . time();
    
    // ssdddddss = 2 string, 5 double, 2 string cuối
    $stmt->bind_param("ssdddddss", $name, $db_url, $x, $y, $z, $rot_y, $scale, $zone_id, $gravity_type);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'msg' => '🌍 Đã rải Map thành công!', 'url' => $db_url]);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Lỗi lưu SQL: ' . $conn->error]);
    }
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi lúc upload file!']);
}
?>
<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'Admin') {
    echo json_encode(['status' => 'error', 'msg' => 'Chỉ Admin mới có quyền Sáng Thế!']);
    exit;
}

$x = isset($_POST['x']) ? floatval($_POST['x']) : 0;
$y = isset($_POST['y']) ? floatval($_POST['y']) : 0;
$z = isset($_POST['z']) ? floatval($_POST['z']) : 0;
$scale = isset($_POST['scale']) ? floatval($_POST['scale']) : 1;
$rot_y = isset($_POST['rot_y']) ? floatval($_POST['rot_y']) : 0;
$zone_id = isset($_POST['zone_id']) ? $_POST['zone_id'] : 'TRUNG_CHAU';
$gravity_type = isset($_POST['gravity_type']) ? $_POST['gravity_type'] : 'CAU';

$db_url = "";

// 🌟 THUẬT TOÁN NHÂN BẢN HOẶC TẠO MỚI
if (isset($_POST['model_url']) && !empty($_POST['model_url'])) {
    // Nếu là lệnh NHÂN BẢN -> Lấy thẳng link cũ xài lại, khỏi upload!
    $db_url = $_POST['model_url']; 
} else if (isset($_FILES['map_file'])) {
    // Nếu là lệnh RẢI MỚI -> Upload file vào máy chủ
    $upload_dir = '../uploads/maps/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

    $file_name = time() . '_' . basename($_FILES['map_file']['name']);
    $target_file = $upload_dir . $file_name;
    $db_url = 'uploads/maps/' . $file_name;

    if (!move_uploaded_file($_FILES['map_file']['tmp_name'], $target_file)) {
        echo json_encode(['status' => 'error', 'msg' => 'Lỗi lúc upload file!']); exit;
    }
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Sếp chưa chọn file Map hoặc link model!']); exit;
}

$stmt = $conn->prepare("INSERT INTO map_chunks (name, model_url, pos_x, pos_y, pos_z, rot_y, scale, zone_id, gravity_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$name = "Map_" . time();
$stmt->bind_param("ssdddddss", $name, $db_url, $x, $y, $z, $rot_y, $scale, $zone_id, $gravity_type);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'msg' => '🌍 Đã rải/nhân bản Map thành công!', 'url' => $db_url]);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi lưu SQL: ' . $conn->error]);
}
?>
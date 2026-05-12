<?php
// 📦 MODULE: ĐẺ BOSS TỰ ĐỘNG CÂN BẰNG THEO CẤP BẬC (BẢN VÁ LỖI CHỐNG SẬP SERVER 500)
require_once '../db.php';
header('Content-Type: application/json');

// Bật chế độ bắt lỗi của MySQLi để không bị sập Server (Lỗi 500)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $name = $_POST['name'] ?? 'Boss Ẩn Danh';
        $model = $_POST['model'] ?? 'uploads/anims/mimi_3d.glb';
        $x = floatval($_POST['x'] ?? 0);
        $y = floatval($_POST['y'] ?? 0);
        $z = floatval($_POST['z'] ?? 0);
        $range = 15; // Tầm đánh mặc định

        // 🌟 1. LẤY DATA MỚI
        $level = intval($_POST['level'] ?? 1);
        $scale = floatval($_POST['scale'] ?? 1.0);
        $class_code = $_POST['class_code'] ?? 'TU_TIEN';
        $zone_id = $_POST['zone_id'] ?? 'TRUNG_CHAU';

        // 🌟 2. CÔNG THỨC ĐỒNG BỘ TUYẾN TÍNH NHƯ NGƯỜI CHƠI
        // Cấp 1: 1000 HP, 100 DMG. Mỗi cấp tăng 30 HP, 3 DMG.
        $max_hp = 1000 + (($level - 1) * 30);
        $hp = $max_hp;
        $damage = 100 + (($level - 1) * 3);





        $sql_insert = "INSERT INTO map_monsters (name, pos_x, pos_y, pos_z, hp, max_hp, damage, attack_range, model_url, level, scale, class_code, zone_id) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                       
        $stmt_insert = $conn->prepare($sql_insert);
        
        // Chuỗi format 13 biến chuẩn: thêm s và $zone_id ở cuối
        $stmt_insert->bind_param("sdddiiidsidss", $name, $x, $y, $z, $hp, $max_hp, $damage, $range, $model, $level, $scale, $class_code, $zone_id);
      
      
      
        $stmt_insert->execute();

        echo json_encode(['status' => 'success', 'msg' => "✅ Đã đẻ Boss: Cấp $level | HP: " . number_format($hp) . " | Dame: " . number_format($damage)]);

    } catch (Exception $e) {
        // 🌟 NẾU CÓ LỖI SQL (VD: Quên tạo cột), SẼ CHUI VÀO ĐÂY BÁO LỖI CHỨ KHÔNG BỊ SẬP SERVER NỮA!
        echo json_encode(['status' => 'error', 'msg' => '❌ LỖI SQL: ' . $e->getMessage()]);
    }
}
?>
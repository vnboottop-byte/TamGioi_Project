<?php
// FILE: api/toggle_equip.php (BẢN VÁ CẬP NHẬT LỰC CHIẾN)
session_start(); header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) exit;
$username = $_SESSION['user'];
$data = json_decode(file_get_contents('php://input'), true);
$inv_id = intval($data['inv_id']);
$action = $data['action']; // 'equip' hoặc 'unequip'

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("SELECT inv.item_type, shop.model_url, shop.required_class FROM user_inventory inv JOIN shop_items shop ON inv.item_id = shop.id WHERE inv.id = ? AND inv.username = ?");
    $stmt->bind_param("is", $inv_id, $username);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    if (!$item) throw new Exception("Không tìm thấy đồ!");

    $type = $item['item_type'];
    $url = $item['model_url'];

    $col = "";
    if ($type === 'weapon') $col = "current_weapon_url";
    elseif ($type === 'weapon2') $col = "current_weapon2_url";
    elseif ($type === 'mount') $col = "current_mount_url";
    elseif ($type === 'model') $col = "current_model_url";


    if ($action === 'equip') {
        $conn->query("UPDATE user_inventory SET is_equipped = 0 WHERE username = '$username' AND item_type = '$type'");
        $conn->query("UPDATE user_inventory SET is_equipped = 1 WHERE id = $inv_id");
        if ($col) $conn->query("UPDATE game_characters SET $col = '$url' WHERE username = '$username'");

        // 🌟 KIẾM HIỆP ĐOẠT XÁ BẰNG SKIN 'ALL'
        if ($type === 'model' && $item['required_class'] === 'ALL') {
            // Tách tên file. Ví dụ: 'uploads/anims/1779413960_jimbei.glb' -> Lấy chữ 'jimbei'
            $tenFileGoc = basename($url); 
            $tenKhongDuoi = pathinfo($tenFileGoc, PATHINFO_FILENAME);
            
            // Xóa đoạn số đằng trước (nếu có)
            $mangTen = explode('_', $tenKhongDuoi);
            $tenNhanVat = end($mangTen); // Lấy chữ cuối cùng. VD: 'jimbei'

            // Đường dẫn JS muốn ép vào
            // Đường dẫn JS muốn ép vào
            $js_doc_quyen = "js/" . strtolower($tenNhanVat) . ".js";
            
            // Ép thẳng vào Cột script_file của người chơi bằng 1 cột mới (Ta sẽ vá vào db)
            $conn->query("UPDATE game_characters SET custom_script = '$js_doc_quyen' WHERE username = '$username'");
        } 
        // 🌟 Nếu lột Skin 'ALL' ra mặc Skin phái gốc, thì xóa cái custom_script đi
        else if ($type === 'model' && $item['required_class'] !== 'ALL') {
            $conn->query("UPDATE game_characters SET custom_script = NULL WHERE username = '$username'");
        }
    } else {
        // ... (Khúc else giữ nguyên)
        $conn->query("UPDATE user_inventory SET is_equipped = 0 WHERE id = $inv_id");
        if ($col) $conn->query("UPDATE game_characters SET $col = '' WHERE username = '$username'");
    }
    
    // ==========================================
    // 🌟 BẢN VÁ: TÍNH LẠI MÁU VÀ DAME NGAY KHI MẶC/THÁO ĐỒ
    // ==========================================
    $stmt_wp = $conn->prepare("SELECT s.bonus_hp, s.bonus_damage, i.upgrade_level FROM user_inventory i JOIN shop_items s ON i.item_id = s.id WHERE i.username = ? AND i.is_equipped = 1");
    $stmt_wp->bind_param("s", $username); $stmt_wp->execute();
    $res_wp = $stmt_wp->get_result();
    
    $buff_hp = 0; $buff_dmg = 0;
    $heSoKiemThe = [1.0, 1.05, 1.12, 1.22, 1.35, 1.50, 1.70, 1.95, 2.25, 2.60, 3.10, 3.70, 4.50, 5.50, 6.80, 8.50];
    
    while($wp = $res_wp->fetch_assoc()) {
        $lvl_wp = (int)$wp['upgrade_level'];
        $heSoCong = isset($heSoKiemThe[$lvl_wp]) ? $heSoKiemThe[$lvl_wp] : 1.0;
        
        $buff_hp += (int)$wp['bonus_hp'] * $heSoCong;
        $buff_dmg += (int)$wp['bonus_damage'] * $heSoCong;
    }

    $stmt_user = $conn->prepare("SELECT level FROM game_characters WHERE username = ?");



    $stmt_user->bind_param("s", $username); $stmt_user->execute();
    $uData = $stmt_user->get_result()->fetch_assoc();
    $lvl = (int)$uData['level'];

    // 🌟 Ráp tổng lực (Gốc + Đồ đã nhân hệ số)
    $hp_max_moi = 1000 + (($lvl - 1) * 30) + $buff_hp;
    $damage_moi = 100 + (($lvl - 1) * 3) + $buff_dmg;

    $conn->query("UPDATE game_characters SET hp_max = $hp_max_moi, damage = $damage_moi WHERE username = '$username'");

    $conn->commit();
    
    // Ném lại cục Dame và Máu mới này về cho Trình duyệt
    echo json_encode(['status' => 'success', 'new_damage' => $damage_moi, 'new_hp' => $hp_max_moi]);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error']);
}
?>
<?php
ob_start(); // 🌟 BẬT MÁY HÚT BỤI: Chặn mọi mã HTML/Khoảng trắng thừa gây vỡ JSON
session_start();

$LIVEKIT_URL = "wss://live.weos7.com"; 
$API_KEY     = "API78wTG8ZufPBE";
$API_SECRET  = "jNVS2hJ2w0DKhWgeHq4RLZX6yOJOXWKkSMrZeSaphe8A";
$ROOM_NAME   = "SanDinh_Chinh";

function taoLiveKitToken($room, $user_name, $key, $secret) {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload = json_encode([
        'iss' => $key,
        'sub' => (string)$user_name,
        'jti' => uniqid(), // Thêm số báo danh ngẫu nhiên chống trùng lặp
        'nbf' => time() - 60, // 🌟 LÙI 1 PHÚT CHỐNG LỆCH MÚI GIỜ SERVER
        'exp' => time() + 14400,
        'video' => [
            'roomJoin' => true,
            'room' => $room,
            'canPublish' => true,
            'canSubscribe' => true,
            'canPublishData' => true
        ]
    ]);

    $b64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $b64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $b64Header . "." . $b64Payload, $secret, true);
    $b64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $b64Header . "." . $b64Payload . "." . $b64Signature;
}

$nhapTen = isset($_GET['u']) ? trim($_GET['u']) : '';
$username = ($nhapTen !== '') ? $nhapTen : (isset($_SESSION['user']) ? $_SESSION['user'] : 'Khach_' . rand(1000, 9999));

$token = taoLiveKitToken($ROOM_NAME, $username, $API_KEY, $API_SECRET);

ob_end_clean(); // 🌟 XÓA SẠCH RÁC TRƯỚC KHI XUẤT RA JSON
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'url' => $LIVEKIT_URL,
    'token' => $token,
    'username' => $username
]);
exit;
?>
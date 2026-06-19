import { dedup, prune } from '@gltf-transform/functions';
const DOI_TEN = {
    1: "ZZZZZZ", 
    2: "ZZZZZZ",
    3: "ZZZZZZ",
    4: "ZZZZZZ",
    5: "ZZZZZZ",
    6: "ZZZZZZ",
    7: "ZZZZZZ",
    8: "ZZZZZZ",
    9: "ZZZZZZ",
    10: "ZZZZZZ",
    11: "ZZZZZZ",
    12: "ZZZZZZ",
    13: "ZZZZZZ",
    14: "ZZZZZZ",
    15: "ZZZZZZ",
    16: "ZZZZZZ",
    17: "ZZZZZZ",
    18: "ZZZZZZ",
    19: "ZZZZZZ",
    20: "ZZZZZZ",
    21: "ZZZZZZ",
    22: "ZZZZZZ",
    23: "ZZZZZZ",
    24: "ZZZZZZ",
    25: "ZZZZZZ",
    26: "ZZZZZZ",
    27: "ZZZZZZ",
    28: "ZZZZZZ",
    29: "ZZZZZZ",
    30: "ZZZZZZ",
    31: "ZZZZZZ",
    32: "ZZZZZZ",
    33: "ZZZZZZ",
    34: "ZZZZZZ",
    35: "ZZZZZZ",
    36: "ZZZZZZ",
    37: "ZZZZZZ",
    38: "ZZZZZZ",
    39: "ZZZZZZ",
    40: "ZZZZZZ",
    41: "ZZZZZZ",
    42: "ZZZZZZ",
    43: "ZZZZZZ",
    44: "ZZZZZZ",
    45: "ZZZZZZ",
    46: "ZZZZZZ",
    47: "ZZZZZZ",
    48: "ZZZZZZ",
    49: "ATTACK",
    50: "ZZZZZZ",
    51: "ZZZZZZ",
    52: "ZZZZZZ",
    53: "ZZZZZZ",
    54: "ZZZZZZ",
    55: "ZZZZZZ",
    56: "ZZZZZZ",
    57: "ZZZZZZ",
    58: "ZZZZZZ",
    59: "ZZZZZZ",
    60: "ZZZZZZ",
    61: "ZZZZZZ",
    62: "ZZZZZZ",
    63: "ZZZZZZ",
    64: "ZZZZZZ",
    65: "ZZZZZZ",
    66: "ZZZZZZ",
    67: "ZZZZZZ",
    68: "ZZZZZZ",
    69: "ZZZZZZ",
    70: "ZZZZZZ",
    71: "ZZZZZZ",
    72: "ZZZZZZ",
    73: "ZZZZZZ",
    74: "ZZZZZZ",
    75: "ZZZZZZ",
    76: "ZZZZZZ",
    77: "ZZZZZZ",
    78: "ZZZZZZ",
    79: "ZZZZZZ",
    80: "ZZZZZZ",
    81: "ZZZZZZ",
    82: "ZZZZZZ",
    83: "ZZZZZZ",
    84: "ZZZZZZ",
    85: "ZZZZZZ",
    86: "ZZZZZZ",
    87: "ZZZZZZ",
    88: "ZZZZZZ",
    89: "ZZZZZZ",
    90: "ZZZZZZ",
    91: "ZZZZZZ",
    92: "ZZZZZZ",
    93: "ZZZZZZ",
    94: "ZZZZZZ",
    95: "ZZZZZZ",
    96: "ZZZZZZ",
    97: "ZZZZZZ",
    98: "ZZZZZZ",
    99: "ZZZZZZ",
    100: "ZZZZZZ",
    101: "ZZZZZZ",
    102: "ZZZZZZ",
    103: "ZZZZZZ",
    104: "ZZZZZZ",
    105: "ZZZZZZ",
    106: "ZZZZZZ",
    107: "ZZZZZZ",
    108: "ZZZZZZ",
    109: "ZZZZZZ",
    110: "ZZZZZZ",
    111: "ZZZZZZ",
    112: "ZZZZZZ",
    113: "ZZZZZZ",
    114: "ZZZZZZ",
    115: "ZZZZZZ",
    116: "ZZZZZZ",
    117: "ZZZZZZ",
    118: "ZZZZZZ",
    119: "ZZZZZZ",
    120: "ZZZZZZ",
    121: "ZZZZZZ",
    122: "ZZZZZZ",
    123: "ZZZZZZ",
    124: "ZZZZZZ",
    125: "ZZZZZZ",
    126: "ZZZZZZ",
    127: "ZZZZZZ",
    128: "ZZZZZZ",
    129: "ZZZZZZ",

     
};
const DANH_SACH_XOA = [

    


];
// ==========================================
// 🚀 BỘ MÁY XỬ LÝ (SẾP KHÔNG CẦN ĐỤNG VÀO)
// ==========================================
const root = document.getRoot();
const animations = root.listAnimations();

console.log(`📦 File gốc có tổng cộng ${animations.length} Animations.`);

// --- BƯỚC 1: ĐỔI TÊN ---
for (let soThuTu in DOI_TEN) {
    let index = parseInt(soThuTu) - 1; // Máy tính đếm từ 0, con người đếm từ 1
    if (animations[index]) {
        let tenCu = animations[index].getName();
        let tenMoi = DOI_TEN[soThuTu];
        animations[index].setName(tenMoi);
        console.log(`✔️ ĐÃ ĐỔI TÊN: [Số ${soThuTu}] từ "${tenCu}" ➔ "${tenMoi}"`);
    } else {
        console.warn(`⚠️ BỎ QUA ĐỔI TÊN: Không tìm thấy Animation số ${soThuTu}`);
    }
}

// --- BƯỚC 2: XÓA BỎ ---
// Gom những đứa cần xóa vào một mảng trước để tránh bị nhảy số thứ tự khi đang xóa
const danhSachGiamKhao = [];
DANH_SACH_XOA.forEach(soThuTu => {
    let index = soThuTu - 1;
    if (animations[index]) {
        danhSachGiamKhao.push({ anim: animations[index], stt: soThuTu });
    }
});

// Tiến hành trảm
danhSachGiamKhao.forEach(item => {
    console.log(`❌ ĐÃ XÓA: [Số ${item.stt}] "${item.anim.getName()}"`);
    item.anim.dispose(); // Xóa sạch dữ liệu của animation này
});

// --- BƯỚC 3: DỌN RÁC NHẸ NHÀNG (KHÔNG ÉP DRACO) ---
console.log("🧹 Đang dọn dẹp các node rác và dữ liệu dư thừa...");
await document.transform(
    prune(), // Dọn rác mồ côi (những xương/node không còn ai dùng tới sau khi xóa animation)
    dedup()  // Gộp các dữ liệu trùng lặp để giảm nhẹ file
);

console.log(`🎉 HOÀN TẤT! File giờ chỉ còn lại ${root.listAnimations().length} Animations siêu sạch sẽ.`);
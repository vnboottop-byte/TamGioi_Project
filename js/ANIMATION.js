import { dedup, prune } from '@gltf-transform/functions';
const DOI_TEN = {
    1: "ATTACK",
    2: "ATTACK",
    3: "ATTACK",
    4: "ATTACK",
    5: "ATTACK",
    6: "ATTACK",
    7: "ATTACK",
    8: "ATTACK",
    9: "ATTACK",
    10: "ATTACK",
    11: "ATTACK",
    12: "ATTACK",
    13: "ATTACK",
    14: "ATTACK",
    15: "ATTACK",
    16: "ATTACK",
    17: "ATTACK",
    18: "ATTACK",
    19: "ATTACK",
    20: "ATTACK",
    21: "ATTACK",
    22: "ATTACK",
    23: "ATTACK",
    24: "ATTACK",
    25: "ATTACK",
    26: "ATTACK",
    27: "ATTACK",
    28: "ATTACK",
    29: "ATTACK",
    30: "ATTACK",
    31: "ATTACK",
    32: "ATTACK",
    33: "ATTACK",
    34: "ATTACK",
    35: "ATTACK",
    36: "IDLE",       
    37: "DIE",        
    38: "ATTACK",     
     
};
const DANH_SACH_XOA = [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 20, 21, 22, 23
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
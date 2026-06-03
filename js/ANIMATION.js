import { dedup, prune } from '@gltf-transform/functions';
const DOI_TEN = {
    1: "ATTACK1",
    2: "ATTACK2",
    3: "ATTACK3",
    4: "ATTACK4",
    5: "ATTACK5",
    6: "ATTACK6",
    7: "ATTACK7",
    8: "ATTACK8",
    9: "ATTACK9",
    10: "ATTACK10",
    11: "ATTACK10",
    12: "ATTACK10",
    13: "ATTACK10",
    14: "ATTACK10",
    15: "ATTACK10",
    16: "ATTACK10",
    17: "ATTACK10",
    18: "ATTACK10",
    19: "ATTACK10",
    20: "ATTACK10",
    21: "ATTACK10",
    22: "ATTACK10",
    23: "ATTACK10",
    24: "ATTACK10",
    25: "ATTACK10",
    26: "ATTACK10",
    27: "ATTACK10",
    28: "ATTACK10",
    29: "ATTACK10",
    30: "ATTACK10",
    31: "ATTACK10",
    32: "ATTACK10",
    33: "ATTACK10",
    34: "ATTACK10",
    35: "ATTACK10",
    36: "ATTACK10",
    37: "ATTACK10",
    38: "ATTACK10",
    39: "ATTACK10",
    40: "ATTACK10",
    41: "ATTACK10",
    42: "ATTACK10",
    43: "ATTACK10",
    44: "ATTACK10",
    45: "ATTACK10",
    46: "ATTACK10",
    47: "ATTACK10",
    48: "ATTACK10",
    49: "ATTACK10",







     
};
const DANH_SACH_XOA = [

    2, 3,  






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
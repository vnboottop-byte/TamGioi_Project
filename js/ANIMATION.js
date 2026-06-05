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
    48: "ATTACK",
    49: "ATTACK",

     
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
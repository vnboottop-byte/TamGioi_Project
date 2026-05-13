import { dedup, prune } from '@gltf-transform/functions';

// ==========================================
// ⚙️ KHU VỰC ĐIỀU KHIỂN CỦA SẾP
// Nhìn số thứ tự trên màn hình (1, 2, 3...) và điền vào đây!
// Lưu ý: Các con số này tính theo thứ tự của file GỐC lúc Sếp vừa tải lên nhé.
// ==========================================

// 1. DANH SÁCH ĐỔI TÊN
// Cú pháp: Số thứ tự : "TÊN_MỚI"
const DOI_TEN = {
    17: "IDLE",      // Ví dụ: Đổi animation số 17 thành IDLE
    15: "DIE",       // Ví dụ: Đổi animation số 15 thành DIE
    1:  "ATTACK",    // Ví dụ: Đổi số 1 thành ATTACK
    // Sếp có thể phẩy và ghi thêm bao nhiêu cái tùy thích...
};

// 2. DANH SÁCH CHÉM BỎ (XÓA)
// Ghi các con số muốn xóa vào trong ngoặc vuông, cách nhau bằng dấu phẩy
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
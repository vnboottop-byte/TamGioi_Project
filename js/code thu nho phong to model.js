import { dedup, prune } from '@gltf-transform/functions';

// ==========================================
// ⚙️ BỘ ĐIỀU KHIỂN BAKE SCALE TẬN GỐC RỄ (CHỐNG LỖI NGƯỜI KIẾN)
// ==========================================

// 🌟 Đổi 'const' thành 'let' để trình duyệt hết báo lỗi vạch đỏ
let CHE_DO_DO = 'MAX_SIZE'; // MAX_SIZE cho Rồng, Thú / CHIEU_CAO cho người
let KICH_THUOC_MONG_MUON = 25; // Cho con Rồng Đỏ to lên 25 mét để bằng con Rồng Vàng

// ==========================================
// 🚀 LÕI XỬ LÝ TOÁN HỌC
// ==========================================
const doc = document;
const root = doc.getRoot();

// --- BƯỚC 1: ĐO ĐẠC X-QUANG ĐỂ TÌM TỶ LỆ ---
let min = [Infinity, Infinity, Infinity];
let max = [-Infinity, -Infinity, -Infinity];

root.listMeshes().forEach(mesh => {
    mesh.listPrimitives().forEach(prim => {
        const pos = prim.getAttribute('POSITION');
        if (pos) {
            const pMin = pos.getMin([]);
            const pMax = pos.getMax([]);
            if (pMin && pMax) {
                for(let i=0; i<3; i++) {
                    if(pMin[i] < min[i]) min[i] = pMin[i];
                    if(pMax[i] > max[i]) max[i] = pMax[i];
                }
            }
        }
    });
});

const sizeX = max[0] - min[0];
const sizeY = max[1] - min[1];
const sizeZ = max[2] - min[2];
const maxDim = Math.max(sizeX, sizeY, sizeZ);

let currentSize = (CHE_DO_DO === 'CHIEU_CAO') ? sizeY : maxDim;
if (currentSize <= 0.0001) currentSize = 1;

const ratio = KICH_THUOC_MONG_MUON / currentSize;
console.log(`⚖️ Đang "NƯỚNG" hệ số thu phóng: ${ratio.toFixed(4)} thẳng vào xương thịt...`);

// Bộ lọc chống nhân đôi nếu các lưới xài chung data
const scaledAccessors = new Set();
function scaleAccessor(acc) {
    if (!acc || scaledAccessors.has(acc)) return;
    const arr = acc.getArray();
    if (arr) {
        for (let i = 0; i < arr.length; i++) arr[i] *= ratio; // Nhân trực tiếp tọa độ
        acc.setArray(arr);
    }
    scaledAccessors.add(acc);
}

// --- BƯỚC 2: BÓP THỊT VÀ HÌNH DÁNG BỀ MẶT ---
root.listMeshes().forEach(mesh => {
    mesh.listPrimitives().forEach(prim => {
        scaleAccessor(prim.getAttribute('POSITION')); // Thịt chính
        prim.listTargets().forEach(target => {
            scaleAccessor(target.getAttribute('POSITION')); // Cử động mặt / cánh
        });
    });
});

// --- BƯỚC 3: BÓP KHOẢNG CÁCH GIỮA CÁC ĐỐT XƯƠNG ---
root.listNodes().forEach(node => {
    const t = node.getTranslation();
    // Thay đổi khoảng cách thực tế, KHÔNG đụng vào Tỷ lệ (Scale luôn là 1.0)
    node.setTranslation([t[0] * ratio, t[1] * ratio, t[2] * ratio]);
});

// --- BƯỚC 4: BÓP LẠI TẦM HOẠT ĐỘNG CỦA ANIMATION ---
// Rồng nhỏ lại thì bước chân, sải cánh trong Animation cũng phải ngắn lại tương ứng
root.listAnimations().forEach(anim => {
    anim.listChannels().forEach(channel => {
        if (channel.getTargetPath() === 'translation') {
            scaleAccessor(channel.getSampler().getOutput());
        }
    });
});

// --- BƯỚC 5: NẮN LẠI MA TRẬN DA KHỚP (INVERSE BIND MATRICES) ---
root.listSkins().forEach(skin => {
    const ibm = skin.getInverseBindMatrices();
    if (ibm && !scaledAccessors.has(ibm)) {
        const arr = ibm.getArray();
        if (arr) {
            // Ma trận 4x4: Trục dịch chuyển (Translation) luôn nằm ở vị trí thứ 12, 13, 14
            for (let i = 0; i < arr.length; i += 16) {
                arr[i + 12] *= ratio;
                arr[i + 13] *= ratio;
                arr[i + 14] *= ratio;
            }
            ibm.setArray(arr);
        }
        scaledAccessors.add(ibm);
    }
});

// --- BƯỚC 6: DỌN RÁC VÀ ÉP KHUÔN LẦN CUỐI ---
await doc.transform(
    prune(),
    dedup()
);

console.log(`✅ HOÀN TẤT BAKE SCALE! Giờ con rồng to đúng ${KICH_THUOC_MONG_MUON}m và Scale của nó đang là 1.0! Nhân vật cưỡi lên auto chuẩn!`);
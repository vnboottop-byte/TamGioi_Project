import { dedup, prune, draco } from '@gltf-transform/functions';

// ==========================================
// 🧹 BƯỚC 1: DỌN RÁC TRƯỚC (Để nó không giết nhầm Yên Ngựa)
// ==========================================
await document.transform(
    prune(),
    dedup()
);

// ==========================================
// 🛠️ BƯỚC 2: TRẠM CẤY GHÉP XƯƠNG KÝ SINH
// ==========================================
const root = document.getRoot();
const nodes = root.listNodes();

// Tên xương Sếp đã tìm chuẩn rồi!
const tenXuongLungCuaSep = "J_tail01_046"; 

let xuongLung = nodes.find(n => n.getName() === tenXuongLungCuaSep) || 
                nodes.find(n => n.getName() && n.getName().toUpperCase().includes(tenXuongLungCuaSep.toUpperCase()));

if (xuongLung) {
    const yenNguaNode = document.createNode('YENNGUA');
    xuongLung.addChild(yenNguaNode);
    yenNguaNode.setTranslation([0, 0, 0]); // Nhích lên nửa mét cho đỡ ngập vào thịt
    console.log("🔥 THÀNH CÔNG THẬT SỰ: Đã cấy YENNGUA vào: " + xuongLung.getName());
} else {
    console.log("❌ THẤT BẠI: Không tìm thấy xương!");
}

// ==========================================
// 🧠 BƯỚC 3: ĐỔI TÊN ANIMATION
// ==========================================
const animations = root.listAnimations();
if (animations.length > 0) {
    animations[0].setName('BAY');
    console.log("Đã đổi tên Animation thành BAY");
}

// ==========================================
// 🗜️ BƯỚC 4: NÉN MESH BẰNG DRACO (Draco không xóa Node, nên an toàn!)
// ==========================================
await document.transform(
    draco({ method: 'edgebreaker', encodeSpeed: 0, decodeSpeed: 0 })
);
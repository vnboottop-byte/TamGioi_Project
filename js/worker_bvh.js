// ==========================================
// 🧠 NHÂN CPU SỐ 2: CHUYÊN GIA ĐÚC KHUÔN VẬT LÝ (BVH)
// ==========================================

// 1. Nạp thẳng thư viện vào Nhân CPU 2 (Không dính dáng gì tới Card màn hình)
importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
importScripts('https://unpkg.com/three-mesh-bvh@0.5.23/build/index.umd.cjs');

self.onmessage = function(event) {
    const data = event.data;
    
    try {
        // 2. Lấy dữ liệu thô (Các đỉnh đa giác) từ Core 1 gửi sang
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
        if (data.indices) {
            geometry.setIndex(new THREE.BufferAttribute(data.indices, 1));
        }

        // 3. Tiến hành đúc khuôn vật lý (Bao nhiêu mili-giây thì chỉ có Core 2 bị lag, Core 1 vẫn rảnh!)
        const bvh = new MeshBVHLib.MeshBVH(geometry);





        // 4. Đóng gói (Serialize) để trả về cho Core 1
        const serialized = MeshBVHLib.MeshBVH.serialize(bvh);

        // 5. Ném hàng về! (🌟 TỐI ƯU MOBILE: CHUYỂN NHƯỢNG VÙNG NHỚ KHÔNG COPY ĐỂ TRÁNH X2 RAM)
        let buffersCanChuyen = [];
        if (serialized.index) buffersCanChuyen.push(serialized.index.buffer);
        if (serialized.roots) {
            serialized.roots.forEach(r => { if (r && r.buffer) buffersCanChuyen.push(r.buffer); });
        }
        
        self.postMessage(
            { id: data.id, serialized: serialized, status: 'success' }, 
            buffersCanChuyen // Tham số thứ 2 ép trình duyệt DỊCH CHUYỂN RAM thay vì COPY RAM
        );







        
    } catch (e) {
        self.postMessage({ id: data.id, error: e.message, status: 'error' });
    }
};
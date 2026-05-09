import { dedup, prune, textureCompress, draco, weld, resample, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

// Khởi động động cơ gọt lưới của Meshoptimizer
await MeshoptSimplifier.ready;

await document.transform(
    // 1. DỌN RÁC TOÀN DIỆN
    prune(),
    dedup(),

    // 2. ÉP XƯƠNG (ANIMATION): Xóa bớt các khung hình (Keyframe) thừa thãi của chuyển động. 
    // Quái đứng xa múa hơi giật một xíu không ai rảnh mà soi!
    resample({ tolerance: 0.01 }), 

    // Hàn điểm ảnh trước khi gọt
    weld(),

    // 3. GỌT THỊT (CỰC KỲ ÁC): Lệnh này sẽ chặt chém 80% số lượng lưới Đa giác (Polygons) của con quái. 
    // Chỉ giữ lại 20% (ratio: 0.2). Đứng xa nhìn vẫn ra hình con rồng, nhưng nhẹ bằng một cọng lông!
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.2, error: 0.05 }),

    // 4. LUỘC DA (TEXTURE): Ép độ phân giải ảnh của da, lông, vảy xuống mức bùn lầy (256x256). 
    textureCompress({
        targetFormat: 'webp',
        resize: [256, 256] // Cực kỳ bạo lực. Sếp có thể tăng lên [512, 512] nếu thấy nó quá mờ.
    }),

    // 5. NÉN KỊCH KHUNG DRACO (0 LÀ MỨC ÉP TÀN NHẪN NHẤT)
    draco({ 
        method: 'edgebreaker', 
        encodeSpeed: 0, 
        decodeSpeed: 0 
    })
);









https://drive.google.com/drive/folders/1rEYcXxj-EwtSt4WX4cjYqT-bWP78D-3E?usp=sharing








//CODE XOAY VŨ KHÍ  TESS XOAY SÚNG

// 🌟 ĐỒNG BỘ V47: BỌC SÚNG BẰNG WRAPPER ĐỂ PHÁ KHÓA TRỤC TỌA ĐỘ
khoiTao: function () {
    console.log("🔫 Khởi tạo Xạ Thủ: Bọc súng vào Wrapper chống khóa trục!");
    let urlVuKhi = 'uploads/anims/GUN.glb';

    if (typeof window.taiHoacNhanBanAsset === 'function') {
        window.taiHoacNhanBanAsset(urlVuKhi, (sungGoc) => {

            // 🌟 BÍ THUẬT Ở ĐÂY: Tạo cái vỏ bọc (Hộp rỗng)
            window.vuKhiWrapper = new THREE.Group();
            window.vuKhiWrapper.add(sungGoc); // Nhét súng vào hộp

            // Khai báo cho hệ thống biết cây súng chính là cái Hộp này
            window.vuKhiModel = window.vuKhiWrapper;

            window.vuKhiWrapper.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(window.vuKhiWrapper);
            const size = box.getSize(new THREE.Vector3());
            const chieuDaiGoc = Math.max(size.x, size.y, size.z);

            if (typeof playerModel !== 'undefined' && playerModel) {
                let xuongTayTrai = null;
                playerModel.traverse(c => {
                    if (c.isBone && (c.name.includes('LeftHand') || c.name.toLowerCase().includes('hand_l') || c.name.toLowerCase().includes('lefthand'))) {
                        xuongTayTrai = c;
                    }
                });

                if (xuongTayTrai) {
                    // Gắn cái HỘP vào xương tay trái
                    xuongTayTrai.add(window.vuKhiWrapper);

                    let tiLeThuc = new THREE.Vector3();
                    xuongTayTrai.getWorldScale(tiLeThuc);
                    let scaleFix = tiLeThuc.x > 0 ? tiLeThuc.x : 1;

                    let tiLeCuoi = (1.3 / chieuDaiGoc) / scaleFix;
                    window.vuKhiWrapper.scale.set(tiLeCuoi, tiLeCuoi, tiLeCuoi);

                    window.vuKhiWrapper.position.set(0, 0, 0);
                    window.vuKhiWrapper.rotation.set(0, 0, 0);
                }
            }

            // Hiện súng để xoay
            window.vuKhiModel.visible = true;

            // ==========================================
            // 🖱️ BẢNG ĐIỀU KHIỂN XOAY SÚNG BẰNG CHUỘT
            // ==========================================
            if (!document.getElementById('tool-xoay-sung')) {
                let panel = document.createElement('div');
                panel.id = 'tool-xoay-sung';
                panel.style.cssText = 'position:fixed; top:50px; left:50px; background:rgba(0,0,0,0.8); color:white; padding:15px; z-index:999999; border:2px solid #0f0; border-radius:8px; text-align:center; font-family:sans-serif;';
                panel.innerHTML = `
                                <h3 style="margin:0 0 10px 0; color:#0f0; font-size:18px;">🔧 BẢNG XOAY SÚNG</h3>
                                <div style="margin-bottom:10px;">
                                    <b style="display:inline-block; width:60px; text-align:left;">Trục X:</b>
                                    <button style="padding:5px 15px; cursor:pointer; font-weight:bold;" onclick="window.xoaySung('x', 1)">LÊN 🔼</button>
                                    <button style="padding:5px 15px; cursor:pointer; font-weight:bold;" onclick="window.xoaySung('x', -1)">XUỐNG 🔽</button>
                                </div>
                                <div style="margin-bottom:10px;">
                                    <b style="display:inline-block; width:60px; text-align:left;">Trục Y:</b>
                                    <button style="padding:5px 15px; cursor:pointer; font-weight:bold;" onclick="window.xoaySung('y', 1)">TRÁI ◀️</button>
                                    <button style="padding:5px 15px; cursor:pointer; font-weight:bold;" onclick="window.xoaySung('y', -1)">PHẢI ▶️</button>
                                </div>
                                <div style="margin-bottom:10px;">
                                    <b style="display:inline-block; width:60px; text-align:left;">Trục Z:</b>
                                    <button style="padding:5px 15px; cursor:pointer; font-weight:bold;" onclick="window.xoaySung('z', 1)">LẬT 🔄</button>
                                    <button style="padding:5px 15px; cursor:pointer; font-weight:bold;" onclick="window.xoaySung('z', -1)">ÚP 🔃</button>
                                </div>
                                <div id="goc-hien-tai" style="color:yellow; font-weight:bold; margin-top:15px; font-size:16px;">Copy: (0.00, 0.00, 0.00)</div>
                            `;
                document.body.appendChild(panel);

                window.xoaySung = function (truc, huong) {
                    if (!window.vuKhiWrapper) return;
                    let step = Math.PI / 16;

                    // 🌟 Tác động lực vào HỘP RỖNG chứ không tác động vào SÚNG nữa
                    window.vuKhiWrapper.rotation[truc] += (step * huong);

                    // Ép Three.js vẽ lại hình lập tức
                    window.vuKhiWrapper.updateMatrix();

                    let rx = window.vuKhiWrapper.rotation.x.toFixed(2);
                    let ry = window.vuKhiWrapper.rotation.y.toFixed(2);
                    let rz = window.vuKhiWrapper.rotation.z.toFixed(2);

                    document.getElementById('goc-hien-tai').innerText = `Copy: (${rx}, ${ry}, ${rz})`;
                };
            }
        });
    }
},

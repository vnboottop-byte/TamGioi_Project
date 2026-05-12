// ==========================================
// 🌍 ĐỘNG CƠ CỐT LÕI (CORE ENGINE) - TÍCH HỢP MOBILE MODE
// ==========================================
THREE.Cache.enabled = true;
window.scene = new THREE.Scene();
window.camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.01, 3000);

// 🌟 NHẬN DIỆN ĐIỆN THOẠI
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 🌟 BẢN VÁ: Vừa vào game phải nhìn ZONE_ID để gạt cần số vật lý ngay lập tức, không để nó tự nhận là CAU gây lỗi đẩy 10.000m!
if (window.ZONE_ID && window.ZONE_ID !== 'TRUNG_CHAU') {
    window.KIEU_TRONG_LUC = 'PHANG';
    window.toaDoMatDat = window.SPAWN_Y || 0; // Chống rơi tự do trước khi nạp Map
} else {
    window.KIEU_TRONG_LUC = 'CAU';
}




window.renderer = new THREE.WebGLRenderer({
    antialias: !window.isMobile,
    // 🌟 BẬT LOGARITHMIC CHO PC ĐỂ CHỐNG LỖI XƯỚC ĐEN MÔ HÌNH Ở MAP RỘNG
    logarithmicDepthBuffer: !window.isMobile
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.isMobile ? 1 : window.devicePixelRatio); 
renderer.outputEncoding = THREE.sRGBEncoding;

// 🌟 BÍ QUYẾT GLTF-VIEWER: ĐỔI VỀ LINEAR TONE MAPPING
renderer.toneMapping = THREE.LinearToneMapping; 
renderer.toneMappingExposure = 1.0; 

document.body.appendChild(renderer.domElement);

// 🌟 TẠO PHÒNG STUDIO VÔ HÌNH ĐỂ CHIẾU SÁNG KIM LOẠI TỨ PHÍA
if (typeof THREE.RoomEnvironment !== 'undefined') {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
}

scene.add(new THREE.AmbientLight(0xffffff, 0.3));







window.xuLyCaiChetNhanVat = function (killerId = "Không xác định") {
    if (window.isDead) return; 
    window.isDead = true;
    window.mauBanThan = 0;
    
    // 1. NGÃ XUỐNG: Chơi animation chết và giữ nguyên vị trí mesh
    if (typeof playAnim === 'function') playAnim('DIE');
    console.log("☠️ Nhân vật đã ngã xuống tại tọa độ hiện tại!");

    // 2. BÁO CÁO TỬ TRẬN QUA MẠNG (Để kẻ giết húp EXP)
    if (window.room && killerId !== "Không xác định") {
        window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ 
            type: 'XAC_NHAN_GUC_NGA', 
            killerId: killerId, 
            victimLevel: window.LEVEL_CUA_TOI || 1 
        })), { reliable: true });
    }

    // 3. HIỆN BẢNG ĐẾM NGƯỢC 10 GIÂY CAY CÚ
    const deathScreen = document.getElementById('deathScreen');
    const killerDisplay = document.getElementById('killerNameDisplay');
    const countdownEl = document.getElementById('deathCountdown');
    
    if (deathScreen) {
        deathScreen.style.display = 'flex';
        if (killerDisplay) killerDisplay.innerText = killerId;
    }

    let giayConLai = 10;
    if (countdownEl) countdownEl.innerText = giayConLai;

    // Vòng lặp đếm ngược
    const timer = setInterval(() => {
        giayConLai--;
        if (countdownEl) countdownEl.innerText = giayConLai;
        
        if (giayConLai <= 0) {
            clearInterval(timer);
            
            // 🌟 4. HẾT 10 GIÂY MỚI ĐƯỢC ĐẦU THAI (RESET)
            console.log("🔄 10 giây đã hết! Đang dịch chuyển về điểm hồi sinh...");




            if (typeof playerModel !== 'undefined' && playerModel) {
                // Giờ mới bay về thành
                playerModel.position.set(window.SPAWN_X || 0, window.SPAWN_Y || 0, window.SPAWN_Z || 0);
                
                // ==========================================
                // 🌟 BẢN VÁ: NẮN LẠI XƯƠNG SAU KHI HỒI SINH Ở TÂN THỦ THÔN
                // ==========================================




                let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0,0,0);
                let huongLenTroiMoi = playerModel.position.clone().sub(tam);
                if (huongLenTroiMoi.lengthSq() < 0.001) huongLenTroiMoi.set(0, 1, 0); else huongLenTroiMoi.normalize();



                playerModel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenTroiMoi);
                playerModel.up.copy(huongLenTroiMoi);
                window.mucTieuBanKinhDat = playerModel.position.distanceTo(tam);

                window.mauBanThan = window.MAU_TOI_DA || 5000;
                window.isDead = false;
                
                // Trở lại trạng thái đứng im
                if (typeof playAnim === 'function') playAnim('IDLE');
                
                // Cập nhật lại UI máu
                const uiThanhMau = document.getElementById('thanhMauHienTai');
                if (uiThanhMau) uiThanhMau.style.width = '100%';
                
                // Tắt màn hình đen
                if (deathScreen) deathScreen.style.display = 'none';
            }



            
            
        }
    }, 1000); 
};








// ==========================================
// 🩸 BỘ NÃO CHỊU SÁT THƯƠNG TỪ BOSS DÀNH CHO NGƯỜI CHƠI (PVE)
// ==========================================
window.gaySatThuongBossToPlayer = function(tamNo, luongSatThuong, banKinh) {
    if (window.isDead || !window.playerModel) return;

    // 1. BẢO KIẾM MIỄN DỊCH CHO ADMIN
    let role = (window.ROLE || "").toLowerCase();
    let name = (window.ADMIN_NAME || window.myUsername || "").toLowerCase();
    if (role === "admin" || name === "admin") return;





    // 2. 🌟 MÁY QUÉT KHOẢNG CÁCH NỔ (ĐO VÀO LÕI THỊT NGƯỜI CHƠI BỎ QUA THÚ CƯỠI)
    let nvc = window.nhanVatChinh || window.playerModel;
    let tamNguoiChoi = nvc.userData.tamThucTeLocal ? nvc.userData.tamThucTeLocal.clone().applyMatrix4(nvc.matrixWorld) : nvc.position.clone();
    
    let khoangCach = tamNo.distanceTo(tamNguoiChoi);
    let hitBoxNguoiChoi = 1.0; // Thu nhỏ thể tích lại, đánh phải trúng thân người mới đau!

    // NẾU SẾP NẰM TRONG VÙNG NỔ -> ĂN ĐÒN!
    if (khoangCach <= (banKinh + hitBoxNguoiChoi)) {
        let st = Math.round(luongSatThuong) || 100; 
        window.mauBanThan -= st;

        // Nảy số máu bị mất từ ngay ngực người chơi (Không nảy từ gầm rồng nữa)
        if (typeof window.taoSoSatThuong === 'function') {
            window.taoSoSatThuong(tamNguoiChoi.clone().add(new THREE.Vector3(0, 1, 0)), st);
        }





        // Cập nhật thanh máu UI
        const uiThanhMau = document.getElementById('thanhMauHienTai');
        const uiSoMau = document.getElementById('soMauHienTai');
        if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
        if (uiSoMau) uiSoMau.innerText = Math.max(0, Math.round(window.mauBanThan)).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";

        // Về chầu ông bà nếu cạn HP
        if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') {
            window.xuLyCaiChetNhanVat("Bị Trúng Tuyệt Kỹ Boss");
        }
    }
};








window.donRac3D = function (obj) {
    if (!obj) return;
    
    // 🌟 LÒ ĐỐT RÁC VRAM (BẢN VIP: Đốt cả Khối, Hạt Bụi và Tia Sáng)
    obj.traverse(child => {
        // Càn quét nếu nó là Mesh (Khối), Points (Hạt bụi/lửa), Line (Tia Lazer)
        if (child.isMesh || child.isPoints || child.isLine) {
            if (child.geometry) child.geometry.dispose(); // Thiêu rụi khung xương
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose(); // Thiêu rụi màu sơn
                }
            }
        }
    });

    // Gỡ khỏi cha và gỡ khỏi thế giới
    if (obj.parent) obj.parent.remove(obj);
    if (typeof scene !== 'undefined') scene.remove(obj);
};


const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.45);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const denCamera = new THREE.DirectionalLight(0xffffff, 1.2);
denCamera.position.set(0, 5, 15);
camera.add(denCamera);
if (!scene.children.includes(camera)) scene.add(camera);




window.bocHDRI_NhanVat = function (model) {
    // 🛑 ĐÃ KHÓA: Ánh sáng Studio (RoomEnvironment) đã tự động bao phủ toàn map.
    // Không cần gán tay thủ công và tuyệt đối không bơm x4 sáng nữa để tránh cháy hình!
    return;
};

window.fixHieuUngDenThui = function (model) {
    // 🛑 ĐÃ KHÓA: Tôn trọng 100% chất liệu gốc của 3D Artist.
    return;
};







setInterval(() => {
    // ==========================================
    // 1. CHĂM SÓC BẢN THÂN & TỰ ĐỘNG HỒI MÁU
    // ==========================================
    if (typeof playerModel !== 'undefined' && playerModel) {
        if (!playerModel.daFixInox) { 
            window.fixHieuUngDenThui(playerModel); 
            playerModel.daFixInox = true; 
        }

        // 🌟 BỘ MÁY HỒI MÁU THÔNG MINH (OUT-OF-COMBAT REGEN)
        if (typeof window.mauBanThan !== 'undefined' && typeof window.MAU_TOI_DA !== 'undefined' && !window.isDead) {
            
            // Lần đầu chạy, ghi nhớ lượng máu
            if (!window.mauTrangThaiTruoc) window.mauTrangThaiTruoc = window.mauBanThan;

            // Nếu máu bị tụt -> Phát hiện bị cắn/đánh -> Ghi nhận thời gian giao chiến
            if (window.mauBanThan < window.mauTrangThaiTruoc) {
                window.thoiDiemBiDanh = Date.now();
            }

            // Nếu máu chưa đầy VÀ (Chưa từng bị đánh HOẶC Đã qua 5 giây kể từ lần cuối mất máu)
            if (window.mauBanThan < window.MAU_TOI_DA && (!window.thoiDiemBiDanh || Date.now() - window.thoiDiemBiDanh > 5000)) {
                
                // 🌟 TỐC ĐỘ HỒI MÁU: 5% Max HP mỗi giây (Thay đổi số 0.05 tùy ý Sếp)
                let luongHoi = window.MAU_TOI_DA * 0.05; 
                window.mauBanThan += luongHoi;
                
                // Chống tràn máu
                if (window.mauBanThan > window.MAU_TOI_DA) window.mauBanThan = window.MAU_TOI_DA;

                // 🌟 CẬP NHẬT TRỰC TIẾP LÊN GIAO DIỆN (UI)
                const uiThanhMau = document.getElementById('thanhMauHienTai');
                const uiSoMau = document.getElementById('soMauHienTai');
                if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
                if (uiSoMau) uiSoMau.innerText = Math.round(window.mauBanThan).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
            }

            // Lưu lại lượng máu hiện tại để đối chiếu cho giây tiếp theo
            window.mauTrangThaiTruoc = window.mauBanThan;
        }
    }

    




    


        
}, 1000);








const renderScene = new THREE.RenderPass(scene, camera);

// 🌟 THÔNG SỐ CHUẨN CHỐNG CHÓI LÓA TẠI ĐÂY:
const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.25,   // 1. STRENGTH (Cường độ): Giảm xuống 0.5 - 0.8 để bớt chói.
    0.8,   // 2. RADIUS (Độ lan tỏa): 0.4 là vừa đẹp.
    0.98   // 3. THRESHOLD (Ngưỡng): TĂNG LÊN 0.85 hoặc 0.9. (Cái này cực quan trọng: Nó giúp mặt đất không bị phát sáng, chỉ có Lazer/Skill mới có hào quang!)
);










window.composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Lớp Khử Răng Cưa
if (!window.isMobile && typeof THREE.SMAAPass !== 'undefined') {
    const smaaPass = new THREE.SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
    composer.addPass(smaaPass);
}

// 🌟 BẢN VÁ AAA: PHỤC HỒI ÁNH SÁNG THỰC (BẮT BUỘC PHẢI NẰM CUỐI CÙNG)
if (typeof THREE.GammaCorrectionShader !== 'undefined') {
    const gammaPass = new THREE.ShaderPass(THREE.GammaCorrectionShader);
    composer.addPass(gammaPass);
}

let mixer, playerModel, currentAction;











let currentAnimName = ''; 
let animationsMap = {}; 
window.isMoving = false;
window.targetPosition = new THREE.Vector3();
window.keys = { w: false, a: false, s: false, d: false, space: false, shift: false };
const keys = window.keys;
window.isKeyboardMoving = false;

document.addEventListener('keydown', (e) => {
    let k = (e.code || "").replace('Key', '').toLowerCase();
    if (['w', 'a', 's', 'd', 'space', 'shift'].includes(k)) keys[k] = true;
    let phimChieng = e.key.toUpperCase();
    if (['Q', 'E', 'R', 'F'].includes(phimChieng)) {
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
        
        // 🛑 LÁ CHẮN BẠO LỰC: CẤM XUẤT CHIÊU KHI ĐỨNG Ở SAFE ZONE
        if (window.IS_IN_SAFE_ZONE) {
            window.hienThongBaoBoGoc("🕊️ VÙNG AN TOÀN: Cất vũ khí đi Sếp!", "#f1c40f");
            return; // Cắt đứt mạch điện, skill tịt ngòi lập tức!
        }

        if (window.HePhaiHienTai && typeof window.HePhaiHienTai.tungChieu === 'function') window.HePhaiHienTai.tungChieu(phimChieng);
    }
});

document.addEventListener('keyup', (e) => {
    let k = (e.code || "").replace('Key', '').toLowerCase();
    if (['w', 'a', 's', 'd', 'space', 'shift'].includes(k)) keys[k] = false;
});

// ==========================================
// 🎯 HỆ THỐNG KHÓA MỤC TIÊU VÀ BẮT CHUỘT
// ==========================================
window.raycasterChuot = new THREE.Raycaster();
window.mouseViTri = new THREE.Vector2();
window.vongMucTieu = null;
window.mucTieuHienTai = null;

function khoiTaoVongMucTieu() {
    let g = new THREE.RingGeometry(2, 2.5, 32);
    let m = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    window.vongMucTieu = new THREE.Mesh(g, m);
    window.vongMucTieu.rotation.x = -Math.PI / 2;
    window.vongMucTieu.visible = false;
    scene.add(window.vongMucTieu);
}

window.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    if (event.target.tagName !== 'CANVAS' && event.target.tagName !== 'BODY') return;
    if (typeof playerModel === 'undefined' || !playerModel || window.isDead) return;

    if (!window.vongMucTieu) khoiTaoVongMucTieu();

    window.mouseViTri.x = (event.clientX / window.innerWidth) * 2 - 1;
    window.mouseViTri.y = -(event.clientY / window.innerHeight) * 2 + 1;







    window.raycasterChuot.setFromCamera(window.mouseViTri, camera);

    // 🛑 THUỐC ĐẶC TRỊ LIỆT CHUỘT: KHÔNG quét toàn bộ Scene nữa!
    // Chỉ gom Mặt Đất, Boss và Người chơi khác vào một danh sách để chuột quét.
    let danhSachMucTieu = [...window.danhSachMap];
    if (window.danhSachQuaiVat) window.danhSachQuaiVat.forEach(q => { if (q.mesh) danhSachMucTieu.push(q.mesh); });
    if (window.remotePlayers) Object.values(window.remotePlayers).forEach(rp => { if (rp.mesh) danhSachMucTieu.push(rp.mesh); });

    // 🛑 LÁ CHẮN 3: BẢO VỆ CHUỘT
    danhSachMucTieu = danhSachMucTieu.filter(obj => obj && typeof obj.raycast === 'function');
    const intersects = window.raycasterChuot.intersectObjects(danhSachMucTieu, true);

    window.mucTieuHienTai = null;
    window.vongMucTieu.visible = false;






    for (let i = 0; i < intersects.length; i++) {
        let obj = intersects[i].object;

        let isPlayer = false;
        obj.traverseAncestors(a => { if (a === playerModel) isPlayer = true; });
        if (isPlayer || obj === playerModel) continue;

        let isTarget = false;

        // Dò xem có click trúng Boss không?
        if (window.danhSachQuaiVat) {
            window.danhSachQuaiVat.forEach(q => {
                if (!q.isDead) q.mesh.traverse(c => { if (c === obj) { isTarget = true; window.mucTieuHienTai = q; } });
            });
        }

        // Dò xem có click trúng Người chơi khác không?
        if (window.remotePlayers) {
            for (let id in window.remotePlayers) {
                let rp = window.remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    rp.mesh.traverse(c => { if (c === obj) { isTarget = true; window.mucTieuHienTai = { type: 'PLAYER', id: id, mesh: rp.mesh }; } });
                }
            }
        }

        if (isTarget) {
            // 🛑 LÁ CHẮN ĐỒ SÁT: Nếu đang ở Safe Zone, CẤM CLICK khóa người chơi khác để đánh!
            if (window.IS_IN_SAFE_ZONE && window.mucTieuHienTai && window.mucTieuHienTai.type === 'PLAYER') {
                window.hienThongBaoBoGoc("🕊️ VÙNG AN TOÀN: Ở đây cấm ẩu đả!", "#f1c40f");
                window.mucTieuHienTai = null; // Hủy mục tiêu lập tức
                window.vongMucTieu.visible = false;
                return; // Thoát ra, không làm gì thêm!
            }
            console.log("🎯 Sếp đã khóa mục tiêu!");
            window.vongMucTieu.position.copy(intersects[i].point);
            window.vongMucTieu.position.y += 0.5;
            window.vongMucTieu.visible = true;
            break;
        } else {
            // 🌟 ĐÃ CLICK TRÚNG MẶT ĐẤT -> LAO TỚI ĐÓ!
            console.log("📍 Đã click trúng mặt đất tại:", intersects[i].point);
            window.targetPosition.copy(intersects[i].point);
            window.isMoving = true;
            
            // Hiện vòng đỏ tại chỗ click để Sếp dễ nhìn
            window.vongMucTieu.position.copy(intersects[i].point);
            let upV = intersects[i].face ? intersects[i].face.normal : intersects[i].point.clone().normalize();
            let targetMat = new THREE.Matrix4().lookAt(window.vongMucTieu.position, window.vongMucTieu.position.clone().add(upV), new THREE.Vector3(0,0,1));
            window.vongMucTieu.quaternion.setFromRotationMatrix(targetMat);
            window.vongMucTieu.visible = true;

            if (typeof idleTimer !== 'undefined' && idleTimer) { clearInterval(idleTimer); idleTimer = null; }
            break;
        }
    }





    
});

// 🌟 BẢN VÁ: Nhận diện chính xác số 0, tránh bị quăng lên 5000m oan uổng
const TOA_DO_SPAWN = { 
    x: (typeof window.SPAWN_X !== 'undefined') ? window.SPAWN_X : 0, 
    y: (typeof window.SPAWN_Y !== 'undefined') ? window.SPAWN_Y : 500, 
    z: (typeof window.SPAWN_Z !== 'undefined') ? window.SPAWN_Z : 0 
};

camera.far = 30000; 
camera.updateProjectionMatrix();





const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
controls.enablePan = false;

// 🌟 THIẾT LẬP CAMERA ĐẶC QUYỀN
let tenCuaToi = (window.myUsername || "").toLowerCase();
let isAdmin = (tenCuaToi === "admin" || tenCuaToi === "kidlo" || window.ROLE === "admin");

if (isAdmin) {
    // 👑 ADMIN: Tầm nhìn của vị thần
    controls.maxDistance = 15; // Cho phép lăn chuột ra xa tít mù tắp để nhìn cả bản đồ
    controls.minDistance = 2;    // Không cho zoom quá gần để tránh chui vào trong bụng Titan
} else {
    // 👤 NGƯỜI THƯỜNG: Giữ nguyên như cũ
    controls.maxDistance = 15;   // Chỉ cho phép nhìn quanh quẩn nhân vật
    controls.minDistance = 2;     // Có thể nhìn sát mặt nhân vật
}



camera.position.set(TOA_DO_SPAWN.x, TOA_DO_SPAWN.y + 1, TOA_DO_SPAWN.z + 85);
controls.target.set(TOA_DO_SPAWN.x, TOA_DO_SPAWN.y + 2, TOA_DO_SPAWN.z);
controls.update();

// =========================================================
// 📥 TẢI BẢN ĐỒ VÀ MÔ HÌNH
// =========================================================
const loader = new THREE.GLTFLoader();
const dracoLoader = new THREE.DRACOLoader();
// 🌟 NÂNG CẤP LÊN 1.4.3 ĐỂ ĐỌC ĐƯỢC FILE NÉN CỦA BLENDER!
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/');
loader.setDRACOLoader(dracoLoader);
window.loaderSieuToc = loader;

window.mixerNhanVatPhu = null; 


// 🌟 TẠO BIẾN MIXER ĐỂ CHẠY ANIMATION MÂY
window.mixerTraiDat = null;





// 🌟 KÍCH HOẠT LÕI VẬT LÝ SIÊU TỐC BVH & KẾT NỐI NHÂN CPU SỐ 2
if (typeof MeshBVHLib !== 'undefined') {
    THREE.BufferGeometry.prototype.computeBoundsTree = MeshBVHLib.computeBoundsTree;
    THREE.BufferGeometry.prototype.disposeBoundsTree = MeshBVHLib.disposeBoundsTree;
    if (typeof MeshBVHLib.acceleratedRaycast === 'function') {
        THREE.Mesh.prototype.raycast = MeshBVHLib.acceleratedRaycast;
    }
    
    // TỰ TAY KHỞI TẠO WORKER CỦA SẾP
    window.myBvhWorker = new Worker('js/worker_bvh.js');
    window.bvhJobs = {}; // Danh sách công việc đang chờ
    window.jobIdCounter = 0;
    
    // Khi Nhân CPU 2 làm xong và ném trả lại:
    window.myBvhWorker.onmessage = function(e) {
        let data = e.data;
        let job = window.bvhJobs[data.id];
        if (job) {
            if (data.status === 'success') {
                job.resolve(data.serialized); // Báo cáo thành công
            } else {
                job.reject(data.error); // Báo lỗi
            }
            delete window.bvhJobs[data.id]; // Xóa lệnh
        }
    };
    
    console.log("🛠️ Đã tự tay khởi động Nhân CPU ảo chuyên đúc Map (worker_bvh.js)!");
}




loader.load('uploads/anims/map_san_dinh.glb', function (gltf) { 
    const mapHanhTinh = gltf.scene;
    
    // 🌟 LƯU LẠI BẢN GỐC ĐỂ TẮT/MỞ KHI XUYÊN KHÔNG
    window.HANH_TINH_GOC = mapHanhTinh; 
    window.matDatHanhTinhGoc = []; 

    if (gltf.animations && gltf.animations.length > 0) {





        window.mixerTraiDat = new THREE.AnimationMixer(mapHanhTinh);
        gltf.animations.forEach((clip) => {
            let action = window.mixerTraiDat.clipAction(clip);

            // 🌟 BỘ GIẢM TỐC VŨ TRỤ: 
            // Số 1.0 là tốc độ gốc của Blender. 
            // Giảm xuống 0.05 hoặc 0.02 để mây bay lững lờ cực kỳ chậm và hùng vĩ!
            action.timeScale = 0.05;

            action.play();
        });
    }





    if (!window.danhSachMap) window.danhSachMap = [];











    // 2. PHẪU THUẬT TÁCH LỚP DỰA THEO TÊN NODE VÀ TÊN THƯ MỤC CHA



    // 2. PHẪU THUẬT TÁCH LỚP DỰA THEO TÊN NODE VÀ TÊN THƯ MỤC CHA
    mapHanhTinh.traverse((child) => {
        if (child.isMesh) {
            let tenMesh = child.name.toLowerCase();
            let laMayKhyQuyen = false;

            child.traverseAncestors(p => {
                let pName = p.name.toLowerCase();
                if (pName.includes('cloud') || pName.includes('may') || pName.includes('atmosphere') || pName.includes('datroi') || pName.includes('nganha') || pName.includes('sao')) laMayKhyQuyen = true;
            });

            if (tenMesh.includes('cloud') || tenMesh.includes('may') || tenMesh.includes('atmosphere') || tenMesh.includes('datroi') || tenMesh.includes('nganha') || tenMesh.includes('sao')) laMayKhyQuyen = true;






            if (laMayKhyQuyen) {
                // Xử lý Lồng Bầu Trời: Tàng hình vật lý, đẩy ra xa
                child.frustumCulled = false;
                child.renderOrder = -1; 
                if (child.material) {
                    if (child.material.map) {
                        child.material.emissiveMap = child.material.map;
                        child.material.emissive = new THREE.Color(0xffffff);
                        child.material.emissiveIntensity = 1.2;
                    }
                    let mats = Array.isArray(child.material) ? child.material : [child.material];
                    let newMats = mats.map(mat => new THREE.MeshBasicMaterial({
                        map: mat.map, color: mat.color || 0xffffff, transparent: true,
                        opacity: mat.opacity !== undefined ? mat.opacity : 1.0,
                        side: THREE.DoubleSide, // 🌟 PHẢI LÀ DOUBLESIDE THÌ RADAR MỚI ĐO ĐƯỢC CHUẨN KHOẢNG CÁCH!
                        depthWrite: false
                    }));
                    child.material = newMats.length === 1 ? newMats[0] : newMats;
                }
                child.userData.isCloud = true;
                
                // 🌟 LƯU VÀO DANH SÁCH BẦU TRỜI ĐỂ LÀM LƯỚI ĐIỆN BẢO VỆ
                if (!window.danhSachBauTroi) window.danhSachBauTroi = [];
                window.danhSachBauTroi.push(child);
                
                continue; 
            }







            else {
                // 🌟 XỬ LÝ MẶT ĐẤT & BIỂN (TRÁI ĐẤT NGUYÊN KHỐI)
                child.frustumCulled = false;

                if (child.material) {
                    let mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(mat => {
                        mat.side = THREE.DoubleSide;
                        
                        // 🛑 TRỊ BỆNH NƯỚC ĐỨNG YÊN: Tắt bóng HDRI cho khối Trái Đất
                        mat.envMapIntensity = 0.0;

                        // Lọc nét bề mặt
                        if (mat.map && window.renderer) {
                            mat.map.anisotropy = window.renderer.capabilities.getMaxAnisotropy();
                        }
                        mat.needsUpdate = true;
                    });
                }

                if (child.geometry && typeof child.geometry.computeBoundsTree === 'function') {
                    child.geometry.computeBoundsTree();
                }








               if (!window.danhSachMap) window.danhSachMap = [];
                window.danhSachMap.push(child);
                window.matDatHanhTinhGoc.push(child); // 🌟 Lưu lại lưới va chạm
            }
        }
    });

    scene.add(mapHanhTinh);
    
    // 🌟 BỘ KIỂM SOÁT MAP GỐC: TỰ ĐỘNG TÀNG HÌNH KHI QUA BÍ CẢNH
    window.kiemSoatHanhTinhGoc = function() {
        if (!window.HANH_TINH_GOC) return;
        if (window.KIEU_TRONG_LUC === 'PHANG') {
            window.HANH_TINH_GOC.visible = false;
            // Gỡ khỏi Radar để Sếp không bị vấp phải mặt đất tàng hình
            if (window.danhSachMap && window.matDatHanhTinhGoc) {
                window.danhSachMap = window.danhSachMap.filter(m => !window.matDatHanhTinhGoc.includes(m));
            }
        } else {
            window.HANH_TINH_GOC.visible = true;
            // Trả lại Radar khi về Trung Châu
            if (window.danhSachMap && window.matDatHanhTinhGoc) {
                window.matDatHanhTinhGoc.forEach(m => {
                    if (!window.danhSachMap.includes(m)) window.danhSachMap.push(m);
                });
            }
        }
    };
    window.kiemSoatHanhTinhGoc();

    tienHanhTaiNhanVat();
});








// 🌟 TỔNG KHO ASSET TOÀN CẦU (BẢN VÁ LỖI THIẾU CHỮ THREE.)
window.tongKhoAsset3D = {};

window.taiHoacNhanBanAsset = function(url, callback) {
    if (!url || url.trim() === "") return;
    
    // Nếu trong kho đã có -> Photocopy
    if (window.tongKhoAsset3D[url]) {
        // 🌟 BẢN VÁ: Phải có chữ THREE. ở trước SkeletonUtils
        const cloneScene = THREE.SkeletonUtils.clone(window.tongKhoAsset3D[url].scene);
        callback(cloneScene, window.tongKhoAsset3D[url].animations);
        return;
    }

    // Nếu chưa có thì tải về và cất vào kho
    const loaderAsset = window.loaderSieuToc || new THREE.GLTFLoader();
    loaderAsset.load(url, (gltf) => {
        window.tongKhoAsset3D[url] = { scene: gltf.scene, animations: gltf.animations };
        
        // 🌟 BẢN VÁ: Phải có chữ THREE. ở trước SkeletonUtils
        const cloneScene = THREE.SkeletonUtils.clone(gltf.scene);
        callback(cloneScene, gltf.animations);
    });
};






window.chuanHoaKichThuoc = function (mesh, sizeMongMuon) {
    if (!mesh) return;

    mesh.scale.set(1, 1, 1);
    mesh.updateMatrixWorld(true);

    let chieuCaoThucTe = 0;
    let maxYBone = -Infinity;
    let minYBone = Infinity;
    let coXuong = false;

    // =========================================================
    // 🌟 BỘ THƯỚC ĐO CỘT SỐNG (CHUYÊN TRỊ MIXAMO/BLENDER)
    // Bỏ qua Box3. Đo trực tiếp từ gót chân đến đỉnh đầu của bộ xương!
    // =========================================================
    mesh.traverse((child) => {
        if (child.isBone) {
            coXuong = true;
            let pos = new THREE.Vector3();
            child.getWorldPosition(pos);
            if (pos.y > maxYBone) maxYBone = pos.y;
            if (pos.y < minYBone) minYBone = pos.y;
        }
    });

    if (coXuong && (maxYBone - minYBone) > 0.1) {
        // Chiều cao từ gót chân đến xương mắt/cổ + 15% bù cho đỉnh hộp sọ/tóc
        chieuCaoThucTe = (maxYBone - minYBone) * 1.15;
    } else {
        // Dành cho vũ khí, đá, cây, đồ vật (Không có xương thì xài Box3 như cũ)
        const box = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        chieuCaoThucTe = Math.max(size.x, size.y, size.z);
    }

    // Chống lỗi chia 0 hoặc vi khuẩn
    if (!isFinite(chieuCaoThucTe) || chieuCaoThucTe <= 0.0001) {
        chieuCaoThucTe = 1;
    }

    // Bơm tỷ lệ chuẩn 2.5m
    const tyLe = sizeMongMuon / chieuCaoThucTe;
    mesh.scale.setScalar(tyLe);
    mesh.updateMatrixWorld(true);

    // =========================================================
    // 🌟 NẮN LẠI TÂM NGỰC ĐỂ QUÁI CẮN / BẮN LAZER CHO CHUẨN
    // Tự động tính toán tâm ngực dựa trên tỷ lệ vừa bơm, không xài Box3 nữa!
    // =========================================================
    mesh.userData.chieuCaoThuc = sizeMongMuon;
    mesh.userData.tamThucTeLocal = new THREE.Vector3(0, chieuCaoThucTe / 2, 0);
};










function tienHanhTaiNhanVat() {
    let coThuCuoi = window.MOUNT_URL && window.MOUNT_URL.trim() !== "";
    if (coThuCuoi) {



        loader.load(window.MOUNT_URL, function(gltfMount) {
            let thuCuoiGoc = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(gltfMount.scene) : gltfMount.scene.clone();
            
            // ==========================================
            // 🌟 1. LỒNG VÔ HÌNH: Nhốt con thú vào Lồng để chống Kháng Thuốc!
            // ==========================================
            let thuCuoi = new THREE.Group();
            thuCuoi.add(thuCuoiGoc);
            
            // 🌟 2. ÉP CÂN CÁI LỒNG (Chứ không ép con thú trực tiếp)
            chuanHoaKichThuoc(thuCuoi, 15); 
            
            thuCuoi.position.set(TOA_DO_SPAWN.x, TOA_DO_SPAWN.y, TOA_DO_SPAWN.z);
            scene.add(thuCuoi);
            playerModel = window.playerModel = thuCuoi; 
            
            // 🌟 3. NÃO ĐIỀU KHIỂN: Chỉ cắm vào con thú gốc ở bên trong
            mixer = new THREE.AnimationMixer(thuCuoiGoc); animationsMap = {};
            
            // 🌟 4. TẨY NÃO TỶ LỆ: Lọc và Xóa sạch mọi mã lệnh tự động phóng to/thu nhỏ của Model trên mạng!
            gltfMount.animations.forEach(clip => { 
                clip.tracks = clip.tracks.filter(track => !track.name.includes('.scale'));
                animationsMap[clip.name.toUpperCase()] = mixer.clipAction(clip); 
            });
            // ==========================================

            loader.load(window.CURRENT_MODEL_URL, function(gltfChar) {

                // 🌟 CẮT ĐỨT DÂY THẦN KINH NGƯỜI CHƠI (CHỐNG BOSS MIMIC)
                let nhanVat = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(gltfChar.scene) : gltfChar.scene.clone();
                // 👉 DÁN THÊM ĐÚNG DÒNG NÀY ĐỂ PHÂN BIỆT RÕ NGƯỜI VÀ RỒNG:
                window.nhanVatChinh = nhanVat;

                chuanHoaKichThuoc(nhanVat, 2.5); 








                window.mixerNhanVatPhu = new THREE.AnimationMixer(nhanVat);

                // 🌟 NẠP BỘ CHIÊU THỨC CHO NGƯỜI CƯỠI (CHỮA BỆNH KHÚC CỦI)
                window.animationsMapChar = {};
                window.currentAnimNameChar = '';
                window.currentActionChar = null;
                gltfChar.animations.forEach(clip => {
                    clip.tracks = clip.tracks.filter(track => !track.name.includes('.scale'));
                    window.animationsMapChar[clip.name.toUpperCase()] = window.mixerNhanVatPhu.clipAction(clip);
                });

                if (gltfChar.animations.length > 0) {
                    window.currentActionChar = window.animationsMapChar['NHANROI'] || window.animationsMapChar['IDLE'] || window.mixerNhanVatPhu.clipAction(gltfChar.animations[0]);
                    if (window.currentActionChar) { window.currentActionChar.play(); window.currentAnimNameChar = 'IDLE'; }
                }








                // 1. ĐÃ XÓA `c.isBone` ĐỂ QUÉT ĐƯỢC MỌI LOẠI YÊN NGỰA!
                let xuongYenNgua = null;
                thuCuoi.traverse(c => { if (c.name.toUpperCase().includes('YENNGUA')) xuongYenNgua = c; });
                let chaCuaNhanVat = xuongYenNgua ? xuongYenNgua : thuCuoi;

                // ==========================================
                // 🛑 BẢN VÁ LỖI "CON KIẾN CƯỠI VŨ KHÍ" (THAY THẾ BƯỚC 2, 3, 4 CŨ)
                // ==========================================

                // Ký sinh nhân vật vào yên ngựa (hoặc thân thú cưỡi)
                chaCuaNhanVat.add(nhanVat);

                // Bơm kháng sinh: Lấy thẳng tỷ lệ gốc của thú cưỡi để tính toán, 
                // bỏ qua hàm getWorldScale() hay bị lỗi của Three.js
                let tyLeThuCuoi = thuCuoi.scale.x === 0 ? 1 : thuCuoi.scale.x;

                // Lấy tỷ lệ hiện tại của nhân vật chia ngược lại cho tỷ lệ của thú cưỡi
                nhanVat.scale.set(
                    nhanVat.scale.x / tyLeThuCuoi,
                    nhanVat.scale.y / tyLeThuCuoi,
                    nhanVat.scale.z / tyLeThuCuoi
                );
                // ==========================================

                // 5. BÍ THUẬT QUATERNION: ÉP MẶT NHÌN THEO THÂN RỒNG (Chống nằm sấp)
                nhanVat.position.set(0, 0, 0);
                let gocThuCuoi = new THREE.Quaternion();
                thuCuoi.getWorldQuaternion(gocThuCuoi);
                let gocYenNgua = new THREE.Quaternion();
                chaCuaNhanVat.getWorldQuaternion(gocYenNgua);
                nhanVat.quaternion.copy(gocYenNgua.invert().multiply(gocThuCuoi));






                if (typeof window.fixHieuUngDenThui === 'function') window.fixHieuUngDenThui(nhanVat);
                if (typeof window.bocHDRI_NhanVat === 'function') window.bocHDRI_NhanVat(nhanVat);
                if (typeof cayMatAdmin === 'function') cayMatAdmin(nhanVat);
                if (typeof loadVuKhiChoNhanVat === 'function') loadVuKhiChoNhanVat(nhanVat);
                if (typeof hoanTatTaiModels === 'function') hoanTatTaiModels();
            });
        });
    } else {
        loader.load(window.CURRENT_MODEL_URL, function (gltfChar) {
            // 🌟 CẮT ĐỨT DÂY THẦN KINH NGƯỜI CHƠI (CHỐNG BOSS MIMIC)
            playerModel = window.playerModel = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(gltfChar.scene) : gltfChar.scene.clone();

            window.nhanVatChinh = playerModel;

            
            let doCao = (window.ADMIN_NAME === "Admin") ? 2.5 : 2.5;
            chuanHoaKichThuoc(playerModel, doCao);
            playerModel.position.set(TOA_DO_SPAWN.x, TOA_DO_SPAWN.y, TOA_DO_SPAWN.z);
            scene.add(playerModel);
            mixer = new THREE.AnimationMixer(playerModel); animationsMap = {};
            gltfChar.animations.forEach((clip) => { 
                // 🛑 BẢN VÁ: Tẩy não Tỷ lệ (Scale) chống teo rút
                clip.tracks = clip.tracks.filter(track => !track.name.includes('.scale'));
                animationsMap[clip.name.toUpperCase()] = mixer.clipAction(clip); 
            });
            cayMatAdmin(playerModel); loadVuKhiChoNhanVat(playerModel); hoanTatTaiModels();
        });
    }
}




function loadVuKhiChoNhanVat(nhanVatDich) {
    // 🛑 LỆNH CẤM: Cung Thủ và Xạ Thủ tự có kịch bản vũ khí riêng, Engine không được can thiệp!
    if (window.SCRIPT_PHAI_CUA_TOI) {
        if (window.SCRIPT_PHAI_CUA_TOI.includes('phai_cungthu') || window.SCRIPT_PHAI_CUA_TOI.includes('phai_bansung')) {
            return;
        }
    }











    if (window.WEAPON_URL && window.WEAPON_URL.trim() !== "") {
        loader.load(window.WEAPON_URL, function (gltfW) {
            let vuKhi = gltfW.scene; 
            window.vuKhiModel = vuKhi;

            // 🌟 BẢN VÁ: KÍCH SÁNG KIM LOẠI CHO VŨ KHÍ
            if (typeof window.bocHDRI_NhanVat === 'function') {
                window.bocHDRI_NhanVat(vuKhi);
            }
            
            let tayCam = null;








            nhanVatDich.traverse(c => { 
                if (c.isBone && (c.name.toUpperCase().includes('HAND_R') || c.name.toUpperCase().includes('HAND_L'))) {
                    tayCam = c; 
                } 
            });

            if (tayCam) {
                tayCam.add(vuKhi);
                vuKhi.position.set(0, 0, 0); 
                console.log("⚔️ Đã gắn vũ khí vào xương:", tayCam.name);
            } else {
                nhanVatDich.add(vuKhi);
                vuKhi.position.set(1, 1, 0); 
            }
        });
    }
}



function hoanTatTaiModels() {
    if (window.ADMIN_NAME === "Admin") { window.MAU_TOI_DA = 999999999; window.mauBanThan = 999999999; }
    playerModel.traverse(function(child) { if (child.isMesh) child.frustumCulled = false; });
    
    // ==========================================
    // 🌟 BẢN VÁ: NẮN LẠI TRỤC XƯƠNG SỐNG NGAY KHI VỪA ĐĂNG NHẬP
    // ==========================================
    let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0,0,0);
    let huongLenTroiMoi = playerModel.position.clone().sub(tam);
    if (huongLenTroiMoi.lengthSq() < 0.001) huongLenTroiMoi.set(0, 1, 0); else huongLenTroiMoi.normalize();
    playerModel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenTroiMoi);
    playerModel.up.copy(huongLenTroiMoi);
    window.mucTieuBanKinhDat = playerModel.position.distanceTo(tam); // Khóa Radar chống văng lún


    playIdle(); 
            let manHinhLoading = document.getElementById('loading');
            if (manHinhLoading) manHinhLoading.style.display = 'none';

    
    if (window.HePhaiHienTai && typeof window.HePhaiHienTai.khoiTao === 'function') window.HePhaiHienTai.khoiTao();
}

function cayMatAdmin(modelGoc) {
    // Đã xóa bỏ chức năng gọi đôi mắt khổng lồ cho Admin
    return;
}

let idleTimer = null; 




function playAnim(animName) {
    let upName = animName.toUpperCase();
    if (window.dangMuaChieu && !upName.includes('CHIEU') && !upName.includes('ATTACK') && upName !== 'DIE' && upName !== 'DEATH') {
        return;
    }

    let dangCuoiThu = window.MOUNT_URL && window.MOUNT_URL.trim() !== "";
    let laChieuTanCong = upName.includes('CHIEU') || upName.includes('ATTACK') || upName === 'TANCONG' || upName === 'SKILL';

    // 🌟 LẮP CẢM BIẾN: MẶC ĐỊNH LÀ 1.5 GIÂY (Dự phòng)
    window.thoiGianAnimHienTai = 1500; 

    if (dangCuoiThu) {
        if (window.animationsMapChar) {
            let lenhChoNguoi = laChieuTanCong ? upName : 'IDLE';
            
            if (window.currentAnimNameChar !== lenhChoNguoi) {
                let actionChar = window.animationsMapChar[lenhChoNguoi];
                if (!actionChar && laChieuTanCong) actionChar = window.animationsMapChar['ATTACK'] || window.animationsMapChar['ATTACK1'] || window.animationsMapChar['SKILL'];
                if (!actionChar) actionChar = window.animationsMapChar['NHANROI'] || window.animationsMapChar['IDLE'];

                if (actionChar) {
                    if (window.currentActionChar) window.currentActionChar.fadeOut(0.2);
                    window.currentActionChar = actionChar;
                    window.currentActionChar.reset().fadeIn(0.2).play();
                    window.currentAnimNameChar = lenhChoNguoi;
                    
                    // 🌟 CẢM BIẾN ĐO THỜI GIAN ANIMATION CỦA NGƯỜI ĐANG CƯỠI
                    if (laChieuTanCong) window.thoiGianAnimHienTai = actionChar.getClip().duration * 1000;
                }
            }
        }

        if (laChieuTanCong) {
            let doCaoThucTe = 0;
            if (window.playerModel && window.TAM_HANH_TINH_HIEN_TAI) {
                doCaoThucTe = window.playerModel.position.distanceTo(window.TAM_HANH_TINH_HIEN_TAI) - (window.BAN_KINH_HANH_TINH_HIEN_TAI || 80000);
            }
            upName = (window.isMoving || window.isKeyboardMoving) ? (doCaoThucTe > 5.0 ? 'BAY' : 'CHAYBO') : 'IDLE';
        }
    }

    if (currentAnimName === upName) return; 
    let action = animationsMap[upName];
    if (!action) {
        if (upName === 'CHAYBO' || upName === 'RUN') action = animationsMap['RUN'] || animationsMap['WALK'] || animationsMap['RUNNING'];
        else if (upName === 'TANCONG' || upName.includes('CHIEU') || upName === 'ATTACK') action = animationsMap['ATTACK'] || animationsMap['ATTACK1'] || animationsMap['ATTACK01'] || animationsMap['BITE'] || animationsMap['SKILL'];
        else if (upName === 'NHANROI' || upName === 'IDLE') action = animationsMap['IDLE'] || animationsMap['WAIT'] || animationsMap['IDLE01'];
        else if (upName === 'BAY' || upName === 'FLY') action = animationsMap['FLY'] || animationsMap['JUMP'] || animationsMap['FALL'];
        else if (upName === 'DIE' || upName === 'DEATH') action = animationsMap['DEATH'] || animationsMap['DIE'];
    }
    if (!action && animationsMap && Object.keys(animationsMap).length > 0) action = animationsMap['TAKE 001'] || animationsMap[Object.keys(animationsMap)[0]];
    if (!action) return; 
    
    if (currentAction) currentAction.fadeOut(0.2); 
    currentAction = action; 
    currentAction.reset().fadeIn(0.2).play(); 
    currentAnimName = upName; 

    // 🌟 CẢM BIẾN ĐO THỜI GIAN ANIMATION (KHI ĐI BỘ TRÊN ĐẤT)
    if (!dangCuoiThu && laChieuTanCong) {
        window.thoiGianAnimHienTai = action.getClip().duration * 1000;
    }
}






window.epNhanVatMua = playAnim; 

function playIdle() {
    if (idleTimer) clearInterval(idleTimer); playAnim('NHANROI'); 
    idleTimer = setInterval(() => { if (!window.isMoving && !window.isKeyboardMoving) playAnim('NHANROI'); }, 8000); 
}

const clock = new THREE.Clock(); let lastSendTime = 0; 
const bayHud = document.createElement('div');
bayHud.id = 'bay-hud'; bayHud.style.cssText = 'position:fixed; bottom:20px; right:20px; background:rgba(0,15,30,0.8); border:2px solid #00ffff; box-shadow:0 0 10px #00ffff; padding:10px 15px; color:#00ffff; font-family:monospace; font-size:16px; border-radius:8px; z-index:9999; pointer-events:none; text-shadow:0 0 5px #00ffff;';
document.body.appendChild(bayHud);

// =========================================================================
// 🚀 VÒNG LẶP VẬT LÝ VÀ ĐỒNG BỘ
// =========================================================================
function animate() {
    // 🌟 GÀI ĐỒNG HỒ ĐO CPU (Bắt đầu tính giờ)
    window.CPU_START_TIME = performance.now();



    
    // 🌟 KIỂM TRA ĐẠP CHÂN VÀO SAFE ZONE
        if (typeof playerModel !== 'undefined' && playerModel) {
            let inSafe = false;
            if (typeof window.kiemTraSafeZone === 'function') {
                inSafe = window.kiemTraSafeZone(playerModel.position);
            }
            
            // Vừa bước vào hoặc vừa bước ra thì cập nhật Giao Diện (tránh lag)
            if (inSafe !== window.IS_IN_SAFE_ZONE) {
                window.IS_IN_SAFE_ZONE = inSafe;
                let uiSZ = document.getElementById('uiVungAnToan');
                
                // Tự động tạo Bảng thông báo nếu Sếp chưa có trong HTML
                if (!uiSZ) {
                    uiSZ = document.createElement('div');
                    uiSZ.id = 'uiVungAnToan';
                    uiSZ.innerHTML = '🕊️ Vùng An Toàn';
                    uiSZ.style.cssText = 'display:none; position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: rgba(46, 204, 113, 0.9); color: white; padding: 8px 30px; border-radius: 30px; font-weight: 900; font-size: 18px; border: 2px solid #fff; box-shadow: 0 0 15px #2ecc71; z-index: 9999; text-transform: uppercase;';
                    document.body.appendChild(uiSZ);
                }
                uiSZ.style.display = inSafe ? 'block' : 'none';
            }
            // 🌟 CẢM BIẾN TRUYỀN TỐNG TRẬN (ĐÃ ĐƯA VÀO ĐÚNG CHỖ)
            if (!window.dangDichChuyen && playerModel && window.DANH_SACH_CONG && window.DANH_SACH_CONG.length > 0) {
                for (let i = 0; i < window.DANH_SACH_CONG.length; i++) {
                    let cong = window.DANH_SACH_CONG[i];
                    // Lấy tâm cổng, nếu bước vào bán kính 3 mét -> Dịch!
                    if (playerModel.position.distanceTo(cong.mesh.position) < 3.0) {
                        window.thucHienTruyenTong(cong);
                        break;
                    }
                }
            }

        





        }




      requestAnimationFrame(animate);





    






    try {
        if (typeof playerModel !== 'undefined' && playerModel && window.ROLE === "admin") { window.mauBanThan = window.MAU_TOI_DA = 999999999; window.isDead = false; }
        const delta = typeof clock !== 'undefined' ? clock.getDelta() : 0.016;

        if (typeof mixer !== 'undefined' && mixer) mixer.update(delta);




        if (typeof window.mixerNhanVatPhu !== 'undefined' && window.mixerNhanVatPhu) window.mixerNhanVatPhu.update(delta);






        if (typeof window.MAP_MIXERS !== 'undefined') window.MAP_MIXERS.forEach(m => m.update(delta));
        // 🌟 BƠM THỜI GIAN ĐỂ KEYFRAME MÂY BAY HOẠT ĐỘNG
        if (window.mixerTraiDat) window.mixerTraiDat.update(delta);
        // 🌟 BẢN VÁ: CẤP THỜI GIAN CHO ANIMATION CỔNG DỊCH CHUYỂN
        if (window.TELEPORT_MIXERS) window.TELEPORT_MIXERS.forEach(m => m.update(delta));
        // ==========================================
        // 🌟 CẬP NHẬT HOẠT ẢNH & NẮN XƯƠNG NICK PHỤ (BẢN CHUẨN)
        // ==========================================
        if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers !== null) {
            for (let id in window.remotePlayers) {
                const remote = window.remotePlayers[id];
                if (remote && remote.status === 'ready') {
                    // 1. Cập nhật Animation 60FPS
                    if (remote.mixer) remote.mixer.update(delta);
                    if (remote.mixerChar) remote.mixerChar.update(delta);

                    // 2. Nắn xương cho bám vào mặt đất cầu
                    if (remote.mesh && window.TAM_HANH_TINH_HIEN_TAI) {
                        let huongLenTroi = remote.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                        let trucUpHienTai = new THREE.Vector3(0, 1, 0).applyQuaternion(remote.mesh.quaternion);
                        let nanTrucQuat = new THREE.Quaternion().setFromUnitVectors(trucUpHienTai, huongLenTroi);
                        remote.mesh.quaternion.premultiply(nanTrucQuat);
                    }
                }
            }
        }
        // 🌟 DI CHUYỂN VÒNG KHÓA MỤC TIÊU ĐUỔI THEO KẺ THÙ
        if (window.mucTieuHienTai && window.vongMucTieu && window.vongMucTieu.visible) {
            let tPos = window.mucTieuHienTai.mesh ? window.mucTieuHienTai.mesh.position : (window.mucTieuHienTai.position || null);
            if (tPos) {
                window.vongMucTieu.position.x = tPos.x;
                window.vongMucTieu.position.z = tPos.z;
                window.vongMucTieu.position.y = tPos.y + 0.5;
                window.vongMucTieu.rotation.z += 0.05; // Xoay radar cho ngầu
            }
        }

        if (typeof window.capNhatAIQuaiVat === 'function') window.capNhatAIQuaiVat(delta);

        if (typeof playerModel !== 'undefined' && playerModel && !window.isDead) {










            var viTriCu = playerModel.position.clone();














            // ===============================================
            // 🌍 LÕI TRỌNG LỰC V2 (HOVERCRAFT) - CỨU CPU TUYỆT ĐỐI
            // ===============================================

            if (window.KIEU_TRONG_LUC === 'PHANG') {
                // ----------------------------------------------------
                // 🟩 NHÁNH 1: XỬ LÝ VẬT LÝ CHO MAP PHẲNG (BÍ CẢNH / HẦM NGỤC)
                // ----------------------------------------------------
                var huongLenTroi = new THREE.Vector3(0, 1, 0); // Trời luôn ở hướng +Y
                var tamHanhTinh = new THREE.Vector3(0, 0, 0);  // Giả lập để không lỗi Camera
                var rHanhTinh = 0;

                if (!window.radarTrongLuc) { window.radarTrongLuc = new THREE.Raycaster(); window.radarTrongLuc.firstHitOnly = true; }
                if (typeof window.khungHinhRadar === 'undefined') window.khungHinhRadar = 0; window.khungHinhRadar++;

                let dangCuaDong = window.isMoving || window.isKeyboardMoving || (window.keys && (window.keys.space || window.keys.shift || window.keys.x || window.keys.c));

                // Radar bắn thẳng từ trên trời xuống
                if (window.khungHinhRadar % 3 === 0 || window.khungHinhRadar < 20) {
                    let tiaXuatPhat = playerModel.position.clone(); tiaXuatPhat.y += 50000;
                    window.radarTrongLuc.set(tiaXuatPhat, new THREE.Vector3(0, -1, 0));
                    window.radarTrongLuc.far = Infinity;
                    window.danhSachMap = window.danhSachMap.filter(obj => obj && typeof obj.raycast === 'function');
                    var intersects = window.radarTrongLuc.intersectObjects(window.danhSachMap, true);
                    if (intersects.length > 0) window.toaDoMatDat = intersects[0].point.y;
                }

                var matDatY = window.toaDoMatDat || 0;
                var doCao = playerModel.position.y - matDatY;

                // Nắn xương thẳng đứng
                playerModel.up.copy(huongLenTroi);
                playerModel.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0).applyQuaternion(playerModel.quaternion), huongLenTroi));

                var currentWalk = 0.15; var currentSprint = 0.4; var tangKhongGian = "VŨ TRỤ"; var mauChu = "#ff00ff"; var isFlying = doCao > 5.0;
                if (doCao <= 5.0) { currentWalk = 0.15; currentSprint = 0.4; tangKhongGian = "🌍 MẶT ĐẤT"; mauChu = "#00ff00"; }
                else if (doCao < 1000.0) { currentWalk = 0.5; currentSprint = 0.8; tangKhongGian = "⚔️ BẦU KHÍ QUYỂN"; mauChu = "#ffff00"; }
                else { currentWalk = 1.0; currentSprint = 2.0; tangKhongGian = "🚀 VŨ TRỤ SÂU"; mauChu = "#ff00ff"; }
                if (window.ROLE === 'admin' && tangKhongGian === "🚀 VŨ TRỤ SÂU") { currentWalk *= 15; currentSprint *= 15; }

                let dangChuDongDoiDoCao = false;



                if (window.keys && window.keys.space) {
                    dangChuDongDoiDoCao = true; window.isMoving = false;

                    // 🌟 BẢN VÁ: QUÉT TRẦN NHÀ TRƯỚC KHI BAY LÊN
                    if (!window.radarBauTroi) { window.radarBauTroi = new THREE.Raycaster(); window.radarBauTroi.far = 10; }
                    // Bắn tia từ đầu nhân vật hướng lên trời
                    window.radarBauTroi.set(playerModel.position, new THREE.Vector3(0, 1, 0));
                    let chamTran = window.radarBauTroi.intersectObjects(window.danhSachBauTroi || [], true);

                    if (chamTran.length === 0) {
                        playerModel.position.y += currentSprint; // Đường thông hè thoáng thì bay!
                    } else {
                        // Đã chạm vào lồng bầu trời, khóa độ cao lại!
                        if (typeof window.hienThongBaoBoGoc === 'function' && !window.dangBaoBauTroi) {
                            window.hienThongBaoBoGoc("☁️ Bạn đã chạm đến giới hạn Bầu Trời!", "#3498db");
                            window.dangBaoBauTroi = true;
                            setTimeout(() => window.dangBaoBauTroi = false, 2000);
                        }
                    }
                    if (typeof playAnim === 'function') playAnim('BAY');
                }



            } else if (window.keys && (window.keys.shift || window.keys.x || window.keys.c)) {
                dangChuDongDoiDoCao = true; window.isMoving = false;
                if (doCao > 0) { playerModel.position.y -= currentSprint; if (playerModel.position.y < matDatY) playerModel.position.y = matDatY; }
                if (typeof playAnim === 'function') playAnim('BAY');
            }

            var huongDiChuyen = new THREE.Vector3(0, 0, 0); var tocDoHienTaiThucTe = 0;
            window.isKeyboardMoving = window.keys && (window.keys.w || window.keys.a || window.keys.s || window.keys.d);

            if (window.isKeyboardMoving) {
                window.isMoving = false;
                if (typeof playAnim === 'function') playAnim(isFlying ? 'BAY' : 'CHAYBO');
                const forward = new THREE.Vector3(); if (typeof camera !== 'undefined') camera.getWorldDirection(forward);
                forward.y = 0; forward.normalize();
                if (forward.lengthSq() === 0) forward.set(0, 0, -1).applyQuaternion(playerModel.quaternion).setY(0).normalize();
                const right = new THREE.Vector3().crossVectors(forward, huongLenTroi).normalize();

                if (window.keys.w) huongDiChuyen.add(forward); if (window.keys.s) huongDiChuyen.sub(forward);
                if (window.keys.a) huongDiChuyen.sub(right); if (window.keys.d) huongDiChuyen.add(right); huongDiChuyen.normalize();

                if (huongDiChuyen.length() > 0) {
                    let yTruoc = playerModel.position.y;
                    playerModel.position.add(huongDiChuyen.clone().multiplyScalar(currentSprint));
                    if (!dangChuDongDoiDoCao) {
                        if (yTruoc - matDatY < 3.0) playerModel.position.y = THREE.MathUtils.lerp(playerModel.position.y, matDatY, 0.3);
                        else playerModel.position.y = yTruoc;
                    }
                    let targetMat = new THREE.Matrix4().lookAt(playerModel.position, playerModel.position.clone().sub(huongDiChuyen), huongLenTroi);
                    playerModel.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.2);
                    tocDoHienTaiThucTe = currentSprint;
                }
            } else if (window.isMoving && typeof window.targetPosition !== 'undefined') {
                let vecToTarget = new THREE.Vector3().subVectors(window.targetPosition, playerModel.position);
                if (vecToTarget.length() > 2.0) {
                    let huongBayThang = vecToTarget.clone().normalize();
                    if (typeof playAnim === 'function') playAnim(doCao > 5.0 ? 'BAY' : 'CHAYBO');
                    playerModel.position.add(huongBayThang.multiplyScalar(currentSprint)); tocDoHienTaiThucTe = currentSprint;
                    let targetMat = new THREE.Matrix4().lookAt(playerModel.position, playerModel.position.clone().sub(huongBayThang), huongLenTroi);
                    playerModel.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.2);
                    if (playerModel.position.y - matDatY < 0.1) playerModel.position.y = THREE.MathUtils.lerp(playerModel.position.y, matDatY, 0.3);
                } else {
                    window.isMoving = false; if (typeof playIdle === 'function') playIdle();
                    if (window.vongMucTieu) window.vongMucTieu.visible = false;
                }
            } else {
                if (window.keys && !window.keys.space) {
                    if (isFlying) { if (typeof playAnim === 'function') playAnim('BAY'); } else { if (typeof playIdle === 'function') playIdle(); }
                }
                if (!dangChuDongDoiDoCao && doCao < 0.05) playerModel.position.y = matDatY; // Chống lún cỏ
            }
        }

    }else{
                // ----------------------------------------------------
                // 🌎 NHÁNH 2: XỬ LÝ VẬT LÝ CHO HÀNH TINH CẦU (BẢN GỐC CỦA SẾP GIỮ NGUYÊN)
                // ----------------------------------------------------
                var diemChamDat = null;
                var huongLenTroiMoi = playerModel.up.clone();


                var timThayDat = false;


                if (!window.radarTrongLuc) {
                    window.radarTrongLuc = new THREE.Raycaster();
                    // 🌟 LỆNH TỐI THƯỢNG CỦA BVH: Chỉ cần chạm đất là dừng quét, bỏ qua mọi thứ bên dưới!
                    window.radarTrongLuc.firstHitOnly = true;
                }

                var hanhTinhGanNhat = null;
                var tamHanhTinh = new THREE.Vector3(0, 0, 0);





                // --- 1. BỘ CẢM BIẾN TIẾT KIỆM CPU (MẮT ĐẠI BÀNG) ---
                huongLenTroiMoi.subVectors(playerModel.position, tamHanhTinh).normalize();
                timThayDat = true;
                hanhTinhGanNhat = true;

                if (typeof window.khungHinhRadar === 'undefined') window.khungHinhRadar = 0;
                window.khungHinhRadar++;

                let dangCuaDong = window.isMoving || window.isKeyboardMoving || (window.keys && (window.keys.space || window.keys.shift || window.keys.x || window.keys.c));

                // 🌟 VẪN ÉP XUNG CPU: Chỉ tính toán nặng 3 khung hình/lần để chống giật lag
                if (window.khungHinhRadar % 3 === 0 || window.khungHinhRadar < 20) {
                    // Đổi 500000 thành 50000 (Tia laser không cần bắn từ quá xa nữa)
                    let tiaXuatPhat = tamHanhTinh.clone().add(huongLenTroiMoi.clone().multiplyScalar(50000));
                    window.radarTrongLuc.set(tiaXuatPhat, huongLenTroiMoi.clone().negate());

                    window.radarTrongLuc.set(tiaXuatPhat, huongLenTroiMoi.clone().negate());

                    // 🛑 THÁO KÍNH CẬN: Phá bỏ giới hạn 1000m, cho tia Laser quét dài vô tận!
                    window.radarTrongLuc.far = Infinity;

                    // 🛑 LÁ CHẮN 2: Lọc bỏ ngay lập tức các vật thể bị lỗi/mất raycast trước khi quét
                    window.danhSachMap = window.danhSachMap.filter(obj => obj && typeof obj.raycast === 'function');

                    var intersects = window.radarTrongLuc.intersectObjects(window.danhSachMap, true);
                    if (intersects.length > 0) {
                        window.mucTieuBanKinhDat = tamHanhTinh.distanceTo(intersects[0].point);
                    }
                }





                // Sửa 82576.0 thành 10000.0
                var rHanhTinh = window.mucTieuBanKinhDat || 10000.0;
                window.TAM_HANH_TINH_HIEN_TAI = tamHanhTinh.clone();
                window.BAN_KINH_HANH_TINH_HIEN_TAI = rHanhTinh;




                // --- 2. ĐO ĐỘ CAO THỰC TẾ ---
                var doCao = playerModel.position.distanceTo(tamHanhTinh) - rHanhTinh;

                // --- 3. NẮN XƯƠNG SỐNG ---
                if (timThayDat) {
                    let tocDoNanXuong = (doCao > 20000) ? 0.005 : 0.05;
                    playerModel.up.lerp(huongLenTroiMoi, tocDoNanXuong).normalize();
                }
                var huongLenTroi = playerModel.up.clone();








                // --- 4. VẬN TỐC ---
                var currentWalk = 0.15; var currentSprint = 0.4; var tangKhongGian = "VŨ TRỤ"; var mauChu = "#ff00ff"; var isFlying = doCao > 5.0;

                if (doCao <= 5.0 && timThayDat) { currentWalk = 0.15; currentSprint = 0.4; tangKhongGian = "🌍 MẶT ĐẤT"; mauChu = "#00ff00"; }
                else if (doCao < 1000.0 && timThayDat) { currentWalk = 0.5; currentSprint = 0.8; tangKhongGian = "⚔️ BẦU KHÍ QUYỂN"; mauChu = "#ffff00"; }
                else {
                    // 🛑 SỬA TỐC ĐỘ VŨ TRỤ: Trả về mức hợp lý (Từ 250.0 xuống 2.0)
                    currentWalk = 1.0; currentSprint = 2.0;
                    tangKhongGian = "🚀 VŨ TRỤ SÂU"; mauChu = "#ff00ff";
                }

                if (window.ROLE === 'admin') {
                    if (tangKhongGian === "🚀 VŨ TRỤ SÂU") { currentWalk *= 15; currentSprint *= 15; } // Admin bay nhanh gấp 5 lần
                }

                // --- 5. BAY LÊN / HẠ XUỐNG ---
                let dangChuDongDoiDoCao = false;

                if (window.keys && window.keys.space) {
                    dangChuDongDoiDoCao = true;
                    window.isMoving = false;

                    // 🌟 MỞ KHÓA BẦU TRỜI: Xóa chốt chặn 1000m, cho phép bay thẳng ra vô cực!
                    playerModel.position.add(huongLenTroi.clone().multiplyScalar(currentSprint));

                    if (typeof playAnim === 'function') playAnim('BAY');

                } else if (window.keys && (window.keys.shift || window.keys.x || window.keys.c)) {
                    dangChuDongDoiDoCao = true;
                    window.isMoving = false;
                    if (doCao > 0) {
                        playerModel.position.add(huongLenTroi.clone().multiplyScalar(-currentSprint));
                        // Chống lún khi ấn shift hạ cánh
                        if (playerModel.position.distanceTo(tamHanhTinh) < rHanhTinh + 0.1) {
                            playerModel.position.copy(tamHanhTinh).add(huongLenTroi.clone().multiplyScalar(rHanhTinh + 0.1));
                        }
                    }
                    if (typeof playAnim === 'function') playAnim('BAY');
                }











                // --- 6. HỆ THỐNG DI CHUYỂN HOVERCRAFT (CHỐNG VẤP 100%) ---
                var huongDiChuyen = new THREE.Vector3(0, 0, 0);
                window.isKeyboardMoving = window.keys && (window.keys.w || window.keys.a || window.keys.s || window.keys.d);
                var tocDoHienTaiThucTe = 0;

                if (window.isKeyboardMoving) {
                    window.isMoving = false;
                    if (typeof playAnim === 'function') playAnim(isFlying ? 'BAY' : 'CHAYBO');

                    const forward = new THREE.Vector3(); if (typeof camera !== 'undefined') camera.getWorldDirection(forward);
                    forward.projectOnPlane(huongLenTroi).normalize(); // Luôn trượt trên mặt phẳng song song bầu trời

                    if (forward.lengthSq() === 0) forward.set(0, 0, -1).applyQuaternion(playerModel.quaternion).projectOnPlane(huongLenTroi).normalize();
                    const right = new THREE.Vector3().crossVectors(forward, huongLenTroi).normalize();

                    if (window.keys.w) huongDiChuyen.add(forward); if (window.keys.s) huongDiChuyen.sub(forward);
                    if (window.keys.a) huongDiChuyen.sub(right); if (window.keys.d) huongDiChuyen.add(right); huongDiChuyen.normalize();





                    if (huongDiChuyen.length() > 0) {
                        // 🌟 LƯU LẠI ĐỘ CAO (Để làm chuẩn ép quỹ đạo cong)
                        let doCaoTruocKhiChay = playerModel.position.distanceTo(tamHanhTinh);

                        // 1. Phóng về phía trước (Hướng di chuyển thẳng)
                        playerModel.position.add(huongDiChuyen.clone().multiplyScalar(currentSprint));

                        // 2. 🌟 THUẬT TOÁN ÉP QUỸ ĐẠO CONG (CHỐNG VĂNG VŨ TRỤ)
                        if (!dangChuDongDoiDoCao) {
                            let vecTam = playerModel.position.clone().sub(tamHanhTinh).normalize();

                            if (doCaoTruocKhiChay < rHanhTinh + 3.0) {
                                // A. Nếu đang sát đất -> Bám sát cỏ (Trượt mượt mà lên dốc/xuống đồi)
                                let viTriDat = tamHanhTinh.clone().add(vecTam.multiplyScalar(rHanhTinh + 0.1));
                                playerModel.position.lerp(viTriDat, 0.3);
                            } else {
                                // B. Nếu đang lơ lửng trên không -> Ép ôm tròn theo tâm hành tinh, duy trì đúng độ cao cũ!
                                let viTriCong = tamHanhTinh.clone().add(vecTam.multiplyScalar(doCaoTruocKhiChay));
                                playerModel.position.copy(viTriCong);
                            }
                        }

                        // Xoay mặt nhân vật
                        let targetMat = new THREE.Matrix4().lookAt(playerModel.position, playerModel.position.clone().sub(huongDiChuyen), huongLenTroi);
                        playerModel.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.2);
                        tocDoHienTaiThucTe = currentSprint;
                    }








                } else if (window.isMoving && typeof window.targetPosition !== 'undefined') {
                    let viTriHienTai = playerModel.position.clone();
                    let vecToTarget = new THREE.Vector3().subVectors(window.targetPosition, viTriHienTai);
                    let khoangCachConLai = vecToTarget.length();

                    if (khoangCachConLai > 2.0) {
                        // 🌟 LAO 3D TỰ DO: Không dùng projectOnPlane nữa, đâm thẳng xuống đất!
                        let huongBayThang = vecToTarget.clone().normalize();

                        // 🌟 1. ANIMATION: Sát đất thì đi bộ, trên không thì thế bay
                        if (typeof playAnim === 'function') {
                            playAnim(doCao > 5.0 ? 'BAY' : 'CHAYBO');
                        }

                        // 🌟 2. ĐỒNG BỘ TỐC ĐỘ 100%: Dùng chung biến với WASD
                        // Biến này đã tự thay đổi theo độ cao (Vũ trụ: 2.0 | Khí quyển: 0.8 | Đất: 0.4)
                        // Và cũng đã tự x5 nếu Sếp là Admin ở trên kia rồi!
                        let tocDoThucTe = currentSprint;

                        // Thực hiện di chuyển
                        playerModel.position.add(huongBayThang.multiplyScalar(tocDoThucTe));
                        tocDoHienTaiThucTe = tocDoThucTe;

                        // 3. Xoay mặt về hướng mục tiêu, giữ lưng thẳng theo trọng lực hành tinh
                        let targetMat = new THREE.Matrix4().lookAt(playerModel.position, playerModel.position.clone().sub(huongBayThang), huongLenTroi);
                        playerModel.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.2);

                        // 4. Hệ thống chống lún đất (Hạ cánh mềm)
                        if (hanhTinhGanNhat && rHanhTinh > 0) {
                            let dCenter = playerModel.position.distanceTo(tamHanhTinh);
                            let vecTam = playerModel.position.clone().sub(tamHanhTinh).normalize();

                            if (dCenter < rHanhTinh + 0.1) {
                                let viTriDat = tamHanhTinh.clone().add(vecTam.multiplyScalar(rHanhTinh + 0.1));
                                // Lerp để hạ cánh cực êm, không bị giật cục
                                playerModel.position.lerp(viTriDat, 0.3);
                            }
                        }

                    } else {
                        // Đã tới nơi -> Dừng lại
                        window.isMoving = false;
                        if (typeof playIdle === 'function') playIdle();
                        if (window.vongMucTieu && !window.mucTieuHienTai) window.vongMucTieu.visible = false;
                    }
                } else {








                    if (window.keys && !window.keys.space) {
                        if (isFlying) { if (typeof playAnim === 'function') playAnim('BAY'); }
                        else if (currentAnimName === 'CHAYBO' || currentAnimName === 'DIBO' || currentAnimName === 'BAY') { if (typeof playIdle === 'function') playIdle(); }
                    }



                    // 🌟 BẢN VÁ TRỌNG LỰC: XÓA RƠI TỰ DO ĐỂ NHÂN VẬT LƠ LỬNG TRÊN TRỜI
                    if (!dangChuDongDoiDoCao) {
                        let dCenter = playerModel.position.distanceTo(tamHanhTinh);
                        let vecTam = playerModel.position.clone().sub(tamHanhTinh).normalize();

                        if (dCenter < rHanhTinh + 0.05) {
                            // Vẫn giữ lại phần CHỐNG LÚN: Đang lún dưới gầm đất -> Đẩy nhẹ lên mặt cỏ
                            let viTriDat = tamHanhTinh.clone().add(vecTam.multiplyScalar(rHanhTinh + 0.05));
                            playerModel.position.copy(viTriDat);
                        }
                        // 🛑 Đã xóa đoạn rơi (-9.8). Nếu lơ lửng trên không (dCenter > rHanhTinh), 
                        // nhân vật sẽ tiếp tục giữ nguyên độ cao, không bị kéo xuống nữa!

                    }
                }
            }
            // 🌟 1. BÍ THUẬT NẮN XƯƠNG
            if (playerModel && typeof huongLenTroi !== 'undefined') {
                if (!window.isMoving) {
                    let trucUpHienTai = new THREE.Vector3(0, 1, 0).applyQuaternion(playerModel.quaternion);
                    let nanTrucQuat = new THREE.Quaternion().setFromUnitVectors(trucUpHienTai, huongLenTroi);
                    playerModel.quaternion.premultiply(nanTrucQuat);
                }
            }






            // ==========================================
            // 🌟 BƠM VÒNG TRÒN SAFE ZONE THEO ĐỘ CAO (BẢN VÁ BỊ THIẾU LÚC TRƯỚC)
            // ==========================================
            if (window.isSettingSafeZone && playerModel && window.vongTronSafeZone && window.TAM_HANH_TINH_HIEN_TAI) {
                let rHanhTinh = window.BAN_KINH_HANH_TINH_HIEN_TAI || 80000;
                let pPos = playerModel.position;

                // Tính độ cao hiện tại của Sếp so với mặt đất
                let distToCenter = pPos.distanceTo(window.TAM_HANH_TINH_HIEN_TAI);
                let alt = distToCenter - rHanhTinh;

                // Công thức ma thuật: Bán kính tối thiểu 100m, Sếp càng bay cao vòng càng to!
                window.banKinhĐangĐo = Math.max(500, alt * 1.5);
                let textHienThi = document.getElementById('szRadiusDisplay');
                if (textHienThi) textHienThi.innerText = Math.floor(window.banKinhĐangĐo);





                // Bắn 1 tia thẳng từ chân Sếp xuống mặt đất để làm tâm
                let groundDir = new THREE.Vector3(0, 1, 0);
                if (window.KIEU_TRONG_LUC !== 'PHANG') {
                    groundDir = pPos.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                    window.toaDoTamĐangĐo = window.TAM_HANH_TINH_HIEN_TAI.clone().add(groundDir.multiplyScalar(rHanhTinh + 1.0)); // Nổi lên 1m cho dễ nhìn
                } else {
                    window.toaDoTamĐangĐo = new THREE.Vector3(pPos.x, (window.toaDoMatDat || 0) + 1.0, pPos.z);
                }





                // Ép vòng tròn bám sát mặt đất và phình to
                window.vongTronSafeZone.position.copy(window.toaDoTamĐangĐo);
                window.vongTronSafeZone.scale.set(window.banKinhĐangĐo, window.banKinhĐangĐo, 1);
                window.vongTronSafeZone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), groundDir);
            }







            // Cập nhật giao diện Đồng hồ đo
            if (document.getElementById('bay-hud')) {
                let kmh = Math.round(tocDoHienTaiThucTe * 216); if (window.keys && window.keys.space) kmh = Math.round(3.0 * 216);
                if (!isKeyboardMoving && !window.isMoving && (!window.keys || !window.keys.space)) kmh = 0;
                document.getElementById('bay-hud').style.color = mauChu; document.getElementById('bay-hud').style.borderColor = mauChu; document.getElementById('bay-hud').style.boxShadow = `0 0 10px ${mauChu}`;
                document.getElementById('bay-hud').innerHTML = `TẦNG: <b>${tangKhongGian}</b><br>ĐỘ CAO: <b>${doCao === 9999 ? 'VÔ TẬN' : Math.max(0, Math.round(doCao)) + ' m'}</b><br>TỐC ĐỘ: <b>${kmh} KM/H</b>`;
            }















            // --- 8. HỆ THỐNG CAMERA CON DIỀU (KITE CAMERA V2 - BẮT XƯƠNG LƯNG) ---
            if (!window.fakeCam) {
                window.fakeCam = new THREE.PerspectiveCamera();
                window.fakeCam.position.set(0, 10, 15);
                if (typeof controls !== 'undefined' && controls) {
                    controls.object = window.fakeCam; 
                    controls.target.set(0, 2, 0); 
                }
            }

            if (typeof camera !== 'undefined' && !window.dangKhoaCamera) {
                camera.up.copy(huongLenTroi);
                
                let trucY = huongLenTroi.clone(); 
                if (!window.trucX_Cam) window.trucX_Cam = new THREE.Vector3(1, 0, 0);
                
                let trucX = window.trucX_Cam.clone().projectOnPlane(trucY).normalize();
                if (trucX.lengthSq() === 0) trucX.set(0, 0, 1).cross(trucY).normalize();
                window.trucX_Cam.copy(trucX);
                
                let trucZ = new THREE.Vector3().crossVectors(trucX, trucY).normalize(); 
                trucX.crossVectors(trucY, trucZ).normalize(); 
                
                let maTranXoay = new THREE.Matrix4().makeBasis(trucX, trucY, trucZ);
                let maTranNguoc = new THREE.Matrix4().copy(maTranXoay).invert();

                // 🪁 HIỆU ỨNG CON DIỀU KHI CÓ GIA TỐC CAO
                let vecDiChuyen = new THREE.Vector3().subVectors(playerModel.position, viTriCu);
                let tocDoKhungHinh = vecDiChuyen.length();

                // Chỉ căng dây diều khi Sếp phóng đi (Tốc độ > 1.0)
                if (tocDoKhungHinh > 1.0) {
                    // 🌟 BÍ THUẬT LẤY LƯNG VÀ ĐẦU TUYỆT ĐỐI TỪ MÔ HÌNH BLENDER (-Y)
                    // Dùng chính ma trận xoay của nhân vật để tìm ra "Sau lưng" và "Đỉnh đầu"
                    // Bất chấp Sếp bay lộn nhào hay cắm đầu lên trời, Camera luôn nằm đúng vị trí!
                    let huongLung = new THREE.Vector3(0, 0, -1).applyQuaternion(playerModel.quaternion).normalize();
                    let huongDau = new THREE.Vector3(0, 1, 0).applyQuaternion(playerModel.quaternion).normalize();

                    // Vị trí mỏ neo: Kéo ra sau lưng 25m, bay cao hơn đỉnh đầu 8m
                    let offsetWorld = huongLung.multiplyScalar(25).add(huongDau.multiplyScalar(8));
                    
                    let offsetLocal = offsetWorld.applyMatrix4(maTranNguoc);
                    let fakeCamDich = controls.target.clone().add(offsetLocal);
                    
                    // 🌟 NỚI LỎNG DÂY DIỀU: Giảm lực kéo từ 0.05 xuống 0.015 (Rất êm)
                    // Ở mức 0.015, con diều sẽ trôi từ từ ra sau lưng, Sếp hoàn toàn có thể dùng chuột
                    // để xoay góc nhìn ngắm cảnh trong lúc đang lao đi với tốc độ ánh sáng!
                    window.fakeCam.position.lerp(fakeCamDich, 0.015); 
                }

                // 3. XUẤT HÌNH ẢNH
                if (typeof controls !== 'undefined' && controls) controls.update(); 

                let offset = new THREE.Vector3().subVectors(window.fakeCam.position, controls.target);
                offset.applyMatrix4(maTranXoay);
                
                camera.position.copy(playerModel.position).add(offset);
                
               // (Code cũ của Sếp) Nhìn ngang qua khỏi đầu nhân vật 2 mét
                camera.lookAt(playerModel.position.clone().add(trucY.clone().multiplyScalar(2.0)));
                
                // =======================================================
                // 🌟 BẢN VÁ: HỆ THỐNG CHỐNG LÚN CAMERA CHO HÀNH TINH CẦU
                // =======================================================
                // 1. Đo khoảng cách từ Camera đến Tâm lõi Trái Đất
                let vecCamTuTam = camera.position.clone().sub(tamHanhTinh);
                let khoangCachCam = vecCamTuTam.length();

                // 2. Định nghĩa độ cao an toàn (Bán kính đất + 0.5 mét để không bị liếm cỏ)
                let doCaoAnToan = rHanhTinh + 0.5;

                // 3. Nếu Sếp xoay chuột làm Camera chui xuống gầm đất...
                if (khoangCachCam < doCaoAnToan) {
                    // ... Lập tức đẩy Camera trồi lên, trượt mượt mà trên mặt cỏ!
                    vecCamTuTam.normalize().multiplyScalar(doCaoAnToan);
                    camera.position.copy(tamHanhTinh).add(vecCamTuTam);
                }
                // =======================================================

            } // -> Đây là dấu ngoặc đóng của khối "if (typeof camera !== 'undefined' && !window.dangKhoaCamera)"


        }



        if (window.HePhaiHienTai) { if (typeof window.HePhaiHienTai.capNhat === 'function') window.HePhaiHienTai.capNhat(); if (typeof window.HePhaiHienTai.vongLapVatLy === 'function') window.HePhaiHienTai.vongLapVatLy(); }
        if (typeof updateCombatTuTien === 'function') updateCombatTuTien(); if (typeof window.updateCombatLuyenThe === 'function') window.updateCombatLuyenThe(); if (typeof updateCombatCungThu === 'function') updateCombatCungThu(); if (typeof updateCombatPhapSu === 'function') updateCombatPhapSu(); if (typeof updateCombatLazer === 'function') updateCombatLazer(); if (typeof updateCombatBanSung === 'function') updateCombatBanSung();

        try {
            if (typeof window.room !== 'undefined' && window.room && window.room.state === 'connected' && typeof playerModel !== 'undefined' && playerModel) {
                const now = Date.now();
                if (!window.oldPosLK) window.oldPosLK = new THREE.Vector3();




                let isPosChanged = playerModel.position.distanceTo(window.oldPosLK) > 0.1;
                let isAnimChanged = currentAnimName !== window.oldAnimLK; // 🌟 Cảm biến phát hiện đổi chiêu
                let lastSend = window.lastSendTime || 0;

                // Nếu di chuyển HOẶC vừa vung tay xuất chiêu thì gửi data ngay lập tức!
                if (!window.dangLuot && (now - lastSend > 3000 || ((isPosChanged || isAnimChanged) && now - lastSend > 80))) {
                    window.oldAnimLK = currentAnimName; // Lưu lại




                    // 🌟 LẤY ANIMATION CỦA NGƯỜI (Bao gồm cả lúc đi bộ và lúc cưỡi thú)
                    let animNguoiChoi = currentAnimName || 'IDLE';
                    if (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") {
                        animNguoiChoi = window.currentAnimNameChar || 'IDLE'; // Gửi chiêu thức của người cưỡi
                    }

                    // 🌟 LẤY TRẠNG THÁI HIỂN THỊ VŨ KHÍ BẢN THÂN
                    let vuKhiHienThi = 1; 
                    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_cungthu')) {
                        vuKhiHienThi = (window.cungTrenTay && window.cungTrenTay.visible) ? 1 : 0;
                    } else {
                        vuKhiHienThi = (window.vuKhiModel && window.vuKhiModel.visible) ? 1 : 0;
                    }

                    const myPosArr = [
                        1, parseFloat(playerModel.position.x.toFixed(2)), parseFloat(playerModel.position.y.toFixed(2)), parseFloat(playerModel.position.z.toFixed(2)),
                        parseFloat(playerModel.rotation.x.toFixed(2)), parseFloat(playerModel.rotation.y.toFixed(2)), parseFloat(playerModel.rotation.z.toFixed(2)),
                        parseFloat(playerModel.scale.x.toFixed(2)), typeof window.mauBanThan !== 'undefined' ? Math.round(window.mauBanThan) : 100, typeof window.MAU_TOI_DA !== 'undefined' ? Math.round(window.MAU_TOI_DA) : 100,
                        animNguoiChoi, // Đã fix gửi đúng chiêu thức của người!
                        typeof window.CURRENT_MODEL_URL !== 'undefined' ? window.CURRENT_MODEL_URL : '', 
                        typeof window.WEAPON_URL !== 'undefined' ? window.WEAPON_URL : '', 
                        typeof window.MOUNT_URL !== 'undefined' ? window.MOUNT_URL : '', 
                        typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' ? window.SCRIPT_PHAI_CUA_TOI : '',
                        vuKhiHienThi // 🌟 VŨ KHÍ LIVE: Nhét thêm biến Tàng hình vào Data gửi đi!
                    ];




                    try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(myPosArr)), { reliable: false }); } catch (e) { }

                    // 🌟 CẬP NHẬT LẠI THỜI GIAN VÀO ĐÚNG BIẾN WINDOW
                    window.lastSendTime = now;
                    window.oldPosLK.copy(playerModel.position);
                }
            }
        } catch (netErr) { }


        // ... (khúc cuối của hàm animate)
        
        // 🌟 CHỐT ĐỒNG HỒ CPU (Trừ đi thời gian lúc nãy)
        window.CPU_TIME_MS = performance.now() - window.CPU_START_TIME;

        if (typeof composer !== 'undefined' && composer) { composer.render(); } else if (typeof renderer !== 'undefined' && renderer && typeof scene !== 'undefined' && typeof camera !== 'undefined') { renderer.render(scene, camera); }
    } catch (err) {
        console.error("Lỗi chí mạng trong Animate:", err);
    }
}




        
animate();




setInterval(() => {
    if (typeof playerModel !== 'undefined' && playerModel && !window.isDead) {
        let fd = new FormData();
        fd.append('x', playerModel.position.x.toFixed(2)); 
        fd.append('y', playerModel.position.y.toFixed(2)); 
        fd.append('z', playerModel.position.z.toFixed(2));
        // 🌟 BÁO CÁO LUÔN KHU VỰC ĐANG ĐỨNG ĐỂ CHỐNG KẸT MAP KHI F5
        fd.append('zone_id', window.ZONE_ID || 'TRUNG_CHAU'); 
        
        fetch('api/save_pos.php', { method: 'POST', body: fd }).catch(err => { });
    }
}, 5000);



// ==========================================
// 🌍 ĐỘNG CƠ STREAMING BẢN ĐỒ AAA (BÁN KÍNH 140.000M)
// ==========================================
window.MAP_MIXERS = [];
window.THONG_TIN_CAC_MAP = []; // Kho chứa tọa độ, không tốn RAM


// 1. CHỈ LẤY TỌA ĐỘ TỪ SQL VỀ (KHÔNG TẢI 3D LÚC NÀY)
window.loadTatCaMapTuSQL = function (zoneId = window.ZONE_ID) {
    // Gọi API kèm theo Tên Khu Vực
    fetch('api/get_maps.php?zone=' + zoneId).then(res => res.json()).then(data => {
        if (data.status === 'success' && data.data) {
            window.THONG_TIN_CAC_MAP = data.data.map(m => ({
                ...m, isLoaded: false, isLoading: false, mesh3D: null, mixer: null, matDatMeshes: []
            }));
            



            // 🌟 CÔNG TẮC ĐA VŨ TRỤ: Nhìn vào Data SQL xem Map này là Tròn hay Phẳng để gạt cần số!
            if (data.data.length > 0 && data.data[0].gravity_type) {
                window.KIEU_TRONG_LUC = data.data[0].gravity_type;
            } else {
                // 🌟 LÁ CHẮN HƯ KHÔNG: Nếu khu vực này chưa có Map nào, Mặc định gạt sang PHẲNG để người chơi lơ lửng an toàn!
                window.KIEU_TRONG_LUC = 'PHANG';
                window.toaDoMatDat = 0; // Set sẵn mặt cỏ ở 0 để Sếp đáp xuống từ độ cao 15m
            }









           console.log(`🗺️ XUYÊN KHÔNG: Đã nạp khu vực [${zoneId}] - Trọng lực hiện tại: ${window.KIEU_TRONG_LUC}`);
            
            // 🌟 BẬT/TẮT TRÁI ĐẤT GỐC NGAY LẬP TỨC
            if (typeof window.kiemSoatHanhTinhGoc === 'function') window.kiemSoatHanhTinhGoc();

        }
    }).catch(err => console.error(err));
};






setTimeout(() => { window.loadTatCaMapTuSQL(); }, 3000);






// 2. HÀM TẢI MỘT CHUNK VÀO RAM (BẢN VÁ AAA: TẢI HIỀN HOÀ CHỐNG GIẬT LAG)
window.xuLyLoadMapChunk = function (mapData) {
    if (mapData.isLoaded || mapData.isLoading || typeof window.loaderSieuToc === 'undefined') return;
    mapData.isLoading = true;

    window.loaderSieuToc.load(mapData.model_url, async function (gltf) {
        let mapMesh = gltf.scene;
        // 🌟 CẬP NHẬT BÁN KÍNH MỚI: 10.000m
        let rHanhTinh = window.BAN_KINH_HANH_TINH_HIEN_TAI || 10000.0;
        let tamHanhTinh = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0, 0, 0);








        // Đặt vị trí
        mapMesh.position.set(parseFloat(mapData.pos_x), parseFloat(mapData.pos_y), parseFloat(mapData.pos_z));    
        // 🌟 BẢN VÁ LẬT NGƯỢC MAP: Tách biệt hoàn toàn Tròn và Phẳng
        let huongLenGoc = new THREE.Vector3(0, 1, 0); // Mặc định Bí Cảnh Phẳng luôn hướng lên trời +Y    
        if (window.KIEU_TRONG_LUC !== 'PHANG') {
            huongLenGoc = mapMesh.position.clone().sub(tamHanhTinh);
            if (huongLenGoc.lengthSq() < 0.001) huongLenGoc.set(0, 1, 0); else huongLenGoc.normalize();
        }     
        mapMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenGoc);








        if (parseFloat(mapData.rot_x) !== 0) mapMesh.rotateX(parseFloat(mapData.rot_x));
        if (parseFloat(mapData.rot_y) !== 0) mapMesh.rotateY(parseFloat(mapData.rot_y));
        if (parseFloat(mapData.rot_z) !== 0) mapMesh.rotateZ(parseFloat(mapData.rot_z));

        mapMesh.scale.set(parseFloat(mapData.scale), parseFloat(mapData.scale), parseFloat(mapData.scale));
        mapMesh.updateMatrixWorld(true);
        let rootInverseMat = new THREE.Matrix4().copy(mapMesh.matrixWorld).invert();

        let hopKichThuoc = new THREE.Box3().setFromObject(mapMesh);
        let kichThuoc = new THREE.Vector3(); hopKichThuoc.getSize(kichThuoc);
        let laMatDatKhongLo = Math.max(kichThuoc.x, kichThuoc.z) > 200;

        mapData.matDatMeshes = [];
        mapData.mayMeshes = []; // 🌟 Lưu riêng meshes mây để dọn rác
        // ==========================================
        // 🌟 BÍ THUẬT AAA: PHÂN MẢNH XỬ LÝ (TIME-SLICING)
        // ==========================================
         
        // 1. Gom tất cả các khối lưới (Mesh) vào một danh sách hàng đợi
        let danhSachMesh = [];
        mapMesh.traverse(child => { if (child.isMesh) danhSachMesh.push(child); });

        // 🌟 LẮP CẢM BIẾN THỜI GIAN THEO LỆNH SẾP
        let thoiGianĐoFPS = performance.now();








        // 2. Xử lý TỪ TỪ từng cục đất, từng cái cây...
        for (let i = 0; i < danhSachMesh.length; i++) {
            let child = danhSachMesh[i];

            // ==========================================
            // 🌟 LÁ CHẮN BẦU TRỜI: NGĂN CHẶN LỖI ĐỨNG TRÊN NÓC MAP VÀ LÚP LOAD/UNLOAD
            // ==========================================
            let tenMesh = child.name.toLowerCase();
            let laMayKhyQuyen = false;

            child.traverseAncestors(p => {
                let pName = p.name.toLowerCase();
                // 🌟 Bơm thêm từ khóa 'sky' để quét triệt để
                if (pName.includes('cloud') || pName.includes('may') || pName.includes('atmosphere') || pName.includes('datroi') || pName.includes('nganha') || pName.includes('sao') || pName.includes('sky')) laMayKhyQuyen = true;
            });

            if (tenMesh.includes('cloud') || tenMesh.includes('may') || tenMesh.includes('atmosphere') || tenMesh.includes('datroi') || tenMesh.includes('nganha') || tenMesh.includes('sao') || tenMesh.includes('sky')) laMayKhyQuyen = true;








            if (laMayKhyQuyen) {
                child.frustumCulled = false;
                child.renderOrder = -1; // Đẩy ra xa nhất

                if (child.material) {
                    let mats = Array.isArray(child.material) ? child.material : [child.material];
                    let newMats = mats.map(mat => new THREE.MeshBasicMaterial({
                        map: mat.map, color: mat.color || 0xffffff, transparent: true,
                        opacity: mat.opacity !== undefined ? mat.opacity : 1.0,
                        side: THREE.DoubleSide, // 🌟 SỬA: Dùng DoubleSide để chắc chắn nhìn thấy từ mọi hướng
                        depthWrite: true // 🌟 SỬA: Bật lại để không bị các vật thể khác đè lên sai cách
                    }));
                    child.material = newMats.length === 1 ? newMats[0] : newMats;
                }
                child.userData.isCloud = true;
                
                // 🌟 ĐĂNG KÝ VÀO DANH SÁCH BẦU TRỜI ĐỂ CHỐNG BAY XUYÊN
                if (!window.danhSachBauTroi) window.danhSachBauTroi = [];
                window.danhSachBauTroi.push(child);
                mapData.mayMeshes.push(child);

                continue; 
            }
            // ==========================================

            let toaDoThucTe = new THREE.Vector3();
            child.getWorldPosition(toaDoThucTe);
            let doCaoCuaMesh = toaDoThucTe.distanceTo(tamHanhTinh) - rHanhTinh;
            let laDatSatMatGround = doCaoCuaMesh < 15.0;

            // --- A. BẺ CONG LÚN ĐẤT (BẢN VÁ TỐI THƯỢNG: THÁI MỎNG TỪNG ĐỈNH) ---








            // --- A. BẺ CONG LÚN ĐẤT (BẢN VÁ TỐI THƯỢNG: THÁI MỎNG TỪNG ĐỈNH) ---
            // 🌟 KIỂM TRA ĐA VŨ TRỤ: Chỉ bẻ cong lưới nếu đang ở Hành Tinh Cầu!
            if (window.KIEU_TRONG_LUC !== 'PHANG' && laMatDatKhongLo && laDatSatMatGround && child.geometry && child.geometry.attributes.position) {

                let posAttr = child.geometry.attributes.position;
                let v_local = new THREE.Vector3(); let v_world = new THREE.Vector3(); let v_root = new THREE.Vector3();
                let meshInverseMat = new THREE.Matrix4().copy(child.matrixWorld).invert();

                let DO_LUN = 0.0; // Thông số Sếp đã căn chỉnh
                
                // 🌟 BÍ THUẬT CỨU RỖI CPU: CHIA NHỎ VÒNG LẶP (CHUNK PROCESSING)
                let BATCH_SIZE = 15000; // Mỗi lần chỉ xử lý 15.000 đỉnh rồi nghỉ!
                
                for (let j = 0; j < posAttr.count; j += BATCH_SIZE) {
                    
                    for (let k = j; k < j + BATCH_SIZE && k < posAttr.count; k++) {
                        v_local.fromBufferAttribute(posAttr, k);
                        v_world.copy(v_local).applyMatrix4(child.matrixWorld);
                        v_root.copy(v_world).applyMatrix4(rootInverseMat);

                        let distSq = v_root.x * v_root.x + v_root.z * v_root.z;
                        let drop = (distSq / (2 * rHanhTinh)) * 0.03;

                        v_root.y -= (drop + DO_LUN);

                        v_world.copy(v_root).applyMatrix4(mapMesh.matrixWorld);
                        v_local.copy(v_world).applyMatrix4(meshInverseMat);
                        posAttr.setXYZ(k, v_local.x, v_local.y, v_local.z);
                    }
                    
                    // 🛑 BẮT CPU NGHỈ GIẢI LAO NGAY GIỮA LÚC ĐANG BẺ CONG (Siêu mượt)
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
                
                posAttr.needsUpdate = true;
                child.geometry.computeVertexNormals();
            }










            // --- B. TÚT LẠI MÀU SẮC (MATERIAL) ---
            if (child.material) {
                let tenMesh = child.name.toLowerCase();
                let laMatNuoc = tenMesh.includes('water') || tenMesh.includes('nuoc') || tenMesh.includes('bien') || tenMesh.includes('ocean');

                let mats = Array.isArray(child.material) ? child.material : [child.material];
                
                if (laMatNuoc) {
                    // 🌊 GIẢI PHÁP TỐI THƯỢNG: ÉP MẶT NƯỚC THÀNH VẬT LIỆU "BASIC" 
                    // (Miễn nhiễm 100% với bóng tối, HDRI, tự phát sáng rực rỡ)
                    let newMats = mats.map(mat => {
                        let basicMat = new THREE.MeshBasicMaterial({
                            map: mat.map,
                            color: mat.color || 0x1e90ff, // Màu xanh biển tươi
                            transparent: true,
                            opacity: 0.8,
                            side: THREE.DoubleSide
                        });

                        if (basicMat.map) {
                            basicMat.map.wrapS = THREE.RepeatWrapping; 
                            basicMat.map.wrapT = THREE.RepeatWrapping;
                            basicMat.map.repeat.set(15, 15); // Lặp vân 15 lần để tạo sóng li ti
                            if (!window.danhSachMatNuoc) window.danhSachMatNuoc = [];
                            window.danhSachMatNuoc.push(basicMat.map);
                        }
                        return basicMat;
                    });
                    
                    child.material = newMats.length === 1 ? newMats[0] : newMats;
                    console.log("🌊 Đã ÉP KIỂU mặt nước thành BasicMaterial cho: " + child.name);
                } 
                else {
                    // 🌍 MẶT ĐẤT CỨNG / ĐÁ / CÂY CỎ BÌNH THƯỜNG
                    mats.forEach(mat => {
                        if (mat.emissive) mat.emissive.setHex(0x000000);
                        // Xóa các lệnh ép metalness/roughness ở đây để giữ nguyên chất liệu của đá/cây
                        if (mat.color) {
                            let doSang = (mat.color.r + mat.color.g + mat.color.b) / 3;
                            if (doSang > 0.8) { mat.color.r *= 0.25; mat.color.g *= 0.25; mat.color.b *= 0.25; }
                            else if (doSang > 0.5) { mat.color.r *= 0.8; mat.color.g *= 0.8; mat.color.b *= 0.8; }
                            else { mat.color.r *= 0.95; mat.color.g *= 0.95; mat.color.b *= 0.95; }
                        }
                        mat.needsUpdate = true;
                        mat.side = THREE.DoubleSide;
                    });
                }
            }













            if (child.geometry) {
                child.geometry.computeBoundingBox();
                child.geometry.computeBoundingSphere();
            }
            child.updateMatrixWorld(true);





            // --- C. ĐÚC KHUÔN VẬT LÝ BVH (ỦY QUYỀN CHO NHÂN CPU ẢO) ---
            // 🌟 BẢN VÁ: Cho phép đúc BVH cho cả Map nhỏ trang trí (Bỏ điều kiện laMatDatKhongLo)
            if (child.geometry) {


                if (window.myBvhWorker) {
                    let timeStart = performance.now();
                    
                    // 1. Rút trích mảng dữ liệu thô để ném cho Worker
                    let positions = child.geometry.attributes.position.array;
                    let indices = child.geometry.index ? child.geometry.index.array : null;
                    
                    let jobId = window.jobIdCounter++;
                    
                    // 2. Tạo Lệnh Đợi (Promise)
                    let p = new Promise((resolve, reject) => {
                        window.bvhJobs[jobId] = { resolve, reject };
                    });
                    
                    // 3. Quăng cục Map cho Core 2 xử lý
                    window.myBvhWorker.postMessage({ 
                        id: jobId, 
                        positions: positions, 
                        indices: indices 
                    });
                    
                    // 4. LỆNH 'await' THẦN THÁNH:
                    // Main Thread tạm nghỉ việc đúc Map, quay lại xuất hình 60FPS cho game mượt mà!
                    // Khi nào Core 2 tính xong, code mới chạy tiếp xuống dòng dưới.
                    let serializedBVH = await p;
                    
                    // 5. Core 2 đã trả hàng! Ráp cái khuôn vào cục Đất
                    child.geometry.boundsTree = MeshBVHLib.MeshBVH.deserialize(serializedBVH, child.geometry);
                    
                    let timeEnd = performance.now();
                    console.log(`👷 WORKER BVH: Đúc ngầm vật lý cho [${child.name}] mất ${(timeEnd - timeStart).toFixed(2)} ms!`);
                    
                } else if (typeof child.geometry.computeBoundsTree === 'function') {
                    child.geometry.computeBoundsTree();
                }
            }




            

            // 🌟 BẢN VÁ: Luôn đưa mọi Map (Lớn/Nhỏ) vào Radar để người chơi có thể giẫm lên được
            if (!window.danhSachMap) window.danhSachMap = [];
            window.danhSachMap.push(child);




            mapData.matDatMeshes.push(child);

            // ==========================================
            // 🌟 BẢN VÁ: ÉP GPU BIÊN DỊCH SHADER TỪ TỪ
            // ==========================================
            if (window.renderer && typeof scene !== 'undefined') {
                window.renderer.compile(child, camera, scene);
            }

            // ==========================================
            // 🛑 LÕI CHỐNG GIẬT THÍCH ỨNG AI (Ý TƯỞNG CỦA SẾP!)
            // Tự động đo FPS: Tụt dưới 50 thì nghỉ, trên 50 thì quất tiếp!
            // ==========================================
            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    let thoiGianHienTai = performance.now();
                    let thoiGian1Frame = thoiGianHienTai - thoiGianĐoFPS;
                    thoiGianĐoFPS = thoiGianHienTai; // Reset đồng hồ cho vòng lặp sau
                    
                    let fpsThucTe = 1000 / (thoiGian1Frame || 16);

                    if (fpsThucTe < 55) {
                        // 🔴 BÁO ĐỘNG: FPS đang tụt (GPU đang gánh tạ)
                        // Bắt tiến trình Load Map ngủ đông 500 mili-giây để game mượt trở lại!
                        setTimeout(resolve, 500);
                    } else {
                        // 🟢 AN TOÀN: FPS đang trên 50 (Mượt mà)
                        // Bật đèn xanh, thả phanh cho nhai tiếp cục Map tiếp theo ngay lập tức!
                        resolve();
                    }
                });
            });

        } // <--- ĐÂY LÀ DẤU NGOẶC ĐÓNG CỦA VÒNG LẶP FOR



        // --- 3. KHỞI ĐỘNG CỐI XAY GIÓ / THÁC NƯỚC ---
        if (gltf.animations && gltf.animations.length > 0) {
            let m = new THREE.AnimationMixer(mapMesh);
            gltf.animations.forEach((clip) => m.clipAction(clip).play());
            window.MAP_MIXERS.push(m);
            mapData.mixer = m;
        }

        

        // Xuất xưởng
        scene.add(mapMesh);
        mapData.mesh3D = mapMesh;
        mapData.isLoaded = true;
        mapData.isLoading = false;
        console.log(`🟢 THẾ GIỚI MỞ MƯỢT MÀ: [${mapData.name || mapData.id}] đã nạp xong không rớt 1 FPS!`);
        
    });
};





// 3.A HÀM THIÊU RỤI MAP CŨ KHỎI RAM (UNLOAD CHUNK) CHUẨN AAA
window.xuLyXoaMapChunk = function(mapData) {
    if (!mapData || !mapData.isLoaded) return;

    // 1. Gỡ bỏ các tấm lưới của Map này khỏi danh sách Radar (Không làm ảnh hưởng Map gốc)
    if (window.danhSachMap && mapData.matDatMeshes) {
        window.danhSachMap = window.danhSachMap.filter(m => !mapData.matDatMeshes.includes(m));
    }

    // 2. Dọn dẹp Animation của Map (Ví dụ cối xay gió, suối chảy...)
    if (mapData.mixer && window.MAP_MIXERS) {
        window.MAP_MIXERS = window.MAP_MIXERS.filter(mixer => mixer !== mapData.mixer);
    }

    // 3. Thiêu rụi Mô hình 3D giải phóng VRAM
    if (mapData.mesh3D) {
        if (typeof window.donRac3D === 'function') window.donRac3D(mapData.mesh3D);
        else scene.remove(mapData.mesh3D);
    }

    // 4. Khóa sổ
    mapData.isLoaded = false;
    mapData.mesh3D = null;
    mapData.matDatMeshes = [];
    mapData.mixer = null;
    console.log(`🔴 THẾ GIỚI MỞ: Đã giải phóng RAM khu vực [${mapData.name || mapData.id}]!`);
};

// 3.B HÀM THIÊU RỤI BOSS KHỎI RAM (UNLOAD BOSS CHUNK)
window.xuLyXoaBossTheoMap = function (mapId) {
    // Duyệt ngược mảng để xóa an toàn
    for (let i = window.danhSachQuaiVat.length - 1; i >= 0; i--) {
        let quai = window.danhSachQuaiVat[i];
        
        // Giả sử Sếp gán mapId cho quai vật lúc sinh ra, hoặc kiểm tra khoảng cách
        // Ở đây ta xóa những con quái đang ở quá xa (ví dụ: > 110.000m)
        let khoangCach = playerModel.position.distanceTo(quai.mesh.position);
        
        if (khoangCach > 8000) {
            // 1. Đuổi việc Worker (Báo cho não AI ngừng tính toán)
            if (window.aiWorkers) {
                let workerIndex = i % window.MAX_WORKERS;
                if (window.aiWorkers[workerIndex]) {
                    window.aiWorkers[workerIndex].postMessage({ type: 'REMOVE_BOSS', id: quai.id });
                }
            }

            // 2. Dọn rác thẻ Tên HTML
            if (quai.tagEl) {
                quai.tagEl.remove(); // Xóa hẳn thẻ div khỏi DOM
            }

            // 3. Đốt sạch VRAM Mô hình 3D
            if (quai.mesh) {
                if (typeof window.donRac3D === 'function') window.donRac3D(quai.mesh);
                else scene.remove(quai.mesh);
            }

            // 4. Xóa sổ khỏi danh sách hiện tại
            window.danhSachQuaiVat.splice(i, 1);
            console.log(`🔴 Đã dọn dẹp Boss [${quai.id}] ở xa để giải phóng RAM!`);
        }
    }
};





// 4. VÒNG LẶP SINH TỬ (RADAR QUÉT KHOẢNG CÁCH MỖI 2 GIÂY)
setInterval(() => {
    if (typeof playerModel === 'undefined' || !playerModel) return;
    if (!window.THONG_TIN_CAC_MAP || window.THONG_TIN_CAC_MAP.length === 0) return;

    let pPos = playerModel.position;

    window.THONG_TIN_CAC_MAP.forEach(mapData => {
        let mPos = new THREE.Vector3(parseFloat(mapData.pos_x), parseFloat(mapData.pos_y), parseFloat(mapData.pos_z));
        let khoangCach = pPos.distanceTo(mPos);

        // ==========================================
        // 🟢 TẦNG 1: LOAD ĐẤT ĐAI (LÁT CẮT 10.000m)
        // ==========================================
        if (khoangCach < 10000 && !mapData.isLoaded && !mapData.isLoading) {
            window.xuLyLoadMapChunk(mapData);
        }

        // ==========================================
        // 🟢 TẦNG 2: LOAD SINH THÁI & BOSS (LÁT CẮT 5.000m)
        // ==========================================
        if (khoangCach < 5000 && mapData.isLoaded && !mapData.daLoadBoss) {
            if (typeof window.taiBossTheoMap === 'function') {
                window.taiBossTheoMap(mapData.id);
                mapData.daLoadBoss = true;
            }
        }

        // ==========================================
        // 🔴 TẦNG 3: LÒ ĐỐT RÁC VRAM (VƯỢT LÁT CẮT 12.000m)
        // ==========================================
        if (khoangCach > 12000 && mapData.isLoaded) {
            window.xuLyXoaMapChunk(mapData);
            window.xuLyXoaBossTheoMap(mapData.id);
            mapData.daLoadBoss = false;
        }
    });
}, 2000);



















// ==========================================
// 🛠️ HỆ THỐNG GIÁM SÁT TỐI CAO DÀNH CHO GAME MASTER (GM)
// Phím tắt: Delete (Del) hoặc F8
// ==========================================
(function khoiTaoHeThongGiamSatGM() {
    // 1. TẠO BẢNG ĐIỀU KHIỂN (UI) HACKER STYLE
    const gmPanel = document.createElement('div');
    gmPanel.id = 'gm-monitor-panel';
    // Thay số 20 thành 150 hoặc 200 để đẩy nó xuống dưới cái nút Bàn Tay Sáng Thế
gmPanel.style.cssText = "position:fixed; top:150px; left:20px; background:rgba(5, 10, 15, 0.85); border:1px solid #00ffcc; box-shadow: 0 0 15px rgba(0, 255, 204, 0.4); color: #00ffcc; font-family: monospace; font-size: 14px; padding: 15px; border-radius: 8px; z-index: 999999; pointer-events: none; min-width: 320px; display: none; backdrop-filter: blur(5px);";
    document.body.appendChild(gmPanel);

    let isVisible = false;

    // BẬT TẮT BẰNG PHÍM DELETE HOẶC F8
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.code === 'Delete' || e.key === 'F8') {
            
            // 🌟 Ổ KHÓA CHỈ CHẶN KHI BẤM NÚT (Sếp có thể xóa 2 dấu // ở đầu dòng dưới nếu muốn khóa chặt cho mỗi Admin)
            // if (window.ADMIN_NAME !== "Admin" && window.ROLE !== "admin" && window.myUsername !== "Admin") return;

            isVisible = !isVisible;
            gmPanel.style.display = isVisible ? 'block' : 'none';
            if (isVisible) console.log("%c🟢 [GM MODE] Mắt Thần Đã Mở!", "color:#00ffcc; font-weight:bold; font-size:16px;");
        }
    });

    // 2. CÁC BIẾN ĐO LƯỜNG
    let dungLuongGui1Giay = 0, dungLuongNhan1Giay = 0;
    let tongDungLuongGui = 0, tongDungLuongNhan = 0;
    let fps = 0, frames = 0, lastFpsTime = performance.now();
    let pingMs = 0;

    // 3. HACK VÀO MẠNG LIVEKIT (ĐO DATA)
    let daHackLivekit = false;
    function hackLivekit() {
        if (daHackLivekit || !window.room || window.room.state !== 'connected') return;
        
        const hamGuiGoc = window.room.localParticipant.publishData;
        window.room.localParticipant.publishData = function(payload, options) {
            if (payload && payload.byteLength) { dungLuongGui1Giay += payload.byteLength; tongDungLuongGui += payload.byteLength; }
            return hamGuiGoc.call(window.room.localParticipant, payload, options);
        };

        window.room.on('dataReceived', (payload) => {
            if (payload && payload.byteLength) { dungLuongNhan1Giay += payload.byteLength; tongDungLuongNhan += payload.byteLength; }
        });
        daHackLivekit = true;
    }

    // 4. VÒNG LẶP ĐO LƯỜNG FPS (ĐỘ MƯỢT MÀN HÌNH)
    function demFPS() {
        frames++;
        let now = performance.now();
        if (now - lastFpsTime >= 1000) {
            fps = frames;
            frames = 0;
            lastFpsTime = now;
        }
        requestAnimationFrame(demFPS);
    }
    demFPS();

    // 5. ĐO PING TỚI MÁY CHỦ PHP (CỨ 2 GIÂY ĐO 1 LẦN)
    setInterval(() => {
        if (!isVisible) return; 
        let start = Date.now();
        fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' })
            .then(() => pingMs = Date.now() - start)
            .catch(() => pingMs = 999);
    }, 2000);

    // 6. TRUNG TÂM PHÂN TÍCH VÀ CẬP NHẬT GIAO DIỆN MỖI GIÂY
    setInterval(() => {
        hackLivekit(); 

        if (!isVisible) return; 

        let soNguoi = window.remotePlayers ? Object.keys(window.remotePlayers).length : 0;
        let soQuai = window.danhSachQuaiVat ? window.danhSachQuaiVat.filter(q => !q.isDead).length : 0;
        
        let drawCalls = (window.renderer && window.renderer.info) ? window.renderer.info.render.calls : 0;
        let geometries = (window.renderer && window.renderer.info) ? window.renderer.info.memory.geometries : 0;

        let guiKB = (dungLuongGui1Giay / 1024).toFixed(2);
        let nhanKB = (dungLuongNhan1Giay / 1024).toFixed(2);
        
        // 🌟 BÁC SĨ AI: CHUẨN ĐOÁN BỆNH DỰA TRÊN THÔNG SỐ
        let cpuMs = window.CPU_TIME_MS ? window.CPU_TIME_MS.toFixed(2) : 0;
        let chanDoan = "<b style='color:#00ffcc'>[HỆ THỐNG MƯỢT MÀ]</b>";
        
        if (fps < 40) {
            // Nếu FPS thấp mà CPU tính mất hơn 12ms -> CPU quá tải
            if (cpuMs > 12.0) {
                chanDoan = "<b style='color:#ff3333'>[BỆNH CPU: Logic/AI đang quá nặng!]</b>";
            } else {
                // Nếu CPU tốn ít thời gian nhưng FPS vẫn thấp -> GPU đang gánh tạ
                chanDoan = "<b style='color:#ffcc00'>[BỆNH GPU: Đồ họa/Mây đang quá nặng!]</b>";
            }
        }

        let mauGui = dungLuongGui1Giay > 2048 ? '#ff3333' : '#00ffcc';
        let mauNhan = dungLuongNhan1Giay > 2048 ? '#ff3333' : '#00ffcc';
        let mauFPS = fps >= 50 ? '#00ffcc' : (fps >= 30 ? '#ffcc00' : '#ff3333');
        let mauPing = pingMs < 100 ? '#00ffcc' : (pingMs < 300 ? '#ffcc00' : '#ff3333');
        let mauDrawCall = drawCalls > 2500 ? '#ff3333' : (drawCalls > 1000 ? '#ffcc00' : '#00ffcc');
        let mauCpu = cpuMs > 12 ? '#ff3333' : '#00ffcc';

        gmPanel.innerHTML = `
            <div style="text-align:center; font-size:18px; font-weight:bold; color:#fff; margin-bottom:10px; text-shadow: 0 0 5px #00ffcc; text-transform:uppercase;">👁️ MẮT THẦN QUẢN TRỊ 👁️</div>
            <div style="text-align:center; margin-bottom:10px; font-size:13px;">${chanDoan}</div>
            
            <b style="color:#aaa;">🖥️ TÀI NGUYÊN HỆ THỐNG:</b><br>
            ► Độ mượt (FPS): <b style="color:${mauFPS}; font-size:16px;">${fps}</b><br>
            ► Thời gian CPU: <b style="color:${mauCpu}">${cpuMs} ms</b> <span style="font-size:11px; color:#666;">(< 16ms là khỏe)</span><br>
            ► Lệnh vẽ GPU (Draw): <b style="color:${mauDrawCall}">${drawCalls}</b><br>
            ► Vật thể 3D (Mesh): <span style="color:#00ffcc">${geometries}</span><br>
            
            <hr style="border:0.5px solid #005544; margin:10px 0;">
            <b style="color:#aaa;">📡 BĂNG THÔNG MẠNG (LiveKit):</b><br>
            ► Tốc độ Gửi: <b style="color:${mauGui}">${guiKB} KB/s</b> <span style="font-size:11px; color:#888;">(Tổng: ${(tongDungLuongGui/1024).toFixed(1)} KB)</span><br>
            ► Tốc độ Nhận: <b style="color:${mauNhan}">${nhanKB} KB/s</b> <span style="font-size:11px; color:#888;">(Tổng: ${(tongDungLuongNhan/1024).toFixed(1)} KB)</span><br>
            
            <hr style="border:0.5px solid #005544; margin:10px 0;">
            <b style="color:#aaa;">🌍 SỨC KHỎE THẾ GIỚI GAME:</b><br>
            ► Ping Server: <b style="color:${mauPing}">${pingMs} ms</b><br>
            ► Player trực tuyến: <b style="color:#00ffcc">${soNguoi + 1}</b><br>
            ► Quái vật / Boss: <b style="color:#ff3333">${soQuai}</b>
        `;

        dungLuongGui1Giay = 0; dungLuongNhan1Giay = 0;
    }, 1000);
})();









// =======================================================
// 🌟 HỆ THỐNG ĐO ĐẠC & VẼ SAFE ZONE CỦA SẾP
// =======================================================
window.isSettingSafeZone = false;
window.vongTronSafeZone = null;
window.banKinhĐangĐo = 100;
window.toaDoTamĐangĐo = new THREE.Vector3();

window.DANH_SACH_SAFE_ZONE = []; // Danh sách chuẩn
window.IS_IN_SAFE_ZONE = false;

// 1. Kích hoạt vẽ vòng tròn khi Sếp bấm nút
window.batDauSetSafeZone = function() {
    if (!window.vongTronSafeZone) {
        // Tạo một vòng sáng Neon màu lục lam dưới đất
        let geo = new THREE.RingGeometry(0.95, 1, 64);
        let mat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        window.vongTronSafeZone = new THREE.Mesh(geo, mat);
        scene.add(window.vongTronSafeZone);
    }
    window.vongTronSafeZone.visible = true;
    window.isSettingSafeZone = true;
    document.getElementById('panelSaveSafeZone').style.display = 'block';
    document.getElementById('adminSubMenu').style.display = 'none';
};

// 2. Hàm hủy bỏ
window.huySetSafeZone = function() {
    window.isSettingSafeZone = false;
    if (window.vongTronSafeZone) window.vongTronSafeZone.visible = false;
    document.getElementById('panelSaveSafeZone').style.display = 'none';
};

// 3. 🌟 HÀM TẠO BẢNG NEON 3D VÀ MŨI TÊN CHỈ XUỐNG (KHÔNG CẦN FONT)
window.taoBienNeonSafeZone = function(x, y, z) {
    let canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    let ctx = canvas.getContext('2d');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    
    // Đánh bóng Neon
    ctx.shadowBlur = 30; ctx.shadowColor = '#00ffcc'; ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px sans-serif'; ctx.fillText('SAFE ZONE', 512, 180);
    
    ctx.shadowColor = '#ffcc00'; ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 180px sans-serif'; ctx.fillText('⬇', 512, 350);

    let tex = new THREE.CanvasTexture(canvas);
    let mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    let sprite = new THREE.Sprite(mat);
    
    // Treo bảng lên cao cách mặt đất 300 mét
    let pos = new THREE.Vector3(x, y, z);
    let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0,0,0);
   
   
   
   


    let groundDir = new THREE.Vector3(0, 1, 0);
    if (window.KIEU_TRONG_LUC !== 'PHANG') {
        groundDir = pos.clone().sub(tam);
        if (groundDir.lengthSq() < 0.001) groundDir.set(0, 1, 0); else groundDir.normalize();
    }






    sprite.position.copy(pos).add(groundDir.multiplyScalar(300)); 
    sprite.scale.set(800, 400, 1); // Kích thước khổng lồ để nhìn từ xa
    scene.add(sprite);
};

// 4. Hàm Lưu (Gửi lên Server)
window.luuSafeZoneMoi = function() {
    let fd = new FormData();
    fd.append('x', window.toaDoTamĐangĐo.x);
    fd.append('y', window.toaDoTamĐangĐo.y);
    fd.append('z', window.toaDoTamĐangĐo.z);
    fd.append('radius', window.banKinhĐangĐo);
    // 🌟 THÊM DÒNG NÀY:
    fd.append('zone_id', window.ZONE_ID || 'TRUNG_CHAU');
    fetch('api/save_safezone.php', { method: 'POST', body: fd })
    .then(res => res.json()).then(data => {
        if(data.status === 'success') {
            alert("✔️ Đã lập Safe Zone thành công!");
            window.taoBienNeonSafeZone(window.toaDoTamĐangĐo.x, window.toaDoTamĐangĐo.y, window.toaDoTamĐangĐo.z);
            window.DANH_SACH_SAFE_ZONE.push({x: window.toaDoTamĐangĐo.x, y: window.toaDoTamĐangĐo.y, z: window.toaDoTamĐangĐo.z, radius: window.banKinhĐangĐo});
            window.huySetSafeZone();
        } else alert("Lỗi: " + data.msg);
    });
};

// 5. Hàm kiểm tra bảo vệ (Code chặn đánh nhau như ở đợt trước)
window.kiemTraSafeZone = function(pos) {
    if (!pos) return false;
    for (let i = 0; i < window.DANH_SACH_SAFE_ZONE.length; i++) {
        let sz = window.DANH_SACH_SAFE_ZONE[i];
        if (pos.distanceTo(new THREE.Vector3(sz.x, sz.y, sz.z)) <= sz.radius) return true;
    }
    return false;
};




// =======================================================
// 🌟 HỆ THỐNG TRUYỀN TỐNG TRẬN
// =======================================================
window.DANH_SACH_CONG = [];
window.dangDichChuyen = false;

// 1. Hàm vẽ bảng tên Neon lơ lửng trên Cổng
window.taoBienTenCong = function (name, x, y, z) {
    let canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 256;
    let ctx = canvas.getContext('2d');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20; ctx.shadowColor = '#9b59b6'; ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px sans-serif'; ctx.fillText('✈️ ' + name, 512, 128);

    let tex = new THREE.CanvasTexture(canvas);
    let mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    let sprite = new THREE.Sprite(mat);

    // Treo trên nóc cổng 10m
    let pos = new THREE.Vector3(x, y, z);
    let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0, 0, 0);
    sprite.position.copy(pos).add(pos.clone().sub(tam).normalize().multiplyScalar(10));
    sprite.scale.set(40, 10, 1);
    scene.add(sprite);
};

// 2. Hàm giả lập nhét Cổng vào Map
window.khoiTaoMotCong = function (data) {
    // Sếp dùng GLTFLoader để load data.model_url giống như load Map
    // Sau khi load xong, nhét lưới (Mesh) vào mảng:
    // window.DANH_SACH_CONG.push({ mesh: gltf.scene, dest: new THREE.Vector3(data.dest_x, data.dest_y, data.dest_z), name: data.ten_dich_den });
    // Và gọi: window.taoBienTenCong(data.ten_dich_den, data.pos_x, data.pos_y, data.pos_z);
};



// 3. Hàm Xé Rách Hư Không (Dịch Chuyển) - BẢN VÁ BẤT TỬ V4 (CHỐNG CRASH NULL)
window.thucHienTruyenTong = function (congData) {
    if (window.dangDichChuyen || !playerModel) return;
    window.dangDichChuyen = true;

    // 🛑 1. TẨY NÃO DI CHUYỂN & MỤC TIÊU CŨ
    window.isMoving = false;
    window.isKeyboardMoving = false;
    if (window.keys) {
        window.keys.w = false; window.keys.a = false; window.keys.s = false;
        window.keys.d = false; window.keys.space = false; window.keys.shift = false;
    }
    if (window.vongMucTieu) window.vongMucTieu.visible = false;
    window.mucTieuHienTai = null;
    if (typeof playIdle === 'function') playIdle();

    // 🌟 BẢN VÁ BẤT TỬ: KIỂM TRA TỒN TẠI TRƯỚC KHI THAY ĐỔI UI
    let uiTen = document.getElementById('tenNoiDenUI');
    if (uiTen) {
        uiTen.innerText = "TỚI: " + congData.name;
    }

    let manHinhDichChuyen = document.getElementById('manHinhDichChuyen');
    if (manHinhDichChuyen) {
        manHinhDichChuyen.style.display = 'block'; // Block hoặc flex đều được
    }

    setTimeout(() => {




        let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0, 0, 0);
        let huongLenTroiMoi = congData.dest.clone().sub(tam);

        // 🌟 LÁ CHẮN TOÁN HỌC: Nếu đích đến là 0,0,0 thì Vector sẽ bị rỗng. Phải ép nó đứng thẳng lên!
        if (huongLenTroiMoi.lengthSq() < 0.001) {
            huongLenTroiMoi.set(0, 1, 0); // Mặc định hướng lên trời là trục Y
        } else {
            huongLenTroiMoi.normalize();
        }

        // Thả rơi từ độ cao 15 mét
        let viTriAnToan = congData.dest.clone().add(huongLenTroiMoi.clone().multiplyScalar(15.0));
        playerModel.position.copy(viTriAnToan);

        // Nắn xương an toàn
        playerModel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenTroiMoi);
        playerModel.up.copy(huongLenTroiMoi);
        window.mucTieuBanKinhDat = tam.distanceTo(congData.dest);





        
        // 🌟 KHÓA VẬN TỐC CHỐNG VĂNG
        window.isMoving = false;
        window.isKeyboardMoving = false;

        // 🌟 BÍ THUẬT ĐÓNG BĂNG KHÔNG GIAN: Ép tạm thời thành Không Trọng Lực để chống văng tọa độ khi tải Map!
        window.KIEU_TRONG_LUC = 'PHANG';
        window.toaDoMatDat = viTriAnToan.y;
        if (typeof window.kiemSoatHanhTinhGoc === 'function') window.kiemSoatHanhTinhGoc();

        





        // ========================================================
        // 🧨 THIÊU RỤI HOÀN TOÀN THẾ GIỚI CŨ (Rút ống thở VRAM)
        // ========================================================
        if (window.THONG_TIN_CAC_MAP) {
            window.THONG_TIN_CAC_MAP.forEach(mapData => {
                if (typeof window.xuLyXoaMapChunk === 'function') window.xuLyXoaMapChunk(mapData);
            });
        }
        window.THONG_TIN_CAC_MAP = []; // Xóa trắng data Radar Đất

        if (window.danhSachQuaiVat) {
            for (let i = window.danhSachQuaiVat.length - 1; i >= 0; i--) {
                let quai = window.danhSachQuaiVat[i];
                if (quai.tagEl) quai.tagEl.remove();
                if (typeof window.donRac3D === 'function') window.donRac3D(quai.mesh);
            }
            window.danhSachQuaiVat = []; // Xóa trắng data Quái vật
        }

        // ========================================================
        // 🌍 CẬP NHẬT KHU VỰC VÀ NẮN XƯƠNG SƠ BỘ
        // ========================================================
        window.ZONE_ID = congData.zone_dich_den || 'TRUNG_CHAU'; 
        
        // Xoay xương sống sơ bộ theo hướng rớt xuống (Chống lật hình nếu Map đích là Tròn)
        playerModel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenTroiMoi);
        playerModel.up.copy(huongLenTroiMoi);
        window.mucTieuBanKinhDat = tam.distanceTo(congData.dest);

        // ========================================================
        // 📥 NẠP THẾ GIỚI MỚI (Sẽ tự động kích hoạt lại Công tắc Trọng Lực)
        // ========================================================
        window.loadTatCaMapTuSQL(window.ZONE_ID);
        window.loadSafeZonesVaTeleports(); // Nạp lại cửa của thế giới mới

        // Mở mắt ra
        setTimeout(() => {
            if (manHinhDichChuyen) manHinhDichChuyen.style.display = 'none';
            window.dangDichChuyen = false;
        }, 1500);

    }, 500);
};

// =======================================================
// 🌟 HÀM KHỞI ĐỘNG TẢI DỮ LIỆU TỪ SQL VÀO GAME
// =======================================================
window.hienThongBaoBoGoc = function(msg, mauSac) {
    let div = document.createElement('div'); div.innerText = msg; div.style.position = 'fixed'; div.style.top = '120px'; div.style.left = '50%'; div.style.transform = 'translateX(-50%)'; div.style.background = 'rgba(0,0,0,0.8)'; div.style.color = mauSac || '#fff'; div.style.padding = '10px 20px'; div.style.borderRadius = '5px'; div.style.border = '1px solid ' + (mauSac || '#fff'); div.style.zIndex = '999999'; div.style.fontWeight = 'bold'; document.body.appendChild(div);
    setTimeout(() => { div.remove(); }, 2000);
};




window.loadSafeZonesVaTeleports = function() {
    let currentZone = window.ZONE_ID || 'TRUNG_CHAU';
    
    // 🌟 1. Xóa sạch Cổng và SafeZone cũ để nạp cái mới
    if (window.vongTronSafeZone) window.vongTronSafeZone.visible = false;
    window.DANH_SACH_SAFE_ZONE = [];
    if (window.DANH_SACH_CONG) {
        window.DANH_SACH_CONG.forEach(c => { if(typeof window.donRac3D === 'function') window.donRac3D(c.mesh); else scene.remove(c.mesh); });
    }
    window.DANH_SACH_CONG = [];

    // 🌟 2. BÍ THUẬT CHỐNG CACHE: Gắn thêm Date.now() vào cuối URL
    // Tải Safe Zones
    fetch('api/get_safezones.php?zone=' + currentZone + '&v=' + Date.now()).then(res => res.json()).then(data => {
        if (data.status === 'success' && data.data) {
            window.DANH_SACH_SAFE_ZONE = data.data.map(sz => ({ x: parseFloat(sz.pos_x), y: parseFloat(sz.pos_y), z: parseFloat(sz.pos_z), radius: parseFloat(sz.radius) }));
            window.DANH_SACH_SAFE_ZONE.forEach(sz => { if(typeof window.taoBienNeonSafeZone === 'function') window.taoBienNeonSafeZone(sz.x, sz.y, sz.z); });
        }
    });

    // 🌟 3. Tải Cổng Dịch Chuyển (Kèm chống Cache)
    fetch('api/get_teleports.php?zone=' + currentZone + '&v=' + Date.now()).then(res => res.json()).then(data => {
        if (data.status === 'success' && data.data) {
            data.data.forEach(tp => {
                
                // 🛑 LÁ CHẮN THÉP CHỐNG LỖI ĐỎ MÀN HÌNH (Cannot read property undefined)
                if (!tp.model_url || tp.model_url.trim() === '') return;

                let dest = new THREE.Vector3(parseFloat(tp.dest_x), parseFloat(tp.dest_y), parseFloat(tp.dest_z));
                let pos = new THREE.Vector3(parseFloat(tp.pos_x), parseFloat(tp.pos_y), parseFloat(tp.pos_z));
                
                if (window.loaderSieuToc) {
                    window.loaderSieuToc.load(tp.model_url, function (gltf) {
                        let congGroup = new THREE.Group();
                        congGroup.position.copy(pos);






                        let upDir = new THREE.Vector3(0, 1, 0);
                        if (window.KIEU_TRONG_LUC !== 'PHANG') {
                            let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0, 0, 0);
                            upDir = congGroup.position.clone().sub(tam);
                            if (upDir.lengthSq() < 0.001) upDir.set(0, 1, 0); else upDir.normalize();
                        }
                        congGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), upDir);





                        let mesh = gltf.scene;
                        let scale = parseFloat(tp.scale) || 1;
                        mesh.scale.set(scale, scale, scale);
                        mesh.rotation.x = -Math.PI / 2;

                        // 🌟 CHỐNG TÀNG HÌNH DO LỖI CULLING CỦA THREE.JS
                        mesh.traverse(c => { if (c.isMesh) c.frustumCulled = false; });

                        congGroup.add(mesh);
                        scene.add(congGroup);

                        if (gltf.animations && gltf.animations.length > 0) {
                            let mixer = new THREE.AnimationMixer(mesh);
                            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
                            if (!window.TELEPORT_MIXERS) window.TELEPORT_MIXERS = [];
                            window.TELEPORT_MIXERS.push(mixer);
                        }

                        // 🌟 Lưu lại Mã Vùng Đích Đến
                        window.DANH_SACH_CONG.push({ mesh: congGroup, dest: dest, name: tp.ten_dich_den, zone_dich_den: tp.zone_dich_den });
                        if (typeof window.taoBienTenCong === 'function') window.taoBienTenCong(tp.ten_dich_den, pos.x, pos.y, pos.z);
                    });
                }
            });
        }
    });
};


setTimeout(() => { window.loadSafeZonesVaTeleports(); }, 4000); // Chờ 4s cho map khởi động xong mới load






















// =================================================================
// 🤖 AUTO HUNT V8: ĐIỀU HƯỚNG NATIVE - TRẢ LẠI TỐC ĐỘ GỐC & ĐỘ MƯỢT AAA
// =================================================================

window.isAutoAFK = false;
window.tamQuetMax = 10000;   // Radar quét xa 10km
window.tamXaXungDot = 500;    // Tầm xả chiêu 
window.tamThaDieu = 300;      // Tầm thả diều 40m
window.thoiGianSpam = 0;

window.toggleAutoTreoMay = function() {
    window.isAutoAFK = !window.isAutoAFK;
    let btn = document.getElementById('btnAutoAFK');
    let txt = document.getElementById('textAuto');
    
    if (window.isAutoAFK) {
        btn.style.borderColor = '#2ecc71';
        btn.style.boxShadow = '0 0 15px #2ecc71';
        txt.innerText = 'Auto: BẬT';
        txt.style.color = '#2ecc71';
        if (typeof window.taoSoSatThuong === 'function' && window.playerModel) {
            window.taoSoSatThuong(window.playerModel.position.clone(), "AUTO SĂN BOSS: BẮT ĐẦU!", '#2ecc71');
        }
    } else {
        btn.style.borderColor = '#7f8c8d';
        btn.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        txt.innerText = 'Auto: TẮT';
        txt.style.color = '#fff';
        window.isMoving = false; // Dừng xe
        window.mucTieuHienTai = null; // Hủy khóa mục tiêu
        if (window.vongMucTieu) window.vongMucTieu.visible = false;
    }
};





// ==========================================
// 🌟 MÁY ĐỒNG BỘ & TỰ ĐỘNG HỒI SINH BOSS TỪ SERVER (HEARTBEAT 10s)
// ==========================================
setInterval(() => {
    // Nếu chưa load xong nhân vật hoặc đang bay màu thì tạm nghỉ
    if (!window.playerModel || typeof window.danhSachQuaiVat === 'undefined') return;

    // "Gõ cửa" API để Server chạy thuật toán 600s hồi sinh ngầm
    fetch('api/get_bosses.php?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.data) {

                data.data.forEach(bossServer => {
                    // 1. Chỉ quan tâm những con Boss đang sống trên Server (hp > 0)
                    if (bossServer.hp > 0) {

                        // 2. Tìm xem con Boss này có đang hiển thị trên màn hình Sếp không?
                        let tonTaiTrenClient = window.danhSachQuaiVat.find(q => q.id == bossServer.id);

                        // 3. Nếu Client KHÔNG CÓ (do lúc nãy chết đã bị dọn xác xóa khỏi mảng) 
                        // -> CHỨNG TỎ NÓ VỪA ĐƯỢC SERVER HỒI SINH!
                        if (!tonTaiTrenClient) {

                            // 4. Đo khoảng cách, nếu Sếp đang đứng gần nó (< 6000m) thì triệu hồi nó ra ngay!
                            let bossPos = new THREE.Vector3(parseFloat(bossServer.pos_x), parseFloat(bossServer.pos_y), parseFloat(bossServer.pos_z));
                            let khoangCach = window.playerModel.position.distanceTo(bossPos);

                            if (khoangCach < 6000) {
                                console.log(`✨ Ánh sáng giáng xuống! Boss [${bossServer.name}] đã hồi sinh sau 10 phút!`);

                                if (typeof window.sinhRaQuaiVat === 'function') {
                                    window.sinhRaQuaiVat(
                                        parseFloat(bossServer.pos_x),
                                        parseFloat(bossServer.pos_z),
                                        bossServer.name,
                                        parseInt(bossServer.level),
                                        parseInt(bossServer.max_hp),
                                        parseFloat(bossServer.scale),
                                        parseFloat(bossServer.pos_y),
                                        true,
                                        bossServer.id,
                                        bossServer.model_url,
                                        parseInt(bossServer.hp),
                                        0,
                                        bossServer.class_code
                                    );
                                }
                            }
                        }
                    }
                });

            }
        }).catch(err => {
            // Lỗi mạng lặt vặt (rớt mạng vài mili-giây) thì bỏ qua, 10s sau nó tự làm lại
        });

}, 10000); // 10000 ms = Cứ 10 giây chạy 1 lần













// =================================================================
// 🤖 AUTO HUNT V16: BẮN TỈA TẦM XA (CHUẨN TẦM ĐÁNH > 100M)
// =================================================================

if (window.botAutoTimer) clearInterval(window.botAutoTimer); 

window.isAutoAFK = false;
window.tamQuetMax = 10000;   
window.botMucTieuId = null;  
window.botState = 'IDLE';    

// 🌟 ĐÃ NỚI LỎNG CỰ LY CHO HỆ VIỄN CHIẾN
window.tamXaXungDot = 450; // Khoảng cách đuổi: Boss văng xa hơn 100m thì mới chạy theo
window.tamDungHinh = 450;   // Khoảng cách phanh: Tới tầm 80m là phanh gấp, nhả đạn từ xa!

window.toggleAutoTreoMay = function() {
    window.isAutoAFK = !window.isAutoAFK;
    let btn = document.getElementById('btnAutoAFK');
    let txt = document.getElementById('textAuto');
    
    if (window.isAutoAFK) {
        btn.style.borderColor = '#2ecc71';
        btn.style.boxShadow = '0 0 15px #2ecc71';
        txt.innerText = 'Auto: BẬT';
        txt.style.color = '#2ecc71';
        if (typeof window.taoSoSatThuong === 'function' && window.playerModel) {
            window.taoSoSatThuong(window.playerModel.position.clone(), "AUTO TẦM XA: BẮT ĐẦU!", '#2ecc71');
        }
    } else {
        btn.style.borderColor = '#7f8c8d';
        btn.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        txt.innerText = 'Auto: TẮT';
        txt.style.color = '#fff';
        
        window.botMucTieuId = null; 
        window.botState = 'IDLE';
        window.isMoving = false; 
        window.mucTieuHienTai = null; 
        if (window.vongMucTieu) window.vongMucTieu.visible = false;
    }
};

window.botAutoTimer = setInterval(() => {
    if (!window.isAutoAFK || window.mauBanThan <= 0 || !window.playerModel) return;
    
    let nvc = window.playerModel;
    let mangQuai = window.danhSachQuaiVat || []; 
    let quaiTotNhat = null;

    // --- BƯỚC 1: KIỂM TRA MỒI CŨ ---
    if (window.botMucTieuId) {
        quaiTotNhat = mangQuai.find(q => q.id === window.botMucTieuId);
        if (quaiTotNhat) {
            let hopLe = (!quaiTotNhat.death_time || quaiTotNhat.death_time == 0 || quaiTotNhat.death_time === "0");
            // 🌟 NÂNG CẤP: Bỏ mục tiêu ngay lập tức nếu bị đánh dấu ignore (Xác ma)
            if (quaiTotNhat.hp <= 0 || quaiTotNhat.isDead || (quaiTotNhat.mesh && quaiTotNhat.mesh.userData.ignore) || !hopLe || nvc.position.distanceTo(quaiTotNhat.mesh.position) > window.tamQuetMax) {
                quaiTotNhat = null; 
                window.botMucTieuId = null;
            }
        } else {
            window.botMucTieuId = null; 
        }
    }

    // --- BƯỚC 2: TÌM MỒI MỚI (NẾU MẤT MỒI CŨ) ---
    if (!quaiTotNhat) {
        let khoangCachMin = window.tamQuetMax;
        mangQuai.forEach(q => {
            // 🌟 NÂNG CẤP: Tuyệt đối không chọn lại những cái xác đang nằm chờ dọn dẹp
            if (q && q.mesh && q.hp > 0 && !q.isDead && !q.mesh.userData.ignore) {
                let hopLe = (!q.death_time || q.death_time == 0 || q.death_time === "0");
                if (hopLe) {
                    let d = nvc.position.distanceTo(q.mesh.position);
                    if (d < khoangCachMin) {
                        khoangCachMin = d;
                        quaiTotNhat = q;
                    }
                }
            }
        });
        
        if (quaiTotNhat) {
            window.botMucTieuId = quaiTotNhat.id;
            window.botState = 'CHASING'; 
        }
    }

    // --- BƯỚC 3: CHIẾN THUẬT BẮN TỈA ---
    if (quaiTotNhat) {
        let targetPos = quaiTotNhat.mesh.position.clone();
        let dist = nvc.position.distanceTo(targetPos);
        
        window.mucTieuHienTai = quaiTotNhat;
        if (window.vongMucTieu) window.vongMucTieu.visible = true;

        // Lấy cự ly từ thông số ở trên
        let RANGE_CHASE = window.tamXaXungDot;  
        let RANGE_STOP = window.tamDungHinh;    

        if (window.botState === 'CHASING') {
            // Còn xa hơn 80m thì mới đuổi
            if (dist > RANGE_STOP) {
                window.targetPosition.copy(targetPos);
                window.isMoving = true;
            } else {
                // Tới 80m là phanh lại ngắm bắn
                window.botState = 'ATTACKING';
                window.isMoving = false;
            }
        } 
        else if (window.botState === 'ATTACKING') {
            // Boss văng ra xa quá   thì lết theo
            if (dist > RANGE_CHASE) {
                window.botState = 'CHASING';
                window.targetPosition.copy(targetPos);
                window.isMoving = true;
            } else {
                // Đứng trong vòng   thì chôn chân tại chỗ xả đạn
                window.isMoving = false;
                
                let huongNhin = new THREE.Vector3().subVectors(targetPos, nvc.position).projectOnPlane(nvc.up).normalize();
                let targetMat = new THREE.Matrix4().lookAt(nvc.position, nvc.position.clone().sub(huongNhin), nvc.up);
                nvc.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.3);

                // TỰ ĐỘNG BẤM SKILL
                let now = Date.now();
                if (now - window.thoiGianSpam > 1000) {
                    window.thoiGianSpam = now;
                    window.mucTieuHienTai = quaiTotNhat; 
                    
                    let keys = ['Q', 'E', 'R', 'F'];
                    let k = keys[Math.floor(Math.random() * keys.length)];
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: k, code: 'Key' + k }));
                    setTimeout(() => document.dispatchEvent(new KeyboardEvent('keyup', { key: k, code: 'Key' + k })), 100);
                }
            }
        }
    } else {
        window.botState = 'IDLE';
        if (window.isMoving) window.isMoving = false;
        window.mucTieuHienTai = null;
        if (window.vongMucTieu) window.vongMucTieu.visible = false;
    }
}, 200);
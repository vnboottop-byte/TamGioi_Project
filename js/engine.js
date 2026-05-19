// 🌍 ĐỘNG CƠ CỐT LÕI (CORE ENGINE) - TÍCH HỢP MOBILE MODE
THREE.Cache.enabled = !window.isMobile; 
window.scene = new THREE.Scene();
window.camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.01, 3000);
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (window.ZONE_ID && window.ZONE_ID !== 'TRUNG_CHAU') {
    window.KIEU_TRONG_LUC = 'PHANG';
    window.toaDoMatDat = window.SPAWN_Y || 0;  
} else {
    window.KIEU_TRONG_LUC = 'CAU';
}
window.renderer = new THREE.WebGLRenderer({
    antialias: !window.isMobile, 
    logarithmicDepthBuffer: !window.isMobile,
    powerPreference: "high-performance" 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.isMobile ? 1.0 : window.devicePixelRatio);
renderer.shadowMap.enabled = !window.isMobile;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.LinearToneMapping; 
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

if (typeof THREE.RoomEnvironment !== 'undefined') {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();
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











// ==========================================
// ✨ BỘ LỌC HÀO QUANG VŨ KHÍ (VFX SIÊU NHẸ CHỐNG LAG)
// ==========================================
window.bocHaoQuang3D = function (meshVuKhi, capDo) {
    if (!meshVuKhi || capDo < 4) return; // Dưới +4 mộc mạc không phát sáng

    let mauAura = 0x00ff00; // +4 đến +6: Khói Xanh
    if (capDo >= 7 && capDo <= 9) mauAura = 0x9b59b6;      // +7 đến +9: Tím Huyền Bí
    else if (capDo >= 10 && capDo <= 12) mauAura = 0xff3300; // +10 đến +12: Đỏ Rực (Hỏa Diệm)
    else if (capDo >= 13 && capDo <= 14) mauAura = 0x00ffff; // +13 đến +14: Cyan Bạch Kim
    else if (capDo >= 15) mauAura = 0xffaa00;                // +15: Vàng Gold Chí Tôn

    meshVuKhi.traverse(child => {
        if (child.isMesh && !child.userData.isAura) {
            // Nhân bản khung xương để làm "lớp vỏ" ánh sáng
            let voAura = new THREE.Mesh(
                child.geometry.clone(),
                new THREE.MeshBasicMaterial({
                    color: mauAura,
                    transparent: true,
                    opacity: capDo >= 15 ? 0.7 : 0.4,
                    blending: THREE.AdditiveBlending, // Cơ chế hòa trộn tạo độ phát sáng chói lóa
                    depthWrite: false,
                    wireframe: capDo >= 10 // Đồ VIP >= 10 sẽ có thêm hiệu ứng lưới điện chạy quanh
                })
            );
            voAura.userData.isAura = true;

            // Phình to lớp vỏ ra một chút để bọc bên ngoài vũ khí gốc
            let scaleBung = 1.05 + (capDo * 0.005);
            voAura.scale.set(scaleBung, scaleBung, scaleBung);

            // Nếu là mốc VIP, làm thêm 1 lớp lõi sáng đặc bên trong
            if (capDo >= 13) {
                let loiAura = new THREE.Mesh(
                    child.geometry.clone(),
                    new THREE.MeshBasicMaterial({
                        color: 0xffffff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false
                    })
                );
                loiAura.scale.set(1.02, 1.02, 1.02);
                loiAura.userData.isAura = true;
                child.add(loiAura);
            }

            child.add(voAura);
        }
    });
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








// 🌟 TỐI ƯU MOBILE VRAM: KHÔNG SỬ DỤNG COMPOSER VÀ BLOOM TRÊN DI ĐỘNG
window.composer = null;

if (!window.isMobile) {
    const renderScene = new THREE.RenderPass(scene, camera);

    // 🌟 THÔNG SỐ CHUẨN CHỐNG CHÓI LÓA TẠI ĐÂY:
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.25,   
        0.8,   
        0.98   
    );

    window.composer = new THREE.EffectComposer(renderer);
    window.composer.addPass(renderScene);
    window.composer.addPass(bloomPass);

    // Lớp Khử Răng Cưa (Chỉ PC)
    if (typeof THREE.SMAAPass !== 'undefined') {
        const smaaPass = new THREE.SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
        window.composer.addPass(smaaPass);
    }

    // 🌟 BẢN VÁ AAA: PHỤC HỒI ÁNH SÁNG THỰC (Chỉ PC)
    if (typeof THREE.GammaCorrectionShader !== 'undefined') {
        const gammaPass = new THREE.ShaderPass(THREE.GammaCorrectionShader);
        window.composer.addPass(gammaPass);
    }
}
// Nếu là Mobile, window.composer sẽ = null. 
// Động cơ ở cuối file sẽ tự động nhận biết và dùng "renderer.render(scene, camera);" trực tiếp, tiết kiệm ~400MB VRAM!


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

const loader = new THREE.GLTFLoader();

// Cỗ máy nén Xương & Đỉnh (Draco)
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/');
loader.setDRACOLoader(dracoLoader);

// Game sẽ tự động nhận diện và giải nén siêu tốc ảnh WebP mà không cần KTX2Loader
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
            // 🌟 BỘ GIẢM TỐC VŨ TRỤ: Giảm xuống 0.05 để mây bay lững lờ
            action.timeScale = 0.05;
            action.play();
        });
    }

    if (!window.danhSachMap) window.danhSachMap = [];

    // 2. PHẪU THUẬT TÁCH LỚP DỰA THEO TÊN NODE VÀ TÊN THƯ MỤC CHA
    mapHanhTinh.traverse((child) => {
        if (child.isMesh) {
            // 🌟 BẢN VÁ: CHỐNG LỖI UNDEFINED ĐÁNH SẬP GAME CHO MAP GỐC
            let tenMesh = (child.name || "").toLowerCase();
            let laMayKhyQuyen = false;

            child.traverseAncestors(p => {
                let pName = (p.name || "").toLowerCase();
                if (pName.includes('cloud') || pName.includes('may') || pName.includes('atmosphere') || pName.includes('datroi') || pName.includes('nganha') || pName.includes('sao') || pName.includes('sky')) laMayKhyQuyen = true;
            });

            if (tenMesh.includes('cloud') || tenMesh.includes('may') || tenMesh.includes('atmosphere') || tenMesh.includes('datroi') || tenMesh.includes('nganha') || tenMesh.includes('sao') || tenMesh.includes('sky')) laMayKhyQuyen = true;

            if (laMayKhyQuyen) {
                // 🌟 XỬ LÝ KHÍ QUYỂN / NGÂN HÀ / MÂY
                child.frustumCulled = false;
                child.renderOrder = -1; // Đẩy ra xa nhất

                if (child.material) {
                    if (child.material.map) {
                        child.material.emissiveMap = child.material.map;
                        child.material.emissive = new THREE.Color(0xffffff);
                        child.material.emissiveIntensity = 1.2;
                    }

                    // Ép mây thành dạng xuyên thấu (Bọc thép Array Material)
                    let mats = Array.isArray(child.material) ? child.material : [child.material];
                    let newMats = mats.map(mat => {
                        if (!mat) return new THREE.MeshBasicMaterial({ color: 0xffffff });
                        return new THREE.MeshBasicMaterial({
                            map: mat.map || null,
                            color: mat.color || 0xffffff,
                            transparent: true,
                            opacity: mat.opacity !== undefined ? mat.opacity : 1.0,
                            side: THREE.DoubleSide,
                            depthWrite: false, // Mây của Map gốc chỉ để ngắm, không cần bắt va chạm
                            blending: THREE.AdditiveBlending
                        });
                    });
                    child.material = newMats.length === 1 ? newMats[0] : newMats;
                }
                child.userData.isCloud = true;



            } else {
                // 🌟 XỬ LÝ MẶT ĐẤT & BIỂN (TRÁI ĐẤT NGUYÊN KHỐI)
                // iOS: TẮT lệnh cấm tàng hình. Chỉ vẽ những ngọn núi/mặt đất đang nằm đúng trước mặt Camera, tiết kiệm 80% GPU!
                child.frustumCulled = window.isMobile ? true : false;


                if (child.material) {
                    let mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(mat => {
                        if (!mat) return;
                        mat.side = THREE.DoubleSide;
                        mat.envMapIntensity = 0.0;
                        if (mat.map && window.renderer) {
                            // 🌟 TỐI ƯU MOBILE VRAM: Ép giảm chất lượng Texture của Map Gốc
                            mat.map.anisotropy = window.isMobile ? 1 : window.renderer.capabilities.getMaxAnisotropy();
                            mat.map.generateMipmaps = !window.isMobile;
                            mat.map.minFilter = window.isMobile ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
                        }
                        mat.needsUpdate = true;
                    });
                }

                if (child.geometry) {
                    // 🌟 TỐI ƯU MOBILE CPU: KHÔNG đúc vật lý đồng bộ trên luồng chính gây Crash iOS!
                    // Phân luồng cho BVH Worker làm việc này giống hệt như Map Chunk
                    if (window.isMobile && window.myBvhWorker && child.geometry.attributes && child.geometry.attributes.position) {
                        let jobId = window.jobIdCounter++;
                        window.bvhJobs[jobId] = { 
                            resolve: (serializedBVH) => { child.geometry.boundsTree = MeshBVHLib.MeshBVH.deserialize(serializedBVH, child.geometry); },
                            reject: (err) => { console.error("Lỗi đúc BVH Map Gốc:", err); }
                        };
                        window.myBvhWorker.postMessage({ 
                            id: jobId, 
                            positions: child.geometry.attributes.position.array, 
                            indices: child.geometry.index ? child.geometry.index.array : null 
                        });
                    } else if (typeof child.geometry.computeBoundsTree === 'function') {
                        // PC nhai tốt nên cho tự đúc
                        child.geometry.computeBoundsTree();
                    }
                }

                if (!window.danhSachMap) window.danhSachMap = [];
                window.danhSachMap.push(child);
                window.matDatHanhTinhGoc.push(child);


            }
        }
    });

    scene.add(mapHanhTinh);

    window.kiemSoatHanhTinhGoc = function () {
        if (!window.HANH_TINH_GOC) return;
        if (window.KIEU_TRONG_LUC === 'PHANG') {
            window.HANH_TINH_GOC.visible = false;
            if (window.danhSachMap && window.matDatHanhTinhGoc) {
                window.danhSachMap = window.danhSachMap.filter(m => !window.matDatHanhTinhGoc.includes(m));
            }
        } else {
            window.HANH_TINH_GOC.visible = true;
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

// 🌟 TỔNG KHO ASSET TOÀN CẦU (BẢN CHỐNG SẬP iPHONE)
window.tongKhoAsset3D = {};
window.hangDoiAsset3D = {}; // 🌟 Hàng đợi Promise chống tải 50 con Boss cùng lúc gây tràn RAM

window.taiHoacNhanBanAsset = function(url, callback) {
    if (!url || url.trim() === "") return;
    
    // 1. Nếu trong kho đã có -> Photocopy ngay lập tức
    if (window.tongKhoAsset3D[url]) {
        const cloneScene = THREE.SkeletonUtils.clone(window.tongKhoAsset3D[url].scene);
        callback(cloneScene, window.tongKhoAsset3D[url].animations);
        return;
    }

    // 2. 🌟 TỐI ƯU MOBILE: Nếu file này đang được tải dở dang bởi 1 con Boss khác -> Xếp hàng chờ, KHÔNG kích hoạt tải lại để tránh x50 lần RAM!
    if (window.hangDoiAsset3D[url]) {
        window.hangDoiAsset3D[url].then((asset) => {
            const cloneScene = THREE.SkeletonUtils.clone(asset.scene);
            callback(cloneScene, asset.animations);
        });
        return;
    }

    // 3. Nếu chưa có ai tải -> Khởi tạo tiến trình tải và khóa Hàng đợi lại
    window.hangDoiAsset3D[url] = new Promise((resolve) => {
        const loaderAsset = window.loaderSieuToc || new THREE.GLTFLoader();
        loaderAsset.load(url, (gltf) => {
            
            // 🌟 ÉP XUỐNG LAMBERT CHO QUÁI VÀ VŨ KHÍ TRÊN MOBILE ĐỂ CỨU GPU SHADER
            if (window.isMobile) {
                gltf.scene.traverse(child => {
                    if (child.isMesh && child.material) {
                        let mats = Array.isArray(child.material) ? child.material : [child.material];
                        let newMats = mats.map(mat => {
                            if (mat && mat.isMeshStandardMaterial) {
                                let newMat = new THREE.MeshLambertMaterial({
                                    map: mat.map, color: mat.color, transparent: mat.transparent, opacity: mat.opacity, side: THREE.DoubleSide
                                });
                                // Bắt buộc giữ lại Skinning cho xương quái vật để có thể đi lại
                                if (child.isSkinnedMesh) newMat.skinning = true;
                                return newMat;
                            }
                            if (child.isSkinnedMesh && mat) mat.skinning = true;
                            return mat;
                        });
                        child.material = newMats.length === 1 ? newMats[0] : newMats;
                    }
                });
            }

            window.tongKhoAsset3D[url] = { scene: gltf.scene, animations: gltf.animations };
            resolve(window.tongKhoAsset3D[url]); // Mở khóa cho các con Boss đang chờ copy
            
            const cloneScene = THREE.SkeletonUtils.clone(gltf.scene);
            callback(cloneScene, gltf.animations);
        });
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
           // chuanHoaKichThuoc(thuCuoi, 15); 
            
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
            mixer = new THREE.AnimationMixer(playerModel); 
            animationsMap = {}; 
            window.animationsMap = animationsMap; // 🌟 MỞ KHÓA: Công khai rương chiêu thức cho phái Luyện Thể đọc!
            
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
    // 🛑 LỆNH CẤM: Engine không được can thiệp vào Vũ khí 
    if (window.SCRIPT_PHAI_CUA_TOI) {
        if (window.SCRIPT_PHAI_CUA_TOI.includes('phai_cungthu') || window.SCRIPT_PHAI_CUA_TOI.includes('phai_bansung') || window.SCRIPT_PHAI_CUA_TOI.includes('phai_tutien') || window.SCRIPT_PHAI_CUA_TOI.includes('phai_phapsu')) {
            return;
        }
    }

    if (window.WEAPON_URL && window.WEAPON_URL.trim() !== "") {
        loader.load(window.WEAPON_URL, function (gltfW) {
            let vuKhi = gltfW.scene; 
            window.vuKhiModel = vuKhi;

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

            if (window.WEAPON_LEVEL && window.WEAPON_LEVEL > 0) {
                window.bocHaoQuang3D(vuKhi, window.WEAPON_LEVEL);
            }
            
        });
    }
}

function hoanTatTaiModels() {
    if (window.ADMIN_NAME === "Admin") { window.MAU_TOI_DA = 999999999; window.mauBanThan = 999999999; }
    playerModel.traverse(function(child) { if (child.isMesh) child.frustumCulled = false; });
    
    // 1. Nắn trục xương sống
    let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0,0,0);
    let huongLenTroiMoi = playerModel.position.clone().sub(tam);
    if (huongLenTroiMoi.lengthSq() < 0.001) huongLenTroiMoi.set(0, 1, 0); else huongLenTroiMoi.normalize();
    playerModel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenTroiMoi);
    playerModel.up.copy(huongLenTroiMoi);
    window.mucTieuBanKinhDat = playerModel.position.distanceTo(tam);

    playIdle(); 
    if (window.HePhaiHienTai && typeof window.HePhaiHienTai.khoiTao === 'function') window.HePhaiHienTai.khoiTao();

    // ==========================================
    // 🌟 BẢN VÁ LOADING THỦY LỰC: CHẠY TỪ TỪ THEO Ý SẾP
    // ==========================================
    let manHinhLoading = document.getElementById('manHinhLoadingGame');
    let thanhTienTrinh = document.getElementById('thanhTienTrinhGame');
    let textTienTrinh = document.getElementById('textTienTrinhGame');
    let soPhanTram = document.getElementById('soPhanTramLoading'); // 🌟 KHAI BÁO SỐ %
    
    window.loadTatCaMapTuSQL();
    window.loadSafeZonesVaTeleports();

    let thoiGianChoInit = 0;
    let phanTramAo = 0; // 🌟 Biến chạy tịnh tiến

    let vongLapChoVaoGame = setInterval(() => {
        thoiGianChoInit += 500;
        
        // --- A. THUẬT TOÁN CHẠY % GIẢ LẬP (SMOOTH PROGRESS) ---
        if (thoiGianChoInit <= 10000) {
            // 🚀 Giây 0 đến 10: Tăng tốc 6% mỗi giây (3% mỗi nhịp check)
            phanTramAo += 3;
            if (textTienTrinh) textTienTrinh.innerText = "Đang kết nối Vũ Trụ và Đúc Khuôn Vật Lý (BVH)...";
        } else {
            // 🐢 Giây 11 đến 30: Chạy lừ đừ mỗi nhịp 1% cho người chơi sốt ruột chơi
            phanTramAo += 1;
            if (textTienTrinh) textTienTrinh.innerText = "Đang uốn nắn Địa hình và Ổn định Không gian...";
        }

        // Khóa ở 99%, không cho lên 100% nếu chưa xong thật
        if (phanTramAo > 99) phanTramAo = 99;
        if (thanhTienTrinh) thanhTienTrinh.style.width = phanTramAo + '%';
        if (soPhanTram) soPhanTram.innerText = phanTramAo + '%'; // 🌟 ÉP SỐ NHẢY THEO THANH!

        // --- B. KIỂM TRA TRẠNG THÁI MAP THẬT ---
        if (!window.daNhanDanhSachMap) return; // Đợi SQL trả data

    
        // 🌟 TỐI ƯU MOBILE RAM: Chống tải song song nhiều Map cùng lúc gây nổ RAM (OOM)
        let coMapDangLoad = window.THONG_TIN_CAC_MAP && window.THONG_TIN_CAC_MAP.some(m => m.isLoading);
        
        if (window.THONG_TIN_CAC_MAP && !coMapDangLoad) {
            // Chỉ Load đúng 1 Map duy nhất tại 1 thời điểm! (Tải Tuần Tự)
            let rLoad = window.isMobile ? 3000 : 10000; // Khớp với bán kính Radar Mobile mới
            let mapCanLoad = window.THONG_TIN_CAC_MAP.find(mapData => {
                let mPos = new THREE.Vector3(parseFloat(mapData.pos_x), parseFloat(mapData.pos_y), parseFloat(mapData.pos_z));
                return playerModel.position.distanceTo(mPos) < rLoad && !mapData.isLoaded && !mapData.isLoading;
            });
            
            if (mapCanLoad) {
                window.xuLyLoadMapChunk(mapCanLoad);
            }
        }

        let coMapDaLoad = window.THONG_TIN_CAC_MAP && window.THONG_TIN_CAC_MAP.some(m => m.isLoaded);
        let vungDatNayCoMap = window.THONG_TIN_CAC_MAP && window.THONG_TIN_CAC_MAP.length > 0;
        
        let daXongXuoiThatSu = false;
        if (vungDatNayCoMap) {
            // Xong khi: Đã đúc ít nhất 1 map và không còn cái nào đang hì hục load
            if (!coMapDangLoad && coMapDaLoad) daXongXuoiThatSu = true;
        } else {
            daXongXuoiThatSu = true; // Map trống (Bắc Cực/Nam Cực) thì cho vào luôn
        }

                // --- C. CHỐT HẠ: NHẢY VỌT LÊN 100% ---
        if (daXongXuoiThatSu || thoiGianChoInit >= 30000) {
            clearInterval(vongLapChoVaoGame);
            
            if (thanhTienTrinh) thanhTienTrinh.style.width = '100%'; 
            if (soPhanTram) soPhanTram.innerText = '100%'; // 🌟 CHỐT SỐ 100%
            if (textTienTrinh) textTienTrinh.innerText = "THẾ GIỚI ĐÃ SẴN SÀNG! VÀO THÔI SẾP!";
            console.log("🟢 [LOADING] Thành công! Đã mở cửa thiên đình.");

            setTimeout(() => {
                if (manHinhLoading) {
                    manHinhLoading.style.opacity = '0';
                    setTimeout(() => { 
                        manHinhLoading.style.display = 'none'; 
                        // 🌟 TỐI ƯU MOBILE RAM: Vắt kiệt bộ nhớ đệm rác sau khi vào game!
                        if (window.isMobile) THREE.Cache.clear();
                    }, 1500);
                }
            }, 500);
        }


    }, 500);
}

function cayMatAdmin(modelGoc) {
    // Đã xóa bỏ chức năng gọi đôi mắt khổng lồ cho Admin
    return;
}

let idleTimer = null; 

// ĐÃ HOÀN THIỆN KHÔNG SỬA CHỮA NỮA BẮT ĐẦU 
// ==========================================
// 🎭 BỘ NÃO ANIMATION TỐI THƯỢNG (V43 - PHÂN NGỮ HỆ ANH/VIỆT TÁCH BIỆT)
// ==========================================
function playAnim(animName) {
    if (window.isTestingAnimation) return;
    
    let upName = animName.toUpperCase();

    // 🌟 TỔNG HỢP NHẬN DIỆN CHIÊU TẤN CÔNG CỦA MỌI HỆ PHÁI VÀ MODEL SKETCHFAB
    let laChieuTanCong = upName.includes('CHIEU') || upName.includes('ATTACK') || upName.includes('PUNCH') || upName.includes('KICK') || upName.includes('COMBO') || upName === 'TANCONG' || upName.includes('SKILL');

    // 🛡️ LÁ CHẮN MÚA CHIÊU: Đang múa thì cấm đi/chạy/bay/nhàn rỗi chen ngang
    if (window.dangMuaChieu && !laChieuTanCong && upName !== 'CHET' && upName !== 'DIE' && upName !== 'DEATH') {
        return;
    }
    
    let dangCuoiThu = window.MOUNT_URL && window.MOUNT_URL.trim() !== "";

    
    // ==========================================
    // 🛠️ HÀM CỨU CÁNH: LẤY HOẠT ẢNH NGƯỜI CHƠI (HỆ TIẾNG VIỆT)
    // ==========================================
    function getActionNguoiChoi(tenViet) {
        let map = dangCuoiThu ? window.animationsMapChar : animationsMap;
        if (!map) return null;
        
        let action = map[tenViet];
        // 🌟 LUẬT DỰ PHÒNG CỦA SẾP: Không có chân (thiếu DIBO, CHAYBO, NHANROI) thì dồn về BAY!
        if (!action && !tenViet.includes('CHIEU') && tenViet !== 'CHET' && tenViet !== 'DIE') {
            action = map['BAY'];
        }
        return action;
    }

    // ==========================================
    // 🐎 NHÁNH 1: ĐANG CƯỠI THÚ
    // ==========================================
    if (dangCuoiThu) {
        // --- A. NGƯỜI CƯỠI TRÊN LƯNG (TIẾNG VIỆT) ---
        if (laChieuTanCong || upName === 'CHET' || upName === 'DIE') {
            let actNguoi = getActionNguoiChoi(upName);
            if (actNguoi) {
                if (window.currentActionChar) window.currentActionChar.fadeOut(0.2);
                window.currentActionChar = actNguoi;
                window.currentActionChar.reset().fadeIn(0.2).play();
                window.currentAnimNameChar = upName;
                
                if (laChieuTanCong) {
                    window.thoiGianAnimHienTai = actNguoi.getClip().duration * 1000;
                    kichHoatKhiencAnimation(window.thoiGianAnimHienTai);
                }
            }
            return; // Thú không đánh nhau, ngắt luôn luồng lệnh tại đây!
        } 
        else {
            // Lệnh di chuyển: Người ngồi im (NHANROI)
            if (!window.dangMuaChieu) {
                let actNguoi = getActionNguoiChoi('NHANROI');
                if (actNguoi && window.currentAnimNameChar !== 'NHANROI') {
                    if (window.currentActionChar) window.currentActionChar.fadeOut(0.2);
                    window.currentActionChar = actNguoi;
                    window.currentActionChar.reset().fadeIn(0.2).play();
                    window.currentAnimNameChar = 'NHANROI';
                }
            }

            // --- B. CON THÚ DƯỚI ĐẤT (DỊCH SANG TIẾNG ANH) ---
            let checkName = upName;
            if (upName === 'NHANROI') checkName = 'IDLE';
            else if (upName === 'CHAYBO' || upName === 'DIBO') checkName = 'RUN';
            else if (upName === 'BAY') checkName = 'FLY';
            else if (upName === 'CHET' || upName === 'DIE') checkName = 'DIE';

            if (currentAnimName === checkName) return; 
            
            let action = animationsMap[checkName];
            // Vét máng cho Thú trên mạng
            if (!action) {
                if (checkName === 'RUN') action = animationsMap['WALK'] || animationsMap['FLY'];
                else if (checkName === 'IDLE') action = animationsMap['WAIT'] || animationsMap['FLY'];
                else if (checkName === 'FLY') action = animationsMap['JUMP'] || animationsMap['RUN'];
            }
            
            if (action) {
                if (currentAction) currentAction.fadeOut(0.2); 
                currentAction = action; 
                currentAction.reset().fadeIn(0.2).play(); 
                currentAnimName = checkName;
            }
        }
    } 
    else {
        // ==========================================
        // 🏃 NHÁNH 2: NGƯỜI CHƠI ĐI BỘ DƯỚI ĐẤT (FULL TIẾNG VIỆT)
        // ==========================================
        if (window.dangMuaChieu && !laChieuTanCong && upName !== 'CHET' && upName !== 'DIE') return;

        if (currentAnimName === upName) return; 
        
        let action = getActionNguoiChoi(upName);
        
        if (action) {
            if (currentAction) currentAction.fadeOut(0.2); 
            currentAction = action; 
            currentAction.reset().fadeIn(0.2).play(); 
            currentAnimName = upName;

            if (laChieuTanCong) {
                window.thoiGianAnimHienTai = action.getClip().duration * 1000;
                kichHoatKhiencAnimation(window.thoiGianAnimHienTai);
            }
        }
    }
}

// 🛡️ HÀM CỤC BỘ: CHỐNG SPAM VÀ ĐÈ LỆNH KHI ĐANG MÚA
function kichHoatKhiencAnimation(thoiGianTheoAnim) {
    window.dangMuaChieu = true;
    let thoiGianKhoa = thoiGianTheoAnim || 1500;
    if (thoiGianKhoa < 500) thoiGianKhoa = 500;   
    if (thoiGianKhoa > 2000) thoiGianKhoa = 1500; 
    
    if (window.khoaAnimTimeout) clearTimeout(window.khoaAnimTimeout);
    window.khoaAnimTimeout = setTimeout(() => {
        window.dangMuaChieu = false;
    }, thoiGianKhoa);
}
// ĐÃ HOÀN THIỆN KHÔNG SỬA CHỮA NỮA KẾT THÚC !

window.epNhanVatMua = playAnim; 
function playIdle() {
    if (idleTimer) clearInterval(idleTimer); playAnim('NHANROI'); 
    idleTimer = setInterval(() => { if (!window.isMoving && !window.isKeyboardMoving) playAnim('NHANROI'); }, 8000); 
}

const clock = new THREE.Clock(); let lastSendTime = 0; 
const bayHud = document.createElement('div');
bayHud.id = 'bay-hud'; bayHud.style.cssText = 'position:fixed; bottom:20px; right:20px; background:rgba(0,15,30,0.8); border:2px solid #00ffff; box-shadow:0 0 10px #00ffff; padding:10px 15px; color:#00ffff; font-family:monospace; font-size:16px; border-radius:8px; z-index:9999; pointer-events:none; text-shadow:0 0 5px #00ffff;';
document.body.appendChild(bayHud);












window.lastFrameTime = performance.now();
function animate() {
    requestAnimationFrame(animate);
    // 🌟 BỘ KHÓA KHUNG HÌNH (FPS THROTTLE) DÀNH RIÊNG CHO MOBILE
    if (window.isMobile) {
        let now = performance.now();
        let elapsed = now - window.lastFrameTime;
        // Bắt máy nghỉ ngơi, chỉ vẽ 30 khung hình / 1 giây (~33ms mỗi frame)
        if (elapsed < 33) return; 
        window.lastFrameTime = now - (elapsed % 33);
    }
    window.CPU_START_TIME = performance.now();
    // 🌟 KIỂM TRA ĐẠP CHÂN VÀO SAFE ZONE & CỔNG DỊCH CHUYỂN
    if (typeof playerModel !== 'undefined' && playerModel) {
        let inSafe = false;
        if (typeof window.kiemTraSafeZone === 'function') {
            inSafe = window.kiemTraSafeZone(playerModel.position);
        }      
        if (inSafe !== window.IS_IN_SAFE_ZONE) {
            window.IS_IN_SAFE_ZONE = inSafe;
            let uiSZ = document.getElementById('uiVungAnToan');
            if (!uiSZ) {
                uiSZ = document.createElement('div');
                uiSZ.id = 'uiVungAnToan';
                uiSZ.innerHTML = '🕊️ Vùng An Toàn';
                uiSZ.style.cssText = 'display:none; position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: rgba(46, 204, 113, 0.9); color: white; padding: 8px 30px; border-radius: 30px; font-weight: 900; font-size: 18px; border: 2px solid #fff; box-shadow: 0 0 15px #2ecc71; z-index: 9999; text-transform: uppercase;';
                document.body.appendChild(uiSZ);
            }
            uiSZ.style.display = inSafe ? 'block' : 'none';
        }
        if (!window.dangDichChuyen && window.DANH_SACH_CONG && window.DANH_SACH_CONG.length > 0) {
            for (let i = 0; i < window.DANH_SACH_CONG.length; i++) {
                let cong = window.DANH_SACH_CONG[i];
                if (playerModel.position.distanceTo(cong.mesh.position) < 3.0) {
                    window.thucHienTruyenTong(cong);
                    break;
                }
            }
        }
    }
    try {
        if (typeof playerModel !== 'undefined' && playerModel && window.ROLE === "admin") { window.mauBanThan = window.MAU_TOI_DA = 999999999; window.isDead = false; }
        const delta = typeof clock !== 'undefined' ? clock.getDelta() : 0.016;

        if (typeof mixer !== 'undefined' && mixer) mixer.update(delta);
        if (typeof window.mixerNhanVatPhu !== 'undefined' && window.mixerNhanVatPhu) window.mixerNhanVatPhu.update(delta);
        if (typeof window.MAP_MIXERS !== 'undefined') window.MAP_MIXERS.forEach(m => m.update(delta));
        if (window.mixerTraiDat) window.mixerTraiDat.update(delta);
        if (window.TELEPORT_MIXERS) window.TELEPORT_MIXERS.forEach(m => m.update(delta));
        
        if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers !== null) {
            for (let id in window.remotePlayers) {
                const remote = window.remotePlayers[id];
                if (remote && remote.status === 'ready') {
                    if (remote.mixer) remote.mixer.update(delta);
                    if (remote.mixerChar) remote.mixerChar.update(delta);

                    if (remote.mesh && window.TAM_HANH_TINH_HIEN_TAI) {
                        let huongLenTroi = remote.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                        let trucUpHienTai = new THREE.Vector3(0, 1, 0).applyQuaternion(remote.mesh.quaternion);
                        let nanTrucQuat = new THREE.Quaternion().setFromUnitVectors(trucUpHienTai, huongLenTroi);
                        remote.mesh.quaternion.premultiply(nanTrucQuat);
                    }
                }
            }
        }
        
        if (window.mucTieuHienTai && window.vongMucTieu && window.vongMucTieu.visible) {
            let tPos = window.mucTieuHienTai.mesh ? window.mucTieuHienTai.mesh.position : (window.mucTieuHienTai.position || null);
            if (tPos) {
                window.vongMucTieu.position.x = tPos.x;
                window.vongMucTieu.position.z = tPos.z;
                window.vongMucTieu.position.y = tPos.y + 0.5;
                window.vongMucTieu.rotation.z += 0.05; 
            }
        }

        if (typeof window.capNhatAIQuaiVat === 'function') window.capNhatAIQuaiVat(delta);






        // ===============================================
        // 🌍 LÕI TRỌNG LỰC & VẬT LÝ DI CHUYỂN
        // ===============================================
        if (typeof playerModel !== 'undefined' && playerModel && !window.isDead) {
            var viTriCu = playerModel.position.clone();

            // ==========================================
            // ⚡ LƯỚI ĐIỆN KHÔNG GIAN (CHỈ CHẶN TRẦN TRỜI - KHÔNG CHẶN VÁCH)
            // ==========================================
            function kiemTraVaChamKetGioi(huongDi, khoangCachBuffer) {
                if (!window.danhSachBauTroi || window.danhSachBauTroi.length === 0) return false;
                if (!window.radarBauTroi) { 
                    window.radarBauTroi = new THREE.Raycaster(); 
                    window.radarBauTroi.firstHitOnly = true; 
                }
                
                let huongLen = playerModel.up.clone().normalize();
                let diemBan = playerModel.position.clone().add(huongLen.clone().multiplyScalar(1.5)); 
                
                window.radarBauTroi.set(diemBan, huongDi);
                let chamBauTroi = window.radarBauTroi.intersectObjects(window.danhSachBauTroi, true);
                
                if (chamBauTroi.length > 0 && chamBauTroi[0].distance < khoangCachBuffer) {
                    // 🌟 TỐI HẬU THUẬT: Dội ngược Sếp lại 0.5m để chống lọt do lag phím!
                    playerModel.position.add(huongDi.clone().negate().multiplyScalar(0.5));
                    if (!window.dangBaoBauTroi) {
                        window.dangBaoBauTroi = true;
                        if(typeof window.hienThongBaoBoGoc === 'function') window.hienThongBaoBoGoc("☁️ Cảnh báo: Chạm giới hạn Bầu Trời!", "#3498db");
                        setTimeout(() => window.dangBaoBauTroi = false, 2000);
                    }
                    return true; 
                }
                return false;
            }

            if (window.KIEU_TRONG_LUC === 'PHANG') {
                // ----------------------------------------------------
                // 🟩 NHÁNH 1: XỬ LÝ VẬT LÝ CHO MAP PHẲNG
                // ----------------------------------------------------
                var huongLenTroi = new THREE.Vector3(0, 1, 0); 
                var tamHanhTinh = new THREE.Vector3(0, 0, 0);  
                var rHanhTinh = 0;

                if (!window.radarTrongLuc) { window.radarTrongLuc = new THREE.Raycaster(); }
                // 🌟 GIỮ LẠI TÍNH NĂNG CHUI HẦM
                window.radarTrongLuc.firstHitOnly = false; 

                if (typeof window.khungHinhRadar === 'undefined') window.khungHinhRadar = 0; window.khungHinhRadar++;

                let dangCuaDong = window.isMoving || window.isKeyboardMoving || (window.keys && (window.keys.space || window.keys.shift || window.keys.x || window.keys.c));

                // 🌟 TỐI ƯU MOBILE CPU: Giảm tần suất bắn tia Radar từ 3 frame xuống 10 frame trên Mobile
                let nhipRadar = window.isMobile ? 10 : 3;
                if (window.khungHinhRadar % nhipRadar === 0 || window.khungHinhRadar < 20) {
                    let tiaXuatPhat = playerModel.position.clone(); tiaXuatPhat.y += 50000;
                    window.radarTrongLuc.set(tiaXuatPhat, new THREE.Vector3(0, -1, 0));
                    window.radarTrongLuc.far = Infinity;
                    window.danhSachMap = window.danhSachMap.filter(obj => obj && typeof obj.raycast === 'function');
                    var intersects = window.radarTrongLuc.intersectObjects(window.danhSachMap, true);
                    if (intersects.length > 0) {
                        let chieuCaoToiDa = playerModel.position.y + 3.0;
                        let diemChamDat = intersects.find(hit => hit.point.y <= chieuCaoToiDa && (!hit.object.userData || !hit.object.userData.isCloud));
                        if (diemChamDat) window.toaDoMatDat = diemChamDat.point.y;
                    }
                }

                var matDatY = window.toaDoMatDat || 0;
                var doCao = playerModel.position.y - matDatY;

                playerModel.up.copy(huongLenTroi);
                playerModel.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0).applyQuaternion(playerModel.quaternion), huongLenTroi));

                var currentWalk = 0.15; var currentSprint = 0.4; var tangKhongGian = "VŨ TRỤ"; var mauChu = "#ff00ff"; var isFlying = doCao > 5.0;
                if (doCao <= 5.0) { currentWalk = 0.15; currentSprint = 0.4; tangKhongGian = "🌍 MẶT ĐẤT"; mauChu = "#00ff00"; }
                else if (doCao < 1000.0) { currentWalk = 0.5; currentSprint = 0.8; tangKhongGian = "⚔️ BẦU KHÍ QUYỂN"; mauChu = "#ffff00"; }
                else { currentWalk = 1.0; currentSprint = 2.0; tangKhongGian = "🚀 VŨ TRỤ SÂU"; mauChu = "#ff00ff"; }
                if (window.ROLE === 'admin' && tangKhongGian === "🚀 VŨ TRỤ SÂU") { currentWalk *= 15; currentSprint *= 15; }

                var dangChuDongDoiDoCao = false;
                var tocDoBayLen = currentSprint * 0.7; 

                if (window.keys && window.keys.space) {
                    dangChuDongDoiDoCao = true; window.isMoving = false;
                    let vLen = new THREE.Vector3(0, 1, 0);

                    // 🌟 KIỂM TRA TRẦN TRỜI 
                    if (!kiemTraVaChamKetGioi(vLen, tocDoBayLen + 2.0)) {
                        playerModel.position.y += tocDoBayLen;
                        tocDoHienTaiThucTe = tocDoBayLen;
                    }
                    if (typeof playAnim === 'function') playAnim('BAY');
                } else if (window.keys && (window.keys.shift || window.keys.x || window.keys.c)) {
                    dangChuDongDoiDoCao = true; window.isMoving = false;
                    if (doCao > 0) { 
                        playerModel.position.y -= tocDoBayLen; 
                        tocDoHienTaiThucTe = tocDoBayLen;
                        if (playerModel.position.y < matDatY) playerModel.position.y = matDatY; 
                    }
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
                        // 🌟 CHẠY XUYÊN TƯỜNG NHƯNG BỊ CHẶN BỞI BẦU TRỜI (CHỐNG LỖI KÉP)
                        if (!kiemTraVaChamKetGioi(huongDiChuyen, currentSprint + 2.0)) {
                            let yTruoc = playerModel.position.y;
                            playerModel.position.add(huongDiChuyen.clone().multiplyScalar(currentSprint));
                            if (!dangChuDongDoiDoCao) {
                                if (yTruoc - matDatY < 3.0) playerModel.position.y = THREE.MathUtils.lerp(playerModel.position.y, matDatY, 0.3);
                                else playerModel.position.y = yTruoc;
                            }
                        }
                        let targetMat = new THREE.Matrix4().lookAt(playerModel.position, playerModel.position.clone().sub(huongDiChuyen), huongLenTroi);
                        playerModel.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.2);
                        tocDoHienTaiThucTe = currentSprint;
                    }


                } else if (window.isMoving && typeof window.targetPosition !== 'undefined') {
                    let vecToTarget = new THREE.Vector3().subVectors(window.targetPosition, playerModel.position);
                    if (vecToTarget.length() > 2.0) {
                        let huongBayThang = vecToTarget.clone().normalize();
                        // 🌟 TÁCH BIỆT THEO LỆNH SẾP: CLICK CHUỘT LÀ ĐI BỘ
                        if (typeof playAnim === 'function') playAnim(doCao > 5.0 ? 'BAY' : 'DIBO');


                        
                        // 🌟 CHẠY CHUỘT BỊ CHẶN BỞI BẦU TRỜI
                        if (!kiemTraVaChamKetGioi(huongBayThang, currentSprint + 2.0)) {
                            playerModel.position.add(huongBayThang.multiplyScalar(currentSprint)); 
                            tocDoHienTaiThucTe = currentSprint;
                            if (playerModel.position.y - matDatY < 0.1) playerModel.position.y = THREE.MathUtils.lerp(playerModel.position.y, matDatY, 0.3);
                        } else {
                            window.isMoving = false; // Ngừng chạy nếu đập tường mây
                        }
                        
                        let targetMat = new THREE.Matrix4().lookAt(playerModel.position, playerModel.position.clone().sub(huongBayThang), huongLenTroi);
                        playerModel.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.2);
                    } else {
                        window.isMoving = false; if (typeof playIdle === 'function') playIdle();
                        if (window.vongMucTieu) window.vongMucTieu.visible = false;
                    }
                } else {
                    if (window.keys && !window.keys.space) {
                        if (isFlying) { if (typeof playAnim === 'function') playAnim('BAY'); } else { if (typeof playIdle === 'function') playIdle(); }
                    }
                    if (!dangChuDongDoiDoCao && doCao < 0.05) playerModel.position.y = matDatY;
                }
            } 
            else {
                // ----------------------------------------------------
                // 🌎 NHÁNH 2: XỬ LÝ VẬT LÝ CHO HÀNH TINH CẦU 
                // ----------------------------------------------------
                var diemChamDat = null;
                var huongLenTroiMoi = playerModel.up.clone();
                var timThayDat = false;

                if (!window.radarTrongLuc) { window.radarTrongLuc = new THREE.Raycaster(); }
                window.radarTrongLuc.firstHitOnly = false; 

                var hanhTinhGanNhat = null;
                var tamHanhTinh = new THREE.Vector3(0, 0, 0);

                huongLenTroiMoi.subVectors(playerModel.position, tamHanhTinh);
                if (huongLenTroiMoi.lengthSq() < 0.001) {
                    huongLenTroiMoi.set(0, 1, 0); 
                } else {
                    huongLenTroiMoi.normalize();
                }

                timThayDat = true; hanhTinhGanNhat = true;

                if (typeof window.khungHinhRadar === 'undefined') window.khungHinhRadar = 0; window.khungHinhRadar++;
                let dangCuaDong = window.isMoving || window.isKeyboardMoving || (window.keys && (window.keys.space || window.keys.shift || window.keys.x || window.keys.c));

                // 🌟 TỐI ƯU MOBILE CPU: Giảm tần suất bắn tia Radar từ 3 frame xuống 10 frame trên Mobile
                let nhipRadar = window.isMobile ? 10 : 3;
                if (window.khungHinhRadar % nhipRadar === 0 || window.khungHinhRadar < 20) {
                    let tiaXuatPhat = tamHanhTinh.clone().add(huongLenTroiMoi.clone().multiplyScalar(50000));
                    window.radarTrongLuc.set(tiaXuatPhat, huongLenTroiMoi.clone().negate());
                    window.radarTrongLuc.far = Infinity;
                    window.danhSachMap = window.danhSachMap.filter(obj => obj && typeof obj.raycast === 'function');
                    
                    var intersects = window.radarTrongLuc.intersectObjects(window.danhSachMap, true);
                    if (intersects.length > 0) { 
                        let banKinhHienTai = playerModel.position.distanceTo(tamHanhTinh);
                        let banKinhToiDa = banKinhHienTai + 3.0; 
                        let diemChamDat = intersects.find(hit => tamHanhTinh.distanceTo(hit.point) <= banKinhToiDa && (!hit.object.userData || !hit.object.userData.isCloud));
                        if (diemChamDat) window.mucTieuBanKinhDat = tamHanhTinh.distanceTo(diemChamDat.point); 
                    }
                }

                var rHanhTinh = window.mucTieuBanKinhDat || 10000.0;
                window.TAM_HANH_TINH_HIEN_TAI = tamHanhTinh.clone(); window.BAN_KINH_HANH_TINH_HIEN_TAI = rHanhTinh;
                var doCao = playerModel.position.distanceTo(tamHanhTinh) - rHanhTinh;

                if (timThayDat) { let tocDoNanXuong = (doCao > 20000) ? 0.005 : 0.05; playerModel.up.lerp(huongLenTroiMoi, tocDoNanXuong).normalize(); }
                var huongLenTroi = playerModel.up.clone();

                var currentWalk = 0.15; var currentSprint = 0.4; var tangKhongGian = "VŨ TRỤ"; var mauChu = "#ff00ff"; var isFlying = doCao > 5.0;

                if (doCao <= 5.0 && timThayDat) { currentWalk = 0.15; currentSprint = 0.4; tangKhongGian = "🌍 MẶT ĐẤT"; mauChu = "#00ff00"; }
                else if (doCao < 1000.0 && timThayDat) { currentWalk = 0.5; currentSprint = 0.8; tangKhongGian = "⚔️ BẦU KHÍ QUYỂN"; mauChu = "#ffff00"; }
                else { currentWalk = 1.0; currentSprint = 2.0; tangKhongGian = "🚀 VŨ TRỤ SÂU"; mauChu = "#ff00ff"; }

                if (window.ROLE === 'admin') { if (tangKhongGian === "🚀 VŨ TRỤ SÂU") { currentWalk *= 15; currentSprint *= 15; } }

                var dangChuDongDoiDoCao = false;
                var tocDoBayLen = currentSprint * 0.7; 

                if (window.keys && window.keys.space) {
                    dangChuDongDoiDoCao = true; window.isMoving = false;
                    let vLen = playerModel.up.clone().normalize();

                    // 🌟 KIỂM TRA TRẦN TRỜI
                    if (!kiemTraVaChamKetGioi(vLen, tocDoBayLen + 2.0)) {
                        playerModel.position.add(vLen.multiplyScalar(tocDoBayLen));
                        tocDoHienTaiThucTe = tocDoBayLen;
                    }
                    if (typeof playAnim === 'function') playAnim('BAY');
                } else if (window.keys && (window.keys.shift || window.keys.x || window.keys.c)) {
                    dangChuDongDoiDoCao = true; window.isMoving = false;
                    if (doCao > 0) {
                        playerModel.position.add(huongLenTroi.clone().multiplyScalar(-tocDoBayLen));
                        tocDoHienTaiThucTe = tocDoBayLen;
                        if (playerModel.position.distanceTo(tamHanhTinh) < rHanhTinh + 0.1) {
                            playerModel.position.copy(tamHanhTinh).add(huongLenTroi.clone().multiplyScalar(rHanhTinh + 0.1));
                        }
                    }
                    if (typeof playAnim === 'function') playAnim('BAY');
                }

                var huongDiChuyen = new THREE.Vector3(0, 0, 0); window.isKeyboardMoving = window.keys && (window.keys.w || window.keys.a || window.keys.s || window.keys.d);
                var tocDoHienTaiThucTe = 0;

                if (window.isKeyboardMoving) {
                    window.isMoving = false;
                    if (typeof playAnim === 'function') playAnim(isFlying ? 'BAY' : 'CHAYBO');
                    const forward = new THREE.Vector3(); if (typeof camera !== 'undefined') camera.getWorldDirection(forward);
                    forward.projectOnPlane(huongLenTroi).normalize(); 
                    if (forward.lengthSq() === 0) forward.set(0, 0, -1).applyQuaternion(playerModel.quaternion).projectOnPlane(huongLenTroi).normalize();
                    const right = new THREE.Vector3().crossVectors(forward, huongLenTroi).normalize();

                    if (window.keys.w) huongDiChuyen.add(forward); if (window.keys.s) huongDiChuyen.sub(forward);
                    if (window.keys.a) huongDiChuyen.sub(right); if (window.keys.d) huongDiChuyen.add(right); huongDiChuyen.normalize();

                    if (huongDiChuyen.length() > 0) {
                        if (!kiemTraVaChamKetGioi(huongDiChuyen, currentSprint + 2.0)) {
                            let doCaoTruocKhiChay = playerModel.position.distanceTo(tamHanhTinh);
                            playerModel.position.add(huongDiChuyen.clone().multiplyScalar(currentSprint));
                            if (!dangChuDongDoiDoCao) {
                                let vecTam = playerModel.position.clone().sub(tamHanhTinh).normalize();
                                if (doCaoTruocKhiChay < rHanhTinh + 3.0) {
                                    let viTriDat = tamHanhTinh.clone().add(vecTam.multiplyScalar(rHanhTinh + 0.1));
                                    playerModel.position.lerp(viTriDat, 0.3);
                                } else {
                                    let viTriCong = tamHanhTinh.clone().add(vecTam.multiplyScalar(doCaoTruocKhiChay));
                                    playerModel.position.copy(viTriCong);
                                }
                            }
                        }
                        let targetMat = new THREE.Matrix4().lookAt(playerModel.position, playerModel.position.clone().sub(huongDiChuyen), huongLenTroi);
                        playerModel.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.2);
                        tocDoHienTaiThucTe = currentSprint;
                    }


                } else if (window.isMoving && typeof window.targetPosition !== 'undefined') {
                    let viTriHienTai = playerModel.position.clone();
                    let vecToTarget = new THREE.Vector3().subVectors(window.targetPosition, viTriHienTai);
                    if (vecToTarget.length() > 2.0) {
                        let huongBayThang = vecToTarget.clone().normalize();
                        // 🌟 TÁCH BIỆT THEO LỆNH SẾP: CLICK CHUỘT LÀ ĐI BỘ
                        if (typeof playAnim === 'function') playAnim(doCao > 5.0 ? 'BAY' : 'DIBO');    


                        let tocDoThucTe = currentSprint;
                        if (!kiemTraVaChamKetGioi(huongBayThang, tocDoThucTe + 2.0)) {
                            playerModel.position.add(huongBayThang.multiplyScalar(tocDoThucTe)); 
                            tocDoHienTaiThucTe = tocDoThucTe;
                            
                            if (hanhTinhGanNhat && rHanhTinh > 0) {
                                let dCenter = playerModel.position.distanceTo(tamHanhTinh);
                                let vecTam = playerModel.position.clone().sub(tamHanhTinh).normalize();
                                if (dCenter < rHanhTinh + 0.1) {
                                    let viTriDat = tamHanhTinh.clone().add(vecTam.multiplyScalar(rHanhTinh + 0.1));
                                    playerModel.position.lerp(viTriDat, 0.3);
                                }
                            }
                        } else {
                            window.isMoving = false;
                        }

                        let targetMat = new THREE.Matrix4().lookAt(playerModel.position, playerModel.position.clone().sub(huongBayThang), huongLenTroi);
                        playerModel.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.2);
                        
                    } else {
                        window.isMoving = false; if (typeof playIdle === 'function') playIdle();
                        if (window.vongMucTieu && !window.mucTieuHienTai) window.vongMucTieu.visible = false;
                    }
                } else {
                    if (window.keys && !window.keys.space) {
                        if (isFlying) { if (typeof playAnim === 'function') playAnim('BAY'); }
                        else if (currentAnimName === 'CHAYBO' || currentAnimName === 'DIBO' || currentAnimName === 'BAY') { if (typeof playIdle === 'function') playIdle(); }
                    }
                    if (!dangChuDongDoiDoCao) {
                        let dCenter = playerModel.position.distanceTo(tamHanhTinh);
                        let vecTam = playerModel.position.clone().sub(tamHanhTinh).normalize();
                        if (dCenter < rHanhTinh + 0.05) {
                            let viTriDat = tamHanhTinh.clone().add(vecTam.multiplyScalar(rHanhTinh + 0.05));
                            playerModel.position.copy(viTriDat);
                        }
                    }
                }
            } 

            if (playerModel && typeof huongLenTroi !== 'undefined') {
                if (!window.isMoving) {
                    let trucUpHienTai = new THREE.Vector3(0, 1, 0).applyQuaternion(playerModel.quaternion);
                    let nanTrucQuat = new THREE.Quaternion().setFromUnitVectors(trucUpHienTai, huongLenTroi);
                    playerModel.quaternion.premultiply(nanTrucQuat);
                }
            }

            if (window.isSettingSafeZone && playerModel && window.vongTronSafeZone && window.TAM_HANH_TINH_HIEN_TAI) {
                let rHanhTinh = window.BAN_KINH_HANH_TINH_HIEN_TAI || 80000;
                let pPos = playerModel.position;
                let distToCenter = pPos.distanceTo(window.TAM_HANH_TINH_HIEN_TAI);
                let alt = distToCenter - rHanhTinh;

                window.banKinhĐangĐo = Math.max(500, alt * 1.5);
                let textHienThi = document.getElementById('szRadiusDisplay');
                if (textHienThi) textHienThi.innerText = Math.floor(window.banKinhĐangĐo);

                let groundDir = pPos.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                window.toaDoTamĐangĐo = window.TAM_HANH_TINH_HIEN_TAI.clone().add(groundDir.multiplyScalar(rHanhTinh + 1.0)); 

                window.vongTronSafeZone.position.copy(window.toaDoTamĐangĐo);
                window.vongTronSafeZone.scale.set(window.banKinhĐangĐo, window.banKinhĐangĐo, 1);
                window.vongTronSafeZone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), groundDir);
            }

            if (document.getElementById('bay-hud')) {
                let kmh = Math.round(tocDoHienTaiThucTe * 216); 
                if (!window.isKeyboardMoving && !window.isMoving && !dangChuDongDoiDoCao) kmh = 0;
                document.getElementById('bay-hud').style.color = mauChu; document.getElementById('bay-hud').style.borderColor = mauChu; document.getElementById('bay-hud').style.boxShadow = `0 0 10px ${mauChu}`;
                document.getElementById('bay-hud').innerHTML = `TẦNG: <b>${tangKhongGian}</b><br>ĐỘ CAO: <b>${doCao === 9999 ? 'VÔ TẬN' : Math.max(0, Math.round(doCao)) + ' m'}</b><br>TỐC ĐỘ: <b>${kmh} KM/H</b>`;
            }

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

                let vecDiChuyen = new THREE.Vector3().subVectors(playerModel.position, viTriCu);
                let tocDoKhungHinh = vecDiChuyen.length();

                if (tocDoKhungHinh > 1.0) {
                    let huongLung = new THREE.Vector3(0, 0, -1).applyQuaternion(playerModel.quaternion).normalize();
                    let huongDau = new THREE.Vector3(0, 1, 0).applyQuaternion(playerModel.quaternion).normalize();
                    let offsetWorld = huongLung.multiplyScalar(25).add(huongDau.multiplyScalar(8));
                    
                    let offsetLocal = offsetWorld.applyMatrix4(maTranNguoc);
                    let fakeCamDich = controls.target.clone().add(offsetLocal);
                    window.fakeCam.position.lerp(fakeCamDich, 0.015); 
                }

                if (typeof controls !== 'undefined' && controls) controls.update(); 

                let offset = new THREE.Vector3().subVectors(window.fakeCam.position, controls.target);
                offset.applyMatrix4(maTranXoay);
                
                camera.position.copy(playerModel.position).add(offset);
                camera.lookAt(playerModel.position.clone().add(trucY.clone().multiplyScalar(2.0)));
                
                let vecCamTuTam = camera.position.clone().sub(tamHanhTinh);
                let khoangCachCam = vecCamTuTam.length();
                let doCaoAnToan = rHanhTinh + 0.5;

                if (khoangCachCam < doCaoAnToan) {
                    vecCamTuTam.normalize().multiplyScalar(doCaoAnToan);
                    camera.position.copy(tamHanhTinh).add(vecCamTuTam);
                }
            } 
        }




        // 🔄 CẬP NHẬT CHIÊU THỨC & VẬT LÝ HỆ PHÁI
        if (window.HePhaiHienTai) { if (typeof window.HePhaiHienTai.capNhat === 'function') window.HePhaiHienTai.capNhat(); if (typeof window.HePhaiHienTai.vongLapVatLy === 'function') window.HePhaiHienTai.vongLapVatLy(); }
        if (typeof updateCombatTuTien === 'function') updateCombatTuTien(); if (typeof window.updateCombatLuyenThe === 'function') window.updateCombatLuyenThe(); if (typeof updateCombatCungThu === 'function') updateCombatCungThu(); if (typeof updateCombatPhapSu === 'function') updateCombatPhapSu(); if (typeof updateCombatLazer === 'function') updateCombatLazer(); if (typeof updateCombatBanSung === 'function') updateCombatBanSung();

        try {
            if (typeof window.room !== 'undefined' && window.room && window.room.state === 'connected' && typeof playerModel !== 'undefined' && playerModel) {
                const now = Date.now();
                if (!window.oldPosLK) window.oldPosLK = new THREE.Vector3();

                let isPosChanged = playerModel.position.distanceTo(window.oldPosLK) > 0.1;
                let isAnimChanged = currentAnimName !== window.oldAnimLK; 
                let lastSend = window.lastSendTime || 0;

                // 🌟 CHỐNG NÓNG MÁY MOBILE: Nới lỏng độ trễ mạng để Ăng-ten Wi-fi/4G được nghỉ ngơi
                let doTreMang = window.isMobile ? 150 : 80;
                if (!window.dangLuot && (now - lastSend > 3000 || ((isPosChanged || isAnimChanged) && now - lastSend > doTreMang))) {
                    window.oldAnimLK = currentAnimName; 
                    let animNguoiChoi = currentAnimName || 'IDLE';
                    if (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") {
                        animNguoiChoi = window.currentAnimNameChar || 'IDLE'; 
                    }

                    let vuKhiHienThi = 1; 
                    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_cungthu')) {
                        vuKhiHienThi = (window.cungTrenTay && window.cungTrenTay.visible) ? 1 : 0;
                    } else {
                        vuKhiHienThi = (window.vuKhiModel && window.vuKhiModel.visible) ? 1 : 0;
                    }

                    // 🌟 BẢN VÁ AAA: Bơm thêm thông số thứ 17 (ZONE_ID)
                    const myPosArr = [
                        1, parseFloat(playerModel.position.x.toFixed(2)), parseFloat(playerModel.position.y.toFixed(2)), parseFloat(playerModel.position.z.toFixed(2)),
                        parseFloat(playerModel.rotation.x.toFixed(2)), parseFloat(playerModel.rotation.y.toFixed(2)), parseFloat(playerModel.rotation.z.toFixed(2)),
                        parseFloat(playerModel.scale.x.toFixed(2)), typeof window.mauBanThan !== 'undefined' ? Math.round(window.mauBanThan) : 100, typeof window.MAU_TOI_DA !== 'undefined' ? Math.round(window.MAU_TOI_DA) : 100,
                        animNguoiChoi, 
                        typeof window.CURRENT_MODEL_URL !== 'undefined' ? window.CURRENT_MODEL_URL : '', 
                        typeof window.WEAPON_URL !== 'undefined' ? window.WEAPON_URL : '', 
                        typeof window.MOUNT_URL !== 'undefined' ? window.MOUNT_URL : '', 
                        typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' ? window.SCRIPT_PHAI_CUA_TOI : '',
                        vuKhiHienThi,
                        window.ZONE_ID || 'TRUNG_CHAU' // <-- ĐÂY! Tấm vé thông hành qua các Map Phẳng!
                    ];

                    try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(myPosArr)), { reliable: false }); } catch (e) { }

                    window.lastSendTime = now;
                    window.oldPosLK.copy(playerModel.position);
                }
            }
        } catch (netErr) { }

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
    window.daNhanDanhSachMap = false; // 🌟 BẢN VÁ: ĐÁNH DẤU ĐANG KÉO DỮ LIỆU TỪ SQL
    
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
        window.daNhanDanhSachMap = true; // 🌟 XÁC NHẬN ĐÃ KÉO XONG
    }).catch(err => { console.error(err); window.daNhanDanhSachMap = true; });
};












// 2. HÀM TẢI MỘT CHUNK VÀO RAM (BẢN VÁ AAA: TẢI HIỀN HOÀ CHỐNG GIẬT LAG)
window.xuLyLoadMapChunk = function (mapData) {
    if (mapData.isLoaded || mapData.isLoading || typeof window.loaderSieuToc === 'undefined') return;
    
    // 🌟 LÁ CHẮN THÉP CHỐNG LỖI MÀN HÌNH ĐEN (THIẾU LINK MAP TRONG SQL)
    if (!mapData.model_url || mapData.model_url.trim() === '') {
        console.warn("⚠️ Đã chặn Map ID " + mapData.id + " vì bị rỗng link Model!");
        return;
    }
    
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
            // 🌟 LÁ CHẮN BẦU TRỜI (BẢN VÁ: CHỐNG LỖI UNDEFINED CỦA TÊN MESH)
            // ==========================================
            // 🌟 Dùng ( || "" ) để nếu Mesh không có tên thì biến thành chuỗi rỗng, không bao giờ bị lỗi sập Game!
            let tenMesh = (child.name || "").toLowerCase();
            let laMayKhyQuyen = false;

            child.traverseAncestors(p => {
                let pName = (p.name || "").toLowerCase();
                if (pName.includes('cloud') || pName.includes('may') || pName.includes('atmosphere') || pName.includes('datroi') || pName.includes('nganha') || pName.includes('sao') || pName.includes('sky')) laMayKhyQuyen = true;
            });

            if (tenMesh.includes('cloud') || tenMesh.includes('may') || tenMesh.includes('atmosphere') || tenMesh.includes('datroi') || tenMesh.includes('nganha') || tenMesh.includes('sao') || tenMesh.includes('sky')) laMayKhyQuyen = true;

            if (laMayKhyQuyen) {
                child.frustumCulled = false;
                child.renderOrder = -1; // Đẩy ra xa nhất

                if (child.material) {
                    let mats = Array.isArray(child.material) ? child.material : [child.material];
                    let newMats = mats.map(mat => {
                        if (!mat) return new THREE.MeshBasicMaterial({ color: 0xffffff });
                        return new THREE.MeshBasicMaterial({
                            map: mat.map || null, 
                            color: mat.color || 0xffffff, 
                            transparent: true,
                            opacity: mat.opacity !== undefined ? mat.opacity : 1.0,
                            side: THREE.DoubleSide, 
                            depthWrite: true // 🌟 ĐỂ SKY KHÔNG BỊ TÀNG HÌNH
                        });
                    });
                    child.material = newMats.length === 1 ? newMats[0] : newMats;
                }
                child.userData.isCloud = true;
                
                // 🌟 LƯỚI ĐIỆN BẢO VỆ CHỐNG XUYÊN THẤU VÀ DỌN RÁC (ĐÃ BỌC THÉP KHAI BÁO)
                if (!window.danhSachBauTroi) window.danhSachBauTroi = [];
                window.danhSachBauTroi.push(child);

                if (!mapData.mayMeshes) mapData.mayMeshes = [];
                mapData.mayMeshes.push(child);

                // 🛑 QUAN TRỌNG: BỎ QUA KHÔNG ĐÚC VẬT LÝ MẶT ĐẤT CHO BẦU TRỜI (CHỐNG LẶP 5 PHÚT)
                continue; 
            }
            // ==========================================

            let toaDoThucTe = new THREE.Vector3();
            child.getWorldPosition(toaDoThucTe);
            let doCaoCuaMesh = toaDoThucTe.distanceTo(tamHanhTinh) - rHanhTinh;
            let laDatSatMatGround = doCaoCuaMesh < 15.0;



            // --- A. BẺ CONG LÚN ĐẤT (TỐI ƯU MOBILE: CHỐNG CHẾT LÂM SÀNG CPU) ---
            if (window.KIEU_TRONG_LUC !== 'PHANG' && laMatDatKhongLo && laDatSatMatGround && child.geometry && child.geometry.attributes && child.geometry.attributes.position) {

                let posAttr = child.geometry.attributes.position;
                let v_local = new THREE.Vector3(); let v_world = new THREE.Vector3(); let v_root = new THREE.Vector3();
                let meshInverseMat = new THREE.Matrix4().copy(child.matrixWorld).invert();

                let DO_LUN = 0.0; 
                // 🌟 TỐI ƯU: Băm siêu nhỏ khối lượng việc. PC quất 15000 đỉnh/lần, Mobile chỉ dám quất 3000 đỉnh/lần.
                let BATCH_SIZE = window.isMobile ? 3000 : 15000; 
                
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
                    // 🌟 TỐI ƯU: Cho trình duyệt Mobile nghỉ 20ms để hệ điều hành dọn rác RAM, chống Crash. PC cho nghỉ 5ms.
                    await new Promise(resolve => setTimeout(resolve, window.isMobile ? 20 : 5));
                }
                posAttr.needsUpdate = true;
                
                // Hàm tính toán Normal này cực tốn RAM, trên mobile nếu làm lag quá có thể bỏ qua, 
                // nhưng tạm thời ta giữ lại và cho nghỉ nhịp trước khi chạy nó.
                await new Promise(resolve => setTimeout(resolve, window.isMobile ? 30 : 5));
                child.geometry.computeVertexNormals();
            }

            

            // --- B. TÚT LẠI MÀU SẮC (MATERIAL) ---
            if (child.material) {
                let tenMesh2 = (child.name || "").toLowerCase();
                let laMatNuoc = tenMesh2.includes('water') || tenMesh2.includes('nuoc') || tenMesh2.includes('bien') || tenMesh2.includes('ocean');

                let mats = Array.isArray(child.material) ? child.material : [child.material];
                
                if (laMatNuoc) {
                    let newMats = mats.map(mat => {
                        if (!mat) return new THREE.MeshBasicMaterial({ color: 0x1e90ff });
                        let basicMat = new THREE.MeshBasicMaterial({
                            map: mat.map || null,
                            color: mat.color || 0x1e90ff, 
                            transparent: true,
                            opacity: 0.8,
                            side: THREE.DoubleSide
                        });

                        if (basicMat.map) {
                            basicMat.map.wrapS = THREE.RepeatWrapping; 
                            basicMat.map.wrapT = THREE.RepeatWrapping;
                            basicMat.map.repeat.set(15, 15); 
                            if (!window.danhSachMatNuoc) window.danhSachMatNuoc = [];
                            window.danhSachMatNuoc.push(basicMat.map);
                        }
                        return basicMat;
                    });
                    child.material = newMats.length === 1 ? newMats[0] : newMats;
                } 
                else {
                    let newMats = mats.map(mat => {
                        if (!mat) return null;

                        // 🌟 TỐI ƯU iOS VRAM: Ép hạ cấp từ PBR (Standard) xuống Lambert để giảm 60% gánh nặng bộ nhớ Shader của iPhone
                        let targetMat = mat;
                        if (window.isMobile && mat.isMeshStandardMaterial) {
                            targetMat = new THREE.MeshLambertMaterial({
                                map: mat.map,
                                color: mat.color,
                                transparent: mat.transparent,
                                opacity: mat.opacity,
                                alphaTest: mat.alphaTest,
                                side: THREE.DoubleSide
                            });
                        } else {
                            targetMat.side = THREE.DoubleSide;
                        }

                        if (targetMat.emissive) targetMat.emissive.setHex(0x000000);
                        if (targetMat.color) {
                            let doSang = (targetMat.color.r + targetMat.color.g + targetMat.color.b) / 3;
                            if (doSang > 0.8) { targetMat.color.r *= 0.25; targetMat.color.g *= 0.25; targetMat.color.b *= 0.25; }
                            else if (doSang > 0.5) { targetMat.color.r *= 0.8; targetMat.color.g *= 0.8; targetMat.color.b *= 0.8; }
                            else { targetMat.color.r *= 0.95; targetMat.color.g *= 0.95; targetMat.color.b *= 0.95; }
                        }

                        // Giữ lại tối ưu Texture của Sếp
                        if (targetMat.map && window.renderer) {
                            targetMat.map.anisotropy = window.isMobile ? 1 : window.renderer.capabilities.getMaxAnisotropy();
                            targetMat.map.generateMipmaps = !window.isMobile;
                            targetMat.map.minFilter = window.isMobile ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
                        }

                        targetMat.needsUpdate = true;
                        return targetMat;
                    });
                    child.material = newMats.length === 1 ? newMats[0] : newMats;
                }
            }

            if (child.geometry) {
                child.geometry.computeBoundingBox();
                child.geometry.computeBoundingSphere();
            }
            child.updateMatrixWorld(true);

            // --- C. ĐÚC KHUÔN VẬT LÝ BVH (ỦY QUYỀN CHO NHÂN CPU ẢO) ---
            if (child.geometry && child.geometry.attributes && child.geometry.attributes.position) {
                if (window.myBvhWorker) {
                    let timeStart = performance.now();
                    let positions = child.geometry.attributes.position.array;
                    let indices = child.geometry.index ? child.geometry.index.array : null;
                    let jobId = window.jobIdCounter++;
                    
                    let p = new Promise((resolve, reject) => {
                        window.bvhJobs[jobId] = { resolve, reject };
                    });
                    
                    window.myBvhWorker.postMessage({ 
                        id: jobId, 
                        positions: positions, 
                        indices: indices 
                    });
                    
                    let serializedBVH = await p;
                    child.geometry.boundsTree = MeshBVHLib.MeshBVH.deserialize(serializedBVH, child.geometry);
                    let timeEnd = performance.now();
                    // 🌟 TRẢ LẠI DÒNG BÁO CÁO 
                    console.log(`👷 WORKER BVH: Đúc ngầm vật lý cho [${child.name || "Mesh Vô Danh"}] mất ${(timeEnd - timeStart).toFixed(2)} ms!`);
                } else if (typeof child.geometry.computeBoundsTree === 'function') {
                    child.geometry.computeBoundsTree();
                }
            }

            if (!window.danhSachMap) window.danhSachMap = [];
            window.danhSachMap.push(child);




            
            if (!mapData.matDatMeshes) mapData.matDatMeshes = [];
            mapData.matDatMeshes.push(child);

            // 🌟 CHỐNG SỐC GPU iPHONE: Cấm ép Mobile biên dịch Shader của cả Map trong 1 Frame!
            // Đây chính là nguyên nhân làm iPhone bị nghẹn, ép tải lại trang 2 lần rồi sập. Chỉ cho PC làm việc này.
            if (window.renderer && typeof scene !== 'undefined' && !window.isMobile) {
                window.renderer.compile(child, camera, scene);
            }

            await new Promise(resolve => {




                requestAnimationFrame(() => {
                    let thoiGianHienTai = performance.now();
                    let thoiGian1Frame = thoiGianHienTai - thoiGianĐoFPS;
                    thoiGianĐoFPS = thoiGianHienTai; 
                    
                    let fpsThucTe = 1000 / (thoiGian1Frame || 16);
                    if (fpsThucTe < 55) { setTimeout(resolve, 500); } else { resolve(); }
                });
            });

        } // <--- KẾT THÚC VÒNG LẶP FOR








        



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
        
        // 🌟 TỐI ƯU MOBILE RAM: Xóa sạch bộ nhớ đệm Cache thô của GLTF ngay khi map xuất xưởng
        if (window.isMobile) {
            THREE.Cache.clear();
        }

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






        // 🌟 BỘ LỌC BÁN KÍNH TỐI ƯU CHO MOBILE (Chống văng Game OOM)
        let rLoad = window.isMobile ? 3000 : 10000;
        let rBoss = window.isMobile ? 1500 : 5000;
        let rUnload = window.isMobile ? 4500 : 12000; // Cách 1500m so với rLoad để chống giật lag do Load/Unload liên tục

        // ==========================================
        // 🟢 TẦNG 1: LOAD ĐẤT ĐAI
        // ==========================================
        if (khoangCach < rLoad && !mapData.isLoaded && !mapData.isLoading) {
            window.xuLyLoadMapChunk(mapData);
        }

        // ==========================================
        // 🟢 TẦNG 2: LOAD SINH THÁI & BOSS
        // ==========================================
        if (khoangCach < rBoss && mapData.isLoaded && !mapData.daLoadBoss) {
            if (typeof window.taiBossTheoMap === 'function') {
                window.taiBossTheoMap(mapData.id);
                mapData.daLoadBoss = true;
            }
        }

        // ==========================================
        // 🔴 TẦNG 3: LÒ ĐỐT RÁC VRAM 
        // ==========================================
        if (khoangCach > rUnload && mapData.isLoaded) {
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

        // 🌟 BẢN VÁ AAA: CHỜ ĐÚC XONG MAP 100% MỚI CHO MỞ MẮT
        let thoiGianCho = 0;
        let vongLapChoMap = setInterval(() => {
            thoiGianCho += 500;
            
            // 1. ÉP BẮT ĐẦU ĐÚC MAP LẬP TỨC (Bỏ qua chu kỳ 2s lề mề của Radar)
            if (window.daNhanDanhSachMap && typeof playerModel !== 'undefined') {
                window.THONG_TIN_CAC_MAP.forEach(mapData => {
                    let mPos = new THREE.Vector3(parseFloat(mapData.pos_x), parseFloat(mapData.pos_y), parseFloat(mapData.pos_z));
                    if (playerModel.position.distanceTo(mPos) < 10000 && !mapData.isLoaded && !mapData.isLoading) {
                        window.xuLyLoadMapChunk(mapData);
                    }
                });
            }

            let coMapDangLoad = window.THONG_TIN_CAC_MAP && window.THONG_TIN_CAC_MAP.some(m => m.isLoading);
            let coMapDaLoad = window.THONG_TIN_CAC_MAP && window.THONG_TIN_CAC_MAP.some(m => m.isLoaded);






            
            // 2. ĐIỀU KIỆN MỞ MẮT THÔNG MINH:
            // - Đã kéo xong Data + Đã đúc xong ít nhất 1 Map + Không còn Map nào dang dở.
            // - HOẶC Bí Cảnh rỗng hoàn toàn (Chưa có Map nào).
            // - HOẶC quá 10 giây bị kẹt mạng (Fallback an toàn).
            if ((window.daNhanDanhSachMap && !coMapDangLoad && coMapDaLoad) || 
                (window.daNhanDanhSachMap && window.THONG_TIN_CAC_MAP.length === 0) || 
                thoiGianCho >= 30000) {
                
                clearInterval(vongLapChoMap);
                if (manHinhDichChuyen) manHinhDichChuyen.style.display = 'none'; // Thu hồi lỗ giun
                window.dangDichChuyen = false; // Mở khóa di chuyển
                console.log("👁️ ĐÃ MỞ MẮT: Toàn bộ Map khu vực đã đúc xong, sãn sàng chiến đấu!");
            }
        }, 500);

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

// =========================================================================
// 🛠️ HỆ THỐNG ĐỘ VŨ KHÍ TOÀN CẦU (DÀNH RIÊNG CHO ADMIN - BẤM F9)
// =========================================================================
(function khoiTaoToolVuKhiAdmin() {
    // 1. Tạo giao diện Bảng Điều Khiển (Ẩn mặc định)
    let panel = document.createElement('div');
    panel.id = 'admin-weapon-tool';
    panel.style.cssText = 'position:fixed; top:60px; right:20px; background:rgba(0, 15, 30, 0.9); color:#00ffcc; padding:15px; z-index:999999; border:2px solid #00ffcc; border-radius:8px; text-align:left; font-family:monospace; display:none; box-shadow: 0 0 15px #00ffcc; min-width: 300px;';

    panel.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#fff; text-shadow: 0 0 5px #00ffcc; text-align:center;">🔧 GM WEAPON TUNER</h3>
        
        <div style="margin-bottom:15px;">
            <b>🎯 Chọn Vũ Khí Đang Cầm:</b><br>
            <select id="awt-target" style="width:100%; padding:5px; background:#111; color:#0f0; border:1px solid #0f0; margin-top:5px;">
                <option value="vuKhiModel">Kiếm / Găng (Cơ bản)</option>
                <option value="vuKhiWrapper">Súng (Xạ Thủ)</option>
                <option value="cungTrenTay">Cung (Cung Thủ)</option>
                <option value="vuKhiPhapSu">Vòng Phép Tay (Pháp Sư)</option>
                <option value="truongHoThe">Trượng Sau Lưng (Pháp Sư)</option>
                <option value="kiemHoThe">Phi Kiếm Hộ Thể (Tu Tiên)</option>
            </select>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <b>📍 VỊ TRÍ (Position):</b>
            <div>
                X: <button onclick="awtEdit('pos','x',1)">+</button> <button onclick="awtEdit('pos','x',-1)">-</button>
                Y: <button onclick="awtEdit('pos','y',1)">+</button> <button onclick="awtEdit('pos','y',-1)">-</button>
                Z: <button onclick="awtEdit('pos','z',1)">+</button> <button onclick="awtEdit('pos','z',-1)">-</button>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <b>🔄 GÓC XOAY (Rotation):</b>
            <div>
                X: <button onclick="awtEdit('rot','x',1)">+</button> <button onclick="awtEdit('rot','x',-1)">-</button>
                Y: <button onclick="awtEdit('rot','y',1)">+</button> <button onclick="awtEdit('rot','y',-1)">-</button>
                Z: <button onclick="awtEdit('rot','z',1)">+</button> <button onclick="awtEdit('rot','z',-1)">-</button>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <b>📏 KÍCH CỠ (Scale):</b>
            <div>
                ALL: <button onclick="awtEdit('scale','all',1)">To Lên (+)</button> <button onclick="awtEdit('scale','all',-1)">Nhỏ Đi (-)</button>
            </div>
        </div>

        <div style="background:#000; padding:10px; border:1px solid #555; color:#ffcc00; font-weight:bold; white-space: pre-wrap;" id="awt-output">
// Tọa độ chuẩn sẽ hiện ở đây để Sếp Copy!
        </div>
    `;
    document.body.appendChild(panel);

    // 2. Logic Xử Lý Nút Bấm
    window.awtEdit = function (type, axis, dir) {
        let targetName = document.getElementById('awt-target').value;
        let target = window[targetName];

        if (!target) {
            document.getElementById('awt-output').innerText = `❌ LỖI: Không tìm thấy [${targetName}]!\nHãy chắc chắn bạn đang dùng đúng Hệ Phái.`;
            return;
        }

        let posStep = 0.05;        // Nhích 5cm mỗi lần bấm
        let rotStep = Math.PI / 32; // Xoay khoảng 5.6 độ mỗi lần bấm
        let scaleStep = 0.05;      // To nhỏ 5%

        if (type === 'pos') target.position[axis] += posStep * dir;
        if (type === 'rot') target.rotation[axis] += rotStep * dir;
        if (type === 'scale') {
            target.scale.x += scaleStep * dir;
            target.scale.y += scaleStep * dir;
            target.scale.z += scaleStep * dir;
        }

        target.updateMatrixWorld(true);

        // Hiển thị code cho Sếp copy
        let px = target.position.x.toFixed(3), py = target.position.y.toFixed(3), pz = target.position.z.toFixed(3);
        let rx = target.rotation.x.toFixed(3), ry = target.rotation.y.toFixed(3), rz = target.rotation.z.toFixed(3);
        let s = target.scale.x.toFixed(3);

        document.getElementById('awt-output').innerText =
            `${targetName}.scale.set(${s}, ${s}, ${s});\n` +
            `${targetName}.position.set(${px}, ${py}, ${pz});\n` +
            `${targetName}.rotation.set(${rx}, ${ry}, ${rz});`;
    };

    // 3. Phím Tắt ẨN / HIỆN Tool (Bấm F9)
    let isVisible = false;
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F9') {
            // LÁ CHẮN: CHỈ ADMIN MỚI MỞ ĐƯỢC
            let role = (window.ROLE || "").toLowerCase();
            let name = (window.ADMIN_NAME || window.myUsername || "").toLowerCase();
            if (role !== "admin" && name !== "admin") return;

            isVisible = !isVisible;
            panel.style.display = isVisible ? 'block' : 'none';
            if (isVisible) console.log("🔧 Đã bật GM Weapon Tuner!");
        }
    });
})();

// =========================================================================
// 🎬 HỆ THỐNG SOI ANIMATION TỪNG MILIGIÂY (DÀNH CHO ADMIN - BẤM F10)
// =========================================================================
(function khoiTaoToolAnimationAdmin() {
    let panel = document.createElement('div');
    panel.id = 'admin-anim-tool';
    panel.style.cssText = 'position:fixed; top:60px; right:20px; background:rgba(30, 0, 15, 0.95); color:#ffaa00; padding:20px; z-index:999999; border:2px solid #ffaa00; border-radius:8px; text-align:left; font-family:monospace; display:none; box-shadow: 0 0 20px #ffaa00; width: 600px;';
    
    panel.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#fff; text-shadow: 0 0 5px #ffaa00; text-align:center;">🎬 GM ANIMATION INSPECTOR</h3>
        
        <div style="margin-bottom:15px;">
            <b>📂 Chọn Animation:</b><br>
            <select id="aat-select" style="width:100%; padding:8px; background:#111; color:#ffaa00; border:1px solid #ffaa00; margin-top:5px; font-size:16px;"></select>
        </div>

        <div style="margin-bottom:15px;">
            <b>⏱️ Timeline (Kéo để xem):</b><br>
            <input type="range" id="aat-slider" min="0" max="1" step="0.001" value="0" style="width:100%; margin-top:10px; cursor:pointer;">
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:15px; gap:10px;">
            <div style="flex:1; background:#222; padding:10px; border:1px solid #0f0; border-radius:5px;">
                <b style="color:#0f0;">🟢 MỐC A (Bắt đầu):</b><br>
                <input type="number" id="aat-mark-a" step="0.001" value="0" style="width:100%; padding:5px; background:#000; color:#0f0; border:1px solid #555; margin-top:5px; font-size:16px;">
                <button id="btn-set-a" style="width:100%; padding:5px; margin-top:5px; cursor:pointer; background:#0f0; color:#000; font-weight:bold; border:none;">Lấy Giây Hiện Tại</button>
            </div>
            <div style="flex:1; background:#222; padding:10px; border:1px solid #f00; border-radius:5px;">
                <b style="color:#f00;">🔴 MỐC B (Kết thúc):</b><br>
                <input type="number" id="aat-mark-b" step="0.001" value="0" style="width:100%; padding:5px; background:#000; color:#f00; border:1px solid #555; margin-top:5px; font-size:16px;">
                <button id="btn-set-b" style="width:100%; padding:5px; margin-top:5px; cursor:pointer; background:#f00; color:#000; font-weight:bold; border:none;">Lấy Giây Hiện Tại</button>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <button id="aat-prev-frame" style="padding:8px 15px; font-weight:bold; cursor:pointer; background:#333; color:#fff; border:1px solid #ffaa00;">⏪ -0.05s</button>
            <button id="aat-play-pause" style="padding:8px 25px; font-weight:bold; cursor:pointer; background:#ffaa00; border:none; color:#000; font-size:16px;">⏯️ PLAY / PAUSE</button>
            <button id="aat-next-frame" style="padding:8px 15px; font-weight:bold; cursor:pointer; background:#333; color:#fff; border:1px solid #ffaa00;">+0.05s ⏩</button>
        </div>

        <div style="background:#000; padding:15px; border:1px solid #555; color:#00ffcc; font-weight:bold; font-size: 18px; text-align:center;" id="aat-output">
            Thời gian: 0.000s / 0.000s
        </div>
        <div style="font-size:12px; color:#888; margin-top:10px; text-align:center;">Lưu ý: Bấm F10 để thoát và mở lại di chuyển.</div>
    `;
    document.body.appendChild(panel);

    let isVisible = false;
    let isPlaying = false;

    const selectEl = document.getElementById('aat-select');
    const sliderEl = document.getElementById('aat-slider');
    const outputEl = document.getElementById('aat-output');
    const playBtn = document.getElementById('aat-play-pause');
    const inputA = document.getElementById('aat-mark-a');
    const inputB = document.getElementById('aat-mark-b');

    function getMap() {
        if (window.MOUNT_URL && window.MOUNT_URL.trim() !== "" && window.animationsMapChar) return window.animationsMapChar;
        return typeof animationsMap !== 'undefined' ? animationsMap : {};
    }

    function getAction() {
        if (window.MOUNT_URL && window.MOUNT_URL.trim() !== "" && window.currentActionChar) return window.currentActionChar;
        return typeof currentAction !== 'undefined' ? currentAction : null;
    }

    function setAction(action) {
        if (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") {
            if (window.currentActionChar) window.currentActionChar.fadeOut(0.1);
            window.currentActionChar = action;
        } else {
            if (typeof currentAction !== 'undefined' && currentAction) currentAction.fadeOut(0.1);
            currentAction = action; 
        }
    }

    function loadDanhSachAnimation() {
        selectEl.innerHTML = '';
        let map = getMap();
        for (let tenAnim in map) {
            let opt = document.createElement('option');
            opt.value = tenAnim; opt.innerText = tenAnim;
            selectEl.appendChild(opt);
        }
    }

    function epKhungHinh(thoiGian) {
        let act = getAction();
        if (!act) return;
        act.paused = false; 
        act.time = thoiGian;
        
        let activeMixer = (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") ? window.mixerNhanVatPhu : mixer;
        if (activeMixer) activeMixer.update(0); 

        act.paused = !isPlaying; 
        let total = act.getClip().duration;
        outputEl.innerText = `[ ${thoiGian.toFixed(3)}s / ${total.toFixed(3)}s ]`;
    }

    // 🌟 1. NÚT CHỐT MỐC A VÀ B
    document.getElementById('btn-set-a').addEventListener('click', () => {
        let act = getAction();
        if (act) inputA.value = act.time.toFixed(3);
    });

    document.getElementById('btn-set-b').addEventListener('click', () => {
        let act = getAction();
        if (act) inputB.value = act.time.toFixed(3);
    });

    sliderEl.addEventListener('input', (e) => {
        isPlaying = false;
        let act = getAction();
        if (act) act.paused = true;
        epKhungHinh(parseFloat(e.target.value));
    });

    playBtn.addEventListener('click', () => {
        let act = getAction();
        if (!act) return;
        isPlaying = !isPlaying;
        act.paused = !isPlaying;
        act.timeScale = isPlaying ? 1 : 0;
    });

    document.getElementById('aat-prev-frame').addEventListener('click', () => {
        isPlaying = false;
        let act = getAction();
        if (act) {
            let t = Math.max(0, act.time - 0.05);
            sliderEl.value = t; epKhungHinh(t);
        }
    });

    document.getElementById('aat-next-frame').addEventListener('click', () => {
        isPlaying = false;
        let act = getAction();
        if (act) {
            let total = act.getClip().duration;
            let t = Math.min(total, act.time + 0.05);
            sliderEl.value = t; epKhungHinh(t);
        }
    });

    selectEl.addEventListener('change', (e) => {
        let tenAnim = e.target.value;
        let map = getMap();
        if (map && map[tenAnim]) {
            let newAction = map[tenAnim];
            setAction(newAction);
            newAction.reset().fadeIn(0.1).play();
            
            newAction.timeScale = 1;
            isPlaying = true; 
            newAction.paused = false;

            let total = newAction.getClip().duration;
            sliderEl.max = total;
            sliderEl.value = 0;
            
            // 🌟 Khi đổi Animation, Reset lại Mốc A là 0, Mốc B là Full giây
            inputA.value = 0;
            inputB.value = total.toFixed(3);
        }
    });

    // 🌟 2. VÒNG LẶP CHẶN ĐẦU ĐUÔI (A -> B)
    setInterval(() => {
        if (isVisible && isPlaying) {
            let act = getAction();
            if (act) {
                let moca = parseFloat(inputA.value) || 0;
                let mocb = parseFloat(inputB.value) || act.getClip().duration;

                // Nếu chạy lố vạch B, bế cổ quăng ngược về vạch A
                if (act.time >= mocb) {
                    act.time = moca;
                }
                
                // Tránh trường hợp user nhập mốc A sai lệch
                if (act.time < moca) {
                    act.time = moca;
                }

                sliderEl.value = act.time;
                let total = act.getClip().duration;
                outputEl.innerText = `[ ${act.time.toFixed(3)}s / ${total.toFixed(3)}s ]`;
            }
        }
    }, 30);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F10') {
            let role = (window.ROLE || "").toLowerCase();
            let name = (window.ADMIN_NAME || window.myUsername || "").toLowerCase();
            if (role !== "admin" && name !== "admin") return;

            isVisible = !isVisible;
            panel.style.display = isVisible ? 'block' : 'none';
            
            if(isVisible) {
                window.isTestingAnimation = true; 
                window.isMoving = false;
                window.isKeyboardMoving = false;
                
                loadDanhSachAnimation(); 
                
                if (selectEl.options.length > 0) {
                    selectEl.value = selectEl.options[0].value;
                    selectEl.dispatchEvent(new Event('change'));
                }
            } else {
                window.isTestingAnimation = false;
                let act = getAction();
                if (act) {
                    act.paused = false;
                    act.timeScale = 1;
                }
                if (typeof playIdle === 'function') playIdle(); 
            }
        }
    });
})();

// =========================================================================
// 👁️ MẮT THẦN X-QUANG V2: BẢN CHỐNG LAG QUÉT TRONG BÁN KÍNH 50M (BẤM END)
// =========================================================================
(function khoiTaoMatThan3Truc() {
    let isMatThanAxisOn = false;
    let matThanInterval = null;

    function quetVaGanTruc() {
        if (!window.scene || !window.playerModel) return;
        
        let pPos = window.playerModel.position;
        let tamQuet = 50; // 🌟 CHỈ QUÉT BÁN KÍNH 50 MÉT QUANH NGƯỜI (Sếp có thể tăng lên 100 nếu máy mạnh)

        window.scene.traverse((obj) => {
            // Bỏ qua Mây, Hạt, Lazer, Chữ nổi hoặc những thằng đã có trục rồi
            if (obj.userData.isMatThanAxis || obj.userData.isCloud || obj.isSprite || obj.isLine || obj.isPoints || obj.isAxesHelper) return;
            
            // Chỉ gắn vào Khối 3D hoặc Xương tay cầm vũ khí
            if (obj.isMesh || (obj.isBone && (obj.name.toUpperCase().includes('ROOT') || obj.name.toUpperCase().includes('HAND') || obj.name.toUpperCase().includes('WEAPON')))) {
                
                // 🌟 THUẬT TOÁN ĐO KHOẢNG CÁCH (LÁ CHẮN CHỐNG LAG TỐI THƯỢNG)
                let objPos = new THREE.Vector3();
                obj.getWorldPosition(objPos);
                
                // Nếu cục đá hay cái cây đó ở xa hơn 50 mét -> QUAY XE BỎ QUA NGAY!
                if (pPos.distanceTo(objPos) > tamQuet) return;

                // Tự động thu phóng trục
                let size = 1.5; 
                if (obj.geometry && obj.geometry.boundingSphere) {
                    size = Math.min(2.5, Math.max(0.5, obj.geometry.boundingSphere.radius * 0.5));
                } else if (obj.isBone) {
                    size = 1.0; 
                }

                // Gắn trục xuyên thấu
                let axes = new THREE.AxesHelper(size);
                axes.material.depthTest = false; 
                axes.material.depthWrite = false;
                axes.material.transparent = true;
                axes.material.opacity = 0.8;
                axes.renderOrder = 999999; 
                axes.frustumCulled = false;
                
                axes.userData.isMatThanAxis = true; 
                obj.add(axes);
            }
        });
    }

    function tatVaDonRacTruc() {
        let trucCanXoa = [];
        window.scene.traverse((obj) => {
            if (obj.userData.isMatThanAxis) trucCanXoa.push(obj);
        });
        
        // Trả lại RAM và VRAM
        trucCanXoa.forEach(truc => {
            if(truc.parent) truc.parent.remove(truc);
            if(truc.geometry) truc.geometry.dispose();
            if(truc.material) truc.material.dispose();
        });
    }

    // ⌨️ BẮT SỰ KIỆN PHÍM 'END'
    document.addEventListener('keydown', (e) => {
        if (e.key === 'End' || e.code === 'End') {
            let role = (window.ROLE || "").toLowerCase();
            let name = (window.ADMIN_NAME || window.myUsername || "").toLowerCase();
            if (role !== "admin" && name !== "admin") return;

            isMatThanAxisOn = !isMatThanAxisOn;
            
            if (isMatThanAxisOn) {
                quetVaGanTruc(); 
                matThanInterval = setInterval(quetVaGanTruc, 2000); // 2s quét lại một lần để bắt vật thể mới
                if(typeof window.hienThongBaoBoGoc === 'function') window.hienThongBaoBoGoc("👁️ MẮT THẦN: Đã bật X-Quang (Tầm nhìn 50m)!", "#00ffcc");
            } else {
                if (matThanInterval) clearInterval(matThanInterval);
                tatVaDonRacTruc(); 
                if(typeof window.hienThongBaoBoGoc === 'function') window.hienThongBaoBoGoc("👁️ MẮT THẦN: Đã tắt!", "#ff4d4d");
            }
        }
    });
})();

// ==================================================
// 🖋️ HÀM TẠO CHỮ NỔI GACHA (ĐỘC LẬP - MIỄN NHIỄM VỚI LỖI -NaN)
// ==================================================
window.taoChuNoiGacha = function (pos3D, text, color) {
    const div = document.createElement('div');
    div.innerText = text;
    // Style Chữ Cyberpunk rực rỡ, không có dấu trừ và không làm tròn số
    div.style.cssText = `position:absolute; color:${color}; font-weight:900; font-size:26px; text-shadow:0px 0px 10px ${color}, 2px 2px 0px #000; pointer-events:none; z-index:99999; text-transform:uppercase;`;
    document.body.appendChild(div);
    
    let life = 60; let offsetY = 0;
    let loop = setInterval(() => {
        life--; offsetY += 0.05;
        let p = pos3D.clone(); p.y += offsetY; p.project(window.camera);
        
        if (p.z < 1) {
            div.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`;
            div.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            div.style.opacity = life / 60;
        } else { 
            div.style.display = 'none'; 
        }
        
        if (life <= 0) { clearInterval(loop); div.remove(); }
    }, 30);
};

// ==================================================
// 💎 HIỆU ỨNG AUTO-LOOT LINH THẠCH & ĐỒ 3D THẬT (BẢN V15 - ĐỒNG BỘ ID CHỐNG HACK)
// ==================================================
window.taoHieuUngLootVang = function (viTriXac, bossId) {
    let fd = new FormData();
    fd.append('monster_id', bossId); // Gửi đúng ID qua chốt kiểm duyệt của PHP

    fetch('api/loot_monster.php', { method: 'POST', body: fd }).then(res => res.json())
    .then(data => {
        if(data.gold) {
            let tamXac = viTriXac.clone().add(new THREE.Vector3(0, 3, 0)); 
            
            // 1. ĐÚC CỤM TINH THỂ THẠCH ANH (Linh Thạch)
            let soLuongLinhThach = 5 + Math.floor(Math.random() * 4);
            let mangLinhThach = [];

            for(let i=0; i < soLuongLinhThach; i++) {
                let cumNgocGroup = new THREE.Group();
                let ngocMat = new THREE.MeshBasicMaterial({ 
                    color: 0x00ffcc, wireframe: false, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending 
                });

                for(let j=0; j<3; j++){
                    let ngocGeo = new THREE.IcosahedronGeometry(0.2 + (Math.random() * 0.3));
                    let vienNgoc = new THREE.Mesh(ngocGeo, ngocMat);
                    vienNgoc.position.set((Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5);
                    vienNgoc.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
                    cumNgocGroup.add(vienNgoc);
                }
                
                cumNgocGroup.position.copy(tamXac);
                let vecVang = new THREE.Vector3((Math.random() - 0.5) * 8, 4 + Math.random() * 4, (Math.random() - 0.5) * 8);
                window.scene.add(cumNgocGroup);
                mangLinhThach.push({ group: cumNgocGroup, vel: vecVang });
            }

            // 2. LOAD MÔ HÌNH 3D THẬT CỦA VẬT PHẨM (VŨ KHÍ / RỒNG)
            let itemHolder = null;
            if (data.item_name && data.item_model) {
                itemHolder = new THREE.Group();
                itemHolder.position.copy(tamXac).add(new THREE.Vector3(0, 2, 0)); // Nâng cao lên chút để dễ nhìn
                
                let colorGacha = data.item_type === 'mount' ? 0xff00ff : 0xf1c40f; 
                let halo = new THREE.Mesh(
                    new THREE.SphereGeometry(2.5, 16, 16), // Hào quang to ra
                    new THREE.MeshBasicMaterial({ color: colorGacha, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })
                );
                itemHolder.add(halo);

                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset(data.item_model, (model) => {
                        model.updateMatrixWorld(true);
                        const bbox = new THREE.Box3().setFromObject(model);
                        const size = bbox.getSize(new THREE.Vector3());
                        const center = bbox.getCenter(new THREE.Vector3());
                        const maxDim = Math.max(size.x, size.y, size.z) || 1;
                        
                        // 🌟 ÉP KÍCH THƯỚC CHUẨN CỐ ĐỊNH: Đồ vật to đùng 6 mét
                        let scale = 6.0 / maxDim; 
                        model.scale.setScalar(scale);
                        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
                        
                        let pivot = new THREE.Group();
                        pivot.add(model);
                        itemHolder.add(pivot);
                        itemHolder.pivot = pivot; 
                    });
                }
                window.scene.add(itemHolder);
            }

            let phase = 1; 
            let tick = 0;

            let loop = setInterval(() => {
                tick++;
                
                if (phase === 1) {
                    // 🚀 PHA 1: NỔ TUNG TÓE (Nằm đất 2 giây để ngắm Model 3D tải về)
                    mangLinhThach.forEach(lt => {
                        lt.group.position.add(lt.vel.clone().multiplyScalar(0.03));
                        if (lt.group.position.y > viTriXac.y + 0.5) {
                            lt.vel.y -= 0.3; 
                        } else {
                            lt.vel.y = 0; 
                            lt.vel.x *= 0.85; 
                            lt.vel.z *= 0.85; 
                            lt.group.rotation.y += 0.05;
                        }
                    });
                    
                    if (itemHolder) { 
                        itemHolder.position.y += Math.sin(tick * 0.1) * 0.02;
                        if (itemHolder.pivot) itemHolder.pivot.rotation.y += 0.05;
                    }
                    
                    if (tick > 60) { phase = 2; tick = 0; } 
                } 
                else if (phase === 2) {
                    // 🧲 PHA 2: HÚT VÀO NGƯỜI (1.2s)
                    let t = tick / 40; 
                    
                    if (t >= 1) {
                        clearInterval(loop);
                        mangLinhThach.forEach(lt => { if (typeof window.donRac3D === 'function') window.donRac3D(lt.group); });
                        if (itemHolder) {
                            if (typeof window.donRac3D === 'function') window.donRac3D(itemHolder);
                            else window.scene.remove(itemHolder);
                        }
                        
                        // 🌟 TẠI ĐÂY: GỌI HÀM HIỆN CHỮ GACHA!
                        if (window.playerModel && typeof window.taoChuNoiGacha === 'function') {
                            window.taoChuNoiGacha(window.playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), `+${data.gold} LINH THẠCH`, "#00ffcc");
                            if (data.item_name) {
                                setTimeout(() => {
                                    window.taoChuNoiGacha(window.playerModel.position.clone().add(new THREE.Vector3(0, 7, 0)), `🎁 ĐẠT ĐƯỢC: ${data.item_name}`, "gold");
                                }, 200);
                            }
                        }
                        return;
                    }
                    
                    if (window.playerModel) {
                        let diemHut = window.playerModel.position.clone().add(new THREE.Vector3(0, 2.5, 0));
                        
                        mangLinhThach.forEach(lt => { 
                            lt.group.position.lerp(diemHut, 0.15); 
                            lt.group.rotation.x += 0.2;
                            lt.group.scale.setScalar(1 - t);
                        });
                        
                        if (itemHolder) {
                            itemHolder.position.lerp(diemHut, 0.1); 
                            if (itemHolder.pivot) itemHolder.pivot.rotation.y += 0.3;
                            // 🌟 TEO NHỎ CHUẨN XÁC KHI BAY VÀO NGƯỜI
                            itemHolder.scale.setScalar(1 - t); 
                        }
                    }
                }
            }, 30);
        }
    }).catch(e => {});
};


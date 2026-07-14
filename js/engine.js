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
// ========================================================
// 🛡️ LÕI ĐỒ HỌA BỌC THÉP (CHỐNG CRASH KHI XOAY CAMERA TRÊN IOS)
// ========================================================
window.renderer = new THREE.WebGLRenderer({
    antialias: !window.isMobile,
    logarithmicDepthBuffer: !window.isMobile,
    powerPreference: "high-performance",
    precision: window.isMobile ? "mediump" : "highp" // 🌟 Ép giảm một nửa RAM màu sắc trên Mobile
});

// 🌟 PHỤC HỒI NHỮNG DÒNG QUAN TRỌNG ĐỂ GAME HIỂN THỊ TRỞ LẠI
window.renderer.setSize(window.innerWidth, window.innerHeight);
window.renderer.setPixelRatio(window.isMobile ? 1.0 : window.devicePixelRatio);

// 🌟 KHÓA BÓNG ĐỔ TRÊN MOBILE ĐỂ TRÁNH CRASH GPU
window.renderer.shadowMap.enabled = !window.isMobile;
if (!window.isMobile) {
    window.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

window.renderer.outputEncoding = THREE.sRGBEncoding;
window.renderer.toneMapping = THREE.LinearToneMapping;
window.renderer.toneMappingExposure = 1.0;
document.body.appendChild(window.renderer.domElement);

// 🌟 TẮT VĨNH VIỄN VÒM PHẢN QUANG TRÊN MOBILE (KẺ THÙ SỐ 1 GÂY CRASH KHI XOAY GÓC NHÌN)
if (!window.isMobile && typeof THREE.RoomEnvironment !== 'undefined') {
    const pmremGenerator = new THREE.PMREMGenerator(window.renderer);
    window.scene.environment = pmremGenerator.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();
}

window.scene.add(new THREE.AmbientLight(0xffffff, 0.3));

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
                let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0, 0, 0);
                let huongLenTroiMoi = playerModel.position.clone().sub(tam);
                if (huongLenTroiMoi.lengthSq() < 0.001) huongLenTroiMoi.set(0, 1, 0); else huongLenTroiMoi.normalize();



                playerModel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenTroiMoi);
                playerModel.up.copy(huongLenTroiMoi);
                window.mucTieuBanKinhDat = playerModel.position.distanceTo(tam);

                window.mauBanThan = window.MAU_TOI_DA || 1000;
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
window.gaySatThuongBossToPlayer = function (tamNo, luongSatThuong, banKinh) {
    if (window.isDead || !window.playerModel) return;

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
// ✨ BỘ LỌC HÀO QUANG VŨ KHÍ (VFX LỬA MỊN CHỐNG VÓN CỤC & GIỮ DÁNG KIẾM V4)
// ==========================================
window.danhSachBuiTienKhi = window.danhSachBuiTienKhi || [];
window.danhSachSetVuKhi = window.danhSachSetVuKhi || [];

// ==========================================
// ✨ BỘ LỌC HÀO QUANG VŨ KHÍ CHỐNG "BÓNG ĐÈ" VÀ CHỐNG TRÀN BỘ NHỚ (BẢN VÁ LỖI MAXIMUM CALL STACK)
// ==========================================
window.bocHaoQuang3D = function (meshVuKhi, capDo) {
    if (!meshVuKhi) return;

    // 1. XOÁ SẠCH HÀO QUANG VÀ HẠT CŨ TRƯỚC KHI BƠM MỚI
    let racCu = [];
    meshVuKhi.traverse(child => {
        if (child.userData && child.userData.isAura) racCu.push(child);
    });
    racCu.forEach(r => {
        if (r.parent) r.parent.remove(r);
        if (r.geometry) r.geometry.dispose();
        if (r.material) {
            if (Array.isArray(r.material)) r.material.forEach(m => m.dispose());
            else r.material.dispose();
        }
    });
    window.danhSachSetVuKhi = window.danhSachSetVuKhi.filter(s => s && s.parent && s.parent.parent === meshVuKhi);

    if (capDo < 1) return; // Không có cấp đập thì nghỉ

    // QUY HOẠCH MÀU SẮC CHUẨN RPG CỦA SẾP
    let mauAura = 0x2ecc71; // +1 đến +3: Lá
    if (capDo >= 4 && capDo <= 6) mauAura = 0x00e5ff;        // +4 đến +6: Lam
    else if (capDo >= 7 && capDo <= 9) mauAura = 0x9b59b6;   // +7 đến +9: Tím
    else if (capDo >= 10 && capDo <= 12) mauAura = 0xffaa00; // +10 đến +12: Vàng
    else if (capDo >= 13) mauAura = 0xff3300;                // +13 đến +15: Đỏ

    let mauLua = 0xff5500; 
    let tyLeManh = capDo / 15.0; 

    // 🔍 MÁY QUÉT RA-DAR: Kiểm tra xem cục mô hình này có chứa Xương/Xoay chuyển (SkinnedMesh) không?
    let laSinhVatCoXuong = false;
    meshVuKhi.traverse(c => {
        if (c.isSkinnedMesh) laSinhVatCoXuong = true;
    });

    // 🛑 LÁ CHẮN BẢO VỆ MÔ HÌNH: Tránh bị đệ quy vô hạn (Maximum call stack size exceeded)
    // Thay vì add trực tiếp trong vòng lặp traverse, ta sẽ gom các cục Mesh lại rồi mới add!
    let danhSachCacCucThit = [];

    if (!laSinhVatCoXuong) {
        meshVuKhi.traverse(child => {
            if (child.isMesh && !child.userData.isAura && child.visible) {
                danhSachCacCucThit.push(child);
            }
        });

        // Bắt đầu bọc hào quang an toàn
        danhSachCacCucThit.forEach(child => {
            let voAura = new THREE.Mesh(
                child.geometry.clone(),
                new THREE.MeshBasicMaterial({
                    color: mauAura,
                    transparent: true,
                    opacity: 0.05 + (tyLeManh * 0.2), 
                    blending: THREE.AdditiveBlending, 
                    depthWrite: false,
                    wireframe: false 
                })
            );
            voAura.userData.isAura = true;
            child.add(voAura);

            if (capDo >= 10) {
                let luoiSet = new THREE.Mesh(
                    child.geometry.clone(),
                    new THREE.MeshBasicMaterial({
                        color: mauAura,
                        transparent: true,
                        opacity: 0.1 + (tyLeManh * 0.4), 
                        blending: THREE.AdditiveBlending,
                        depthWrite: false,
                        wireframe: true 
                    })
                );
                luoiSet.userData.isAura = true;
                luoiSet.userData.mauGoc = mauAura; 
                luoiSet.userData.capDo = capDo; 
                child.add(luoiSet);
                window.danhSachSetVuKhi.push(luoiSet);
            }

            if (capDo >= 13) {
                let loiAura = new THREE.Mesh(
                    child.geometry.clone(),
                    new THREE.MeshBasicMaterial({
                        color: 0xffffff, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false
                    })
                );
                loiAura.userData.isAura = true; // 🌟 CHI TIẾT CỨU SỐNG SERVER NẰM Ở ĐÂY NÈ SẾP!
                child.add(loiAura);
            }
        });
    }

    // 🔥 2. BẢN VÁ TỐI THƯỢNG: GIỮ LẠI HIỆU ỨNG BỤI LỬA BỐC LÊN CHO MỌI THỨ
    if (capDo >= 7) {
        meshVuKhi.updateMatrixWorld(true);
        const globalBox = new THREE.Box3().setFromObject(meshVuKhi);
        
        const localMin = meshVuKhi.worldToLocal(globalBox.min.clone());
        const localMax = meshVuKhi.worldToLocal(globalBox.max.clone());
        
        let sizeX = Math.abs(localMax.x - localMin.x);
        let sizeY = Math.abs(localMax.y - localMin.y);
        let sizeZ = Math.abs(localMax.z - localMin.z);
        let maxDim = Math.max(sizeX, sizeY, sizeZ) || 1;

        const soHat = window.isMobile ? 25 : 65; 
        const geoBui = new THREE.BufferGeometry();
        const posBui = new Float32Array(soHat * 3);
        const colorsBui = new Float32Array(soHat * 3); 
        const velBui = [];

        let cAura = new THREE.Color(mauAura);
        let cLua = new THREE.Color(mauLua);

        for (let i = 0; i < soHat; i++) {
            posBui[i * 3] = localMin.x + Math.random() * sizeX;
            posBui[i * 3 + 1] = localMin.y + Math.random() * sizeY;
            posBui[i * 3 + 2] = localMin.z + Math.random() * sizeZ;

            velBui.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01
            ));

            let cChon = (Math.random() < (tyLeManh * 0.45)) ? cLua : cAura;
            colorsBui[i * 3] = cChon.r;
            colorsBui[i * 3 + 1] = cChon.g;
            colorsBui[i * 3 + 2] = cChon.b;
        }

        geoBui.setAttribute('position', new THREE.BufferAttribute(posBui, 3));
        geoBui.setAttribute('color', new THREE.BufferAttribute(colorsBui, 3)); 
        
        const texture = typeof window.layTextureLua === 'function' ? window.layTextureLua() : null;
        const matBui = new THREE.PointsMaterial({
            size: maxDim * (window.isMobile ? 0.035 : 0.025), 
            map: texture,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            vertexColors: true, 
            depthWrite: false
        });

        const heThongBui = new THREE.Points(geoBui, matBui);
        heThongBui.userData.isAura = true;
        meshVuKhi.add(heThongBui); 

        window.danhSachBuiTienKhi.push({
            pts: heThongBui, vels: velBui, localMin: localMin.clone(), localMax: localMax.clone(),
            sizeX: sizeX, sizeY: sizeY, sizeZ: sizeZ, maxDim: maxDim, seed: Math.random() * 100 
        });
    }
};

// ==========================================
// 🌪️ VÒNG LẶP RENDER SẤM SÉT VÀ LỬA GỢN SÓNG (BẢN AN TOÀN TUYỆT ĐỐI)
// ==========================================
if (!window.loopBuiTienKhi) {
    window.loopBuiTienKhi = true;
    setInterval(() => {
        let now = Date.now();

        // 1. LUỒNG SẤM SÉT CO GIẬT
        for (let i = window.danhSachSetVuKhi.length - 1; i >= 0; i--) {
            let setMesh = window.danhSachSetVuKhi[i];
            if (!setMesh || !setMesh.parent) { window.danhSachSetVuKhi.splice(i, 1); continue; }

            let capDo = setMesh.userData.capDo || 1;
            let tyLeManh = capDo / 15.0;

            let bienDoGiat = tyLeManh * 0.04;
            setMesh.scale.set(
                1.0 + (Math.random() - 0.5) * bienDoGiat,
                1.0 + (Math.random() - 0.5) * bienDoGiat,
                1.0 + (Math.random() - 0.5) * bienDoGiat
            );

            let coHoiChop = 0.1 + (tyLeManh * 0.7);
            setMesh.material.opacity = Math.random() < coHoiChop ? (0.1 + Math.random() * 0.4) : 0.03;

            if (capDo >= 10 && Math.random() < (tyLeManh * 0.15)) {
                setMesh.material.color.setHex(0xffffff);
            } else {
                setMesh.material.color.setHex(setMesh.userData.mauGoc);
            }
        }

        // 2. LÀN KHÓI LỬA BỐC THẲNG LÊN TRỜI CHUẨN ĐA TÂM PIVOT
        let worldUp = new THREE.Vector3(0, 1, 0);
        if (window.playerModel && window.playerModel.up) worldUp.copy(window.playerModel.up).normalize();

        for (let i = window.danhSachBuiTienKhi.length - 1; i >= 0; i--) {
            let bui = window.danhSachBuiTienKhi[i];

            let connectedToScene = false;
            let checkObj = bui.pts;
            while (checkObj && checkObj.parent) {
                if (checkObj.parent === window.scene || checkObj.parent.isScene) { connectedToScene = true; break; }
                checkObj = checkObj.parent;
            }

            if (!connectedToScene || !bui.pts.geometry || !bui.pts.geometry.attributes.position) {
                window.danhSachBuiTienKhi.splice(i, 1);
                continue;
            }

            let positions = bui.pts.geometry.attributes.position.array;
            let min = bui.localMin;
            let max = bui.localMax;

            let qWorld = new THREE.Quaternion();
            bui.pts.getWorldQuaternion(qWorld);
            let localUp = worldUp.clone().applyQuaternion(qWorld.invert()).normalize();

            let localSide = new THREE.Vector3(1, 0, 0).cross(localUp).normalize();
            if (localSide.lengthSq() < 0.001) localSide.set(0, 0, 1).cross(localUp).normalize();

            let speedRise = bui.maxDim * 0.006;

            for (let j = 0; j < positions.length / 3; j++) {
                let wave = Math.sin(now * 0.008 + j * 0.4) * bui.maxDim * 0.01;

                positions[j * 3] += localUp.x * speedRise + localSide.x * wave + bui.vels[j].x * 0.1;
                positions[j * 3 + 1] += localUp.y * speedRise + localSide.y * wave + bui.vels[j].y * 0.1;
                positions[j * 3 + 2] += localUp.z * speedRise + localSide.z * wave + bui.vels[j].z * 0.1;

                // Khóa lồng: Vượt biên hộp giới hạn thực tế là hồi sinh lại dưới móng kiếm
                if (positions[j * 3] < min.x - 0.4 || positions[j * 3] > max.x + 0.4 ||
                    positions[j * 3 + 1] < min.y - 0.4 || positions[j * 3 + 1] > max.max.y + 0.4 ||
                    positions[j * 3 + 2] < min.z - 0.4 || positions[j * 3 + 2] > max.max.z + 0.4) {

                    positions[j * 3] = min.x + Math.random() * bui.sizeX;
                    positions[j * 3 + 1] = min.y + Math.random() * bui.sizeY;
                    positions[j * 3 + 2] = min.z + Math.random() * bui.sizeZ;
                }
            }
            bui.pts.geometry.attributes.position.needsUpdate = true;
            bui.pts.material.opacity = 0.3 + Math.abs(Math.sin(now * 0.005 + bui.seed)) * 0.6;
        }
    }, 33);
}

// =================================================================
// 🛡️ LÁ CHẮN CHỐNG NGỦ ĐÔNG (HACK TẬN GỐC TRÌNH DUYỆT)
// =================================================================
(function khoiTaoChongNguDong() {
    if (typeof window.renderer !== 'undefined' && window.renderer) {
        const renderGoc = window.renderer.render.bind(window.renderer);
        window.renderer.render = function (scene, camera) { if (!document.hidden) renderGoc(scene, camera); };
    }
    const rAF_goc = window.requestAnimationFrame;
    window.requestAnimationFrame = function (callback) {
        if (document.hidden) return 0;
        return rAF_goc.call(window, callback);
    };
    let codeWorker = `setInterval(() => { postMessage('TICK'); }, 16);`;
    let blob = new Blob([codeWorker], { type: 'application/javascript' });
    let worker = new Worker(URL.createObjectURL(blob));
    worker.onmessage = function () { if (document.hidden && typeof animate === 'function') { animate(); } };
    document.addEventListener("visibilitychange", () => { if (!document.hidden && typeof animate === 'function') { animate(); } });
    console.log("🛡️ Hệ thống chống ngủ đông & Treo máy ẩn Tab đã kích hoạt!");
})();

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.45);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const denCamera = new THREE.DirectionalLight(0xffffff, 1.2);
denCamera.position.set(0, 5, 15);
camera.add(denCamera);
if (!scene.children.includes(camera)) scene.add(camera);

window.bocHDRI_NhanVat = function (model) {
    // Đã khóa - Không bơm thêm HDRI gây chói
    return;
};

// ==========================================
// 🛠️ BẢN VÁ AAA: TÔN TRỌNG CHẤT LIỆU GỐC (GIỮ NGUYÊN ĐỘ BÓNG KIM LOẠI PBR)
// ==========================================
window.fixHieuUngDenThui = function (model) {
    if (!model) return;

    model.traverse(function (child) {
        if (child.isMesh && child.material) {
            let mats = Array.isArray(child.material) ? child.material : [child.material];

            mats.forEach(mat => {
                // 1. KÌM HÃM HÀO QUANG (Chỉ bóp bớt các model tự phát sáng chói lóa mắt)
                if (mat.emissive) {
                    let doSangEmissive = (mat.emissive.r * 0.299 + mat.emissive.g * 0.587 + mat.emissive.b * 0.114);
                    if (doSangEmissive > 0) {
                        mat.emissiveIntensity = Math.min(mat.emissiveIntensity || 1, 0.5);
                    }
                }

                // 2. 🌟 GIẢI PHÓNG PHONG ẤN CHO VẬT LIỆU PBR (METALNESS/ROUGHNESS)
                if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                    // XÓA BỎ LỆNH ÉP METALNESS VÀ ROUGHNESS Ở ĐÂY!
                    // Trả lại toàn quyền quyết định cho file 3D gốc của Artist.

                    // Kích hoạt cường độ phản chiếu môi trường (HDRI) mạnh mẽ để áo giáp bóng loáng như trong Shop
                    mat.envMapIntensity = 1.2;
                }

                mat.needsUpdate = true;
            });
        }
    });
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
// 🌟 Đã xóa bỏ các biến Cooldown toàn cục gây lỗi tịt ngòi cho các phái đánh xa
document.addEventListener('keydown', (e) => {
    let k = (e.code || "").replace('Key', '').toLowerCase();
    if (['w', 'a', 's', 'd', 'space', 'shift'].includes(k)) keys[k] = true;

    // 🌟 Lệnh xả Skill (Q, E, R, F) đã được chuyển giao 100% cho bộ não controller.js xử lý!
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
            let targetMat = new THREE.Matrix4().lookAt(window.vongMucTieu.position, window.vongMucTieu.position.clone().add(upV), new THREE.Vector3(0, 0, 1));
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
    controls.maxDistance = 2000; // Cho phép lăn chuột ra xa tít mù tắp để nhìn cả bản đồ
    controls.minDistance = 3;    // Không cho zoom quá gần để tránh chui vào trong bụng Titan
} else {
    // 👤 NGƯỜI THƯỜNG: Giữ nguyên như cũ
    controls.maxDistance = 30;   // Chỉ cho phép nhìn quanh quẩn nhân vật
    controls.minDistance = 3;     // Có thể nhìn sát mặt nhân vật
}

camera.position.set(TOA_DO_SPAWN.x, TOA_DO_SPAWN.y + 1, TOA_DO_SPAWN.z + 85);
controls.target.set(TOA_DO_SPAWN.x, TOA_DO_SPAWN.y + 2, TOA_DO_SPAWN.z);
controls.update();





const loader = new THREE.GLTFLoader();

// Cỗ máy nén Xương & Đỉnh (Draco)
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/');
loader.setDRACOLoader(dracoLoader);

// ========================================================
// ⚔️ MÁY CHÉM VRAM TOÀN CẦU (BẢO VỆ IOS SAFARI TUYỆT ĐỐI)
// ========================================================
const originalGLTFLoad = THREE.GLTFLoader.prototype.load;
THREE.GLTFLoader.prototype.load = function (url, onLoad, onProgress, onError) {
    originalGLTFLoad.call(this, url, function (gltf) {
        // 🎯 ĐÁNH CHẶN: Chỉ kích hoạt cỗ máy chém khi chơi trên Điện thoại
        if (window.isMobile && gltf.scene) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh && child.material) {
                    let mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(mat => {
                        if (!mat) return;

                        // 1. 🗑️ CHÉM BỎ 75% DUNG LƯỢNG RÁC: 
                        // Mobile không cần nhìn độ lồi lõm (Normal), độ nhám (Roughness), kim loại (Metalness)
                        let cacMapVoDung = ['normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'bumpMap', 'displacementMap'];
                        cacMapVoDung.forEach(mapType => {
                            if (mat[mapType]) {
                                mat[mapType].dispose(); // Vứt thẳng vào sọt rác GPU
                                mat[mapType] = null;
                            }
                        });

                        // 2. ⚡ ÉP TẮT MIPMAP TỐI ĐA (Tiết kiệm thêm 33% VRAM cho hình ảnh chính)
                        if (mat.map) {
                            mat.map.generateMipmaps = false;
                            mat.map.minFilter = THREE.LinearFilter;
                            mat.map.anisotropy = 1;
                            mat.map.needsUpdate = true;
                        }
                        if (mat.emissiveMap) {
                            mat.emissiveMap.generateMipmaps = false;
                            mat.emissiveMap.minFilter = THREE.LinearFilter;
                            mat.emissiveMap.anisotropy = 1;
                            mat.emissiveMap.needsUpdate = true;
                        }

                        // 3. ❄️ LÀM MÁT CHIP ĐỒ HỌA (Tắt tính toán ánh sáng PBR)
                        if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                            mat.roughness = 1.0;
                            mat.metalness = 0.0;
                            mat.envMapIntensity = 0.0;
                        }
                    });
                }
            });
        }
        // Trả Hàng (đã được vặt sạch rác) cho Game load tiếp
        if (onLoad) onLoad(gltf);
    }, onProgress, onError);
};

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
    window.myBvhWorker.onmessage = function (e) {
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
    window.mayHanhTinhGoc = []; // 🌟 BẢN VÁ: Lưu lại Mây gốc để dọn rác

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
                if (!window.danhSachBauTroi) window.danhSachBauTroi = [];
                window.danhSachBauTroi.push(child);
                window.mayHanhTinhGoc.push(child);

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

        if (window.ZONE_ID !== 'TRUNG_CHAU') {
            window.HANH_TINH_GOC.visible = false;
            if (window.danhSachMap && window.matDatHanhTinhGoc) {
                window.danhSachMap = window.danhSachMap.filter(m => !window.matDatHanhTinhGoc.includes(m));
            }
            // 🌟 RÚT ĐIỆN ĐÁM MÂY GỐC: Chống kẹt tàng hình khi sang Bí Cảnh
            if (window.danhSachBauTroi && window.mayHanhTinhGoc) {
                window.danhSachBauTroi = window.danhSachBauTroi.filter(m => !window.mayHanhTinhGoc.includes(m));
            }
        } else {
            window.HANH_TINH_GOC.visible = true;
            if (window.danhSachMap && window.matDatHanhTinhGoc) {
                window.matDatHanhTinhGoc.forEach(m => {
                    if (!window.danhSachMap.includes(m)) window.danhSachMap.push(m);
                });
            }
            // 🌟 NẠP LẠI ĐÁM MÂY GỐC KHI VỀ TRUNG CHÂU
            if (window.danhSachBauTroi && window.mayHanhTinhGoc) {
                window.mayHanhTinhGoc.forEach(m => {
                    if (!window.danhSachBauTroi.includes(m)) window.danhSachBauTroi.push(m);
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

window.taiHoacNhanBanAsset = function (url, callback) {
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
        loaderAsset.load(
            url,
            (gltf) => {
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
            },
            undefined, // Bỏ qua onProgress
            (error) => {
                // 🛡️ LÁ CHẮN TỐI CAO: Xử lý khi file bị xóa (404)
                console.error("❌ MẤT TÍCH FILE 3D: " + url + " | Đã kích hoạt vật thể tàng hình thay thế!");
                let fallbackGroup = new THREE.Group(); // Tạo cục không khí tàng hình
                window.tongKhoAsset3D[url] = { scene: fallbackGroup, animations: [] };
                resolve(window.tongKhoAsset3D[url]);
                callback(new THREE.Group(), []); // Bơm cục tàng hình vào cho Game chạy tiếp
            }
        );
    });
};

// =========================================================
// ⚙️ BẢN VÁ AAA: CHUẨN HÓA KÍCH THƯỚC (VÔ CỰC TỐI THƯỢNG)
// Quét bằng Box3 thuần túy - Cấm can thiệp tỷ lệ Node con
// =========================================================
window.chuanHoaKichThuoc = function (mesh, sizeMongMuon) {
    if (!mesh) return;

    // 1. CHỈ RESET NÚT GỐC (ROOT)
    // Tuyệt đối không được đụng vào scale của các xương hay mesh bên trong!
    mesh.scale.set(1, 1, 1);
    mesh.updateMatrixWorld(true);

    // 2. DÙNG MÁY QUÉT KHÔNG GIAN (BOX3) ĐỂ ĐO TOÀN BỘ KHỐI THỊT
    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Lấy chiều cao Y. Nếu quá lùn (Thú bò sát, vũ khí, cá bơi ngang), lấy cạnh dài nhất
    let chieuCaoThucTe = size.y;
    if (chieuCaoThucTe < 0.1) {
        chieuCaoThucTe = Math.max(size.x, size.y, size.z);
    }

    // Chống lỗi chia cho 0 làm nổ màn hình đen thui
    if (!isFinite(chieuCaoThucTe) || chieuCaoThucTe <= 0.001) {
        console.warn("⚠️ Model vô hình hoặc Box3 bị lỗi! Kích hoạt size dự phòng.");
        chieuCaoThucTe = 1.0;
    }

    // 3. BƠM TỶ LỆ CHUẨN (Chỉ ép lên gốc)
    const tyLeChuan = sizeMongMuon / chieuCaoThucTe;
    mesh.scale.setScalar(tyLeChuan);
    mesh.updateMatrixWorld(true);

    // 4. LƯU LẠI DỮ LIỆU HITBOX CHO SẾP PK
    mesh.userData.chieuCaoThuc = sizeMongMuon;
    mesh.userData.tamThucTeLocal = new THREE.Vector3(0, chieuCaoThucTe / 2, 0);

    console.log(`🤖 [ENGINE] Đã nén Model về ${sizeMongMuon}m (Đo được: ${chieuCaoThucTe.toFixed(3)}m -> Lực nén: ${tyLeChuan.toFixed(3)})`);
};

function tienHanhTaiNhanVat() {
    let coThuCuoi = window.MOUNT_URL && window.MOUNT_URL.trim() !== "";
    if (coThuCuoi) {

        loader.load(window.MOUNT_URL, function (gltfMount) {
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
            loader.load(window.CURRENT_MODEL_URL, function (gltfChar) {

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
        loader.load(
            window.CURRENT_MODEL_URL,
            function (gltfChar) {
                // 🌟 CẮT ĐỨT DÂY THẦN KINH NGƯỜI CHƠI (CHỐNG BOSS MIMIC)
                playerModel = window.playerModel = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(gltfChar.scene) : gltfChar.scene.clone();
                window.nhanVatChinh = playerModel;
                let doCao = (window.ADMIN_NAME === "Admin") ? 2.5 : 2.5;
                chuanHoaKichThuoc(playerModel, doCao);
                playerModel.position.set(TOA_DO_SPAWN.x, TOA_DO_SPAWN.y, TOA_DO_SPAWN.z);

                scene.add(playerModel);
                mixer = new THREE.AnimationMixer(playerModel);
                animationsMap = {};
                window.animationsMap = animationsMap;

                gltfChar.animations.forEach((clip) => {
                    clip.tracks = clip.tracks.filter(track => !track.name.includes('.scale'));
                    animationsMap[clip.name.toUpperCase()] = mixer.clipAction(clip);
                });

                cayMatAdmin(playerModel); loadVuKhiChoNhanVat(playerModel); hoanTatTaiModels();
            },
            undefined,
            function (error) {
                // 🌟 MỞ KHÓA MẮT THẦN: In thẳng nguyên nhân cái chết của Three.js ra màn hình!
                console.error("🚨 THREE.JS BÁO LỖI NỘI TẠI:", error);

                // 🛡️ LÁ CHẮN BẤT TỬ
                console.error("❌ LỖI: Mất file Nhân vật chính " + window.CURRENT_MODEL_URL + " !");
                alert("Cảnh báo: Không tìm thấy ngoại hình nhân vật! Game sẽ load một khối vuông tạm thời.");

                // ... (Phần code nặn cục gạch đỏ bên dưới Sếp giữ nguyên)

                // Nặn tạm 1 cục gạch đỏ cho Sếp vào game chạy bộ
                let geoFallback = new THREE.BoxGeometry(1, 2.5, 1);
                let matFallback = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                playerModel = window.playerModel = window.nhanVatChinh = new THREE.Mesh(geoFallback, matFallback);
                playerModel.position.set(TOA_DO_SPAWN.x, TOA_DO_SPAWN.y, TOA_DO_SPAWN.z);

                scene.add(playerModel);
                mixer = new THREE.AnimationMixer(playerModel);
                animationsMap = {}; window.animationsMap = animationsMap;

                loadVuKhiChoNhanVat(playerModel);
                hoanTatTaiModels(); // 🌟 Ép gọi hàm này để vượt qua 0% Loading
            }
        );
    }
};

function loadVuKhiChoNhanVat(nhanVatDich) {




    // 🛑 LÁ CHẮN THÉP: Kiểm tra toàn diện để chặn phái dùng vũ khí đặc thù, Hộ Thể, Luyện Thể, Lazer (Tay Không)
    let phaiHienTai = (window.SCRIPT_PHAI_CUA_TOI || "").toLowerCase();
    let codePhaiGoc = (window.FACTION_CODE || "").toLowerCase();
    let tenPhaiChay = (window.HePhaiHienTai && window.HePhaiHienTai.tenPhai || "").toLowerCase();

    if (
        phaiHienTai.includes('cungthu') || phaiHienTai.includes('bansung') || phaiHienTai.includes('tutien') || phaiHienTai.includes('phapsu') || phaiHienTai.includes('luyenthe') || phaiHienTai.includes('lazer') ||
        codePhaiGoc.includes('tu_tien') || codePhaiGoc.includes('cung_ten') || codePhaiGoc.includes('phap_su') || codePhaiGoc.includes('sung_dan') || codePhaiGoc.includes('luyen_the') || codePhaiGoc.includes('sieuanhhung') || codePhaiGoc.includes('lazer') ||
        tenPhaiChay.includes('tu tiên') || tenPhaiChay.includes('cung thủ') || tenPhaiChay.includes('pháp sư') || tenPhaiChay.includes('luyện thể') || tenPhaiChay.includes('lazer')
    ) {
        console.log("🛑 Engine: Đã chặn gắn vũ khí lên tay phải (Hệ phái dùng vũ khí đặc thù/Hộ thể/Tay Không)!");
        return;
    }




    // 🌟 QUY TẮC D: Chặn gắn vũ khí tay cầm nếu đang mặc Skin ALL (Anime)
    if (window.IS_SKIN_ANIME) {
        console.log("🛑 Engine: Đã chặn vũ khí (Đang mặc Skin ALL/Anime)!");
        return;
    }

    if (window.WEAPON_URL && window.WEAPON_URL.trim() !== "") {
        loader.load(
            window.WEAPON_URL,
            function (gltfW) {
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
            },
            undefined,
            function (error) {
                console.error("⚠️ [CẢNH BÁO ENGINE]: Không tìm thấy file vũ khí 3D tại: " + window.WEAPON_URL + ". Đã kích hoạt chế độ Tay Không.");
            }
        );
    }
}

function hoanTatTaiModels() {

    playerModel.traverse(function (child) { if (child.isMesh) child.frustumCulled = false; });

    // 1. Nắn trục xương sống
    let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0, 0, 0);
    let huongLenTroiMoi = playerModel.position.clone().sub(tam);
    if (huongLenTroiMoi.lengthSq() < 0.001) huongLenTroiMoi.set(0, 1, 0); else huongLenTroiMoi.normalize();
    playerModel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenTroiMoi);
    playerModel.up.copy(huongLenTroiMoi);
    window.mucTieuBanKinhDat = playerModel.position.distanceTo(tam);

    playIdle();
    if (window.HePhaiHienTai && typeof window.HePhaiHienTai.khoiTao === 'function') window.HePhaiHienTai.khoiTao();

    // ==========================================
        // 🌟 BẢN VÁ LOADING THỦY LỰC & CHỐNG TRÀN VRAM MAP
        // ==========================================
        let manHinhLoading = document.getElementById('manHinhLoadingGame');
        let thanhTienTrinh = document.getElementById('thanhTienTrinhGame');
        let textTienTrinh = document.getElementById('textTienTrinhGame');
        let soPhanTram = document.getElementById('soPhanTramLoading'); 

        window.loadTatCaMapTuSQL();
        window.loadSafeZonesVaTeleports();

        // 🛡️ TƯỜNG LỬA CHỐNG TẢI CHỒNG CHẤT BẢN ĐỒ (MAP CHUNK)
        window.dangBanTaiMap = false;
        
        // 🌟 TÁCH RADAR MAP RA KHỎI VÒNG LẶP LOADING ĐỂ NÓ CHẠY VĨNH VIỄN SUỐT GAME
        setInterval(() => {
            if (!window.THONG_TIN_CAC_MAP || !window.playerModel) return;

            let pPos = window.playerModel.position;
            // 🌟 BÓP TẦM NHÌN: Mobile chỉ tải Map trong 300m, xa hơn 500m thì thiêu rụi!
            let rLoad = window.isMobile ? 300 : 2000; 
            let rUnload = window.isMobile ? 500 : 3000;

            // 1. DỌN RÁC (UNLOAD MAP CŨ)
            window.THONG_TIN_CAC_MAP.forEach(mapData => {
                let mPos = new THREE.Vector3(parseFloat(mapData.pos_x), parseFloat(mapData.pos_y), parseFloat(mapData.pos_z));
                let dist = pPos.distanceTo(mPos);

                if (dist > rUnload && mapData.isLoaded && mapData.mesh) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(mapData.mesh);
                    else window.scene.remove(mapData.mesh);
                    
                    mapData.isLoaded = false;
                    mapData.isLoading = false;
                    mapData.mesh = null;
                    console.log("🧹 Đã dọn rác giải phóng RAM Map: " + mapData.id);
                }
            });

            // 2. TẢI MAP MỚI (STRICT QUEUE - 1 MAP MỖI LẦN)
            let coMapDangLoad = window.THONG_TIN_CAC_MAP.some(m => m.isLoading);
            
            if (!coMapDangLoad && !window.dangBanTaiMap) {
                let mapCanLoad = window.THONG_TIN_CAC_MAP.find(mapData => {
                    let mPos = new THREE.Vector3(parseFloat(mapData.pos_x), parseFloat(mapData.pos_y), parseFloat(mapData.pos_z));
                    return pPos.distanceTo(mPos) <= rLoad && !mapData.isLoaded && !mapData.isLoading;
                });

                if (mapCanLoad) {
                    window.dangBanTaiMap = true; // Khóa mõm hệ thống
                    mapCanLoad.isLoading = true; // Cắm cờ lập tức

                    // Trì hoãn 200ms để CPU xả hơi trước khi Parse GLB nặng
                    setTimeout(() => {
                        if (typeof window.xuLyLoadMapChunk === 'function') {
                            window.xuLyLoadMapChunk(mapCanLoad);
                            // Chỉ nhả khóa radar sau 3 giây để đảm bảo Map trước đã kịp lên hình
                            setTimeout(() => { window.dangBanTaiMap = false; }, 3000);
                        } else {
                            window.dangBanTaiMap = false;
                        }
                    }, 200);
                }
            }
        }, 1000); // 1 Giây quét 1 lần, tuyệt đối không gây giật lag!

        let thoiGianChoInit = 0;
        let phanTramAo = 0; 

        let vongLapChoVaoGame = setInterval(() => {
            thoiGianChoInit += 500;

            // --- A. THUẬT TOÁN CHẠY % GIẢ LẬP (SMOOTH PROGRESS) ---
            if (thoiGianChoInit <= 10000) {
                phanTramAo += 3;
                if (textTienTrinh) textTienTrinh.innerText = "Đang kết nối Vũ Trụ và Đúc Khuôn Vật Lý (BVH)...";
            } else {
                phanTramAo += 1;
                if (textTienTrinh) textTienTrinh.innerText = "Đang uốn nắn Địa hình và Ổn định Không gian...";
            }

            if (phanTramAo > 99) phanTramAo = 99;
            if (thanhTienTrinh) thanhTienTrinh.style.width = phanTramAo + '%';
            if (soPhanTram) soPhanTram.innerText = phanTramAo + '%'; 

            // --- B. KIỂM TRA TRẠNG THÁI MAP THẬT ---
            if (!window.daNhanDanhSachMap) return;

            let coMapDangLoad = window.THONG_TIN_CAC_MAP && window.THONG_TIN_CAC_MAP.some(m => m.isLoading);
            let coMapDaLoad = window.THONG_TIN_CAC_MAP && window.THONG_TIN_CAC_MAP.some(m => m.isLoaded);
            let vungDatNayCoMap = window.THONG_TIN_CAC_MAP && window.THONG_TIN_CAC_MAP.length > 0;

            let daXongXuoiThatSu = false;
            if (vungDatNayCoMap) {
                if (!coMapDangLoad && coMapDaLoad) daXongXuoiThatSu = true;
            } else {
                daXongXuoiThatSu = true; 
            }

            // --- C. CHỐT HẠ: NHẢY VỌT LÊN 100% ---
            if (daXongXuoiThatSu || thoiGianChoInit >= 30000) {
                clearInterval(vongLapChoVaoGame);

                if (thanhTienTrinh) thanhTienTrinh.style.width = '100%';
                if (soPhanTram) soPhanTram.innerText = '100%'; 
                if (textTienTrinh) textTienTrinh.innerText = "THẾ GIỚI ĐÃ SẴN SÀNG! VÀO THÔI SẾP!";
                console.log("🟢 [LOADING] Thành công! Đã mở cửa thiên đình.");

                setTimeout(() => {
                    if (manHinhLoading) {
                        manHinhLoading.style.opacity = '0';
                        setTimeout(() => {
                            manHinhLoading.style.display = 'none';
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

// ==========================================
// 👦 HỆ THỐNG KỸ NĂNG: KHUNG MẪU ĐA HOẠT ẢNH (MULTI-ANIMATION TEMPLATE)
// 👑 TÍNH NĂNG: MÁY QUÉT TỰ ĐỘNG NHẬN DIỆN MỌI HOẠT ẢNH CỦA MODEL BẤT KỲ
// ==========================================

(function () {
    let hieuUngASL = [];
    let danhSachSoBayASL = [];

    window.trangThaiASL = {
        state: 'IDLE',
        target: null,
        skillKey: null,
        dameRatio: 1
    };

    // 🌟 1. HAI RƯƠNG CHỨA ANIMATION TỰ ĐỘNG
    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];

    window.tongSoChuNoi_ASL = 0;
    function taoSoSatThuongASL(pos3D, satThuong, mauSac = '#ff2222') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        window.tongSoChuNoi_ASL++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000, -2px -2px 0px #000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999; transition: 0.1s;`;
        document.body.appendChild(div);

        setTimeout(() => { div.style.transform = `scale(1.5)`; }, 20);
        setTimeout(() => { div.style.transform = `scale(1.0)`; }, 100);

        danhSachSoBayASL.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    const THOI_GIAN_HOI = { 'Q': 4000, 'E': 4000, 'R': 4000, 'F': 4000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    function layQuaiVatGanNhatASL(viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 300) return window.mucTieuHienTai;
        }

        let targetNguoi = null; let minDNguoi = 300;
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDNguoi) { minDNguoi = d; targetNguoi = rp; }
                }
            }
        }
        if (targetNguoi) return targetNguoi;

        let targetQuai = null; let minDQuai = 300;
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDQuai) { minDQuai = d; targetQuai = quai; }
                }
            });
        }
        return targetQuai;
    }

    function gaySatThuongASL(tamNgucDich, luongSatThuong, banKinh) {
        function kichHoatHutMau() {
            let nvc = window.playerModel || window.nhanVatChinh;
            if (nvc && nvc.hp < (nvc.maxHp || 1000)) {
                nvc.hp = Math.min((nvc.maxHp || 1000), nvc.hp + (luongSatThuong * 0.05));
                if (document.getElementById('health-bar')) document.getElementById('health-bar').style.width = (nvc.hp / (nvc.maxHp || 1000) * 100) + '%';
            }
        }

        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongASL(posHienSo, luongSatThuong, '#ffaa00');
                        kichHoatHutMau();
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }

        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        if (quai.isBoss) {
                            taoSoSatThuongASL(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            kichHoatHutMau();
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongASL(hit.tamNguc.clone(), luongSatThuong);
                            kichHoatHutMau();
                            if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (quai.hp / (quai.maxHp || 4000)) * 100) + '%'; }
                            if (quai.hp <= 0) {
                                quai.isDead = true; if (typeof quai.playAnim === 'function') quai.playAnim('DIE'); else quai.mesh.visible = false;
                                if (quai.tagEl) quai.tagEl.style.display = 'none';
                                if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);
                                setTimeout(() => { quai.hp = quai.maxHp || 4000; quai.isDead = false; if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true; if (quai.tagEl) { quai.tagEl.querySelector('.hp-bar').style.width = '100%'; quai.tagEl.style.display = 'block'; } }, 5000);
                            } else { if (typeof quai.playAnim === 'function') quai.playAnim('HIT'); }
                        }
                    }
                }
            });
        }
    }

    window.thoiDiemNoCuoiCungASL = window.thoiDiemNoCuoiCungASL || 0;
    function taoVuNoASL(pos, upV, mauHex, banKinh) {
        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungASL < 300) return;
        window.thoiDiemNoCuoiCungASL = bayGio;

        if (typeof window.phatAmThanhNo === 'function') window.phatAmThanhNo();

        const vfxGroup = new THREE.Group();
        vfxGroup.position.copy(pos);

        const soLuong = window.isMobile ? 5 : 125;
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = 0; posArr[i * 3 + 1] = 0; posArr[i * 3 + 2] = 0;
            let dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            let speed = 1 + Math.random() * 3;
            vels.push(dir.multiplyScalar(speed));
        }

        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        const texture = (typeof window.layTextureLua === 'function') ? window.layTextureLua() : null;
        const mat = new THREE.PointsMaterial({
            color: mauHex || 0xffddaa,
            size: window.isMobile ? 9.0 : 6.0,
            map: texture,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat);
        vfxGroup.add(pts);

        let songXungKich = null;
        if (!window.isMobile) {
            const geoSong = new THREE.RingGeometry(0.1, 2, 32);
            const matSong = new THREE.MeshBasicMaterial({
                color: mauHex || 0xffaa00, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            songXungKich = new THREE.Mesh(geoSong, matSong);
            songXungKich.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upV);
            songXungKich.position.add(upV.clone().multiplyScalar(0.5));
            vfxGroup.add(songXungKich);
        }

        scene.add(vfxGroup);
        hieuUngASL.push({ group: vfxGroup, pts: pts, velocities: vels, songXungKich: songXungKich, life: window.isMobile ? 20 : 40, maxScale: banKinh });
    }

    // 🌟 2. HÀM BỐC THĂM THÔNG MINH TRONG RƯƠNG
    function bốcChiêuTấnCôngNgẫuNhiên() {
        if (window.KHO_ANIM_TANCONG.length === 0) return 'ATTACK'; // Lốp dự phòng
        let chon = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
        console.log("⚔️ Đã bốc trúng chiêu:", chon);
        return chon;
    }

    window.tungComboASL = function (phim, isRemote = false) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc || isRemote) return;

        let bayGio = Date.now();
        if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
        choHoiChieu[phim] = bayGio;

        window.dangMuaChieu = true;

        if (!isRemote) {
            let nutKyNang = document.getElementById('btn' + phim.toUpperCase()) || document.getElementById('skill' + phim.toUpperCase());
            if (!nutKyNang) {
                let cacNut = document.querySelectorAll('div, button');
                for (let n of cacNut) {
                    if (n.innerText && n.innerText.trim().toUpperCase() === phim.toUpperCase() && (n.style.borderRadius === '50%' || n.className.includes('skill'))) {
                        nutKyNang = n; break;
                    }
                }
            }

            if (nutKyNang) {
                nutKyNang.style.pointerEvents = 'none';
                nutKyNang.style.filter = 'brightness(0.4) grayscale(100%)';
                let thoiGian = THOI_GIAN_HOI[phim] / 1000;

                setTimeout(() => {
                    nutKyNang.style.filter = ''; nutKyNang.style.pointerEvents = '';
                }, THOI_GIAN_HOI[phim]);
            }
        }

        let viTriGoc = nvc.position.clone();
        let targetQuai = layQuaiVatGanNhatASL(viTriGoc);

        if (targetQuai) {
            const dameChiTiet = { 'Q': 1.0, 'E': 1.2, 'R': 1.5, 'F': 2.0 };
            window.trangThaiASL.state = 'DASHING';
            window.trangThaiASL.target = targetQuai;
            window.trangThaiASL.skillKey = phim;
            window.trangThaiASL.dameRatio = dameChiTiet[phim];

            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua('CHAYBO');
        } else {
            window.trangThaiASL.state = 'HITTING';
            let randomAtk = bốcChiêuTấnCôngNgẫuNhiên();

            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(randomAtk);
            else if (typeof window.playAnim === 'function') window.playAnim(randomAtk);

            let nvcUp = nvc.up.clone().normalize();
            let banKinhNo = (phim === 'F') ? 15 : 5;
            taoVuNoASL(viTriGoc, nvcUp, 0xffaa00, banKinhNo);

            setTimeout(() => {
                window.dangMuaChieu = false;
                window.trangThaiASL.state = 'IDLE';
                if (typeof window.playAnim === 'function') window.playAnim('NHANROI');
            }, 1200);
        }
    };

    // ========================================================
    // 🌟 AI: RANDOM NHÀN RỖI (TRÁO RUỘT TỪ ĐIỂN MỖI 10 GIÂY)
    // ========================================================
    window.vongLapNhanRoiASL = null;
    function batDauAutoNhanRoi() {
        if (window.vongLapNhanRoiASL) clearInterval(window.vongLapNhanRoiASL);

        window.vongLapNhanRoiASL = setInterval(() => {
            if (window.trangThaiASL.state === 'IDLE' && !window.dangMuaChieu) {
                if (window.KHO_ANIM_NHANROI.length === 0) return;

                let tenAnim = window.KHO_ANIM_NHANROI[Math.floor(Math.random() * window.KHO_ANIM_NHANROI.length)];

                if (window.animationsMap && window.animationsMap[tenAnim]) {
                    window.animationsMap['NHANROI'] = window.animationsMap[tenAnim];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[tenAnim];
                    if (typeof window.playAnim === 'function') window.playAnim(tenAnim);
                }
            }
        }, 10000);
    }

    if (window.SCRIPT_PHAI_CUA_TOI && (window.SCRIPT_PHAI_CUA_TOI.includes('phai_luyenthe') || window.SCRIPT_PHAI_CUA_TOI.includes('asl') || window.SCRIPT_PHAI_CUA_TOI.includes('asl.js'))) {

        window.HePhaiHienTai = {
            tenPhai: "Bộ Mẫu Đa Hoạt Ảnh Thông Minh",
            khoiTao: function () {
                console.log("🔥 Đã Kích Hoạt Cỗ Máy Quét Hoạt Ảnh Tự Động Toàn Cầu!");

                if (window.playerModel && (!window.MOUNT_URL || window.MOUNT_URL.trim() === "")) {
                    window.playerModel.scale.multiplyScalar(1.6);
                }

                // ==============================================================
                // 🌟 3. CỖ MÁY QUÉT TỪ ĐIỂN TỰ ĐỘNG (KHÔNG CÒN GÕ CỨNG TÊN NỮA)
                // ==============================================================
                window.KHO_ANIM_NHANROI = [];
                window.KHO_ANIM_TANCONG = [];

                if (window.animationsMap) {
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();

                        // Gom Nhàn rỗi
                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) {
                            window.KHO_ANIM_NHANROI.push(key);
                        }

                        // Gom Tấn công
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('PUNCH') || k.includes('KICK') || k.includes('COMBO')) {
                            window.KHO_ANIM_TANCONG.push(key);
                        }

                        // Gom Chạy bộ và Ép cấm bay
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) {
                            window.animationsMap['CHAYBO'] = window.animationsMap[key];
                            window.animationsMap['BAY'] = window.animationsMap[key];
                            window.animationsMap['FLY'] = window.animationsMap[key];
                        }
                    }

                    // 🛡️ Lốp dự phòng nếu Artist đặt tên quá quái gở
                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push(Object.keys(window.animationsMap)[0] || 'IDLE');
                    if (window.KHO_ANIM_TANCONG.length === 0) window.KHO_ANIM_TANCONG.push(Object.keys(window.animationsMap)[0] || 'ATTACK');

                    console.log(`🤖 MÁY QUÉT ĐÃ TÌM ĐƯỢC: ${window.KHO_ANIM_NHANROI.length} dáng đứng, ${window.KHO_ANIM_TANCONG.length} đòn đánh!`);

                    // Set nhàn rỗi mặc định lúc vừa vào game
                    let idleMacDinh = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[idleMacDinh];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[idleMacDinh];
                }

                batDauAutoNhanRoi();

                const vuKhiLoader = new THREE.GLTFLoader();
                if (window.loaderSieuToc) vuKhiLoader.setDRACOLoader(window.loaderSieuToc);

                let linkBaoTay = window.WEAPON_URL;
                if (!linkBaoTay || linkBaoTay.trim() === '') return;

                vuKhiLoader.load(linkBaoTay, (gltf) => {
                    window.vuKhiModel = gltf.scene;
                    let xuongTayPhai = null;
                    let modelNguoi = window.nhanVatChinh || window.playerModel;
                    modelNguoi.traverse(c => {
                        if (c.isBone && (c.name.toLowerCase().includes('hand_r') || c.name.toLowerCase().includes('righthand') || c.name.toLowerCase().includes('hand.r'))) {
                            xuongTayPhai = c;
                        }
                    });
                    if (xuongTayPhai) {
                        xuongTayPhai.add(window.vuKhiModel);
                        window.vuKhiModel.position.set(0, 0, 0);
                        window.vuKhiModel.scale.set(3, 3, 3);
                    } else {
                        modelNguoi.add(window.vuKhiModel); window.vuKhiModel.position.set(-1, 5, 1);
                    }
                });
            },
            tungChieu: function (phim, isRemote = false) {
                window.tungComboASL(phim, isRemote);
            },
            vongLapVatLy: function () {
                let nvc = window.playerModel;
                if (!nvc) return;

                if (window.trangThaiASL.state === 'DASHING' && window.trangThaiASL.target) {
                    let t = window.trangThaiASL.target;
                    if (t.isDead) {
                        window.trangThaiASL.state = 'IDLE';
                        window.dangMuaChieu = false;
                        if (typeof window.playAnim === 'function') window.playAnim('NHANROI');
                        return;
                    }

                    let tHit = window.layHitbox(t.mesh);
                    let myHit = window.layHitbox(nvc);

                    let diemDen = tHit.tamNguc.clone();
                    diemDen.y -= (myHit.chieuCao / 2);

                    let khoangCach = nvc.position.distanceTo(diemDen);

                    const dummy = new THREE.Object3D();
                    dummy.position.copy(nvc.position);
                    dummy.up.copy(nvc.up);
                    let vecToTarget = new THREE.Vector3().subVectors(tHit.tamNguc, nvc.position);
                    let vertComp = vecToTarget.clone().projectOnVector(nvc.up);
                    vecToTarget.sub(vertComp);
                    dummy.lookAt(nvc.position.clone().add(vecToTarget));
                    nvc.quaternion.slerp(dummy.quaternion, 0.3);

                    if (khoangCach > 10.0) {
                        nvc.position.lerp(diemDen, 0.25);
                        if (window.controls) window.controls.target.lerp(tHit.tamNguc, 0.1);
                    }
                    else {
                        window.trangThaiASL.state = 'HITTING';

                        let randomAtk = bốcChiêuTấnCôngNgẫuNhiên();
                        if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(randomAtk);
                        else if (typeof window.playAnim === 'function') window.playAnim(randomAtk);

                        setTimeout(() => {
                            if (!window.trangThaiASL.target || window.trangThaiASL.target.isDead) return;

                            let banKinhNo = (window.trangThaiASL.skillKey === 'F') ? 15 : 5;
                            taoVuNoASL(tHit.tamNguc, nvc.up.clone().normalize(), 0xffaa00, banKinhNo);
                            gaySatThuongASL(tHit.tamNguc, (window.DAME_CUA_TOI || 200) * window.trangThaiASL.dameRatio, banKinhNo);

                            if (window.currentActionChar) {
                                window.currentActionChar.setEffectiveTimeScale(0.01);
                                setTimeout(() => { if (window.currentActionChar) window.currentActionChar.setEffectiveTimeScale(1.5); }, 100);
                            }

                            let camY = camera.position.y; let camX = camera.position.x;
                            let shake = setInterval(() => {
                                camera.position.y = camY + (Math.random() - 0.5) * 1.5;
                                camera.position.x = camX + (Math.random() - 0.5) * 1.5;
                            }, 20);
                            setTimeout(() => {
                                clearInterval(shake);
                                camera.position.y = camY; camera.position.x = camX;
                            }, 120);
                        }, 400);

                        setTimeout(() => {
                            window.dangMuaChieu = false;
                            window.trangThaiASL.state = 'IDLE';
                            if (typeof window.playAnim === 'function') window.playAnim('NHANROI');
                        }, 1200);
                    }
                }

                for (let i = hieuUngASL.length - 1; i >= 0; i--) {
                    let vfx = hieuUngASL[i];
                    vfx.life--;
                    let posArr = vfx.pts.geometry.attributes.position.array;
                    for (let j = 0; j < posArr.length / 3; j++) {
                        posArr[j * 3] += vfx.velocities[j].x;
                        posArr[j * 3 + 1] += vfx.velocities[j].y;
                        posArr[j * 3 + 2] += vfx.velocities[j].z;
                        vfx.velocities[j].x *= 0.85; vfx.velocities[j].y *= 0.85; vfx.velocities[j].z *= 0.85;
                    }
                    vfx.pts.geometry.attributes.position.needsUpdate = true;

                    vfx.pts.material.size += 0.2;
                    vfx.pts.material.opacity = vfx.life / 40;
                    if (vfx.life < 25) vfx.pts.material.color.setHex(0xff3300);
                    if (vfx.life < 10) {
                        vfx.pts.material.color.setHex(0x111111);
                        vfx.pts.material.blending = THREE.NormalBlending;
                    }
                    if (vfx.songXungKich) {
                        let tienTrinh = 1 - (vfx.life / 40);
                        let scaleSong = vfx.maxScale * (tienTrinh * 0.75);
                        vfx.songXungKich.scale.set(scaleSong, scaleSong, 1);
                        vfx.songXungKich.material.opacity = (vfx.life / 40) * 0.6;
                    }
                    if (vfx.life <= 0) {
                        if (typeof window.donRac3D === 'function') window.donRac3D(vfx.group);
                        else scene.remove(vfx.group);
                        hieuUngASL.splice(i, 1);
                    }
                }

                for (let i = danhSachSoBayASL.length - 1; i >= 0; i--) {
                    let item = danhSachSoBayASL[i];
                    item.offsetY += 0.05; item.life--;
                    const screenPos = item.pos.clone(); screenPos.y += item.offsetY; screenPos.project(camera);
                    if (screenPos.z < 1) {
                        item.el.style.left = `${(screenPos.x * 0.5 + 0.5) * window.innerWidth}px`;
                        item.el.style.top = `${(screenPos.y * -0.5 + 0.5) * window.innerHeight}px`;
                    } else { item.el.style.display = 'none'; }
                    if (item.life < 20) item.el.style.opacity = item.life / 20;
                    if (item.life <= 0) { item.el.remove(); danhSachSoBayASL.splice(i, 1); window.tongSoChuNoi_ASL--; }
                }
            },
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();

// ==========================================
// 🎭 BỘ NÃO ANIMATION TỐI THƯỢNG (BẢN V54 - COMBO LIÊN HOÀN CHỐNG GIẬT KINH PHONG)
// ==========================================
function playAnim(animName) {
    if (window.isTestingAnimation) return;

    let upName = animName.toUpperCase();
    let dangCuoiThu = window.MOUNT_URL && window.MOUNT_URL.trim() !== "";
    let laChieuTanCong = upName.includes('CHIEU') || upName.includes('ATTACK') || upName.includes('PUNCH') || upName.includes('KICK') || upName.includes('COMBO') || upName === 'TANCONG' || upName.includes('SKILL');
    let laHanhDongNguoi = laChieuTanCong || upName === 'CHET' || upName === 'DIE' || upName === 'DEATH';

    // 🛡️ LÁ CHẮN MÚA CHIÊU: Trừ khi đang chạy Combo Liên Hoàn, còn lại khóa đứng 1.5s
    if (window.dangMuaChieu && !laHanhDongNguoi && !window.dangChayComboLienHoan) {
        if (upName === 'CHAYBO' || upName === 'BAY') {
            let dangCuaDongTay = window.isKeyboardMoving || window.isMoving;
            if (window.HePhaiHienTai && window.HePhaiHienTai.tenPhai === "Luyện Thể" && !window.isAutoAFK && upName !== 'BAY' && dangCuaDongTay) {
                window.dangMuaChieu = false;
            } else {
                let thoiGianDaQua = Date.now() - (window.thoiDiemBatDauMua || 0);
                let tgCho = (window.HePhaiHienTai && window.HePhaiHienTai.tenPhai === "Luyện Thể") ? 2000 : 1500;
                if (thoiGianDaQua >= tgCho) window.dangMuaChieu = false;
                else return;
            }
        } else {
            return;
        }
    }

    let checkName = upName;
    if (checkName === 'IDLE' || checkName === 'WAIT') checkName = 'NHANROI';
    if (checkName === 'WALK' || checkName === 'RUN' || checkName === 'DIBO') checkName = 'CHAYBO';
    if (checkName === 'FLY') checkName = 'BAY';
    if (checkName === 'DEATH') checkName = 'DIE';

    // ==========================================
    // 🐎 NHÁNH 1: ĐANG CƯỠI THÚ
    // ==========================================
    if (dangCuoiThu) {
        if (laHanhDongNguoi) {
            if (window.dangMuaChieu && !laChieuTanCong && !window.dangChayComboLienHoan) return;
            if (window.animationsMapChar) {
                let actionChar = window.animationsMapChar[upName];
                if (!actionChar && laChieuTanCong) {
                    let keysChar = Object.keys(window.animationsMapChar).filter(k => k.includes('ATTACK') || k.includes('SKILL'));
                    if (keysChar.length > 0) actionChar = window.animationsMapChar[keysChar[Math.floor(Math.random() * keysChar.length)]];
                }
                if (!actionChar) actionChar = window.animationsMapChar['NHANROI'] || window.animationsMapChar['IDLE'] || Object.values(window.animationsMapChar)[0];

                if (actionChar) {
                    // Cắt đuôi FadeOut nhanh hơn nếu đang múa liên hoàn
                    if (window.currentActionChar) window.currentActionChar.fadeOut(window.dangChayComboLienHoan ? 0.05 : 0.2);
                    window.currentActionChar = actionChar;

                    // 🌟 CÔNG THỨC MỚI: LIÊN HOÀN COMBO TRÊN LƯNG THÚ
                    if (laChieuTanCong) {
                        window.currentActionChar.setLoop(THREE.LoopOnce); // Chỉ múa 1 nhát rồi dừng
                        window.currentActionChar.clampWhenFinished = true;

                        let thoiLuongGoc = window.currentActionChar.getClip().duration; 
                        let thoiGianMongMuon = 1.5; 
                        
                        // Cắm cờ để hàm không tự reset mốc 1.5s khi đang bốc chiêu tiếp theo
                        if (!window.dangChayComboLienHoan) {
                            kichHoatKhiencAnimation(thoiGianMongMuon * 1000); 
                            window.thoiGianKetThucCombo = Date.now() + (thoiGianMongMuon * 1000);
                        }

                        if (thoiLuongGoc >= thoiGianMongMuon) {
                            window.currentActionChar.timeScale = thoiLuongGoc / thoiGianMongMuon; // Dài quá thì tua nhanh
                        } else {
                            window.currentActionChar.timeScale = 1.1; // Chạy nhanh hơn xíu cho lực
                            let tgChayThucTe = (thoiLuongGoc / window.currentActionChar.timeScale) * 1000;
                            
                            // Hẹn giờ bốc chiêu tiếp theo nếu còn dư thời gian
                            if (window.henGioComboNextChar) clearTimeout(window.henGioComboNextChar);
                            window.henGioComboNextChar = setTimeout(() => {
                                if (window.dangMuaChieu && !window.isDead && Date.now() < window.thoiGianKetThucCombo - 150) {
                                    let kho = window.KHO_ANIM_TANCONG || [];
                                    if (kho.length > 0) {
                                        let chieuMoi = kho[Math.floor(Math.random() * kho.length)];
                                        window.dangChayComboLienHoan = true; 
                                        if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(chieuMoi);
                                        window.dangChayComboLienHoan = false;
                                    }
                                }
                            }, tgChayThucTe - 50); // Móc sớm 50ms để gọt mượt animation
                        }
                    } else {
                        if (window.henGioComboNextChar) clearTimeout(window.henGioComboNextChar);
                        window.currentActionChar.setLoop(THREE.LoopRepeat);
                        window.currentActionChar.timeScale = 1.0;
                    }

                    window.currentActionChar.reset().fadeIn(window.dangChayComboLienHoan ? 0.05 : 0.2).play();
                    window.currentAnimNameChar = upName;
                }
            }
        } else {
            if (!window.dangMuaChieu && window.animationsMapChar) {
                let lenhNguoi = 'NHANROI';
                if (window.currentAnimNameChar !== lenhNguoi) {
                    let keysIdle = Object.keys(window.animationsMapChar).filter(k => k.includes('NHANROI') || k.includes('IDLE') || k.includes('HOME'));
                    let actionChar = null;
                    if (keysIdle.length > 0) actionChar = window.animationsMapChar[keysIdle[Math.floor(Math.random() * keysIdle.length)]];
                    if (!actionChar) actionChar = Object.values(window.animationsMapChar)[0];

                    if (actionChar) {
                        if (window.currentActionChar) window.currentActionChar.fadeOut(0.2);
                        window.currentActionChar = actionChar;
                        window.currentActionChar.reset().fadeIn(0.2).play();
                        window.currentAnimNameChar = lenhNguoi;
                    }
                }
            }
        }

        // 🌟 XỬ LÝ CON THÚ BÊN DƯỚI (Không đổi)
        if (!laHanhDongNguoi && animationsMap) {
            let actionThu = animationsMap[checkName];
            let finalAnimThu = checkName;

            if (!actionThu) {
                let keysThu = Object.keys(animationsMap);
                let danhSachPhuHop = [];
                if (checkName === 'NHANROI') danhSachPhuHop = keysThu.filter(k => k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT'));
                else if (checkName === 'CHAYBO') {
                    danhSachPhuHop = keysThu.filter(k => k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK'));
                    if (danhSachPhuHop.length === 0) {
                        danhSachPhuHop = keysThu.filter(k => k.includes('BAY') || k.includes('FLY') || k.includes('FLOAT') || k.includes('SWIM'));
                    }
                }
                else if (checkName === 'BAY') danhSachPhuHop = keysThu.filter(k => k.includes('BAY') || k.includes('FLY') || k.includes('JUMP') || k.includes('RUN'));

                if (danhSachPhuHop.length > 0) {
                    finalAnimThu = danhSachPhuHop[Math.floor(Math.random() * danhSachPhuHop.length)];
                    actionThu = animationsMap[finalAnimThu];
                } else if (keysThu.length > 0) {
                    finalAnimThu = keysThu[0];
                    actionThu = animationsMap[finalAnimThu];
                }
            }

            if (actionThu && currentAnimName !== finalAnimThu) {
                if (currentAction) currentAction.fadeOut(0.2);
                currentAction = actionThu;
                currentAction.reset().fadeIn(0.2).play();
                currentAnimName = finalAnimThu;
            }
        }
        return;
    }

    // ==========================================
    // 🏃 NHÁNH 2: NGƯỜI CHẠY BỘ (KHÔNG CƯỠI THÚ)
    // ==========================================
    let action = null;
    let finalAnimName = checkName;

    if (animationsMap[upName]) {
        action = animationsMap[upName];
        finalAnimName = upName;
    }
    else {
        let danhSachPhuHop = [];
        let tatCaKey = Object.keys(animationsMap);

        if (checkName === 'NHANROI') danhSachPhuHop = tatCaKey.filter(k => k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT'));
        else if (laChieuTanCong) danhSachPhuHop = tatCaKey.filter(k => k.includes('ATTACK') || k.includes('SKILL') || k.includes('PUNCH') || k.includes('KICK') || k.includes('COMBO'));
        else if (checkName === 'CHAYBO') {
            danhSachPhuHop = tatCaKey.filter(k => k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK'));
            if (danhSachPhuHop.length === 0) {
                danhSachPhuHop = tatCaKey.filter(k => k.includes('BAY') || k.includes('FLY') || k.includes('FLOAT') || k.includes('SWIM'));
            }
        }
        else if (checkName === 'BAY') danhSachPhuHop = tatCaKey.filter(k => k.includes('BAY') || k.includes('FLY') || k.includes('JUMP') || k.includes('FALL'));
        else if (checkName === 'DIE') danhSachPhuHop = tatCaKey.filter(k => k.includes('DIE') || k.includes('DEATH'));

        if (danhSachPhuHop.length > 0) {
            finalAnimName = danhSachPhuHop[Math.floor(Math.random() * danhSachPhuHop.length)];
            action = animationsMap[finalAnimName];
        } else if (tatCaKey.length > 0 && !laChieuTanCong) {
            finalAnimName = tatCaKey[0];
            action = animationsMap[finalAnimName];
        }
    }

    // Bỏ qua nếu gọi đúng chiêu đang múa (Trừ khi đang chạy Combo Liên Hoàn thì cho phép lặp để múa gắt hơn)
    if (currentAnimName === finalAnimName && !window.dangChayComboLienHoan) return;

    if (!action) return;

    if (currentAction) currentAction.fadeOut(window.dangChayComboLienHoan ? 0.05 : 0.2);
    currentAction = action;

    // 🌟 CÔNG THỨC MỚI: LIÊN HOÀN COMBO & BẮT CHẾT ANIMATION
    if (finalAnimName.includes('DIE') || finalAnimName.includes('DEATH') || finalAnimName.includes('CHET')) {
        currentAction.setLoop(THREE.LoopOnce);
        currentAction.clampWhenFinished = true; 
        currentAction.timeScale = 1.0;
        if (window.henGioComboNext) clearTimeout(window.henGioComboNext);
    } 
    else if (laChieuTanCong) {
        currentAction.setLoop(THREE.LoopOnce); // 🌟 Bắt buộc chỉ đánh 1 lần rồi đổi chiêu
        currentAction.clampWhenFinished = true;
        
        let thoiLuongGoc = currentAction.getClip().duration; 
        let thoiGianMongMuon = 1.5; 
        
        // Cắm cờ để hàm không tự reset mốc 1.5s khi đang tự bốc chiêu
        if (!window.dangChayComboLienHoan) {
            kichHoatKhiencAnimation(thoiGianMongMuon * 1000); 
            window.thoiGianKetThucCombo = Date.now() + (thoiGianMongMuon * 1000);
        }

        // Nếu animation dài quá 1.5s -> Tua nhanh cho khít
        if (thoiLuongGoc >= thoiGianMongMuon) {
            currentAction.timeScale = thoiLuongGoc / thoiGianMongMuon; 
        } 
        // Nếu animation quá ngắn (Vài mili-giây) -> MÚA LIÊN HOÀN CHỐNG GIẬT
        else {
            currentAction.timeScale = 1.1; // Chạy nhanh hơn 10% cho máu lửa
            let tgChayThucTe = (thoiLuongGoc / currentAction.timeScale) * 1000;
            
            if (window.henGioComboNext) clearTimeout(window.henGioComboNext);
            window.henGioComboNext = setTimeout(() => {
                // Nếu vẫn đang trong thời gian múa chiêu (1.5s) và chưa chết
                if (window.dangMuaChieu && !window.isDead && Date.now() < window.thoiGianKetThucCombo - 150) {
                    let kho = window.KHO_ANIM_TANCONG || [];
                    if (kho.length > 0) {
                        let chieuMoi = kho[Math.floor(Math.random() * kho.length)];
                        window.dangChayComboLienHoan = true;
                        if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(chieuMoi);
                        window.dangChayComboLienHoan = false;
                    }
                }
            }, tgChayThucTe - 50); // Cắt đuôi 50ms để chuyển chiêu mượt hơn, đấm gắt hơn
        }
    } 
    else {
        currentAction.setLoop(THREE.LoopRepeat);
        if (window.henGioComboNext) clearTimeout(window.henGioComboNext);
        
        if (checkName === 'CHAYBO' || checkName === 'RUN') {
            currentAction.timeScale = 1.3; 
        } else {
            currentAction.timeScale = 1.0; 
        }
    }

    currentAction.reset().fadeIn(window.dangChayComboLienHoan ? 0.05 : 0.2).play();
    currentAnimName = finalAnimName;
}


// 🛡️ HÀM CỤC BỘ: CHỐNG SPAM VÀ ĐÈ LỆNH KHI ĐANG MÚA
function kichHoatKhiencAnimation(thoiGianTheoAnim) {
    window.dangMuaChieu = true;
    window.thoiDiemBatDauMua = Date.now();

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
    if (window.isDead) return; // 🌟 BẢN VÁ: Chết rồi thì cấm gọi dậy thở!
    if (idleTimer) clearInterval(idleTimer); playAnim('NHANROI');
    idleTimer = setInterval(() => { if (!window.isDead && !window.isMoving && !window.isKeyboardMoving) playAnim('NHANROI'); }, 8000);
}

const clock = new THREE.Clock(); let lastSendTime = 0;
const bayHud = document.createElement('div');
bayHud.id = 'bay-hud'; bayHud.style.cssText = 'position:fixed; bottom:20px; right:20px; background:rgba(0,15,30,0.8); border:2px solid #00ffff; box-shadow:0 0 10px #00ffff; padding:10px 15px; color:#00ffff; font-family:monospace; font-size:16px; border-radius:8px; z-index:9999; pointer-events:none; text-shadow:0 0 5px #00ffff;';
document.body.appendChild(bayHud);





window.lastFrameTime = performance.now();
window.mainGameLoopId = null; // 🛑 BỔ SUNG: Khai báo biến khóa vòng lặp

function animate() {
    // 🛑 BỔ SUNG: Hủy vòng lặp cũ trước khi đẻ vòng lặp mới, tuyệt đối không bao giờ bị nhân đôi!
    if (window.mainGameLoopId) cancelAnimationFrame(window.mainGameLoopId);
    window.mainGameLoopId = requestAnimationFrame(animate);

    // 🌟 BỘ KHÓA KHUNG HÌNH (FPS THROTTLE) DÀNH RIÊNG CHO MOBILE
    if (window.isMobile) {
        let now = performance.now();
        let elapsed = now - window.lastFrameTime;
        // Bắt máy nghỉ ngơi, chỉ vẽ 30 khung hình / 1 giây (~33ms mỗi frame)
        if (elapsed < 33) return;
        window.lastFrameTime = now - (elapsed % 33);
    }
    window.CPU_START_TIME = performance.now();

    // ========================================================
    // 🧠 BƯỚC 2: KÍCH HOẠT CẢM BIẾN (ĐO FPS SAU KHI ĐÃ BỊ KHÓA)
    // Nằm ở vị trí này thì Cảm biến sẽ hoạt động chuẩn xác 100%!
    // ========================================================
    if (window.GameSensor) window.GameSensor.checkHealth();

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

                    // 🌟 LÁ CHẮN ĐỒNG BỘ TRỤC NGƯỜI CHƠI KHÁC (CHỐNG NGHIÊNG NGƯỜI TRÊN MAP PHẲNG)
                    if (remote.mesh && window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                        let huongLenTroi = remote.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                        let trucUpHienTai = new THREE.Vector3(0, 1, 0).applyQuaternion(remote.mesh.quaternion);
                        let nanTrucQuat = new THREE.Quaternion().setFromUnitVectors(trucUpHienTai, huongLenTroi);
                        remote.mesh.quaternion.premultiply(nanTrucQuat);
                    } else if (remote.mesh && window.KIEU_TRONG_LUC === 'PHANG') {
                        // Ép trả lại trục thẳng đứng tuyệt đối cho Map Phẳng
                        let trucUpHienTai = new THREE.Vector3(0, 1, 0).applyQuaternion(remote.mesh.quaternion);
                        let nanTrucQuat = new THREE.Quaternion().setFromUnitVectors(trucUpHienTai, new THREE.Vector3(0, 1, 0));
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
            // ⚡ LƯỚI ĐIỆN KHÔNG GIAN (CHẶN TRẦN TRỜI & TRƯỢT VÁCH MÊ CUNG KÉP)
            // ==========================================
            function kiemTraVaChamKetGioi(huongDi, khoangCachBuffer) {
                if (!window.danhSachBauTroi || window.danhSachBauTroi.length === 0) return false;
                if (!window.radarBauTroi) {
                    window.radarBauTroi = new THREE.Raycaster();
                    window.radarBauTroi.firstHitOnly = true;
                }

                let huongLen = playerModel.up.clone().normalize();

                // 🌟 BẢN VÁ 1: Bắn tia radar từ ngang rốn (1.0m) thay vì đỉnh đầu (1.5m) để không bị vướng trần mê cung
                let diemBan = playerModel.position.clone().add(huongLen.clone().multiplyScalar(1.0));

                window.radarBauTroi.set(diemBan, huongDi);
                let chamBauTroi = window.radarBauTroi.intersectObjects(window.danhSachBauTroi, true);

                if (chamBauTroi.length > 0) {
                    let diemCham = chamBauTroi[0];
                    let laVachTuong = false;
                    let worldNormal = new THREE.Vector3(0, 1, 0);

                    // 🌟 BẢN VÁ 2: Phân biệt mặt phẳng đụng phải là Bầu trời (Trần ngang) hay Vách Mê Cung (Đứng thẳng)
                    if (diemCham.face && diemCham.face.normal) {
                        // Ép đổi trục Normal từ hệ tọa độ của bức tường ra ngoài Vũ trụ
                        let normalMatrix = new THREE.Matrix3().getNormalMatrix(diemCham.object.matrixWorld);
                        worldNormal = diemCham.face.normal.clone().applyMatrix3(normalMatrix).normalize();

                        // Nếu góc của mặt phẳng song song với trục đứng -> Nó là bức tường thẳng của Mê Cung!
                        let gocDot = Math.abs(worldNormal.dot(huongLen));
                        if (gocDot < 0.5) laVachTuong = true;
                    }

                    let tocDoChay = khoangCachBuffer - 2.0;
                    // 🌟 BẢN VÁ 3: Vách mê cung bóp Hitbox lại còn 0.4m (Lách qua hành lang 3m dư sức). Mây trời giữ nguyên Hitbox khổng lồ.
                    let bufferThucTe = laVachTuong ? (tocDoChay + 0.4) : khoangCachBuffer;

                    if (diemCham.distance < bufferThucTe) {
                        if (laVachTuong) {
                            // 🌟 BẢN VÁ 4: KỸ THUẬT TRƯỢT TƯỜNG KÉP (DOUBLE-CHECK SLIDING)
                            let huongTruot = huongDi.clone().projectOnPlane(worldNormal).normalize();

                            // Nếu húc vuông góc 90 độ thẳng mặt vào tường (hết đường trượt) -> Khóa chết đứng im
                            if (huongTruot.lengthSq() < 0.01) return true;

                            // 🕵️ Bắn Radar lần 2 theo Hướng Trượt để check xem có kẹt góc kẹt hẻm không!
                            window.radarBauTroi.set(diemBan, huongTruot);
                            let chamTruot = window.radarBauTroi.intersectObjects(window.danhSachBauTroi, true);

                            if (chamTruot.length > 0 && chamTruot[0].distance < (tocDoChay + 0.4)) {
                                // Phía trước là góc chữ V kẹt rồi -> Báo va chạm và Stop hoàn toàn chống lọt Map!
                                return true;
                            }

                            // Kênh trượt an toàn -> Cập nhật hướng đi thành hướng trượt dọc theo bức tường và cho đi tiếp!
                            huongDi.copy(huongTruot);
                            return false;
                        } else {
                            // Nếu là Bầu Trời thì dội ngược cực nhẹ 0.05m để không lọt vũ trụ
                            playerModel.position.add(huongDi.clone().negate().multiplyScalar(0.05));
                            if (!window.dangBaoBauTroi) {
                                window.dangBaoBauTroi = true;
                                if (typeof window.hienThongBaoBoGoc === 'function') window.hienThongBaoBoGoc("☁️ Cảnh báo: Chạm giới hạn Bầu Trời!", "#3498db");
                                setTimeout(() => window.dangBaoBauTroi = false, 2000);
                            }
                            return true; // Khóa lệnh
                        }
                    }
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

                var currentWalk = 0.1; var currentSprint = 0.2; var tangKhongGian = "VŨ TRỤ"; var mauChu = "#ff00ff";  
                // Thay vì đợi lên 5 mét, giờ chỉ cần cách đất 1.5 mét HOẶC đang đè phím Space là tự động tính là BAY!
                var isFlying = doCao > 1.5 || (window.keys && window.keys.space);

                // 🌍 Dưới 5m: Chạy bộ tà tà (0.2 - Khớp nhịp chân nhất)
                if (doCao <= 5.0) { currentWalk = 0.1; currentSprint = 0.2; tangKhongGian = "🌍 MẶT ĐẤT"; mauChu = "#00ff00"; }
                // ☁️ Từ 5m đến 500m: Vừa cất cánh (0.3)
                else if (doCao <= 500.0) { currentWalk = 0.15; currentSprint = 0.3; tangKhongGian = "☁️ TẦNG MÂY"; mauChu = "#00ffff"; }
                // ⚔️ Từ 500m đến 1000m: Bay tốc độ cao (0.6)
                else if (doCao <= 1000.0) { currentWalk = 0.3; currentSprint = 0.6; tangKhongGian = "⚔️ BẦU KHÍ QUYỂN"; mauChu = "#ffff00"; }
                // 🚀 Trên 1000m: Xé gió (1.0)
                else { currentWalk = 0.5; currentSprint = 1.0; tangKhongGian = "🚀 VŨ TRỤ SÂU"; mauChu = "#ff00ff"; }

                if (window.ROLE === 'admin' && tangKhongGian === "🚀 VŨ TRỤ SÂU") { currentWalk *= 15; currentSprint *= 15; }
                // 🌟 BẢN VÁ AAA: BƠM TỐC ĐỘ THÚ CƯỠI (1.1 = Tăng 10%)
                let heSoThuCuoi = window.TOC_DO_CHAY_CUA_TOI || 1.0;
                currentWalk *= heSoThuCuoi;
                currentSprint *= heSoThuCuoi;
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
                        // 🌟 CHUẨN HÓA ĐỒNG BỘ: CLICK CHUỘT CŨNG LÀ CHẠY BỘ
                        if (typeof playAnim === 'function') playAnim(isFlying ? 'BAY' : 'CHAYBO');



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
                        // 🌟 BẢN VÁ: NHẬN DIỆN "BAY FAKE" (Do mượn animation Chạy Bộ)
                        let laBayFake = (window.animationsMap && window.animationsMap['BAY'] === window.animationsMap['CHAYBO']);

                        if (isFlying && !laBayFake) {
                            // Nếu có cánh bay thật sự -> Giữ dáng bay lơ lửng
                            if (typeof playAnim === 'function') playAnim('BAY');
                        } else {
                            // Nếu bay fake hoặc đang ở mặt đất -> Đứng yên nhàn rỗi!
                            if (typeof playIdle === 'function') playIdle();
                        }
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
                var tamHanhTinh = new THREE.Vector3(0, 0, 0); // Lõi cố định của Trung Châu

                // 👑 TƯ DUY CỦA SẾP: CHỈ ĐỊNH TÂM HÀNH TINH BẰNG ID NHỎ NHẤT
                if (window.ZONE_ID !== 'TRUNG_CHAU' && window.THONG_TIN_CAC_MAP && window.THONG_TIN_CAC_MAP.length > 0) {
                    let minId = Infinity;
                    window.THONG_TIN_CAC_MAP.forEach(mapData => {
                        let currentId = parseInt(mapData.id);
                        if (currentId < minId) {
                            minId = currentId;
                            // Lấy chính xác tọa độ gốc của file tạo ra đầu tiên làm Tâm Trọng Lực
                            tamHanhTinh.set(parseFloat(mapData.pos_x), parseFloat(mapData.pos_y), parseFloat(mapData.pos_z));
                            hanhTinhGanNhat = mapData;
                        }
                    });
                }

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




                var currentWalk = 0.1; var currentSprint = 0.2; var tangKhongGian = "VŨ TRỤ"; var mauChu = "#ff00ff";  
                // Thay vì đợi lên 5 mét, giờ chỉ cần cách đất 1.5 mét HOẶC đang đè phím Space là tự động tính là BAY!
                var isFlying = doCao > 1.5 || (window.keys && window.keys.space);

                // 🌍 Dưới 5m: Chạy bộ tà tà (0.2)
                if (doCao <= 5.0 && timThayDat) { currentWalk = 0.1; currentSprint = 0.2; tangKhongGian = "🌍 MẶT ĐẤT"; mauChu = "#00ff00"; }
                // ☁️ Từ 5m đến 500m: Vừa cất cánh (0.3)
                else if (doCao <= 500.0 && timThayDat) { currentWalk = 0.15; currentSprint = 0.3; tangKhongGian = "☁️ TẦNG MÂY"; mauChu = "#00ffff"; }
                // ⚔️ Từ 500m đến 1000m: Bay tốc độ cao (0.6)
                else if (doCao <= 1000.0 && timThayDat) { currentWalk = 0.3; currentSprint = 0.6; tangKhongGian = "⚔️ BẦU KHÍ QUYỂN"; mauChu = "#ffff00"; }
                // 🚀 Trên 1000m: Xé gió (1.0)
                else { currentWalk = 0.5; currentSprint = 1.0; tangKhongGian = "🚀 VŨ TRỤ SÂU"; mauChu = "#ff00ff"; }

                if (window.ROLE === 'admin') { if (tangKhongGian === "🚀 VŨ TRỤ SÂU") { currentWalk *= 15; currentSprint *= 15; } }



                // 🌟 BẢN VÁ AAA: BƠM TỐC ĐỘ THÚ CƯỠI (1.1 = Tăng 10%)
                let heSoThuCuoi = window.TOC_DO_CHAY_CUA_TOI || 1.0;
                currentWalk *= heSoThuCuoi;
                currentSprint *= heSoThuCuoi;
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

                // 🌟 BẢN VÁ AAA: CẤT CÁNH LÀ BAY LUÔN, HẠ NGƯỠNG XUỐNG 1.5M
                isFlying = (doCao > 1.5) || dangChuDongDoiDoCao;
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
                        // 🌟 CHUẨN HÓA ĐỒNG BỘ: CLICK CHUỘT CŨNG LÀ CHẠY BỘ
                        if (typeof playAnim === 'function') playAnim(isFlying ? 'BAY' : 'CHAYBO');


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
                        // 🌟 BẢN VÁ: NHẬN DIỆN "BAY FAKE" 
                        let laBayFake = (window.animationsMap && window.animationsMap['BAY'] === window.animationsMap['CHAYBO']);

                        if (isFlying && !laBayFake) {
                            if (typeof playAnim === 'function') playAnim('BAY');
                        } else {
                            if (typeof playIdle === 'function') playIdle();
                        }
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
                // =====================================
                // 🌟 BẢN VÁ ĐẠI TÔNG SƯ: GỬI ĐÍCH DANH TÊN GỐC CỦA HOẠT ẢNH (CHỐNG AI ĐOÁN MÒ)
                // =====================================
                let tenAnimThucTe = 'IDLE';
                if (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") {
                    tenAnimThucTe = (window.currentActionChar && window.currentActionChar.getClip()) ? window.currentActionChar.getClip().name : (window.currentAnimNameChar || 'IDLE');
                } else {
                    tenAnimThucTe = (typeof currentAction !== 'undefined' && currentAction && currentAction.getClip()) ? currentAction.getClip().name : (currentAnimName || 'IDLE');
                }

                let isAnimChanged = tenAnimThucTe !== window.oldAnimLK;
                let lastSend = window.lastSendTime || 0;

                // 🌟 CHỐNG NÓNG MÁY MOBILE: Nới lỏng độ trễ mạng để Ăng-ten Wi-fi/4G được nghỉ ngơi
                let doTreMang = window.isMobile ? 150 : 80;
                if (!window.dangLuot && (now - lastSend > 3000 || ((isPosChanged || isAnimChanged) && now - lastSend > doTreMang))) {
                    window.oldAnimLK = tenAnimThucTe;
                    let animNguoiChoi = tenAnimThucTe; // Gửi thẳng tên gốc sang máy đối thủ!



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


// ==========================================
// 🌍 ĐỘNG CƠ STREAMING BẢN ĐỒ AAA  
// ==========================================
window.MAP_MIXERS = [];
window.THONG_TIN_CAC_MAP = []; // Kho chứa tọa độ, không tốn RAM

// 1. CHỈ LẤY TỌA ĐỘ TỪ SQL VỀ (KHÔNG TẢI 3D LÚC NÀY)
window.loadTatCaMapTuSQL = function (zoneId = window.ZONE_ID) {
    window.daNhanDanhSachMap = false;

    // 🛑 LÁ CHẮN 1: Ép kiểu chuỗi, cắt gọt mọi khoảng trắng rác
    if (!zoneId || String(zoneId).trim() === 'undefined' || zoneId === null || String(zoneId).trim() === '') {
        zoneId = 'TRUNG_CHAU';
    }
    zoneId = String(zoneId).trim().toUpperCase();
    window.ZONE_ID = zoneId; // Ép lưu lại vào sổ Nam Tào!

    // 🛑 LÁ CHẮN 2: Bơm thuốc nổ CHỐNG CACHE LITESPEED (v=Date.now)
    fetch('api/get_maps.php?zone=' + zoneId + '&v=' + Date.now()).then(res => res.json()).then(data => {

        if (window.ZONE_ID !== zoneId) {
            window.daNhanDanhSachMap = true;
            return;
        }

        if (data.status === 'success' && data.data) {
            window.THONG_TIN_CAC_MAP = data.data.map(m => ({
                ...m, isLoaded: false, isLoading: false, mesh3D: null, mixer: null, matDatMeshes: []
            }));

            // 🌟 LÁ CHẮN 3: CƯỠNG CHẾ VẬT LÝ TUYỆT ĐỐI (CẤM CÃI API)
            if (zoneId === 'TRUNG_CHAU') {
                window.KIEU_TRONG_LUC = 'CAU'; // TRUNG CHÂU ĐƯỢC BẢO VỆ TUYỆT ĐỐI!
            } else if (data.data.length > 0) {

                // ======================================================
                // 👑 TƯ DUY CỦA SẾP: TÌM THẰNG CÓ ID NHỎ NHẤT LÀM MAP CHÍNH (CHỈ DÙNG CHO BÍ CẢNH)
                // ======================================================
                let minId = Infinity;
                let kieuTrongLucChuan = 'PHANG';

                data.data.forEach(m => {
                    let currentId = parseInt(m.id);
                    // Kẻ nào sinh ra đầu tiên (ID nhỏ nhất) sẽ quyết định luật chơi của Bí Cảnh đó!
                    if (currentId < minId) {
                        minId = currentId;
                        if (m.gravity_type && String(m.gravity_type).trim() !== '') {
                            kieuTrongLucChuan = String(m.gravity_type).trim().toUpperCase();
                        }
                    }
                });

                window.KIEU_TRONG_LUC = kieuTrongLucChuan;
                window.toaDoMatDat = 0;
                // 🌟 TIÊU DIỆT BÓNG MA Ở ĐÂY:
                if (kieuTrongLucChuan === 'PHANG') window.TAM_HANH_TINH_HIEN_TAI = null;
                // ======================================================

            } else {
                window.KIEU_TRONG_LUC = 'PHANG';
                window.toaDoMatDat = 0;
                // 🌟 VÀ Ở ĐÂY NỮA:
                window.TAM_HANH_TINH_HIEN_TAI = null;
            }

            console.log(`🗺️ XUYÊN KHÔNG: Đã nạp khu vực [${zoneId}] - Trọng lực hiện tại: ${window.KIEU_TRONG_LUC}`);

            // 🌟 BẬT/TẮT TRÁI ĐẤT GỐC NGAY LẬP TỨC
            if (typeof window.kiemSoatHanhTinhGoc === 'function') window.kiemSoatHanhTinhGoc();
        }
        window.daNhanDanhSachMap = true;
    }).catch(err => {
        console.error("❌ Lỗi mạng khi gọi API Map:", err);
        window.daNhanDanhSachMap = true;
    });
};

// ==========================================
// 🛡️ BÁC SĨ TỰ CHỮA LÀNH TRỌNG LỰC (AUTO-HEALER V1.0)
// Ngay cả khi có thằng code nào khác (như lỗi Cổng Dịch Chuyển) cố tình bóp méo Map,
// Bác sĩ này sẽ tự động nắn lại gân cốt sau mỗi 1 giây!
// ==========================================
setInterval(() => {
    if (window.ZONE_ID && String(window.ZONE_ID).trim().toUpperCase() === 'TRUNG_CHAU') {
        if (window.KIEU_TRONG_LUC !== 'CAU') {
            window.KIEU_TRONG_LUC = 'CAU'; // Nắn xương sống!
            if (typeof window.kiemSoatHanhTinhGoc === 'function') window.kiemSoatHanhTinhGoc();
            console.log("🛠️ Bác sĩ AI: Đã tự động nắn lại Trọng Lực Hình Cầu cho Trung Châu!");
        }
    }
}, 1000);

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

        // ======================================================
        // 🛑 BẢN VÁ AAA: LÁ CHẮN CHỐNG RÁC XUYÊN KHÔNG GIAN
        // Kiểm tra xem lúc model 3D tải xong, Sếp còn ở Bí Cảnh cũ không?
        // Nếu Sếp đã truyền tống, mảng THONG_TIN_CAC_MAP đã reset -> Hủy ngay!
        // ======================================================
        let vanConHopLe = window.THONG_TIN_CAC_MAP && window.THONG_TIN_CAC_MAP.some(m => m.id === mapData.id);
        if (!vanConHopLe) {
            console.warn(`🛑 Cổng Xuyên Không: Đã chặn Map rác [${mapData.name || mapData.id}] do Sếp đã dịch chuyển sang nơi khác!`);
            // Vứt ngay cái mô hình vừa tải vào Lò Đốt Rác VRAM để không gây nặng máy
            if (typeof window.donRac3D === 'function') window.donRac3D(gltf.scene);
            return; // Quay xe, từ chối xuất xưởng vào màn hình!
        }
        // ======================================================

        let mapMesh = gltf.scene;
        // 🌟 CẬP NHẬT BÁN KÍNH MỚI: 10.000m
        let rHanhTinh = window.BAN_KINH_HANH_TINH_HIEN_TAI || 10000.0;
        let tamHanhTinh = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0, 0, 0);


        // Đặt vị trí
        mapMesh.position.set(parseFloat(mapData.pos_x), parseFloat(mapData.pos_y), parseFloat(mapData.pos_z));

        // 👑 TƯ DUY CỦA SẾP: PHÂN BIỆT RẠCH RÒI MAP CHÍNH VÀ MAP CON BẰNG ID
        let laMapChinh = false;
        if (window.ZONE_ID !== 'TRUNG_CHAU') {
            let minIdToanMap = Infinity;
            window.THONG_TIN_CAC_MAP.forEach(m => {
                let currentId = parseInt(m.id);
                if (currentId < minIdToanMap) minIdToanMap = currentId;
            });
            // Nếu Map đang load có ID bằng ID nhỏ nhất toàn khu vực -> Nó là Vua!
            if (parseInt(mapData.id) === minIdToanMap) laMapChinh = true;
        } else {
            // Ở Trung Châu thì mọi map rải thêm đều là Map Con (Bị bẻ cong theo Trái Đất gốc)!
            laMapChinh = false;
        }

        // 🌟 BẢN VÁ LẬT NGƯỢC MAP: Chỉ những Map Con mới bị hút chĩa thẳng theo lực hấp dẫn!
        // Hành Tinh Chính thì đứng trang nghiêm, không bị bẻ cong đi đâu hết!
        if (window.KIEU_TRONG_LUC !== 'PHANG' && !laMapChinh) {
            let huongLenGoc = mapMesh.position.clone().sub(tamHanhTinh);
            if (huongLenGoc.lengthSq() < 0.001) huongLenGoc.set(0, 1, 0); else huongLenGoc.normalize();
            mapMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenGoc);
        }

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
window.xuLyXoaMapChunk = function (mapData) {
    if (!mapData || !mapData.isLoaded) return;

    // 1. Gỡ bỏ các tấm lưới của Map này khỏi danh sách Radar
    if (window.danhSachMap && mapData.matDatMeshes) {
        window.danhSachMap = window.danhSachMap.filter(m => !mapData.matDatMeshes.includes(m));
    }
    
    // 🌟 BẢN VÁ AAA: NHỔ CỎ TẬN GỐC VÁCH NGĂN VÀ MÂY BÍ CẢNH CŨ (Chống lồng ghép Trường Lực Tàng Hình)
    if (window.danhSachBauTroi && mapData.mayMeshes) {
        window.danhSachBauTroi = window.danhSachBauTroi.filter(m => !mapData.mayMeshes.includes(m));
    }

    // 2. Dọn dẹp Animation của Map
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
    mapData.mayMeshes = [];
    mapData.mixer = null;
    console.log(`🔴 THẾ GIỚI MỞ: Đã giải phóng RAM khu vực [${mapData.name || mapData.id}]!`);
};



// 3.B HÀM THIÊU RỤI BOSS KHỎI RAM ĐỘC LẬP (UNLOAD BOSS)
window.xuLyXoaBossOxa = function () {
    let maxDistToKeep = window.isMobile ? 1800 : 2500;

    for (let i = window.danhSachQuaiVat.length - 1; i >= 0; i--) {
        let quai = window.danhSachQuaiVat[i];
        if (!quai || !quai.mesh) continue;
        
        // Cứ vượt quá 2500m là thiêu rụi hết để giải phóng RAM, không tha 1 ai!
        let khoangCach = playerModel.position.distanceTo(quai.mesh.position);

        if (khoangCach > maxDistToKeep) {
            if (window.aiWorkers) {
                let workerIndex = i % window.MAX_WORKERS;
                if (window.aiWorkers[workerIndex]) window.aiWorkers[workerIndex].postMessage({ type: 'REMOVE_BOSS', id: quai.id });
            }
            if (quai.tagEl) quai.tagEl.remove();
            if (quai.mesh) {
                if (typeof window.donRac3D === 'function') window.donRac3D(quai.mesh);
                else scene.remove(quai.mesh);
            }
            window.danhSachQuaiVat.splice(i, 1);
            console.log(`🔴 Đã dọn dẹp Boss [${quai.id}] ở xa để giải phóng RAM!`);
        }
    }
};

// 4. VÒNG LẶP SINH TỬ (RADAR QUÉT KHOẢNG CÁCH MỖI 2 GIÂY)
setInterval(() => {
    if (typeof playerModel === 'undefined' || !playerModel) return;

    // 🌟 1. CHẠY LÒ ĐỐT RÁC BOSS ĐỘC LẬP MỖI 2S
    if (window.danhSachQuaiVat && window.danhSachQuaiVat.length > 0) {
        window.xuLyXoaBossOxa();
    }

    if (!window.THONG_TIN_CAC_MAP || window.THONG_TIN_CAC_MAP.length === 0) return;

    let pPos = playerModel.position;

    window.THONG_TIN_CAC_MAP.forEach(mapData => {
        let mPos = new THREE.Vector3(parseFloat(mapData.pos_x), parseFloat(mapData.pos_y), parseFloat(mapData.pos_z));
        let khoangCach = pPos.distanceTo(mPos);
        
        // 🌟 ĐỒNG BỘ THƯỚC ĐO: Load Boss ở 2000m, Xóa ở 2500m (Chống nấc cụt)
        let rBoss = window.isMobile ? 1200 : 2000;    
        let rLoad = window.isMobile ? 2000 : 3500;    
        let rUnload = window.isMobile ? 3000 : 5000;  

        if (khoangCach < rLoad && !mapData.isLoaded && !mapData.isLoading) {
            window.xuLyLoadMapChunk(mapData);
        }
        if (khoangCach < rBoss && mapData.isLoaded && !mapData.daLoadBoss) {
            if (typeof window.taiBossTheoMap === 'function') {
                window.taiBossTheoMap(mapData.id);
                mapData.daLoadBoss = true;
            }
        }
        if (khoangCach > rUnload && mapData.isLoaded) {
            window.xuLyXoaMapChunk(mapData);
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
        window.room.localParticipant.publishData = function (payload, options) {
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
            ► Tốc độ Gửi: <b style="color:${mauGui}">${guiKB} KB/s</b> <span style="font-size:11px; color:#888;">(Tổng: ${(tongDungLuongGui / 1024).toFixed(1)} KB)</span><br>
            ► Tốc độ Nhận: <b style="color:${mauNhan}">${nhanKB} KB/s</b> <span style="font-size:11px; color:#888;">(Tổng: ${(tongDungLuongNhan / 1024).toFixed(1)} KB)</span><br>
            
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
window.batDauSetSafeZone = function () {
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
window.huySetSafeZone = function () {
    window.isSettingSafeZone = false;
    if (window.vongTronSafeZone) window.vongTronSafeZone.visible = false;
    document.getElementById('panelSaveSafeZone').style.display = 'none';
};

// 3. 🌟 HÀM TẠO BẢNG NEON 3D VÀ MŨI TÊN CHỈ XUỐNG (KHÔNG CẦN FONT)
window.taoBienNeonSafeZone = function (x, y, z) {
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
    let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0, 0, 0);

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
window.luuSafeZoneMoi = function () {
    let fd = new FormData();
    fd.append('x', window.toaDoTamĐangĐo.x);
    fd.append('y', window.toaDoTamĐangĐo.y);
    fd.append('z', window.toaDoTamĐangĐo.z);
    fd.append('radius', window.banKinhĐangĐo);
    // 🌟 THÊM DÒNG NÀY:
    fd.append('zone_id', window.ZONE_ID || 'TRUNG_CHAU');
    fetch('api/save_safezone.php', { method: 'POST', body: fd })
        .then(res => res.json()).then(data => {
            if (data.status === 'success') {
                alert("✔️ Đã lập Safe Zone thành công!");
                window.taoBienNeonSafeZone(window.toaDoTamĐangĐo.x, window.toaDoTamĐangĐo.y, window.toaDoTamĐangĐo.z);
                window.DANH_SACH_SAFE_ZONE.push({ x: window.toaDoTamĐangĐo.x, y: window.toaDoTamĐangĐo.y, z: window.toaDoTamĐangĐo.z, radius: window.banKinhĐangĐo });
                window.huySetSafeZone();
            } else alert("Lỗi: " + data.msg);
        });
};

// 5. Hàm kiểm tra bảo vệ (Code chặn đánh nhau như ở đợt trước)
window.kiemTraSafeZone = function (pos) {
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

    return sprite; // 🌟 BẢN VÁ: Bắt buộc trả về để Cỗ máy Dọn Rác nhận diện được!
};

// 2. Hàm giả lập nhét Cổng vào Map
window.khoiTaoMotCong = function (data) {
    // Sếp dùng GLTFLoader để load data.model_url giống như load Map
};

// 3. Hàm Xé Rách Hư Không (Dịch Chuyển) - BẢN VÁ BẤT TỬ V4 (CHỐNG CRASH NULL)
window.thucHienTruyenTong = function (congData) {
    if (window.dangDichChuyen || !playerModel) return;
    window.dangDichChuyen = true;



    // ==========================================
    // 🏆 CẢM BIẾN VƯỢT ẢI MÊ CUNG CHUẨN AAA (BẢN VÁ BÁO LỖI)
    // ==========================================
    let mapHienTai = String(window.ZONE_ID || '');
    let mapDichDen = String(congData.zone_dich_den || '');

    let matchHienTai = mapHienTai.match(/LV\s*(\d+)/i);
    let matchDichDen = mapDichDen.match(/LV\s*(\d+)/i);

    if (matchHienTai && matchDichDen) {
        let lvHienTai = parseInt(matchHienTai[1]);
        let lvDichDen = parseInt(matchDichDen[1]);

        if (lvDichDen === lvHienTai + 1) {
            let fd = new FormData();
            fd.append('level_vua_qua', lvHienTai);

            fetch('api/finish_maze.php', { method: 'POST', body: fd })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        if (typeof window.taoChuNoiGacha === 'function') {
                            window.taoChuNoiGacha(playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), "🎉 VƯỢT ẢI " + lvHienTai + " THÀNH CÔNG!", "#f1c40f");
                            setTimeout(() => window.taoChuNoiGacha(playerModel.position.clone().add(new THREE.Vector3(0, 7, 0)), "📮 CÓ THƯ MỚI!", "#00ffcc"), 300);
                        }
                        let badge = document.getElementById('mailBadgeUI');
                        if (badge) { badge.style.display = 'block'; badge.innerText = "!"; }
                    } else {
                        // 🌟 BẢN VÁ TỐI THƯỢNG: BUỘC GAME PHẢI GÀO LÊN NẾU BỊ TỪ CHỐI
                        if(typeof window.hienThongBaoBoGoc === 'function') {
                            window.hienThongBaoBoGoc("⚠️ " + data.msg, "#e74c3c");
                        } else {
                            alert("⚠️ LỖI: " + data.msg);
                        }
                    }
                }).catch(e => console.error("Lỗi báo cáo vượt ải:", e));
        }
    }
    // ==========================================

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
        manHinhDichChuyen.style.display = 'block';
    }

    setTimeout(() => {

        let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0, 0, 0);
        let huongLenTroiMoi = congData.dest.clone().sub(tam);

        if (huongLenTroiMoi.lengthSq() < 0.001) {
            huongLenTroiMoi.set(0, 1, 0);
        } else {
            huongLenTroiMoi.normalize();
        }

        let viTriAnToan = congData.dest.clone().add(huongLenTroiMoi.clone().multiplyScalar(15.0));
        playerModel.position.copy(viTriAnToan);

        playerModel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenTroiMoi);
        playerModel.up.copy(huongLenTroiMoi);
        window.mucTieuBanKinhDat = tam.distanceTo(congData.dest);

        window.isMoving = false;
        window.isKeyboardMoving = false;

        window.KIEU_TRONG_LUC = 'PHANG';
        window.toaDoMatDat = viTriAnToan.y;
        if (typeof window.kiemSoatHanhTinhGoc === 'function') window.kiemSoatHanhTinhGoc();




        // ========================================================
        // 🌟 THÊM MỚI VÀO ĐÂY: CHỐT LƯU TỌA ĐỘ VÀ ZONE LÀM ĐIỂM HỒI SINH TẠI MAP MỚI
        // ========================================================
        // 1. Cập nhật thẳng vào RAM để nếu chết ở Session này thì hồi sinh ngay tại Cổng
        window.SPAWN_X = viTriAnToan.x;
        window.SPAWN_Y = viTriAnToan.y;
        window.SPAWN_Z = viTriAnToan.z;
        window.ZONE_ID = congData.zone_dich_den || 'TRUNG_CHAU';

        // 2. Gửi Cấp báo lên SQL để lần sau F5 vào game cũng xuất hiện ngay tại Cổng này
        let fd = new FormData();
        fd.append('x', viTriAnToan.x.toFixed(2));
        fd.append('y', viTriAnToan.y.toFixed(2));
        fd.append('z', viTriAnToan.z.toFixed(2));
        fd.append('zone_id', window.ZONE_ID);
        fetch('api/save_pos.php', { method: 'POST', body: fd }).catch(e => {});
        // ========================================================




        // ========================================================
        // 🧨 THIÊU RỤI HOÀN TOÀN THẾ GIỚI CŨ (Rút ống thở VRAM)
        // ========================================================
        if (window.THONG_TIN_CAC_MAP) {
            window.THONG_TIN_CAC_MAP.forEach(mapData => {
                if (typeof window.xuLyXoaMapChunk === 'function') window.xuLyXoaMapChunk(mapData);
            });
        }
        window.THONG_TIN_CAC_MAP = [];

        if (window.danhSachQuaiVat) {
            for (let i = window.danhSachQuaiVat.length - 1; i >= 0; i--) {
                let quai = window.danhSachQuaiVat[i];
                if (quai.tagEl) quai.tagEl.remove();
                if (typeof window.donRac3D === 'function') window.donRac3D(quai.mesh);
            }
            window.danhSachQuaiVat = [];
        }

        if (window.remotePlayers) {
            for (let id in window.remotePlayers) {
                let rp = window.remotePlayers[id];
                if (rp.mesh) {
                    if (rp.mesh.parent) rp.mesh.parent.remove(rp.mesh);
                    scene.remove(rp.mesh);
                }
                if (rp.tag) rp.tag.remove();
            }
            window.remotePlayers = {};
        }

        window.ZONE_ID = congData.zone_dich_den || 'TRUNG_CHAU';

        playerModel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLenTroiMoi);
        playerModel.up.copy(huongLenTroiMoi);
        window.mucTieuBanKinhDat = tam.distanceTo(congData.dest);

        window.loadTatCaMapTuSQL(window.ZONE_ID);
        window.loadSafeZonesVaTeleports();

        let thoiGianCho = 0;
        let vongLapChoMap = setInterval(() => {
            thoiGianCho += 500;

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

            if ((window.daNhanDanhSachMap && !coMapDangLoad && coMapDaLoad) ||
                (window.daNhanDanhSachMap && window.THONG_TIN_CAC_MAP.length === 0) ||
                thoiGianCho >= 30000) {

                clearInterval(vongLapChoMap);
                if (manHinhDichChuyen) manHinhDichChuyen.style.display = 'none';
                window.dangDichChuyen = false;
                console.log("👁️ ĐÃ MỞ MẮT: Toàn bộ Map khu vực đã đúc xong, sãn sàng chiến đấu!");
            }
        }, 500);

    }, 500);
};

// =======================================================
// 🌟 HÀM TẢI CỔNG DỊCH CHUYỂN VÀ SAFE ZONE
// =======================================================
window.hienThongBaoBoGoc = function (msg, mauSac) {
    let div = document.createElement('div'); div.innerText = msg; div.style.position = 'fixed'; div.style.top = '120px'; div.style.left = '50%'; div.style.transform = 'translateX(-50%)'; div.style.background = 'rgba(0,0,0,0.8)'; div.style.color = mauSac || '#fff'; div.style.padding = '10px 20px'; div.style.borderRadius = '5px'; div.style.border = '1px solid ' + (mauSac || '#fff'); div.style.zIndex = '999999'; div.style.fontWeight = 'bold'; document.body.appendChild(div);
    setTimeout(() => { div.remove(); }, 2000);
};

window.loadSafeZonesVaTeleports = function () {
    let currentZone = window.ZONE_ID || 'TRUNG_CHAU';

    // 🌟 1. DỌN SẠCH TÀN DƯ BẢNG TÊN NEON VÀ CỔNG MAP CŨ
    if (window.vongTronSafeZone) window.vongTronSafeZone.visible = false;
    window.DANH_SACH_SAFE_ZONE = [];

    if (window.DANH_SACH_BIEN_SAFE_ZONE) {
        window.DANH_SACH_BIEN_SAFE_ZONE.forEach(s => { if (typeof window.donRac3D === 'function') window.donRac3D(s); else scene.remove(s); });
        window.DANH_SACH_BIEN_SAFE_ZONE = [];
    }

    if (window.DANH_SACH_CONG) {
        window.DANH_SACH_CONG.forEach(c => {
            if (typeof window.donRac3D === 'function') window.donRac3D(c.mesh); else scene.remove(c.mesh);
            // Tiêu diệt Bảng Tên Neon lơ lửng
            if (c.sprite) { if (typeof window.donRac3D === 'function') window.donRac3D(c.sprite); else scene.remove(c.sprite); }
        });
    }
    window.DANH_SACH_CONG = [];
    window.TELEPORT_MIXERS = [];

    // 🌟 2. BÍ THUẬT CHỐNG CHỒNG MAP MẠNG CHẬM
    fetch('api/get_safezones.php?zone=' + currentZone + '&v=' + Date.now()).then(res => res.json()).then(data => {
        // LÁ CHẮN: Nếu mạng lag trả data về chậm mà Sếp đã bay sang Map khác rồi thì VỨT!
        if (window.ZONE_ID !== currentZone) return;

        if (data.status === 'success' && data.data) {
            window.DANH_SACH_SAFE_ZONE = data.data.map(sz => ({ x: parseFloat(sz.pos_x), y: parseFloat(sz.pos_y), z: parseFloat(sz.pos_z), radius: parseFloat(sz.radius) }));
            window.DANH_SACH_SAFE_ZONE.forEach(sz => { if (typeof window.taoBienNeonSafeZone === 'function') window.taoBienNeonSafeZone(sz.x, sz.y, sz.z); });
        }
    });

    fetch('api/get_teleports.php?zone=' + currentZone + '&v=' + Date.now()).then(res => res.json()).then(data => {
        // LÁ CHẮN: Chống chồng Map Cổng
        if (window.ZONE_ID !== currentZone) return;

        if (data.status === 'success' && data.data) {
            data.data.forEach(tp => {
                if (!tp.model_url || tp.model_url.trim() === '') return;

                let dest = new THREE.Vector3(parseFloat(tp.dest_x), parseFloat(tp.dest_y), parseFloat(tp.dest_z));
                let pos = new THREE.Vector3(parseFloat(tp.pos_x), parseFloat(tp.pos_y), parseFloat(tp.pos_z));

                if (window.loaderSieuToc) {
                    window.loaderSieuToc.load(tp.model_url, function (gltf) {

                        // 🛑 KIỂM TRA LẦN CUỐI: Khi Model 3D tải xong, Sếp còn ở Map này không?
                        if (window.ZONE_ID !== currentZone) {
                            if (typeof window.donRac3D === 'function') window.donRac3D(gltf.scene);
                            return; // Xóa sổ ngay lập tức, từ chối đưa ra Map!
                        }

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

                        mesh.traverse(c => { if (c.isMesh) c.frustumCulled = false; });
                        congGroup.add(mesh);
                        scene.add(congGroup);

                        if (gltf.animations && gltf.animations.length > 0) {
                            let mixer = new THREE.AnimationMixer(mesh);
                            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
                            if (!window.TELEPORT_MIXERS) window.TELEPORT_MIXERS = [];
                            window.TELEPORT_MIXERS.push(mixer);
                        }

                        // 🌟 Lưu lại Sprite (Bảng Tên Neon) vào mảng để sau này có cái mà đốt rác!
                        let tenSprite = null;
                        if (typeof window.taoBienTenCong === 'function') {
                            tenSprite = window.taoBienTenCong(tp.ten_dich_den, pos.x, pos.y, pos.z);
                        }
                        window.DANH_SACH_CONG.push({ mesh: congGroup, sprite: tenSprite, dest: dest, name: tp.ten_dich_den, zone_dich_den: tp.zone_dich_den });
                    });
                }
            });
        }
    });
};

window.taoBienNeonSafeZone = function (x, y, z) {
    let canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    let ctx = canvas.getContext('2d');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowBlur = 30; ctx.shadowColor = '#00ffcc'; ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px sans-serif'; ctx.fillText('SAFE ZONE', 512, 180);
    ctx.shadowColor = '#ffcc00'; ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 180px sans-serif'; ctx.fillText('⬇', 512, 350);

    let tex = new THREE.CanvasTexture(canvas);
    let mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    let sprite = new THREE.Sprite(mat);

    let pos = new THREE.Vector3(x, y, z);
    let tam = window.TAM_HANH_TINH_HIEN_TAI || new THREE.Vector3(0, 0, 0);
    let groundDir = new THREE.Vector3(0, 1, 0);
    if (window.KIEU_TRONG_LUC !== 'PHANG') {
        groundDir = pos.clone().sub(tam);
        if (groundDir.lengthSq() < 0.001) groundDir.set(0, 1, 0); else groundDir.normalize();
    }
    sprite.position.copy(pos).add(groundDir.multiplyScalar(300));
    sprite.scale.set(800, 400, 1);
    scene.add(sprite);

    // 🌟 Đưa vào sổ Nam Tào dọn rác
    if (!window.DANH_SACH_BIEN_SAFE_ZONE) window.DANH_SACH_BIEN_SAFE_ZONE = [];
    window.DANH_SACH_BIEN_SAFE_ZONE.push(sprite);
};






// ==========================================
// 🌟 MÁY ĐỒNG BỘ & TỰ ĐỘNG HỒI SINH BOSS TỪ SERVER (HEARTBEAT 10s)
// ==========================================

// 🌟 BỘ NÃO TIÊN TRI: TÍNH TRƯỚC TỌA ĐỘ VỆ TINH TOÁN HỌC (TRANG_TRI) DÙ CHƯA RENDER
window.duDoanToaDoTrangTri = function(bossId, spawnX, spawnY, spawnZ) {
    let spawnPos = new THREE.Vector3(spawnX, spawnY, spawnZ);
    let hash = 0; let strId = String(bossId);
    for (let i = 0; i < strId.length; i++) hash = Math.imul(31, hash) + strId.charCodeAt(i) | 0;
    let seedToanHoc = (Math.abs(hash) % 10000) / 10000; 
    
    let banKinhBay = 3000 + (seedToanHoc * 3000); 
    let tocDoGoc = 0.005 + (seedToanHoc * 0.01); 
    let chieuThuan = (seedToanHoc > 0.5) ? 1 : -1; 
    let doCaoNhaoLon = 50 + (seedToanHoc * 250); 
    
    let tChung = Date.now() / 1000;
    let goc = (tChung * tocDoGoc * chieuThuan) + (seedToanHoc * Math.PI * 2);
    let kq = new THREE.Vector3();
    
    if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
        let tam = window.TAM_HANH_TINH_HIEN_TAI;
        let R_matDat = spawnPos.distanceTo(tam); 
        let vUp = spawnPos.clone().sub(tam).normalize();
        
        let right = new THREE.Vector3(1, 0, 0).cross(vUp).normalize();
        if (right.lengthSq() < 0.001) right.set(0, 0, 1).cross(vUp).normalize();
        let forward = new THREE.Vector3().crossVectors(right, vUp).normalize();
        
        let qX = new THREE.Quaternion().setFromAxisAngle(forward, goc);
        let qZ = new THREE.Quaternion().setFromAxisAngle(right, -(goc * 0.8));
        
        let finalDir = vUp.clone().applyQuaternion(qX).applyQuaternion(qZ).normalize();
        let heightOffset = Math.abs(Math.sin(goc * 1.5)) * doCaoNhaoLon;
        kq.copy(tam).add(finalDir.multiplyScalar(R_matDat + heightOffset));
    } else {
        let maxFlat = 4000; 
        let dx = Math.sin(goc) * Math.min(banKinhBay, maxFlat);
        let dz = Math.cos(goc * 0.8) * Math.min(banKinhBay, maxFlat);
        let dy = Math.abs(Math.sin(goc * 1.5)) * doCaoNhaoLon;
        kq.set(spawnPos.x + dx, spawnPos.y + dy, spawnPos.z + dz);
    }
    return kq;
};

setInterval(() => {
    if (!window.playerModel || typeof window.danhSachQuaiVat === 'undefined') return;

    let currentZone = window.ZONE_ID || 'TRUNG_CHAU';
    fetch('api/get_bosses.php?zone=' + currentZone + '&v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.data) {

                data.data.forEach(bossServer => {
                    if (bossServer.hp > 0) {
                        // Lá chắn xuyên không gian
                        if (bossServer.zone_id && bossServer.zone_id !== window.ZONE_ID) return;
                        
                        let tonTaiTrenClient = window.danhSachQuaiVat.find(q => q.id == bossServer.id);

                        if (!tonTaiTrenClient) {
                            
                            // 🌟 BẢN VÁ AAA: DÙNG TRẠM DỰ ĐOÁN ĐỂ TÍNH VỊ TRÍ "THỰC TẾ" CỦA CÁ VOI LÚC NÀY
                            let bossPos;
                            if (bossServer.class_code === 'TRANG_TRI') {
                                bossPos = window.duDoanToaDoTrangTri(bossServer.id, parseFloat(bossServer.pos_x), parseFloat(bossServer.pos_y), parseFloat(bossServer.pos_z));
                            } else {
                                bossPos = new THREE.Vector3(parseFloat(bossServer.pos_x), parseFloat(bossServer.pos_y), parseFloat(bossServer.pos_z));
                            }

                            let khoangCach = window.playerModel.position.distanceTo(bossPos);
                            let maxDistRespawn = window.isMobile ? 1200 : 2000; // Load ở 2000m (Khớp với rBoss)
                            
                            // 🌟 KẾT QUẢ ĐỈNH CAO: Chỉ gọi ra khi con cá voi thực sự đang bơi vào tầm 2000m của Sếp!
                            if (khoangCach < maxDistRespawn) {
                                console.log(`✨ Cảnh vật xuất hiện! [${bossServer.name}] đã lọt vào tầm nhìn!`);
                                if (typeof window.sinhRaQuaiVat === 'function') {
                                    window.sinhRaQuaiVat(
                                        parseFloat(bossServer.pos_x), // Vẫn đưa tọa độ Gốc vào để quỹ đạo cá voi chạy chuẩn!
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
        }).catch(err => {});
}, 10000);



// =================================================================
// 🤖 AUTO HUNT V17: ĐA MÔN PHÁI (TẦM XA & CẬN CHIẾN)
// =================================================================
if (window.botAutoTimer) clearInterval(window.botAutoTimer);
window.isAutoAFK = false;
window.tamQuetMax = 10000;
window.botMucTieuId = null;
window.botState = 'IDLE';
// Mặc định cho phái viễn chiến (Đánh xa)
window.tamXaXungDot = 45;
window.tamDungHinh = 40;
window.toggleAutoTreoMay = function () {
    window.isAutoAFK = !window.isAutoAFK;
    let btn = document.getElementById('btnAutoAFK');
    let txt = document.getElementById('textAuto');
    if (window.isAutoAFK) {
        btn.style.borderColor = '#2ecc71';
        btn.style.boxShadow = '0 0 15px #2ecc71';
        txt.innerText = 'Auto: BẬT';
        txt.style.color = '#2ecc71';
        if (typeof window.taoSoSatThuong === 'function' && window.playerModel) {
            window.taoSoSatThuong(window.playerModel.position.clone(), "AUTO AFK: BẮT ĐẦU!", '#2ecc71');
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
    // 🌟 BẢN VÁ AAA: NHẬN DIỆN CẬN CHIẾN ĐỂ THU HẸP TẦM ĐÁNH
    let laCanChien = window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_luyenthe');
    let RANGE_CHASE = laCanChien ? 20 : window.tamXaXungDot;  // 🌟 Thu hẹp: Boss văng 20m là lết theo
    let RANGE_STOP = laCanChien ? 12 : window.tamDungHinh;    // 🌟 Thu hẹp: Chạy vào sát nách 12m mới tung chiêu Lướt
    // --- BƯỚC 1: KIỂM TRA MỒI CŨ ---
    if (window.botMucTieuId) {
        quaiTotNhat = mangQuai.find(q => q.id === window.botMucTieuId);
        if (quaiTotNhat) {
            let hopLe = (!quaiTotNhat.death_time || quaiTotNhat.death_time == 0 || quaiTotNhat.death_time === "0");
            if (quaiTotNhat.hp <= 0 || quaiTotNhat.isDead || (quaiTotNhat.mesh && quaiTotNhat.mesh.userData.ignore) || !hopLe || nvc.position.distanceTo(quaiTotNhat.mesh.position) > window.tamQuetMax) {
                quaiTotNhat = null; window.botMucTieuId = null;
            }
        } else { window.botMucTieuId = null; }
    }

    // --- BƯỚC 2: TÌM MỒI MỚI ---
    if (!quaiTotNhat) {
        let khoangCachMin = window.tamQuetMax;
        mangQuai.forEach(q => {
            if (q && q.mesh && q.hp > 0 && !q.isDead && !q.mesh.userData.ignore) {
                let hopLe = (!q.death_time || q.death_time == 0 || q.death_time === "0");
                if (hopLe) {
                    let d = nvc.position.distanceTo(q.mesh.position);
                    if (d < khoangCachMin) { khoangCachMin = d; quaiTotNhat = q; }
                }
            }
        });
        if (quaiTotNhat) { window.botMucTieuId = quaiTotNhat.id; window.botState = 'CHASING'; }
    }

    // --- BƯỚC 3: CHIẾN THUẬT TÙY MÔN PHÁI ---
    if (quaiTotNhat) {
        let targetPos = quaiTotNhat.mesh.position.clone();
        let dist = nvc.position.distanceTo(targetPos);

        window.mucTieuHienTai = quaiTotNhat;
        if (window.vongMucTieu) window.vongMucTieu.visible = true;

        // CHỐNG GIẬT ANIMATION: Nhận diện Luyện Thể đang Lướt (Dash/Hit)
        let dangLuotLT = laCanChien && window.trangThaiLT && window.trangThaiLT.state !== 'IDLE';
        if (dangLuotLT) { window.dangMuaChieu = true; }

        if (window.botState === 'CHASING') {
            if (dist > RANGE_STOP && !dangLuotLT) {
                window.targetPosition.copy(targetPos);
                window.isMoving = true;
            } else {
                window.botState = 'ATTACKING';
                window.isMoving = false;
            }
        }
        else if (window.botState === 'ATTACKING') {
            if (dist > RANGE_CHASE && !dangLuotLT) {
                window.botState = 'CHASING';
                window.targetPosition.copy(targetPos);
                window.isMoving = true;
            } else {
                if (!dangLuotLT) window.isMoving = false;

                if (!dangLuotLT) {
                    let huongNhin = new THREE.Vector3().subVectors(targetPos, nvc.position).projectOnPlane(nvc.up).normalize();
                    let targetMat = new THREE.Matrix4().lookAt(nvc.position, nvc.position.clone().sub(huongNhin), nvc.up);
                    nvc.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.3);
                }




                // 🌟 TỰ ĐỘNG BẤM SKILL (BẢN VÁ AAA: VÒNG LẶP COMBO & QUÉT HỒI CHIÊU TỪ UI)
                let now = Date.now();

                // ⏱️ CHỜ MÚA CHIÊU: Luyện Thể 2 giây, Phái khác 1.5 giây
                let delaySpam = laCanChien ? 2000 : 1500;

                // 🛡️ Khởi tạo bộ nhớ cho Bot nếu chưa có
                if (typeof window.thoiGianSpam === 'undefined' || isNaN(window.thoiGianSpam)) window.thoiGianSpam = 0;
                if (typeof window.botComboIndex === 'undefined') window.botComboIndex = 0; // Biến nhớ vị trí chiêu (Q, E, R, F)

                // ⏳ Đã múa xong (đủ 2s hoặc 1.5s) -> Bắt đầu quét chiêu mới
                if (now - window.thoiGianSpam > delaySpam && !dangLuotLT) {

                    let keys = ['Q', 'E', 'R', 'F'];
                    let chieuDuocChon = null;

                    // 🔍 BỘ QUÉT THÔNG MINH: Quét 1 vòng (4 phím) tìm chiêu đang sáng đèn
                    for (let i = 0; i < 4; i++) {
                        let testKey = keys[window.botComboIndex];

                        // "Hỏi thăm" cái nút UI trên màn hình xem nó có đang bị khóa đếm ngược không
                        let btn = document.getElementById('btn' + testKey) || document.getElementById('skill' + testKey);
                        let dangHoiChieu = false;
                        if (btn && btn.style.pointerEvents === 'none') {
                            dangHoiChieu = true;
                        }

                        // Lên đạn cho nhịp quét tiếp theo (Tròn vòng Q -> E -> R -> F -> Q)
                        window.botComboIndex++;
                        if (window.botComboIndex > 3) window.botComboIndex = 0;

                        // Nếu chiêu này SÁNG (Không bị khóa) -> Chốt đơn và thoát vòng quét!
                        if (!dangHoiChieu) {
                            chieuDuocChon = testKey;
                            break;
                        }
                    }

                    // 🎯 TÌM THẤY CHIÊU HỒI XONG -> TUNG RA NGAY LẬP TỨC!
                    if (chieuDuocChon !== null) {
                        window.thoiGianSpam = now; // Cập nhật lại đồng hồ chờ múa
                        window.mucTieuHienTai = quaiTotNhat;

                        // 👉 KÍCH HOẠT TUYỆT CHIÊU
                        if (window.HePhaiHienTai && typeof window.HePhaiHienTai.tungChieu === 'function') {
                            window.HePhaiHienTai.tungChieu(chieuDuocChon, false);
                        } else {
                            document.dispatchEvent(new KeyboardEvent('keydown', { key: chieuDuocChon, code: 'Key' + chieuDuocChon, bubbles: true }));
                            setTimeout(() => document.dispatchEvent(new KeyboardEvent('keyup', { key: chieuDuocChon, code: 'Key' + chieuDuocChon, bubbles: true })), 100);
                        }
                    }
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

            if (isVisible) {
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
            if (truc.parent) truc.parent.remove(truc);
            if (truc.geometry) truc.geometry.dispose();
            if (truc.material) truc.material.dispose();
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
                if (typeof window.hienThongBaoBoGoc === 'function') window.hienThongBaoBoGoc("👁️ MẮT THẦN: Đã bật X-Quang (Tầm nhìn 50m)!", "#00ffcc");
            } else {
                if (matThanInterval) clearInterval(matThanInterval);
                tatVaDonRacTruc();
                if (typeof window.hienThongBaoBoGoc === 'function') window.hienThongBaoBoGoc("👁️ MẮT THẦN: Đã tắt!", "#ff4d4d");
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
            if (data.gold) {
                let tamXac = viTriXac.clone().add(new THREE.Vector3(0, 3, 0));

                // 1. ĐÚC CỤM TINH THỂ THẠCH ANH (Linh Thạch)
                let soLuongLinhThach = 5 + Math.floor(Math.random() * 4);
                let mangLinhThach = [];

                for (let i = 0; i < soLuongLinhThach; i++) {
                    let cumNgocGroup = new THREE.Group();
                    let ngocMat = new THREE.MeshBasicMaterial({
                        color: 0x00ffcc, wireframe: false, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending
                    });

                    for (let j = 0; j < 3; j++) {
                        let ngocGeo = new THREE.IcosahedronGeometry(0.2 + (Math.random() * 0.3));
                        let vienNgoc = new THREE.Mesh(ngocGeo, ngocMat);
                        vienNgoc.position.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5);
                        vienNgoc.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
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
                                window.taoChuNoiGacha(window.playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), `+${data.gold} VÀNG`, "#00ffcc");
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
        }).catch(e => { });
};

// =================================================================
// 🛡️ LÁ CHẮN CHỐNG NGỦ ĐÔNG (HACK TẬN GỐC TRÌNH DUYỆT)
// =================================================================
(function khoiTaoChongNguDong() {
    // 1. CHẶN KẾT XUẤT ĐỒ HỌA KHI ẨN TAB (Chống nổ VRAM)
    if (typeof window.renderer !== 'undefined' && window.renderer) {
        const renderGoc = window.renderer.render.bind(window.renderer);
        window.renderer.render = function (scene, camera) {
            // Trình duyệt ẩn -> Khỏi vẽ, chỉ tính toán số liệu cho nhẹ máy!
            if (!document.hidden) renderGoc(scene, camera);
        };
    }

    // 2. CHẶN HÀNG ĐỢI GÂY LAG CHẾT MÁY KHI QUAY LẠI TAB
    const rAF_goc = window.requestAnimationFrame;
    window.requestAnimationFrame = function (callback) {
        if (document.hidden) return 0; // Vứt lệnh vào sọt rác, không cho xếp hàng
        return rAF_goc.call(window, callback);
    };

    // 3. TẠO NHÂN CPU ẢO (WEB WORKER) - Miễn nhiễm với lệnh đóng băng!
    let codeWorker = `
        setInterval(() => { postMessage('TICK'); }, 16); // Đập nhịp 60 FPS
    `;
    let blob = new Blob([codeWorker], { type: 'application/javascript' });
    let worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = function () {
        // Khi trình duyệt bị ẩn đi, Worker sẽ ép hàm animate() chạy ngầm 
        // để Bot vẫn tính toán vật lý, lướt và đấm Boss bình thường!
        if (document.hidden && typeof animate === 'function') {
            animate();
        }
    };

    // 4. MỒI LỬA LẠI KHI SẾP QUAY VỀ TAB (MỞ MÀN HÌNH LÊN)
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && typeof animate === 'function') {
            animate(); // Khởi động lại vòng lặp 3D gốc ngay lập tức
        }
    });

    console.log("🛡️ Hệ thống chống ngủ đông & Treo máy ẩn Tab đã kích hoạt!");
})();

// ==========================================
// 🛠️ MÁY QUÉT CẢM BIẾN DA THỊT V4 (ĐỒNG BỘ 100% VỚI GAME)
// Chuyên trị Model loạn Scale trong Túi đồ & Showroom
// ==========================================
window.canBangModelUI = function (model, kichThuocKhung = 4) {
    if (!model) return;

    // 1. Reset về nguyên thủy trước khi đo
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    model.rotation.set(0, 0, 0);
    model.updateMatrixWorld(true);

    // 2. DÙNG THƯỚC ĐO CỘT SỐNG NHƯ TRONG GAME (CHỐNG LỖI MIXAMO/BLENDER)
    let chieuCaoThucTe = 0;
    let maxYBone = -Infinity;
    let minYBone = Infinity;
    let coXuong = false;

    // Quét xương để đo chiều cao thật của nhân vật/thú cưỡi
    model.traverse((child) => {
        if (child.isBone) {
            coXuong = true;
            let pos = new THREE.Vector3();
            child.getWorldPosition(pos);
            if (pos.y > maxYBone) maxYBone = pos.y;
            if (pos.y < minYBone) minYBone = pos.y;
        }
    });

    let box = new THREE.Box3().setFromObject(model);
    let center = new THREE.Vector3();

    if (coXuong && (maxYBone - minYBone) > 0.1) {
        // 🧍 NẾU LÀ NHÂN VẬT / THÚ CƯỠI (Đo theo Xương)
        chieuCaoThucTe = (maxYBone - minYBone) * 1.15; // Bù 15% cho chỏm tóc/đỉnh đầu

        // Lấy tâm X, Z từ hộp, nhưng tâm Y lấy từ Xương để chân luôn chạm đất chuẩn
        box.getCenter(center);
        center.y = minYBone + (chieuCaoThucTe / 2);
    } else {
        // ⚔️ NẾU LÀ VŨ KHÍ / VẬT PHẨM (Đo theo Hộp BoundingBox mặc định)
        const size = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        chieuCaoThucTe = Math.max(size.x, size.y, size.z);
    }

    // Chống lỗi Model vô hình chia cho 0 làm sập màn hình
    if (!isFinite(chieuCaoThucTe) || chieuCaoThucTe <= 0.001) chieuCaoThucTe = 1;

    // 3. Ép tỷ lệ thu nhỏ ôm khít ô UI
    const tyLe = kichThuocKhung / chieuCaoThucTe;
    model.scale.set(tyLe, tyLe, tyLe);

    // 4. Khóa Trọng Tâm Về Chính Giữa Máy Ảnh
    model.position.x = -center.x * tyLe;
    model.position.y = -center.y * tyLe;
    model.position.z = -center.z * tyLe;
};





// ==========================================
// 📜 HỆ THỐNG RADAR THEO DÕI NHIỆM VỤ HÀNG NGÀY (BẢN VÁ UI RESPONSIVE)
// ==========================================
window.taoUITrackerNhiemVu = function () {
    let box = document.getElementById('questTrackerUI');
    if (!box) {
        box = document.createElement('div');
        box.id = 'questTrackerUI';
        box.className = 'quest-tracker-responsive'; // Gắn class để xử lý Mobile
        document.body.appendChild(box);

        // Bơm CSS trực tiếp vào trang để xử lý Mobile Responsive
        let style = document.createElement('style');
        style.innerHTML = `
            .quest-tracker-responsive {
                position: fixed;
                top: 75px; /* Dời lên sát góc trên, ngay dưới bảng HUD Tốc độ */
                left: 10px;
                background: rgba(0,0,0,0.7);
                border: 2px solid #d35400;
                padding: 8px 12px;
                border-radius: 8px;
                color: #fff;
                font-family: monospace;
                z-index: 9998;
                box-shadow: 0 0 10px rgba(211, 84, 0, 0.5);
                pointer-events: none;
                min-width: 200px;
                backdrop-filter: blur(5px);
                transition: 0.3s;
            }
            .quest-tracker-responsive h4 { margin:0; text-transform:uppercase; border-bottom:1px solid #e67e22; padding-bottom:5px; font-size:13px; }
            .quest-tracker-responsive .qt-desc { font-size:12px; margin-top:6px; font-weight:bold; }
            .quest-tracker-responsive .qt-prog { font-size:13px; margin-top:4px; text-align:right; font-weight:900; }
            
            /* 🌟 ÉP KÍCH THƯỚC TRÊN MOBILE */
            @media screen and (max-width: 900px) {
                .quest-tracker-responsive {
                    top: 65px !important;
                    left: 5px !important;
                    min-width: 140px !important;
                    padding: 5px 8px !important;
                    border-width: 1px !important;
                }
                .quest-tracker-responsive h4 { font-size: 9px !important; margin-bottom: 2px !important; padding-bottom: 2px !important; }
                .quest-tracker-responsive .qt-desc { font-size: 8px !important; margin-top: 3px !important; }
                .quest-tracker-responsive .qt-prog { font-size: 9px !important; margin-top: 2px !important; }
            }
        `;
        document.head.appendChild(style);
    }
};

window.capNhatNhiemVu = function () {
    fetch('api/daily_quests.php')
        .then(res => res.json())
        .then(data => {
            window.taoUITrackerNhiemVu();
            let box = document.getElementById('questTrackerUI');

            if (data.status === 'success') {
                if (data.completed_all) {
                    box.style.borderColor = '#2ecc71';
                    box.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.5)';
                    box.innerHTML = `
                    <h4 style="color:#2ecc71; border-color:#2ecc71; text-shadow: 0 0 5px #2ecc71;">📜 Nhiệm Vụ Vòng</h4>
                    <div class="qt-desc" style="color:#aaa; text-align:center;">Đã hoàn thành 30/30!</div>
                `;
                } else {
                    let q = data.quest;
                    let isDone = (q.status === 'COMPLETED' || parseInt(q.current_amount) >= parseInt(q.required_amount));

                    let color = isDone ? '#2ecc71' : '#f1c40f';
                    let strAction = q.quest_type === 'KILL_PLAYER' ? '🔪 Đồ sát' : '⚔️ Săn lùng';

                    box.style.borderColor = isDone ? '#2ecc71' : '#d35400';

                    box.innerHTML = `
                    <h4 style="color:#e67e22;">📜 VÒNG LIÊN HOÀN (${q.quest_index}/30)</h4>
                    <div class="qt-desc" style="color:${isDone ? '#2ecc71' : '#fff'};">
                        ${strAction}: <span style="color:${color}">${q.target_name}</span>
                    </div>
                    <div class="qt-prog" style="color:${color}; text-shadow: 0 0 5px ${color};">
                        Tiến độ: ${q.current_amount} / ${q.required_amount}
                    </div>
                    ${isDone ? `<div style="font-size:8px; color:#2ecc71; text-align:right; margin-top:3px; animation: nhipTho 1s infinite;">(Báo cáo bưu điện...)</div>` : ''}
                `;
                }
            }
        }).catch(e => { });
};

setInterval(window.capNhatNhiemVu, 5000);
setTimeout(window.capNhatNhiemVu, 2000);
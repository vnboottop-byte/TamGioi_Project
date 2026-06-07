// ==========================================
// 🔮 HỆ THỐNG KỸ NĂNG: PHÁP SƯ TỐI THƯỢNG (BẢN V29 - FULL TỐI ƯU & CHỐNG RÁC)
// ==========================================
(function () {
    const kyNangPhapSu = [];
    const danhSachSoBayPS = [];
    const vfxNoPhapSu = []; // 🌟 KHO CHỨA CÁC VỤ NỔ ANIME
    let vongPhepModel = null;
    let isVongPhepSetup = false;

    // 🌟 1. CẤU HÌNH THỜI GIAN HỒI CHIÊU (Miligiây)
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    

    window.tongSoChuNoi_PS = 0;
    function taoSoSatThuongPS(pos3D, satThuong, mauSac = '#00ffff') {
        if (window.isMobile) return; // 🌟 CỨU SỐNG CPU MOBILE!
        if (satThuong <= 0) return;
        // 🌟 KHÓA VAN MOBILE
        if (window.isMobile && window.tongSoChuNoi_PS > 5) return;
        window.tongSoChuNoi_PS++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayPS.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.thoiDiemNoCuoiCungPS = window.thoiDiemNoCuoiCungPS || 0;

function taoVuNoPS(pos, isRemote, luongDame, banKinh, mauHex) {
    // 🌟 1. QUY TẮC 3 QUYỀN LỰC SÁT THƯƠNG
    if (isRemote === false) {
        // QUYỀN 1: Sếp đánh Quái & Báo PVP lên Server
        gaySatThuongPS(pos, luongDame, banKinh);
    }
    else if (typeof isRemote === 'number' && isRemote > 0) {
        // QUYỀN 2: Boss đánh (Lấy đúng luongDame đã chia tỷ lệ từng vòng phép)
        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, luongDame, banKinh);
    }
    else if (isRemote === true) {
        // QUYỀN 3: Đạn của người chơi khác PVP với Sếp (Bỏ qua để tránh x2 Dame)
    }

    // 2. VAN XẢ ĐỒ HỌA CHỐNG LAG MOBILE (0.3s NỔ 1 LẦN)
    let bayGio = Date.now();
    if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungPS < 300) {
        return; 
    }
    window.thoiDiemNoCuoiCungPS = bayGio;

    // 3. XUẤT HIỆU ỨNG 3D
    if (typeof window.phatAmThanhNo === 'function') window.phatAmThanhNo();

    const vfxGroup = new THREE.Group();
    vfxGroup.position.copy(pos);

    // --- LỚP 1: BÃO LỬA HẠT (PARTICLES) ---
    // 🌟 Ép xung VRAM trên Mobile xuống mức tối thiểu (10 hạt)
    const soLuong = window.isMobile ? 10 : 400; 
    const geo = new THREE.BufferGeometry();

    const posArr = new Float32Array(soLuong * 3);
    const vels = [];

    for (let i = 0; i < soLuong; i++) {
        posArr[i * 3] = 0; posArr[i * 3 + 1] = 0; posArr[i * 3 + 2] = 0;
        let dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        let speed = 2 + Math.random() * 6;
        vels.push(dir.multiplyScalar(speed));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    
    const texture = (typeof window.layTextureLua === 'function') ? window.layTextureLua() : null;
    const mat = new THREE.PointsMaterial({ 
        color: mauHex || 0xffddaa,
        size: window.isMobile ? 18.0 : 12.0, // Mobile hạt ít nên to lên xíu để bù đắp
        map: texture, 
        transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false 
    });
    
    const pts = new THREE.Points(geo, mat);
    vfxGroup.add(pts);

    // --- LỚP 2: SÓNG XUNG KÍCH QUÉT MẶT ĐẤT ---
    const geoSong = new THREE.RingGeometry(0.1, 2, 32);
    const matSong = new THREE.MeshBasicMaterial({
        color: mauHex || 0xffaa00, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    const songXungKich = new THREE.Mesh(geoSong, matSong);
    
    let upV = (typeof window.playerModel !== 'undefined' && window.playerModel) ? window.playerModel.up.clone() : new THREE.Vector3(0,1,0);
    songXungKich.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upV);
    songXungKich.position.add(upV.clone().multiplyScalar(0.5)); 
    vfxGroup.add(songXungKich);

    scene.add(vfxGroup);

    vfxNoPhapSu.push({
        group: vfxGroup, pts: pts, velocities: vels, songXungKich: songXungKich,
        life: window.isMobile ? 30 : 60, // Mobile tan nhanh hơn để giải phóng VRAM
        maxScale: banKinh
    });
}

    function taoVuKhiBayPS(weaponUrl, mauSac, scaleSize, isUpright = false, auraLevel = 0) {
        const group = new THREE.Group();
        let urlCanTai = weaponUrl || window.WEAPON_URL;
        if (!urlCanTai || urlCanTai.trim() === '') return group;

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        c.material = c.material.clone();
                        c.material.side = THREE.DoubleSide; 
                        c.material.transparent = true;
                        c.material.emissive = new THREE.Color(mauSac);
                        c.material.emissiveIntensity = 0.5; 
                    }
                });
                
                v.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(v);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                let tiLeChuan = scaleSize / maxDim; 
                v.scale.set(tiLeChuan, tiLeChuan, tiLeChuan);
                v.rotation.x = Math.PI / 2; 
                v.rotation.y = 0;
                v.rotation.z = 0;

                // 🌟 BẢN VÁ: DÙNG HÀO QUANG ĐƯỢC TRUYỀN VÀO TỪ BÊN NGOÀI
                if (typeof window.bocHaoQuang3D === 'function') window.bocHaoQuang3D(v, auraLevel);

                group.add(v);
            });
        }
        
        if (!isUpright) group.rotation.x = -Math.PI / 2;
        else group.rotation.x = 0; 

        return group;
    }


    window.layMucTieuGanNhatPS = function(viTriGoc) {
        let targetPos = null; let minD = 80; // Tầm nhìn Pháp Sư
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minD) { minD = d; targetPos = hit.tamNguc; }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minD) { minD = d; targetPos = hit.tamNguc; }
                }
            });
        }
        return targetPos;
    };

    function gaySatThuongPS(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongPS(posHienSo, luongSatThuong, '#ffaa00');
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        if (quai.isBoss) {
                            taoSoSatThuongPS(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongPS(hit.tamNguc.clone(), luongSatThuong);
                            if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (quai.hp / (quai.maxHp || 4000)) * 100) + '%'; }
                            if (quai.hp <= 0) {
                                quai.isDead = true; if (typeof quai.playAnim === 'function') quai.playAnim('DIE'); else quai.mesh.visible = false;
                                if (quai.tagEl) quai.tagEl.style.display = 'none';
                                if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);
                                setTimeout(() => { quai.hp = quai.maxHp || 4000; quai.isDead = false; if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true; if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = '100%'; quai.tagEl.style.display = 'block'; } }, 5000);
                            } else { if (typeof quai.playAnim === 'function') quai.playAnim('HIT'); }
                        }
                    }
                }
            });
        }
    }










    // ==========================================
    // 🏹 TUNG CHIÊU MẠNG (PHI VÒNG PHÉP THỰC CHIẾN)
    // ==========================================
    window.tungComboPhapSu = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        if (!window.playerModel && !isRemote) return;


        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;

            window.dangMuaChieu = true;

            // 🌟 BỘ NÃO BỐC THĂM CHIÊU THỨC THÔNG MINH
            let tenAnimation = 'BAY'; // Fallback
            if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
                tenAnimation = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
            } else {
                let mapAnim = (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") ? window.animationsMapChar : window.animationsMap;
                let pool = Object.keys(mapAnim || {}).filter(k => {
                    let ten = k.toLowerCase();
                    const tuKhoaCam = ['hit', 'hurt', 'damage', 'die', 'death', 'dead', 'defend'];
                    if (tuKhoaCam.some(tuCam => ten.includes(tuCam))) return false;
                    const tuKhoaTanCong = ['attack', 'atk', 'magic', 'cast', 'spell', 'summon', 'skill', 'combo', 'chieu', 'shoot'];
                    return tuKhoaTanCong.some(tuKhoa => ten.includes(tuKhoa));
                });
                if (pool.length > 0) tenAnimation = pool[Math.floor(Math.random() * pool.length)];
            }

            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimation);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimation);

            // Khóa đứng im niệm phép trong 1.2s
            if (window.henGioTatMuaPS) clearTimeout(window.henGioTatMuaPS);
            window.henGioTatMuaPS = setTimeout(() => { window.dangMuaChieu = false; }, 1200);
        }

        let viTriGoc, huongMat, mucTieu, upVector;
        
        // 🌟 BẢN VÁ: TRẢ LẠI LỰC CHIẾN VÀ HÀO QUANG CHÍNH CHỦ
        let dameGoc = window.DAME_CUA_TOI || 100;
        let auraLevel = window.WEAPON_LEVEL || 0;
        
        if (isRemote !== false) {
            auraLevel = 0; // Boss và Địch không có hào quang của Sếp
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        // 🌟 QUY TẮC A, B & D PHÁP SƯ: Vũ khí ném đi CHUẨN XÁC là Vũ Khí 1 (Vòng Phép)

        let vuKhiThucTe = weaponUrl;
        if (!isRemote && !vuKhiThucTe) vuKhiThucTe = window.WEAPON_URL || 'uploads/anims/vong_phep.glb';
        if (window.LA_SKIN_ANIME || window.IS_SKIN_ANIME) vuKhiThucTe = ""; // Quăng khí công tàng hình nếu là Anime



 


        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            upVector = viTriGoc.clone().normalize();
        } else {
            upVector = window.playerModel.up.clone().normalize();

            // 🌟 1. TÌM MỤC TIÊU TRƯỚC TIÊN TỪ VỊ TRÍ NHÂN VẬT ĐỨNG
            let tamNhanVat = window.playerModel.position.clone();
            let target = window.layMucTieuGanNhatPS(tamNhanVat);

            // 🌟 2. ÉP NHÂN VẬT XOAY MẶT VỀ PHÍA MỤC TIÊU (CHỐNG LẬT TRỤC CẦU)
            if (target) {
                const dummy = new THREE.Object3D();
                dummy.position.copy(tamNhanVat);
                dummy.up.copy(upVector);

                // Chiếu mục tiêu lên mặt phẳng ngang để nhân vật không bị ngửa cổ
                let vecToTarget = new THREE.Vector3().subVectors(target, tamNhanVat);
                let vertComp = vecToTarget.clone().projectOnVector(upVector);
                vecToTarget.sub(vertComp);
                let targetNgang = tamNhanVat.clone().add(vecToTarget);

                dummy.lookAt(targetNgang);
                window.playerModel.quaternion.copy(dummy.quaternion); // Xoay người ngay lập tức!
            }

            // 🌟 3. SAU KHI ĐÃ XOAY NGƯỜI XONG MỚI TÍNH TỌA ĐỘ VŨ KHÍ ĐỂ NÉM
            viTriGoc = new THREE.Vector3();
            if (window.vuKhiPhapSu) window.vuKhiPhapSu.getWorldPosition(viTriGoc);
            else { viTriGoc.copy(tamNhanVat); viTriGoc.add(upVector.clone().multiplyScalar(2)); }

            // Cập nhật lại hướng mặt mới
            huongMat = new THREE.Vector3(); window.playerModel.getWorldDirection(huongMat); huongMat.normalize();

            mucTieu = target ? target.clone() : viTriGoc.clone().add(huongMat.clone().multiplyScalar(50));

            // Gửi lệnh lên mạng (Kèm theo Link Vũ Khí)
            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'PhapSu',
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z },
                    weaponUrl: vuKhiThucTe
                })), { reliable: true });
            }
        }

        let qNamNgangMatDat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), upVector);

        if (phim === 'Q') {
            // Ném 1 Vòng Phép dựng đứng (Aura Xanh)
            const vongQ = taoVuKhiBayPS(vuKhiThucTe, 0x00ffff, 5, true, auraLevel); 
            vongQ.position.copy(viTriGoc); 
            vongQ.up.copy(upVector); 
            vongQ.lookAt(mucTieu); 
            scene.add(vongQ);
            kyNangPhapSu.push({ mesh: vongQ, type: 'Q', life: 150, targetPos: mucTieu, damage: dameGoc * 0.4, speed: 2.0, isRemote: isRemote, upV: upVector });
        }
        else if (phim === 'E') {
            // Giáng 1 Vòng Phép khổng lồ nằm ngang (Aura Tím)
            const vongE = taoVuKhiBayPS(vuKhiThucTe, 0xff00ff, 15, false, auraLevel); 
            vongE.position.copy(mucTieu).add(upVector.clone().multiplyScalar(15));
            vongE.quaternion.copy(qNamNgangMatDat); 
            scene.add(vongE);
            kyNangPhapSu.push({ mesh: vongE, type: 'E', state: 'GIANG_XUONG', life: 250, targetPos: mucTieu, damage: dameGoc * 0.6, isRemote: isRemote, upV: upVector });
        }
        else if (phim === 'R') {
            // Xoắn ốc 2 Vòng Phép Khổng Lồ
            const vongTren = taoVuKhiBayPS(vuKhiThucTe, 0xff00ff, 20, false, auraLevel);
            const vongDuoi = taoVuKhiBayPS(vuKhiThucTe, 0x00ffff, 20, false, auraLevel);

            vongTren.position.copy(mucTieu).add(upVector.clone().multiplyScalar(15));
            vongDuoi.position.copy(mucTieu).sub(upVector.clone().multiplyScalar(5)); 
            vongTren.quaternion.copy(qNamNgangMatDat); 
            vongDuoi.quaternion.copy(qNamNgangMatDat);
            
            scene.add(vongTren); scene.add(vongDuoi);
            kyNangPhapSu.push({ mesh: vongTren, meshBot: vongDuoi, type: 'R', ticks: 0, swapCount: 0, life: 400, targetPos: mucTieu, damage: dameGoc * 0.5, isRemote: isRemote, upV: upVector });
        }
        else if (phim === 'F') {
            // Khối Lập Phương Bát Quái
            const box = new THREE.Group(); 
            box.position.copy(mucTieu).add(upVector.clone().multiplyScalar(10));
            box.quaternion.copy(qNamNgangMatDat);
            
            const s = 25; 
            const mat = [
                { pos: [0, 0, s / 2], rot: [0, 0, 0] }, 
                { pos: [0, 0, -s / 2], rot: [0, Math.PI, 0] }, 
                { pos: [s / 2, 0, 0], rot: [0, Math.PI / 2, 0] }, 
                { pos: [-s / 2, 0, 0], rot: [0, -Math.PI / 2, 0] }, 
                { pos: [0, s / 2, 0], rot: [-Math.PI / 2, 0, 0] }, 
                { pos: [0, -s / 2, 0], rot: [Math.PI / 2, 0, 0] }
            ];
            mat.forEach(m => { 
                let v = taoVuKhiBayPS(vuKhiThucTe, 0xff0000, s, true, auraLevel); 
                v.position.set(...m.pos); v.rotation.set(...m.rot); 
                box.add(v); 
            });
            scene.add(box);
            kyNangPhapSu.push({ mesh: box, type: 'F', ticks: 0, life: 300, targetPos: mucTieu, damage: dameGoc * 1.0, isRemote: isRemote, upV: upVector });
        }
      
    };









    // ==========================================
    // 🚀 VÒNG LẶP VẬT LÝ TOÀN CẦU (ĐÃ THOÁT KHỎI LỒNG)
    // ==========================================
    window.updateCombatPhapSu = function () {



        if (typeof window.taiHoacNhanBanAsset !== 'function') return;

        // =======================================================
        // 🌟 CẢM BIẾN VẬT LÝ PHÁP SƯ: THEO DÕI VŨ KHÍ 2 (TRƯỢNG PHÉP LÀM HỘ THỂ)
        // =======================================================
        let phaiHienTai = (window.SCRIPT_PHAI_CUA_TOI || "").toLowerCase();
        if (phaiHienTai.includes('phapsu')) {
            if (window.WEAPON2_URL !== window.oldWeapon2URL_PS) {
                window.oldWeapon2URL_PS = window.WEAPON2_URL;
                
                let linkTruong = window.WEAPON2_URL;
                // Quy tắc A & B: Nếu rỗng thì tự động nạp Trượng mặc định làm Hộ thể
                if (!linkTruong || linkTruong.trim() === '') linkTruong = 'uploads/anims/truong_phep.glb';
                // Quy tắc D: Nếu là Skin Anime (ALL) thì tàng hình tuyệt đối
                if (window.LA_SKIN_ANIME || window.IS_SKIN_ANIME) linkTruong = ""; 

                // 🛑 LÒ ĐỐT RÁC: Tiêu hủy cây trượng hộ thể cũ
                if (window.truongHoThe) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(window.truongHoThe);
                    else scene.remove(window.truongHoThe);
                    window.truongHoThe = null;
                }
                isTruongPhepSetup = false;

                // Tải cây trượng mới vào vòng xoay hộ thể
                if (linkTruong !== "") {
                    window.taiHoacNhanBanAsset(linkTruong, (truongGoc) => {
                        if (window.truongHoThe) {
                            if (typeof window.donRac3D === 'function') window.donRac3D(window.truongHoThe);
                            window.truongHoThe = null;
                        }
                        window.truongHoThe = truongGoc;

                        truongGoc.updateMatrixWorld(true);
                        const box = new THREE.Box3().setFromObject(truongGoc);
                        const size = box.getSize(new THREE.Vector3());
                        const maxDim = Math.max(size.x, size.y, size.z) || 1;
                        let tiLeChuan = 1.8 / maxDim; // Ép chuẩn dài 1.8m
                        truongGoc.scale.set(tiLeChuan, tiLeChuan, tiLeChuan);

                        if (typeof window.bocHaoQuang3D === 'function') window.bocHaoQuang3D(truongGoc, window.WEAPON_LEVEL || 0);

                        scene.add(truongGoc);
                        window.gocXoayTruong = 0; window.gocTuXoayTruong = 0;
                        isTruongPhepSetup = true;
                    });
                }
            }
        }


     

        
        for (let i = kyNangPhapSu.length - 1; i >= 0; i--) {
            let s = kyNangPhapSu[i]; s.life--;



            if (s.type === 'Q') {
                s.speed *= 1.05; 
                s.mesh.translateZ(s.speed); 
                s.mesh.children.forEach(c => c.rotation.y += 0.3);
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5) {
                    s.life = 0; taoVuNoPS(s.targetPos, s.isRemote, s.damage, 10, 0x00ffff);
                }
            }
            else if (s.type === 'E') {
                s.mesh.children.forEach(c => c.rotation.y += 0.2);
                // 🌟 Giáng từ trên cao xuống người chơi
                s.mesh.position.sub(s.upV.clone().multiplyScalar(0.4)); 
                let dist = s.mesh.position.distanceTo(s.targetPos);
                if (dist < 1 || s.mesh.position.dot(s.upV) < s.targetPos.dot(s.upV)) {
                    s.life = 0; taoVuNoPS(s.targetPos, s.isRemote, s.damage, 15, 0xff00ff);
                }
            }
            else if (s.type === 'R') {
                s.ticks += 0.05; // Tốc độ di chuyển giữa 2 vòng
                s.mesh.children.forEach(c => c.rotation.y += 0.2);
                s.meshBot.children.forEach(c => c.rotation.y -= 0.2);
                
                // 🌟 LOGIC TẦM NHIỆT: Liên tục dò tìm mục tiêu và bám theo!
                if (!s.isRemote) {
                    // Lấy vị trí tâm bão hiện tại làm gốc để quét radar
                    const mucTieuMoi = window.layMucTieuGanNhatPS(s.targetPos);
                    if (mucTieuMoi) {
                        // Kéo tâm bão bám theo kẻ địch cực mượt (Tốc độ bám 0.08)
                        s.targetPos.lerp(mucTieuMoi, 0.08); 
                    }
                }

                // 🌟 LOGIC XUYÊN NHAU: Tính toán dựa trên Tâm bão (targetPos) mới
                let offset = Math.cos(s.ticks * 3) * 15; // Biên độ 15m
                s.mesh.position.copy(s.targetPos).add(s.upV.clone().multiplyScalar(offset));
                s.meshBot.position.copy(s.targetPos).sub(s.upV.clone().multiplyScalar(offset));
                
                if (s.ticks > Math.PI * 1.5) { // Sau khoảng 3 lần đổi vị trí
                    s.life = 0; taoVuNoPS(s.targetPos, s.isRemote, s.damage, 25, 0xffaa00);
                }
            }
            else if (s.type === 'F') {
                // 🌟 LOGIC TẦM NHIỆT: Kéo Khối lập phương bay theo kẻ địch
                if (!s.isRemote) {
                    const mucTieuMoi = window.layMucTieuGanNhatPS(s.targetPos);
                    if (mucTieuMoi) {
                        s.targetPos.lerp(mucTieuMoi, 0.06); // Chiêu F nặng nề nên bám đuôi từ từ tạo áp lực
                        // Cập nhật vị trí Khối lập phương trôi theo tâm mới
                        s.mesh.position.copy(s.targetPos).add(s.upV.clone().multiplyScalar(10));
                    }
                }

                // 🌟 Xoay khối lập phương khổng lồ cực đẹp
                s.mesh.rotation.y += 0.03; 
                s.mesh.rotation.z += 0.02;
                s.mesh.children.forEach(v => v.children.forEach(c => c.rotation.y += 0.15));
                
                if (++s.ticks > 150) { 
                    s.life = 0; taoVuNoPS(s.targetPos, s.isRemote, s.damage, 30, 0xff0000); 
                }
            }

            if (s.life <= 0) { window.donRac3D(s.mesh); if (s.meshBot) window.donRac3D(s.meshBot); kyNangPhapSu.splice(i, 1); }
        }




        // ==========================================
        // 💥 VÒNG LẶP RENDER VFX NỔ BÃO LỬA (HỌC HỎI TỪ RỒNG)
        // ==========================================
        for (let i = vfxNoPhapSu.length - 1; i >= 0; i--) {
            let vfx = vfxNoPhapSu[i];
            vfx.life--;

            // 1. XỬ LÝ HẠT LỬA (Nổ văng ra rồi khựng lại thành khói)
            let posArr = vfx.pts.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += vfx.velocities[j].x;
                posArr[j * 3 + 1] += vfx.velocities[j].y;
                posArr[j * 3 + 2] += vfx.velocities[j].z;
                
                // 🌟 Lực cản không khí: Văng xa thì tốc độ chậm dần lại thành đám mây
                vfx.velocities[j].x *= 0.85; 
                vfx.velocities[j].y *= 0.85;
                vfx.velocities[j].z *= 0.85;
            }

            // ... (đoạn trên giữ nguyên) ...
            vfx.pts.geometry.attributes.position.needsUpdate = true;
            
            // 🌟 1. GIẢM TỐC ĐỘ PHÌNH TO CỦA LỬA (Từ 0.8 xuống 0.4)
            vfx.pts.material.size += 0.4; 
            vfx.pts.material.opacity = vfx.life / 60;
            
            if (vfx.life < 40) vfx.pts.material.color.setHex(0xff3300);
            if (vfx.life < 15) {
                vfx.pts.material.color.setHex(0x111111);
                vfx.pts.material.blending = THREE.NormalBlending;
            }

            // 🌟 2. GIẢM ĐỘ RỘNG CỦA SÓNG XUNG KÍCH MẶT ĐẤT (Từ 2.5 xuống 1.5)
            let tienTrinh = 1 - (vfx.life / 60);
            let scaleSong = vfx.maxScale * (tienTrinh * 1.5); 
            vfx.songXungKich.scale.set(scaleSong, scaleSong, 1);
            vfx.songXungKich.material.opacity = (vfx.life / 60) * 0.6;
            // ... (đoạn dọn rác bên dưới giữ nguyên) ...

            // 3. DỌN RÁC
            if (vfx.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(vfx.group);
                else scene.remove(vfx.group);
                vfxNoPhapSu.splice(i, 1);
            }
        }






        for (let i = danhSachSoBayPS.length - 1; i >= 0; i--) {
            let it = danhSachSoBayPS[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);

            if (p.z < 1) { it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`; it.el.style.opacity = it.life / 60; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayPS.splice(i, 1); window.tongSoChuNoi_PS--; } // 🌟 Xả van
        }
    };

    // 🌟 CHẠY NGẦM LIÊN TỤC TRÊN MÁY TẤT CẢ MỌI NGƯỜI
    setInterval(window.updateCombatPhapSu, 30);





    // ==========================================
    // 🌟 ĐĂNG KÝ HỆ PHÁI & QUẢN LÝ VŨ KHÍ ĐỘC LẬP
    // ==========================================
    let isTruongPhepSetup = false;
    window.truongHoThe = null;
    window.gocXoayTruong = 0;
    window.gocTuXoayTruong = 0;

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_phapsu')) {
        window.HePhaiHienTai = {
            tenPhai: "Pháp Sư",
            
            khoiTao: function () {
                // 🛑 LÒ ĐỐT RÁC: Dọn sạch Vòng phép và Trượng cũ trước khi đổi vũ khí mới
                if (window.vuKhiPhapSu) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(window.vuKhiPhapSu);
                    else scene.remove(window.vuKhiPhapSu);
                    window.vuKhiPhapSu = null;
                }
                if (window.truongHoThe) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(window.truongHoThe);
                    else scene.remove(window.truongHoThe);
                    window.truongHoThe = null;
                }
                isTruongPhepSetup = false; // Bắt buộc Reset cờ này

                console.log("🔮 Pháp Sư: Kích Hoạt Bộ Não Nhận Diện Phép Thuật!");
               
                window.KHO_ANIM_NHANROI = [];
                window.KHO_ANIM_TANCONG = [];

                if (window.animationsMap) {
                    // 🛑 BẢN VÁ V6: DIỆT ROOT MOTION (CHỐNG GIẬT LÙI LÚC NIỆM PHÉP)
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('CHIEU') || k.includes('MAGIC') || k.includes('CAST') || k.includes('SPELL') || k.includes('SUMMON')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position')) {
                                        const danhSachDen = ['armature', 'hip', 'pelvis', 'root', 'bip', 'center', 'spine', 'object', 'dummy', 'bone'];
                                        for (let tuKhoa of danhSachDen) if (tenTrack.includes(tuKhoa)) return false;
                                    }
                                    return true;
                                });
                            }
                        }
                    }

                    // 🧠 NHẬN DIỆN CHẠY, BAY, NHÀN RỖI, NIỆM PHÉP
                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let ten = key.toLowerCase();
                        let clip = window.animationsMap[key];

                        const tuKhoaCam = ['hit', 'hurt', 'damage', 'die', 'death', 'dead', 'defend'];
                        if (tuKhoaCam.some(tuCam => ten.includes(tuCam))) continue;

                        const tuKhoaIdle = ['idle', 'wait', 'stand', 'pose', 'nhanroi', 'breath', 'stay', 'normal'];
                        if (tuKhoaIdle.some(tu => ten.includes(tu))) { window.KHO_ANIM_NHANROI.push(key); }

                        const tuKhoaRun = ['run', 'walk', 'move', 'dash', 'sprint', 'chay', 'di', 'forward', 'step'];
                        if (tuKhoaRun.some(tu => ten.includes(tu))) { coChay = true; animChay = clip; window.animationsMap['CHAYBO'] = clip; window.animationsMap['RUN'] = clip; }

                        const tuKhoaFly = ['fly', 'hover', 'float', 'bay', 'glide', 'jump_loop'];
                        if (tuKhoaFly.some(tu => ten.includes(tu))) { coBay = true; animBay = clip; window.animationsMap['BAY'] = clip; window.animationsMap['FLY'] = clip; }

                        // 🔮 Nhận diện Tấn công (Từ khóa Pháp Sư)
                        const tuKhoaTanCong = ['attack', 'atk', 'magic', 'cast', 'spell', 'summon', 'skill', 'combo', 'chieu', 'shoot'];
                        if (tuKhoaTanCong.some(tu => ten.includes(tu))) { window.KHO_ANIM_TANCONG.push(key); }
                    }

                    // 🌟 Tự động bù trừ chéo
                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }

                    // 🌟 Chốt dáng Nhàn rỗi mặc định
                    if (window.KHO_ANIM_NHANROI.length > 0) {
                        let defaultIdle = window.KHO_ANIM_NHANROI[0];
                        window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                        if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                    }
                }

                // Vòng lặp đổi dáng Nhàn rỗi mỗi 12 giây
                if (window.vongLapNhanRoiPS) clearInterval(window.vongLapNhanRoiPS);
                window.vongLapNhanRoiPS = setInterval(() => {
                    if (!window.dangMuaChieu && !window.isMoving && !window.isKeyboardMoving && window.KHO_ANIM_NHANROI && window.KHO_ANIM_NHANROI.length > 0) {
                        let randomIdle = window.KHO_ANIM_NHANROI[Math.floor(Math.random() * window.KHO_ANIM_NHANROI.length)];
                        if (window.animationsMap && window.animationsMap[randomIdle]) {
                            window.animationsMap['NHANROI'] = window.animationsMap[randomIdle];
                            if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[randomIdle];
                            if (typeof window.playAnim === 'function') window.playAnim(randomIdle);
                        }
                    }
                }, 12000);
                // 🌟 KÍCH HOẠT CẢM BIẾN PHÁP SƯ: Ép vòng lặp vật lý quét trang bị Hộ Thể (Vũ Khí 2) từ SQL ra
                window.oldWeapon2URL_PS = "KICH_HOAT_CAM_BIEN_LOAD_MOI";
            },

            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) { 
                window.tungComboPhapSu(phim, isRemote, origin, target, dir, casterId, weaponUrl); 
            },
            
            // 🌟 CẬP NHẬT CHUYỂN ĐỘNG ĐỘC LẬP CHO CẢ 2 MÓN VŨ KHÍ
            capNhat: function () {



                // 🌟 CHỈ GIỮ LOGIC BAY QUANH NGƯỜI CỦA CÂY TRƯỢNG CẢM BIẾN HỘ THỂ (ĐÃ DIỆT SẠCH RÁC VÒNG PHÉP TAY)
                if (isTruongPhepSetup && window.truongHoThe && window.playerModel) {



                    window.gocXoayTruong += 0.04;   // Tốc độ bay quanh người
                    window.gocTuXoayTruong += 0.09; // Tốc độ trượng tự xoay tít

                    const banKinh = 2.0; // Khoảng cách cách người 2 mét
                    const posThuc = new THREE.Vector3();
                    window.playerModel.getWorldPosition(posThuc);

                    // Trục bay lơ lửng ngang ngực (cao 1.5m)
                    const huongLen = window.playerModel.up.clone().normalize();
                    posThuc.add(huongLen.clone().multiplyScalar(1.5));

                    const right = new THREE.Vector3().crossVectors(huongLen, new THREE.Vector3(0, 0, 1)).normalize();
                    if (right.lengthSq() < 0.1) right.crossVectors(huongLen, new THREE.Vector3(1, 0, 0)).normalize();
                    const forward = new THREE.Vector3().crossVectors(right, huongLen).normalize();

                    const offsetRight = right.clone().multiplyScalar(Math.cos(window.gocXoayTruong) * banKinh);
                    const offsetForward = forward.clone().multiplyScalar(Math.sin(window.gocXoayTruong) * banKinh);

                    posThuc.add(offsetRight).add(offsetForward);
                    window.truongHoThe.position.copy(posThuc);

                    // 🌟 Nắn trục trượng: Bắt đầu từ tư thế đứng thẳng theo trọng lực (Mỏ neo)
                    const qTruong = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLen);
                    window.truongHoThe.quaternion.copy(qTruong);

                    // =====================================
                    // 🔧 KHU VỰC CĂN CHỈNH GÓC GẬY CHO SẾP
                    // =====================================
                    // 1. CHỈNH ĐỘ NGHIÊNG (X và Z)
                    window.truongHoThe.rotateX(1.57); // Nghiêng ra trước/sau (Sửa số 0.5 thành 0 nếu muốn thẳng đứng, hoặc 1.57 nếu muốn gậy nằm ngang)
                    window.truongHoThe.rotateZ(0);   // Nghiêng sang trái/phải

                    // 2. CHỈNH TRỤC TỰ XOAY (Quay tít thò lò)
                    // Nếu thấy gậy xoay như cánh quạt, hãy đổi chữ rotateY thành rotateX hoặc rotateZ nhé!
                    window.truongHoThe.rotateZ(window.gocTuXoayTruong);
                }
            } 
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
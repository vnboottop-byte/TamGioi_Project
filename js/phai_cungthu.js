// ==========================================
// 🏹 HỆ THỐNG KỸ NĂNG: CUNG THỦ (V22 - CẤY GEN VẬT LÝ TU TIÊN & TẦM NHIỆT ICBM)
// ==========================================

(function() {
    const kyNangCungThu = [];
    const hieuUngCungThu = [];
    const danhSachSoBayCT = [];

    // ⏳ BỘ ĐẾM THỜI GIAN HỒI CHIÊU CHUẨN (Ms)
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };
    // Biến cho Cung/Tên quay quanh người
    let isCuoiCungSetup = false;

    window.oldWeaponURL_CT = "KICH_HOAT_CAM_BIEN_LOAD_MOI";
     
    // ==========================================
     window.layMucTieuGanNhatCT = function(viTriGoc) {
        let targetPos = null; let minD = 80; 
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


    // ==========================================
    // 🩸 LÕI SÁT THƯƠNG & HIỆU ỨNG (ĐỘC LẬP)
    // ==========================================
    window.tongSoChuNoi_CT = 0;
    function taoSoSatThuongCT(pos3D, satThuong, mauSac = '#ff2222') {
        if (window.isMobile) return; // 🌟 CỨU SỐNG CPU MOBILE!
        if(satThuong <= 0) return;
        // 🌟 KHÓA VAN MOBILE
        if (window.isMobile && window.tongSoChuNoi_CT > 5) return;
        window.tongSoChuNoi_CT++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000, -2px -2px 0px #000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayCT.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    function gaySatThuongCT(tamNo, luongSatThuong, banKinh) {
        // ==========================================
        // 1. TÍNH SÁT THƯƠNG NGƯỜI CHƠI KHÁC (PK / PVP)
        // ==========================================
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    // 🌟 Dùng X-Quang để quét ngực người chơi khác
                    let hitRP = window.layHitbox(rp.mesh);
                    let tongBanKinhRP = banKinh + hitRP.banKinh;

                    if (tamNo.distanceTo(hitRP.tamNguc) <= tongBanKinhRP) {
                        let posHienSo = hitRP.tamNguc.clone();
                        posHienSo.y += (hitRP.chieuCao / 2); // Hiện số sát thương trên đỉnh đầu

                        taoSoSatThuongCT(posHienSo, luongSatThuong, '#ffaa00');

                        // 🌟 RÓT VÀO PHỄU PVP
                        if (typeof window.chemTrungNguoiChoi === 'function') {
                            window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                        }
                    }
                }
            }
        }

        // ==========================================
        // 2. TÍNH SÁT THƯƠNG QUÁI VÀ BOSS (PVE)
        // ==========================================
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    // 🌟 DÙNG MÁY QUÉT X-QUANG ĐỂ TÌM NGỰC VÀ HITBOX QUÁI/BOSS
                    let hit = window.layHitbox(quai.mesh);
                    let tongBanKinh = banKinh + hit.banKinh;

                    if (tamNo.distanceTo(hit.tamNguc) <= tongBanKinh) {
                        // NẾU LÀ BOSS KHỔNG LỒ
                        if (quai.isBoss) {
                            // Boss thì hiện số to, lệch lên trên ngực 1 tí cho đẹp
                            taoSoSatThuongCT(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');

                            // 🌟 RÓT VÀO PHỄU BOSS
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        }
                        // NẾU LÀ QUÁI THƯỜNG TRÊN MAP
                        else {
                            quai.hp -= luongSatThuong;
                            taoSoSatThuongCT(hit.tamNguc.clone(), luongSatThuong);

                            if (quai.tagEl) {
                                let bar = quai.tagEl.querySelector('div[style*="background"]') || quai.tagEl.querySelector('.hp-bar');
                                if (bar) bar.style.width = Math.max(0, (quai.hp / (quai.maxHp || 4000)) * 100) + '%';
                            }

                            // Xử lý quái chết
                            if (quai.hp <= 0) {
                                quai.isDead = true;
                                if (typeof quai.playAnim === 'function') quai.playAnim('DIE'); else quai.mesh.visible = false;
                                if (quai.tagEl) quai.tagEl.style.display = 'none';

                                // Rớt EXP
                                if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);

                                // 5 Giây sau hồi sinh
                                setTimeout(() => {
                                    quai.hp = quai.maxHp || 4000; quai.isDead = false;
                                    if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true;
                                    if (quai.tagEl) {
                                        let bar = quai.tagEl.querySelector('div[style*="background"]') || quai.tagEl.querySelector('.hp-bar');
                                        if (bar) bar.style.width = '100%'; quai.tagEl.style.display = 'block';
                                    }
                                }, 5000);
                            } else {
                                if (typeof quai.playAnim === 'function') quai.playAnim('HIT');
                            }
                        }
                    }
                }
            });
        }
    }


    
    function layMucTieuGanNhatCT(viTriGoc, huongMat) {
        let targetPos = null; let minD = 80; 
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let d = viTriGoc.distanceTo(quai.mesh.position);
                    if (d > 0.1 && d < minD) { minD = d; targetPos = quai.mesh.position.clone(); }
                }
            });
        }
        if (targetPos) { targetPos.y += 3; return targetPos; }
        return null;
    }

    function taoMuiTenXin(scaleSize, weaponUrl, auraLevel = 0) { 
        const group = new THREE.Group();

        let urlCanTai = weaponUrl || window.VUKHI_HIEN_TAI_CUA_CUNGTHU || window.WEAPON_URL;
        if (!urlCanTai || urlCanTai.trim() === '') return group;

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (vuKhi) => {
                vuKhi.position.set(0, 0, 0);
                vuKhi.rotation.set(0, 0, 0);

                let tyLeGoc = window.scaleChuanMuiTen || 0.33;
                vuKhi.scale.set(tyLeGoc * scaleSize, tyLeGoc * scaleSize, tyLeGoc * scaleSize);

                // 🌟 BẢN VÁ: Dùng Hào Quang được truyền vào, chặn ăn cắp WEAPON_LEVEL của Sếp
                if (typeof window.bocHaoQuang3D === 'function') window.bocHaoQuang3D(vuKhi, auraLevel);

                group.add(vuKhi);
            });
        }
        return group;
    }

    window.thoiDiemNoCuoiCungCT = window.thoiDiemNoCuoiCungCT || 0;

    function taoVuNoCT(pos, isRemote = false, luongDame = 100, banKinh = 15) {
        // 🌟 BẢN VÁ: PHÁ KHIÊN CHẶN ĐẠN NUMBER, SÒNG PHẲNG HP
        if (isRemote === false) {
            gaySatThuongCT(pos, luongDame, banKinh);
        }
        else {
            if (typeof window.gaySatThuongBossToPlayer === 'function') {
                window.gaySatThuongBossToPlayer(pos, luongDame, banKinh);
            }
        }

        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungCT < 300) {
            return; 
        }
        window.thoiDiemNoCuoiCungCT = bayGio;

        if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(pos, banKinh * 0.5, 0xffaa00);
    }

    function taoSaoBangCT(pos, dir) {
        if (window.isMobile) return; // 🌟 TỐI ƯU MOBILE: Cấm tạo đuôi lửa theo sau mũi tên
        if (Math.random() > 0.5) return;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([pos.x, pos.y, pos.z]), 3));
        // 🌟 TẠO TÀN LỬA MÀU CAM VÀNG (Đã xóa màu xanh, hạt to vừa phải)
        const mat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.6, transparent: true, opacity: 0.8 });
        const pts = new THREE.Points(geo, mat);
        scene.add(pts);
        // Cho tàn lửa bay tản ra phía sau đuôi mũi tên
        hieuUngCungThu.push({ system: pts, velocities: [new THREE.Vector3(dir.x * 0.1, dir.y * 0.1, dir.z * 0.1)], life: 15, type: 'trail' });
    }

    // ==========================================
    // 🏹 TUNG CHIÊU (ĐÃ FIX SẬP GAME, ẢO TƯỞNG & NGÔN NGỮ AI)
    // ==========================================
    window.tungComboCungThu = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        
        // 🌟 BẢN VÁ: Cấp chuẩn thể xác cho Boss AI 
        if (isRemote && casterId) {
            if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            } else if (typeof window.danhSachQuaiVat !== 'undefined') {
                let boss = window.danhSachQuaiVat.find(q => q.id == casterId || q.id === casterId);
                if (boss && boss.mesh) nvc = boss.mesh;
            }
        }
        if (!nvc && !isRemote) return;

        // 🌟 BẢN VÁ: THÔNG NÃO NGÔN NGỮ AI
        let loaiChieu = phim;
        if (typeof phim === 'string') {
            let pUp = phim.toUpperCase();
            if (pUp.includes('ATTACK4') || pUp === 'F') loaiChieu = 'F';
            else if (pUp.includes('ATTACK3') || pUp === 'R') loaiChieu = 'R';
            else if (pUp.includes('ATTACK2') || pUp === 'E') loaiChieu = 'E';
            else if (pUp.includes('ATTACK1') || pUp === 'Q') loaiChieu = 'Q';
            else if (pUp.includes('ATTACK') || pUp.includes('SKILL')) {
                let arr = ['Q', 'E', 'R', 'F'];
                loaiChieu = arr[Math.floor(Math.random() * arr.length)];
            }
        }

        if (!isRemote) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[loaiChieu] < THOI_GIAN_HOI[loaiChieu]) return; 
            choHoiChieu[loaiChieu] = bayGio; 

            window.dangMuaChieu = true;

            let tenAnimation = 'BAY'; 
            if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
                tenAnimation = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
            } else {
                let mapAnim = (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") ? window.animationsMapChar : window.animationsMap;
                let pool = Object.keys(mapAnim || {}).filter(k => {
                    let ten = k.toLowerCase();
                    const tuKhoaCam = ['hit', 'hurt', 'damage', 'die', 'death', 'dead', 'defend'];
                    if (tuKhoaCam.some(tuCam => ten.includes(tuCam))) return false; 
                    const tuKhoaTanCong = ['attack', 'atk', 'shoot', 'bow', 'fire', 'skill', 'combo', 'chieu', 'ban'];
                    return tuKhoaTanCong.some(tuKhoa => ten.includes(tuKhoa));
                });
                if (pool.length > 0) tenAnimation = pool[Math.floor(Math.random() * pool.length)];
            }

            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimation);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimation);

            if (window.cungTrenTay) window.cungTrenTay.visible = true; 
            
            let thoiGianĐoi = window.thoiGianAnimHienTai || 1500;
            if (window.henGioTatCung) clearTimeout(window.henGioTatCung);
            window.henGioTatCung = setTimeout(() => {
                if (window.cungTrenTay) window.cungTrenTay.visible = false; 
                window.dangMuaChieu = false; 
            }, thoiGianĐoi);
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        let auraLevel = window.WEAPON_LEVEL || 0;
        
        if (isRemote !== false) {
            auraLevel = 0; 
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        let vuKhiThucTe = weaponUrl;
        if (!isRemote && !vuKhiThucTe) vuKhiThucTe = window.VUKHI_HIEN_TAI_CUA_CUNGTHU || window.WEAPON_URL || 'uploads/anims/CUNGTEN.glb';

        let viTriGoc = new THREE.Vector3();
        let huongMat = new THREE.Vector3();
        let mucTieu = new THREE.Vector3();
        let upVector = (nvc && nvc.up) ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);

        // 🌟 BẢN VÁ: CHỐNG NULL POINTER SẬP GAME DO MẠNG LAG
        if (isRemote) {
            if (remoteGoc) {
                viTriGoc.set(remoteGoc.x, remoteGoc.y, remoteGoc.z);
                if (viTriGoc.lengthSq() > 0.001) upVector.copy(viTriGoc).normalize();
            } else if (nvc) {
                if (nvc.position.lengthSq() > 0.001) upVector.copy(nvc.position).normalize();
                viTriGoc.copy(nvc.position);
            }
            if (remoteHuong) huongMat.set(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            else if (nvc) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }

            if (remoteDich) mucTieu.set(remoteDich.x, remoteDich.y, remoteDich.z);
            else mucTieu = viTriGoc.clone().add(huongMat.clone().multiplyScalar(500));
        } else {
            if (nvc) {
                viTriGoc.copy(nvc.position);
                nvc.getWorldDirection(huongMat);
                huongMat.projectOnPlane(upVector).normalize();
            }
            let diemKhoaRadar = window.layMucTieuGanNhatCT(viTriGoc);
            if (diemKhoaRadar) mucTieu = diemKhoaRadar;
            else mucTieu = viTriGoc.clone().add(huongMat.clone().multiplyScalar(500));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'CungThu',
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z },
                    weaponUrl: window.WEAPON_URL
                })), { reliable: false });
            }
        }

        let rightVector = new THREE.Vector3().crossVectors(huongMat, upVector).normalize().negate();

        if (loaiChieu === 'Q') {
            const soLuong = 8;
            const tamTranPhap = viTriGoc.clone().add(upVector.clone().multiplyScalar(5)).sub(huongMat.clone().multiplyScalar(4));
            const qGroup = new THREE.Group(); qGroup.position.copy(tamTranPhap); 
            qGroup.up.copy(upVector); qGroup.lookAt(mucTieu); scene.add(qGroup);

            for (let i = 0; i < soLuong; i++) {
                const ten = taoMuiTenXin(5.0, vuKhiThucTe, auraLevel);
                const goc = (i / soLuong) * Math.PI * 2;
                ten.position.set(Math.cos(goc) * 3, Math.sin(goc) * 3, 0); qGroup.add(ten);
                kyNangCungThu.push({
                    mesh: ten, parentGroup: qGroup, type: 'Q', state: 'XOAY_TICH_TUC',
                    life: 400, ticks: 0, targetPos: mucTieu.clone(),
                    damage: dameGoc * 0.05, speed: 0.5, fireDelay: i * 8, isRemote: isRemote, upVector: upVector.clone()
                });
            }
        }
        else if (loaiChieu === 'E') {
            const soLuong = 15;
            const spawnCenter = viTriGoc.clone().add(upVector.clone().multiplyScalar(25)).sub(huongMat.clone().multiplyScalar(10));
            for (let i = 0; i < soLuong; i++) {
                const ten = taoMuiTenXin(10.0, vuKhiThucTe, auraLevel);
                let rX = (Math.random() - 0.5) * 20;
                let rZ = (Math.random() - 0.5) * 20;
                let rUp = Math.random() * 10;
                
                let startPos = spawnCenter.clone().add(rightVector.clone().multiplyScalar(rX)).add(huongMat.clone().multiplyScalar(rZ)).add(upVector.clone().multiplyScalar(rUp));
                let dichRoi = mucTieu.clone().add(rightVector.clone().multiplyScalar(rX)).add(huongMat.clone().multiplyScalar(rZ));
                
                ten.position.copy(startPos); 
                ten.up.copy(upVector); ten.lookAt(dichRoi); scene.add(ten);
                kyNangCungThu.push({
                    mesh: ten, type: 'BAY_VONG_CUNG', state: 'CHO_DEN_LUOT',
                    speed: 0.005 + (Math.random() * 0.005), life: 400, startPos: startPos, targetPos: dichRoi,
                    damage: dameGoc * 0.04, arcHeight: 30 + Math.random() * 20, fireDelay: i * 3, progress: 0, isRemote: isRemote,
                    upVector: upVector.clone() 
                });
            }
        }
        else if (loaiChieu === 'R') {
            const rGroup = new THREE.Group();
            const tamTranPhap = viTriGoc.clone().add(upVector.clone().multiplyScalar(6)).sub(huongMat.clone().multiplyScalar(5));
            rGroup.position.copy(tamTranPhap); rGroup.up.copy(upVector); rGroup.lookAt(mucTieu); scene.add(rGroup);
            for (let i = 0; i < 5; i++) {
                const ten = taoMuiTenXin(20.0, vuKhiThucTe, auraLevel);
                const goc = (i / 5) * Math.PI * 2;
                ten.position.set(Math.cos(goc) * 4, Math.sin(goc) * 4, 0); rGroup.add(ten);
                kyNangCungThu.push({
                    mesh: ten, parentGroup: rGroup, type: 'R', state: 'XOAY_TICH_TUC',
                    life: 400, ticks: 0, targetPos: mucTieu.clone(), damage: dameGoc * 0.1, speed: 0.5, fireDelay: i * 15, isRemote: isRemote, upVector: upVector.clone()
                });
            }
        }
        else if (loaiChieu === 'F') {
            const fTen = taoMuiTenXin(30.5, vuKhiThucTe, auraLevel);
            const startPos = viTriGoc.clone().add(upVector.clone().multiplyScalar(8)).sub(huongMat.clone().multiplyScalar(5));
            fTen.position.copy(startPos); fTen.up.copy(upVector); fTen.lookAt(startPos.clone().add(upVector)); scene.add(fTen);

            let diemDichF = mucTieu.clone();
            diemDichF.sub(upVector.clone().multiplyScalar(10)); 

            kyNangCungThu.push({
                mesh: fTen, type: 'BAY_VONG_CUNG', state: 'DANG_BAY',
                life: 600, targetPos: diemDichF, startPos: startPos, damage: dameGoc * 1.0,
                speed: 0.0015, arcHeight: 200, progress: 0, isRemote: isRemote, explosionRadius: 40,
                upVector: upVector.clone() 
            });
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU
    // ==========================================
    window.updateCombatCungThu = function () {
        if (typeof window.taiHoacNhanBanAsset !== 'function') return;

        // =======================================================
        // 🌟 CẢM BIẾN VẬT LÝ: TỰ ĐỔI MŨI TÊN HỘ THỂ & DỌN RÁC SẠCH SẼ
        // =======================================================
        let phaiHienTai = (window.SCRIPT_PHAI_CUA_TOI || "").toLowerCase();
        if (phaiHienTai.includes('cungthu')) {
            if (window.WEAPON_URL !== window.oldWeaponURL_CT) {
                window.oldWeaponURL_CT = window.WEAPON_URL;
                
                let linkMuiTen = window.WEAPON_URL;
                if (!linkMuiTen || linkMuiTen.trim() === '') linkMuiTen = 'uploads/anims/CUNGTEN.glb';
                if (window.LA_SKIN_ANIME || window.IS_SKIN_ANIME) linkMuiTen = ""; // Tàng hình nếu là Anime
                
                window.VUKHI_HIEN_TAI_CUA_CUNGTHU = linkMuiTen;

                // 🛑 Gỡ bỏ mũi tên cũ
                if (window.cungHoThe) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(window.cungHoThe);
                    else scene.remove(window.cungHoThe);
                    window.cungHoThe = null;
                }

                // 🌟 Tải mũi tên mới
                if (linkMuiTen !== "") {
                    window.taiHoacNhanBanAsset(linkMuiTen, (gltfTen) => {
                        // Chống lag mạng đẻ 2 tên
                        if (window.cungHoThe) {
                            if (typeof window.donRac3D === 'function') window.donRac3D(window.cungHoThe);
                            window.cungHoThe = null;
                        }
                        window.cungHoThe = gltfTen;
                        window.cungHoThe.updateMatrixWorld(true);
                        const box = new THREE.Box3().setFromObject(window.cungHoThe);
                        const size = new THREE.Vector3(); box.getSize(size);
                        const maxDim = Math.max(size.x, size.y, size.z) || 1;
                        window.scaleChuanMuiTen = 1.2 / maxDim; // Ép chuẩn mũi tên dài 1.2m
                        window.cungHoThe.scale.set(window.scaleChuanMuiTen, window.scaleChuanMuiTen, window.scaleChuanMuiTen);
                        
                        if (typeof window.bocHaoQuang3D === 'function') window.bocHaoQuang3D(window.cungHoThe, window.WEAPON_LEVEL || 0);
                        
                        window.gocXoayCung = 0; window.gocTuXoayCung = 0;
                    });
                }
            }
        }

        for (let i = kyNangCungThu.length - 1; i >= 0; i--) {
            let skill = kyNangCungThu[i]; skill.life--;

            if (skill.state === 'XOAY_TICH_TUC') {
                if (skill.parentGroup) skill.parentGroup.rotateZ(0.05);
                skill.mesh.rotateZ(0.2); skill.ticks++;
                if (skill.ticks > 30 + skill.fireDelay) {
                    const worldPos = new THREE.Vector3(); const worldQuat = new THREE.Quaternion();
                    skill.mesh.getWorldPosition(worldPos); skill.mesh.getWorldQuaternion(worldQuat);
                    scene.attach(skill.mesh); skill.startPos = worldPos.clone(); skill.state = 'BAY_DI';
                }
            }
            else if (skill.state === 'BAY_DI') {
                if (skill.type === 'R') { skill.speed *= 1.08; skill.mesh.rotateZ(0.6); } else { skill.speed *= 1.05; }
                if (skill.speed > 8.0) skill.speed = 8.0;

                if (skill.targetPos) {
                    if (!skill.isRemote) {
                        const fwd = new THREE.Vector3(); skill.mesh.getWorldDirection(fwd);
                        const mucTieuMoi = window.layMucTieuGanNhatCT(skill.mesh.position, fwd);
                        if (mucTieuMoi) skill.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(skill.mesh.position); 
                    // 🌟 BẢN VÁ TRỤC CẦU: Ép cứng upVector để đạn không bị vẹo cổ
                    dummy.up.copy(skill.upVector || new THREE.Vector3(0,1,0)); 
                    dummy.lookAt(skill.targetPos);
                    skill.mesh.quaternion.slerp(dummy.quaternion, 0.2);
                }

                skill.mesh.translateZ(skill.speed);

                const dir = new THREE.Vector3(); skill.mesh.getWorldDirection(dir);
                taoSaoBangCT(skill.mesh.position, dir.negate());

                if (skill.mesh.position.distanceTo(skill.targetPos) < skill.speed + 5) {
                    taoVuNoCT(skill.targetPos, skill.isRemote, skill.damage, skill.type === 'R' ? 20 : 10);
                    skill.life = 0;
                }
            }
            else if (skill.state === 'CHO_DEN_LUOT') {
                skill.fireDelay--; if (skill.fireDelay <= 0) skill.state = 'DANG_BAY';
            }
            else if (skill.type === 'BAY_VONG_CUNG' && skill.state === 'DANG_BAY') {
                skill.speed *= 1.03; skill.progress += skill.speed; skill.mesh.rotateZ(0.5);

                if (!skill.isRemote) {
                    const mucTieuMoi = window.layMucTieuGanNhatCT(skill.mesh.position, new THREE.Vector3(0, 0, 1));
                    if (mucTieuMoi) { skill.targetPos.x = mucTieuMoi.x; skill.targetPos.z = mucTieuMoi.z; }
                }

                const dir = new THREE.Vector3(); skill.mesh.getWorldDirection(dir);
                taoSaoBangCT(skill.mesh.position, dir.negate());

                let curPos = new THREE.Vector3().lerpVectors(skill.startPos, skill.targetPos, skill.progress);
                curPos.add(skill.upVector.clone().multiplyScalar(Math.sin(skill.progress * Math.PI) * skill.arcHeight));

                let nextProgress = skill.progress + 0.05;
                let nextPos = new THREE.Vector3().lerpVectors(skill.startPos, skill.targetPos, nextProgress);
                nextPos.add(skill.upVector.clone().multiplyScalar(Math.sin(nextProgress * Math.PI) * skill.arcHeight));

                skill.mesh.position.copy(curPos); 
                
                // 🌟 BẢN VÁ TRỤC CẦU PARABOL: Chữa dứt điểm bệnh "Bẻ xéo trục"
                skill.mesh.up.copy(skill.upVector);
                if (curPos.distanceTo(nextPos) > 0.001) skill.mesh.lookAt(nextPos);

                if (skill.progress >= 1) {
                    skill.state = 'CAM_DAT'; skill.ticks = 0;
                    taoVuNoCT(skill.targetPos, skill.isRemote, skill.damage, skill.explosionRadius || 20);
                }
            }

            if (skill.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(skill.mesh);
                if (skill.parentGroup && skill.parentGroup.children.length === 0) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(skill.parentGroup);
                }
                kyNangCungThu.splice(i, 1);
            }
        }

        for (let i = hieuUngCungThu.length - 1; i >= 0; i--) {
            let hieuUng = hieuUngCungThu[i];
            if (hieuUng.type === 'shockwave') {
                hieuUng.life -= 0.05;
                let scaleSize = hieuUng.scaleMax * (1 - hieuUng.life);
                hieuUng.mesh.scale.set(scaleSize, scaleSize, scaleSize);
                hieuUng.mesh.material.opacity = hieuUng.life;
                if (hieuUng.life <= 0) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(hieuUng.mesh);
                    hieuUngCungThu.splice(i, 1);
                }
            } else if (hieuUng.type === 'trail') {
                let posTrail = hieuUng.system.geometry.attributes.position.array;
                for (let j = 0; j < posTrail.length / 3; j++) {
                    posTrail[j * 3] += hieuUng.velocities[j].x; posTrail[j * 3 + 1] += hieuUng.velocities[j].y; posTrail[j * 3 + 2] += hieuUng.velocities[j].z;
                }
                hieuUng.system.geometry.attributes.position.needsUpdate = true;
                hieuUng.system.material.opacity = hieuUng.life / 15; hieuUng.life--;
                if (hieuUng.life <= 0) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(hieuUng.system);
                    hieuUngCungThu.splice(i, 1);
                }
            }
        }

        for (let i = danhSachSoBayCT.length - 1; i >= 0; i--) {
            let item = danhSachSoBayCT[i]; item.offsetY += 0.05; item.life--;
            const screenPos = item.pos.clone(); screenPos.y += item.offsetY; screenPos.project(camera);
            if (screenPos.z < 1) {
                item.el.style.left = `${(screenPos.x * 0.5 + 0.5) * window.innerWidth}px`;
                item.el.style.top = `${(screenPos.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { item.el.style.display = 'none'; }

            if (item.life < 20) item.el.style.opacity = item.life / 20;

            if (item.life <= 0) { item.el.remove(); danhSachSoBayCT.splice(i, 1); window.tongSoChuNoi_CT--; } // 🌟 Xả van

            
        }
    };

    setInterval(window.updateCombatCungThu, 30);

    // ==========================================
    // ⚙️ KHỞI TẠO & VÒNG LẶP NỘI BỘ 
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_cungthu')) {
        window.HePhaiHienTai = {
            tenPhai: "Cung Thủ",




            khoiTao: function () {
                // 🛑 LÒ ĐỐT RÁC: Dọn sạch Cung trên tay và Tên sau lưng cũ trước khi đổi vũ khí mới
                if (window.cungTrenTay) {
                    if (window.cungTrenTay.parent) window.cungTrenTay.parent.remove(window.cungTrenTay);
                    if (typeof window.donRac3D === 'function') window.donRac3D(window.cungTrenTay);
                    window.cungTrenTay = null;
                }
                if (window.cungHoThe) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(window.cungHoThe);
                    else scene.remove(window.cungHoThe);
                    window.cungHoThe = null;
                }
                isCuoiCungSetup = false; // Bắt buộc Reset cờ này để vòng lặp vẽ lại vũ khí hộ thể

                console.log("🏹 Cung Thủ Kích Hoạt Bộ Não Nhận Diện Animation!");
                 
                window.KHO_ANIM_NHANROI = [];
                window.KHO_ANIM_TANCONG = [];

                if (window.animationsMap) {
                    // 🛑 BẢN VÁ V6: DIỆT ROOT MOTION (CHỐNG GIẬT LÙI)
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('CHIEU') || k.includes('COMBO') || k.includes('SHOOT') || k.includes('BOW') || k.includes('FIRE')) {
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

                    // 🧠 NHẬN DIỆN CHẠY, BAY, NHÀN RỖI, TẤN CÔNG
                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let ten = key.toLowerCase();
                        let clip = window.animationsMap[key];

                        // 🛑 Bỏ qua dáng bị đấm/chết
                        const tuKhoaCam = ['hit', 'hurt', 'damage', 'die', 'death', 'dead', 'defend'];
                        if (tuKhoaCam.some(tuCam => ten.includes(tuCam))) continue;

                        // 🧍‍♂️ Nhận diện Nhàn rỗi
                        const tuKhoaIdle = ['idle', 'wait', 'stand', 'pose', 'nhanroi', 'breath', 'stay', 'normal'];
                        if (tuKhoaIdle.some(tu => ten.includes(tu))) { window.KHO_ANIM_NHANROI.push(key); }

                        // 🏃‍♂️ Nhận diện Đi/Chạy
                        const tuKhoaRun = ['run', 'walk', 'move', 'dash', 'sprint', 'chay', 'di', 'forward', 'step'];
                        if (tuKhoaRun.some(tu => ten.includes(tu))) { coChay = true; animChay = clip; window.animationsMap['CHAYBO'] = clip; window.animationsMap['RUN'] = clip; }

                        // 🦅 Nhận diện Bay lơ lửng
                        const tuKhoaFly = ['fly', 'hover', 'float', 'bay', 'glide', 'jump_loop'];
                        if (tuKhoaFly.some(tu => ten.includes(tu))) { coBay = true; animBay = clip; window.animationsMap['BAY'] = clip; window.animationsMap['FLY'] = clip; }

                        // 🏹 Nhận diện Tấn công (Bắn Cung)
                        const tuKhoaTanCong = ['attack', 'atk', 'shoot', 'bow', 'fire', 'skill', 'combo', 'chieu', 'ban'];
                        if (tuKhoaTanCong.some(tu => ten.includes(tu))) { window.KHO_ANIM_TANCONG.push(key); }
                    }

                    // 🌟 Tự động bù trừ chéo nếu thiếu dáng Bay hoặc Chạy
                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }

                    // 🌟 Chốt dáng Nhàn rỗi mặc định
                    if (window.KHO_ANIM_NHANROI.length > 0) {
                        let defaultIdle = window.KHO_ANIM_NHANROI[0];
                        window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                        if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                    }
                }

                // Vòng lặp đổi dáng đứng Nhàn rỗi mỗi 12 giây
                if (window.vongLapNhanRoiCT) clearInterval(window.vongLapNhanRoiCT);
                window.vongLapNhanRoiCT = setInterval(() => {
                    if (!window.dangMuaChieu && !window.isMoving && !window.isKeyboardMoving && window.KHO_ANIM_NHANROI && window.KHO_ANIM_NHANROI.length > 0) {
                        let randomIdle = window.KHO_ANIM_NHANROI[Math.floor(Math.random() * window.KHO_ANIM_NHANROI.length)];
                        if (window.animationsMap && window.animationsMap[randomIdle]) {
                            window.animationsMap['NHANROI'] = window.animationsMap[randomIdle];
                            if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[randomIdle];
                            if (typeof window.playAnim === 'function') window.playAnim(randomIdle);
                        }
                    }
                }, 12000);

              
            },







            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) {
                window.tungComboCungThu(phim, isRemote, origin, target, dir, casterId, weaponUrl);
            },



            vongLapVatLy: function () {
                // 🌟 ĐÃ XÓA SẠCH RÁC NHÂN BẢN. CHỈ CHỊU TRÁCH NHIỆM XOAY QUANH NGƯỜI
                if (window.cungHoThe && typeof playerModel !== 'undefined') {
                    window.gocXoayCung += 0.04; window.gocTuXoayCung += 0.2;

                    const banKinh = 1.5;
                    const posThuc = new THREE.Vector3();
                    playerModel.getWorldPosition(posThuc);

                    const huongLen = playerModel.up.clone().normalize();
                    posThuc.add(huongLen.clone().multiplyScalar(1.5));

                    const right = new THREE.Vector3().crossVectors(huongLen, new THREE.Vector3(0, 0, 1)).normalize();
                    if (right.lengthSq() < 0.1) right.crossVectors(huongLen, new THREE.Vector3(1, 0, 0)).normalize();
                    const forward = new THREE.Vector3().crossVectors(right, huongLen).normalize();

                    const offsetRight = right.clone().multiplyScalar(Math.cos(window.gocXoayCung) * banKinh);
                    const offsetForward = forward.clone().multiplyScalar(Math.sin(window.gocXoayCung) * banKinh);

                    posThuc.add(offsetRight).add(offsetForward);
                    window.cungHoThe.position.copy(posThuc);

                    const qCung = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLen);
                    window.cungHoThe.quaternion.copy(qCung);
                    window.cungHoThe.rotateX(Math.PI / 2);
                    window.cungHoThe.rotateZ(window.gocTuXoayCung);
                }
            },


            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();

// =========================================================================
// 🌟 BẢN VÁ: ÁNH XẠ CHỮA CÂM NÍN 100% CHO AI BOSS CUNG THỦ
// =========================================================================
window.tungCombocungthu = window.tungComboCungThu;
window.tungComboCungThu = window.tungComboCungThu;
window.tungCombophai_cungthu = window.tungComboCungThu;
window.tungComboPhai_CungThu = window.tungComboCungThu;
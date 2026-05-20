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
    // ==========================================
    // ==========================================
    // ==========================================
     window.layMucTieuGanNhatCT = function(viTriGoc) {
        let targetPos = null; let minD = 500; 
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
        let targetPos = null; let minD = 150; 
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

    
    function taoMuiTenXin(scaleSize, weaponUrl) {
        const group = new THREE.Group();

        // 🌟 BẢN VÁ: Nhận diện Mũi Tên là Vũ Khí 1. Nếu tháo vũ khí thì bắn ra không khí!
        let urlCanTai = weaponUrl || window.WEAPON_URL; 
        if (!urlCanTai || urlCanTai.trim() === '') return group;

        if (typeof window.taiHoacNhanBanAsset === 'function') {



            window.taiHoacNhanBanAsset(urlCanTai, (vuKhi) => {
                vuKhi.position.set(0, 0, 0);
                vuKhi.rotation.set(0, 0, 0);

                // 🌟 LẤY TỶ LỆ ĐÃ ĐO KHI LOAD GAME NHÂN VỚI ĐỘ TO CỦA TỪNG CHIÊU
                let tyLeGoc = window.scaleChuanMuiTen || 0.33;
                vuKhi.scale.set(tyLeGoc * scaleSize, tyLeGoc * scaleSize, tyLeGoc * scaleSize);

                group.add(vuKhi);
            });
        }
        return group;
    }

    window.thoiDiemNoCuoiCungCT = window.thoiDiemNoCuoiCungCT || 0;

    function taoVuNoCT(pos, isRemote = false, luongDame = 100, banKinh = 15) {
    // 1. TÍNH DAME VẬT LÝ (LUÔN CHẠY)
    if (isRemote === false) gaySatThuongCT(pos, luongDame, banKinh);
    else if (typeof isRemote === 'number' && isRemote > 0) {
        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, isRemote, banKinh);
    }

    // 2. VAN XẢ ĐỒ HỌA (MOBILE MỖI 0.3S CHỈ VẼ 1 LẦN NỔ)
    let bayGio = Date.now();
    if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungCT < 300) {
        return; 
    }
    window.thoiDiemNoCuoiCungCT = bayGio;

    // 3. GỌI HIỆU ỨNG
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
    // 🏹 TUNG CHIÊU (ĐÃ FIX VECTOR MẠNG & ICBM)
    // ==========================================
    window.tungComboCungThu = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        
        // ==========================================
        // 🌟 1. GỌI ANIMATION CHUẨN XÁC VÀ RÚT CUNG TÀNG HÌNH
        // ==========================================
        if (!isRemote) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return; // Chưa hồi thì nghỉ
            choHoiChieu[phim] = bayGio; // Ghi nhận thời gian tung chiêu

            // 🌟 ĐÓNG DẤU BẢN QUYỀN CUNG THỦ
            let tenAnimation = 'CHIEU' + phim + '_CUNGTHU'; 
            window.dangMuaChieu = true;

            // Gọi lệnh bắt nhân vật múa
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimation);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimation);

            // Bật tàng hình cây cung bên tay trái lên lúc xuất chiêu!
            if (window.cungTrenTay) {
                window.cungTrenTay.visible = true; 
            }
            
            // Lấy chỉ số thời gian chính xác từ Cảm Biến của Engine
                let thoiGianĐoi = window.thoiGianAnimHienTai || 1500;

                if (window.henGioTatCung) clearTimeout(window.henGioTatCung);
                window.henGioTatCung = setTimeout(() => {
                    // Đúng boong số giây của Animation là cất cung vào hư không
                    if (window.cungTrenTay) window.cungTrenTay.visible = false; 
                    window.dangMuaChieu = false; // 🔓 Mở khóa cho phép đi lại
                }, thoiGianĐoi);



        }

       

        // ==========================================
        // 🌟 2. XÁC ĐỊNH TỌA ĐỘ BẮN 
        // ==========================================
        let viTriGoc, huongMat, mucTieu;
        const dameGoc = window.DAME_CUA_TOI || 100;

        // 🌟 KHAI BÁO BIẾN CHỨA VŨ KHÍ THỰC TẾ Ở ĐÂY
        let vuKhiThucTe = weaponUrl;
        if (!isRemote && !vuKhiThucTe) vuKhiThucTe = window.WEAPON_URL;

        // ... (Giữ nguyên đoạn if isRemote và xác định radar khóa mục tiêu) ...
        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            viTriGoc = typeof playerModel !== 'undefined' && playerModel ? playerModel.position.clone() : new THREE.Vector3();
            huongMat = new THREE.Vector3();
            if (typeof playerModel !== 'undefined' && playerModel) playerModel.getWorldDirection(huongMat);
            huongMat.normalize();

            let diemKhoaRadar = window.layMucTieuGanNhatCT(viTriGoc);
            if (diemKhoaRadar) {
                mucTieu = diemKhoaRadar;
            } else {
                mucTieu = viTriGoc.clone().add(huongMat.clone().multiplyScalar(500));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'CungThu',
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z },
                    weaponUrl: window.WEAPON_URL
                })), { reliable: true });
            }
        }

        // 🌟 BÍ THUẬT HÌNH CẦU: Xác định hướng "Lên Trời" và hướng "Sang Ngang" theo tư thế nhân vật!
        let upVector = (typeof playerModel !== 'undefined' && playerModel) ? playerModel.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let rightVector = new THREE.Vector3().crossVectors(huongMat, upVector).normalize().negate();

        // Q: TIỄN TRẬN LIÊN HOÀN
        if (phim === 'Q') {
            const soLuong = 8;
            // Ép đỉnh đầu (upVector) thay vì tọa độ ảo
            const tamTranPhap = viTriGoc.clone().add(upVector.clone().multiplyScalar(5)).sub(huongMat.clone().multiplyScalar(4));
            const qGroup = new THREE.Group(); qGroup.position.copy(tamTranPhap); qGroup.lookAt(mucTieu); scene.add(qGroup);

            for (let i = 0; i < soLuong; i++) {
                const ten = taoMuiTenXin(5.0, vuKhiThucTe);
                const goc = (i / soLuong) * Math.PI * 2;
                ten.position.set(Math.cos(goc) * 3, Math.sin(goc) * 3, 0); qGroup.add(ten);
                kyNangCungThu.push({
                    mesh: ten, parentGroup: qGroup, type: 'Q', state: 'XOAY_TICH_TUC',
                    life: 400, ticks: 0, targetPos: mucTieu.clone(),
                    damage: dameGoc * 0.05, speed: 0.5, fireDelay: i * 8, isRemote: isRemote
                });
            }
        }
        // E: MƯA TÊN KHÔNG GIAN
        else if (phim === 'E') {
            const soLuong = 15;
            const spawnCenter = viTriGoc.clone().add(upVector.clone().multiplyScalar(25)).sub(huongMat.clone().multiplyScalar(10));
            for (let i = 0; i < soLuong; i++) {
                const ten = taoMuiTenXin(10.0, vuKhiThucTe);
                let rX = (Math.random() - 0.5) * 20;
                let rZ = (Math.random() - 0.5) * 20;
                let rUp = Math.random() * 10;
                
                // Trải đều mây mưa theo mặt phẳng ngang của hành tinh
                let startPos = spawnCenter.clone().add(rightVector.clone().multiplyScalar(rX)).add(huongMat.clone().multiplyScalar(rZ)).add(upVector.clone().multiplyScalar(rUp));
                let dichRoi = mucTieu.clone().add(rightVector.clone().multiplyScalar(rX)).add(huongMat.clone().multiplyScalar(rZ));
                
                ten.position.copy(startPos); ten.lookAt(dichRoi); scene.add(ten);
                kyNangCungThu.push({
                    mesh: ten, type: 'BAY_VONG_CUNG', state: 'CHO_DEN_LUOT',
                    speed: 0.005 + (Math.random() * 0.005), life: 400, startPos: startPos, targetPos: dichRoi,
                    damage: dameGoc * 0.04, arcHeight: 30 + Math.random() * 20, fireDelay: i * 3, progress: 0, isRemote: isRemote,
                    upVector: upVector.clone() // 🌟 LƯU LẠI ĐỂ BAY PARABOL CHUẨN
                });
            }
        }
        // R: LỤC ĐẠO LUÂN HỒI
        else if (phim === 'R') {
            const rGroup = new THREE.Group();
            const tamTranPhap = viTriGoc.clone().add(upVector.clone().multiplyScalar(6)).sub(huongMat.clone().multiplyScalar(5));
            rGroup.position.copy(tamTranPhap); rGroup.lookAt(mucTieu); scene.add(rGroup);
            for (let i = 0; i < 5; i++) {
                const ten = taoMuiTenXin(20.0, vuKhiThucTe);
                const goc = (i / 5) * Math.PI * 2;
                ten.position.set(Math.cos(goc) * 4, Math.sin(goc) * 4, 0); rGroup.add(ten);
                kyNangCungThu.push({
                    mesh: ten, parentGroup: rGroup, type: 'R', state: 'XOAY_TICH_TUC',
                    life: 400, ticks: 0, targetPos: mucTieu.clone(), damage: dameGoc * 0.1, speed: 0.5, fireDelay: i * 15, isRemote: isRemote
                });
            }
        }
        // F: ĐẠI THIÊN TIỄN (ICBM)
        else if (phim === 'F') {
            const fTen = taoMuiTenXin(30.5, vuKhiThucTe);
            const startPos = viTriGoc.clone().add(upVector.clone().multiplyScalar(8)).sub(huongMat.clone().multiplyScalar(5));
            fTen.position.copy(startPos); fTen.lookAt(startPos.clone().add(upVector)); scene.add(fTen);

            let diemDichF = mucTieu.clone();
            diemDichF.sub(upVector.clone().multiplyScalar(10)); // Cắm sâu xuống đất 10m

            kyNangCungThu.push({
                mesh: fTen, type: 'BAY_VONG_CUNG', state: 'DANG_BAY',
                life: 600, targetPos: diemDichF, startPos: startPos, damage: dameGoc * 1.0,
                speed: 0.0015, arcHeight: 200, progress: 0, isRemote: isRemote, explosionRadius: 40,
                upVector: upVector.clone() // 🌟 LƯU LẠI ĐỂ BAY PARABOL CHUẨN
            });
        }
    };




    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU
    // ==========================================
    window.updateCombatCungThu = function () {
    

        // ... (Code cũ giữ nguyên) ...
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

                    const dummy = new THREE.Object3D(); dummy.position.copy(skill.mesh.position); dummy.lookAt(skill.targetPos);
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
                    // Dùng Radar khóa mục tiêu nếu mục tiêu di chuyển
                    const mucTieuMoi = window.layMucTieuGanNhatCT(skill.mesh.position, new THREE.Vector3(0, 0, 1));
                    if (mucTieuMoi) {
                        skill.targetPos.x = mucTieuMoi.x;
                        skill.targetPos.z = mucTieuMoi.z;
                    }
                }

                const dir = new THREE.Vector3(); skill.mesh.getWorldDirection(dir);
                taoSaoBangCT(skill.mesh.position, dir.negate());

                // 🌟 TÍNH ĐƯỜNG CONG DỰA TRÊN TRỤC CỦA HÀNH TINH
                let curPos = new THREE.Vector3().lerpVectors(skill.startPos, skill.targetPos, skill.progress);
                curPos.add(skill.upVector.clone().multiplyScalar(Math.sin(skill.progress * Math.PI) * skill.arcHeight));

                let nextProgress = skill.progress + 0.05;
                let nextPos = new THREE.Vector3().lerpVectors(skill.startPos, skill.targetPos, nextProgress);
                nextPos.add(skill.upVector.clone().multiplyScalar(Math.sin(nextProgress * Math.PI) * skill.arcHeight));

                skill.mesh.position.copy(curPos); skill.mesh.lookAt(nextPos);

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
                // 1. TẢI CÁNH CUNG (VŨ KHÍ 2) - GẮN VÀO TAY TRÁI
                let linkCung = window.WEAPON2_URL;
                // Nếu tháo Cung ra thì không load gì cả
                if (!linkCung || linkCung.trim() === '' || linkCung.includes('KHIEN')) return;

                if (typeof window.taiHoacNhanBanAsset === 'function') {

                    window.taiHoacNhanBanAsset(linkCung, (cungModel) => {
                        let xuongTayTrai = null;
                        let modelNguoi = window.nhanVatChinh || window.playerModel;
                        
                        // 🌟 RADAR DÒ XƯƠNG ĐA NĂNG (BẮT CHƯỚC ENGINE)
                        modelNguoi.traverse(c => {
                            if (c.isBone) {
                                let n = c.name.toUpperCase();
                                if (n.includes('HAND_L') || n.includes('HAND.L') || n.includes('LEFTHAND')) {
                                    xuongTayTrai = c;
                                }
                            }
                        });

                        if (xuongTayTrai) {
                            xuongTayTrai.add(cungModel);
                            cungModel.position.set(0, 0, 0);
                            cungModel.rotation.set(0, 0, 0);

                            // 🌟 ÉP CẬP NHẬT 3D TRƯỚC KHI ĐO (CHỮA BỆNH CUNG = HẠT BỤI)
                            cungModel.updateMatrixWorld(true);
                            const box = new THREE.Box3().setFromObject(cungModel);
                            const size = new THREE.Vector3(); box.getSize(size);
                            const maxDim = Math.max(size.x, size.y, size.z);
                            
                            if (maxDim > 0.05) {
                                const tyLeCung = 1.8 / maxDim; // Cho cung to tầm 1.8m
                                cungModel.scale.set(tyLeCung, tyLeCung, tyLeCung);
                            } else {
                                cungModel.scale.set(0.5, 0.5, 0.5); // Fallback an toàn
                            }
                            
                            window.cungTrenTay = cungModel;
                            window.cungTrenTay.visible = false; // 🌟 CHIỀU Ý SẾP: MẶC ĐỊNH LÀ TÀNG HÌNH!
                            console.log("🏹 Đã gắn CUNG thành công vào tay trái:", xuongTayTrai.name);
                        } else {
                            console.log("❌ LỖI KHÔNG TÌM THẤY TAY TRÁI ĐỂ GẮN CUNG!");
                        }
                    });
                }

                // 2. TẢI MŨI TÊN & ĐO KÍCH THƯỚC CHUẨN MỘT LẦN DUY NHẤT
                let linkMuiTen = window.WEAPON_URL;
                if (!linkMuiTen || linkMuiTen.trim() === '') return;

                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset(linkMuiTen, (gltfTen) => {

                        window.vuKhiModel = gltfTen;

                        gltfTen.updateMatrixWorld(true);
                        const box = new THREE.Box3().setFromObject(gltfTen);
                        const size = new THREE.Vector3(); box.getSize(size);
                        const maxDim = Math.max(size.x, size.y, size.z);
                        if (maxDim > 0.05) {
                            window.scaleChuanMuiTen = 1.2 / maxDim;
                        } else {
                            window.scaleChuanMuiTen = 0.33;
                        }
                    });
                }
            },







            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) {
                window.tungComboCungThu(phim, isRemote, origin, target, dir, casterId, weaponUrl);
            },

            vongLapVatLy: function () {
                // 🌟 TẠO MŨI TÊN BAY VÒNG VÒNG SAU LƯNG (ĐÃ ÉP SCALE ĐÚNG CHUẨN)
                if (!isCuoiCungSetup && typeof window.vuKhiModel !== 'undefined' && window.vuKhiModel) {
                    window.cungHoThe = window.vuKhiModel.clone();
                    window.cungHoThe.traverse(c => { if (c.isMesh) c.visible = true; });
                    scene.add(window.cungHoThe);

                    // Lấy Tỷ lệ đã đo ở hàm khoiTao bóp vào đây
                    let tyLe = window.scaleChuanMuiTen || 0.33;
                    window.cungHoThe.scale.set(tyLe, tyLe, tyLe);

                    window.gocXoayCung = 0; window.gocTuXoayCung = 0; isCuoiCungSetup = true;
                }

                if (isCuoiCungSetup && window.cungHoThe && typeof playerModel !== 'undefined') {
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
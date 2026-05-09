// ==========================================
// 🔫 HỆ THỐNG KỸ NĂNG: XẠ THỦ (BẢN CHUẨN V31 - RADAR X-QUANG & ĐỒNG BỘ ĐẠN ĐẠO)
// ==========================================

(function () {
    const kyNangBanSung = [];
    const hieuUngBanSung = [];
    const danhSachSoBayBS = [];

    // 🌟 CẤU HÌNH THỜI GIAN HỒI CHIÊU (Miligiây)
    const THOI_GIAN_HOI = { 'Q': 500, 'E': 4000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    

    // ==========================================
    // 🩸 LÕI SÁT THƯƠNG (BẢN VÁ: HITBOX HÌNH TRỤ 2D BỎ QUA TRỤC Y)
    // ==========================================
    function taoSoSatThuongBS(pos3D, satThuong, mauSac = '#ff2222') {
        if (satThuong <= 0) return;
        const div = document.createElement('div');
        div.innerText = "-" + satThuong;
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:0px 0px 10px #000, 2px 2px 0px #000; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayBS.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }


    window.layMucTieuGanNhatBS = function(viTriGoc) {
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



     // 🌟 ĐÃ ĐỒNG BỘ: SÁT THƯƠNG QUÉT HITBOX 3D CHUẨN X-QUANG
    function gaySatThuongBS(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= banKinh) {
                        taoSoSatThuongBS(hit.tamNguc.clone().add(new THREE.Vector3(0,hit.chieuCao/2,0)), luongSatThuong, '#ffaa00');
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, hit.tamNguc.clone());
                    }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= banKinh) {
                        if (quai.isBoss) {
                            taoSoSatThuongBS(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongBS(hit.tamNguc.clone(), luongSatThuong);
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


    function taoVuNoBS(pos, isRemote = false, luongDame = 100, banKinh = 15) {
        if (isRemote === false) gaySatThuongBS(pos, luongDame, banKinh);
        else if (typeof isRemote === 'number' && isRemote > 0) {
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, isRemote, banKinh);
        }
    }


    function taoSaoBangBS(pos, dir) {
        // Tắt tia lửa bay phía sau để không làm rối mắt
        return;
    }









    function taoVienDanXin(scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = window.VIENDAN_URL || 'uploads/anims/VIENDAN.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.rotation.set(0, 0, 0);

                // 📏 BỘ THƯỚC ĐO TỰ ĐỘNG (Giữ nguyên để bóp đạn về 1m)
                v.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(v);
                const size = new THREE.Vector3(); box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);

                if (maxDim > 0.05) {
                    let tyLe = 1.0 / maxDim;
                    v.scale.set(tyLe, tyLe, tyLe);
                }

                // ĐÃ XÓA SẠCH ĐOẠN TÔ MÀU VÀNG Ở ĐÂY 🌟
                group.add(v);
            });
        }

        group.scale.set(scaleSize, scaleSize, scaleSize);
        return group;
    }



    // ==========================================
    // 🌟 ĐÚC TIA SÁNG ĐẠN TỰ ĐỘNG (SIÊU NHẸ - KHÔNG DÙNG MODEL 3D)
    // ==========================================
    function taoTiaDanNhanh() {
        // Tạo một cái cọc dài 4m, siêu nhỏ, màu vàng phát sáng rực rỡ
        const geo = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
        geo.rotateX(Math.PI / 2); // Chĩa mũi nhọn về trục +Z để bay thẳng
        const mat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.9 });
        return new THREE.Mesh(geo, mat);
    }



    // ==========================================
    // 🌟 ĐÚC TÊN LỬA E (CÓ THƯỚC ĐO TỰ ĐỘNG CHUẨN 2 MÉT)
    // ==========================================
    function taoHoaTienXin(scaleSize) {
        const group = new THREE.Group();
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset('uploads/anims/rocket.glb', (r) => {
                r.rotation.set(0, 0, 0);

                // 📏 THƯỚC ĐO TÊN LỬA
                r.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(r);
                const size = new THREE.Vector3(); box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);
                
                // Tên lửa thì bự hơn đạn, ép về chuẩn gốc 2 mét
                if (maxDim > 0.05) {
                    let tyLe = 2.0 / maxDim; 
                    r.scale.set(tyLe, tyLe, tyLe);
                }

                group.add(r);
            });
        }
        // Phóng to theo skill
        group.scale.set(scaleSize, scaleSize, scaleSize);
        return group;
    }



    function taoMayBayXin(scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = window.MAYBAY_URL || 'uploads/anims/phico.glb';
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (f) => {
                group.add(f);
            });
        }
        group.scale.set(scaleSize, scaleSize, scaleSize);
        return group;
    }

    

    function timTamCumQuaiDongNhat(tamClick, banKinhTimKiem, banKinhCum) {
        if (!window.danhSachQuaiVat || window.danhSachQuaiVat.length === 0) return tamClick;
        let quaiGan = window.danhSachQuaiVat.filter(q => !q.isDead && q.mesh && q.mesh.position.distanceTo(tamClick) < banKinhTimKiem);
        if (quaiGan.length === 0) return tamClick; if (quaiGan.length === 1) return quaiGan[0].mesh.position.clone();
        let maxCount = 0; let bestCenter = quaiGan[0].mesh.position.clone();
        for (let i = 0; i < quaiGan.length; i++) {
            let centerCandidate = quaiGan[i].mesh.position; let count = 0; let sumPos = new THREE.Vector3();
            for (let j = 0; j < quaiGan.length; j++) {
                if (quaiGan[j].mesh.position.distanceTo(centerCandidate) <= banKinhCum) { count++; sumPos.add(quaiGan[j].mesh.position); }
            }
            if (count > maxCount) { maxCount = count; bestCenter = sumPos.divideScalar(count); }
        }
        return bestCenter;
    }









    // ==========================================
    // 🏹 HÀM 1: TUNG CHIÊU BẰNG TAY (CHUẨN GỐC + DAME 1000% / 1 PHÚT)
    // ==========================================
    window.tungComboBanSung = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc && !isRemote) return;

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;
            if (typeof window.playAnim === 'function' && phim !== 'Q') window.playAnim('ATTACK');

            // 🌟 ĐỒNG HỒ SÚNG
            window.thoiGianTatSung = Date.now() + 1500;
        }

        let viTriGoc, huongMat, mucTieu;
        const dameGoc = window.DAME_CUA_TOI || 120;

        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            viTriGoc = nvc.position.clone(); viTriGoc.y += 3.5;
            huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            let target = window.layMucTieuGanNhatBS(viTriGoc);
            mucTieu = target ? target.clone() : viTriGoc.clone().add(huongMat.clone().multiplyScalar(500));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'BanSung',
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z },
                    weaponUrl: window.WEAPON_URL
                })), { reliable: true });
            }
        }

        if (phim === 'Q') {
            const dan = taoVienDanXin(1.5);
            let offset = new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 0);
            dan.position.copy(viTriGoc).add(offset); dan.lookAt(mucTieu); scene.add(dan);
            // 💥 TĂNG DAME Q LÊN 1.5
            kyNangBanSung.push({ mesh: dan, type: 'Q', speed: 10.0, life: 50, targetPos: mucTieu, damage: dameGoc * 0.025, isRemote: isRemote });
        }
        else if (phim === 'E') {
            const tenLua = taoHoaTienXin(1.5);
            tenLua.position.copy(viTriGoc); tenLua.lookAt(mucTieu); scene.add(tenLua);
            // 💥 TĂNG DAME E LÊN 40.0
            kyNangBanSung.push({ mesh: tenLua, type: 'E', speed: 2.0, life: 150, targetPos: mucTieu, damage: dameGoc * 0.25, isRemote: isRemote });
        }
        else if (phim === 'R') {
            for (let i = 0; i < 3; i++) {
                const bom = taoHoaTienXin(0.8); bom.position.copy(viTriGoc); scene.add(bom);
                let targetLech = mucTieu.clone().add(new THREE.Vector3((Math.random() - 0.5) * 15, 0, (Math.random() - 0.5) * 15));
                // 💥 TĂNG DAME R LÊN 25.0
                kyNangBanSung.push({
                    mesh: bom, type: 'BAY_VONG_CUNG', state: 'CHO_DEN_LUOT', fireDelay: i * 15,
                    startPos: viTriGoc.clone(), targetPos: targetLech, progress: 0, speed: 0.02, arcHeight: 20,
                    upVector: new THREE.Vector3(0, 1, 0), life: 200, damage: dameGoc * 0.2, isRemote: isRemote
                });
            }
        }
        else if (phim === 'F') {
            const mayBay = taoMayBayXin(3.0);
            let xuatPhat = viTriGoc.clone().sub(huongMat.clone().multiplyScalar(100)); xuatPhat.y += 50;
            mayBay.position.copy(xuatPhat); mayBay.lookAt(mucTieu); scene.add(mayBay);
            // 💥 TĂNG DAME F LÊN 90.0
            kyNangBanSung.push({ mesh: mayBay, type: 'F_JET', state: 'BAY_TOI', speed: 1.5, life: 1000, targetPos: mucTieu, damage: dameGoc * 0.9, isRemote: isRemote });
        }
    };



    
    



    // ==========================================
    // 📡 HÀM 2: AUTO RADAR + VÒNG LẶP ĐẠN (CHUẨN GỐC + DAME Q 1.5)
    // ==========================================
    window.updateCombatBanSung = function () {


         
        // 🕒 1. QUẢN LÝ ẨN/HIỆN SÚNG (DÙNG BIẾN ĐỘC QUYỀN sungXungKich)
        if (window.sungXungKich) {
            let dangBan = (window.thoiGianTatSung && Date.now() < window.thoiGianTatSung);
            
            if (dangBan) {
                if (!window.sungXungKich.visible) {
                    window.sungXungKich.visible = true;
                    window.sungXungKich.traverse(c => { if(c.isMesh) c.visible = true; });
                }
            } else {
                if (window.sungXungKich.visible) {
                    window.sungXungKich.visible = false;
                    window.sungXungKich.traverse(c => { if(c.isMesh) c.visible = false; });
                }
            }
        }



        // 🛡️ 2. BỘ LỌC THÉP (FIX LỖI KÉO CHẠY - KHÔNG LIỆT CHÂN)
        if (typeof window.playAnim === 'function' && !window.playAnimGocBS) {
            window.playAnimGocBS = window.playAnim;
            window.playAnim = function (tenAnim) {
                if (window.dangBanTuDong) {
                    let ten = tenAnim.toUpperCase();
                    if (ten === 'BAY' || ten === 'FLY' || ten === 'FALL') return;
                    if ((ten === 'IDLE' || ten === 'NHANROI') && !window.isKeyboardMoving && !window.isMoving) return;
                }
                window.playAnimGocBS(tenAnim);
            };
        }

        if (!window.thoiGianHoiQ_Auto) window.thoiGianHoiQ_Auto = 0;
        if (window.thoiGianHoiQ_Auto > 0) window.thoiGianHoiQ_Auto--;

        // 📡 3. RADAR AUTO QUÉT QUÁI
        if (window.mauBanThan > 0 && typeof playerModel !== 'undefined' && playerModel) {
            let targetMoi = null;
            let minDist = 500;
            let originPos = playerModel.position.clone();

            [...(window.danhSachQuaiVat || []), ...Object.values(typeof remotePlayers !== 'undefined' ? remotePlayers : {})].forEach(obj => {
                let mesh = obj.mesh || (obj.status === 'ready' ? obj.mesh : null);
                if (mesh && !(obj.isDead)) {
                    let hit = window.layHitbox(mesh);
                    let d = originPos.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDist) { minDist = d; targetMoi = hit.tamNguc.clone(); }
                }
            });

          



            if (targetMoi) {
                window.dangBanTuDong = true;
                if (window.tatAutoBan) clearTimeout(window.tatAutoBan);
                window.tatAutoBan = setTimeout(() => { window.dangBanTuDong = false; }, 800);


                // ==========================================
                // 🛑 CHẶN LỖI KÉO CHẠY VÀ LỖI BỊ HÚT NGƯỢC (ĐÃ ĐÚNG TÊN BIẾN)
                // ==========================================
                
                // 1. NGĂN ENGINE TỰ CHẠY ÁP SÁT BOSS:
                // Dùng ĐÚNG biến window.targetPosition của engine.js để check
                if (window.isMoving && window.targetPosition) {
                    let distXZ = Math.hypot(window.targetPosition.x - targetMoi.x, window.targetPosition.z - targetMoi.z);
                    
                    // Nếu hệ thống Auto Hunt ép chạy tới gần Boss (đích đến trùng với Boss)
                    // Xạ thủ thì phải đứng xa xả đạn, nên ta bóp phanh ép đứng im ngay lập tức!
                    if (distXZ < 30) {
                        window.isMoving = false;
                    }
                }

                // 2. XOAY MẶT THÔNG MINH:
                // CHỈ ép xoay mặt vào Boss khi Sếp ĐỨNG YÊN HOÀN TOÀN
                if (!window.isKeyboardMoving && !window.isMoving) {
                    let upV = playerModel.up.clone().normalize();
                    let vectorToTarget = targetMoi.clone().sub(playerModel.position);
                    let khoangCachDoc = vectorToTarget.dot(upV);
                    let hinhChieuNgang = targetMoi.clone().sub(upV.clone().multiplyScalar(khoangCachDoc));
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(playerModel.position); 
                    dummy.up.copy(upV); 
                    dummy.lookAt(hinhChieuNgang);
                    
                    playerModel.quaternion.slerp(dummy.quaternion, 0.2);
                }

                // --- PHẦN BẮN AUTO-Q BÊN DƯỚI GIỮ NGUYÊN ---






                if (window.thoiGianHoiQ_Auto <= 0) {
                    window.thoiGianHoiQ_Auto = 30;
                    window.thoiGianTatSung = Date.now() + 1500; // Hiện súng

                    let startPos = originPos.clone().add(playerModel.up.clone().multiplyScalar(3));
                    let xuongTayTrai = null;
                    playerModel.traverse(c => {
                        if (c.isBone && (c.name.includes('LeftHand') || c.name.toLowerCase().includes('hand_l') || c.name.toLowerCase().includes('lefthand'))) {
                            xuongTayTrai = c;
                        }
                    });
                    if (xuongTayTrai) { startPos = new THREE.Vector3(); xuongTayTrai.getWorldPosition(startPos); }

                    let tia = taoTiaDanNhanh();
                    tia.position.copy(startPos); tia.lookAt(targetMoi); scene.add(tia);

                    // 💥  AUTO-Q LÊN 
                    kyNangBanSung.push({
                        mesh: tia, type: 'Q', state: 'DANG_BAY', speed: 10.0, life: 50,
                        targetPos: targetMoi, damage: (window.DAME_CUA_TOI || 100) * 0.025, isRemote: false
                    });

                    if (typeof window.playAnimGocBS === 'function') {
                        if (!window.lastAnimTimeBS || Date.now() - window.lastAnimTimeBS > 1000) {
                            window.playAnimGocBS('ATTACK');
                            window.lastAnimTimeBS = Date.now();
                        }
                    }

                    if (window.room && window.room.state === 'connected') {
                        try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'SKILL', phim: 'Q', phai: 'BAN_SUNG', target: { x: targetMoi.x, y: targetMoi.y, z: targetMoi.z } })), { reliable: true }); } catch (e) { }
                    }
                }
            }
        }

        // =====================================
        // 🚀 LÕI RENDER VÀ ĐẠN ĐẠO
        // =====================================
        for (let i = kyNangBanSung.length - 1; i >= 0; i--) {
            let skill = kyNangBanSung[i];
            if (skill.delay > 0) { skill.delay--; continue; }
            skill.life--;

            // --- CHIÊU Q ---
            if (skill.type === 'Q') {
                skill.mesh.translateZ(skill.speed);
                if (skill.targetPos && skill.mesh.position.distanceTo(skill.targetPos) < skill.speed + 3 || skill.life < 5) {
                    taoVuNoBS(skill.targetPos, skill.isRemote, Math.round(skill.damage), 2);
                    skill.life = 0;
                }
            }
            // --- CHIÊU E ---
            else if (skill.type === 'E') {
                skill.speed *= 1.05; if (skill.speed > 8.0) skill.speed = 8.0;
                if (skill.targetPos) {
                    if (!skill.isRemote) {
                        const fwd = new THREE.Vector3(); skill.mesh.getWorldDirection(fwd);
                        const mucTieuMoi = window.layMucTieuGanNhatBS(skill.mesh.position, fwd);
                        if (mucTieuMoi) skill.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(skill.mesh.position); dummy.lookAt(skill.targetPos);
                    skill.mesh.quaternion.slerp(dummy.quaternion, 0.15);
                }
                skill.mesh.translateZ(skill.speed);

                if (skill.targetPos && skill.mesh.position.distanceTo(skill.targetPos) < skill.speed + 4 || skill.life < 5) {
                    taoVuNoBS(skill.targetPos, skill.isRemote, Math.round(skill.damage), 15);
                    skill.life = 0;
                }
            }
            // --- CHIÊU R: ĐẠI BÁC CẦU VỒNG (PARABOL) ---
            else if (skill.type === 'BAY_VONG_CUNG') {
                if (skill.state === 'CHO_DEN_LUOT') {
                    skill.fireDelay--;
                    if (skill.fireDelay <= 0) {
                        skill.state = 'DANG_BAY';

                        // 🌟 DẠY NHÂN VẬT GIẬT SÚNG
                        if (!skill.isRemote && typeof window.playAnim === 'function') {
                            window.playAnim('ATTACK');
                        }

                        if (!skill.isRemote && typeof playerModel !== 'undefined' && playerModel) {
                            let upV = playerModel.up.clone().normalize();
                            let fwd = new THREE.Vector3(); playerModel.getWorldDirection(fwd); fwd.normalize();
                            let right = new THREE.Vector3().crossVectors(fwd, upV).normalize().negate();
                            skill.startPos = playerModel.position.clone().add(upV.multiplyScalar(3)).add(right.multiplyScalar(1));
                        }
                    }
                }
                else if (skill.state === 'DANG_BAY') {
                    skill.speed *= 1.02;
                    skill.progress += skill.speed;

                    let curPos = new THREE.Vector3().lerpVectors(skill.startPos, skill.targetPos, skill.progress);
                    curPos.add(skill.upVector.clone().multiplyScalar(Math.sin(skill.progress * Math.PI) * skill.arcHeight));

                    let nextProgress = skill.progress + 0.05;
                    let nextPos = new THREE.Vector3().lerpVectors(skill.startPos, skill.targetPos, nextProgress);
                    nextPos.add(skill.upVector.clone().multiplyScalar(Math.sin(nextProgress * Math.PI) * skill.arcHeight));

                    skill.mesh.position.copy(curPos);
                    skill.mesh.lookAt(nextPos);

                    if (skill.progress >= 1) {
                        skill.life = 0;
                        taoVuNoBS(skill.targetPos, skill.isRemote, Math.round(skill.damage), 30);
                        if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(skill.targetPos, 20, 0xff5500);
                    }
                }
            }




            
            // --- CHIÊU F: BAY THẲNG ĐÂM THẲNG  
            else if (skill.type === 'F_JET') {
                // 1. Gia tốc: Bắt đầu chậm rồi rít ga lao nhanh vào mặt Boss
                skill.speed *= 1.05; 
                if (skill.speed > 1.5) skill.speed = 1.5;

                // 2. Khóa cứng mục tiêu: Luôn chĩa mũi máy bay vào Boss dù Boss có bỏ chạy
                if (skill.targetPos) {
                    const dummy = new THREE.Object3D(); 
                    dummy.position.copy(skill.mesh.position); 
                    dummy.lookAt(skill.targetPos);
                    skill.mesh.quaternion.slerp(dummy.quaternion, 0.15);
                }
                
                // 3. Kéo ga lao thẳng tới trước
                skill.mesh.translateZ(skill.speed);

                // 4. Kiểm tra va chạm (Đâm trúng đích hoặc hết xăng)
                if (skill.mesh.position.distanceTo(skill.targetPos) < skill.speed + 10 || skill.life < 5) {
                    // Nổ với bán kính 50, dame chuẩn 0.9 như Sếp đã cài
                    taoVuNoBS(skill.targetPos, skill.isRemote, Math.round(skill.damage), 50);
                    if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(skill.targetPos, 25, 0xff5500);
                    skill.life = 0; // Xóa sổ máy bay
                }
            }





            if (skill.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(skill.mesh); else scene.remove(skill.mesh);
                kyNangBanSung.splice(i, 1);
            }
        }

        // =====================================
        // 🌟 LÕI RENDER SỐ MÁU & HỮU ỨNG
        // =====================================
        for (let i = danhSachSoBayBS.length - 1; i >= 0; i--) {
            let s = danhSachSoBayBS[i];
            s.life--;
            s.offsetY += 0.05;
            let hienThiPos = s.pos.clone();
            hienThiPos.y += s.offsetY;

            if (window.camera) {
                let screenPos = hienThiPos.clone().project(window.camera);
                let x = (screenPos.x * .5 + .5) * window.innerWidth;
                let y = (screenPos.y * -.5 + .5) * window.innerHeight;
                s.el.style.left = x + 'px';
                s.el.style.top = y + 'px';
                s.el.style.opacity = s.life / 60;
            }

            if (s.life <= 0) {
                if (s.el.parentNode) s.el.parentNode.removeChild(s.el);
                danhSachSoBayBS.splice(i, 1);
            }
        }

        for (let i = hieuUngBanSung.length - 1; i >= 0; i--) {
            let h = hieuUngBanSung[i];
            h.life--;
            if (h.mesh) {
                h.mesh.scale.multiplyScalar(0.9);
                if (h.mesh.material) h.mesh.material.opacity = h.life / 20;
            }
            if (h.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(h.mesh);
                else scene.remove(h.mesh);
                hieuUngBanSung.splice(i, 1);
            }
        }
    };





       











    // 🌟 CHẠY NGẦM LIÊN TỤC ĐỂ MÁY PHÁI KHÁC CŨNG QUÉT RÁC ĐƯỢC
    setInterval(window.updateCombatBanSung, 30);

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_bansung')) {
        window.HePhaiHienTai = {
            tenPhai: "Xạ Thủ",









            // 🌟 ĐỒNG BỘ FINAL: ĐỔI TÊN BIẾN THÀNH sungXungKich ĐỂ KHÔNG ĐỤNG HÀNG ENGINE
            khoiTao: function () {
                console.log("🔫 Xạ Thủ: Khởi tạo súng chuẩn, độc lập với Engine!");
                let urlVuKhi = 'uploads/anims/GUN.glb';

                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset(urlVuKhi, (sungGoc) => {
                        window.sungWrapper = new THREE.Group();
                        window.sungWrapper.add(sungGoc);
                        window.sungXungKich = window.sungWrapper; // 🌟 Tên mới độc quyền!

                        window.sungWrapper.updateMatrixWorld(true);
                        const box = new THREE.Box3().setFromObject(window.sungWrapper);
                        const size = box.getSize(new THREE.Vector3());
                        const chieuDaiGoc = Math.max(size.x, size.y, size.z) || 1;

                        if (typeof playerModel !== 'undefined' && playerModel) {
                            let xuongTayTrai = null;
                            playerModel.traverse(c => {
                                if (c.isBone && (c.name.includes('LeftHand') || c.name.toLowerCase().includes('hand_l') || c.name.toLowerCase().includes('lefthand'))) {
                                    xuongTayTrai = c;
                                }
                            });

                            if (xuongTayTrai) {
                                xuongTayTrai.add(window.sungWrapper);

                                let tiLeThuc = new THREE.Vector3();
                                xuongTayTrai.getWorldScale(tiLeThuc);
                                let scaleFix = tiLeThuc.x > 0 ? tiLeThuc.x : 1;

                                let tiLeCuoi = (1.3 / chieuDaiGoc) / scaleFix;
                                window.sungWrapper.scale.set(tiLeCuoi, tiLeCuoi, tiLeCuoi);

                                window.sungWrapper.position.set(0, 0, 0);
                                window.sungWrapper.rotation.set(1.37, -2.36, 0.98); // Tọa độ Vàng
                            }
                        }

                        window.sungXungKich.visible = false; 
                        window.sungXungKich.traverse(c => { if(c.isMesh) c.visible = false; });
                    });
                }
            },


            




            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) {
                window.tungComboBanSung(phim, isRemote, origin, target, dir, casterId, weaponUrl);
            },
            phongThu: function () { },
            capNhat: function () { } // Đã chạy ngầm, để rỗng để chống chạy 2 lần
        };


        window.HePhaiHienTai.khoiTao();
    }
})();
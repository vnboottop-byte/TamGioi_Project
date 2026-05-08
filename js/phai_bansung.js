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
        let targetPos = null; let minD = 400; 
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
    // 🏹 HÀM 1: TUNG CHIÊU BẰNG TAY (Q, E, R, F)
    // ==========================================
    window.tungComboBanSung = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc && !isRemote) return;

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;
            if (typeof window.playAnim === 'function' && phim !== 'Q') window.playAnim('ATTACK');

            if (window.vuKhiModel) {
                window.vuKhiModel.visible = true;
                if (window.vuKhiModel.hideTimeout) clearTimeout(window.vuKhiModel.hideTimeout);
                window.vuKhiModel.hideTimeout = setTimeout(() => { if (window.vuKhiModel) window.vuKhiModel.visible = false; }, 1500);
            }
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
            mucTieu = target ? target.clone() : viTriGoc.clone().add(huongMat.clone().multiplyScalar(500)); // 🌟 CHUẨN 500M

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'BanSung',
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z },
                    weaponUrl: window.WEAPON_URL
                })), { reliable: true });
            }
        }

        let upVector = isRemote ? viTriGoc.clone().normalize() : nvc.up.clone().normalize();
        let rightVector = new THREE.Vector3().crossVectors(huongMat, upVector).normalize().negate();

        // --- CHIÊU Q: BẮN ĐẠN THƯỜNG ---
        if (phim === 'Q') {
            const dan = taoVienDanXin(1.5);
            let offset = new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 0);
            dan.position.copy(viTriGoc).add(offset); dan.lookAt(mucTieu); scene.add(dan);
            kyNangBanSung.push({ mesh: dan, type: 'Q', speed: 10.0, life: 50, targetPos: mucTieu, damage: dameGoc * 0.1, isRemote: isRemote });
        }
        // --- CHIÊU E: TÊN LỬA (40% Dame) ---
        else if (phim === 'E') {
            for (let i = 0; i < 5; i++) {
                const hoaTien = taoHoaTienXin(3.0);
                let lech = new THREE.Vector3().crossVectors(huongMat, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar((i - 2) * 2);
                hoaTien.position.copy(viTriGoc.clone().add(lech)); hoaTien.lookAt(mucTieu); scene.add(hoaTien);
                kyNangBanSung.push({ mesh: hoaTien, type: 'E', speed: 0.5, life: 100, targetPos: mucTieu, damage: dameGoc * 0.40, delay: i * 5, isRemote: isRemote });
            }
        }
        // --- CHIÊU R: ĐẠI BÁC PARABOL (6% x 10 = 60% Dame) ---
        else if (phim === 'R') {
            const soLuong = 10;
            for (let i = 0; i < soLuong; i++) {
                const dan = taoVienDanXin(3.0); 
                let rX = (Math.random() - 0.5) * 15; let rZ = (Math.random() - 0.5) * 15;
                let startPos = viTriGoc.clone().add(upVector.clone().multiplyScalar(3)).add(rightVector.clone().multiplyScalar(1));
                let dichRoi = mucTieu.clone().add(rightVector.clone().multiplyScalar(rX)).add(huongMat.clone().multiplyScalar(rZ));
                dan.position.copy(startPos); dan.lookAt(dichRoi); scene.add(dan);
                
                kyNangBanSung.push({
                    mesh: dan, type: 'BAY_VONG_CUNG', state: 'CHO_DEN_LUOT',
                    speed: 0.015 + (Math.random() * 0.005), life: 400, 
                    startPos: startPos.clone(), targetPos: dichRoi,
                    damage: dameGoc * 0.06,  
                    arcHeight: 40 + Math.random() * 20, fireDelay: i * 6, progress: 0, isRemote: isRemote, upVector: upVector.clone()
                });
            }
        }
        // --- CHIÊU F: MÁY BAY KAMIKAZE (100% Dame) ---
        else if (phim === 'F') {
            let tamCumQuai = timTamCumQuaiDongNhat(mucTieu, 100, 30);
            const jet = taoMayBayXin(8.0);
            const startPos = viTriGoc.clone().add(new THREE.Vector3(0, 30, 0)).sub(huongMat.clone().multiplyScalar(150));
            jet.position.copy(startPos);
            const flyToPos = tamCumQuai.clone().add(new THREE.Vector3(0, 30, 0));
            jet.lookAt(flyToPos); scene.add(jet);

            kyNangBanSung.push({
                mesh: jet, type: 'F_JET', state: 'BAY_TOI',
                speed: 3.5, life: 800, targetPos: tamCumQuai, targetAltitude: 0,
                damage: dameGoc * 1.00, isRemote: isRemote
            });
        }
    };






    // ==========================================
    // 🛡️ BỘ LỌC THÉP V4: CẤM TUYỆT ĐỐI 'BAY' VÀ 'RƠI' ĐÈ DÁNG SÚNG
    // ==========================================
    if (typeof window.playAnim === 'function' && !window.playAnimGocBS) {
        window.playAnimGocBS = window.playAnim; 
        
        window.playAnim = function(tenAnim) {
            if (window.dangBanTuDong) {
                let ten = tenAnim.toUpperCase();
                
                // 🌟 1. LUÔN LUÔN CHẶN BAY VÀ RƠI (Dù có bấm phím bay hay không)
                // Nhân vật sẽ dịch chuyển lên trời nhưng vẫn giữ nguyên dáng giơ súng ngầu lòi!
                if (ten === 'BAY' || ten === 'FLY' || ten === 'FALL') {
                    return; 
                }
                
                // 🌟 2. VỚI DI CHUYỂN DƯỚI ĐẤT: Chỉ chặn IDLE nếu đứng yên. 
                // (Nếu Sếp bấm chạy bộ CHAYBO thì vẫn cho phép múa chân)
                if ((ten === 'IDLE' || ten === 'NHANROI') && !window.isKeyboardMoving) {
                    return; 
                }
            }
            window.playAnimGocBS(tenAnim);
        };
    }







    window.updateCombatBanSung = function () {
        // ==========================================
        // 🛡️ BỘ LỌC THÉP V5 (LAZY INIT): NẰM BÊN TRONG VÒNG LẶP ĐỂ TÓM GỌN ENGINE.JS
        // ==========================================
        if (typeof window.playAnim === 'function' && !window.playAnimGocBS) {
            window.playAnimGocBS = window.playAnim; 
            window.playAnim = function(tenAnim) {
                if (window.dangBanTuDong) {
                    let ten = tenAnim.toUpperCase();
                    // 1. Cấm tuyệt đối Bay và Rớt khi đang nhả đạn
                    if (ten === 'BAY' || ten === 'FLY' || ten === 'FALL') return; 
                    // 2. Cấm IDLE nếu đang không bấm phím WASD
                    if ((ten === 'IDLE' || ten === 'NHANROI') && !window.isKeyboardMoving) return; 
                }
                window.playAnimGocBS(tenAnim);
            };
            console.log("🔫 Đã cấy Bộ Lọc Thép V5 thành công!");
        }

        if (!window.thoiGianHoiQ_Auto) window.thoiGianHoiQ_Auto = 0;
        if (window.thoiGianHoiQ_Auto > 0) window.thoiGianHoiQ_Auto--;

        // ==========================================
        // 📡 MẮT THẦN RADAR
        // ==========================================
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
                // 🌟 Bật cờ khóa chặn Animation
                window.dangBanTuDong = true;
                if (window.tatAutoBan) clearTimeout(window.tatAutoBan);
                window.tatAutoBan = setTimeout(() => { window.dangBanTuDong = false; }, 800);

                // 🌟 AUTO-AIM: TỰ ĐỘNG XOAY MẶT VỀ PHÍA ĐỊCH
                if (!window.isKeyboardMoving) {
                    let upV = playerModel.up.clone().normalize();
                    let vectorToTarget = targetMoi.clone().sub(playerModel.position);
                    let khoangCachDoc = vectorToTarget.dot(upV);
                    let hinhChieuNgang = targetMoi.clone().sub(upV.clone().multiplyScalar(khoangCachDoc));
                    
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(playerModel.position);
                    dummy.up.copy(upV);
                    dummy.lookAt(hinhChieuNgang);
                    playerModel.quaternion.slerp(dummy.quaternion, 0.2); // Quay mượt
                }





                // 🌟 NÃ ĐẠN (Chỉ nã khi hết thời gian chờ)
                if (window.thoiGianHoiQ_Auto <= 0) {
                    window.thoiGianHoiQ_Auto = 30; 
                    
                    // 🌟 1. RÚT SÚNG RA & HẸN GIỜ CẤT SÚNG SAU 1.5 GIÂY
                    if (window.vuKhiModel) {
                        window.vuKhiModel.visible = true; // Hiện súng
                        if (window.vuKhiModel.hideTimeout) clearTimeout(window.vuKhiModel.hideTimeout);
                        window.vuKhiModel.hideTimeout = setTimeout(() => {
                            if (window.vuKhiModel) window.vuKhiModel.visible = false; // Tự cất súng
                        }, 1500);
                    }

                    // 🌟 2. XUẤT ĐẠN TỪ TAY PHẢI CHO KHỚP VỚI NÒNG SÚNG
                    let startPos = originPos.clone().add(playerModel.up.clone().multiplyScalar(3));
                    let tayPhai = null;
                    playerModel.traverse(c => {
                        if (c.isBone && (c.name.toLowerCase().includes('hand_r') || c.name.toLowerCase().includes('righthand') || c.name.toLowerCase().includes('hand.r'))) {
                            tayPhai = c;
                        }
                    });
                    if (tayPhai) { startPos = new THREE.Vector3(); tayPhai.getWorldPosition(startPos); }

                    let tia = taoTiaDanNhanh();
                    tia.position.copy(startPos); tia.lookAt(targetMoi); scene.add(tia);

                    kyNangBanSung.push({
                        mesh: tia, type: 'Q_AUTO', state: 'DANG_BAY', speed: 10.0, life: 55, 
                        targetPos: targetMoi, damage: (window.DAME_CUA_TOI || 100) * 0.016, isRemote: false 
                    });

                    // 🌟 GỌI ANIMATION ATTACK XUYÊN BỘ LỌC
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

        // ==========================================
        // 🚀 VÒNG LẶP CẬP NHẬT ĐẠN BAY & TRỪ MÁU (Phần này sếp giữ nguyên bên dưới nhé)
        // ==========================================
        for (let i = kyNangBanSung.length - 1; i >= 0; i--) {
            let s = kyNangBanSung[i];
            if (s.delay > 0) { s.delay--; continue; }
            s.life--;

            if (s.type === 'Q_AUTO' || s.type === 'Q') {
                s.mesh.translateZ(s.speed);
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 5 || s.life < 5) {
                    taoVuNoBS(s.targetPos, s.isRemote, Math.round(s.damage), 5);
                    s.life = 0;
                }
            }
            




    


            else if (s.type === 'E') {
                s.speed *= 1.05; if (s.speed > 8.0) s.speed = 8.0;
                if (s.targetPos) {
                    if (!s.isRemote) {
                        const fwd = new THREE.Vector3(); s.mesh.getWorldDirection(fwd);
                        const mucTieuMoi = window.layMucTieuGanNhatBS(s.mesh.position, fwd);
                        if (mucTieuMoi) s.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.15);
                }
                s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life < 5) {
                    taoVuNoBS(s.targetPos, s.isRemote, Math.round(s.damage), 15);
                    s.life = 0;
                }
            }
            else if (s.type === 'BAY_VONG_CUNG') {
                if (s.state === 'CHO_DEN_LUOT') {
                    s.fireDelay--;
                    if (s.fireDelay <= 0) {
                        s.state = 'DANG_BAY';
                        if (!window.lastAnimTimeBS || Date.now() - window.lastAnimTimeBS > 1500) {
                            // Tương tự, nếu đang đi thì khỏi múa tay
                            if (!s.isRemote && typeof window.playAnim === 'function' && !window.isKeyboardMoving) {
                                window.playAnim('ATTACK');
                            }
                            window.lastAnimTimeBS = Date.now();
                        }
                        if (!s.isRemote && typeof playerModel !== 'undefined' && playerModel) {
                            let upV = playerModel.up.clone().normalize();
                            let fwd = new THREE.Vector3(); playerModel.getWorldDirection(fwd); fwd.normalize();
                            let right = new THREE.Vector3().crossVectors(fwd, upV).normalize().negate();
                            s.startPos = playerModel.position.clone().add(upV.multiplyScalar(3)).add(right.multiplyScalar(1));
                        }
                    }
                }
                else if (s.state === 'DANG_BAY') {
                    s.speed *= 1.02; s.progress += s.speed;
                    let curPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, s.progress);
                    curPos.add(s.upVector.clone().multiplyScalar(Math.sin(s.progress * Math.PI) * s.arcHeight));
                    let nextProgress = s.progress + 0.05;
                    let nextPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, nextProgress);
                    nextPos.add(s.upVector.clone().multiplyScalar(Math.sin(nextProgress * Math.PI) * s.arcHeight));
                    s.mesh.position.copy(curPos); s.mesh.lookAt(nextPos);

                    if (s.progress >= 1) {
                        s.life = 0;
                        taoVuNoBS(s.targetPos, s.isRemote, Math.round(s.damage), 30);
                        if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(s.targetPos, 20, 0xff5500);
                    }
                }
            }
            else if (s.type === 'F_JET') {
                if (s.state === 'BAY_TOI') {
                    s.mesh.translateZ(s.speed);
                    let distXZ = Math.hypot(s.mesh.position.x - s.targetPos.x, s.mesh.position.z - s.targetPos.z);
                    if (distXZ < 80) { s.state = 'BAY_LEN_CAO'; s.targetAltitude = s.mesh.position.y + 150; }
                }
                else if (s.state === 'BAY_LEN_CAO') {
                    s.speed *= 1.05; s.mesh.translateZ(s.speed);
                    if (s.mesh.rotation.x > -Math.PI / 2.5) { s.mesh.rotateX(-0.06); }
                    if (s.mesh.position.y >= s.targetAltitude) { s.state = 'DAM_XUONG'; }
                }
                else if (s.state === 'DAM_XUONG') {
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.15);
                    s.speed *= 1.1; if (s.speed > 15.0) s.speed = 15.0;
                    s.mesh.translateZ(s.speed);

                    if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5 || s.mesh.position.y <= s.targetPos.y + 2) {
                        taoVuNoBS(s.targetPos, s.isRemote, Math.round(s.damage), 50);
                        if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(s.targetPos, 25, 0xff5500);
                        s.life = 0;
                    }
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangBanSung.splice(i, 1);
            }
        }

        // 🗑️ LÒ ĐỐT RÁC UI (GIỮ NGUYÊN)
        for (let i = danhSachSoBayBS.length - 1; i >= 0; i--) { 
            let s = danhSachSoBayBS[i]; s.life--; s.offsetY += 0.05;
            let hienThiPos = s.pos.clone(); hienThiPos.y += s.offsetY;
            if (window.camera) {
                let screenPos = hienThiPos.clone().project(window.camera);
                let x = (screenPos.x * .5 + .5) * window.innerWidth;
                let y = (screenPos.y * -.5 + .5) * window.innerHeight;
                s.el.style.left = x + 'px'; s.el.style.top = y + 'px'; s.el.style.opacity = s.life / 60;
            }
            if (s.life <= 0) { if (s.el.parentNode) s.el.parentNode.removeChild(s.el); danhSachSoBayBS.splice(i, 1); }
        }

        for (let i = hieuUngBanSung.length - 1; i >= 0; i--) { 
            let h = hieuUngBanSung[i]; h.life--;
            if (h.mesh) { h.mesh.scale.multiplyScalar(0.9); if (h.mesh.material) h.mesh.material.opacity = h.life / 20; }
            if (h.life <= 0) { if (typeof window.donRac3D === 'function') window.donRac3D(h.mesh); else scene.remove(h.mesh); hieuUngBanSung.splice(i, 1); }
        }
    };






    // 🌟 CHẠY NGẦM LIÊN TỤC ĐỂ MÁY PHÁI KHÁC CŨNG QUÉT RÁC ĐƯỢC
    setInterval(window.updateCombatBanSung, 30);

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_bansung')) {
        window.HePhaiHienTai = {
            tenPhai: "Xạ Thủ",









            // 🌟 ĐỒNG BỘ V46: DÍNH 0,0,0 CỦA SÚNG VÀO TAY TRÁI NHÂN VẬT
            khoiTao: function () {
                console.log("🔫 Khởi tạo Xạ Thủ: Bám gốc 0,0,0 vào Tay Trái!");
                let urlVuKhi = 'uploads/anims/GUN.glb';

                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset(urlVuKhi, (modelSieuToc) => {
                        window.vuKhiModel = modelSieuToc;

                        window.vuKhiModel.updateMatrixWorld(true);
                        const box = new THREE.Box3().setFromObject(window.vuKhiModel);
                        const size = box.getSize(new THREE.Vector3());
                        const chieuDaiGoc = Math.max(size.x, size.y, size.z);

                        if (typeof playerModel !== 'undefined' && playerModel) {
                            let xuongTayTrai = null;

                            // 🌟 TÌM TAY TRÁI ĐỂ ĐỠ NÒNG SÚNG
                            playerModel.traverse(c => {
                                if (c.isBone && (c.name.includes('LeftHand') || c.name.toLowerCase().includes('hand_l') || c.name.toLowerCase().includes('lefthand'))) {
                                    xuongTayTrai = c;
                                }
                            });

                            if (xuongTayTrai) {
                                xuongTayTrai.add(window.vuKhiModel);

                                // Bơm scale trị lỗi Mixamo
                                let tiLeThuc = new THREE.Vector3();
                                xuongTayTrai.getWorldScale(tiLeThuc);
                                let scaleFix = tiLeThuc.x > 0 ? tiLeThuc.x : 1;

                                let tiLeCuoi = (1.3 / chieuDaiGoc) / scaleFix;
                                window.vuKhiModel.scale.set(tiLeCuoi, tiLeCuoi, tiLeCuoi);

                                // 🌟 CHUẨN BÀI: 0,0,0 CỦA SÚNG DÍNH CHẶT VÀO XƯƠNG TAY TRÁI
                                window.vuKhiModel.position.set(0, 0, 0);

                                // 🌟 Sếp bẻ góc xoay ở đây để đuôi súng chĩa về tay phải nhé!
                                window.vuKhiModel.rotation.set(0, 0, 0);
                            }
                        }

                        // Tạm bật TRUE để sếp ngắm vuốt bẻ góc xoay
                        window.vuKhiModel.visible = true;

                        // ==========================================
                        // 🔧 TOOL ĐỘ SÚNG TRỰC TIẾP CHO SẾP (BẤM PHÍM U,J, I,K, O,L ĐỂ XOAY)
                        // ==========================================
                        if (!window.daCaiToolXoay) {
                            window.daCaiToolXoay = true;
                            window.addEventListener('keydown', (e) => {
                                if (!window.vuKhiModel) return;
                                let step = Math.PI / 16; // Nhích từng chút một (11.25 độ)

                                if (e.key === 'u') window.vuKhiModel.rotation.x += step;
                                if (e.key === 'j') window.vuKhiModel.rotation.x -= step;

                                if (e.key === 'i') window.vuKhiModel.rotation.y += step;
                                if (e.key === 'k') window.vuKhiModel.rotation.y -= step;

                                if (e.key === 'o') window.vuKhiModel.rotation.z += step;
                                if (e.key === 'l') window.vuKhiModel.rotation.z -= step;

                                if (['u', 'j', 'i', 'k', 'o', 'l'].includes(e.key)) {
                                    console.log(`%c🎯 GÓC CHUẨN ĐÂY SẾP ƠI: window.vuKhiModel.rotation.set(${window.vuKhiModel.rotation.x.toFixed(2)}, ${window.vuKhiModel.rotation.y.toFixed(2)}, ${window.vuKhiModel.rotation.z.toFixed(2)});`, 'color: #00ff00; font-size: 14px; font-weight: bold;');
                                }
                            });
                        }
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
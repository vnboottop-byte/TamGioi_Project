// ==========================================
// 🧔 MÔN PHÁI ĐOẠT XÁ: TỨ HOÀNG RÂU TRẮNG (BỐ GIÀ)
// 👑 CÔNG NGHỆ: ANIMATION-SYNC SKILLS + SHOCKWAVE EXPANSION + HAKI LIGHTING
// ==========================================

(function () {
    const kyNangWB = [];
    const hieuUngWB = [];
    const danhSachSoBayWB = [];

    window.KHO_ANIM_NHANROI = [];
    window.tongSoChuNoi_WB = 0;

    // 🌟 1. HIỂN THỊ DAME
    function taoSoSatThuongWB(pos3D, satThuong, mauSac = '#ffffff') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_WB > 5) return;
        window.tongSoChuNoi_WB++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #444444';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayWB.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatWB = function (viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 150) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 150;
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

        let targetQuai = null; let minDQuai = 150;
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDQuai) { minDQuai = d; targetQuai = quai; }
                }
            });
        }
        return targetQuai;
    };

    function gaySatThuongWB(tamNo, luongSatThuong, banKinh, mauDame = '#ffffff') {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongWB(posHienSo, luongSatThuong, mauDame);
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
                            taoSoSatThuongWB(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff0000');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongWB(hit.tamNguc.clone(), luongSatThuong, mauDame);
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

    // 🌟 2. ĐÚC MODEL BỌC THÉP TỐI ƯU
    // 🌟 2. ĐÚC MODEL BỌC THÉP TỐI ƯU (CÓ CHẠY ANIMATION CHO ĐẠN)
    function taoVatTheWB(tenFile, scaleSize, isHaki = false) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let danhSachMat = Array.isArray(c.material) ? c.material : [c.material];
                        danhSachMat.forEach(m => {
                            m.transparent = true;
                            if (isHaki) { // 🌟 BÍ THUẬT: ÉP MÀU HAKI ĐEN - TÍM ĐẬM
                                m.map = null; 
                                if (m.color) m.color.setHex(0x0a001a); // Đen ám tím
                                if (m.emissive) {
                                    m.emissive.setHex(0x330066); // Sáng tím đậm
                                    m.emissiveIntensity = 3.0; 
                                }
                            }
                        });
                    }
                });

                // 🌟 BÍ THUẬT: KÍCH HOẠT ANIMATION BÊN TRONG MODEL ĐẠN (energy.glb)
                if (v.animations && v.animations.length > 0) {
                    let mixer = new THREE.AnimationMixer(v);
                    mixer.clipAction(v.animations[0]).play();
                    group.userData = group.userData || {};
                    group.userData.mixer = mixer; // Lưu lại để chạy trong vòng lặp
                }

                v.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(v);
                const size = new THREE.Vector3(); box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                let tiLeChuan = scaleSize / maxDim;
                v.scale.set(tiLeChuan, tiLeChuan, tiLeChuan);
                v.rotation.set(0, 0, 0);
                group.add(v);
            });
        }
        return group;
    }

    // TÌM XƯƠNG TAY THEO ID
    function timXuong(nvc, dsTen) {
        let xuong = null;
        nvc.traverse(c => {
            if (dsTen.includes(c.name) && !xuong) xuong = c;
        });
        return xuong;
    }

    window.thoiDiemChemCuoi_WB = window.thoiDiemChemCuoi_WB || 0;

    // ==========================================
    // ⚔️ TUNG CHIÊU BỐ GIÀ RÂU TRẮNG
    // ==========================================
    window.tungComboWhitebeard = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        // 🌟 BÍ THUẬT: BỐC THĂM ANIMATION ĐỂ QUYẾT ĐỊNH CHIÊU THỨC SẼ RA
        let animCanMua = '';
        if (phim === 'Q') {
            let poolQ = ['ATTACK5', 'ATTACK6', 'ATTACK7'];
            animCanMua = poolQ[Math.floor(Math.random() * poolQ.length)];
        } else if (phim === 'E') {
            animCanMua = 'ATTACK4';
        } else if (phim === 'R') {
            let poolR = ['ATTACK2', 'ATTACK3'];
            animCanMua = poolR[Math.floor(Math.random() * poolR.length)];
        } else if (phim === 'F') {
            animCanMua = 'ATTACK1';
        }

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - window.thoiDiemChemCuoi_WB < 800) return;
            window.thoiDiemChemCuoi_WB = bayGio;
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua); // 🌟 Ép đúng Anim vừa bốc thăm
        }

        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
        let viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));

        let mucTieu = null;
        if (isRemote) {
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            let targetRadar = window.layMucTieuGanNhatWB(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) mucTieu = window.layHitbox(targetRadar.mesh).tamNguc.clone();
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Whitebeard',
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        const dameGoc = window.DAME_CUA_TOI || 100;
        let diemChanMucTieu = mucTieu.clone(); diemChanMucTieu.y = window.matDatY || 0;
        
        let tayChieuF_E = timXuong(nvc, ['Object_12', 'LHand_Palm_038']);
        let tayChieuR = timXuong(nvc, ['Object_10']);

        // ===============================================
        // ⚔️ NHÓM CHIÊU Q: DỰA VÀO ANIMATION ĐÃ BỐC
        // ===============================================
        if (animCanMua === 'ATTACK5') { // 5 KIẾM KHÍ LIÊN HOÀN
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const kq = taoVatTheWB('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 30); 
                    kq.position.copy(viTriGocToTam).add(huongMat.clone().multiplyScalar(2));
                    kq.lookAt(mucTieu); scene.add(kq);
                    kyNangWB.push({ mesh: kq, type: 'BAY_THANG', speed: 8.0, life: 100, targetPos: mucTieu.clone(), damage: dameGoc * 0.08, noBanKinh: 12 }); 
                }, 200 * i);
            }
        } 
        else if (animCanMua === 'ATTACK6') { // 🌟 KIẾM KHÍ NGÔI SAO LỤC GIÁC BAY CHẬM
            setTimeout(() => {
                const gocXoay = [0, Math.PI / 3, -Math.PI / 3]; // Xếp 3 nhát chém thành hình dấu *
                for (let i = 0; i < 3; i++) {
                    const kq = taoVatTheWB('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 40); // Lấy random giống liên hoàn
                    kq.position.copy(viTriGocToTam).add(huongMat.clone().multiplyScalar(2));
                    kq.lookAt(mucTieu); 
                    kq.rotateZ(gocXoay[i]); 
                    scene.add(kq);
                    // Ép speed = 4.0 để bay chậm lại cho dễ ngắm
                    kyNangWB.push({ mesh: kq, type: 'BAY_THANG', speed: 4.0, life: 150, targetPos: mucTieu.clone(), damage: dameGoc * 0.133, noBanKinh: 20 }); 
                }
            }, 300);
        }
        else if (animCanMua === 'ATTACK7') { // 🌟 KIẾM KHÍ HAKI ĐEN TÍM BAY SIÊU CHẬM
            setTimeout(() => {
                const kq = taoVatTheWB('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 50, true); // Bật nhuộm Haki Đen Tím
                kq.position.copy(viTriGocToTam).add(huongMat.clone().multiplyScalar(2));
                kq.lookAt(mucTieu);
                kq.rotateZ(Math.PI / 2); // Dựng đứng
                scene.add(kq);
                // Ép speed = 3.0 lù lù tiến tới áp bức đối thủ
                kyNangWB.push({ mesh: kq, type: 'BAY_THANG', speed: 3.0, life: 180, targetPos: mucTieu.clone(), damage: dameGoc * 0.4, noBanKinh: 25 }); 
            }, 300);
        }

        // (Lưu ý: Giữ nguyên đoạn else if (animCanMua === 'ATTACK4') của chiêu E ở đây)
        else if (animCanMua === 'ATTACK4') { 
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    let diemBan = viTriGocToTam.clone();
                    if (tayChieuF_E) tayChieuF_E.getWorldPosition(diemBan);

                    const cauEnergy = taoVatTheWB('energy', 2); // Bắn ra bằng size nhỏ
                    cauEnergy.position.copy(diemBan).add(huongMat.clone().multiplyScalar(1.5));
                    cauEnergy.lookAt(mucTieu); scene.add(cauEnergy);

                    kyNangWB.push({ 
                        mesh: cauEnergy, type: 'BAY_THANG_PHINH_TO', speed: 8.0, life: 100, 
                        currentScale: 2, maxScale: 12, growthRate: 0.5,
                        targetPos: mucTieu.clone(), damage: dameGoc * 0.06, noBanKinh: 15 
                    });
                }, i * 100);
            }
        }

        // ===============================================
        // 🔮 CHIÊU R: NHÓM CHIÊU TỤ LỰC (XUẤT PHÁT 1M, PHÌNH TO, BAY CHẬM)
        // ===============================================
        else if (animCanMua === 'ATTACK2') { // 🌟 BẮN 1 QUẢ TO TỪ 1M LÊN
            setTimeout(() => {
                let diemBan = viTriGocToTam.clone();
                if (tayChieuR) tayChieuR.getWorldPosition(diemBan);

                const cauEnergy = taoVatTheWB('energy', 1); // Bắt đầu siêu nhỏ 1m
                cauEnergy.position.copy(diemBan).add(huongMat.clone().multiplyScalar(2.0));
                cauEnergy.lookAt(mucTieu); scene.add(cauEnergy);

                kyNangWB.push({ 
                    mesh: cauEnergy, type: 'BAY_THANG_PHINH_TO', speed: 3.5, life: 250, // Bay chậm ngắm nghía
                    currentScale: 1, maxScale: 40, growthRate: 0.6, // To dần
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.6, noBanKinh: 30 
                });
            }, 1000); 
        }
        else if (animCanMua === 'ATTACK3') { // 🌟 RƠI THIÊN THẠCH TỪ 1M TỪ TRÊN TRỜI XUỐNG
            setTimeout(() => {
                const cauEnergy = taoVatTheWB('energy', 1); // Bắt đầu siêu nhỏ 1m
                let posXuatPhat = diemChanMucTieu.clone(); posXuatPhat.y += 100; 
                cauEnergy.position.copy(posXuatPhat);
                cauEnergy.lookAt(diemChanMucTieu); scene.add(cauEnergy);

                kyNangWB.push({ 
                    mesh: cauEnergy, type: 'ROI_THANG_PHINH_TO', speed: 2.0, life: 250, // Rơi chậm
                    currentScale: 1, maxScale: 60, growthRate: 0.8, // Phình to trong lúc rơi
                    targetPos: diemChanMucTieu.clone(), damage: dameGoc * 0.6, noBanKinh: 40 
                });
            }, 500); 
        }
        

        // ===============================================
        // 🌋 CHIÊU F: TỤ 1 GIÂY BẮN RA SÓNG CHẤN ĐỘNG NỨT VỠ (DPS: 1 x 1.0 = 1.0)
        // ===============================================
        else if (animCanMua === 'ATTACK1') { 
            setTimeout(() => {
                let diemBan = viTriGocToTam.clone();
                if (tayChieuF_E) tayChieuF_E.getWorldPosition(diemBan);

                const cauEnergy = taoVatTheWB('energy', 15);
                cauEnergy.position.copy(diemBan).add(huongMat.clone().multiplyScalar(2.0));
                cauEnergy.lookAt(mucTieu); scene.add(cauEnergy);

                kyNangWB.push({ 
                    mesh: cauEnergy, type: 'BAY_THANG_PHINH_TO_F', speed: 7.0, life: 150, 
                    currentScale: 15, maxScale: 60, growthRate: 2.0, // To cực nhanh
                    targetPos: mucTieu.clone(), damage: dameGoc * 1.0, noBanKinh: 50 
                });
            }, 1000); // Chờ 1 giây tụ lực đấm
        }
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ BỐ GIÀ (ĐÃ BỌC THÉP VRAM)
    // ==========================================
    window.updateCombatWB = function () {
        
        for (let i = kyNangWB.length - 1; i >= 0; i--) {
            let s = kyNangWB[i]; s.life--;

            // KIẾM KHÍ BAY THẲNG (CHIÊU Q)
            if (s.type === 'BAY_THANG') {
                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) {
                    gaySatThuongWB(s.targetPos, s.damage, s.noBanKinh, '#cc33ff');
                    s.life = 0;
                }
            }
            // QUẢ CẦU NĂNG LƯỢNG BAY VÀ PHÌNH TO (CHIÊU E, R)
            else if (s.type === 'BAY_THANG_PHINH_TO') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                if (s.mesh.children.length > 0) s.mesh.children[0].rotateY(0.2); // Tự xoay

                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) {
                    gaySatThuongWB(s.targetPos, s.damage, s.noBanKinh);
                    s.life = 0;
                }
            }
            // THIÊN THẠCH NĂNG LƯỢNG RƠI XUỐNG VÀ PHÌNH TO (CHIÊU R)
            else if (s.type === 'ROI_THANG_PHINH_TO') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                if (s.mesh.children.length > 0) s.mesh.children[0].rotateY(0.2);
                
                s.speed *= 1.05; // Gia tốc trọng trường
                s.mesh.position.y -= s.speed;

                if (s.mesh.position.y <= s.targetPos.y + 2) {
                    gaySatThuongWB(s.targetPos, s.damage, s.noBanKinh);
                    s.life = 0;
                }
            }
            // 🌟 CHIÊU F: NỔ SÓNG CHẤN ĐỘNG NỨT VỠ BẦU TRỜI
            else if (s.type === 'BAY_THANG_PHINH_TO_F') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) {
                    gaySatThuongWB(s.targetPos, s.damage, s.noBanKinh);
                    
                    // 🌟 BÍ THUẬT: ĐẠN CHẠM ĐÍCH -> GỌI MẢNH VỠ VFX VÀ XÓA TỐC ĐỘ BAY ĐỂ NÓ NỞ RA TẠI CHỖ
                    const vfx = taoVatTheWB('vfxenergy', 30);
                    vfx.position.copy(s.targetPos); scene.add(vfx);
                    kyNangWB.push({ 
                        mesh: vfx, type: 'NO_CHUNG_DONG_VFX', life: 100, 
                        currentScale: 30, maxScale: 400, growthRate: 15.0 // Phóng to cực đại chớp nhoáng
                    });
                    
                    s.life = 0; // Xóa viên đạn đi
                }
            }
            // 🌟 VẬT LÝ VỤ NỔ CHẤN ĐỘNG (ĐỨNG YÊN VÀ PHÌNH TO RA KHẮP BẢN ĐỒ)
            else if (s.type === 'NO_CHUNG_DONG_VFX') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
            }

            // 🛑 DỌN RÁC MODEL 3D TẬN GỐC
            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') {
                    window.donRac3D(s.mesh);
                } else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangWB.splice(i, 1);
            }
        }

        // Dọn rác Thẻ số nhảy dame
        for (let i = danhSachSoBayWB.length - 1; i >= 0; i--) {
            let it = danhSachSoBayWB[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';

            if (it.life <= 0) {
                it.el.remove(); 
                danhSachSoBayWB.splice(i, 1);
                window.tongSoChuNoi_WB--;
            }
        }
    };
    setInterval(window.updateCombatWB, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.trim() !== '') {
        window.HePhaiHienTai = {
            tenPhai: "Tứ Hoàng Râu Trắng",
            khoiTao: function () {
                console.log("🧔 Sức mạnh hủy diệt thế giới! Khởi động Râu Trắng!");
                // (Logic Init giữ nguyên gốc của Engine để lấy đủ Animations)
            },
            tungChieu: window.tungComboWhitebeard,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
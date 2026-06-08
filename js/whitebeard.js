// ==========================================
// 🧔 MÔN PHÁI ĐOẠT XÁ: TỨ HOÀNG RÂU TRẮNG (BỐ GIÀ)
// 👑 CÔNG NGHỆ: MỞ KHÓA SPAM QERF + VÁ LỖI TRỤC CẦU 3D + KHÔI PHỤC SÁT THƯƠNG
// ==========================================

(function () {
    const kyNangWB = [];
    const hieuUngWB = [];
    const danhSachSoBayWB = [];

    window.KHO_ANIM_NHANROI = [];
    window.tongSoChuNoi_WB = 0;

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
                            if (isHaki) { 
                                m.map = null;
                                if (m.color) m.color.setHex(0x0a001a); 
                                if (m.emissive) {
                                    m.emissive.setHex(0x330066); 
                                    m.emissiveIntensity = 3.0;
                                }
                            }
                        });
                    }
                });

                if (v.animations && v.animations.length > 0) {
                    let mixer = new THREE.AnimationMixer(v);
                    mixer.clipAction(v.animations[0]).play();
                    group.userData = group.userData || {};
                    group.userData.mixer = mixer; 
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

    function timXuong(nvc, dsTen) {
        let xuong = null;
        nvc.traverse(c => {
            if (dsTen.includes(c.name) && !xuong) xuong = c;
        });
        return xuong;
    }

    window.kichHoatDongDat = function (cuongDo, thoiGian) {
        let canvas = document.querySelector('canvas');
        if (!canvas) return;
        let thoiGianConLai = thoiGian; let cuongDoHienTai = cuongDo;
        if (window.vongLapDongDat) clearInterval(window.vongLapDongDat);
        window.vongLapDongDat = setInterval(() => {
            if (thoiGianConLai <= 0) {
                clearInterval(window.vongLapDongDat); canvas.style.transform = 'translate(0px, 0px)'; return;
            }
            canvas.style.transform = `translate(${(Math.random() - 0.5) * cuongDoHienTai}px, ${(Math.random() - 0.5) * cuongDoHienTai}px)`;
            thoiGianConLai -= 30; cuongDoHienTai *= 0.95;
        }, 30);
    };

    window.taoVetNutBangCodeWB = function (pos, curUp) {
        const soTia = 15 + Math.floor(Math.random() * 10); 
        const material = new THREE.LineBasicMaterial({
            color: 0x330055, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending
        });

        const points = [];
        for (let i = 0; i < soTia; i++) {
            let angle = (i / soTia) * Math.PI * 2 + (Math.random() - 0.5);
            let d1 = 5 + Math.random() * 5;
            let px1 = Math.cos(angle) * d1, py1 = Math.sin(angle) * d1, pz1 = (Math.random() - 0.5) * d1;
            points.push(0, 0, 0, px1, py1, pz1); 

            if (Math.random() > 0.2) { 
                let a2 = angle + (Math.random() - 0.5); let d2 = d1 + 3 + Math.random() * 5;
                let px2 = Math.cos(a2) * d2, py2 = Math.sin(a2) * d2, pz2 = (Math.random() - 0.5) * d2;
                points.push(px1, py1, pz1, px2, py2, pz2);

                if (Math.random() > 0.5) { 
                    let a3 = a2 + (Math.random() - 0.5); let d3 = d2 + 3 + Math.random() * 5;
                    points.push(px2, py2, pz2, Math.cos(a3) * d3, Math.sin(a3) * d3, (Math.random() - 0.5) * d3);
                }
            }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        geometry.setDrawRange(0, 0); 

        const line = new THREE.LineSegments(geometry, material);
        line.position.copy(pos); line.scale.set(4, 4, 4); 
        if (curUp) line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curUp);
        scene.add(line);

        kyNangWB.push({ mesh: line, type: 'VET_NUT_CODE', life: 75, maxDraw: points.length, currentDraw: 0, growth: 8 });
    }

    window.tungComboWhitebeard = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        let animCanMua = '';
        if (phim === 'Q') {
            let poolQ = ['ATTACK5', 'ATTACK6', 'ATTACK7'];
            animCanMua = poolQ[Math.floor(Math.random() * poolQ.length)];
        } else if (phim === 'E') animCanMua = 'ATTACK4';
        else if (phim === 'R') {
            let poolR = ['ATTACK2', 'ATTACK3'];
            animCanMua = poolR[Math.floor(Math.random() * poolR.length)];
        } else if (phim === 'F') animCanMua = 'ATTACK1';

        // ===============================================
        // 🌟 BƯỚC ĐỘT PHÁ TẠI ĐÂY: XÓA `return` BLOCK 800MS ĐỂ CHỐNG NUỐT CHIÊU
        // ===============================================
        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua); 
            
            // Nhả khóa nhanh để Spam Combo mượt mà
            if (window.henGioTatMuaWB) clearTimeout(window.henGioTatMuaWB);
            window.henGioTatMuaWB = setTimeout(() => { window.dangMuaChieu = false; }, 600);
        }

        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); 
        if (typeof camera !== 'undefined' && !isRemote) {
            camera.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
            if (huongMat.lengthSq() < 0.001) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
        } else {
            nvc.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
        }
        if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }

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

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        let diemChanMucTieu = mucTieu.clone(); // Không khóa y = 0
        let tayChieuF_E = timXuong(nvc, ['Object_12', 'LHand_Palm_038']);
        let tayChieuR = timXuong(nvc, ['Object_10']);

        // ===============================================
        // MẢNG CHIÊU THỨC (CÓ isRemote ĐỂ FIX SÁT THƯƠNG)
        // ===============================================
        if (animCanMua === 'ATTACK5') { 
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const kq = taoVatTheWB('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 30);
                    kq.position.copy(viTriGocToTam).add(huongMat.clone().multiplyScalar(2));
                    kq.up.copy(upVector); 
                    kq.lookAt(mucTieu); scene.add(kq);
                    
                    kyNangWB.push({ mesh: kq, type: 'BAY_THANG', speed: 8.0, life: 100, targetPos: mucTieu.clone(), damage: dameGoc * 0.08, noBanKinh: 12, isRemote: isRemote, upVector: upVector.clone() });
                }, 200 * i);
            }
        }
        else if (animCanMua === 'ATTACK6') { 
            setTimeout(() => {
                const gocXoay = [0, Math.PI / 3, -Math.PI / 3]; 
                for (let i = 0; i < 3; i++) {
                    const kq = taoVatTheWB('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 40); 
                    kq.position.copy(viTriGocToTam).add(huongMat.clone().multiplyScalar(2));
                    kq.up.copy(upVector); 
                    kq.lookAt(mucTieu);
                    kq.rotateZ(gocXoay[i]);
                    scene.add(kq);
                    
                    kyNangWB.push({ mesh: kq, type: 'BAY_THANG', speed: 4.0, life: 150, targetPos: mucTieu.clone(), damage: dameGoc * 0.133, noBanKinh: 20, isRemote: isRemote, upVector: upVector.clone() });
                }
            }, 300);
        }
        else if (animCanMua === 'ATTACK7') { 
            setTimeout(() => {
                const kq = taoVatTheWB('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 50); 
                kq.position.copy(viTriGocToTam).add(huongMat.clone().multiplyScalar(2));
                kq.up.copy(upVector); 
                kq.lookAt(mucTieu);
                kq.rotateZ(Math.PI / 2); 
                scene.add(kq);
                
                kyNangWB.push({ mesh: kq, type: 'BAY_THANG', speed: 3.0, life: 180, targetPos: mucTieu.clone(), damage: dameGoc * 0.4, noBanKinh: 25, isRemote: isRemote, upVector: upVector.clone() });
            }, 300);
        }
        else if (animCanMua === 'ATTACK4') {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    let diemBan = viTriGocToTam.clone();
                    if (tayChieuF_E) tayChieuF_E.getWorldPosition(diemBan);

                    const cauEnergy = taoVatTheWB('energy', 2); 
                    cauEnergy.position.copy(diemBan).add(huongMat.clone().multiplyScalar(1.5));
                    cauEnergy.up.copy(upVector); 
                    cauEnergy.lookAt(mucTieu); scene.add(cauEnergy);

                    kyNangWB.push({
                        mesh: cauEnergy, type: 'BAY_THANG_PHINH_TO', speed: 8.0, life: 100,
                        currentScale: 2, maxScale: 12, growthRate: 0.5,
                        targetPos: mucTieu.clone(), damage: dameGoc * 0.06, noBanKinh: 15, isRemote: isRemote, upVector: upVector.clone()
                    });
                }, i * 100);
            }
        }
        else if (animCanMua === 'ATTACK2') { 
            setTimeout(() => {
                let diemBan = viTriGocToTam.clone();
                if (tayChieuR) tayChieuR.getWorldPosition(diemBan);

                const cauEnergy = taoVatTheWB('energy', 1); 
                cauEnergy.position.copy(diemBan).add(huongMat.clone().multiplyScalar(2.0));
                cauEnergy.up.copy(upVector); 
                cauEnergy.lookAt(mucTieu); scene.add(cauEnergy);

                kyNangWB.push({
                    mesh: cauEnergy, type: 'BAY_THANG_PHINH_TO', speed: 3.5, life: 250, 
                    currentScale: 1, maxScale: 40, growthRate: 0.6, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.5, noBanKinh: 30, isRemote: isRemote, upVector: upVector.clone()
                });
            }, 1000);
        }
        else if (animCanMua === 'ATTACK3') { 
            setTimeout(() => {
                const cauEnergy = taoVatTheWB('energy', 1); 
                let posXuatPhat = diemChanMucTieu.clone().add(upVector.clone().multiplyScalar(100)); 
                
                cauEnergy.position.copy(posXuatPhat);
                cauEnergy.up.copy(upVector);
                cauEnergy.lookAt(diemChanMucTieu); scene.add(cauEnergy);

                kyNangWB.push({
                    mesh: cauEnergy, type: 'ROI_THANG_PHINH_TO', speed: 2.0, life: 250, 
                    currentScale: 1, maxScale: 60, growthRate: 0.8, 
                    targetPos: diemChanMucTieu.clone(), damage: dameGoc * 0.5, noBanKinh: 40, isRemote: isRemote, upVector: upVector.clone()
                });
            }, 500);
        }
        else if (animCanMua === 'ATTACK1') {
            setTimeout(() => {
                let diemBan = viTriGocToTam.clone();
                if (tayChieuF_E) tayChieuF_E.getWorldPosition(diemBan);

                const cauEnergy = taoVatTheWB('energy', 15);
                cauEnergy.position.copy(diemBan).add(huongMat.clone().multiplyScalar(2.0));
                cauEnergy.up.copy(upVector); 
                cauEnergy.lookAt(mucTieu); scene.add(cauEnergy);

                kyNangWB.push({
                    mesh: cauEnergy, type: 'BAY_THANG_PHINH_TO_F', speed: 7.0, life: 150,
                    currentScale: 15, maxScale: 60, growthRate: 2.0, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 1.0, noBanKinh: 50, isRemote: isRemote, upVector: upVector.clone()
                });
            }, 1000); 
        }
    };

    window.updateCombatWB = function () {

        for (let i = kyNangWB.length - 1; i >= 0; i--) {
            let s = kyNangWB[i]; s.life--;

            if (s.mesh.userData && s.mesh.userData.mixer) {
                s.mesh.userData.mixer.update(0.03); 
            }

            if (s.type === 'BAY_THANG' || s.type === 'BAY_THANG_PHINH_TO' || s.type === 'BAY_THANG_PHINH_TO_F') {
                if (s.currentScale !== undefined && s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                if (s.mesh.children.length > 0 && s.type !== 'BAY_THANG') s.mesh.children[0].rotateY(0.2); 

                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                // ===============================================
                // SÁT THƯƠNG HOẠT ĐỘNG HOÀN HẢO!
                // ===============================================
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    
                    if (s.type === 'BAY_THANG_PHINH_TO_F') {
                        if (s.isRemote === false) gaySatThuongWB(s.targetPos, s.damage, s.noBanKinh);
                        else if (typeof s.isRemote === 'number' && s.isRemote > 0) window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);

                        const vfx = taoVatTheWB('vfxenergy', 30);
                        vfx.position.copy(s.targetPos); 
                        if (s.upVector) {
                            vfx.up.copy(s.upVector);
                            vfx.lookAt(s.targetPos.clone().add(s.upVector)); 
                        }
                        scene.add(vfx);
                        
                        kyNangWB.push({ mesh: vfx, type: 'NO_CHUNG_DONG_VFX', life: 100, currentScale: 30, maxScale: 400, growthRate: 15.0 });
                        if (typeof window.kichHoatDongDat === 'function') window.kichHoatDongDat(25, 1500);
                        if (typeof window.taoVetNutBangCodeWB === 'function') window.taoVetNutBangCodeWB(s.targetPos, s.upVector);
                    } else {
                        let mauNo = s.type === 'BAY_THANG' ? '#cc33ff' : '#ffffff';
                        if (s.isRemote === false) gaySatThuongWB(s.targetPos, s.damage, s.noBanKinh, mauNo);
                        else if (typeof s.isRemote === 'number' && s.isRemote > 0) window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                    }
                    s.life = 0;
                }
            }
            
            else if (s.type === 'ROI_THANG_PHINH_TO') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                if (s.mesh.children.length > 0) s.mesh.children[0].rotateY(0.2);

                s.speed *= 1.05; 
                let cUp = s.upVector || new THREE.Vector3(0,1,0);
                s.mesh.position.sub(cUp.clone().multiplyScalar(s.speed)); 

                if (s.mesh.position.distanceTo(s.targetPos) <= s.speed + 5 || s.life <= 0) {
                    if (s.isRemote === false) gaySatThuongWB(s.targetPos, s.damage, s.noBanKinh);
                    else if (typeof s.isRemote === 'number' && s.isRemote > 0) window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                    s.life = 0;
                }
            }

            else if (s.type === 'NO_CHUNG_DONG_VFX') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
            }

            else if (s.type === 'VET_NUT_CODE') {
                if (s.currentDraw < s.maxDraw) {
                    s.currentDraw += s.growth; 
                    s.mesh.geometry.setDrawRange(0, Math.floor(s.currentDraw));
                }
                if (s.life <= 15) { 
                    s.mesh.material.opacity = s.life / 15;
                }
            }

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

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('whitebeard')) {
        window.HePhaiHienTai = {
            tenPhai: "Tứ Hoàng Râu Trắng",
            khoiTao: function () {
                console.log("🧔 Bố Già (Mở Khóa SPAM 100% - Trục Cầu Chuẩn - Sát thương siêu to)!");

                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/energy.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/vfxenergy.glb', () => {});
                    for (let i = 1; i <= 6; i++) {
                        window.taiHoacNhanBanAsset('uploads/anims/KIEMQUANG' + i + '.glb', () => {});
                    }
                }

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];

                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position') && (tenTrack.includes('armature') || tenTrack.includes('hips') || tenTrack.includes('pelvis') || tenTrack.includes('root'))) return false;
                                    return true;
                                });
                            }
                        }

                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('ATTACK') || k.includes('SKILL')) window.KHO_ANIM_TANCONG.push(key);

                        if (k.includes('BAY') || k.includes('FLY')) { coBay = true; animBay = window.animationsMap[key]; window.animationsMap['BAY'] = animBay; }
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) { coChay = true; animChay = window.animationsMap[key]; window.animationsMap['CHAYBO'] = animChay; }
                    }
                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }

                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push('NHANROI1');
                    let defaultIdle = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                }

                if (window.vongLapNhanRoiZR) clearInterval(window.vongLapNhanRoiZR);
                window.vongLapNhanRoiZR = setInterval(() => {
                    if (!window.dangMuaChieu && !window.isMoving && !window.isKeyboardMoving && window.KHO_ANIM_NHANROI.length > 0) {
                        let randomIdle = window.KHO_ANIM_NHANROI[Math.floor(Math.random() * window.KHO_ANIM_NHANROI.length)];
                        if (window.animationsMap && window.animationsMap[randomIdle]) {
                            window.animationsMap['NHANROI'] = window.animationsMap[randomIdle];
                            if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[randomIdle];
                            if (typeof window.playAnim === 'function') window.playAnim(randomIdle);
                        }
                    }
                }, 12000);
            },
            tungChieu: window.tungComboWhitebeard,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
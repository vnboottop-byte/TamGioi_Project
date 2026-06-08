// ==========================================
// ❄️ MÔN PHÁI ĐOẠT XÁ: ĐÔ ĐỐC AOKIJI (KUZAN) - MASTER FILE V3
// 👑 CÔNG NGHỆ: MULTI-HIT ORBIT 3D + QUATERNION ÉP TRỤC + X3 ĐỘ DÀY BÃO TUYẾT
// ==========================================

(function () {
    const kyNangAokiji = [];
    const hieuUngAokiji = [];
    const danhSachSoBayAK = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_AK = 0;

    // 🌟 1. HIỂN THỊ DAME BĂNG GIÁ
    function taoSoSatThuongAK(pos3D, satThuong, mauSac = '#00ffff') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_AK > 5) return;
        window.tongSoChuNoi_AK++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #004466';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayAK.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 2. RADAR TÌM MỤC TIÊU
    window.layMucTieuGanNhatAK = function (viTriGoc) {
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

    function gaySatThuongAK(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongAK(posHienSo, luongSatThuong, '#00ffff');
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
                            taoSoSatThuongAK(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ffffff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongAK(hit.tamNguc.clone(), luongSatThuong);
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

    // 🌟 3. BỤI BĂNG VỤ NỔ
    function taoHieuUngNoAK(pos, isBig = false) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos);
        else if (typeof window.playSound === 'function') window.playSound('no');

        const soLuong = isBig ? 120 : 30;
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + (isBig ? 2 : 1); posArr[i * 3 + 2] = pos.z;
            let speed = isBig ? (Math.random() * 2 + 1) : (Math.random() * 1 + 0.5);
            let vec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiBang) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(0, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiBang = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xccffff, size: window.isMobile ? 3.0 : 6.0, map: window.textureBuiBang,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngAokiji.push({ system: pts, velocities: vels, life: 30 });
    }

    // 🌟 4. ĐÚC MODEL BĂNG
    function taoVatTheAokiji(tenFile, scaleSize, isBăngHóa = false) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let danhSachMat = Array.isArray(c.material) ? c.material : [c.material];
                        danhSachMat.forEach(m => {
                            m.transparent = true;
                            if (isBăngHóa) {
                                if (m.color) m.color.setHex(0xaaddff);
                                if (m.emissive) m.emissive.setHex(0x003366);
                                m.opacity = 0.85;
                                if (m.metalness !== undefined) m.metalness = 0.8;
                                if (m.roughness !== undefined) m.roughness = 0.1;
                            }
                        });
                    }
                });
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

    function taoKiemQuangBăng(scaleSize) {
        const group = new THREE.Group();
        let soNgauNhien = Math.floor(Math.random() * 6) + 1;
        let urlCanTai = 'uploads/anims/KIEMQUANG' + soNgauNhien + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let m = Array.isArray(c.material) ? c.material[0] : c.material;
                        m.transparent = true; m.color.setHex(0x00ffff);
                    }
                });
                v.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(v);
                const size = new THREE.Vector3(); box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                let tiLeChuan = scaleSize / maxDim;
                v.scale.set(tiLeChuan, tiLeChuan, tiLeChuan);
                group.add(v);
            });
        }
        return group;
    }

    // ==========================================
    // 🏹 TUNG CHIÊU AOKIJI 
    // ==========================================
    window.tungComboAokiji = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        let animCanMua = 'ATTACK1';
        if (phim === 'Q') animCanMua = 'ATTACK1';
        if (phim === 'E') animCanMua = 'ATTACK4';
        if (phim === 'R') animCanMua = 'ATTACK5';
        if (phim === 'F') animCanMua = 'ATTACK3';

        if (isRemote === false) {
            window.currentAnimName = '';
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
        }

        let viTriGocToTam = new THREE.Vector3();
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

        let mucTieu = null;

        if (isRemote) {
            viTriGocToTam = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            upVector = viTriGocToTam.clone().normalize();
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));
            let targetRadar = window.layMucTieuGanNhatAK(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) mucTieu = window.layHitbox(targetRadar.mesh).tamNguc.clone();
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Aokiji',
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: false });
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) dameGoc = window.remotePlayers[casterId].damage || 100;
        }

        let diemChanMucTieu = mucTieu.clone(); 

        // ===============================================
        // ❄️ CHIÊU Q: LƯỠI KIẾM BĂNG ĐỊNH HƯỚNG
        // ===============================================
        if (phim === 'Q') {
            setTimeout(() => {
                let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                if (curDir.lengthSq() < 0.001) curDir.set(0, 0, 1).applyQuaternion(curNvc.quaternion).projectOnPlane(curUp).normalize();
                let curPos = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));

                const kq = taoKiemQuangBăng(40);
                kq.position.copy(curPos).add(curDir.clone().multiplyScalar(2.5));
                
                // Ép Trục Quaternion
                kq.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curUp); 

                let targetBay = mucTieu ? mucTieu.clone() : curPos.clone().add(curDir.clone().multiplyScalar(150));
                kq.lookAt(targetBay);
                scene.add(kq);

                kyNangAokiji.push({
                    mesh: kq, type: 'BAY_THANG', speed: 12.0, life: 80,
                    targetPos: targetBay, damage: dameGoc * 0.4, isRemote: isRemote, noBanKinh: 10
                });
            }, 100); 
        }

        // ===============================================
        // ❄️ CHIÊU E: BÃO TUYẾT X3 ĐỘ DÀY & X2 SCALE (120)
        // ===============================================
        else if (phim === 'E') {
            setTimeout(() => {
                let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                // 🌟 TẠO GROUP CHỨA 3 CƠN BÃO CHO ĐẶC KỊT (Scale tăng gấp đôi thành 120)
                const baoTuyetGroup = new THREE.Group();
                for (let k = 0; k < 3; k++) {
                    const tuyet = taoVatTheAokiji('TUYET', 120, false);
                    tuyet.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    baoTuyetGroup.add(tuyet);
                }

                let tamBaoNo = diemChanMucTieu.clone().add(curUp.clone().multiplyScalar(4.0)); // Nâng cao một chút cho tâm bão đẹp

                baoTuyetGroup.position.copy(tamBaoNo);
                // 🌟 ÉP TRỤC QUATERNION CHO MAP CẦU
                baoTuyetGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curUp); 
                scene.add(baoTuyetGroup);

                kyNangAokiji.push({
                    mesh: baoTuyetGroup, type: 'BAO_ORBIT', speed: 0.15, life: 90,
                    tamQuay: tamBaoNo, gocXoay: 0, banKinh: 6, ticksDame: 0, 
                    damage: dameGoc * 0.055, isRemote: isRemote, noBanKinh: 30, // Tăng nhẹ bán kính nổ khớp với 120m
                    upVector: curUp.clone(), huongMatBanDau: curDir.clone() 
                });
            }, 300);
        }

        // ===============================================
        // ❄️ CHIÊU R: 5 BĂNG THẠCH RƠI XÉO
        // ===============================================
        else if (phim === 'R') {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                    let rightVec = new THREE.Vector3().crossVectors(curDir, curUp).normalize();

                    const thienThach = taoVatTheAokiji('THIENTHACH', 18, true);

                    let posDap = diemChanMucTieu.clone();
                    posDap.add(rightVec.clone().multiplyScalar((Math.random() - 0.5) * 15));
                    posDap.add(curDir.clone().multiplyScalar((Math.random() - 0.5) * 15));

                    let posXuatPhat = posDap.clone();
                    posXuatPhat.add(curUp.clone().multiplyScalar(60)); 
                    posXuatPhat.sub(curDir.clone().multiplyScalar(20));

                    thienThach.position.copy(posXuatPhat);
                    thienThach.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curUp); // 🌟 ÉP TRỤC CẦU
                    thienThach.lookAt(posDap);
                    scene.add(thienThach);

                    kyNangAokiji.push({
                        mesh: thienThach, type: 'BAY_THANG', speed: 9.0, life: 150,
                        targetPos: posDap, damage: dameGoc * 0.1, isRemote: isRemote, noBanKinh: 20
                    });
                }, i * 150);
            }
        }

        // ===============================================
        // ❄️ CHIÊU F: MƯA BĂNG KHỔNG LỒ
        // ===============================================
        else if (phim === 'F') {
            let tongThoiGian = 2500;
            let soLuongMua = 15;
            let delayPerMeteor = tongThoiGian / soLuongMua;

            for (let i = 0; i < soLuongMua; i++) {
                setTimeout(() => {
                    let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                    let rightVec = new THREE.Vector3().crossVectors(curDir, curUp).normalize();

                    const thienThach = taoVatTheAokiji('THIENTHACH', 36, true);

                    let posDap = diemChanMucTieu.clone();
                    posDap.add(rightVec.clone().multiplyScalar((Math.random() - 0.5) * 45));
                    posDap.add(curDir.clone().multiplyScalar((Math.random() - 0.5) * 45));

                    let posXuatPhat = posDap.clone();
                    posXuatPhat.add(curUp.clone().multiplyScalar(175));
                    posXuatPhat.sub(curDir.clone().multiplyScalar(40));

                    thienThach.position.copy(posXuatPhat);
                    thienThach.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curUp); // 🌟 ÉP TRỤC CẦU
                    thienThach.lookAt(posDap);
                    scene.add(thienThach);

                    kyNangAokiji.push({
                        mesh: thienThach, type: 'BAY_THANG', speed: 15.0, life: 120, 
                        targetPos: posDap, damage: dameGoc * 0.066, isRemote: isRemote, noBanKinh: 25 
                    });
                }, i * delayPerMeteor);
            }
        }
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU AOKIJI
    // ==========================================
    window.updateCombatAokiji = function () {

        // 🌟 BÃO TUYẾT HỘ THỂ (ĐÃ NHÂN ĐÔI ĐỘ DÀY VÀ ÉP CHUẨN TRỤC CẦU BẰNG QUATERNION)
        let nvc = window.playerModel || window.nhanVatChinh;
        if (nvc) {
            if (!window.aokijiAura) {
                window.aokijiAura = new THREE.Group();
                let tuyet1 = taoVatTheAokiji('TUYET', 45, false);
                let tuyet2 = taoVatTheAokiji('TUYET', 45, false);
                tuyet2.rotation.set(Math.PI / 2, 0, Math.PI / 4); // Cố tình lệch góc để che khít khoảng trống
                window.aokijiAura.add(tuyet1);
                window.aokijiAura.add(tuyet2);
                scene.add(window.aokijiAura);
                window.aokijiAuraGoc = 0;
            }
            window.aokijiAura.position.copy(nvc.position);
            let curUp = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
            
            // Ép Trục Y của Bão Hộ Thể cắm thẳng xuống trọng lực hành tinh
            window.aokijiAura.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curUp);
            
            window.aokijiAuraGoc += 0.02;
            window.aokijiAura.rotateY(window.aokijiAuraGoc); // Xoay vòng tròn dựa trên nền Trục Cầu đã ép
        }

        for (let i = kyNangAokiji.length - 1; i >= 0; i--) {
            let s = kyNangAokiji[i]; s.life--;

            if (s.type === 'BAY_THANG') {
                if (s.mesh.children.length > 0) s.mesh.children[0].rotateZ(0.5);

                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) {
                    if (s.isRemote === false) gaySatThuongAK(s.targetPos, s.damage, s.noBanKinh);
                    else if (typeof s.isRemote === 'number' && s.isRemote > 0) {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                    } 
                    taoHieuUngNoAK(s.targetPos, false);
                    s.life = 0;
                }
            }
            // 🌟 VẬT LÝ BÃO TUYẾT VỆ TINH: QUAY CHUẨN TRỤC ORBIT 3D
            else if (s.type === 'BAO_ORBIT') {
                s.gocXoay += s.speed;
                
                let rightVec = new THREE.Vector3().crossVectors(s.huongMatBanDau, s.upVector).normalize();
                let fwdVec = s.huongMatBanDau.clone();
                
                let vecLech = rightVec.multiplyScalar(Math.cos(s.gocXoay) * s.banKinh).add(fwdVec.multiplyScalar(Math.sin(s.gocXoay) * s.banKinh));
                s.mesh.position.copy(s.tamQuay).add(vecLech);
                
                // Ép Trục Cầu Cứng cho Bão Orbit
                s.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), s.upVector);
                // Cho cái Group xoay tít
                s.mesh.rotateY(s.gocXoay * 2.0);

                // Cho từng cục TUYET bên trong xoay hỗn loạn
                s.mesh.children.forEach((child, idx) => {
                    child.rotateX(0.05 + idx * 0.02);
                    child.rotateY(0.1);
                });

                s.ticksDame++;
                if (s.ticksDame % 10 === 0) {
                    if (s.isRemote === false) gaySatThuongAK(s.mesh.position, s.damage, 15);
                    else if (typeof s.isRemote === 'number' && s.isRemote > 0) {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.mesh.position, s.damage, 15);
                    }
                    taoHieuUngNoAK(s.mesh.position, false); 
                }

                if (s.life <= 1) {
                    if (s.isRemote === false) gaySatThuongAK(s.tamQuay, s.damage * 2, s.noBanKinh);
                    else if (typeof s.isRemote === 'number' && s.isRemote > 0) {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.tamQuay, s.damage * 2, s.noBanKinh);
                    }
                    taoHieuUngNoAK(s.tamQuay, true);
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangAokiji.splice(i, 1);
            }
        }

        for (let i = hieuUngAokiji.length - 1; i >= 0; i--) {
            let h = hieuUngAokiji[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].multiplyScalar(0.9); h.velocities[j].y += 0.02;
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 30;
            
            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngAokiji.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayAK.length - 1; i >= 0; i--) {
            let it = danhSachSoBayAK[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';
            if (it.life <= 0) { it.el.remove(); danhSachSoBayAK.splice(i, 1); window.tongSoChuNoi_AK--; }
        }
    };
    setInterval(window.updateCombatAokiji, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI & PRELOAD
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.trim() !== '') {
        window.HePhaiHienTai = {
            tenPhai: "Băng Giá Aokiji",
            khoiTao: function () {
                console.log("❄️ Băng Tuyết Phủ Kín! Kích hoạt Động cơ Preload RAM & Orbit Vector 3D!");

                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/TUYET.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/THIENTHACH.glb', () => {});
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
            tungChieu: window.tungComboAokiji,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
// ==========================================
// 🥷 HỆ THỐNG ĐOẠT XÁ: OSOBAMASK (STEALTH BLACK SANJI)
// 👑 CÔNG NGHỆ: BẢN GỐC + VÁ LỖI TRỤC CẦU 3D & MỞ KHÓA SPAM
// ==========================================

(function () {
    const kyNangOsobamask = [];
    const hieuUngOsobamask = [];
    const danhSachSoBayOSO = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_OSO = 0;

    // 🌟 1. HIỂN THỊ SÁT THƯƠNG (MÀU VÀNG DIABLE JAMBE TỎA SÁNG)
    function taoSoSatThuongOSO(pos3D, satThuong, mauSac = '#ffcc00') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_OSO > 5) return;
        window.tongSoChuNoi_OSO++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #996600';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayOSO.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 2. HỆ THỐNG TÌM MỤC TIÊU VÀ TRỪ MÁU (CHUẨN ESPORTS CỦA SẾP)
    window.layMucTieuGanNhatOSO = function (viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 80) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 80;
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

        let targetQuai = null; let minDQuai = 80;
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

    function gaySatThuongOSO(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongOSO(posHienSo, luongSatThuong);
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
                            taoSoSatThuongOSO(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff3300');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongOSO(hit.tamNguc.clone(), luongSatThuong);
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

    // 🌟 3. HIỆU ỨNG VỤ NỔ OSOBAMASK (VÁ LỖI TRỤC CẦU 3D)
    function taoVuNoOSO(pos, isRemote = false, luongDame = 100, banKinh = 15, upVector = new THREE.Vector3(0, 1, 0)) {
        
        // 🌟 QUY TẮC SÁT THƯƠNG ĐÃ VÁ (GỠ BỎ KHIÊN CHẮN NUMBER)
        if (isRemote === false && luongDame > 0) {
            gaySatThuongOSO(pos, luongDame, banKinh);
        } else {
            // 🌟 BẢN VÁ: Cứ Đạn của Boss chạm mặt là trừ máu Sếp! Không chặn number nữa!
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, luongDame, banKinh);
        }

        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos);

        const soLuong = window.isMobile ? 25 : 60;
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        // 🌟 Nắn vụ nổ bung ra theo trục không gian Cầu
        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            let vLocal = new THREE.Vector3((Math.random() - 0.5) * 14, Math.random() * 10, (Math.random() - 0.5) * 14);
            vLocal.applyQuaternion(qNolo); 
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiOSO) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   
            gradient.addColorStop(0.3, 'rgba(255, 204, 0, 0.9)'); // Vàng Gold
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');         
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiOSO = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xffcc00, size: window.isMobile ? 8.0 : 12.0, map: window.textureBuiOSO, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        
        // Gắn upVector vào hạt bụi để rớt chuẩn
        hieuUngOsobamask.push({ system: pts, velocities: vels, life: 30, upVector: upVector.clone() }); 
    }

    // 🌟 4. CÔNG CỤ TẠO MODEL
    function taoVatTheOSO(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let danhSachMat = Array.isArray(c.material) ? c.material : [c.material];
                        danhSachMat.forEach(m => m.transparent = true);
                    }
                });
                if (v.animations && v.animations.length > 0) {
                    let mixer = new THREE.AnimationMixer(v);
                    mixer.clipAction(v.animations[0]).play();
                    group.userData = group.userData || {}; group.userData.mixer = mixer; 
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

    // 🌟 HÀM QUÉT BỘ PHẬN XƯƠNG
    function timBoPhan(nvc, dsTen) {
        let boPhan = null;
        if (nvc) {
            nvc.traverse(c => {
                if (!boPhan && dsTen.includes(c.name)) boPhan = c;
            });
        }
        return boPhan;
    }

    // ==========================================
    // 🥷 TUNG CHIÊU OSOBAMASK 
    // ==========================================
    window.tungComboOsobamask = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        let animCanMua = '';
        if (phim === 'Q') animCanMua = 'ATTACK3';
        if (phim === 'E') animCanMua = 'ATTACK2';
        if (phim === 'R') animCanMua = 'ATTACK1';
        if (phim === 'F') animCanMua = 'ATTACK14';

        // 🌟 BƯỚC ĐỘT PHÁ TẠI ĐÂY: XÓA `return` BLOCK 800MS ĐỂ CHỐNG NUỐT CHIÊU
        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
            
            // Nhả khóa nhanh để Spam Combo mượt mà
            if (window.henGioTatMuaOSO) clearTimeout(window.henGioTatMuaOSO);
            window.henGioTatMuaOSO = setTimeout(() => { window.dangMuaChieu = false; }, 600);
        }

        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); 
        // 🌟 VÁ LỖI 1: BẺ PHẲNG VECTOR HƯỚNG MẶT
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
            let targetRadar = window.layMucTieuGanNhatOSO(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) mucTieu = window.layHitbox(targetRadar.mesh).tamNguc.clone();
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Osobamask',
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

        // ===============================================
        // 🥷 CHIÊU Q (ATTACK3): DELAY 500ms 
        // ===============================================
        if (animCanMua === 'ATTACK3') { 
            setTimeout(() => {
                // 🌟 VÁ LỖI 4: QUÉT LẠI TỌA ĐỘ BÊN TRONG SETTIMEOUT
                let curNvc = nvc;
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                let tayTrai = timBoPhan(curNvc, ['Object_12', 'LHand_Palm_041', 'LHand']);
                if (tayTrai) tayTrai.getWorldPosition(diemBan);

                const qOrb = taoVatTheOSO('fire2', 1.5); 
                qOrb.position.copy(diemBan).add(curDir.clone().multiplyScalar(1.5));
                qOrb.up.copy(curUp); // 🌟 VÁ LỖI 7: Trục 3D
                qOrb.lookAt(mucTieu); scene.add(qOrb);

                kyNangOsobamask.push({ 
                    mesh: qOrb, type: 'BAY_THANG_PHINH_TO', speed: 9.0, life: 100, 
                    currentScale: 1.5, maxScale: 4.0, growthRate: 0.2, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.4, noBanKinh: 15,
                    isSpinning: true, spinSpeed: 0.1, isRemote: isRemote, upVector: curUp.clone()
                });
            }, 500);
        }

        // ===============================================
        // 🥷 CHIÊU E (ATTACK2): DELAY 1000ms 
        // ===============================================
        else if (animCanMua === 'ATTACK2') { 
            setTimeout(() => {
                let curNvc = nvc;
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                let tayPhai = timBoPhan(curNvc, ['Object_17', 'RHand_Palm_046', 'RHand']);
                if (tayPhai) tayPhai.getWorldPosition(diemBan);

                const eOrb = taoVatTheOSO('fire3', 3.0); 
                eOrb.position.copy(diemBan).add(curDir.clone().multiplyScalar(1.5));
                eOrb.up.copy(curUp);
                eOrb.lookAt(mucTieu); scene.add(eOrb);

                kyNangOsobamask.push({
                    mesh: eOrb, type: 'BAY_THANG_PHINH_TO', speed: 10.0, life: 100,
                    currentScale: 3.0, maxScale: 8.0, growthRate: 0.3, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.6, noBanKinh: 22,
                    isSpinning: true, spinSpeed: 0.2, isRemote: isRemote, upVector: curUp.clone()
                });
            }, 1000); 
        }

        // ===============================================
        // 🥷 CHIÊU R (ATTACK1): DELAY 400ms
        // ===============================================
        else if (animCanMua === 'ATTACK1') { 
            setTimeout(() => {
                let curNvc = nvc;
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                let chanPhai = timBoPhan(curNvc, ['RFoot_Toe_057', 'RFoot_Toe', 'RFoot']);
                if (chanPhai) chanPhai.getWorldPosition(diemBan);

                const rOrb = taoVatTheOSO('causettim', 5.0); 
                rOrb.position.copy(diemBan).add(curDir.clone().multiplyScalar(2.0));
                rOrb.up.copy(curUp);
                rOrb.lookAt(mucTieu); scene.add(rOrb);

                kyNangOsobamask.push({ 
                    mesh: rOrb, type: 'BAY_THANG_PHINH_TO', speed: 11.0, life: 100, 
                    currentScale: 5.0, maxScale: 12.0, growthRate: 0.4, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.5, noBanKinh: 30,
                    isSpinning: true, spinSpeed: 0.3, isRemote: isRemote, upVector: curUp.clone()
                });
            }, 400); 
        }

        // ===============================================
        // 🥷 CHIÊU F (ATTACK14): DELAY 500ms
        // ===============================================
        else if (animCanMua === 'ATTACK14') { 
            setTimeout(() => {
                let curNvc = nvc;
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                let chanPhai = timBoPhan(curNvc, ['RFoot_Toe_057', 'RFoot_Toe', 'RFoot']);
                if (chanPhai) chanPhai.getWorldPosition(diemBan);

                const fOrb = taoVatTheOSO('causethaki', 7.0); 
                fOrb.position.copy(diemBan).add(curDir.clone().multiplyScalar(2.5));
                fOrb.up.copy(curUp);
                fOrb.lookAt(mucTieu); scene.add(fOrb);

                kyNangOsobamask.push({
                    mesh: fOrb, type: 'BAY_THANG_PHINH_TO', speed: 12.0, life: 120,
                    currentScale: 7.0, maxScale: 18.0, growthRate: 0.5, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 1.0, noBanKinh: 40,
                    isSpinning: true, spinSpeed: 0.4, isRemote: isRemote, upVector: curUp.clone()
                });
            }, 500); 
        }
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU OSOBAMASK
    // ==========================================
    window.updateCombatOsobamask = function () {
        
        for (let i = kyNangOsobamask.length - 1; i >= 0; i--) {
            let s = kyNangOsobamask[i]; 

            if (s.mesh.userData && s.mesh.userData.mixer) {
                s.mesh.userData.mixer.update(0.03); 
            }

            if (s.type === 'BAY_THANG_PHINH_TO') {
                s.life--;
                
                if (s.isSpinning) s.mesh.rotateZ(s.spinSpeed || 0.2);

                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }

                // Vật lý Bay thẳng 100% Nguyên Tắc Sếp
                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                // 🌟 BẢN VÁ: Có s.life <= 0 và s.upVector
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    taoVuNoOSO(s.targetPos, s.isRemote, s.damage, s.noBanKinh, s.upVector);
                    if (typeof window.kichHoatDongDat === 'function' && s.maxScale > 10) window.kichHoatDongDat(15, 500);
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else { if (s.mesh.parent) s.mesh.parent.remove(s.mesh); if (typeof scene !== 'undefined') scene.remove(s.mesh); }
                kyNangOsobamask.splice(i, 1);
            }
        }

        // 🌟 BẢN VÁ: RỚT THEO TRỤC MAP CẦU
        for (let i = hieuUngOsobamask.length - 1; i >= 0; i--) {
            let h = hieuUngOsobamask[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            
            let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(-0.2) : new THREE.Vector3(0, -0.2, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; 
                posArr[j * 3 + 1] += h.velocities[j].y; 
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].x *= 0.95; h.velocities[j].z *= 0.95; 
                h.velocities[j].add(fallVec); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 30; 

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose(); 
                if (h.system.material) h.system.material.dispose(); 
                hieuUngOsobamask.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayOSO.length - 1; i >= 0; i--) {
            let it = danhSachSoBayOSO[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';

            if (it.life <= 0) {
                it.el.remove(); danhSachSoBayOSO.splice(i, 1); window.tongSoChuNoi_OSO--;
            }
        }
    };

    if (window.idVongLapCombatOSO) clearInterval(window.idVongLapCombatOSO);
    window.idVongLapCombatOSO = setInterval(window.updateCombatOsobamask, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI VÀ PRELOAD RAM
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('osobamask')) {
        window.HePhaiHienTai = {
            tenPhai: "Osobamask Sanji",
            khoiTao: function () {
                console.log("🥷 Stealth Black Osobamask Khởi động (Mở Khóa SPAM 100% - Trục Cầu Chuẩn)!");

                // 🌟 BẢN VÁ: CHỐNG SẬP BẰNG CÁCH TẢI TRƯỚC VÀO VRAM
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/fire2.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/fire3.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/causettim.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/causethaki.glb', () => {});
                }

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false; let animBay = null; let animChay = null;

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
            tungChieu: window.tungComboOsobamask,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
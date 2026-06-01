// ==========================================
// 🥷 HỆ THỐNG ĐOẠT XÁ: OSOBAMASK (STEALTH BLACK SANJI)
// 👑 CÔNG NGHỆ: RANGED PROJECTILE + DELAY SYNC + PRECISE BONE TARGETING
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

    // 🌟 2. HỆ THỐNG TÌM MỤC TIÊU VÀ TRỪ MÁU (CHUẨN ESPORTS)
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

    // 🌟 3. HIỆU ỨNG VỤ NỔ OSOBAMASK (TIA LỬA VÀNG CHÓE)
    function taoVuNoOSO(pos, isRemote = false, luongDame = 100, banKinh = 15) {
        if (isRemote === false && luongDame > 0) gaySatThuongOSO(pos, luongDame, banKinh);
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 

        const soLuong = window.isMobile ? 25 : 60;
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 14, Math.random() * 10, (Math.random() - 0.5) * 14));
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
        hieuUngOsobamask.push({ system: pts, velocities: vels, life: 30 }); 
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

    window.thoiDiemChemCuoi_OSO = window.thoiDiemChemCuoi_OSO || 0;

    // ==========================================
    // 🥷 TUNG CHIÊU OSOBAMASK (VỚI MAP HOẠT ẢNH MỚI CỦA SẾP)
    // ==========================================
    window.tungComboOsobamask = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        // BẮT HOẠT ẢNH THEO ĐÚNG ORDER SẾP YÊU CẦU
        let animCanMua = '';
        if (phim === 'Q') animCanMua = 'ATTACK3';
        if (phim === 'E') animCanMua = 'ATTACK2';
        if (phim === 'R') animCanMua = 'ATTACK1';
        if (phim === 'F') animCanMua = 'ATTACK14';

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - window.thoiDiemChemCuoi_OSO < 800) return;
            window.thoiDiemChemCuoi_OSO = bayGio;
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
        }

        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
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

        const dameGoc = window.DAME_CUA_TOI || 100;

        // ===============================================
        // 🥷 CHIÊU Q (ATTACK3): DELAY 500ms - TAY TRÁI BẮN FIRE2
        // ===============================================
        if (animCanMua === 'ATTACK3') { 
            setTimeout(() => {
                let tayTrai = timBoPhan(nvc, ['Object_12', 'LHand_Palm_041', 'LHand']);
                let diemBan = viTriGocToTam.clone();
                if (tayTrai) tayTrai.getWorldPosition(diemBan);

                const qOrb = taoVatTheOSO('fire2', 1.5); // Kích thước cơ sở
                qOrb.position.copy(diemBan).add(huongMat.clone().multiplyScalar(1.5));
                qOrb.lookAt(mucTieu); scene.add(qOrb);

                kyNangOsobamask.push({ 
                    mesh: qOrb, type: 'BAY_THANG_PHINH_TO', speed: 9.0, life: 100, 
                    currentScale: 1.5, maxScale: 4.0, growthRate: 0.2, // Phình to mức 1
                    targetPos: mucTieu.clone(), damage: dameGoc * 1.0, noBanKinh: 15,
                    isSpinning: true, spinSpeed: 0.1
                });
            }, 500);
        }

        // ===============================================
        // 🥷 CHIÊU E (ATTACK2): DELAY 1000ms (1s) - TAY PHẢI BẮN FIRE3 TO GẤP ĐÔI Q
        // ===============================================
        else if (animCanMua === 'ATTACK2') { 
            setTimeout(() => {
                let tayPhai = timBoPhan(nvc, ['Object_17', 'RHand_Palm_046', 'RHand']);
                let diemBan = viTriGocToTam.clone();
                if (tayPhai) tayPhai.getWorldPosition(diemBan);

                const eOrb = taoVatTheOSO('fire3', 3.0); // Kích thước xuất phát to gấp đôi Q
                eOrb.position.copy(diemBan).add(huongMat.clone().multiplyScalar(1.5));
                eOrb.lookAt(mucTieu); scene.add(eOrb);

                kyNangOsobamask.push({
                    mesh: eOrb, type: 'BAY_THANG_PHINH_TO', speed: 10.0, life: 100,
                    currentScale: 3.0, maxScale: 8.0, growthRate: 0.3, // Phình to gấp đôi Q
                    targetPos: mucTieu.clone(), damage: dameGoc * 1.5, noBanKinh: 22,
                    isSpinning: true, spinSpeed: 0.2
                });
            }, 1000); // Trễ 1 giây chuẩn đét
        }

        // ===============================================
        // 🥷 CHIÊU R (ATTACK1): CHÂN PHẢI BẮN CAUSETTIM TO HƠN E
        // ===============================================
        else if (animCanMua === 'ATTACK1') { 
            setTimeout(() => {
                let chanPhai = timBoPhan(nvc, ['RFoot_Toe_057', 'RFoot_Toe', 'RFoot']);
                let diemBan = viTriGocToTam.clone();
                if (chanPhai) chanPhai.getWorldPosition(diemBan);

                const rOrb = taoVatTheOSO('causettim', 5.0); // Kích thước to hơn E
                rOrb.position.copy(diemBan).add(huongMat.clone().multiplyScalar(2.0));
                rOrb.lookAt(mucTieu); scene.add(rOrb);

                kyNangOsobamask.push({ 
                    mesh: rOrb, type: 'BAY_THANG_PHINH_TO', speed: 11.0, life: 100, 
                    currentScale: 5.0, maxScale: 12.0, growthRate: 0.4, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 2.5, noBanKinh: 30,
                    isSpinning: true, spinSpeed: 0.3
                });
            }, 400); // Thường chiêu cước đá sẽ vung nhanh hơn (400ms)
        }

        // ===============================================
        // 🥷 CHIÊU F (ATTACK14): CHÂN PHẢI BẮN CAUSETHAKI KHỔNG LỒ
        // ===============================================
        else if (animCanMua === 'ATTACK14') { 
            setTimeout(() => {
                let chanPhai = timBoPhan(nvc, ['RFoot_Toe_057', 'RFoot_Toe', 'RFoot']);
                let diemBan = viTriGocToTam.clone();
                if (chanPhai) chanPhai.getWorldPosition(diemBan);

                const fOrb = taoVatTheOSO('causethaki', 7.0); // Kích thước khổng lồ chốt hạ
                fOrb.position.copy(diemBan).add(huongMat.clone().multiplyScalar(2.5));
                fOrb.lookAt(mucTieu); scene.add(fOrb);

                kyNangOsobamask.push({
                    mesh: fOrb, type: 'BAY_THANG_PHINH_TO', speed: 12.0, life: 120,
                    currentScale: 7.0, maxScale: 18.0, growthRate: 0.5, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 3.0, noBanKinh: 40,
                    isSpinning: true, spinSpeed: 0.4
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

            // Đạn bay phình to và xoay
            if (s.type === 'BAY_THANG_PHINH_TO') {
                s.life--;
                
                if (s.isSpinning) s.mesh.rotateZ(s.spinSpeed || 0.2);

                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) {
                    taoVuNoOSO(s.targetPos, false, s.damage, s.noBanKinh);
                    if (typeof window.kichHoatDongDat === 'function' && s.maxScale > 10) window.kichHoatDongDat(15, 500);
                    s.life = 0;
                }
            }

            // 🛑 DỌN RÁC MODEL (CHUẨN BỌC THÉP)
            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else { if (s.mesh.parent) s.mesh.parent.remove(s.mesh); if (typeof scene !== 'undefined') scene.remove(s.mesh); }
                kyNangOsobamask.splice(i, 1);
            }
        }

        // 🛑 VẬT LÝ HẠT BỤI NỔ DỌN RÁC
        for (let i = hieuUngOsobamask.length - 1; i >= 0; i--) {
            let h = hieuUngOsobamask[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; 
                posArr[j * 3 + 1] += h.velocities[j].y; 
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].x *= 0.95; h.velocities[j].z *= 0.95; h.velocities[j].y -= 0.2; 
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

        // DỌN RÁC SỐ DAME
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
    // 🌟 KHỞI TẠO HỆ PHÁI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('osobamask')) {
        window.HePhaiHienTai = {
            tenPhai: "Osobamask Sanji",
            khoiTao: function () {
                console.log("🥷 Stealth Black Osobamask Khởi động!");

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false; let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];

                        // 🛑 LÁ CHẮN BẢO VỆ ĐÁNH XA 
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
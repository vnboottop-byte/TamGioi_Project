// ==========================================
// ⚔️ MÔN PHÁI: SIR CROCODILE (THẤT VŨ HẢI)
// 👑 CÔNG NGHỆ: TORNADO PARTICLE + BONE TRACKING + AAA V5 TEMPLATE
// ==========================================

(function () {
    const kyNangCrocodile = [];
    const hieuUngCrocodile = [];
    const danhSachSoBayCrocodile = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Crocodile = 0;

    // ==========================================
    // 1. LÕI TIỆN ÍCH CƠ BẢN
    // ==========================================
    function taoSoSatThuongCrocodile(pos3D, satThuong, mauSac = '#c2b280') {
        if (window.isMobile) return;
        if (satThuong <= 0 || (window.isMobile && window.tongSoChuNoi_Crocodile > 5)) return;
        window.tongSoChuNoi_Crocodile++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #5c4033';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayCrocodile.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatCrocodile = function (viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead && window.mucTieuHienTai.classCode !== 'TRANG_TRI') {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 150) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 150;
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                let laBoss = window.danhSachQuaiVat && window.danhSachQuaiVat.some(q => String(q.id) === String(id) || "PLAYER_" + q.id === String(id) || "BOSS_" + q.id === String(id));
                if (rp.status === 'ready' && rp.mesh && !laBoss) {
                    let hit = window.layHitbox(rp.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDNguoi) { minDNguoi = d; targetNguoi = rp; }
                }
            }
        }
        if (targetNguoi) return targetNguoi;

        let targetQuai = null; let minDQuai = 150;
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh && quai.classCode !== 'TRANG_TRI') {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDQuai) { minDQuai = d; targetQuai = quai; }
                }
            });
        }
        return targetQuai;
    };

    function gaySatThuongCrocodile(tamNo, luongSatThuong, banKinh) {
        let mucTieuDaXyLy = new Set();
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                let laBoss = window.danhSachQuaiVat && window.danhSachQuaiVat.some(q => String(q.id) === String(id) || "PLAYER_" + q.id === String(id) || "BOSS_" + q.id === String(id));
                if (rp.status === 'ready' && rp.mesh && !laBoss && !mucTieuDaXyLy.has(rp.mesh)) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        mucTieuDaXyLy.add(rp.mesh);
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongCrocodile(posHienSo, luongSatThuong, '#d2b48c');
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh && !mucTieuDaXyLy.has(quai.mesh)) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        mucTieuDaXyLy.add(quai.mesh);
                        if (quai.isBoss) {
                            taoSoSatThuongCrocodile(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ffaa00');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongCrocodile(hit.tamNguc.clone(), luongSatThuong);
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
    // 2. VỤ NỔ VÀ CÁT MODEL
    // ==========================================
    function taoHieuUngNoCat(pos, isBig = false, upVector = new THREE.Vector3(0, 1, 0)) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 

        const soLuong = isBig ? 80 : 30; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + 1; posArr[i * 3 + 2] = pos.z;
            let speed = isBig ? (Math.random() * 3 + 1) : (Math.random() * 1.5 + 0.5);
            let vLocal = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vLocal.applyQuaternion(qNolo);
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureCat) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(230, 200, 150, 1)');   
            gradient.addColorStop(0.4, 'rgba(194, 178, 128, 0.9)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');         
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureCat = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xd2b48c, size: window.isMobile ? 5.0 : 10.0, map: window.textureCat, 
            transparent: true, opacity: 0.9, blending: THREE.NormalBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngCrocodile.push({ system: pts, velocities: vels, life: 35, upVector: upVector.clone() }); 
    }

    function taoVatTheCrocodile(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let dsMat = Array.isArray(c.material) ? c.material : [c.material];
                        dsMat.forEach(m => m.transparent = true);
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
                group.add(v);
            });
        }
        return group;
    }

    function taoLocXoayCat(banKinh, chieuCao) {
        const group = new THREE.Group();
        const soLuong = Math.floor(banKinh * chieuCao * (window.isMobile ? 2 : 5)); 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        
        for(let i=0; i<soLuong; i++) {
            let h = Math.random() * chieuCao;
            let r = Math.random() * banKinh * (0.2 + 0.8 * (h / chieuCao)); // Tạo hình phễu lốc xoáy
            let theta = Math.random() * Math.PI * 2;
            posArr[i*3] = Math.cos(theta) * r;
            posArr[i*3+1] = h;
            posArr[i*3+2] = Math.sin(theta) * r;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureCat) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(230, 200, 150, 1)');   
            gradient.addColorStop(0.4, 'rgba(194, 178, 128, 0.9)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');         
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureCat = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xc2b280, size: window.isMobile ? 4.0 : 8.0, map: window.textureCat,
            transparent: true, opacity: 0.7, blending: THREE.NormalBlending, depthWrite: false
        });
        const pts = new THREE.Points(geo, mat);
        group.add(pts);
        return group;
    }

    function timXuong(nvc, dsTen) {
        let xuong = null;
        nvc.traverse(c => {
            if (c.isBone && dsTen.includes(c.name) && !xuong) xuong = c;
        });
        return xuong;
    }

    // ==========================================
    // 3. TUNG CHIÊU & KHÓA MỤC TIÊU
    // ==========================================
    window.tungComboCrocodile = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        
        if (isRemote && casterId) {
            if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            } else if (typeof window.danhSachQuaiVat !== 'undefined') {
                let boss = window.danhSachQuaiVat.find(q => q.id == casterId || q.id === casterId);
                if (boss && boss.mesh) nvc = boss.mesh;
            }
        }
        if (!nvc && !isRemote) return;

        let loaiChieu = phim;
        let animCanMua = 'ATTACK1';
        if (typeof phim === 'string') {
            let pUp = phim.toUpperCase();
            if (pUp.includes('ATTACK4') || pUp === 'F') { loaiChieu = 'F'; animCanMua = 'ATTACK4'; }
            else if (pUp.includes('ATTACK3') || pUp === 'R') { loaiChieu = 'R'; animCanMua = 'ATTACK3'; }
            else if (pUp.includes('ATTACK2') || pUp === 'E') { loaiChieu = 'E'; animCanMua = 'ATTACK2'; }
            else if (pUp.includes('ATTACK1') || pUp === 'Q') { loaiChieu = 'Q'; animCanMua = 'ATTACK1'; }
            else if (pUp.includes('ATTACK') || pUp.includes('SKILL')) {
                let arr = ['Q', 'E', 'R', 'F'];
                loaiChieu = arr[Math.floor(Math.random() * arr.length)];
                animCanMua = 'ATTACK' + (Math.floor(Math.random() * 4) + 1);
            }
        }

        if (isRemote === false) {
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
        } else {
            if (nvc.userData && nvc.userData.mixer && nvc.userData.animationsMap && nvc.userData.animationsMap[animCanMua]) {
                nvc.userData.animationsMap[animCanMua].reset().fadeIn(0.2).play();
            }
        }

        let viTriGocToTam = new THREE.Vector3();
        let upVector = new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); 
        let mucTieu = null;

        if (isRemote) {
            if (remoteGoc) {
                viTriGocToTam.set(remoteGoc.x, remoteGoc.y, remoteGoc.z);
                if (viTriGocToTam.lengthSq() > 0.001) upVector.copy(viTriGocToTam).normalize(); 
            } else if (nvc) {
                if (nvc.position.lengthSq() > 0.001) upVector.copy(nvc.position).normalize();
                viTriGocToTam.copy(nvc.position).add(upVector.clone().multiplyScalar(3.5));
            }
            if (remoteHuong) huongMat.set(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            else if (nvc) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
            
            if (remoteDich) mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
        } else {
            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                upVector = nvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
            } else if (nvc.up) { upVector = nvc.up.clone().normalize(); }

            nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize();
            if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }

            viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));
            let targetRadar = window.layMucTieuGanNhatCrocodile(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) {
                let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(targetRadar.mesh) : null;
                mucTieu = (hitBox && hitBox.tamNguc) ? hitBox.tamNguc.clone() : targetRadar.mesh.position.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Crocodile', 
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) dameGoc = window.remotePlayers[casterId].damage || 100;
        }

        // =====================================
        // 🔥 CHIÊU Q: Đấm Tay Trái (Móc Câu) -> Đấm Tay Phải (Cát)
        // =====================================
        if (loaiChieu === 'Q') {
            // Nòng 1: Tay Trái
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }
                
                let tayTrai = timXuong(curNvc, ['LHand_Palm_037', 'LHand', 'mixamorigLeftHand']);
                let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(3.5));
                if (tayTrai) tayTrai.getWorldPosition(diemBan);

                const mocCau = taoVatTheCrocodile('crocodile_MOCCAU', 2.0); 
                mocCau.position.copy(diemBan).add(cDir.clone().multiplyScalar(1.0));
                mocCau.up.copy(cUp); mocCau.lookAt(mucTieu); scene.add(mocCau);
                
                kyNangCrocodile.push({
                    mesh: mocCau, type: 'BAY_THANG', speed: 8.0, life: 80, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.2, isRemote: isRemote, noBanKinh: 10, upVector: cUp.clone()
                });
            }, 100);

            // Nòng 2: Tay Phải
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }
                
                let tayPhai = timXuong(curNvc, ['RHand_Palm_042', 'RHand', 'mixamorigRightHand']);
                let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(3.5));
                if (tayPhai) tayPhai.getWorldPosition(diemBan);

                const tayCat = taoVatTheCrocodile('crocodile_TAYPHAI', 2.0); 
                tayCat.position.copy(diemBan).add(cDir.clone().multiplyScalar(1.0));
                tayCat.up.copy(cUp); tayCat.lookAt(mucTieu); scene.add(tayCat);
                
                kyNangCrocodile.push({
                    mesh: tayCat, type: 'BAY_THANG', speed: 9.0, life: 80, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.2, isRemote: isRemote, noBanKinh: 12, upVector: cUp.clone()
                });
            }, 350);
        }

        // =====================================
        // 🔥 CHIÊU E: Móc Câu Khổng Lồ
        // =====================================
        else if (loaiChieu === 'E') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }
                
                let tayTrai = timXuong(curNvc, ['LHand_Palm_037', 'LHand', 'mixamorigLeftHand']);
                let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(3.5));
                if (tayTrai) tayTrai.getWorldPosition(diemBan);

                const mocCauTo = taoVatTheCrocodile('crocodile_MOCCAU', 6.0); // Scale x3 (2.0 -> 6.0)
                mocCauTo.position.copy(diemBan).add(cDir.clone().multiplyScalar(2.0));
                mocCauTo.up.copy(cUp); mocCauTo.lookAt(mucTieu); scene.add(mocCauTo);
                
                kyNangCrocodile.push({
                    mesh: mocCauTo, type: 'BAY_THANG', speed: 6.0, life: 100, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.4, isRemote: isRemote, noBanKinh: 20, upVector: cUp.clone()
                });
            }, 200);
        }

        // =====================================
        // 🔥 CHIÊU R: Bão Cát Nhỏ (Cao 10m, Rộng 20m)
        // =====================================
        else if (loaiChieu === 'R') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }
                
                let tayPhai = timXuong(curNvc, ['RHand_Palm_042', 'RHand', 'mixamorigRightHand']);
                let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(2.0));
                if (tayPhai) tayPhai.getWorldPosition(diemBan);

                const locXoayR = taoLocXoayCat(10, 12); // Rộng 20m (Bán kính 10), Cao 12m
                locXoayR.position.copy(diemBan);
                locXoayR.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cUp);
                scene.add(locXoayR);
                
                kyNangCrocodile.push({
                    mesh: locXoayR, type: 'TORNADO', speed: 4.0, life: 150, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.5, isRemote: isRemote, noBanKinh: 20, upVector: cUp.clone()
                });
            }, 400);
        }

        // =====================================
        // 🔥 CHIÊU F: Đại Lốc Xoáy Sa Mạc (Cao 50m, Rộng 50m)
        // =====================================
        else if (loaiChieu === 'F') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }
                
                let tayPhai = timXuong(curNvc, ['RHand_Palm_042', 'RHand', 'mixamorigRightHand']);
                let diemBan = curNvc.position.clone();
                if (tayPhai) tayPhai.getWorldPosition(diemBan);

                const locXoayF = taoLocXoayCat(25, 50); // Rộng 50m (Bán kính 25), Cao 50m
                locXoayF.position.copy(diemBan);
                locXoayF.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cUp);
                scene.add(locXoayF);
                
                kyNangCrocodile.push({
                    mesh: locXoayF, type: 'TORNADO', speed: 5.5, life: 250, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 1.0, isRemote: isRemote, noBanKinh: 40, upVector: cUp.clone()
                });
            }, 500);
        }
    };

    // ==========================================
    // 4. VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU 
    // ==========================================
    window.updateCombatCrocodile = function () {
        for (let i = kyNangCrocodile.length - 1; i >= 0; i--) {
            let s = kyNangCrocodile[i]; s.life--;

            if (s.mesh && s.mesh.userData && s.mesh.userData.mixer) s.mesh.userData.mixer.update(0.03);

            if (s.type === 'BAY_THANG') {
                if (s.targetPos) {
                    if (!s.isRemote) {
                        let objMoi = window.layMucTieuGanNhatCrocodile(s.mesh.position);
                        if (objMoi && objMoi.mesh) {
                            let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(objMoi.mesh) : null;
                            if (hitBox && hitBox.tamNguc) s.targetPos = hitBox.tamNguc.clone();
                        }
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); 
                    dummy.up.copy(s.upVector || new THREE.Vector3(0,1,0)); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.2); 
                    
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    if (!isNaN(huongBay.x)) s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else {
                    s.mesh.translateZ(s.speed);
                }

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    let diemNo = (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) ? s.targetPos : s.mesh.position;
                    if (s.isRemote === false) gaySatThuongCrocodile(diemNo, s.damage, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(diemNo, s.damage, s.noBanKinh);
                    
                    taoHieuUngNoCat(diemNo, false, s.upVector);
                    s.life = 0;
                }
            }
            else if (s.type === 'TORNADO') {
                // Xoay lốc xoáy cho nó cuộn cát
                if (s.mesh.children[0]) s.mesh.children[0].rotateY(0.15);

                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    if (!isNaN(huongBay.x)) {
                        // Trượt trên mặt đất thay vì bay lên trời
                        let truotVec = huongBay.projectOnPlane(s.upVector).normalize();
                        s.mesh.position.add(truotVec.multiplyScalar(s.speed));
                    }
                }

                // Sát thương rải thảm liên tục (Ticking AoE Damage)
                if (s.life % 10 === 0) {
                    let tickDame = s.damage * 0.15; // Mỗi lần quét hút máu từ từ
                    if (s.isRemote === false) gaySatThuongCrocodile(s.mesh.position, tickDame, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.mesh.position, tickDame, s.noBanKinh);
                    taoHieuUngNoCat(s.mesh.position, false, s.upVector);
                }

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    // Nổ sát thương bồi cuối cùng
                    if (s.isRemote === false) gaySatThuongCrocodile(s.targetPos, s.damage * 0.5, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage * 0.5, s.noBanKinh);
                    taoHieuUngNoCat(s.targetPos, true, s.upVector);
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangCrocodile.splice(i, 1);
            }
        }

        // BỤI KHÓI CÁT RƠI THEO TRỤC CẦU
        for (let i = hieuUngCrocodile.length - 1; i >= 0; i--) {
            let h = hieuUngCrocodile[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            
            // Cát sẽ rơi rụng dần xuống mặt đất do nặng
            let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(-0.15) : new THREE.Vector3(0, -0.15, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].multiplyScalar(0.9); h.velocities[j].add(fallVec); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 35; 

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose(); if (h.system.material) h.system.material.dispose();
                hieuUngCrocodile.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayCrocodile.length - 1; i >= 0; i--) {
            let it = danhSachSoBayCrocodile[i]; it.offsetY += 0.05; it.life--;
            if (typeof camera !== 'undefined' && it.pos) {
                const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
                if (p.z < 1) {
                    it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
                } else it.el.style.display = 'none';
            } else it.el.style.display = 'none';
            
            if (it.life <= 0) { 
                if (it.el && it.el.parentNode) it.el.parentNode.removeChild(it.el);
                danhSachSoBayCrocodile.splice(i, 1); window.tongSoChuNoi_Crocodile--; 
            }
        }
    };
    setInterval(window.updateCombatCrocodile, 30);

    // ==========================================
    // 5. KHỞI TẠO & ĐĂNG KÝ HỆ PHÁI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('crocodile')) {
        window.HePhaiHienTai = {
            tenPhai: "Thất Vũ Hải Crocodile",
            khoiTao: function () {
                console.log("🌪️ Khởi động Thất Vũ Hải Crocodile chuẩn AAA!");
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/crocodile_MOCCAU.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/crocodile_TAYPHAI.glb', () => {});
                }
                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false; let animBay = null; let animChay = null;
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase(); let clip = window.animationsMap[key];
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position') && (tenTrack.includes('armature') || tenTrack.includes('hips') || tenTrack.includes('pelvis') || tenTrack.includes('root'))) return false;
                                    return true;
                                });
                            }
                        }
                        const tuKhoaCam = ['hit', 'hurt', 'damage', 'die', 'death', 'dead', 'defend'];
                        if (tuKhoaCam.some(tuCam => k.includes(tuCam.toUpperCase()))) continue;

                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('ATTACK') || k.includes('SKILL')) window.KHO_ANIM_TANCONG.push(key);
                        if (k.includes('BAY') || k.includes('FLY')) { coBay = true; animBay = clip; window.animationsMap['BAY'] = animBay; }
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) { coChay = true; animChay = clip; window.animationsMap['CHAYBO'] = animChay; }
                    }
                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }
                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push('NHANROI1');
                    let defaultIdle = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                }
            },
            tungChieu: window.tungComboCrocodile,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();

// =========================================================================
// 6. ÁNH XẠ CHỮA BỆNH CÂM NÍN 100% CHO AI BOSS
// =========================================================================
window.tungCombocrocodile = window.tungComboCrocodile;
window.tungComboCrocodile = window.tungComboCrocodile;
window.tungComboSirCrocodile = window.tungComboCrocodile;
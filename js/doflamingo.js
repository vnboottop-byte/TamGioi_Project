// ==========================================
// ⚔️ MÔN PHÁI: THIÊN DẠ XOA DOFLAMINGO (ITO ITO NO MI)
// 👑 CÔNG NGHỆ: 100% THREE.JS CODE ĐỂ VẼ TƠ + AAA V5 TEMPLATE + 32 ATTACK SUPPORT
// ==========================================

(function () {
    const kyNangDoflamingo = [];
    const hieuUngDoflamingo = [];
    const danhSachSoBayDoflamingo = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Doflamingo = 0;

    // ==========================================
    // 1. LÕI TIỆN ÍCH CƠ BẢN
    // ==========================================
    function taoSoSatThuongDoflamingo(pos3D, satThuong, mauSac = '#ffcccc') {
        if (window.isMobile) return;
        if (satThuong <= 0 || (window.isMobile && window.tongSoChuNoi_Doflamingo > 5)) return;
        window.tongSoChuNoi_Doflamingo++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #ff0066';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayDoflamingo.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatDoflamingo = function (viTriGoc) {
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

    function gaySatThuongDoflamingo(tamNo, luongSatThuong, banKinh) {
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
                        taoSoSatThuongDoflamingo(posHienSo, luongSatThuong, '#ffffff');
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
                            taoSoSatThuongDoflamingo(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongDoflamingo(hit.tamNguc.clone(), luongSatThuong);
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
    // 2. KHO VŨ KHÍ TƠ (TỰ VẼ BẰNG THREE.JS CỰC NHẸ)
    // ==========================================
    function taoHieuUngNoTo(pos, isBig = false, upVector = new THREE.Vector3(0, 1, 0)) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos);

        const soLuong = isBig ? 60 : 20;
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + 1; posArr[i * 3 + 2] = pos.z;
            let speed = isBig ? (Math.random() * 4 + 2) : (Math.random() * 2 + 1);
            let vLocal = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vLocal.applyQuaternion(qNolo);
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xffffff, size: window.isMobile ? 2.0 : 4.0,
            transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngDoflamingo.push({ system: pts, velocities: vels, life: 25, upVector: upVector.clone() });
    }

    // Tơ đạn xé gió
    function taoToDan(chieuDai) {
        const geo = new THREE.CylinderGeometry(0.15, 0.05, chieuDai, 5);
        geo.rotateX(Math.PI / 2); // Xoay ngang để đâm tới
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
        return new THREE.Mesh(geo, mat);
    }

    // 5 Sợi Tơ Sắc Bén (Goshikito)
    function taoNguSacTo() {
        const group = new THREE.Group();
        const khoangCach = 1.5;
        for (let i = -2; i <= 2; i++) {
            const soiTo = taoToDan(20);
            soiTo.position.set(i * khoangCach, 0, 0);
            group.add(soiTo);
        }
        return group;
    }

    // Tơ Thức Tỉnh (Mọc từ dưới đất lên)
    function taoToThucTinh() {
        const group = new THREE.Group();
        for (let i = 0; i < 12; i++) {
            let chieuCao = 30 + Math.random() * 20;
            const geo = new THREE.CylinderGeometry(0.5, 2, chieuCao, 6);
            const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, wireframe: Math.random() > 0.5 });
            const soiTo = new THREE.Mesh(geo, mat);

            soiTo.position.set((Math.random() - 0.5) * 20, chieuCao / 2, (Math.random() - 0.5) * 20);
            soiTo.rotation.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5);
            group.add(soiTo);
        }
        return group;
    }

    // Lồng Chim (Birdcage)
    function taoLongChim(banKinh) {
        // Vẽ hình bán cầu lưới tơ khổng lồ
        const geo = new THREE.SphereGeometry(banKinh, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffdddd, wireframe: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
        return new THREE.Mesh(geo, mat);
    }

    // ==========================================
    // 3. TUNG CHIÊU & KHÓA MỤC TIÊU
    // ==========================================
    window.tungComboDoflamingo = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
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
                // Bốc ngẫu nhiên từ kho 32 Animation nếu có
                if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
                    animCanMua = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
                } else {
                    animCanMua = 'ATTACK' + (Math.floor(Math.random() * 4) + 1);
                }
            }
        }

        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
                animCanMua = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
            }
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);

            if (window.henGioTatMuaDoffy) clearTimeout(window.henGioTatMuaDoffy);
            window.henGioTatMuaDoffy = setTimeout(() => { window.dangMuaChieu = false; }, 800);
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
            let targetRadar = window.layMucTieuGanNhatDoflamingo(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) {
                let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(targetRadar.mesh) : null;
                mucTieu = (hitBox && hitBox.tamNguc) ? hitBox.tamNguc.clone() : targetRadar.mesh.position.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Doflamingo',
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
        // 🔥 CHIÊU Q: NGŨ SẮC TƠ (5 Sợi tơ cào tới)
        // =====================================
        if (loaiChieu === 'Q') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }

                let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(3.5));

                const nguSac = taoNguSacTo();
                nguSac.position.copy(diemBan).add(cDir.clone().multiplyScalar(2.0));
                nguSac.up.copy(cUp); nguSac.lookAt(mucTieu); scene.add(nguSac);

                kyNangDoflamingo.push({
                    mesh: nguSac, type: 'BAY_THANG', speed: 12.0, life: 60,
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.4, isRemote: isRemote, noBanKinh: 15, upVector: cUp.clone()
                });
            }, 200);
        }

        // =====================================
        // 🔥 CHIÊU E: ĐẠN TƠ (Bắn liên hoàn 10 sợi tơ)
        // =====================================
        else if (loaiChieu === 'E') {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                    let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }

                    let rightVec = new THREE.Vector3().crossVectors(cDir, cUp).normalize();
                    let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(3.5))
                        .add(rightVec.multiplyScalar((Math.random() - 0.5) * 6))
                        .add(cUp.clone().multiplyScalar((Math.random() - 0.5) * 4));

                    const danTo = taoToDan(8);
                    danTo.position.copy(diemBan);
                    danTo.up.copy(cUp); danTo.lookAt(mucTieu); scene.add(danTo);

                    kyNangDoflamingo.push({
                        mesh: danTo, type: 'BAY_THANG', speed: 15.0, life: 80,
                        targetPos: mucTieu.clone(), damage: dameGoc * 0.08, isRemote: isRemote, noBanKinh: 10, upVector: cUp.clone()
                    });
                }, i * 60);
            }
        }

        // =====================================
        // 🔥 CHIÊU R: ĐỘT KÍCH TƠ THỨC TỈNH (Mọc măng từ dưới đất lên ở chỗ kẻ địch)
        // =====================================
        else if (loaiChieu === 'R') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));

                // Mọc thẳng dưới chân mục tiêu
                let posDap = mucTieu.clone().sub(cUp.clone().multiplyScalar(5)); // Chôn dưới đất 5m

                const thucTinh = taoToThucTinh();
                thucTinh.position.copy(posDap);
                thucTinh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cUp);
                scene.add(thucTinh);

                kyNangDoflamingo.push({
                    mesh: thucTinh, type: 'MOC_MANG_TO', speed: 2.0, life: 100,
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.6, isRemote: isRemote, noBanKinh: 25, upVector: cUp.clone()
                });
            }, 300);
        }

        // =====================================
        // 🔥 CHIÊU F: LỒNG CHIM (Birdcage - Ép chặt và sát thương liên tục)
        // =====================================
        else if (loaiChieu === 'F') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));

                let diemChan = mucTieu.clone(); // Rớt xuống ngay đầu địch

                const longChim = taoLongChim(60); // Bán kính 60m
                longChim.position.copy(diemChan);
                longChim.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cUp);
                scene.add(longChim);

                kyNangDoflamingo.push({
                    mesh: longChim, type: 'LONG_CHIM', speed: 0.2, life: 250, currentRadius: 60,
                    targetPos: diemChan, damage: dameGoc * 1.0, isRemote: isRemote, noBanKinh: 60, upVector: cUp.clone()
                });
            }, 500);
        }
    };

    // ==========================================
    // 4. VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU 
    // ==========================================
    window.updateCombatDoflamingo = function () {
        for (let i = kyNangDoflamingo.length - 1; i >= 0; i--) {
            let s = kyNangDoflamingo[i]; s.life--;

            if (s.type === 'BAY_THANG') {
                if (s.targetPos) {
                    if (!s.isRemote) {
                        let objMoi = window.layMucTieuGanNhatDoflamingo(s.mesh.position);
                        if (objMoi && objMoi.mesh) {
                            let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(objMoi.mesh) : null;
                            if (hitBox && hitBox.tamNguc) s.targetPos = hitBox.tamNguc.clone();
                        }
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position);
                    dummy.up.copy(s.upVector || new THREE.Vector3(0, 1, 0)); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.2);

                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    if (!isNaN(huongBay.x)) s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else {
                    s.mesh.translateZ(s.speed);
                }

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    let diemNo = (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) ? s.targetPos : s.mesh.position;
                    if (s.isRemote === false) gaySatThuongDoflamingo(diemNo, s.damage, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(diemNo, s.damage, s.noBanKinh);

                    taoHieuUngNoTo(diemNo, false, s.upVector);
                    s.life = 0;
                }
            }
            else if (s.type === 'MOC_MANG_TO') {
                // Đâm lên mượt mà
                if (s.life > 80) {
                    s.mesh.position.add(s.upVector.clone().multiplyScalar(s.speed));
                }
                // Xoay nhẹ các mũi tơ
                s.mesh.children.forEach(c => c.rotateY(0.1));

                if (s.life === 80) {
                    if (s.isRemote === false) gaySatThuongDoflamingo(s.targetPos, s.damage, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                    taoHieuUngNoTo(s.targetPos, true, s.upVector);
                }

                if (s.life < 20) {
                    s.mesh.position.sub(s.upVector.clone().multiplyScalar(s.speed * 1.5)); // Rụt lại xuống đất
                }
            }
            else if (s.type === 'LONG_CHIM') {
                // Lồng chim xoay vòng và siết nhỏ lại
                s.mesh.rotateY(0.02);
                s.currentRadius -= s.speed;
                if (s.currentRadius < 5) s.currentRadius = 5;

                let scaleRatio = s.currentRadius / 60;
                s.mesh.scale.set(scaleRatio, scaleRatio, scaleRatio);
                s.noBanKinh = s.currentRadius;

                // Sát thương rải thảm liên tục bóp nghẹt
                if (s.life % 15 === 0) {
                    let tickDame = s.damage * 0.1;
                    if (s.isRemote === false) gaySatThuongDoflamingo(s.mesh.position, tickDame, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.mesh.position, tickDame, s.noBanKinh);
                    taoHieuUngNoTo(s.mesh.position, false, s.upVector);
                }

                if (s.life <= 0) {
                    if (s.isRemote === false) gaySatThuongDoflamingo(s.mesh.position, s.damage * 0.5, 10);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.mesh.position, s.damage * 0.5, 10);
                    taoHieuUngNoTo(s.mesh.position, true, s.upVector);
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangDoflamingo.splice(i, 1);
            }
        }

        // BỤI TƠ BAY LÊN RƠI XUỐNG THEO TRỤC CẦU
        for (let i = hieuUngDoflamingo.length - 1; i >= 0; i--) {
            let h = hieuUngDoflamingo[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;

            let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(-0.05) : new THREE.Vector3(0, -0.05, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].multiplyScalar(0.9); h.velocities[j].add(fallVec);
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 25;

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose(); if (h.system.material) h.system.material.dispose();
                hieuUngDoflamingo.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayDoflamingo.length - 1; i >= 0; i--) {
            let it = danhSachSoBayDoflamingo[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';
            if (it.life <= 0) { it.el.remove(); danhSachSoBayDoflamingo.splice(i, 1); window.tongSoChuNoi_Doflamingo--; }
        }
    };
    setInterval(window.updateCombatDoflamingo, 30);

    // ==========================================
    // 5. KHỞI TẠO & ĐĂNG KÝ HỆ PHÁI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('doflamingo')) {
        window.HePhaiHienTai = {
            tenPhai: "Thiên Dạ Xoa Doflamingo",
            khoiTao: function () {
                console.log("🧵 Khởi động sức mạnh tơ thức tỉnh Doflamingo!");
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
                        // 🌟 TỰ ĐỘNG GOM SẠCH 32 CHIÊU ATTACK VÀO RỔ
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
            tungChieu: window.tungComboDoflamingo,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();

// =========================================================================
// 6. ÁNH XẠ CHỮA BỆNH CÂM NÍN 100% CHO AI BOSS
// =========================================================================
window.tungCombodoflamingo = window.tungComboDoflamingo;
window.tungComboDoflamingo = window.tungComboDoflamingo;
window.tungComboThienDaXoa = window.tungComboDoflamingo;
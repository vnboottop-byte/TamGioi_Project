// ==========================================
// ⚔️ MÔN PHÁI: THIÊN DẠ XOA DOFLAMINGO (ITO ITO NO MI)
// 👑 CÔNG NGHỆ: 100% CODE VẼ TƠ + TƠ CẮT KHÔNG GIAN + MỌC TƠ GỐC CHUẨN
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

        // Bọc hạt bụi mịn viền hồng nhạt
        if (!window.textureToMin) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 230, 255, 0.8)');
            gradient.addColorStop(0.6, 'rgba(255, 150, 200, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureToMin = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xffffff, size: window.isMobile ? 6.0 : 12.0, map: window.textureToMin,
            transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngDoflamingo.push({ system: pts, velocities: vels, life: 25, upVector: upVector.clone() });
    }

    // Tơ đạn (Q & E) - Dựng theo trục Z để khi Scale nó vươn dài
    function taoToDan(chieuDai) {
        const geo = new THREE.CylinderGeometry(0.15, 0.05, chieuDai, 5);
        geo.rotateX(Math.PI / 2); // Đặt theo trục Z
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
        return new THREE.Mesh(geo, mat);
    }

    // 🌟 BẢN VÁ MỚI: Tơ Đầu Nhọn Cong (Chiêu R) - Mọc từ gốc
    function taoToCongNhon(chieuDai) {
        const group = new THREE.Group();
        const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });

        // Trục Z là hướng đâm tới. Dời tâm (translate) về 0 để khi Scale nó dài ra từ GỐC.
        const l1 = chieuDai * 0.4;
        const g1 = new THREE.CylinderGeometry(0.8, 1.4, l1, 8);
        g1.rotateX(Math.PI / 2); g1.translate(0, 0, l1 / 2);
        const c1 = new THREE.Mesh(g1, m);

        const l2 = chieuDai * 0.4;
        const g2 = new THREE.CylinderGeometry(0.3, 0.8, l2, 8);
        g2.rotateX(Math.PI / 2); g2.translate(0, 0, l2 / 2);
        const c2 = new THREE.Mesh(g2, m);
        c2.position.set(0, 0, l1);
        c2.rotation.x = -0.15; // Bẻ gập cong như quả chuối

        const l3 = chieuDai * 0.2;
        const g3 = new THREE.ConeGeometry(0.3, l3, 8);
        g3.rotateX(Math.PI / 2); g3.translate(0, 0, l3 / 2);
        const c3 = new THREE.Mesh(g3, m);
        c3.position.set(0, 0, l2);
        c3.rotation.x = -0.15; // Bẻ gập mũi nhọn thêm chút nữa

        c2.add(c3); c1.add(c2);
        group.add(c1);
        return group;
    }

    // Lồng Chim (Birdcage)
    function taoLongChim(banKinh) {
        const geo = new THREE.SphereGeometry(banKinh, 32, 32);
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
        // 🔥 CHIÊU Q: ĐẠN TƠ XEN KẼ TRÁI - PHẢI
        // =====================================
        if (loaiChieu === 'Q') {
            const soLuong = 8;
            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                    let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }

                    let rightVec = new THREE.Vector3().crossVectors(cDir, cUp).normalize();
                    // Xen kẽ trái (-1) và phải (+1)
                    let doLechNgang = (i % 2 === 0 ? 1 : -1) * (1.5 + Math.random());

                    let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(3.5)).add(rightVec.multiplyScalar(doLechNgang));

                    const danTo = taoToDan(12);
                    danTo.position.copy(diemBan);
                    danTo.up.copy(cUp); danTo.lookAt(mucTieu); scene.add(danTo);

                    kyNangDoflamingo.push({
                        mesh: danTo, type: 'BAY_THANG', speed: 14.0, life: 80,
                        targetPos: mucTieu.clone(), damage: dameGoc * 0.1, isRemote: isRemote, noBanKinh: 10, upVector: cUp.clone()
                    });
                }, i * 80);
            }
        }

        // =====================================
        // 🔥 CHIÊU E: LƯỚI TƠ CẮT KHÔNG GIAN (Xuất hiện chém đứt xung quanh mục tiêu)
        // =====================================
        else if (loaiChieu === 'E') {
            const soLuong = 6;
            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));

                    // Lấy Tâm Ngực mục tiêu làm lõi để chém
                    let center = mucTieu.clone().add(cUp.clone().multiplyScalar(2));

                    // Điểm bắt đầu và kết thúc của sợi tơ vắt ngang qua không gian
                    let startPos = center.clone().add(new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20));
                    let endPos = center.clone().add(new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20));

                    let chieuDai = startPos.distanceTo(endPos);
                    const toCat = taoToDan(chieuDai);
                    toCat.position.copy(startPos.clone().lerp(endPos, 0.5)); // Đặt ở giữa
                    toCat.up.copy(cUp); toCat.lookAt(endPos);
                    toCat.scale.set(1, 1, 0.01); // Ban đầu là 1 chấm, sẽ kéo dài ra
                    scene.add(toCat);

                    kyNangDoflamingo.push({
                        mesh: toCat, type: 'TO_CAT', speed: 0.15, life: 30,
                        targetPos: center, damage: dameGoc * 0.2, isRemote: isRemote, noBanKinh: 15, upVector: cUp.clone()
                    });
                }, i * 150); // Xuất hiện lần lượt cắt nát không gian
            }
        }

        // =====================================
        // 🔥 CHIÊU R: MƯA TƠ THỨC TỈNH (Gốc đứng yên, mũi nhọn đâm tới)
        // =====================================
        else if (loaiChieu === 'R') {
            const soLuong = 8;
            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                    let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }

                    let rightVec = new THREE.Vector3().crossVectors(cDir, cUp).normalize();

                    // Gốc mọc xung quanh Player
                    let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(0.5))
                        .add(rightVec.multiplyScalar((Math.random() - 0.5) * 20))
                        .add(cDir.clone().multiplyScalar((Math.random() - 0.5) * 10));

                    let chieuDai = diemBan.distanceTo(mucTieu) + 15; // Dài vượt qua đích
                    const toCong = taoToCongNhon(chieuDai);
                    toCong.position.copy(diemBan);
                    toCong.up.copy(cUp); toCong.lookAt(mucTieu);
                    toCong.rotateZ(Math.random() * Math.PI * 2); // Xoay vòng quanh trục đâm để mũi nhọn vây ráp mục tiêu từ nhiều hướng

                    toCong.scale.set(0.01, 0.01, 0.01); // Ban đầu thu nhỏ ẩn dưới đất
                    scene.add(toCong);

                    kyNangDoflamingo.push({
                        mesh: toCong, type: 'TO_DAM', speed: 0.08, life: 60, progress: 0,
                        targetPos: mucTieu.clone(), damage: dameGoc * 0.15, isRemote: isRemote, noBanKinh: 15, upVector: cUp.clone()
                    });
                }, i * 100);
            }
        }

        // =====================================
        // 🔥 CHIÊU F: LỒNG CHIM (Ép chặt mục tiêu)
        // =====================================
        else if (loaiChieu === 'F') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));

                let diemChan = mucTieu.clone();

                const longChim = taoLongChim(60);
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
            // TƠ CẮT KHÔNG GIAN (Chiêu E)
            else if (s.type === 'TO_CAT') {
                if (s.mesh.scale.z < 1) {
                    s.mesh.scale.z += s.speed; // Xé không gian kéo dài tơ ra
                }
                if (s.life === 15) { // Sát thương khi tơ vừa cắt xong
                    if (s.isRemote === false) gaySatThuongDoflamingo(s.targetPos, s.damage, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                    taoHieuUngNoTo(s.mesh.position, false, s.upVector);
                }
            }
            // TƠ ĐÂM TỪ GỐC (Chiêu R)
            else if (s.type === 'TO_DAM') {
                if (s.progress < 1) {
                    s.progress += s.speed;
                    if (s.progress > 1) s.progress = 1;
                    // Phóng to kích thước từ gốc vút ra
                    s.mesh.scale.set(s.progress, s.progress, s.progress);
                }

                if (s.life === 30) { // Khi vừa đâm tới thì giật sát thương
                    if (s.isRemote === false) gaySatThuongDoflamingo(s.targetPos, s.damage, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                    taoHieuUngNoTo(s.targetPos, false, s.upVector);
                }

                if (s.life < 10) {
                    // Cắm xong thì rút tơ về nhanh chóng
                    let tile = Math.max(0, s.life / 10);
                    s.mesh.scale.set(tile, tile, tile);
                }
            }
            // LỒNG CHIM (Chiêu F)
            else if (s.type === 'LONG_CHIM') {
                s.mesh.rotateY(0.02);
                s.mesh.rotateX(0.01);

                s.currentRadius -= s.speed;
                if (s.currentRadius < 3) s.currentRadius = 3;

                let scaleRatio = s.currentRadius / 60;
                s.mesh.scale.set(scaleRatio, scaleRatio, scaleRatio);
                s.noBanKinh = s.currentRadius;

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
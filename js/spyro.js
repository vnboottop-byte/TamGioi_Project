// ==========================================
// 🔥 HỆ THỐNG ĐOẠT XÁ: VINSMOKE ICHIJI (SPARKING RED)
// 👑 CÔNG NGHỆ: MỞ KHÓA SPAM + BẢN GỐC + VÁ LỖI TRỤC CẦU 3D
// ==========================================

(function () {
    const kyNangIchiji = [];
    const hieuUngIchiji = [];
    const danhSachSoBayICJ = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_ICJ = 0;

    // 🌟 1. HIỂN THỊ SÁT THƯƠNG
    function taoSoSatThuongICJ(pos3D, satThuong, mauSac = '#ff2200') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_ICJ > 5) return;
        window.tongSoChuNoi_ICJ++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #880000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayICJ.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 2. HỆ THỐNG TÌM MỤC TIÊU
    window.layMucTieuGanNhatICJ = function (viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 200) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 200;
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

        let targetQuai = null; let minDQuai = 200;
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

    function gaySatThuongICJ(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongICJ(posHienSo, luongSatThuong);
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
                            taoSoSatThuongICJ(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff0055');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongICJ(hit.tamNguc.clone(), luongSatThuong);
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

    // 🌟 3. HIỆU ỨNG VỤ NỔ (VÁ LỖI TRỤC CẦU 3D)
    function taoVuNoLUA_ICJ(pos, isRemote = false, luongDame = 100, banKinh = 15, upVector = new THREE.Vector3(0, 1, 0)) {
        if (isRemote === false && luongDame > 0) {
            gaySatThuongICJ(pos, luongDame, banKinh);
        } else if (typeof isRemote === 'number' && isRemote > 0) {
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, luongDame, banKinh);
        }

        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos);
        else if (typeof window.playSound === 'function') window.playSound('no');

        const soLuong = window.isMobile ? 20 : 60;
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];

        // 🌟 BẢN VÁ: Vụ nổ bung ra theo trục địa cầu
        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y; posArr[i * 3 + 2] = pos.z;
            let vLocal = new THREE.Vector3((Math.random() - 0.5) * 12, Math.random() * 10, (Math.random() - 0.5) * 12);
            vLocal.applyQuaternion(qNolo);
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiLuaICJ) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(255, 50, 0, 0.9)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiLuaICJ = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xff3300, size: window.isMobile ? 8.0 : 12.0, map: window.textureBuiLuaICJ,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngIchiji.push({ system: pts, velocities: vels, life: 30, upVector: upVector.clone() });
    }

    // 🌟 4. CÔNG CỤ TẠO MODEL
    function taoVatTheICJ(tenFile, scaleSize) {
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

    function taoTiaLazerDo(startPos, endPos, radius) {
        const group = new THREE.Group();
        let dist = startPos.distanceTo(endPos);
        if (dist < 0.1) dist = 0.1;

        const geoLoi = new THREE.CylinderGeometry(radius * 0.4, radius * 0.4, dist, 8);
        geoLoi.rotateX(Math.PI / 2);
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false });
        const loi = new THREE.Mesh(geoLoi, matLoi);

        const geoVo = new THREE.CylinderGeometry(radius, radius, dist, 8);
        geoVo.rotateX(Math.PI / 2);
        const matVo = new THREE.MeshBasicMaterial({ color: 0xff1100, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
        const vo = new THREE.Mesh(geoVo, matVo);

        group.add(loi); group.add(vo);

        let midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
        group.position.copy(midPoint);
        group.lookAt(endPos);

        return group;
    }

    function timBoPhan(nvc, dsTen) {
        let boPhan = null;
        if (nvc) {
            nvc.traverse(c => {
                if (!boPhan && dsTen.includes(c.name)) boPhan = c;
            });
        }
        return boPhan;
    }

    window.thoiDiemChemCuoi_ICJ = window.thoiDiemChemCuoi_ICJ || 0;

    // ==========================================
    // 🔥 TUNG CHIÊU ICHIJI (BẢN GỐC + SPAM PHÍM + TỌA ĐỘ ĐỘNG)
    // ==========================================
    window.tungComboIchiji = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        let animCanMua = '';
        if (phim === 'Q') animCanMua = 'ATTACK1';
        if (phim === 'E') animCanMua = 'ATTACK3';
        if (phim === 'R') animCanMua = 'ATTACK5';
        if (phim === 'F') animCanMua = 'ATTACK6';

        // 🌟 BẢN VÁ: XÓA `return` BLOCK 800MS ĐỂ MỞ KHÓA NUỐT CHIÊU
        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);

            // Nhả khóa nhanh để Spam Combo mượt mà
            if (window.henGioTatMuaICJ) clearTimeout(window.henGioTatMuaICJ);
            window.henGioTatMuaICJ = setTimeout(() => { window.dangMuaChieu = false; }, 600);
        }

        // 🌟 BẢN VÁ: ÉP PHẲNG VECTOR HƯỚNG MẶT
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
            let targetRadar = window.layMucTieuGanNhatICJ(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) mucTieu = window.layHitbox(targetRadar.mesh).tamNguc.clone();
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Ichiji',
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
        // 🔥 CHIÊU Q (ATTACK1): Quả cầu nhỏ tụ lực 300ms
        // ===============================================
        if (animCanMua === 'ATTACK1') {
            let tayPhai = timBoPhan(nvc, ['Object_20', 'RHand_Palm_056', 'RHand']);
            let diemBan = viTriGocToTam.clone();
            if (tayPhai) tayPhai.getWorldPosition(diemBan);

            const cauDo = taoVatTheICJ('DO', 1.0);
            cauDo.position.copy(diemBan);
            cauDo.up.copy(upVector); // Vá Map Cầu
            scene.add(cauDo);

            kyNangIchiji.push({
                mesh: cauDo, type: 'BAY_SAU_KHI_TU', speed: 8.0, life: 120,
                delay: 10, objNeo: tayPhai, originOffset: viTriGocToTam,
                currentScale: 1.0, maxScale: 8.0, growthRate: 0.3,
                targetPos: mucTieu.clone(), damage: dameGoc * 0.4, noBanKinh: 20,
                isSpinning: true, spinSpeed: 0.1, isRemote: isRemote, upVector: upVector.clone()
            });
        }

        // ===============================================
        // 🔥 CHIÊU E (ATTACK3): Quả cầu vừa (Size 2.5) 
        // ===============================================
        else if (animCanMua === 'ATTACK3') {
            setTimeout(() => {
                // 🌟 BẢN VÁ: QUÉT LẠI TỌA ĐỘ ĐỘNG TRONG SETTIMEOUT CHỐNG RỚT LẠI PHÍA SAU
                let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                let tayPhai = timBoPhan(curNvc, ['Object_20', 'RHand_Palm_056', 'RHand']);
                let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                if (tayPhai) tayPhai.getWorldPosition(diemBan);

                const cauDoE = taoVatTheICJ('DO', 2.5);
                cauDoE.position.copy(diemBan).add(curDir.clone().multiplyScalar(1.5));
                cauDoE.up.copy(curUp); // Vá Map Cầu
                cauDoE.lookAt(mucTieu); scene.add(cauDoE);

                kyNangIchiji.push({
                    mesh: cauDoE, type: 'BAY_THANG_PHINH_TO', speed: 9.0, life: 100,
                    currentScale: 2.5, maxScale: 10.0, growthRate: 0.3,
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.6, noBanKinh: 20,
                    isSpinning: true, spinSpeed: 0.15, isRemote: isRemote, upVector: curUp.clone()
                });

            }, 500); // 🌟 GIỮ NGUYÊN TIMEOUT GỐC CỦA SẾP
        }

        // ===============================================
        // 🔥 CHIÊU R (ATTACK5): Quả cầu lớn + Lazer tay trái
        // ===============================================
        else if (animCanMua === 'ATTACK5') {
            let tayPhai = timBoPhan(nvc, ['Object_20', 'RHand_Palm_056', 'RHand']);
            let diemBanPhai = viTriGocToTam.clone();
            if (tayPhai) tayPhai.getWorldPosition(diemBanPhai);

            const cauDoR = taoVatTheICJ('DO', 4.0);
            cauDoR.position.copy(diemBanPhai).add(huongMat.clone().multiplyScalar(1.5));
            cauDoR.up.copy(upVector); // Vá Map Cầu
            cauDoR.lookAt(mucTieu); scene.add(cauDoR);

            kyNangIchiji.push({
                mesh: cauDoR, type: 'BAY_THANG_PHINH_TO', speed: 10.0, life: 100,
                currentScale: 4.0, maxScale: 14.0, growthRate: 0.4,
                targetPos: mucTieu.clone(), damage: dameGoc * 0.5, noBanKinh: 25,
                isSpinning: true, spinSpeed: 0.2, isRemote: isRemote, upVector: upVector.clone()
            });

            setTimeout(() => {
                let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);

                let tayTrai = timBoPhan(curNvc, ['Object_16', 'LHand_Palm_051', 'LHand']);
                let diemBanTrai = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                if (tayTrai) tayTrai.getWorldPosition(diemBanTrai);

                const lazerTrai = taoTiaLazerDo(diemBanTrai, mucTieu, 1.0);
                lazerTrai.up.copy(curUp); // Vá Map Cầu
                lazerTrai.lookAt(mucTieu);
                scene.add(lazerTrai);

                // Gây sát thương phụ
                taoVuNoLUA_ICJ(mucTieu, isRemote, 0, 15, curUp);
                kyNangIchiji.push({ mesh: lazerTrai, type: 'TIA_CHOP', life: 15 });
            }, 200); // 🌟 GIỮ NGUYÊN TIMEOUT GỐC
        }

        // ===============================================
        // 🔥 CHIÊU F (ATTACK6): Quả lửa khổng lồ xoay tròn
        // ===============================================
        else if (animCanMua === 'ATTACK6') {
            setTimeout(() => {
                let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                let chanTrai = timBoPhan(curNvc, ['LFoot_Toe_00', 'LFoot_Toe', 'LFoot']);
                let diemBanChan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                if (chanTrai) chanTrai.getWorldPosition(diemBanChan);

                const luaChan = taoVatTheICJ('fire3', 7.0);
                luaChan.position.copy(diemBanChan).add(curDir.clone().multiplyScalar(2));
                luaChan.up.copy(curUp); // Vá Map Cầu
                luaChan.lookAt(mucTieu); scene.add(luaChan);

                kyNangIchiji.push({
                    mesh: luaChan, type: 'BAY_THANG_PHINH_TO', speed: 10.0, life: 120,
                    currentScale: 7.0, maxScale: 20.0, growthRate: 0.5,
                    targetPos: mucTieu.clone(), damage: dameGoc * 1.0, noBanKinh: 35,
                    isSpinning: true, spinSpeed: 0.4, isRemote: isRemote, upVector: curUp.clone()
                });

            }, 500); // 🌟 GIỮ NGUYÊN TIMEOUT GỐC
        }
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU ICHIJI (BẢN GỐC CỦA SẾP)
    // ==========================================
    window.updateCombatIchiji = function () {

        for (let i = kyNangIchiji.length - 1; i >= 0; i--) {
            let s = kyNangIchiji[i];

            if (s.mesh.userData && s.mesh.userData.mixer) {
                s.mesh.userData.mixer.update(0.03);
            }

            if (s.type === 'TIA_CHOP') {
                s.life--;
                s.mesh.traverse(c => { if (c.material) c.material.opacity *= 0.8; });
            }

            // 🌟 GIỮ NGUYÊN VẬT LÝ BAY CỦA SẾP (Có isRemote ĐỂ FIX SÁT THƯƠNG)
            else if (s.type === 'BAY_THANG_PHINH_TO') {
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

                // 🌟 BẢN VÁ AUTO-CENTER: Đảm bảo kích nổ tâm sát thương khi va chạm
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    let diemNo = (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) ? s.targetPos.clone() : s.mesh.position.clone();

                    // Hàm tạo vụ nổ đã gộp cả lệnh gây sát thương bên trong
                    taoVuNoLUA_ICJ(diemNo, s.isRemote, s.damage, s.noBanKinh, s.upVector);

                    if (typeof window.kichHoatDongDat === 'function' && s.maxScale > 10) window.kichHoatDongDat(15, 500);
                    s.life = 0;
                }
            }

            // 🔥 Đặc sản Chiêu Q
            else if (s.type === 'BAY_SAU_KHI_TU') {
                if (s.delay > 0) {
                    s.delay--;
                    if (s.objNeo) {
                        let viTriTay = new THREE.Vector3();
                        s.objNeo.getWorldPosition(viTriTay);
                        s.mesh.position.copy(viTriTay);
                    }
                    if (s.isSpinning) s.mesh.rotateZ(s.spinSpeed || 0.2);
                } else {
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

                    // 🌟 BẢN VÁ AUTO-CENTER
                    if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                        let diemNo = (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) ? s.targetPos.clone() : s.mesh.position.clone();
                        taoVuNoLUA_ICJ(diemNo, s.isRemote, s.damage, s.noBanKinh, s.upVector);
                        s.life = 0;
                    }
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else { if (s.mesh.parent) s.mesh.parent.remove(s.mesh); if (typeof scene !== 'undefined') scene.remove(s.mesh); }
                kyNangIchiji.splice(i, 1);
            }
        }

        // 🌟 BẢN VÁ LỖI TRỌNG LỰC BỤI LỬA ĐỎ (Bay Rơi Chuẩn Map Cầu)
        for (let i = hieuUngIchiji.length - 1; i >= 0; i--) {
            let h = hieuUngIchiji[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;

            // Ép lửa rơi lả tả xuôi theo tâm Trái Đất
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
                hieuUngIchiji.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayICJ.length - 1; i >= 0; i--) {
            let it = danhSachSoBayICJ[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';

            if (it.life <= 0) {
                it.el.remove(); danhSachSoBayICJ.splice(i, 1); window.tongSoChuNoi_ICJ--;
            }
        }
    };

    if (window.idVongLapCombatICJ) clearInterval(window.idVongLapCombatICJ);
    window.idVongLapCombatICJ = setInterval(window.updateCombatIchiji, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('spyro')) {
        window.HePhaiHienTai = {
            tenPhai: "spyro",
            khoiTao: function () {
                console.log("🔥 spyro (Mở Khóa SPAM 100% - Trục Cầu Chuẩn - Sát thương to)!");

                // 🌟 BẢN VÁ: PRELOAD RAM TẢI TRƯỚC VŨ KHÍ 
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/DO.glb', () => { });
                    window.taiHoacNhanBanAsset('uploads/anims/fire3.glb', () => { });
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
            tungChieu: window.tungComboIchiji,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
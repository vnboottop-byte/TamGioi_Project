// ==========================================
// 🏴‍☠️ MÔN PHÁI ĐOẠT XÁ: NIGHTMARE LUFFY (LUFFY ÁC MỘNG)
// 👑 CÔNG NGHỆ: MỞ KHÓA SPAM + TỌA ĐỘ ĐỘNG TRONG SETTIMEOUT + TRỤC CẦU 3D
// ==========================================

(function () {
    const kyNangNL = [];
    const hieuUngNL = [];
    const danhSachSoBayNL = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_NL = 0;

    // 🌟 1. HIỂN THỊ DAME TRÊN MÀN HÌNH (MÀU XANH DƯƠNG ÁC MỘNG)
    function taoSoSatThuongNL(pos3D, satThuong, mauSac = '#3498db') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_NL > 5) return;
        window.tongSoChuNoi_NL++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #0b3c5d';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayNL.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatNL = function (viTriGoc) {
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

    function gaySatThuongNL(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongNL(posHienSo, luongSatThuong);
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
                            taoSoSatThuongNL(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff0000');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongNL(hit.tamNguc.clone(), luongSatThuong);
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

    // 🌟 BẢN VÁ LỖI TRỤC CẦU 3D CHO HIỆU ỨNG NỔ
    function hieuUngNoNL(pos, banKinh = 12, upVector = new THREE.Vector3(0, 1, 0)) {
        const soLuong = 30; const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];

        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y; posArr[i * 3 + 2] = pos.z;
            let vLocal = new THREE.Vector3((Math.random() - 0.5) * 14, Math.random() * 8, (Math.random() - 0.5) * 14);
            vLocal.applyQuaternion(qNolo);
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureHakiNL) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.4, 'rgba(52, 152, 219, 0.8)'); // Tia lửa xanh lam ác mộng
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureHakiNL = new THREE.CanvasTexture(canvas);
        }
        const mat = new THREE.PointsMaterial({
            color: 0x3498db, size: 8.0, map: window.textureHakiNL,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngNL.push({ system: pts, velocities: vels, life: 25, upVector: upVector.clone() });
    }

    // 🌟 2. ĐÚC MODEL BỌC THÉP TỐI ƯU VRAM
    function taoVatTheNL(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        if (Array.isArray(c.material)) c.material.forEach(m => m.transparent = true);
                        else c.material.transparent = true;
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

    // ==========================================
    // ⚔️ HÀM TUNG COMBO NIGHTMARE LUFFY (BẢN VÁ LỜI NGUYỀN SINH ĐÔI)
    // ==========================================
    window.tungComboNightmareLuffy = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;

        // 🌟 BẢN VÁ 1: CẤP THỂ XÁC CHO BOSS (Tránh nhận vơ cơ thể Sếp)
        if (isRemote && casterId) {
            if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            } else if (typeof window.danhSachQuaiVat !== 'undefined') {
                let boss = window.danhSachQuaiVat.find(q => q.id == casterId || q.id === casterId);
                if (boss && boss.mesh) nvc = boss.mesh;
            }
        }
        if (!nvc) return;

        let animCanMua = phim;
        if (phim === 'Q' || phim === 'ATTACK1') animCanMua = 'ATTACK1';
        if (phim === 'E' || phim === 'ATTACK2') animCanMua = 'ATTACK2';
        if (phim === 'R' || phim === 'ATTACK3') animCanMua = 'ATTACK3';
        if (phim === 'F' || phim === 'ATTACK4') animCanMua = 'ATTACK4';

        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
            if (window.henGioTatMuaNL) clearTimeout(window.henGioTatMuaNL);
            window.henGioTatMuaNL = setTimeout(() => { window.dangMuaChieu = false; }, 600);
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
            if (remoteDich) mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
        } else {
            let targetRadar = window.layMucTieuGanNhatNL(viTriGocToTam);
            // 🌟 BẢN VÁ 2: KIỂM TRA HITBOX AN TOÀN CHỐNG CRASH TỨC THÌ
            if (targetRadar && targetRadar.mesh) {
                let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(targetRadar.mesh) : null;
                mucTieu = (hitBox && hitBox.tamNguc) ? hitBox.tamNguc.clone() : targetRadar.mesh.position.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'NightmareLuffy',
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

        if (animCanMua === 'ATTACK1') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                if (isNaN(curDir.x) || curDir.lengthSq() < 0.001) curDir.copy(huongMat);

                let curPos = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                let targetBay = mucTieu ? mucTieu.clone() : curPos.clone().add(curDir.clone().multiplyScalar(150));

                if (!isRemote) {
                    let objMoi = window.layMucTieuGanNhatNL(curPos);
                    if (objMoi && objMoi.mesh) {
                        let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(objMoi.mesh) : null;
                        targetBay = (hitBox && hitBox.tamNguc) ? hitBox.tamNguc.clone() : objMoi.mesh.position.clone();
                    }
                }

                const tayTo = taoVatTheNL('taynightmare', 16.0);
                tayTo.position.copy(curPos).add(curDir.clone().multiplyScalar(3));
                tayTo.up.copy(curUp); tayTo.lookAt(targetBay); scene.add(tayTo);

                kyNangNL.push({
                    mesh: tayTo, type: 'BAY_THANG', speed: 10.0, life: 80,
                    targetPos: targetBay, damage: dameGoc * 0.4, noBanKinh: 20, isRemote: isRemote, upVector: curUp.clone()
                });
            }, 200);
        }
        else if (animCanMua === 'ATTACK2') {
            const soLuong = 8;
            let qHanhTinh = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);
            for (let i = 0; i < soLuong; i++) {
                const phi = Math.acos(-1 + (2 * i) / soLuong); const theta = Math.sqrt(soLuong * Math.PI) * phi;
                let localDir = new THREE.Vector3(Math.cos(theta) * Math.sin(phi), Math.abs(Math.cos(phi)) + 0.1, Math.sin(theta) * Math.sin(phi)).normalize();
                let huongRaNgoai = localDir.applyQuaternion(qHanhTinh).normalize();
                const posNgoai = mucTieu.clone().add(huongRaNgoai.multiplyScalar(35));
                posNgoai.add(upVector.clone().multiplyScalar(12));

                const tayR = taoVatTheNL('taynightmare', 4.5);
                tayR.position.copy(posNgoai); tayR.up.copy(upVector); tayR.lookAt(mucTieu); scene.add(tayR);

                kyNangNL.push({
                    mesh: tayR, type: 'BAY_THANG_GOM', speed: 4.5, life: 150, delay: i * 5,
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.075, noBanKinh: 12, isRemote: isRemote, upVector: upVector.clone()
                });
            }
        }
        else if (animCanMua === 'ATTACK3') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                if (isNaN(curDir.x) || curDir.lengthSq() < 0.001) curDir.copy(huongMat);

                let curRight = new THREE.Vector3().crossVectors(curDir, curUp).normalize().negate();
                let curPos = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));

                const khoangCachNgang = [-16, 0, 16];
                for (let i = 0; i < 3; i++) {
                    const kq = taoVatTheNL('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 45);
                    let posXuatPhat = curPos.clone().add(curRight.clone().multiplyScalar(khoangCachNgang[i]));
                    kq.position.copy(posXuatPhat).add(curDir.clone().multiplyScalar(2));

                    let targetBay = mucTieu ? mucTieu.clone() : curPos.clone().add(curDir.clone().multiplyScalar(150));
                    if (!isRemote) {
                        let objMoi = window.layMucTieuGanNhatNL(curPos);
                        if (objMoi && objMoi.mesh) {
                            let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(objMoi.mesh) : null;
                            targetBay = (hitBox && hitBox.tamNguc) ? hitBox.tamNguc.clone() : objMoi.mesh.position.clone();
                        }
                    }
                    let diemDichSongSong = targetBay.clone().add(curRight.clone().multiplyScalar(khoangCachNgang[i]));

                    kq.up.copy(curUp); kq.lookAt(diemDichSongSong); kq.rotateZ(Math.PI / 2); scene.add(kq);

                    kyNangNL.push({
                        mesh: kq, type: 'BAY_THANG', speed: 9.0, life: 100,
                        targetPos: diemDichSongSong, damage: dameGoc * 0.166, noBanKinh: 18, isRemote: isRemote, upVector: curUp.clone()
                    });
                }
            }, 300);
        }
        else if (animCanMua === 'ATTACK4') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                if (isNaN(curDir.x) || curDir.lengthSq() < 0.001) curDir.copy(huongMat);

                let curPos = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                let targetBay = mucTieu ? mucTieu.clone() : curPos.clone().add(curDir.clone().multiplyScalar(150));
                if (!isRemote) {
                    let objMoi = window.layMucTieuGanNhatNL(curPos);
                    if (objMoi && objMoi.mesh) {
                        let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(objMoi.mesh) : null;
                        targetBay = (hitBox && hitBox.tamNguc) ? hitBox.tamNguc.clone() : objMoi.mesh.position.clone();
                    }
                }

                const gocXoay = [0, Math.PI / 3, -Math.PI / 3];
                for (let i = 0; i < 3; i++) {
                    const kq = taoVatTheNL('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 50);
                    kq.position.copy(curPos).add(curDir.clone().multiplyScalar(2));
                    kq.up.copy(curUp); kq.lookAt(targetBay); kq.rotateZ(gocXoay[i]); scene.add(kq);

                    kyNangNL.push({
                        mesh: kq, type: 'BAY_THANG', speed: 8.0, life: 100,
                        targetPos: targetBay, damage: dameGoc * 0.333, noBanKinh: 22, isRemote: isRemote, upVector: curUp.clone()
                    });
                }
            }, 300);
        }
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ NIGHTMARE LUFFY (BẢN VÁ LỖI)
    // ==========================================
    window.updateCombatNL = function () {
        for (let i = kyNangNL.length - 1; i >= 0; i--) {
            let s = kyNangNL[i];
            if (s.delay > 0) { s.delay--; continue; }
            s.life--;

            if (s.type === 'BAY_THANG' || s.type === 'BAY_THANG_GOM') {
                if (s.targetPos) {

                    // 🌟 BẢN VÁ 3: AIMBOT AN TOÀN CHỐNG CRASH 
                    if (!s.isRemote) {
                        let objMoi = window.layMucTieuGanNhatNL(s.mesh.position);
                        if (objMoi && objMoi.mesh) {
                            let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(objMoi.mesh) : null;
                            s.targetPos = (hitBox && hitBox.tamNguc) ? hitBox.tamNguc.clone() : objMoi.mesh.position.clone();
                        }
                    }

                    let khoangCach = s.mesh.position.distanceTo(s.targetPos);

                    if (khoangCach < s.speed + 4 || s.life <= 0) {
                        let diemNo = (khoangCach < s.speed + 4) ? s.targetPos.clone() : s.mesh.position.clone();

                        if (s.isRemote === false) {
                            if (typeof gaySatThuongNL === 'function') gaySatThuongNL(diemNo, s.damage, s.noBanKinh);
                        } else {
                            if (typeof window.gaySatThuongBossToPlayer === 'function') {
                                window.gaySatThuongBossToPlayer(diemNo, s.damage, s.noBanKinh);
                            }
                        }

                        if (typeof hieuUngNoNL === 'function') hieuUngNoNL(diemNo, s.noBanKinh, s.upVector);
                        s.life = 0;
                    }
                    else {
                        if (s.type === 'BAY_THANG_GOM') {
                            const dummy = new THREE.Object3D();
                            dummy.position.copy(s.mesh.position);
                            dummy.up.copy(s.upVector || new THREE.Vector3(0, 1, 0));
                            dummy.lookAt(s.targetPos);
                            s.mesh.quaternion.slerp(dummy.quaternion, 0.2);
                        }

                        let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                        if (!isNaN(huongBay.x)) {
                            s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                        }
                    }
                } else {
                    s.mesh.translateZ(s.speed);
                    if (s.life <= 0) {
                        if (s.isRemote === false) {
                            if (typeof gaySatThuongNL === 'function') gaySatThuongNL(s.mesh.position, s.damage, s.noBanKinh);
                        } else {
                            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.mesh.position, s.damage, s.noBanKinh);
                        }
                        if (typeof hieuUngNoNL === 'function') hieuUngNoNL(s.mesh.position, s.noBanKinh, s.upVector);
                        s.life = 0;
                    }
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') {
                    window.donRac3D(s.mesh);
                } else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangNL.splice(i, 1);
            }
        }

        for (let i = hieuUngNL.length - 1; i >= 0; i--) {
            let h = hieuUngNL[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(-0.3) : new THREE.Vector3(0, -0.3, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].x *= 0.92; h.velocities[j].z *= 0.92;
                h.velocities[j].add(fallVec);
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 25;

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngNL.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayNL.length - 1; i >= 0; i--) {
            let it = danhSachSoBayNL[i]; it.offsetY += 0.05; it.life--;
            if (typeof camera !== 'undefined' && it.pos) {
                const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
                if (p.z < 1) {
                    it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
                } else it.el.style.display = 'none';
            }
            if (it.life <= 0) {
                if (it.el && it.el.parentNode) it.el.parentNode.removeChild(it.el);
                danhSachSoBayNL.splice(i, 1); window.tongSoChuNoi_NL--;
            }
        }
    };

    if (window.idVongLapCombatNL) clearInterval(window.idVongLapCombatNL);
    window.idVongLapCombatNL = setInterval(window.updateCombatNL, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI CÓ KHÓA CỔNG CHỐNG ĐOẠT XÁ MULTIPLAYER
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('nightmareluffy')) {
        window.HePhaiHienTai = {
            tenPhai: "Luffy Ác Mộng",
            khoiTao: function () {
                console.log("🏴‍☠️ Sức mạnh ác mộng trỗi dậy! Nightmare Luffy V2 (Mở Khóa SPAM + Fix Trọng Lực)!");

                // 🌟 BẢN VÁ: PRELOAD RAM
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/taynightmare.glb', () => { });
                    for (let i = 1; i <= 6; i++) {
                        window.taiHoacNhanBanAsset('uploads/anims/KIEMQUANG' + i + '.glb', () => { });
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
            tungChieu: window.tungComboNightmareLuffy,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
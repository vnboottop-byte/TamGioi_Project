// ==========================================
// 🔫 HỆ THỐNG KỸ NĂNG: XẠ THỦ (BẢN REWORK TOÀN DIỆN - USOPP STYLE)
// 👑 CÔNG NGHỆ: PARABOLIC TRAJECTORY + BIẾN VŨ KHÍ THÀNH ĐẠN ĐẠO
// ==========================================

(function () {
    const kyNangBanSung = [];
    const hieuUngBanSung = [];
    const danhSachSoBayBS = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_BS = 0;

    // 🌟 1. HIỂN THỊ SÁT THƯƠNG
    function taoSoSatThuongBS(pos3D, satThuong, mauSac = '#ff2222') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_BS > 5) return;
        window.tongSoChuNoi_BS++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayBS.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 2. RADAR QUÉT MỤC TIÊU 150M
    window.layMucTieuGanNhatBS = function (viTriGoc) {
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

    // 🌟 3. LÕI GÂY SÁT THƯƠNG
    function gaySatThuongBS(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongBS(posHienSo, luongSatThuong);
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
                            taoSoSatThuongBS(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ffaa00');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongBS(hit.tamNguc.clone(), luongSatThuong);
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

    // 🌟 4. HIỆU ỨNG VỤ NỔ
    window.thoiDiemNoCuoiCungBS = window.thoiDiemNoCuoiCungBS || 0;
    function taoVuNoBS(pos, banKinh = 15) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        else if (typeof window.playSound === 'function') window.playSound('no');

        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungBS < 300) return;
        window.thoiDiemNoCuoiCungBS = bayGio;

        const soLuong = 40; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + 1; posArr[i * 3 + 2] = pos.z;
            let speed = Math.random() * 2.0 + 0.5;
            let vec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiBS) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(255, 50, 0, 0.9)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiBS = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xff5500, size: window.isMobile ? 4.0 : 8.0, map: window.textureBuiBS,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngBanSung.push({ system: pts, velocities: vels, life: 25 });
    }

    // 🌟 5. ĐUÔI LỬA MINI (BỌC NHẸ VIÊN ĐẠN)
    function taoDuoiLuaMiniBS(pos, direction, speed) {
        if (window.isMobile && Math.random() > 0.5) return; 
        const soLuong = 3; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            let offset = new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5);
            posArr[i * 3] = pos.x + offset.x; posArr[i * 3 + 1] = pos.y + offset.y; posArr[i * 3 + 2] = pos.z + offset.z;
            let tocDoHat = (speed * 0.1) + Math.random() * 0.5;
            let vec = direction.clone().multiplyScalar(tocDoHat).add(offset.multiplyScalar(0.05));
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        const bangMau = [0xffaa00, 0xff5500, 0xffff00]; 
        const mauChon = bangMau[Math.floor(Math.random() * bangMau.length)];

        if (!window.textureBuiBS) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(255, 50, 0, 0.9)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiBS = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({ color: mauChon, size: 2.0 + Math.random() * 2.0, transparent: true, opacity: 0.7, map: window.textureBuiBS, blending: THREE.AdditiveBlending, depthWrite: false });
        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngBanSung.push({ system: pts, velocities: vels, life: 15, type: 'trail' });
    }

    // 🌟 6. ĐÚC MODEL VŨ KHÍ THÀNH ĐẠN ĐẠO
    function taoVatTheBanSung(urlCanTai, scaleSize) {
        const group = new THREE.Group();
        if (!urlCanTai || urlCanTai.trim() === '') return group;

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

    window.thoiDiemBanCuoi_BS = window.thoiDiemBanCuoi_BS || 0;

    // ==========================================
    // 🏹 TUNG CHIÊU XẠ THỦ (BỌC THÉP VÔ TRÙNG)
    // ==========================================
    window.tungComboBanSung = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;

        // 🌟 BẢN VÁ: Tìm đúng xương Boss, chống Ảo Tưởng tọa độ
        if (isRemote && casterId) {
            if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            } else if (typeof window.danhSachQuaiVat !== 'undefined') {
                let boss = window.danhSachQuaiVat.find(q => q.id == casterId || q.id === casterId);
                if (boss && boss.mesh) nvc = boss.mesh;
            }
        }
        if (!nvc && !isRemote) return;

        // 🌟 BẢN VÁ: THÔNG NÃO NGÔN NGỮ CHO BOSS AI CHỐNG "MÚA TAY KHÔNG"
        let loaiChieu = phim;
        if (typeof phim === 'string') {
            let pUp = phim.toUpperCase();
            if (pUp.includes('ATTACK4') || pUp === 'F') loaiChieu = 'F';
            else if (pUp.includes('ATTACK3') || pUp === 'R') loaiChieu = 'R';
            else if (pUp.includes('ATTACK2') || pUp === 'E') loaiChieu = 'E';
            else if (pUp.includes('ATTACK1') || pUp === 'Q') loaiChieu = 'Q';
            else if (pUp.includes('ATTACK') || pUp.includes('SKILL')) {
                let arr = ['Q', 'E', 'R', 'F'];
                loaiChieu = arr[Math.floor(Math.random() * arr.length)];
            }
        }

        let animCanMua = 'ATTACK1';
        if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
            animCanMua = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
        }

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - window.thoiDiemBanCuoi_BS < 600) return;
            window.thoiDiemBanCuoi_BS = bayGio;
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
            else if (typeof window.playAnim === 'function') window.playAnim(animCanMua);

            if (window.henGioTatMuaBS) clearTimeout(window.henGioTatMuaBS);
            window.henGioTatMuaBS = setTimeout(() => { window.dangMuaChieu = false; }, 1200);
        } else {
            if (nvc && nvc.userData && nvc.userData.mixer && nvc.userData.animationsMap && nvc.userData.animationsMap[animCanMua]) {
                nvc.userData.animationsMap[animCanMua].reset().fadeIn(0.2).play();
            }
        }

        let viTriGoc = new THREE.Vector3();
        let upVector = (nvc && nvc.up) ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3();
        let mucTieu = null;

        // 🌟 BẢN VÁ: CHỐNG NULL POINTER SẬP GAME DO MẠNG LAG
        if (isRemote) {
            if (remoteGoc) {
                viTriGoc.set(remoteGoc.x, remoteGoc.y, remoteGoc.z);
                if (viTriGoc.lengthSq() > 0.001) upVector.copy(viTriGoc).normalize();
            } else if (nvc) {
                if (nvc.position.lengthSq() > 0.001) upVector.copy(nvc.position).normalize();
                viTriGoc.copy(nvc.position).add(upVector.clone().multiplyScalar(3.5));
            }

            if (remoteHuong) huongMat.set(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            else if (nvc) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }

            if (remoteDich) mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            else mucTieu = viTriGoc.clone().add(huongMat.clone().multiplyScalar(150));
        } else {
            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                upVector = nvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
            } else if (nvc.up) {
                upVector = nvc.up.clone().normalize();
            }

            if (typeof camera !== 'undefined') {
                camera.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize();
                if (huongMat.lengthSq() < 0.001) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
            } else {
                nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize();
            }

            viTriGoc = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));

            let targetRadar = window.layMucTieuGanNhatBS(viTriGoc);
            if (targetRadar && targetRadar.mesh) {
                let hit = typeof window.layHitbox === 'function' ? window.layHitbox(targetRadar.mesh) : null;
                mucTieu = (hit && hit.tamNguc) ? hit.tamNguc.clone() : targetRadar.mesh.position.clone();
            } else {
                mucTieu = viTriGoc.clone().add(huongMat.clone().multiplyScalar(150));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'BanSung',
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: false });
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 120;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 120;
            }
        }

        let w1 = window.WEAPON_URL || 'uploads/anims/VIENDAN.glb';
        let w2 = window.WEAPON2_URL || 'uploads/anims/ROCKET.glb';
        if (window.LA_SKIN_ANIME || window.IS_SKIN_ANIME) { w1 = ""; w2 = ""; }

        function banDanParabol(urlDan, soLuong, kichCo, chieuCaoVongCung, tocDo, heSoDame, banKinhNo) {
            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    const vienDan = taoVatTheBanSung(urlDan, kichCo);
                    vienDan.position.copy(viTriGoc).add(huongMat.clone().multiplyScalar(1.5));

                    let doLech = soLuong > 1 ? 5 : 0;
                    let targetLecH = mucTieu.clone();
                    if (doLech > 0) {
                        let vecLech = new THREE.Vector3((Math.random() - 0.5) * doLech, 0, (Math.random() - 0.5) * doLech);
                        vecLech.projectOnPlane(upVector);
                        targetLecH.add(vecLech);
                    }

                    scene.add(vienDan);

                    let khoangCachToiDich = viTriGoc.distanceTo(targetLecH);
                    let thoiGianBay = khoangCachToiDich / tocDo;

                    kyNangBanSung.push({
                        mesh: vienDan, type: 'BAY_VONG_CUNG',
                        startPos: vienDan.position.clone(), targetPos: targetLecH,
                        progress: 0, speedProgress: 1.0 / (thoiGianBay || 1),
                        arcHeight: chieuCaoVongCung, upVector: upVector.clone(),
                        life: 200, damage: dameGoc * heSoDame, isRemote: isRemote, noBanKinh: banKinhNo
                    });
                }, i * 200);
            }
        }

        // 🎯 GIỮ NGUYÊN 100% THÔNG SỐ GỐC CỦA SẾP
        if (loaiChieu === 'Q') banDanParabol(w1, 1, 1.5, 5, 10.0, 0.4, 10);
        else if (loaiChieu === 'E') banDanParabol(w1, 3, 1.5, 8, 10.0, 0.2, 12);
        else if (loaiChieu === 'R') banDanParabol(w2, 1, 3.0, 25, 7.0, 0.5, 25);
        else if (loaiChieu === 'F') banDanParabol(w2, 5, 3.0, 20, 8.0, 0.2, 25);
    };

    window.updateCombatBanSung = function () {

        for (let i = kyNangBanSung.length - 1; i >= 0; i--) {
            let s = kyNangBanSung[i]; s.life--;

            if (s.type === 'BAY_VONG_CUNG') {
                s.progress += s.speedProgress;
                if (s.progress > 1) s.progress = 1;

                let curPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, s.progress);
                curPos.add(s.upVector.clone().multiplyScalar(Math.sin(s.progress * Math.PI) * s.arcHeight));

                let huongBay = new THREE.Vector3().subVectors(curPos, s.mesh.position).normalize();

                s.mesh.position.copy(curPos);

                // 🌟 BẢN VÁ TRỤC CẦU: Ép cứng Up Vector của vỏ đạn trước khi lookAt! Đạn hết bị "xéo xéo"
                s.mesh.up.copy(s.upVector);
                if (huongBay.lengthSq() > 0.001 && !isNaN(huongBay.x)) {
                    s.mesh.lookAt(curPos.clone().add(huongBay));
                }

                let dirNguoc = huongBay.clone().negate();
                if (!isNaN(dirNguoc.x)) taoDuoiLuaMiniBS(s.mesh.position, dirNguoc, 10.0);

                if (s.mesh.children.length > 0) s.mesh.children[0].rotateZ(0.3);

                if (s.progress >= 1 || s.life <= 0) {
                    if (s.isRemote === false) {
                        gaySatThuongBS(s.targetPos, s.damage, s.noBanKinh);
                    }
                    else {
                        // 🌟 BẢN VÁ: Đập nát khiên chặn đạn, Boss xả tên lửa là Sếp bay màu
                        if (typeof window.gaySatThuongBossToPlayer === 'function') {
                            window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                        }
                    }

                    taoVuNoBS(s.targetPos, s.noBanKinh);
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangBanSung.splice(i, 1);
            }
        }

        for (let i = hieuUngBanSung.length - 1; i >= 0; i--) {
            let h = hieuUngBanSung[i]; h.life--;

            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;

                h.velocities[j].multiplyScalar(0.9);
                if (h.type !== 'trail') h.velocities[j].y += 0.02;
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / (h.type === 'trail' ? 15 : 25);
            if (h.type === 'trail') h.system.material.size *= 0.95;

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngBanSung.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayBS.length - 1; i >= 0; i--) {
            let it = danhSachSoBayBS[i]; it.offsetY += 0.05; it.life--;
            // 🌟 CHỐNG CRASH DO CAMERA UNDEFINED
            if (typeof camera !== 'undefined' && it.pos) {
                const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
                if (p.z < 1) {
                    it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
                } else it.el.style.display = 'none';
            } else it.el.style.display = 'none';

            if (it.life <= 0) {
                if (it.el && it.el.parentNode) it.el.parentNode.removeChild(it.el);
                danhSachSoBayBS.splice(i, 1);
                window.tongSoChuNoi_BS--;
            }
        }
    };

    setInterval(window.updateCombatBanSung, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('bansung')) {
        window.HePhaiHienTai = {
            tenPhai: "Xạ Thủ",
            khoiTao: function () {
                console.log("🔫 Xạ Thủ: Khởi động hệ thống Đạn Đạo Rework (Parabol Style)!");

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];

                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO') || k.includes('SHOOT') || k.includes('FIRE') || k.includes('GUN')) {
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
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('SHOOT') || k.includes('FIRE') || k.includes('GUN') || k.includes('BAN')) window.KHO_ANIM_TANCONG.push(key);

                        if (k.includes('BAY') || k.includes('FLY')) { coBay = true; animBay = window.animationsMap[key]; window.animationsMap['BAY'] = animBay; }
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) { coChay = true; animChay = window.animationsMap[key]; window.animationsMap['CHAYBO'] = animChay; }
                    }
                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }

                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push(Object.keys(window.animationsMap)[0] || 'IDLE');
                    let defaultIdle = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                }

                if (window.vongLapNhanRoiBS) clearInterval(window.vongLapNhanRoiBS);
                window.vongLapNhanRoiBS = setInterval(() => {
                    if (!window.dangMuaChieu && !window.isMoving && !window.isKeyboardMoving && window.KHO_ANIM_NHANROI.length > 0) {
                        let randomIdle = window.KHO_ANIM_NHANROI[Math.floor(Math.random() * window.KHO_ANIM_NHANROI.length)];
                        if (window.animationsMap && window.animationsMap[randomIdle]) {
                            window.animationsMap['NHANROI'] = window.animationsMap[randomIdle];
                            if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[randomIdle];
                            if (typeof window.playAnim === 'function') window.playAnim(randomIdle);
                        }
                    }
                }, 12000);
                
                // 🌟 TAY KHÔNG BẮT GIẶC: Xóa sạch lệnh nạp Súng, chỉ cần cộng Chỉ Số!
            },
            tungChieu: window.tungComboBanSung,
            capNhat: function () { },
            vongLapVatLy: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();

// =========================================================================
// 🌟 BẢN VÁ: ÁNH XẠ CHỮA CÂM NÍN CHO BOSS XẠ THỦ
// =========================================================================
window.tungCombobansung = window.tungComboBanSung;
window.tungComboBanSung = window.tungComboBanSung;
window.tungComboxathu = window.tungComboBanSung;
window.tungComboXathu = window.tungComboBanSung;
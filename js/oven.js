// ==========================================
// ⚔️ MÔN PHÁI ĐOẠT XÁ: ĐẠI KIẾM KHÁCH (MASTER FILE - BẢN FINAL)
// 👑 CÔNG NGHỆ: LÁ CHẮN CHỐNG SPAM GÂY GIẬT + BẢO TỒN VRAM + THÔNG SỐ VÀNG CỦA SẾP
// ==========================================

(function () {
    const kyNangZoro = [];
    const hieuUngZoro = [];
    const danhSachSoBayZR = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];

    window.tongSoChuNoi_ZR = 0;
    function taoSoSatThuongZR(pos3D, satThuong, mauSac = '#2ecc71') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_ZR > 5) return;
        window.tongSoChuNoi_ZR++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #005511';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayZR.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatZR = function (viTriGoc) {
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

    function gaySatThuongZR(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongZR(posHienSo, luongSatThuong, '#2ecc71');
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
                            taoSoSatThuongZR(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongZR(hit.tamNguc.clone(), luongSatThuong);
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

    window.thoiDiemNoCuoiCungZR = window.thoiDiemNoCuoiCungZR || 0;

    function taoVuNoKiemQuangZR(pos, isRemote = false, luongDame = 100, banKinh = 12) {
        if (isRemote === false && luongDame > 0) gaySatThuongZR(pos, luongDame, banKinh);
        else if (typeof isRemote === 'number' && isRemote > 0) {
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, isRemote, banKinh);
        }

        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungZR < 200) return;
        window.thoiDiemNoCuoiCungZR = bayGio;

        const soLuong = window.isMobile ? 10 : 60;
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y; posArr[i * 3 + 2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 12));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureKiemKhieZR) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(46, 204, 113, 0.9)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureKiemKhieZR = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0x2ecc71, size: window.isMobile ? 4.0 : 7.0, map: window.textureKiemKhieZR,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngZoro.push({ system: pts, velocities: vels, life: 25 });
    }

    // ==========================================
    // 🌟 ĐÚC 6 LOẠI KIẾM QUANG: BẢO TỒN 100% VRAM
    // ==========================================
    function taoKiemQuangFile(scaleSize) {
        const group = new THREE.Group();

        let soNgauNhien = Math.floor(Math.random() * 6) + 1;
        let urlCanTai = 'uploads/anims/KIEMQUANG' + soNgauNhien + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {

                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        if (Array.isArray(c.material)) {
                            c.material.forEach(m => m.transparent = true);
                        } else {
                            c.material.transparent = true;
                        }
                    }
                });

                v.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(v);
                const size = new THREE.Vector3(); box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                let tiLeChuan = scaleSize / maxDim;

                // 🌟 THÔNG SỐ VÀNG CỦA SẾP (TUYỆT ĐỐI KHÔNG ĐỔI)
                v.scale.set(tiLeChuan, tiLeChuan, tiLeChuan);
                v.rotation.set(0, 0, 0);
                group.add(v);
            });
        }
        return group;
    }

    function bocAnimChemNgauNhien() {
        if (window.KHO_ANIM_TANCONG.length === 0) return 'ATTACK1';
        return window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
    }

    // ==========================================
    // 🏹 HÀM XẢ COMBO 
    // ==========================================
    window.thoiDiemChemCuoi_ZR = window.thoiDiemChemCuoi_ZR || 0;

    window.tungComboZoro = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        if (isRemote === false) {
            let bayGio = Date.now();

            // 🛡️ BẢN VÁ TỐI THƯỢNG: LÁ CHẮN CHỐNG SPAM GÂY GIẬT TUNG NGƯỜI
            // Khóa mõm Auto-Attack hoặc đè phím, ép phải cách nhau 800ms mới được bốc thăm chiêu mới!
            if (bayGio - window.thoiDiemChemCuoi_ZR < 800) return;
            window.thoiDiemChemCuoi_ZR = bayGio;

            window.dangMuaChieu = true;
            window.currentAnimName = ''; // An tâm xóa trí nhớ vì đã có khiên 800ms bảo vệ

            let randomAttackClip = bocAnimChemNgauNhien();
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(randomAttackClip);
        }

        let viTriGocToTam = new THREE.Vector3();
        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
        let mucTieu = null;

        if (isRemote) {
            viTriGocToTam = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            upVector = viTriGocToTam.clone().normalize();
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));
            let targetRadar = window.layMucTieuGanNhatZR(viTriGocToTam);

            if (targetRadar && targetRadar.mesh) {
                let hit = window.layHitbox(targetRadar.mesh);
                mucTieu = hit.tamNguc.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Zoro',
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        const dameGoc = window.DAME_CUA_TOI || 100;

        setTimeout(() => {
            let tayPhaiPos = viTriGocToTam.clone();
            let tayTraiPos = viTriGocToTam.clone();
            let xuongTayPhai = null; let xuongTayTrai = null;

            nvc.traverse(c => {
                if (c.isBone) {
                    if (c.name === 'weapon_03_joint_050') xuongTayPhai = c;
                    if (c.name === 'weapon_02_joint_040') xuongTayTrai = c;
                }
            });

            if (xuongTayPhai) xuongTayPhai.getWorldPosition(tayPhaiPos);
            else tayPhaiPos.add(new THREE.Vector3().crossVectors(huongMat, upVector).normalize().multiplyScalar(-1.5));

            if (xuongTayTrai) xuongTayTrai.getWorldPosition(tayTraiPos);
            else tayTraiPos.add(new THREE.Vector3().crossVectors(huongMat, upVector).normalize().multiplyScalar(1.5));

            function phongKiemQuang(soNhatChem, heSoDame, kichCo, kieuChem) {
                for (let i = 0; i < soNhatChem; i++) {
                    setTimeout(() => {
                        let nòngGoc = (i % 2 === 0) ? tayPhaiPos : tayTraiPos;

                        const kq = taoKiemQuangFile(kichCo);
                        kq.position.copy(nòngGoc);

                        kq.position.add(huongMat.clone().multiplyScalar(2.5));
                        kq.up.copy(upVector);

                        let doLan = (soNhatChem > 1) ? 3.0 : 0;
                        let targetBay = mucTieu.clone().add(new THREE.Vector3((Math.random() - 0.5) * doLan, (Math.random() - 0.5) * doLan, 0));

                        kq.lookAt(targetBay);

                        // 🌟 BẺ GÓC CHÉM ĐẸP MẮT
                        if (kieuChem === 'E') {
                            let gocXoay = (i % 2 === 0) ? (Math.PI / 4) : (-Math.PI / 4);
                            kq.rotateZ(gocXoay);
                        }
                        else if (kieuChem === 'R') {
                            let gocXoay = (i === 0) ? (Math.PI / 2) : ((i % 2 === 0) ? (Math.PI / 3) : (-Math.PI / 3));
                            kq.rotateZ(gocXoay);
                        }
                        else if (kieuChem === 'F') {
                            let gocXoay = (i * Math.PI) / 3;
                            kq.rotateZ(gocXoay);
                        }

                        scene.add(kq);

                        kyNangZoro.push({
                            mesh: kq, type: 'BAY_THANG', speed: 12.0, life: 80,
                            targetPos: targetBay, damage: dameGoc * heSoDame, isRemote: isRemote
                        });
                    }, i * 150);
                }
            }

            // 🌟 THÔNG SỐ VÀNG CỦA SẾP (ĐÃ CÂN BẰNG CHUẨN 7.8 DPS)
            // Q = 1 Chém (1 hit x 0.4 = 0.4 Dame)
            if (phim === 'Q') phongKiemQuang(1, 0.4, 35, 'Q');

            // E = 2 Chém (2 hit x 0.3 = 0.6 Dame)
            else if (phim === 'E') phongKiemQuang(2, 0.3, 40, 'E');

            // R = 4 Chém (4 hit x 0.125 = 0.5 Dame)
            else if (phim === 'R') phongKiemQuang(4, 0.125, 50, 'R');

            // F = 8 Chém Tuyệt Kỹ (8 hit x 0.125 = 1.0 Dame)
            else if (phim === 'F') phongKiemQuang(8, 0.125, 70, 'F');

        }, 300);
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU ZORO (ĐÃ FIX TRÀN RAM)
    // ==========================================
    window.updateCombatZoro = function () {

        // 1. VÒNG LẶP KIẾM QUANG BAY
        for (let i = kyNangZoro.length - 1; i >= 0; i--) {
            let s = kyNangZoro[i]; s.life--;

            if (s.type === 'BAY_THANG') {
                s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    taoVuNoKiemQuangZR(s.targetPos, s.isRemote, s.damage, 6);
                    s.life = 0;
                }
            }

            // 🛑 VÁ DỌN RÁC MODEL KIẾM QUANG
            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangZoro.splice(i, 1);
            }
        }

        // 2. VÒNG LẶP HẠT VỤ NỔ XANH LÁ
        for (let i = hieuUngZoro.length - 1; i >= 0; i--) {
            let h = hieuUngZoro[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].x *= 0.92; h.velocities[j].z *= 0.92;
                h.velocities[j].y -= 0.4; // Trọng lực hút hạt rơi xuống
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 25;

            // 🛑 VÁ DỌN RÁC HẠT (CHỐNG TRÀN VRAM TẬN GỐC)
            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngZoro.splice(i, 1);
            }
        }

        // 3. VÒNG LẶP SỐ DAME TRÊN MÀN HÌNH (Đã chuẩn)
        for (let i = danhSachSoBayZR.length - 1; i >= 0; i--) {
            let it = danhSachSoBayZR[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }

            if (it.life <= 0) {
                it.el.remove();
                danhSachSoBayZR.splice(i, 1);
                window.tongSoChuNoi_ZR--;
            }
        }
    };

    setInterval(window.updateCombatZoro, 30);

    // ==========================================
    // 🌟 AUTO NHẬN DIỆN MỌI TÊN FILE (.JS) ĐƯỢC NẠP VÀO GAME
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.trim() !== '') {

        window.HePhaiHienTai = {
            tenPhai: "Đại Kiếm Khách",
            khoiTao: function () {
                console.log("⚔️ Kiếm Phái Thức Tỉnh! Đã kích hoạt Smart Fallback & Khóa Chân!");

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];

                    // 🌟 BIẾN CẢM BIẾN NHẬN DIỆN HOẠT ẢNH ĐỘC LẬP
                    let coBay = false;
                    let coChay = false;
                    let animBay = null;
                    let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];

                        // 🛑 LÁ CHẮN KHÓA CHÂN (XÓA ROOT MOTION) - BẢN VÁ CHỐNG LỖI UNDEFINED
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO')) {
                            // Phải kiểm tra xem clip và tracks có tồn tại không mới được lọc (Chống sập game)
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position') && (tenTrack.includes('armature') || tenTrack.includes('hips') || tenTrack.includes('pelvis') || tenTrack.includes('root'))) {
                                        return false;
                                    }
                                    return true;
                                });
                            }
                        }

                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('PUNCH') || k.includes('KICK') || k.includes('COMBO') || k.includes('CHET')) {
                            if (!k.includes('CHET')) window.KHO_ANIM_TANCONG.push(key);
                        }

                        // 🌟 TÁCH BIỆT QUÉT ĐỘNG TÁC BAY VÀ CHẠY
                        if (k.includes('BAY') || k.includes('FLY')) {
                            coBay = true;
                            animBay = window.animationsMap[key];
                            window.animationsMap['BAY'] = animBay;
                        }
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) {
                            coChay = true;
                            animChay = window.animationsMap[key];
                            window.animationsMap['CHAYBO'] = animChay;
                        }
                    }

                    // 🌟 BÙ TRỪ THÔNG MINH (CHỐNG GHI ĐÈ XÓA MẤT ANIMATION BAY)
                    if (coChay && !coBay) {
                        window.animationsMap['BAY'] = animChay;
                        window.animationsMap['FLY'] = animChay;
                    }
                    if (coBay && !coChay) {
                        window.animationsMap['CHAYBO'] = animBay;
                        window.animationsMap['RUN'] = animBay;
                    }

                    // Set Nhàn rỗi mặc định
                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push('NHANROI');
                    let defaultIdle = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                }

                // Vòng lặp đổi dáng đứng Nhàn rỗi
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
            tungChieu: window.tungComboZoro,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
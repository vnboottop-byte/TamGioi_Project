// ==========================================
// ⚔️ MÔN PHÁI ĐOẠT XÁ: ĐẠI KIẾM KHÁCH ZORO (TAM KIẾM PHÁI V1)
// 👑 CÔNG NGHỆ: MÁY QUÉT XƯƠNG BLENDER CHUẨN X-QUANG + COMBO XẢ LIÊN TỤC LUFFY STYLE
// ==========================================

(function () {
    const kyNangZoro = [];
    const hieuUngZoro = [];
    const danhSachSoBayZR = [];

    // ⏳ BỘ KHÓA COOLDOWN SIÊU TỐC HỆ PHÁI LUFFY (ĐỒNG BỘ 4 GIÂY CHO CẢ 4 CHIÊU)
    const THOI_GIAN_HOI = { 'Q': 4000, 'E': 4000, 'R': 4000, 'F': 4000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    // Kho lưu trữ hoạt ảnh quét tự động
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

    // 📡 RADAR KHÓA MỤC TIÊU TẦM NHIỆT KIZARU (150M)
    window.layMucTieuGanNhatZR = function(viTriGoc) {
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

    // 💥 HIỆU ỨNG VẾT CHÉM HAKI XANH LÁ
    function taoVuNoKiemKhieZR(pos, isRemote = false, luongDame = 100, banKinh = 12) {
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
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 12));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureKiemKhieZR) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   // Lõi trắng sắc bén
            gradient.addColorStop(0.3, 'rgba(46, 204, 113, 0.9)'); // Viền xanh lá lục bảo
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

    // 🌟 ĐÚC KIẾM QUANG ĐƯỜNG BAY TU TIÊN SYSTEM
    function taoKiemZoro(scaleSize, weaponUrl) {
        const group = new THREE.Group();
        let urlCanTai = weaponUrl || window.WEAPON_URL || 'uploads/anims/PHIKIEM.glb'; 
        
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        c.material = c.material.clone();
                        c.material.transparent = true;
                        c.material.emissive = new THREE.Color(0x2ecc71); // Tint Haki xanh lá
                        c.material.emissiveIntensity = 0.8; 
                    }
                });
                
                v.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(v);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                let tiLeChuan = scaleSize / maxDim; 
                v.scale.set(tiLeChuan, tiLeChuan, tiLeChuan);
                
                // Bẻ kiếm nằm ngang hướng dọc theo trục Z phóng đi chuẩn Tu Tiên
                v.rotation.x = Math.PI / 2; 
                v.rotation.y = 0;
                v.rotation.z = 0;

                group.add(v);
            });
        }
        return group;
    }

    // 🌟 BỐC THĂM HOẠT ẢNH CHÉM NGẪU NHIÊN KIỂU ASL
    function bocAnimChemNgauNhien() {
        if (window.KHO_ANIM_TANCONG.length === 0) return 'ATTACK1';
        return window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
    }

    // ==========================================
    // 🏹 HÀM XẢ COMBO SÂN CHƠI MẠNG LƯỚI
    // ==========================================
    window.tungComboZoro = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        // Bộ kiểm duyệt Cooldown máy chủ cục bộ
        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - window.cd_thoiDiemBopCo[phim] < THOI_GIAN_HOI[phim]) return;
            window.cd_thoiDiemBopCo[phim] = bayGio;

            window.dangMuaChieu = true;
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
            mucTieu = targetRadar ? targetRadar.clone() : viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));

            // Phát sóng Livekit đồng bộ
            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Zoro', 
                    origin: {x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z}, target: {x: mucTieu.x, y: mucTieu.y, z: mucTieu.z}, dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z}, weaponUrl: window.WEAPON_URL
                })), { reliable: true });
            }
        }

        const dameGoc = window.DAME_CUA_TOI || 100;
        let vuKhiThucTe = weaponUrl || window.WEAPON_URL;

        // ⏳ TRỄ 300MS THEO KIZARU ĐỂ KHỚP ĐỘ VUNG KIẾM CỦA KHUNG XƯƠNG
        setTimeout(() => {
            let tayPhaiPos = viTriGocToTam.clone();
            let tayTraiPos = viTriGocToTam.clone();
            let xuongTayPhai = null; let xuongTayTrai = null;

            // 🧠 TRUY VẾT HAI XƯƠNG BLENDER ĐÍCH DANH CỦA SẾP YÊU CẦU
            nvc.traverse(c => {
                if (c.isBone) {
                    if (c.name === 'Bone002_0184') xuongTayPhai = c;
                    if (c.name === 'Bone006_0188') xuongTayTrai = c;
                }
            });

            // Nếu tìm thấy xương Blender thì hốt tọa độ thế giới thật, không tìm thấy thì tính toán vector bù trừ Tu Tiên
            if (xuongTayPhai) xuongTayPhai.getWorldPosition(tayPhaiPos);
            else tayPhaiPos.add(new THREE.Vector3().crossVectors(huongMat, upVector).normalize().multiplyScalar(-1.5));

            if (xuongTayTrai) xuongTayTrai.getWorldPosition(tayTraiPos);
            else tayTraiPos.add(new THREE.Vector3().crossVectors(huongMat, upVector).normalize().multiplyScalar(1.5));

            // =====================================
            // ⚔️ CHIÊU Q: TAM THẬP LỤC PHIỀN NÃO PHONG (36 POUND PHOENIX)
            // =====================================
            if (phim === 'Q') {
                const kiemQ = taoKiemZoro(2.5, vuKhiThucTe);
                kiemQ.position.copy(tayPhaiPos);
                kiemQ.up.copy(upVector);
                kiemQ.lookAt(mucTieu);
                scene.add(kiemQ);

                // ⚖️ CÂN BẰNG: Chém nhanh 1 phát nhịp x 0.45 dame
                kyNangZoro.push({ mesh: kiemQ, type: 'BAY_THANG', speed: 11.0, life: 50, targetPos: mucTieu.clone(), damage: dameGoc * 0.45, isRemote: isRemote });
            }
            // =====================================
            // 🌪️ CHIÊU E: TATSUMAKI (VÒI RỒNG KIẾM KHÍ MULTI-HIT)
            // ==========================================
            else if (phim === 'E') {
                // Đập tan cấu trúc rác! Đúc 6 nhịp chém lướt bắn luân phiên từ 2 tay (Luffy Style)
                for (let i = 0; i < 6; i++) {
                    setTimeout(() => {
                        let nòngTay = (i % 2 === 0) ? tayPhaiPos : tayTraiPos;
                        const kiemE = taoKiemZoro(2.0, vuKhiThucTe);
                        kiemE.position.copy(nòngTay);
                        kiemE.up.copy(upVector);

                        // Tạo góc tản mác xoáy nhẹ quanh mục tiêu làm vòi rồng
                        let lechXoay = mucTieu.clone().add(new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 6));
                        kiemE.lookAt(lechXoay);
                        scene.add(kiemE);

                        // ⚖️ CÂN BẰNG: 6 nhịp x 0.1 dame = 0.6 tổng dame
                        kyNangZoro.push({ mesh: kiemE, type: 'BAY_THANG', speed: 9.0, life: 60, targetPos: lechXoay, damage: dameGoc * 0.1, isRemote: isRemote });
                    }, i * 80); // Giãn cách 80ms mỗi nhát chém siêu tốc
                }
            }
            // =====================================
            // ⚔️ CHIÊU R: THIÊN BÁT THẬP PHIỀN NÃO PHONG (1080 POUND PHOENIX)
            // =====================================
            else if (phim === 'R') {
                // Xả ra 4 luồng kiếm khí chéo nhau rượt mục tiêu
                for (let i = 0; i < 4; i++) {
                    setTimeout(() => {
                        const kiemR = taoKiemZoro(3.5, vuKhiThucTe);
                        // Xuất phát đồng loạt từ hai tâm xương Blender của Sếp
                        let nòngGoc = (i % 2 === 0) ? tayPhaiPos : tayTraiPos;
                        kiemR.position.copy(nòngGoc);
                        kiemR.up.copy(upVector);
                        kiemR.lookAt(mucTieu);
                        scene.add(kiemR);

                        // ⚖️ CÂN BẰNG: 4 nhịp nặng x 0.25 dame = 1.0 tổng dame
                        kyNangZoro.push({ mesh: kiemR, type: 'BAY_TÂM_NHIỆT', speed: 10.0, life: 80, targetPos: mucTieu.clone(), damage: dameGoc * 0.25, isRemote: isRemote, upVector: upVector.clone() });
                    }, i * 120);
                }
            }
            // =====================================
            // 👁️ CHIÊU F: TAM THIÊN THẾ GIỚI (SAN CHÂN SEKAI - TUYỆT KỸ)
            // =====================================
            else if (phim === 'F') {
                const pivotGroup = new THREE.Group();
                pivotGroup.position.copy(viTriGocToTam).add(upVector.clone().multiplyScalar(15));
                pivotGroup.up.copy(upVector);
                pivotGroup.lookAt(mucTieu);

                const kiemKhongLo = taoKiemZoro(12.0, vuKhiThucTe); // Đúc thanh đao quang khổng lồ 12m
                kiemKhongLo.rotateX(-Math.PI * 0.8);
                pivotGroup.add(kiemKhongLo);
                scene.add(pivotGroup);

                // ⚖️ CÂN BẰNG: Tuyệt kỹ kết liễu dứt điểm x 1.6 dame cực mạnh
                kyNangZoro.push({ mesh: pivotGroup, type: 'F_SLASH', ticks: 0, life: 100, targetPos: mucTieu.clone(), damage: dameGoc * 1.6, isRemote: isRemote });
            }

        }, 300);
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU CHỐNG LAG
    // ==========================================
    window.updateCombatZoro = function () {
        for (let i = kyNangZoro.length - 1; i >= 0; i--) {
            let s = kyNangZoro[i]; s.life--;

            // Xử lý đạn kiếm khí bay thẳng thường (Q và E)
            if (s.type === 'Q' || s.type === 'BAY_THANG') {
                s.mesh.translateZ(s.speed);
                // Cho kiếm xoay trục xoắn ma sát không khí nhìn cho ngầu
                s.mesh.rotateZ(0.2);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    taoVuNoKiemKhieZR(s.targetPos, s.isRemote, s.damage, 6);
                    s.life = 0;
                }
            }
            // Xử lý kiếm khí tầm nhiệt rượt đuổi mục tiêu (Chiêu R)
            else if (s.type === 'BAY_TÂM_NHIỆT') {
                s.mesh.translateZ(s.speed);
                s.mesh.rotateZ(0.4);

                if (s.targetPos) {
                    if (!s.isRemote) {
                        const mucTieuMoi = window.layMucTieuGanNhatZR(s.mesh.position);
                        if (mucTieuMoi) s.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(s.mesh.position);
                    dummy.up.copy(s.upVector);
                    dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.25); // Bẻ cua khét lẹt 25% rượt quái
                }

                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 6 || s.life <= 0) {
                    taoVuNoKiemKhieZR(s.targetPos, s.isRemote, s.damage, 10);
                    s.life = 0;
                }
            }
            // Xử lý múa đao khổng lồ sả từ trên trời xuống (Chiêu F)
            else if (s.type === 'F_SLASH') {
                s.ticks++;
                s.mesh.children[0].rotateX(0.08); // Quét kiếm quang gầm rú xuống mặt đất

                if (s.ticks > 35 || s.life <= 0) {
                    taoVuNoKiemKhieZR(s.targetPos, s.isRemote, s.damage, 25);
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangZoro.splice(i, 1);
            }
        }

        // Tốc độ bay bụi lửa hạt Haki xanh lá lả tả rơi
        for (let i = hieuUngZoro.length - 1; i >= 0; i--) {
            let h = hieuUngZoro[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].x *= 0.92; h.velocities[j].z *= 0.92;
                h.velocities[j].y -= 0.4; // Trọng lực hút hạt rơi rụng xuống đất
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 25;

            if (h.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(h.system); else scene.remove(h.system);
                hieuUngZoro.splice(i, 1);
            }
        }

        // Dọn chữ nổi
        for (let i = danhSachSoBayZR.length - 1; i >= 0; i--) {
            let it = danhSachSoBayZR[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayZR.splice(i, 1); window.tongSoChuNoi_ZR--; }
        }
    };

    setInterval(window.updateCombatZoro, 30);

    // ==========================================
    // 🌟 KHỞI TẠO ĐỒNG BỘ ENGINE ĐĂNG KÝ MÔN PHÁI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('zoro')) {
        window.HePhaiHienTai = {
            tenPhai: "Kiếm Khách Zoro",
            khoiTao: function () {
                console.log("⚔️ Tam Kiếm Phái Thức Tỉnh! Rút xương Blender thành công!");

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];

                    // Máy quét tự động trích xuất ruột rương Model bất kỳ giống ASL
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('PUNCH') || k.includes('KICK') || k.includes('COMBO')) window.KHO_ANIM_TANCONG.push(key);
                        
                        // Gom di chuyển ép thành bộ chạy bộ không chân siêu tốc
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) {
                            window.animationsMap['CHAYBO'] = window.animationsMap[key];
                            window.animationsMap['BAY'] = window.animationsMap[key];
                            window.animationsMap['FLY'] = window.animationsMap[key];
                        }
                    }

                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push('NHANROI');
                    let defaultIdle = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                }

                // Luồng đổi tư thế đứng ngầu lòi gác kiếm của ASL
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
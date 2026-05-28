// ==========================================
// 🐉 HỆ THỐNG KỸ NĂNG: GOKU (SIÊU SAIYAN)
// 👑 TÍNH NĂNG: KAMEHAMEHA LIÊN TỤC & CHUỖI TỤ KHÍ GENKI DAMA (QUẢ CẦU KÊNH KHI)
// ==========================================

(function () {
    const kyNangGoku = [];
    const hieuUngGoku = [];
    const danhSachSoBayGK = [];

    // 🌟 ĐỒNG BỘ THỜI GIAN HỒI CHIÊU (Chuẩn combo)
    const THOI_GIAN_HOI = { 'Q': 2000, 'E': 5000, 'R': 8000, 'F': 18000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    window.tongSoChuNoi_GK = 0;
    function taoSoSatThuongGK(pos3D, satThuong, mauSac = '#ffcc00') {
        if (window.isMobile && window.tongSoChuNoi_GK > 10) return;
        if (satThuong <= 0) return;
        window.tongSoChuNoi_GK++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 8px #000, 2px 2px 0px #aa0000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayGK.push({ el: div, pos: pos3D.clone(), life: 40, offsetY: 0 });
    }

    // 🎯 RADAR TÌM MỤC TIÊU
    window.layMucTieuGanNhatGK = function(viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 300) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 300; 
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
        
        let targetQuai = null; let minDQuai = 300;
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

    // 💥 XỬ LÝ SÁT THƯƠNG VÀ NẢY SỐ
    function gaySatThuongGK(tamNo, luongSatThuong, banKinh, mauSac = '#ffcc00') {
        let daTrung = false;
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        daTrung = true;
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongGK(posHienSo, luongSatThuong, mauSac);
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
                        daTrung = true;
                        if (quai.isBoss) {
                            taoSoSatThuongGK(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongGK(hit.tamNguc.clone(), luongSatThuong, mauSac);
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
        return daTrung;
    }

    // ==========================================
    // 🌟 TRẠM ĐÚC KỸ XẢO HÌNH ẢNH (VFX)
    // ==========================================

    // 1. Quả cầu năng lượng (Cho Q và F)
    function taoCauAnhSang(banKinh, colorHex) {
        const group = new THREE.Group();
        const geoLoi = new THREE.SphereGeometry(banKinh * 0.7, 16, 16);
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0 });
        const loi = new THREE.Mesh(geoLoi, matLoi);

        const geoVo = new THREE.SphereGeometry(banKinh, 16, 16);
        const matVo = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
        const vo = new THREE.Mesh(geoVo, matVo);

        group.add(loi); group.add(vo);
        return group;
    }

    // 2. Tia Lazer Kamehameha liên tục (Cho E và R)
    function taoTiaKamehameha(radius, colorHex) {
        const group = new THREE.Group();
        // Cột sáng mặc định dài 1 đơn vị, ta sẽ scale.z nó lên theo khoảng cách
        const geoLoi = new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, 1, 16);
        geoLoi.rotateX(Math.PI / 2); // Nằm ngang
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false });
        const loi = new THREE.Mesh(geoLoi, matLoi);
        
        const geoVo = new THREE.CylinderGeometry(radius, radius, 1, 16);
        geoVo.rotateX(Math.PI / 2);
        const matVo = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
        const vo = new THREE.Mesh(geoVo, matVo);
        
        group.add(loi); group.add(vo);
        return group;
    }

    window.thoiDiemNoCuoiCungGK = 0;
    function taoVuNoKame(pos, colorHex = 0xffcc00, banKinh = 10) {
        let bayGio = Date.now();
        if (bayGio - window.thoiDiemNoCuoiCungGK < 100) return; 
        window.thoiDiemNoCuoiCungGK = bayGio;
        if (typeof window.phatAmThanh === 'function') window.phatAmThanh('uploads/anims/hit.mp3', 0.5);

        const soLuong = window.isMobile ? 10 : 30; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 15, (Math.random() - 0.5) * 15));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        const mat = new THREE.PointsMaterial({
            color: colorHex, size: 8.0, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngGoku.push({ system: pts, velocities: vels, life: 20 }); 
    }

    // ==========================================
    // ✨ TUNG CHIÊU GOKU
    // ==========================================
    window.tungComboGoku = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc && !isRemote) return;

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;

            let nutKyNang = document.getElementById('btn' + phim.toUpperCase()) || document.getElementById('skill' + phim.toUpperCase());
            if (nutKyNang) {
                nutKyNang.style.pointerEvents = 'none'; nutKyNang.style.filter = 'brightness(0.4) grayscale(100%)';
                setTimeout(() => { nutKyNang.style.filter = ''; nutKyNang.style.pointerEvents = ''; }, THOI_GIAN_HOI[phim]);
            }
        }

        let viTriGoc = new THREE.Vector3(); 
        let huongMat = new THREE.Vector3(); 
        let mucTieuGoc = new THREE.Vector3();
        const dameGoc = window.DAME_CUA_TOI || 100;

        if (isRemote) {
            viTriGoc.set(remoteGoc.x, remoteGoc.y, remoteGoc.z); 
            huongMat.set(remoteHuong.x, remoteHuong.y, remoteHuong.z); 
            mucTieuGoc.set(remoteDich.x, remoteDich.y, remoteDich.z); 
        } else {
            nvc.getWorldPosition(viTriGoc); 
            nvc.getWorldDirection(huongMat); huongMat.normalize();
            
            let targetQuai = window.layMucTieuGanNhatGK(viTriGoc);
            if (targetQuai && targetQuai.mesh) {
                let hit = window.layHitbox(targetQuai.mesh);
                mucTieuGoc = hit.tamNguc.clone();
                // Tự động xoay mặt vào mục tiêu
                let dummy = new THREE.Object3D(); dummy.position.copy(nvc.position); dummy.lookAt(mucTieuGoc.x, nvc.position.y, mucTieuGoc.z);
                nvc.quaternion.copy(dummy.quaternion);
                nvc.getWorldDirection(huongMat);
            } else {
                mucTieuGoc = viTriGoc.clone().add(huongMat.clone().multiplyScalar(60));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Goku', 
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieuGoc.x, y: mucTieuGoc.y, z: mucTieuGoc.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        let tayPos = viTriGoc.clone().add(new THREE.Vector3(0, 5, 0)).add(huongMat.clone().multiplyScalar(2));

        // =====================================
        // Q: BẮN 1 QUẢ CẦU NHANH (ATTACK)
        // =====================================
        if (phim === 'Q') {
            if (!isRemote && typeof window.epNhanVatMua === 'function') window.epNhanVatMua('ATTACK');
            
            let cauQ = taoCauAnhSang(2.0, 0xffcc00); // Cầu vàng
            cauQ.position.copy(tayPos);
            cauQ.lookAt(mucTieuGoc);
            scene.add(cauQ);
            
            kyNangGoku.push({ mesh: cauQ, type: 'CAU_THUONG', speed: 10.0, life: 100, targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.5, isRemote: isRemote });
        }
        
        // =====================================
        // E: KAMEHAMEHA 1 GIÂY (ATTACKhold)
        // =====================================
        else if (phim === 'E') {
            if (!isRemote && typeof window.epNhanVatMua === 'function') window.epNhanVatMua('ATTACKhold');
            if (!isRemote && typeof window.kichHoatKhiencAnimation === 'function') window.kichHoatKhiencAnimation(1200); // Khóa 1s

            let tiaE = taoTiaKamehameha(3.0, 0x00ffff); // Tia xanh lơ
            scene.add(tiaE);
            
            // 30 tick = ~1 giây
            kyNangGoku.push({ mesh: tiaE, type: 'TIA_KAME', life: 30, owner: nvc, targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.15, isRemote: isRemote, color: 0x00ffff });
        }

        // =====================================
        // R: ĐẠI KAMEHAMEHA 2 GIÂY (ATTACKhold)
        // =====================================
        else if (phim === 'R') {
            if (!isRemote && typeof window.epNhanVatMua === 'function') window.epNhanVatMua('ATTACKhold');
            if (!isRemote && typeof window.kichHoatKhiencAnimation === 'function') window.kichHoatKhiencAnimation(2200); // Khóa 2s

            let tiaR = taoTiaKamehameha(5.0, 0xff0000); // Tia đỏ Kaio-ken
            scene.add(tiaR);
            
            // 60 tick = ~2 giây
            kyNangGoku.push({ mesh: tiaR, type: 'TIA_KAME', life: 60, owner: nvc, targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.2, isRemote: isRemote, color: 0xff0000 });
        }

        // =====================================
        // F: CHUỖI TỤ KHÍ QUẢ CẦU KÊNH KHI (END1 -> START -> hold -> ATTACK -> END)
        // =====================================
        else if (phim === 'F') {
            if (!isRemote && typeof window.kichHoatKhiencAnimation === 'function') window.kichHoatKhiencAnimation(3500); // Khóa cứng 3.5s để diễn kịch
            
            // Bước 1: GỌI END1
            if (!isRemote && typeof window.epNhanVatMua === 'function') window.epNhanVatMua('END1');

            // Bước 2: GỌI START (Sau 600ms)
            setTimeout(() => {
                if (!isRemote && typeof window.epNhanVatMua === 'function') window.epNhanVatMua('START');
            }, 600);

            // Bước 3: GỌI HOLD & GIỮ 1 GIÂY (Sau 1200ms)
            setTimeout(() => {
                if (!isRemote && typeof window.epNhanVatMua === 'function') window.epNhanVatMua('hold');
            }, 1200);

            // Bước 4: GỌI ATTACK VÀ PHÓNG CẦU (Sau 1200ms + 1000ms = 2200ms)
            setTimeout(() => {
                if (!isRemote && typeof window.epNhanVatMua === 'function') window.epNhanVatMua('ATTACK');
                
                // Lấy tọa độ mới nhất vì Goku có thể đã bị quái đẩy
                let tayPosMoi = viTriGoc.clone().add(new THREE.Vector3(0, 8, 0)).add(huongMat.clone().multiplyScalar(2));
                
                let cauGenki = taoCauAnhSang(1.0, 0x00aaff); // Bắt đầu bằng size 1.0 rất nhỏ
                cauGenki.position.copy(tayPosMoi);
                cauGenki.lookAt(mucTieuGoc);
                scene.add(cauGenki);
                
                kyNangGoku.push({ mesh: cauGenki, type: 'GENKI_DAMA', speed: 6.0, life: 150, targetPos: mucTieuGoc.clone(), damage: dameGoc * 2.0, isRemote: isRemote });

                // Bước 5: ĐỒNG THỜI GỌI END (Sau khi phóng 200ms)
                setTimeout(() => {
                    if (!isRemote && typeof window.epNhanVatMua === 'function') window.epNhanVatMua('END');
                }, 200);

            }, 2200);
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ GOKU
    // ==========================================
    window.updateCombatGoku = function () {
        for (let i = kyNangGoku.length - 1; i >= 0; i--) {
            let s = kyNangGoku[i]; 
            s.life--;

            // 🌟 1. CẦU THƯỜNG (CHIÊU Q)
            if (s.type === 'CAU_THUONG') {
                s.mesh.translateZ(s.speed);
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 3) {
                    taoVuNoKame(s.mesh.position, 0xffcc00, 10);
                    if (!s.isRemote) gaySatThuongGK(s.mesh.position, s.damage, 10); 
                    s.life = 0;
                }
            }
            
            // 🌟 2. QUẢ CẦU KÊNH KHI (CHIÊU F)
            else if (s.type === 'GENKI_DAMA') {
                s.mesh.translateZ(s.speed);
                
                // 🛑 QUẢ CẦU TỰ ĐỘNG PHÌNH TO LÊN KHI BAY (Tối đa scale x20)
                if (s.mesh.scale.x < 20.0) {
                    s.mesh.scale.addScalar(0.25); // To lên liên tục theo từng khung hình
                }

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 5) {
                    taoVuNoKame(s.mesh.position, 0x00aaff, 25);
                    if (!s.isRemote) gaySatThuongGK(s.mesh.position, s.damage, 25); 
                    s.life = 0;
                }
            }

            // 🌟 3. TIA LAZER KAMEHAMEHA LIÊN TỤC (E & R)
            else if (s.type === 'TIA_KAME') {
                if (s.owner && s.owner.parent) {
                    // Cập nhật vị trí nòng súng liên tục theo tay người bắn
                    let fwd = new THREE.Vector3(); s.owner.getWorldDirection(fwd);
                    let startPos = new THREE.Vector3(); s.owner.getWorldPosition(startPos);
                    startPos.add(new THREE.Vector3(0, 5, 0)).add(fwd.multiplyScalar(2));
                    
                    // Cập nhật mục tiêu liên tục
                    if (!s.isRemote) {
                        let mucTieuMoi = window.layMucTieuGanNhatGK(startPos);
                        if (mucTieuMoi && mucTieuMoi.mesh) {
                            let hit = window.layHitbox(mucTieuMoi.mesh);
                            s.targetPos = hit.tamNguc.clone();
                            // Ép nhân vật bẻ cổ ngắm theo quái
                            let dummy = new THREE.Object3D(); dummy.position.copy(s.owner.position); dummy.lookAt(s.targetPos.x, s.owner.position.y, s.targetPos.z);
                            s.owner.quaternion.slerp(dummy.quaternion, 0.2);
                        }
                    }

                    // Kéo giãn tia lazer từ Tay -> Quái
                    let endPos = s.targetPos;
                    let dist = startPos.distanceTo(endPos);
                    if (dist < 1) dist = 1;

                    s.mesh.scale.z = dist; // Giãn chiều dài
                    let midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
                    s.mesh.position.copy(midPoint);
                    s.mesh.lookAt(endPos);

                    // Sát thương duy trì (Mỗi 5 frames / ~150ms nổ dame 1 lần)
                    if (s.life % 5 === 0) {
                        taoVuNoKame(endPos, s.color, 8);
                        if (!s.isRemote) gaySatThuongGK(endPos, s.damage, 8, (s.color === 0xff0000 ? '#ff0000' : '#00ffff'));
                    }
                } else {
                    s.life = 0; // Người bắn bay màu thì tắt tia
                }
            }

            // Dọn rác
            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangGoku.splice(i, 1);
            }
        }

        // Tàn lửa VFX
        for (let i = hieuUngGoku.length - 1; i >= 0; i--) {
            let h = hieuUngGoku[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].x *= 0.85; h.velocities[j].z *= 0.85; h.velocities[j].y -= 0.2; 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 20;
            if (h.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(h.system); else scene.remove(h.system);
                hieuUngGoku.splice(i, 1);
            }
        }

        // Số bay UI
        for (let i = danhSachSoBayGK.length - 1; i >= 0; i--) {
            let it = danhSachSoBayGK[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayGK.splice(i, 1); window.tongSoChuNoi_GK--; }
        }
    };

    setInterval(window.updateCombatGoku, 30);

    // ==========================================
    // 🌟 KHỞI TẠO BỘ TỪ ĐIỂN AI (ÉP TƯ THẾ)
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('goku')) {
        window.HePhaiHienTai = {
            tenPhai: "Siêu Saiyan Goku",
            khoiTao: function () {
                console.log("🐉 KAMEHAMEHA! Goku đã đáp xuống chiến trường!");

                if (window.animationsMap) {
                    // 🛑 ÉP CHẾT: Mọi chuyển động (Chạy, Đi Bộ, Rơi) đều đổi thành BAY
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK') || k.includes('JUMP') || k.includes('FALL')) {
                            // Nếu có anim BAY thì lấy BAY đè lên
                            if (window.animationsMap['BAY']) window.animationsMap[key] = window.animationsMap['BAY'];
                            else if (window.animationsMap['FLY']) window.animationsMap[key] = window.animationsMap['FLY'];
                        }
                    }

                    // 🛑 ÉP CHẾT: Đứng im là NHANROI
                    if (window.animationsMap['NHANROI']) {
                        window.animationsMap['IDLE'] = window.animationsMap['NHANROI'];
                        window.animationsMap['WAIT'] = window.animationsMap['NHANROI'];
                        if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap['NHANROI'];
                    }
                }
            },
            tungChieu: window.tungComboGoku,
            capNhat: function () {} 
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
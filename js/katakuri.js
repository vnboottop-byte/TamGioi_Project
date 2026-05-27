// ==========================================
// 🍩 HỆ THỐNG KỸ NĂNG ĐOẠT XÁ: KATAKURI (HỆ MOCHI / HAKI)
// 👑 KẾT HỢP TINH HOA: LƯỚT (LUYỆN THỂ) + MƯA KIẾM (TU TIÊN)
// ==========================================

(function () {
    const kyNangKatakuri = [];
    const hieuUngKatakuri = [];
    const danhSachSoBayKTK = [];

    // 🌟 ĐỒNG BỘ THỜI GIAN HỒI CHIÊU & SÁT THƯƠNG CHUẨN PHÁP SƯ (Tổng 2.5x)
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    // 🌟 KHOẢNG CÁCH DỪNG LƯỚT CỦA TỪNG CHIÊU
    const KHOANG_CACH_LUOT = { 'Q': 10, 'E': 2, 'R': 2 };

    // 🌟 TRẠNG THÁI LƯỚT (KẾT THỪA LUYỆN THỂ)
    window.trangThaiKTK = { state: 'IDLE', target: null, skillKey: null, isRemote: false };

    window.tongSoChuNoi_KTK = 0;
    function taoSoSatThuongKTK(pos3D, satThuong, mauSac = '#ff0044') {
        if (window.isMobile && window.tongSoChuNoi_KTK > 5) return;
        if (satThuong <= 0) return;
        window.tongSoChuNoi_KTK++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #aa0000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayKTK.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatKTK = function(viTriGoc) {
        // 🌟 ƯU TIÊN 1: Mục tiêu khóa tay (Dành cho Sếp chơi trên PC)
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 300) return window.mucTieuHienTai;
        }

        // 🌟 ƯU TIÊN 2: QUÉT TÌM NGƯỜI CHƠI (PVP) TRƯỚC!
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
        
        // 🛑 BÍ QUYẾT Ở ĐÂY: NẾU THẤY CÓ NGƯỜI LÀ RETURN NGAY LẬP TỨC! BỎ QUA ĐÁM QUÁI!
        if (targetNguoi) return targetNguoi;

        // 🌟 ƯU TIÊN 3: KHÔNG CÓ AI Ở ĐÂY THÌ MỚI TÌM QUÁI (PVE)
        let targetQuai = null; let minDQuai = 300;
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDQuai) { minDQuai = d; targetQuai = quai; }
                }
            });
        }
        
        return targetQuai; // Trả về con quái gần nhất (hoặc null nếu bãi trống)
    };

    function gaySatThuongKTK(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongKTK(posHienSo, luongSatThuong, '#ff0044');
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
                            taoSoSatThuongKTK(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongKTK(hit.tamNguc.clone(), luongSatThuong);
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

    // 💥 VỤ NỔ HAKI / MOCHI (Đỏ Thẫm)
    window.thoiDiemNoCuoiCungKTK = window.thoiDiemNoCuoiCungKTK || 0;
    function taoVuNoKatakuri(pos, colorHex = 0xaa0000, banKinh = 10) {
        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungKTK < 200) return; 
        window.thoiDiemNoCuoiCungKTK = bayGio;

        const soLuong = window.isMobile ? 15 : 60; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 12, (Math.random() - 0.5) * 15));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureHakiKTK) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   
            gradient.addColorStop(0.3, 'rgba(170, 0, 0, 0.9)'); // Haki Đỏ Thẫm
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureHakiKTK = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: colorHex, size: window.isMobile ? 6.0 : 10.0, map: window.textureHakiKTK, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngKatakuri.push({ system: pts, velocities: vels, life: 30 }); 
    }

    // 🌟 GỌI BÀN TAY (CLONE TU TIÊN R)
    function taoBanTayChuan(scaleSize) {
        const handGroup = new THREE.Group(); 
        let url = 'uploads/anims/BANTAY.glb';
        
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(url, (vuKhi) => {
                vuKhi.position.set(0, 0, 0); 
                vuKhi.rotation.set(0, 0, 0); 
                vuKhi.scale.set(1, 1, 1);
                vuKhi.traverse(c => { if (c.isMesh) { c.visible = true; } });
                handGroup.add(vuKhi);
            });
        }
        handGroup.scale.set(scaleSize, scaleSize, scaleSize);
        return handGroup;
    }

    // ==========================================
    // ✨ TUNG CHIÊU KATAKURI
    // ==========================================
    window.tungComboKatakuri = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc && !isRemote) return;

        // 🌟 KIỂM TRA ĐỒNG HỒ & GẮN UI (Giống Luyện Thể)
        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;

            // UI Đồng hồ đếm ngược
            let nutKyNang = document.getElementById('btn' + phim.toUpperCase()) || document.getElementById('skill' + phim.toUpperCase());
            if (!nutKyNang) {
                let cacNut = document.querySelectorAll('div, button');
                for (let n of cacNut) {
                    if (n.innerText && n.innerText.trim().toUpperCase() === phim.toUpperCase() && (n.style.borderRadius === '50%' || n.className.includes('skill'))) {
                        nutKyNang = n; break;
                    }
                }
            }
            if (nutKyNang) {
                nutKyNang.style.pointerEvents = 'none'; nutKyNang.style.filter = 'brightness(0.4) grayscale(100%)';
                let idDongHo = 'dongho_ktk_' + phim; let soDemNguoc = document.getElementById(idDongHo);
                if (!soDemNguoc) {
                    soDemNguoc = document.createElement('div'); soDemNguoc.id = idDongHo;
                    soDemNguoc.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:18px; font-weight:900; z-index:999; pointer-events:none;';
                    nutKyNang.appendChild(soDemNguoc);
                }
                let thoiGian = THOI_GIAN_HOI[phim] / 1000; soDemNguoc.innerText = thoiGian.toFixed(1);
                let demDongHo = setInterval(() => {
                    thoiGian -= 0.1;
                    if (thoiGian <= 0) {
                        clearInterval(demDongHo); if (soDemNguoc && soDemNguoc.parentNode) soDemNguoc.parentNode.removeChild(soDemNguoc);
                        nutKyNang.style.filter = ''; nutKyNang.style.pointerEvents = '';
                    } else soDemNguoc.innerText = thoiGian.toFixed(1);
                }, 100);
            }
        }

        // 🌟 MAP ANIMATION
        let tenAnimMua = '';
        if (phim === 'Q') tenAnimMua = 'ATTACK1';      // Số 2
        else if (phim === 'E') tenAnimMua = 'ATTACK4'; // Số 28
        else if (phim === 'R') tenAnimMua = 'ATTACK3'; // Số 27
        else if (phim === 'F') tenAnimMua = 'ATTACK';  // Số 3

        if (!isRemote) {
            window.dangMuaChieu = false; // Phá khóa để cho phép Lướt ngay lập tức!
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua);

            // Bắn sóng mạng
            let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Katakuri', 
                    origin: {x: nvc.position.x, y: nvc.position.y, z: nvc.position.z}, target: {x: 0, y: 0, z: 0}, dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z}, weaponUrl: ""
                })), { reliable: true });
            }
        }

        const dameGoc = window.DAME_CUA_TOI || 100; 
        let targetQuai = window.layMucTieuGanNhatKTK(nvc.position);

        // =====================================
        // CHIÊU Q, E, R: LƯỚT TỚI MỤC TIÊU VÀ TUNG SKILL
        // =====================================
        if (phim === 'Q' || phim === 'E' || phim === 'R') {
            if (targetQuai && !isRemote) {
                // Kích hoạt động cơ lướt (Luyện Thể V2)
                window.trangThaiKTK.state = 'DASHING';
                window.trangThaiKTK.target = targetQuai;
                window.trangThaiKTK.skillKey = phim;
                window.trangThaiKTK.isRemote = isRemote;
            } else if (!isRemote) {
                // Đánh chay không lướt nếu không có quái
                taoVuNoKatakuri(nvc.position.clone().add(nvc.getWorldDirection(new THREE.Vector3()).multiplyScalar(5)), 0xaa0000, 5);
            }
        }
        // =====================================
        // CHIÊU F: BÀN TAY MOCHI TỪ TRÊN TRỜI RƠI XUỐNG DỒN 1 MỤC TIÊU
        // =====================================
        else if (phim === 'F') {
            // Không lướt, đứng im gọi Bàn tay khổng lồ
            let upVector = nvc.up.clone().normalize();
            let dropCenter = null;

            if (targetQuai) {
                let hit = window.layHitbox(targetQuai.mesh);
                dropCenter = hit.tamNguc.clone();
            } else {
                let fwd = new THREE.Vector3(); nvc.getWorldDirection(fwd);
                dropCenter = nvc.position.clone().add(fwd.multiplyScalar(20)); // Bắn mù ra trước 20m
            }

            // Sinh ra 10 bàn tay rơi liên hoàn DỒN VÀO 1 CHỖ
            const soLuong = 10;
            for (let i = 0; i < soLuong; i++) {
                // Lệch ngẫu nhiên 1 xíu (bán kính 2m) để không đè y chang nhau
                let offset = new THREE.Vector3((Math.random()-0.5)*4, 0, (Math.random()-0.5)*4);
                let dropTarget = dropCenter.clone().add(offset);
                
                // Điểm sinh ra trên bầu trời (Cao 30m)
                let posNgoai = dropTarget.clone().add(upVector.clone().multiplyScalar(30)); 

                const hand = taoBanTayChuan(3.5);
                hand.position.copy(posNgoai); 
                hand.up.copy(upVector); 
                hand.lookAt(dropTarget); // Chĩa bàn tay đâm thẳng xuống
                scene.add(hand);
                
                kyNangKatakuri.push({ 
                    mesh: hand, type: 'F_DROP', speed: 4.0, life: 100, delay: i * 4, // Rơi từng cái một
                    targetPos: dropTarget, damage: dameGoc * 0.09, isRemote: isRemote 
                });
            }
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ KATAKURI
    // ==========================================
    window.updateCombatKatakuri = function () {
        let nvc = window.playerModel;
        
        // 1. ĐỘNG CƠ LƯỚT CHẶN KHOẢNG CÁCH (LUYỆN THỂ LAI KATAKURI)
        if (nvc && window.trangThaiKTK.state === 'DASHING' && window.trangThaiKTK.target) {
            let t = window.trangThaiKTK.target;
            if (t.isDead || !t.mesh) { window.trangThaiKTK.state = 'IDLE'; return; }
            
            let tHit = window.layHitbox(t.mesh);
            let myHit = window.layHitbox(nvc);
            
            let diemDen = tHit.tamNguc.clone();
            diemDen.y -= (myHit.chieuCao / 2); 
            
            let khoangCach = nvc.position.distanceTo(diemDen);
            let kcDung = KHOANG_CACH_LUOT[window.trangThaiKTK.skillKey] || 2;

            // Xoay mặt ngắm đích
            const dummy = new THREE.Object3D(); dummy.position.copy(nvc.position); dummy.up.copy(nvc.up);
            let vecToTarget = new THREE.Vector3().subVectors(tHit.tamNguc, nvc.position);
            let vertComp = vecToTarget.clone().projectOnVector(nvc.up); vecToTarget.sub(vertComp);
            dummy.lookAt(nvc.position.clone().add(vecToTarget));
            nvc.quaternion.slerp(dummy.quaternion, 0.4); 

            if (khoangCach > kcDung) {
                // 💨 Tốc độ lướt cực gắt (0.3)
                nvc.position.lerp(diemDen, 0.3); 
            } else {
                // 💥 TỚI TẦM -> XẢ SÁT THƯƠNG
                window.trangThaiKTK.state = 'IDLE'; // Khóa lướt
                
                let phim = window.trangThaiKTK.skillKey;
                let isRemote = window.trangThaiKTK.isRemote;
                const dameGoc = window.DAME_CUA_TOI || 100;
                
                let heSoDame = 0.4;
                let banKinhNo = 10;
                if (phim === 'E') { heSoDame = 0.6; banKinhNo = 15; }
                if (phim === 'R') { heSoDame = 0.6; banKinhNo = 20; }

                taoVuNoKatakuri(tHit.tamNguc, 0xaa0000, banKinhNo);
                if (!isRemote) gaySatThuongKTK(tHit.tamNguc, dameGoc * heSoDame, banKinhNo);

                // Rung nhẹ màn hình tạo uy lực
                if(window.camera) {
                    let camY = camera.position.y; let shake = setInterval(() => { camera.position.y = camY + (Math.random()-0.5)*1.0; }, 20);
                    setTimeout(() => { clearInterval(shake); camera.position.y = camY; }, 100);
                }
            }
        }

        // 2. VẬT LÝ BÀN TAY TỪ TRÊN TRỜI (F_DROP)
        for (let i = kyNangKatakuri.length - 1; i >= 0; i--) {
            let s = kyNangKatakuri[i]; 
            if (s.type === 'F_DROP') {
                if (s.delay > 0) { s.delay--; continue; } // Chờ đến lượt mới rơi
                
                s.life--;
                s.mesh.translateZ(s.speed); // Rơi cắm đầu xuống
                
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 3 || s.life < 5) {
                    // Nổ Haki khi chạm đất
                    taoVuNoKatakuri(s.targetPos, 0xff0000, 10);
                    if (!s.isRemote) gaySatThuongKTK(s.targetPos, s.damage, 10); // Dồn dame 1 mục tiêu
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangKatakuri.splice(i, 1);
            }
        }

        // 3. TÀN LỬA HAKI (Hút xuống đất)
        for (let i = hieuUngKatakuri.length - 1; i >= 0; i--) {
            let h = hieuUngKatakuri[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; 
                posArr[j * 3 + 1] += h.velocities[j].y; 
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].x *= 0.9; 
                h.velocities[j].z *= 0.9; 
                h.velocities[j].y -= 0.6; // Nặng trịch rớt thẳng xuống
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 30; 

            if (h.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(h.system); else scene.remove(h.system);
                hieuUngKatakuri.splice(i, 1);
            }
        }

        // Số bay UI
        for (let i = danhSachSoBayKTK.length - 1; i >= 0; i--) {
            let it = danhSachSoBayKTK[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayKTK.splice(i, 1); window.tongSoChuNoi_KTK--; }
        }
    };

    setInterval(window.updateCombatKatakuri, 30);

    // ==========================================
    // 🌟 KHỞI TẠO BỘ TỪ ĐIỂN AI (MÁY QUÉT ĐỌC CẤU TRÚC ANIMATION CHUẨN SẾP)
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('katakuri')) {
        window.HePhaiHienTai = {
            tenPhai: "Tứ Hoàng Katakuri",
            khoiTao: function () {
                console.log("🍩 Thức Tỉnh Mochi! Katakuri đã xuất chiến!");

                if (window.animationsMap) {
                    // Tách bóc Nhàn Rỗi Đi Bộ (NHANROI1 - 29) và Nhàn Rỗi Cưỡi Thú (NHANROI - 20)
                    let animNhanRoiCuoiThu = null;
                    let animNhanRoiDiBo = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        
                        // Lọc Nhàn Rỗi
                        if (k.includes('NHANROI1')) animNhanRoiDiBo = window.animationsMap[key];
                        else if (k.includes('NHANROI') && !k.includes('NHANROI1')) animNhanRoiCuoiThu = window.animationsMap[key];
                        
                        // Lọc Chạy / Bay
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) {
                            window.animationsMap['CHAYBO'] = window.animationsMap[key];
                        }
                        if (k.includes('BAY') || k.includes('FLY')) {
                            window.animationsMap['BAY'] = window.animationsMap[key];
                        }
                    }

                    // Gán vào Engine (Engine chạy NHANROI cho đi bộ, và MapChar cho Cưỡi thú)
                    if (animNhanRoiDiBo) window.animationsMap['NHANROI'] = animNhanRoiDiBo;
                    if (animNhanRoiCuoiThu && window.animationsMapChar) window.animationsMapChar['NHANROI'] = animNhanRoiCuoiThu;
                }
            },
            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) {
                window.tungComboKatakuri(phim, isRemote, origin, target, dir, casterId, weaponUrl);
            },
            capNhat: function () {
                // Không cần AI Random gãi đầu nữa vì Đứng im dưới 5m đã có NHANROI1 lo liệu!
            }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
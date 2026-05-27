// ==========================================
// 🍖 HỆ THỐNG ĐOẠT XÁ: LUFFY (TRÁI GOMU GOMU)
// 👑 TÍNH NĂNG: GATLING GUN XEN KẼ TRÁI/PHẢI + PHIỄU GOM SÁT THƯƠNG
// ==========================================

(function () {
    const kyNangLuffy = [];
    
    // 🌟 ĐỒNG BỘ HỒI CHIÊU NHANH (3 GIÂY) VÌ LÀ PHÁI TỐC ĐỘ
    const THOI_GIAN_HOI = { 'Q': 3000, 'E': 3000, 'R': 3000, 'F': 3000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    // ==========================================
    // 🛡️ HỆ THỐNG PHIỄU GOM SÁT THƯƠNG (CHỐNG LAG SỐ BAY)
    // ==========================================
    window.phieuDameLuffy = {}; 
    const danhSachSoBayLF = [];
    window.tongSoChuNoi_LF = 0;

    function hienThiSoDameGom(pos3D, satThuong) {
        if (window.isMobile && window.tongSoChuNoi_LF > 8) return;
        if (satThuong <= 0) return;
        window.tongSoChuNoi_LF++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 8px #000, 2px 2px 0px #aa0000';
        div.style.cssText = `position:absolute; color:#ff3333; font-weight:900; font-size:30px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayLF.push({ el: div, pos: pos3D.clone(), life: 40, offsetY: 0 });
    }

    // Xả phiễu mỗi 0.5s để cộng dồn hàng chục cú đấm thành 1 con số to
    setInterval(() => {
        for (let id in window.phieuDameLuffy) {
            let data = window.phieuDameLuffy[id];
            if (data.dame > 0 && data.pos) {
                hienThiSoDameGom(data.pos, data.dame);
                data.dame = 0; // Reset phiễu
            }
        }
    }, 500);

    // ==========================================
    // 🎯 RADAR PVP/PVE (THẤY NGƯỜI ĐẤM NGƯỜI)
    // ==========================================
    window.layMucTieuGanNhatLF = function(viTriGoc) {
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

    function gaySatThuongLuffy(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        if (!window.phieuDameLuffy[id]) window.phieuDameLuffy[id] = { dame: 0, pos: null };
                        window.phieuDameLuffy[id].dame += luongSatThuong; window.phieuDameLuffy[id].pos = posHienSo;
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
                        let idQ = quai.id || Math.random();
                        if (!window.phieuDameLuffy[idQ]) window.phieuDameLuffy[idQ] = { dame: 0, pos: null };
                        window.phieuDameLuffy[idQ].dame += luongSatThuong; window.phieuDameLuffy[idQ].pos = hit.tamNguc.clone();
                        
                        if (quai.isBoss) {
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; 
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
    // ✨ TUNG CHIÊU LUFFY
    // ==========================================
    window.tungComboLuffy = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        // 🌟 KIỂM TRA ĐỒNG HỒ 3S
        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;
            
            let nutKyNang = document.getElementById('btn' + phim.toUpperCase()) || document.getElementById('skill' + phim.toUpperCase());
            if (nutKyNang) {
                nutKyNang.style.pointerEvents = 'none'; nutKyNang.style.filter = 'brightness(0.4) grayscale(100%)';
                setTimeout(() => { nutKyNang.style.filter = ''; nutKyNang.style.pointerEvents = ''; }, THOI_GIAN_HOI[phim]);
            }

            let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Luffy', 
                    origin: {x: nvc.position.x, y: nvc.position.y, z: nvc.position.z}, target: {x: 0, y: 0, z: 0}, dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z}, weaponUrl: ""
                })), { reliable: true });
            }
        }

        // 🌟 MAP ANIMATION THEO YÊU CẦU CỦA SẾP
        let tenAnimMua = '';
        if (phim === 'Q') tenAnimMua = 'ATTACK3'; // 10 đấm thường
        else if (phim === 'E') tenAnimMua = 'ATTACK4'; // 6 đấm Giga
        else if (phim === 'R') tenAnimMua = 'ATTACK2'; // 4 đấm Giga
        else if (phim === 'F') tenAnimMua = 'ATTACK1'; // 4 đấm Giga

        if (!isRemote) {
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua);
        }

        let fwd = new THREE.Vector3(); nvc.getWorldDirection(fwd);
        let right = new THREE.Vector3().crossVectors(nvc.up, fwd).normalize(); // Lấy hướng Trái/Phải để xếp đạn

        // 🔍 TÌM 4 CÁI TAY MESH CỦA SẾP
        let tayTraiThuong = null, tayPhaiThuong = null;
        let tayTraiGiga = null, tayPhaiGiga = null;

        nvc.traverse(c => {
            if (c.isMesh) {
                let name = c.name.toLowerCase();
                if (name === 'taytrai_thuong') tayTraiThuong = c;
                if (name === 'tayphai_thuong') tayPhaiThuong = c;
                if (name === 'taytrai_giga') tayTraiGiga = c;
                if (name === 'tayphai_giga') tayPhaiGiga = c;
                
                // Đảm bảo Tay Giga luôn bị ẩn (Nhỡ có lúc nó hiện lên)
                if (name.includes('giga')) c.visible = false;
            }
        });

        // 🚀 HÀM BẮN GATLING CƠ ĐỘNG
        const dameGoc = window.DAME_CUA_TOI || 100;
        function banGatling(soLuong, heSoDame, tocDoBay, scaleTay, dungTayGiga = false) {
            let tayTraiMau = dungTayGiga ? tayTraiGiga : tayTraiThuong;
            let tayPhaiMau = dungTayGiga ? tayPhaiGiga : tayPhaiThuong;

            if (!tayTraiMau && !tayPhaiMau) return; // Nếu Sếp chưa đặt đúng tên thì thoát

            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    // XEN KẼ TRÁI PHẢI (Số chẵn lấy tay Phải, lẻ lấy tay Trái)
                    let isRight = (i % 2 === 0);
                    let tayMau = isRight ? tayPhaiMau : tayTraiMau;
                    if (!tayMau) tayMau = tayPhaiMau || tayTraiMau; // Backup nếu thiếu 1 tay

                    let tayClone = tayMau.clone();
                    tayClone.visible = true; // Hiện bản sao lên để bay
                    if (scaleTay !== 1) tayClone.scale.set(scaleTay, scaleTay, scaleTay);

                    // Đặt vị trí xuất phát 
                    let posSpawn = nvc.position.clone().add(new THREE.Vector3(0, 5, 0));
                    posSpawn.add(fwd.clone().multiplyScalar(5)); // Dời ra trước người 1 chút
                    
                    // Lệch sang trái hoặc phải tương ứng với cánh tay
                    let lechNgang = right.clone().multiplyScalar(isRight ? -4 : 4); 
                    posSpawn.add(lechNgang);
                    
                    // Thêm chút ngẫu nhiên để giống Gatling loạn đả
                    posSpawn.add(new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*4, 0));

                    tayClone.position.copy(posSpawn);
                    let targetBay = posSpawn.clone().add(fwd.clone().multiplyScalar(50)); // Bay xa 50m
                    tayClone.lookAt(targetBay);
                    scene.add(tayClone);

                    kyNangLuffy.push({ 
                        mesh: tayClone, type: 'BULLET_PUNCH', speed: tocDoBay, life: 15, 
                        targetPos: targetBay, isRemote: isRemote, damage: dameGoc * heSoDame
                    });
                }, i * 60); // Tốc độ xả đạn cực lẹ (60ms/phát)
            }
        }

        // =====================================
        // XỬ LÝ SỐ LƯỢNG ĐẠN TỪNG CHIÊU
        // =====================================
        if (phim === 'Q') {
            // Q: 10 Đấm Thường (TayTrai_Thuong, TayPhai_Thuong)
            // Dame nhỏ lại để cân bằng
            banGatling(10, 0.15, 6.0, 1.0, false); 
        } 
        else if (phim === 'E') {
            // E: 6 Đấm Giga (TayTrai_Giga, TayPhai_Giga)
            banGatling(6, 0.25, 4.0, 1.5, true); 
        }
        else if (phim === 'R') {
            // R: 4 Đấm Giga
            banGatling(4, 0.4, 4.0, 2.0, true); 
        }
        else if (phim === 'F') {
            // F: 4 Đấm Giga (Sát thương to hơn xíu vì đòn kết liễu)
            banGatling(4, 0.5, 4.0, 2.5, true); 
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ VÀ DỌN RÁC
    // ==========================================
    window.updateCombatLuffy = function () {
        for (let i = kyNangLuffy.length - 1; i >= 0; i--) {
            let s = kyNangLuffy[i]; 
            if (s.type === 'BULLET_PUNCH') {
                s.life--;
                s.mesh.translateZ(s.speed); 
                
                // Va chạm (Chỉ tính nếu là máy mình đánh)
                if (!s.isRemote && s.life % 2 === 0) { // Check va chạm mỗi 2 frame cho nhẹ
                    gaySatThuongLuffy(s.mesh.position, s.damage, 8); // Bán kính nổ 8m
                }

                if (s.life <= 0) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                    kyNangLuffy.splice(i, 1);
                }
            }
        }

        // Dọn số nổi
        for (let i = danhSachSoBayLF.length - 1; i >= 0; i--) {
            let it = danhSachSoBayLF[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayLF.splice(i, 1); window.tongSoChuNoi_LF--; }
        }
    };
    setInterval(window.updateCombatLuffy, 30);

    // ==========================================
    // 🌟 KHỞI TẠO TỪ ĐIỂN
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('luffy')) {
        window.HePhaiHienTai = {
            tenPhai: "Hải Tặc Luffy",
            khoiTao: function () {
                console.log("⚓ Gomu Gomu Gatling Sẵn Sàng!");
                // 🛑 ẨN TAY GIGA LÚC VỪA LOAD GAME
                setTimeout(() => {
                    let nvc = window.playerModel;
                    if (nvc) {
                        nvc.traverse(c => {
                            if (c.isMesh) {
                                let name = c.name.toLowerCase();
                                if (name === 'taytrai_giga' || name === 'tayphai_giga') {
                                    c.visible = false;
                                }
                            }
                        });
                    }
                }, 1000);

                if (window.animationsMap) {
                    let animNhanRoi = null;
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        
                        // Sếp yêu cầu: 'NHANROI' khi Cưỡi thú & Dưới 5m (Gộp chung)
                        if (k.includes('NHANROI') || k.includes('IDLE')) animNhanRoi = window.animationsMap[key];
                        
                        // Sếp yêu cầu: 'CHAYBO' khi click chuột / WASD
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) window.animationsMap['CHAYBO'] = window.animationsMap[key];
                        
                        // Sếp yêu cầu: 'BAY' khi không cưỡi và > 5m
                        if (k.includes('BAY') || k.includes('FLY')) window.animationsMap['BAY'] = window.animationsMap[key];
                    }
                    
                    if (animNhanRoi) {
                        window.animationsMap['NHANROI'] = animNhanRoi;
                        if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = animNhanRoi; // Dùng cho cưỡi thú luôn
                    }
                }
            },
            tungChieu: window.tungComboLuffy,
            capNhat: function () {}
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
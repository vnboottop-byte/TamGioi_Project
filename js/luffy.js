// ==========================================
// 🍖 HỆ THỐNG ĐOẠT XÁ: LUFFY (TRÁI GOMU GOMU)
// 👑 TÍNH NĂNG: GATLING VỚI MODEL ĐỘC LẬP (NAMDAMNHO & NAMDAMLON)
// ==========================================

(function () {
    const kyNangLuffy = [];
    
    // 🌟 ĐỒNG BỘ HỒI CHIÊU NHANH (3 GIÂY)
    const THOI_GIAN_HOI = { 'Q': 3000, 'E': 3000, 'R': 3000, 'F': 3000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    // ==========================================
    // 🛡️ HỆ THỐNG PHIỄU GOM SÁT THƯƠNG
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

    setInterval(() => {
        for (let id in window.phieuDameLuffy) {
            let data = window.phieuDameLuffy[id];
            if (data.dame > 0 && data.pos) {
                hienThiSoDameGom(data.pos, data.dame);
                data.dame = 0; 
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
    // 🌟 HÀM TẠO NẮM ĐẤM TỪ FILE .GLB CHUẨN AAA
    // ==========================================
    function taoNamDamGatling(loaiNMDam, scaleSize) {
        const handGroup = new THREE.Group(); 
        let url = (loaiNMDam === 'LON') ? 'uploads/anims/NAMDAMLON.glb' : 'uploads/anims/NAMDAMNHO.glb';
        
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(url, (vuKhi) => {
                vuKhi.position.set(0, 0, 0); 
                // 🛑 LƯU Ý CHO SẾP: Nếu lúc bắn ra mà nắm đấm bị quay ngang quay ngược,
                // Sếp chỉ cần chỉnh cái vuKhi.rotation này (Math.PI / 2 là xoay 90 độ)
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
    // ✨ TUNG CHIÊU LUFFY
    // ==========================================
    window.tungComboLuffy = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

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

        let tenAnimMua = '';
        if (phim === 'Q') tenAnimMua = 'ATTACK3'; 
        else if (phim === 'E') tenAnimMua = 'ATTACK4';
        else if (phim === 'R') tenAnimMua = 'ATTACK2'; 
        else if (phim === 'F') tenAnimMua = 'ATTACK1'; 

        if (!isRemote) {
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua);
        }

        let fwd = new THREE.Vector3(); nvc.getWorldDirection(fwd);
        let right = new THREE.Vector3().crossVectors(nvc.up, fwd).normalize();
        const dameGoc = window.DAME_CUA_TOI || 100;

        // 🚀 HÀM BẮN GATLING TỪ FILE GLB
        function banGatling(soLuong, heSoDame, tocDoBay, scaleTay, loaiDam) {
            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    let isRight = (i % 2 === 0);
                    
                    // 🌟 Gọi hàm lấy File GLB ra xài luôn
                    let tayClone = taoNamDamGatling(loaiDam, scaleTay);

                    let posSpawn = nvc.position.clone().add(new THREE.Vector3(0, 5, 0));
                    posSpawn.add(fwd.clone().multiplyScalar(5)); 
                    
                    // Xếp đạn lệch ngang Trái/Phải
                    let lechNgang = right.clone().multiplyScalar(isRight ? -4 : 4); 
                    posSpawn.add(lechNgang);
                    
                    // Lệch dọc ngẫu nhiên tạo độ phủ loạn đả
                    posSpawn.add(new THREE.Vector3((Math.random()-0.5)*3, (Math.random()-0.5)*4, 0));

                    tayClone.position.copy(posSpawn);
                    let targetBay = posSpawn.clone().add(fwd.clone().multiplyScalar(50)); 
                    tayClone.lookAt(targetBay);
                    
                    scene.add(tayClone);

                    kyNangLuffy.push({ 
                        mesh: tayClone, type: 'BULLET_PUNCH', speed: tocDoBay, life: 15, 
                        targetPos: targetBay, isRemote: isRemote, damage: dameGoc * heSoDame
                    });
                }, i * 60); 
            }
        }

        // =====================================
        if (phim === 'Q') banGatling(10, 0.15, 6.0, 1.0, 'NHO'); 
        else if (phim === 'E') banGatling(6, 0.25, 4.0, 1.5, 'LON'); 
        else if (phim === 'R') banGatling(4, 0.4, 4.0, 2.0, 'LON'); 
        else if (phim === 'F') banGatling(4, 0.5, 4.0, 2.5, 'LON'); 
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
                
                // Check Va chạm
                if (!s.isRemote && s.life % 2 === 0) { 
                    gaySatThuongLuffy(s.mesh.position, s.damage, 8); 
                }

                if (s.life <= 0) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                    kyNangLuffy.splice(i, 1);
                }
            }
        }

        // Số nổi phiễu sát thương
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
    // 🌟 KHỞI TẠO TỪ ĐIỂN VÀ DỌN DẸP
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('luffy')) {
        window.HePhaiHienTai = {
            tenPhai: "Hải Tặc Luffy",
            khoiTao: function () {
                console.log("⚓ Gomu Gomu Gatling (GLB Độc Lập) Sẵn Sàng!");
                
                // 🛑 PHÒNG HỜ: Nếu Sếp up cái Body chưa xóa tay Giga thì hệ thống vẫn quét và giấu nó đi giùm Sếp
                setTimeout(() => {
                    let nvc = window.playerModel;
                    if (nvc) {
                        nvc.traverse(c => {
                            if (c.isMesh || c.isSkinnedMesh) {
                                let name = c.name.toLowerCase();
                                if (name.includes('giga') || name.includes('giant') || name.includes('big')) {
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
                        if (k.includes('NHANROI') || k.includes('IDLE')) animNhanRoi = window.animationsMap[key];
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) window.animationsMap['CHAYBO'] = window.animationsMap[key];
                        if (k.includes('BAY') || k.includes('FLY')) window.animationsMap['BAY'] = window.animationsMap[key];
                    }
                    if (animNhanRoi) {
                        window.animationsMap['NHANROI'] = animNhanRoi;
                        if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = animNhanRoi;
                    }
                }
            },
            tungChieu: window.tungComboLuffy,
            capNhat: function () {}
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
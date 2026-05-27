// ==========================================
// 🌟 HỆ THỐNG KỸ NĂNG ĐOẠT XÁ: ĐÔ ĐỐC KIZARU (HỆ ÁNH SÁNG)
// ==========================================

(function () {
    const kyNangKizaru = [];
    const hieuUngKizaru = [];
    const danhSachSoBayKZR = [];

    // 🌟 ĐỒNG BỘ THỜI GIAN HỒI CHIÊU CHUẨN PHÁP SƯ
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    window.tongSoChuNoi_KZR = 0;
    function taoSoSatThuongKZR(pos3D, satThuong, mauSac = '#ffcc00') {
        if (window.isMobile) return; 
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_KZR > 5) return;
        window.tongSoChuNoi_KZR++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #ff6600';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayKZR.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatKZR = function(viTriGoc) {
        let targetPos = null; let minD = 500; 
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minD) { minD = d; targetPos = hit.tamNguc; }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minD) { minD = d; targetPos = hit.tamNguc; }
                }
            });
        }
        return targetPos;
    };

    function gaySatThuongKZR(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongKZR(posHienSo, luongSatThuong, '#ffcc00');
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
                            taoSoSatThuongKZR(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongKZR(hit.tamNguc.clone(), luongSatThuong);
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

    window.thoiDiemNoCuoiCungKZR = window.thoiDiemNoCuoiCungKZR || 0;

    // 💥 HIỆU ỨNG NỔ ÁNH SÁNG (VÀNG RỰC RỠ)
    function taoVuNoAnhSangKZR(pos, isRemote = false, luongDame = 100, banKinh = 15) {
        if (isRemote === false) gaySatThuongKZR(pos, luongDame, banKinh);
        else if (typeof isRemote === 'number' && isRemote > 0) {
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, isRemote, banKinh);
        }

        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungKZR < 250) return; 
        window.thoiDiemNoCuoiCungKZR = bayGio;

        const soLuong = window.isMobile ? 10 : 80; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 10, Math.random() * 10, (Math.random() - 0.5) * 10));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        // Bùa chú Texture Tia Sáng Vàng
        if (!window.textureAnhSangMin) {
            let canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   // Lõi trắng
            gradient.addColorStop(0.2, 'rgba(255, 200, 0, 1)');   // Vàng chói
            gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)'); // Cam tỏa nhiệt
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
            window.textureAnhSangMin = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xffdd00, size: window.isMobile ? 5.0 : 8.0, map: window.textureAnhSangMin, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngKizaru.push({ system: pts, velocities: vels, life: 25, type: 'explosion' }); 
    }

    // ĐÚC TIA LAZER VÀNG CHÓI
    function taoTiaLazer(banKinh, doDai) {
        const group = new THREE.Group();
        const geoLoi = new THREE.CylinderGeometry(banKinh * 0.4, banKinh * 0.4, doDai, 8);
        geoLoi.rotateX(Math.PI / 2); // Bẻ nằm ngang
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending });
        const loi = new THREE.Mesh(geoLoi, matLoi);
        
        const geoVo = new THREE.CylinderGeometry(banKinh, banKinh, doDai, 8);
        geoVo.rotateX(Math.PI / 2);
        const matVo = new THREE.MeshBasicMaterial({ color: 0xffdd00, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
        const vo = new THREE.Mesh(geoVo, matVo);
        
        group.add(loi); group.add(vo);
        return group;
    }

    // ==========================================
    // ✨ TUNG CHIÊU KIZARU (BẮT ĐÚNG THỊT, TRỄ 0.5S)
    // ==========================================
    window.tungComboKizaru = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc && !isRemote) return;

        // 1. ÁP ANIMATION CHUẨN TỪ BLENDER CỦA SẾP
        let tenAnimMua = 'ATTACK1';
        if (phim === 'Q') tenAnimMua = 'ATTACK1';      
        else if (phim === 'E') tenAnimMua = 'ATTACK2'; 
        else if (phim === 'F') tenAnimMua = 'ATTACK3'; 
        else if (phim === 'R') tenAnimMua = 'ATTACK4'; 

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;

            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua);
        }

        let viTriGocToTam = new THREE.Vector3();
        let upVector = nvc ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); 
        if (nvc) { nvc.getWorldDirection(huongMat); huongMat.normalize(); }
        let mucTieu = null;

        if (isRemote) {
            viTriGocToTam = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            upVector = viTriGocToTam.clone().normalize(); 
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            viTriGocToTam = nvc.position.clone();
            viTriGocToTam.add(upVector.clone().multiplyScalar(4.0));
            
            let target = window.layMucTieuGanNhatKZR(viTriGocToTam);
            mucTieu = target ? target.clone() : viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(300));

            // BẮN SÓNG MẠNG TỰ ĐỘNG
            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Kizaru', 
                    origin: {x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z}, target: {x: mucTieu.x, y: mucTieu.y, z: mucTieu.z}, dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z}, weaponUrl: ""
                })), { reliable: true });
            }
        }

        const dameGoc = window.DAME_CUA_TOI || 100; // ĐỒNG BỘ DAME 100

        // =====================================
        // 2. HẸN GIỜ 0.5S SAU MỚI PHÓNG ÁNH SÁNG TỪ THỊT
        // =====================================
        setTimeout(() => {
            let viTriXuatChieu = viTriGocToTam.clone(); 
            
            // 🌟 MÁY DÒ THỊT (MESH TRACKER THEO TÊN BLENDER)
            let tenMeshCanTim = 'Object_28'; // Mặc định Q và R
            if (phim === 'E') tenMeshCanTim = 'Object_19';
            if (phim === 'F') tenMeshCanTim = 'Object_12';

            if (nvc) {
                let timThayThit = null;
                nvc.traverse(c => {
                    // Quét đúng cái tên Mesh Sếp chỉ định
                    if (c.isMesh && c.name === tenMeshCanTim) timThayThit = c;
                });
                if (timThayThit) {
                    timThayThit.getWorldPosition(viTriXuatChieu);
                }
            }

            if (phim === 'Q') {
                const tiaSang = taoTiaLazer(0.5, 6.0); // Nhỏ, Dài
                tiaSang.position.copy(viTriXuatChieu); 
                tiaSang.up.copy(upVector); 
                tiaSang.lookAt(mucTieu); scene.add(tiaSang); 
                
                kyNangKizaru.push({ mesh: tiaSang, type: 'Q', life: 40, speed: 20.0, targetPos: mucTieu, damage: dameGoc * 0.4, isRemote: isRemote, upVector: upVector.clone() });
            }
            else if (phim === 'E') {
                const luoiDao = taoTiaLazer(1.0, 10.0);
                luoiDao.scale.set(6, 0.2, 1); // 🌟 Bóp dẹt tia lazer thành hình Lưỡi Đao Cong
                luoiDao.position.copy(viTriXuatChieu); 
                luoiDao.up.copy(upVector); 
                luoiDao.lookAt(mucTieu); scene.add(luoiDao);
                
                kyNangKizaru.push({ mesh: luoiDao, type: 'E', life: 80, speed: 12.0, targetPos: mucTieu, damage: dameGoc * 0.6, isRemote: isRemote, upVector: upVector.clone() });
            }
            else if (phim === 'R') {
                // 🌟 Yasakani no Magatama: Bắn ra 8 tia sáng nhỏ tỏa ra xung quanh
                for(let i = 0; i < 8; i++) {
                    const tiaNho = taoTiaLazer(0.3, 4.0);
                    tiaNho.position.copy(viTriXuatChieu); 
                    tiaNho.up.copy(upVector); 
                    
                    // Phân tán mục tiêu ra một chút để quét diện rộng
                    let offset = new THREE.Vector3((Math.random() - 0.5)*15, (Math.random() - 0.5)*15, (Math.random() - 0.5)*15);
                    let targetLech = mucTieu.clone().add(offset);
                    
                    tiaNho.lookAt(targetLech); scene.add(tiaNho);
                    // Tổng dame 8 tia = 0.6 => Mỗi tia 0.075
                    kyNangKizaru.push({ mesh: tiaNho, type: 'R', life: 60, speed: 15.0, targetPos: targetLech, damage: dameGoc * 0.075, isRemote: isRemote, upVector: upVector.clone() });
                }
            }
            else if (phim === 'F') {
                const tiaBu = taoTiaLazer(3.0, 15.0); // Siêu to khổng lồ
                tiaBu.position.copy(viTriXuatChieu); 
                tiaBu.up.copy(upVector); 
                tiaBu.lookAt(mucTieu); scene.add(tiaBu);
                
                kyNangKizaru.push({ mesh: tiaBu, type: 'F', life: 100, speed: 18.0, targetPos: mucTieu, damage: dameGoc * 0.9, isRemote: isRemote, upVector: upVector.clone() });
            }
        }, 500); // ⏳ Trễ 0.5s cho Khỉ Vàng
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ KIZARU (ÁNH SÁNG BAY)
    // ==========================================
    window.updateCombatKizaru = function () {
        for (let i = kyNangKizaru.length - 1; i >= 0; i--) {
            let s = kyNangKizaru[i]; s.life--;

            if (s.type === 'Q' || s.type === 'R') {
                s.mesh.translateZ(s.speed);
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5 || s.life < 5) {
                    taoVuNoAnhSangKZR(s.targetPos, s.isRemote, Math.round(s.damage), s.type === 'Q' ? 5 : 8);
                    s.life = 0;
                }
            }
            else if (s.type === 'E') {
                s.mesh.translateZ(s.speed);
                s.mesh.scale.x += 0.1; // Lưỡi đao càng bay càng rộng ra
                
                if (s.targetPos) {
                    if (!s.isRemote) {
                        const mucTieuMoi = window.layMucTieuGanNhatKZR(s.mesh.position);
                        if (mucTieuMoi) s.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); dummy.up.copy(s.upVector); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.05); // Ôm cua nhẹ
                }
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5 || s.life < 5) {
                    taoVuNoAnhSangKZR(s.targetPos, s.isRemote, Math.round(s.damage), 15);
                    s.life = 0;
                }
            }
            else if (s.type === 'F') {
                s.mesh.translateZ(s.speed);
                s.mesh.scale.addScalar(0.05); // Phình to hủy diệt
                if (s.life % 2 === 0) taoVuNoAnhSangKZR(s.mesh.position, s.isRemote, 0, 0); // Văng tia lửa dọc đường
                
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 10 || s.life < 5) {
                    taoVuNoAnhSangKZR(s.targetPos, s.isRemote, Math.round(s.damage), 35); // Nổ hạt nhân
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangKizaru.splice(i, 1);
            }
        }

        // Hạt ánh sáng rơi rụng
        for (let i = hieuUngKizaru.length - 1; i >= 0; i--) {
            let h = hieuUngKizaru[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].y -= 0.2; // Rơi chậm hơn nước
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 25;

            if (h.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(h.system); else scene.remove(h.system);
                hieuUngKizaru.splice(i, 1);
            }
        }

        // Số bay
        for (let i = danhSachSoBayKZR.length - 1; i >= 0; i--) {
            let it = danhSachSoBayKZR[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayKZR.splice(i, 1); window.tongSoChuNoi_KZR--; }
        }
    };

    setInterval(window.updateCombatKizaru, 30);

    // ==========================================
    // 🌟 KHỞI TẠO BỘ TỪ ĐIỂN AI CHO KHỈ VÀNG
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('kizaru')) {
        window.HePhaiHienTai = {
            tenPhai: "Đô Đốc Kizaru",
            khoiTao: function () {
                console.log("⚡ Tốc độ ánh sáng! Đô Đốc Kizaru đã xuất chiến!");

                if (window.animationsMap) {
                    // Cài đặt cứng các di chuyển cơ bản
                    window.animationsMap['CHAYBO'] = window.animationsMap['CHAYBO']; // 23
                    window.animationsMap['BAY']    = window.animationsMap['BAY'];    // 18
                    window.animationsMap['HIT']    = window.animationsMap['PL_KIZARU_ORIG01_DAMAGE']; 
                    window.animationsMap['CHET']   = window.animationsMap['PL_KIZARU_ORIG01_LOSE_LP']; 
                }
            },
            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) {
                window.tungComboKizaru(phim, isRemote, origin, target, dir, casterId, weaponUrl);
            },
            capNhat: function () {
                // 🧠 BỘ NÃO AI: ĐẢO ANIMATION NHÀN RỖI NGẪU NHIÊN MỖI 5 GIÂY
                if (!window.dangMuaChieu && !window.isMoving && window.animationsMap) {
                    let bayGio = Date.now();
                    if (!window.lastIdleSwap || bayGio - window.lastIdleSwap > 5000) {
                        window.lastIdleSwap = bayGio;
                        
                        // Danh sách các tư thế Nhàn Rỗi Sếp đã chọn
                        let cacTheNhanRoi = ['NHANROI', 'NHANROI2', 'HOME', 'HOME2', 'HOME3'];
                        let chonBua = cacTheNhanRoi[Math.floor(Math.random() * cacTheNhanRoi.length)];
                        
                        // Tráo lõi trong Từ điển, để khi engine.js gọi chữ 'NHANROI', nó sẽ ra một dáng mới!
                        if (window.animationsMap[chonBua]) {
                            window.animationsMap['NHANROI'] = window.animationsMap[chonBua];
                            if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMapChar[chonBua];
                        }
                    }
                }
            } 
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
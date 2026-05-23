// ==========================================
// 🌊 HỆ THỐNG KỸ NĂNG ĐOẠT XÁ: JIMBEI (HẢI TẶC HỆ NƯỚC)
// ==========================================

(function () {
    const kyNangJimbei = [];
    const hieuUngJimbei = [];
    const danhSachSoBayJB = [];

    // 🌟 CẤU HÌNH THỜI GIAN HỒI CHIÊU (Miligiây)
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 4000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    window.tongSoChuNoi_JB = 0;
    function taoSoSatThuongJB(pos3D, satThuong, mauSac = '#00aaff') {
        if (window.isMobile) return; 
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_JB > 5) return;
        window.tongSoChuNoi_JB++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #0055aa';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayJB.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatJB = function(viTriGoc) {
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

    function gaySatThuongJB(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongJB(posHienSo, luongSatThuong, '#00ffff');
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
                            taoSoSatThuongJB(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongJB(hit.tamNguc.clone(), luongSatThuong);
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

    window.thoiDiemNoCuoiCungJB = window.thoiDiemNoCuoiCungJB || 0;

    // 💥 HIỆU ỨNG NỔ NƯỚC (Bắn văng các bọt nước li ti)
    function taoVuNoNuocJB(pos, isRemote = false, luongDame = 100, banKinh = 15) {
        if (isRemote === false) gaySatThuongJB(pos, luongDame, banKinh);
        else if (typeof isRemote === 'number' && isRemote > 0) {
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, isRemote, banKinh);
        }

        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungJB < 250) return; 
        window.thoiDiemNoCuoiCungJB = bayGio;

        const soLuong = window.isMobile ? 10 : 100; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 8, (Math.random() - 0.5) * 8));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        const mat = new THREE.PointsMaterial({ color: 0x00aaff, size: 5.0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
        const pts = new THREE.Points(geo, mat); scene.add(pts);
        
        hieuUngJimbei.push({ system: pts, velocities: vels, life: 30, type: 'explosion' }); 
    }

    // ĐÚC QUẢ CẦU NƯỚC XANH LÈ
    function taoCauNuoc(banKinh, colorHex) {
        const geo = new THREE.SphereGeometry(banKinh, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
        return new THREE.Mesh(geo, mat);
    }


// ==========================================
    // 🌊 TUNG CHIÊU JIMBEI (CHUẨN LORE ONE PIECE)
    // ==========================================
    window.tungComboJimbei = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc && !isRemote) return;

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;

            if (typeof window.ViTriComboJimbei === 'undefined') {
                window.DanhSachComboJimbei = [
                    'PL_JINBE_ORIG01_COMBO_A', 'PL_JINBE_ORIG01_COMBO_B', 'PL_JINBE_ORIG01_COMBO_C',
                    'PL_JINBE_ORIG01_SKILL_A', 'PL_JINBE_ORIG01_SKILL_B'
                ];
                window.ViTriComboJimbei = 0;
            }

            let tenAnimMua = window.DanhSachComboJimbei[window.ViTriComboJimbei];
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua);

            window.ViTriComboJimbei++;
            if (window.ViTriComboJimbei >= window.DanhSachComboJimbei.length) window.ViTriComboJimbei = 0;
        }

        let viTriGoc, huongMat, mucTieu, upVector;
        const dameGoc = window.DAME_CUA_TOI || 150;

        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            upVector = viTriGoc.clone().normalize();
        } else {
            viTriGoc = nvc.position.clone();
            upVector = nvc.up.clone().normalize(); 
            viTriGoc.add(upVector.clone().multiplyScalar(4.0)); 

            huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            
            let target = window.layMucTieuGanNhatJB(viTriGoc);
            mucTieu = target ? target.clone() : viTriGoc.clone().add(huongMat.clone().multiplyScalar(300));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Jimbei', 
                    origin: {x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z}, target: {x: mucTieu.x, y: mucTieu.y, z: mucTieu.z}, dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z},
                    weaponUrl: ""
                })), { reliable: true });
            }
        }

        if (phim === 'Q') {
            // Q: Đường Thảo Ngõa Chính Quyền (Sóng xung kích chém gió)
            const vienNuoc = taoCauNuoc(2.0, 0x66ccff);
            vienNuoc.scale.set(3, 0.2, 0.5); // Ép dẹp thành hình lưỡi kiếm sóng âm
            vienNuoc.position.copy(viTriGoc); vienNuoc.lookAt(mucTieu); scene.add(vienNuoc); 
            kyNangJimbei.push({ mesh: vienNuoc, type: 'Q', life: 40, speed: 12.0, targetPos: mucTieu, damage: dameGoc * 0.4, isRemote: isRemote });
        }
        else if (phim === 'E') {
            // E: Hải Lưu Thương Ba (Phóng lao nước đâm xuyên)
            const muiLao = new THREE.Group();
            const thanLao = taoCauNuoc(1.5, 0x0055ff);
            thanLao.scale.set(1, 1, 6); // Kéo dài thành mũi lao
            muiLao.add(thanLao);
            muiLao.position.copy(viTriGoc); muiLao.lookAt(mucTieu); scene.add(muiLao);
            kyNangJimbei.push({ mesh: muiLao, type: 'E', life: 80, speed: 10.0, targetPos: mucTieu, damage: dameGoc * 0.7, isRemote: isRemote });
        }
        else if (phim === 'R') {
            // R: Hải Lưu Ném Qua Vai (Lốc xoáy nước nhiều tầng)
            const rGroup = new THREE.Group();
            rGroup.position.copy(viTriGoc); rGroup.lookAt(mucTieu); scene.add(rGroup);
            for(let i=0; i<4; i++) {
                const nuoc = taoCauNuoc(2.5, 0x0088ff);
                const goc = (i / 4) * Math.PI * 2;
                nuoc.position.set(Math.cos(goc)*4, Math.sin(goc)*4, 0);
                rGroup.add(nuoc);
            }
            kyNangJimbei.push({ mesh: rGroup, type: 'R', life: 120, speed: 6.0, targetPos: mucTieu, damage: dameGoc * 1.2, isRemote: isRemote });
        }
        else if (phim === 'F') {
            // F: Gyojin Karate Ogi: BURAIKAN (Tuyệt kĩ Vũ Lại Quán)
            const buraikan = taoCauNuoc(6.0, 0x00ffff);
            buraikan.position.copy(viTriGoc); 
            buraikan.lookAt(mucTieu);
            scene.add(buraikan);
            kyNangJimbei.push({ mesh: buraikan, type: 'F', life: 100, speed: 15.0, targetPos: mucTieu, damage: dameGoc * 3.5, isRemote: isRemote });
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU (JIMBEI)
    // ==========================================
    window.updateCombatJimbei = function() {
        for (let i = kyNangJimbei.length - 1; i >= 0; i--) {
            let s = kyNangJimbei[i]; s.life--;

            if (s.type === 'Q') {
                s.mesh.translateZ(s.speed);
                // Sóng Q bay cực nhanh, sát thương thẳng mặt
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5 || s.life < 5) {
                    taoVuNoNuocJB(s.targetPos, s.isRemote, Math.round(s.damage), 10);
                    s.life = 0;
                }
            }
            else if (s.type === 'E') {
                s.mesh.translateZ(s.speed);
                // Lao nước có tầm nhiệt nhẹ
                if (s.targetPos) {
                    if (!s.isRemote) {
                        const mucTieuMoi = window.layMucTieuGanNhatJB(s.mesh.position);
                        if (mucTieuMoi) s.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.1);
                }
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5 || s.life < 5) {
                    taoVuNoNuocJB(s.targetPos, s.isRemote, Math.round(s.damage), 15);
                    s.life = 0;
                }
            }
            else if (s.type === 'R') {
                s.mesh.rotateZ(0.6); // Lốc xoáy quay tít thò lò
                s.mesh.translateZ(s.speed);
                if (s.targetPos) {
                    if (!s.isRemote) {
                        const mucTieuMoi = window.layMucTieuGanNhatJB(s.mesh.position);
                        if (mucTieuMoi) s.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.05);
                }
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 10 || s.life < 5) {
                    taoVuNoNuocJB(s.targetPos, s.isRemote, Math.round(s.damage), 25);
                    s.life = 0;
                }
            }
            else if (s.type === 'F') {
                // Buraikan: Chưởng lực khổng lồ bắn thẳng tới trước, ngày càng bành trướng
                s.mesh.translateZ(s.speed);
                s.mesh.scale.addScalar(0.04); // Phình to ra theo thời gian
                
                // Rớt hạt nước dọc đường đi để tạo vệt đuôi đẹp mắt
                if (s.life % 2 === 0) taoVuNoNuocJB(s.mesh.position, s.isRemote, 0, 0); 
                
                let dist = s.mesh.position.distanceTo(s.targetPos);
                if (dist < s.speed + 10 || s.life < 5) {
                    taoVuNoNuocJB(s.targetPos, s.isRemote, Math.round(s.damage), 50); // Nổ siêu to 50m
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangJimbei.splice(i, 1);
            }
        }

        // --- CẬP NHẬT HIỆU ỨNG HẠT NƯỚC VĂNG TUNG TÓE ---
        for (let i = hieuUngJimbei.length - 1; i >= 0; i--) {
            let h = hieuUngJimbei[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].y -= 0.5; // Trọng lực: Nước rơi rất nhanh
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 30;

            if (h.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(h.system); else scene.remove(h.system);
                hieuUngJimbei.splice(i, 1);
            }
        }

        // --- CẬP NHẬT CHỮ NỔI SÁT THƯƠNG ---
        for (let i = danhSachSoBayJB.length - 1; i >= 0; i--) {
            let it = danhSachSoBayJB[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`;
                it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayJB.splice(i, 1); window.tongSoChuNoi_JB--; }
        }
    };


    // 🌟 KẾT NỐI VÀO VÒNG LẶP TOÀN CẦU MÁY CHỦ
    setInterval(window.updateCombatJimbei, 30);

    // ==========================================
    // 🌟 ĐĂNG KÝ HỆ PHÁI CHO ENGINE ĐỌC (BẢN GỌN NHẸ CHUẨN AAA)
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('jimbei')) {
        window.HePhaiHienTai = {
            tenPhai: "Hải Hiệp Jimbei",
            khoiTao: function () {
                console.log("🌊 Hải Hiệp Jimbei đã xuất chiến!");

                // 🌟 TỪ ĐIỂN DỊCH THUẬT: Ép Engine hiểu tiếng của Jimbei
                // Giúp Engine biết Jimbei dùng xương nào để Chạy, Nhảy, Nằm sấp
                if (window.animationsMap) {
                    window.animationsMap['NHANROI'] = window.animationsMap['PL_JINBE_ORIG01_IDLE_A'];
                    window.animationsMap['CHAYBO'] = window.animationsMap['PL_JINBE_ORIG01_RUN'];
                    window.animationsMap['BAY'] = window.animationsMap['PL_JINBE_ORIG01_JUMP'];
                    window.animationsMap['CHET'] = window.animationsMap['PL_JINBE_ORIG01_LOSE'];
                    window.animationsMap['HIT'] = window.animationsMap['PL_JINBE_ORIG01_DAMAGE'];
                }
            },
            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) {
                window.tungComboJimbei(phim, isRemote, origin, target, dir, casterId, weaponUrl);
            },
            capNhat: function () { } // Hiệu ứng nước đã chạy ngầm rồi
        };
        window.HePhaiHienTai.khoiTao();
    }
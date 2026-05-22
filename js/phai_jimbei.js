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
    // 🌊 TUNG CHIÊU JIMBEI
    // ==========================================
    window.tungComboJimbei = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc && !isRemote) return;

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;
            
            // Ép múa chiêu: Gọi ATTACK chung vì Jimbei có thể xài bộ xương khác
            if (typeof window.playAnim === 'function') window.playAnim('ATTACK');
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
            viTriGoc.add(upVector.clone().multiplyScalar(4.0)); // Bắn từ ngực/tay

            huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            
            let target = window.layMucTieuGanNhatJB(viTriGoc);
            mucTieu = target ? target.clone() : viTriGoc.clone().add(huongMat.clone().multiplyScalar(300));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Jimbei', // Đặt tên className để mạng phân biệt
                    origin: {x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z}, target: {x: mucTieu.x, y: mucTieu.y, z: mucTieu.z}, dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z},
                    weaponUrl: ""
                })), { reliable: true });
            }
        }

        if (phim === 'Q') {
            // Q: Bắn Thủy Đạn (Giọt nước bay siêu tốc)
            const vienNuoc = taoCauNuoc(1.5, 0x00ffff);
            vienNuoc.position.copy(viTriGoc); scene.add(vienNuoc); 
            kyNangJimbei.push({ mesh: vienNuoc, type: 'Q', life: 60, speed: 8.0, targetPos: mucTieu, damage: dameGoc * 0.2, isRemote: isRemote });
        }
        else if (phim === 'E') {
            // E: Thủy Pháo (Đại bác nước bự)
            const bomNuoc = taoCauNuoc(4.0, 0x0088ff);
            bomNuoc.position.copy(viTriGoc); scene.add(bomNuoc);
            kyNangJimbei.push({ mesh: bomNuoc, type: 'E', life: 100, speed: 5.0, targetPos: mucTieu, damage: dameGoc * 0.5, isRemote: isRemote });
        }
        else if (phim === 'R') {
            // R: Hải Lưu Ném Qua Vai (Bắn ra 3 luồng nước xoắn ốc)
            const rGroup = new THREE.Group();
            rGroup.position.copy(viTriGoc); rGroup.lookAt(mucTieu); scene.add(rGroup);
            for(let i=0; i<3; i++) {
                const nuoc = taoCauNuoc(2.0, 0x0055ff);
                const goc = (i / 3) * Math.PI * 2;
                nuoc.position.set(Math.cos(goc)*3, Math.sin(goc)*3, 0);
                rGroup.add(nuoc);
            }
            kyNangJimbei.push({ mesh: rGroup, type: 'R', life: 150, speed: 4.0, ticks: 0, targetPos: mucTieu, damage: dameGoc * 0.8, isRemote: isRemote });
        }
        else if (phim === 'F') {
            // F: Cơn Thịnh Nộ Của Đại Dương (Quả cầu nước siêu khổng lồ rớt từ trên cao)
            const tsunami = taoCauNuoc(15.0, 0x00ffff);
            
            // Xuất hiện từ trên trời cao (cách 80 mét)
            let startPos = mucTieu.clone().add(upVector.clone().multiplyScalar(80));
            tsunami.position.copy(startPos); 
            
            // Xoay mặt nhìn thẳng xuống mục tiêu
            let qMatDat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), upVector.clone().negate());
            tsunami.quaternion.copy(qMatDat);

            scene.add(tsunami);
            kyNangJimbei.push({ mesh: tsunami, type: 'F', life: 200, speed: 6.0, targetPos: mucTieu, damage: dameGoc * 2.0, isRemote: isRemote, upV: upVector });
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU (JIMBEI)
    // ==========================================
    window.updateCombatJimbei = function() {
        for (let i = kyNangJimbei.length - 1; i >= 0; i--) {
            let s = kyNangJimbei[i]; s.life--;

            if (s.type === 'Q' || s.type === 'E') {
                s.mesh.translateZ(s.speed);
                // Radar tầm nhiệt đuổi theo kẻ địch
                if (s.targetPos) {
                    if (!s.isRemote) {
                        const mucTieuMoi = window.layMucTieuGanNhatJB(s.mesh.position);
                        if (mucTieuMoi) s.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.1);
                }

                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5 || s.life < 5) {
                    taoVuNoNuocJB(s.targetPos, s.isRemote, Math.round(s.damage), s.type==='Q'?5:15);
                    s.life = 0;
                }
            }
            else if (s.type === 'R') {
                s.mesh.rotateZ(0.3); // Luồng nước xoáy tít thò lò
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
                // Đại cầu nước giáng từ trên cao xuống
                s.mesh.translateZ(s.speed);
                // Phình to dần tạo áp lực
                s.mesh.scale.addScalar(0.05);
                
                let dist = s.mesh.position.distanceTo(s.targetPos);
                if (dist < s.speed + 5 || s.mesh.position.dot(s.upV) < s.targetPos.dot(s.upV)) {
                    taoVuNoNuocJB(s.targetPos, s.isRemote, Math.round(s.damage), 40); // Nổ to tướng 40m
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
    // 🌟 ĐĂNG KÝ HỆ PHÁI CHO ENGINE ĐỌC
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('jimbei')) {
        window.HePhaiHienTai = {
            tenPhai: "Hải Tặc Nước",
            khoiTao: function () {
                console.log("🌊 Bộ Kỹ Năng Hệ Nước Đã Đoạt Xá Thành Công!");
            }, 
            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) { 
                window.tungComboJimbei(phim, isRemote, origin, target, dir, casterId, weaponUrl); 
            },
            capNhat: function () {} 
        };
        window.HePhaiHienTai.khoiTao();
    }

})();
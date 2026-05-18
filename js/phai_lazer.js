// ==========================================
// 🌟 HỆ THỐNG KỸ NĂNG: LAZER ÁNH SÁNG (BẢN CHUẨN V31 - FIX LẬT NGƯỜI & LỆCH TÂM)
// ==========================================

(function() {
    const kyNangLazer = [];
    const hieuUngLazer = [];
    const danhSachSoBayLZ = [];
// ⏳ BỘ ĐẾM THỜI GIAN HỒI CHIÊU (Ms)
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };
    // Âm thanh
    const amThanhQ = new Audio('https://actions.google.com/sounds/v1/science_fiction/laser_blast.ogg');
    const amThanhR = new Audio('https://actions.google.com/sounds/v1/science_fiction/sci_fi_laser_huge.ogg');

    function phatAmThanh(loai) {
        try {
            let a = (loai === 'R') ? amThanhR.cloneNode() : amThanhQ.cloneNode();
            a.volume = 0.4; a.play().catch(e => {});
        } catch(e) {}
    }

    // ==========================================
    // 🩸 LÕI SÁT THƯƠNG & HIỆU ỨNG
    // ==========================================




    window.tongSoChuNoi_LZ = 0;
    function taoSoSatThuongLZ(pos3D, satThuong, mauSac = '#00ffff') {
        if (window.isMobile) return; // 🌟 CỨU SỐNG CPU MOBILE!
        if(satThuong <= 0) return;
        // 🌟 KHÓA VAN MOBILE
        if (window.isMobile && window.tongSoChuNoi_LZ > 5) return;
        window.tongSoChuNoi_LZ++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayLZ.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }












    function gaySatThuongLZ(tamNo, luongSatThuong, banKinh) {
        // Ép dẹt tâm nổ xuống mặt đất để đo chuẩn xác đường đạn Lazer
        let tamNo2D = new THREE.Vector3(tamNo.x, 0, tamNo.z);

        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    let pos2D = new THREE.Vector3(hit.tamNguc.x, 0, hit.tamNguc.z); 
                    if (tamNo2D.distanceTo(pos2D) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongLZ(posHienSo, luongSatThuong, '#ffaa00');
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    let pos2D = new THREE.Vector3(hit.tamNguc.x, 0, hit.tamNguc.z); 
                    if (tamNo2D.distanceTo(pos2D) <= (banKinh + hit.banKinh)) {
                        if (quai.isBoss) {
                            taoSoSatThuongLZ(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongLZ(hit.tamNguc.clone(), luongSatThuong);
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











    window.thoiDiemNoCuoiCungLZ = window.thoiDiemNoCuoiCungLZ || 0;

function taoVuNoLZ(pos, isRemote = false, luongDame = 100, banKinh = 15) {
    // 1. TÍNH DAME (LUÔN CHẠY)
    if (isRemote === false) gaySatThuongLZ(pos, luongDame, banKinh);
    else if (typeof isRemote === 'number' && isRemote > 0) {
        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, isRemote, banKinh);
    }

    // 2. VAN CHỐNG LAG ĐỒ HỌA
    let bayGio = Date.now();
    if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungLZ < 250) {
        return; 
    }
    window.thoiDiemNoCuoiCungLZ = bayGio;

    // 3. VẼ ĐỒ HỌA
    const soLuong = window.isMobile ? 5 : 60; // Mobile chỉ 5 hạt ánh sáng là đủ lóe mắt rồi
    const geo = new THREE.BufferGeometry();

    const posArr = new Float32Array(soLuong * 3); const vels = [];
    for (let i = 0; i < soLuong; i++) {
        posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
        vels.push(new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 5, (Math.random() - 0.5) * 5));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const mat = new THREE.PointsMaterial({ color: 0x00ffff, size: 4.0, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
    const pts = new THREE.Points(geo, mat); scene.add(pts);
    hieuUngLazer.push({ system: pts, velocities: vels, life: 20, type: 'explosion' }); 
}
    






    // ==========================================
    // 🛠️ RADAR & MÔ HÌNH
    // ==========================================
    function taoTiaLazerLienTuc(startPos, endPos, radius, colorHex) {
        const group = new THREE.Group();
        const path = new THREE.LineCurve3(startPos, endPos);
        const geoLoi = new THREE.TubeGeometry(path, 1, radius * 0.4, 8, false);
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0 });
        const loi = new THREE.Mesh(geoLoi, matLoi);
        const geoVo = new THREE.TubeGeometry(path, 1, radius, 8, false);
        const matVo = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
        const vo = new THREE.Mesh(geoVo, matVo);
        group.add(loi); group.add(vo);
        return group;
    }






    window.layMucTieuGanNhatLZ = function(viTriGoc, huongMat) {
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
        
        if (targetPos) return targetPos;
        // Nếu không bắt được ai, bắn Lazer mù thẳng ra phía trước mặt
        return viTriGoc.clone().add(huongMat.clone().multiplyScalar(200));
    };






    // ==========================================
    // 🏹 TUNG CHIÊU (ĐÃ FIX LỖI SPAM LIÊN TỤC VÀ KHÓA HỒI CHIÊU)
    // ==========================================
    window.tungComboLazer = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc && !isRemote) return;

        // 🛑 BỘ KHÓA HỒI CHIÊU (Chống Spam lủng Server)
        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return; // Chưa hồi xong thì cấm bắn!
            choHoiChieu[phim] = bayGio; // Chốt thời gian vừa xả skill
        }



   
        // Gọi thẳng tên chiêu, Engine sẽ tự biết cách tìm hoặc dùng hàng dự phòng!
        if (!isRemote && typeof window.playAnim === 'function') window.playAnim('CHIEU' + phim);





        let viTriGoc, huongMat, mucTieu, upVector;
        const dameGoc = window.DAME_CUA_TOI || 100;
        
        // ... (Giữ nguyên toàn bộ phần lấy tọa độ và xuất chiêu Q E R F bên dưới) ...




        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            upVector = viTriGoc.clone().normalize(); // Lấy trục hình cầu
        } else {
            viTriGoc = new THREE.Vector3();
            upVector = nvc.up.clone().normalize(); // 🌟 Lấy độ dốc địa hình
            
            // 🌟 THUẬT TOÁN TÌM XƯƠNG ĐẦU/MẮT (MIXAMO)
            let xuongDau = null;
            nvc.traverse((child) => {
                if (child.isBone) {
                    let ten = child.name.toLowerCase();
                    // Ưu tiên tìm Mắt trước, nếu không có thì lấy Đầu (Head)
                    if (ten.includes('eye') || ten === 'mixamorighead') {
                        xuongDau = child;
                    }
                }
            });

            if (xuongDau) {
                // Nếu tìm thấy, lấy tọa độ tuyệt đối của con mắt/đỉnh đầu
                xuongDau.getWorldPosition(viTriGoc);
            } else {
                // Kế hoạch dự phòng nếu model dị dạng không có xương đầu
                viTriGoc.copy(nvc.position).add(upVector.clone().multiplyScalar(3.5));
            }

            huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            
            let target = window.layMucTieuGanNhatLZ(viTriGoc, huongMat);
            mucTieu = target.clone();

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Lazer',
                    origin: {x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z}, target: {x: mucTieu.x, y: mucTieu.y, z: mucTieu.z}, dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z},
                    weaponUrl: window.WEAPON_URL
                })), { reliable: true });
            }
        }

        if (phim === 'Q') {
            phatAmThanh('Q');
            const tiaQ = taoTiaLazerLienTuc(viTriGoc, mucTieu, 0.5, 0x00ffff);
            scene.add(tiaQ); 
            taoVuNoLZ(mucTieu, isRemote, dameGoc * 0.4, 5); // Dame chuẩn
            kyNangLazer.push({ mesh: tiaQ, type: 'TIA', life: 40 }); 
        }
        else if (phim === 'E') {
            phatAmThanh('Q');
            const eGroup = new THREE.Group();
            const tiaChinh = taoTiaLazerLienTuc(viTriGoc, mucTieu, 0.4, 0xff00ff);
            eGroup.add(tiaChinh); 
            taoVuNoLZ(mucTieu, isRemote, dameGoc * 0.2, 5); // Tia chính 0.2

            // 🌟 VẬT LÝ KHÔNG GIAN: Dùng upVector thay vì (0,1,0) để tính toán 4 tia phụ không bị lệch
            const vecRight = new THREE.Vector3().crossVectors(huongMat, upVector).normalize().multiplyScalar(1.5);
            const vecUp = upVector.clone().multiplyScalar(1.5);
            
            const cacDiemDich = [
                mucTieu.clone().add(vecRight).add(vecUp), 
                mucTieu.clone().sub(vecRight).add(vecUp), 
                mucTieu.clone().add(vecRight).sub(vecUp), 
                mucTieu.clone().sub(vecRight).sub(vecUp)
            ];

            cacDiemDich.forEach(dich => {
                const tia = taoTiaLazerLienTuc(viTriGoc, dich, 0.2, 0xff00ff);
                eGroup.add(tia); 
                taoVuNoLZ(dich, isRemote, dameGoc * 0.1, 5); // 4 Tia phụ mỗi tia 0.1
            });
            scene.add(eGroup); kyNangLazer.push({ mesh: eGroup, type: 'TIA', life: 50 });
        }
        else if (phim === 'R') {
            phatAmThanh('R');
            const tiaR = taoTiaLazerLienTuc(viTriGoc, mucTieu, 3.0, 0xff0000); 
            scene.add(tiaR); 
            taoVuNoLZ(mucTieu, isRemote, dameGoc * 0.5, 20); // Dame 0.5 + Bán kính to
            kyNangLazer.push({ mesh: tiaR, type: 'TIA', life: 70 });
        }
        else if (phim === 'F') {
            const geo = new THREE.BoxGeometry(1, 1, 1);
            const edges = new THREE.EdgesGeometry(geo);
            const mat = new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
            const box = new THREE.LineSegments(edges, mat);
            box.position.copy(mucTieu); 
            
            // 🌟 VẬT LÝ KHÔNG GIAN: Ép hộp song song với bề mặt trái đất
            let qMatDat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);
            box.quaternion.copy(qMatDat);

            box.scale.set(60, 60, 60); scene.add(box);
            kyNangLazer.push({ mesh: box, type: 'LAP_PHUONG', life: 250, targetPos: mucTieu, damage: dameGoc * 1.0, isRemote: isRemote });
        }
    };







    

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU
    // ==========================================
    window.updateCombatLazer = function() {
     

    // ... (Code cũ giữ nguyên) ...
        // ==========================================
        // 🌟 CẬP NHẬT KỸ NĂNG LAZER (BẢN VÁ LÒ ĐỐT RÁC V37)
        // ==========================================
        for (let i = kyNangLazer.length - 1; i >= 0; i--) {
            let s = kyNangLazer[i]; s.life--;

            if (s.type === 'TIA') {
                s.mesh.traverse(c => { if (c.isMesh && c.material) c.material.opacity *= 0.95; });
                if (s.life <= 0) {
                    // 🌟 ĐỐT TIA LAZER
                    if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                    kyNangLazer.splice(i, 1);
                }
            }
            else if (s.type === 'LAP_PHUONG') {
                s.mesh.rotation.y += 0.05; s.mesh.rotation.x += 0.02;
                s.mesh.scale.subScalar(0.5);
                if (s.mesh.scale.x <= 1.0) {
                    taoVuNoLZ(s.targetPos, s.isRemote, s.damage, 30);
                    // 🌟 ĐỐT KHỐI LẬP PHƯƠNG MA TRẬN
                    if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                    kyNangLazer.splice(i, 1);
                }
            }
        }

        // ==========================================
        // 🗑️ CẬP NHẬT HIỆU ỨNG HẠT (ĐÃ FIX TRÀN RAM 100%)
        // ==========================================
        for (let i = hieuUngLazer.length - 1; i >= 0; i--) {
            let h = hieuUngLazer[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].y -= 0.1; // Trọng lực cho hạt rơi xuống
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 25;

            if (h.life <= 0) {
                // 🌟 QUĂNG HỆ THỐNG HẠT ÁNH SÁNG VÀO LÒ ĐỐT RÁC VRAM
                if (typeof window.donRac3D === 'function') {
                    window.donRac3D(h.system);
                } else {
                    scene.remove(h.system);
                }
                hieuUngLazer.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayLZ.length - 1; i >= 0; i--) {
            let it = danhSachSoBayLZ[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`;
                it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayLZ.splice(i, 1); window.tongSoChuNoi_LZ--; } // 🌟 Xả van


        }
    };

    setInterval(window.updateCombatLazer, 30);

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_lazer')) {
        window.HePhaiHienTai = {
            tenPhai: "Lazer Ánh Sáng",
            khoiTao: function () {}, 
            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) { 
                window.tungComboLazer(phim, isRemote, origin, target, dir, casterId, weaponUrl); 
            },
            capNhat: function () {} 
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
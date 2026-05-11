// ==========================================
// 🔮 HỆ THỐNG KỸ NĂNG: PHÁP SƯ TỐI THƯỢNG (BẢN V29 - FULL TỐI ƯU & CHỐNG RÁC)
// ==========================================
(function () {
    const kyNangPhapSu = [];
    const danhSachSoBayPS = [];
    let vongPhepModel = null;
    let isVongPhepSetup = false;

    // 🌟 1. CẤU HÌNH THỜI GIAN HỒI CHIÊU (Miligiây)
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    

    // ==========================================
    // 🩸 LÕI SÁT THƯƠNG & HIỆU ỨNG ĐỘC LẬP
    // ==========================================
    function taoSoSatThuongPS(pos3D, satThuong, mauSac = '#00ffff') {
        if (satThuong <= 0) return;
        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:0px 0px 10px #000, 2px 2px 0px #000; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayPS.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    

    function taoVuNoPS(pos, isRemote, luongDame, banKinh, mauHex) {
        if (typeof window.taoHieuUngNo === 'function') {
            window.taoHieuUngNo(pos, banKinh * 0.5, mauHex);
        }
        if (isRemote === false) gaySatThuongPS(pos, luongDame, banKinh);
        else if (typeof isRemote === 'number' && isRemote > 0) {
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, isRemote, banKinh);
        }
    }




    function taoVongPhepXin(mauSac, scaleSize, isUpright = false) {
        const group = new THREE.Group();
        
        // 🌟 BẢN VÁ: ÉP MÁY CỦA PHÁI KHÁC CŨNG PHẢI TẢI VÒNG PHÉP BẰNG HÀM TẢI ĐỘNG!
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset('uploads/anims/vong_phep.glb', (v) => {
                v.rotation.x = Math.PI / 2;
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        c.material = c.material.clone();
                        c.material.color.setHex(mauSac);
                        c.material.emissive = new THREE.Color(mauSac);
                        c.material.emissiveIntensity = 2.0;
                        c.material.transparent = true;
                        c.material.opacity = 0.9;
                        c.material.blending = THREE.AdditiveBlending;
                        c.material.depthWrite = false;
                    }
                });
                group.add(v);
            });
        }
        
        if (!isUpright) group.rotation.x = -Math.PI / 2;
        group.scale.set(scaleSize, scaleSize, scaleSize);
        return group;
    }





    



    window.layMucTieuGanNhatPS = function(viTriGoc) {
        let targetPos = null; let minD = 500; // Tầm nhìn Pháp Sư
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

    function gaySatThuongPS(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongPS(posHienSo, luongSatThuong, '#ffaa00');
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
                            taoSoSatThuongPS(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongPS(hit.tamNguc.clone(), luongSatThuong);
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
    // 🏹 TUNG CHIÊU MẠNG (ĐÃ CÂN BẰNG CHỈ SỐ & VẬT LÝ HÌNH CẦU)
    // ==========================================
    window.tungComboPhapSu = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        if (!window.playerModel && !isRemote) return;

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua('CHIEU' + phim);
        }



        let viTriGoc, huongMat, mucTieu, upVector;
        const dameGoc = window.DAME_CUA_TOI || 100;

        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            upVector = viTriGoc.clone().normalize(); 
        } else {
            viTriGoc = new THREE.Vector3();
            upVector = window.playerModel.up.clone().normalize(); // 🌟 Trục 'Lên Trời' động
            
            if (window.vongPhepHoThe) window.vongPhepHoThe.getWorldPosition(viTriGoc);
            else { viTriGoc.copy(window.playerModel.position); viTriGoc.add(upVector.clone().multiplyScalar(5)); }
            
            huongMat = new THREE.Vector3(); window.playerModel.getWorldDirection(huongMat); huongMat.normalize();
            
            let target = window.layMucTieuGanNhatPS(viTriGoc);
            mucTieu = target ? target.clone() : viTriGoc.clone().add(huongMat.clone().multiplyScalar(50));
        }

        // 🌟 BẢN VÁ: TẠO QUATERNION 'NẰM NGANG' SONG SONG SƯỜN ĐỒI
        // Ta dùng trục Z làm pháp tuyến cho vòng phép (phía trước) và ép nó trùng với upVector.
        // Điều này đảm bảo vòng phép nằm song song với mặt phẳng của map cầu.
        let qNamNgangMatDat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), upVector);

        if (phim === 'Q') {
            const vongQ = taoVongPhepXin(0x00ffff, 8, true); 
            vongQ.position.copy(viTriGoc); 
            vongQ.up.copy(upVector); 
            // 🛑 Chiêu Q vẫn là chiêu "dựng đứng" và lookAt mục tiêu để bắn đi (giữ nguyên)
            vongQ.lookAt(mucTieu); 
            scene.add(vongQ);
            kyNangPhapSu.push({ mesh: vongQ, type: 'Q', life: 150, targetPos: mucTieu, damage: dameGoc * 0.4, speed: 2.0, isRemote: isRemote, upV: upVector });
        }
        else if (phim === 'E') {
            const vongE = taoVongPhepXin(0xff00ff, 20, false); 
            // 🌟 NẰM NGANG VÀ GIÁNG TỪ TRÊN CAO 15M XUỐNG
            vongE.position.copy(mucTieu).add(upVector.clone().multiplyScalar(15));
            // Ép tư thế nằm ngang song song mặt đất
            vongE.quaternion.copy(qNamNgangMatDat); 
            scene.add(vongE);
            kyNangPhapSu.push({ mesh: vongE, type: 'E', state: 'GIANG_XUONG', life: 250, targetPos: mucTieu, damage: dameGoc * 0.6, isRemote: isRemote, upV: upVector });
        }
        else if (phim === 'R') {
            // 2 vòng 2 màu: Tren (Màu Tím của E), Duoi (Màu Xanh của Q)
            const vongTren = taoVongPhepXin(0xff00ff, 25, false); // Màu Tím
            const vongDuoi = taoVongPhepXin(0x00ffff, 25, false); // Màu Xanh

            // 🌟 NẰM NGANG VÀ GỌI TỪ TRÊN/DƯỚI
            vongTren.position.copy(mucTieu).add(upVector.clone().multiplyScalar(15));
            vongDuoi.position.copy(mucTieu).sub(upVector.clone().multiplyScalar(5)); // Dưới đất giáng lên
            
            // Ép cả 2 nằm ngang song song mặt đất
            vongTren.quaternion.copy(qNamNgangMatDat); 
            vongDuoi.quaternion.copy(qNamNgangMatDat);
            
            scene.add(vongTren); scene.add(vongDuoi);
            // swapCount: dùng để đếm số lần đổi vị trí 3 lần
            kyNangPhapSu.push({ mesh: vongTren, meshBot: vongDuoi, type: 'R', ticks: 0, swapCount: 0, life: 400, targetPos: mucTieu, damage: dameGoc * 0.5, isRemote: isRemote, upV: upVector });
        }
        else if (phim === 'F') {
            const box = new THREE.Group(); 
            box.position.copy(mucTieu).add(upVector.clone().multiplyScalar(10));
            box.quaternion.copy(qNamNgangMatDat);
            
            // 🌟 TĂNG KÍCH THƯỚC HỘP (s = 35) VÀ OFFSET ĐỂ KHÔNG LỒNG NHAU
            const s = 35; const color = 0xff0000;
            const mat = [
                { pos: [0, 0, s / 2], rot: [0, 0, 0] }, 
                { pos: [0, 0, -s / 2], rot: [0, Math.PI, 0] }, 
                { pos: [s / 2, 0, 0], rot: [0, Math.PI / 2, 0] }, 
                { pos: [-s / 2, 0, 0], rot: [0, -Math.PI / 2, 0] }, 
                { pos: [0, s / 2, 0], rot: [-Math.PI / 2, 0, 0] }, 
                { pos: [0, -s / 2, 0], rot: [Math.PI / 2, 0, 0] }
            ];
            mat.forEach(m => { 
                let v = taoVongPhepXin(color, s, true); 
                v.position.set(...m.pos); v.rotation.set(...m.rot); 
                box.add(v); 
            });
            scene.add(box);
            kyNangPhapSu.push({ mesh: box, type: 'F', ticks: 0, life: 300, targetPos: mucTieu, damage: dameGoc * 1.0, isRemote: isRemote, upV: upVector });
        }
    };









    // ==========================================
    // 🚀 VÒNG LẶP VẬT LÝ TOÀN CẦU (ĐÃ THOÁT KHỎI LỒNG)
    // ==========================================
    window.updateCombatPhapSu = function () {
     

    if (!isVongPhepSetup && vongPhepModel && window.playerModel) {
        // ... (Code cũ giữ nguyên) ...
            window.vongPhepHoThe = vongPhepModel.clone();
            window.vongPhepHoThe.traverse(c => {
                if (c.isMesh && c.material) {
                    c.material = c.material.clone(); c.material.color.setHex(0xffaa00);
                    c.material.emissive = new THREE.Color(0xffaa00); c.material.emissiveIntensity = 1.0;
                    c.material.transparent = true; c.material.blending = THREE.AdditiveBlending; c.material.depthWrite = false;
                }
            });
            scene.add(window.vongPhepHoThe);
            window.vongPhepHoThe.scale.set(0.1, 0.1, 0.1); 
            window.gocXoayVongPhep = 0; window.gocTuXoayVongPhep = 0; isVongPhepSetup = true;
        }

        if (isVongPhepSetup && window.vongPhepHoThe && window.playerModel) {
            window.gocXoayVongPhep += 0.05; window.gocTuXoayVongPhep += 0.1;
            const banKinh = 2.5; const pos = new THREE.Vector3(); window.playerModel.getWorldPosition(pos);
            const up = window.playerModel.up.clone().normalize(); pos.add(up.clone().multiplyScalar(2.0));
            const right = new THREE.Vector3().crossVectors(up, new THREE.Vector3(0, 0, 1)).normalize();
            if (right.lengthSq() < 0.1) right.crossVectors(up, new THREE.Vector3(1, 0, 0)).normalize();
            const fwd = new THREE.Vector3().crossVectors(right, up).normalize();
            pos.add(right.multiplyScalar(Math.cos(window.gocXoayVongPhep) * banKinh)).add(fwd.multiplyScalar(Math.sin(window.gocXoayVongPhep) * banKinh));
            window.vongPhepHoThe.position.copy(pos);
            window.vongPhepHoThe.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up));
            window.vongPhepHoThe.rotateX(Math.PI / 2); window.vongPhepHoThe.rotateZ(window.gocTuXoayVongPhep);
        }




        for (let i = kyNangPhapSu.length - 1; i >= 0; i--) {
            let s = kyNangPhapSu[i]; s.life--;



            if (s.type === 'Q') {
                s.speed *= 1.05; 
                s.mesh.translateZ(s.speed); 
                s.mesh.children.forEach(c => c.rotation.y += 0.3);
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5) {
                    s.life = 0; taoVuNoPS(s.targetPos, s.isRemote, s.damage, 10, 0x00ffff);
                }
            }
            else if (s.type === 'E') {
                s.mesh.children.forEach(c => c.rotation.y += 0.2);
                // 🌟 Giáng từ trên cao xuống người chơi
                s.mesh.position.sub(s.upV.clone().multiplyScalar(0.4)); 
                let dist = s.mesh.position.distanceTo(s.targetPos);
                if (dist < 1 || s.mesh.position.dot(s.upV) < s.targetPos.dot(s.upV)) {
                    s.life = 0; taoVuNoPS(s.targetPos, s.isRemote, s.damage, 15, 0xff00ff);
                }
            }
            else if (s.type === 'R') {
                s.ticks += 0.05; // Tốc độ di chuyển giữa 2 vòng
                s.mesh.children.forEach(c => c.rotation.y += 0.2);
                s.meshBot.children.forEach(c => c.rotation.y -= 0.2);
                
                // 🌟 LOGIC XUYÊN NHAU 3 LẦN: Dùng hàm Cos để đảo vị trí cực mượt
                let offset = Math.cos(s.ticks * 3) * 15; // Biên độ 15m
                s.mesh.position.copy(s.targetPos).add(s.upV.clone().multiplyScalar(offset));
                s.meshBot.position.copy(s.targetPos).sub(s.upV.clone().multiplyScalar(offset));
                
                if (s.ticks > Math.PI * 1.5) { // Sau khoảng 3 lần đổi vị trí
                    s.life = 0; taoVuNoPS(s.targetPos, s.isRemote, s.damage, 25, 0xffaa00);
                }
            }
            else if (s.type === 'F') {
                // 🌟 Xoay khối lập phương khổng lồ cực đẹp
                s.mesh.rotation.y += 0.03; 
                s.mesh.rotation.z += 0.02;
                s.mesh.children.forEach(v => v.children.forEach(c => c.rotation.y += 0.15));
                if (++s.ticks > 150) { 
                    s.life = 0; taoVuNoPS(s.targetPos, s.isRemote, s.damage, 30, 0xff0000); 
                }
            }






            if (s.life <= 0) { window.donRac3D(s.mesh); if (s.meshBot) window.donRac3D(s.meshBot); kyNangPhapSu.splice(i, 1); }
        }






        for (let i = danhSachSoBayPS.length - 1; i >= 0; i--) {
            let it = danhSachSoBayPS[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) { it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`; it.el.style.opacity = it.life / 60; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayPS.splice(i, 1); }
        }
    };

    // 🌟 CHẠY NGẦM LIÊN TỤC TRÊN MÁY TẤT CẢ MỌI NGƯỜI
    setInterval(window.updateCombatPhapSu, 30);

    // ==========================================
    // ĐĂNG KÝ HỆ PHÁI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_phapsu')) {
        window.HePhaiHienTai = {
            tenPhai: "Pháp Sư",
            khoiTao: function () {
                const l = new THREE.GLTFLoader(); if (window.loaderSieuToc) l.setDRACOLoader(window.loaderSieuToc);
                l.load('uploads/anims/vong_phep.glb', (gltf) => { vongPhepModel = gltf.scene; });
            },
            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) { 
                window.tungComboPhapSu(phim, isRemote, origin, target, dir, casterId, weaponUrl); 
            },
            capNhat: function () {} // Đã chạy ngầm, không cần gọi đúp nữa
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
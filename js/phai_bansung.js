// ==========================================
// 🔫 HỆ THỐNG KỸ NĂNG: XẠ THỦ (BẢN CHUẨN V31 - RADAR X-QUANG & ĐỒNG BỘ ĐẠN ĐẠO)
// ==========================================

(function () {
    const kyNangBanSung = [];
    const hieuUngBanSung = [];
    const danhSachSoBayBS = [];

    // 🌟 CẤU HÌNH THỜI GIAN HỒI CHIÊU (Miligiây)
    const THOI_GIAN_HOI = { 'Q': 500, 'E': 4000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    

    // ==========================================
    // 🩸 LÕI SÁT THƯƠNG (BẢN VÁ: HITBOX HÌNH TRỤ 2D BỎ QUA TRỤC Y)
    // ==========================================
    function taoSoSatThuongBS(pos3D, satThuong, mauSac = '#ff2222') {
        if (satThuong <= 0) return;
        const div = document.createElement('div');
        div.innerText = "-" + satThuong;
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:0px 0px 10px #000, 2px 2px 0px #000; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayBS.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }







    window.layMucTieuGanNhatBS = function(viTriGoc) {
        let targetPos = null; let minD = 400; 
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





     // 🌟 ĐÃ ĐỒNG BỘ: SÁT THƯƠNG QUÉT HITBOX 3D CHUẨN X-QUANG
    function gaySatThuongBS(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= banKinh) {
                        taoSoSatThuongBS(hit.tamNguc.clone().add(new THREE.Vector3(0,hit.chieuCao/2,0)), luongSatThuong, '#ffaa00');
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, hit.tamNguc.clone());
                    }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= banKinh) {
                        if (quai.isBoss) {
                            taoSoSatThuongBS(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongBS(hit.tamNguc.clone(), luongSatThuong);
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








    function taoVuNoBS(pos, isRemote = false, luongDame = 100, banKinh = 15) {
        if (isRemote === false) gaySatThuongBS(pos, luongDame, banKinh);
        else if (typeof isRemote === 'number' && isRemote > 0) {
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, isRemote, banKinh);
        }
    }














    function taoSaoBangBS(pos, dir) {
        // Tắt tia lửa bay phía sau để không làm rối mắt
        return;
    }





    // ==========================================
    // 🛠️ TẠO VỤ KHÍ & ĐẠN ĐỒNG BỘ MẠNG TỐI ĐA
    // ==========================================
    // TẠI FILE: phai_bansung.js
    // TÁC DỤNG: Đúc viên đạn chuẩn xác, có lõi sáng vạch đường đạn (Tracer) bao rõ!



    function taoVienDanXin(scaleSize) {
        const group = new THREE.Group();

        // 🌟 TẠO LÕI SÁNG (VẠCH ĐƯỜNG ĐẠN) CHỐNG TÀNG HÌNH 100%
        const geoLoi = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
        geoLoi.rotateX(Math.PI / 2); // Chĩa thẳng về phía trước (+Z)
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.9 });
        const loi = new THREE.Mesh(geoLoi, matLoi);
        group.add(loi);

        let urlCanTai = window.VIENDAN_URL || 'uploads/anims/VIENDAN.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                // 🌟 FIX ĐÚNG GÓC -Y CỦA BLENDER NHƯ SẾP CHỈ ĐẠO
                // Xoay -90 độ (-Math.PI/2) quanh trục X để nắn cái mỏ -Y chĩa thẳng ra phía trước (+Z)
                v.rotation.set(-Math.PI / 2, 0, 4);
                
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        try { 
                            if (!Array.isArray(c.material)) {
                                c.material = c.material.clone();
                                c.material.emissive = new THREE.Color(0xffff00);
                                c.material.emissiveIntensity = 2.0;
                            }
                        } catch (e) { }
                    }
                });
                group.add(v);
            });
        }
        group.scale.set(scaleSize, scaleSize, scaleSize);
        return group;
    }







    function taoHoaTienXin(scaleSize) {
        const group = new THREE.Group();
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset('uploads/anims/rocket.glb', (r) => {
                r.rotation.y = Math.PI;
                group.add(r);
            });
        }
        group.scale.set(scaleSize, scaleSize, scaleSize);
        return group;
    }












    function taoMayBayXin(scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = window.MAYBAY_URL || 'uploads/anims/phico.glb';
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (f) => {
                group.add(f);
            });
        }
        group.scale.set(scaleSize, scaleSize, scaleSize);
        return group;
    }

    

    function timTamCumQuaiDongNhat(tamClick, banKinhTimKiem, banKinhCum) {
        if (!window.danhSachQuaiVat || window.danhSachQuaiVat.length === 0) return tamClick;
        let quaiGan = window.danhSachQuaiVat.filter(q => !q.isDead && q.mesh && q.mesh.position.distanceTo(tamClick) < banKinhTimKiem);
        if (quaiGan.length === 0) return tamClick; if (quaiGan.length === 1) return quaiGan[0].mesh.position.clone();
        let maxCount = 0; let bestCenter = quaiGan[0].mesh.position.clone();
        for (let i = 0; i < quaiGan.length; i++) {
            let centerCandidate = quaiGan[i].mesh.position; let count = 0; let sumPos = new THREE.Vector3();
            for (let j = 0; j < quaiGan.length; j++) {
                if (quaiGan[j].mesh.position.distanceTo(centerCandidate) <= banKinhCum) { count++; sumPos.add(quaiGan[j].mesh.position); }
            }
            if (count > maxCount) { maxCount = count; bestCenter = sumPos.divideScalar(count); }
        }
        return bestCenter;
    }

    // ==========================================
    // 🏹 TUNG CHIÊU
    // ==========================================
    window.tungComboBanSung = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc && !isRemote) return;

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;
            if (typeof window.playAnim === 'function' && phim !== 'Q') window.playAnim('ATTACK');


            // Bật vũ khí khi bắn
            if (window.vuKhiModel) {
                window.vuKhiModel.visible = true;
                if (window.vuKhiModel.hideTimeout) clearTimeout(window.vuKhiModel.hideTimeout);
                window.vuKhiModel.hideTimeout = setTimeout(() => {
                    if (window.vuKhiModel) window.vuKhiModel.visible = false;
                }, 1500); // 1.5 giây sau tự động cất súng
            }
        }

        let viTriGoc, huongMat, mucTieu;
        const dameGoc = window.DAME_CUA_TOI || 120;

        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            viTriGoc = nvc.position.clone(); viTriGoc.y += 3.5;
            huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            let target = window.layMucTieuGanNhatBS(viTriGoc);
            mucTieu = target ? target.clone() : viTriGoc.clone().add(huongMat.clone().multiplyScalar(100));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'BanSung',
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z },
                    weaponUrl: window.WEAPON_URL
                })), { reliable: true });
            }
        }







        // --- CHIÊU Q: BẮN ĐẠN THƯỜNG ---
        if (phim === 'Q') {
            const dan = taoVienDanXin(1.5); // 🌟 ĐÃ GỠ weaponUrl (KHÔNG BẮN RA SÚNG NỮA)
            let offset = new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 0);
            dan.position.copy(viTriGoc).add(offset); dan.lookAt(mucTieu); scene.add(dan);
            kyNangBanSung.push({ mesh: dan, type: 'Q', speed: 15.0, life: 100, targetPos: mucTieu, damage: dameGoc * 0.1, isRemote: isRemote });
        }
        // --- CHIÊU E: TÊN LỬA TỎA RA ---
        else if (phim === 'E') {
            for (let i = 0; i < 5; i++) {
                const hoaTien = taoHoaTienXin(3.0);
                let lech = new THREE.Vector3().crossVectors(huongMat, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar((i - 2) * 2);
                hoaTien.position.copy(viTriGoc.clone().add(lech)); hoaTien.lookAt(mucTieu); scene.add(hoaTien);
                kyNangBanSung.push({ mesh: hoaTien, type: 'E', speed: 0.5, life: 200, targetPos: mucTieu, damage: dameGoc, delay: i * 5, isRemote: isRemote });
            }
        }
        // --- CHIÊU R: SẤY ĐẠN LIÊN THANH TỪ TRÊN XUỐNG ---
        else if (phim === 'R') {
            for (let i = 0; i < 40; i++) {
                const dan = taoVienDanXin(2.0); // 🌟 ĐÃ GỠ weaponUrl
                let rx = mucTieu.x + (Math.random() - 0.5) * 40; let rz = mucTieu.z + (Math.random() - 0.5) * 40;
                let startPos = new THREE.Vector3(rx, mucTieu.y + 80 + Math.random() * 30, rz);
                let endPos = new THREE.Vector3(rx, mucTieu.y, rz);
                dan.position.copy(startPos); dan.lookAt(endPos); scene.add(dan);
                kyNangBanSung.push({ mesh: dan, type: 'R', speed: 6.0, life: 150, targetPos: endPos, damage: dameGoc * 0.8, delay: Math.random() * 30, isRemote: isRemote });
            }
        }



        




        
        // --- CHIÊU F: GỌI MÁY BAY KAMIKAZE ---
        else if (phim === 'F') {
            let tamCumQuai = timTamCumQuaiDongNhat(mucTieu, 100, 30);
            const jet = taoMayBayXin(8.0);

            // Xuất phát từ sau lưng 100m, cao 30m
            const startPos = viTriGoc.clone().add(new THREE.Vector3(0, 30, 0)).sub(huongMat.clone().multiplyScalar(100));
            jet.position.copy(startPos);

            const flyToPos = tamCumQuai.clone().add(new THREE.Vector3(0, 30, 0));
            jet.lookAt(flyToPos);
            scene.add(jet);

            kyNangBanSung.push({
                mesh: jet, type: 'F_JET', state: 'BAY_TOI',
                speed: 3.5, life: 800, targetPos: tamCumQuai, targetAltitude: 0,
                damage: dameGoc * 10, isRemote: isRemote
            });
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU
    // ==========================================
    window.updateCombatBanSung = function () {



        for (let i = kyNangBanSung.length - 1; i >= 0; i--) {
            let skill = kyNangBanSung[i];
            if (skill.delay > 0) { skill.delay--; continue; }
            skill.life--;



            // 🌟 ĐÃ ĐỒNG BỘ: TRỌNG LỰC TÂM VŨ TRỤ
            let lucHutTam = skill.mesh.position.clone().normalize();





            if (skill.type === 'Q' || skill.type === 'R') {
                skill.mesh.translateZ(skill.speed);
                if (skill.targetPos && skill.mesh.position.distanceTo(skill.targetPos) < skill.speed + 3 || skill.life < 5) {
                    taoVuNoBS(skill.targetPos, skill.isRemote, skill.damage, skill.type === 'R' ? 10 : 2);
                    skill.life = 0;
                }
            }
            else if (skill.type === 'E') {
                skill.speed *= 1.05; if (skill.speed > 8.0) skill.speed = 8.0;

                // Tầm nhiệt (Homing) rượt mục tiêu
                if (skill.targetPos) {
                    if (!skill.isRemote) {
                        const fwd = new THREE.Vector3(); skill.mesh.getWorldDirection(fwd);
                        const mucTieuMoi = window.layMucTieuGanNhatBS(skill.mesh.position, fwd);
                        if (mucTieuMoi) skill.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(skill.mesh.position); dummy.lookAt(skill.targetPos);
                    skill.mesh.quaternion.slerp(dummy.quaternion, 0.15);
                }

                skill.mesh.translateZ(skill.speed);

                if (skill.targetPos && skill.mesh.position.distanceTo(skill.targetPos) < skill.speed + 4 || skill.life < 5) {
                    taoVuNoBS(skill.targetPos, skill.isRemote, skill.damage, 15);
                    skill.life = 0;
                }
            }




            else if (skill.type === 'F_JET') {
                let khoangCachDenTam = skill.mesh.position.distanceTo(skill.targetPos);
                
                if (skill.state === 'BAY_TOI') {
                    skill.mesh.translateZ(skill.speed);
                    if (khoangCachDenTam < 80) {
                        skill.state = 'BAY_LEN_CAO';
                        // Định vị điểm cao nhất cách mặt đất 150m dựa theo vector up
                        skill.targetAltitudePos = skill.mesh.position.clone().add(lucHutTam.clone().multiplyScalar(150));
                    }
                }
                else if (skill.state === 'BAY_LEN_CAO') {
                    skill.speed *= 1.05;
                    skill.mesh.translateZ(skill.speed);
                    if (skill.mesh.rotation.x > -Math.PI / 2.5) { skill.mesh.rotateX(-0.06); }
                    if (skill.mesh.position.distanceTo(skill.targetAltitudePos) < 10) { skill.state = 'DAM_XUONG'; }
                }
                else if (skill.state === 'DAM_XUONG') {
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(skill.mesh.position);
                    dummy.lookAt(skill.targetPos);
                    skill.mesh.quaternion.slerp(dummy.quaternion, 0.15);

                    skill.speed *= 1.1;
                    if (skill.speed > 15.0) skill.speed = 15.0;

                    skill.mesh.translateZ(skill.speed);

                    // Nổ khi chạm mục tiêu (chuẩn mặt cầu)
                    if (khoangCachDenTam < skill.speed + 5) {
                        taoVuNoBS(skill.targetPos, skill.isRemote, skill.damage, 50);
                        if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(skill.targetPos, 25, 0xff5500);
                        skill.life = 0;
                    }
                }
            }






            if (skill.life <= 0) {
                // 🌟 SỬ DỤNG LÒ ĐỐT RÁC TOÀN CẦU (ĐÃ FIX TRÀN RAM)
                if (typeof window.donRac3D === 'function') {
                    window.donRac3D(skill.mesh);
                } else {
                    scene.remove(skill.mesh);
                }
                kyNangBanSung.splice(i, 1);
            }
        }





        // 🌟 MÁY HÚT BỤI VRAM CHO HIỆU ỨNG XẠ THỦ
        for (let i = hieuUngBanSung.length - 1; i >= 0; i--) {
            let h = hieuUngBanSung[i]; h.life--;

            if (h.system) {
                if (h.system.geometry && h.system.geometry.attributes.position) {
                    let posArr = h.system.geometry.attributes.position.array;
                    for (let j = 0; j < posArr.length / 3; j++) {
                        if (h.velocities && h.velocities[j]) {
                            posArr[j * 3] += h.velocities[j].x;
                            posArr[j * 3 + 1] += h.velocities[j].y;
                            posArr[j * 3 + 2] += h.velocities[j].z;
                        }
                    }
                    h.system.geometry.attributes.position.needsUpdate = true;
                }
                if (h.system.material) h.system.material.opacity = h.life / 20;
            }

            if (h.life <= 0) {
                if (typeof window.donRac3D === 'function') {
                    if (h.system) window.donRac3D(h.system);
                    if (h.mesh) window.donRac3D(h.mesh);
                }
                hieuUngBanSung.splice(i, 1);
            }
        }

        
        for (let i = danhSachSoBayBS.length - 1; i >= 0; i--) {
            let item = danhSachSoBayBS[i]; item.offsetY += 0.05; item.life--;
            const screenPos = item.pos.clone(); screenPos.y += item.offsetY; screenPos.project(camera);
            if (screenPos.z < 1) {
                item.el.style.left = `${(screenPos.x * 0.5 + 0.5) * window.innerWidth}px`;
                item.el.style.top = `${(screenPos.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { item.el.style.display = 'none'; }
            if (item.life < 20) item.el.style.opacity = item.life / 20;
            if (item.life <= 0) { item.el.remove(); danhSachSoBayBS.splice(i, 1); }
        }
    };

    // 🌟 CHẠY NGẦM LIÊN TỤC ĐỂ MÁY PHÁI KHÁC CŨNG QUÉT RÁC ĐƯỢC
    setInterval(window.updateCombatBanSung, 30);

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_bansung')) {
        window.HePhaiHienTai = {
            tenPhai: "Xạ Thủ",



            // 🌟 ĐÃ ĐỒNG BỘ: CẦM VŨ KHÍ TAY TRÁI VÀ TỰ ĐỘNG SCALE
            khoiTao: function () {
                console.log("🔫 Xạ Thủ Sẵn Sàng (Bản V32 - Đã Đồng Bộ)!");
                const l = new THREE.GLTFLoader();
                if (window.loaderSieuToc) l.setDRACOLoader(window.loaderSieuToc);

                l.load(window.WEAPON_URL || 'uploads/anims/GUN.glb', (gltf) => {
                    window.vuKhiModel = gltf.scene;
                    
                    // Đo lường kích thước súng tự động
                    const box = new THREE.Box3().setFromObject(window.vuKhiModel);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scaleFactor = 1.0 / maxDim; // Ép về chuẩn 1 mét
                    window.vuKhiModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    if (typeof playerModel !== 'undefined' && playerModel) {
                        let tayTrai = null;
                        playerModel.traverse(c => {
                            // Dò xương tay trái
                            if (c.isBone && (c.name.toLowerCase().includes('hand_l') || c.name.toLowerCase().includes('lefthand') || c.name.toLowerCase().includes('hand.l'))) {
                                tayTrai = c;
                            }
                        });

                        if (tayTrai) {
                            tayTrai.add(window.vuKhiModel);
                            window.vuKhiModel.position.set(0, 0, 0);
                            window.vuKhiModel.rotation.set(0, 0, 0);
                        } else {
                            playerModel.add(window.vuKhiModel);
                            window.vuKhiModel.position.set(-1, 3, 0); 
                        }
                    }
                    // Mặc định tàng hình súng, chỉ hiện khi bắn
                    window.vuKhiModel.visible = false;
                });
            },



            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) {
                window.tungComboBanSung(phim, isRemote, origin, target, dir, casterId, weaponUrl);
            },
            phongThu: function () { },
            capNhat: function () { } // Đã chạy ngầm, để rỗng để chống chạy 2 lần
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
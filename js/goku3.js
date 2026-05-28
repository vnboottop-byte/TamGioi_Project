// ==========================================
// 🐉 HỆ THỐNG KỸ NĂNG: GOKU (SIÊU SAIYAN)
// 👑 V7: GENKI DAMA TẦM NHIỆT (Homing Missile) - Đánh là chắc chắn trúng!
// ==========================================

(function () {
    const kyNangGoku = [];
    const hieuUngGoku = [];
    const danhSachSoBayGK = [];

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

    window.layViTriTayGoku = function(nvc, fallbackHuong) {
        let tayPos = new THREE.Vector3();
        let obj31 = null;
        
        if (nvc) {
            if (nvc.userData && nvc.userData.object31) {
                obj31 = nvc.userData.object31;
            } else {
                nvc.traverse((child) => {
                    if (child.name === 'Object_31' || child.name.includes('Object_31')) {
                        obj31 = child;
                        if (!nvc.userData) nvc.userData = {};
                        nvc.userData.object31 = child; 
                    }
                });
            }
        }
        
        if (obj31) {
            obj31.getWorldPosition(tayPos);
        } else {
            if (nvc) nvc.getWorldPosition(tayPos);
            tayPos.y += 5;
            if (fallbackHuong) tayPos.add(fallbackHuong.clone().multiplyScalar(2));
        }
        return tayPos;
    };

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

    function taoTiaKamehameha(radius, colorHex) {
        const group = new THREE.Group();
        const geoLoi = new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, 1, 16);
        geoLoi.rotateX(Math.PI / 2); 
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
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungGK < 300) return; 
        window.thoiDiemNoCuoiCungGK = bayGio;
        
        if (typeof window.phatAmThanh === 'function') window.phatAmThanh('uploads/anims/hit.mp3', 0.5);

        const vfxGroup = new THREE.Group();
        vfxGroup.position.copy(pos);

        // --- LỚP 1: HẠT NĂNG LƯỢNG MỊN ---
        const soLuong = window.isMobile ? 10 : 300; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = 0; posArr[i*3+1] = 0; posArr[i*3+2] = 0;
            let dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            let speed = 2 + Math.random() * 8;
            vels.push(dir.multiplyScalar(speed));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        // Dùng chung Texture Lửa siêu mịn của hệ thống
        const texture = (typeof window.layTextureLua === 'function') ? window.layTextureLua() : null;
        const mat = new THREE.PointsMaterial({
            color: colorHex, size: window.isMobile ? 18.0 : 12.0, map: texture, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); 
        vfxGroup.add(pts);

        // --- LỚP 2: SÓNG XUNG KÍCH MẶT ĐẤT ---
        const geoSong = new THREE.RingGeometry(0.1, 2, 32);
        const matSong = new THREE.MeshBasicMaterial({
            color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const songXungKich = new THREE.Mesh(geoSong, matSong);
        
        let upV = (typeof window.playerModel !== 'undefined' && window.playerModel) ? window.playerModel.up.clone() : new THREE.Vector3(0,1,0);
        songXungKich.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upV);
        songXungKich.position.add(upV.clone().multiplyScalar(0.5)); 
        vfxGroup.add(songXungKich);

        scene.add(vfxGroup);
        hieuUngGoku.push({ group: vfxGroup, pts: pts, velocities: vels, songXungKich: songXungKich, life: window.isMobile ? 30 : 60, maxScale: banKinh }); 
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
        let targetQuaiGlobal = null; 
        const dameGoc = window.DAME_CUA_TOI || 100;

        if (isRemote) {
            viTriGoc.set(remoteGoc.x, remoteGoc.y, remoteGoc.z); 
            huongMat.set(remoteHuong.x, remoteHuong.y, remoteHuong.z); 
            mucTieuGoc.set(remoteDich.x, remoteDich.y, remoteDich.z); 
        } else {
            nvc.getWorldPosition(viTriGoc); 
            nvc.getWorldDirection(huongMat); huongMat.normalize();
            
            targetQuaiGlobal = window.layMucTieuGanNhatGK(viTriGoc);
            if (targetQuaiGlobal && targetQuaiGlobal.mesh) {
                let hit = window.layHitbox(targetQuaiGlobal.mesh);
                mucTieuGoc = hit.tamNguc.clone();
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

        function hackKhoaEngine(tenChieu, thoiGian) {
            if (!isRemote) {
                if (typeof window.kichHoatKhiencAnimation === 'function') window.kichHoatKhiencAnimation(thoiGian);
                window.dangMuaChieu = true; 
                window.thoiDiemBatDauMua = Date.now(); 
                if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenChieu);
            }
        }

        // =====================================
        // Q: BẮN 1 QUẢ CẦU
        // =====================================
        if (phim === 'Q') {
            hackKhoaEngine('ATTACK', 1000);
            
            let tayPos = window.layViTriTayGoku(nvc, huongMat);
            let cauQ = taoCauAnhSang(2.0, 0xffcc00);
            cauQ.position.copy(tayPos);
            cauQ.lookAt(mucTieuGoc);
            scene.add(cauQ);
            
            kyNangGoku.push({ mesh: cauQ, type: 'CAU_THUONG', speed: 10.0, life: 100, targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.5, isRemote: isRemote });
        }
        
        // =====================================
        // E: KAMEHAMEHA 1 GIÂY
        // =====================================
        else if (phim === 'E') {
            hackKhoaEngine('ATTACKhold', 1500);

            let tiaE = taoTiaKamehameha(3.0, 0x00ffff); 
            scene.add(tiaE);
            
            kyNangGoku.push({ mesh: tiaE, type: 'TIA_KAME', life: 30, owner: nvc, targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.15, isRemote: isRemote, color: 0x00ffff });
        }

        // =====================================
        // R: ĐẠI KAMEHAMEHA 2 GIÂY 
        // =====================================
        else if (phim === 'R') {
            hackKhoaEngine('ATTACKhold', 2500);

            let tiaR = taoTiaKamehameha(5.0, 0xff0000); 
            scene.add(tiaR);
            
            kyNangGoku.push({ mesh: tiaR, type: 'TIA_KAME', life: 60, owner: nvc, targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.2, isRemote: isRemote, color: 0xff0000 });
        }

        // =====================================
        // F: QUẢ CẦU KÊNH KHI TẦM NHIỆT (ĐÁNH LÀ CHẮC TRÚNG)
        // =====================================
        else if (phim === 'F') {
            // Bước 1: Khóa động tác tụ khí 1 giây
            hackKhoaEngine('ATTACKhold', 1500); 

            if (window.timeoutGoku_F) clearTimeout(window.timeoutGoku_F);

            // Bước 2: Đúng 1 giây sau (1000ms), quăng cầu
            window.timeoutGoku_F = setTimeout(() => {
                // Đổi dáng ném để khỏi đơ
                if (!isRemote && typeof window.epNhanVatMua === 'function') window.epNhanVatMua('ATTACK');

                let huongMoi = new THREE.Vector3(); nvc.getWorldDirection(huongMoi); huongMoi.normalize();
                let tayPosMoi = window.layViTriTayGoku(nvc, huongMoi);
                
                // 🛑 Sinh ra quả cầu TO LÙ LÙ ngay trước mặt (cách 5 mét)
                tayPosMoi.add(huongMoi.clone().multiplyScalar(5));

                let cauGenki = taoCauAnhSang(2.0, 0x00aaff); 
                cauGenki.scale.set(10, 10, 10); // Phóng to chà bá lửa ngay lập tức
                cauGenki.position.copy(tayPosMoi);
                cauGenki.lookAt(mucTieuGoc);
                scene.add(cauGenki);
                
                // 🛑 TRUYỀN `targetObj` ĐỂ NÓ KHÓA TẦM NHIỆT VÀO QUÁI
                kyNangGoku.push({ 
                    mesh: cauGenki, 
                    type: 'GENKI_DAMA_TAM_NHIET', 
                    speed: 6.0, 
                    life: 200, 
                    targetPos: mucTieuGoc.clone(), 
                    targetObj: targetQuaiGlobal, // Dùng để dò nhiệt
                    damage: dameGoc * 3.0, 
                    isRemote: isRemote 
                });

            }, 1000); // Đúng 1 giây sau tụ khí
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ GOKU
    // ==========================================
    window.updateCombatGoku = function () {
        for (let i = kyNangGoku.length - 1; i >= 0; i--) {
            let s = kyNangGoku[i]; 
            s.life--;

            if (s.type === 'CAU_THUONG') {
                s.mesh.translateZ(s.speed);
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 3) {
                    taoVuNoKame(s.mesh.position, 0xffcc00, 10);
                    if (!s.isRemote) gaySatThuongGK(s.mesh.position, s.damage, 10); 
                    s.life = 0;
                }
            }
            
            // 🌟 2. QUẢ CẦU KÊNH KHI TẦM NHIỆT (Homing Missile)
            else if (s.type === 'GENKI_DAMA_TAM_NHIET') {
                // 🛑 A. HỆ THỐNG DÒ NHIỆT BÁM ĐUỔI
                if (s.targetObj && !s.targetObj.isDead && s.targetObj.mesh) {
                    let hit = window.layHitbox(s.targetObj.mesh);
                    s.targetPos = hit.tamNguc.clone(); // Liên tục update tọa độ quái đang chạy
                } else if (!s.isRemote) {
                    // Nếu con quái mục tiêu vừa ngỏm, tự động radar dò tìm con khác gần nhất để ném tiếp!
                    let mucTieuMoi = window.layMucTieuGanNhatGK(s.mesh.position);
                    if (mucTieuMoi && mucTieuMoi.mesh) {
                        s.targetObj = mucTieuMoi;
                        let hit = window.layHitbox(mucTieuMoi.mesh);
                        s.targetPos = hit.tamNguc.clone();
                    }
                }

                // 🛑 B. BẺ LÁI QUẢ CẦU
                if (s.targetPos) {
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(s.mesh.position);
                    dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.15); // Bẻ lái êm ái như tên lửa
                }

                s.mesh.translateZ(s.speed); // Tiến về phía trước mặt (đã bẻ lái)
                
                // Phình to thêm tí nữa lúc bay cho ngầu
                if (s.mesh.scale.x < 30.0) { 
                    s.mesh.scale.addScalar(0.4); 
                }

                // Chạm mặt là NỔ tung xác
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 15) {
                    taoVuNoKame(s.mesh.position, 0x00aaff, 40);
                    if (!s.isRemote) gaySatThuongGK(s.mesh.position, s.damage, 40); 
                    s.life = 0;
                }
            }

            else if (s.type === 'TIA_KAME') {
                if (s.owner && s.owner.parent) {
                    let fwd = new THREE.Vector3(); s.owner.getWorldDirection(fwd);
                    
                    let startPos = window.layViTriTayGoku(s.owner, fwd);
                    
                    if (!s.isRemote) {
                        let mucTieuMoi = window.layMucTieuGanNhatGK(startPos);
                        if (mucTieuMoi && mucTieuMoi.mesh) {
                            let hit = window.layHitbox(mucTieuMoi.mesh);
                            s.targetPos = hit.tamNguc.clone();
                            let dummy = new THREE.Object3D(); dummy.position.copy(s.owner.position); dummy.lookAt(s.targetPos.x, s.owner.position.y, s.targetPos.z);
                            s.owner.quaternion.slerp(dummy.quaternion, 0.2);
                        }
                    }

                    let endPos = s.targetPos;
                    let dist = startPos.distanceTo(endPos);
                    if (dist < 1) dist = 1;

                    s.mesh.scale.z = dist; 
                    let midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
                    s.mesh.position.copy(midPoint);
                    s.mesh.lookAt(endPos);

                    if (s.life % 5 === 0) {
                        taoVuNoKame(endPos, s.color, 8);
                        if (!s.isRemote) gaySatThuongGK(endPos, s.damage, 8, (s.color === 0xff0000 ? '#ff0000' : '#00ffff'));
                    }
                } else {
                    s.life = 0; 
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangGoku.splice(i, 1);
            }
        }

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
    // 🌟 KHỞI TẠO BỘ TỪ ĐIỂN AI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('goku')) {
        window.HePhaiHienTai = {
            tenPhai: "Siêu Saiyan Goku",
            khoiTao: function () {
                console.log("🐉 Lõi Kamehameha kích hoạt: Genki Dama Tầm Nhiệt Bám Đuổi!");

                if (window.animationsMap) {
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK') || k.includes('JUMP') || k.includes('FALL')) {
                            if (window.animationsMap['BAY']) window.animationsMap[key] = window.animationsMap['BAY'];
                            else if (window.animationsMap['FLY']) window.animationsMap[key] = window.animationsMap['FLY'];
                        }
                    }
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
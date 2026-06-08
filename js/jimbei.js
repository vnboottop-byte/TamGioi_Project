// ==========================================
// 🌊 MÔN PHÁI ĐOẠT XÁ: HẢI HIỆP JIMBEI (MASTER FILE V2)
// 👑 CÔNG NGHỆ: INSTANT CAST + TRỌNG LỰC HÀNH TINH CHO NƯỚC + TỌA ĐỘ ĐỘNG
// ==========================================

(function () {
    const kyNangJimbei = [];
    const hieuUngJimbei = [];
    const danhSachSoBayJB = [];

    // 🌟 ĐÃ XÓA SẠCH GÔNG CÙM COOLDOWN CŨ (Để controller.js tự lo)
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

    // 💥 HIỆU ỨNG NỔ NƯỚC (CẬP NHẬT TRỌNG LỰC CẦU)
    function taoVuNoNuocJB(pos, isRemote = false, luongDame = 100, banKinh = 15, upVector = new THREE.Vector3(0, 1, 0)) {
        if (isRemote === false && luongDame > 0) gaySatThuongJB(pos, luongDame, banKinh);
        else if (typeof isRemote === 'number' && isRemote > 0) {
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, luongDame, banKinh);
        }

        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungJB < 250) return; 
        window.thoiDiemNoCuoiCungJB = bayGio;

        const soLuong = window.isMobile ? 10 : 100; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureNuocMin) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
            gradient.addColorStop(0.3, 'rgba(0, 170, 255, 0.8)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); 
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureNuocMin = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0x00ffff, size: window.isMobile ? 4.0 : 8.0, map: window.textureNuocMin, 
            transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngJimbei.push({ system: pts, velocities: vels, life: 30, upVector: upVector.clone() }); 
    }

    // 🌟 ĐÚC QUẢ CẦU NƯỚC (PROCEDURAL)
    function taoCauNuoc(banKinh, colorHex) {
        const geo = new THREE.SphereGeometry(banKinh, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
        return new THREE.Mesh(geo, mat);
    }

    // ==========================================
    // 🌊 TUNG CHIÊU JIMBEI (VÁ LỖI TỌA ĐỘ ĐỘNG & BỎ KHÓA COOLDOWN)
    // ==========================================
    window.tungComboJimbei = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        let tenAnimMua = 'PL_JINBE_ORIG01_COMBO_A';
        if (phim === 'Q') tenAnimMua = 'PL_JINBE_ORIG01_SKILL_B';      
        else if (phim === 'R') tenAnimMua = 'PL_JINBE_ORIG01_SKILL_A'; 
        else if (phim === 'E') tenAnimMua = 'PL_JINBE_ORIG01_COMBO_A'; 
        else if (phim === 'F') tenAnimMua = 'PL_JINBE_ORIG01_COMBO_B'; 

        // 🌟 BẤM LÀ MÚA NGAY LẬP TỨC (Không khóa dangMuaChieu, không xét THOI_GIAN_HOI)
        if (isRemote === false) {
            window.currentAnimName = '';
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua);
        }

        let viTriGocToTam = new THREE.Vector3();
        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); 
        
        // 🌟 ÉP PHẲNG VECTOR CHỐNG CẮM ĐẤT
        if (typeof camera !== 'undefined' && !isRemote) {
            camera.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
            if (huongMat.lengthSq() < 0.001) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
        } else {
            nvc.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
        }
        if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }

        let mucTieu = null;

        if (isRemote) {
            viTriGocToTam = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            upVector = viTriGocToTam.clone().normalize(); 
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(4.0)); 
            let targetRadar = window.layMucTieuGanNhatJB(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) {
                let hit = window.layHitbox(targetRadar.mesh);
                mucTieu = hit.tamNguc.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Jimbei', 
                    origin: {x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z}, 
                    target: {x: mucTieu.x, y: mucTieu.y, z: mucTieu.z}, 
                    dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z}, weaponUrl: ""
                })), { reliable: false });
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) dameGoc = window.remotePlayers[casterId].damage || 100;
        }

        // =====================================
        // 🌟 2. HẸN GIỜ ĐÚC CHIÊU VÀ LẤY LẠI TỌA ĐỘ ĐỘNG
        // =====================================
        let thoiGianSqueeze = (phim === 'Q' || phim === 'E') ? 200 : 400; // Chiêu nhỏ bắn nhanh hơn

        setTimeout(() => {
            // 🌟 VÁ LỖI 4: Vừa chạy vừa bắn mượt mà
            let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
            if (!curNvc) return;
            let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
            let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
            if (curDir.lengthSq() < 0.001) curDir.set(0, 0, 1).applyQuaternion(curNvc.quaternion).projectOnPlane(curUp).normalize();

            let viTriXuatChieu = curNvc.position.clone().add(curUp.clone().multiplyScalar(4.0)); 
            let xuongPhai = null; let xuongTrai = null;

            curNvc.traverse(c => {
                if (c.isBone) {
                    let n = c.name.toUpperCase();
                    if (n.includes('RHAND_PALM') || n.includes('HAND_R') || n.includes('RIGHTHAND')) xuongPhai = c;
                    if (n.includes('LHAND_PALM') || n.includes('HAND_L') || n.includes('LEFTHAND')) xuongTrai = c;
                }
            });

            let tayChon = (phim === 'E' || phim === 'R') ? (xuongTrai || xuongPhai) : xuongPhai; 
            if (tayChon) tayChon.getWorldPosition(viTriXuatChieu);

            let targetBay = mucTieu ? mucTieu.clone() : curNvc.position.clone().add(curDir.clone().multiplyScalar(150));

            // ĐÚC CHIÊU Q
            if (phim === 'Q') {
                const vienNuoc = taoCauNuoc(2.0, 0x66ccff);
                vienNuoc.scale.set(3, 0.2, 0.5); 
                vienNuoc.position.copy(viTriXuatChieu).add(curDir.clone().multiplyScalar(1.5));
                vienNuoc.up.copy(curUp); 
                vienNuoc.lookAt(targetBay); 
                scene.add(vienNuoc); 
                kyNangJimbei.push({ mesh: vienNuoc, type: 'Q', life: 40, speed: 12.0, targetPos: targetBay, damage: dameGoc * 0.4, isRemote: isRemote, upVector: curUp.clone() });
            }
            // ĐÚC CHIÊU E
            else if (phim === 'E') {
                const muiLao = new THREE.Group();
                const thanLao = taoCauNuoc(1.5, 0x0055ff);
                thanLao.scale.set(1, 1, 6); 
                muiLao.add(thanLao);
                muiLao.position.copy(viTriXuatChieu).add(curDir.clone().multiplyScalar(1.5));
                muiLao.up.copy(curUp); 
                muiLao.lookAt(targetBay); 
                scene.add(muiLao);
                kyNangJimbei.push({ mesh: muiLao, type: 'E', life: 80, speed: 10.0, targetPos: targetBay, damage: dameGoc * 0.6, isRemote: isRemote, upVector: curUp.clone() });
            }
            // ĐÚC CHIÊU R
            else if (phim === 'R') {
                const waveGroup = new THREE.Group();
                waveGroup.position.copy(viTriXuatChieu).add(curDir.clone().multiplyScalar(1.5));
                waveGroup.up.copy(curUp); 
                waveGroup.lookAt(targetBay); 
                scene.add(waveGroup);
                
                const geo = new THREE.CylinderGeometry(4, 6, 25, 16, 1, true, 0, Math.PI);
                const mat = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
                const waveMesh = new THREE.Mesh(geo, mat);
                waveMesh.rotation.set(-Math.PI / 6, Math.PI, Math.PI / 2); 
                
                const loiSong = taoCauNuoc(3, 0xffffff);
                loiSong.scale.set(5, 1, 2);
                waveGroup.add(waveMesh); waveGroup.add(loiSong);
                kyNangJimbei.push({ mesh: waveGroup, type: 'R', life: 100, speed: 9.0, targetPos: targetBay, damage: dameGoc * 0.5, isRemote: isRemote, upVector: curUp.clone() });
            }
            // ĐÚC CHIÊU F
            else if (phim === 'F') {
                const buraikan = taoCauNuoc(6.0, 0x00ffff);
                buraikan.position.copy(viTriXuatChieu).add(curDir.clone().multiplyScalar(2.0));
                buraikan.up.copy(curUp); 
                buraikan.lookAt(targetBay);
                scene.add(buraikan);
                kyNangJimbei.push({ mesh: buraikan, type: 'F', life: 100, speed: 15.0, targetPos: targetBay, damage: dameGoc * 1.0, isRemote: isRemote, upVector: curUp.clone() });
            }
        }, thoiGianSqueeze); 
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU (JIMBEI)
    // ==========================================
    window.updateCombatJimbei = function () {
        for (let i = kyNangJimbei.length - 1; i >= 0; i--) {
            let s = kyNangJimbei[i]; s.life--;

            if (s.type === 'Q') {
                s.mesh.translateZ(s.speed);
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5 || s.life < 5) {
                    taoVuNoNuocJB(s.targetPos, s.isRemote, s.damage, 10, s.upVector);
                    s.life = 0;
                }
            }
            else if (s.type === 'E') {
                s.mesh.translateZ(s.speed);
                if (s.targetPos) {
                    if (!s.isRemote) {
                        const mucTieuMoi = window.layMucTieuGanNhatJB(s.mesh.position);
                        if (mucTieuMoi) s.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(s.mesh.position);
                    dummy.up.copy(s.upVector); 
                    dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.1);
                }
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5 || s.life < 5) {
                    taoVuNoNuocJB(s.targetPos, s.isRemote, s.damage, 15, s.upVector);
                    s.life = 0;
                }
            }
            else if (s.type === 'R') {
                s.mesh.translateZ(s.speed);
                s.mesh.scale.x += 0.02; s.mesh.scale.y += 0.01;

                if (s.life % 3 === 0) taoVuNoNuocJB(s.mesh.position, s.isRemote, 0, 5, s.upVector);

                if (s.targetPos) {
                    if (!s.isRemote) {
                        const mucTieuMoi = window.layMucTieuGanNhatJB(s.mesh.position);
                        if (mucTieuMoi) s.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(s.mesh.position);
                    dummy.up.copy(s.upVector); 
                    dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.03);
                }

                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 12 || s.life < 5) {
                    taoVuNoNuocJB(s.targetPos, s.isRemote, s.damage, 35, s.upVector);
                    s.life = 0;
                }
            }
            else if (s.type === 'F') {
                s.mesh.translateZ(s.speed);
                s.mesh.scale.addScalar(0.04);
                if (s.life % 2 === 0) taoVuNoNuocJB(s.mesh.position, s.isRemote, 0, 0, s.upVector);
                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 10 || s.life < 5) {
                    taoVuNoNuocJB(s.targetPos, s.isRemote, s.damage, 50, s.upVector);
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangJimbei.splice(i, 1);
            }
        }

        // 🌟 CẬP NHẬT TRỌNG LỰC GIỌT NƯỚC (Rơi theo upVector của Hành tinh)
        for (let i = hieuUngJimbei.length - 1; i >= 0; i--) {
            let h = hieuUngJimbei[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            
            // Lấy lực hút tâm Trái Đất (0.5 m/s)
            let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(-0.5) : new THREE.Vector3(0, -0.5, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].add(fallVec); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 30;

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngJimbei.splice(i, 1);
            }
        }

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

    setInterval(window.updateCombatJimbei, 30);

    // ==========================================
    // 🌟 ĐĂNG KÝ HỆ PHÁI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('jimbei')) {
        window.HePhaiHienTai = {
            tenPhai: "Hải Hiệp Jimbei",
            khoiTao: function () {
                console.log("🌊 Hải Hiệp Jimbei đã xuất chiến! Động cơ Nước và Trọng lực đã kích hoạt!");

                if (window.animationsMap) {
                    window.animationsMap['NHANROI'] = window.animationsMap['PL_JINBE_ORIG01_IDLEHOME_A']; 
                    window.animationsMap['CHAYBO'] = window.animationsMap['PL_JINBE_ORIG01_RUN'];        
                    window.animationsMap['BAY'] = window.animationsMap['PL_JINBE_ORIG01_JUMP_LP'];       
                    window.animationsMap['CHET'] = window.animationsMap['PL_JINBE_ORIG01_LOSE'];       
                    window.animationsMap['HIT'] = window.animationsMap['PL_JINBE_ORIG01_DAMAGE'];     
                }
            },
            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) {
                window.tungComboJimbei(phim, isRemote, origin, target, dir, casterId, weaponUrl);
            },
            capNhat: function () { } 
        };
        window.HePhaiHienTai.khoiTao();
    }

})();
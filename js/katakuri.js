// ==========================================
// 🍩 HỆ THỐNG KỸ NĂNG: TỨ HOÀNG KATAKURI (V3 - SIÊU PHÁP SƯ TẦM XA)
// 👑 TỐI ƯU GÓC NHÌN CAMERA + ĐỒNG BỘ TẦM BẮN 150M KHÔNG CHE MÀN HÌNH
// ==========================================

(function () {
    const kyNangKatakuri = [];
    const hieuUngKatakuri = [];
    const danhSachSoBayKTK = [];

    // 🌟 ĐỒNG BỘ THỜI GIAN HỒI CHIÊU CHUẨN (Pháp Sư Tầm Xa)
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    window.tongSoChuNoi_KTK = 0;
    function taoSoSatThuongKTK(pos3D, satThuong, mauSac = '#ff0044') {
        if (window.isMobile && window.tongSoChuNoi_KTK > 30) return;
        if (satThuong <= 0) return;
        window.tongSoChuNoi_KTK++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 8px #000, 2px 2px 0px #aa0000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayKTK.push({ el: div, pos: pos3D.clone(), life: 40, offsetY: 0 });
    }

    // 🌟 CHỈNH LẠI RADAR: NÂNG TẦM KHÓA MỤC TIÊU LÊN 150M (CHUẨN ĐÁNH XA)
    window.layMucTieuGanNhatKTK = function(viTriGoc, huongMat) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 150) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 150; 
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

        let targetQuai = null; let minDQuai = 150;
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

    function gaySatThuongKTK(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongKTK(posHienSo, luongSatThuong, '#ff0044');
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
                            taoSoSatThuongKTK(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongKTK(hit.tamNguc.clone(), luongSatThuong);
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

    window.thoiDiemNoCuoiCungKTK = window.thoiDiemNoCuoiCungKTK || 0;
    function taoVuNoKatakuri(pos, colorHex = 0xaa0000, banKinh = 10) {
        let bayGio = Date.now();
        if (bayGio - window.thoiDiemNoCuoiCungKTK < 100) return; 
        window.thoiDiemNoCuoiCungKTK = bayGio;
        if (typeof window.phatAmThanh === 'function') window.phatAmThanh('uploads/anims/hit.mp3', 0.5);

        const soLuong = window.isMobile ? 15 : 40; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 12, (Math.random() - 0.5) * 15));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureHakiKTK) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   
            gradient.addColorStop(0.3, 'rgba(170, 0, 0, 0.9)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureHakiKTK = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: colorHex, size: window.isMobile ? 6.0 : 10.0, map: window.textureHakiKTK, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngKatakuri.push({ system: pts, velocities: vels, life: 25 }); 
    }

    // ==========================================
    // 🌟 TRẠM ĐÚC VŨ KHÍ: ĐƯỢC CHỈ ĐỊNH FILE MỚI CỦA SẾP
    // ==========================================
    function taoVuKhiKTK(scaleSize, url) {
        const group = new THREE.Group(); 
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(url, (vuKhi) => {
                vuKhi.position.set(0, 0, 0); 
                vuKhi.rotation.set(0, 0, 0); 
                vuKhi.scale.set(1, 1, 1);
                vuKhi.traverse(c => { if (c.isMesh) { c.visible = true; } });
                group.add(vuKhi);
            });
        }
        group.scale.set(scaleSize, scaleSize, scaleSize);
        return group;
    }

    // ==========================================
    // ✨ TUNG CHIÊU KATAKURI (BẢN ĐÁNH XA TỐI ƯU CAMERA)
    // ==========================================
    window.tungComboKatakuri = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
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

        let tenAnimMua = '';
        if (phim === 'Q') tenAnimMua = 'ATTACK1';      
        else if (phim === 'E') tenAnimMua = 'ATTACK5'; 
        else if (phim === 'R') tenAnimMua = 'ATTACK';  
        else if (phim === 'F') tenAnimMua = 'ATTACK6'; 

        if (!isRemote) {
            window.dangMuaChieu = true; 
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua);
            setTimeout(() => { window.dangMuaChieu = false; }, 1000);
        }

        let viTriGoc, huongMat, mucTieuGoc;
        let upVector = new THREE.Vector3(0, 1, 0);
        
        // 🌟 BẢN VÁ 1: TÁCH BẠCH DAME CỦA BOSS VÀ DAME CỦA SẾP
        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        // 🌟 FILE ĐÚC ĐẠI LÝ MỚI CỦA SẾP CHỈ ĐỊNH
        const FILE_TAY = 'uploads/anims/1779946771_BANTAYKATAKURI.glb';

        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z); 
            huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z); 
            mucTieuGoc = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z); 
            upVector.copy(viTriGoc).normalize(); 
        } else {
            viTriGoc = new THREE.Vector3(); nvc.getWorldPosition(viTriGoc); 
            upVector.copy(nvc.up).normalize(); 
            huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            
            let targetQuai = window.layMucTieuGanNhatKTK(viTriGoc, huongMat);
            if (targetQuai && targetQuai.mesh) {
                let hit = window.layHitbox(targetQuai.mesh);
                mucTieuGoc = hit.tamNguc.clone();
                let dummy = new THREE.Object3D(); dummy.position.copy(nvc.position); dummy.lookAt(mucTieuGoc.x, nvc.position.y, mucTieuGoc.z);
                nvc.quaternion.copy(dummy.quaternion);
                nvc.getWorldDirection(huongMat);
            } else {
                mucTieuGoc = viTriGoc.clone().add(huongMat.clone().multiplyScalar(60)); // Tầm bắn xa mặc định tăng lên 60m
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Katakuri', 
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieuGoc.x, y: mucTieuGoc.y, z: mucTieuGoc.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        let rightVector = new THREE.Vector3().crossVectors(huongMat, upVector).normalize().negate();

        // =====================================
        // Q: 2 BÀN TAY BẮN THẲNG TỚI (DỜI RỘNG SANG 2 BÊN RÌA)
        // =====================================
        if (phim === 'Q') {
            for (let i = 0; i < 2; i++) {
                let tay = taoVuKhiKTK(3.0, FILE_TAY);
                let pos = viTriGoc.clone().add(upVector.clone().multiplyScalar(5)); 
                
                // 🛑 TỐI ƯU Q: Đẩy rộng nách đạn ra xa gấp đôi (4 mét thay vì 1.5 mét) để thông thoáng camera
                let lechNgang = rightVector.clone().multiplyScalar(i === 0 ? -15.0 : 15.0); 
                pos.add(lechNgang);
                
                tay.position.copy(pos); tay.up.copy(upVector); tay.lookAt(mucTieuGoc); scene.add(tay);
                
                kyNangKatakuri.push({
                    mesh: tay, type: 'BAY_THANG', speed: 8.0, life: 100, delay: i * 15, 
                    targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.4, isRemote: isRemote 
                });
            }
        }
        // =====================================
        // E: MƯA ĐINH BA (TẦM XA PARABOL)
        // =====================================
        else if (phim === 'E') {
            const soLuong = 10;
            const spawnCenter = viTriGoc.clone().add(upVector.clone().multiplyScalar(20)).sub(huongMat.clone().multiplyScalar(5));
            for (let i = 0; i < soLuong; i++) {
                const dinhBa = taoVuKhiKTK(2.5, 'uploads/anims/1779945237_DINHBAKATAKURI.glb');
                let rX = (Math.random() - 0.5) * 15;
                let rZ = (Math.random() - 0.5) * 15;
                let rUp = Math.random() * 5;
                
                let startPos = spawnCenter.clone().add(rightVector.clone().multiplyScalar(rX)).add(huongMat.clone().multiplyScalar(rZ)).add(upVector.clone().multiplyScalar(rUp));
                let dichRoi = mucTieuGoc.clone().add(rightVector.clone().multiplyScalar((Math.random()-0.5)*15)).add(huongMat.clone().multiplyScalar((Math.random()-0.5)*15));
                
                dinhBa.position.copy(startPos); dinhBa.lookAt(dichRoi); scene.add(dinhBa);
                
                kyNangKatakuri.push({
                    mesh: dinhBa, type: 'BAY_PARABOL', state: 'CHO_DEN_LUOT',
                    speed: 0.015 + (Math.random() * 0.005), life: 300, startPos: startPos, targetPos: dichRoi,
                    damage: dameGoc * 0.3, arcHeight: 25 + Math.random() * 15, fireDelay: i * 5, progress: 0, isRemote: isRemote,
                    upVector: upVector.clone()
                });
            }
        }
        // =====================================
        // R: KIẾM TRẬN VÒNG TRÒN 
        // =====================================
        else if (phim === 'R') {
            const soLuong = 8;
            let qHanhTinh = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);
            for (let i = 0; i < soLuong; i++) {
                const phi = Math.acos(-1 + (2 * i) / soLuong); const theta = Math.sqrt(soLuong * Math.PI) * phi;
                let localDir = new THREE.Vector3(Math.cos(theta)*Math.sin(phi), Math.abs(Math.cos(phi))+0.1, Math.sin(theta)*Math.sin(phi)).normalize();
                
                let huongRaNgoai = localDir.applyQuaternion(qHanhTinh).normalize();
                const posNgoai = mucTieuGoc.clone().add(huongRaNgoai.multiplyScalar(35)); 
                posNgoai.add(upVector.clone().multiplyScalar(12)); 
                
                const tayR = taoVuKhiKTK(3.5, FILE_TAY);
                tayR.position.copy(posNgoai); 
                tayR.up.copy(upVector);
                tayR.lookAt(mucTieuGoc); scene.add(tayR);
                
                kyNangKatakuri.push({ 
                    mesh: tayR, type: 'BAY_THANG_GOM', speed: 4.0, life: 150, delay: i * 5, 
                    targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.3, isRemote: isRemote 
                });
            }
        }
        // =====================================
        // F: ĐẠI THỦ KHỔNG LỒ (ĐẨY CAO LÊN TRỜI)
        // =====================================
        else if (phim === 'F') {
            const pivotGroup = new THREE.Group(); 
            
            // 🛑 TỐI ƯU F: Đẩy điểm xoay tâm lên 25 mét (Thay vì 15 mét) để không che khuất góc nhìn nhân vật
            pivotGroup.position.copy(viTriGoc).add(upVector.clone().multiplyScalar(50)); 
            pivotGroup.up.copy(upVector);
            pivotGroup.lookAt(mucTieuGoc);
            
            const tayGiga = taoVuKhiKTK(13.0, FILE_TAY); // Bơm to 13.0 nhìn từ trên cao xuống cho hoành tráng
            tayGiga.rotateX(-Math.PI * 0.8); 
            pivotGroup.add(tayGiga); scene.add(pivotGroup);

            kyNangKatakuri.push({ 
                mesh: pivotGroup, swordMesh: tayGiga, speed: 0, life: 200, ticks: 0, 
                type: 'F_CHOP', delay: 0, targetPos: mucTieuGoc.clone(), damage: dameGoc * 1.5, isRemote: isRemote 
            });
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU KATAKURI
    // ==========================================
    window.updateCombatKatakuri = function () {
        for (let i = kyNangKatakuri.length - 1; i >= 0; i--) {
            let s = kyNangKatakuri[i]; 
            
            if (s.delay > 0) { s.delay--; continue; }
            s.life--;

            if (s.type === 'BAY_THANG' || s.type === 'BAY_THANG_GOM') {
                if (s.targetPos) {
                    if (!s.isRemote && s.type === 'BAY_THANG') {
                        const fwd = new THREE.Vector3(); s.mesh.getWorldDirection(fwd);
                        const mucTieuMoi = window.layMucTieuGanNhatKTK(s.mesh.position, fwd);
                        if (mucTieuMoi && mucTieuMoi.mesh) {
                            let hit = window.layHitbox(mucTieuMoi.mesh);
                            s.targetPos = hit.tamNguc.clone();
                        }
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.2); 
                }

                s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 3) {
                    taoVuNoKatakuri(s.mesh.position, 0xff0044, 12);
                    
                    // 🌟 QUY TẮC 3 QUYỀN LỰC
                    if (s.isRemote === false) gaySatThuongKTK(s.mesh.position, s.damage, 12);
                    else if (typeof s.isRemote === 'number' && s.isRemote > 0) {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.mesh.position, s.damage, 12);
                    }
                    
                    s.life = 0;
                }
            }
            else if (s.type === 'BAY_PARABOL') {
                if (s.state === 'CHO_DEN_LUOT') {
                    s.fireDelay--; if (s.fireDelay <= 0) s.state = 'DANG_BAY';
                } else if (s.state === 'DANG_BAY') {
                    s.speed *= 1.05; s.progress += s.speed;

                    let curPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, s.progress);
                    curPos.add(s.upVector.clone().multiplyScalar(Math.sin(s.progress * Math.PI) * s.arcHeight));

                    let nextProgress = s.progress + 0.05;
                    let nextPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, nextProgress);
                    nextPos.add(s.upVector.clone().multiplyScalar(Math.sin(nextProgress * Math.PI) * s.arcHeight));

                    s.mesh.position.copy(curPos); s.mesh.lookAt(nextPos);

                    if (s.progress >= 1) {
                        taoVuNoKatakuri(s.targetPos, 0xaa0000, 15);
                        
                        // 🌟 QUY TẮC 3 QUYỀN LỰC
                        if (s.isRemote === false) gaySatThuongKTK(s.targetPos, s.damage, 15);
                        else if (typeof s.isRemote === 'number' && s.isRemote > 0) {
                            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, 15);
                        }

                        s.life = 0;
                    }
                }
            }
            else if (s.type === 'F_CHOP') {
                if (s.swordMesh) {
                    s.swordMesh.rotateX(0.08); 
                    s.ticks++;
                    
                    if (s.ticks > 35 || s.life <= 5) {
                        taoVuNoKatakuri(s.targetPos, 0xff0000, 25); 
                        
                        // 🌟 QUY TẮC 3 QUYỀN LỰC
                        if (s.isRemote === false) gaySatThuongKTK(s.targetPos, s.damage, 25);
                        else if (typeof s.isRemote === 'number' && s.isRemote > 0) {
                            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, 25);
                        }

                        s.life = 0;
                    }
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangKatakuri.splice(i, 1);
            }
        }

        for (let i = hieuUngKatakuri.length - 1; i >= 0; i--) {
            let h = hieuUngKatakuri[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].x *= 0.9; h.velocities[j].z *= 0.9; h.velocities[j].y -= 0.6;
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 25;
            // 🛑 VÁ DỌN RÁC HẠT HAKI ĐỎ (KATAKURI)
            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngKatakuri.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayKTK.length - 1; i >= 0; i--) {
            let it = danhSachSoBayKTK[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayKTK.splice(i, 1); window.tongSoChuNoi_KTK--; }
        }
    };

    setInterval(window.updateCombatKatakuri, 30);

    // ==========================================
    // 🌟 KHỞI TẠO BỘ TỪ ĐIỂN
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('katakuri')) {
        window.HePhaiHienTai = {
            tenPhai: "Tứ Hoàng Katakuri",
            khoiTao: function () {
                console.log("🍩 Thức Tỉnh Mochi Tầm Xa Cao Cấp! Katakuri sẵn sàng!");
                if (window.animationsMap) {
                    let animNhanRoiCuoiThu = null; let animNhanRoiDiBo = null;
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        if (k.includes('NHANROI1')) animNhanRoiDiBo = window.animationsMap[key];
                        else if (k.includes('NHANROI') && !k.includes('NHANROI1')) animNhanRoiCuoiThu = window.animationsMap[key];
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) window.animationsMap['CHAYBO'] = window.animationsMap[key];
                        if (k.includes('BAY') || k.includes('FLY')) window.animationsMap['BAY'] = window.animationsMap[key];
                    }
                    if (animNhanRoiDiBo) window.animationsMap['NHANROI'] = animNhanRoiDiBo;
                    if (animNhanRoiCuoiThu && window.animationsMapChar) window.animationsMapChar['NHANROI'] = animNhanRoiCuoiThu;
                }
            },
            tungChieu: window.tungComboKatakuri,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
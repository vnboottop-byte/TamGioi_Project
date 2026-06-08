// ==========================================
// 🍩 HỆ THỐNG KỸ NĂNG: TỨ HOÀNG KATAKURI (MASTER FILE V4)
// 👑 CÔNG NGHỆ: INSTANT CAST + TỌA ĐỘ ĐỘNG VECTOR + TRỤC CẦU PARABOL
// ==========================================

(function () {
    const kyNangKatakuri = [];
    const hieuUngKatakuri = [];
    const danhSachSoBayKTK = [];

    // 🌟 VÁ LỖI 3: ĐÃ XÓA SẠCH BỘ ĐẾM COOLDOWN CỤC BỘ SAI LẦM
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

    // RADAR TẦM XA 150M CHUẨN PHÁP SƯ
    window.layMucTieuGanNhatKTK = function(viTriGoc) {
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

    function gaySatThuongKTK(tamNo, luongSatThuong, banKinh, upVector) {
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

    // 💥 HIỆU ỨNG HAKI ĐỎ (VÁ LỖI TRỌNG LỰC CẦU)
    window.thoiDiemNoCuoiCungKTK = window.thoiDiemNoCuoiCungKTK || 0;
    function taoVuNoKatakuri(pos, colorHex = 0xaa0000, banKinh = 10, upVector = new THREE.Vector3(0, 1, 0)) {
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
        
        // 🌟 Nạp upVector vào để rớt chuẩn trọng lực
        hieuUngKatakuri.push({ system: pts, velocities: vels, life: 25, upVector: upVector.clone() }); 
    }

    // 🌟 TRẠM ĐÚC VŨ KHÍ TỪ CACHE
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
    // ✨ TUNG CHIÊU KATAKURI (TỌA ĐỘ ĐỘNG & BỎ NUỐT CHIÊU)
    // ==========================================
    window.tungComboKatakuri = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc && !isRemote) return;

        let tenAnimMua = '';
        if (phim === 'Q') tenAnimMua = 'ATTACK1';      
        else if (phim === 'E') tenAnimMua = 'ATTACK5'; 
        else if (phim === 'R') tenAnimMua = 'ATTACK';  
        else if (phim === 'F') tenAnimMua = 'ATTACK6'; 

        // 🌟 BẤM LÀ MÚA NGAY LẬP TỨC 
        if (!isRemote) {
            window.dangMuaChieu = true; 
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua);
            
            if (window.henGioTatMuaKTK) clearTimeout(window.henGioTatMuaKTK);
            window.henGioTatMuaKTK = setTimeout(() => { window.dangMuaChieu = false; }, 600); // 600ms hỏa tốc
        }

        let viTriGocToTam = new THREE.Vector3();
        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3();
        
        // 🌟 Ép phẳng Vector hướng mặt
        if (typeof camera !== 'undefined' && !isRemote) {
            camera.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
            if (huongMat.lengthSq() < 0.001) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
        } else {
            nvc.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
        }
        if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }
        
        let mucTieuGoc = null;

        const FILE_TAY = 'uploads/anims/1779946771_BANTAYKATAKURI.glb';
        const FILE_DINHBA = 'uploads/anims/1779945237_DINHBAKATAKURI.glb';

        if (isRemote) {
            viTriGocToTam = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z); 
            upVector = viTriGocToTam.clone().normalize(); 
            mucTieuGoc = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z); 
        } else {
            viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5)); 
            let targetQuai = window.layMucTieuGanNhatKTK(viTriGocToTam);
            if (targetQuai && targetQuai.mesh) {
                let hit = window.layHitbox(targetQuai.mesh);
                mucTieuGoc = hit.tamNguc.clone();
            } else {
                mucTieuGoc = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150)); 
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Katakuri', 
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: mucTieuGoc.x, y: mucTieuGoc.y, z: mucTieuGoc.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: false });
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        // =====================================
        // Q: 2 BÀN TAY BẮN THẲNG TỚI (TỌA ĐỘ ĐỘNG)
        // =====================================
        if (phim === 'Q') {
            for (let i = 0; i < 2; i++) {
                setTimeout(() => {
                    let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                    let rightVector = new THREE.Vector3().crossVectors(curDir, curUp).normalize().negate();

                    let tay = taoVuKhiKTK(3.0, FILE_TAY);
                    let pos = curNvc.position.clone().add(curUp.clone().multiplyScalar(5)); 
                    let lechNgang = rightVector.clone().multiplyScalar(i === 0 ? -15.0 : 15.0); 
                    pos.add(lechNgang);
                    
                    let targetBay = mucTieuGoc ? mucTieuGoc.clone() : curNvc.position.clone().add(curDir.clone().multiplyScalar(150));
                    tay.position.copy(pos); 
                    tay.up.copy(curUp); // 🌟 VÁ LỖI 7
                    tay.lookAt(targetBay); 
                    scene.add(tay);
                    
                    kyNangKatakuri.push({
                        mesh: tay, type: 'BAY_THANG', speed: 8.0, life: 100, 
                        targetPos: targetBay, damage: dameGoc * 0.2, isRemote: isRemote, upVector: curUp.clone()
                    });
                }, i * 150); // Delay đẻ tay hỏa tốc
            }
        }
        // =====================================
        // E: MƯA ĐINH BA PARABOL (TRỤC CẦU 3D CHUẨN)
        // =====================================
        else if (phim === 'E') {
            const soLuong = 10;
            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                    let rightVector = new THREE.Vector3().crossVectors(curDir, curUp).normalize().negate();

                    const spawnCenter = curNvc.position.clone().add(curUp.clone().multiplyScalar(20)).sub(curDir.clone().multiplyScalar(5));
                    const dinhBa = taoVuKhiKTK(2.5, FILE_DINHBA);
                    
                    let rX = (Math.random() - 0.5) * 15;
                    let rZ = (Math.random() - 0.5) * 15;
                    let rUp = Math.random() * 5;
                    
                    let startPos = spawnCenter.clone().add(rightVector.clone().multiplyScalar(rX)).add(curDir.clone().multiplyScalar(rZ)).add(curUp.clone().multiplyScalar(rUp));
                    let dichRoi = mucTieuGoc.clone().add(rightVector.clone().multiplyScalar((Math.random()-0.5)*15)).add(curDir.clone().multiplyScalar((Math.random()-0.5)*15));
                    
                    dinhBa.position.copy(startPos); 
                    dinhBa.up.copy(curUp); // 🌟 VÁ LỖI 7 TỐI QUAN TRỌNG CHỐNG GÃY CỔ ĐINH BA
                    dinhBa.lookAt(dichRoi); 
                    scene.add(dinhBa);
                    
                    kyNangKatakuri.push({
                        mesh: dinhBa, type: 'BAY_PARABOL',
                        speed: 0.015 + (Math.random() * 0.005), life: 300, startPos: startPos, targetPos: dichRoi,
                        damage: dameGoc * 0.06, arcHeight: 25 + Math.random() * 15, progress: 0, isRemote: isRemote,
                        upVector: curUp.clone()
                    });
                }, i * 80); // Nã đinh ba siêu tốc 80ms/viên
            }
        }
        // =====================================
        // R: MOCHI TRẬN VÒNG TRÒN
        // =====================================
        else if (phim === 'R') {
            const soLuong = 8;
            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);

                    let qHanhTinh = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), curUp);
                    const phi = Math.acos(-1 + (2 * i) / soLuong); const theta = Math.sqrt(soLuong * Math.PI) * phi;
                    let localDir = new THREE.Vector3(Math.cos(theta)*Math.sin(phi), Math.abs(Math.cos(phi))+0.1, Math.sin(theta)*Math.sin(phi)).normalize();
                    
                    let huongRaNgoai = localDir.applyQuaternion(qHanhTinh).normalize();
                    const posNgoai = mucTieuGoc.clone().add(huongRaNgoai.multiplyScalar(35)); 
                    posNgoai.add(curUp.clone().multiplyScalar(12)); 
                    
                    const tayR = taoVuKhiKTK(3.5, FILE_TAY);
                    tayR.position.copy(posNgoai); 
                    tayR.up.copy(curUp); // 🌟 VÁ LỖI 7
                    tayR.lookAt(mucTieuGoc); 
                    scene.add(tayR);
                    
                    kyNangKatakuri.push({ 
                        mesh: tayR, type: 'BAY_THANG_GOM', speed: 4.0, life: 150, 
                        targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.0625, isRemote: isRemote, upVector: curUp.clone()
                    });
                }, i * 60); 
            }
        }
        // =====================================
        // F: ĐẠI THỦ KHỔNG LỒ 
        // =====================================
        else if (phim === 'F') {
            setTimeout(() => {
                let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);

                const pivotGroup = new THREE.Group(); 
                pivotGroup.position.copy(curNvc.position).add(curUp.clone().multiplyScalar(50)); 
                pivotGroup.up.copy(curUp); // 🌟 VÁ LỖI 7
                pivotGroup.lookAt(mucTieuGoc);
                
                const tayGiga = taoVuKhiKTK(13.0, FILE_TAY); 
                tayGiga.rotateX(-Math.PI * 0.8); 
                pivotGroup.add(tayGiga); scene.add(pivotGroup);

                kyNangKatakuri.push({ 
                    mesh: pivotGroup, swordMesh: tayGiga, speed: 0, life: 200, ticks: 0, 
                    type: 'F_CHOP', targetPos: mucTieuGoc.clone(), damage: dameGoc * 1.0, isRemote: isRemote, upVector: curUp.clone()
                });
            }, 300); // 🌟 Bật cánh tay nhanh sau 300ms
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU KATAKURI
    // ==========================================
    window.updateCombatKatakuri = function () {
        for (let i = kyNangKatakuri.length - 1; i >= 0; i--) {
            let s = kyNangKatakuri[i]; 
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
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); dummy.up.copy(s.upVector || new THREE.Vector3(0,1,0)); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.2); 
                }

                s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 3) {
                    taoVuNoKatakuri(s.mesh.position, 0xff0044, 12, s.upVector);
                    if (s.isRemote === false) gaySatThuongKTK(s.mesh.position, s.damage, 12);
                    else if (typeof s.isRemote === 'number' && s.isRemote > 0) {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.mesh.position, s.damage, 12);
                    }
                    s.life = 0;
                }
            }
            else if (s.type === 'BAY_PARABOL') {
                s.speed *= 1.05; s.progress += s.speed;

                let curPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, s.progress);
                curPos.add(s.upVector.clone().multiplyScalar(Math.sin(s.progress * Math.PI) * s.arcHeight));

                let nextProgress = s.progress + 0.05;
                let nextPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, nextProgress);
                nextPos.add(s.upVector.clone().multiplyScalar(Math.sin(nextProgress * Math.PI) * s.arcHeight));

                s.mesh.position.copy(curPos); 
                s.mesh.up.copy(s.upVector); // 🌟 CHỐNG VẸO TRỤC CẦU KHI BAY CONG
                s.mesh.lookAt(nextPos);

                if (s.progress >= 1) {
                    taoVuNoKatakuri(s.targetPos, 0xaa0000, 15, s.upVector);
                    if (s.isRemote === false) gaySatThuongKTK(s.targetPos, s.damage, 15);
                    else if (typeof s.isRemote === 'number' && s.isRemote > 0) {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, 15);
                    }
                    s.life = 0;
                }
            }
            else if (s.type === 'F_CHOP') {
                if (s.swordMesh) {
                    s.swordMesh.rotateX(0.08); 
                    s.ticks++;
                    
                    if (s.ticks > 35 || s.life <= 5) {
                        taoVuNoKatakuri(s.targetPos, 0xff0000, 25, s.upVector); 
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

        // 🌟 VÁ LỖI TRỌNG LỰC HAKI BỤI ĐỎ 
        for (let i = hieuUngKatakuri.length - 1; i >= 0; i--) {
            let h = hieuUngKatakuri[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            
            // Ép Haki rơi xuống tâm của Trục Cầu
            let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(-0.6) : new THREE.Vector3(0, -0.6, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].x *= 0.9; 
                h.velocities[j].z *= 0.9; 
                h.velocities[j].add(fallVec); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 25;
            
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
    // 🌟 KHỞI TẠO BỘ TỪ ĐIỂN & PRELOAD RAM
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('katakuri')) {
        window.HePhaiHienTai = {
            tenPhai: "Tứ Hoàng Katakuri",
            khoiTao: function () {
                console.log("🍩 Thức Tỉnh Mochi Tầm Xa Cao Cấp! Kích hoạt Động cơ Preload RAM & Vector Động!");
                
                // 🌟 VÁ LỖI 2: CHỐNG SẬP LOADER BẰNG CÁCH TẢI TRƯỚC VÀO VRAM
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/1779946771_BANTAYKATAKURI.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/1779945237_DINHBAKATAKURI.glb', () => {});
                }

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
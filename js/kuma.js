// ==========================================
// ⚔️ MÔN PHÁI: BẠO CHÚA BARTHOLOMEW KUMA (NIKYU NIKYU NO MI)
// 👑 CÔNG NGHỆ: NHỊP ĐẬP TỤ LỰC + NẮN TRỤC CẦU TỐI THƯỢNG CHỐNG NGHIÊNG
// ==========================================

(function () {
    const kyNangKuma = [];
    const hieuUngKuma = [];
    const danhSachSoBayKuma = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Kuma = 0;

    // ==========================================
    // 1. LÕI TIỆN ÍCH CƠ BẢN
    // ==========================================
    function taoSoSatThuongKuma(pos3D, satThuong, mauSac = '#ffffff') {
        if (window.isMobile) return;
        if (satThuong <= 0 || (window.isMobile && window.tongSoChuNoi_Kuma > 5)) return;
        window.tongSoChuNoi_Kuma++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #0055ff';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayKuma.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatKuma = function (viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead && window.mucTieuHienTai.classCode !== 'TRANG_TRI') {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 150) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 150;
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                let laBoss = window.danhSachQuaiVat && window.danhSachQuaiVat.some(q => String(q.id) === String(id) || "PLAYER_" + q.id === String(id) || "BOSS_" + q.id === String(id));
                if (rp.status === 'ready' && rp.mesh && !laBoss) {
                    let hit = window.layHitbox(rp.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDNguoi) { minDNguoi = d; targetNguoi = rp; }
                }
            }
        }
        if (targetNguoi) return targetNguoi;

        let targetQuai = null; let minDQuai = 150;
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh && quai.classCode !== 'TRANG_TRI') {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDQuai) { minDQuai = d; targetQuai = quai; }
                }
            });
        }
        return targetQuai;
    };

    function gaySatThuongKuma(tamNo, luongSatThuong, banKinh) {
        let mucTieuDaXyLy = new Set();
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                let laBoss = window.danhSachQuaiVat && window.danhSachQuaiVat.some(q => String(q.id) === String(id) || "PLAYER_" + q.id === String(id) || "BOSS_" + q.id === String(id));
                if (rp.status === 'ready' && rp.mesh && !laBoss && !mucTieuDaXyLy.has(rp.mesh)) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        mucTieuDaXyLy.add(rp.mesh);
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongKuma(posHienSo, luongSatThuong, '#aaddff');
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh && !mucTieuDaXyLy.has(quai.mesh)) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        mucTieuDaXyLy.add(quai.mesh);
                        if (quai.isBoss) {
                            taoSoSatThuongKuma(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#00ffff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongKuma(hit.tamNguc.clone(), luongSatThuong);
                            if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar') || quai.tagEl.querySelector('div[style*="background"]'); if (bar) bar.style.width = Math.max(0, (quai.hp / (quai.maxHp || 4000)) * 100) + '%'; }
                            if (quai.hp <= 0) {
                                quai.isDead = true; if (typeof quai.playAnim === 'function') quai.playAnim('DIE'); else quai.mesh.visible = false;
                                if (quai.tagEl) quai.tagEl.style.display = 'none';
                                if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);
                                setTimeout(() => { quai.hp = quai.maxHp || 4000; quai.isDead = false; if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true; if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar') || quai.tagEl.querySelector('div[style*="background"]'); if (bar) bar.style.width = '100%'; quai.tagEl.style.display = 'block'; } }, 5000);
                            } else { if (typeof quai.playAnim === 'function') quai.playAnim('HIT'); }
                        }
                    }
                }
            });
        }
    }

    // ==========================================
    // 2. VỤ NỔ ÁP SUẤT KHÍ VÀ MODEL TAY GẤU
    // ==========================================
    function taoHieuUngNoKuma(pos, isBig = false, upVector = new THREE.Vector3(0, 1, 0)) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 

        const soLuong = isBig ? 80 : 30; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + 1; posArr[i * 3 + 2] = pos.z;
            let speed = isBig ? (Math.random() * 4 + 2) : (Math.random() * 2 + 0.5);
            let vLocal = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vLocal.applyQuaternion(qNolo);
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureKhiKuma) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   
            gradient.addColorStop(0.3, 'rgba(200, 240, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');         
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureKhiKuma = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xffffff, size: window.isMobile ? 5.0 : 10.0, map: window.textureKhiKuma, 
            transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngKuma.push({ system: pts, velocities: vels, life: 30, upVector: upVector.clone() }); 
    }

    function taoVatTheKuma(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let dsMat = Array.isArray(c.material) ? c.material : [c.material];
                        dsMat.forEach(m => { m.transparent = true; m.opacity = 0.9; m.emissive = new THREE.Color(0x3388ff); m.emissiveIntensity = 0.5; });
                    }
                });
                if (v.animations && v.animations.length > 0) {
                    let mixer = new THREE.AnimationMixer(v);
                    mixer.clipAction(v.animations[0]).play();
                    group.userData = group.userData || {}; group.userData.mixer = mixer; 
                }
                v.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(v);
                const size = new THREE.Vector3(); box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                let tiLeChuan = scaleSize / maxDim;
                v.scale.set(tiLeChuan, tiLeChuan, tiLeChuan);
                
                v.rotateX(Math.PI / 2); // Trục đệm mô hình ngửa lòng bàn tay
                group.add(v);
            });
        }
        return group;
    }

    function timXuong(nvc, dsTen) {
        let xuong = null;
        nvc.traverse(c => {
            if (c.isBone && dsTen.includes(c.name) && !xuong) xuong = c;
        });
        return xuong;
    }

    // ==========================================
    // 3. TUNG CHIÊU & KHÓA MỤC TIÊU
    // ==========================================
    window.tungComboKuma = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        
        if (isRemote && casterId) {
            if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            } else if (typeof window.danhSachQuaiVat !== 'undefined') {
                let boss = window.danhSachQuaiVat.find(q => q.id == casterId || q.id === casterId);
                if (boss && boss.mesh) nvc = boss.mesh;
            }
        }
        if (!nvc && !isRemote) return;

        let loaiChieu = phim;
        let animCanMua = 'ATTACK1';
        
        if (typeof phim === 'string') {
            let pUp = phim.toUpperCase();
            if (pUp.includes('ATTACK4') || pUp === 'F') { loaiChieu = 'F'; animCanMua = 'ATTACK2'; }
            else if (pUp.includes('ATTACK3') || pUp === 'R') { loaiChieu = 'R'; animCanMua = 'ATTACK1'; }
            else if (pUp.includes('ATTACK2') || pUp === 'E') { loaiChieu = 'E'; }
            else if (pUp.includes('ATTACK1') || pUp === 'Q') { loaiChieu = 'Q'; }
            else if (pUp.includes('ATTACK') || pUp.includes('SKILL')) {
                let arr = ['Q', 'E', 'R', 'F'];
                loaiChieu = arr[Math.floor(Math.random() * arr.length)];
            }
        }

        if (loaiChieu === 'Q' || loaiChieu === 'E') {
            if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
                let danhSachHopLe = window.KHO_ANIM_TANCONG.filter(a => a !== 'ATTACK2');
                if (danhSachHopLe.length > 0) {
                    animCanMua = danhSachHopLe[Math.floor(Math.random() * danhSachHopLe.length)];
                } else {
                    animCanMua = window.KHO_ANIM_TANCONG[0];
                }
            } else {
                animCanMua = 'ATTACK1';
            }
        }

        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
            
            if (window.henGioTatMuaKuma) clearTimeout(window.henGioTatMuaKuma);
            window.henGioTatMuaKuma = setTimeout(() => { window.dangMuaChieu = false; }, loaiChieu === 'F' ? 2000 : 1000);
        } else {
            if (nvc.userData && nvc.userData.mixer && nvc.userData.animationsMap && nvc.userData.animationsMap[animCanMua]) {
                nvc.userData.animationsMap[animCanMua].reset().fadeIn(0.2).play();
            }
        }

        let viTriGocToTam = new THREE.Vector3();
        let upVector = new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); 
        let mucTieu = null;

        if (isRemote) {
            if (remoteGoc) {
                viTriGocToTam.set(remoteGoc.x, remoteGoc.y, remoteGoc.z);
                if (viTriGocToTam.lengthSq() > 0.001) upVector.copy(viTriGocToTam).normalize(); 
            } else if (nvc) {
                if (nvc.position.lengthSq() > 0.001) upVector.copy(nvc.position).normalize();
                viTriGocToTam.copy(nvc.position).add(upVector.clone().multiplyScalar(3.5));
            }
            if (remoteHuong) huongMat.set(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            else if (nvc) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
            
            if (remoteDich) mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
        } else {
            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                upVector = nvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
            } else if (nvc.up) { upVector = nvc.up.clone().normalize(); }

            nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize();
            if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }

            viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));
            let targetRadar = window.layMucTieuGanNhatKuma(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) {
                let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(targetRadar.mesh) : null;
                mucTieu = (hitBox && hitBox.tamNguc) ? hitBox.tamNguc.clone() : targetRadar.mesh.position.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Kuma', 
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) dameGoc = window.remotePlayers[casterId].damage || 100;
        }

        // =====================================
        // 🔥 CHIÊU Q: Bắn 1 Tay Gấu Lớn 
        // =====================================
        if (loaiChieu === 'Q') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }
                
                let tayPhai = timXuong(curNvc, ['RHand_Palm_021', 'RHand', 'mixamorigRightHand']);
                let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(3.5));
                if (tayPhai) tayPhai.getWorldPosition(diemBan);

                const tayGau = taoVatTheKuma('taygau', 2.5); 
                tayGau.position.copy(diemBan).add(cDir.clone().multiplyScalar(1.0));
                // 🌟 VÁ TRỤC: Khởi tạo góc nhìn không bị lệch
                tayGau.up.copy(cUp); tayGau.lookAt(mucTieu); scene.add(tayGau);
                
                kyNangKuma.push({
                    mesh: tayGau, type: 'BAY_THANG', speed: 12.0, life: 80, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.3, isRemote: isRemote, noBanKinh: 12, upVector: cUp.clone()
                });
            }, 200);
        }

        // =====================================
        // 🔥 CHIÊU E: Bắn Liên Hoàn 5 Tay Gấu 
        // =====================================
        else if (loaiChieu === 'E') {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                    let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }
                    
                    let rightVec = new THREE.Vector3().crossVectors(cDir, cUp).normalize();
                    let tayPhai = timXuong(curNvc, ['RHand_Palm_021', 'RHand', 'mixamorigRightHand']);
                    let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(3.5));
                    if (tayPhai) tayPhai.getWorldPosition(diemBan);

                    diemBan.add(rightVec.multiplyScalar((Math.random() - 0.5) * 3)).add(cUp.clone().multiplyScalar((Math.random() - 0.5) * 3));

                    const tayGau = taoVatTheKuma('taygau', 2.0); 
                    tayGau.position.copy(diemBan).add(cDir.clone().multiplyScalar(1.0));
                    tayGau.up.copy(cUp); tayGau.lookAt(mucTieu); scene.add(tayGau);
                    
                    kyNangKuma.push({
                        mesh: tayGau, type: 'BAY_THANG', speed: 13.0, life: 80, 
                        targetPos: mucTieu.clone(), damage: dameGoc * 0.15, isRemote: isRemote, noBanKinh: 10, upVector: cUp.clone()
                    });
                }, 100 + i * 120); 
            }
        }

        // =====================================
        // 🔥 CHIÊU R: 10 Tay Gấu Xen Kẽ, Phình To Khổng Lồ
        // =====================================
        else if (loaiChieu === 'R') {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                    let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }
                    
                    let rightVec = new THREE.Vector3().crossVectors(cDir, cUp).normalize();
                    let tayChon = (i % 2 === 0) ? timXuong(curNvc, ['RHand_Palm_021', 'RHand']) : timXuong(curNvc, ['LHand_Palm_017', 'LHand']);
                    
                    let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(3.5));
                    if (tayChon) tayChon.getWorldPosition(diemBan);
                    else diemBan.add(rightVec.multiplyScalar((i % 2 === 0 ? 1 : -1) * 1.5));

                    const tayGau = taoVatTheKuma('taygau', 1.5); 
                    tayGau.position.copy(diemBan);
                    tayGau.up.copy(cUp); tayGau.lookAt(mucTieu); scene.add(tayGau);
                    
                    kyNangKuma.push({
                        mesh: tayGau, type: 'BAY_TO_DAN', speed: 10.0, life: 100, 
                        currentScale: 1.5, maxScale: 6.0, growthRate: 0.15, 
                        targetPos: mucTieu.clone(), damage: dameGoc * 0.2, isRemote: isRemote, noBanKinh: 15, upVector: cUp.clone()
                    });
                }, 100 + i * 80); 
            }
        }

        // =====================================
        // 🔥 CHIÊU F: URSUS SHOCK TRÊN ĐỈNH ĐẦU
        // =====================================
        else if (loaiChieu === 'F') {
            let curNvc = nvc; if (!curNvc) return;
            let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
            
            let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(8.0));
            
            const tayGauUrsus = taoVatTheKuma('taygau', 3.0); 
            tayGauUrsus.position.copy(diemBan);
            // 🌟 VÁ TRỤC CẦU TỐI THƯỢNG: Chỉ định góc nhìn, dẹp bỏ mọi sự nghiêng ngả vớ vẩn
            tayGauUrsus.up.copy(cUp);
            tayGauUrsus.lookAt(mucTieu); 
            scene.add(tayGauUrsus);
            
            kyNangKuma.push({
                mesh: tayGauUrsus, type: 'URSUS_SHOCK', speed: 8.0, life: 300, 
                nvc: curNvc, startTime: Date.now(), baseScale: 3.0, maxScale: 18.0, growthRate: 0.3,
                targetPos: mucTieu.clone(), damage: dameGoc * 1.5, isRemote: isRemote, noBanKinh: 50, upVector: cUp.clone() 
            });
        }
    };

    // ==========================================
    // 4. VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU 
    // ==========================================
    window.updateCombatKuma = function () {
        for (let i = kyNangKuma.length - 1; i >= 0; i--) {
            let s = kyNangKuma[i]; s.life--;

            if (s.mesh && s.mesh.userData && s.mesh.userData.mixer) s.mesh.userData.mixer.update(0.03);

            if (s.type === 'BAY_THANG' || s.type === 'BAY_TO_DAN') {
                if (s.type === 'BAY_TO_DAN') {
                    if (s.currentScale < s.maxScale) {
                        s.currentScale += s.growthRate;
                        s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                    }
                }

                if (s.targetPos) {
                    // 🌟 LIÊN TỤC NẮN TRỤC KHI BAY QUA MAP CẦU
                    if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                        s.upVector = s.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                    }

                    if (!s.isRemote) {
                        let objMoi = window.layMucTieuGanNhatKuma(s.mesh.position);
                        if (objMoi && objMoi.mesh) {
                            let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(objMoi.mesh) : null;
                            if (hitBox && hitBox.tamNguc) s.targetPos = hitBox.tamNguc.clone();
                        }
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position);
                    dummy.up.copy(s.upVector || new THREE.Vector3(0, 1, 0)); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.2);

                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    if (!isNaN(huongBay.x)) s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else {
                    s.mesh.translateZ(s.speed);
                }

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    let diemNo = (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) ? s.targetPos : s.mesh.position;
                    if (s.isRemote === false) gaySatThuongKuma(diemNo, s.damage, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(diemNo, s.damage, s.noBanKinh);

                    taoHieuUngNoKuma(diemNo, s.type === 'BAY_TO_DAN', s.upVector);
                    s.life = 0;
                }
            }
            // 🌟 NHỊP ĐẬP TỤ LỰC KHÔNG XOAY, CHỈ CO BÓP
            else if (s.type === 'URSUS_SHOCK') {
                let thoiGianNen = Date.now() - s.startTime;
                
                let pulseAmplitude = s.baseScale * 0.25; 
                let pulse = s.baseScale + Math.sin(thoiGianNen * 0.015) * pulseAmplitude;
                s.mesh.scale.set(pulse, pulse, pulse);

                // 🌟 NẮN TRỤC THEO MỌI THẾ ĐỨNG CỦA NGƯỜI CHƠI
                if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                    s.upVector = s.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                }

                // Giai đoạn 1: Lơ lửng trên đỉnh đầu tích tụ năng lượng (1.5 giây)
                if (thoiGianNen < 1500) {
                    if (s.nvc) {
                        let curUp = s.nvc.up ? s.nvc.up.clone().normalize() : (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI ? s.nvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize() : new THREE.Vector3(0,1,0));
                        s.mesh.position.copy(s.nvc.position).add(curUp.multiplyScalar(8.0));
                        
                        // Khóa góc độ siêu cứng: Không slerp, không nghiêng ngả rườm rà
                        const dummy = new THREE.Object3D(); 
                        dummy.position.copy(s.mesh.position);
                        dummy.up.copy(curUp); 
                        dummy.lookAt(s.targetPos);
                        s.mesh.quaternion.copy(dummy.quaternion); 
                    }
                } 
                // Giai đoạn 2: Bắn đi chậm rãi, bóp nát mục tiêu
                else {
                    if (s.baseScale < s.maxScale) s.baseScale += s.growthRate;
                    
                    if (s.targetPos) {
                        if (!s.isRemote) {
                            let objMoi = window.layMucTieuGanNhatKuma(s.mesh.position);
                            if (objMoi && objMoi.mesh) {
                                let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(objMoi.mesh) : null;
                                if (hitBox && hitBox.tamNguc) s.targetPos = hitBox.tamNguc.clone();
                            }
                        }
                        const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position);
                        dummy.up.copy(s.upVector || new THREE.Vector3(0, 1, 0)); dummy.lookAt(s.targetPos);
                        s.mesh.quaternion.slerp(dummy.quaternion, 0.2);

                        let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                        if (!isNaN(huongBay.x)) s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                        
                        if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 5) {
                            if (s.isRemote === false) gaySatThuongKuma(s.targetPos, s.damage, s.noBanKinh);
                            else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                            
                            taoHieuUngNoKuma(s.targetPos, true, s.upVector);
                            if (typeof window.kichHoatDongDat === 'function') window.kichHoatDongDat(15, 800);
                            s.life = 0;
                        }
                    }
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangKuma.splice(i, 1);
            }
        }

        // BỤI KHÍ KUMA RƠI RỤNG
        for (let i = hieuUngKuma.length - 1; i >= 0; i--) {
            let h = hieuUngKuma[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].multiplyScalar(0.9); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 30; 

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose(); if (h.system.material) h.system.material.dispose();
                hieuUngKuma.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayKuma.length - 1; i >= 0; i--) {
            let it = danhSachSoBayKuma[i]; it.offsetY += 0.05; it.life--;
            if (typeof camera !== 'undefined' && it.pos) {
                const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
                if (p.z < 1) {
                    it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
                } else it.el.style.display = 'none';
            } else it.el.style.display = 'none';
            
            if (it.life <= 0) { 
                if (it.el && it.el.parentNode) it.el.parentNode.removeChild(it.el);
                danhSachSoBayKuma.splice(i, 1); window.tongSoChuNoi_Kuma--; 
            }
        }
    };
    setInterval(window.updateCombatKuma, 30);

    // ==========================================
    // 5. KHỞI TẠO & ĐĂNG KÝ HỆ PHÁI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('kuma')) {
        window.HePhaiHienTai = {
            tenPhai: "Bạo Chúa Kuma",
            khoiTao: function () {
                console.log("🐾 Khởi động Nikyu Nikyu no Mi chuẩn AAA!");
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/taygau.glb', () => {});
                }
                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false; let animBay = null; let animChay = null;
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase(); let clip = window.animationsMap[key];
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position') && (tenTrack.includes('armature') || tenTrack.includes('hips') || tenTrack.includes('pelvis') || tenTrack.includes('root'))) return false;
                                    return true;
                                });
                            }
                        }
                        const tuKhoaCam = ['hit', 'hurt', 'damage', 'die', 'death', 'dead', 'defend'];
                        if (tuKhoaCam.some(tuCam => k.includes(tuCam.toUpperCase()))) continue;

                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('ATTACK') || k.includes('SKILL')) window.KHO_ANIM_TANCONG.push(key);
                        if (k.includes('BAY') || k.includes('FLY')) { coBay = true; animBay = clip; window.animationsMap['BAY'] = animBay; }
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) { coChay = true; animChay = clip; window.animationsMap['CHAYBO'] = animChay; }
                    }
                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }
                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push('NHANROI1');
                    let defaultIdle = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                }
            },
            tungChieu: window.tungComboKuma,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();

// =========================================================================
// 6. ÁNH XẠ CHỮA BỆNH CÂM NÍN 100% CHO AI BOSS
// =========================================================================
window.tungCombokuma = window.tungComboKuma;
window.tungComboKuma = window.tungComboKuma;
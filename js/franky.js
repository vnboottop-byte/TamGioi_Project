// ==========================================
// 🤖 MÔN PHÁI: CYBORG FRANKY (SUUUUPER!)
// 👑 CÔNG NGHỆ: LẮP RÁP KỸ NĂNG ZORO (E) + GOKU (R, F LASER TRỤC 3D)
// ==========================================

(function () {
    const kyNangFranky = [];
    const hieuUngFranky = [];
    const danhSachSoBayFK = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_FK = 0;

    // ==========================================
    // 1. LÕI TIỆN ÍCH CƠ BẢN
    // ==========================================
    function taoSoSatThuongFK(pos3D, satThuong, mauSac = '#00ffff') {
        if (window.isMobile) return;
        if (satThuong <= 0 || (window.isMobile && window.tongSoChuNoi_FK > 5)) return;
        window.tongSoChuNoi_FK++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #0055ff';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayFK.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatFK = function (viTriGoc) {
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

    function gaySatThuongFK(tamNo, luongSatThuong, banKinh, mauSac = '#00ffff') {
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
                        taoSoSatThuongFK(posHienSo, luongSatThuong, mauSac);
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
                            taoSoSatThuongFK(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongFK(hit.tamNguc.clone(), luongSatThuong, mauSac);
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
    // 2. KHO VŨ KHÍ TÂN TIẾN CỦA FRANKY
    // ==========================================
    function taoVatTheFranky(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let dsMat = Array.isArray(c.material) ? c.material : [c.material];
                        dsMat.forEach(m => m.transparent = true);
                    }
                });
                v.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(v);
                const size = new THREE.Vector3(); box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                let tiLeChuan = scaleSize / maxDim;
                v.scale.set(tiLeChuan, tiLeChuan, tiLeChuan);
                group.add(v);
            });
        }
        return group;
    }

    // Lõi Lazer xuyên thấu mượn từ Goku
    function taoTiaLaser(radius, colorHex) {
        const group = new THREE.Group();
        const geoLoi = new THREE.CylinderGeometry(radius * 0.4, radius * 0.4, 1, 16);
        geoLoi.rotateX(Math.PI / 2); 
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false });
        const loi = new THREE.Mesh(geoLoi, matLoi);
        
        const geoVo = new THREE.CylinderGeometry(radius, radius, 1, 16);
        geoVo.rotateX(Math.PI / 2);
        const matVo = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
        const vo = new THREE.Mesh(geoVo, matVo);
        
        group.add(loi); group.add(vo);
        return group;
    }

    window.thoiDiemNoCuoiCungFK = 0;
    function taoHieuUngNoLaser(pos, colorHex = 0x00ffff, banKinh = 10, upVector = new THREE.Vector3(0,1,0)) {
        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungFK < 200) return; 
        window.thoiDiemNoCuoiCungFK = bayGio;
        
        if (typeof window.phatAmThanh === 'function') window.phatAmThanh('uploads/anims/hit.mp3', 0.5);

        const vfxGroup = new THREE.Group();
        vfxGroup.position.copy(pos);

        const soLuong = window.isMobile ? 15 : 60; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = 0; posArr[i*3+1] = 0; posArr[i*3+2] = 0;
            let dir = new THREE.Vector3((Math.random() - 0.5) * 12, Math.random() * 6, (Math.random() - 0.5) * 12);
            dir.applyQuaternion(qNolo);
            vels.push(dir);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureNoFK) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(0, 255, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureNoFK = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: colorHex, size: window.isMobile ? 6.0 : 12.0, map: window.textureNoFK, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const pts = new THREE.Points(geo, mat); 
        vfxGroup.add(pts);

        // Lớp Sóng xung kích của Lazer
        const geoSong = new THREE.RingGeometry(0.1, 1.0, 32);
        const matSong = new THREE.MeshBasicMaterial({
            color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const songXungKich = new THREE.Mesh(geoSong, matSong);
        songXungKich.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upVector);
        songXungKich.position.add(upVector.clone().multiplyScalar(0.5)); 
        vfxGroup.add(songXungKich);

        scene.add(vfxGroup);
        hieuUngFranky.push({ group: vfxGroup, pts: pts, velocities: vels, songXungKich: songXungKich, life: 25, maxScale: banKinh, upVector: upVector.clone() }); 
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
    window.tungComboFranky = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
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
            if (pUp.includes('ATTACK4') || pUp === 'F') { loaiChieu = 'F'; animCanMua = 'ATTACK6'; }
            else if (pUp.includes('ATTACK3') || pUp === 'R') { loaiChieu = 'R'; animCanMua = 'ATTACK4'; }
            else if (pUp.includes('ATTACK2') || pUp === 'E') { loaiChieu = 'E'; animCanMua = 'ATTACK5'; }
            else if (pUp.includes('ATTACK1') || pUp === 'Q') { loaiChieu = 'Q'; animCanMua = 'ATTACK1'; }
            else if (pUp.includes('ATTACK') || pUp.includes('SKILL')) {
                let arr = ['Q', 'E', 'R', 'F'];
                loaiChieu = arr[Math.floor(Math.random() * arr.length)];
                if (loaiChieu === 'Q') animCanMua = 'ATTACK1';
                if (loaiChieu === 'E') animCanMua = 'ATTACK5';
                if (loaiChieu === 'R') animCanMua = 'ATTACK4';
                if (loaiChieu === 'F') animCanMua = 'ATTACK6';
            }
        }

        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
            
            // F bắn Laser 1 giây -> Khóa múa 1000ms
            if (window.henGioTatMuaFK) clearTimeout(window.henGioTatMuaFK);
            window.henGioTatMuaFK = setTimeout(() => { window.dangMuaChieu = false; }, loaiChieu === 'F' ? 1000 : 600);
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
            let targetRadar = window.layMucTieuGanNhatFK(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) {
                let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(targetRadar.mesh) : null;
                mucTieu = (hitBox && hitBox.tamNguc) ? hitBox.tamNguc.clone() : targetRadar.mesh.position.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Franky', 
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
        // 🔥 CHIÊU Q: Bắn Bàn Tay Sắt (canhtayfranky)
        // =====================================
        if (loaiChieu === 'Q') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                let cDir = new THREE.Vector3(); if (isRemote) cDir.copy(huongMat); else { curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize(); }
                
                // Track xương RHand_Palm_018
                let tayPhai = timXuong(curNvc, ['RHand_Palm_018', 'RHand', 'mixamorigRightHand']);
                let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(3.5));
                if (tayPhai) tayPhai.getWorldPosition(diemBan);

                const taySat = taoVatTheFranky('canhtayfranky', 2.0); 
                taySat.position.copy(diemBan).add(cDir.clone().multiplyScalar(1.0));
                taySat.up.copy(cUp); taySat.lookAt(mucTieu); scene.add(taySat);
                
                kyNangFranky.push({
                    mesh: taySat, type: 'BAY_THANG', speed: 10.0, life: 80, delay: 0,
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.4, isRemote: isRemote, noBanKinh: 12, upVector: cUp.clone()
                });
            }, 100);
        }

        // =====================================
        // 🔥 CHIÊU E: Kiếm Khí Chữ Thập (Copy từ Zoro)
        // =====================================
        else if (loaiChieu === 'E') {
            let offsetRight = new THREE.Vector3().crossVectors(huongMat, upVector).normalize();
            
            for (let i = 0; i < 2; i++) {
                let soNgauNhien = Math.floor(Math.random() * 6) + 1;
                let urlCanTai = 'uploads/anims/KIEMQUANG' + soNgauNhien + '.glb';
                
                const kq = taoVatTheFranky('KIEMQUANG' + soNgauNhien, 40); // 40 size bự y chang Zoro

                let offset = (i - 0.5) * 1.5; 
                let posNongGoc = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(2.5)).add(offsetRight.clone().multiplyScalar(offset));

                kq.position.copy(posNongGoc);
                kq.up.copy(upVector);

                let targetBay = mucTieu.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0));
                kq.lookAt(targetBay);

                // Chém chéo chữ X
                kq.rotateZ((i % 2 === 0) ? (Math.PI / 4) : (-Math.PI / 4));

                kq.visible = false; 
                scene.add(kq);

                kyNangFranky.push({
                    mesh: kq, type: 'BAY_THANG', speed: 12.0, life: 80, delay: 10 + (i * 4), 
                    targetPos: targetBay, damage: dameGoc * 0.3, isRemote: isRemote, noBanKinh: 12, upVector: upVector.clone()
                });
            }
        }

        // =====================================
        // 🔥 CHIÊU R: Radical Beam Nhỏ (Từ Body_Belly_02)
        // =====================================
        else if (loaiChieu === 'R') {
            let tiaR = taoTiaLaser(2.0, 0x00ccff); // Lazer xanh nhạt
            scene.add(tiaR);
            
            kyNangFranky.push({ 
                mesh: tiaR, type: 'TIA_LASER', life: 25, owner: nvc, 
                targetPos: mucTieu.clone(), damage: dameGoc * 0.2, isRemote: isRemote, 
                color: 0x00ccff, upVector: upVector.clone(), noBanKinh: 8 
            });
        }

        // =====================================
        // 🔥 CHIÊU F: SUPER RADICAL BEAM 1 GIÂY (To hơn, Lâu hơn)
        // =====================================
        else if (loaiChieu === 'F') {
            let tiaF = taoTiaLaser(5.0, 0x00ffff); // Lazer xanh chói lóa khổng lồ
            scene.add(tiaF);
            
            kyNangFranky.push({ 
                mesh: tiaF, type: 'TIA_LASER', life: 33, // Khoảng 1 giây nã liên tục
                owner: nvc, 
                targetPos: mucTieu.clone(), damage: dameGoc * 0.3, isRemote: isRemote, 
                color: 0x00ffff, upVector: upVector.clone(), noBanKinh: 15 
            });
        }
    };

    // ==========================================
    // 4. VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU 
    // ==========================================
    window.updateCombatFranky = function () {
        for (let i = kyNangFranky.length - 1; i >= 0; i--) {
            let s = kyNangFranky[i]; 

            // Delay cho chiêu E (Zoro)
            if (typeof s.delay === 'number' && s.delay > 0) {
                s.delay--;
                if (s.delay <= 0 && s.mesh) s.mesh.visible = true;
                continue; 
            }

            s.life--;

            if (s.mesh && s.mesh.userData && s.mesh.userData.mixer) s.mesh.userData.mixer.update(0.03);

            // 🛑 LÕI KIẾM QUANG & CÁNH TAY BAY
            if (s.type === 'BAY_THANG') {
                if (s.targetPos) {
                    if (!s.isRemote) {
                        let objMoi = window.layMucTieuGanNhatFK(s.mesh.position);
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
                    if (s.isRemote === false) gaySatThuongFK(diemNo, s.damage, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(diemNo, s.damage, s.noBanKinh);

                    taoHieuUngNoLaser(diemNo, s.color || 0x00ffff, s.noBanKinh, s.upVector);
                    s.life = 0;
                }
            }
            // 🛑 LÕI RADICAL BEAM GOKU TRACKING TỪ BỤNG
            else if (s.type === 'TIA_LASER') {
                if (s.owner && s.owner.parent) {
                    // Update Trục Cầu
                    let cUp = s.upVector || new THREE.Vector3(0,1,0);
                    if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                        cUp = s.owner.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                        s.upVector.copy(cUp);
                    }

                    // Tọa độ bắn từ Xương Bụng Franky
                    let startPos = new THREE.Vector3();
                    let xuongBung = timXuong(s.owner, ['Body_Belly_02', 'Spine', 'Chest', 'mixamorigSpine']);
                    if (xuongBung) {
                        xuongBung.getWorldPosition(startPos);
                    } else {
                        s.owner.getWorldPosition(startPos);
                        startPos.add(cUp.clone().multiplyScalar(3.5));
                    }
                    
                    if (!s.isRemote) {
                        let mucTieuMoi = window.layMucTieuGanNhatFK(startPos);
                        if (mucTieuMoi && mucTieuMoi.mesh) {
                            let hit = window.layHitbox(mucTieuMoi.mesh);
                            s.targetPos = hit.tamNguc.clone();
                            
                            let dummy = new THREE.Object3D(); 
                            dummy.position.copy(s.owner.position); 
                            dummy.up.copy(cUp);
                            dummy.lookAt(s.targetPos);
                            s.owner.quaternion.slerp(dummy.quaternion, 0.2); // Tự động xoay người Franky theo tia Beam
                        }
                    }

                    let endPos = s.targetPos;
                    let dist = startPos.distanceTo(endPos);
                    if (dist < 1) dist = 1;

                    // Vẽ tia Laser kéo dài từ bụng đến mục tiêu
                    s.mesh.scale.z = dist; 
                    let midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
                    s.mesh.position.copy(midPoint);
                    
                    s.mesh.up.copy(cUp); 
                    s.mesh.lookAt(endPos);

                    // Giật sát thương liên tục 5 frames/lần
                    if (s.life % 5 === 0) {
                        taoHieuUngNoLaser(endPos, s.color, s.noBanKinh, cUp);
                        if (s.isRemote === false) {
                            gaySatThuongFK(endPos, s.damage, s.noBanKinh, s.color === 0x00ffff ? '#00ffff' : '#00ccff');
                        } else {
                            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(endPos, s.damage, s.noBanKinh);
                        }
                    }
                } else {
                    s.life = 0; 
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangFranky.splice(i, 1);
            }
        }

        // 🛑 BỤI HIỆU ỨNG NỔ LASER
        for (let i = hieuUngFranky.length - 1; i >= 0; i--) {
            let vfx = hieuUngFranky[i]; 
            vfx.life--;
            
            let posArr = vfx.pts.geometry.attributes.position.array;
            
            let fallVec = vfx.upVector ? vfx.upVector.clone().multiplyScalar(-0.3) : new THREE.Vector3(0, -0.3, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += vfx.velocities[j].x;
                posArr[j * 3 + 1] += vfx.velocities[j].y;
                posArr[j * 3 + 2] += vfx.velocities[j].z;
                
                vfx.velocities[j].x *= 0.85; 
                vfx.velocities[j].y *= 0.85; 
                vfx.velocities[j].z *= 0.85; 
                vfx.velocities[j].add(fallVec); 
            }
            vfx.pts.geometry.attributes.position.needsUpdate = true;
            
            let maxLife = 25;
            vfx.pts.material.opacity = vfx.life / maxLife;

            if (vfx.songXungKich) {
                let tienTrinh = 1 - (vfx.life / maxLife);
                let scaleSong = vfx.maxScale * tienTrinh; 
                vfx.songXungKich.scale.set(scaleSong, scaleSong, 1);
                vfx.songXungKich.material.opacity = (vfx.life / maxLife) * 0.6;
            }

            if (vfx.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(vfx.group);
                if (vfx.pts && vfx.pts.geometry) vfx.pts.geometry.dispose();
                if (vfx.pts && vfx.pts.material) vfx.pts.material.dispose();
                if (vfx.songXungKich && vfx.songXungKich.geometry) vfx.songXungKich.geometry.dispose();
                if (vfx.songXungKich && vfx.songXungKich.material) vfx.songXungKich.material.dispose();
                hieuUngFranky.splice(i, 1);
            }
        }

        // 🛑 SỐ SÁT THƯƠNG
        for (let i = danhSachSoBayFK.length - 1; i >= 0; i--) {
            let it = danhSachSoBayFK[i]; it.offsetY += 0.05; it.life--;
            if (typeof camera !== 'undefined' && it.pos) {
                const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
                if (p.z < 1) {
                    it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
                } else it.el.style.display = 'none';
            } else it.el.style.display = 'none';
            
            if (it.life <= 0) { 
                if (it.el && it.el.parentNode) it.el.parentNode.removeChild(it.el);
                danhSachSoBayFK.splice(i, 1); window.tongSoChuNoi_FK--; 
            }
        }
    };
    setInterval(window.updateCombatFranky, 30);

    // ==========================================
    // 5. KHỞI TẠO & ĐĂNG KÝ HỆ PHÁI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('franky')) {
        window.HePhaiHienTai = {
            tenPhai: "Cyborg Franky",
            khoiTao: function () {
                console.log("🤖 SUUUUPER! Kích hoạt Cyborg Đại Bác Laser!");
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/canhtayfranky.glb', () => {});
                    for (let i = 1; i <= 6; i++) {
                        window.taiHoacNhanBanAsset('uploads/anims/KIEMQUANG' + i + '.glb', () => {});
                    }
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
            tungChieu: window.tungComboFranky,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();

// =========================================================================
// 6. ÁNH XẠ CHỮA BỆNH CÂM NÍN 100% CHO AI BOSS
// =========================================================================
window.tungCombofranky = window.tungComboFranky;
window.tungComboFranky = window.tungComboFranky;
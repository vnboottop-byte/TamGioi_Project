// ==========================================
// 🐉 HỆ THỐNG KỸ NĂNG: GOKU (SIÊU SAIYAN - MASTER V8)
// 👑 CÔNG NGHỆ: INSTANT CAST + KAMEHAMEHA TRỤC CẦU 3D + DYNAMIC GENKI DAMA
// ==========================================

(function () {
    const kyNangGoku = [];
    const hieuUngGoku = [];
    const danhSachSoBayGK = [];

    // 🌟 VÁ LỖI 3: ĐÃ CẮT BỎ BỘ ĐẾM COOLDOWN CỤC BỘ (Để Controller.js tự lo)
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

    // TÌM TỌA ĐỘ BÀN TAY (Tracker Khung Xương Động)
    window.layViTriTayGoku = function(nvc, fallbackHuong, curUp) {
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
            tayPos.add(curUp.clone().multiplyScalar(5));
            if (fallbackHuong) tayPos.add(fallbackHuong.clone().multiplyScalar(2));
        }
        return tayPos;
    };

    // ĐÚC ĐẠN PROCEDURAL (Cực kỳ Tối ưu RAM)
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

    // 🔥 NỔ KIỂU PHÁP SƯ MỊN MÀNG CHUẨN MỰC (ĐÃ CHUẨN HÓA UPVECTOR)
    window.thoiDiemNoCuoiCungGK = 0;
    function taoVuNoKame(pos, colorHex = 0xffcc00, banKinh = 10, upVector = new THREE.Vector3(0,1,0)) {
        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungGK < 300) return; 
        window.thoiDiemNoCuoiCungGK = bayGio;
        
        if (typeof window.phatAmThanh === 'function') window.phatAmThanh('uploads/anims/hit.mp3', 0.5);

        const vfxGroup = new THREE.Group();
        vfxGroup.position.copy(pos);

        const soLuong = window.isMobile ? 10 : 150; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = 0; posArr[i*3+1] = 0; posArr[i*3+2] = 0;
            let dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            let speed = 2 + Math.random() * 8;
            vels.push(dir.multiplyScalar(speed));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        const texture = (typeof window.layTextureLua === 'function') ? window.layTextureLua() : null;
        const mat = new THREE.PointsMaterial({
            color: colorHex, size: window.isMobile ? 18.0 : 12.0, map: texture, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const pts = new THREE.Points(geo, mat); 
        vfxGroup.add(pts);

        // Lớp Sóng xung kích
        const geoSong = new THREE.RingGeometry(0.1, 1.0, 32);
        const matSong = new THREE.MeshBasicMaterial({
            color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const songXungKich = new THREE.Mesh(geoSong, matSong);
        
        // 🌟 VÁ LỖI TRỤC CẦU: Ép vòng sóng nổ vuông góc với mặt đất
        songXungKich.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upVector);
        songXungKich.position.add(upVector.clone().multiplyScalar(0.5)); 
        vfxGroup.add(songXungKich);

        scene.add(vfxGroup);
        hieuUngGoku.push({ group: vfxGroup, pts: pts, velocities: vels, songXungKich: songXungKich, life: window.isMobile ? 30 : 60, maxScale: banKinh }); 
    }

    // ==========================================
    // ✨ TUNG CHIÊU GOKU (INSTANT CAST - CHỐNG MÚA TAY KHÔNG)
    // ==========================================
    window.tungComboGoku = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        
        // 🌟 BẢN VÁ: TÌM CHÍNH XÁC KHUNG XƯƠNG BOSS
        if (isRemote && casterId) {
            if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            } else if (typeof window.danhSachQuaiVat !== 'undefined') {
                let boss = window.danhSachQuaiVat.find(q => q.id == casterId || q.id === casterId);
                if (boss && boss.mesh) nvc = boss.mesh;
            }
        }
        // NẾU LÀ NGƯỜI CHƠI MÀ KHÔNG CÓ THỂ XÁC THÌ MỚI RETURN, BOSS THÌ VẪN BẮN DÙA VÀO TỌA ĐỘ!
        if (!nvc && !isRemote) return;

        // 🌟 BẢN VÁ: DỊCH NGÔN NGỮ AI SANG CHIÊU THỨC
        let loaiChieu = phim;
        if (typeof phim === 'string') {
            let pUp = phim.toUpperCase();
            if (pUp.includes('ATTACK4') || pUp === 'F') loaiChieu = 'F';
            else if (pUp.includes('ATTACK3') || pUp === 'R') loaiChieu = 'R';
            else if (pUp.includes('ATTACK2') || pUp === 'E') loaiChieu = 'E';
            else if (pUp.includes('ATTACK1') || pUp === 'Q') loaiChieu = 'Q';
            else if (pUp.includes('ATTACK') || pUp.includes('SKILL')) {
                let arr = ['Q', 'E', 'R', 'F'];
                loaiChieu = arr[Math.floor(Math.random() * arr.length)];
            }
        }

        let viTriGoc = new THREE.Vector3(); 
        let huongMat = new THREE.Vector3(); 
        let upVector = new THREE.Vector3(0,1,0);
        if (nvc && nvc.up) upVector.copy(nvc.up).normalize();
        let mucTieuGoc = new THREE.Vector3();
        let targetQuaiGlobal = null; 
        
        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        if (isRemote) {
            if (remoteGoc) {
                viTriGoc.set(remoteGoc.x, remoteGoc.y, remoteGoc.z); 
                if (viTriGoc.lengthSq() > 0.001) upVector.copy(viTriGoc).normalize(); 
            } else if (nvc) {
                if (nvc.position.lengthSq() > 0.001) upVector.copy(nvc.position).normalize();
                viTriGoc.copy(nvc.position).add(upVector.clone().multiplyScalar(3.5));
            }
            
            if (remoteHuong) huongMat.set(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            else if (nvc) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
            
            if (remoteDich) mucTieuGoc.set(remoteDich.x, remoteDich.y, remoteDich.z);
            else mucTieuGoc = viTriGoc.clone().add(huongMat.clone().multiplyScalar(150));
        } else {
            nvc.getWorldPosition(viTriGoc); 
            
            if (typeof camera !== 'undefined' && !isRemote) {
                camera.getWorldDirection(huongMat);
                huongMat.projectOnPlane(upVector).normalize();
                if (huongMat.lengthSq() < 0.001) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
            } else {
                nvc.getWorldDirection(huongMat);
                huongMat.projectOnPlane(upVector).normalize();
            }
            if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }

            targetQuaiGlobal = window.layMucTieuGanNhatGK(viTriGoc);
            if (targetQuaiGlobal && targetQuaiGlobal.mesh) {
                let hit = window.layHitbox(targetQuaiGlobal.mesh);
                mucTieuGoc = hit.tamNguc.clone();
                
                let dummy = new THREE.Object3D(); 
                dummy.position.copy(nvc.position); 
                dummy.up.copy(upVector);
                dummy.lookAt(mucTieuGoc);
                nvc.quaternion.copy(dummy.quaternion);
                
                nvc.getWorldDirection(huongMat);
                huongMat.projectOnPlane(upVector).normalize();
            } else {
                mucTieuGoc = viTriGoc.clone().add(upVector.clone().multiplyScalar(3.5)).add(huongMat.clone().multiplyScalar(60));
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
                if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenChieu);
                if (window.henGioTatMuaGK) clearTimeout(window.henGioTatMuaGK);
                window.henGioTatMuaGK = setTimeout(() => { window.dangMuaChieu = false; }, thoiGian);
            }
        }

        // 🌟 Q: BẮN 1 QUẢ CẦU KI
        if (loaiChieu === 'Q') {
            hackKhoaEngine('ATTACK', 600);
            let tayPos = nvc ? window.layViTriTayGoku(nvc, huongMat, upVector) : viTriGoc.clone();
            let cauQ = taoCauAnhSang(2.0, 0xffcc00);
            cauQ.position.copy(tayPos);
            cauQ.up.copy(upVector); 
            cauQ.lookAt(mucTieuGoc);
            scene.add(cauQ);
            
            kyNangGoku.push({ mesh: cauQ, type: 'CAU_THUONG', speed: 10.0, life: 100, targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.4, isRemote: isRemote, upVector: upVector.clone() });
        }
        
        // 🌟 E: KAMEHAMEHA NHỎ 
        else if (loaiChieu === 'E') {
            hackKhoaEngine('ATTACKhold', 1000);
            let tiaE = taoTiaKamehameha(3.0, 0x00ffff); 
            scene.add(tiaE);
            
            // Nếu không tìm thấy nvc, gán owner = null để đạn bay thẳng mà không cần track tay
            let thucTheBan = nvc || null;
            kyNangGoku.push({ mesh: tiaE, type: 'TIA_KAME', life: 30, owner: thucTheBan, fixPos: viTriGoc.clone(), targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.1, isRemote: isRemote, color: 0x00ffff, upVector: upVector.clone() });
        }

        // 🌟 R: ĐẠI KAMEHAMEHA 
        else if (loaiChieu === 'R') {
            hackKhoaEngine('ATTACKhold', 1500);
            let tiaR = taoTiaKamehameha(5.0, 0xff0000); 
            scene.add(tiaR);
            
            let thucTheBan = nvc || null;
            kyNangGoku.push({ mesh: tiaR, type: 'TIA_KAME', life: 60, owner: thucTheBan, fixPos: viTriGoc.clone(), targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.042, isRemote: isRemote, color: 0xff0000, upVector: upVector.clone() });
        }

        // 🌟 F: QUẢ CẦU KÊNH KHI
        else if (loaiChieu === 'F') {
            hackKhoaEngine('ATTACKhold', 1200); 
            
            // Biến cục bộ để nhiều Boss F cùng lúc không đè mất chiêu của nhau
            let localTimeout = 'timeoutGoku_F_' + (casterId || 'player');
            if (window[localTimeout]) clearTimeout(window[localTimeout]);

            window[localTimeout] = setTimeout(() => {
                let curNvc = isRemote ? nvc : ((typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh);
                
                if (!isRemote && typeof window.epNhanVatMua === 'function') window.epNhanVatMua('ATTACK');
                
                let curUp = isRemote ? upVector.clone() : (curNvc && curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0,1,0));
                let huongMoi = new THREE.Vector3(); 
                
                if (isRemote) huongMoi.copy(huongMat);
                else if (curNvc) {
                    curNvc.getWorldDirection(huongMoi); huongMoi.projectOnPlane(curUp).normalize();
                } else huongMoi.copy(huongMat);
                
                let tayPosMoi = curNvc ? window.layViTriTayGoku(curNvc, huongMoi, curUp) : viTriGoc.clone();
                tayPosMoi.add(curUp.clone().multiplyScalar(5)); 

                let newTargetObj = null;
                let newTargetPos = mucTieuGoc.clone();
                if (!isRemote && curNvc) {
                    newTargetObj = window.layMucTieuGanNhatGK(curNvc.position);
                    if (newTargetObj && newTargetObj.mesh) {
                        newTargetPos = window.layHitbox(newTargetObj.mesh).tamNguc.clone();
                    } else {
                        newTargetPos = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5)).add(huongMoi.clone().multiplyScalar(60));
                    }
                }

                let cauGenki = taoCauAnhSang(2.0, 0x00aaff); 
                cauGenki.scale.set(10, 10, 10); 
                cauGenki.position.copy(tayPosMoi);
                cauGenki.up.copy(curUp); 
                cauGenki.lookAt(newTargetPos);
                scene.add(cauGenki);
                
                kyNangGoku.push({ 
                    mesh: cauGenki, type: 'GENKI_DAMA_TAM_NHIET', speed: 6.0, life: 200, 
                    targetPos: newTargetPos, targetObj: newTargetObj, damage: dameGoc * 1.0, isRemote: isRemote,
                    upVector: curUp.clone()
                });
            }, 800); 
        }
    };

    window.updateCombatGoku = function () {
        
        // 🛑 VÒNG LẶP 1: CHIÊU THỨC (CẦU, TIA LAZER)
        for (let i = kyNangGoku.length - 1; i >= 0; i--) {
            let s = kyNangGoku[i]; 
            s.life--;

            if (s.type === 'CAU_THUONG') {
                s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 3) {
                    taoVuNoKame(s.mesh.position, 0xffcc00, 10, s.upVector);
                    if (s.isRemote === false) gaySatThuongGK(s.mesh.position, s.damage, 10);
                    else {
                        // 🌟 BẢN VÁ 6: PHÁ KHIÊN NUMBER (Goku Boss bắn là trừ máu sòng phẳng)
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.mesh.position, s.damage, 10);
                    }
                    s.life = 0;
                }
            }
            
            else if (s.type === 'GENKI_DAMA_TAM_NHIET') {
                if (s.targetObj && !s.targetObj.isDead && s.targetObj.mesh) {
                    let hit = window.layHitbox(s.targetObj.mesh);
                    s.targetPos = hit.tamNguc.clone(); 
                } else if (!s.isRemote) {
                    let mucTieuMoi = window.layMucTieuGanNhatGK(s.mesh.position);
                    if (mucTieuMoi && mucTieuMoi.mesh) {
                        s.targetObj = mucTieuMoi;
                        let hit = window.layHitbox(mucTieuMoi.mesh);
                        s.targetPos = hit.tamNguc.clone();
                    }
                }

                if (s.targetPos) {
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(s.mesh.position);
                    dummy.up.copy(s.upVector || new THREE.Vector3(0,1,0)); 
                    dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.15); 
                }

                s.mesh.translateZ(s.speed); 
                
                if (s.mesh.scale.x < 30.0) { 
                    s.mesh.scale.addScalar(0.4); 
                }

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 15) {
                    taoVuNoKame(s.mesh.position, 0x00aaff, 40, s.upVector);
                    if (s.isRemote === false) gaySatThuongGK(s.mesh.position, s.damage, 40);
                    else {
                        // 🌟 BẢN VÁ 6: PHÁ KHIÊN NUMBER 
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.mesh.position, s.damage, 40);
                    }
                    s.life = 0;
                }
            }

            else if (s.type === 'TIA_KAME') {
                if (s.owner && s.owner.parent) {
                    let cUp = s.upVector || new THREE.Vector3(0,1,0);
                    let fwd = new THREE.Vector3(); s.owner.getWorldDirection(fwd);
                    
                    let startPos = window.layViTriTayGoku(s.owner, fwd, cUp);
                    
                    if (!s.isRemote) {
                        let mucTieuMoi = window.layMucTieuGanNhatGK(startPos);
                        if (mucTieuMoi && mucTieuMoi.mesh) {
                            let hit = window.layHitbox(mucTieuMoi.mesh);
                            s.targetPos = hit.tamNguc.clone();
                            
                            let dummy = new THREE.Object3D(); 
                            dummy.position.copy(s.owner.position); 
                            dummy.up.copy(cUp);
                            dummy.lookAt(s.targetPos);
                            s.owner.quaternion.slerp(dummy.quaternion, 0.2);
                        }
                    }

                    let endPos = s.targetPos;
                    let dist = startPos.distanceTo(endPos);
                    if (dist < 1) dist = 1;

                    s.mesh.scale.z = dist; 
                    let midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
                    s.mesh.position.copy(midPoint);
                    
                    s.mesh.up.copy(cUp); 
                    s.mesh.lookAt(endPos);

                    if (s.life % 5 === 0) {
                        taoVuNoKame(endPos, s.color, 8, cUp);
                        if (s.isRemote === false) {
                            gaySatThuongGK(endPos, s.damage, 8, (s.color === 0xff0000 ? '#ff0000' : '#00ffff'));
                        } else {
                            // 🌟 BẢN VÁ 6: PHÁ KHIÊN NUMBER
                            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(endPos, s.damage, 8);
                        }
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
        
        // 🛑 VÒNG LẶP 2: HIỆU ỨNG VFX NỔ (LỬA PHÁP SƯ)
        for (let i = hieuUngGoku.length - 1; i >= 0; i--) {
            let vfx = hieuUngGoku[i]; 
            vfx.life--;
            
            let posArr = vfx.pts.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += vfx.velocities[j].x;
                posArr[j * 3 + 1] += vfx.velocities[j].y;
                posArr[j * 3 + 2] += vfx.velocities[j].z;
                
                vfx.velocities[j].x *= 0.85; 
                vfx.velocities[j].y *= 0.85; 
                vfx.velocities[j].z *= 0.85; 
            }
            vfx.pts.geometry.attributes.position.needsUpdate = true;
            
            let maxLife = window.isMobile ? 30 : 60;

            vfx.pts.material.size += 0.4; 
            vfx.pts.material.opacity = vfx.life / maxLife;
            if (vfx.life < maxLife * 0.6) vfx.pts.material.color.setHex(0xff3300); 
            if (vfx.life < maxLife * 0.25) {
                vfx.pts.material.color.setHex(0x111111); 
                vfx.pts.material.blending = THREE.NormalBlending;
            }

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
                hieuUngGoku.splice(i, 1);
            }
        }

        // 🛑 VÒNG LẶP 3: SỐ SÁT THƯƠNG UI
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
                console.log("🐉 Lõi Kamehameha kích hoạt: Bản V8 Không Độ Trễ, Trục 3D Tuyệt Đối!");

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


// =========================================================================
// 🌟 ÁNH XẠ CHỮA CÂM NÍN 100% CHO AI BOSS GOKU (PHIÊN BẢN GOKU 3)
// =========================================================================
window.tungCombogoku    = window.tungComboGoku;
window.tungComboGoku    = window.tungComboGoku;
window.tungComboGoku3   = window.tungComboGoku; // 👈 CHÍNH LÀ NÓ NÀY SẾP!
window.tungCombogoku3   = window.tungComboGoku;
window.tungComboGoku_3  = window.tungComboGoku;
window.tungComboSonGoku = window.tungComboGoku;
window.tungCombosongoku = window.tungComboGoku;
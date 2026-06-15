// ==========================================
// 🏰 MÔN PHÁI ĐOẠT XÁ: BỐ GIÀ CAPONE BEGE (PHÁO ĐÀI SỐNG)
// 👑 CÔNG NGHỆ: MỞ KHÓA SPAM LIÊN THANH + VÁ LỖI TRỤC CẦU 3D & TỌA ĐỘ ĐỘNG
// ==========================================

(function () {
    const kyNangBege = [];
    const hieuUngBege = [];
    const danhSachSoBayBege = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Bege = 0;

    // 🌟 1. HIỂN THỊ SÁT THƯƠNG
    function taoSoSatThuongBege(pos3D, satThuong, mauSac = '#ff3300') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_Bege > 5) return;
        window.tongSoChuNoi_Bege++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #550000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayBege.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 2. RADAR QUÉT MỤC TIÊU 150M
    window.layMucTieuGanNhatBege = function (viTriGoc) {
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

    // 🌟 3. LÕI GÂY SÁT THƯƠNG
    function gaySatThuongBege(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongBege(posHienSo, luongSatThuong);
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
                            taoSoSatThuongBege(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ffaa00');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongBege(hit.tamNguc.clone(), luongSatThuong);
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

    // 🌟 4. HIỆU ỨNG VỤ NỔ
    function taoVuNoBege(pos, banKinh = 15, upVector = new THREE.Vector3(0, 1, 0)) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        else if (typeof window.playSound === 'function') window.playSound('no');

        const soLuong = 50; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];
        
        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + 1; posArr[i * 3 + 2] = pos.z;
            let speed = Math.random() * 2.5 + 0.5;
            let vLocal = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vLocal.applyQuaternion(qNolo); 
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiBege) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(255, 50, 0, 0.9)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiBege = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xff4400, size: window.isMobile ? 5.0 : 9.0, map: window.textureBuiBege,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngBege.push({ system: pts, velocities: vels, life: 25, upVector: upVector.clone() });
    }

    // 🌟 5. ĐUÔI LỬA TÊN LỬA
    function taoDuoiLuaMiniBege(pos, direction, speed, upVector = new THREE.Vector3(0,1,0)) {
        if (window.isMobile && Math.random() > 0.5) return; 
        const soLuong = 4; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            let offset = new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5);
            posArr[i * 3] = pos.x + offset.x; posArr[i * 3 + 1] = pos.y + offset.y; posArr[i * 3 + 2] = pos.z + offset.z;

            let tocDoHat = (speed * 0.1) + Math.random() * 0.5;
            let vec = direction.clone().multiplyScalar(tocDoHat).add(offset.multiplyScalar(0.05));
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        const bangMau = [0xffaa00, 0xff2200, 0xffff00]; 
        const mauChon = bangMau[Math.floor(Math.random() * bangMau.length)];

        const mat = new THREE.PointsMaterial({ color: mauChon, size: 2.5 + Math.random() * 2.0, transparent: true, opacity: 0.8, map: window.textureBuiBege, blending: THREE.AdditiveBlending, depthWrite: false });
        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngBege.push({ system: pts, velocities: vels, life: 15, type: 'trail', upVector: upVector.clone() });
    }

    // 🌟 6. ĐÚC MODEL (HỖ TRỢ vukhibege & VIENDAN)
    function taoVatTheBege(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        if (Array.isArray(c.material)) c.material.forEach(m => m.transparent = true);
                        else c.material.transparent = true;
                    }
                });
                v.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(v);
                const size = new THREE.Vector3(); box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                let tiLeChuan = scaleSize / maxDim;
                v.scale.set(tiLeChuan, tiLeChuan, tiLeChuan);
                v.rotation.set(0, 0, 0);
                group.add(v);
            });
        }
        return group;
    }

    // ==========================================
    // 🏹 TUNG CHIÊU BEGE
    // ==========================================
    window.tungComboBege = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        let animCanMua = 'ATTACK1';
        if (phim === 'Q') animCanMua = 'ATTACK4'; 
        if (phim === 'E') animCanMua = 'ATTACK4'; 
        if (phim === 'R') animCanMua = 'ATTACK1'; 
        if (phim === 'F') animCanMua = 'ATTACK3'; 

        // ===============================================
        // 🌟 BƯỚC ĐỘT PHÁ TẠI ĐÂY: XÓA `return` BLOCK ĐỂ CHỐNG NUỐT CHIÊU
        // ===============================================
        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);

            if (phim === 'F') {
                let loopCount = 0;
                let fLoop = setInterval(() => {
                    if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua('ATTACK3');
                    loopCount++;
                    if (loopCount >= 3) clearInterval(fLoop); 
                }, 500);
                
                if (window.henGioTatMuaBG) clearTimeout(window.henGioTatMuaBG);
                window.henGioTatMuaBG = setTimeout(() => { window.dangMuaChieu = false; }, 1500);
            } else {
                if (window.henGioTatMuaBG) clearTimeout(window.henGioTatMuaBG);
                window.henGioTatMuaBG = setTimeout(() => { window.dangMuaChieu = false; }, 600); // 🌟 Thêm giải phóng cho Q, E, R
            }
        }

        let viTriGoc = new THREE.Vector3();
        let upVector = new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3();
        let mucTieu = null;

        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            upVector = viTriGoc.clone().normalize(); 
            huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                upVector = nvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
            } else if (nvc.up) {
                upVector = nvc.up.clone().normalize();
            }
            nvc.getWorldDirection(huongMat); huongMat.normalize();
            viTriGoc = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5)); 

            let targetRadar = window.layMucTieuGanNhatBege(viTriGoc);
            if (targetRadar && targetRadar.mesh) mucTieu = window.layHitbox(targetRadar.mesh).tamNguc.clone();
            else mucTieu = viTriGoc.clone().add(huongMat.clone().multiplyScalar(150));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Bege',
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        // 💣 ĐỘNG CƠ 1: BẮN ĐẠN PARABOL
        function banDanParabolBege(viTriNong, tenModel, soLuong, kichCo, chieuCaoVongCung, tocDo, heSoDame, banKinhNo) {
            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    let curNvc = nvc;
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                    let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                    curNvc.traverse(c => {
                        if (c.isBone) {
                            if (viTriNong === 'TAY' && c.name === 'Rhand_Weapon02_02_045') c.getWorldPosition(diemBan);
                            if (viTriNong === 'NGUC' && c.name === 'Bone') c.getWorldPosition(diemBan);
                        }
                    });

                    const vienDan = taoVatTheBege(tenModel, kichCo);
                    vienDan.position.copy(diemBan).add(curDir.clone().multiplyScalar(1.5));
                    
                    let doLech = soLuong > 1 ? 5 : 0;
                    let targetLecH = mucTieu.clone();
                    
                    if (!isRemote) { 
                        let objMoi = window.layMucTieuGanNhatBege(diemBan);
                        if (objMoi && objMoi.mesh) targetLecH = window.layHitbox(objMoi.mesh).tamNguc.clone();
                    }

                    if (doLech > 0) {
                        let vecLech = new THREE.Vector3((Math.random() - 0.5) * doLech, 0, (Math.random() - 0.5) * doLech);
                        vecLech.projectOnPlane(curUp); 
                        targetLecH.add(vecLech);
                    }

                    vienDan.up.copy(curUp); 
                    vienDan.lookAt(targetLecH);
                    scene.add(vienDan);
                    
                    let khoangCachToiDich = diemBan.distanceTo(targetLecH);
                    let thoiGianBay = khoangCachToiDich / tocDo;

                    kyNangBege.push({
                        mesh: vienDan, type: 'BAY_VONG_CUNG',
                        startPos: vienDan.position.clone(), targetPos: targetLecH, 
                        progress: 0, speedProgress: 1.0 / (thoiGianBay || 1), 
                        arcHeight: chieuCaoVongCung, upVector: curUp.clone(),
                        life: 200, damage: dameGoc * heSoDame, isRemote: isRemote, noBanKinh: banKinhNo
                    });
                }, i * 200);
            }
        }

        // 🚀 ĐỘNG CƠ 2: BẮN TÊN LỬA TẦM THẲNG 
        function banTenLuaBege(viTriNong, soLuong, delay, heSoDame) {
            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    let curNvc = nvc;
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                    let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                    curNvc.traverse(c => {
                        if (c.isBone) {
                            if (viTriNong === 'TAY' && c.name === 'Rhand_Weapon02_02_045') c.getWorldPosition(diemBan);
                            if (viTriNong === 'NGUC' && c.name === 'Bone') c.getWorldPosition(diemBan);
                        }
                    });

                    const tenLua = taoVatTheBege('vukhibege', 4.5); 
                    tenLua.position.copy(diemBan).add(curDir.clone().multiplyScalar(2));
                    
                    let targetLecH = mucTieu.clone();
                    if (!isRemote) { 
                        let objMoi = window.layMucTieuGanNhatBege(diemBan);
                        if (objMoi && objMoi.mesh) targetLecH = window.layHitbox(objMoi.mesh).tamNguc.clone();
                    }

                    if (soLuong > 1) { 
                        let vecLech = new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 8);
                        vecLech.projectOnPlane(curUp);
                        targetLecH.add(vecLech);
                    }
                    
                    tenLua.up.copy(curUp); 
                    tenLua.lookAt(targetLecH);
                    scene.add(tenLua);
                    
                    kyNangBege.push({
                        mesh: tenLua, type: 'BAY_THANG_ROCKET', speed: 10.0, life: 100,
                        targetPos: targetLecH, damage: dameGoc * heSoDame, isRemote: isRemote, noBanKinh: 18, upVector: curUp.clone()
                    });
                }, i * delay);
            }
        }

        if (phim === 'Q') banDanParabolBege('NGUC', 'VIENDAN', 1, 3.5, 10, 8.0, 0.4, 10);
        else if (phim === 'E') banDanParabolBege('NGUC', 'VIENDAN', 3, 3.5, 12, 8.0, 0.2, 12);
        else if (phim === 'R') banTenLuaBege('TAY', 3, 200, 0.166);
        else if (phim === 'F') banTenLuaBege('TAY', 10, 150, 0.1);
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU BEGE
    // ==========================================
    window.updateCombatBege = function () {
        
        for (let i = kyNangBege.length - 1; i >= 0; i--) {
            let s = kyNangBege[i]; s.life--;

            if (s.type === 'BAY_VONG_CUNG') {
                s.progress += s.speedProgress;
                if (s.progress > 1) s.progress = 1;

                let curPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, s.progress);
                curPos.add(s.upVector.clone().multiplyScalar(Math.sin(s.progress * Math.PI) * s.arcHeight));

                let huongBay = new THREE.Vector3().subVectors(curPos, s.mesh.position).normalize();
                s.mesh.position.copy(curPos);
                s.mesh.lookAt(curPos.clone().add(huongBay)); 

                if (s.progress >= 1 || s.life <= 0) {
                    if (s.isRemote === false) {
                        gaySatThuongBege(s.targetPos, s.damage, s.noBanKinh);
                    }
                    else {
                        // 🌟 BẢN VÁ: Gỡ gông cùm number, Pháo nổ là Sếp mất máu!
                        if (typeof window.gaySatThuongBossToPlayer === 'function') {
                            window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                        }
                    } 
                    taoVuNoBege(s.targetPos, s.noBanKinh, s.upVector);
                    s.life = 0;
                }
            }
            else if (s.type === 'BAY_THANG_ROCKET') {
                let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                
                let dirNguoc = huongBay.clone().negate();
                taoDuoiLuaMiniBege(s.mesh.position, dirNguoc, s.speed, s.upVector);

                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    let diemNoThucTe = (s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) ? s.targetPos.clone() : s.mesh.position.clone();

                    if (s.isRemote === false) {
                        gaySatThuongBege(diemNoThucTe, s.damage, s.noBanKinh);
                    }
                    else {
                        // 🌟 BẢN VÁ: Tên lửa chạm mặt là trừ HP Sếp!
                        if (typeof window.gaySatThuongBossToPlayer === 'function') {
                            window.gaySatThuongBossToPlayer(diemNoThucTe, s.damage, s.noBanKinh);
                        }
                    } 
                    taoVuNoBege(diemNoThucTe, s.noBanKinh, s.upVector);
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangBege.splice(i, 1);
            }
        }

        for (let i = hieuUngBege.length - 1; i >= 0; i--) {
            let h = hieuUngBege[i]; h.life--;

            let posArr = h.system.geometry.attributes.position.array;
            
            let bocKhoiVec = h.upVector ? h.upVector.clone().multiplyScalar(0.02) : new THREE.Vector3(0, 0.02, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; 
                posArr[j * 3 + 1] += h.velocities[j].y; 
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].multiplyScalar(0.9); 
                if (h.type !== 'trail') h.velocities[j].add(bocKhoiVec); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / (h.type === 'trail' ? 15 : 25);
            if (h.type === 'trail') h.system.material.size *= 0.95; 

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose(); 
                if (h.system.material) h.system.material.dispose(); 
                hieuUngBege.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayBege.length - 1; i >= 0; i--) {
            let it = danhSachSoBayBege[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';

            if (it.life <= 0) {
                it.el.remove();
                danhSachSoBayBege.splice(i, 1);
                window.tongSoChuNoi_Bege--;
            }
        }
    };

    setInterval(window.updateCombatBege, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI VÀ PRELOAD
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('bege')) {
        window.HePhaiHienTai = {
            tenPhai: "Bố Già Bege",
            khoiTao: function () {
                console.log("🏰 Pháo đài di động! Khởi động Bố Già Capone Bege (Spam Max Tốc & Sát Thương Chuẩn)!");

                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/VIENDAN.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/vukhibege.glb', () => {});
                }

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];

                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO') || k.includes('SHOOT')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position') && (tenTrack.includes('armature') || tenTrack.includes('hips') || tenTrack.includes('pelvis') || tenTrack.includes('root'))) return false;
                                    return true;
                                });
                            }
                        }

                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('SHOOT')) window.KHO_ANIM_TANCONG.push(key);

                        if (k.includes('BAY') || k.includes('FLY')) { coBay = true; animBay = window.animationsMap[key]; window.animationsMap['BAY'] = animBay; }
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) { coChay = true; animChay = window.animationsMap[key]; window.animationsMap['CHAYBO'] = animChay; }
                    }
                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }

                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push('NHANROI1');
                    let defaultIdle = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                }

                if (window.vongLapNhanRoiBG) clearInterval(window.vongLapNhanRoiBG);
                window.vongLapNhanRoiBG = setInterval(() => {
                    if (!window.dangMuaChieu && !window.isMoving && !window.isKeyboardMoving && window.KHO_ANIM_NHANROI.length > 0) {
                        let randomIdle = window.KHO_ANIM_NHANROI[Math.floor(Math.random() * window.KHO_ANIM_NHANROI.length)];
                        if (window.animationsMap && window.animationsMap[randomIdle]) {
                            window.animationsMap['NHANROI'] = window.animationsMap[randomIdle];
                            if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[randomIdle];
                            if (typeof window.playAnim === 'function') window.playAnim(randomIdle);
                        }
                    }
                }, 12000);
            },
            tungChieu: window.tungComboBege,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
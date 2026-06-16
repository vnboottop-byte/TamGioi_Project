// ==========================================
// 🐍 MÔN PHÁI ĐOẠT XÁ: NỮ HOÀNG HẢI TẶC BOA HANCOCK
// 👑 CÔNG NGHỆ MASTER V2: CHỐNG NUỐT CHIÊU + KHÓA TRỤC CẦU + LAZY PRELOAD + TỌA ĐỘ ĐỘNG
// ==========================================

(function () {
    const kyNangBoa = [];
    const hieuUngBoa = [];
    const danhSachSoBayBoa = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];

    window.tongSoChuNoi_Boa = 0;

    // 🌟 1. HIỂN THỊ DAME MÀU HỒNG QUYẾN RŨ
    function taoSoSatThuongBoa(pos3D, satThuong, mauSac = '#ff66b2') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_Boa > 5) return;
        window.tongSoChuNoi_Boa++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #990033';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayBoa.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 2. RADAR TÌM MỤC TIÊU
    window.layMucTieuGanNhatBoa = function (viTriGoc) {
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

    function gaySatThuongBoa(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongBoa(posHienSo, luongSatThuong, '#ff66b2');
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
                            taoSoSatThuongBoa(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff3399');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongBoa(hit.tamNguc.clone(), luongSatThuong);
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

    // 🌟 3. HIỆU ỨNG NỔ: BÁM TRỤC CẦU 3D
    function taoHieuUngNoBoa(pos, isBig = false, upVector = new THREE.Vector3(0,1,0)) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        else if (typeof window.playSound === 'function') window.playSound('no');

        const soLuong = isBig ? 120 : 30; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + (isBig ? 2 : 1); posArr[i * 3 + 2] = pos.z;
            let speed = isBig ? (Math.random() * 2 + 1) : (Math.random() * 1 + 0.5);
            let vLocal = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vLocal.applyQuaternion(qNolo); // Nắn tia nổ theo trục hành tinh
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiLuaBoa) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 102, 178, 1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiLuaBoa = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xff66b2, size: window.isMobile ? 3.0 : 6.0, map: window.textureBuiLuaBoa,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngBoa.push({ system: pts, velocities: vels, life: 30, upVector: upVector.clone() });
    }

    // 🌟 4. TÀN LỬA HỒNG BAY THEO MŨI TÊN
    function taoSaoBangBoa(pos, dir) {
        if (window.isMobile || Math.random() > 0.5) return;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([pos.x, pos.y, pos.z]), 3));
        const mat = new THREE.PointsMaterial({ color: 0xff66b2, size: 0.6, transparent: true, opacity: 0.8 });
        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngBoa.push({ system: pts, velocities: [new THREE.Vector3(dir.x * 0.1, dir.y * 0.1, dir.z * 0.1)], life: 15, type: 'trail' });
    }

    // 🌟 5. ĐÚC MODEL DÙNG CHUNG
    function taoVatTheBoa(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        if (Array.isArray(c.material)) c.material.forEach(m => { m.transparent = true; m.side = THREE.DoubleSide; });
                        else { c.material.transparent = true; c.material.side = THREE.DoubleSide; }
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
    // 🏹 TUNG CHIÊU BOA HANCOCK (ĐÃ VÁ ẢO TƯỞNG & NGÔN NGỮ)
    // ==========================================
    window.tungComboBoa = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId) {
            if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            } else if (typeof window.danhSachQuaiVat !== 'undefined') {
                let boss = window.danhSachQuaiVat.find(q => q.id == casterId || q.id === casterId);
                if (boss && boss.mesh) nvc = boss.mesh;
            }
        }
        if (!nvc) return;

        // 🌟 BẢN VÁ: THÔNG NÃO NGÔN NGỮ AI 
        let loaiChieu = phim;
        let animCanMua = 'ATTACK1';
        if (typeof phim === 'string') {
            let pUp = phim.toUpperCase();
            if (pUp.includes('ATTACK4') || pUp === 'F') { loaiChieu = 'F'; animCanMua = 'ATTACK4'; }
            else if (pUp.includes('ATTACK5') || pUp === 'R') { loaiChieu = 'R'; animCanMua = 'ATTACK5'; }
            else if (pUp.includes('ATTACK2') || pUp === 'E') { loaiChieu = 'E'; animCanMua = 'ATTACK2'; }
            else if (pUp.includes('ATTACK1') || pUp === 'Q') { loaiChieu = 'Q'; animCanMua = 'ATTACK1'; }
            else if (pUp.includes('ATTACK') || pUp.includes('SKILL')) {
                let arr = ['Q', 'E', 'R', 'F'];
                loaiChieu = arr[Math.floor(Math.random() * arr.length)];
                if (loaiChieu === 'Q') animCanMua = 'ATTACK1';
                if (loaiChieu === 'E') animCanMua = 'ATTACK2';
                if (loaiChieu === 'R') animCanMua = 'ATTACK5';
                if (loaiChieu === 'F') animCanMua = 'ATTACK4';
            }
        }

        // 🌟 BẢN VÁ: BẢO VỆ HOẠT HÌNH
        if (isRemote === false) {
            window.dangMuaChieu = true;
            window.currentAnimName = ''; 
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
            else if (typeof window.playAnim === 'function') window.playAnim(animCanMua);
            
            if (window.henGioTatMuaBoa) clearTimeout(window.henGioTatMuaBoa);
            window.henGioTatMuaBoa = setTimeout(() => { window.dangMuaChieu = false; }, 600);
        } else {
            if (nvc.userData && nvc.userData.mixer && nvc.userData.animationsMap && nvc.userData.animationsMap[animCanMua]) {
                nvc.userData.animationsMap[animCanMua].reset().fadeIn(0.2).play();
            }
        }

        let upVector = new THREE.Vector3(0, 1, 0);
        if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
            upVector = nvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
        } else if (nvc.up) {
            upVector = nvc.up.clone().normalize();
        }

        let huongMat = new THREE.Vector3(); 
        if (typeof camera !== 'undefined' && !isRemote) {
            camera.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
            if (huongMat.lengthSq() < 0.001) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
        } else {
            nvc.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
        }
        if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }

        let rightVector = new THREE.Vector3().crossVectors(huongMat, upVector).normalize().negate();

        let viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));

        let mucTieu = null;
        if (isRemote) {
            if (remoteDich) mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
        } else {
            let targetRadar = window.layMucTieuGanNhatBoa(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) {
                let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(targetRadar.mesh) : null;
                mucTieu = (hitBox && hitBox.tamNguc && typeof hitBox.tamNguc.clone === 'function') ? hitBox.tamNguc.clone() : targetRadar.mesh.position.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Boa',
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
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

        let diemChanMucTieu = mucTieu.clone();

        if (loaiChieu === 'Q') {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    let curNvc = nvc; // 🌟 BẢN VÁ: GỠ BỎ PLAYERMODEL
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                    if (isNaN(curDir.x) || curDir.lengthSq() < 0.001) curDir.copy(huongMat);
                    let curPos = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));

                    const tim = taoVatTheBoa('TIM', 2); 
                    let diemBan = curPos.clone().add(curDir.clone().multiplyScalar(2));
                    let targetBay = mucTieu ? mucTieu.clone() : curPos.clone().add(curDir.clone().multiplyScalar(150));
                    
                    if (!isRemote) {
                        let objMoi = window.layMucTieuGanNhatBoa(diemBan);
                        if (objMoi && objMoi.mesh) {
                            let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(objMoi.mesh) : null;
                            targetBay = (hitBox && hitBox.tamNguc && typeof hitBox.tamNguc.clone === 'function') ? hitBox.tamNguc.clone() : objMoi.mesh.position.clone();
                        }
                    }

                    tim.position.copy(diemBan); tim.up.copy(curUp); tim.lookAt(targetBay); scene.add(tim);

                    kyNangBoa.push({
                        mesh: tim, type: 'BAY_THANG', speed: 6.0, life: 100, skillId: 'Q', targetPos: targetBay, 
                        currentScale: 2, maxScale: 7, damage: dameGoc * 0.133, isRemote: isRemote, noBanKinh: 12, upVector: curUp.clone()
                    });
                }, i * 200);
            }
        }
        else if (loaiChieu === 'E') {
            for (let j = 0; j < 5; j++) {
                setTimeout(() => {
                    let curNvc = nvc; // 🌟 BẢN VÁ: GỠ BỎ PLAYERMODEL
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);

                    const timTo = taoVatTheBoa('TIM', 25); 
                    let posLech = diemChanMucTieu.clone();
                    let rightVec = new THREE.Vector3().crossVectors(huongMat, curUp).normalize();
                    posLech.add(rightVec.multiplyScalar((Math.random() - 0.5) * 15));
                    posLech.add(huongMat.clone().multiplyScalar((Math.random() - 0.5) * 15));

                    let diemTha = posLech.clone().add(curUp.clone().multiplyScalar(20.0)); 
                    
                    timTo.position.copy(diemTha); timTo.up.copy(curUp); timTo.lookAt(posLech); scene.add(timTo);

                    kyNangBoa.push({
                        mesh: timTo, type: 'ROI_THANG_XUONG', speed: 1.0, life: 150, 
                        skillId: 'E', targetPos: posLech, upVector: curUp.clone(),
                        damage: dameGoc * 0.12, isRemote: isRemote, noBanKinh: 25 
                    });
                }, 600 + (j * 200)); 
            }
        }
        else if (loaiChieu === 'R') {
            const rGroup = new THREE.Group();
            const tamTranPhap = viTriGocToTam.clone().add(upVector.clone().multiplyScalar(4)).sub(huongMat.clone().multiplyScalar(2));
            rGroup.position.copy(tamTranPhap); rGroup.up.copy(upVector); 
            let tBay = mucTieu ? mucTieu.clone() : viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            rGroup.lookAt(tBay); scene.add(rGroup);
            
            for (let i = 0; i < 8; i++) {
                const ten = taoVatTheBoa('boaarow', 6.0);
                const goc = (i / 8) * Math.PI * 2;
                ten.position.set(Math.cos(goc) * 3, Math.sin(goc) * 3, 0); rGroup.add(ten);
                
                kyNangBoa.push({
                    mesh: ten, parentGroup: rGroup, type: 'R', state: 'XOAY_TICH_TUC',
                    life: 200, ticks: 0, targetPos: tBay, upVector: upVector.clone(),
                    damage: dameGoc * 0.0625, speed: 0.5, fireDelay: i * 8, isRemote: isRemote 
                });
            }
        }
        else if (loaiChieu === 'F') {
            const soLuong = 15;
            const spawnCenter = viTriGocToTam.clone().add(upVector.clone().multiplyScalar(12)).sub(huongMat.clone().multiplyScalar(5));
            
            for (let i = 0; i < soLuong; i++) {
                const ten = taoVatTheBoa('boaarow', 8.0);
                let rX = (Math.random() - 0.5) * 20; let rZ = (Math.random() - 0.5) * 20; let rUp = Math.random() * 10;
                
                let startPos = spawnCenter.clone().add(rightVector.clone().multiplyScalar(rX)).add(huongMat.clone().multiplyScalar(rZ)).add(upVector.clone().multiplyScalar(rUp));
                let dichRoi = diemChanMucTieu.clone().add(rightVector.clone().multiplyScalar(rX)).add(huongMat.clone().multiplyScalar(rZ));
                
                ten.position.copy(startPos); ten.up.copy(upVector); ten.lookAt(dichRoi); ten.rotateX(-Math.PI / 6); scene.add(ten);
                
                kyNangBoa.push({
                    mesh: ten, type: 'BAY_VONG_CUNG', state: 'CHO_DEN_LUOT', skillId: 'F',
                    speed: 0.01 + (Math.random() * 0.005), life: 300, startPos: startPos, targetPos: dichRoi,
                    damage: dameGoc * 0.066, arcHeight: 25 + Math.random() * 10, fireDelay: i * 3, progress: 0, isRemote: isRemote,
                    upVector: upVector.clone()
                });
            }
        }
    };

    window.updateCombatBoa = function () {
        for (let i = kyNangBoa.length - 1; i >= 0; i--) {
            let s = kyNangBoa[i]; s.life--;

            if (s.type === 'BAY_THANG') {
                if (s.skillId === 'Q' && s.currentScale < s.maxScale) {
                    s.currentScale += 0.25; 
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }

                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    // 🌟 BẢN VÁ: VECTOR NaN
                    if (!isNaN(huongBay.x)) s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    if (s.isRemote === false) gaySatThuongBoa(s.targetPos, s.damage, s.noBanKinh);
                    else {
                        // 🌟 BẢN VÁ: BẺ KHIÊN NUMBER
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                    }
                    taoHieuUngNoBoa(s.targetPos, false, s.upVector);
                    s.life = 0;
                }
            }
            else if (s.type === 'ROI_THANG_XUONG') {
                s.speed *= 1.1; 
                if (s.speed > 10.0) s.speed = 10.0;
                s.mesh.position.sub(s.upVector.clone().multiplyScalar(s.speed));

                if (s.mesh.position.distanceTo(s.targetPos) <= s.speed + 2 || s.life <= 0) {
                    if (s.isRemote === false) gaySatThuongBoa(s.targetPos, s.damage, s.noBanKinh);
                    else {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                    }
                    taoHieuUngNoBoa(s.targetPos, true, s.upVector); 
                    s.life = 0;
                }
            }
            else if (s.state === 'XOAY_TICH_TUC') {
                if (s.parentGroup) s.parentGroup.rotateZ(0.05);
                s.mesh.rotateZ(0.2); s.ticks++;
                if (s.ticks > 30 + s.fireDelay) {
                    const worldPos = new THREE.Vector3();
                    s.mesh.getWorldPosition(worldPos);
                    scene.attach(s.mesh); s.startPos = worldPos.clone(); s.state = 'BAY_DI';
                }
            }
            else if (s.state === 'BAY_DI') {
                s.speed *= 1.08; if (s.speed > 8.0) s.speed = 8.0;
                
                if (s.targetPos) {
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); 
                    dummy.up.copy(s.upVector || new THREE.Vector3(0,1,0));
                    dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.2);
                }
                s.mesh.translateZ(s.speed);
                const dir = new THREE.Vector3(); s.mesh.getWorldDirection(dir);
                taoSaoBangBoa(s.mesh.position, dir.negate());

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 5 || s.life <= 0) {
                    let diemNo = (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 5) ? s.targetPos : s.mesh.position;
                    if (s.isRemote === false) gaySatThuongBoa(diemNo, s.damage, 15);
                    else {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(diemNo, s.damage, 15);
                    }
                    taoHieuUngNoBoa(diemNo, false, s.upVector);
                    s.life = 0;
                }
            }
            else if (s.state === 'CHO_DEN_LUOT') {
                s.fireDelay--; if (s.fireDelay <= 0) s.state = 'DANG_BAY';
            }
            else if (s.type === 'BAY_VONG_CUNG' && s.state === 'DANG_BAY') {
                s.speed *= 1.03; s.progress += s.speed; s.mesh.rotateZ(0.5);

                const dir = new THREE.Vector3(); s.mesh.getWorldDirection(dir);
                taoSaoBangBoa(s.mesh.position, dir.negate());

                let curPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, s.progress);
                curPos.add(s.upVector.clone().multiplyScalar(Math.sin(s.progress * Math.PI) * s.arcHeight));

                let nextProgress = s.progress + 0.05;
                let nextPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, nextProgress);
                nextPos.add(s.upVector.clone().multiplyScalar(Math.sin(nextProgress * Math.PI) * s.arcHeight));

                s.mesh.position.copy(curPos); 
                s.mesh.up.copy(s.upVector); 
                s.mesh.lookAt(nextPos);

                if (s.progress >= 1 || s.life <= 0) {
                    if (s.isRemote === false) gaySatThuongBoa(s.targetPos, s.damage, 15);
                    else {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, 15);
                    }
                    taoHieuUngNoBoa(s.targetPos, false, s.upVector);
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                if (s.parentGroup && s.parentGroup.children.length === 0) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(s.parentGroup);
                }
                kyNangBoa.splice(i, 1);
            }
        }

        // 🌟 BẢN VÁ TRỤC CẦU: TÀN LỬA RƠI THEO LỰC HÚT TRÁI ĐẤT
        for (let i = hieuUngBoa.length - 1; i >= 0; i--) {
            let h = hieuUngBoa[i]; h.life--;
            if (h.type === 'trail') {
                let posArr = h.system.geometry.attributes.position.array;
                for (let j = 0; j < posArr.length / 3; j++) {
                    posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                }
                h.system.geometry.attributes.position.needsUpdate = true;
                h.system.material.opacity = h.life / 15;
            } else {
                let posArr = h.system.geometry.attributes.position.array;
                let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(-0.05) : new THREE.Vector3(0, -0.05, 0);

                for (let j = 0; j < posArr.length / 3; j++) {
                    posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                    h.velocities[j].x *= 0.85; h.velocities[j].z *= 0.85; h.velocities[j].y *= 0.85;
                    h.velocities[j].add(fallVec); 
                }
                h.system.geometry.attributes.position.needsUpdate = true;
                h.system.material.opacity = h.life / 30; 
            }
            
            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngBoa.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayBoa.length - 1; i >= 0; i--) {
            let it = danhSachSoBayBoa[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayBoa.splice(i, 1); window.tongSoChuNoi_Boa--; }
        }
    };

    setInterval(window.updateCombatBoa, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.trim() !== '') {
        window.HePhaiHienTai = {
            tenPhai: "Hải Tặc Nữ Vương",
            khoiTao: function () {
                console.log("💖 Boa Hancock thức tỉnh! Kích hoạt mạng lưới chống Nuốt Chiêu và Trục Cầu Không Gian!");

                // 🌟 VÁ LỖI 7: PRELOAD CACHE RAM CHỐNG SẬP LOADER NHƯ TU TIÊN / ZORO
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/TIM.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/boaarow.glb', () => {});
                }

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];

                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];

                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position') && (tenTrack.includes('armature') || tenTrack.includes('hips') || tenTrack.includes('pelvis') || tenTrack.includes('root'))) return false;
                                    return true;
                                });
                            }
                        }

                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('ATTACK') || k.includes('SKILL')) window.KHO_ANIM_TANCONG.push(key);

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

                if (window.vongLapNhanRoiZR) clearInterval(window.vongLapNhanRoiZR);
                window.vongLapNhanRoiZR = setInterval(() => {
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
            tungChieu: window.tungComboBoa,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
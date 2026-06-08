// ==========================================
// ⚡ MÔN PHÁI ĐOẠT XÁ: HOA TIÊU NAMI (NỮ HOÀNG THỜI TIẾT - MASTER V2)
// 👑 CÔNG NGHỆ: MỞ KHÓA SPAM + AIMBOT RƯỢT ĐUỔI + PRELOAD RAM SÉT
// ==========================================

(function () {
    const kyNangNami = [];
    const hieuUngNami = [];
    const danhSachSoBayNami = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Nami = 0;

    function taoSoSatThuongNami(pos3D, satThuong, mauSac = '#00ffff') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_Nami > 5) return;
        window.tongSoChuNoi_Nami++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #004466';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayNami.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatNami = function (viTriGoc) {
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

    function gaySatThuongNami(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongNami(posHienSo, luongSatThuong, '#00ffff');
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
                            taoSoSatThuongNami(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ffffff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongNami(hit.tamNguc.clone(), luongSatThuong);
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

    function taoHieuUngNoNami(pos, isBig = false, upVector = new THREE.Vector3(0, 1, 0)) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        else if (typeof window.playSound === 'function') window.playSound('no');

        const soLuong = isBig ? 100 : 30; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + (isBig ? 2 : 1); posArr[i * 3 + 2] = pos.z;
            let speed = isBig ? (Math.random() * 3.0 + 1) : (Math.random() * 1.5 + 0.5);
            let vec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiNami) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(0, 225, 255, 0.8)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiNami = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xccffff, size: window.isMobile ? 3.0 : 6.0, map: window.textureBuiNami,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngNami.push({ system: pts, velocities: vels, life: 25, upVector: upVector.clone() });
    }

    function taoVatTheNami(tenFile, scaleSize) {
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

    window.thoiDiemChemCuoi_Nami = window.thoiDiemChemCuoi_Nami || 0;

    window.tungComboNami = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        let animCanMua = 'ATTACK1';
        if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
            animCanMua = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
        }

        // ===============================================
        // 🌟 BƯỚC ĐỘT PHÁ TẠI ĐÂY: XÓA `return` BLOCK 800MS ĐỂ CHỐNG NUỐT CHIÊU
        // ===============================================
        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
            
            if (window.henGioTatMuaNami) clearTimeout(window.henGioTatMuaNami);
            window.henGioTatMuaNami = setTimeout(() => { window.dangMuaChieu = false; }, 600);
        }

        // 🌟 VÁ LỖI 1: BẺ PHẲNG HƯỚNG MẶT
        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
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

        let viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));

        let mucTieu = null;
        if (isRemote) {
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            let targetRadar = window.layMucTieuGanNhatNami(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) mucTieu = window.layHitbox(targetRadar.mesh).tamNguc.clone();
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Nami',
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

        let diemChanMucTieu = mucTieu.clone(); // Của Sếp gốc không ép Y=0, quá tốt!

        // ===============================================
        // ⚡ MẢNG CHIÊU THỨC (CÓ TRỤC upVector & AIMBOT)
        // ===============================================
        if (phim === 'Q') {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    // 🌟 VÁ LỖI 4: QUÉT LẠI TỌA ĐỘ ĐỘNG TRONG SETTIMEOUT
                    let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                    const cauXanh = taoVatTheNami('causetxanh', 2); 
                    let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5)).add(curDir.clone().multiplyScalar(2));
                    
                    let targetBay = mucTieu.clone();
                    if (!isRemote) {
                        let objMoi = window.layMucTieuGanNhatNami(diemBan);
                        if (objMoi && objMoi.mesh) targetBay = window.layHitbox(objMoi.mesh).tamNguc.clone();
                    }

                    cauXanh.position.copy(diemBan);
                    cauXanh.up.copy(curUp); // 🌟 VÁ LỖI 7
                    cauXanh.lookAt(targetBay);
                    scene.add(cauXanh);

                    kyNangNami.push({
                        mesh: cauXanh, type: 'BAY_THANG_TO_DAN', speed: 6.0, life: 100,
                        currentScale: 2, maxScale: 8, 
                        targetPos: targetBay, damage: dameGoc * 0.133, noBanKinh: 12, isRemote: isRemote, upVector: curUp.clone()
                    });
                }, i * 200);
            }
        }

        else if (phim === 'E') {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                    const cauTim = taoVatTheNami('causettim', 2); 
                    let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5)).add(curDir.clone().multiplyScalar(2));
                    
                    let targetBay = mucTieu.clone();
                    if (!isRemote) {
                        let objMoi = window.layMucTieuGanNhatNami(diemBan);
                        if (objMoi && objMoi.mesh) targetBay = window.layHitbox(objMoi.mesh).tamNguc.clone();
                    }

                    cauTim.position.copy(diemBan);
                    cauTim.up.copy(curUp); // 🌟 VÁ LỖI 7
                    cauTim.lookAt(targetBay);
                    scene.add(cauTim);

                    kyNangNami.push({
                        mesh: cauTim, type: 'BAY_THANG_TO_DAN', speed: 6.0, life: 100,
                        currentScale: 2, maxScale: 10, 
                        targetPos: targetBay, damage: dameGoc * 0.2, noBanKinh: 15, isRemote: isRemote, upVector: curUp.clone()
                    });
                }, i * 200);
            }
        }

        else if (phim === 'R') {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                    const cauHaki = taoVatTheNami('causethaki', 2); 
                    let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5)).add(curDir.clone().multiplyScalar(2));
                    
                    let targetBay = mucTieu.clone();
                    if (!isRemote) {
                        let objMoi = window.layMucTieuGanNhatNami(diemBan);
                        if (objMoi && objMoi.mesh) targetBay = window.layHitbox(objMoi.mesh).tamNguc.clone();
                    }

                    cauHaki.position.copy(diemBan);
                    cauHaki.up.copy(curUp); // 🌟 VÁ LỖI 7
                    cauHaki.lookAt(targetBay);
                    scene.add(cauHaki);

                    kyNangNami.push({
                        mesh: cauHaki, type: 'BAY_THANG_TO_DAN', speed: 6.5, life: 100,
                        currentScale: 2, maxScale: 12, 
                        targetPos: targetBay, damage: dameGoc * 0.166, noBanKinh: 18, isRemote: isRemote, upVector: curUp.clone()
                    });
                }, i * 200);
            }
        }

        else if (phim === 'F') {
            let tongThoiGian = 3000;
            let soLuongSet = 15;
            let delayMoiTia = tongThoiGian / soLuongSet;

            for (let i = 0; i < soLuongSet; i++) {
                setTimeout(() => {
                    let indexSet = Math.floor(Math.random() * 10) + 1;
                    let tenModelSet = 'set' + indexSet;

                    let posDap = diemChanMucTieu.clone();
                    let upV = new THREE.Vector3(0, 1, 0);
                    if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                        upV = posDap.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                    }

                    if (i === 0) {
                        posDap.copy(diemChanMucTieu);
                    } else {
                        let randomVec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
                        randomVec.projectOnPlane(upV).normalize(); 
                        let randomRadius = Math.random() * 25; 
                        posDap.add(randomVec.multiplyScalar(randomRadius));
                    }

                    const setMesh = taoVatTheNami(tenModelSet, 45);
                    setMesh.position.copy(posDap);
                    setMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), upV);
                    setMesh.rotateY(Math.random() * Math.PI * 2); 
                    scene.add(setMesh);

                    if (isRemote === false) gaySatThuongNami(posDap, dameGoc * 0.066, 22);
                    else if (typeof isRemote === 'number' && isRemote > 0) {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(posDap, dameGoc * 0.066, 22);
                    } 

                    taoHieuUngNoNami(posDap, true, upV); // 🌟 Thêm upV

                    kyNangNami.push({ mesh: setMesh, type: 'CHOP_TAT', life: 5 });
                }, i * delayMoiTia);
            }
        }
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU NAMI
    // ==========================================
    window.updateCombatNami = function () {
        
        for (let i = kyNangNami.length - 1; i >= 0; i--) {
            let s = kyNangNami[i]; s.life--;

            if (s.type === 'BAY_THANG_TO_DAN') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += 0.3; 
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                if (s.mesh.children.length > 0) s.mesh.children[0].rotateY(0.15);

                // 🌟 AIMBOT HOÀN HẢO (CHỐNG LỖI MÙ/LÙI)
                if (!s.isRemote) {
                    let mucTieuMoi = window.layMucTieuGanNhatNami(s.mesh.position);
                    if (mucTieuMoi && mucTieuMoi.mesh) {
                        s.targetPos = window.layHitbox(mucTieuMoi.mesh).tamNguc.clone();
                    }
                }

                let huongBay = new THREE.Vector3();
                if (s.targetPos) {
                    const dummy = new THREE.Object3D(); 
                    dummy.position.copy(s.mesh.position); 
                    dummy.up.copy(s.upVector || new THREE.Vector3(0,1,0));
                    dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.2); 
                    
                    huongBay.subVectors(s.targetPos, s.mesh.position).normalize();
                } else {
                    s.mesh.getWorldDirection(huongBay);
                    huongBay.negate(); 
                }

                s.mesh.position.add(huongBay.multiplyScalar(s.speed));

                // 🌟 VA CHẠM THỰC TẾ & NỔ TẠI MỤC TIÊU 
                let daVaCham = false;
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) daVaCham = true;

                if (daVaCham || s.life <= 0) {
                    let diemNoThucTe = (s.targetPos && daVaCham) ? s.targetPos.clone() : s.mesh.position.clone();
                    
                    if (s.isRemote === false) gaySatThuongNami(diemNoThucTe, s.damage, s.noBanKinh);
                    else if (typeof s.isRemote === 'number' && s.isRemote > 0) window.gaySatThuongBossToPlayer(diemNoThucTe, s.damage, s.noBanKinh);

                    taoHieuUngNoNami(diemNoThucTe, false, s.upVector);
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangNami.splice(i, 1);
            }
        }

        // 🌟 BỤI KHÓI BAY LÊN CHUẨN TRỤC MAP CẦU
        for (let i = hieuUngNami.length - 1; i >= 0; i--) {
            let h = hieuUngNami[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            
            let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(0.06) : new THREE.Vector3(0, 0.06, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].multiplyScalar(0.88); 
                h.velocities[j].add(fallVec); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 25;

            if (h.life <= 0) { 
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose(); 
                if (h.system.material) h.system.material.dispose(); 
                hieuUngNami.splice(i, 1); 
            }
        }

        for (let i = danhSachSoBayNami.length - 1; i >= 0; i--) {
            let it = danhSachSoBayNami[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';
            if (it.life <= 0) { it.el.remove(); danhSachSoBayNami.splice(i, 1); window.tongSoChuNoi_Nami--; }
        }
    };
    setInterval(window.updateCombatNami, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI NAMI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('nami')) {
        window.HePhaiHienTai = {
            tenPhai: "Hoa Tiêu Nami",
            khoiTao: function () {
                console.log("⚡ Giông bão nổi lên! Khởi động Hoa Tiêu Nami V2 (Spam Phím + Sát Thương Chuẩn)!");

                // 🌟 VÁ LỖI 2: CHỐNG SẬP LOADER BẰNG PRELOAD VRAM (Rất nhiều Model Sét)
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/causetxanh.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/causettim.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/causethaki.glb', () => {});
                    for(let i=1; i<=10; i++) {
                        window.taiHoacNhanBanAsset('uploads/anims/set'+i+'.glb', () => {});
                    }
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
            tungChieu: window.tungComboNami,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
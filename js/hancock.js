// ==========================================
// 🐍 MÔN PHÁI ĐOẠT XÁ: BOA HANCOCK V2 (BẢN FINAL TRẢ LƯƠNG SẾP)
// 👑 CÔNG NGHỆ: SCALE DYNAMIC + SATURATION ATTACK + ARC PHYSICS 30 DEG
// ==========================================

(function () {
    const kyNangBoa = [];
    const hieuUngBoa = [];
    const danhSachSoBayBoa = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Boa = 0;

    function taoSoSatThuongBoa(pos3D, satThuong, mauSac = '#ff66b2') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        window.tongSoChuNoi_Boa++;
        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:0px 0px 10px #000, 2px 2px 0px #990033; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayBoa.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    function taoHieuUngNoBoa(pos, isBig = false) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        const soLuong = isBig ? 120 : 30; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];
        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + (isBig ? 2 : 1); posArr[i * 3 + 2] = pos.z;
            let vec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(isBig ? 2.5 : 1.2);
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xff66b2, size: 5.0, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false,
            map: window.textureBuiLuaBoa || null
        });
        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngBoa.push({ system: pts, velocities: vels, life: 30 });
    }

    function taoVatTheBoa(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => { if (c.isMesh && c.material) { c.material.transparent = true; c.material.side = THREE.DoubleSide; } });
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

    window.tungComboBoa = function (phim) {
        let nvc = window.playerModel || window.nhanVatChinh;
        if (!nvc) return;

        let animCanMua = 'ATTACK1';
        if (phim === 'Q') animCanMua = 'ATTACK1';
        if (phim === 'E') animCanMua = 'ATTACK2';
        if (phim === 'F') animCanMua = 'ATTACK4';
        if (phim === 'R') animCanMua = 'ATTACK5';

        if (Date.now() - (window.thoiDiemChemCuoi_Boa || 0) < 800) return;
        window.thoiDiemChemCuoi_Boa = Date.now();
        window.dangMuaChieu = true;
        if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);

        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
        let rightVector = new THREE.Vector3().crossVectors(huongMat, upVector).normalize().negate();
        let viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));
        
        let targetRadar = window.layMucTieuGanNhatBoa(viTriGocToTam);
        let mucTieu = (targetRadar && targetRadar.mesh) ? window.layHitbox(targetRadar.mesh).tamNguc.clone() : viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
        let diemChanMucTieu = mucTieu.clone(); diemChanMucTieu.y = window.matDatY || 0;
        const dameGoc = window.DAME_CUA_TOI || 100;

        // 💖 Q: 3 TIM BẮN THẲNG - TO DẦN KHI BAY
        if (phim === 'Q') {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const tim = taoVatTheBoa('TIM', 1); // Bắt đầu siêu nhỏ (size 1)
                    tim.position.copy(viTriGocToTam).add(huongMat.clone().multiplyScalar(2));
                    tim.lookAt(mucTieu);
                    scene.add(tim);
                    kyNangBoa.push({
                        mesh: tim, type: 'BAY_THANG_TO_DAN', speed: 6.0, life: 100, 
                        currentScale: 1, maxScale: 8, // 🌟 Tham số to dần
                        targetPos: mucTieu.clone(), damage: dameGoc * 0.133, noBanKinh: 12
                    });
                }, i * 200);
            }
        }

        // 💖 E: 5 TIM KHỔNG LỒ RƠI LỆCH NHỊP
        else if (phim === 'E') {
            for (let j = 0; j < 5; j++) {
                setTimeout(() => {
                    const timTo = taoVatTheBoa('TIM', 25);
                    let posLech = diemChanMucTieu.clone();
                    posLech.x += (Math.random() - 0.5) * 12;
                    posLech.z += (Math.random() - 0.5) * 12;
                    let diemTha = posLech.clone();
                    diemTha.y += 20.0; // Hạ độ cao rơi xuống 20m cho đỡ ảo

                    timTo.position.copy(diemTha);
                    timTo.rotation.set(Math.PI / 2, 0, 0); 
                    scene.add(timTo);
                    kyNangBoa.push({
                        mesh: timTo, type: 'ROI_THANG_XUONG', speed: 1.0, life: 150, 
                        targetPos: posLech, damage: dameGoc * 0.12, noBanKinh: 25 // Dame: 0.12 * 5 = 0.6 chuẩn
                    });
                }, j * 300); // Rơi cách nhau 0.3s
            }
        }

        // 💖 R: VÒNG TRÒN MŨI TÊN (ATTACK5)
        else if (phim === 'R') {
            const rGroup = new THREE.Group();
            const tamTranPhap = viTriGocToTam.clone().add(upVector.clone().multiplyScalar(4));
            rGroup.position.copy(tamTranPhap); rGroup.lookAt(mucTieu); scene.add(rGroup);
            for (let i = 0; i < 8; i++) {
                const ten = taoVatTheBoa('boaarow', 6.0);
                const goc = (i / 8) * Math.PI * 2;
                ten.position.set(Math.cos(goc) * 3, Math.sin(goc) * 3, 0); rGroup.add(ten);
                kyNangBoa.push({
                    mesh: ten, parentGroup: rGroup, type: 'R', state: 'XOAY_TICH_TUC', life: 200, ticks: 0,
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.0625, speed: 0.5, fireDelay: i * 8
                });
            }
        }

        // 💖 F: MƯA TÊN KHÔNG GIAN (HẠ ĐỘ CAO + GÓC 30 ĐỘ)
        else if (phim === 'F') {
            // Hạ spawn Center xuống 12m (Thay vì 25m)
            const spawnCenter = viTriGocToTam.clone().add(upVector.clone().multiplyScalar(12)).sub(huongMat.clone().multiplyScalar(5));
            for (let i = 0; i < 15; i++) {
                const ten = taoVatTheBoa('boaarow', 8.0);
                let rX = (Math.random() - 0.5) * 20; let rZ = (Math.random() - 0.5) * 20;
                let startPos = spawnCenter.clone().add(rightVector.clone().multiplyScalar(rX)).add(huongMat.clone().multiplyScalar(rZ));
                let dichRoi = diemChanMucTieu.clone().add(rightVector.clone().multiplyScalar(rX)).add(huongMat.clone().multiplyScalar(rZ));
                
                ten.position.copy(startPos);
                ten.lookAt(dichRoi);
                // 🌟 BẺ GÓC 30 ĐỘ LÊN TRỜI LÚC XUẤT HIỆN
                ten.rotateX(Math.PI / 6); 

                scene.add(ten);
                kyNangBoa.push({
                    mesh: ten, type: 'BAY_VONG_CUNG', state: 'CHO_DEN_LUOT', skillId: 'F',
                    speed: 0.015, life: 300, startPos: startPos, targetPos: dichRoi,
                    damage: dameGoc * 0.066, arcHeight: 18, // Cung tròn hơn (arcHeight thấp hơn tý)
                    fireDelay: i * 3, progress: 0, upVector: upVector.clone()
                });
            }
        }
    };

    window.updateCombatBoa = function () {
        for (let i = kyNangBoa.length - 1; i >= 0; i--) {
            let s = kyNangBoa[i]; s.life--;

            // Xử lý Q: To dần
            if (s.type === 'BAY_THANG_TO_DAN') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += 0.15; // Tốc độ lớn lên
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                let huong = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                s.mesh.position.add(huong.multiplyScalar(s.speed));
                if (s.mesh.position.distanceTo(s.targetPos) < 10) { 
                    gaySatThuongBoa(s.targetPos, s.damage, s.noBanKinh);
                    taoHieuUngNoBoa(s.targetPos, false); s.life = 0; 
                }
            }
            // Xử lý E: Rơi tự do
            else if (s.type === 'ROI_THANG_XUONG') {
                s.speed *= 1.05; s.mesh.position.y -= s.speed;
                if (s.mesh.position.y <= s.targetPos.y + 2) {
                    gaySatThuongBoa(s.targetPos, s.damage, s.noBanKinh);
                    taoHieuUngNoBoa(s.targetPos, true); s.life = 0;
                }
            }
            // Xử lý R: Xoay rồi bắn
            else if (s.state === 'XOAY_TICH_TUC') {
                if (s.parentGroup) s.parentGroup.rotateZ(0.05);
                s.ticks++;
                if (s.ticks > 30 + s.fireDelay) {
                    const worldPos = new THREE.Vector3(); s.mesh.getWorldPosition(worldPos);
                    scene.attach(s.mesh); s.startPos = worldPos.clone(); s.state = 'BAY_DI';
                }
            }
            else if (s.state === 'BAY_DI') {
                s.speed *= 1.1; if (s.speed > 8) s.speed = 8;
                s.mesh.translateZ(s.speed);
                if (s.mesh.position.distanceTo(s.targetPos) < 10) {
                    gaySatThuongBoa(s.targetPos, s.damage, 15);
                    taoHieuUngNoBoa(s.targetPos, false); s.life = 0;
                }
            }
            // Xử lý F: Mưa tên vòng cung tròn trịa
            else if (s.state === 'CHO_DEN_LUOT') {
                if (--s.fireDelay <= 0) s.state = 'DANG_BAY';
            }
            else if (s.state === 'DANG_BAY') {
                s.progress += s.speed;
                let curPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, s.progress);
                curPos.add(s.upVector.clone().multiplyScalar(Math.sin(s.progress * Math.PI) * s.arcHeight));
                
                let nextProgress = Math.min(1, s.progress + 0.02);
                let nextPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, nextProgress);
                nextPos.add(s.upVector.clone().multiplyScalar(Math.sin(nextProgress * Math.PI) * s.arcHeight));
                
                s.mesh.position.copy(curPos);
                s.mesh.lookAt(nextPos); // Tự động xoay theo quỹ đạo bay

                if (s.progress >= 1) {
                    gaySatThuongBoa(s.targetPos, s.damage, 15);
                    taoHieuUngNoBoa(s.targetPos, false); s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                scene.remove(s.mesh);
                kyNangBoa.splice(i, 1);
            }
        }

        // Update Hạt bụi hồng
        for (let i = hieuUngBoa.length - 1; i >= 0; i--) {
            let h = hieuUngBoa[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].multiplyScalar(0.9); h.velocities[j].y += 0.02;
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 30;
            if (h.life <= 0) { scene.remove(h.system); hieuUngBoa.splice(i, 1); }
        }
        // Update Số dame
        for (let i = danhSachSoBayBoa.length - 1; i >= 0; i--) {
            let it = danhSachSoBayBoa[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';
            if (it.life <= 0) { it.el.remove(); danhSachSoBayBoa.splice(i, 1); }
        }
    };
    setInterval(window.updateCombatBoa, 30);
})();
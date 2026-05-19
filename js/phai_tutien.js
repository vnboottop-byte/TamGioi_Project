// ==========================================
// ⚔️ HỆ THỐNG KỸ NĂNG: TU TIÊN GIẢ (BẢN FULL FIX RÁC 1000%)
// =========================================

const kyNangTuTien = []; 
const hieuUngTuTien = [];
let isCuoiKiemSetup = false; 





window.layMucTieuGanNhatTT = function(viTriGoc, huongMat) {
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
    if (targetPos) return targetPos; 
    return viTriGoc.clone().add(huongMat.clone().multiplyScalar(50));
}

// TÁC DỤNG: Bốc vũ khí từ kho Asset thay vì xài chung window.phiKiemModel
function taoKiemChuan(scaleSize, weaponUrl) {
    const stdSword = new THREE.Group(); 
    // 🌟 CHỮA BỆNH "MƯỢN ĐỒ": Tuyệt đối không xài window.WEAPON_URL ở đây
    let urlCanTai = (weaponUrl && weaponUrl.trim() !== '') ? weaponUrl : 'uploads/anims/PHIKIEM.glb';
    
    if (typeof window.taiHoacNhanBanAsset === 'function') {
        window.taiHoacNhanBanAsset(urlCanTai, (vuKhi) => {
            vuKhi.position.set(0, 0, 0); 
            vuKhi.rotation.set(0, 0, 0); // CHUẨN BLENDER
            vuKhi.scale.set(1, 1, 1);
            vuKhi.traverse(c => { 
                if (c.isMesh) { c.visible = true; c.castShadow = false; c.receiveShadow = false; } 
            });
            stdSword.add(vuKhi);
        });
    }

    stdSword.scale.set(scaleSize, scaleSize, scaleSize);
    return stdSword;
}




// TẠI FILE: phai_tutien.js
// TÁC DỤNG: Tung chiêu có đính kèm weaponUrl, khóa Radar chuẩn xác
window.tungComboTuTien = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
    if (!playerModel && !isRemote) return;

    if (!isRemote && ['Q', 'E', 'F', 'R'].includes(phim)) {
        if (!window.thoiGianHoiChieu) { window.thoiGianHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 }; window.thongSoHoiChieu = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 }; }
        const bayGio = Date.now();
        if (bayGio - window.thoiGianHoiChieu[phim] < window.thongSoHoiChieu[phim]) return; 
        window.thoiGianHoiChieu[phim] = bayGio; 
        try { let slotUI = document.getElementById('slot-' + phim); if (slotUI) { let overlay = slotUI.querySelector('.cd-overlay'); if (overlay) { overlay.style.transition = 'none'; overlay.style.height = '100%'; setTimeout(() => { overlay.style.transition = `height ${window.thongSoHoiChieu[phim]}ms linear`; overlay.style.height = '0%'; }, 50); } } } catch(e) {}
    }


// 🌟 ĐÓNG DẤU BẢN QUYỀN MÔN PHÁI: Tự động gọi CHIEUQ_TUTIEN, CHIEUE_TUTIEN...
    if (!isRemote && typeof playAnim === 'function') {
        playAnim('CHIEU' + phim + '_TUTIEN');
    }


    let viTriGoc, huongMat, mucTieu, nguoiTungChieu;
    const dameGoc = window.DAME_CUA_TOI || 100;

    let vuKhiThucTe = weaponUrl;
    if (!isRemote && !vuKhiThucTe) vuKhiThucTe = window.WEAPON_URL;
    
    // 🌟 KHỞI TẠO TRỤC ĐỨNG THEO HÀNH TINH
    let upVector = new THREE.Vector3(0, 1, 0);

    if (isRemote) {
        viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z); 
        huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z); 
        mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z); 
        nguoiTungChieu = casterId;
        upVector.copy(viTriGoc).normalize(); // Trục của người khác là hướng từ tâm hành tinh ra
    } else {
        viTriGoc = new THREE.Vector3(); playerModel.getWorldPosition(viTriGoc); 
        upVector.copy(playerModel.up).normalize(); // 🌟 Lấy độ dốc thực tế của người chơi
        
        viTriGoc.add(upVector.clone().multiplyScalar(5)); // Thay vì y += 5
        
        huongMat = new THREE.Vector3(); playerModel.getWorldDirection(huongMat); huongMat.normalize();
        
        mucTieu = window.layMucTieuGanNhatTT(viTriGoc, huongMat); 
        nguoiTungChieu = window.room ? window.room.localParticipant.identity : null;
        
        
        if (window.room && window.room.localParticipant) {
            const data = new TextEncoder().encode(JSON.stringify({ 
                type: 'TUNG_CHIEU', skillType: phim, className: 'TuTien', 
                origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z },
                weaponUrl: vuKhiThucTe 
            }));
            window.room.localParticipant.publishData(data, { reliable: true });
        }
    }







    if (phim === 'Q') {
        // 🌟 TỐI ƯU MOBILE: Giảm từ 30 kiếm xuống 5 kiếm
        const soLuong = 5; const khoangCach = 4.0;
        for (let i = 0; i < soLuong; i++) {
            const sword = taoKiemChuan(0.5, vuKhiThucTe);
            // 🌟 Dùng upVector thay vì (0, 1, 0)
            const offsetRight = new THREE.Vector3().crossVectors(huongMat, upVector).normalize();
            const offsetUp = upVector.clone();
            
            const spawnPos = viTriGoc.clone().sub(huongMat.clone().multiplyScalar(15));
            
            // Xếp 5 kiếm thành 1 hàng ngang cân đối
            spawnPos.add(offsetRight.clone().multiplyScalar((i - 2) * khoangCach)); 
            
            sword.position.copy(spawnPos); 
            sword.up.copy(upVector); // 🌟 Giữ cho kiếm không bị lật nghiêng
            sword.lookAt(mucTieu); scene.add(sword);
            
            if(typeof window.dangKyChieuThuc === 'function') window.dangKyChieuThuc(sword, 5000);
            
            // 🌟 CÂN BẰNG DAME: 30 x 0.013 = 0.39 -> 5 x 0.078 = 0.39
            kyNangTuTien.push({ mesh: sword, speed: 4.0, life: 100, type: 'kiem_q', delay: 40 + i, targetPos: mucTieu.clone(), damage: dameGoc * 0.078, isRemote: isRemote });
        }
    }



    else if (phim === 'E') {
        // 🌟 TỐI ƯU MOBILE: Giảm từ 30 kiếm xuống 10 kiếm
        const soLuong = 10; const banKinh = 2.0; 
        for (let i = 0; i < soLuong; i++) {
            const pivotGroup = new THREE.Group(); 
            pivotGroup.position.copy(viTriGoc).add(upVector.clone().multiplyScalar(2)); // Thay vì y + 2
            pivotGroup.up.copy(upVector);
            pivotGroup.lookAt(mucTieu);
            
            const fanAngle = (i / soLuong) * (Math.PI * 2); pivotGroup.rotateZ(fanAngle);
            const sword = taoKiemChuan(0.1, vuKhiThucTe);
            sword.rotateX(-Math.PI / 2); sword.position.y = banKinh;
            pivotGroup.add(sword); scene.add(pivotGroup);
            
            if(typeof window.dangKyChieuThuc === 'function') window.dangKyChieuThuc(pivotGroup, 10000);
            
            // 🌟 CÂN BẰNG DAME: 30 x 0.02 = 0.6 -> 10 x 0.06 = 0.6
            // Chỉnh lại fireDelay thành i * 15 để vòng lặp bắn kiếm vẫn kéo dài mượt mà như cũ
            kyNangTuTien.push({ mesh: pivotGroup, swordMesh: sword, speed: 4.5, life: 300, type: 'kiem_e', caster: nguoiTungChieu, damage: dameGoc * 0.06, targetPos: mucTieu.clone(), isRemote: isRemote, delay: 120, fireDelay: i * 15, state: 'XOAY_QUAT' });
        }
    }
    else if (phim === 'F') {
        const pivotGroup = new THREE.Group(); 
        pivotGroup.position.copy(viTriGoc).add(upVector.clone().multiplyScalar(15)); // Thay vì y + 15
        pivotGroup.up.copy(upVector);
        pivotGroup.lookAt(mucTieu);
        
        const sword = taoKiemChuan(4, vuKhiThucTe);
        sword.rotateX(-Math.PI * 0.8); pivotGroup.add(sword); scene.add(pivotGroup);

        kyNangTuTien.push({ mesh: pivotGroup, swordMesh: sword, speed: 0, life: 200, ticks: 0, type: 'kiem_f', delay: 0, targetPos: mucTieu.clone(), damage: dameGoc * 1.0, isRemote: isRemote });
    }
    else if (phim === 'R') {
        const soLuong = 10;
        let qHanhTinh = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);
        
        for (let i = 0; i < soLuong; i++) {
            const phi = Math.acos(-1 + (2 * i) / soLuong); const theta = Math.sqrt(soLuong * Math.PI) * phi;
            let localDir = new THREE.Vector3(Math.cos(theta)*Math.sin(phi), Math.abs(Math.cos(phi))+0.1, Math.sin(theta)*Math.sin(phi)).normalize();
            
            // 🌟 Nắn vòng cung sinh kiếm cong theo quả địa cầu
            let huongRaNgoai = localDir.applyQuaternion(qHanhTinh).normalize();
            const posNgoai = mucTieu.clone().add(huongRaNgoai.multiplyScalar(300));
            
            const sword = taoKiemChuan(3.5, vuKhiThucTe);
            sword.position.copy(posNgoai); 
            sword.up.copy(upVector);
            sword.lookAt(mucTieu); scene.add(sword);
            
            if(typeof window.dangKyChieuThuc === 'function') window.dangKyChieuThuc(sword, 8000);
            kyNangTuTien.push({ mesh: sword, speed: 3.0, life: 150, type: 'kiem_r', delay: i * 0.2, targetPos: mucTieu.clone(), damage: dameGoc * 0.05, isRemote: isRemote });
        }
    }


};







// ==========================================
// 🚀 VÒNG LẶP VẬT LÝ (ĐÃ NÂNG CẤP CHẠY TOÀN CẦU QUÉT RÁC & TẦM NHIỆT)
// ==========================================
window.updateCombatTuTien = function () {
    

    try {
        if (!isCuoiKiemSetup && typeof window.phiKiemModel !== 'undefined' && window.phiKiemModel) {
            window.kiemHoThe = window.phiKiemModel.clone(); window.kiemHoThe.traverse(c => { if (c.isMesh) c.visible = true; });
            scene.add(window.kiemHoThe); window.kiemHoThe.scale.set(0.04, 0.04, 0.04);
            window.gocXoayKiem = 0; window.gocTuXoay = 0; isCuoiKiemSetup = true;
        }

        if (isCuoiKiemSetup && window.kiemHoThe && typeof playerModel !== 'undefined') {
            window.gocXoayKiem += 0.04; window.gocTuXoay += 0.2;

            const banKinh = 1.5;
            const posThuc = new THREE.Vector3();
            playerModel.getWorldPosition(posThuc);

            const huongLen = playerModel.up.clone().normalize();
            posThuc.add(huongLen.clone().multiplyScalar(1.5));

            const right = new THREE.Vector3().crossVectors(huongLen, new THREE.Vector3(0, 0, 1)).normalize();
            if (right.lengthSq() < 0.1) right.crossVectors(huongLen, new THREE.Vector3(1, 0, 0)).normalize();
            const forward = new THREE.Vector3().crossVectors(right, huongLen).normalize();

            const offsetRight = right.clone().multiplyScalar(Math.cos(window.gocXoayKiem) * banKinh);
            const offsetForward = forward.clone().multiplyScalar(Math.sin(window.gocXoayKiem) * banKinh);

            posThuc.add(offsetRight).add(offsetForward);
            window.kiemHoThe.position.copy(posThuc);

            const qKiem = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), huongLen);
            window.kiemHoThe.quaternion.copy(qKiem);
            window.kiemHoThe.rotateX(Math.PI / 2);
            window.kiemHoThe.rotateZ(window.gocTuXoay);
        }





        for (let i = kyNangTuTien.length - 1; i >= 0; i--) {
            let skill = kyNangTuTien[i];
            
            // 🌟 TỐI ƯU CHIÊU Q: Cho kiếm xoay tít thò lò như mũi khoan lúc chờ xuất kích!
            if (skill.delay > 0 && skill.type !== 'kiem_e') { 
                if (skill.type === 'kiem_q') skill.mesh.rotateZ(0.4); 
                skill.delay--; 
                continue; 
            }
            
            skill.life--;

            if (skill.type === 'kiem_q' || skill.type === 'kiem_r') {
                // 🌟 Xoay cả lúc đang lao đi cho thêm phần uy lực
                if (skill.type === 'kiem_q') skill.mesh.rotateZ(0.4); 

                // 🌟 TẦM NHIỆT (HOMING) CHO Q VÀ R
                if (skill.targetPos) {



                    if (!skill.isRemote) {
                        const fwd = new THREE.Vector3(); skill.mesh.getWorldDirection(fwd);
                        const mucTieuMoi = window.layMucTieuGanNhatTT(skill.mesh.position, fwd);
                        if (mucTieuMoi) skill.targetPos = mucTieuMoi;
                    }
                    const dummy = new THREE.Object3D(); dummy.position.copy(skill.mesh.position); dummy.lookAt(skill.targetPos);
                    skill.mesh.quaternion.slerp(dummy.quaternion, 0.15); // Bẻ lái 15% mỗi frame
                }

                skill.mesh.translateZ(skill.speed);
                const realDir = new THREE.Vector3(); skill.mesh.getWorldDirection(realDir);
                if (typeof window.taoSaoBangTuTien === 'function') window.taoSaoBangTuTien(skill.mesh.position, realDir.negate());

                if (skill.targetPos && skill.mesh.position.distanceTo(skill.targetPos) < skill.speed + 3) {
                    if (typeof window.taoVuNoTuTien === 'function') window.taoVuNoTuTien(skill.mesh.position, skill.isRemote, skill.damage);
                    skill.life = 0;
                }
            }
            else if (skill.type === 'kiem_e') {
                if (skill.state !== 'BAY_DI') { skill.mesh.rotateZ(-0.08); }
                if (skill.state === 'XOAY_QUAT') { skill.delay--; if (skill.delay <= 0) skill.state = 'CHO_DEN_LUOT'; }
                else if (skill.state === 'CHO_DEN_LUOT') { if (skill.fireDelay > 0) skill.fireDelay--; else skill.state = 'CHEM_XUONG'; }
                else if (skill.state === 'CHEM_XUONG') {
                    if (skill.swordMesh) skill.swordMesh.rotateX(0.2);
                    if (skill.swordMesh && skill.swordMesh.rotation.x >= 0) { skill.swordMesh.rotation.x = 0; skill.state = 'BAY_DI'; }
                }
                else if (skill.state === 'BAY_DI') {
                    if (skill.targetPos) {
                        if (!skill.isRemote) {
                            const fwd = new THREE.Vector3(); skill.mesh.getWorldDirection(fwd);
                            const mucTieuMoi = window.layMucTieuGanNhatTT(skill.mesh.position, fwd);
                            if (mucTieuMoi) skill.targetPos = mucTieuMoi;
                        }
                        const dummy = new THREE.Object3D(); dummy.position.copy(skill.mesh.position); dummy.lookAt(skill.targetPos);
                        skill.mesh.quaternion.slerp(dummy.quaternion, 0.2);
                    }
                    const khoangCachTam = skill.mesh.position.distanceTo(skill.targetPos);
                    if (khoangCachTam < 40 && skill.swordMesh) { const tyLe = Math.max(0, khoangCachTam / 40); skill.swordMesh.position.y = 10.0 * tyLe; }
                    skill.mesh.rotateZ(-0.3); skill.mesh.translateZ(skill.speed);

                    if (skill.swordMesh) {
                        const toaDoThucTe = new THREE.Vector3(); skill.swordMesh.getWorldPosition(toaDoThucTe);
                        const realDir = new THREE.Vector3(); skill.mesh.getWorldDirection(realDir);
                        if (typeof window.taoSaoBangTuTien === 'function') window.taoSaoBangTuTien(toaDoThucTe, realDir.negate());
                        if (skill.targetPos && toaDoThucTe.distanceTo(skill.targetPos) < skill.speed + 8) {
                            if (typeof window.taoVuNoTuTien === 'function') window.taoVuNoTuTien(toaDoThucTe, skill.isRemote, skill.damage);
                            skill.life = 0;
                        }
                    }
                }
            }
            else if (skill.type === 'kiem_f') {
                if (skill.swordMesh) {
                    skill.swordMesh.rotateX(0.06);
                    skill.ticks++;
                    if (skill.ticks > 40 || skill.life <= 5) {
                        if (typeof window.taoVuNoTuTien === 'function') window.taoVuNoTuTien(skill.targetPos, skill.isRemote, skill.damage);
                        skill.life = 0;
                    }
                }
            }

            if (skill.life <= 0) {
                // Quăng thẳng vào Lò Đốt Rác (Nó sẽ tự động xử lý parent, scene và VRAM)
                if (typeof window.donRac3D === 'function') window.donRac3D(skill.mesh);
                kyNangTuTien.splice(i, 1);
            }
        }

        for (let i = hieuUngTuTien.length - 1; i >= 0; i--) {
            let trail = hieuUngTuTien[i];
            let posTrail = trail.system.geometry.attributes.position.array;
            for (let j = 0; j < posTrail.length / 3; j++) {
            posTrail[j * 3] += trail.velocities[j].x; posTrail[j * 3 + 1] += trail.velocities[j].y; posTrail[j * 3 + 2] += trail.velocities[j].z;


            // Thay vì trail.velocities[j].y -= 0.02; -> Hút theo trọng lực hình cầu
            let posHat = new THREE.Vector3(posTrail[j * 3], posTrail[j * 3 + 1], posTrail[j * 3 + 2]);
            let lucHutTam = posHat.clone().normalize().negate().multiplyScalar(0.02);
            trail.velocities[j].add(lucHutTam);


            }



            trail.system.geometry.attributes.position.needsUpdate = true;
            trail.system.material.opacity = trail.life / 30; trail.life--;
            if (trail.life <= 0) {
                // 🌟 QUĂNG TIA LỬA BỤI KIẾM VÀO LÒ ĐỐT
                if (typeof window.donRac3D === 'function') window.donRac3D(trail.system);
                hieuUngTuTien.splice(i, 1);
            }
        }


        if (typeof danhSachSoBay !== 'undefined') {
            for (let i = danhSachSoBay.length - 1; i >= 0; i--) {
                let item = danhSachSoBay[i]; item.offsetY += 0.05; item.life--;
                const screenPos = item.pos.clone(); screenPos.y += item.offsetY; screenPos.project(camera);
                if (screenPos.z < 1) {
                    item.el.style.left = `${(screenPos.x * 0.5 + 0.5) * window.innerWidth}px`; item.el.style.top = `${(screenPos.y * -0.5 + 0.5) * window.innerHeight}px`;
                } else { item.el.style.display = 'none'; }
                if (item.life < 20) item.el.style.opacity = item.life / 20;
                if (item.life <= 0) { item.el.remove(); danhSachSoBay.splice(i, 1); window.tongSoChuNoi_TT--; } // 🌟 Xả van
            }
        }


    } catch (e) { }
};

// 🌟 BẬT CHẠY NGẦM LIÊN TỤC CHO MỌI NGƯỜI ĐỂ QUÉT RÁC MẠNG
setInterval(window.updateCombatTuTien, 30);

// ==========================================
// CÁC HÀM TIỆN ÍCH CỦA SẾP (GIỮ NGUYÊN)
// ==========================================
window.taoSaoBangTuTien = function (pos, dir) {
    if (window.isMobile) return; // 🌟 TỐI ƯU MOBILE: Tắt đuôi sao băng bay theo kiếm
    if (Math.random() > 0.5) return;
    const geo = new THREE.BufferGeometry(); const posArr = new Float32Array([pos.x, pos.y, pos.z]); geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.3, transparent: true, opacity: 1 });
    const pts = new THREE.Points(geo, mat); scene.add(pts); hieuUngTuTien.push({ system: pts, velocities: [new THREE.Vector3(dir.x * 0.1, dir.y * 0.1, dir.z * 0.1)], life: 15 });
};

let textureLuaTuTien = null;
window.layTextureLua = function () {
    if (textureLuaTuTien) return textureLuaTuTien;
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; const ctx = canvas.getContext('2d');
    const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255, 255, 255, 1)'); grd.addColorStop(0.2, 'rgba(255, 200, 0, 1)'); grd.addColorStop(0.4, 'rgba(255, 50, 0, 0.8)'); grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, 64, 64); textureLuaTuTien = new THREE.CanvasTexture(canvas); return textureLuaTuTien;
};

window.phatAmThanhNo = function () {
    const amThanh = new Audio('https://actions.google.com/sounds/v1/weapons/big_explosion_distant.ogg'); amThanh.volume = 1.0; amThanh.play().catch(e => { });
};

// Thêm 1 biến toàn cục ở ngoài để làm đồng hồ
window.thoiDiemNoCuoiCungTT = window.thoiDiemNoCuoiCungTT || 0;

window.taoVuNoTuTien = function (pos, isRemote = false, luongDame = 100) {
    // 1. TÍNH SÁT THƯƠNG NGẦM (Luôn luôn tính để không bị hụt dame của 30 thanh kiếm)
    if (isRemote === false) {
        if (typeof window.gaySatThuong === 'function') window.gaySatThuong(pos, luongDame, 15);
    }
    else if (typeof isRemote === 'number' && isRemote > 0) {
        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, isRemote, 15);
    }

    // 2. VAN XẢ ĐỒ HỌA (MOBILE CHỈ ĐƯỢC VẼ 1 VỤ NỔ MỖI 0.3 GIÂY)
    let bayGio = Date.now();
    if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungTT < 300) {
        return; // Đã quá tải hình ảnh, bỏ qua việc vẽ cháy nổ!
    }
    window.thoiDiemNoCuoiCungTT = bayGio; // Ghi nhận thời gian nổ

    // 3. VẼ ĐỒ HỌA (Chỉ chạy khi Van Xả cho phép)
    if (typeof window.phatAmThanhNo === 'function') window.phatAmThanhNo();
    
    // 🌟 TỐI ƯU MOBILE: Giảm ép xung từ 20 hạt xuống 8 hạt tinh túy nhất
    const soLuong = window.isMobile ? 8 : 300; 
    const geo = new THREE.BufferGeometry(); const posArr = new Float32Array(soLuong * 3); const vels = [];
    
    let upV = pos.clone().normalize(); 
    let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upV);
    let tamNo = pos.clone().add(upV.clone().multiplyScalar(2)); 

    for (let i = 0; i < soLuong; i++) {
        posArr[i * 3] = tamNo.x; posArr[i * 3 + 1] = tamNo.y; posArr[i * 3 + 2] = tamNo.z; 
        let vLocal = new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 15, (Math.random() - 0.5) * 15);
        vLocal.applyQuaternion(qNolo); 
        vels.push(vLocal);
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: window.isMobile ? 12.0 : 8.0, map: window.layTextureLua(), transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
    const pts = new THREE.Points(geo, mat); scene.add(pts); hieuUngTuTien.push({ system: pts, velocities: vels, life: window.isMobile ? 25 : 60 });
};

let nhacNenTuTien = null;
window.addEventListener('click', () => {
    if (!nhacNenTuTien) { nhacNenTuTien = new Audio('uploads/nhac_nen.mp3'); nhacNenTuTien.loop = true; nhacNenTuTien.volume = 0.1; nhacNenTuTien.play().catch(e => { }); } else if (nhacNenTuTien.paused) nhacNenTuTien.play();
}, { once: true });






const danhSachSoBay = [];
window.tongSoChuNoi_TT = 0; // Biến đếm
window.taoSoSatThuong = function (pos3D, satThuong) {
    if (window.isMobile) return; // 🌟 CỨU SỐNG CPU MOBILE!
    if (satThuong <= 0) return;
    // 🌟 KHÓA VAN MOBILE: Quá 5 số thì cấm đẻ thêm HTML
    if (window.isMobile && window.tongSoChuNoi_TT > 5) return;
    window.tongSoChuNoi_TT++;

    const div = document.createElement('div'); div.innerText = "-" + Math.round(satThuong);
    let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000, -2px -2px 0px #000';
    div.style.cssText = `position:absolute; color:#ff2222; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
    document.body.appendChild(div); danhSachSoBay.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
};






window.gaySatThuong = function (tamNo, luongSatThuong, banKinh) {
    // ==========================================
    // 1. QUÉT NGƯỜI CHƠI KHÁC (PVP - ĐỒ SÁT)
    // ==========================================
    if (typeof remotePlayers !== 'undefined') {
        for (let id in remotePlayers) {
            let rp = remotePlayers[id];
            if (rp.status === 'ready' && rp.mesh) {
                // Dùng X-Quang để quét ngực người chơi khác
                let hitRP = window.layHitbox(rp.mesh);
                let tongBanKinhRP = banKinh + hitRP.banKinh;

                if (tamNo.distanceTo(hitRP.tamNguc) <= tongBanKinhRP) {
                    let posHienSo = hitRP.tamNguc.clone();
                    posHienSo.y += (hitRP.chieuCao / 2); // Hiện số sát thương trên đỉnh đầu

                    window.taoSoSatThuong(posHienSo, luongSatThuong);
                    if (typeof window.chemTrungNguoiChoi === 'function') {
                        window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }
    }

    // ==========================================
    // 2. QUÉT QUÁI VẤT & BOSS (PVE)
    // ==========================================
    if (typeof window.danhSachQuaiVat !== 'undefined') {
        window.danhSachQuaiVat.forEach(quai => {
            if (!quai.isDead && quai.mesh) {
                // 🌟 DÙNG MÁY QUÉT X-QUANG ĐỂ TÌM NGỰC VÀ HITBOX BOSS
                let hit = window.layHitbox(quai.mesh);
                let tongBanKinh = banKinh + hit.banKinh;

                if (tamNo.distanceTo(hit.tamNguc) <= tongBanKinh) {
                    // Nếu là BOSS lớn
                    if (quai.isBoss) {
                        window.taoSoSatThuong(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                        if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                    }
                    // Nếu là QUÁI THƯỜNG
                    else {
                        quai.hp -= luongSatThuong;
                        window.taoSoSatThuong(hit.tamNguc.clone(), luongSatThuong);

                        let bar = quai.tagEl ? quai.tagEl.querySelector('.hp-bar') : null;
                        if (bar) bar.style.width = Math.max(0, (quai.hp / quai.maxHp) * 100) + '%';

                        // Quái thường chết
                        if (quai.hp <= 0) {
                            quai.isDead = true;
                            quai.mesh.visible = false;
                            if (quai.tagEl) quai.tagEl.style.display = 'none';

                            if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);

                            setTimeout(() => {
                                quai.hp = quai.maxHp;
                                quai.isDead = false;
                                quai.mesh.visible = true;
                                if (bar) bar.style.width = '100%';
                                if (quai.tagEl) quai.tagEl.style.display = 'block';
                            }, 5000);
                        }
                    }
                } // <-- Kết thúc IF khoảng cách X-Quang
            } // <-- Kết thúc IF quái còn sống
        });
    }
};






// ==========================================
// ĐĂNG KÝ MÔN PHÁI & VŨ KHÍ MẠNG
// ==========================================
if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_tutien')) {
    window.HePhaiHienTai = {
        tenPhai: "Tu Tiên",
        khoiTao: function () {
            const vuKhiLoader = new THREE.GLTFLoader(); const dracoLoaderVuKhi = new THREE.DRACOLoader();
            dracoLoaderVuKhi.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/'); vuKhiLoader.setDRACOLoader(dracoLoaderVuKhi);
            const linkKiem = (typeof window.WEAPON_URL !== 'undefined' && window.WEAPON_URL !== "") ? window.WEAPON_URL : 'uploads/anims/PHIKIEM.glb';
            vuKhiLoader.load(linkKiem, (gltf) => { window.phiKiemModel = gltf.scene; window.TUTIEN_WEAPON_LOADED = true; });
        },
        tungChieu: function (phim, isRemote = false, origin = null, target = null, dir = null, casterId = null, weaponUrl = null) {
            if (typeof window.tungComboTuTien === 'function') window.tungComboTuTien(phim, isRemote, origin, target, dir, casterId, weaponUrl);
        },
        phongThu: function () { },
        capNhat: function () {
            // Vòng lặp vật lý đã tự chạy ngầm bên trên, để trống ở đây để không bị chạy đúp x2 tốc độ!
        }
    };
    window.HePhaiHienTai.khoiTao();
}
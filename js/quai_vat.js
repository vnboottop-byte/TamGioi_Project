// ==========================================
// 👹 MODULE: HỆ THỐNG BOSS TỐI THƯỢNG (BẢN V62 - FIX GÓC -Y BLENDER & TỌA ĐỘ MỒM RỒNG)
// ==========================================
console.log("🟢 Khởi động Module Boss V62 - Đã bù trừ góc -Y và Fix Tọa Độ Mồm Rồng!");

// ==========================================
// 📚 TỪ ĐIỂN AI BÁCH THÚ (BỘ NÃO TRUNG TÂM)
// ==========================================

window.TU_DIEN_AI_QUAI = window.TU_DIEN_AI_QUAI || {};

// 1. TẠO VỎ BỌC AN TOÀN TRƯỚC (CHỐNG GHI ĐÈ FILE CHIM_CA VÀ RONG)
window.TU_DIEN_AI_QUAI['CHIM'] = window.TU_DIEN_AI_QUAI['CHIM'] || {};
window.TU_DIEN_AI_QUAI['CA'] = window.TU_DIEN_AI_QUAI['CA'] || {};
window.TU_DIEN_AI_QUAI['RONG'] = window.TU_DIEN_AI_QUAI['RONG'] || {};

// 2. BƠM CHỈ SỐ BẰNG OBJECT.ASSIGN ĐỂ BẢO TOÀN HÀM TẤN CÔNG
Object.assign(window.TU_DIEN_AI_QUAI['CHIM'], {
    he: 'BAY',
    getTamDanh: (scale) => Math.max(3.0, (scale || 1) * 4.0),
    getTamNhin: (scale) => Math.max(50, (scale || 1) * 60),
    getGioiHanLanhTho: (tamNhin, scale) => Math.max(100, Math.min(3000, tamNhin * 1.5)),
    khoangCachAnToan: 5.0, 
    banKinhTuanTra: (scale) => Math.max(20, scale * 30),
    doCaoBay: 25,
    lucNghieng: 0.15,
    getChieuCaoNgam: () => 1.5, 
    getTocDoRuot: (scale) => Math.max(15.0, scale * 15.0),
    choPhepLuiBinh: true
});

// CÁ xài chung não với CHIM
Object.assign(window.TU_DIEN_AI_QUAI['CA'], window.TU_DIEN_AI_QUAI['CHIM']);

Object.assign(window.TU_DIEN_AI_QUAI['RONG'], {
    he: 'BAY',
    getTamDanh: (scale) => Math.min(400, (scale * 30) + 150),
    getTamNhin: (scale) => Math.min(400, (scale * 30) + 150) + 150,
    getGioiHanLanhTho: (tamNhin, scale) => Math.max(100, Math.min(3000, (tamNhin * 1.5) + (scale * 80 * 2))),
    khoangCachAnToan: 12.0, 
    banKinhTuanTra: (scale) => Math.max(20, scale * 80),
    doCaoBay: 60, 
    lucNghieng: 0.03, 
    getChieuCaoNgam: () => 35, 
    getTocDoRuot: (scale) => Math.max(15.0, scale * 15.0),
    choPhepLuiBinh: false 
});

window.TU_DIEN_AI_QUAI['CA'] = window.TU_DIEN_AI_QUAI['CHIM'];

// 🐲 BỘ NÃO RỒNG (VIỄN CHIẾN KHỔNG LỒ)
window.TU_DIEN_AI_QUAI['RONG'] = {
    he: 'BAY',
    getTamDanh: (scale) => Math.min(400, (scale * 30) + 150),
    getTamNhin: (scale) => Math.min(400, (scale * 30) + 150) + 150,
    getGioiHanLanhTho: (tamNhin, scale) => Math.max(100, Math.min(3000, (tamNhin * 1.5) + (scale * 80 * 2))),
    khoangCachAnToan: 12.0,
    banKinhTuanTra: (scale) => Math.max(20, scale * 80),
    doCaoBay: 60,
    lucNghieng: 0.03,
    getChieuCaoNgam: () => 35,
    getTocDoRuot: (scale) => Math.max(15.0, scale * 15.0),
    choPhepLuiBinh: false
};

window.danhSachQuaiVat = window.danhSachQuaiVat || [];
window.bossSkills = window.bossSkills || [];
window.danhSachQuaiVatDangTai = window.danhSachQuaiVatDangTai || {};




function thucHienCaiChetCuaBoss(boss) {
    // 1. CHỈ CHẠY ANIMATION CHẾT NẾU CHƯA CHẾT (Tránh lặp lại)
    if (!boss.isDead) {
        boss.isDead = true; 
        boss.hp = 0; 
        boss.state = 'DEAD';
        boss.mesh.userData.ignore = true; 

        if (typeof boss.playAnim === 'function') boss.playAnim('DIE');
        
        if (boss.tagEl) {
            boss.tagEl.style.display = 'none';
            if (boss.tagEl.parentNode) boss.tagEl.parentNode.removeChild(boss.tagEl);
        }

        setTimeout(() => {
            window.danhSachQuaiVat = window.danhSachQuaiVat.filter(q => q.id !== boss.id);
            if (boss.mesh) {
                scene.remove(boss.mesh);
                if (typeof window.donRac3D === 'function') window.donRac3D(boss.mesh);
            }
        }, 3000);
    }

    // 2. LOGIC NHẬN EXP (Tách riêng ra ngoài để luôn được chạy)
    if (boss.daNhanExp) return; // Nếu đã nhận rồi thì không cho nhận nữa
    boss.daNhanExp = true;      // Đóng dấu xác nhận đã nhận quà

    let bossLevel = boss.level || 1;
    let expNhanDuoc = bossLevel * 20;
    if (typeof window.congKinhNghiem === 'function') {
        window.congKinhNghiem(expNhanDuoc, bossLevel);
    }
}



window.dameGomChoBoss = window.dameGomChoBoss || {};
window.bossSyncTimer = window.bossSyncTimer || {};




window.chemTrungBoss = function (bossId, dame) {
    let boss = window.danhSachQuaiVat.find(q => q.id == bossId);
    
    // 🌟 MỞ KHÓA: Cho phép chém ngay cả khi Radar đã báo chết (isDead = true) để vớt lại EXP!
    // Nhưng nếu đã bú EXP rồi (daNhanExp = true) thì tha cho nó.
    if (!boss || boss.daNhanExp) return;

    boss.hp -= dame; if (boss.hp < 0) boss.hp = 0;
    if (boss.tagEl) { let bar = boss.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%'; }

    // Chết tức thì (Dự đoán Client)
    if (boss.hp <= 0) thucHienCaiChetCuaBoss(boss);
    else if (typeof boss.playAnim === 'function' && boss.state !== 'ATTACK') boss.playAnim('HIT');

    window.dameGomChoBoss[bossId] = (window.dameGomChoBoss[bossId] || 0) + dame;

    if (!window.bossSyncTimer[bossId]) {
        window.bossSyncTimer[bossId] = setTimeout(() => {
            let dmgThucTe = window.dameGomChoBoss[bossId];

            if (window.room && window.room.state === 'connected') {
                try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'BOSS_HIT', id: bossId, damageDealt: dmgThucTe })), { reliable: false }); } catch (e) { }
            }

            let fd = new FormData(); fd.append('boss_id', bossId); fd.append('damage', dmgThucTe);



            fetch('api/danh_boss.php', { method: 'POST', body: fd }).then(res => res.json()).then(data => {
                if (data.status === 'success') { 
                    boss.hp = data.hp;  // 🌟 ĐÃ SỬA: Bắt đúng biến 'hp' từ PHP gửi về!
                    if (boss.hp <= 0) thucHienCaiChetCuaBoss(boss); 
                } else if (data.status === 'dead') {
                    thucHienCaiChetCuaBoss(boss);
                }
            }).catch(e => { });




            window.dameGomChoBoss[bossId] = 0;
            window.bossSyncTimer[bossId] = null;
        }, 300);
    }
};





window.sinhRaQuaiVat = function (x, z, tenQuai, level, hpMax, scaleSize, posY, isBoss = true, bossId = null, modelUrl = null, hpCurrent = null, respawnInSec = 0, classCode = 'TU_TIEN') {
    const id = bossId || ('B_' + Date.now());

    

    if (window.danhSachQuaiVatDangTai[id]) return;
    if (window.danhSachQuaiVat.find(q => q.id == id)) return;
    window.danhSachQuaiVatDangTai[id] = true;

    const modelFile = modelUrl || 'uploads/anims/mimi_3d.glb';
    if (typeof window.taiHoacNhanBanAsset !== 'function') { delete window.danhSachQuaiVatDangTai[id]; return; }

    window.taiHoacNhanBanAsset(modelFile, function (quai, gltfAnimations) {
        delete window.danhSachQuaiVatDangTai[id];
        if (window.danhSachQuaiVat.find(q => q.id == id)) return;

        quai.scale.set(scaleSize, scaleSize, scaleSize);
        const BAN_KINH_ONG = 74980;
        let anToanX = Math.max(-BAN_KINH_ONG + 1, Math.min(BAN_KINH_ONG - 1, x));
        let yChuan = posY || -Math.sqrt(BAN_KINH_ONG * BAN_KINH_ONG - anToanX * anToanX);

        quai.position.set(x, yChuan, z);
        quai.traverse(c => {
            if (c.isMesh) { c.frustumCulled = false; c.castShadow = true; }
        });
        if (typeof scene !== 'undefined') scene.add(quai);

        const mixer = new THREE.AnimationMixer(quai);
        const anims = {};
        if (gltfAnimations) { gltfAnimations.forEach(clip => { anims[clip.name.toUpperCase()] = mixer.clipAction(clip); }); }

        const tag = document.createElement('div');
        const mauHienTai = (hpCurrent !== null) ? hpCurrent : hpMax;
        tag.innerHTML = `<div style="color:#ff0000; font-weight:bold; font-size:18px; text-shadow:1px 1px 0 #000; text-align:center;"><span style="color:#f1c40f;">[Lv.${level}]</span> 👑 ${tenQuai}</div><div style="width:100px; height:6px; background:rgba(0,0,0,0.5); border:1px solid #fff; border-radius:3px; margin:0 auto;"><div class="hp-bar" style="width:${(mauHienTai / hpMax) * 100}%; height:100%; background:#2ecc71;"></div></div>`;
        tag.style.cssText = 'position:absolute; pointer-events:none; z-index:10; transform:translate(-50%, -100%); display:none;';
        document.body.appendChild(tag);

        const info = {
            id: id, classCode: classCode, level: level, isBoss: isBoss, mesh: quai, mixer: mixer, anims: anims, tagEl: tag,
            maxHp: hpMax, hp: mauHienTai, isDead: (mauHienTai <= 0), spawnX: x, spawnZ: z, state: 'IDLE', lastAttackTime: 0, currentAnimName: '',

            playAnim: function (ten) {
                let theLoaiCanTim = ten.toUpperCase();
                if (this.currentAnimName === theLoaiCanTim) return;

                let danhSachTenGoc = Object.keys(this.anims);
                if (danhSachTenGoc.length === 0) return;

                let tenTrungKhop = null;

                if (danhSachTenGoc.length === 1) {
                    tenTrungKhop = danhSachTenGoc[0];
                }
                else {
                    tenTrungKhop = danhSachTenGoc.find(n => n === theLoaiCanTim);
                    if (!tenTrungKhop) {
                        if (theLoaiCanTim === 'ATTACK') tenTrungKhop = danhSachTenGoc.find(n => /attack|bite|breath|fire|hit|strike|magic|skill|cạp|đánh|phun|chieuq|chieue|chieur|chieuf|tancong/i.test(n));
                        else if (theLoaiCanTim === 'RUN') tenTrungKhop = danhSachTenGoc.find(n => /chaybo|run|walk|fly|swim|move|chase|circling|bay|chạy|dibo/i.test(n));
                        else if (theLoaiCanTim === 'IDLE') tenTrungKhop = danhSachTenGoc.find(n => /idle|wait|rest|stand|nghỉ|nhanroi/i.test(n));
                        else if (theLoaiCanTim === 'DIE') tenTrungKhop = danhSachTenGoc.find(n => /die|death|dead|drop|chet/i.test(n));
                        else if (theLoaiCanTim.includes('CHIEU')) {
                            tenTrungKhop = danhSachTenGoc.find(n => n.includes(theLoaiCanTim));
                            if (!tenTrungKhop) tenTrungKhop = danhSachTenGoc.find(n => /tancong|attack|skill/i.test(n));
                        }
                    }

                    if (!tenTrungKhop) {
                        if (theLoaiCanTim === 'IDLE' || theLoaiCanTim === 'NHANROI') tenTrungKhop = danhSachTenGoc[0];
                        else if (theLoaiCanTim === 'RUN' || theLoaiCanTim === 'CHAYBO') tenTrungKhop = danhSachTenGoc[1] || danhSachTenGoc[0];
                        else if (theLoaiCanTim === 'ATTACK' || theLoaiCanTim.includes('CHIEU')) tenTrungKhop = danhSachTenGoc[2] || danhSachTenGoc[0];
                        else tenTrungKhop = danhSachTenGoc[0];
                    }
                }

                let action = this.anims[tenTrungKhop];
                if (action) {
                    if (this.cur) this.cur.fadeOut(0.2);
                    this.cur = action;
                    this.currentAnimName = theLoaiCanTim;

                    if (theLoaiCanTim === 'DIE') {
                        action.setLoop(THREE.LoopOnce);
                        action.clampWhenFinished = true;
                    } else {
                        action.setLoop(THREE.LoopRepeat);
                    }
                    action.reset().fadeIn(0.2).play();
                }
            }
        };

        if (info.isDead) { quai.visible = false; tag.style.display = 'none'; } else { info.playAnim('IDLE'); }
        window.danhSachQuaiVat.push(info);
    });
};

function getBossObj(type, size, color = 0xffffff) {
    const group = new THREE.Group();
    if (type === 'KIEM' && window.phiKiemModel) group.add(window.phiKiemModel.clone());
    else if (type === 'VONG' && window.vongPhepModel) group.add(window.vongPhepModel.clone());
    else if (type === 'DAN' && window.viendanModel) group.add(window.viendanModel.clone());
    else if (type === 'PHICO' && window.phicoModel) group.add(window.phicoModel.clone());
    else {
        let geo, mat, mesh;
        if (type === 'KIEM') { geo = new THREE.ConeGeometry(0.8, 5, 8); geo.rotateX(Math.PI / 2); mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true }); }
        else if (type === 'VONG') { geo = new THREE.TorusGeometry(3, 0.2, 16, 32); geo.rotateX(Math.PI / 2); mat = new THREE.MeshBasicMaterial({ color: 0x9b59b6, transparent: true, opacity: 0.8 }); }
        else if (type === 'PHICO') { geo = new THREE.TetrahedronGeometry(2.5); mat = new THREE.MeshBasicMaterial({ color: 0xe74c3c, wireframe: true }); }
        else { geo = new THREE.SphereGeometry(1.5, 16, 16); mat = new THREE.MeshBasicMaterial({ color: 0xf1c40f }); }
        mesh = new THREE.Mesh(geo, mat); group.add(mesh);
    }
    group.scale.set(size, size, size); return group;
}

window.bossTungTuyetKieu = function (quai, targetPos, phaiIn, chieuIn) {
    if (!quai || !quai.mesh) return;
    const startPos = quai.mesh.position.clone(); startPos.y += 10;
    const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
    const dmg = quai.damage || 100;
    const phai = phaiIn || ['TU_TIEN', 'PHAP_SU', 'XA_THU', 'CUNG_THU', 'LAZER'][Math.floor(Math.random() * 5)];
    const chieu = chieuIn || ['Q', 'E', 'R', 'F'][Math.floor(Math.random() * 4)];

    if (phai === 'TU_TIEN') {
        if (chieu === 'F') {
            const pivot = new THREE.Group(); pivot.position.set(targetPos.x, targetPos.y + 20, targetPos.z); pivot.lookAt(targetPos);
            const s = getBossObj('KIEM', 4); s.rotateX(-Math.PI * 0.8); pivot.add(s); scene.add(pivot);
            window.bossSkills.push({ mesh: pivot, sword: s, type: 'KIEM_F', ticks: 0, life: 100, target: targetPos.clone(), dmg: dmg * 2 });
        } else {
            const s = getBossObj('KIEM', 1); s.position.copy(startPos); s.lookAt(targetPos); scene.add(s);
            window.bossSkills.push({ mesh: s, type: 'BAY_THANG', speed: 4, life: 100, target: targetPos.clone(), dmg: dmg });
        }
    } else if (phai === 'PHAP_SU') {
        if (chieu === 'E' || chieu === 'F') {
            const v = getBossObj('VONG', 15); v.position.copy(targetPos).add(new THREE.Vector3(0, 10, 0)); v.rotation.x = -Math.PI / 2; scene.add(v);
            window.bossSkills.push({ mesh: v, type: 'VONG_EP', ticks: 0, life: 100, target: targetPos.clone(), dmg: dmg * 2 });
        } else {
            const v = getBossObj('VONG', 5); v.position.copy(startPos); v.lookAt(targetPos); v.rotateX(Math.PI / 2); scene.add(v);
            window.bossSkills.push({ mesh: v, type: 'BAY_THANG', speed: 3, life: 120, target: targetPos.clone(), dmg: dmg });
        }
    } else if (phai === 'XA_THU') {
        if (chieu === 'F') {
            const jet = getBossObj('PHICO', 8); jet.position.copy(startPos).sub(dir.clone().multiplyScalar(50)); jet.lookAt(targetPos); scene.add(jet);
            window.bossSkills.push({ mesh: jet, type: 'JET_DIVE', state: 'FLY', speed: 3, life: 200, target: targetPos.clone(), dmg: dmg * 5 });
        } else {
            for (let i = 0; i < 10; i++) {
                const d = getBossObj('DAN', 2); d.position.set(targetPos.x + (Math.random() - 0.5) * 40, targetPos.y + 80, targetPos.z + (Math.random() - 0.5) * 40); d.lookAt(targetPos); scene.add(d);
                window.bossSkills.push({ mesh: d, type: 'BAY_XUONG', speed: 5, delay: i * 2, life: 100, target: targetPos.clone(), dmg: dmg });
            }
        }
    } else if (phai === 'CUNG_THU') {
        const arrow = getBossObj('DAN', 3, 0x00ff00); arrow.position.copy(startPos); arrow.lookAt(targetPos); scene.add(arrow);
        window.bossSkills.push({ mesh: arrow, type: 'BAY_THANG', speed: 6, life: 100, target: targetPos.clone(), dmg: dmg });
    } else if (phai === 'LAZER') {
        const geo = new THREE.CylinderGeometry(2, 2, 10, 8); geo.rotateX(Math.PI / 2); const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
        const l = new THREE.Mesh(geo, mat); l.position.copy(startPos); l.lookAt(targetPos); scene.add(l);
        window.bossSkills.push({ mesh: l, type: 'LAZER_GROW', life: 30, target: targetPos.clone(), dmg: dmg });
    }
};

window.xuLyQuaiLuiBinh = function (quai, targetPos, delta) {
    if (!quai.thoiDiemDam) return false;
    let thoiGianDaQua = Date.now() - quai.thoiDiemDam;
    if (thoiGianDaQua > 500) return false;

    quai.state = 'RETREAT';
    if (typeof quai.playAnim === 'function') quai.playAnim('RUN');

    let huongLui = new THREE.Vector3().subVectors(quai.mesh.position, targetPos).normalize();
    huongLui.projectOnPlane(quai.upVector).normalize();

    let tocDoLui = Math.max(5.0, (quai.heSoToLon || 1) * 3.0);
    quai.mesh.position.add(huongLui.multiplyScalar(tocDoLui * delta));

    let huongNhinPhang = new THREE.Vector3().subVectors(targetPos, quai.mesh.position).projectOnPlane(quai.upVector).normalize();
    let dummy = new THREE.Object3D();
    dummy.position.copy(quai.mesh.position); dummy.up.copy(quai.upVector);
    dummy.lookAt(quai.mesh.position.clone().add(huongNhinPhang));
    quai.mesh.quaternion.slerp(dummy.quaternion, 0.1);

    return true;
};

// 5. TRÍ TUỆ NHÂN TẠO BOSS
window.capNhatAIQuaiVat = function (delta) {
    if (!window.danhSachQuaiVat || !playerModel) return;

    window.danhSachQuaiVat.forEach(quai => {
        if (quai.mixer) quai.mixer.update(delta);
        if (quai.isDead) return;






        if (!quai.heSoToLon) {
            quai.mesh.updateMatrixWorld(true);
            let box = new THREE.Box3().setFromObject(quai.mesh);
            let size = new THREE.Vector3(); box.getSize(size);
            let worldSize = Math.max(size.x, size.y, size.z);
            
            // 🌟 MỚI THÊM: Đo Tâm Thực Tế (Lõi Thịt) và Chiều Cao Hộp
            const center = new THREE.Vector3(); 
            box.getCenter(center);
            quai.tamThucTeLocal = quai.mesh.worldToLocal(center); 
            quai.chieuCaoThuc = box.max.y - box.min.y; 

            quai.heSoToLon = worldSize / 25;
            if (quai.heSoToLon < 0.5) quai.heSoToLon = 0.5;
        }




        if (window.TAM_HANH_TINH_HIEN_TAI) {
            quai.upVector = quai.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
        } else {
            quai.upVector = new THREE.Vector3(0, 1, 0);
        }

        if (quai.frameQuetDat === undefined) quai.frameQuetDat = Math.floor(Math.random() * 30);
        quai.frameQuetDat++;

        if (quai.frameQuetDat > 15) {
            quai.frameQuetDat = 0;
            if (!window.radarQuaiVat) window.radarQuaiVat = new THREE.Raycaster();
            let tiaBatDau = quai.mesh.position.clone().add(quai.upVector.clone().multiplyScalar(2000));
            let huongXuongDat = quai.upVector.clone().negate();
            window.radarQuaiVat.set(tiaBatDau, huongXuongDat);

            if (window.DANH_SACH_MAT_DAT && window.DANH_SACH_MAT_DAT.length > 0) {
                let vaCham = window.radarQuaiVat.intersectObjects(window.DANH_SACH_MAT_DAT, true);
                if (vaCham.length > 0) quai.mucTieuY = vaCham[0].point;
            }
        }

        if (['RONG', 'CHIM', 'CA'].includes(quai.classCode) && (!quai.state || quai.state === 'IDLE')) {
            if (quai.tFlying === undefined) {
                quai.tFlying = Math.random() * 1000;
                quai.adn1 = 0.2 + Math.random() * 0.1;
            }
            quai.tFlying += delta * 0.5;
            let t = quai.tFlying * quai.adn1;

            let boNao = window.TU_DIEN_AI_QUAI[quai.classCode];
            let banKinhBay = boNao ? boNao.banKinhTuanTra(quai.heSoToLon || 1) : 30;
            let doCaoBay = boNao ? boNao.doCaoBay : 20;
            let lucNghieng = boNao ? boNao.lucNghieng : 0.1;

            if (banKinhBay < 20) banKinhBay = 20;

            let vUp = quai.upVector ? quai.upVector.clone() : new THREE.Vector3(0, 1, 0);
            let right = new THREE.Vector3(1, 0, 0).cross(vUp).normalize();
            if (right.lengthSq() < 0.001) right.set(0, 0, 1).cross(vUp).normalize();
            let forward = new THREE.Vector3().crossVectors(right, vUp).normalize();

            let viTriMoi = quai.spawnPos ? quai.spawnPos.clone() : quai.mesh.position.clone();
            viTriMoi.add(vUp.clone().multiplyScalar(doCaoBay));
            viTriMoi.add(right.multiplyScalar(Math.sin(t) * banKinhBay));
            viTriMoi.add(forward.multiplyScalar(Math.sin(t * 2.0) * (banKinhBay * 0.6)));

            let huongDi = viTriMoi.clone().sub(quai.mesh.position);
            quai.mesh.position.lerp(viTriMoi, 0.03);

            if (huongDi.lengthSq() > 0.01) {
                let dummy = new THREE.Object3D();
                dummy.position.copy(quai.mesh.position); dummy.up.copy(vUp);
                dummy.lookAt(quai.mesh.position.clone().add(huongDi));
                dummy.rotateZ(-Math.cos(t) * lucNghieng);
                quai.mesh.quaternion.slerp(dummy.quaternion, 0.05);
            }
        }

        if (quai.tagEl && typeof camera !== 'undefined') {
            let khoangCachDenCam = camera.position.distanceTo(quai.mesh.position);
            let tamNhinTen = 800 * (quai.heSoToLon || 1);
            if (tamNhinTen < 1000) tamNhinTen = 1000;




            if (khoangCachDenCam < tamNhinTen) {
                // 🌟 SỬA ĐỔI: Dùng Lõi Thịt làm mốc, đẩy lên nửa chiều cao hộp + 0.5m
                const p = quai.tamThucTeLocal ? quai.tamThucTeLocal.clone().applyMatrix4(quai.mesh.matrixWorld) : quai.mesh.position.clone();
                let chieuCaoNapBox = quai.chieuCaoThuc ? (quai.chieuCaoThuc / 2) : ((quai.heSoToLon * 15) + 5);
                p.y += chieuCaoNapBox + 0.5; 

                p.project(camera);




                if (p.z < 1) {
                    quai.tagEl.style.left = `${(p.x * .5 + .5) * window.innerWidth}px`;
                    quai.tagEl.style.top = `${(p.y * -.5 + .5) * window.innerHeight}px`;
                    quai.tagEl.style.display = 'block';

                    let tyLeZoom = 1.0 - (khoangCachDenCam / tamNhinTen);
                    if (tyLeZoom < 0.25) tyLeZoom = 0.25;
                    if (tyLeZoom > 1.0) tyLeZoom = 1.0;

                    quai.tagEl.style.transform = `translate(-50%, -100%) scale(${tyLeZoom})`;
                    quai.tagEl.style.opacity = tyLeZoom + 0.1;
                    quai.tagEl.style.zIndex = Math.round(100000 - khoangCachDenCam);
                } else {
                    quai.tagEl.style.display = 'none';
                }
            } else {
                quai.tagEl.style.display = 'none';
            }
        }

        let refPos = quai.targetPosLK || quai.mesh.position;
        let myDist = refPos.distanceTo(playerModel.position);
        let isClosest = true; let closestPos = playerModel.position.clone();

        if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers !== null) {
            for (let id in window.remotePlayers) {
                let rp = window.remotePlayers[id];
                if (rp && rp.status === 'ready' && rp.mesh) {
                    let d = refPos.distanceTo(rp.mesh.position);
                    if (d < myDist - 5) { isClosest = false; myDist = d; closestPos = rp.mesh.position.clone(); }
                }
            }
        }

        let boNao = window.TU_DIEN_AI_QUAI[quai.classCode];
        let scaleTamNhin = 600;
        let scaleTamDanh = 500;
        let gioiHanLanhTho = 900;
        let khoangCachAnToan = 0;

        if (boNao) {
            scaleTamDanh = boNao.getTamDanh(quai.heSoToLon || 1);
            scaleTamNhin = boNao.getTamNhin(quai.heSoToLon || 1);
            gioiHanLanhTho = boNao.getGioiHanLanhTho(scaleTamNhin, quai.heSoToLon || 1);
            khoangCachAnToan = boNao.khoangCachAnToan;
        }

        if (quai.lastHp === undefined) quai.lastHp = quai.hp;
        if (quai.hp < quai.lastHp) { quai.thoiDiemBiChocGian = Date.now(); quai.lastHp = quai.hp; }
        else if (quai.hp > quai.lastHp) { quai.lastHp = quai.hp; }

        let dangCayCu = (quai.thoiDiemBiChocGian && (Date.now() - quai.thoiDiemBiChocGian < 15000));

        if (quai.spawnPos === undefined) quai.spawnPos = quai.mesh.position.clone();
        let cachXaO = quai.spawnPos.distanceTo(playerModel.position);

        if (dangCayCu && scaleTamNhin < gioiHanLanhTho) scaleTamNhin = gioiHanLanhTho;

        if (isClosest && myDist < scaleTamNhin && cachXaO < gioiHanLanhTho && !window.isDead) {
            let dangLui = false;
            if (boNao && boNao.choPhepLuiBinh) {
                dangLui = window.xuLyQuaiLuiBinh(quai, playerModel.position, delta);
            }

            if (dangLui) {
                // Đang lùi
            }
            else if (myDist < scaleTamDanh) {
                quai.state = 'ATTACK';
                if (boNao && typeof boNao.thucHienTanCong === 'function') {
                    boNao.thucHienTanCong(quai, playerModel, delta);
                }
                else {
                    if (Date.now() - quai.lastAttackTime > 3000) {
                        quai.lastAttackTime = Date.now();
                        const chieu = ['Q', 'E', 'R', 'F'][Math.floor(Math.random() * 4)];
                        if (typeof quai.playAnim === 'function') quai.playAnim('CHIEU' + chieu);

                        let huongNhin = new THREE.Vector3().subVectors(playerModel.position, quai.mesh.position).projectOnPlane(quai.upVector).normalize();
                        let dummy = new THREE.Object3D();
                        dummy.position.copy(quai.mesh.position); dummy.up.copy(quai.upVector);
                        dummy.lookAt(quai.mesh.position.clone().add(huongNhin));
                        quai.mesh.quaternion.slerp(dummy.quaternion, 0.5);





                        let dmgBoss = (quai.maxHp || 4000) * 0.05;
                        // 🌟 SỬA ĐỔI: Phóng chiêu trực tiếp từ giữa Lõi Thịt
                        const bOrigin = quai.tamThucTeLocal ? quai.tamThucTeLocal.clone().applyMatrix4(quai.mesh.matrixWorld) : quai.mesh.position.clone();
                        if (!quai.tamThucTeLocal) bOrigin.y += 5; // Dự phòng an toàn
                        
                        const pTarget = playerModel.position.clone(); pTarget.y += 5;




                        const bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize();

                        let tempId = "BOSS_" + quai.id;
                        if (typeof window.remotePlayers !== 'undefined') window.remotePlayers[tempId] = { status: 'ready', mesh: quai.mesh };

                        let bossWeapon = null;
                        if (quai.classCode === 'TU_TIEN') bossWeapon = 'uploads/anims/PHIKIEM.glb';
                        else if (quai.classCode === 'CUNG_THU') bossWeapon = 'uploads/anims/CUNGTEN.glb';
                        else if (quai.classCode === 'PHAP_SU') bossWeapon = 'uploads/anims/vong_phep.glb';

                        if (quai.classCode === 'TU_TIEN' && typeof window.tungComboTuTien === 'function') window.tungComboTuTien(chieu, dmgBoss, bOrigin, pTarget, bDir, tempId, bossWeapon);
                        else if (quai.classCode === 'PHAP_SU' && typeof window.tungComboPhapSu === 'function') window.tungComboPhapSu(chieu, dmgBoss, bOrigin, pTarget, bDir, tempId, bossWeapon);
                        else if (quai.classCode === 'CUNG_THU' && typeof window.tungComboCungThu === 'function') window.tungComboCungThu(chieu, dmgBoss, bOrigin, pTarget, bDir, tempId, bossWeapon);
                        else if (quai.classCode === 'XA_THU' && typeof window.tungComboBanSung === 'function') window.tungComboBanSung(chieu, dmgBoss, bOrigin, pTarget, bDir, tempId, bossWeapon);
                        else if (quai.classCode === 'LAZER' && typeof window.tungComboLazer === 'function') window.tungComboLazer(chieu, dmgBoss, bOrigin, pTarget, bDir, tempId, bossWeapon);
                        else if (quai.classCode === 'LUYEN_THE' && typeof window.tungComboLuyenThe === 'function') window.tungComboLuyenThe(chieu, dmgBoss, bOrigin, pTarget, bDir, tempId, bossWeapon);
                        
                        

                        else if (typeof window.bossTungTuyetKieu === 'function') window.bossTungTuyetKieu(quai, pTarget, 'LUYEN_THE', chieu);
                        

                        setTimeout(() => { if (typeof window.remotePlayers !== 'undefined') delete window.remotePlayers[tempId]; }, 100);

                        if (window.room && window.room.state === 'connected') {
                            try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'BOSS_SKILL', bossId: quai.id, target: { x: pTarget.x, y: pTarget.y, z: pTarget.z }, phai: quai.classCode, chieu: chieu })), { reliable: true }); } catch (e) { }
                        }
                    }
                }
            }
            else {
                quai.state = 'CHASE';
                if (typeof quai.playAnim === 'function') quai.playAnim('RUN');

                if (boNao && boNao.he === 'BAY') {
                    let mucTieuBay = playerModel.position.clone();
                    mucTieuBay.add(quai.upVector.clone().multiplyScalar(boNao.getChieuCaoNgam()));

                    let huongBay = new THREE.Vector3().subVectors(mucTieuBay, quai.mesh.position).normalize();
                    let tocDoRuot = boNao.getTocDoRuot(quai.heSoToLon || 1);

                    quai.mesh.position.add(huongBay.multiplyScalar(tocDoRuot * delta));

                    if (quai.mesh.position.distanceTo(playerModel.position) > 2) {
                        let huongRuotPhang = new THREE.Vector3().subVectors(playerModel.position, quai.mesh.position).projectOnPlane(quai.upVector).normalize();
                        let dummy = new THREE.Object3D();
                        dummy.position.copy(quai.mesh.position); dummy.up.copy(quai.upVector);
                        dummy.lookAt(quai.mesh.position.clone().add(huongRuotPhang));
                        quai.mesh.quaternion.slerp(dummy.quaternion, 0.1);
                    }
                }
            }
        }

        else if (!isClosest) {
            let huongNhin = new THREE.Vector3().subVectors(closestPos, quai.mesh.position).projectOnPlane(quai.upVector).normalize();
            let dummy = new THREE.Object3D();
            dummy.position.copy(quai.mesh.position); dummy.up.copy(quai.upVector);
            dummy.lookAt(quai.mesh.position.clone().add(huongNhin));
            quai.mesh.quaternion.slerp(dummy.quaternion, 0.1);

            if (quai.targetPosLK) {
                quai.mesh.position.lerp(quai.targetPosLK, 0.2);
                if (quai.targetAnimLK && typeof quai.playAnim === 'function') {
                    if (quai.targetAnimLK === 'CHASE') quai.playAnim('RUN');
                    else quai.playAnim(quai.targetAnimLK);
                }
            }
        }

        else {
            quai.state = 'IDLE';
            if (typeof quai.playAnim === 'function') quai.playAnim('RUN');
        }

        if (quai.mucTieuY && window.TAM_HANH_TINH_HIEN_TAI) {
            let kcQuai = quai.mesh.position.distanceTo(window.TAM_HANH_TINH_HIEN_TAI);
            let kcDat = quai.mucTieuY.distanceTo(window.TAM_HANH_TINH_HIEN_TAI);
            let khoangCachAnToan = boNao ? boNao.khoangCachAnToan : 0;

            if (kcQuai < kcDat + khoangCachAnToan) {
                let viTriCuuHo = window.TAM_HANH_TINH_HIEN_TAI.clone().add(quai.upVector.clone().multiplyScalar(kcDat + khoangCachAnToan));
                quai.mesh.position.lerp(viTriCuuHo, 0.5);
            }
        }

        if (quai.upVector) {
            let trucUpHienTai = new THREE.Vector3(0, 1, 0).applyQuaternion(quai.mesh.quaternion);
            let nanTrucQuat = new THREE.Quaternion().setFromUnitVectors(trucUpHienTai, quai.upVector);
            quai.mesh.quaternion.premultiply(nanTrucQuat);
        }

        if (window.room && window.room.state === 'connected') {
            if (Date.now() - (quai.lastPosSync || 0) > 100) {
                quai.lastPosSync = Date.now();
                try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'BOSS_POS', bossId: quai.id, x: parseFloat(quai.mesh.position.x.toFixed(2)), y: parseFloat(quai.mesh.position.y.toFixed(2)), z: parseFloat(quai.mesh.position.z.toFixed(2)), anim: quai.state })), { reliable: false }); } catch (e) { }
            }
        }

    });
};

// 6. VÒNG LẶP SKILL VÀ SÁT THƯƠNG BOSS THƯỜNG
setInterval(() => {
    for (let i = window.bossSkills.length - 1; i >= 0; i--) {
        let s = window.bossSkills[i];
        if (s.delay && s.delay > 0) { s.delay--; continue; }
        s.life--; let hit = false;

        if (s.type === 'BAY_THANG' || s.type === 'BAY_XUONG') {
            s.mesh.translateZ(s.speed); if (s.mesh.position.distanceTo(s.target) < 10 || s.mesh.position.y < s.target.y + 1) hit = true;
        } else if (s.type === 'KIEM_F' || s.type === 'VONG_EP') {
            if (s.sword) s.sword.rotateX(0.1); s.ticks++; if (s.ticks > 40) hit = true;
        } else if (s.type === 'LAZER_GROW') {
            s.mesh.scale.z += 5; s.mesh.material.opacity = s.life / 30; if (s.life === 25 && typeof playerModel !== 'undefined' && playerModel && s.mesh.position.distanceTo(playerModel.position) < 50) hit = true;
        } else if (s.type === 'JET_DIVE') {
            if (s.state === 'FLY') { s.mesh.translateZ(s.speed); if (s.mesh.position.distanceTo(s.target) < 100) s.state = 'DIVE'; }
            else { s.mesh.lookAt(s.target); s.speed *= 1.1; s.mesh.translateZ(s.speed); if (s.mesh.position.distanceTo(s.target) < 10) hit = true; }
        }

        if (hit || s.life <= 0) {
            if (hit && typeof playerModel !== 'undefined' && playerModel && !window.isDead && typeof window.mauBanThan !== 'undefined') {
                if ((s.mesh ? s.mesh.position : s.target).distanceTo(playerModel.position) < 30) {
                    if (window.ADMIN_NAME !== "Admin" && window.ROLE !== "admin" && window.myUsername !== "Admin") {
                        window.mauBanThan -= Math.round(s.dmg);
                        if (typeof taoSoSatThuong === 'function') taoSoSatThuong(playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), Math.round(s.dmg));
                        const uiThanhMau = document.getElementById('thanhMauHienTai'); const uiSoMau = document.getElementById('soMauHienTai');
                        if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
                        if (uiSoMau) uiSoMau.innerText = Math.max(0, window.mauBanThan).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
                        if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') window.xuLyCaiChetNhanVat("Tuyệt Kỹ Boss");
                    }
                }
            }
            if (typeof window.taoVuNoTuTien === 'function') window.taoVuNoTuTien(s.mesh ? s.mesh.position : s.target, true, 0);
            if (typeof window.donRac3D === 'function') { window.donRac3D(s.mesh); if (s.marker) window.donRac3D(s.marker); if (s.warningMesh) window.donRac3D(s.warningMesh); if (s.sword) window.donRac3D(s.sword); }
            window.bossSkills.splice(i, 1);
        } // <--- CHÍNH CÁI DẤU NGOẶC NÀY BỊ MẤT TRONG FILE CŨ CỦA SẾP!
    }
}, 30);
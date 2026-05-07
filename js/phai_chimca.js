// ==========================================
// 🦅🐟 MÔN PHÁI: THÚ CẬN CHIẾN (CHIM & CÁ) - BẢN AI CHUẨN THỜI GIAN THỰC
// ==========================================
console.log("🦅🐟 Đã load Bí Kíp Chim Cá (Bản Hit & Run - Đồng bộ Vật lý Engine)!");

window.hieuUngChimCa = window.hieuUngChimCa || [];

window.tungComboChimCa = function (chieu, dmgBoss, bOrigin, pTarget, bDir, tempId, weaponUrl, isRemote = false) {
    if (!window.scene) return;
    taoHieuUngCaoCau(pTarget, bDir, dmgBoss, isRemote);
};

function taoHieuUngCaoCau(targetPos, dir, dame, isRemote) {
    const soLuong = 100; const geo = new THREE.BufferGeometry(); const posArr = new Float32Array(soLuong * 3); const vels = [];
    let diemTrungDon = targetPos.clone();
    if (!isRemote && window.playerModel) diemTrungDon = window.playerModel.position.clone().add(window.playerModel.up.clone().multiplyScalar(4));

    for (let i = 0; i < soLuong; i++) {
        posArr[i * 3] = diemTrungDon.x; posArr[i * 3 + 1] = diemTrungDon.y; posArr[i * 3 + 2] = diemTrungDon.z;
        vels.push(new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const mat = new THREE.PointsMaterial({ color: 0xff0000, size: 3.0, transparent: true, depthWrite: false });
    const pts = new THREE.Points(geo, mat); scene.add(pts);
    window.hieuUngChimCa.push({ system: pts, velocities: vels, life: 20 });
}

// Vòng lặp dọn rác máu
if (!window.loopChimCaRunning) {
    window.loopChimCaRunning = true;
    setInterval(() => {
        for (let i = window.hieuUngChimCa.length - 1; i >= 0; i--) {
            let h = window.hieuUngChimCa[i]; h.life--;
            if (h.system) {
                let posArr = h.system.geometry.attributes.position.array;
                for (let j = 0; j < posArr.length / 3; j++) { posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y - 0.5; posArr[j * 3 + 2] += h.velocities[j].z; }
                h.system.geometry.attributes.position.needsUpdate = true; h.system.material.opacity = h.life / 20;
                if (h.life <= 0) { if (typeof window.donRac3D === 'function') window.donRac3D(h.system); window.hieuUngChimCa.splice(i, 1); }
            }
        }
    }, 30);
}

// ==========================================
// 🧠 LOGIC NÃO CHIM (MÔ PHỎNG 100% TIME-STEP CỦA RỒNG)
// ==========================================
window.TU_DIEN_AI_QUAI = window.TU_DIEN_AI_QUAI || {};
window.TU_DIEN_AI_QUAI['CHIM'] = window.TU_DIEN_AI_QUAI['CHIM'] || {};
window.TU_DIEN_AI_QUAI['CA'] = window.TU_DIEN_AI_QUAI['CA'] || {};

window.TU_DIEN_AI_QUAI['CHIM'].thucHienTanCong = function (quai, playerModel, delta) {
    // Nếu quái vừa sinh ra chưa có mốc thời gian, gài cho nó
    if (!quai.lastAttackTime) quai.lastAttackTime = Date.now();
    let thoiGianCho = Date.now() - quai.lastAttackTime;

    // Tính lực đánh
    let dmgBoss = (quai.maxHp || 4000) * 0.05;
    let pTarget = playerModel.position.clone();
    let huongLao = new THREE.Vector3().subVectors(pTarget, quai.mesh.position).projectOnPlane(quai.upVector).normalize();

    // 1. TỪ GIÂY 0 ĐẾN 1.5: Lùi nhẹ rà mục tiêu (Lấy đà)
    if (thoiGianCho < 1500) {
        quai.mesh.position.sub(huongLao.clone().multiplyScalar(1.5 * delta));
        let dummy = new THREE.Object3D(); dummy.position.copy(quai.mesh.position); dummy.lookAt(pTarget);
        quai.mesh.quaternion.slerp(dummy.quaternion, 0.1);
        if (typeof quai.playAnim === 'function') quai.playAnim('WALK');
    }

    // 2. GIÂY THỨ 1.5: Cú mổ thứ 1
    if (thoiGianCho >= 1500 && thoiGianCho < 1600 && !quai.daCanNhat1) {
        quai.daCanNhat1 = true;
        if (typeof quai.playAnim === 'function') quai.playAnim('ATTACK');
        quai.mesh.position.add(huongLao.multiplyScalar(3.5)); // Lướt
        thucHienTruMauVaHienSo(quai, pTarget, huongLao, dmgBoss / 2); // Trừ nửa dame
    }

    // 3. TỪ GIÂY 1.6 ĐẾN 2.5: Rút binh ngó chừng (Hit & Run)
    if (thoiGianCho >= 1600 && thoiGianCho < 2500) {
        quai.mesh.position.sub(huongLao.clone().multiplyScalar(4.0 * delta));
        if (typeof quai.playAnim === 'function') quai.playAnim('WALK');
    }

    // 4. GIÂY THỨ 3: Cú mổ BỒI chí mạng
    if (thoiGianCho > 3000) {
        quai.lastAttackTime = Date.now(); // Reset bộ đếm vòng lặp
        quai.daCanNhat1 = false;

        if (typeof quai.playAnim === 'function') quai.playAnim('ATTACK');
        quai.mesh.position.add(huongLao.multiplyScalar(4.5)); // Lướt sâu hơn
        thucHienTruMauVaHienSo(quai, pTarget, huongLao, dmgBoss / 2); // Trừ nửa dame còn lại
    }
};

window.TU_DIEN_AI_QUAI['CA'].thucHienTanCong = window.TU_DIEN_AI_QUAI['CHIM'].thucHienTanCong;

function thucHienTruMauVaHienSo(quai, pTarget, bDir, dame) {
    if (typeof window.tungComboChimCa === 'function') {
        window.tungComboChimCa('CAN_CHIEN', dame, quai.mesh.position, pTarget, bDir, quai.id, null, false);
    }

    if (!window.IS_IN_SAFE_ZONE) {
        // TẠM TẮT ĐỂ SẾP TEST THẤY SÁT THƯƠNG
        // let role = (window.ROLE || "").toLowerCase(); let name = (window.ADMIN_NAME || window.myUsername || "").toLowerCase();
        // if (role !== "admin" && name !== "admin") {
        window.mauBanThan -= Math.round(dame);
        if (typeof window.taoSoSatThuong === 'function') window.taoSoSatThuong(pTarget.clone().add(new THREE.Vector3(0, 5, 0)), Math.round(dame));

        const uiThanhMau = document.getElementById('thanhMauHienTai'); const uiSoMau = document.getElementById('soMauHienTai');
        if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
        if (uiSoMau) uiSoMau.innerText = Math.max(0, Math.round(window.mauBanThan)).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";

        if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') window.xuLyCaiChetNhanVat("Bị Quái Vật Xé Xác");
        // }
    }

    if (window.room && window.room.state === 'connected') {
        try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'BOSS_SKILL', bossId: quai.id, target: { x: pTarget.x, y: pTarget.y, z: pTarget.z }, phai: 'CHIM', chieu: 'CAN_CHIEN' })), { reliable: true }); } catch (e) { }
    }
}
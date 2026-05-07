// ==========================================
// 🦅🐟 BỘ NÃO AI: THÚ CẬN CHIẾN (CHIM & CÁ)
// Đặc điểm: Lao tới cắn -> Lùi ra -> Lao tới cắn
// ==========================================
console.log("🦅🐟 Đã load Bộ Não AI Thú: Hit & Run (Bản Sát Thủ)!");

window.hieuUngChimCa = window.hieuUngChimCa || [];

// HIỆU ỨNG TÓE MÁU KHI BỊ CẮN
window.tungComboChimCa = function (chieu, dmgBoss, bOrigin, pTarget, bDir, tempId, weaponUrl, isRemote = false) {
    if (!window.scene) return;

    const soLuong = 80;
    const geo = new THREE.BufferGeometry();
    const posArr = new Float32Array(soLuong * 3);
    const vels = [];

    let diemTrungDon = pTarget.clone();
    if (!isRemote && window.playerModel) {
        diemTrungDon = window.playerModel.position.clone().add(new THREE.Vector3(0, 3, 0));
    }

    for (let i = 0; i < soLuong; i++) {
        posArr[i * 3] = diemTrungDon.x;
        posArr[i * 3 + 1] = diemTrungDon.y;
        posArr[i * 3 + 2] = diemTrungDon.z;

        let v = new THREE.Vector3((Math.random() - 0.5) * 6, Math.random() * 5, (Math.random() - 0.5) * 6);
        vels.push(v);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const mat = new THREE.PointsMaterial({ color: 0xaa0000, size: 4.0, transparent: true, depthWrite: false });
    const pts = new THREE.Points(geo, mat);
    window.scene.add(pts);

    window.hieuUngChimCa.push({ system: pts, velocities: vels, life: 20 });
};

// VÒNG LẶP DỌN RÁC HIỆU ỨNG
if (!window.loopChimCaRunning) {
    window.loopChimCaRunning = true;
    setInterval(() => {
        for (let i = window.hieuUngChimCa.length - 1; i >= 0; i--) {
            let h = window.hieuUngChimCa[i];
            h.life--;
            if (h.system) {
                let posArr = h.system.geometry.attributes.position.array;
                for (let j = 0; j < posArr.length / 3; j++) {
                    posArr[j * 3] += h.velocities[j].x;
                    posArr[j * 3 + 1] += h.velocities[j].y - 0.8; // Rớt xuống đất nhanh
                    posArr[j * 3 + 2] += h.velocities[j].z;
                }
                h.system.geometry.attributes.position.needsUpdate = true;
                h.system.material.opacity = h.life / 20;

                if (h.life <= 0) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(h.system);
                    window.hieuUngChimCa.splice(i, 1);
                }
            }
        }
    }, 30);
}

// ==========================================
// 🧠 LOGIC NÃO CHIM (HIT & RUN)
// ==========================================
window.TU_DIEN_AI_QUAI = window.TU_DIEN_AI_QUAI || {};
window.TU_DIEN_AI_QUAI['CHIM'] = window.TU_DIEN_AI_QUAI['CHIM'] || {};
window.TU_DIEN_AI_QUAI['CA'] = window.TU_DIEN_AI_QUAI['CA'] || {};

window.TU_DIEN_AI_QUAI['CHIM'].thucHienTanCong = function (quai, playerModel, delta) {
    let now = Date.now();

    // 1. Nếu đang bận làm chuỗi combo thì cấm AI tự đi bộ lung tung (Để tránh giật hình)
    if (quai.dangTrongCombo) return;

    // 2. Kiểm tra Hồi chiêu (3 giây mổ 1 đợt)
    if (now - (quai.lastAttackTime || 0) > 3000) {
        quai.lastAttackTime = now;
        quai.dangTrongCombo = true; // Khóa não lại để thực hiện kịch bản

        // Sát thương chuẩn lấy từ API, chia làm 2 nhát cắn
        let dmgBoss = quai.damage || 100;
        let dmgMoiNhat = Math.round(dmgBoss / 2);

        // Gửi lệnh lên mạng cho máy người khác nhìn thấy
        if (window.room && window.room.state === 'connected') {
            try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'BOSS_SKILL', bossId: quai.id, target: { x: playerModel.position.x, y: playerModel.position.y, z: playerModel.position.z }, phai: 'CHIM', chieu: 'CAN_CHIEN' })), { reliable: true }); } catch (e) { }
        }

        // ⚔️ KỊCH BẢN TẤN CÔNG HOANG DÃ ⚔️

        // [NHÁT 1: 0 giây] - Lao tới cắn
        let huongLaoToi = new THREE.Vector3().subVectors(playerModel.position, quai.mesh.position).normalize(); huongLaoToi.y = 0;
        quai.mesh.position.add(huongLaoToi.multiplyScalar(2.5)); // Cú lướt tới
        if (typeof quai.playAnim === 'function') quai.playAnim('ATTACK');
        thucHienTruMauVaHienSo(quai, playerModel.position, huongLaoToi, dmgMoiNhat);

        // [RÚT LUI: 0.5 giây sau] - Lùi ra một chút
        setTimeout(() => {
            if (quai.isDead || !quai.mesh) return;
            let huongLui = new THREE.Vector3().subVectors(quai.mesh.position, playerModel.position).normalize(); huongLui.y = 0;
            quai.mesh.position.add(huongLui.multiplyScalar(4)); // Bật ngửa về sau
            if (typeof quai.playAnim === 'function') quai.playAnim('WALK');
        }, 500);

        // [NHÁT 2: 1.2 giây sau] - Bất ngờ lao tới cắn bồi
        setTimeout(() => {
            if (quai.isDead || !quai.mesh || window.mauBanThan <= 0) {
                quai.dangTrongCombo = false;
                return;
            }
            // Khóa mục tiêu mới (Phòng khi sếp đã chạy ra chỗ khác)
            let targetMoi = window.playerModel.position.clone();
            let huongLaoMoi = new THREE.Vector3().subVectors(targetMoi, quai.mesh.position).normalize(); huongLaoMoi.y = 0;

            quai.mesh.position.add(huongLaoMoi.multiplyScalar(4.5)); // Lướt bồi cực mạnh
            if (typeof quai.playAnim === 'function') quai.playAnim('ATTACK');
            thucHienTruMauVaHienSo(quai, targetMoi, huongLaoMoi, dmgMoiNhat);

            // Mở khóa não, trở lại trạng thái lượn lờ
            setTimeout(() => { quai.dangTrongCombo = false; }, 400);

        }, 1200);

    } else {
        // 3. TRONG LÚC CHỜ HỒI CHIÊU: LƯỢN VÒNG VÀ GIỮ KHOẢNG CÁCH THĂM DÒ
        let khoangCach = quai.mesh.position.distanceTo(playerModel.position);

        // Luôn nhìn chằm chằm vào sếp
        let dummy = new THREE.Object3D();
        dummy.position.copy(quai.mesh.position);
        dummy.lookAt(playerModel.position);
        quai.mesh.quaternion.slerp(dummy.quaternion, 0.1);
        if (typeof quai.playAnim === 'function') quai.playAnim('WALK');

        if (khoangCach < 7) {
            // Nếu Sếp tiến lại gần -> Lùi ra từ từ (Bản năng hoảng sợ/giữ thế)
            let huongLui = new THREE.Vector3().subVectors(quai.mesh.position, playerModel.position).normalize();
            huongLui.y = 0;
            quai.mesh.position.add(huongLui.multiplyScalar(5 * delta));
        } else {
            // Nếu đủ an toàn -> Đi vòng tròn quanh Sếp
            let huongVuongGoc = new THREE.Vector3().crossVectors(quai.upVector || new THREE.Vector3(0, 1, 0), quai.mesh.position.clone().sub(playerModel.position)).normalize();
            quai.mesh.position.add(huongVuongGoc.multiplyScalar(6 * delta));
        }
    }
};

window.TU_DIEN_AI_QUAI['CA'].thucHienTanCong = window.TU_DIEN_AI_QUAI['CHIM'].thucHienTanCong;

// HÀM XỬ LÝ SÁT THƯƠNG CHUNG
function thucHienTruMauVaHienSo(quai, pTarget, bDir, dame) {
    if (typeof window.tungComboChimCa === 'function') {
        window.tungComboChimCa('CAN_CHIEN', dame, quai.mesh.position, pTarget, bDir, quai.id, null, false);
    }

    if (!window.IS_IN_SAFE_ZONE && window.mauBanThan > 0) {
        let role = (window.ROLE || "").toLowerCase();
        let name = (window.ADMIN_NAME || window.myUsername || "").toLowerCase();

        if (role !== "admin" && name !== "admin") {
            window.mauBanThan -= dame;

            // Hiện số máu bị mất
            if (typeof window.taoSoSatThuong === 'function') {
                let viTriSo = pTarget.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, 5, (Math.random() - 0.5) * 2));
                window.taoSoSatThuong(viTriSo, dame);
            }

            // Cập nhật UI
            const uiThanhMau = document.getElementById('thanhMauHienTai');
            const uiSoMau = document.getElementById('soMauHienTai');
            if (window.mauBanThan < 0) window.mauBanThan = 0;
            if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
            if (uiSoMau) uiSoMau.innerText = Math.max(0, Math.round(window.mauBanThan)).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";

            // Chết thì báo tử
            if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') {
                window.xuLyCaiChetNhanVat("Bị Quái Thú Ăn Thịt");
            }
        }
    }
}
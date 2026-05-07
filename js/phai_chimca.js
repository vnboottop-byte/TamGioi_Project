// ==========================================
// 🦅🐟 MÔN PHÁI: THÚ CẬN CHIẾN (CHIM & CÁ)
// ==========================================
console.log("🦅🐟 Đã load Bí Kíp Chim Cá (Cận Chiến Thần Tốc)!");

window.hieuUngChimCa = window.hieuUngChimCa || [];

// HÀM CHÍNH ĐƯỢC GỌI TỪ QUAI_VAT.JS
window.tungComboChimCa = function (chieu, dmgBoss, bOrigin, pTarget, bDir, tempId, weaponUrl, isRemote = false) {
    if (!window.scene) return;

    // Tạo hiệu ứng Vết cào / Máu văng tại vị trí Sếp
    taoHieuUngCaoCau(pTarget, bDir, dmgBoss, isRemote);
};

// HIỆU ỨNG CẬN CHIẾN: NHÁT CẮN TÉT MÁU
function taoHieuUngCaoCau(targetPos, dir, dame, isRemote) {
    const soLuong = 100;
    const geo = new THREE.BufferGeometry();
    const posArr = new Float32Array(soLuong * 3);
    const vels = [];

    // Vị trí tóe máu (Ngay giữa ngực người chơi)
    let diemTrungDon = targetPos.clone();
    if (!isRemote && window.playerModel) {
        diemTrungDon = window.playerModel.position.clone().add(window.playerModel.up.clone().multiplyScalar(4));
    }

    for (let i = 0; i < soLuong; i++) {
        posArr[i * 3] = diemTrungDon.x;
        posArr[i * 3 + 1] = diemTrungDon.y;
        posArr[i * 3 + 2] = diemTrungDon.z;

        // Tán xạ 360 độ cực mạnh tạo cảm giác nổ máu
        let v = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        );
        vels.push(v);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

    const mat = new THREE.PointsMaterial({
        color: 0xff0000, // Đỏ máu rực rỡ
        size: 3.0,
        transparent: true,
        opacity: 1.0,
        depthWrite: false
    });

    const pts = new THREE.Points(geo, mat);
    window.scene.add(pts);

    // Life: 20 Frames (Cực nhanh, chớp nhoáng rồi biến mất)
    window.hieuUngChimCa.push({ system: pts, velocities: vels, life: 20 });

}

// VÒNG LẶP DỌN RÁC (CỰC NHẸ)
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
                    posArr[j * 3 + 1] += h.velocities[j].y - 0.5; // Máu rớt dần xuống đất trọng lực
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
// 🌟 TIÊM LÕI AI TẤN CÔNG VÀO TỪ ĐIỂN BÁCH THÚ (CHIM/CÁ)
// ==========================================
window.TU_DIEN_AI_QUAI = window.TU_DIEN_AI_QUAI || {};

if (window.TU_DIEN_AI_QUAI['CHIM']) {
    window.TU_DIEN_AI_QUAI['CHIM'].thucHienTanCong = function(quai, playerModel, delta) {
        if(Date.now() - quai.lastAttackTime > 2000) {
            quai.lastAttackTime = Date.now();
            quai.thoiDiemDam = Date.now(); // Kích hoạt Lui Binh
            if (typeof quai.playAnim === 'function') quai.playAnim('ATTACK');

            let dmgBoss = (quai.maxHp || 4000) * 0.05; 
            let bOrigin = quai.mesh.position.clone();
            let pTarget = playerModel.position.clone();
            let bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize();

            if (typeof window.tungComboChimCa === 'function') {
                window.tungComboChimCa('CAN_CHIEN', dmgBoss, bOrigin, pTarget, bDir, quai.id, null, false);
            }

            if (!window.IS_IN_SAFE_ZONE) {
                let role = (window.ROLE || "").toLowerCase();
                let name = (window.ADMIN_NAME || window.myUsername || "").toLowerCase();

                if (role !== "admin" && name !== "admin") {
                    window.mauBanThan -= Math.round(dmgBoss);
                    if (typeof window.taoSoSatThuong === 'function') window.taoSoSatThuong(playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), Math.round(dmgBoss));

                    const uiThanhMau = document.getElementById('thanhMauHienTai');
                    const uiSoMau = document.getElementById('soMauHienTai');
                    if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
                    if (uiSoMau) uiSoMau.innerText = Math.max(0, Math.round(window.mauBanThan)).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";

                    if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') window.xuLyCaiChetNhanVat("Bị Quái Vật Xé Xác");
                }
            }

            if (window.room && window.room.state === 'connected') {
                try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'BOSS_SKILL', bossId: quai.id, target: { x: pTarget.x, y: pTarget.y, z: pTarget.z }, phai: quai.classCode, chieu: 'CAN_CHIEN' })), { reliable: true }); } catch (e) { }
            }
        } else {
            // LƯỢN VÒNG CHỜ HỒI CHIÊU
            let huongVuongGoc = new THREE.Vector3().crossVectors(quai.upVector, quai.mesh.position.clone().sub(playerModel.position)).normalize();
            quai.mesh.position.add(huongVuongGoc.multiplyScalar(6.0 * delta)); 

            let huongNhin = new THREE.Vector3().subVectors(playerModel.position, quai.mesh.position).projectOnPlane(quai.upVector).normalize();
            let dummy = new THREE.Object3D();
            dummy.position.copy(quai.mesh.position);
            dummy.up.copy(quai.upVector);
            dummy.lookAt(quai.mesh.position.clone().add(huongNhin));
            quai.mesh.quaternion.slerp(dummy.quaternion, 0.1);
        }
    };
    
    // Cá xài chung chiêu mổ bụng của Chim
    window.TU_DIEN_AI_QUAI['CA'].thucHienTanCong = window.TU_DIEN_AI_QUAI['CHIM'].thucHienTanCong;
}
// ==========================================
// 🌐 MODULE: QUẢN LÝ CHIẾU THỨC & SINH TỬ TOÀN CỤC (BẢN CHUẨN GỐC - LÁ CHẮN TỔ ĐỘI)
// ==========================================
console.log("🚀 Khởi động Bộ Không Gian & Thời Gian...");



window.danhSachChieuThucToanMap = []; // Thùng chứa mọi chiêu thức đang bay

window.dangKyChieuThuc = function (mesh, lifetime = 3000, onUpdate = null) {
    // 🧬 CẤY DNA CỦA KẺ BẮN VÀO VIÊN ĐẠN
    let ownerDNA = window.currentSkillSender || null;
    let wrappedUpdate = null;
    
    if (onUpdate) {
        wrappedUpdate = function() {
            // Trích xuất DNA khi viên đạn đang bay và phát nổ
            let prevDNA = window.currentSkillSender;
            window.currentSkillSender = ownerDNA;
            onUpdate(); // Chạy logic của các môn phái
            window.currentSkillSender = prevDNA;
        };
    }
    window.danhSachChieuThucToanMap.push({ mesh: mesh, deathTime: Date.now() + lifetime, update: wrappedUpdate });
};



function loopQuanLyToanCuc() {
    requestAnimationFrame(loopQuanLyToanCuc);
    const now = Date.now();
    for (let i = window.danhSachChieuThucToanMap.length - 1; i >= 0; i--) {
        let item = window.danhSachChieuThucToanMap[i];
        if (typeof item.update === 'function') item.update();
        if (now > item.deathTime) {
            if (item.mesh) {
                if (item.mesh.parent) item.mesh.parent.remove(item.mesh);
                if (typeof scene !== 'undefined') scene.remove(item.mesh);
            }
            window.danhSachChieuThucToanMap.splice(i, 1);
        }
    }
}
loopQuanLyToanCuc();

window.globalHandleBossDeath = function (boss) {
    if (!boss || boss.isDead) return;
    boss.isDead = true; boss.hp = 0; boss.state = 'DEAD';
    if (typeof boss.playAnim === 'function') boss.playAnim('DIE');
    if (boss.tagEl) boss.tagEl.style.display = 'none';
    setTimeout(() => { if (boss.mesh) boss.mesh.visible = false; }, 3000);
    setTimeout(() => {
        let fd = new FormData(); fd.append('boss_id', boss.id);
        fetch('api/hoi_sinh_boss.php', { method: 'POST', body: fd }).then(res => res.json()).then(data => {
            if (data.status === 'success') {
                boss.hp = boss.maxHp; boss.isDead = false; boss.state = 'IDLE';
                if (boss.mesh) { boss.mesh.visible = true; boss.mesh.position.set(boss.spawnX, boss.mesh.position.y, boss.spawnZ); }
                if (typeof boss.playAnim === 'function') boss.playAnim('IDLE');
                if (boss.tagEl) { let bar = boss.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = '100%'; boss.tagEl.style.display = 'block'; }
            }
        });
    }, 30000);
};

// ==========================================
// 🛡️ LÁ CHẮN CHỐNG NHẬN VƠ 2 LẦN (KHÓA OVERKILL)
// ==========================================
window.boNhoDoSat = window.boNhoDoSat || {}; 

window.vinhDanhDoSat = function (victimName, victimLevel) {
    let bayGio = Date.now();
    
    // Kiểm tra xem trong 10 giây qua đã ăn mạng của tên này chưa?
    // 10000ms = 10 giây (Khớp đúng thời gian đếm ngược hồi sinh của nạn nhân)
    if (window.boNhoDoSat[victimName] && (bayGio - window.boNhoDoSat[victimName] < 10000)) {
        console.log("🛡️ Bỏ qua gói tin báo tử rác từ thi thể: " + victimName);
        return; // Đã húp mạng này rồi, cấm húp đúp!
    }
    
    // Ghi vào sổ Nam Tào: Vừa giết tên này lúc 'bayGio'
    window.boNhoDoSat[victimName] = bayGio;

    // --- BẮT ĐẦU CỘNG EXP VÀ GỌI API NHIỆM VỤ NHƯ BÌNH THƯỜNG ---
    let expCuopDuoc = (victimLevel || 1) * 20;
    if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(expCuopDuoc, victimLevel);
    
    let fd = new FormData(); 
    fd.append('victim', victimName);
    fetch('api/update_pk_quest.php', { method: 'POST', body: fd }).then(res => res.json()).catch(err => {});

    // Hiện bảng thông báo trên màn hình
    const killNoti = document.getElementById('killNotification');
    const victimDisplay = document.getElementById('victimNameDisplay');
    const expDisplay = document.getElementById('killExpDisplay');
    if (killNoti && victimDisplay && expDisplay) {
        victimDisplay.innerText = victimName; 
        expDisplay.innerText = expCuopDuoc.toLocaleString();
        killNoti.style.display = 'block'; 
        killNoti.style.animation = 'none'; 
        void killNoti.offsetWidth;
        killNoti.style.animation = 'hienRaThuNho 0.5s ease-out forwards';
        setTimeout(() => { killNoti.style.display = 'none'; }, 4000);
    }
};

// 🌟 BIẾN LƯU TÊN KẺ CHIẾM ĐOẠT MẠNG ĐỘC QUYỀN
window.nguoiChotMangCuaToi = null; 

window.gaySatThuongBossToPlayer = function (tamNo, luongDame, banKinh) {
    if (!window.playerModel || window.isDead || window.IS_IN_SAFE_ZONE) return;
    let tamNguc = window.playerModel.position.clone(); tamNguc.y += 5;
    
    if (tamNo.distanceTo(tamNguc) <= banKinh) {
        window.mauBanThan -= luongDame;
        if (typeof taoSoSatThuong === 'function') taoSoSatThuong(tamNguc, luongDame, '#ff0000');
        const uiThanhMau = document.getElementById('thanhMauHienTai'); 
        const uiSoMau = document.getElementById('soMauHienTai');
        if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
        if (uiSoMau) uiSoMau.innerText = Math.max(0, Math.round(window.mauBanThan)).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
        
        if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') {
            window.thoiDiemTuTran = Date.now(); 
            
            // ========================================================
            // 🌟 MÁY QUÉT RADAR TOÁN HỌC: BẮT ĐÚNG KẺ BẮN DỰA VÀO QUỸ ĐẠO
            // ========================================================
            let keThuChinhXac = "Boss/Quái Vật";
            
            if (window.recentIncomingSkills && window.recentIncomingSkills.length > 0) {
                let minDist = 150; // Bán kính sai số tối đa để bọc lót các đòn AoE khổng lồ
                let now = Date.now();
                
                for (let i = 0; i < window.recentIncomingSkills.length; i++) {
                    let s = window.recentIncomingSkills[i];
                    if (now - s.time > 8000) continue; // Bỏ qua các chiêu thức đã tung ra quá 8 giây
                    
                    // 1. Kiểm tra tâm nổ có gần Đích Nhắm ban đầu không? (Dành cho Lazer, Phép thuật)
                    let distToTarget = s.target.distanceTo(tamNo);
                    
                    // 2. Kiểm tra tâm nổ có nằm dọc theo Đường Bay không? (Dành cho Cung/Súng đụng người nổ sớm)
                    let line = new THREE.Line3(s.origin, s.target);
                    let closestPoint = new THREE.Vector3();
                    line.closestPointToPoint(tamNo, true, closestPoint);
                    let distToLine = closestPoint.distanceTo(tamNo);
                    
                    let actualDist = Math.min(distToTarget, distToLine);
                    
                    if (actualDist < minDist) {
                        minDist = actualDist;
                        keThuChinhXac = s.senderId;
                    }
                }
            }

            window.nguoiChotMangCuaToi = keThuChinhXac; 
            window.xuLyCaiChetNhanVat(keThuChinhXac);
            
            // Báo tử ngay lập tức cho chủ nhân của đường bay húp EXP
            if (keThuChinhXac !== "Boss/Quái Vật" && window.room) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'XAC_NHAN_GUC_NGA',
                    killerId: keThuChinhXac,
                    victimName: window.myUsername,
                    victimLevel: window.LEVEL_CUA_TOI || 1
                })), { reliable: true });
            }
        }
    }
};

// ==========================================
// 📡 MÁY QUÉT X-QUANG CHUẨN AAA (TÌM NGỰC & HITBOX)
// ==========================================
window.layHitbox = function (mesh) {
    if (!mesh) return { tamNguc: new THREE.Vector3(), banKinh: 10, chieuCao: 10 };
    
    // 🌟 BẢN VÁ TỰ ĐỘNG CHỐNG CRASH MESH GIẢ
    if (!mesh.chieuCao) {
        try {
            let box = new THREE.Box3().setFromObject(mesh);
            mesh.chieuCao = Math.max(2.5, box.max.y - box.min.y);
            mesh.chieuRong = Math.max(3.0, box.max.x - box.min.x);
        } catch(e) {
            mesh.chieuCao = 2.5; mesh.chieuRong = 3.0;
        }
    }
    
    let footPos = typeof mesh.position.clone === 'function' ? mesh.position.clone() : new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z);
    let upV = (mesh.up && typeof mesh.up.clone === 'function') ? mesh.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
    
    let isMount = false;
    if (typeof mesh.traverse === 'function') {
        mesh.traverse(c => { if (c.name && c.name.toUpperCase().includes('YENNGUA')) isMount = true; });
    }

    let chieuCaoThuc = mesh.chieuCao;
    if (isMount) chieuCaoThuc = Math.max(chieuCaoThuc, 4.5);
    else chieuCaoThuc = Math.max(chieuCaoThuc, 2.5);

    let chieuRongThuc = mesh.chieuRong || 3.0;
    let tamNguc = footPos.clone().add(upV.multiplyScalar(chieuCaoThuc / 2));

    // ========================================================
    // 🛡️ CHÌA KHÓA VÀNG: ĐÁNH LỪA 100 PHÁI!
    // ========================================================
    // Các file phai_*.js của Sếp dùng hàm này để lấy Tâm Ngực làm mục tiêu ném tạ.
    // Nếu mục tiêu là ĐỒNG ĐỘI -> Đẩy Tâm Ngực ra ngoài Hệ Mặt Trời (Tọa độ 999999).
    // Tự khắc 100 phái của Sếp đo khoảng cách thấy quá xa, nó sẽ BỎ QUA KHÔNG KHÓA MỤC TIÊU NỮA!
    if (mesh.userData && mesh.userData.isAlly) {
        tamNguc.set(999999, 999999, 999999);
    }

    return { tamNguc: tamNguc, banKinh: chieuRongThuc / 2, chieuCao: chieuCaoThuc };
};
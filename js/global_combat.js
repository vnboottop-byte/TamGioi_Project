// ==========================================
// 🌐 MODULE: QUẢN LÝ CHIẾU THỨC & SINH TỬ TOÀN CỤC (BẢN V1 - CORE)
// ==========================================
console.log("🚀 Khởi động Bộ Não Quản Lý Toàn Cục...");

window.danhSachChieuThucToanMap = []; // Thùng chứa mọi chiêu thức đang bay

// 1. HÀM ĐĂNG KÝ CHIẾU THỨC (Bất cứ phái nào cũng phải báo cáo vào đây)
window.dangKyChieuThuc = function (mesh, lifetime = 3000, onUpdate = null) {
    window.danhSachChieuThucToanMap.push({
        mesh: mesh,
        deathTime: Date.now() + lifetime,
        update: onUpdate
    });
};

// 2. VÒNG LẶP DỌN RÁC & CẬP NHẬT ĐƯỜNG BAY (Chạy vĩnh viễn)
function loopQuanLyToanCuc() {
    requestAnimationFrame(loopQuanLyToanCuc);
    const now = Date.now();

    for (let i = window.danhSachChieuThucToanMap.length - 1; i >= 0; i--) {
        let item = window.danhSachChieuThucToanMap[i];

        // A. Cập nhật đường bay (Nếu có hàm update riêng)
        if (typeof item.update === 'function') {
            item.update();
        }

        // B. Kiểm tra thời gian sống để dọn rác
        if (now > item.deathTime) {
            if (item.mesh) {
                if (item.mesh.parent) item.mesh.parent.remove(item.mesh);
                // Xóa cả trong scene nếu mesh bị kẹt
                if (typeof scene !== 'undefined') scene.remove(item.mesh);
            }
            window.danhSachChieuThucToanMap.splice(i, 1);
            // console.log("🧹 Đã dọn sạch 1 chiêu thức hết hạn!");
        }
    }
}
loopQuanLyToanCuc();

// 3. HÀM XỬ LÝ BOSS CHẾT (Dùng chung cho mọi người chơi)
window.globalHandleBossDeath = function (boss) {
    if (!boss || boss.isDead) return;
    boss.isDead = true;
    boss.hp = 0;
    boss.state = 'DEAD';

    if (typeof boss.playAnim === 'function') boss.playAnim('DIE');
    if (boss.tagEl) boss.tagEl.style.display = 'none';

    // Sau 3 giây gục ngã -> Tàng hình xác
    setTimeout(() => { if (boss.mesh) boss.mesh.visible = false; }, 3000);

    // Báo hồi sinh lên Server (Chỉ 1 người báo là đủ, nhưng để chắc chắn ta cứ báo)
    setTimeout(() => {
        let fd = new FormData(); fd.append('boss_id', boss.id);
        fetch('api/hoi_sinh_boss.php', { method: 'POST', body: fd })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    boss.hp = boss.maxHp; boss.isDead = false; boss.state = 'IDLE';
                    if (boss.mesh) { boss.mesh.visible = true; boss.mesh.position.set(boss.spawnX, boss.mesh.position.y, boss.spawnZ); }
                    if (typeof boss.playAnim === 'function') boss.playAnim('IDLE');
                    if (boss.tagEl) {
                        let bar = boss.tagEl.querySelector('.hp-bar');
                        if (bar) bar.style.width = '100%';
                        boss.tagEl.style.display = 'block';
                    }
                }
            });
    }, 30000);
};


// ==========================================
// 🏆 HỆ THỐNG VINH DANH ĐỒ SÁT (PVP)
// ==========================================
window.vinhDanhDoSat = function(victimName, victimLevel) {
    let expCuopDuoc = (victimLevel || 1) * 20; 
    
    // 1. Bơm EXP vào Server
    if (typeof window.congKinhNghiem === 'function') {
        window.congKinhNghiem(expCuopDuoc, victimLevel); 
    }

    // 2. Hiển thị UI Vinh Danh
    const killNoti = document.getElementById('killNotification');
    const victimDisplay = document.getElementById('victimNameDisplay');
    const expDisplay = document.getElementById('killExpDisplay'); // Ô hiện EXP mới
    
    if (killNoti && victimDisplay && expDisplay) {
        victimDisplay.innerText = victimName;
        expDisplay.innerText = expCuopDuoc.toLocaleString(); // Hiện số EXP
        
        killNoti.style.display = 'block';
        killNoti.style.animation = 'none';
        void killNoti.offsetWidth; 
        killNoti.style.animation = 'hienRaThuNho 0.5s ease-out forwards';
        
        setTimeout(() => { killNoti.style.display = 'none'; }, 4000);
    }
};


// ==========================================
// 🩸 CỔNG SÁT THƯƠNG: BOSS -> NGƯỜI CHƠI
// ==========================================
window.gaySatThuongBossToPlayer = function (tamNo, luongDame, banKinh) {
    if (!window.playerModel || window.isDead) return;

    // 🛑 LÁ CHẮN BẤT TỬ CỦA SAFE ZONE: Nếu đang ở Vùng An Toàn thì thoát luôn, không trừ máu!
    if (window.IS_IN_SAFE_ZONE) return;

    let tamNguc = window.playerModel.position.clone(); tamNguc.y += 5;
    if (tamNo.distanceTo(tamNguc) <= banKinh) {
        if (window.ADMIN_NAME !== "Admin" && window.ROLE !== "admin") {
            window.mauBanThan -= luongDame;
            if (typeof taoSoSatThuong === 'function') taoSoSatThuong(tamNguc, luongDame, '#ff0000');
            const uiThanhMau = document.getElementById('thanhMauHienTai'); const uiSoMau = document.getElementById('soMauHienTai');
            if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
            if (uiSoMau) uiSoMau.innerText = Math.max(0, window.mauBanThan).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
            if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') window.xuLyCaiChetNhanVat("Boss/Quái Vật");
        }
    }
};




// ==========================================
// 📡 MÁY QUÉT X-QUANG CHUẨN AAA (TÌM NGỰC & HITBOX)
// ==========================================
window.layHitbox = function (mesh) {
    if (!mesh) return { tamNguc: new THREE.Vector3(), banKinh: 10, chieuCao: 10 };
    if (!mesh.chieuCao) {
        let box = new THREE.Box3().setFromObject(mesh);
        mesh.chieuCao = (box.max.y - box.min.y);
        mesh.chieuRong = (box.max.x - box.min.x);
        // Nếu model chưa load kịp, lấy scale x 10 làm dự phòng chuẩn!
        if (mesh.chieuCao < 1) mesh.chieuCao = (mesh.scale.y || 1) * 10;
        if (mesh.chieuRong < 1) mesh.chieuRong = (mesh.scale.x || 1) * 10;
    }
    let tamNguc = mesh.position.clone();
    tamNguc.y += (mesh.chieuCao / 2);
    return { tamNguc: tamNguc, banKinh: mesh.chieuRong / 2, chieuCao: mesh.chieuCao };
};
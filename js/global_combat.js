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
// 📡 MÁY QUÉT X-QUANG CHUẨN AAA (TÌM NGỰC & HITBOX V3 - FIX LỆCH TÂM)
// ==========================================
window.layHitbox = function (mesh) {
    if (!mesh) return { tamNguc: new THREE.Vector3(), banKinh: 2.0, chieuCao: 5 };
    
    if (!mesh.chieuCao) {
        let box = new THREE.Box3().setFromObject(mesh);
        mesh.chieuCao = (box.max.y - box.min.y);
        
        // 🌟 ÉP CỨNG CHIỀU RỘNG: Tránh việc thanh kiếm dài quơ ra phía trước làm tâm Hitbox bị dời đi!
        mesh.chieuRong = 4.0; 
        
        if (mesh.chieuCao < 1 || !isFinite(mesh.chieuCao)) mesh.chieuCao = (mesh.scale.y || 1) * 5;
        if (mesh.chieuCao > 15) mesh.chieuCao = 15; // Giới hạn không cho đo trúng Mây/Rồng quá to
    }
    
    // 🌟 BẢN VÁ AAA: Phải dùnggetWorldPosition để lấy tọa độ Tuyệt đối của thế giới. 
    // Dùng mesh.position sẽ bị sai nếu model nằm trong Group!
    let tamNguc = new THREE.Vector3();
    mesh.getWorldPosition(tamNguc); 
    
    let upV = mesh.up ? mesh.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
    tamNguc.add(upV.multiplyScalar(mesh.chieuCao / 2));
    
    return { tamNguc: tamNguc, banKinh: mesh.chieuRong / 2, chieuCao: mesh.chieuCao };
};

// ==========================================
// 🛡️ BỘ LỌC RÁC DOM TỐI THƯỢNG CHO MOBILE (CỨU CPU)
// ==========================================
if (window.isMobile) {
    const originalAppendChild = document.body.appendChild;
    document.body.appendChild = function (element) {
        // Nhận diện thẻ Div hiển thị sát thương (Có dấu trừ và có hiệu ứng bóng chữ)
        if (element.tagName === 'DIV' && element.innerText && element.innerText.startsWith('-') && element.style.textShadow) {
            let soLuongChuNoi = 0;
            if (typeof danhSachSoBay !== 'undefined') soLuongChuNoi += danhSachSoBay.length;
            if (typeof danhSachSoBayBS !== 'undefined') soLuongChuNoi += danhSachSoBayBS.length;
            if (typeof danhSachSoBayCT !== 'undefined') soLuongChuNoi += danhSachSoBayCT.length;
            if (typeof danhSachSoBayLZ !== 'undefined') soLuongChuNoi += danhSachSoBayLZ.length;
            if (typeof danhSachSoBayLT !== 'undefined') soLuongChuNoi += danhSachSoBayLT.length;
            if (typeof danhSachSoBayPS !== 'undefined') soLuongChuNoi += danhSachSoBayPS.length;

            // Nếu trên màn hình đã có 5 số nhảy, chặn ngay không cho vẽ thêm nữa!
            if (soLuongChuNoi > 5) {
                return element; 
            }
            
            // Giảm độ gắt của bóng chữ để GPU Mobile render mượt hơn
            element.style.textShadow = '1px 1px 0px #000';
        }
        return originalAppendChild.call(this, element);
    };
}






// ==========================================
// ⏳ HỆ THỐNG ĐỒNG HỒ ĐẾM NGƯỢC SKILL UI
// ==========================================
window.batDauHoiChieuUI = function(phim) {
    const slot = document.getElementById('slot-' + phim);
    if (!slot) return;
    
    // Gỡ bỏ CSS Transition cũ (nếu có) để nhường chỗ cho Text đếm ngược
    const overlay = slot.querySelector('.cd-overlay');
    if (overlay) { overlay.style.transition = 'none'; overlay.style.height = '100%'; }
    
    const text = slot.querySelector('.cd-text');
    if (text) text.style.display = 'block';
    
    let tgHoi = window.thoiGianHoiChieu[phim] || 1500;
    let tgBatDau = Date.now();
    
    // Dọn nhịp tim cũ nếu Sếp spam nút
    if (slot.cdInterval) clearInterval(slot.cdInterval);
    
    slot.cdInterval = setInterval(() => {
        let conLai = tgHoi - (Date.now() - tgBatDau);
        if (conLai <= 0) {
            clearInterval(slot.cdInterval); 
            if (overlay) overlay.style.height = '0%'; 
            if (text) text.style.display = 'none';
        } else {
            if (overlay) overlay.style.height = (conLai / tgHoi * 100) + '%';
            if (text) text.innerText = (conLai / 1000).toFixed(1); 
        }
    }, 50); 
};
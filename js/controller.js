// ==========================================
// 🎮 BỘ ĐIỀU KHIỂN & HỆ THỐNG COOLDOWN (BẢN VÁ LỖI TÊN BIẾN)
// ==========================================

// 🌟 Đã đổi tên biến thành "cd_thongSo" để KHÔNG ĐỤNG HÀNG với 6 file môn phái của Sếp!
window.cd_thongSoHoi = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
window.cd_thoiDiemBopCo = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

function batDauHoiChieu(phim) {
    const slot = document.getElementById('slot-' + phim);
    if (!slot) return;
    const overlay = slot.querySelector('.cd-overlay');
    const text = slot.querySelector('.cd-text');
    
    let tgHoi = window.cd_thongSoHoi[phim], tgBatDau = Date.now();
    overlay.style.height = '100%'; text.style.display = 'block';
    
    const interval = setInterval(() => {
        let conLai = tgHoi - (Date.now() - tgBatDau);
        if (conLai <= 0) {
            clearInterval(interval); overlay.style.height = '0%'; text.style.display = 'none';
        } else {
            overlay.style.height = (conLai / tgHoi * 100) + '%';
            text.innerText = (conLai / 1000).toFixed(1); 
        }
    }, 50); 
}

// 🌟 KHÓA TOÀN CỤC: Đang múa chiêu này thì cấm bấm chiêu khác!
window.dangMuaChieu = false; 

window.addEventListener('keydown', (e) => {
    // Gọi thẳng window.playerModel để không bao giờ bị lỗi
    if (e.repeat || !window.playerModel || window.isDead) return; 
    
    // Bắt phím di chuyển W A S D
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        window.keys[e.code.replace('Key', '').toLowerCase()] = true;
    }

    // Bay và Chạy nhanh
    if (e.code === 'Space') window.keys['space'] = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') window.keys['shift'] = true;

    let phimUpper = e.code.replace('Key', '');

    // 🎯 XỬ LÝ 4 CHIÊU THỨC
    if (['Q', 'E', 'R', 'F'].includes(phimUpper)) {
        
        // 1. CHẶN PHÍM KHI ĐANG GÕ CHAT
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;

        // 2. LÁ CHẮN VÙNG AN TOÀN
        if (window.IS_IN_SAFE_ZONE) {
            if (typeof window.hienThongBaoBoGoc === 'function') window.hienThongBaoBoGoc("🕊️ VÙNG AN TOÀN: Ở đây cấm ẩu đả Sếp ơi!", "#f1c40f");
            return; 
        }

        // 3. XỬ LÝ ĐẾM NGƯỢC COOLDOWN BẰNG BIẾN ĐỘC LẬP
        let bayGio = Date.now();
        if (bayGio - window.cd_thoiDiemBopCo[phimUpper] >= window.cd_thongSoHoi[phimUpper]) {
            window.cd_thoiDiemBopCo[phimUpper] = bayGio; 
            
            // 🌟 Gọi sang file hệ phái (Lúc này các file phái sẽ tự xử lý mượt mà vì không bị trùng biến nữa)
            if (window.HePhaiHienTai && typeof window.HePhaiHienTai.tungChieu === 'function') {
                window.HePhaiHienTai.tungChieu(phimUpper, false);
            }
            batDauHoiChieu(phimUpper); 
        } else {
            // Báo lỗi bằng số Vàng nảy lên đầu
            let timeConLai = ((window.cd_thongSoHoi[phimUpper] - (bayGio - window.cd_thoiDiemBopCo[phimUpper])) / 1000).toFixed(1);
            if (typeof window.taoSoSatThuong === 'function' && window.playerModel) {
                window.taoSoSatThuong(window.playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), "Chưa hồi xong (" + timeConLai + "s)", '#f1c40f');
            }
        }
    }
});

// 🌟 BẮT BUỘC PHẢI CÓ SỰ KIỆN NHẢ PHÍM ĐỂ NÓ KHÔNG BAY LÊN TẬN VŨ TRỤ
window.addEventListener('keyup', (e) => {
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        window.keys[e.code.replace('Key', '').toLowerCase()] = false;
    }
    if (e.code === 'Space') window.keys['space'] = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') window.keys['shift'] = false;
});

// Biến lưu góc liếc của Camera
window.camRotY = 0; 

// Sự kiện: Giữ chuột phải để liếc ngang
document.addEventListener('mousemove', (e) => {
    if (e.buttons === 2 || document.pointerLockElement) { 
        window.camRotY -= e.movementX * 0.005; 
        window.camRotY = Math.max(-0.7, Math.min(0.7, window.camRotY)); 
    }
});
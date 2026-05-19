// ==========================================
// 🎮 BỘ ĐIỀU KHIỂN & HỆ THỐNG COOLDOWN (BẢN VÁ LỖI CUỐI CÙNG)
// ==========================================

// 🌟 ĐỒNG HỒ THỜI GIAN HỒI CHIÊU (Gắn vào window để mọi file đều thấy)
window.thoiGianHoiChieu = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
window.thoiDiemTungChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

function batDauHoiChieu(phim) {
    const slot = document.getElementById('slot-' + phim);
    if (!slot) return;
    const overlay = slot.querySelector('.cd-overlay');
    const text = slot.querySelector('.cd-text');
    
    let tgHoi = window.thoiGianHoiChieu[phim], tgBatDau = Date.now();
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
    // 🌟 Sử dụng window.playerModel để không bao giờ bị undefined
    if (e.repeat || !window.playerModel || window.isDead) return; 
    
    // 🌟 Bắt phím di chuyển W A S D (Ghi thẳng vào window.keys)
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        window.keys[e.code.replace('Key', '').toLowerCase()] = true;
    }

    // Bay và Chạy nhanh
    if (e.code === 'Space') window.keys['space'] = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') window.keys['shift'] = true;

    let phimUpper = e.code.replace('Key', '');

    // 🎯 XỬ LÝ 4 CHIÊU THỨC (CÓ Ổ KHÓA CHỐNG SPAM VÀ COOLDOWN)
    if (['Q', 'E', 'R', 'F'].includes(phimUpper)) {
        
        // 1. CHẶN PHÍM KHI ĐANG GÕ CHAT
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;

        // 2. 🛑 LÁ CHẮN BẠO LỰC: CẤM XUẤT CHIÊU KHI ĐỨNG Ở SAFE ZONE
        if (window.IS_IN_SAFE_ZONE) {
            if (typeof window.hienThongBaoBoGoc === 'function') window.hienThongBaoBoGoc("🕊️ VÙNG AN TOÀN: Ở đây cấm ẩu đả Sếp ơi!", "#f1c40f");
            return; 
        }

        // 3. XỬ LÝ XẢ CHIÊU & ĐẾM NGƯỢC COOLDOWN
        let bayGio = Date.now();
        if (bayGio - window.thoiDiemTungChieu[phimUpper] >= window.thoiGianHoiChieu[phimUpper]) {
            window.thoiDiemTungChieu[phimUpper] = bayGio; 
            
            // Truyền tín hiệu cho Hệ Phái xuất chiêu (isRemote = false)
            if (window.HePhaiHienTai && typeof window.HePhaiHienTai.tungChieu === 'function') {
                window.HePhaiHienTai.tungChieu(phimUpper, false);
            }
            batDauHoiChieu(phimUpper); // Nhảy số đồng hồ UI
        } else {
            // Báo lỗi bằng số Vàng nảy lên đầu
            let timeConLai = ((window.thoiGianHoiChieu[phimUpper] - (bayGio - window.thoiDiemTungChieu[phimUpper])) / 1000).toFixed(1);
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

// Biến lưu góc liếc của Camera (Giới hạn 40 độ)
window.camRotY = 0; 

// Sự kiện: Giữ chuột phải để liếc ngang (hoặc Sếp có thể bỏ điều kiện buttons để liếc tự do)
document.addEventListener('mousemove', (e) => {
    if (e.buttons === 2 || document.pointerLockElement) { 
        window.camRotY -= e.movementX * 0.005; // Tốc độ xoay chuột
        
        // KHÓA GÓC: 40 độ tương đương khoảng 0.7 Radian
        window.camRotY = Math.max(-0.7, Math.min(0.7, window.camRotY)); 
    }
});


        // ==========================================
        // 🎮 BỘ ĐIỀU KHIỂN & HỆ THỐNG COOLDOWN
        // ==========================================
         window.keys = { w: false, a: false, s: false, d: false, space: false, shift: false };
        const keys = window.keys;
        window.isKeyboardMoving = false;
        
        const thoiGianHoiChieu = { 'Q': 1500, 'E': 5000, 'F': 8000, 'R': 15000 };
        const thoiDiemTungChieu = { 'Q': 0, 'E': 0, 'F': 0, 'R': 0 };

        function batDauHoiChieu(phim) {
            const slot = document.getElementById('slot-' + phim);
            if (!slot) return;
            const overlay = slot.querySelector('.cd-overlay');
            const text = slot.querySelector('.cd-text');
            
            let tgHoi = thoiGianHoiChieu[phim], tgBatDau = Date.now();
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
            if (e.repeat || !playerModel || window.isDead) return; 
            
            // Bắt phím di chuyển W A S D
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                keys[e.code.replace('Key', '').toLowerCase()] = true;
            }

            // Bay và Chạy nhanh
            if (e.code === 'Space') keys['space'] = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys['shift'] = true;

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
                    if (bayGio - thoiDiemTungChieu[phimUpper] >= thoiGianHoiChieu[phimUpper]) {
                        thoiDiemTungChieu[phimUpper] = bayGio; 
                        
                        // Truyền tín hiệu cho Hệ Phái xuất chiêu
                        if (window.HePhaiHienTai && typeof window.HePhaiHienTai.tungChieu === 'function') {
                            window.HePhaiHienTai.tungChieu(phimUpper);
                        }
                        batDauHoiChieu(phimUpper); // Nhảy số đồng hồ UI
                    } else {
                        // Báo lỗi bằng số Vàng nảy lên đầu
                        let timeConLai = ((thoiGianHoiChieu[phimUpper] - (bayGio - thoiDiemTungChieu[phimUpper])) / 1000).toFixed(1);
                        if (typeof taoSoSatThuong === 'function') {
                            taoSoSatThuong(playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), "Chưa hồi xong (" + timeConLai + "s)", '#f1c40f');
                        }
                    }
                }





            
        });

        // 🌟 BẮT BUỘC PHẢI CÓ SỰ KIỆN NHẢ PHÍM ĐỂ NÓ KHÔNG BAY LÊN TẬN VŨ TRỤ
        window.addEventListener('keyup', (e) => {
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                keys[e.code.replace('Key', '').toLowerCase()] = false;
            }
            if (e.code === 'Space') keys['space'] = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys['shift'] = false;
        });

        window.addEventListener('keyup', (e) => {
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                keys[e.code.replace('Key', '').toLowerCase()] = false;
            }
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


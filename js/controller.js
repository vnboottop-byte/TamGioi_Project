

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

            // 🎯 XỬ LÝ 4 CHIÊU THỨC (CÓ Ổ KHÓA CHỐNG SPAM)
            if (['Q', 'E', 'F', 'R'].includes(phimUpper)) {
                
                // 1. Kiểm tra xem có đang bận múa chiêu khác không?
                if (window.dangMuaChieu) return;

                // 2. Kiểm tra thời gian hồi của riêng chiêu này
                let bayGio = Date.now();
                if (bayGio - thoiDiemTungChieu[phimUpper] >= thoiGianHoiChieu[phimUpper]) {
                    
                    // Cập nhật lại thời gian vừa bấm
                    thoiDiemTungChieu[phimUpper] = bayGio; 
                    
                    // 🌟 BẬT KHÓA TOÀN CỤC (Khóa tay trong 1 giây để múa cho xong chiêu, tránh bấm 4 chiêu cùng lúc)
                    window.dangMuaChieu = true;
                    setTimeout(() => { window.dangMuaChieu = false; }, 1000); 

                    // 🔌 GIAO TIẾP VỚI CARD RỜI (JS CỦA PHÁI)
                    if (window.HePhaiHienTai) window.HePhaiHienTai.tungChieu(phimUpper);
                    batDauHoiChieu(phimUpper); 
                } else {
                    // 🌟 NẾU ĐANG COOLDOWN MÀ CỐ SPAM -> BÁO CHỮ VÀNG LÊN ĐẦU
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

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        window.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || !playerModel || window.isDead) return; 
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0) {
                targetPosition.copy(intersects[0].point);
                playerModel.lookAt(new THREE.Vector3(targetPosition.x, playerModel.position.y, targetPosition.z));
                isMoving = true;
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


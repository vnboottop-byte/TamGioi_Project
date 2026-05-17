// ==========================================
// 🎮 BỘ ĐIỀU KHIỂN KÉP (PC KEYBOARD & MOBILE JOYSTICK)
// TÁC GIẢ BỌC THÉP: KHÔNG CHẠM VÀO ENGINE.JS
// ==========================================

(function() {
    // Lõi Biến Toàn Cục Phục Vụ engine.js
    window.keys = { w: false, a: false, s: false, d: false, space: false, shift: false };
    window.isKeyboardMoving = false;
    window.dangMuaChieu = false; 

    // Hệ Thống Thời Gian Hồi Chiêu
    const thoiGianHoiChieu = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const thoiDiemTungChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    // Hàm cập nhật cả UI trên PC và Mobile đồng thời
    function batDauHoiChieu(phim) {
        let tgHoi = thoiGianHoiChieu[phim], tgBatDau = Date.now();

        let pcSlot = document.getElementById('slot-pc-' + phim);
        let mbSlot = document.getElementById('slot-mb-' + phim);

        let pcOv = pcSlot ? pcSlot.querySelector('.cd-overlay') : null;
        let pcTxt = pcSlot ? pcSlot.querySelector('.cd-text') : null;
        
        let mbOv = mbSlot ? mbSlot.querySelector('.m-cd') : null;
        let mbTxt = mbSlot ? mbSlot.querySelector('.cd-text') : null;

        if (pcOv) pcOv.style.height = '100%';
        if (mbOv) mbOv.style.height = '100%';
        if (pcTxt) pcTxt.style.display = 'block';
        if (mbTxt) mbTxt.style.display = 'block';
        
        const interval = setInterval(() => {
            let conLai = tgHoi - (Date.now() - tgBatDau);
            if (conLai <= 0) {
                clearInterval(interval); 
                if (pcOv) pcOv.style.height = '0%';
                if (mbOv) mbOv.style.height = '0%';
                if (pcTxt) pcTxt.style.display = 'none';
                if (mbTxt) mbTxt.style.display = 'none';
            } else {
                let pt = (conLai / tgHoi * 100) + '%';
                let sec = (conLai / 1000).toFixed(1);
                if (pcOv) pcOv.style.height = pt;
                if (mbOv) mbOv.style.height = pt;
                if (pcTxt) pcTxt.innerText = sec;
                if (mbTxt) mbTxt.innerText = sec;
            }
        }, 50); 
    }

    // Xử lý nã đạn (Dùng chung cho Phím và Cảm ứng)
    function kichHoatKyNang(phimUpper) {
        if (!window.playerModel || window.isDead || window.dangMuaChieu) return;

        let bayGio = Date.now();
        if (bayGio - thoiDiemTungChieu[phimUpper] >= thoiGianHoiChieu[phimUpper]) {
            thoiDiemTungChieu[phimUpper] = bayGio; 
            window.dangMuaChieu = true;
            setTimeout(() => { window.dangMuaChieu = false; }, 1000); 

            if (window.HePhaiHienTai) window.HePhaiHienTai.tungChieu(phimUpper);
            batDauHoiChieu(phimUpper); 
        } else {
            let timeConLai = ((thoiGianHoiChieu[phimUpper] - (bayGio - thoiDiemTungChieu[phimUpper])) / 1000).toFixed(1);
            if (typeof taoSoSatThuong === 'function') {
                taoSoSatThuong(window.playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), "Hồi chiêu (" + timeConLai + "s)", '#f1c40f');
            }
        }
    }

    // ==========================================
    // 💻 1. LUỒNG BÀN PHÍM PC (GIỮ NGUYÊN BẢN GỐC)
    // ==========================================
    window.addEventListener('keydown', (e) => {
        if (e.repeat || !window.playerModel || window.isDead) return; 
        
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) window.keys[e.code.replace('Key', '').toLowerCase()] = true;
        if (e.code === 'Space') window.keys['space'] = true;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') window.keys['shift'] = true;

        let phim = e.code.replace('Key', '');
        if (['Q', 'E', 'F', 'R'].includes(phim)) kichHoatKyNang(phim);
    });

    window.addEventListener('keyup', (e) => {
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) window.keys[e.code.replace('Key', '').toLowerCase()] = false;
        if (e.code === 'Space') window.keys['space'] = false;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') window.keys['shift'] = false;
    });

    // ==========================================
    // 📱 2. LUỒNG CẢM ỨNG MOBILE (JOYSTICK ẢO)
    // ==========================================
    
    // A. BÊN TRÁI: JoyStick Di Chuyển (WASD)
    const mZoneLeft = document.getElementById('mZoneLeft');
    const mJoyBase = document.getElementById('mJoyBase');
    const mJoyStick = document.getElementById('mJoyStick');
    
    let joyActive = false;
    let joyCenter = { x: 0, y: 0 };
    let joyRadius = 60; // Bán kính cục base

    if (mZoneLeft) {
        mZoneLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            let touch = e.changedTouches[0];
            joyActive = true;
            joyCenter = { x: touch.clientX, y: touch.clientY };
            
            mJoyBase.style.left = joyCenter.x + 'px';
            mJoyBase.style.top = joyCenter.y + 'px';
            mJoyBase.style.display = 'block';
            mJoyStick.style.transform = `translate(-50%, -50%)`;
        }, {passive: false});

        mZoneLeft.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!joyActive) return;
            
            let touch = e.targetTouches[0];
            let dx = touch.clientX - joyCenter.x;
            let dy = touch.clientY - joyCenter.y;
            let dist = Math.hypot(dx, dy);
            
            // Ép núm nằm trong hình tròn
            if (dist > joyRadius) {
                dx = (dx / dist) * joyRadius;
                dy = (dy / dist) * joyRadius;
            }
            
            mJoyStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

            // PHIÊN DỊCH TỌA ĐỘ VÀO BÀN PHÍM ẢO CHO ENGINE.JS
            let threshold = 15; // Vượt quá 15px mới tính là di chuyển
            window.keys.w = dy < -threshold;
            window.keys.s = dy > threshold;
            window.keys.a = dx < -threshold;
            window.keys.d = dx > threshold;
            
            window.isKeyboardMoving = window.keys.w || window.keys.s || window.keys.a || window.keys.d;
        }, {passive: false});

        function resetJoyStick() {
            joyActive = false;
            mJoyBase.style.display = 'none';
            window.keys.w = window.keys.s = window.keys.a = window.keys.d = false;
            window.isKeyboardMoving = false;
        }

        mZoneLeft.addEventListener('touchend', resetJoyStick);
        mZoneLeft.addEventListener('touchcancel', resetJoyStick);
    }

    // B. BÊN PHẢI: Nút Q Khổng Lồ (Nhấp = Chém, Kéo Lên = Bay Lên, Kéo Xuống = Hạ Xuống)
    const btnQ = document.getElementById('slot-mb-Q');
    let qActive = false;
    let qStartY = 0;
    let isDraggingQ = false;

    if (btnQ) {
        btnQ.addEventListener('touchstart', (e) => {
            e.preventDefault();
            qActive = true;
            isDraggingQ = false;
            qStartY = e.touches[0].clientY;
            btnQ.style.transform = 'scale(0.9)'; // Hiệu ứng lún nút
        }, {passive: false});

        btnQ.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!qActive) return;
            
            let dy = e.touches[0].clientY - qStartY;
            
            if (Math.abs(dy) > 20) { // Kéo quá 20px thì thành Nút Bay
                isDraggingQ = true;
                if (dy < -20) {
                    window.keys.space = true; // Bay lên
                    window.keys.shift = false;
                } else if (dy > 20) {
                    window.keys.shift = true; // Hạ xuống
                    window.keys.space = false;
                }
            } else {
                window.keys.space = false;
                window.keys.shift = false;
            }
        }, {passive: false});

        function resetBtnQ() {
            qActive = false;
            btnQ.style.transform = 'scale(1)';
            window.keys.space = false;
            window.keys.shift = false;
            
            // NẾU KHÔNG KÉO, TỨC LÀ NHẤP (TAP) -> RA CHIÊU Q!
            if (!isDraggingQ) {
                kichHoatKyNang('Q');
            }
        }

        btnQ.addEventListener('touchend', resetBtnQ);
        btnQ.addEventListener('touchcancel', resetBtnQ);
    }

    // C. BÊN PHẢI: Các nút Skill còn lại (E, R, F)
    ['E', 'R', 'F'].forEach(phim => {
        let btn = document.getElementById('slot-mb-' + phim);
        if (btn) {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.style.transform = 'scale(0.9)';
                kichHoatKyNang(phim);
            }, {passive: false});
            btn.addEventListener('touchend', () => btn.style.transform = 'scale(1)');
            btn.addEventListener('touchcancel', () => btn.style.transform = 'scale(1)');
        }
    });

    // ==========================================
    // 🖱️ BẮT CHUỘT CHO MÁY TÍNH & CAMERA QUAY (GIỮ NGUYÊN)
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    window.addEventListener('pointerdown', (event) => {
        // Chỉ chạy trên PC (Chuột trái)
        if (event.pointerType !== 'mouse' || event.button !== 0 || !window.playerModel || window.isDead) return; 
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, window.camera);
        const intersects = raycaster.intersectObjects(window.scene.children, true);
        if (intersects.length > 0) {
            window.targetPosition.copy(intersects[0].point);
            window.playerModel.lookAt(new THREE.Vector3(window.targetPosition.x, window.playerModel.position.y, window.targetPosition.z));
            window.isMoving = true;
        }
    });

    window.camRotY = 0; 
    document.addEventListener('mousemove', (e) => {
        if (e.buttons === 2 || document.pointerLockElement) { 
            window.camRotY -= e.movementX * 0.005; 
            window.camRotY = Math.max(-0.7, Math.min(0.7, window.camRotY)); 
        }
    });

})();
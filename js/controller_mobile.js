// ==========================================
// 📱 BỘ ĐIỀU KHIỂN ĐỘC LẬP CHO MOBILE (CÓ TỐC ĐỘ ĐÁNH V2)
// ==========================================

(function() {
    console.log("📱 Đã tải lõi Controller Mobile!");
    
    // Hệ Thống Thời Gian Hồi Chiêu
    const thoiGianHoiChieu = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const thoiDiemTungChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    function batDauHoiChieuMobile(phimUpper, tgHoiThucTe) {
        let tgBatDau = Date.now();
        
        let pcSlot = document.getElementById('slot-' + phimUpper);
        let pcOv = pcSlot ? pcSlot.querySelector('.cd-overlay') : null;
        let pcTxt = pcSlot ? pcSlot.querySelector('.cd-text') : null;

        let mbSlot = document.getElementById('slot-mb-' + phimUpper);
        let mbOv = mbSlot ? mbSlot.querySelector('.m-cd') : null;
        let mbTxt = mbSlot ? mbSlot.querySelector('.cd-text') : null;

        if (pcOv) pcOv.style.height = '100%';
        if (mbOv) mbOv.style.height = '100%';
        if (pcTxt) pcTxt.style.display = 'block';
        if (mbTxt) mbTxt.style.display = 'block';
        
        const interval = setInterval(() => {
            let conLai = tgHoiThucTe - (Date.now() - tgBatDau);
            if (conLai <= 0) {
                clearInterval(interval); 
                if (pcOv) pcOv.style.height = '0%';
                if (mbOv) mbOv.style.height = '0%';
                if (pcTxt) pcTxt.style.display = 'none';
                if (mbTxt) mbTxt.style.display = 'none';
            } else {
                let pt = (conLai / tgHoiThucTe * 100) + '%';
                let sec = (conLai / 1000).toFixed(1);
                if (pcOv) pcOv.style.height = pt;
                if (mbOv) mbOv.style.height = pt;
                if (pcTxt) pcTxt.innerText = sec;
                if (mbTxt) mbTxt.innerText = sec;
            }
        }, 50); 
    }

    function kichHoatKyNang(phimUpper) {
        if (!window.playerModel || window.isDead) return;
        let bayGio = Date.now();

        // 🌟 ÉP TỐC ĐÁNH CHO MOBILE: Giảm thời gian chờ dựa trên chỉ số Speed của vũ khí
        let thoiGianHoiGoc = thoiGianHoiChieu[phimUpper];
        let tyLeGiam = window.GIAM_HOI_CHIEU || 0; 
        let thoiGianThucTe = thoiGianHoiGoc * (1.0 - tyLeGiam);

        if (bayGio - thoiDiemTungChieu[phimUpper] >= thoiGianThucTe) {
            thoiDiemTungChieu[phimUpper] = bayGio; 
            if (window.HePhaiHienTai) window.HePhaiHienTai.tungChieu(phimUpper);
            batDauHoiChieuMobile(phimUpper, thoiGianThucTe);
        } else {
            let sec = ((thoiGianThucTe - (bayGio - thoiDiemTungChieu[phimUpper])) / 1000).toFixed(1);
            if (typeof taoSoSatThuong === 'function') taoSoSatThuong(window.playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), "Chưa hồi xong (" + sec + "s)", '#e74c3c');
        }
    }

    
    // ==========================================
    // 🕹️ LÕI CẢM ỨNG
    // ==========================================
    const mZoneLeft = document.getElementById('mZoneLeft');
    const mJoyBase = document.getElementById('mJoyBase');
    const mJoyStick = document.getElementById('mJoyStick');
    const mZoneCam = document.getElementById('mZoneCam');
    
    // 1. JOYSTICK DI CHUYỂN (BẢN VÁ: CHỐNG TÀNG HÌNH & CHỐNG KẸT ZOOM CAMERA)
    let joyId = null; let joyCenter = { x: 0, y: 0 }; let joyR = 50; 

    if (mZoneLeft && mJoyBase) {
        mZoneLeft.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            e.stopPropagation(); // 🌟 LÁ CHẮN 1: Giấu ngón tay trái đi để Camera không bị nhầm là Zoom!
            
            let t = e.changedTouches[0]; joyId = t.identifier; joyCenter = { x: t.clientX, y: t.clientY };
            mJoyBase.style.left = joyCenter.x + 'px'; 
            mJoyBase.style.top = joyCenter.y + 'px'; 
            mJoyBase.style.opacity = '1'; 
            mJoyStick.style.transform = `translate(-50%, -50%)`;
        }, {passive: false});

        mZoneLeft.addEventListener('touchmove', (e) => {
            e.preventDefault(); 
            e.stopPropagation(); // 🌟 LÁ CHẮN 2: Ngăn lỗi Zoom khi đang vừa chạy vừa liếc Camera
            
            if (joyId === null) return;
            let t = Array.from(e.touches).find(x => x.identifier === joyId); if (!t) return;
            
            let dx = t.clientX - joyCenter.x; let dy = t.clientY - joyCenter.y; let dist = Math.hypot(dx, dy);
            if (dist > joyR) { dx = (dx / dist) * joyR; dy = (dy / dist) * joyR; }
            mJoyStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            
            // Giả lập phím bấm
            window.keys.w = dy < -10; window.keys.s = dy > 10; window.keys.a = dx < -10; window.keys.d = dx > 10;
            window.isKeyboardMoving = window.keys.w || window.keys.s || window.keys.a || window.keys.d;
        }, {passive: false});

        function resetJoy(e) {
            e.stopPropagation(); // 🌟 LÁ CHẮN 3
            if (Array.from(e.changedTouches).some(t => t.identifier === joyId) || e.type === 'touchcancel') {
                joyId = null; 
                
                // 🌟 BẢN VÁ: Trả Joystick về tọa độ gốc và độ mờ 50% (Không gán bằng 0 nữa)
                mJoyBase.style.left = '80px'; 
                mJoyBase.style.top = 'auto'; 
                mJoyBase.style.bottom = '60px';
                mJoyBase.style.opacity = '0.5'; 
                mJoyStick.style.transform = `translate(-50%, -50%)`;
                
                window.keys.w = window.keys.s = window.keys.a = window.keys.d = false; window.isKeyboardMoving = false;
            }
        }
        mZoneLeft.addEventListener('touchend', resetJoy); mZoneLeft.addEventListener('touchcancel', resetJoy);
    }






    // 2. XOAY CAMERA BẰNG CÁCH VUỐT VÙNG TRỐNG BÊN PHẢI
    let camId = null; let lastCamX = 0;
    window.camRotY = window.camRotY || 0;
    
    if (mZoneCam) {
        mZoneCam.addEventListener('touchstart', (e) => {
            e.preventDefault(); let t = e.changedTouches[0]; camId = t.identifier; lastCamX = t.clientX;
        }, {passive: false});
        mZoneCam.addEventListener('touchmove', (e) => {
            e.preventDefault(); if (camId === null) return;
            let t = Array.from(e.touches).find(x => x.identifier === camId); if (!t) return;
            let dx = t.clientX - lastCamX; lastCamX = t.clientX;
            window.camRotY = Math.max(-0.7, Math.min(0.7, window.camRotY - dx * 0.005));
        }, {passive: false});
        function resetCam(e) { if (Array.from(e.changedTouches).some(t => t.identifier === camId)) camId = null; }
        mZoneCam.addEventListener('touchend', resetCam); mZoneCam.addEventListener('touchcancel', resetCam);
    }

    // 3. NÚT SKILL Q (Bấm/Kéo) & E, R, F
    const btnQ = document.getElementById('slot-mb-Q');
    let qId = null; let qStartY = 0; let isDragQ = false;
    
    if (btnQ) {
        btnQ.addEventListener('touchstart', (e) => {
            e.preventDefault(); let t = e.changedTouches[0]; qId = t.identifier; isDragQ = false; qStartY = t.clientY; btnQ.style.transform = 'scale(0.9)'; 
        }, {passive: false});
        btnQ.addEventListener('touchmove', (e) => {
            e.preventDefault(); if (qId === null) return;
            let t = Array.from(e.touches).find(x => x.identifier === qId); if (!t) return;
            let dy = t.clientY - qStartY;
            if (Math.abs(dy) > 20) { isDragQ = true;
                if (dy < -20) { window.keys.space = true; window.keys.shift = false; } // Bay
                else { window.keys.shift = true; window.keys.space = false; } // Hạ
            } else { window.keys.space = window.keys.shift = false; }
        }, {passive: false});
        function resetQ(e) {
            if (Array.from(e.changedTouches).some(t => t.identifier === qId) || e.type === 'touchcancel') {
                qId = null; btnQ.style.transform = 'scale(1)'; window.keys.space = window.keys.shift = false;
                if (!isDragQ) kichHoatKyNang('Q');
            }
        }
        btnQ.addEventListener('touchend', resetQ); btnQ.addEventListener('touchcancel', resetQ);
    }

    ['E', 'R', 'F'].forEach(p => {
        let btn = document.getElementById('slot-mb-' + p);
        if (btn) {
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); btn.style.transform = 'scale(0.9)'; kichHoatKyNang(p); }, {passive: false});
            btn.addEventListener('touchend', () => btn.style.transform = 'scale(1)');
            btn.addEventListener('touchcancel', () => btn.style.transform = 'scale(1)');
        }
    });
})();
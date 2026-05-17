// ==========================================
// 🎮 BỘ ĐIỀU KHIỂN KÉP MOBILE AAA (KHÔNG CHẠM ENGINE)
// ==========================================

(function() {
    window.keys = { w: false, a: false, s: false, d: false, space: false, shift: false };
    window.isKeyboardMoving = false;
    window.dangMuaChieu = false; 

    // Hệ Thống Thời Gian Hồi Chiêu Mobile (z-index ROM bảo đảm dính click)
    const thoiGianHoiChieu = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const thoiDiemTungChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    function batDauHoiChieu(phimUpper) {
        let tgHoi = thoiGianHoiChieu[phimUpper], tgBatDau = Date.now();
        let pcTxt = document.getElementById('cd-txt-pc-' + phimUpper);
        let pcOv = document.getElementById('cd-ov-pc-' + phimUpper);
        let mbSlot = document.getElementById('slot-mb-' + phimUpper);
        let mbOv = mbSlot ? mbSlot.querySelector('.m-cd') : null;
        let mbTxt = mbSlot ? mbSlot.querySelector('.cd-text') : null;

        if (pcOv) pcOv.style.height = '100%'; if (mbOv) mbOv.style.height = '100%';
        if (pcTxt) pcTxt.style.display = 'block'; if (mbTxt) mbTxt.style.display = 'block';
        
        const interval = setInterval(() => {
            let conLai = tgHoi - (Date.now() - tgBatDau);
            if (conLai <= 0) {
                clearInterval(interval); 
                if (pcOv) pcOv.style.height = '0%'; if (mbOv) mbOv.style.height = '0%';
                if (pcTxt) pcTxt.style.display = 'none'; if (mbTxt) mbTxt.style.display = 'none';
            } else {
                let pt = (conLai / tgHoi * 100) + '%';
                let sec = (conLai / 1000).toFixed(1);
                if (pcOv) pcOv.style.height = pt; if (mbOv) mbOv.style.height = pt;
                if (pcTxt) pcTxt.innerText = sec; if (mbTxt) mbTxt.innerText = sec;
            }
        }, 50); 
    }

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
            let sec = ((thoiGianHoiChieu[phimUpper] - (bayGio - thoiDiemTungChieu[phimUpper])) / 1000).toFixed(1);
            if (typeof taoSoSatThuong === 'function') taoSoSatThuong(window.playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), sec+"s", '#e74c3c');
        }
    }

    // ==========================================
    // 💻 1. LUỒNG BÀN PHÍM PC (GIỮ NGUYÊN)
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
    // 📱 2. LUỒNG CẢM ỨNG MOBILE (JOYSTICK & SKILL)
    // ==========================================
    const mZoneLeft = document.getElementById('mZoneLeft');
    const mJoyBase = document.getElementById('mJoyBase');
    const mJoyStick = document.getElementById('mJoyStick');
    let joyActiveId = null; let joyCenter = { x: 0, y: 0 }; let joyRadius = 65; 

    if (mZoneLeft) {
        mZoneLeft.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            let touch = e.changedTouches[0]; joyActiveId = touch.identifier; joyCenter = { x: touch.clientX, y: touch.clientY };
            mJoyBase.style.left = joyCenter.x + 'px'; mJoyBase.style.top = joyCenter.y + 'px'; mJoyBase.style.display = 'block';
            mJoyStick.style.transform = `translate(-50%, -50%)`;
        }, {passive: false});

        mZoneLeft.addEventListener('touchmove', (e) => {
            e.preventDefault(); 
            if (joyActiveId === null) return;
            let touch = Array.from(e.touches).find(t => t.identifier === joyActiveId); if (!touch) return;
            let dx = touch.clientX - joyCenter.x; let dy = touch.clientY - joyCenter.y; let dist = Math.hypot(dx, dy);
            if (dist > joyRadius) { dx = (dx / dist) * joyRadius; dy = (dy / dist) * joyRadius; }
            mJoyStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            let threshold = 15; 
            window.keys.w = dy < -threshold; window.keys.s = dy > threshold; window.keys.a = dx < -threshold; window.keys.d = dx > threshold;
            window.isKeyboardMoving = window.keys.w || window.keys.s || window.keys.a || window.keys.d;
        }, {passive: false});

        function resetJoyStick(e) {
            let lifted = Array.from(e.changedTouches).some(t => t.identifier === joyActiveId);
            if (lifted || e.type === 'touchcancel') {
                joyActiveId = null; mJoyBase.style.display = 'none';
                window.keys.w = window.keys.s = window.keys.a = window.keys.d = false; window.isKeyboardMoving = false;
            }
        }
        mZoneLeft.addEventListener('touchend', resetJoyStick); mZoneLeft.addEventListener('touchcancel', resetJoyStick);
    }

    // Nút Q Khổng Lồ
    const btnQ = document.getElementById('slot-mb-Q');
    let qActiveId = null; let qStartY = 0; let isDraggingQ = false;
    if (btnQ) {
        btnQ.addEventListener('touchstart', (e) => {
            e.preventDefault(); let touch = e.changedTouches[0]; qActiveId = touch.identifier; isDraggingQ = false; qStartY = touch.clientY; btnQ.style.transform = 'scale(0.9)'; 
        }, {passive: false});
        btnQ.addEventListener('touchmove', (e) => {
            e.preventDefault(); if (qActiveId === null) return;
            let touch = Array.from(e.touches).find(t => t.identifier === qActiveId); if (!touch) return;
            let dy = touch.clientY - qStartY;
            if (Math.abs(dy) > 20) { isDraggingQ = true;
                if (dy < -20) { window.keys.space = true; window.keys.shift = false; } else { window.keys.shift = true; window.keys.space = false; }
            } else { window.keys.space = false; window.keys.shift = false; }
        }, {passive: false});
        function resetBtnQ(e) {
            let lifted = Array.from(e.changedTouches).some(t => t.identifier === qActiveId);
            if (lifted || e.type === 'touchcancel') {
                qActiveId = null; btnQ.style.transform = 'scale(1)'; window.keys.space = false; window.keys.shift = false;
                if (!isDraggingQ) kichHoatKyNang('Q');
            }
        }
        btnQ.addEventListener('touchend', resetBtnQ); btnQ.addEventListener('touchcancel', resetBtnQ);
    }

    // Nút E, R, F
    ['E', 'R', 'F'].forEach(phim => {
        let btn = document.getElementById('slot-mb-' + phim);
        if (btn) {
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); btn.style.transform = 'scale(0.9)'; kichHoatKyNang(phim); }, {passive: false});
            btn.addEventListener('touchend', () => btn.style.transform = 'scale(1)');
            btn.addEventListener('touchcancel', () => btn.style.transform = 'scale(1)');
        }
    });

    // 🖱️ BẮT CHUỘT CHO PC
    window.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0 || !window.playerModel || window.isDead) return; 
        const ray = new THREE.Raycaster(); const m = new THREE.Vector2((e.clientX/innerWidth)*2-1, -(e.clientY/innerHeight)*2+1);
        ray.setFromCamera(m, window.camera); const hits = ray.intersectObjects(window.scene.children, true);
        if (hits.length > 0) { window.targetPosition.copy(hits[0].point); window.playerModel.lookAt(window.targetPosition.x, window.playerModel.position.y, window.targetPosition.z); window.isMoving = true; }
    });
    window.camRotY = 0; document.addEventListener('mousemove', (e) => {
        if (e.buttons === 2 || document.pointerLockElement) { window.camRotY = Math.max(-0.7, Math.min(0.7, window.camRotY - e.movementX * 0.005)); }
    });
})();
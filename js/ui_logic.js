// ==========================================
// 📦 ĐỘNG CƠ XỬ LÝ EXP & THĂNG CẤP XUYÊN VŨ TRỤ
// ==========================================
window.congKinhNghiem = function (soExp, targetLevel = 1) {
    

    const formData = new FormData();
    formData.append('exp_nhan_vao', soExp);
    formData.append('target_level', targetLevel); // Gửi thêm cấp độ của nạn nhân để Server tính hình phạt

    fetch('api/thang_cap.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                // Cập nhật UI Thanh Kinh Nghiệm
                document.getElementById('uiLevel').innerText = "LV." + data.level;
                document.getElementById('soExpHienTai').innerText = data.exp + " / " + data.exp_can_thiet + " EXP";
                document.getElementById('thanhExpHienTai').style.width = (data.exp / data.exp_can_thiet * 100) + '%';

                // 🌟 NẾU ĐỘT PHÁ CẢNH GIỚI (THĂNG CẤP)
                if (data.thang_cap) {
                    console.log("💥 ĐỘT PHÁ CẢNH GIỚI! Cấp: " + data.level);
                    window.mauBanThan = data.hp_max; 
                    window.MAU_TOI_DA = data.hp_max;
                    window.DAME_CUA_TOI = data.damage; 

                    // Bơm đầy thanh máu trên UI
                    const uiThanhMau = document.getElementById('thanhMauHienTai');
                    const uiSoMau = document.getElementById('soMauHienTai');
                    if (uiThanhMau) uiThanhMau.style.width = '100%';
                    if (uiSoMau) uiSoMau.innerText = data.hp_max.toLocaleString() + " / " + data.hp_max.toLocaleString() + " HP";

                    // 🌟 HIỆU ỨNG VẬT LÝ: HÀO QUANG VÀNG CHÓI LỌI
                    if (typeof scene !== 'undefined' && typeof window.playerModel !== 'undefined') {
                        const geo = new THREE.CylinderGeometry(3, 3, 20, 32);
                        const mat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
                        const aura = new THREE.Mesh(geo, mat);
                        aura.position.copy(window.playerModel.position);
                        scene.add(aura);

                        let life = 1.0;
                        function bayAura() {
                            life -= 0.02;
                            if (life <= 0) { scene.remove(aura); return; }
                            aura.scale.x += 0.05; aura.scale.z += 0.05;
                            aura.material.opacity = life;
                            requestAnimationFrame(bayAura);
                        }
                        bayAura();
                    }

                    // Thông báo chữ nổi
                    if (typeof taoSoSatThuong === 'function' && typeof window.playerModel !== 'undefined') {
                        taoSoSatThuong(window.playerModel.position.clone().add(new THREE.Vector3(0, 10, 0)), "LEVEL UP!");
                    }
                }
            }
        });
};

// ==========================================
// 🎒 HỆ THỐNG TÚI ĐỒ "GIỚI CHỈ" VIP (CYBERPUNK x TU TIÊN)
// ==========================================

// Biến lưu trữ
window.khoDoData = [];
window.trangHienTai = 1;
const O_MOI_TRANG = 30;

// Bắt sự kiện phím B để mở
document.addEventListener('keydown', (e) => { 
    if ((e.key || "").toLowerCase() === 'b' && document.activeElement === document.body) {
        let modal = document.getElementById('inventoryModal');
        if (!modal) return;
        if (modal.style.display === 'none' || modal.style.display === '') moTuiDoVIP();
        else dongTuiDoVIP();
    }
});

// Hàm gọi API load túi đồ
window.moTuiDoVIP = function() {
    const modal = document.getElementById('inventoryModal');
    if (modal) modal.style.display = 'flex';
    document.getElementById('invGrid').innerHTML = '<div style="color:#00e5ff; grid-column:1/-1; text-align:center; padding:20px;">Đang quét Không gian...</div>';
    
    fetch('api/get_inventory.php')
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            window.khoDoData = data.data;
            document.getElementById('gameGoldUI').innerText = parseInt(data.game_gold).toLocaleString();
            document.getElementById('invCountUI').innerText = window.khoDoData.length;
            window.trangHienTai = 1;
            renderTrangTuiDo();
            document.getElementById('invDetailContent').innerHTML = '<i style="font-size:40px; color:#555;" class="fas fa-crosshairs"></i><br><br>Chọn vật phẩm để đồng bộ dữ liệu...';
        }
    });
};

window.dongTuiDoVIP = function() {
    document.getElementById('inventoryModal').style.display = 'none';
};

// Hàm Vẽ từng trang
function renderTrangTuiDo() {
    const grid = document.getElementById('invGrid');
    const pagination = document.getElementById('invPagination');
    grid.innerHTML = ''; pagination.innerHTML = '';
    
    let tongSoTrang = Math.ceil(Math.max(1, window.khoDoData.length) / O_MOI_TRANG);
    // Luôn giữ tối đa 7 trang
    if (tongSoTrang < 7) tongSoTrang = 7; 

    // Render 30 ô
    let startIdx = (window.trangHienTai - 1) * O_MOI_TRANG;
    let endIdx = startIdx + O_MOI_TRANG;

    for (let i = startIdx; i < endIdx; i++) {
        let item = window.khoDoData[i];
        if (item) {
            let iconText = (item.item_type === 'weapon' || item.item_type === 'weapon2') ? '⚔️' : (item.item_type === 'mount' ? '🐲' : '👕');
            let isEq = parseInt(item.is_equipped) === 1 ? 'equipped' : '';
            let badge = isEq ? '<div class="slot-badge">MẶC</div>' : '';
            
            grid.innerHTML += `
                <div class="inv-slot ${isEq}" onclick='chonXemMonDo(${JSON.stringify(item)})' title="${item.name}">
                    <span style="font-size:24px;">${iconText}</span>
                    ${badge}
                </div>`;
        } else {
            // Ô trống
            grid.innerHTML += `<div class="inv-slot" style="background:#0a0a0a; border-color:#222; cursor:default;"></div>`;
        }
    }

    // Vẽ nút phân trang
    for(let p = 1; p <= tongSoTrang; p++) {
        let activeCls = (p === window.trangHienTai) ? 'active' : '';
        pagination.innerHTML += `<button class="inv-page-btn ${activeCls}" onclick="chuyenTrangTuiDo(${p})">${p}</button>`;
    }
}

window.chuyenTrangTuiDo = function(p) { window.trangHienTai = p; renderTrangTuiDo(); };

// Hàm Chọn Món Đồ Hiện Ra Bên Phải
window.chonXemMonDo = function(item) {
    let detailBox = document.getElementById('invDetailContent');
    let isEq = parseInt(item.is_equipped) === 1;
    let iconText = (item.item_type === 'weapon' || item.item_type === 'weapon2') ? '⚔️' : (item.item_type === 'mount' ? '🐲' : '👕');
    
    // Nút Mặc / Tháo
    let btnHanhDong = isEq 
        ? `<button class="btn-cyber" style="background:#e74c3c; color:white;" onclick="thucHienHanhDongTrangBi(${item.inv_id}, 'unequip')">🔽 THÁO TRANG BỊ</button>`
        : `<button class="btn-cyber" style="background:#00e5ff; color:black;" onclick="thucHienHanhDongTrangBi(${item.inv_id}, 'equip')">🔼 MẶC TRANG BỊ</button>`;

    // Nút Bán Rác
    let btnBanRac = isEq 
        ? `<p style="color:#7f8c8d; font-size:12px; margin-top:5px;">*Phải tháo đồ mới được bán</p>`
        : `<button class="btn-cyber" style="background:transparent; border:1px solid #ff007f; color:#ff007f; margin-top:5px;" onclick="banRacPhiShop(${item.inv_id})">♻️ PHI SHOP LẤY VÀNG</button>`;

    detailBox.innerHTML = `
        <div style="font-size:60px; margin-bottom:10px; text-shadow:0 0 15px ${isEq ? 'gold' : '#00e5ff'};">${iconText}</div>
        <h3 style="color:${isEq ? 'gold' : '#00e5ff'}; margin:0 0 5px 0; text-transform:uppercase;">${item.name}</h3>
        <p style="color:#ff007f; font-weight:bold; margin:0 0 15px 0; font-size:12px;">Hệ Yêu Cầu: ${item.required_class === 'ALL' ? 'Dùng Chung' : item.required_class}</p>
        
        <div style="background:rgba(0,0,0,0.5); padding:10px; border-radius:5px; text-align:left; font-size:13px; margin-bottom:20px; border:1px solid #333;">
            <div style="margin-bottom:5px;">⚔️ Tấn Công: <span style="color:#ff3333; float:right;">+${item.bonus_damage || 0}</span></div>
            <div style="margin-bottom:5px;">❤️ Sinh Lực: <span style="color:#2ecc71; float:right;">+${item.bonus_hp || 0}</span></div>
            <div>⚡ Giá Trị: <span style="color:gold; float:right;">~${parseInt((item.price || 5000) * 0.1)} Vàng</span></div>
        </div>
        
        ${btnHanhDong}
        ${btnBanRac}
    `;
};

// 🌟 THUẬT TOÁN KIỂM TRA PHÁI VÀ THAY ĐỒ
window.thucHienHanhDongTrangBi = function(invId, action) {
    if (action === 'equip') {
        // Kiểm tra xem Sếp có mặc lộn đồ môn phái khác không
        let item = window.khoDoData.find(i => i.inv_id == invId);
        if (item && item.required_class !== 'ALL' && window.FACTION_CODE && item.required_class !== window.FACTION_CODE) {
            alert(`⚠️ Tẩu hỏa nhập ma! Món này chỉ dành cho hệ [${item.required_class}]!`);
            return;
        }
    }

    fetch('api/toggle_equip.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ inv_id: invId, action: action })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            // Thay đồ xong thì F5 game để nạp lại nhân vật
            location.reload();
        } else alert("Lỗi thay đồ!");
    });
};

// 🌟 THUẬT TOÁN BÁN RÁC
window.banRacPhiShop = function(invId) {
    if(!confirm("Bạn có chắc muốn vứt món này vào tiệm cầm đồ không?")) return;
    
    fetch('api/sell_item.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ inv_id: invId })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            // Hiển thị chữ Vàng bay lên đầu
            if (typeof window.taoSoSatThuong === 'function') window.taoSoSatThuong(window.playerModel.position.clone().add(new THREE.Vector3(0,5,0)), `+${data.gold_earned} VÀNG`, "gold");
            window.moTuiDoVIP(); // Load lại túi đồ
        } else alert(data.msg);
    });
};
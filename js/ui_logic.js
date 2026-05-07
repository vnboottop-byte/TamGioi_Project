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
// 🎒 HỆ THỐNG TÚI ĐỒ & TRANG BỊ ĐỘNG
// ==========================================

// 1. Tạo nút Mở Túi Đồ trên màn hình (Góc trên bên trái)
const btnTuiDo = document.createElement('div');
btnTuiDo.id = 'btnTuiDo'; // Đặt ID để dễ quản lý
btnTuiDo.innerHTML = '🎒 TÚI ĐỒ (B)';
btnTuiDo.style.cssText = "position:fixed; top:20px; left:20px; background:linear-gradient(45deg, #27ae60, #2ecc71); padding:10px 20px; border-radius:8px; font-weight:bold; color:white; cursor:pointer; z-index:100; box-shadow:0 4px 10px rgba(0,0,0,0.5); border:2px solid white;";
document.body.appendChild(btnTuiDo);

// 2. Tạo Bảng Giao diện Túi Đồ (Lúc đầu ẩn đi)
const modalTuiDo = document.createElement('div');
modalTuiDo.id = 'modalTuiDo';
modalTuiDo.style.cssText = "display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.95); border:3px solid #2ecc71; padding:25px; z-index:1000; width:600px; max-height:80vh; overflow-y:auto; border-radius:15px; color:white; box-shadow:0 0 30px rgba(46, 204, 113, 0.4); font-family: sans-serif;";
modalTuiDo.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2ecc71; padding-bottom: 10px; margin-bottom: 20px;">
        <h2 style="color:#2ecc71; margin:0; text-transform:uppercase; font-weight:900;">🎒 KHÔNG GIAN GIỚI CHỈ</h2>
        <button onclick="dongTuiDo()" style="background: #e74c3c; color: white; border: none; padding: 5px 15px; font-weight: bold; cursor: pointer; border-radius: 5px;">ĐÓNG [X]</button>
    </div>
    <div id="danhSachTuiDo" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:15px;">
        </div>
`;
document.body.appendChild(modalTuiDo);

// 3. Logic Đóng / Mở Túi Đồ
btnTuiDo.onclick = () => loadTuiDo();

function dongTuiDo() {
    document.getElementById('modalTuiDo').style.display = 'none';
}

// Mở túi bằng phím 'B'
document.addEventListener('keydown', (e) => { 
    if ((e.key || "").toLowerCase() === 'b' && document.activeElement === document.body) {
        let modal = document.getElementById('modalTuiDo');
        if (modal.style.display === 'none' || modal.style.display === '') {
            loadTuiDo();
        } else {
            dongTuiDo();
        }
    }
});

// 4. Tải dữ liệu Túi Đồ từ SQL
function loadTuiDo() {
    document.getElementById('modalTuiDo').style.display = 'block';
    const container = document.getElementById('danhSachTuiDo');
    container.innerHTML = '<p style="color:yellow; text-align:center; grid-column: 1 / -1;">⏳ Đang lục túi...</p>';

    fetch('api/get_inventory.php')
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') {
                container.innerHTML = `<p style="color:red; grid-column: 1 / -1;">Lỗi: ${data.msg}</p>`; return;
            }
            if (data.data.length === 0) {
                container.innerHTML = '<p style="color:#ccc; text-align:center; grid-column: 1 / -1;">Túi đồ trống trơn. Hãy ra Lâm Tỳ Các mua sắm đi Đạo Hữu!</p>'; return;
            }

            container.innerHTML = '';
            data.data.forEach(item => {
                let isEquipped = parseInt(item.is_equipped) === 1;
                let bgBorder = isEquipped ? 'border: 2px solid #f1c40f; background: #333;' : 'border: 1px solid #555; background: #222;';
                
                // Icon phân loại
                let typeName = '🥷 Ngoại Hình';
                if(item.item_type === 'weapon') typeName = '⚔️ Vũ Khí';
                if(item.item_type === 'mount') typeName = '🐲 Thú Cưỡi';

                // Nút Trang Bị / Đang dùng
                let btnHtml = isEquipped 
                    ? `<button disabled style="background:#f1c40f; color:black; padding:8px; border:none; border-radius:5px; width:100%; font-weight:bold;">✅ Đang dùng</button>`
                    : `<button onclick="macDoVaoNguoi(${item.item_id})" style="background:#3498db; color:white; padding:8px; border:none; border-radius:5px; cursor:pointer; width:100%; font-weight:bold; transition: background 0.2s;" onmouseover="this.style.background='#2980b9'" onmouseout="this.style.background='#3498db'">✨ Trang bị</button>`;
                
                container.innerHTML += `
                    <div style="padding: 15px; border-radius: 8px; text-align: center; ${bgBorder}">
                        <h4 style="margin: 0 0 5px 0; color: #fff; font-size: 14px;">${item.name}</h4>
                        <p style="font-size: 12px; color: #aaa; margin: 0 0 15px 0;">${typeName}</p>
                        ${btnHtml}
                    </div>
                `;
            });
        }).catch(err => container.innerHTML = '<p style="color:red; grid-column: 1 / -1;">Lỗi kết nối API Túi đồ!</p>');
}

// 5. Mặc đồ vào người (Gọi API equip_item.php)
window.macDoVaoNguoi = function(itemId) {
    const fd = new FormData();
    fd.append('item_id', itemId);

    fetch('api/equip_item.php', { method: 'POST', body: fd })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                // Tạm thời F5 lại game để Load lại Model. 
                // Sau này rảnh mình sẽ viết thuật toán thay Model Live không cần F5!
                location.reload(); 
            } else {
                alert("❌ Lỗi: " + data.msg);
            }
        }).catch(err => alert("❌ Lỗi đường truyền tới SQL!"));
}
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
                let uiLevel = document.getElementById('uiLevel');
                if (uiLevel) uiLevel.innerText = "LV." + data.level;
                
                let soExp = document.getElementById('soExpHienTai');
                if (soExp) soExp.innerText = data.exp + " / " + data.exp_can_thiet + " EXP";
                
                let thanhExp = document.getElementById('thanhExpHienTai');
                if (thanhExp) thanhExp.style.width = (data.exp / data.exp_can_thiet * 100) + '%';

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
                            if (life <= 0) { 
                                scene.remove(aura); 
                                if(typeof window.donRac3D === 'function') window.donRac3D(aura);
                                return; 
                            }
                            aura.scale.x += 0.05; aura.scale.z += 0.05;
                            aura.material.opacity = life;
                            requestAnimationFrame(bayAura);
                        }
                        bayAura();
                    }

                    // Thông báo chữ nổi
                    if (typeof window.taoSoSatThuong === 'function' && typeof window.playerModel !== 'undefined') {
                        window.taoSoSatThuong(window.playerModel.position.clone().add(new THREE.Vector3(0, 10, 0)), "LEVEL UP!", "#f1c40f");
                    }
                }
            }
        })
        .catch(err => {
            // 🛡️ LÁ CHẮN: Nếu Server đơ, mạng đứt, bỏ qua lỗi để không sập vòng lặp Animate!
            console.warn("⚠️ Bỏ qua lỗi tăng Kinh nghiệm do Server kẹt: ", err);
        });
};

    


// ==========================================
// 🎒 HỆ THỐNG TÚI ĐỒ "GIỚI CHỈ" VIP (CYBERPUNK x TU TIÊN)
// ==========================================

// Biến lưu trữ
window.khoDoData = [];
window.trangHienTai = 1;
const O_MOI_TRANG = 36; // 🌟 TĂNG LÊN 36 Ô (6x6)

// 🌟 BỘ MÁY CHIẾU 3D RIÊNG CHO TÚI ĐỒ
window.inv3D = { scene: null, cam: null, renderer: null, model: null, mixer: null, clock: new THREE.Clock(), reqId: null };

// Bắt sự kiện phím B để mở
document.addEventListener('keydown', (e) => { 
    if ((e.key || "").toLowerCase() === 'b' && document.activeElement === document.body) {
        let modal = document.getElementById('inventoryModal');
        if (!modal) return;
        if (modal.style.display === 'none' || modal.style.display === '') window.moTuiDoVIP();
        else window.dongTuiDoVIP();
    }
});













window.moTuiDoVIP = function() {
    const modal = document.getElementById('inventoryModal');
    if (modal) modal.style.display = 'flex';
    // 🌟 Đã sửa: Gắn window. để GPU Túi Đồ tỉnh ngủ
    if (typeof window.animateInv === 'function' && !window.inv3D.reqId) { window.animateInv(); }

    document.getElementById('invGrid').innerHTML = '<div style="color:#00e5ff; grid-column:1/-1; text-align:center; padding:20px; font-weight:bold;">Đang quét Không gian Giới Chỉ...</div>';


    
    fetch('api/get_inventory.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                window.khoDoData = data.data;
                document.getElementById('gameGoldUI').innerText = parseInt(data.game_gold).toLocaleString();
                // 🌟 BẢN VÁ: Cập nhật số dư Linh Thạch (KNB) vào Túi đồ
                if (document.getElementById('gameBalanceUI')) document.getElementById('gameBalanceUI').innerText = parseInt(data.balance || 0).toLocaleString();
                document.getElementById('invCountUI').innerText = window.khoDoData.length;

            window.trangHienTai = 1;
            renderTrangTuiDo();
            
            // Xóa model cũ khi vừa mở túi
            if (window.inv3D.model && window.inv3D.scene) {
                if (typeof window.donRac3D === 'function') window.donRac3D(window.inv3D.model);
                else window.inv3D.scene.remove(window.inv3D.model);
                window.inv3D.model = null;
            }

            document.getElementById('invDetailContent').innerHTML = '<i style="font-size:40px; color:#555;" class="fas fa-crosshairs"></i><br><br>Chọn vật phẩm để phân tích dữ liệu...';
        }
    });
};

window.dongTuiDoVIP = function() {
    document.getElementById('inventoryModal').style.display = 'none';
};









// ==========================================
// 📸 STUDIO CHỤP ẢNH TỰ ĐỘNG (BẢN V18 - BẮT SÁNG HÀO QUANG)
// ==========================================
window.thumb3D = window.thumb3D || { queue: [], isProcessing: false, scene: null, cam: null, renderer: null };
window.THUMBNAIL_CACHE = window.THUMBNAIL_CACHE || {};

window.taoThuNho3D = function(url, loaiDo, imgId, capDo = 0) {
    if (!url) return;
    function anEmojiHienAnh(srcData) {
        let imgEl = document.getElementById(imgId);
        let emj = document.getElementById('emoji_' + imgId);
        if(imgEl) { imgEl.src = srcData; imgEl.style.opacity = 1; }
        if(emj) emj.style.opacity = 0;
    }

    // 🌟 KHÓA BỘ NHỚ KÉP: Tách biệt ảnh của đồ +0 và đồ +15
    let cacheKey = url + "_+" + capDo;

    if (window.THUMBNAIL_CACHE[cacheKey] && window.THUMBNAIL_CACHE[cacheKey] !== 'LOADING') {
        anEmojiHienAnh(window.THUMBNAIL_CACHE[cacheKey]); return;
    }

    let checkCache = setInterval(() => {
        if (window.THUMBNAIL_CACHE[cacheKey] && window.THUMBNAIL_CACHE[cacheKey] !== 'LOADING') {
            clearInterval(checkCache); anEmojiHienAnh(window.THUMBNAIL_CACHE[cacheKey]);
        }
    }, 100);

    if (!window.THUMBNAIL_CACHE[cacheKey]) {
        window.THUMBNAIL_CACHE[cacheKey] = 'LOADING'; 
        window.thumb3D.queue.push({ url: url, loaiDo: loaiDo, capDo: capDo, cacheKey: cacheKey });
        window.xuLyHangDoiChupAnh();
    }
};

window.xuLyHangDoiChupAnh = function() {
    if (window.thumb3D.isProcessing || window.thumb3D.queue.length === 0) return;
    window.thumb3D.isProcessing = true;

    let task = window.thumb3D.queue.shift();
    let { url, loaiDo, capDo, cacheKey } = task;

    if (!window.thumb3D.renderer) {
        let canvas = document.createElement('canvas');
        window.thumb3D.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
        window.thumb3D.renderer.setSize(256, 256); 
        window.thumb3D.renderer.outputEncoding = THREE.sRGBEncoding;
        
        window.thumb3D.scene = new THREE.Scene();
        window.thumb3D.scene.add(new THREE.AmbientLight(0xffffff, 1.2));
        let dLight = new THREE.DirectionalLight(0xffffff, 1.5); dLight.position.set(10, 20, 15);
        window.thumb3D.scene.add(dLight);

        window.thumb3D.cam = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        window.thumb3D.cam.position.set(0, 0, 15); window.thumb3D.cam.lookAt(0, 0, 0);
    }







    if (typeof window.taiHoacNhanBanAsset === 'function') {
        // 🌟 BẢN VÁ: Hứng thêm biến animations từ kho Asset
        window.taiHoacNhanBanAsset(url, (model, animations) => {
            let pivot = new THREE.Group(); window.thumb3D.scene.add(pivot); pivot.add(model);

            // 🌟 ÉP XƯƠNG VỀ DÁNG NHÀN RỖI TRƯỚC KHI CHỤP ẢNH CHỐNG LỖI T-POSE
            if (animations && animations.length > 0) {
                let tempMixer = new THREE.AnimationMixer(model);
                let clipChon = animations[0];
                for (let clip of animations) {
                    let ten = clip.name.toUpperCase();
                    if (ten.includes('IDLE') || ten.includes('NHANROI') || ten.includes('WAIT') || ten.includes('STAND')) {
                        clipChon = clip; break;
                    }
                }
                tempMixer.clipAction(clipChon).play();
                tempMixer.update(0.1); // Nhích thời gian 0.1s để xương khớp vào đúng nếp
            }

            // 🌟 GỌI CẢM BIẾN TỶ LỆ CHO THUMBNAIL (Studio chụp ảnh)
            let targetSize = 8.5;
            if (loaiDo === 'weapon' || loaiDo === 'weapon2') targetSize = 11.5;
            else if (loaiDo === 'mount') targetSize = 6.5; // Thú cưỡi bóp nhỏ khung chụp ảnh lại
            else if (loaiDo === 'model') targetSize = 8.5; 
            
            if (typeof window.canBangModelUI === 'function') {
                window.canBangModelUI(model, targetSize);
            }

            if (loaiDo === 'weapon' || loaiDo === 'weapon2') pivot.rotation.set(Math.PI / 4, 0, Math.PI / 6); 
            else if (loaiDo === 'mount' || loaiDo === 'model') pivot.rotation.set(0, -Math.PI / 6, 0); 

            // 🌟 ĐIỂM ĂN TIỀN: GỌI HÀM PHÁT SÁNG CHO MÁY ẢNH
            if (capDo > 0 && typeof window.bocHaoQuang3D === 'function') {
                window.bocHaoQuang3D(model, capDo);
            }

            setTimeout(() => {
                window.thumb3D.renderer.render(window.thumb3D.scene, window.thumb3D.cam);
                let dataURL = window.thumb3D.renderer.domElement.toDataURL('image/png');
                window.THUMBNAIL_CACHE[cacheKey] = dataURL; 
                window.thumb3D.scene.remove(pivot); 
                window.thumb3D.isProcessing = false; window.xuLyHangDoiChupAnh();
            }, 100); 
        });
    } else {
        window.THUMBNAIL_CACHE[cacheKey] = 'ERROR'; window.thumb3D.isProcessing = false; window.xuLyHangDoiChupAnh();
    }






    
};








// Hàm Vẽ từng trang (Giữ nguyên DOM an toàn)
function renderTrangTuiDo() {
    const grid = document.getElementById('invGrid');
    const pagination = document.getElementById('invPagination');
    
    let tongSoTrang = Math.ceil(Math.max(1, window.khoDoData.length) / O_MOI_TRANG);
    if (tongSoTrang < 7) tongSoTrang = 7; 

    let startIdx = (window.trangHienTai - 1) * O_MOI_TRANG;
    let endIdx = startIdx + O_MOI_TRANG;

    let htmlGrid = ''; 
    let danhSachCanChup = []; 

    for (let i = startIdx; i < endIdx; i++) {
        let item = window.khoDoData[i];
        if (item) {





            let isEq = parseInt(item.is_equipped) === 1 ? 'equipped' : '';
            let badge = isEq ? '<div class="slot-badge">MẶC</div>' : '';            
            let fallbackEmoji = (item.item_type === 'weapon' || item.item_type === 'weapon2') ? '⚔️' : (item.item_type === 'mount' ? '🐲' : '👕');
            // 🌟 NHÃN CẤP ĐỘ ĐẬP ĐỒ (Chịu trách nhiệm: Hiển thị góc phải ô đồ)
            let lvl = parseInt(item.upgrade_level) || 0;
            let badgeLvl = lvl > 0 ? `<div style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.7); color:${lvl >= 10 ? 'gold' : 'cyan'}; border:1px solid ${lvl >= 10 ? 'gold' : '#00e5ff'}; font-size:10px; padding:1px 4px; border-radius:3px; font-weight:900; z-index:5; text-shadow: 0 0 5px ${lvl >= 10 ? 'orange' : 'blue'};">+${lvl}</div>` : '';







            let imgId = 'thumb_inv_' + item.inv_id;

            let iconHTML = `
                <div style="position:relative; width:100%; height:100%; display:flex; justify-content:center; align-items:center;">
                    <div id="emoji_${imgId}" style="position:absolute; font-size:24px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); transition:0.3s;">${fallbackEmoji}</div>
                    <img id="${imgId}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute; width: 85%; height: 85%; object-fit: contain; z-index:2; filter: drop-shadow(0 0 5px rgba(0,229,255,0.4)); transition: transform 0.2s, opacity 0.5s; opacity: 0;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">
                </div>
            `;
            




            htmlGrid += `
                <div class="inv-slot ${isEq}" onclick='chonXemMonDo(${JSON.stringify(item).replace(/'/g, "&#39;")})' title="${item.name}">
                    ${iconHTML}
                    ${badge}
                    ${badgeLvl}
                </div>`;


           
            danhSachCanChup.push({ url: item.model_url, type: item.item_type, id: imgId, capDo: parseInt(item.upgrade_level)||0 });






        } else {
            htmlGrid += `<div class="inv-slot" style="background:#0a0a0a; border-color:#222; cursor:default;"></div>`;
        }
    }

    grid.innerHTML = htmlGrid; 

    let htmlPage = '';
    for(let p = 1; p <= tongSoTrang; p++) {
        let activeCls = (p === window.trangHienTai) ? 'active' : '';
        htmlPage += `<button class="inv-page-btn ${activeCls}" onclick="chuyenTrangTuiDo(${p})">${p}</button>`;
    }
    pagination.innerHTML = htmlPage;

    // Đẩy danh sách khách vào Studio
    setTimeout(() => {
        danhSachCanChup.forEach(task => {
            if(typeof window.taoThuNho3D === 'function') {
                window.taoThuNho3D(task.url, task.type, task.id, task.capDo);
            }
        });
    }, 50);
}

window.chuyenTrangTuiDo = function(p) { window.trangHienTai = p; renderTrangTuiDo(); };


// Hàm Chọn Món Đồ Hiện Ra Bên Phải
window.chonXemMonDo = function(item) {
    let detailBox = document.getElementById('invDetailContent');
    let isEq = parseInt(item.is_equipped) === 1;
    
    // Nút Mặc / Tháo
    let btnHanhDong = isEq 
        ? `<button class="btn-cyber" style="background:#e74c3c; color:white; box-shadow: 0 0 10px rgba(231,76,60,0.5);" onclick="thucHienHanhDongTrangBi(${item.inv_id}, 'unequip')">🔽 THÁO TRANG BỊ</button>`
        : `<button class="btn-cyber" style="background:#00e5ff; color:black; box-shadow: 0 0 10px rgba(0,229,255,0.5);" onclick="thucHienHanhDongTrangBi(${item.inv_id}, 'equip')">🔼 MẶC TRANG BỊ</button>`;

    // Nút Bán Rác & Treo Chợ Đen
    let btnBanRac = isEq 
        ? `<p style="color:#7f8c8d; font-size:11px; margin-top:0;">*Phải tháo đồ mới được rã/bán</p>`
        : `<div style="display:flex; gap:10px; margin-top:10px;">
               <button class="btn-cyber" style="background:transparent; border:1px solid #ff007f; color:#ff007f; margin:0; padding:8px; font-size:11px; flex:1;" onclick="banRacPhiShop(${item.inv_id})">♻️ RÃ (${parseInt((item.price || 5000) * 0.1)} Vàng)</button>
               <button class="btn-cyber" style="background:transparent; border:1px solid #f1c40f; color:#f1c40f; margin:0; padding:8px; font-size:11px; flex:1;" onclick="treoBanChoden(${item.inv_id})">⚖️ TREO CHỢ</button>
           </div>`;

    // 🌟 TÍNH TOÁN CHỈ SỐ THỰC TẾ CHUẨN KIẾM THẾ (Hệ số nhân bạo kích theo cấp)
    let lvl = parseInt(item.upgrade_level) || 0;
    const heSoKiemThe = [1.0, 1.05, 1.12, 1.22, 1.35, 1.50, 1.70, 1.95, 2.25, 2.60, 3.10, 3.70, 4.50, 5.50, 6.80, 8.50];
    let heSoCong = heSoKiemThe[lvl] || 1.0; 
    
    let dameThucTe = Math.floor((item.bonus_damage || 0) * heSoCong);
    let hpThucTe = Math.floor((item.bonus_hp || 0) * heSoCong);
    let tocDoThucTe = Math.floor((item.bonus_speed || 0) * heSoCong); // 🌟 TỐC ĐỘ
    

    // 🌟 RÚT GỌN TÊN VÀ HỆ YÊU CẦU CHO ĐẸP VÀ VỪA VẶN
    let tenHienThi = lvl > 0 ? `${item.name} [+${lvl}]` : item.name;

    // Khoe thêm chỉ số gốc bằng chữ nhỏ mờ mờ cho VIP
    let hienThiGocDame = lvl > 0 ? `<span style="font-size:9px; color:#888; margin-right:5px;">(Gốc: ${item.bonus_damage || 0})</span>` : '';
    let hienThiGocHp = lvl > 0 ? `<span style="font-size:9px; color:#888; margin-right:5px;">(Gốc: ${item.bonus_hp || 0})</span>` : '';
    let hienThiGocSpd = lvl > 0 ? `<span style="font-size:9px; color:#888; margin-right:5px;">(Gốc: ${item.bonus_speed || 0})</span>` : '';

    // Gắn thông số và các Nút Hành Động
    detailBox.innerHTML = `
        <h3 style="color:${isEq ? 'gold' : '#00e5ff'}; margin:0 0 5px 0; text-transform:uppercase; font-size: 16px; text-shadow: 0 0 5px ${isEq ? 'gold' : 'cyan'};">${tenHienThi}</h3>

        <p style="color:#ff007f; font-weight:bold; margin:0 0 10px 0; font-size:11px;">Hệ: ${item.required_class === 'ALL' ? 'Dùng Chung' : item.required_class}</p>
        
        <div style="background:rgba(0,0,0,0.5); padding:8px 12px; border-radius:5px; text-align:left; font-size:12px; margin-bottom:15px; border:1px solid #333; color: #ccc;">
            <div style="margin-bottom:3px;">⚔️ Tấn Công: <span style="color:#ff3333; float:right; font-weight:bold;">${hienThiGocDame} +${dameThucTe}</span></div>
            <div style="margin-bottom:3px;">❤️ Sinh Lực: <span style="color:#2ecc71; float:right; font-weight:bold;">${hienThiGocHp} +${hpThucTe}</span></div>
            <div>⚡ Tốc Độ: <span style="color:#3498db; float:right; font-weight:bold;">${hienThiGocSpd} +${tocDoThucTe}</span></div>
        </div>
        
        ${btnHanhDong}
        ${btnBanRac}
    `;

    // 🌟 KÍCH HOẠT MÁY CHIẾU 3D
    hienThi3DTrongTui(item.model_url, item.item_type, parseInt(item.upgrade_level)||0);
};









// 🌟 BỘ MÁY ĐÚC 3D TRONG TÚI ĐỒ (ĐÃ FIX GÓC XOAY ĐẸP NHƯ LÂM TỲ CÁC)
function hienThi3DTrongTui(url, loaiDo, capDo = 0) {
    let box = document.getElementById('inv3DViewer');
    let loading = document.getElementById('inv3DLoading');
    if (!box) return;

    if (!window.inv3D.renderer) {
        window.inv3D.scene = new THREE.Scene();
        window.inv3D.cam = new THREE.PerspectiveCamera(45, box.clientWidth / box.clientHeight, 0.1, 1000);
        window.inv3D.cam.position.set(0, 0, 35);
        window.inv3D.cam.lookAt(0, 0, 0);

        window.inv3D.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        window.inv3D.renderer.outputEncoding = THREE.sRGBEncoding;
        window.inv3D.renderer.toneMapping = THREE.LinearToneMapping;
        window.inv3D.renderer.toneMappingExposure = 1.0;

        if (typeof THREE.RoomEnvironment !== 'undefined') {
            const pmremGenerator = new THREE.PMREMGenerator(window.inv3D.renderer);
            window.inv3D.scene.environment = pmremGenerator.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
        }




        if (typeof THREE.RoomEnvironment !== 'undefined') {
            const pmremGenerator = new THREE.PMREMGenerator(window.inv3D.renderer);
            window.inv3D.scene.environment = pmremGenerator.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
        }

        // 🌟 Đã sửa: Nâng cấp thành Hàm Toàn Cầu
        window.animateInv = function() {
            // 🌟 TỐI ƯU: Đóng băng render nếu bảng Túi đồ đang ẩn, cứu GPU
            if (document.getElementById('inventoryModal').style.display === 'none') {
                window.inv3D.reqId = null;
                return;
            }
            
            window.inv3D.reqId = requestAnimationFrame(window.animateInv);
            let delta = window.inv3D.clock.getDelta();
            if (window.inv3D.mixer) window.inv3D.mixer.update(delta);

            if (window.inv3D.pivot) window.inv3D.pivot.rotation.y += 0.015;

            window.inv3D.renderer.render(window.inv3D.scene, window.inv3D.cam);
        }

        window.animateInv(); // Kích nổ động cơ
    }

    window.inv3D.cam.aspect = box.clientWidth / box.clientHeight;
    window.inv3D.cam.updateProjectionMatrix();
    window.inv3D.renderer.setSize(box.clientWidth, box.clientHeight);

    box.innerHTML = '';
    box.appendChild(window.inv3D.renderer.domElement);
    box.appendChild(loading);
    loading.style.display = 'block';

    // Xóa rác cũ
    if (window.inv3D.pivot) {
        window.inv3D.scene.remove(window.inv3D.pivot);
        if (window.inv3D.model && typeof window.donRac3D === 'function') window.donRac3D(window.inv3D.model);
        window.inv3D.pivot = null;
        window.inv3D.model = null;
    }
    if (window.inv3D.mixer) { window.inv3D.mixer.stopAllAction(); window.inv3D.mixer = null; }

    if (!url) { loading.style.display = 'none'; return; }

    const loader = window.loaderSieuToc || new THREE.GLTFLoader();
    loader.load(url, (gltf) => {
        let model = gltf.scene;
        window.inv3D.model = model;




        if (gltf.animations && gltf.animations.length > 0) {
            window.inv3D.mixer = new THREE.AnimationMixer(model);
            let clipChon = gltf.animations[0];
            // 🌟 LỌC ANIMATION ĐỨNG IM CHO TÚI ĐỒ
            for (let clip of gltf.animations) {
                let ten = clip.name.toUpperCase();
                if (ten.includes('IDLE') || ten.includes('NHANROI') || ten.includes('WAIT') || ten.includes('STAND')) {
                    clipChon = clip; break;
                }
            }
            window.inv3D.mixer.clipAction(clipChon).play();
        }

        // 🌟 GỌI CẢM BIẾN TỶ LỆ CHO KHUNG 3D TÚI ĐỒ (CỘT PHẢI)
        let targetSize = 16;
        if (loaiDo === 'weapon' || loaiDo === 'weapon2') targetSize = 22;
        else if (loaiDo === 'mount') targetSize = 13; // Thú cưỡi bóp nhỏ lại để ko lòi đuôi/cánh
        else if (loaiDo === 'model') targetSize = 16;
        
        if (typeof window.canBangModelUI === 'function') {
            window.canBangModelUI(model, targetSize);
        }

        // 🌟 TẠO HỘP PIVOT BỌC MÔ HÌNH LẠI
        let pivot = new THREE.Group();
        pivot.add(model);
        window.inv3D.pivot = pivot;
        window.inv3D.scene.add(pivot);

        // 🌟 LỖI CŨ CỦA SẾP NẰM Ở ĐÂY NÈ: Thay vì model.rotation, giờ phải đổi thành pivot.rotation
        if (loaiDo === 'weapon' || loaiDo === 'weapon2') {
            pivot.rotation.set(Math.PI / 4, 0, Math.PI / 6); 
        } else if (loaiDo === 'mount' || loaiDo === 'model') {
            pivot.rotation.set(0, -Math.PI / 6, 0); 
        }

        // 🌟 BẬT HÀO QUANG CHO RẠP CHIẾU PHIM TÚI ĐỒ
        if (capDo > 0 && typeof window.bocHaoQuang3D === 'function') {
            window.bocHaoQuang3D(model, capDo);
        }
        loading.style.display = 'none';


        



        



    });
}



window.thucHienHanhDongTrangBi = function(invId, action) {
    let item = window.khoDoData.find(i => i.inv_id == invId);

    if (action === 'equip') {
        if (item && item.item_type !== 'model' && item.required_class !== 'ALL' && window.FACTION_CODE && item.required_class !== window.FACTION_CODE) {
            window.hienThongBaoGame(`Tẩu hỏa nhập ma! Pháp bảo này chứa sức mạnh của hệ [${item.required_class}], cơ thể bạn không chịu nổi!`, false);
            return;
        }
    }

    fetch('api/toggle_equip.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ inv_id: invId, action: action })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            
            // 🌟 ĐOẠT XÁ CHUYỂN PHÁI: Bắt buộc F5 khi Mặc hoặc Tháo BẤT KỲ Skin/Ngoại trang nào (Cả Anime lẫn Phái Gốc)
            if (item && item.item_type === 'model') {
                let thongBao = (action === 'equip') 
                    ? "✨ Đang kích hoạt Bí Thuật Đoạt Xá! Xin chờ giây lát..." 
                    : "✨ Thu hồi Bí Thuật! Đang hoàn nguyên chân thể...";
                window.hienThongBaoGame(thongBao, true);
                setTimeout(() => location.reload(), 1500);
                return; 
            }

            // 🌟 CẬP NHẬT TRỰC TIẾP VÀO NÃO ENGINE ĐỂ ĐÁNH RA DAME MỚI
            if (data.new_damage) window.DAME_CUA_TOI = data.new_damage;
            if (data.new_hp) {
                window.MAU_TOI_DA = data.new_hp;
                window.mauBanThan = data.new_hp; 
            }

            fetch('api/get_inventory.php')
            .then(res2 => res2.json())
            .then(data2 => {
                if (data2.status === 'success') {
                    window.khoDoData = data2.data;
                    if (document.getElementById('gameGoldUI')) document.getElementById('gameGoldUI').innerText = parseInt(data2.game_gold).toLocaleString();
                    if (document.getElementById('gameBalanceUI')) document.getElementById('gameBalanceUI').innerText = parseInt(data2.balance || 0).toLocaleString();
                    window.renderTrangTuiDo(); 

                    let itemMoi = window.khoDoData.find(i => i.inv_id == invId);
                    if (itemMoi) {
                        window.chonXemMonDo(itemMoi); 
                        
                        if (typeof window.capNhatTrangBi3DNgayLapTuc === 'function') {
                            let url3D = action === 'equip' ? itemMoi.model_url : '';
                            
                            // 🌟 QUY TẮC D: ÉP TÀNG HÌNH NẾU ĐANG MẶC SKIN "ALL" MÀ BẤM THAY VŨ KHÍ (Skin phái gốc vẫn load bình thường)
                            if (window.IS_SKIN_ANIME && ['weapon', 'weapon2', 'shield'].includes(itemMoi.item_type)) {
                                url3D = '';
                            }
                            
                            let capDoĐập = action === 'equip' ? (parseInt(itemMoi.upgrade_level) || 0) : 0;
                            window.capNhatTrangBi3DNgayLapTuc(itemMoi.item_type, url3D, capDoĐập);
                        }
                    }
                }
            });
        } else {
            window.hienThongBaoGame("Lỗi thay đồ!", false);
        }
    });
};


// 🌟 THUẬT TOÁN BÁN RÁC (PHÂN RÃ)
window.banRacPhiShop = function(invId) {
    window.hienXacNhanGame("Bạn có chắc muốn ném món này vào Lò Bát Quái để phân rã lấy Linh thạch không?\nThao tác này làm mất trang bị vĩnh viễn!", function() {
        fetch('api/sell_item.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ inv_id: invId })
        }).then(res => res.json()).then(data => {
            if(data.status === 'success') {
                if (typeof window.taoChuNoiGacha === 'function') window.taoChuNoiGacha(window.playerModel.position.clone().add(new THREE.Vector3(0,5,0)), `+${data.gold_earned} VÀNG`, "gold");
                window.moTuiDoVIP(); 
            } else window.hienThongBaoGame(data.msg, false);
        });
    });
};












// ==========================================
// ⌨️ UI NHẬP LIỆU GAME AAA (THAY THẾ PROMPT CHROME)
// ==========================================
window.hienNhapLieuGame = function (msg, defaultValue, callbackYes) {
    let box = document.getElementById('gameInputBox');
    if (!box) {
        box = document.createElement('div'); box.id = 'gameInputBox';
        box.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:1000009; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);';
        document.body.appendChild(box);
    }
    box.innerHTML = `
        <div style="width: 400px; background: linear-gradient(135deg, #2c3e50 0%, #000 100%); border: 2px solid #9b59b6; border-radius: 10px; padding: 20px; text-align: center; box-shadow: 0 0 30px rgba(155, 89, 182, 0.4);">
            <div style="font-size: 50px; margin-bottom: 10px;">⚖️</div>
            <h2 style="color: #d2b4de; margin: 0 0 15px 0; text-transform: uppercase;">CHỢ ĐEN GIAO DỊCH</h2>
            <div style="color: #fff; font-size: 14px; margin-bottom: 15px; line-height: 1.5; white-space: pre-wrap;">${msg}</div>
            <input type="number" id="gameInputValue" value="${defaultValue}" style="width: 80%; padding: 10px; font-size: 18px; font-weight: bold; text-align: center; color: gold; background: #000; border: 2px solid #f1c40f; border-radius: 5px; margin-bottom: 20px; outline: none;">
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="btnInputYes" style="flex: 1; background: #8e44ad; color: white; font-weight: 900; font-size: 16px; border: 2px solid #9b59b6; padding: 10px; border-radius: 5px; cursor: pointer; box-shadow: 0 0 15px rgba(142, 68, 173, 0.5);">✔️ XÁC NHẬN</button>
                <button onclick="document.getElementById('gameInputBox').style.display='none'" style="flex: 1; background: #555; color: #fff; font-weight: bold; font-size: 16px; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">HỦY BỎ</button>
            </div>
        </div>
    `;
    box.style.display = 'flex';
    setTimeout(() => document.getElementById('gameInputValue').focus(), 100);
    document.getElementById('btnInputYes').onclick = function () {
        let val = document.getElementById('gameInputValue').value;
        box.style.display = 'none';
        callbackYes(val);
    };
};

window.treoBanChoden = function (invId) {
    window.hienNhapLieuGame("Nhập số Linh Thạch (Vàng) bạn muốn bán món này\n(Thuế chợ 5% sẽ được thu khi có người mua):", 100000, function (giaBan) {
        let parsedGia = parseInt(giaBan);
        if (isNaN(parsedGia) || parsedGia <= 0) { window.hienThongBaoGame("❌ Giá không hợp lệ!", false); return; }

        window.hienXacNhanGame(`Bạn sẽ treo bán pháp bảo này với giá ${parsedGia.toLocaleString()} Vàng?`, function () {
            let fd = new FormData(); fd.append('inv_id', invId); fd.append('price_gold', parsedGia);
            fetch('api/sell_auction.php', { method: 'POST', body: fd })
                .then(res => res.json()).then(data => {
                    if (data.status === 'success') {
                        window.hienThongBaoGame("✔️ Đã ném đồ lên Chợ Đen thành công!", true);
                        window.moTuiDoVIP();
                    } else window.hienThongBaoGame("❌ Lỗi: " + data.msg, false);
                });
        });
    });
};



    












// ==========================================
// 🔥 BỘ NÃO LÒ BÁT QUÁI (GIAI ĐOẠN 3 - FRONTEND LOGIC)
// ==========================================
window.loRenData = {
    item: null, // Món đồ trung tâm
    stones: [null, null, null, null, null, null] // 6 ô đá
};

// 1. Mở lò & Quét Túi Đồ
window.moLoBatQuai = function() {
    document.getElementById('forgeModal').style.display = 'flex';
    document.getElementById('forgeInventoryGrid').innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#00e5ff; margin-top:50px; font-weight:bold;">Đang quét Túi Càn Khôn...</div>';
    
    // Luôn fetch lại API để lấy dữ liệu mới nhất
    fetch('api/get_inventory.php')
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            window.khoDoData = data.data; 
            window.renderTuiDoLoRen();
            window.capNhatGiaoDienLo();
        }
    });
};

// 2. Đóng lò & Trả đồ về túi
window.dongLoBatQuai = function() {
    document.getElementById('forgeModal').style.display = 'none';
    window.loRenData.item = null;
    window.loRenData.stones = [null, null, null, null, null, null];
};




window.hopThanhData = { stones: [null, null, null], targetLevel: 0 };

window.chuyenTabLo = function(tabName, btnEl) {
    document.querySelectorAll('.tabLoBtn').forEach(b => { b.style.background = '#222'; b.style.color = '#aaa'; });
    
    if (tabName === 'DAP_DO') {
        btnEl.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)'; 
    } else {
        btnEl.style.background = 'linear-gradient(90deg, #2980b9, #3498db)'; 
        window.renderTuiDoHopThanh();
        window.capNhatGiaoDienHopThanh();
    }
    btnEl.style.color = 'white';
    
    document.getElementById('tabDapDo').style.display = (tabName === 'DAP_DO') ? 'flex' : 'none';
    document.getElementById('tabGhepDa').style.display = (tabName === 'GHEP_DA') ? 'flex' : 'none';
};



// 3. Đổ đồ vào danh sách Cột Trái (Chỉ lọc Vũ Khí, Thú, Ngoại Trang, Đá)
window.renderTuiDoLoRen = function() {
    const grid = document.getElementById('forgeInventoryGrid');
    grid.innerHTML = '';
    
    let coDo = false;
    let danhSachCanChup = [];

    window.khoDoData.forEach(item => {
        // Kiểm tra xem món này có đang được đặt trong Lò không?
        let dangTrongLo = false;
        if (window.loRenData.item && window.loRenData.item.inv_id === item.inv_id) dangTrongLo = true;
        window.loRenData.stones.forEach(s => { if (s && s.inv_id === item.inv_id) dangTrongLo = true; });

        if (!dangTrongLo && ['weapon', 'weapon2', 'mount', 'model', 'material'].includes(item.item_type)) {
            coDo = true;
            let fallbackEmoji = (item.item_type === 'weapon' || item.item_type === 'weapon2') ? '⚔️' : (item.item_type === 'mount' ? '🐲' : (item.item_type === 'material' ? '💎' : '👕'));
            let imgId = 'thumb_forge_' + item.inv_id;
            
            let lvl = parseInt(item.upgrade_level) || 0;
            let badgeLvl = lvl > 0 ? `<div style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.8); color:${lvl >= 10 ? 'gold' : 'cyan'}; border:1px solid ${lvl >= 10 ? 'gold' : '#00e5ff'}; font-size:10px; padding:1px 4px; border-radius:3px; font-weight:900; z-index:5;">+${lvl}</div>` : '';
            let isEq = parseInt(item.is_equipped) === 1 ? '<div style="position:absolute; bottom:2px; left:2px; font-size:9px; color:#e74c3c; font-weight:bold;">[MẶC]</div>' : '';

            let iconHTML = `
                <div style="position:relative; width:100%; height:100%; display:flex; justify-content:center; align-items:center;">
                    <div id="emoji_${imgId}" style="position:absolute; font-size:24px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); transition:0.3s;">${fallbackEmoji}</div>
                    <img id="${imgId}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute; width: 85%; height: 85%; object-fit: contain; z-index:2; filter: drop-shadow(0 0 5px rgba(0,229,255,0.4)); transition: opacity 0.5s; opacity: 0;">
                </div>
            `;
            
            grid.innerHTML += `
                <div class="inv-slot" style="background:#111; border:1px solid #444; border-radius:5px; height:60px; cursor:pointer; position:relative; box-shadow: 0 2px 5px rgba(0,0,0,0.5);" onclick='duaDoVaoLo(${JSON.stringify(item).replace(/'/g, "&#39;")})' title="${item.name}">
                    ${badgeLvl}
                    ${iconHTML}
                    ${isEq}
                </div>`;
                
            danhSachCanChup.push({ url: item.model_url, type: item.item_type, id: imgId, capDo: parseInt(item.upgrade_level)||0 });
        }
    });
    
    if (!coDo) grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#555; margin-top:50px;">Không có vật phẩm phù hợp...</div>';

    setTimeout(() => {
        danhSachCanChup.forEach(task => {
            if (typeof window.taoThuNho3D === 'function') window.taoThuNho3D(task.url, task.type, task.id, task.capDo);
        });
    }, 10);
};






// 4. Nhặt đồ bỏ vào lò
window.duaDoVaoLo = function (item) {
    if (item.item_type === 'material') {
        let idx = window.loRenData.stones.findIndex(s => s === null);
        if (idx !== -1) {
            window.loRenData.stones[idx] = item;
        } else {
            window.hienThongBaoGame("Lò rèn đã đầy Tinh Thạch! Hãy tháo bớt ra.", false);
        }
    } else {
        if (window.loRenData.item !== null) {
            window.hienThongBaoGame("Đã có vật phẩm trong lò! Hãy tháo ra trước.", false);
            return;
        }
        let lvl = parseInt(item.upgrade_level) || 0;
        if (lvl >= 15) {
            window.hienThongBaoGame("✨ Pháp bảo này đã đạt Cảnh Giới Tối Đa (Chí Tôn +15), không thể luyện hóa thêm!", false);
            return;
        }
        window.loRenData.item = item;
    }
    window.renderTuiDoLoRen();
    window.capNhatGiaoDienLo();
};






// 5. Gỡ đồ trả về túi
window.goDoKhoiLo = function(type, index) {
    if (type === 'item') window.loRenData.item = null;
    if (type === 'stone') window.loRenData.stones[index] = null;
    window.renderTuiDoLoRen();
    window.capNhatGiaoDienLo();
};





// ==========================================
// 🔔 HỆ THỐNG THÔNG BÁO VÀ XÁC NHẬN IN-GAME (THAY THẾ ALERT/CONFIRM)
// ==========================================
window.hienThongBaoGame = function(msg, isSuccess = true) {
    let box = document.getElementById('gameAlertBox');
    if (!box) {
        box = document.createElement('div');
        box.id = 'gameAlertBox';
        box.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:1000009; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);';
        document.body.appendChild(box);
    }
    
    let color = isSuccess ? '#2ecc71' : '#e74c3c';
    let icon = isSuccess ? '✨' : '❌';
    let title = isSuccess ? 'THÔNG BÁO' : 'CẢNH BÁO';

    box.innerHTML = `
        <div style="width: 400px; background: linear-gradient(135deg, #111 0%, #000 100%); border: 2px solid ${color}; border-radius: 10px; padding: 20px; text-align: center; box-shadow: 0 0 30px ${color}55;">
            <div style="font-size: 50px; margin-bottom: 10px;">${icon}</div>
            <h2 style="color: ${color}; margin: 0 0 15px 0; text-transform: uppercase;">${title}</h2>
            <div style="color: #fff; font-size: 16px; margin-bottom: 25px; line-height: 1.5; white-space: pre-wrap;">${msg}</div>
            <button onclick="document.getElementById('gameAlertBox').style.display='none'" style="background: ${color}; color: #000; font-weight: 900; font-size: 16px; border: none; padding: 10px 40px; border-radius: 5px; cursor: pointer; box-shadow: 0 0 15px ${color};">ĐÓNG</button>
        </div>
    `;
    box.style.display = 'flex';
};

window.hienXacNhanGame = function(msg, callbackYes) {
    let box = document.getElementById('gameConfirmBox');
    if (!box) {
        box = document.createElement('div');
        box.id = 'gameConfirmBox';
        box.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:1000009; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);';
        document.body.appendChild(box);
    }

    box.innerHTML = `
        <div style="width: 400px; background: linear-gradient(135deg, #2c3e50 0%, #000 100%); border: 2px solid #f39c12; border-radius: 10px; padding: 20px; text-align: center; box-shadow: 0 0 30px rgba(243, 156, 18, 0.5);">
            <div style="font-size: 50px; margin-bottom: 10px;">🔥</div>
            <h2 style="color: #f39c12; margin: 0 0 15px 0; text-transform: uppercase;">XÁC NHẬN</h2>
            <div style="color: #fff; font-size: 16px; margin-bottom: 25px; line-height: 1.5; white-space: pre-wrap;">${msg}</div>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="btnConfirmYes" style="flex: 1; background: #e74c3c; color: white; font-weight: 900; font-size: 16px; border: 2px solid #c0392b; padding: 10px; border-radius: 5px; cursor: pointer; box-shadow: 0 0 15px red;">🔥 ĐỒNG Ý</button>
                <button onclick="document.getElementById('gameConfirmBox').style.display='none'" style="flex: 1; background: #555; color: #fff; font-weight: bold; font-size: 16px; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">HỦY BỎ</button>
            </div>
        </div>
    `;
    box.style.display = 'flex';
    
    document.getElementById('btnConfirmYes').onclick = function() {
        box.style.display = 'none';
        callbackYes();
    };
};

// ==========================================
// ⚒️ TÍNH TOÁN UI & CHI PHÍ LÒ RÈN
// ==========================================
window.capNhatGiaoDienLo = function() {
    let slotTrungTam = document.getElementById('forgeItemSlot');
    let danhSachCanChup = [];





    // --- VẼ Ô VŨ KHÍ & SOI NHÂN PHẨM ---
    let boxRating = document.getElementById('forgeItemRating');
    if (!boxRating) {
        boxRating = document.createElement('div'); boxRating.id = 'forgeItemRating';
        slotTrungTam.parentNode.insertBefore(boxRating, slotTrungTam.nextSibling);
    }

    if (window.loRenData.item) {
        let it = window.loRenData.item;
        let lvl = parseInt(it.upgrade_level) || 0;
        let imgId = 'thumb_lo_main';
        let emoji = (it.item_type === 'mount') ? '🐲' : '⚔️';
        slotTrungTam.innerHTML = `
            <div style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.8); color:gold; border:1px solid gold; font-size:12px; padding:2px 6px; border-radius:5px; font-weight:900; z-index:10; box-shadow:0 0 10px gold;">+${lvl}</div>
            <div style="position:relative; width:100%; height:100%; display:flex; justify-content:center; align-items:center;">
                <div id="emoji_${imgId}" style="position:absolute; font-size:40px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); transition:0.3s;">${emoji}</div>
                <img id="${imgId}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute; width: 85%; height: 85%; object-fit: contain; z-index:2; filter: drop-shadow(0 0 10px rgba(255,170,0,0.8)); transition: opacity 0.5s; opacity: 0;">
            </div>
        `;
        danhSachCanChup.push({ url: it.model_url, type: it.item_type, id: imgId, capDo: parseInt(it.upgrade_level)||0 });

        // 🌟 BỘ MÁY ĐO ĐIỂM TIỀM NĂNG GẮN BÊN DƯỚI Ô VŨ KHÍ
        if (lvl > 0) {
            // Tính toán ngược lại Điểm Tiềm Năng thực tế (Cộng dồn Dame, HP, Tốc)
            let pts = Math.round(((it.bonus_damage || 0) / 2) + ((it.bonus_hp || 0) / 20) + ((it.bonus_speed || 0) * 5));
            let xepLoai = ""; let mauSac = "";
            
            if (pts > 120) { xepLoai = "THẦN KHÍ (SHOP)"; mauSac = "#ff3333"; }
            else if (pts >= 115) { xepLoai = "CỰC PHẨM"; mauSac = "#ff00ff"; }
            else if (pts >= 100) { xepLoai = "VIP"; mauSac = "#f1c40f"; }
            else if (pts >= 90) { xepLoai = "TRUNG BÌNH"; mauSac = "#3498db"; }
            else { xepLoai = "RÁC"; mauSac = "#95a5a6"; }

            boxRating.innerHTML = `
                <div style="margin-top: 8px; background: rgba(0,0,0,0.8); border: 1px solid ${mauSac}; padding: 5px 10px; border-radius: 5px; font-size: 11px; color: #fff; box-shadow: 0 0 10px ${mauSac}; text-align: center; width: 100%; box-sizing: border-box;">
                    <div style="color:#aaa; margin-bottom:2px;">Nhân Phẩm: <b style="color:${mauSac}; font-size:14px;">${pts}/120 ĐIỂM</b></div>
                    Đánh giá: <b style="color:${mauSac}; text-transform:uppercase;">${xepLoai}</b>
                </div>`;
        } else {
            boxRating.innerHTML = `
                <div style="margin-top: 8px; background: rgba(0,0,0,0.8); border: 1px dashed #7f8c8d; padding: 5px; border-radius: 5px; font-size: 10px; color: #7f8c8d; text-align: center; width: 100%; box-sizing: border-box;">
                    Chưa Giám định (Max 120 Điểm)<br>Đập +1 để mở khóa!
                </div>`;
        }

    } else {
        slotTrungTam.innerHTML = `<span style="color:#555;">+</span>`;
        if (boxRating) boxRating.innerHTML = '';
    }





    // --- VẼ 6 Ô TINH THẠCH & CỘNG ĐIỂM ---
    let tongDiemDa = 0;
    for (let i = 0; i < 6; i++) {
        let sSlot = document.getElementById('fStone_' + i);
        let stone = window.loRenData.stones[i];
        if (stone) {
            let capDaMatch = stone.name.match(/\d+/);
            let capDa = capDaMatch ? parseInt(capDaMatch[0]) : 1;
            let diem = Math.pow(10/3, capDa - 1) * 100;
            tongDiemDa += diem;

            let imgId = 'thumb_lo_stone_' + i;
            sSlot.innerHTML = `
                <div style="position:absolute; bottom:2px; right:2px; color:#fff; font-size:10px; font-weight:bold; z-index:10; background:rgba(0,0,0,0.5); padding:1px 3px; border-radius:2px;">C${capDa}</div>
                <div style="position:relative; width:100%; height:100%; display:flex; justify-content:center; align-items:center;">
                    <div id="emoji_${imgId}" style="position:absolute; font-size:24px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); transition:0.3s;">💎</div>
                    <img id="${imgId}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute; width: 80%; height: 80%; object-fit: contain; z-index:2; filter: drop-shadow(0 0 5px rgba(0,229,255,0.8)); transition: opacity 0.5s; opacity: 0;">
                </div>
            `;
            danhSachCanChup.push({ url: stone.model_url, type: stone.item_type, id: imgId, capDo: 0 });
        } else {
            sSlot.innerHTML = '';
        }
    }

    // --- TÍNH TOÁN % VÀ CHI PHÍ ---
    let rateUI = document.getElementById('forgeSuccessRate');
    let barUI = document.getElementById('forgeRateBar');
    let costUI = document.getElementById('forgeCost');

    if (!window.loRenData.item) {
        rateUI.innerText = "0%"; rateUI.style.color = "#555";
        barUI.style.width = "0%"; barUI.style.background = "#555";
        costUI.innerText = "0";
    } else {
        let lvlHienTai = parseInt(window.loRenData.item.upgrade_level) || 0;
        let targetLvl = lvlHienTai + 1; 
        
        let diemYeuCau = Math.pow(10/3, targetLvl - 1) * 100;
        let phanTramThucTe = (tongDiemDa / diemYeuCau) * 100;
        let phanTramHienThi = phanTramThucTe > 100 ? 100 : phanTramThucTe;



        // 🌟 CHI PHÍ LÒ RÈN KIẾM THẾ: 1 Điểm Đá = 1 Vàng
        // Bỏ bao nhiêu điểm Huyền Tinh vào thì tốn bấy nhiêu Vàng!
        let chiPhi = Math.floor(tongDiemDa);
        if (tongDiemDa === 0) chiPhi = 0;

        rateUI.innerText = phanTramHienThi.toFixed(1) + "%";
        barUI.style.width = phanTramHienThi + "%";
        costUI.innerText = chiPhi.toLocaleString();

        if (phanTramHienThi < 30) { rateUI.style.color = "#e74c3c"; barUI.style.background = "linear-gradient(90deg, #c0392b, #e74c3c)"; }
        else if (phanTramHienThi < 80) { rateUI.style.color = "#f1c40f"; barUI.style.background = "linear-gradient(90deg, #e67e22, #f1c40f)"; }
        else { rateUI.style.color = "#2ecc71"; barUI.style.background = "linear-gradient(90deg, #27ae60, #2ecc71)"; }
    }

    setTimeout(() => {
        danhSachCanChup.forEach(task => {
            if (typeof window.taoThuNho3D === 'function') window.taoThuNho3D(task.url, task.type, task.id, task.capDo);
        });
    }, 50);
};

// ==========================================
// 🚀 NỐI DÂY VÀO SERVER & XỬ LÝ KẾT QUẢ
// ==========================================
window.tienHanhDapDo = function() {
    if (!window.loRenData.item) {
        window.hienThongBaoGame("Sếp chưa bỏ Pháp Bảo vào lò!", false);
        return;
    }
    
    let stoneIds = [];
    window.loRenData.stones.forEach(s => {
        if (s) stoneIds.push(s.inv_id); 
    });
    
    let cauHoi = stoneIds.length === 0 
        ? "Sếp không bỏ Tinh Thạch nào vào lò, tỷ lệ thành công là 0%.\nĐập xịt sẽ tốn Vàng và có rủi ro rớt cấp!\n\nXác nhận đập?" 
        : "Tiền và Tinh thạch sẽ bị thiêu rụi!\nXác nhận khai hỏa Lò Bát Quái?";

    // 🌟 GỌI BẢNG XÁC NHẬN VIP
    window.hienXacNhanGame(cauHoi, function() {
        
        let btn = document.getElementById('btnKhaiLo');
        btn.disabled = true;
        btn.innerText = "ĐANG LUYỆN HÓA...";
        
        let fd = new FormData();
        fd.append('item_id', window.loRenData.item.inv_id);
        fd.append('stones', JSON.stringify(stoneIds));
        
        fetch('api/upgrade_item.php', { method: 'POST', body: fd })
        .then(res => res.json())
        .then(data => {
            btn.disabled = false;
            btn.innerText = "🔨 ĐẬP ĐỒ";
            
            if (data.status === 'success') {
                let goldUI = document.getElementById('gameGoldUI');
                if (goldUI) goldUI.innerText = parseInt(data.new_gold).toLocaleString();
                
                let charPos = (typeof window.playerModel !== 'undefined' && window.playerModel) ? window.playerModel.position.clone() : new THREE.Vector3(0,0,0);
                charPos.y += 5;
                
                // 🌟 FIX LỖI CẬP NHẬT TRONG LÒ: Sửa trực tiếp cấp độ của món đồ đang nằm trong Lò
                window.loRenData.item.upgrade_level = data.new_level;



                // 🌟 HIỆN THÔNG BÁO BẬT LÊN RÕ RÀNG CHO SẾP THẤY
                if (data.result === 'SUCCESS') {
                    if (data.is_giam_dinh) {
                        // Phân loại Phẩm chất khi vừa nổ hũ xong
                        let danhGia = data.diem_giam_dinh >= 115 ? "CỰC PHẨM (MAX VIP) 🌈" : (data.diem_giam_dinh >= 100 ? "THƯỢNG PHẨM (VIP) 🌟" : (data.diem_giam_dinh >= 90 ? "TRUNG PHẨM 💠" : "HẠ PHẨM (RÁC) 🗑️"));

                        window.hienThongBaoGame(`✨ THĂNG CẤP +1 THÀNH CÔNG!\n\n🔍 KẾT QUẢ GIÁM ĐỊNH:\nPháp bảo nhận được ${data.diem_giam_dinh}/120 Điểm Tiềm Năng!\nĐánh giá Nhân Phẩm: ${danhGia}`, true);

                        if (typeof window.taoChuNoiGacha === 'function') {
                            window.taoChuNoiGacha(charPos, "✨ ĐÃ MỞ KHÓA GIÁM ĐỊNH! ✨", "#00ffff");
                            setTimeout(() => { window.taoChuNoiGacha(charPos.clone().add(new THREE.Vector3(0, 2, 0)), `💥 ${data.diem_giam_dinh} ĐIỂM TIỀM NĂNG!`, "#ff00ff"); }, 600);
                        }
                    } else {
                        // Đập từ +2 trở lên thì chỉ hiện bình thường
                        window.hienThongBaoGame(`Tuyệt phẩm đã thăng cấp lên +${data.new_level}!`, true);
                        if (typeof window.taoChuNoiGacha === 'function') window.taoChuNoiGacha(charPos, "✨ NÂNG CẤP THÀNH CÔNG! ✨", "#2ecc71");
                    }
                    if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(charPos, 15, 0x2ecc71);
                } else {



                    let msgFail = `Tinh thạch đã hóa thành tro bụi...`;
                    if (data.drop_level) msgFail += `\n📉 Đắng lòng: Vũ khí bị rớt xuống +${data.new_level}!`;
                    
                    window.hienThongBaoGame(msgFail, false);
                    
                    if (typeof window.taoChuNoiGacha === 'function') window.taoChuNoiGacha(charPos, data.drop_level ? "📉 RỚT CẤP!" : "❌ XỊT RỒI!", "#e74c3c");
                    if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(charPos, 15, 0xe74c3c);
                }
                
                // Đốt sạch đá trong lò
                window.loRenData.stones = [null, null, null, null, null, null];
                
                // 🌟 FIX LỖI CẬP NHẬT: Quét lại túi đồ để cập nhật cấp độ mới nhất cho danh sách bên trái
                fetch('api/get_inventory.php').then(res => res.json()).then(invData => {
                    if(invData.status === 'success') {
                        window.khoDoData = invData.data; 
                        window.renderTuiDoLoRen();
                    }
                });
                
                // Tính lại tỷ lệ % dựa trên món đồ vừa thăng cấp (Hiện tại đá trống = 0%)
                window.capNhatGiaoDienLo();
                
            } else {
                window.hienThongBaoGame("Lỗi Lò Rèn: " + data.msg, false);
            }
        })
        .catch(e => {
            btn.disabled = false;
            btn.innerText = "🔨 ĐẬP ĐỒ";
            window.hienThongBaoGame("Lỗi kết nối đến Tòa Án Tối Cao!", false);
        });
    });
};




// ==========================================
// 🔮 BỘ NÃO HỢP THÀNH (GHÉP ĐÁ) - BẢN VÁ LỖI HIỂN THỊ 3D
// ==========================================
window.renderTuiDoHopThanh = function() {
    const grid = document.getElementById('craftInventoryGrid');
    grid.innerHTML = '';
    let coDo = false;
    let danhSachCanChup = []; // 🌟 THÊM KHAY CHỨA MÁY ẢNH 3D

    window.khoDoData.forEach(item => {
        let dangDuocDung = window.hopThanhData.stones.some(s => s && s.inv_id === item.inv_id);
        // Chặn không cho lấy đá đang bỏ bên Lò Rèn
        let dangTrongLoRen = window.loRenData.stones.some(s => s && s.inv_id === item.inv_id);

        if (!dangDuocDung && !dangTrongLoRen && item.item_type === 'material') {
            coDo = true;
            let capDaMatch = item.name.match(/\d+/);
            let capDa = capDaMatch ? parseInt(capDaMatch[0]) : 1;
            
            // 🌟 TẠO MÃ ID ẢNH ĐỘC LẬP CHỐNG TRÙNG LẶP
            let imgId = 'thumb_craft_' + item.inv_id;

            // 🌟 NHÉT THÊM THẺ <img> ĐỂ ĐỘNG CƠ 3D ĐỔ ẢNH VÀO
            let iconHTML = `
                <div style="position:relative; width:100%; height:100%; display:flex; justify-content:center; align-items:center;">
                    <div id="emoji_${imgId}" style="position:absolute; font-size:24px; filter: drop-shadow(0 0 5px rgba(0,255,255,0.5)); transition:0.3s;">💎</div>
                    <img id="${imgId}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute; width: 85%; height: 85%; object-fit: contain; z-index:2; filter: drop-shadow(0 0 5px rgba(0,229,255,0.8)); transition: opacity 0.5s; opacity: 0;">
                    <div style="position:absolute; bottom:2px; right:2px; color:#fff; font-size:10px; font-weight:bold; background:rgba(0,0,0,0.5); padding:1px 3px; border-radius:2px; z-index:5;">C${capDa}</div>
                </div>
            `;
            
            grid.innerHTML += `
                <div class="inv-slot" style="background:#111; border:1px solid #3498db; border-radius:5px; height:60px; cursor:pointer; position:relative; box-shadow: 0 2px 5px rgba(0,0,0,0.5);" onclick='chonDaHopThanh(${JSON.stringify(item).replace(/'/g, "&#39;")}, ${capDa})' title="${item.name}">
                    ${iconHTML}
                </div>`;
                
            // 🌟 QUĂNG VÀO HÀNG ĐỢI MÁY ẢNH
            danhSachCanChup.push({ url: item.model_url, type: item.item_type, id: imgId, capDo: 0 });
        }
    });
    
    if (!coDo) grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#555; margin-top:50px;">Không tìm thấy Tinh Thạch trống...</div>';

    // 🌟 KÍCH HOẠT STUDIO CHỤP ẢNH
    setTimeout(() => {
        danhSachCanChup.forEach(task => {
            if (typeof window.taoThuNho3D === 'function') window.taoThuNho3D(task.url, task.type, task.id, task.capDo);
        });
    }, 50);
};




window.chonDaHopThanh = function(item, capDa) {
    if (window.hopThanhData.targetLevel > 0 && capDa !== window.hopThanhData.targetLevel) {
        window.hienThongBaoGame("Chỉ có thể ghép 3 viên Tinh Thạch CÙNG CẤP!", false);
        return;
    }

    let idx = window.hopThanhData.stones.findIndex(s => s === null);
    if (idx !== -1) {
        window.hopThanhData.stones[idx] = item;
        window.hopThanhData.targetLevel = capDa;
    } else {
        window.hienThongBaoGame("Đã đủ 3 viên Tinh Thạch!", false);
    }
    
    window.renderTuiDoHopThanh();
    window.capNhatGiaoDienHopThanh();
};

window.goDaHopThanh = function(index) {
    window.hopThanhData.stones[index] = null;
    let conVienNaoKhong = window.hopThanhData.stones.some(s => s !== null);
    if (!conVienNaoKhong) window.hopThanhData.targetLevel = 0; // Reset lại cấp mục tiêu
    
    window.renderTuiDoHopThanh();
    window.capNhatGiaoDienHopThanh();
};

window.capNhatGiaoDienHopThanh = function() {
    let count = 0;
    let danhSachCanChup = []; // 🌟 KHAY CHỨA MÁY ẢNH 3D

    for (let i = 0; i < 3; i++) {
        let slot = document.getElementById('cStone_' + i);
        let stone = window.hopThanhData.stones[i];
        if (stone) {
            count++;
            let imgId = 'thumb_craft_slot_' + i; 
            
            slot.innerHTML = `
                <div style="position:relative; width:100%; height:100%; display:flex; justify-content:center; align-items:center;">
                    <div id="emoji_${imgId}" style="font-size:30px; position:absolute; filter: drop-shadow(0 0 10px cyan); transition:0.3s;">💎</div>
                    <img id="${imgId}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute; width: 85%; height: 85%; object-fit: contain; z-index:2; filter: drop-shadow(0 0 5px rgba(0,229,255,0.8)); transition: opacity 0.5s; opacity: 0;">
                    <div style="position:absolute; bottom:2px; right:2px; color:#fff; font-size:10px; font-weight:bold; background:rgba(0,0,0,0.8); padding:1px 4px; border-radius:3px; z-index:5;">C${window.hopThanhData.targetLevel}</div>
                </div>
            `;
            danhSachCanChup.push({ url: stone.model_url, type: stone.item_type, id: imgId, capDo: 0 });
        } else {
            slot.innerHTML = '';
        }
    }

    let costUI = document.getElementById('craftCost');
    let resultUI = document.getElementById('cResult');




    if (count === 3) {
        let capMoi = window.hopThanhData.targetLevel + 1;
        
        // 🌟 PHÍ GHÉP ĐÁ KIẾM THẾ: Bù giá trị chênh lệch (1 Điểm chênh = 5 Vàng)
        let diemDaCu = Math.pow(10/3, window.hopThanhData.targetLevel - 1) * 100;
        let diemDaMoi = Math.pow(10/3, capMoi - 1) * 100;
        
        let diemChenhLech = diemDaMoi - (diemDaCu * 3);
        let chiPhi = Math.floor(diemChenhLech * 5); // Nhân 5 để siết bớt tiền Vàng
        if (chiPhi <= 0) chiPhi = 100; // Tối thiểu 100 Vàng
        
        costUI.innerText = chiPhi.toLocaleString('vi-VN');

        // ==========================================
        // 🌟 BỘ MÁY TÌM KIẾM MODEL 3D CHO ĐÁ MỤC TIÊU
        // ==========================================
        let hienThiVaChupAnhKetQua = function(modelUrl) {
            let imgId = 'thumb_craft_result';
            resultUI.innerHTML = `
                <div style="position:relative; width:100%; height:100%; display:flex; justify-content:center; align-items:center; animation: nhipTho 1s infinite;">
                    <div id="emoji_${imgId}" style="font-size:40px; position:absolute; filter: drop-shadow(0 0 20px gold); transition:0.3s;">💎</div>
                    <img id="${imgId}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute; width: 85%; height: 85%; object-fit: contain; z-index:2; filter: drop-shadow(0 0 10px rgba(255,215,0,0.8)); transition: opacity 0.5s; opacity: 0;">
                    <div style="position:absolute; bottom:2px; color:gold; font-size:14px; font-weight:900; text-shadow:0 0 5px red; z-index:5;">CẤP ${capMoi}</div>
                </div>
            `;
            danhSachCanChup.push({ url: modelUrl, type: 'material', id: imgId, capDo: 0 });
            
            // Ra lệnh chụp toàn bộ 4 ô
            setTimeout(() => {
                danhSachCanChup.forEach(task => {
                    if (typeof window.taoThuNho3D === 'function') window.taoThuNho3D(task.url, task.type, task.id, task.capDo);
                });
            }, 50);
        };

        let tenDaMoi = "Tinh Thạch Cấp " + capMoi;
        
        // 1. Dò trong Túi Càn Khôn trước cho nhanh
        let daMauTrongTui = window.khoDoData.find(item => item.name === tenDaMoi);
        
        if (daMauTrongTui && daMauTrongTui.model_url) {
            hienThiVaChupAnhKetQua(daMauTrongTui.model_url);
        } else {
            // 2. Nếu túi không có, gọi API tra cứu Database
            resultUI.innerHTML = `<span style="color:#00ffff; font-size:10px; font-weight:bold;">Đang soi Database...</span>`;
            
            fetch('api/get_shop.php').then(res => res.json()).then(data => {
                let modelUrlMoi = window.hopThanhData.stones[0].model_url; // Fallback
                if (data.status === 'success' && data.data) {
                    let daShop = data.data.find(item => item.name === tenDaMoi && item.item_type === 'material');
                    if (daShop && daShop.model_url) {
                        modelUrlMoi = daShop.model_url; // Đã tóm được Link 3D thật sự!
                    }
                }
                hienThiVaChupAnhKetQua(modelUrlMoi);
            }).catch(e => {
                // Nếu rớt mạng thì mượn tạm hình cũ đỡ
                hienThiVaChupAnhKetQua(window.hopThanhData.stones[0].model_url); 
            });
        }

    } else {
        costUI.innerText = "0";
        resultUI.innerHTML = `<span style="color:#555; font-size:12px; font-weight:bold;">THÀNH PHẨM</span>`;
        
        // Cất đá ra thì chỉ chụp lại 3 ô input
        setTimeout(() => {
            danhSachCanChup.forEach(task => {
                if (typeof window.taoThuNho3D === 'function') window.taoThuNho3D(task.url, task.type, task.id, task.capDo);
            });
        }, 50);
    }
};

window.tienHanhHopThanh = function() {
    let stoneIds = [];
    window.hopThanhData.stones.forEach(s => { if (s) stoneIds.push(s.inv_id); });
    
    if (stoneIds.length < 3) {
        window.hienThongBaoGame("Phải thu thập đủ 3 viên Tinh Thạch cùng cấp để kích hoạt Trận Pháp!", false);
        return;
    }

    window.hienXacNhanGame("Dùng lực hút vũ trụ ép 3 viên Tinh Thạch này lại làm một?\nTinh thạch gốc sẽ biến mất vĩnh viễn!", function() {
        let btn = document.getElementById('btnHopThanh');
        btn.disabled = true; btn.innerText = "ĐANG ÉP...";

        let fd = new FormData();
        fd.append('stones', JSON.stringify(stoneIds));
        
        fetch('api/craft_stone.php', { method: 'POST', body: fd })
        .then(res => res.json())
        .then(data => {
            btn.disabled = false; btn.innerText = "🔮 GHÉP ĐÁ";
            
            if (data.status === 'success') {
                let goldUI = document.getElementById('gameGoldUI');
                if (goldUI) goldUI.innerText = parseInt(data.new_gold).toLocaleString();
                
                let charPos = (typeof window.playerModel !== 'undefined' && window.playerModel) ? window.playerModel.position.clone() : new THREE.Vector3(0,0,0);
                charPos.y += 5;
                
                window.hienThongBaoGame(`✨ Kì Tích! Đã ngưng tụ thành công [Tinh Thạch Cấp ${data.new_level}]!`, true);
                if (typeof window.taoChuNoiGacha === 'function') window.taoChuNoiGacha(charPos, `✨ NHẬN TINH THẠCH CẤP ${data.new_level} ✨`, "gold");
                if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(charPos, 15, 0x00ffff);
                
                // Reset lưới
                window.hopThanhData = { stones: [null, null, null], targetLevel: 0 };
                
                // Load lại túi đồ
                fetch('api/get_inventory.php').then(res => res.json()).then(invData => {
                    if(invData.status === 'success') {
                        window.khoDoData = invData.data; 
                        window.renderTuiDoHopThanh();
                        window.capNhatGiaoDienHopThanh();
                    }
                });
            } else {
                window.hienThongBaoGame("Lỗi Hợp Thành: " + data.msg, false);
            }
        }).catch(e => {
            btn.disabled = false; btn.innerText = "🔮 GHÉP ĐÁ";
            window.hienThongBaoGame("Lỗi mất kết nối đến Tòa Án Tối Cao!", false);
        });
    });
};











// ==========================================
// 💹 HỆ THỐNG SÀN CHỨNG KHOÁN LINH THẠCH (P2P)
// ==========================================

// 1. Form Treo Bán Linh Thạch (2 Ô nhập liệu tự tính toán)
window.hienFormBanLinhThach = function() {
    let box = document.getElementById('gameCurrencyBox');
    if (!box) {
        box = document.createElement('div'); box.id = 'gameCurrencyBox';
        box.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:1000009; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);';
        document.body.appendChild(box);
    }

    box.innerHTML = `
        <div style="width: 500px; background: linear-gradient(135deg, #1a0b2e 0%, #000 100%); border: 2px solid #00ffcc; border-radius: 10px; padding: 25px; box-shadow: 0 0 40px rgba(0,255,204,0.4);">
            <div style="font-size: 50px; text-align:center; margin-bottom: 10px; text-shadow: 0 0 20px #00ffcc;">💎</div>
            <h2 style="color: #00ffcc; text-align:center; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing:2px;">SÀN BÁN LINH THẠCH</h2>
            
            <div style="display:flex; gap:15px; margin-bottom:15px;">
                <div style="flex:1;">
                    <label style="color:#fff; font-size:12px; font-weight:bold;">SỐ LƯỢNG LINH THẠCH BÁN:</label>
                    <input type="number" id="inpLTAmount" placeholder="VD: 10000" style="width:100%; box-sizing:border-box; padding:12px; font-size:20px; font-weight:bold; text-align:center; color:#00ffcc; background:#000; border:2px solid #00ffcc; border-radius:5px; margin-top:5px; outline:none;">
                </div>
                <div style="flex:1;">
                    <label style="color:#fff; font-size:12px; font-weight:bold;">TỶ GIÁ (1 LT = ? VÀNG):</label>
                    <input type="number" id="inpLTRate" placeholder="VD: 136" style="width:100%; box-sizing:border-box; padding:12px; font-size:20px; font-weight:bold; text-align:center; color:gold; background:#000; border:2px solid gold; border-radius:5px; margin-top:5px; outline:none;">
                </div>
            </div>

            <div style="background:#111; border:1px dashed #555; padding:15px; border-radius:5px; margin-bottom:20px; text-align:center;">
                <span style="color:#aaa; font-size:12px;">SAU KHI BÁN HẾT SẼ THU VỀ:</span><br>
                <span id="txtTongVang" style="color:gold; font-size:30px; font-weight:900; text-shadow:0 0 10px gold;">0</span> <span style="color:gold; font-weight:bold;">VÀNG</span>
            </div>

            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="btnXacNhanBanLT" style="flex: 1; background: #2ecc71; color: #000; font-weight: 900; font-size: 16px; border: none; padding: 12px; border-radius: 5px; cursor: pointer; box-shadow: 0 0 15px #2ecc71;">✔️ ĐĂNG LÊN SÀN</button>
                <button onclick="document.getElementById('gameCurrencyBox').style.display='none'" style="flex: 1; background: #555; color: #fff; font-weight: bold; font-size: 16px; border: none; padding: 12px; border-radius: 5px; cursor: pointer;">HỦY BỎ</button>
            </div>
        </div>
    `;
    box.style.display = 'flex';

    // Xử lý Tính toán Real-time
    let inpAmount = document.getElementById('inpLTAmount');
    let inpRate = document.getElementById('inpLTRate');
    let txtTong = document.getElementById('txtTongVang');

    function tinhTien() {
        let sl = parseInt(inpAmount.value) || 0;
        let tyGia = parseInt(inpRate.value) || 0;
        txtTong.innerText = (sl * tyGia).toLocaleString('vi-VN');
    }
    inpAmount.addEventListener('input', tinhTien);
    inpRate.addEventListener('input', tinhTien);

    // Nút Xác nhận
    document.getElementById('btnXacNhanBanLT').onclick = function() {
        let sl = parseInt(inpAmount.value);
        let tyGia = parseInt(inpRate.value);
        if (!sl || sl <= 0 || !tyGia || tyGia <= 0) { window.hienThongBaoGame("❌ Dữ liệu nhập không hợp lệ!", false); return; }

        let fd = new FormData();
        fd.append('type_sell', 'currency');
        fd.append('amount_lt', sl);
        fd.append('rate', tyGia);

        fetch('api/sell_auction.php', { method: 'POST', body: fd }).then(res => res.json()).then(data => {
            if (data.status === 'success') {
                box.style.display = 'none';
                window.hienThongBaoGame("✔️ Đã treo Linh Thạch lên sàn thành công!", true);
                window.moChoDen();
            } else { window.hienThongBaoGame("❌ Lỗi: " + data.msg, false); }
        });
    };
};

// 2. Form Mua Một Phần Linh Thạch
window.muaLinhThachSLL = function(aucId, maxLT, rate) {
    let box = document.getElementById('gameCurrencyBox'); // Dùng chung div nền
    if (!box) {
        box = document.createElement('div'); box.id = 'gameCurrencyBox';
        box.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:1000009; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);';
        document.body.appendChild(box);
    }

    box.innerHTML = `
        <div style="width: 450px; background: linear-gradient(135deg, #4a0e0e 0%, #000 100%); border: 2px solid gold; border-radius: 10px; padding: 25px; box-shadow: 0 0 40px rgba(255,215,0,0.4);">
            <h2 style="color: gold; text-align:center; margin: 0 0 10px 0; text-transform: uppercase;">MUA LINH THẠCH</h2>
            <p style="color:#aaa; text-align:center; font-size:12px; margin-bottom:20px;">Tỷ giá lô này: <b style="color:#fff;">1 LT = ${rate.toLocaleString('vi-VN')} Vàng</b></p>
            
            <label style="color:#fff; font-size:12px; font-weight:bold;">SỐ LƯỢNG MUỐN MUA (Tối đa: ${maxLT.toLocaleString('vi-VN')} LT):</label>
            <input type="number" id="inpBuyAmount" value="${maxLT}" max="${maxLT}" style="width:100%; box-sizing:border-box; padding:12px; font-size:24px; font-weight:bold; text-align:center; color:#00ffcc; background:#000; border:2px solid #00ffcc; border-radius:5px; margin-top:5px; outline:none;">
            
            <div style="background:#111; border:1px dashed #555; padding:15px; border-radius:5px; margin:top:15px; margin-bottom:20px; text-align:center; margin-top:15px;">
                <span style="color:#aaa; font-size:12px;">TỔNG VÀNG CẦN TRẢ:</span><br>
                <span id="txtTongTra" style="color:gold; font-size:30px; font-weight:900; text-shadow:0 0 10px gold;">${(maxLT * rate).toLocaleString('vi-VN')}</span>
            </div>

            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="btnXacNhanMuaLT" style="flex: 1; background: linear-gradient(90deg, #d35400, #e67e22); color: #fff; font-weight: 900; font-size: 16px; border: none; padding: 12px; border-radius: 5px; cursor: pointer; box-shadow: 0 0 15px rgba(230,126,34,0.5);">🛒 KHỚP LỆNH MUA</button>
                <button onclick="document.getElementById('gameCurrencyBox').style.display='none'" style="flex: 1; background: #555; color: #fff; font-weight: bold; font-size: 16px; border: none; padding: 12px; border-radius: 5px; cursor: pointer;">HỦY BỎ</button>
            </div>
        </div>
    `;
    box.style.display = 'flex';

    let inpBuy = document.getElementById('inpBuyAmount');
    let txtTra = document.getElementById('txtTongTra');

    inpBuy.addEventListener('input', function() {
        let sl = parseInt(inpBuy.value) || 0;
        if (sl > maxLT) { sl = maxLT; inpBuy.value = maxLT; } // Ép không cho mua lố
        txtTra.innerText = (sl * rate).toLocaleString('vi-VN');
    });

    document.getElementById('btnXacNhanMuaLT').onclick = function() {
        let sl = parseInt(inpBuy.value);
        if (!sl || sl <= 0 || sl > maxLT) { window.hienThongBaoGame("❌ Số lượng không hợp lệ!", false); return; }

        let fd = new FormData();
        fd.append('auction_id', aucId);
        fd.append('buy_amount', sl);

        fetch('api/buy_auction.php', { method: 'POST', body: fd }).then(res => res.json()).then(data => {
            if (data.status === 'success') {
                box.style.display = 'none';
                window.hienThongBaoGame("✔️ Khớp lệnh thành công!", true);
                window.moChoDen();
            } else { window.hienThongBaoGame("❌ Lỗi: " + data.msg, false); }
        });
    };
};

// 3. Hủy Bán Rút Đồ/Linh Thạch Về
window.huyTreoChoDen = function(aucId) {
    window.hienXacNhanGame("Sếp muốn HỦY GIAO DỊCH và rút hàng về?", function() {
        let fd = new FormData(); fd.append('auction_id', aucId);
        fetch('api/cancel_auction.php', { method: 'POST', body: fd }).then(res => res.json()).then(data => {
            if(data.status === 'success') {
                window.hienThongBaoGame("✔️ Đã rút hàng về túi / ví!", true);
                window.moChoDen();
            } else { window.hienThongBaoGame("❌ Lỗi: " + data.msg, false); }
        });
    });
};








// ==========================================
// 🌟 HÀM THẦN THÁNH: CẬP NHẬT 3D LÊN NGƯỜI NGAY LẬP TỨC KHÔNG CẦN F5 (CHỐNG LỖI TO BẰNG VŨ TRỤ)
// ==========================================
window.capNhatTrangBi3DNgayLapTuc = function (itemType, url3D, capDoDap = 0) {
    if (!window.nhanVatChinh) return;

    if (itemType === 'model' || itemType === 'mount') {
        // Đối với Skin và Thú cưỡi, hệ thống xương quá phức tạp, bắt buộc phải F5 để tái tạo cấu trúc chuẩn
        window.hienThongBaoGame("✨ Đang tái tạo hình thể và Tọa kỵ, xin chờ giây lát...", true);
        setTimeout(() => location.reload(), 1500);
        return;
    }

    if (url3D === '') {
        // Tháo vũ khí
        if (itemType === 'weapon' && window.vuKhiModel) {
            window.vuKhiModel.visible = false;
            if (window.vuKhiModel.parent) window.vuKhiModel.parent.remove(window.vuKhiModel);
            window.vuKhiModel = null;
        }
        if (itemType === 'weapon2' && window.HePhaiHienTai && typeof window.HePhaiHienTai.khoiTao === 'function') {
            window.WEAPON2_URL = '';
            if (window.cungTrenTay && window.cungTrenTay.parent) window.cungTrenTay.parent.remove(window.cungTrenTay);
            if (window.sungXungKich && window.sungXungKich.parent) window.sungXungKich.parent.remove(window.sungXungKich);
            if (window.truongHoThe && window.truongHoThe.parent) window.truongHoThe.parent.remove(window.truongHoThe);
        }
        return;
    }

    // 🌟 MẶC VŨ KHÍ CHÍNH (KIẾM, GẬY...)
    if (itemType === 'weapon') {
        window.WEAPON_URL = url3D;
        window.WEAPON_LEVEL = capDoDap;



        // 🛑 LÁ CHẮN TÚI ĐỒ: Nếu là phái đặc thù hoặc Hộ Thể, cấm nạp mẫu 3D này lên xương tay phải!
        let checkScript = (window.SCRIPT_PHAI_CUA_TOI || "").toLowerCase();
        let checkCodePhai = (window.FACTION_CODE || "").toLowerCase();
        let checkTenChay = (window.HePhaiHienTai && window.HePhaiHienTai.tenPhai || "").toLowerCase();
        if (
            checkScript.includes('tutien') || checkScript.includes('cungthu') || checkScript.includes('phapsu') || checkScript.includes('bansung') ||
            checkCodePhai.includes('tu_tien') || checkCodePhai.includes('cung_ten') || checkCodePhai.includes('phap_su') || checkCodePhai.includes('sung_dan') ||
            checkTenChay.includes('tu tiên') || checkTenChay.includes('cung thủ') || checkTenChay.includes('pháp sư')
        ) {
            console.log("🛑 ui_logic: Đã chặn hiển thị vũ khí lên xương tay (Hệ phái dùng vũ khí đặc thù hoặc Hộ Thể)!");
            return;
        }




        if (window.vuKhiModel && window.vuKhiModel.parent) {
            window.vuKhiModel.parent.remove(window.vuKhiModel);
            if (typeof window.donRac3D === 'function') window.donRac3D(window.vuKhiModel);
        }

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(url3D, (vuKhi) => {
                window.vuKhiModel = vuKhi;

                // 🌟 THUẬT TOÁN ĐO KÍCH THƯỚC CHỐNG LỖI TO BẰNG VŨ TRỤ
                vuKhi.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(vuKhi);
                const size = new THREE.Vector3(); box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);

                // Thu nhỏ vũ khí về kích thước 1.2 mét chuẩn
                if (maxDim > 0.05) {
                    let tyLe = 1.2 / maxDim;
                    vuKhi.scale.set(tyLe, tyLe, tyLe);
                }

                let tayCam = null;
                window.nhanVatChinh.traverse(c => {
                    if (c.isBone && (c.name.toUpperCase().includes('HAND_R') || c.name.toUpperCase().includes('HAND_L'))) {
                        tayCam = c;
                    }
                });

                if (tayCam) {
                    tayCam.add(vuKhi);
                    vuKhi.position.set(0, 0, 0);
                    vuKhi.rotation.set(0, 0, 0);
                } else {
                    window.nhanVatChinh.add(vuKhi);
                    vuKhi.position.set(1, 1, 0);
                }

                if (capDoDap > 0 && typeof window.bocHaoQuang3D === 'function') {
                    window.bocHaoQuang3D(vuKhi, capDoDap);
                }
            });
        }
    }
    // 🌟 MẶC VŨ KHÍ PHỤ (CUNG, SÚNG, TRƯỢNG...)
    else if (itemType === 'weapon2') {
        window.WEAPON2_URL = url3D;

        // Dọn vũ khí 2 cũ đang cầm
        if (window.cungTrenTay && window.cungTrenTay.parent) window.cungTrenTay.parent.remove(window.cungTrenTay);
        if (window.sungXungKich && window.sungXungKich.parent) window.sungXungKich.parent.remove(window.sungXungKich);
        if (window.truongHoThe && window.truongHoThe.parent) window.truongHoThe.parent.remove(window.truongHoThe);

        // Gọi lại hàm khởi tạo của Hệ Phái hiện tại để nó tự động load và nắn bóp vũ khí 2 mới
        if (window.HePhaiHienTai && typeof window.HePhaiHienTai.khoiTao === 'function') {
            window.HePhaiHienTai.khoiTao();
        }
    }
};
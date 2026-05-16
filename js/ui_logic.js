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













// Hàm gọi API load túi đồ
window.moTuiDoVIP = function() {
    const modal = document.getElementById('inventoryModal');
    if (modal) modal.style.display = 'flex';
    document.getElementById('invGrid').innerHTML = '<div style="color:#00e5ff; grid-column:1/-1; text-align:center; padding:20px; font-weight:bold;">Đang quét Không gian Giới Chỉ...</div>';
    
    fetch('api/get_inventory.php')
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            window.khoDoData = data.data;
            document.getElementById('gameGoldUI').innerText = parseInt(data.game_gold).toLocaleString();
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
// 📸 STUDIO CHỤP ẢNH TỰ ĐỘNG (BẢN V17 - HÀNG ĐỢI XẾP HÀNG & CHỐNG ẢNH MÙ)
// ==========================================
window.thumb3D = window.thumb3D || { queue: [], isProcessing: false, scene: null, cam: null, renderer: null };
window.THUMBNAIL_CACHE = window.THUMBNAIL_CACHE || {};

window.taoThuNho3D = function(url, loaiDo, imgId) {
    if (!url) return;

    // Hàm tiện ích: Dán ảnh và giấu Emoji
    function anEmojiHienAnh(srcData) {
        let imgEl = document.getElementById(imgId);
        let emj = document.getElementById('emoji_' + imgId);
        if(imgEl) { imgEl.src = srcData; imgEl.style.opacity = 1; }
        if(emj) emj.style.opacity = 0;
    }

    // 1. ĐÃ CÓ ẢNH TRONG KHO -> XÀI NGAY!
    if (window.THUMBNAIL_CACHE[url] && window.THUMBNAIL_CACHE[url] !== 'LOADING') {
        anEmojiHienAnh(window.THUMBNAIL_CACHE[url]);
        return;
    }

    // 2. CHƯA CÓ ẢNH VÀ ĐANG CHỤP -> NGỒI CHỜ LẤY ẢNH KÉ (100ms kiểm tra 1 lần)
    let checkCache = setInterval(() => {
        if (window.THUMBNAIL_CACHE[url] && window.THUMBNAIL_CACHE[url] !== 'LOADING') {
            clearInterval(checkCache);
            anEmojiHienAnh(window.THUMBNAIL_CACHE[url]);
        }
    }, 100);

    // 3. NẾU CHƯA AI YÊU CẦU CHỤP MÓN NÀY -> ĐƯA VÀO HÀNG ĐỢI!
    if (!window.THUMBNAIL_CACHE[url]) {
        window.THUMBNAIL_CACHE[url] = 'LOADING'; // Đánh dấu đã nhận lịch
        window.thumb3D.queue.push({ url: url, loaiDo: loaiDo });
        window.xuLyHangDoiChupAnh();
    }
};




// 📸 NHIẾP ẢNH GIA XỬ LÝ HÀNG ĐỢI TỪNG NGƯỜI MỘT (FIX CĂN GIỮA TUYỆT ĐỐI)
window.xuLyHangDoiChupAnh = function() {
    if (window.thumb3D.isProcessing || window.thumb3D.queue.length === 0) return;
    window.thumb3D.isProcessing = true;

    let task = window.thumb3D.queue.shift();
    let url = task.url;
    let loaiDo = task.loaiDo;

    if (!window.thumb3D.renderer) {
        let canvas = document.createElement('canvas');
        window.thumb3D.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
        window.thumb3D.renderer.setSize(256, 256); 
        window.thumb3D.renderer.outputEncoding = THREE.sRGBEncoding;
        
        window.thumb3D.scene = new THREE.Scene();
        window.thumb3D.scene.add(new THREE.AmbientLight(0xffffff, 1.2));
        let dLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dLight.position.set(10, 20, 15);
        window.thumb3D.scene.add(dLight);

        window.thumb3D.cam = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        window.thumb3D.cam.position.set(0, 0, 15);
        window.thumb3D.cam.lookAt(0, 0, 0);
    }

    if (typeof window.taiHoacNhanBanAsset === 'function') {
        window.taiHoacNhanBanAsset(url, (model) => {
            // 🌟 TẠO HỘP PIVOT ĐỂ QUAY QUANH TÂM ẢNH
            let pivot = new THREE.Group();
            window.thumb3D.scene.add(pivot);
            pivot.add(model);

            model.updateMatrixWorld(true);
            const bbox = new THREE.Box3().setFromObject(model);
            const size = bbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) || 1;

            let scale = 8.5 / maxDim; 
            if (loaiDo === 'weapon' || loaiDo === 'weapon2') scale = 11.5 / maxDim; 
            model.scale.setScalar(scale);

            // 🌟 CĂN TÂM CHUẨN XÁC SAU KHI THU PHÓNG
            model.updateMatrixWorld(true);
            const bboxScaled = new THREE.Box3().setFromObject(model);
            const centerScaled = bboxScaled.getCenter(new THREE.Vector3());

            // Kéo lùi mô hình về để "Trọng tâm Bounding Box" lọt đúng vào lõi (0,0,0) của Pivot
            model.position.x -= centerScaled.x;
            model.position.y -= centerScaled.y;
            model.position.z -= centerScaled.z;

            // 🌟 CHÌA KHÓA: BÂY GIỜ TA CHỈ ĐƯỢC XOAY CÁI HỘP PIVOT CHỨ KHÔNG XOAY MODEL
            if (loaiDo === 'weapon' || loaiDo === 'weapon2') {
                pivot.rotation.set(Math.PI / 4, 0, Math.PI / 6); 
            } else if (loaiDo === 'mount' || loaiDo === 'model') {
                pivot.rotation.set(0, -Math.PI / 6, 0); 
            }

            setTimeout(() => {
                window.thumb3D.renderer.render(window.thumb3D.scene, window.thumb3D.cam);
                let dataURL = window.thumb3D.renderer.domElement.toDataURL('image/png');
                
                window.THUMBNAIL_CACHE[url] = dataURL;
                window.thumb3D.scene.remove(pivot); // Xóa cái hộp đi là sạch sẽ
                
                window.thumb3D.isProcessing = false;
                window.xuLyHangDoiChupAnh();
            }, 100); 
        });
    } else {
        window.THUMBNAIL_CACHE[url] = 'ERROR';
        window.thumb3D.isProcessing = false;
        window.xuLyHangDoiChupAnh();
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






            
            danhSachCanChup.push({ url: item.model_url, type: item.item_type, id: imgId });
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
                window.taoThuNho3D(task.url, task.type, task.id);
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


    // 🌟 RÚT GỌN TÊN VÀ HỆ YÊU CẦU CHO ĐẸP VÀ VỪA VẶN
    let lvl = parseInt(item.upgrade_level) || 0;
    let tenHienThi = lvl > 0 ? `${item.name} [+${lvl}]` : item.name;

    detailBox.innerHTML = `
        <h3 style="color:${isEq ? 'gold' : '#00e5ff'}; margin:0 0 5px 0; text-transform:uppercase; font-size: 16px; text-shadow: 0 0 5px ${isEq ? 'gold' : 'cyan'};">${tenHienThi}</h3>


        <p style="color:#ff007f; font-weight:bold; margin:0 0 10px 0; font-size:11px;">Hệ: ${item.required_class === 'ALL' ? 'Dùng Chung' : item.required_class}</p>
        
        <div style="background:rgba(0,0,0,0.5); padding:8px 12px; border-radius:5px; text-align:left; font-size:12px; margin-bottom:15px; border:1px solid #333; color: #ccc;">
            <div style="margin-bottom:3px;">⚔️ Tấn Công: <span style="color:#ff3333; float:right; font-weight:bold;">+${item.bonus_damage || 0}</span></div>
            <div>❤️ Sinh Lực: <span style="color:#2ecc71; float:right; font-weight:bold;">+${item.bonus_hp || 0}</span></div>
        </div>
        
        ${btnHanhDong}
        ${btnBanRac}
    `;

    // 🌟 KÍCH HOẠT MÁY CHIẾU 3D
    hienThi3DTrongTui(item.model_url, item.item_type);
};











// 🌟 BỘ MÁY ĐÚC 3D TRONG TÚI ĐỒ (ĐÃ FIX GÓC XOAY ĐẸP NHƯ LÂM TỲ CÁC)
function hienThi3DTrongTui(url, loaiDo) {
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

        function animateInv() {
            window.inv3D.reqId = requestAnimationFrame(animateInv);
            let delta = window.inv3D.clock.getDelta();
            if (window.inv3D.mixer) window.inv3D.mixer.update(delta);

            // 🌟 QUAY CÁI HỘP PIVOT CHỨ KHÔNG QUAY MODEL TRỰC TIẾP
            if (window.inv3D.pivot) window.inv3D.pivot.rotation.y += 0.015;

            window.inv3D.renderer.render(window.inv3D.scene, window.inv3D.cam);
        }
        animateInv();
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
            window.inv3D.mixer.clipAction(gltf.animations[0]).play();
        }

        model.scale.setScalar(1);
        model.position.set(0, 0, 0);
        model.updateMatrixWorld(true);

        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const center = bbox.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;

        let scale = 16 / maxDim;
        if (loaiDo === 'weapon' || loaiDo === 'weapon2') scale = 22 / maxDim;
        model.scale.setScalar(scale);

        model.updateMatrixWorld(true);
        const bboxScaled = new THREE.Box3().setFromObject(model);
        const centerScaled = bboxScaled.getCenter(new THREE.Vector3());

        model.position.x -= centerScaled.x;
        model.position.y -= centerScaled.y;
        model.position.z -= centerScaled.z;





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

        loading.style.display = 'none';



        



    });
}






// 🌟 THUẬT TOÁN KIỂM TRA PHÁI VÀ THAY ĐỒ
window.thucHienHanhDongTrangBi = function(invId, action) {
    if (action === 'equip') {
        let item = window.khoDoData.find(i => i.inv_id == invId);
        if (item && item.required_class !== 'ALL' && window.FACTION_CODE && item.required_class !== window.FACTION_CODE) {
            alert(`⚠️ Tẩu hỏa nhập ma! Pháp bảo này chứa sức mạnh của hệ [${item.required_class}], cơ thể bạn không chịu nổi!`);
            return;
        }
    }

    fetch('api/toggle_equip.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ inv_id: invId, action: action })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            location.reload();
        } else alert("Lỗi thay đồ!");
    });
};

// 🌟 THUẬT TOÁN BÁN RÁC (PHÂN RÃ)
window.banRacPhiShop = function(invId) {
    if(!confirm("♻️ Bạn có chắc muốn ném món này vào Lò Bát Quái để phân rã lấy Linh thạch không? Mất vĩnh viễn đó nha!")) return;
    
    fetch('api/sell_item.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ inv_id: invId })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            if (typeof window.taoSoSatThuong === 'function') window.taoSoSatThuong(window.playerModel.position.clone().add(new THREE.Vector3(0,5,0)), `+${data.gold_earned} LINH THẠCH`, "gold");
            window.moTuiDoVIP(); 
        } else alert(data.msg);
    });
};








// 🌟 THUẬT TOÁN TREO BÁN LÊN CHỢ ĐEN
window.treoBanChoden = function(invId) {
    let giaBan = prompt("⚖️ Nhập số Linh Thạch (Vàng) bạn muốn bán món này (Thuế chợ 5%):", "10000");
    if (giaBan === null || giaBan.trim() === "") return;
    
    let parsedGia = parseInt(giaBan.replace(/\D/g, '')); // Lọc lấy số
    if (isNaN(parsedGia) || parsedGia <= 0) { alert("❌ Giá không hợp lệ!"); return; }

    if(!confirm(`Bạn sẽ treo bán món này với giá ${parsedGia.toLocaleString()} Vàng?\nThuế giao dịch 5% sẽ được trừ khi có người mua.`)) return;

    let fd = new FormData();
    fd.append('inv_id', invId);
    fd.append('price_gold', parsedGia);

    fetch('api/sell_auction.php', { method: 'POST', body: fd })
    .then(res => res.json()).then(data => {
        if(data.status === 'success') {
            alert("✔️ Đã ném đồ lên Chợ Đen thành công!");
            window.moTuiDoVIP(); // Cập nhật lại túi đồ
        } else alert("❌ Lỗi: " + data.msg);
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

window.chuyenTabLo = function(tabName, btnEl) {
    document.querySelectorAll('.tabLoBtn').forEach(b => { b.style.background = '#222'; b.style.color = '#aaa'; });
    btnEl.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)'; btnEl.style.color = 'white';
    document.getElementById('tabDapDo').style.display = (tabName === 'DAP_DO') ? 'flex' : 'none';
    document.getElementById('tabGhepDa').style.display = (tabName === 'GHEP_DA') ? 'block' : 'none';
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
                
            danhSachCanChup.push({ url: item.model_url, type: item.item_type, id: imgId });
        }
    });
    
    if (!coDo) grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#555; margin-top:50px;">Không có vật phẩm phù hợp...</div>';

    setTimeout(() => {
        danhSachCanChup.forEach(task => {
            if(typeof window.taoThuNho3D === 'function') window.taoThuNho3D(task.url, task.type, task.id);
        });
    }, 10);
};

// 4. Nhặt đồ bỏ vào lò
window.duaDoVaoLo = function(item) {
    if (item.item_type === 'material') {
        let idx = window.loRenData.stones.findIndex(s => s === null);
        if (idx !== -1) window.loRenData.stones[idx] = item;
        else alert("Lò rèn đã đầy Tinh Thạch! Hãy tháo bớt ra.");
    } else {
        if (window.loRenData.item !== null) {
            alert("Đã có vật phẩm trong lò! Hãy tháo ra trước.");
            return;
        }
        let lvl = parseInt(item.upgrade_level) || 0;
        if (lvl >= 15) {
            alert("✨ Pháp bảo này đã đạt Cảnh Giới Tối Đa (Chí Tôn +15), không thể luyện hóa thêm!");
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

// 6. THUẬT TOÁN TÍNH TỶ LỆ % VÀ CHI PHÍ (CHUẨN KIẾM THẾ)
window.capNhatGiaoDienLo = function() {
    let slotTrungTam = document.getElementById('forgeItemSlot');
    let danhSachCanChup = [];

    // --- VẼ Ô VŨ KHÍ ---
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
        danhSachCanChup.push({ url: it.model_url, type: it.item_type, id: imgId });
    } else {
        slotTrungTam.innerHTML = `<span style="color:#555;">+</span>`;
    }

    // --- VẼ 6 Ô TINH THẠCH ---
    let tongDiemDa = 0;
    for (let i = 0; i < 6; i++) {
        let sSlot = document.getElementById('fStone_' + i);
        let stone = window.loRenData.stones[i];
        if (stone) {
            // Đọc số Cấp từ tên (VD: "Tinh Thạch Cấp 2" -> 2)
            let capDaMatch = stone.name.match(/\d+/);
            let capDa = capDaMatch ? parseInt(capDaMatch[0]) : 1;
            
            // Công thức điểm Cấp số nhân: Cấp 1 = 10đ, Cấp 2 = 30đ, Cấp 3 = 90đ...
            let diem = Math.pow(3, capDa - 1) * 10;
            tongDiemDa += diem;

            let imgId = 'thumb_lo_stone_' + i;
            sSlot.innerHTML = `
                <div style="position:absolute; bottom:2px; right:2px; color:#fff; font-size:10px; font-weight:bold; z-index:10; background:rgba(0,0,0,0.5); padding:1px 3px; border-radius:2px;">C${capDa}</div>
                <div style="position:relative; width:100%; height:100%; display:flex; justify-content:center; align-items:center;">
                    <div id="emoji_${imgId}" style="position:absolute; font-size:24px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); transition:0.3s;">💎</div>
                    <img id="${imgId}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute; width: 80%; height: 80%; object-fit: contain; z-index:2; filter: drop-shadow(0 0 5px rgba(0,229,255,0.8)); transition: opacity 0.5s; opacity: 0;">
                </div>
            `;
            danhSachCanChup.push({ url: stone.model_url, type: stone.item_type, id: imgId });
        } else {
            sSlot.innerHTML = '';
        }
    }

    // --- TÍNH TOÁN % VÀ CHI PHÍ LẠM PHÁT ---
    let rateUI = document.getElementById('forgeSuccessRate');
    let barUI = document.getElementById('forgeRateBar');
    let costUI = document.getElementById('forgeCost');

    if (!window.loRenData.item) {
        rateUI.innerText = "0%"; rateUI.style.color = "#555";
        barUI.style.width = "0%"; barUI.style.background = "#555";
        costUI.innerText = "0";
    } else {
        let lvl = parseInt(window.loRenData.item.upgrade_level) || 0;
        let priceGoc = parseInt(window.loRenData.item.price) || 10000;
        
        let diemYeuCau = 0;
        let tiLeToiDa = 100; // Khóa mốc an toàn
        
        // 🟢 Cấp 1 -> 5: An Toàn. Max 100%. (VD lên +1 cần 20đ = 2 viên Cấp 1)
        if (lvl < 5) { diemYeuCau = (lvl + 1) * 20; tiLeToiDa = 100; }        
        // 🟡 Cấp 6 -> 10: Chuyên Nghiệp. Rớt 1 cấp. Max 50%.
        else if (lvl < 10) { diemYeuCau = (lvl + 1) * 50; tiLeToiDa = 50; }  
        // 🔴 Cấp 11 -> 15: Chí Tôn. Rớt về 10. Max 15%.
        else { diemYeuCau = (lvl + 1) * 200; tiLeToiDa = 15; }               

        // Tính tỷ lệ % (Ép xuống giới hạn Max)
        let phanTram = (tongDiemDa / diemYeuCau) * 100;
        if (phanTram > tiLeToiDa) phanTram = tiLeToiDa; 

        // Tính thuế lạm phát: Đồ càng đắt + Cấp càng cao = Càng tốn nhiều Vàng
        let chiPhi = Math.floor(priceGoc * (lvl + 1) * 0.1);
        if (chiPhi < 1000) chiPhi = 1000;

        // Vẽ lên UI
        rateUI.innerText = phanTram.toFixed(1) + "%";
        barUI.style.width = phanTram + "%";
        costUI.innerText = chiPhi.toLocaleString();

        if (phanTram < 15) { rateUI.style.color = "#e74c3c"; barUI.style.background = "linear-gradient(90deg, #c0392b, #e74c3c)"; }
        else if (phanTram < 50) { rateUI.style.color = "#f1c40f"; barUI.style.background = "linear-gradient(90deg, #e67e22, #f1c40f)"; }
        else { rateUI.style.color = "#2ecc71"; barUI.style.background = "linear-gradient(90deg, #27ae60, #2ecc71)"; }
    }

    // Ra lệnh Studio chụp ảnh (Chống đè frame)
    setTimeout(() => {
        danhSachCanChup.forEach(task => {
            if(typeof window.taoThuNho3D === 'function') window.taoThuNho3D(task.url, task.type, task.id);
        });
    }, 50);
};


// 7. NỐI DÂY VÀO SERVER ĐỂ KHAI LÒ
window.tienHanhDapDo = function() {
    if (!window.loRenData.item) {
        alert("❌ Sếp chưa bỏ Pháp Bảo vào lò!");
        return;
    }
    
    let stoneIds = [];
    window.loRenData.stones.forEach(s => {
        if (s) stoneIds.push(s.inv_id); // Nhặt ID của mấy cục đá
    });
    
    if (stoneIds.length === 0) {
        if (!confirm("⚠️ Sếp không bỏ Tinh Thạch nào vào lò, tỷ lệ thành công là 0%. Sếp vẫn muốn đập (chỉ tốn Vàng)?")) return;
    } else {
        if (!confirm("🔥 Xác nhận khai hỏa Lò Bát Quái? Tinh thạch sẽ bị thiêu rụi!")) return;
    }
    
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
            // Cập nhật ví Vàng ngay lập tức
            let goldUI = document.getElementById('gameGoldUI');
            if (goldUI) goldUI.innerText = parseInt(data.new_gold).toLocaleString();
            
            // Lấy tọa độ đỉnh đầu người chơi để thả chữ
            let charPos = (typeof window.playerModel !== 'undefined' && window.playerModel) ? window.playerModel.position.clone() : new THREE.Vector3(0,0,0);
            charPos.y += 5;
            
            // 🌟 HIỆU ỨNG THÀNH BẠI
            if (data.result === 'SUCCESS') {
                if (typeof window.taoChuNoiGacha === 'function') window.taoChuNoiGacha(charPos, "✨ NÂNG CẤP THÀNH CÔNG! ✨", "#2ecc71");
                if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(charPos, 15, 0x2ecc71); // Nổ sáng xanh lá
            } else {
                let msgFail = "❌ NÂNG CẤP THẤT BẠI!";
                if (data.drop_level) msgFail = "📉 THẤT BẠI - BỊ RỚT CẤP!";
                if (typeof window.taoChuNoiGacha === 'function') window.taoChuNoiGacha(charPos, msgFail, "#e74c3c");
                if (typeof window.taoHieuUngNo === 'function') window.taoHieuUngNo(charPos, 15, 0xe74c3c); // Nổ xịt đỏ
            }
            
            // Xóa sạch đá trong Lò vì đã bị đốt cháy
            window.loRenData.stones = [null, null, null, null, null, null];
            
            // Đóng cửa sổ và mở lại để Tải lại kho đồ mới nhất từ Server
            document.getElementById('forgeModal').style.display = 'none';
            window.moLoBatQuai(); 
            
        } else {
            alert("❌ Lỗi Lò Rèn: " + data.msg);
        }
    })
    .catch(e => {
        btn.disabled = false;
        btn.innerText = "🔨 ĐẬP ĐỒ";
        alert("Lỗi kết nối đến Server!");
    });
};
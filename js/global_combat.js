// ==========================================
// 🌐 MODULE: QUẢN LÝ CHIẾU THỨC & SINH TỬ TOÀN CỤC (BẢN V2 - CHUẨN AAA)
// ==========================================
console.log("🚀 Khởi động Bộ Não Quản Lý Toàn Cục...");

window.danhSachChieuThucToanMap = []; // Thùng chứa mọi chiêu thức đang bay

// 1. HÀM ĐĂNG KÝ CHIẾU THỨC (Bất cứ phái nào cũng phải báo cáo vào đây)
window.dangKyChieuThuc = function (mesh, lifetime = 3000, onUpdate = null) {
    window.danhSachChieuThucToanMap.push({
        mesh: mesh,
        deathTime: Date.now() + lifetime,
        update: onUpdate
    });
};

// 2. VÒNG LẶP DỌN RÁC & CẬP NHẬT ĐƯỜNG BAY (Chạy vĩnh viễn)
function loopQuanLyToanCuc() {
    requestAnimationFrame(loopQuanLyToanCuc);
    const now = Date.now();

    for (let i = window.danhSachChieuThucToanMap.length - 1; i >= 0; i--) {
        let item = window.danhSachChieuThucToanMap[i];

        // A. Cập nhật đường bay (Nếu có hàm update riêng)
        if (typeof item.update === 'function') {
            item.update();
        }

        // B. Kiểm tra thời gian sống để dọn rác
        if (now > item.deathTime) {
            if (item.mesh) {
                if (item.mesh.parent) item.mesh.parent.remove(item.mesh);
                // Xóa cả trong scene nếu mesh bị kẹt
                if (typeof scene !== 'undefined') scene.remove(item.mesh);
            }
            window.danhSachChieuThucToanMap.splice(i, 1);
        }
    }
}
loopQuanLyToanCuc();

// 3. HÀM XỬ LÝ BOSS CHẾT (Dùng chung cho mọi người chơi)
window.globalHandleBossDeath = function (boss) {
    if (!boss || boss.isDead) return;
    boss.isDead = true;
    boss.hp = 0;
    boss.state = 'DEAD';

    if (typeof boss.playAnim === 'function') boss.playAnim('DIE');
    if (boss.tagEl) boss.tagEl.style.display = 'none';

    // Sau 3 giây gục ngã -> Tàng hình xác
    setTimeout(() => { if (boss.mesh) boss.mesh.visible = false; }, 3000);

    // Báo hồi sinh lên Server
    setTimeout(() => {
        let fd = new FormData(); fd.append('boss_id', boss.id);
        fetch('api/hoi_sinh_boss.php', { method: 'POST', body: fd })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    boss.hp = boss.maxHp; boss.isDead = false; boss.state = 'IDLE';
                    if (boss.mesh) { boss.mesh.visible = true; boss.mesh.position.set(boss.spawnX, boss.mesh.position.y, boss.spawnZ); }
                    if (typeof boss.playAnim === 'function') boss.playAnim('IDLE');
                    if (boss.tagEl) {
                        let bar = boss.tagEl.querySelector('.hp-bar');
                        if (bar) bar.style.width = '100%';
                        boss.tagEl.style.display = 'block';
                    }
                }
            });
    }, 30000);
};


// ==========================================
// 🏆 HỆ THỐNG VINH DANH ĐỒ SÁT (PVP)
// ==========================================
window.vinhDanhDoSat = function (victimName, victimLevel) {
    let expCuopDuoc = (victimLevel || 1) * 20;

    // 1. Bơm EXP vào Server
    if (typeof window.congKinhNghiem === 'function') {
        window.congKinhNghiem(expCuopDuoc, victimLevel);
    }

    // Gửi báo cáo tiến độ Nhiệm vụ PK
    let fd = new FormData();
    fd.append('victim', victimName);
    fetch('api/update_pk_quest.php', { method: 'POST', body: fd })
        .then(res => res.json())
        .then(data => {}).catch(err => console.error("Lỗi cập nhật nhiệm vụ PK:", err));

    // 2. Hiển thị UI Vinh Danh
    const killNoti = document.getElementById('killNotification');
    const victimDisplay = document.getElementById('victimNameDisplay');
    const expDisplay = document.getElementById('killExpDisplay');

    if (killNoti && victimDisplay && expDisplay) {
        victimDisplay.innerText = victimName;
        expDisplay.innerText = expCuopDuoc.toLocaleString(); 

        killNoti.style.display = 'block';
        killNoti.style.animation = 'none';
        void killNoti.offsetWidth;
        killNoti.style.animation = 'hienRaThuNho 0.5s ease-out forwards';

        setTimeout(() => { killNoti.style.display = 'none'; }, 4000);
    }
};

// ==========================================
// 🩸 CỔNG SÁT THƯƠNG: BOSS -> NGƯỜI CHƠI
// ==========================================
window.gaySatThuongBossToPlayer = function (tamNo, luongDame, banKinh) {
    if (!window.playerModel || window.isDead) return;

    // LÁ CHẮN BẤT TỬ CỦA SAFE ZONE
    if (window.IS_IN_SAFE_ZONE) return;

    let tamNguc = window.playerModel.position.clone(); tamNguc.y += 5;
    
    if (tamNo.distanceTo(tamNguc) <= banKinh) {
        window.mauBanThan -= luongDame;
        if (typeof taoSoSatThuong === 'function') taoSoSatThuong(tamNguc, luongDame, '#ff0000');
        
        const uiThanhMau = document.getElementById('thanhMauHienTai'); 
        const uiSoMau = document.getElementById('soMauHienTai');
        
        if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
        if (uiSoMau) uiSoMau.innerText = Math.max(0, Math.round(window.mauBanThan)).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
        
        if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') window.xuLyCaiChetNhanVat("Bị Quái Vật Hạ Gục");
    }
};


// ==========================================
// 📡 MÁY QUÉT X-QUANG CHUẨN AAA (TÌM NGỰC & HITBOX V4)
// ==========================================
// 🌟 ĐÃ TÍCH HỢP BÊN TRONG: Cấm dùng thủ thuật ghi đè cũ gây đứt gãy
window.layHitbox = function (mesh) {
    if (!mesh) return { tamNguc: new THREE.Vector3(), banKinh: 10, chieuCao: 10 };
    
    // Tự động tính chieuCao nếu chưa có
    if (!mesh.chieuCao) {
        let box = new THREE.Box3().setFromObject(mesh);
        mesh.chieuCao = (box.max.y - box.min.y);
        mesh.chieuRong = (box.max.x - box.min.x);
    }

    let footPos = mesh.position.clone();
    let upV = mesh.up ? mesh.up.clone().normalize() : new THREE.Vector3(0, 1, 0);

    let isMount = false;
    mesh.traverse(c => { if (c.name && c.name.toUpperCase().includes('YENNGUA')) isMount = true; });

    let chieuCaoThuc = mesh.chieuCao;
    if (isMount) chieuCaoThuc = Math.max(chieuCaoThuc, 4.5);
    else chieuCaoThuc = Math.max(chieuCaoThuc, 2.5);

    let chieuRongThuc = mesh.chieuRong || 3.0;

    let tamNguc = footPos.clone().add(upV.multiplyScalar(chieuCaoThuc / 2));

    // 🛡️ BẢN VÁ LÁ CHẮN TỔ ĐỘI: GIẤU HITBOX CỦA ĐỒNG ĐỘI (CHỐNG AUTO-AIM)
    if (mesh.userData && mesh.userData.isAlly) {
        tamNguc.set(999999, 999999, 999999);
    }

    return { tamNguc: tamNguc, banKinh: chieuRongThuc / 2, chieuCao: chieuCaoThuc };
};


// ==========================================
// 🛡️ BỘ LỌC RÁC DOM TỐI THƯỢNG CHO MOBILE (CỨU CPU)
// ==========================================
if (window.isMobile) {
    const originalAppendChild = document.body.appendChild;
    document.body.appendChild = function (element) {
        if (element.tagName === 'DIV' && element.innerText && element.innerText.startsWith('-') && element.style.textShadow) {
            let soLuongChuNoi = 0;
            if (typeof danhSachSoBay !== 'undefined') soLuongChuNoi += danhSachSoBay.length;
            if (typeof danhSachSoBayBS !== 'undefined') soLuongChuNoi += danhSachSoBayBS.length;
            if (typeof danhSachSoBayCT !== 'undefined') soLuongChuNoi += danhSachSoBayCT.length;
            if (typeof danhSachSoBayLZ !== 'undefined') soLuongChuNoi += danhSachSoBayLZ.length;
            if (typeof danhSachSoBayLT !== 'undefined') soLuongChuNoi += danhSachSoBayLT.length;
            if (typeof danhSachSoBayPS !== 'undefined') soLuongChuNoi += danhSachSoBayPS.length;

            if (soLuongChuNoi > 5) {
                return element; 
            }
            element.style.textShadow = '1px 1px 0px #000';
        }
        return originalAppendChild.call(this, element);
    };
}


// ==========================================
// ⏳ HỆ THỐNG ĐỒNG HỒ ĐẾM NGƯỢC SKILL UI
// ==========================================
window.batDauHoiChieuUI = function(phim) {
    const slot = document.getElementById('slot-' + phim);
    if (!slot) return;
    
    const overlay = slot.querySelector('.cd-overlay');
    if (overlay) { overlay.style.transition = 'none'; overlay.style.height = '100%'; }
    
    const text = slot.querySelector('.cd-text');
    if (text) text.style.display = 'block';
    
    let tgHoi = window.thoiGianHoiChieu[phim] || 1500;
    let tgBatDau = Date.now();
    
    if (slot.cdInterval) clearInterval(slot.cdInterval);
    
    slot.cdInterval = setInterval(() => {
        let conLai = tgHoi - (Date.now() - tgBatDau);
        if (conLai <= 0) {
            clearInterval(slot.cdInterval); 
            if (overlay) overlay.style.height = '0%'; 
            if (text) text.style.display = 'none';
        } else {
            if (overlay) overlay.style.height = (conLai / tgHoi * 100) + '%';
            if (text) text.innerText = (conLai / 1000).toFixed(1); 
        }
    }, 50); 
};


// ==========================================
// 🛡️ CHẶN HIỂN THỊ SỐ -0 (TÀNG HÌNH SÁT THƯƠNG VI HẠT CỦA ANH EM)
// ==========================================
setInterval(() => {
    if (!window.daBocThepTaoSo && typeof window.taoSoSatThuong === 'function') {
        const oldTaoSo = window.taoSoSatThuong;
        window.taoSoSatThuong = function(pos3D, satThuong, mauSac) {
            // NẾU SÁT THƯƠNG QUÁ BÉ (Đạn đồng đội = 0.000001) -> Ẩn luôn số!
            if (typeof satThuong === 'number' && Math.round(satThuong) <= 0) return; 
            oldTaoSo(pos3D, satThuong, mauSac);
        };
        window.daBocThepTaoSo = true;
    }
}, 1000);


// ==========================================
// 🧠 AI KHÓA MỤC TIÊU THÔNG MINH TOÀN CỤC 
// ==========================================
window.layMucTieuGanNhatThongMinh = function(viTriGoc, huongMat) {
    let targetPos = null; 
    let minD = 80;

    function checkHopLe(hit) {
        if (!hit) return false;
        let dXZ = Math.hypot(viTriGoc.x - hit.tamNguc.x, viTriGoc.z - hit.tamNguc.z);
        let d = viTriGoc.distanceTo(hit.tamNguc);
        
        // 🌟 CỐT LÕI: dXZ > 0.1 để phân biệt "Bản thân người tung chiêu" (Khoảng cách = 0) và "Mục tiêu áp sát"
        if (dXZ > 0.1 && d < minD) { minD = d; targetPos = hit.tamNguc; return true; }
        return false;
    }

    // A. Quét Bản Thân (Để Boss cắn Sếp)
    if (window.playerModel && window.mauBanThan > 0 && !window.isDead) checkHopLe(window.layHitbox(window.playerModel));

    // B. Quét người chơi khác (BỎ QUA ĐỒNG ĐỘI NHƯNG GIỮ LẠI ĐỊCH)
    if (typeof remotePlayers !== 'undefined') {
        for (let id in remotePlayers) {
            if (typeof window.laKeDich === 'function' && !window.laKeDich(id)) continue; 
            let rp = remotePlayers[id];
            if (rp.status === 'ready' && rp.mesh) checkHopLe(window.layHitbox(rp.mesh));
        }
    }

    // C. Quét Quái/Boss (Luôn ưu tiên đánh quái)
    if (typeof window.danhSachQuaiVat !== 'undefined') {
        window.danhSachQuaiVat.forEach(quai => {
            if (!quai.isDead && quai.mesh) checkHopLe(window.layHitbox(quai.mesh));
        });
    }

    return targetPos;
};

// 🦠 BÍ THUẬT KÝ SINH: Tự động lây nhiễm và ghi đè TẤT CẢ các hàm khóa mục tiêu của mọi môn phái!
setInterval(() => {
    for (let key in window) {
        if (typeof window[key] === 'function' && key.startsWith('layMucTieuGanNhat') && key !== 'layMucTieuGanNhatThongMinh') {
            window[key] = function(viTriGoc, huongMat) {
                let t = window.layMucTieuGanNhatThongMinh(viTriGoc, huongMat);
                return t ? t : viTriGoc.clone().add(huongMat.clone().multiplyScalar(50)); 
            };
        }
    }
}, 2000);
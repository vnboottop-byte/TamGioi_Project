// ==========================================
// 🌐 MODULE: QUẢN LÝ CHIẾU THỨC & SINH TỬ TOÀN CỤC (BẢN V6 - TỐI THƯỢNG AAA)
// ==========================================
console.log("🚀 Khởi động Bộ Không Gian & Thời Gian...");

window.danhSachChieuThucToanMap = []; 

window.dangKyChieuThuc = function (mesh, lifetime = 3000, onUpdate = null) {
    window.danhSachChieuThucToanMap.push({ mesh: mesh, deathTime: Date.now() + lifetime, update: onUpdate });
};

function loopQuanLyToanCuc() {
    requestAnimationFrame(loopQuanLyToanCuc);
    const now = Date.now();
    for (let i = window.danhSachChieuThucToanMap.length - 1; i >= 0; i--) {
        let item = window.danhSachChieuThucToanMap[i];
        if (typeof item.update === 'function') item.update();
        if (now > item.deathTime) {
            if (item.mesh) {
                if (item.mesh.parent) item.mesh.parent.remove(item.mesh);
                if (typeof scene !== 'undefined') scene.remove(item.mesh);
            }
            window.danhSachChieuThucToanMap.splice(i, 1);
        }
    }
}
loopQuanLyToanCuc();

window.globalHandleBossDeath = function (boss) {
    if (!boss || boss.isDead) return;
    boss.isDead = true; boss.hp = 0; boss.state = 'DEAD';
    if (typeof boss.playAnim === 'function') boss.playAnim('DIE');
    if (boss.tagEl) boss.tagEl.style.display = 'none';
    setTimeout(() => { if (boss.mesh) boss.mesh.visible = false; }, 3000);
    setTimeout(() => {
        let fd = new FormData(); fd.append('boss_id', boss.id);
        fetch('api/hoi_sinh_boss.php', { method: 'POST', body: fd })
            .then(res => res.json()).then(data => {
                if (data.status === 'success') {
                    boss.hp = boss.maxHp; boss.isDead = false; boss.state = 'IDLE';
                    if (boss.mesh) { boss.mesh.visible = true; boss.mesh.position.set(boss.spawnX, boss.mesh.position.y, boss.spawnZ); }
                    if (typeof boss.playAnim === 'function') boss.playAnim('IDLE');
                    if (boss.tagEl) { let bar = boss.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = '100%'; boss.tagEl.style.display = 'block'; }
                }
            });
    }, 30000);
};

window.vinhDanhDoSat = function (victimName, victimLevel) {
    let expCuopDuoc = (victimLevel || 1) * 20;
    if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(expCuopDuoc, victimLevel);
    let fd = new FormData(); fd.append('victim', victimName);
    fetch('api/update_pk_quest.php', { method: 'POST', body: fd }).then(res => res.json()).then(data => {}).catch(err => {});

    const killNoti = document.getElementById('killNotification');
    const victimDisplay = document.getElementById('victimNameDisplay');
    const expDisplay = document.getElementById('killExpDisplay'); 
    if (killNoti && victimDisplay && expDisplay) {
        victimDisplay.innerText = victimName; expDisplay.innerText = expCuopDuoc.toLocaleString(); 
        killNoti.style.display = 'block'; killNoti.style.animation = 'none'; void killNoti.offsetWidth; 
        killNoti.style.animation = 'hienRaThuNho 0.5s ease-out forwards';
        setTimeout(() => { killNoti.style.display = 'none'; }, 4000);
    }
};

window.gaySatThuongBossToPlayer = function (tamNo, luongDame, banKinh) {
    if (!window.playerModel || window.isDead || window.IS_IN_SAFE_ZONE) return;
    let tamNguc = window.playerModel.position.clone(); tamNguc.y += 5;
    if (tamNo.distanceTo(tamNguc) <= banKinh) {
        window.mauBanThan -= luongDame;
        if (typeof taoSoSatThuong === 'function') taoSoSatThuong(tamNguc, luongDame, '#ff0000');
        const uiThanhMau = document.getElementById('thanhMauHienTai'); const uiSoMau = document.getElementById('soMauHienTai');
        if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
        if (uiSoMau) uiSoMau.innerText = Math.max(0, Math.round(window.mauBanThan)).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
        if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') window.xuLyCaiChetNhanVat("Bị Quái Vật Hạ Gục");
    }
};

// ==========================================
// 📡 MÁY QUÉT X-QUANG CHUẨN AAA (PHỤC HỒI HOÀN TOÀN BỘ NHỚ)
// ==========================================
window.layHitbox = function (mesh) {
    // 🛡️ CHỐNG CRASH TẦNG SÂU: Chặn các Object rỗng hoặc Vật thể giả (Mock)
    if (!mesh || !mesh.position) return { tamNguc: new THREE.Vector3(0,0,0), banKinh: 2.0, chieuCao: 2.5 };
    let isMockObject = !(typeof mesh.traverse === 'function' && mesh.isObject3D);

    let footPos = typeof mesh.position.clone === 'function' ? mesh.position.clone() : new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z);
    let upV = (mesh.up && typeof mesh.up.clone === 'function') ? mesh.up.clone().normalize() : new THREE.Vector3(0, 1, 0);

    let chieuCao = 2.5; let chieuRong = 4.0;

    if (!isMockObject) {
        let isMount = false;
        mesh.traverse(c => { if (c.name && c.name.toUpperCase().includes('YENNGUA')) isMount = true; });

        if (mesh.userData && mesh.userData.chieuCaoThuc) {
            chieuCao = mesh.userData.chieuCaoThuc;
            chieuRong = chieuCao * 1.5;
        } else {
            if (!mesh.chieuCaoCache) {
                try {
                    let box = new THREE.Box3().setFromObject(mesh);
                    mesh.chieuCaoCache = Math.max(2.5, box.max.y - box.min.y);
                    mesh.chieuRongCache = Math.max(4.0, box.max.x - box.min.x);
                } catch(e) {
                    mesh.chieuCaoCache = 2.5; mesh.chieuRongCache = 4.0;
                }
            }
            chieuCao = mesh.chieuCaoCache; chieuRong = mesh.chieuRongCache;
        }
        if (isMount) chieuCao = Math.max(chieuCao, 4.5);
    }

    let tamNguc = footPos.add(upV.multiplyScalar(chieuCao / 2));

    // 🛡️ BẢN VÁ LÁ CHẮN TỔ ĐỘI: Nếu là đồng đội, giấu Hitbox ra ngoài hệ mặt trời
    if (mesh.userData && mesh.userData.isAlly) {
        tamNguc.set(999999, 999999, 999999);
    }

    return { tamNguc: tamNguc, banKinh: chieuRong / 2, chieuCao: chieuCao };
};

// ==========================================
// 🛡️ BỘ LỌC RÁC DOM TỐI THƯỢNG CHO MOBILE 
// ==========================================
if (window.isMobile && !window.daCaiBoLocDOM) {
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
            if (soLuongChuNoi > 5) return element; 
            element.style.textShadow = '1px 1px 0px #000';
        }
        return originalAppendChild.call(this, element);
    };
    window.daCaiBoLocDOM = true;
}

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

// 🛡️ CHẶN HIỂN THỊ SỐ -0 (Tàng hình sát thương vi hạt của đồng đội)
setInterval(() => {
    if (!window.daBocThepTaoSo && typeof window.taoSoSatThuong === 'function') {
        const oldTaoSo = window.taoSoSatThuong;
        window.taoSoSatThuong = function(pos3D, satThuong, mauSac) {
            if (typeof satThuong === 'number' && Math.round(satThuong) <= 0) return; 
            oldTaoSo(pos3D, satThuong, mauSac);
        };
        window.daBocThepTaoSo = true;
    }
}, 1000);

// ==========================================
// 🧠 AI KHÓA MỤC TIÊU THÔNG MINH TOÀN CỤC (FIX LỖI TỰ ĐÁNH MÌNH)
// ==========================================
window.layMucTieuGanNhatThongMinh = function(viTriGoc, huongMat) {
    let targetPos = null; 
    let minD = 80;

    function checkHopLe(hit) {
        if (!hit || !hit.tamNguc) return false;
        let d = viTriGoc.distanceTo(hit.tamNguc);
        
        // 🌟 BẢO HIỂM 1: Cự ly phải > 0.5m để Sếp KHÔNG BAO GIỜ tự khóa vào ngực mình!
        if (d < 0.5 || d > minD) return false;

        // 🌟 BẢO HIỂM 2: RADAR HÌNH NÓN (Góc quét 180 độ phía trước mặt)
        // Kẻ địch đứng sau lưng sẽ bị bỏ qua, chống đạn bay ngược ra đằng sau!
        if (huongMat && typeof huongMat.clone === 'function') {
            let dirToTargetXZ = new THREE.Vector3(hit.tamNguc.x - viTriGoc.x, 0, hit.tamNguc.z - viTriGoc.z);
            let huongMatXZ = new THREE.Vector3(huongMat.x, 0, huongMat.z);
            if (dirToTargetXZ.lengthSq() > 0.01 && huongMatXZ.lengthSq() > 0.01) {
                dirToTargetXZ.normalize();
                huongMatXZ.normalize();
                let angle = huongMatXZ.angleTo(dirToTargetXZ);
                if (angle > Math.PI / 2) return false; // Nằm ngoài vùng mặt -> Bỏ qua
            }
        }

        minD = d; targetPos = hit.tamNguc; return true;
    }

    // 1. Quét Địch (Đã bỏ qua anh em PT)
    if (typeof remotePlayers !== 'undefined') {
        for (let id in remotePlayers) {
            if (typeof window.laKeDich === 'function' && !window.laKeDich(id)) continue; 
            let rp = remotePlayers[id];
            if (rp.status === 'ready' && rp.mesh) checkHopLe(window.layHitbox(rp.mesh));
        }
    }

    // 2. Quét Quái/Boss (Luôn ưu tiên đánh quái trước mặt)
    if (typeof window.danhSachQuaiVat !== 'undefined') {
        window.danhSachQuaiVat.forEach(quai => {
            if (!quai.isDead && quai.mesh) checkHopLe(window.layHitbox(quai.mesh));
        });
    }

    // 3. Quét Bản thân Sếp (DÀNH RIÊNG CHO BOSS KHÓA MỤC TIÊU SẾP)
    // Nếu viTriGoc (điểm tung chiêu của Boss) cách xa Sếp > 0.5m, Sếp hợp lệ để bị cắn!
    if (window.playerModel && window.mauBanThan > 0 && !window.isDead) {
        checkHopLe(window.layHitbox(window.playerModel));
    }

    // 🛑 CHÌA KHÓA VÀNG: TUYỆT ĐỐI TRẢ VỀ NULL NẾU KHÔNG CÓ ĐỊCH.
    // Việc này cho phép phai_bansung.js tự động xử lý bắn thẳng ra vô cực theo Logic nguyên gốc!
    return targetPos; 
};

// 🦠 BÍ THUẬT KÝ SINH AI THÔNG MINH CHO 100+ PHÁI (CÓ BẢO HIỂM LỖI CODE CŨ)
setInterval(() => {
    for (let key in window) {
        if (typeof window[key] === 'function' && key.startsWith('layMucTieuGanNhat') && key !== 'layMucTieuGanNhatThongMinh') {
            window[key] = function(viTriGoc, huongMat) {
                // 🛡️ CHỐNG CRASH TẦNG SÂU: Kẻ nào gọi hàm lởm thiếu tọa độ gốc thì bị từ chối
                if (!viTriGoc || typeof viTriGoc.clone !== 'function') return null;
                
                // Trả về duy nhất tọa độ chuẩn hoặc Null, Game không bao giờ bị Crash!
                return window.layMucTieuGanNhatThongMinh(viTriGoc, huongMat); 
            };
        }
    }
}, 2000);
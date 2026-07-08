// ==========================================
// 🌐 MODULE: QUẢN LÝ CHIẾU THỨC & SINH TỬ TOÀN CỤC (BẢN FINAL AAA - CỰC MƯỢT)
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
    fetch('api/update_pk_quest.php', { method: 'POST', body: fd }).then(res=>res.json()).catch(err=>{});

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
// 📡 MÁY QUÉT X-QUANG CHUẨN GỐC (BỌC THÉP LÁ CHẮN TỔ ĐỘI)
// ==========================================
window.layHitbox = function (mesh) {
    if (!mesh || !mesh.position) return { tamNguc: new THREE.Vector3(0,0,0), banKinh: 2.0, chieuCao: 2.5 };
    
    // Tự động nhận diện đồ giả do hệ thống render thừa
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
                } catch(e) { mesh.chieuCaoCache = 2.5; mesh.chieuRongCache = 4.0; }
            }
            chieuCao = mesh.chieuCaoCache; chieuRong = mesh.chieuRongCache;
        }
        if (isMount) chieuCao = Math.max(chieuCao, 4.5);
    }

    let tamNguc = footPos.add(upV.multiplyScalar(chieuCao / 2));

    // 🛡️ GIẤU HITBOX ĐỒNG ĐỘI RA KHỎI TRÁI ĐẤT
    if (mesh.userData && mesh.userData.isAlly) {
        tamNguc.set(999999, 999999, 999999);
    }

    return { tamNguc: tamNguc, banKinh: chieuRong / 2, chieuCao: chieuCao };
};

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
// 🧠 AI KHÓA MỤC TIÊU CỰC KHÔN (FIX TỰ ĐÁNH MÌNH VÀ BẮN SÚNG XỊT)
// ==========================================
window.layMucTieuGanNhatThongMinh = function(viTriGoc, huongMat) {
    let targetPos = null; 
    let minD = 80; // Tầm nhìn siêu xa 80 mét

    // 🛡️ KIỂM TRA XEM AI LÀ NGƯỜI TUNG CHIÊU
    // Nếu viTriGoc phát nổ cách chân Sếp quá gần (< 2m), chứng tỏ Sếp đang đứng ném chiêu!
    let isLocalCaster = false;
    if (window.playerModel && typeof viTriGoc.distanceTo === 'function') {
        if (viTriGoc.distanceTo(window.playerModel.position) < 2.0) {
            isLocalCaster = true; 
        }
    }

    function checkHopLe(hit) {
        if (!hit || !hit.tamNguc) return false;
        let d = viTriGoc.distanceTo(hit.tamNguc);
        
        if (d > minD) return false;

        // 🌟 NÂNG CẤP: RADAR HÌNH NÓN (Góc 240 độ - Mắt siêu sáng)
        if (huongMat && typeof huongMat.clone === 'function' && huongMat.lengthSq() > 0.01) {
            let dirToTargetXZ = new THREE.Vector3(hit.tamNguc.x - viTriGoc.x, 0, hit.tamNguc.z - viTriGoc.z);
            let huongMatXZ = new THREE.Vector3(huongMat.x, 0, huongMat.z);
            if (dirToTargetXZ.lengthSq() > 0.01) {
                dirToTargetXZ.normalize(); huongMatXZ.normalize();
                let angle = huongMatXZ.angleTo(dirToTargetXZ);
                // Góc 120 độ mỗi bên (240 độ tổng), chỉ bỏ qua đứa nằm tuốt sau lưng!
                if (angle > Math.PI / 1.5) return false; 
            }
        }

        minD = d; targetPos = hit.tamNguc.clone(); return true;
    }

    // 1. Quét Địch (PVP)
    if (typeof remotePlayers !== 'undefined') {
        for (let id in remotePlayers) {
            if (typeof window.laKeDich === 'function' && !window.laKeDich(id)) continue; 
            let rp = remotePlayers[id];
            if (rp && rp.status === 'ready' && rp.mesh && rp.mesh.visible) {
                checkHopLe(window.layHitbox(rp.mesh));
            }
        }
    }

    // 2. Quét Quái (PVE)
    if (typeof window.danhSachQuaiVat !== 'undefined') {
        window.danhSachQuaiVat.forEach(quai => {
            if (!quai.isDead && quai.mesh && quai.mesh.visible) {
                checkHopLe(window.layHitbox(quai.mesh));
            }
        });
    }

    // 3. Quét Bản thân Sếp (Để Boss hoặc Địch khóa mục tiêu Sếp)
    // Nếu Sếp đang đứng ném chiêu (isLocalCaster = true), CẤM TỰ QUÉT BẢN THÂN (Chống Pháp Sư tự sát)!
    if (!isLocalCaster && window.playerModel && window.mauBanThan > 0 && !window.isDead) {
        checkHopLe(window.layHitbox(window.playerModel));
    }

    return targetPos; 
};

// 🦠 BÍ THUẬT KÝ SINH GHI ĐÈ 100 PHÁI
if (!window.daCaiAIKhien) {
    setInterval(() => {
        for (let key in window) {
            if (typeof window[key] === 'function' && key.startsWith('layMucTieuGanNhat') && key !== 'layMucTieuGanNhatThongMinh') {
                if (!window[key].isSmartHook) {
                    window[key] = function(viTriGoc, huongMat) {
                        if (!viTriGoc || typeof viTriGoc.clone !== 'function') return null;
                        
                        let hMat = (huongMat && typeof huongMat.clone === 'function') ? huongMat : new THREE.Vector3(0,0,1);
                        let t = window.layMucTieuGanNhatThongMinh(viTriGoc, hMat);
                        
                        // Nếu AI thấy địch -> Trả về hồng tâm Địch.
                        // Nếu KHÔNG có địch -> Trả về thẳng đường 50m (Bắn súng bay mượt)!
                        return t ? t : viTriGoc.clone().add(hMat.clone().multiplyScalar(50));
                    };
                    window[key].isSmartHook = true;
                }
            }
        }
    }, 2000);
    window.daCaiAIKhien = true;
}

// 🛡️ CHẶN HIỂN THỊ SỐ -0 (Ẩn chữ số đạn đồng đội)
if (window.isMobile && !window.daCaiBoLocDOM) {
    const originalAppendChild = document.body.appendChild;
    document.body.appendChild = function (element) {
        if (element.tagName === 'DIV' && element.innerText && element.innerText.startsWith('-') && element.style.textShadow) {
            let soLuongChuNoi = 0;
            if (typeof danhSachSoBay !== 'undefined') soLuongChuNoi += danhSachSoBay.length;
            if (typeof danhSachSoBayBS !== 'undefined') soLuongChuNoi += danhSachSoBayBS.length;
            if (typeof danhSachSoBayCT !== 'undefined') soLuongChuNoi += danhSachSoBayCT.length;
            if (soLuongChuNoi > 5) return element; 
            element.style.textShadow = '1px 1px 0px #000';
        }
        return originalAppendChild.call(this, element);
    };
    window.daCaiBoLocDOM = true;
}
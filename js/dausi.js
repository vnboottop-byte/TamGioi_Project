// ==========================================
// 🪓 MÔN PHÁI: CUỒNG CHIẾN BINH (PURE MELEE V4)
// 👑 FIX LỖI GIẬT KINH PHONG + MÚA ẢO + KHÓA MỤC TIÊU 100%
// ==========================================

(function () {
    const hieuUngDauSi = [];
    const danhSachSoBayDS = [];

    // 🌟 TRẠNG THÁI CHIẾN ĐẤU CỦA ĐẤU SĨ
    window.trangThaiDS = {
        state: 'IDLE', // IDLE, DASHING, HITTING
        target: null,
        skillKey: null,
        dameRatio: 1
    };

    const THOI_GIAN_HOI = { 'Q': 2000, 'E': 4000, 'R': 6000, 'F': 12000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    window.tongSoChuNoi_DS = 0;
    function taoSoSatThuongDS(pos3D, satThuong, isCrit = false) {
        if (window.isMobile && window.tongSoChuNoi_DS > 5) return;
        if (satThuong <= 0) return;
        window.tongSoChuNoi_DS++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        
        let mauSac = isCrit ? '#ff4400' : '#eeeeee';
        let size = isCrit ? '45px' : '30px';
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #880000';
        
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:${size}; text-shadow:${bongChu}; pointer-events:none; z-index:9999; transition: 0.1s; transform: scale(1.5);`;
        document.body.appendChild(div);
        
        setTimeout(() => { div.style.transform = `scale(1.0)`; }, 30);
        danhSachSoBayDS.push({ el: div, pos: pos3D.clone(), life: 40, offsetY: 0 });
    }

    function layMucTieuGanNhatDS(viTriGoc) {
        // Ưu tiên khóa mục tiêu đã chọn
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 150) return window.mucTieuHienTai;
        }

        let targetQuai = null; let minDQuai = 150;
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); 
                    // Đo khoảng cách 2D (Bỏ qua độ cao) để bắt chuẩn
                    let distXZ = Math.hypot(viTriGoc.x - hit.tamNguc.x, viTriGoc.z - hit.tamNguc.z);
                    if (distXZ > 0.1 && distXZ < minDQuai) { minDQuai = distXZ; targetQuai = quai; }
                }
            });
        }
        return targetQuai;
    }

    // 💥 HITBOX ĐỊNH HƯỚNG BÁN NGUYỆT MỞ RỘNG
    function gaySatThuongDauSi(tamDanh, huongDanh, luongSatThuong, banKinhAo) {
        let daTrung = false;
        
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    let vecToTarget = new THREE.Vector3().subVectors(hit.tamNguc, tamDanh);
                    vecToTarget.y = 0; // Bỏ qua trục Y
                    let dist = vecToTarget.length();

                    // Mở rộng góc đánh (Dot > 0.2 tức là chém gần 160 độ đằng trước)
                    if (dist <= banKinhAo + hit.banKinh && vecToTarget.normalize().dot(huongDanh) > 0.2) {
                        daTrung = true;
                        quai.hp -= luongSatThuong; 
                        taoSoSatThuongDS(hit.tamNguc, luongSatThuong, luongSatThuong > window.DAME_CUA_TOI);
                        
                        if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (quai.hp / (quai.maxHp || 4000)) * 100) + '%'; }
                        if (quai.hp <= 0) {
                            quai.isDead = true; if (typeof quai.playAnim === 'function') quai.playAnim('DIE'); else quai.mesh.visible = false;
                            if (quai.tagEl) quai.tagEl.style.display = 'none';
                            if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);
                            setTimeout(() => { quai.hp = quai.maxHp; quai.isDead = false; if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true; if (quai.tagEl) quai.tagEl.style.display = 'block'; }, 5000);
                        } else { if (typeof quai.playAnim === 'function') quai.playAnim('HIT'); }
                    }
                }
            });
        }
        return daTrung;
    }

    function taoVatChop(pos, dir, isBig = false) {
        const geo = new THREE.PlaneGeometry(isBig ? 15 : 8, isBig ? 3 : 1.5);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
        const slash = new THREE.Mesh(geo, mat);
        
        slash.position.copy(pos);
        slash.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), dir);
        slash.rotateZ((Math.random() - 0.5) * Math.PI); 
        scene.add(slash);

        hieuUngDauSi.push({ mesh: slash, life: 10, type: 'SLASH' }); 
    }

    // ==========================================
    // ⚔️ ĐIỂM KÍCH HOẠT COMBO (ĐÃ FIX LỖI GIẬT)
    // ==========================================
    window.tungComboDauSi = function (phim, isRemote = false) {
        let nvc = window.playerModel || window.nhanVatChinh;
        if (!nvc || isRemote) return;

        let bayGio = Date.now();
        if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
        choHoiChieu[phim] = bayGio;

        let nutKyNang = document.getElementById('btn' + phim) || document.getElementById('skill' + phim);
        if (nutKyNang) {
            nutKyNang.style.pointerEvents = 'none'; nutKyNang.style.filter = 'brightness(0.4)';
            setTimeout(() => { nutKyNang.style.filter = ''; nutKyNang.style.pointerEvents = ''; }, THOI_GIAN_HOI[phim]);
        }

        window.dangMuaChieu = false; 
        
        // TÌM MỤC TIÊU
        let target = layMucTieuGanNhatDS(nvc.position);
        const heSoDame = { 'Q': 1.0, 'E': 1.5, 'R': 2.0, 'F': 4.0 };
        window.trangThaiDS.skillKey = phim;
        window.trangThaiDS.dameRatio = heSoDame[phim];

        if (target) {
            let tHit = window.layHitbox(target.mesh);
            // Đo khoảng cách mặt đất
            let distXZ = Math.hypot(nvc.position.x - tHit.tamNguc.x, nvc.position.z - tHit.tamNguc.z);

            // NẾU ĐÃ ĐỨNG SÁT RỒI -> CHÉM LUÔN (Không Lướt nữa)
            if (distXZ <= tHit.banKinh + 2.5) {
                thucHienChem(target);
            } else {
                // Ở XA RỒI -> BẬT LƯỚT
                window.trangThaiDS.state = 'DASHING';
                window.trangThaiDS.target = target;
                
                let animLaoToi = window.animationsMap['DASH'] || window.animationsMap['CHAYBO'] || window.animationsMap['BAY'];
                if(animLaoToi && typeof window.playAnim === 'function') window.playAnim(animLaoToi.getClip().name);
            }
        } else {
            // Không có target thì Đấm vào không khí
            thucHienChem(null);
        }
    };

    // 💥 HÀM XẢ CHIÊU CHUẨN XÁC
    function thucHienChem(targetQuai) {
        window.trangThaiDS.state = 'HITTING';
        window.dangMuaChieu = true; // Khóa di chuyển
        
        let mapAnim = (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") ? window.animationsMapChar : window.animationsMap;
        let pool = Object.keys(mapAnim || {}).filter(k => k.includes('ATTACK') || k.includes('SKILL') || k.includes('PUNCH'));
        let randomAnim = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'BAY';
        if(typeof window.playAnim === 'function') window.playAnim(randomAnim);

        // Nắn mặt về phía quái nếu có
        let nvc = window.playerModel;
        let fwdDir = new THREE.Vector3();
        
        if (targetQuai) {
            let tHit = window.layHitbox(targetQuai.mesh);
            fwdDir.subVectors(tHit.tamNguc, nvc.position);
            fwdDir.y = 0; fwdDir.normalize();
            
            const dummy = new THREE.Object3D(); 
            dummy.position.copy(nvc.position); dummy.up.copy(nvc.up);
            dummy.lookAt(nvc.position.clone().add(fwdDir));
            nvc.quaternion.copy(dummy.quaternion); // Khóa mặt ngay lập tức
        } else {
            nvc.getWorldDirection(fwdDir);
            fwdDir.y = 0; fwdDir.normalize();
        }

        let isChiMang = (window.trangThaiDS.skillKey === 'F');
        let vTriDanh = nvc.position.clone().add(new THREE.Vector3(0,1.5,0)).add(fwdDir.clone().multiplyScalar(2));
        taoVatChop(vTriDanh, fwdDir, isChiMang);
        
        let dame = (window.DAME_CUA_TOI || 200) * window.trangThaiDS.dameRatio;
        let banKinhQuet = isChiMang ? 8 : 4; 
        
        let trungDich = gaySatThuongDauSi(nvc.position, fwdDir, dame, banKinhQuet);

        // GENSHIN HIT-STOP 
        if (trungDich) {
            if (typeof window.phatAmThanhNo === 'function') window.phatAmThanhNo(); 
            if(window.currentActionChar) {
                window.currentActionChar.setEffectiveTimeScale(0.05);
                setTimeout(() => { if(window.currentActionChar) window.currentActionChar.setEffectiveTimeScale(1.5); }, 150);
            } else if (window.currentAction) {
                window.currentAction.setEffectiveTimeScale(0.05);
                setTimeout(() => { if(window.currentAction) window.currentAction.setEffectiveTimeScale(1.5); }, 150);
            }
        }

        // Thoát khỏi Animation
        setTimeout(() => { 
            if(window.trangThaiDS.state === 'HITTING') {
                window.trangThaiDS.state = 'IDLE'; 
                window.dangMuaChieu = false;
                if(typeof window.playAnim === 'function') window.playAnim('NHANROI');
            }
        }, 500);
    }

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ CAMERA & HITBOX
    // ==========================================
    window.updateCombatDauSi = function () {
        let nvc = window.playerModel;
        if (!nvc) return;

        // XỬ LÝ LƯỚT TỚI MỤC TIÊU
        if (window.trangThaiDS.state === 'DASHING' && window.trangThaiDS.target) {
            let t = window.trangThaiDS.target;
            if (t.isDead) { window.trangThaiDS.state = 'IDLE'; return; }
            
            let tHit = window.layHitbox(t.mesh);
            
            let vecToTarget = new THREE.Vector3().subVectors(tHit.tamNguc, nvc.position);
            vecToTarget.y = 0; // Lướt phẳng trên mặt đất
            let dist = vecToTarget.length();

            // Nếu còn xa hơn bán kính quái + 2.5m thì lướt tới
            if (dist > tHit.banKinh + 2.5) {
                vecToTarget.normalize();

                // Xoay mặt
                const dummy = new THREE.Object3D(); 
                dummy.position.copy(nvc.position); 
                dummy.up.copy(nvc.up);
                dummy.lookAt(nvc.position.clone().add(vecToTarget));
                nvc.quaternion.slerp(dummy.quaternion, 0.4);

                // Lướt thẳng Tịnh tiến (Không dùng Lerp để tránh giật lùi âm vector)
                nvc.position.add(vecToTarget.multiplyScalar(2.0)); // Tốc độ lướt
            } 
            else {
                // Đã tới sát mặt địch -> Khởi động Chém!
                thucHienChem(t);
            }
        }

        // --- DỌN RÁC HIỆU ỨNG CHÉM ---
        for (let i = hieuUngDauSi.length - 1; i >= 0; i--) {
            let h = hieuUngDauSi[i]; h.life--;
            if (h.type === 'SLASH') {
                h.mesh.scale.x += 0.5; 
                h.mesh.scale.y -= 0.1; 
                h.mesh.material.opacity = h.life / 10;
            }
            if (h.life <= 0) {
                scene.remove(h.mesh);
                if (h.mesh.geometry) h.mesh.geometry.dispose();
                if (h.mesh.material) h.mesh.material.dispose();
                hieuUngDauSi.splice(i, 1);
            }
        }

        // --- CẬP NHẬT SỐ DAME UI ---
        for (let i = danhSachSoBayDS.length - 1; i >= 0; i--) {
            let item = danhSachSoBayDS[i];
            item.offsetY += 0.08; item.life--;
            const screenPos = item.pos.clone(); screenPos.y += item.offsetY; screenPos.project(camera);
            if (screenPos.z < 1) {
                item.el.style.left = `${(screenPos.x * 0.5 + 0.5) * window.innerWidth}px`;
                item.el.style.top = `${(screenPos.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { item.el.style.display = 'none'; }
            if (item.life < 20) item.el.style.opacity = item.life / 20;
            if (item.life <= 0) { item.el.remove(); danhSachSoBayDS.splice(i, 1); window.tongSoChuNoi_DS--; }
        }
    };

    setInterval(window.updateCombatDauSi, 30);

    // ==========================================
    // 🌟 KHỞI TẠO TỪ ĐIỂN MÔN PHÁI TƯƠNG THÍCH CHÉO
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_dausi')) {
        window.HePhaiHienTai = {
            tenPhai: "Cuồng Chiến Binh (Melee)",
            khoiTao: function () {
                console.log("🪓 Đã Kích Hoạt Động Cơ Cận Chiến V4 (Chống Giật 100%)!");
                if (window.animationsMap) {
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        if (k.includes('RUN') || k.includes('DASH')) window.animationsMap['CHAYBO'] = window.animationsMap[key];
                        if (k.includes('IDLE')) window.animationsMap['NHANROI'] = window.animationsMap[key];
                    }
                }
            },
            tungChieu: function (phim, isRemote) { window.tungComboDauSi(phim, isRemote); },
            capNhat: function () {} 
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
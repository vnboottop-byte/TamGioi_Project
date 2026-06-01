// ==========================================
// 🪓 MÔN PHÁI ĐOẠT XÁ: CUỒNG CHIẾN BINH (PURE MELEE)
// 👑 CÔNG NGHỆ: CAMERA GÓC THẤP + HITBOX TRƯỚC MẶT + LƯỚT TỐC BIẾN
// ==========================================

(function () {
    const hieuUngDauSi = [];
    const danhSachSoBayDS = [];

    // 🌟 TRẠNG THÁI CHIẾN ĐẤU CỦA ĐẤU SĨ
    window.trangThaiDS = {
        state: 'IDLE', // IDLE, DASHING, HITTING
        target: null,
        skillKey: null,
        dameRatio: 1,
        comboStep: 0 // Đếm nhịp combo
    };

    // ⏳ THỜI GIAN HỒI CHIÊU (Đánh cận chiến nên hồi nhanh hơn để spam)
    const THOI_GIAN_HOI = { 'Q': 2000, 'E': 4000, 'R': 6000, 'F': 12000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    window.tongSoChuNoi_DS = 0;
    function taoSoSatThuongDS(pos3D, satThuong, isCrit = false) {
        if (window.isMobile && window.tongSoChuNoi_DS > 5) return;
        if (satThuong <= 0) return;
        window.tongSoChuNoi_DS++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        
        // Bạo kích thì số to hơn, màu đỏ cam. Bình thường màu trắng xám.
        let mauSac = isCrit ? '#ff4400' : '#eeeeee';
        let size = isCrit ? '45px' : '30px';
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #880000';
        
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:${size}; text-shadow:${bongChu}; pointer-events:none; z-index:9999; transition: 0.1s; transform: scale(1.5);`;
        document.body.appendChild(div);
        
        // Rung giật số dame tạo cảm giác nặng nề
        setTimeout(() => { div.style.transform = `scale(1.0) rotate(${(Math.random()-0.5)*10}deg)`; }, 30);

        danhSachSoBayDS.push({ el: div, pos: pos3D.clone(), life: 40, offsetY: 0 });
    }

    // 🎯 RADAR TÌM MỒI (Ưu tiên người chơi trước, quái sau)
    function layMucTieuGanNhatDS(viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 150) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 150;
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDNguoi) { minDNguoi = d; targetNguoi = rp; }
                }
            }
        }
        if (targetNguoi) return targetNguoi;

        let targetQuai = null; let minDQuai = 150;
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDQuai) { minDQuai = d; targetQuai = quai; }
                }
            });
        }
        return targetQuai;
    }

    // 💥 HITBOX ĐỊNH HƯỚNG TRƯỚC MẶT (Không đánh lan ra sau lưng)
    function gaySatThuongDauSi(tamDanh, huongDanh, luongSatThuong, banKinhAo) {
        let daTrung = false;
        // Quét PVP
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    let vecToTarget = new THREE.Vector3().subVectors(hit.tamNguc, tamDanh);
                    let dist = vecToTarget.length();
                    // Nằm trong bán kính VÀ nằm ở phía trước mặt (Góc lệch < 60 độ)
                    if (dist <= banKinhAo + hit.banKinh && vecToTarget.normalize().dot(huongDanh) > 0.5) {
                        taoSoSatThuongDS(hit.tamNguc, luongSatThuong, true);
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, hit.tamNguc);
                        daTrung = true;
                    }
                }
            }
        }
        // Quét PVE
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    let vecToTarget = new THREE.Vector3().subVectors(hit.tamNguc, tamDanh);
                    let dist = vecToTarget.length();
                    // Điều kiện: Trong cự ly + Trúng vùng quét trước mặt
                    if (dist <= banKinhAo + hit.banKinh && vecToTarget.normalize().dot(huongDanh) > 0.5) {
                        daTrung = true;
                        quai.hp -= luongSatThuong; 
                        taoSoSatThuongDS(hit.tamNguc, luongSatThuong, luongSatThuong > window.DAME_CUA_TOI); // Đòn F tạo số bạo kích
                        if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (quai.hp / (quai.maxHp || 4000)) * 100) + '%'; }
                        if (quai.hp <= 0) {
                            quai.isDead = true; if (typeof quai.playAnim === 'function') quai.playAnim('DIE'); else quai.mesh.visible = false;
                            if (quai.tagEl) quai.tagEl.style.display = 'none';
                            if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);
                            setTimeout(() => { quai.hp = quai.maxHp; quai.isDead = false; if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true; if (quai.tagEl) { quai.tagEl.style.display = 'block'; } }, 5000);
                        } else { if (typeof quai.playAnim === 'function') quai.playAnim('HIT'); }
                    }
                }
            });
        }
        return daTrung;
    }

    // 🌪️ HIỆU ỨNG VẾT CHÉM KHÔNG KHÍ TẠI CHỖ
    function taoVatChop(pos, dir, isBig = false) {
        const geo = new THREE.PlaneGeometry(isBig ? 15 : 8, isBig ? 3 : 1.5);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
        const slash = new THREE.Mesh(geo, mat);
        
        slash.position.copy(pos);
        // Ép vết chém xoay ngang và nghiêng nhẹ theo hướng vung tay
        slash.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), dir);
        slash.rotateZ((Math.random() - 0.5) * Math.PI); // Xoay chéo ngẫu nhiên
        scene.add(slash);

        hieuUngDauSi.push({ mesh: slash, life: 10, type: 'SLASH' }); // Bay màu siêu lẹ trong 10 frame
    }

    // ==========================================
    // ⚔️ ĐIỂM KÍCH HOẠT COMBO
    // ==========================================
    window.tungComboDauSi = function (phim, isRemote = false) {
        let nvc = window.playerModel || window.nhanVatChinh;
        if (!nvc || isRemote) return;

        let bayGio = Date.now();
        if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
        choHoiChieu[phim] = bayGio;

        // Vô hiệu hóa nút UI
        let nutKyNang = document.getElementById('btn' + phim) || document.getElementById('skill' + phim);
        if (nutKyNang) {
            nutKyNang.style.pointerEvents = 'none'; nutKyNang.style.filter = 'brightness(0.4)';
            setTimeout(() => { nutKyNang.style.filter = ''; nutKyNang.style.pointerEvents = ''; }, THOI_GIAN_HOI[phim]);
        }

        window.dangMuaChieu = false; // Phá khóa ngay lập tức để Lướt
        let viTriGoc = nvc.position.clone();
        let target = layMucTieuGanNhatDS(viTriGoc);

        const heSoDame = { 'Q': 1.0, 'E': 1.5, 'R': 2.0, 'F': 4.0 };

        if (target) {
            window.trangThaiDS.state = 'DASHING';
            window.trangThaiDS.target = target;
            window.trangThaiDS.skillKey = phim;
            window.trangThaiDS.dameRatio = heSoDame[phim];
            
            // 🌟 FALLBACK THÔNG MINH: Nếu không có DASH thì lấy CHẠY, không có CHẠY thì lấy BAY
            let animLaoToi = window.animationsMap['DASH'] || window.animationsMap['CHAYBO'] || window.animationsMap['BAY'];
            if(animLaoToi && typeof window.playAnim === 'function') window.playAnim(animLaoToi.getClip().name);

        } else {
            // Không có target thì Đấm vào không khí
            window.trangThaiDS.state = 'IDLE';
            let animDanh = window.animationsMap['ATTACK'] || Object.values(window.animationsMap)[0];
            if(animDanh && typeof window.playAnim === 'function') window.playAnim(animDanh.getClip().name);
            
            let fwd = new THREE.Vector3(); nvc.getWorldDirection(fwd);
            taoVatChop(nvc.position.clone().add(new THREE.Vector3(0,2,0)).add(fwd.multiplyScalar(2)), fwd, phim==='F');
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ CAMERA & HITBOX
    // ==========================================
    window.updateCombatDauSi = function () {
        let nvc = window.playerModel;
        if (!nvc) return;

        if (window.trangThaiDS.state === 'DASHING' && window.trangThaiDS.target) {
            let t = window.trangThaiDS.target;
            if (t.isDead) { window.trangThaiDS.state = 'IDLE'; return; }
            
            let tHit = window.layHitbox(t.mesh);
            
            // 🌟 XÁC ĐỊNH ĐIỂM CHẠM: Không lao vào lõi, lao tới sát mặt địch (cách 2m)
            let fwdDir = new THREE.Vector3().subVectors(tHit.tamNguc, nvc.position);
            fwdDir.y = 0; fwdDir.normalize();
            let diemDen = tHit.tamNguc.clone().sub(fwdDir.multiplyScalar(tHit.banKinh + 1.5));
            diemDen.y = nvc.position.y; // Giữ nguyên độ dốc đất

            let khoangCach = nvc.position.distanceTo(diemDen);

            // Xoay mặt khóa mục tiêu
            const dummy = new THREE.Object3D(); dummy.position.copy(nvc.position); dummy.up.copy(nvc.up);
            dummy.lookAt(diemDen);
            nvc.quaternion.slerp(dummy.quaternion, 0.4);

            if (khoangCach > 1.5) {
                // 🚀 LƯỚT TỐC ĐỘ BÀN THỜ (LERP 0.4)
                nvc.position.lerp(diemDen, 0.4); 
                
                // 🎥 ĐỘT PHÁ GÓC CAMERA: TRƯỢT XUỐNG DƯỚI CHÂN/HÔNG
                if (window.controls) {
                    // Thay vì nhìn vào ngực Boss, Camera nhìn vào Hông (Eo) của Nhân Vật
                    let diemNhinCam = nvc.position.clone().add(nvc.up.clone().multiplyScalar(1.5));
                    window.controls.target.lerp(diemNhinCam, 0.2); // Slerp Camera nhẹ nhàng bám theo hông Sếp
                }
            } 
            else {
                // 💥 ÁP SÁT -> KẾT THÚC LƯỚT, CHÉM!
                window.trangThaiDS.state = 'HITTING';
                window.dangMuaChieu = true; // Bật khiên cấm đè nút
                
                // 1. TỰ TÌM ANIMATION CHÉM TRONG KHO (Tương thích mọi model)
                let mapAnim = (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") ? window.animationsMapChar : window.animationsMap;
                let pool = Object.keys(mapAnim || {}).filter(k => k.includes('ATTACK') || k.includes('SKILL') || k.includes('PUNCH'));
                let randomAnim = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'BAY';
                if(typeof window.playAnim === 'function') window.playAnim(randomAnim);
                
                // 2. TẠO VẾT CHÉM KHÔNG KHÍ & HITBOX ĐỊNH HƯỚNG TỚI TRƯỚC
                let vTriDanh = nvc.position.clone().add(new THREE.Vector3(0,2,0)).add(fwdDir.multiplyScalar(2));
                let isChiMang = (window.trangThaiDS.skillKey === 'F');
                taoVatChop(vTriDanh, fwdDir, isChiMang);
                
                let dame = (window.DAME_CUA_TOI || 200) * window.trangThaiDS.dameRatio;
                let banKinhQuet = isChiMang ? 8 : 4; // F thì quét xa 8m, bình thường 4m
                let trungDich = gaySatThuongDauSi(nvc.position, fwdDir, dame, banKinhQuet);

                // 3. GENSHIN HIT-STOP (KHỰNG MÀN HÌNH TẠO LỰC NẾU TRÚNG ĐỊCH)
                if (trungDich) {
                    if (typeof window.phatAmThanhNo === 'function') window.phatAmThanhNo(); // Kêu Oạch!
                    
                    if(window.currentActionChar) {
                        window.currentActionChar.setEffectiveTimeScale(0.01);
                        setTimeout(() => { if(window.currentActionChar) window.currentActionChar.setEffectiveTimeScale(1.5); }, 150);
                    } else if (window.currentAction) {
                        window.currentAction.setEffectiveTimeScale(0.01);
                        setTimeout(() => { if(window.currentAction) window.currentAction.setEffectiveTimeScale(1.5); }, 150);
                    }

                    // 4. CAMERA SHAKE NẶNG NỀ (Chỉ rung nếu chém trúng thịt)
                    let camY = camera.position.y; let camX = camera.position.x;
                    let doRung = isChiMang ? 2.5 : 1.0;
                    let shake = setInterval(() => { 
                        camera.position.y = camY + (Math.random()-0.5) * doRung; 
                        camera.position.x = camX + (Math.random()-0.5) * doRung; 
                    }, 16);
                    setTimeout(() => { clearInterval(shake); camera.position.y = camY; camera.position.x = camX; }, 150);
                }

                // 5. TRẢ CAMERA VỀ NGỰC BÌNH THƯỜNG SAU KHI ĐÁNH XONG
                setTimeout(() => { 
                    if(window.trangThaiDS.state === 'HITTING') {
                        window.trangThaiDS.state = 'IDLE'; 
                        window.dangMuaChieu = false;
                        if(typeof window.playAnim === 'function') window.playAnim('NHANROI');
                    }
                }, 500); // 0.5s sau đòn đánh
            }
        }

        // --- DỌN RÁC HIỆU ỨNG CHÉM ---
        for (let i = hieuUngDauSi.length - 1; i >= 0; i--) {
            let h = hieuUngDauSi[i]; h.life--;
            if (h.type === 'SLASH') {
                h.mesh.scale.x += 0.5; // Kéo dài vết chém
                h.mesh.scale.y -= 0.1; // Xẹp vết chém
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
                console.log("🪓 Đã Kích Hoạt Động Cơ Cận Chiến Đột Kích (Camera Bám Hông)!");

                // Cỗ máy tự động phân loại Animation cho mọi Model
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
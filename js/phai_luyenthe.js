// ==========================================
// 🥊 HỆ THỐNG KỸ NĂNG: LUYỆN THỂ (V20 - BẠO CHÚA CẬN CHIẾN & GENSHIN CAMERA)
// ==========================================

(function() {
    let hieuUngLuyenThe = [];
    let danhSachSoBayLT = []; 

    // 🌟 TRẠNG THÁI CẬN CHIẾN ĐỘC QUYỀN
    window.trangThaiLT = {
        state: 'IDLE', // IDLE, DASHING, HITTING
        target: null,
        skillKey: null,
        dameRatio: 1
    };

    window.tongSoChuNoi_LT = 0; 
    function taoSoSatThuongLT(pos3D, satThuong, mauSac = '#ff2222') {
        if (window.isMobile && window.tongSoChuNoi_LT > 5) return;
        if(satThuong <= 0) return;
        window.tongSoChuNoi_LT++;

        const div = document.createElement('div');
        div.innerText = "-" + satThuong;
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000, -2px -2px 0px #000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999; transition: 0.1s;`;
        document.body.appendChild(div);
        
        // Rung nhẹ số sát thương để tạo lực
        setTimeout(() => { div.style.transform = `scale(1.5)`; }, 20);
        setTimeout(() => { div.style.transform = `scale(1.0)`; }, 100);

        danhSachSoBayLT.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    const THOI_GIAN_HOI = { 'Q': 1000, 'E': 3000, 'R': 5000, 'F': 10000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    function layQuaiVatGanNhatLT(viTriGoc) {
        let targetQuai = null; 
        let minD = 300; // 🌟 Tầm nhìn khóa mục tiêu cực rộng (300m)
        
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minD) { minD = d; targetQuai = quai; }
                }
            });
        }
        return targetQuai;
    }

    function gaySatThuongLT(tamNgucDich, luongSatThuong, banKinh) {
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    // Sát thương tỏa ra từ tâm ngực địch, bán kính quét xung quanh
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        quai.hp -= luongSatThuong; taoSoSatThuongLT(hit.tamNguc.clone(), luongSatThuong);
                        if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (quai.hp / (quai.maxHp || 4000)) * 100) + '%'; }
                        if (quai.hp <= 0) {
                            quai.isDead = true; if (typeof quai.playAnim === 'function') quai.playAnim('DIE'); else quai.mesh.visible = false;
                            if (quai.tagEl) quai.tagEl.style.display = 'none';
                            if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);
                            setTimeout(() => { quai.hp = quai.maxHp || 4000; quai.isDead = false; if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true; if (quai.tagEl) { quai.tagEl.querySelector('.hp-bar').style.width = '100%'; quai.tagEl.style.display = 'block'; } }, 5000);
                        } else { if (typeof quai.playAnim === 'function') quai.playAnim('HIT'); }
                    }
                }
            });
        }
    }

    function taoSongXungKichLT(viTri, upV, mauSac = 0xff3300, scaleMax = 20) {
        const geo = new THREE.RingGeometry(0.1, 2, 32);
        const mat = new THREE.MeshBasicMaterial({ color: mauSac, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(viTri).add(upV.clone().multiplyScalar(0.5)); 
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upV);
        scene.add(mesh);
        hieuUngLuyenThe.push({ mesh: mesh, life: 1.0, scaleMax: scaleMax, type: 'shockwave' });
    }

    window.tungComboLuyenThe = function (phim, isRemote = false) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc || isRemote) return;

        let bayGio = Date.now();
        if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
        choHoiChieu[phim] = bayGio;

        let viTriGoc = nvc.position.clone();
        let targetQuai = layQuaiVatGanNhatLT(viTriGoc);

        if (targetQuai) {
            // ✂️ ANIMATION CANCELING: Phá khóa để lướt ngay lập tức
            window.dangMuaChieu = false; 
            
            const dameChiTiet = { 'Q': 0.4, 'E': 0.5, 'R': 0.8, 'F': 1.5 };
            
            // Chuyển trạng thái sang Lướt
            window.trangThaiLT.state = 'DASHING';
            window.trangThaiLT.target = targetQuai;
            window.trangThaiLT.skillKey = phim;
            window.trangThaiLT.dameRatio = dameChiTiet[phim];
        }
    };

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_luyenthe')) {
        window.HePhaiHienTai = {
            tenPhai: "Luyện Thể",
            khoiTao: function () {
                console.log("🔥 Bá Vương Cận Chiến Luyện Thể Đã Sẵn Sàng!");
                const vuKhiLoader = new THREE.GLTFLoader();
                if (window.loaderSieuToc) vuKhiLoader.setDRACOLoader(window.loaderSieuToc);

                vuKhiLoader.load(window.WEAPON_URL || 'uploads/anims/BAOTAY.glb', (gltf) => {
                    window.vuKhiModel = gltf.scene;
                    let xuongTayPhai = null;
                    let modelNguoi = window.nhanVatChinh || window.playerModel; 
                    modelNguoi.traverse(c => {
                        if (c.isBone && (c.name.toLowerCase().includes('hand_r') || c.name.toLowerCase().includes('righthand'))) {
                            xuongTayPhai = c;
                        }
                    });
                    if (xuongTayPhai) {
                        xuongTayPhai.add(window.vuKhiModel);
                        window.vuKhiModel.position.set(0, 0, 0); 
                        window.vuKhiModel.scale.set(3, 3, 3); 
                    } else {
                        modelNguoi.add(window.vuKhiModel); window.vuKhiModel.position.set(-1, 5, 1);
                    }
                });
            },
            tungChieu: function (phim, isRemote = false) { 
                window.tungComboLuyenThe(phim, isRemote); 
            },
            vongLapVatLy: function () {
                let nvc = window.playerModel;
                if (!nvc) return;

                // ===================================================
                // 🚀 BỘ VẬT LÝ CHIẾN ĐẬU: LƯỚT VÀ ĐẤM (GENSHIN STYLE)
                // ===================================================
                if (window.trangThaiLT.state === 'DASHING' && window.trangThaiLT.target) {
                    let t = window.trangThaiLT.target;
                    if (t.isDead) { window.trangThaiLT.state = 'IDLE'; return; }
                    
                    let tHit = window.layHitbox(t.mesh);
                    let myHit = window.layHitbox(nvc);
                    
                    // 🌟 KHÓA TÂM NGỰC: Bay tới ngang ngực địch, giữ chân chạm đất
                    let diemDen = tHit.tamNguc.clone();
                    diemDen.y -= (myHit.chieuCao / 2); 
                    
                    let khoangCach = nvc.position.distanceTo(diemDen);
                    
                    // Hướng mặt thẳng vào ngực Boss
                    nvc.lookAt(new THREE.Vector3(tHit.tamNguc.x, nvc.position.y, tHit.tamNguc.z));
                    
                    if (khoangCach > 2.2) {
                        // 💨 ĐANG LƯỚT: Lerp nội suy tốc độ cao (0.25)
                        nvc.position.lerp(diemDen, 0.25); 
                        
                        // 🎥 CAMERA SOFT-LOCK: Trượt nhẹ theo lưng nhân vật
                        if (window.controls) window.controls.target.lerp(tHit.tamNguc, 0.1);
                    } 
                    else {
                        // 💥 CHẠM MẶT -> ĐẤM!
                        window.trangThaiLT.state = 'HITTING';
                        
                        // 1. KHO ANIMATION NGẪU NHIÊN CHUẨN XÁC (Chỉ bốc chiêu Tấn công)
                        let pool = Object.keys(window.animationsMapChar || {}).filter(k => 
                            k.includes('ATTACK') || k.includes('SKILL') || k.includes('CHIEU') || k.includes('PUNCH') || k.includes('KICK')
                        );
                        // Cứu cánh nếu model tải trên mạng về đặt tên không chuẩn
                        let randomAnim = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'BAY';
                        
                        // Kích hoạt múa ngay lập tức
                        if(typeof window.playAnim === 'function') window.playAnim(randomAnim);
                        
                        // 2. TẠO VÙNG SÁT THƯƠNG 2M (Bám theo tâm ngực địch)
                        let banKinhNo = (window.trangThaiLT.skillKey === 'F') ? 15 : 5;
                        taoSongXungKichLT(tHit.tamNguc, new THREE.Vector3(0,1,0), 0xffaa00, banKinhNo);
                        gaySatThuongLT(tHit.tamNguc, (window.DAME_CUA_TOI || 200) * window.trangThaiLT.dameRatio, banKinhNo);
                        
                        // 3. GENSHIN HIT-STOP: Khựng thời gian 0.1s để tạo uy lực
                        if(window.currentActionChar) {
                            window.currentActionChar.setEffectiveTimeScale(0.01);
                            setTimeout(() => { if(window.currentActionChar) window.currentActionChar.setEffectiveTimeScale(1.5); }, 100);
                        }
                        
                        // 4. CAMERA SHAKE: Rung màn hình khi vung nắm đấm
                        let camY = camera.position.y; let camX = camera.position.x;
                        let shake = setInterval(() => { 
                            camera.position.y = camY + (Math.random()-0.5) * 1.5; 
                            camera.position.x = camX + (Math.random()-0.5) * 1.5; 
                        }, 20);
                        setTimeout(() => { 
                            clearInterval(shake); 
                            camera.position.y = camY; camera.position.x = camX; 
                        }, 120);
                        
                        // Xả trạng thái để chờ nhấp phím mới (Cancel Anim)
                        setTimeout(() => { if(window.trangThaiLT.state === 'HITTING') window.trangThaiLT.state = 'IDLE'; }, 300);
                    }
                }

                // ===================================================
                // ♻️ DỌN DẸP RÁC ĐỒ HỌA
                // ===================================================
                for (let i = hieuUngLuyenThe.length - 1; i >= 0; i--) {
                    let h = hieuUngLuyenThe[i];
                    h.life -= 0.05;
                    let scaleSize = h.scaleMax * (1 - h.life);
                    h.mesh.scale.set(scaleSize, scaleSize, scaleSize);
                    h.mesh.material.opacity = h.life;
                    if (h.life <= 0) { 
                        if (typeof window.donRac3D === 'function') window.donRac3D(h.mesh); 
                        hieuUngLuyenThe.splice(i, 1); 
                    }
                }
                for (let i = danhSachSoBayLT.length - 1; i >= 0; i--) {
                    let item = danhSachSoBayLT[i];
                    item.offsetY += 0.05; item.life--;
                    const screenPos = item.pos.clone(); screenPos.y += item.offsetY; screenPos.project(camera);
                    if (screenPos.z < 1) {
                        item.el.style.left = `${(screenPos.x * 0.5 + 0.5) * window.innerWidth}px`;
                        item.el.style.top = `${(screenPos.y * -0.5 + 0.5) * window.innerHeight}px`;
                    } else { item.el.style.display = 'none'; }
                    if (item.life < 20) item.el.style.opacity = item.life / 20;
                    if (item.life <= 0) { item.el.remove(); danhSachSoBayLT.splice(i, 1); window.tongSoChuNoi_LT--; }
                }
            },
            capNhat: function () {} 
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
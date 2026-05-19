// ==========================================
// 🥊 HỆ THỐNG KỸ NĂNG: LUYỆN THỂ (V21 - BẠO CHÚA CẬN CHIẾN & GENSHIN CAMERA)
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
        if (window.isMobile) return; // 🌟 CỨU SỐNG CPU MOBILE! Khóa 100% số nổi như các phái khác
        if(satThuong <= 0) return;
        window.tongSoChuNoi_LT++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000, -2px -2px 0px #000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999; transition: 0.1s;`;
        document.body.appendChild(div);
        
        // Rung nhẹ số sát thương để tạo lực
        setTimeout(() => { div.style.transform = `scale(1.5)`; }, 20);
        setTimeout(() => { div.style.transform = `scale(1.0)`; }, 100);

        danhSachSoBayLT.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // ⏳ HỆ 16 GIÂY (2 VÒNG COMBO): Tất cả các chiêu đều hồi 8 giây để tạo vòng lặp mượt mà
    const THOI_GIAN_HOI = { 'Q': 8000, 'E': 8000, 'R': 8000, 'F': 8000 };
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
        
        // 🩸 HÀM NỘI TẠI DÙNG CHUNG: HÚT MÁU KHI ĐẤM TRÚNG ĐÍCH
        function kichHoatHutMau() {
            let nvc = window.playerModel || window.nhanVatChinh;
            if (nvc && nvc.hp < (nvc.maxHp || 1000)) {
                // Hút 5% lượng sát thương gây ra
                nvc.hp = Math.min((nvc.maxHp || 1000), nvc.hp + (luongSatThuong * 0.05));
                if (document.getElementById('health-bar')) document.getElementById('health-bar').style.width = (nvc.hp / (nvc.maxHp || 1000) * 100) + '%';
            }
        }

        // 1. Quét người chơi khác (PVP - Đồ Sát)
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongLT(posHienSo, luongSatThuong, '#ffaa00');
                        
                        kichHoatHutMau(); // 🌟 Bơm máu khi đấm trúng Người chơi
                        
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }
        
        // 2. Quét Quái / Boss (PVE)
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        
                        // 🌟 NẾU LÀ BOSS KHỔNG LỒ 
                        if (quai.isBoss) {
                            taoSoSatThuongLT(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            kichHoatHutMau(); // 🌟 Bơm máu khi đấm trúng Boss
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } 
                        // 🌟 NẾU LÀ QUÁI THƯỜNG
                        else {
                            quai.hp -= luongSatThuong; taoSoSatThuongLT(hit.tamNguc.clone(), luongSatThuong);
                            kichHoatHutMau(); // 🌟 Bơm máu khi đấm trúng Quái

                            if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (quai.hp / (quai.maxHp || 4000)) * 100) + '%'; }
                            if (quai.hp <= 0) {
                                quai.isDead = true; if (typeof quai.playAnim === 'function') quai.playAnim('DIE'); else quai.mesh.visible = false;
                                if (quai.tagEl) quai.tagEl.style.display = 'none';
                                if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);
                                setTimeout(() => { quai.hp = quai.maxHp || 4000; quai.isDead = false; if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true; if (quai.tagEl) { quai.tagEl.querySelector('.hp-bar').style.width = '100%'; quai.tagEl.style.display = 'block'; } }, 5000);
                            } else { if (typeof quai.playAnim === 'function') quai.playAnim('HIT'); }
                        }
                    }
                }
            });
        }
    }







    window.thoiDiemNoCuoiCungLT = window.thoiDiemNoCuoiCungLT || 0;

    function taoVuNoLT(pos, upV, mauHex, banKinh) {
        // VAN XẢ ĐỒ HỌA CHỐNG LAG MOBILE
        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungLT < 300) return;
        window.thoiDiemNoCuoiCungLT = bayGio;

        if (typeof window.phatAmThanhNo === 'function') window.phatAmThanhNo();

        const vfxGroup = new THREE.Group();
        vfxGroup.position.copy(pos);

        // --- LỚP 1: BÃO LỬA HẠT (PARTICLES) ---
        const soLuong = window.isMobile ? 5 : 125; // 🔻 Giảm 50% số lượng hạt
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = 0; posArr[i * 3 + 1] = 0; posArr[i * 3 + 2] = 0;
            let dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            let speed = 1 + Math.random() * 3; // 🔻 Giảm 50% tốc độ văng xa
            vels.push(dir.multiplyScalar(speed));
        }

        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        const texture = (typeof window.layTextureLua === 'function') ? window.layTextureLua() : null;
        const mat = new THREE.PointsMaterial({ 
            color: mauHex || 0xffddaa,
            size: window.isMobile ? 9.0 : 6.0, // 🔻 Giảm 50% kích cỡ của từng tia lửa
            map: texture, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false 
        });
        
        const pts = new THREE.Points(geo, mat);
        vfxGroup.add(pts);

        // --- LỚP 2: SÓNG XUNG KÍCH ---
        let songXungKich = null;
        // 🌟 KHÓA TRÊN MOBILE: Di động tắt luôn cái vòng tròn quét đất đi cho mượt
        if (!window.isMobile) {
            const geoSong = new THREE.RingGeometry(0.1, 2, 32);
            const matSong = new THREE.MeshBasicMaterial({
                color: mauHex || 0xffaa00, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            songXungKich = new THREE.Mesh(geoSong, matSong);
            songXungKich.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upV);
            songXungKich.position.add(upV.clone().multiplyScalar(0.5)); 
            vfxGroup.add(songXungKich);
        }

        scene.add(vfxGroup);

        hieuUngLuyenThe.push({
            group: vfxGroup, pts: pts, velocities: vels, songXungKich: songXungKich,
            life: window.isMobile ? 20 : 40, // 🔻 Giảm 50% thời gian sống của vụ nổ 
            maxScale: banKinh
        });
    }




    window.tungComboLuyenThe = function (phim, isRemote = false) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc || isRemote) return;

        let bayGio = Date.now();
        if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
        choHoiChieu[phim] = bayGio;

        let viTriGoc = nvc.position.clone();
        let targetQuai = layQuaiVatGanNhatLT(viTriGoc);
        
        // ✂️ ANIMATION CANCELING: Phá khóa để lướt ngay lập tức
        window.dangMuaChieu = false; 

        if (targetQuai) {
            // 💥 CHIA ĐỀU SÁT THƯƠNG: 8 nhịp đấm x 1.25 = 10.0 (Gây 1000 Dame nếu Dame Gốc là 100)
            const dameChiTiet = { 'Q': 1.25, 'E': 1.25, 'R': 1.25, 'F': 1.25 };
            
            // Chuyển trạng thái sang Lướt
            
            // Chuyển trạng thái sang Lướt
            window.trangThaiLT.state = 'DASHING';
            window.trangThaiLT.target = targetQuai;
            window.trangThaiLT.skillKey = phim;
            window.trangThaiLT.dameRatio = dameChiTiet[phim];



        } else {
            // 🌟 NẾU KHÔNG CÓ QUÁI: ĐẤM VÀO KHÔNG KHÍ
            window.trangThaiLT.state = 'IDLE'; 
            
            // 🌟 BẢN VÁ: Tìm đúng rương chiêu thức (Cưỡi thú thì MapChar, đi bộ thì Map gốc)
            let mapAnim = (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") ? window.animationsMapChar : window.animationsMap;
            let pool = Object.keys(mapAnim || {}).filter(k => 
                k.includes('ATTACK') || k.includes('SKILL') || k.includes('CHIEU') || k.includes('PUNCH') || k.includes('KICK') || k.includes('COMBO')
            );
            let randomAnim = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'BAY';
            if(typeof window.playAnim === 'function') window.playAnim(randomAnim);
            
            let nvcUp = nvc.up.clone().normalize();
            let banKinhNo = (phim === 'F') ? 15 : 5;
            taoVuNoLT(viTriGoc, nvcUp, 0xffaa00, banKinhNo);

        }
    };

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_luyenthe')) {



        window.HePhaiHienTai = {
            tenPhai: "Luyện Thể",
            khoiTao: function () {
                console.log("🔥 Bá Vương Cận Chiến Luyện Thể Đã Sẵn Sàng!");
                
                // 🌟 BƠM THUỐC TĂNG TRƯỞNG BÙ TRỪ LỖI XƯƠNG CỦA MODEL
                if (window.playerModel && (!window.MOUNT_URL || window.MOUNT_URL.trim() === "")) {
                    // Ép tỷ lệ to lên 1.6 lần để bằng kích cỡ các phái khác
                    window.playerModel.scale.multiplyScalar(1.6); 
                }

                const vuKhiLoader = new THREE.GLTFLoader();
                if (window.loaderSieuToc) vuKhiLoader.setDRACOLoader(window.loaderSieuToc);




                vuKhiLoader.load(window.WEAPON_URL || 'uploads/anims/BAOTAY.glb', (gltf) => {
                    window.vuKhiModel = gltf.scene;
                    let xuongTayPhai = null;
                    let modelNguoi = window.nhanVatChinh || window.playerModel; 
                    modelNguoi.traverse(c => {
                        if (c.isBone && (c.name.toLowerCase().includes('hand_r') || c.name.toLowerCase().includes('righthand') || c.name.toLowerCase().includes('hand.r'))) {
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
                        
                        // 1. KHO ANIMATION NGẪU NHIÊN: Chỉ Lọc các chiêu Tấn công
                        let mapAnim = (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") ? window.animationsMapChar : window.animationsMap;
                        let pool = Object.keys(mapAnim || {}).filter(k => 
                            k.includes('ATTACK') || k.includes('SKILL') || k.includes('CHIEU') || k.includes('PUNCH') || k.includes('KICK') || k.includes('COMBO')
                        );
                        let randomAnim = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'BAY';
                        
                        // Kích hoạt múa ngay lập tức
                        if(typeof window.playAnim === 'function') window.playAnim(randomAnim);
                        
                        // 2. TẠO VÙNG SÁT THƯƠNG 2M (Bám theo tâm ngực địch)
                        let banKinhNo = (window.trangThaiLT.skillKey === 'F') ? 15 : 5;
                        taoVuNoLT(tHit.tamNguc, nvc.up.clone().normalize(), 0xffaa00, banKinhNo);
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
                // ♻️ DỌN DẸP RÁC ĐỒ HỌA (BÃO LỬA CẬN CHIẾN V2)
                // ===================================================
                for (let i = hieuUngLuyenThe.length - 1; i >= 0; i--) {
                    let vfx = hieuUngLuyenThe[i];
                    vfx.life--;

                    // 1. Bay hạt lửa
                    let posArr = vfx.pts.geometry.attributes.position.array;
                    for (let j = 0; j < posArr.length / 3; j++) {
                        posArr[j * 3] += vfx.velocities[j].x;
                        posArr[j * 3 + 1] += vfx.velocities[j].y;
                        posArr[j * 3 + 2] += vfx.velocities[j].z;
                        
                        // Lực cản không khí
                        vfx.velocities[j].x *= 0.85; 
                        vfx.velocities[j].y *= 0.85;
                        vfx.velocities[j].z *= 0.85;
                    }
                    vfx.pts.geometry.attributes.position.needsUpdate = true;
                    
                    // 2. Tàn lửa mờ dần và hóa thành khói đen
                    vfx.pts.material.size += 0.2; // 🔻 Giảm 50% tốc độ phình to
                    vfx.pts.material.opacity = vfx.life / 40;
                    if (vfx.life < 25) vfx.pts.material.color.setHex(0xff3300); // Đỏ rực
                    if (vfx.life < 10) {
                        vfx.pts.material.color.setHex(0x111111); // Hóa khói
                        vfx.pts.material.blending = THREE.NormalBlending;
                    }

                    // 3. Phình to sóng xung kích (PC mới có)
                    if (vfx.songXungKich) {
                        let tienTrinh = 1 - (vfx.life / 40);
                        let scaleSong = vfx.maxScale * (tienTrinh * 0.75); // 🔻 Giảm 50% độ to của sóng quét mặt đất
                        vfx.songXungKich.scale.set(scaleSong, scaleSong, 1);
                        vfx.songXungKich.material.opacity = (vfx.life / 40) * 0.6;
                    }

                    // 4. Thiêu rụi VRAM
                    if (vfx.life <= 0) {
                        if (typeof window.donRac3D === 'function') window.donRac3D(vfx.group);
                        else scene.remove(vfx.group);
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
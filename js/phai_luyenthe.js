// ==========================================
// 🥊 HỆ THỐNG KỸ NĂNG: LUYỆN THỂ (V23 - BẠO CHÚA BERSERKER)
// 👑 CÔNG NGHỆ: CUỒNG HÓA 15S + KIẾM QUANG TÓE MÁU + ÁP SÁT CHẠM THỊT
// ==========================================

(function() {
    let kyNangLT = []; 
    let hieuUngLuyenThe = [];
    let danhSachSoBayLT = []; 

    window.trangThaiLT = {
        state: 'IDLE', 
        target: null,
        skillKey: null,
        dameRatio: 1,
        isBerserk: false,        // 🌟 Bật/tắt chế độ cuồng sát 15s
        berserkEndTime: 0,
        lastHitTime: 0
    };

    window.tongSoChuNoi_LT = 0; 
    function taoSoSatThuongLT(pos3D, satThuong, mauSac = '#ff0000') {
        if (window.isMobile) return; 
        if(satThuong <= 0) return;
        window.tongSoChuNoi_LT++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #330000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:38px; text-shadow:${bongChu}; pointer-events:none; z-index:9999; transition: 0.1s;`;
        document.body.appendChild(div);
        
        setTimeout(() => { div.style.transform = `scale(1.5)`; }, 20);
        setTimeout(() => { div.style.transform = `scale(1.0)`; }, 100);

        danhSachSoBayLT.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 7. ĐÚC MODEL KIẾM QUANG CHÉM CẬN CHIẾN
    function taoVatTheLT(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let danhSachMat = Array.isArray(c.material) ? c.material : [c.material];
                        danhSachMat.forEach(m => {
                            m.transparent = true;
                            if (m.color) m.color.setHex(0xffffff); // Kiếm quang chớp trắng
                        });
                    }
                });
                v.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(v);
                const size = new THREE.Vector3(); box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                let tiLeChuan = scaleSize / maxDim;
                v.scale.set(tiLeChuan, tiLeChuan, tiLeChuan);
                v.rotation.set(0, 0, 0);
                group.add(v);
            });
        }
        return group;
    }

    function layQuaiVatGanNhatLT(viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 80) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 80; 
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

        let targetQuai = null; let minDQuai = 80; 
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

    function gaySatThuongLT(tamNgucDich, luongSatThuong, banKinh) {
        
        // 🌟 1. NỘI TẠI HÚT MÁU HOẠT ĐỘNG CHUẨN XÁC TRÊN THANH UI
        function kichHoatHutMau() {
            let luongHut = Math.round(luongSatThuong * 0.05); // Hút 5%
            if (typeof window.mauBanThan !== 'undefined' && window.MAU_TOI_DA) {
                if (window.mauBanThan < window.MAU_TOI_DA) {
                    window.mauBanThan = Math.min(window.MAU_TOI_DA, window.mauBanThan + luongHut);
                    
                    let uiThanhMau = document.getElementById('thanhMauHienTai');
                    let uiSoMau = document.getElementById('soMauHienTai');
                    if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
                    if (uiSoMau) uiSoMau.innerText = Math.max(0, Math.round(window.mauBanThan)).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
                    
                    // Nảy số máu xanh lục báo hiệu hồi máu
                    if(window.playerModel) taoSoSatThuongLT(window.playerModel.position.clone().add(new THREE.Vector3(0,4,0)), luongHut, '#00ffcc');
                }
            }
        }

        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongLT(posHienSo, luongSatThuong, '#ffaa00');
                        kichHoatHutMau(); 
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }
        
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        if (quai.isBoss) {
                            taoSoSatThuongLT(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff0000');
                            kichHoatHutMau(); 
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } 
                        else {
                            quai.hp -= luongSatThuong; taoSoSatThuongLT(hit.tamNguc.clone(), luongSatThuong);
                            kichHoatHutMau(); 

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

    // 🌟 5. VỤ NỔ MỊN MÀNG TÓE MÁU (SỬA LẠI ĐÚNG YÊU CẦU CỦA SẾP)
    function taoVuNoLT(pos, upV, mauHex, banKinh) {
        if (typeof window.phatAmThanhNo === 'function') window.phatAmThanhNo();

        const vfxGroup = new THREE.Group();
        vfxGroup.position.copy(pos);

        const soLuong = window.isMobile ? 15 : 40; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upV);

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = 0; posArr[i * 3 + 1] = 0; posArr[i * 3 + 2] = 0;
            let dir = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize();
            let speed = 1 + Math.random() * 4; 
            dir.applyQuaternion(qNolo);
            vels.push(dir.multiplyScalar(speed));
        }

        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        
        // Tạo Texture Huyết Mãn (Đỏ Thẫm) 
        if (!window.textureMauLT) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(150, 0, 0, 1)');     // Đỏ thẫm cốt lõi
            gradient.addColorStop(0.4, 'rgba(100, 0, 0, 0.8)'); // Rìa máu
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureMauLT = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({ 
            color: 0xff0000, 
            size: window.isMobile ? 10.0 : 18.0, 
            map: window.textureMauLT, 
            transparent: true, opacity: 1.0, 
            blending: THREE.NormalBlending, // 🌟 BÍ THUẬT: Máu đục chân thực, không phát sáng!
            depthWrite: false 
        });
        
        const pts = new THREE.Points(geo, mat);
        vfxGroup.add(pts);

        // 🌟 2. ĐÃ XÓA SÓNG ÂM VÒNG TRÒN DƯỚI ĐẤT THEO LỆNH SẾP!
        scene.add(vfxGroup);

        hieuUngLuyenThe.push({
            group: vfxGroup, pts: pts, velocities: vels, 
            life: window.isMobile ? 20 : 35, maxScale: banKinh, upVector: upV.clone()
        });
    }

    function bốcChiêuTấnCôngNgẫuNhiên() {
        if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
            return window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
        }
        return 'ATTACK';
    }

    window.tungComboLuyenThe = function (phim, isRemote = false) {
        
        let dameGoc = window.DAME_CUA_TOI || 200;
        
        if (isRemote !== false) {
            let posNo = new THREE.Vector3();
            let upV = new THREE.Vector3(0, 1, 0); 
            let banKinhNo = (phim === 'F') ? 15 : 5;
            
            if (typeof taoVuNoLT === 'function') taoVuNoLT(posNo, upV, 0xff0000, banKinhNo);
            return; 
        }

        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc) return;

        // ========================================================
        // 🌟 4. KÍCH HOẠT CHẾ ĐỘ CUỒNG HÓA 15 GIÂY (BERSERK MODE)
        // ========================================================
        window.trangThaiLT.isBerserk = true;
        window.trangThaiLT.berserkEndTime = Date.now() + 15000; // 15 giây tàn sát
        window.trangThaiLT.skillKey = phim;
        window.dangMuaChieu = true;

        if (typeof window.hienThongBaoBoGoc === 'function') {
            window.hienThongBaoBoGoc("🩸 CUỒNG SÁT 15 GIÂY: ĐÁNH ĐIÊN CUỒNG!", "#ff0000");
        }

        // Bơm hiệu ứng máu nổ lên người báo hiệu Cuồng hóa
        taoVuNoLT(nvc.position.clone().add(new THREE.Vector3(0,2,0)), nvc.up || new THREE.Vector3(0,1,0), 0xff0000, 20);

        let viTriGoc = nvc.position.clone();
        let targetQuai = layQuaiVatGanNhatLT(viTriGoc);

        if (targetQuai) {
            const dameChiTiet = { 'Q': 1.0, 'E': 1.0, 'R': 1.0, 'F': 1.0 };
            window.trangThaiLT.state = 'DASHING';
            window.trangThaiLT.target = targetQuai;
            window.trangThaiLT.dameRatio = dameChiTiet[phim];
        } else {
            // Đánh gió nếu không có mục tiêu
            window.trangThaiLT.state = 'IDLE'; 
            let randomAnim = bốcChiêuTấnCôngNgẫuNhiên();
            if(typeof window.playAnim === 'function') window.playAnim(randomAnim);

            let nvcUp = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0,1,0);
            let fwd = new THREE.Vector3(); nvc.getWorldDirection(fwd); fwd.projectOnPlane(nvcUp).normalize();
            
            let kqGio = taoVatTheLT('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 20);
            kqGio.position.copy(viTriGoc).add(nvcUp.clone().multiplyScalar(3.5)).add(fwd.clone().multiplyScalar(2));
            kqGio.up.copy(nvcUp); kqGio.lookAt(viTriGoc.clone().add(nvcUp.clone().multiplyScalar(3.5)).add(fwd.clone().multiplyScalar(10)));
            kqGio.rotateZ((Math.random() - 0.5) * Math.PI);
            scene.add(kqGio);
            kyNangLT.push({ mesh: kqGio, life: 10, scale: 20 });

            setTimeout(() => { window.dangMuaChieu = false; }, 600);
        }
    };

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_luyenthe')) {

        window.HePhaiHienTai = {
            tenPhai: "Luyện Thể",
            khoiTao: function () {
                console.log("🔥 Luyện Thể Berserker Khởi động (Cuồng Sát 15s + Kiếm Quang Tóe Máu)!");

                // 🌟 7. TẢI SẴN KIẾM QUANG VÀO RAM
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    for(let i=1; i<=6; i++) {
                        window.taiHoacNhanBanAsset('uploads/anims/KIEMQUANG' + i + '.glb', () => {});
                    }
                }

                // 🌟 6. ĐỒNG BỘ RỔ ANIMATION CỦA CÁC PHÁI ĐOẠT XÁ
                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let ten = key.toLowerCase();
                        let clip = window.animationsMap[key];

                        const tuKhoaCam = ['hit', 'hurt', 'damage', 'die', 'death', 'dead', 'defend'];
                        if (tuKhoaCam.some(tuCam => ten.includes(tuCam))) continue;

                        const tuKhoaIdle = ['idle', 'wait', 'stand', 'pose', 'nhanroi', 'breath', 'stay', 'normal'];
                        if (tuKhoaIdle.some(tu => ten.includes(tu))) { window.KHO_ANIM_NHANROI.push(key); }

                        const tuKhoaRun = ['run', 'walk', 'move', 'dash', 'sprint', 'chay', 'di', 'forward', 'step'];
                        if (tuKhoaRun.some(tu => ten.includes(tu))) { coChay = true; animChay = clip; window.animationsMap['CHAYBO'] = clip; window.animationsMap['RUN'] = clip; }

                        const tuKhoaFly = ['fly', 'hover', 'float', 'bay', 'glide', 'BAY'];
                        if (tuKhoaFly.some(tu => ten.includes(tu))) { coBay = true; animBay = clip; window.animationsMap['BAY'] = clip; window.animationsMap['FLY'] = clip; }
                        
                        const tuKhoaTanCong = ['attack', 'atk', 'punch', 'kick', 'combo', 'skill', 'smash', 'strike', 'slash', 'chop', 'swing', 'bash', 'jab', 'hook', 'uppercut', 'chieu', 'danh', 'dam', 'da', 'chem', 'quat'];
                        if (tuKhoaTanCong.some(tu => ten.includes(tu))) { window.KHO_ANIM_TANCONG.push(key); }
                    }

                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }

                    if (window.KHO_ANIM_NHANROI.length > 0) {
                        let defaultIdle = window.KHO_ANIM_NHANROI[0];
                        window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                        if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                    }
                }
                
                if (window.playerModel && (!window.MOUNT_URL || window.MOUNT_URL.trim() === "")) {
                    window.playerModel.scale.multiplyScalar(1.6); 
                }
            },
            tungChieu: function (phim, isRemote = false) { 
                window.tungComboLuyenThe(phim, isRemote); 
            },
            vongLapVatLy: function () {
                let nvc = window.playerModel;
                if (!nvc) return;

                // ===================================================
                // 🚀 QUẢN LÝ VẬT LÝ VŨ KHÍ KIẾM QUANG
                // ===================================================
                for(let i = kyNangLT.length - 1; i >= 0; i--) {
                    let s = kyNangLT[i];
                    s.life--;
                    s.scale += 1.5; // To dần
                    s.mesh.scale.set(s.scale, s.scale, s.scale);
                    if(s.life <= 0) {
                        if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                        kyNangLT.splice(i, 1);
                    }
                }

                // ===================================================
                // 😈 CUỒNG SÁT 15 GIÂY (AUTO-FRENZY) & PHÁ KHÓA COOLDOWN
                // ===================================================
                if (window.trangThaiLT.isBerserk) {
                    let now = Date.now();
                    if (now > window.trangThaiLT.berserkEndTime) {
                        window.trangThaiLT.isBerserk = false; // Hết 15s thì tự tắt
                        window.dangMuaChieu = false;
                        if(typeof window.playAnim === 'function') window.playAnim('NHANROI');
                    } else {
                        // PHÁ KHÓA BẢNG ĐIỀU KHIỂN: Giữ cho UI lúc nào cũng sáng đèn để spam
                        if (window.cd_thoiDiemBopCo) {
                            window.cd_thoiDiemBopCo['Q'] = 0; window.cd_thoiDiemBopCo['E'] = 0;
                            window.cd_thoiDiemBopCo['R'] = 0; window.cd_thoiDiemBopCo['F'] = 0;
                        }

                        // AUTO ĐÁNH: Nếu đang rảnh tay, tự tìm mồi chém tiếp!
                        if (window.trangThaiLT.state === 'IDLE' && now - window.trangThaiLT.lastHitTime > 300) {
                            let mienMoi = layQuaiVatGanNhatLT(nvc.position);
                            if (mienMoi) {
                                window.trangThaiLT.target = mienMoi;
                                window.trangThaiLT.state = 'DASHING';
                                window.dangMuaChieu = true;
                            }
                        }
                    }
                }

                // ===================================================
                // 🚀 BỘ VẬT LÝ CHIẾN ĐẬU (LƯỚT NHANH VÀ ĐẤM)
                // ===================================================
                if (window.trangThaiLT.state === 'DASHING' && window.trangThaiLT.target) {
                    let t = window.trangThaiLT.target;
                    if (t.isDead || t.hp <= 0) { window.trangThaiLT.state = 'IDLE'; return; }
                    
                    let tHit = window.layHitbox(t.mesh);
                    let myHit = window.layHitbox(nvc);
                    
                    let diemDen = tHit.tamNguc.clone();
                    diemDen.y -= (myHit.chieuCao / 2); 
                    
                    let curUp = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0,1,0);
                    let vecToTarget = new THREE.Vector3().subVectors(diemDen, nvc.position);
                    let distNgang = vecToTarget.clone().projectOnPlane(curUp).length(); // Đo khoảng cách ngang

                    // Xoay mặt về mục tiêu
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(nvc.position);
                    dummy.up.copy(curUp);
                    let fwd = vecToTarget.clone().projectOnPlane(curUp).normalize();
                    if (fwd.lengthSq() > 0) {
                        dummy.lookAt(nvc.position.clone().add(fwd));
                        nvc.quaternion.slerp(dummy.quaternion, 0.4); 
                    }
                    
                    // 🌟 3. ÁP SÁT "CHẠM THỊT": Lướt với tốc độ nhanh chứ không tàng hình
                    if (distNgang > 1.2) { 
                        let tocDoChay = 3.5; // Tốc độ chạy rất nhanh (tương đương 100km/h)
                        nvc.position.add(fwd.multiplyScalar(tocDoChay));
                        
                        if (typeof window.playAnim === 'function') window.playAnim('CHAYBO');
                        if (window.controls) window.controls.target.lerp(tHit.tamNguc, 0.1);
                    } 
                    else {
                        // ĐÃ CHẠM MẶT -> TUNG SKILL!
                        window.trangThaiLT.state = 'HITTING';
                        window.trangThaiLT.lastHitTime = Date.now();
                        
                        let randomAtk = bốcChiêuTấnCôngNgẫuNhiên();
                        if(typeof window.playAnim === 'function') window.playAnim(randomAtk);

                        // 🌟 7. GỌI KIẾM QUANG CHÉM QUA NGƯỜI QUÁI TRƯỚC KHI MÁU XỊT
                        let kq = taoVatTheLT('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 25);
                        kq.position.copy(tHit.tamNguc);
                        kq.up.copy(curUp);
                        kq.lookAt(nvc.position); // Chém vát về phía màn hình Sếp
                        kq.rotateZ((Math.random() - 0.5) * Math.PI); 
                        scene.add(kq);
                        kyNangLT.push({ mesh: kq, life: 12, scale: 15 });

                        // 🌟 TÓE MÁU VÀ TRỪ MÁU ĐỒNG THỜI
                        let banKinhNo = (window.trangThaiLT.skillKey === 'F') ? 15 : 5;
                        taoVuNoLT(tHit.tamNguc, curUp, 0xff0000, banKinhNo);
                        gaySatThuongLT(tHit.tamNguc, (window.DAME_CUA_TOI || 200) * window.trangThaiLT.dameRatio, banKinhNo);
                        
                        // Khựng màn hình tạo cảm giác "chặt chém" nặng nề
                        if(window.currentActionChar) {
                            window.currentActionChar.setEffectiveTimeScale(0.01);
                            setTimeout(() => { if(window.currentActionChar) window.currentActionChar.setEffectiveTimeScale(1.5); }, 100);
                        }
                        
                        // Rung Camera
                        let camY = camera.position.y; let camX = camera.position.x;
                        let shake = setInterval(() => { 
                            camera.position.y = camY + (Math.random()-0.5) * 1.5; 
                            camera.position.x = camX + (Math.random()-0.5) * 1.5; 
                        }, 20);
                        setTimeout(() => { 
                            clearInterval(shake); 
                            camera.position.y = camY; camera.position.x = camX; 
                        }, 120);
                        
                        // Sau cú đấm thì về IDLE chờ nhịp tiếp theo của Cuồng Hóa
                        setTimeout(() => { if(window.trangThaiLT.state === 'HITTING') window.trangThaiLT.state = 'IDLE'; }, 300);
                    }
                }

                // ===================================================
                // ♻️ DỌN DẸP RÁC MÁU VÀ SỐ DAME 
                // ===================================================
                for (let i = hieuUngLuyenThe.length - 1; i >= 0; i--) {
                    let vfx = hieuUngLuyenThe[i];
                    vfx.life--;

                    let fallVec = vfx.upVector ? vfx.upVector.clone().multiplyScalar(-0.15) : new THREE.Vector3(0, -0.15, 0);

                    let posArr = vfx.pts.geometry.attributes.position.array;
                    for (let j = 0; j < posArr.length / 3; j++) {
                        posArr[j * 3] += vfx.velocities[j].x;
                        posArr[j * 3 + 1] += vfx.velocities[j].y;
                        posArr[j * 3 + 2] += vfx.velocities[j].z;
                        
                        vfx.velocities[j].x *= 0.85; 
                        vfx.velocities[j].z *= 0.85;
                        vfx.velocities[j].add(fallVec); // Máu rơi xuống đất
                    }
                    vfx.pts.geometry.attributes.position.needsUpdate = true;
                    
                    vfx.pts.material.size += 0.3; // Máu nở ra
                    vfx.pts.material.opacity = vfx.life / 35;

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
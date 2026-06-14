// ==========================================
// 🥊 HỆ THỐNG KỸ NĂNG: LUYỆN THỂ (V22 - BẠO CHÚA CẬN CHIẾN & GENSHIN CAMERA)
// 👑 CÔNG NGHỆ: TỐI ƯU RỔ ANIMATION + CĂN CHỈNH COOLDOWN 4S + SỬA LỖI HÚT MÁU
// ==========================================

(function() {
    let hieuUngLuyenThe = [];
    let danhSachSoBayLT = []; 

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_LT = 0; 

    // 🌟 TRẠNG THÁI CẬN CHIẾN ĐỘC QUYỀN
    window.trangThaiLT = {
        state: 'IDLE', // IDLE, DASHING, HITTING
        target: null,
        skillKey: null,
        dameRatio: 1
    };

    function taoSoSatThuongLT(pos3D, satThuong, mauSac = '#ff2222') {
        if (window.isMobile) return; 
        if(satThuong <= 0) return;
        window.tongSoChuNoi_LT++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000, -2px -2px 0px #000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999; transition: 0.1s;`;
        document.body.appendChild(div);
        
        setTimeout(() => { div.style.transform = `scale(1.5)`; }, 20);
        setTimeout(() => { div.style.transform = `scale(1.0)`; }, 100);

        danhSachSoBayLT.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    function layQuaiVatGanNhatLT(viTriGoc) {
        // 🌟 BẢN VÁ: Cấm khóa mục tiêu tay vào Sinh vật cảnh
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead && window.mucTieuHienTai.classCode !== 'TRANG_TRI') {
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
                // 🌟 BẢN VÁ AAA: Bơ đẹp bọn TRANG_TRI, chỉ khóa mục tiêu vào quái/boss đánh nhau!
                if (!quai.isDead && quai.mesh && quai.classCode !== 'TRANG_TRI') {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDQuai) { minDQuai = d; targetQuai = quai; }
                }
            });
        }

        return targetQuai;
    }

    function gaySatThuongLT(tamNgucDich, luongSatThuong, banKinh) {
        // 🌟 CHUẨN HÓA HÚT MÁU DỰA TRÊN BIẾN GLOBAL CỦA GAME
        function kichHoatHutMau() {
            if (typeof window.mauBanThan !== 'undefined' && typeof window.MAU_TOI_DA !== 'undefined' && window.mauBanThan < window.MAU_TOI_DA) {
                window.mauBanThan = Math.min(window.MAU_TOI_DA, window.mauBanThan + (luongSatThuong * 0.05));
                const uiThanhMau = document.getElementById('thanhMauHienTai');
                const uiSoMau = document.getElementById('soMauHienTai');
                if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
                if (uiSoMau) uiSoMau.innerText = Math.round(window.mauBanThan).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
            }
        }

        // 🛡️ BỘ LỌC CHỐNG CHÉM ĐÚP (VÁ LỖI 2 DÒNG MÁU KHÁC MÀU)
        let mucTieuDaXyLy = new Set();

        // 1. QUÉT NGƯỜI CHƠI (PVP)
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];

                // 🛑 LÁ CHẮN NHẬN DIỆN: Nếu Boss đang mượn lốt Người chơi để tung chiêu -> Đá nó ra khỏi luồng PVP!
                let laBossDangMuonId = false;
                if (typeof window.danhSachQuaiVat !== 'undefined') {
                    laBossDangMuonId = window.danhSachQuaiVat.some(q => String(q.id) === String(id) || "PLAYER_" + q.id === String(id) || "BOSS_" + q.id === String(id));
                }

                if (rp.status === 'ready' && rp.mesh && !laBossDangMuonId && !mucTieuDaXyLy.has(rp.mesh)) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        mucTieuDaXyLy.add(rp.mesh); // Đóng dấu đã ăn đòn
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);

                        taoSoSatThuongLT(posHienSo, luongSatThuong, '#ffaa00'); // Sát thương PVP màu Cam Vàng
                        kichHoatHutMau();
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }

        // 2. QUÉT QUÁI & BOSS (PVE)
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                // Chỉ đấm những đứa chưa ăn đòn ở luồng trên (nếu có)
                if (!quai.isDead && quai.mesh && !mucTieuDaXyLy.has(quai.mesh)) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        mucTieuDaXyLy.add(quai.mesh); // Đóng dấu đã ăn đòn

                        if (quai.isBoss) {
                            taoSoSatThuongLT(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff'); // Màu Tím cho Boss
                            kichHoatHutMau();
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong;
                            taoSoSatThuongLT(hit.tamNguc.clone(), luongSatThuong); // Màu Đỏ Mặc Định cho Quái thường
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

    window.thoiDiemNoCuoiCungLT = window.thoiDiemNoCuoiCungLT || 0;

    function taoVuNoLT(pos, upV, mauHex, banKinh) {
        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungLT < 300) return;
        window.thoiDiemNoCuoiCungLT = bayGio;

        if (typeof window.phatAmThanhNo === 'function') window.phatAmThanhNo();

        const vfxGroup = new THREE.Group();
        vfxGroup.position.copy(pos);

        const soLuong = window.isMobile ? 5 : 125; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = 0; posArr[i * 3 + 1] = 0; posArr[i * 3 + 2] = 0;
            let dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            let speed = 1 + Math.random() * 3; 
            vels.push(dir.multiplyScalar(speed));
        }

        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        const texture = (typeof window.layTextureLua === 'function') ? window.layTextureLua() : null;
        const mat = new THREE.PointsMaterial({ 
            color: mauHex || 0xffddaa,
            size: window.isMobile ? 9.0 : 6.0, 
            map: texture, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false 
        });
        
        const pts = new THREE.Points(geo, mat);
        vfxGroup.add(pts);

        // 🌟 VÁ LỖI 3: ĐÃ XÓA HIỆU ỨNG SÓNG ÂM (RingGeometry) ĐỂ GIẢM RÁC DOM VÀ NHẸ GAME

        scene.add(vfxGroup);

        hieuUngLuyenThe.push({
            group: vfxGroup, pts: pts, velocities: vels,
            life: window.isMobile ? 20 : 40, 
            maxScale: banKinh
        });
    }

    window.tungComboLuyenThe = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        
        let dameGoc = window.DAME_CUA_TOI || 100;
        
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
            
            let posNo = remoteDich ? new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z) : (remoteGoc ? new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z) : new THREE.Vector3());
            let upV = new THREE.Vector3(0, 1, 0); 
            let banKinhNo = (phim === 'F') ? 15 : 5;
            
            if (typeof taoVuNoLT === 'function') taoVuNoLT(posNo, upV, 0xffaa00, banKinhNo);
            
            if (typeof isRemote === 'number' && isRemote > 0) {
                if (typeof window.gaySatThuongBossToPlayer === 'function') {
                    window.gaySatThuongBossToPlayer(posNo, dameGoc * 1.0, banKinhNo); 
                }
            }
            return; 
        }

        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc) return;

        // 🌟 VÁ LỖI 4: XÓA SẠCH KIỂM TRA HỒI CHIÊU CỤC BỘ Ở ĐÂY (Để Controller lo)


        let viTriGoc = nvc.position.clone();
        let targetQuai = layQuaiVatGanNhatLT(viTriGoc);
        
        window.dangMuaChieu = true; 

        if (window.room && window.room.localParticipant) {




            let fwd = new THREE.Vector3(); nvc.getWorldDirection(fwd);
            let dichDen = targetQuai ? window.layHitbox(targetQuai.mesh || targetQuai).tamNguc : viTriGoc.clone().add(fwd.clone().multiplyScalar(5));
            const data = new TextEncoder().encode(JSON.stringify({ 
                type: 'TUNG_CHIEU', skillType: phim, className: 'LuyenThe', 
                origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: dichDen.x, y: dichDen.y, z: dichDen.z }, dir: { x: fwd.x, y: fwd.y, z: fwd.z },
                weaponUrl: null 
            }));
            window.room.localParticipant.publishData(data, { reliable: true });
        }

        if (targetQuai) {
            const dameChiTiet = { 'Q': 1.0, 'E': 1.0, 'R': 1.0, 'F': 1.0 };
            window.trangThaiLT.state = 'DASHING';
            window.trangThaiLT.target = targetQuai;
            window.trangThaiLT.skillKey = phim;
            window.trangThaiLT.dameRatio = dameChiTiet[phim];



        } else {
            window.trangThaiLT.state = 'IDLE';
            let randomAnim = window.KHO_ANIM_TANCONG.length > 0 ? window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)] : 'BAY';
            if (typeof window.playAnim === 'function') window.playAnim(randomAnim);

            let nvcUp = nvc.up.clone().normalize();
            let banKinhNo = (phim === 'F') ? 15 : 5;
            taoVuNoLT(viTriGoc, nvcUp, 0xffaa00, banKinhNo);

            // 🌟 NHẢ KHÓA SAU 800MS ĐỂ CHẠY TIẾP ĐƯỢC
            if (window.henGioTatMuaLT) clearTimeout(window.henGioTatMuaLT);
            window.henGioTatMuaLT = setTimeout(() => { window.dangMuaChieu = false; }, 800);
        }


    };

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('canchien')) {

        window.HePhaiHienTai = {
            tenPhai: "Luyện Thể",
            khoiTao: function () {
                console.log("🔥 Bá Vương Cận Chiến Luyện Thể Đã Sẵn Sàng!");

                // 🌟 VÁ LỖI 4: SET LẠI THÔNG SỐ COOLDOWN VỀ 4 GIÂY ĐỒNG BỘ VỚI CONTROLLER
                window.cd_thongSoHoi = { 'Q': 4000, 'E': 4000, 'R': 4000, 'F': 4000 };

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let ten = key.toLowerCase();
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];

                        // 🌟 VÁ LỖI 2: MỞ KHÓA HOẠT ẢNH 'CHET', LOẠI NÓ KHỎI TỪ KHÓA CẤM
                        const tuKhoaCam = ['hit', 'hurt', 'damage', 'defend', 'block', 'guard', 'take', 'receive'];
                        if (tuKhoaCam.some(tuCam => ten.includes(tuCam))) continue;

                        if (ten.includes('die') || ten.includes('death') || ten.includes('dead') || ten.includes('chet')) {
                            window.animationsMap['CHET'] = clip;
                            continue; // Bỏ qua không nhét vào rổ đánh hay nhàn rỗi
                        }

                        // Diệt root motion chống giật lùi
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('CHIEU') || k.includes('COMBO') || k.includes('PUNCH') || k.includes('KICK')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position')) {
                                        const danhSachDen = ['armature', 'hip', 'pelvis', 'root', 'bip', 'center', 'spine', 'object', 'dummy', 'bone'];
                                        for (let tuKhoa of danhSachDen) {
                                            if (tenTrack.includes(tuKhoa)) return false; 
                                        }
                                    }
                                    return true; 
                                });
                            }
                        }

                        const tuKhoaIdle = ['idle', 'wait', 'stand', 'pose', 'nhanroi', 'breath', 'stay', 'normal'];
                        if (tuKhoaIdle.some(tu => ten.includes(tu))) { window.KHO_ANIM_NHANROI.push(key); }

                        const tuKhoaRun = ['run', 'walk', 'move', 'dash', 'sprint', 'chay', 'di', 'forward', 'step'];
                        if (tuKhoaRun.some(tu => ten.includes(tu))) { coChay = true; animChay = clip; window.animationsMap['CHAYBO'] = clip; window.animationsMap['RUN'] = clip; }

                        const tuKhoaFly = ['fly', 'hover', 'float', 'bay', 'glide', 'BAY'];
                        if (tuKhoaFly.some(tu => ten.includes(tu))) { coBay = true; animBay = clip; window.animationsMap['BAY'] = clip; window.animationsMap['FLY'] = clip; }

                        // 🌟 VÁ LỖI 1: GOM HOẠT ẢNH TẤN CÔNG VÀO RỔ
                        const tuKhoaTanCong = [
                            'attack', 'atk', 'punch', 'kick', 'combo', 'skill', 'smash', 'strike', 
                            'slash', 'chop', 'swing', 'bash', 'jab', 'hook', 'uppercut', 'bite', 
                            'claw', 'slam', 'cast', 'magic', 'ultimate', 'ulti', 'special', 'finisher',
                            'chieu', 'danh', 'dam', 'da', 'chem', 'quat', 'tuyetchieu', 'kynang',
                            'kougeki', 'panchi', 'keri', 'action'
                        ];
                        if (tuKhoaTanCong.some(tuKhoa => ten.includes(tuKhoa))) { window.KHO_ANIM_TANCONG.push(key); }
                    }

                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }

                    if (window.KHO_ANIM_NHANROI.length === 0) {
                        window.KHO_ANIM_NHANROI.push(Object.keys(window.animationsMap)[0] || 'IDLE');
                    }
                    if (window.KHO_ANIM_TANCONG.length === 0) {
                        window.KHO_ANIM_TANCONG.push(Object.keys(window.animationsMap)[0] || 'ATTACK');
                    }

                    let defaultIdle = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
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

                if (window.trangThaiLT.state === 'DASHING' && window.trangThaiLT.target) {
                    let t = window.trangThaiLT.target;
                    if (t.isDead) { window.trangThaiLT.state = 'IDLE'; return; }
                    
                    let tHit = window.layHitbox(t.mesh);
                    let myHit = window.layHitbox(nvc);
                    
                    let diemDen = tHit.tamNguc.clone();
                    diemDen.y -= (myHit.chieuCao / 2); 
                    
                    let khoangCach = nvc.position.distanceTo(diemDen);
                    
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(nvc.position);
                    dummy.up.copy(nvc.up);

                    let vecToTarget = new THREE.Vector3().subVectors(tHit.tamNguc, nvc.position);
                    let vertComp = vecToTarget.clone().projectOnVector(nvc.up);
                    vecToTarget.sub(vertComp);

                    dummy.lookAt(nvc.position.clone().add(vecToTarget));
                    nvc.quaternion.slerp(dummy.quaternion, 0.3); 
                    
                    if (khoangCach > 2.2) {
                        nvc.position.lerp(diemDen, 0.25); 
                        if (window.controls) window.controls.target.lerp(tHit.tamNguc, 0.1);
                    } 
                    else {
                        window.trangThaiLT.state = 'HITTING';
                        
                        // 🌟 VÁ LỖI 1: TẬN DỤNG RỔ ANIMATION VỪA QUÉT LÚC NÃY
                        let randomAnim = window.KHO_ANIM_TANCONG.length > 0 ? window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)] : 'BAY';
                        if(typeof window.playAnim === 'function') window.playAnim(randomAnim);
                         
                        let banKinhNo = (window.trangThaiLT.skillKey === 'F') ? 15 : 5;
                        taoVuNoLT(tHit.tamNguc, nvc.up.clone().normalize(), 0xffaa00, banKinhNo);
                        gaySatThuongLT(tHit.tamNguc, (window.DAME_CUA_TOI || 200) * window.trangThaiLT.dameRatio, banKinhNo);
                        
                        if(window.currentActionChar) {
                            window.currentActionChar.setEffectiveTimeScale(0.01);
                            setTimeout(() => { if(window.currentActionChar) window.currentActionChar.setEffectiveTimeScale(1.5); }, 100);
                        }
                        
                        let camY = camera.position.y; let camX = camera.position.x;
                        let shake = setInterval(() => { 
                            camera.position.y = camY + (Math.random()-0.5) * 1.5; 
                            camera.position.x = camX + (Math.random()-0.5) * 1.5; 
                        }, 20);
                        setTimeout(() => { 
                            clearInterval(shake); 
                            camera.position.y = camY; camera.position.x = camX; 
                        }, 120);
                        
                        // 🌟 TỰ ĐỘNG THU TAY VỀ SAU KHI ĐẤM TRÚNG (800MS)
                        if (window.henGioTatMuaLT) clearTimeout(window.henGioTatMuaLT);
                        window.henGioTatMuaLT = setTimeout(() => {
                            if (window.trangThaiLT.state === 'HITTING') {
                                window.trangThaiLT.state = 'IDLE';
                                window.dangMuaChieu = false;
                                if (typeof window.playAnim === 'function') window.playAnim('NHANROI');
                            }
                        }, 800);
                    }
                }

                for (let i = hieuUngLuyenThe.length - 1; i >= 0; i--) {
                    let vfx = hieuUngLuyenThe[i];
                    vfx.life--;

                    let posArr = vfx.pts.geometry.attributes.position.array;
                    for (let j = 0; j < posArr.length / 3; j++) {
                        posArr[j * 3] += vfx.velocities[j].x;
                        posArr[j * 3 + 1] += vfx.velocities[j].y;
                        posArr[j * 3 + 2] += vfx.velocities[j].z;
                        vfx.velocities[j].x *= 0.85; 
                        vfx.velocities[j].y *= 0.85;
                        vfx.velocities[j].z *= 0.85;
                    }
                    vfx.pts.geometry.attributes.position.needsUpdate = true;
                    
                    vfx.pts.material.size += 0.2; 
                    vfx.pts.material.opacity = vfx.life / 40;
                    if (vfx.life < 25) vfx.pts.material.color.setHex(0xff3300); 
                    if (vfx.life < 10) {
                        vfx.pts.material.color.setHex(0x111111); 
                        vfx.pts.material.blending = THREE.NormalBlending;
                    }

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
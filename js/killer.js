// ==========================================
// 🪚 MÔN PHÁI CẬN CHIẾN: THỢ SĂN KILLER (KAMAZO)
// 👑 CÔNG NGHỆ: DASH-LERPING + HIT-STOP PHYSICS + ROOT MOTION BLACKLIST V2
// ==========================================

(function () {
    const hieuUngKiller = [];
    const danhSachSoBayKiller = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Killer = 0;

    // 🌟 BỘ NÃO VẬT LÝ CẬN CHIẾN ĐỘC QUYỀN CỦA KILLER
    window.trangThaiKiller = {
        state: 'IDLE', // Trạng thái: IDLE (Nhàn rỗi), DASHING (Đang lướt), HITTING (Đang chém)
        target: null,
        skillKey: null,
        dameRatio: 1
    };

    // 🌟 1. HIỂN THỊ SÁT THƯƠNG (MÀU CYAN - ÂM KIẾM)
    function taoSoSatThuongKiller(pos3D, satThuong, mauSac = '#00e5ff') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_Killer > 5) return;
        window.tongSoChuNoi_Killer++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #006680';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        
        // Rung nhẹ số sát thương để tạo cảm giác lực chém mạnh
        setTimeout(() => { div.style.transform = `scale(1.5)`; }, 20);
        setTimeout(() => { div.style.transform = `scale(1.0)`; }, 100);

        danhSachSoBayKiller.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 2. RADAR TÌM KIẾM (Ưu tiên người chơi trước, quái sau)
    window.layMucTieuGanNhatKiller = function (viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 200) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 200;
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

        let targetQuai = null; let minDQuai = 200;
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minDQuai) { minDQuai = d; targetQuai = quai; }
                }
            });
        }
        return targetQuai;
    };

    function gaySatThuongKiller(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongKiller(posHienSo, luongSatThuong, '#00e5ff');
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        if (quai.isBoss) {
                            taoSoSatThuongKiller(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff0055');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongKiller(hit.tamNguc.clone(), luongSatThuong);
                            if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (quai.hp / (quai.maxHp || 4000)) * 100) + '%'; }
                            if (quai.hp <= 0) {
                                quai.isDead = true; if (typeof quai.playAnim === 'function') quai.playAnim('DIE'); else quai.mesh.visible = false;
                                if (quai.tagEl) quai.tagEl.style.display = 'none';
                                if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);
                                setTimeout(() => { quai.hp = quai.maxHp || 4000; quai.isDead = false; if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true; if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = '100%'; quai.tagEl.style.display = 'block'; } }, 5000);
                            } else { if (typeof quai.playAnim === 'function') quai.playAnim('HIT'); }
                        }
                    }
                }
            });
        }
    }

    // 🌟 3. HIỆU ỨNG CHÉM CẬN CHIẾN (SONIC SLASH)
    function taoHieuUngChemKiller(pos, nvc, isBig = false) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        else if (typeof window.playSound === 'function') window.playSound('hit');

        const vfxGroup = new THREE.Group();
        vfxGroup.position.copy(pos);

        // -- Vòng sóng âm chém ngang (Slash Ring) --
        const geoSong = new THREE.RingGeometry(0.1, isBig ? 15 : 8, 32);
        const matSong = new THREE.MeshBasicMaterial({
            color: 0x00e5ff, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const songXungKich = new THREE.Mesh(geoSong, matSong);
        
        // Ngẫu nhiên nghiêng vòng chém để tạo cảm giác chém điên cuồng
        songXungKich.rotation.x = Math.random() * Math.PI;
        songXungKich.rotation.y = Math.random() * Math.PI;
        vfxGroup.add(songXungKich);

        // -- Tia lửa điện văng ra --
        const soLuong = isBig ? 60 : 25; 
        const geoPts = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        let huongMat = new THREE.Vector3(); 
        if (nvc) { nvc.getWorldDirection(huongMat); huongMat.normalize(); }
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = 0; posArr[i*3+1] = 0; posArr[i*3+2] = 0;
            // Văng tia lửa về phía trước mặt
            let vec = new THREE.Vector3( (Math.random()-0.5)*2, Math.random()*2, (Math.random()-0.5)*2 ).add(huongMat).normalize();
            vels.push(vec.multiplyScalar(Math.random() * 3 + 1));
        }
        geoPts.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiKiller) {
            let canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   
            gradient.addColorStop(0.4, 'rgba(0, 229, 255, 0.9)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 32, 32);
            window.textureBuiKiller = new THREE.CanvasTexture(canvas);
        }

        const matPts = new THREE.PointsMaterial({
            color: 0x00ffff, size: window.isMobile ? 3.0 : 5.0, map: window.textureBuiKiller, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geoPts, matPts); 
        vfxGroup.add(pts);
        scene.add(vfxGroup);

        hieuUngKiller.push({ group: vfxGroup, ring: songXungKich, pts: pts, velocities: vels, life: 20, maxScale: isBig ? 1.5 : 1.0 }); 
    }

    window.thoiDiemChemCuoi_Killer = window.thoiDiemChemCuoi_Killer || 0;

    // ==========================================
    // ⚔️ TUNG CHIÊU KILLER (LƯỚT GẦN VÀ CHÉM)
    // ==========================================
    window.tungComboKiller = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        
        // 🌟 BẢN VÁ MULTIPLAYER: Nếu là máy người khác đánh (Remote), chỉ việc múa Anim và tung vệt chém tại chỗ, KHÔNG tính lướt!
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            let remoteNvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            let animCanMua = phim === 'Q' ? 'ATTACK1' : phim === 'E' ? 'ATTACK2' : phim === 'R' ? 'ATTACK3' : 'ATTACK4';
            
            // Ép remote player múa
            if (remoteNvc.userData && remoteNvc.userData.mixer) {
                // (Giả sử Engine Sếp có cơ chế ép Anim cho remote)
            }
            // Gọi luôn vệt chém
            taoHieuUngChemKiller(new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z), remoteNvc, phim === 'F');
            return;
        }

        // --- XỬ LÝ CHO NGƯỜI CHƠI LOCAL (CHÍNH MÌNH) ---
        if (!nvc) return;
        let bayGio = Date.now();
        if (bayGio - window.thoiDiemChemCuoi_Killer < 600) return;
        window.thoiDiemChemCuoi_Killer = bayGio;

        let viTriGocToTam = nvc.position.clone();
        let targetQuai = window.layMucTieuGanNhatKiller(viTriGocToTam);

        // 🌟 BẢNG SÁT THƯƠNG CHUẨN (DPS TỔNG = 8.0)
        const dameChiTiet = { 'Q': 1.0, 'E': 1.5, 'R': 2.0, 'F': 3.5 };

        if (targetQuai) {
            // NẾU CÓ QUÁI: KÍCH HOẠT ĐỘNG CƠ LƯỚT ÁP SÁT
            window.dangMuaChieu = false; // Phá khóa animation để bắt đầu lướt
            window.trangThaiKiller.state = 'DASHING';
            window.trangThaiKiller.target = targetQuai;
            window.trangThaiKiller.skillKey = phim;
            window.trangThaiKiller.dameRatio = dameChiTiet[phim];

            // Bắn tín hiệu mạng cho máy khác biết mình vừa tung chiêu tại tọa độ quái
            if (window.room && window.room.localParticipant) {
                let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat);
                let hitQuai = window.layHitbox(targetQuai.mesh);
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Killer', 
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: hitQuai.tamNguc.x, y: hitQuai.tamNguc.y, z: hitQuai.tamNguc.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }

        } else {
            // NẾU KHÔNG CÓ QUÁI: ĐỨNG CHÉM KHÔNG KHÍ TẠI CHỖ
            window.trangThaiKiller.state = 'IDLE'; 
            window.dangMuaChieu = true;
            
            let animName = phim === 'Q' ? 'ATTACK1' : phim === 'E' ? 'ATTACK2' : phim === 'R' ? 'ATTACK3' : 'ATTACK4';
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animName);

            let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            let posChemKKhong = nvc.position.clone().add(huongMat.multiplyScalar(3.0)); posChemKKhong.y += 2.0;
            taoHieuUngChemKiller(posChemKKhong, nvc, phim === 'F');
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU KILLER (ĐỘNG CƠ CẬN CHIẾN)
    // ==========================================
    window.updateCombatKiller = function () {
        let nvc = window.nhanVatChinh || window.playerModel;
        
        // 🌟 1. VẬT LÝ LƯỚT VÀ CHÉM CHỐNG GIẬT LÙI
        if (nvc && window.trangThaiKiller.state === 'DASHING') {
            let t = window.trangThaiKiller.target;
            if (!t || t.isDead) { window.trangThaiKiller.state = 'IDLE'; return; }
            
            let tHit = window.layHitbox(t.mesh);
            let myHit = window.layHitbox(nvc);
            
            let diemDen = tHit.tamNguc.clone();
            diemDen.y -= (myHit.chieuCao / 2); // Canh ngang mặt đất
            
            let khoangCach = nvc.position.distanceTo(diemDen);
            
            // Xoay mặt mượt mà về phía mục tiêu trong lúc lướt
            let vecToTarget = new THREE.Vector3().subVectors(tHit.tamNguc, nvc.position);
            vecToTarget.y = 0; 
            if(vecToTarget.lengthSq() > 0.01) {
                let dummy = new THREE.Object3D();
                dummy.position.copy(nvc.position);
                dummy.lookAt(nvc.position.clone().add(vecToTarget));
                nvc.quaternion.slerp(dummy.quaternion, 0.3);
            }

            // 💨 LƯỚT: Dùng Code Lerp để di chuyển, không phụ thuộc Animation
            if (khoangCach > 2.5) { 
                nvc.position.lerp(diemDen, 0.25);
                if (window.controls && window.controls.target) window.controls.target.lerp(tHit.tamNguc, 0.1);
            } 
            else {
                // 💥 BÙM! CHẠM MẶT -> BẮT ĐẦU CHÉM
                window.trangThaiKiller.state = 'HITTING';
                window.dangMuaChieu = true;
                
                let animName = window.trangThaiKiller.skillKey === 'Q' ? 'ATTACK1' : window.trangThaiKiller.skillKey === 'E' ? 'ATTACK2' : window.trangThaiKiller.skillKey === 'R' ? 'ATTACK3' : 'ATTACK4';
                if(typeof window.playAnim === 'function') window.playAnim(animName);
                else if(typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animName);
                
                let dameChiTieu = (window.DAME_CUA_TOI || 100) * window.trangThaiKiller.dameRatio;
                let isTuyetKieu = window.trangThaiKiller.skillKey === 'F';

                // Trừ máu và Nổ vệt chém
                gaySatThuongKiller(tHit.tamNguc, dameChiTieu, isTuyetKieu ? 25 : 15);
                taoHieuUngChemKiller(tHit.tamNguc, nvc, isTuyetKieu);

                // 🌟 GENSHIN HIT-STOP: Khựng thời gian 0.1s để tạo uy lực chém thịt
                if(window.currentActionChar) {
                    window.currentActionChar.setEffectiveTimeScale(0.01);
                    setTimeout(() => { if(window.currentActionChar) window.currentActionChar.setEffectiveTimeScale(1.5); }, 100);
                }
                
                // 🌟 CAMERA SHAKE (RUNG MÀN HÌNH)
                if(typeof window.kichHoatDongDat === 'function') {
                    window.kichHoatDongDat(isTuyetKieu ? 20 : 10, 200);
                }
                
                // Xả trạng thái sau 300ms để tiếp tục combo
                setTimeout(() => { if(window.trangThaiKiller.state === 'HITTING') window.trangThaiKiller.state = 'IDLE'; }, 300);
            }
        }

        // 🌟 2. DỌN RÁC HIỆU ỨNG CHÉM CẬN CHIẾN
        for (let i = hieuUngKiller.length - 1; i >= 0; i--) {
            let h = hieuUngKiller[i]; h.life--;
            
            // Xoay vòng chém & Phình to ra
            if (h.ring) {
                h.ring.scale.set(1 + (20-h.life)*0.1 * h.maxScale, 1 + (20-h.life)*0.1 * h.maxScale, 1);
                h.ring.material.opacity = h.life / 20;
            }

            // Bay tia lửa
            let posArr = h.pts.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].x *= 0.85; h.velocities[j].y *= 0.85; h.velocities[j].z *= 0.85; // Cản gió
            }
            h.pts.geometry.attributes.position.needsUpdate = true;
            h.pts.material.opacity = h.life / 20;

            if (h.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(h.group);
                else scene.remove(h.group);
                hieuUngKiller.splice(i, 1);
            }
        }

        // 🌟 3. DỌN RÁC SỐ DAME
        for (let i = danhSachSoBayKiller.length - 1; i >= 0; i--) {
            let it = danhSachSoBayKiller[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayKiller.splice(i, 1); window.tongSoChuNoi_Killer--; }
        }
    };

    setInterval(window.updateCombatKiller, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI CẬN CHIẾN
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('killer')) {
        window.HePhaiHienTai = {
            tenPhai: "Thợ Săn Killer",
            khoiTao: function () {
                console.log("🪚 Khởi động Động cơ Cận chiến V2! Kamazo giáng lâm!");

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];

                        // 🛑 LÁ CHẮN KHÓA CHÂN V2: QUÉT SẠCH MỌI LOẠI ROOT MOTION CHỐNG GIẬT LÙI!
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position')) {
                                        const danhSachDen = [
                                            'armature', 'hip', 'pelvis', 'root', 'bip', 
                                            'center', 'spine', 'master', 'object', 
                                            'character', 'chara', 'dummy', 'bone'
                                        ];
                                        for (let tuKhoa of danhSachDen) {
                                            if (tenTrack.includes(tuKhoa)) return false; 
                                        }
                                    }
                                    return true; 
                                });
                            }
                        }

                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('ATTACK') || k.includes('SKILL')) window.KHO_ANIM_TANCONG.push(key);

                        if (k.includes('BAY') || k.includes('FLY')) { coBay = true; animBay = window.animationsMap[key]; window.animationsMap['BAY'] = animBay; }
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) { coChay = true; animChay = window.animationsMap[key]; window.animationsMap['CHAYBO'] = animChay; }
                    }
                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }

                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push('NHANROI1');
                    let defaultIdle = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                }

                if (window.vongLapNhanRoiZR) clearInterval(window.vongLapNhanRoiZR);
                window.vongLapNhanRoiZR = setInterval(() => {
                    if (!window.dangMuaChieu && !window.isMoving && !window.isKeyboardMoving && window.KHO_ANIM_NHANROI.length > 0) {
                        let randomIdle = window.KHO_ANIM_NHANROI[Math.floor(Math.random() * window.KHO_ANIM_NHANROI.length)];
                        if (window.animationsMap && window.animationsMap[randomIdle]) {
                            window.animationsMap['NHANROI'] = window.animationsMap[randomIdle];
                            if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[randomIdle];
                            if (typeof window.playAnim === 'function') window.playAnim(randomIdle);
                        }
                    }
                }, 12000);
            },
            tungChieu: window.tungComboKiller,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
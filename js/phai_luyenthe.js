// ==========================================
// 🥊 HỆ THỐNG KỸ NĂNG: LUYỆN THỂ (V22 - BẠO CHÚA BERSERKER)
// 👑 CÔNG NGHỆ: ÁP SÁT CHẠM THỊT + COMBO KIẾM QUANG TÓE MÁU + HÚT MÁU 100%
// ==========================================

(function() {
    let kyNangLT = []; // 🌟 Thêm mảng nhẹ để chứa Kiếm Quang
    let hieuUngLuyenThe = [];
    let danhSachSoBayLT = []; 

    window.trangThaiLT = {
        state: 'IDLE', 
        target: null,
        skillKey: null,
        dameRatio: 1
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

    // 🌟 1. ĐÚC MODEL KIẾM QUANG CHÉM CẬN CHIẾN
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
                            if (m.color) m.color.setHex(0xffffff); // Kiếm quang màu trắng sáng để nổi bật trên nền máu đỏ
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
        
        // 🌟 VÁ LỖI 1: NỘI TẠI HÚT MÁU HOẠT ĐỘNG CHUẨN XÁC TRÊN THANH UI
        function kichHoatHutMau() {
            let luongHut = Math.round(luongSatThuong * 0.05); // Hút 5%
            if (typeof window.mauBanThan !== 'undefined' && window.MAU_TOI_DA) {
                if (window.mauBanThan < window.MAU_TOI_DA) {
                    window.mauBanThan = Math.min(window.MAU_TOI_DA, window.mauBanThan + luongHut);
                    
                    let uiThanhMau = document.getElementById('thanhMauHienTai');
                    let uiSoMau = document.getElementById('soMauHienTai');
                    if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
                    if (uiSoMau) uiSoMau.innerText = Math.max(0, Math.round(window.mauBanThan)).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
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

    window.thoiDiemNoCuoiCungLT = window.thoiDiemNoCuoiCungLT || 0;

    // 🌟 VÁ LỖI 5: VỤ NỔ MỊN MÀNG TÓE MÁU (THAY MÀU CAM BẰNG MÀU ĐỎ MÁU)
    function taoVuNoLT(pos, upV, mauHex, banKinh) {
        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungLT < 300) return;
        window.thoiDiemNoCuoiCungLT = bayGio;

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
        
        // Tạo Texture Huyết Mãn (Đỏ Máu) Mịn Màng
        if (!window.textureMauLT) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 0, 0, 0.9)'); // Đỏ máu rực
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureMauLT = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({ 
            color: 0xff0000, // Ép cứng màu đỏ máu
            size: window.isMobile ? 8.0 : 14.0, 
            map: window.textureMauLT, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false 
        });
        
        const pts = new THREE.Points(geo, mat);
        vfxGroup.add(pts);

        // 🌟 VÁ LỖI 2: ĐÃ XÓA SẠCH VÒNG TRÒN SÓNG ÂM DƯỚI ĐẤT THEO LỆNH SẾP
        scene.add(vfxGroup);

        hieuUngLuyenThe.push({
            group: vfxGroup, pts: pts, velocities: vels, 
            life: window.isMobile ? 20 : 35, maxScale: banKinh
        });
    }

    window.tungComboLuyenThe = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        
        let dameGoc = window.DAME_CUA_TOI || 200;
        
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 200;
            }
            
            let posNo = remoteDich ? new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z) : (remoteGoc ? new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z) : new THREE.Vector3());
            let upV = new THREE.Vector3(0, 1, 0); 
            let banKinhNo = (phim === 'F') ? 15 : 5;
            
            if (typeof taoVuNoLT === 'function') taoVuNoLT(posNo, upV, 0xff0000, banKinhNo);
            
            if (typeof isRemote === 'number' && isRemote > 0) {
                if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(posNo, dameGoc * 1.0, banKinhNo);
            }
            return; 
        }

        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc) return;

        // ========================================================
        // 🌟 VÁ LỖI 4: MỞ KHÓA SPAM ĐÁNH ĐIÊN CUỒNG 15 GIÂY (XÓA COOLDOWN CŨ)
        // ========================================================
        window.dangMuaChieu = true;
        if (window.henGioTatMuaLT) clearTimeout(window.henGioTatMuaLT);
        window.henGioTatMuaLT = setTimeout(() => { window.dangMuaChieu = false; }, 400); // 400ms để spam nát phím

        let viTriGoc = nvc.position.clone();
        let targetQuai = layQuaiVatGanNhatLT(viTriGoc);

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

            let mapAnim = (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") ? window.animationsMapChar : window.animationsMap;
            let pool = Object.keys(mapAnim || {}).filter(k => {
                let ten = k.toLowerCase();
                const tuKhoaCam = ['hit', 'hurt', 'damage', 'die', 'death', 'dead', 'defend', 'block', 'guard', 'take', 'receive'];
                if (tuKhoaCam.some(tuCam => ten.includes(tuCam))) return false; 
                
                const tuKhoaTanCong = [
                    'attack', 'atk', 'punch', 'kick', 'combo', 'skill', 'smash', 'strike', 
                    'slash', 'chop', 'swing', 'bash', 'jab', 'hook', 'uppercut', 'bite', 
                    'claw', 'slam', 'cast', 'magic', 'ultimate', 'ulti', 'special', 'finisher',
                    'chieu', 'danh', 'dam', 'da', 'chem', 'quat', 'tuyetchieu', 'kynang',
                    'kougeki', 'panchi', 'keri', 'action'
                ];
                return tuKhoaTanCong.some(tuKhoa => ten.includes(tuKhoa));
            });
            let randomAnim = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'BAY';
            if(typeof window.playAnim === 'function') window.playAnim(randomAnim);

            // Đánh gió vẫn tạo mảng chém không khí
            let nvcUp = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0,1,0);
            let fwd = new THREE.Vector3(); nvc.getWorldDirection(fwd); fwd.projectOnPlane(nvcUp).normalize();
            
            let kqGio = taoVatTheLT('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 15);
            kqGio.position.copy(viTriGoc).add(nvcUp.clone().multiplyScalar(3.5)).add(fwd.clone().multiplyScalar(2));
            kqGio.up.copy(nvcUp); kqGio.lookAt(viTriGoc.clone().add(nvcUp.clone().multiplyScalar(3.5)).add(fwd.clone().multiplyScalar(10)));
            kqGio.rotateZ((Math.random() - 0.5) * Math.PI);
            scene.add(kqGio);
            kyNangLT.push({ mesh: kqGio, life: 10, scale: 15 });

            let banKinhNo = (phim === 'F') ? 15 : 5;
            taoVuNoLT(viTriGoc.clone().add(fwd.multiplyScalar(3)), nvcUp, 0xff0000, banKinhNo);
        }
    };

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_luyenthe')) {

        window.HePhaiHienTai = {
            tenPhai: "Luyện Thể",
            khoiTao: function () {
                console.log("🔥 Luyện Thể Berserker Khởi động (Mở Khóa SPAM + Kiếm Quang Tóe Máu)!");

                // 🌟 VÁ LỖI 7: TẢI SẴN KIẾM QUANG VÀO RAM
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    for(let i=1; i<=6; i++) {
                        window.taiHoacNhanBanAsset('uploads/anims/KIEMQUANG' + i + '.glb', () => {});
                    }
                }

                if (window.animationsMap) {
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('CHIEU') || k.includes('COMBO') || k.includes('PUNCH') || k.includes('KICK')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position')) {
                                        const danhSachDen = ['armature', 'hip', 'pelvis', 'root', 'bip', 'center', 'spine', 'object', 'dummy', 'bone'];
                                        for (let tuKhoa of danhSachDen) return false; 
                                    }
                                    return true; 
                                });
                            }
                        }
                    }
                }

                // 🌟 VÁ LỖI 6: ĐỒNG BỘ RỔ ANIMATION CỦA CÁC PHÁI ĐOẠT XÁ
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
                // 🚀 QUẢN LÝ VẬT LÝ VŨ KHÍ KIẾM QUANG (MỚI THÊM)
                // ===================================================
                for(let i = kyNangLT.length - 1; i >= 0; i--) {
                    let s = kyNangLT[i];
                    s.life--;
                    s.scale += 2.0;
                    s.mesh.scale.set(s.scale, s.scale, s.scale);
                    if(s.life <= 0) {
                        if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                        kyNangLT.splice(i, 1);
                    }
                }

                // ===================================================
                // 🚀 BỘ VẬT LÝ CHIẾN ĐẬU LƯỚT VÀ ĐẤM 
                // ===================================================
                if (window.trangThaiLT.state === 'DASHING' && window.trangThaiLT.target) {
                    let t = window.trangThaiLT.target;
                    if (t.isDead) { window.trangThaiLT.state = 'IDLE'; return; }
                    
                    let tHit = window.layHitbox(t.mesh);
                    let myHit = window.layHitbox(nvc);
                    
                    let diemDen = tHit.tamNguc.clone();
                    diemDen.y -= (myHit.chieuCao / 2); 
                    
                    let khoangCach = nvc.position.distanceTo(diemDen);
                    
                    let curUp = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0,1,0);
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(nvc.position);
                    dummy.up.copy(curUp);

                    let vecToTarget = new THREE.Vector3().subVectors(tHit.tamNguc, nvc.position);
                    let vertComp = vecToTarget.clone().projectOnVector(curUp);
                    vecToTarget.sub(vertComp);

                    dummy.lookAt(nvc.position.clone().add(vecToTarget));
                    nvc.quaternion.slerp(dummy.quaternion, 0.4); 
                    
                    // 🌟 VÁ LỖI 3: HẠ KHOẢNG CÁCH ÁP SÁT XUỐNG 1.2M ĐỂ CHẠM MẶT MỚI ĐẤM
                    if (khoangCach > 1.2) {
                        nvc.position.lerp(diemDen, 0.3); // Tăng tốc độ lướt
                        if (window.controls) window.controls.target.lerp(tHit.tamNguc, 0.1);
                    } 
                    else {
                        window.trangThaiLT.state = 'HITTING';
                        
                        let mapAnim = (window.MOUNT_URL && window.MOUNT_URL.trim() !== "") ? window.animationsMapChar : window.animationsMap;
                        let pool = Object.keys(mapAnim || {}).filter(k => {
                            let ten = k.toLowerCase();
                            const tuKhoaCam = ['hit', 'hurt', 'damage', 'die', 'death', 'dead', 'defend', 'block', 'guard', 'take', 'receive'];
                            if (tuKhoaCam.some(tuCam => ten.includes(tuCam))) return false; 
                            
                            const tuKhoaTanCong = [
                                'attack', 'atk', 'punch', 'kick', 'combo', 'skill', 'smash', 'strike', 
                                'slash', 'chop', 'swing', 'bash', 'jab', 'hook', 'uppercut', 'bite', 
                                'claw', 'slam', 'cast', 'magic', 'ultimate', 'ulti', 'special', 'finisher',
                                'chieu', 'danh', 'dam', 'da', 'chem', 'quat', 'tuyetchieu', 'kynang',
                                'kougeki', 'panchi', 'keri', 'action'
                            ];
                            return tuKhoaTanCong.some(tuKhoa => ten.includes(tuKhoa));
                        });
                        let randomAnim = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'BAY';
                        if(typeof window.playAnim === 'function') window.playAnim(randomAnim);

                        // 🌟 VÁ LỖI 7: GỌI KIẾM QUANG CHÉM QUA NGƯỜI QUÁI
                        let kq = taoVatTheLT('KIEMQUANG' + (Math.floor(Math.random() * 6) + 1), 25);
                        kq.position.copy(tHit.tamNguc);
                        kq.up.copy(curUp);
                        kq.lookAt(nvc.position); // Chém hướng về góc cam
                        kq.rotateZ((Math.random() - 0.5) * Math.PI); // Xoay chéo góc ngẫu nhiên
                        scene.add(kq);
                        kyNangLT.push({ mesh: kq, life: 10, scale: 25 });

                        // NỔ TÓE MÁU VÀ TRỪ MÁU
                        let banKinhNo = (window.trangThaiLT.skillKey === 'F') ? 15 : 5;
                        taoVuNoLT(tHit.tamNguc, curUp, 0xff0000, banKinhNo);
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
                        
                        setTimeout(() => { if(window.trangThaiLT.state === 'HITTING') window.trangThaiLT.state = 'IDLE'; }, 300);
                    }
                }

                // ===================================================
                // ♻️ DỌN DẸP RÁC ĐỒ HỌA MÁU 
                // ===================================================
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
                    vfx.pts.material.opacity = vfx.life / 35;
                    if (vfx.life < 20) vfx.pts.material.color.setHex(0x880000); // Máu khô thẫm lại
                    if (vfx.life < 10) {
                        vfx.pts.material.color.setHex(0x110000); 
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
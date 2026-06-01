// ==========================================
// 🪚 MÔN PHÁI CẬN CHIẾN: THỢ SĂN KILLER (KAMAZO)
// 👑 CÔNG NGHỆ V6: CINEMATIC MATH DASH (ÉP GÓC XOAY + VẬN TỐC TỊNH TIẾN)
// ==========================================

(function () {
    const hieuUngKiller = [];
    const danhSachSoBayKiller = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Killer = 0;

    // 🌟 TRẠNG THÁI TOÁN HỌC
    window.trangThaiKiller = { 
        state: 'IDLE', 
        skillKey: null,
        timeElapsed: 0,
        duration: 0,
        dashSpeed: 0,
        dir: new THREE.Vector3()
    };

    function taoSoSatThuongKiller(pos3D, satThuong, mauSac = '#00e5ff') {
        if (window.isMobile || satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_Killer > 5) return;
        window.tongSoChuNoi_Killer++;

        const div = document.createElement('div'); div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #006680';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999; transition: transform 0.1s ease;`;
        document.body.appendChild(div);
        danhSachSoBayKiller.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

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
                                setTimeout(() => { quai.hp = quai.maxHp || 4000; quai.isDead = false; if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true; if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = '100%'; quai.tagEl.style.display = 'block'; } }, 5000);
                            } else { if (typeof quai.playAnim === 'function') quai.playAnim('HIT'); }
                        }
                    }
                }
            });
        }
    }

    function taoHieuUngChemKiller(pos, nvc, isBig = false) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos);
        const vfxGroup = new THREE.Group(); vfxGroup.position.copy(pos);
        const geoSong = new THREE.RingGeometry(0.1, isBig ? 15 : 8, 32);
        const matSong = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
        const songXungKich = new THREE.Mesh(geoSong, matSong);
        songXungKich.rotation.x = Math.random() * Math.PI; songXungKich.rotation.y = Math.random() * Math.PI;
        vfxGroup.add(songXungKich);

        const soLuong = isBig ? 60 : 25; const geoPts = new THREE.BufferGeometry(); const posArr = new Float32Array(soLuong * 3); const vels = [];
        let huongMat = new THREE.Vector3(); if (nvc) { nvc.getWorldDirection(huongMat); huongMat.normalize(); }
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = 0; posArr[i*3+1] = 0; posArr[i*3+2] = 0;
            let vec = new THREE.Vector3((Math.random()-0.5)*2, Math.random()*2, (Math.random()-0.5)*2).add(huongMat).normalize();
            vels.push(vec.multiplyScalar(Math.random() * 3 + 1));
        }
        geoPts.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiKiller) {
            let canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); gradient.addColorStop(0.4, 'rgba(0, 229, 255, 0.9)'); gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 32, 32); window.textureBuiKiller = new THREE.CanvasTexture(canvas);
        }
        const matPts = new THREE.PointsMaterial({ color: 0x00ffff, size: 5.0, map: window.textureBuiKiller, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false });
        const pts = new THREE.Points(geoPts, matPts); vfxGroup.add(pts); scene.add(vfxGroup);
        hieuUngKiller.push({ group: vfxGroup, ring: songXungKich, pts: pts, velocities: vels, life: 20, maxScale: isBig ? 1.5 : 1.0 });
    }

    // ==========================================
    // ⚔️ HÀM TUNG CHIÊU: CHỐT GÓC XOAY VÀ TÍNH VẬN TỐC
    // ==========================================
    window.tungComboKiller = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            let remoteNvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            taoHieuUngChemKiller(new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z), remoteNvc, phim === 'F');
            return;
        }
        if (!nvc || window.trangThaiKiller.state === 'HITTING') return;

        let bayGio = Date.now();
        if (bayGio - window.thoiDiemChemCuoi_Killer < 700) return;
        window.thoiDiemChemCuoi_Killer = bayGio;

        let animName = phim === 'Q' ? 'ATTACK1' : phim === 'E' ? 'ATTACK2' : phim === 'R' ? 'ATTACK3' : 'ATTACK4';
        
        window.dangMuaChieu = true;
        window.trangThaiKiller.state = 'HITTING';
        window.trangThaiKiller.skillKey = phim;
        window.trangThaiKiller.timeElapsed = 0;
        
        let viTriGocToTam = nvc.position.clone();
        let targetQuai = window.layMucTieuGanNhatKiller(viTriGocToTam);

        // 🌟 1. LẤY THỜI GIAN CỦA ANIMATION 
        let duration = 0.5; // Mặc định nếu lỗi
        if (window.animationsMap && window.animationsMap[animName]) {
            duration = window.animationsMap[animName].getClip().duration;
        }
        window.trangThaiKiller.duration = duration;

        // 🌟 2. ÉP GÓC XOAY 100% VÀ TÍNH TOÁN KHOẢNG CÁCH LƯỚT
        let diemDichNet = viTriGocToTam.clone();
        
        if (targetQuai) {
            let tHit = window.layHitbox(targetQuai.mesh);
            diemDichNet = tHit.tamNguc.clone();
            diemDichNet.y = nvc.position.y; // Cân bằng độ cao sàn

            let vecToTarget = new THREE.Vector3().subVectors(diemDichNet, nvc.position);
            vecToTarget.y = 0;
            
            let dist = vecToTarget.length();

            // Xoay mặt cái rụp vào mục tiêu
            if (dist > 0.1) {
                let dummy = new THREE.Object3D();
                dummy.position.copy(nvc.position);
                dummy.lookAt(nvc.position.clone().add(vecToTarget));
                nvc.quaternion.copy(dummy.quaternion); // Khóa góc tuyệt đối!
                
                window.trangThaiKiller.dir = vecToTarget.normalize();
            }

            // Tính quãng đường: Dừng cách mặt quái 2.0 mét
            if (dist > 2.5) {
                let quangDuong = dist - 2.0; 
                window.trangThaiKiller.dashSpeed = quangDuong / duration; // Công thức Vận Tốc = Quãng Đường / Thời gian
            } else {
                window.trangThaiKiller.dashSpeed = 0; // Quá gần thì đứng im chém
            }

        } else {
            // Đánh không khí: Lướt nhẹ về phía trước 4 mét
            let huongMat = new THREE.Vector3(0, 0, 1).applyQuaternion(nvc.quaternion).normalize();
            huongMat.y = 0;
            window.trangThaiKiller.dir = huongMat;
            window.trangThaiKiller.dashSpeed = 4.0 / duration; 
            
            diemDichNet = nvc.position.clone().add(huongMat.multiplyScalar(4.0));
        }

        // GỬI MẠNG ĐỂ ĐỒNG BỘ
        if (window.room && window.room.localParticipant) {
            let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat);
            window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                type: 'TUNG_CHIEU', skillType: phim, className: 'Killer', 
                origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: diemDichNet.x, y: diemDichNet.y, z: diemDichNet.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
            })), { reliable: true });
        }

        // PHÁT ANIMATION LƯỚT TẠI CHỖ
        if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animName);
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ: ĐẨY TỌA ĐỘ VÀ KHÓA CAMERA
    // ==========================================
    window.updateCombatKiller = function () {
        let nvc = window.nhanVatChinh || window.playerModel;
        
        if (nvc && window.dangMuaChieu && window.trangThaiKiller.state === 'HITTING') {
            
            let dt = 0.03; // Vòng lặp chạy 30ms ~ 0.03s
            window.trangThaiKiller.timeElapsed += dt;

            // 🚀 BƠM VẬN TỐC LƯỚT
            if (window.trangThaiKiller.dashSpeed > 0) {
                let moveStep = window.trangThaiKiller.dashSpeed * dt;
                nvc.position.add(window.trangThaiKiller.dir.clone().multiplyScalar(moveStep));
                nvc.position.y = window.matDatY || 0; // Giữ chặt dưới đất
            }

            // 📸 CAMERA BÁM THEO NGƯỜI SIÊU MƯỢT
            if (window.camera && window.controls && window.controls.target) {
                let diemNeoCamera = nvc.position.clone().add(new THREE.Vector3(0, 1.5, 0));
                window.controls.target.lerp(diemNeoCamera, 0.3); // Mượt mà bám gót
            }

            // 🛑 CHỐT HẠ NGẮT CHIÊU (Đúng 95% thời lượng Animation)
            if (window.trangThaiKiller.timeElapsed >= window.trangThaiKiller.duration * 0.95) {
                
                window.trangThaiKiller.state = 'IDLE';
                window.dangMuaChieu = false;
                if (typeof window.playAnim === 'function') window.playAnim('NHANROI');
                
                // Xả Sát thương và VFX
                let isTuyetKieu = window.trangThaiKiller.skillKey === 'F';
                let dameSátThương = (window.DAME_CUA_TOI || 100) * (isTuyetKieu ? 3.5 : 1.5);
                gaySatThuongKiller(nvc.position, dameSátThương, isTuyetKieu ? 25 : 15);
                taoHieuUngChemKiller(nvc.position, nvc, isTuyetKieu);

                // Khựng hình tạo uy lực
                if (window.currentActionChar) {
                    window.currentActionChar.setEffectiveTimeScale(0.01);
                    setTimeout(() => { if (window.currentActionChar) window.currentActionChar.setEffectiveTimeScale(1.5); }, 100);
                }
                if (typeof window.kichHoatDongDat === 'function') window.kichHoatDongDat(isTuyetKieu ? 22 : 12, 250);
            }
        }

        // RENDER VỆT CHÉM VÀ DỌN RÁC
        for (let i = hieuUngKiller.length - 1; i >= 0; i--) {
            let h = hieuUngKiller[i]; h.life--;
            if (h.ring) { h.ring.scale.set(1 + (20-h.life)*0.1 * h.maxScale, 1 + (20-h.life)*0.1 * h.maxScale, 1); h.ring.material.opacity = h.life / 20; }
            let posArr = h.pts.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].x *= 0.85; h.velocities[j].y *= 0.85; h.velocities[j].z *= 0.85;
            }
            h.pts.geometry.attributes.position.needsUpdate = true; h.pts.material.opacity = h.life / 20;
            if (h.life <= 0) { if (typeof window.donRac3D === 'function') window.donRac3D(h.group); else scene.remove(h.group); hieuUngKiller.splice(i, 1); }
        }

        for (let i = danhSachSoBayKiller.length - 1; i >= 0; i--) {
            let it = danhSachSoBayKiller[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) { it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`; } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayKiller.splice(i, 1); window.tongSoChuNoi_Killer--; }
        }
    };

    if (window.idVongLapCombatKiller) clearInterval(window.idVongLapCombatKiller);
    window.idVongLapCombatKiller = setInterval(window.updateCombatKiller, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI: CẮT ĐỨT HOÀN TOÀN MỌI CHUỖI POSITION
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('killer')) {
        window.HePhaiHienTai = {
            tenPhai: "Thợ Săn Killer",
            khoiTao: function () {
                console.log("🪚 Động cơ V6: Toán Học Tuyệt Đối!");

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = []; 
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false; let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let act = window.animationsMap[key];
                        let clip = act.getClip();

                        // 🌟 BÍ THUẬT: ĐỐT SẠCH TRACK POSITION CỦA XƯƠNG GỐC 
                        // ÉP BUỘC HOẠT ẢNH CHẠY TẠI CHỖ ĐỂ TỌA ĐỘ HITBOX TOÀN QUYỀN KIỂM SOÁT!
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO')) {
                            window.KHO_ANIM_TANCONG.push(key);
                            
                            clip.tracks = clip.tracks.filter(track => {
                                if (track.name.toLowerCase().includes('.position')) {
                                    const rootKeywords = ['armature', 'hip', 'pelvis', 'root', 'bip', 'center', 'object', 'dummy', 'chara'];
                                    // Chặn đứng bất kỳ xương nào có tên dính dáng tới xương chậu / gốc di chuyển
                                    if (rootKeywords.some(kw => track.name.toLowerCase().includes(kw))) {
                                        return false; // Vứt sọt rác
                                    }
                                }
                                return true; // Tay chân cầm vũ khí thì cho phép
                            });
                        }

                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('BAY') || k.includes('FLY')) { coBay = true; animBay = window.animationsMap[key]; window.animationsMap['BAY'] = animBay; }
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) { coChay = true; animChay = window.animationsMap[key]; window.animationsMap['CHAYBO'] = animChay; }
                    }
                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }

                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push('NHANROI1');
                    window.animationsMap['NHANROI'] = window.animationsMap[window.KHO_ANIM_NHANROI[0]];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[window.KHO_ANIM_NHANROI[0]];
                }
            },
            tungChieu: window.tungComboKiller,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
// ==========================================
// 🪚 MÔN PHÁI CẬN CHIẾN: THỢ SĂN KILLER (KAMAZO)
// 👑 CÔNG NGHỆ V5 TỐI THƯỢNG: ROOT MOTION BAKING (TRÍCH XUẤT ĐỘNG NĂNG AAA)
// ==========================================

(function () {
    const hieuUngKiller = [];
    const danhSachSoBayKiller = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Killer = 0;

    // 🌟 BỘ NHỚ LƯU TRỮ ĐƯỜNG CONG LƯỚT CỦA ANIMATION
    window.KillerRootMotion = {}; 

    window.trangThaiKiller = { 
        state: 'IDLE', 
        skillKey: null,
        animName: null,
        hasRootMotion: false,
        lastLocalX: 0,
        lastLocalZ: 0,
        dashQuat: null,
        lastTime: 0
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
    // ⚔️ HÀM TUNG CHIÊU: CHUẨN BỊ ĐỘNG NĂNG
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
        
        // CẬP NHẬT TRẠNG THÁI
        window.dangMuaChieu = true;
        window.trangThaiKiller.state = 'HITTING';
        window.trangThaiKiller.skillKey = phim;
        window.trangThaiKiller.animName = animName;
        window.trangThaiKiller.lastTime = 0;
        
        // Xoay mặt về mục tiêu
        let viTriGocToTam = nvc.position.clone();
        let targetQuai = window.layMucTieuGanNhatKiller(viTriGocToTam);
        
        if (targetQuai) {
            let diemDichNet = window.layHitbox(targetQuai.mesh).tamNguc.clone();
            diemDichNet.y = nvc.position.y;
            let targetMat = new THREE.Matrix4().lookAt(nvc.position, diemDichNet, nvc.up);
            nvc.quaternion.setFromRotationMatrix(targetMat);
        }

        // Lấy Sổ Nam Tào Trích Xuất Động Năng
        if (window.KillerRootMotion && window.KillerRootMotion[animName]) {
            window.trangThaiKiller.hasRootMotion = true;
            let curve = window.KillerRootMotion[animName];
            window.trangThaiKiller.lastLocalX = curve.values[0] || 0;
            window.trangThaiKiller.lastLocalZ = curve.values[2] || 0;
        } else {
            window.trangThaiKiller.hasRootMotion = false;
        }
        
        // Lưu hướng mặt chuẩn để bẻ Vector lướt
        window.trangThaiKiller.dashQuat = nvc.quaternion.clone();

        // GỬI MẠNG
        if (window.room && window.room.localParticipant) {
            let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat);
            let targetSend = targetQuai ? window.layHitbox(targetQuai.mesh).tamNguc : viTriGocToTam;
            window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                type: 'TUNG_CHIEU', skillType: phim, className: 'Killer', 
                origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: targetSend.x, y: targetSend.y, z: targetSend.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
            })), { reliable: true });
        }

        if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animName);
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ TOÀN CẦU: TRUYỀN ĐỘNG NĂNG FRAME-BY-FRAME
    // ==========================================
    window.updateCombatKiller = function () {
        let nvc = window.nhanVatChinh || window.playerModel;
        
        if (nvc && window.dangMuaChieu && window.trangThaiKiller.state === 'HITTING') {
            let animName = window.trangThaiKiller.animName;
            let act = window.animationsMap[animName];

            if (act) {
                let time = act.time;
                let duration = act.getClip().duration;

                // 🌟 BÍ THUẬT: ĐẨY NHÂN VẬT ĐÚNG GIA TỐC GỐC CỦA ARTIST
                if (window.trangThaiKiller.hasRootMotion) {
                    let curve = window.KillerRootMotion[animName];
                    let idx = 0;
                    
                    // Tìm Frame hiện tại
                    for (let i = 0; i < curve.times.length; i++) {
                        if (curve.times[i] >= time) { idx = Math.max(0, i - 1); break; }
                        if (i === curve.times.length - 1) { idx = i; }
                    }

                    // Tọa độ cục bộ hiện tại
                    let curX = curve.values[idx * 3];
                    let curZ = curve.values[idx * 3 + 2];

                    // Độ lệch (Delta) so với Frame trước
                    let dX = curX - window.trangThaiKiller.lastLocalX;
                    let dZ = curZ - window.trangThaiKiller.lastLocalZ;

                    window.trangThaiKiller.lastLocalX = curX;
                    window.trangThaiKiller.lastLocalZ = curZ;

                    // Chuyển Delta thành Vector và bẻ lái theo hướng nhân vật đang nhìn
                    let deltaVec = new THREE.Vector3(dX, 0, dZ);
                    
                    // Bù tỷ lệ Scale (Quan trọng nếu model được thu phóng)
                    deltaVec.multiply(nvc.scale);
                    
                    // Xoay chuẩn hướng
                    deltaVec.applyQuaternion(window.trangThaiKiller.dashQuat);
                    
                    // Cập nhật lên Hitbox Gốc
                    nvc.position.add(deltaVec);
                    nvc.position.y = window.matDatY || 0; // Giữ chân chạm sàn

                    // CAMERA BÁM SÁT GÓT MƯỢT MÀ
                    if (window.camera && window.controls && window.controls.target) {
                        window.controls.target.copy(nvc.position).add(new THREE.Vector3(0, 1.5, 0));
                    }
                }

                // 🌟 CHỐT NGẮT CHIÊU (Đồng hồ AI 95% thời lượng hoặc Loop)
                if (time >= duration - 0.05 || time < window.trangThaiKiller.lastTime) {
                    
                    // Giải phóng
                    window.trangThaiKiller.state = 'IDLE';
                    window.dangMuaChieu = false;
                    if (typeof window.playAnim === 'function') window.playAnim('NHANROI');
                    
                    // Xả Đam Chém & Hiệu ứng
                    let isTuyetKieu = window.trangThaiKiller.skillKey === 'F';
                    let dameSátThương = (window.DAME_CUA_TOI || 100) * (isTuyetKieu ? 3.5 : 1.5);
                    gaySatThuongKiller(nvc.position, dameSátThương, isTuyetKieu ? 25 : 15);
                    taoHieuUngChemKiller(nvc.position, nvc, isTuyetKieu);

                    // Khựng thịt Hit-stop
                    if (window.currentActionChar) {
                        window.currentActionChar.setEffectiveTimeScale(0.01);
                        setTimeout(() => { if (window.currentActionChar) window.currentActionChar.setEffectiveTimeScale(1.5); }, 100);
                    }
                    if (typeof window.kichHoatDongDat === 'function') window.kichHoatDongDat(isTuyetKieu ? 22 : 12, 250);
                }
                
                window.trangThaiKiller.lastTime = time;
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
    // 🌟 KHỞI TẠO HỆ PHÁI: RÚT HỒN ANIMATION
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('killer')) {
        window.HePhaiHienTai = {
            tenPhai: "Thợ Săn Killer",
            khoiTao: function () {
                console.log("🪚 Động cơ V5: Root Motion Baked!");

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = []; 
                    window.KHO_ANIM_TANCONG = [];
                    window.KillerRootMotion = {}; // RESET NÃO BỘ

                    let coBay = false; let coChay = false; let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let act = window.animationsMap[key];
                        let clip = act.getClip();

                        // 🌟 BÍ THUẬT: QUÉT VÀ TRÍCH XUẤT QUÃNG ĐƯỜNG LƯỚT
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO')) {
                            window.KHO_ANIM_TANCONG.push(key);
                            
                            let maxDist = 0;
                            let rootTrackIdx = -1;

                            // Tìm cái xương bị kéo đi xa nhất (> 1 mét)
                            for(let i = 0; i < clip.tracks.length; i++) {
                                let track = clip.tracks[i];
                                if (track.name.toLowerCase().includes('.position')) {
                                    let v = track.values;
                                    if (v.length >= 6) {
                                        // Đo khoảng cách XZ (Bỏ qua Y)
                                        let dist = Math.sqrt(Math.pow(v[v.length-3] - v[0], 2) + Math.pow(v[v.length-1] - v[2], 2));
                                        if (dist > maxDist && dist > 1.0) {
                                            maxDist = dist;
                                            rootTrackIdx = i;
                                        }
                                    }
                                }
                            }

                            // Rút hồn lưu vào Não và Cắt đứt dây thần kinh
                            if (rootTrackIdx !== -1) {
                                let rootTrack = clip.tracks[rootTrackIdx];
                                window.KillerRootMotion[key] = {
                                    times: Array.from(rootTrack.times),
                                    values: Array.from(rootTrack.values)
                                };
                                // 🛑 XÓA VĨNH VIỄN SỰ DỊCH CHUYỂN BÊN TRONG MODEL ĐỂ CHỐNG GIẬT LÙI
                                clip.tracks.splice(rootTrackIdx, 1);
                                console.log("🔥 Đã trích xuất thành công Động năng của chiêu: " + key);
                            }
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
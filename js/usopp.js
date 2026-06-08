// ==========================================
// 🎯 MÔN PHÁI ĐOẠT XÁ: VUA BẮN TỈA USOPP (MASTER FILE V2)
// 👑 CÔNG NGHỆ: PRELOAD RAM + ĐẠN PARABOL CHUẨN TRỤC CẦU + TỌA ĐỘ ĐỘNG + INSTANT CAST
// ==========================================

(function () {
    const kyNangUsopp = [];
    const hieuUngUsopp = [];
    const danhSachSoBayUsopp = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Usopp = 0;

    // 🌟 1. HIỂN THỊ SÁT THƯƠNG (Màu Cam Đậm)
    function taoSoSatThuongUsopp(pos3D, satThuong, mauSac = '#ff8800') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_Usopp > 5) return;
        window.tongSoChuNoi_Usopp++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #552200';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayUsopp.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 2. RADAR QUÉT MỤC TIÊU 150M
    window.layMucTieuGanNhatUsopp = function (viTriGoc) {
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
    };

    // 🌟 3. LÕI GÂY SÁT THƯƠNG
    function gaySatThuongUsopp(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongUsopp(posHienSo, luongSatThuong);
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
                            taoSoSatThuongUsopp(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ffaa00');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongUsopp(hit.tamNguc.clone(), luongSatThuong);
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

    // 🌟 4. HIỆU ỨNG VỤ NỔ
    function taoVuNoUsopp(pos, banKinh = 15) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        else if (typeof window.playSound === 'function') window.playSound('no');

        const soLuong = 40; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + 1; posArr[i * 3 + 2] = pos.z;
            let speed = Math.random() * 2.0 + 0.5;
            let vec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiUsopp) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.9)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiUsopp = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xffaa00, size: window.isMobile ? 4.0 : 8.0, map: window.textureBuiUsopp,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngUsopp.push({ system: pts, velocities: vels, life: 25 });
    }

    // 🌟 5. ĐUÔI LỬA MINI (BỌC NHẸ VIÊN ĐẠN)
    function taoDuoiLuaMiniUsopp(pos, direction, speed) {
        if (window.isMobile && Math.random() > 0.5) return; 
        const soLuong = 3; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            let offset = new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5);
            posArr[i * 3] = pos.x + offset.x; posArr[i * 3 + 1] = pos.y + offset.y; posArr[i * 3 + 2] = pos.z + offset.z;

            let tocDoHat = (speed * 0.1) + Math.random() * 0.5;
            let vec = direction.clone().multiplyScalar(tocDoHat).add(offset.multiplyScalar(0.05));
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        const bangMau = [0xffaa00, 0xff5500, 0xffff00]; 
        const mauChon = bangMau[Math.floor(Math.random() * bangMau.length)];

        const mat = new THREE.PointsMaterial({ color: mauChon, size: 2.0 + Math.random() * 2.0, transparent: true, opacity: 0.7, map: window.textureBuiUsopp, blending: THREE.AdditiveBlending, depthWrite: false });
        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngUsopp.push({ system: pts, velocities: vels, life: 15, type: 'trail' });
    }

    // 🌟 6. ĐÚC MODEL DÙNG CHUNG (TỪ CACHE)
    function taoVatTheUsopp(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        if (Array.isArray(c.material)) c.material.forEach(m => m.transparent = true);
                        else c.material.transparent = true;
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

    // ==========================================
    // 🏹 TUNG CHIÊU USOPP (BẢN V2 CHỐNG NUỐT CHIÊU, ĐẠN BAY MƯỢT)
    // ==========================================
    window.tungComboUsopp = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        let animCanMua = 'ATTACK1';
        if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
            animCanMua = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
        }

        // 🌟 VÁ LỖI 3: Tháo gông 800ms, xóa biến dangMuaChieu. Spam kỹ năng mượt mà!
        if (isRemote === false) {
            window.currentAnimName = '';
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
        }

        // Khởi tạo radar ban đầu
        let viTriGoc = new THREE.Vector3();
        let upVector = new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3();
        let mucTieu = null;

        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            upVector = viTriGoc.clone().normalize(); 
            huongMat = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z);
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                upVector = nvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
            } else if (nvc.up) {
                upVector = nvc.up.clone().normalize();
            }

            // 🌟 VÁ LỖI 1: Ép phẳng Vector hướng mặt
            nvc.getWorldDirection(huongMat); 
            huongMat.projectOnPlane(upVector).normalize();
            if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }
            
            viTriGoc = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));

            let targetRadar = window.layMucTieuGanNhatUsopp(viTriGoc);
            if (targetRadar && targetRadar.mesh) mucTieu = window.layHitbox(targetRadar.mesh).tamNguc.clone();
            else mucTieu = viTriGoc.clone().add(huongMat.clone().multiplyScalar(150));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Usopp',
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: false });
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        // ========================================================
        // 🚀 CÔNG NGHỆ NẠP ĐẠN THÔNG MINH (TỌA ĐỘ ĐỘNG TRONG SETTIMEOUT)
        // ========================================================
        function banDanParabol(tenModel, soLuong, kichCo, chieuCaoVongCung, tocDo, heSoDame, banKinhNo) {
            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    // 🌟 VÁ LỖI 4: Lấy lại Tọa độ và Vector Động của nhân vật, tránh rớt đạn lại phía sau!
                    let curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
                    if (!curNvc) return;

                    let curUp = new THREE.Vector3(0, 1, 0);
                    if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                        curUp = curNvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                    } else if (curNvc.up) curUp = curNvc.up.clone().normalize();

                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir);
                    curDir.projectOnPlane(curUp).normalize();
                    if (curDir.lengthSq() < 0.001) curDir.set(0, 0, 1).applyQuaternion(curNvc.quaternion).projectOnPlane(curUp).normalize();

                    let curPos = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5)); // Nòng súng cao 3.5m

                    const vienDan = taoVatTheUsopp(tenModel, kichCo);
                    vienDan.position.copy(curPos).add(curDir.clone().multiplyScalar(1.5));
                    
                    // 🌟 VÁ LỖI 7: Gán Trục Đứng cho viên đạn trước khi bay
                    vienDan.up.copy(curUp); 

                    let doLech = soLuong > 1 ? 5 : 0;
                    let targetLecH = mucTieu.clone();
                    if (doLech > 0) {
                        let vecLech = new THREE.Vector3((Math.random() - 0.5) * doLech, 0, (Math.random() - 0.5) * doLech);
                        vecLech.projectOnPlane(curUp); 
                        targetLecH.add(vecLech);
                    }

                    scene.add(vienDan);
                    
                    let khoangCachToiDich = curPos.distanceTo(targetLecH);
                    let thoiGianBay = khoangCachToiDich / tocDo; 

                    kyNangUsopp.push({
                        mesh: vienDan, type: 'BAY_VONG_CUNG',
                        startPos: vienDan.position.clone(), targetPos: targetLecH, 
                        progress: 0, speedProgress: 1.0 / (thoiGianBay || 1), 
                        arcHeight: chieuCaoVongCung, upVector: curUp.clone(), // Nạp trục vào mảng vật lý
                        life: 200, damage: dameGoc * heSoDame, isRemote: isRemote, noBanKinh: banKinhNo
                    });
                }, i * 150); // Delay đạn bắn hỏa tốc, nối đuôi nhau cực đẹp
            }
        }

        if (phim === 'Q') banDanParabol('VIENDAN', 1, 3.5, 10, 8.0, 0.4, 10);
        else if (phim === 'E') banDanParabol('VIENDAN', 3, 3.5, 12, 8.0, 0.2, 12);
        else if (phim === 'R') banDanParabol('VIENDANGAI', 1, 6.0, 35, 6.0, 0.5, 30);
        else if (phim === 'F') banDanParabol('VIENDANGAI', 5, 5.0, 25, 7.0, 0.2, 25);
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU USOPP
    // ==========================================
    window.updateCombatUsopp = function () {
        
        for (let i = kyNangUsopp.length - 1; i >= 0; i--) {
            let s = kyNangUsopp[i]; s.life--;

            if (s.type === 'BAY_VONG_CUNG') {
                s.progress += s.speedProgress;
                if (s.progress > 1) s.progress = 1;

                // Nội suy Parabol bám trục không gian
                let curPos = new THREE.Vector3().lerpVectors(s.startPos, s.targetPos, s.progress);
                curPos.add(s.upVector.clone().multiplyScalar(Math.sin(s.progress * Math.PI) * s.arcHeight));

                let huongBay = new THREE.Vector3().subVectors(curPos, s.mesh.position).normalize();
                
                s.mesh.position.copy(curPos);
                
                // 🌟 VÁ LỖI 7: ÉP TRỤC TRƯỚC KHI ĐẠN BẺ LÁI! Chống vặn xoắn!
                s.mesh.up.copy(s.upVector);
                s.mesh.lookAt(curPos.clone().add(huongBay)); 

                let dirNguoc = huongBay.clone().negate();
                taoDuoiLuaMiniUsopp(s.mesh.position, dirNguoc, 10.0);

                if (s.mesh.children.length > 0) s.mesh.children[0].rotateZ(0.3);

                // Chạm đích -> Nổ
                if (s.progress >= 1 || s.life <= 0) {
                    if (s.isRemote === false) gaySatThuongUsopp(s.targetPos, s.damage, s.noBanKinh);
                    else if (typeof s.isRemote === 'number' && s.isRemote > 0) {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                    } 
                    taoVuNoUsopp(s.targetPos, s.noBanKinh);
                    s.life = 0;
                }
            }

            // 🛑 DỌN RÁC
            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangUsopp.splice(i, 1);
            }
        }

        // Vòng lặp Hạt Bụi + Đuôi lửa
        for (let i = hieuUngUsopp.length - 1; i >= 0; i--) {
            let h = hieuUngUsopp[i]; h.life--;

            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; 
                posArr[j * 3 + 1] += h.velocities[j].y; 
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].multiplyScalar(0.9); 
                if (h.type !== 'trail') h.velocities[j].y += 0.02; 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / (h.type === 'trail' ? 15 : 25);
            if (h.type === 'trail') h.system.material.size *= 0.95; 

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose(); 
                if (h.system.material) h.system.material.dispose(); 
                hieuUngUsopp.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayUsopp.length - 1; i >= 0; i--) {
            let it = danhSachSoBayUsopp[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';

            if (it.life <= 0) {
                it.el.remove();
                danhSachSoBayUsopp.splice(i, 1);
                window.tongSoChuNoi_Usopp--;
            }
        }
    };

    setInterval(window.updateCombatUsopp, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI & PRELOAD
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('usopp')) {
        window.HePhaiHienTai = {
            tenPhai: "Vua Bắn Tỉa Usopp",
            khoiTao: function () {
                console.log("🎯 Cảm biến Gió! Khởi động Vua Bắn Tỉa Usopp V2!");

                // 🌟 VÁ LỖI 2: KÍCH HOẠT PRELOAD RAM TẢI TRƯỚC VŨ KHÍ
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/VIENDAN.glb', () => { });
                    window.taiHoacNhanBanAsset('uploads/anims/VIENDANGAI.glb', () => { });
                }

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];

                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO') || k.includes('SHOOT')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position') && (tenTrack.includes('armature') || tenTrack.includes('hips') || tenTrack.includes('pelvis') || tenTrack.includes('root'))) return false;
                                    return true;
                                });
                            }
                        }

                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('SHOOT')) window.KHO_ANIM_TANCONG.push(key);

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

                if (window.vongLapNhanRoiUsopp) clearInterval(window.vongLapNhanRoiUsopp);
                window.vongLapNhanRoiUsopp = setInterval(() => {
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
            tungChieu: window.tungComboUsopp,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
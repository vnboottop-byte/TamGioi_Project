// ==========================================
// 🌿 MÔN PHÁI ĐOẠT XÁ: TIỂU THƯ KAYA (SÁT THỦ Y TẾ)
// 👑 CÔNG NGHỆ: ĐA TRỤC XOAY VẬT LÝ + MƯA VŨ KHÍ (FUJITORA STYLE)
// ==========================================

(function () {
    const kyNangKaya = [];
    const hieuUngKaya = [];
    const danhSachSoBayKaya = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Kaya = 0;

    // 🌟 1. HIỂN THỊ SÁT THƯƠNG (Màu Xanh Vàng Y Tế)
    function taoSoSatThuongKaya(pos3D, satThuong, mauSac = '#ccff00') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_Kaya > 5) return;
        window.tongSoChuNoi_Kaya++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #445500';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayKaya.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 2. RADAR TÌM MỤC TIÊU GAN NHẤT
    window.layMucTieuGanNhatKaya = function (viTriGoc) {
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

    function gaySatThuongKaya(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongKaya(posHienSo, luongSatThuong);
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
                            taoSoSatThuongKaya(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ffffff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongKaya(hit.tamNguc.clone(), luongSatThuong);
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

    // 🌟 3. HIỆU ỨNG VỤ NỔ
    function taoHieuUngNoKaya(pos, isBig = false) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        else if (typeof window.playSound === 'function') window.playSound('no');

        const soLuong = isBig ? 80 : 30; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + 1; posArr[i * 3 + 2] = pos.z;
            let speed = isBig ? (Math.random() * 2.5 + 1) : (Math.random() * 1.5 + 0.5);
            let vec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiKaya) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(204, 255, 0, 0.9)'); // Màu Vàng Chanh
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiKaya = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xccff00, size: window.isMobile ? 4.0 : 7.0, map: window.textureBuiKaya,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngKaya.push({ system: pts, velocities: vels, life: 25 });
    }

    // 🌟 4. ĐÚC MODEL VŨ KHÍ KAYA
    function taoVatTheKaya(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        if (Array.isArray(c.material)) c.material.forEach(m => { m.transparent = true; m.side = THREE.DoubleSide; });
                        else { c.material.transparent = true; c.material.side = THREE.DoubleSide; }
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

    window.thoiDiemChemCuoi_Kaya = window.thoiDiemChemCuoi_Kaya || 0;

    // ==========================================
    // 🏹 TUNG CHIÊU KAYA
    // ==========================================
    window.tungComboKaya = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        // Ép Animation cứng theo yêu cầu của Sếp
        let animCanMua = 'ATTACK1';
        if (phim === 'Q') animCanMua = 'ATTACK1';
        if (phim === 'E') animCanMua = 'ATTACK2';
        if (phim === 'R') animCanMua = 'ATTACK3';
        if (phim === 'F') animCanMua = 'ATTACK4';

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - window.thoiDiemChemCuoi_Kaya < 800) return;
            window.thoiDiemChemCuoi_Kaya = bayGio;
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
        }

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
            nvc.getWorldDirection(huongMat); huongMat.normalize();
            viTriGoc = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5)); 

            let targetRadar = window.layMucTieuGanNhatKaya(viTriGoc);
            if (targetRadar && targetRadar.mesh) mucTieu = window.layHitbox(targetRadar.mesh).tamNguc.clone();
            else mucTieu = viTriGoc.clone().add(huongMat.clone().multiplyScalar(150));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Kaya',
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        // 🌟 TÌM ĐÚNG XƯƠNG RHand_Weapon_042
        let tayPhaiPos = viTriGoc.clone();
        nvc.traverse(c => {
            if (c.isBone && c.name === 'RHand_Weapon_042') {
                c.getWorldPosition(tayPhaiPos);
            }
        });
        if (tayPhaiPos.distanceTo(viTriGoc) < 0.1) tayPhaiPos.add(new THREE.Vector3().crossVectors(huongMat, upVector).normalize().multiplyScalar(-1.5));

        // 🌟 BẢN VÁ 1: TÁCH BẠCH DAME CỦA BOSS VÀ DAME CỦA SẾP
        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        let diemChanMucTieu = mucTieu.clone(); diemChanMucTieu.y = window.matDatY || 0;

        // ===============================================
        // 🗡️ CHIÊU Q: Ném vukhikaya.glb, xoay tròn trục đứng
        // ===============================================
        if (phim === 'Q') {
            setTimeout(() => {
                const vk = taoVatTheKaya('vukhikaya', 5);
                vk.position.copy(tayPhaiPos).add(huongMat.clone().multiplyScalar(1.5));
                vk.lookAt(mucTieu);
                scene.add(vk);

                kyNangKaya.push({
                    mesh: vk, type: 'BAY_THANG_XOAY_DUNG', speed: 10.0, life: 100,
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.4, noBanKinh: 12, isRemote: isRemote
                });
            }, 300);
        }

        // ===============================================
        // 🗡️ CHIÊU E: Bẻ góc 90 độ, xoay tròn chậm
        // ===============================================
        else if (phim === 'E') {
            setTimeout(() => {
                const vk = taoVatTheKaya('vukhikaya', 5);
                vk.position.copy(tayPhaiPos).add(huongMat.clone().multiplyScalar(1.5));
                vk.lookAt(mucTieu);
                scene.add(vk);

                kyNangKaya.push({
                    mesh: vk, type: 'BAY_THANG_BE_GOC_90', speed: 8.0, life: 120, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.5, noBanKinh: 12, initialized: false, isRemote: isRemote
                });
            }, 400);
        }

        // ===============================================
        // 🗡️ CHIÊU R: Model to hơn, xoay ngang
        // ===============================================
        else if (phim === 'R') {
            setTimeout(() => {
                const vkBig = taoVatTheKaya('vukhikaya', 10); 
                vkBig.position.copy(tayPhaiPos).add(huongMat.clone().multiplyScalar(2.0));
                vkBig.lookAt(mucTieu);
                scene.add(vkBig);

                kyNangKaya.push({
                    mesh: vkBig, type: 'BAY_THANG_XOAY_NGANG', speed: 9.0, life: 120,
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.8, noBanKinh: 20, isRemote: isRemote
                });
            }, 500);
        }

        // ===============================================
        // ☄️ CHIÊU F: MƯA VŨ KHÍ (Copy Logic Fujitora)
        // ===============================================
        else if (phim === 'F') {
            let tongThoiGian = 3000;
            let soLuongMua = 15;
            let delayPerVukhi = tongThoiGian / soLuongMua;

            for (let i = 0; i < soLuongMua; i++) {
                setTimeout(() => {
                    const muaVk = taoVatTheKaya('vukhikaya', 7);

                    let posDap = diemChanMucTieu.clone();
                    posDap.x += (Math.random() - 0.5) * 45;
                    posDap.z += (Math.random() - 0.5) * 45;

                    let posXuatPhat = posDap.clone();
                    posXuatPhat.y += 160 + Math.random() * 40; 
                    posXuatPhat.sub(huongMat.clone().multiplyScalar(80)); 

                    muaVk.position.copy(posXuatPhat);
                    muaVk.lookAt(posDap);
                    scene.add(muaVk);

                    kyNangKaya.push({
                        mesh: muaVk, type: 'MUA_VU_KHI', speed: 4.5, life: 150,
                        targetPos: posDap, damage: dameGoc * 0.066, noBanKinh: 25, isRemote: isRemote
                    });
                }, 500 + i * delayPerVukhi);
            }
        }

    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ KAYA
    // ==========================================
    window.updateCombatKaya = function () {
        
        for (let i = kyNangKaya.length - 1; i >= 0; i--) {
            let s = kyNangKaya[i]; s.life--;
            let hienThiModel = s.mesh.children.length > 0 ? s.mesh.children[0] : null;

            if (s.targetPos) {
                let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                
                // 🌟 XỬ LÝ QUÁN TÍNH XOAY CHO TỪNG CHIÊU THỨC
                if (hienThiModel) {
                    if (s.type === 'BAY_THANG_XOAY_DUNG') {
                        hienThiModel.rotateY(0.4); // Xoay dọc tít thò lò
                    } 
                    else if (s.type === 'BAY_THANG_BE_GOC_90') {
                        if (!s.initialized) {
                            hienThiModel.rotation.set(Math.PI / 2, 0, 0); // Bẻ cúp xuống 90 độ 1 lần duy nhất
                            s.initialized = true;
                        }
                        hienThiModel.rotateZ(0.15); // Xoay chậm theo trục đã bị bẻ
                    }
                    else if (s.type === 'BAY_THANG_XOAY_NGANG') {
                        hienThiModel.rotateX(0.4); // Xoay lộn nhào trục ngang
                    }
                    else if (s.type === 'MUA_VU_KHI') {
                        hienThiModel.rotateZ(0.3); // Vũ khí rơi từ trên trời cắm xuống xoay vòng
                        s.speed *= 1.05; // Gia tốc rơi trọng lực hệt như Fujitora
                        if (s.speed > 18.0) s.speed = 18.0;
                    }
                }

                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    
                    // 🌟 2. QUY TẮC 3 QUYỀN LỰC SÁT THƯƠNG
                    if (s.isRemote === false) {
                        // QUYỀN 1: Sếp đánh (Gây dame Quái + Gọi mạng)
                        gaySatThuongKaya(s.targetPos, s.damage, s.noBanKinh);
                    } 
                    else if (typeof s.isRemote === 'number' && s.isRemote > 0) {
                        // QUYỀN 2: Boss đánh (Trừ máu Sếp trực tiếp)
                        if (typeof window.gaySatThuongBossToPlayer === 'function') {
                            window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                        }
                    } 
                    else if (s.isRemote === true) {
                        // QUYỀN 3: Người chơi khác PVP (Bỏ qua để Server trừ máu)
                    }

                    taoHieuUngNoKaya(s.targetPos, s.type === 'MUA_VU_KHI');
                    s.life = 0;
                }
            }

            // 🛑 DỌN RÁC MODEL TẬN GỐC
            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangKaya.splice(i, 1);
            }
        }

        // Dọn rác Hạt Bụi Nổ
        for (let i = hieuUngKaya.length - 1; i >= 0; i--) {
            let h = hieuUngKaya[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].multiplyScalar(0.9); h.velocities[j].y += 0.05; 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 25;

            if (h.life <= 0) { 
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose(); 
                if (h.system.material) h.system.material.dispose(); 
                hieuUngKaya.splice(i, 1); 
            }
        }

        // Dọn rác Thẻ số nhảy dame
        for (let i = danhSachSoBayKaya.length - 1; i >= 0; i--) {
            let it = danhSachSoBayKaya[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';
            if (it.life <= 0) { it.el.remove(); danhSachSoBayKaya.splice(i, 1); window.tongSoChuNoi_Kaya--; }
        }
    };
    setInterval(window.updateCombatKaya, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI KAYA
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('kaya')) {
        window.HePhaiHienTai = {
            tenPhai: "Tiểu Thư Kaya",
            khoiTao: function () {
                console.log("🌿 Bạo Y Thức Tỉnh! Khởi động Tiểu Thư Kaya thành công!");

                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false;
                    let animBay = null; let animChay = null;

                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        let clip = window.animationsMap[key];

                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position') && (tenTrack.includes('armature') || tenTrack.includes('hips') || tenTrack.includes('pelvis') || tenTrack.includes('root'))) return false;
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

                if (window.vongLapNhanRoiKaya) clearInterval(window.vongLapNhanRoiKaya);
                window.vongLapNhanRoiKaya = setInterval(() => {
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
            tungChieu: window.tungComboKaya,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
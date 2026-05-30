// ==========================================
// ☄️ MÔN PHÁI ĐOẠT XÁ: ĐÔ ĐỐC FUJITORA (HỔ TÍM)
// 👑 CÔNG NGHỆ: FIRE TRAIL + REUSABLE METEOR + GRAVITY SWORD + BALANCED DPS
// ==========================================

(function () {
    const kyNangFuji = [];
    const hieuUngFuji = [];
    const danhSachSoBayFuji = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Fuji = 0;

    // 🌟 1. HIỂN THỊ DAME (TÍM CHO KIẾM, CAM CHO LỬA)
    function taoSoSatThuongFuji(pos3D, satThuong, mauSac = '#ff5500') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_Fuji > 5) return;
        window.tongSoChuNoi_Fuji++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #880000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayFuji.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatFuji = function (viTriGoc) {
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

    function gaySatThuongFuji(tamNo, luongSatThuong, banKinh, isKiem = false) {
        let mauDame = isKiem ? '#9933ff' : '#ff5500'; // Tím cho Q, Cam cho Thiên Thạch
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongFuji(posHienSo, luongSatThuong, mauDame);
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
                            taoSoSatThuongFuji(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff0000');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongFuji(hit.tamNguc.clone(), luongSatThuong, mauDame);
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

    // 🌟 2. HIỆU ỨNG VỤ NỔ LỬA & KIẾM KHÍ TÍM
    function taoHieuUngNoFuji(pos, isBig = false, isKiem = false) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        else if (typeof window.playSound === 'function') window.playSound('no');

        const soLuong = isBig ? 120 : (isKiem ? 20 : 50); 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + (isBig ? 2 : 1); posArr[i * 3 + 2] = pos.z;
            let speed = isBig ? (Math.random() * 2.5 + 1) : (Math.random() * 1.5 + 0.5);
            let vec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiFuji) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 85, 0, 1)'); // Màu lửa cam
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiFuji = new THREE.CanvasTexture(canvas);
        }

        // Tạo texture kiếm tím nếu là chiêu Q
        if (isKiem && !window.textureKiemTimFuji) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(153, 51, 255, 0.9)'); // Màu tím
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureKiemTimFuji = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: isKiem ? 0x9933ff : 0xff5500, 
            size: window.isMobile ? 3.0 : 6.0, 
            map: isKiem ? window.textureKiemTimFuji : window.textureBuiFuji,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngFuji.push({ system: pts, velocities: vels, life: 30 });
    }

    // 🌟 ĐUÔI LỬA THIÊN THẠCH
    function taoDuoiLuaFuji(pos) {
        if (window.isMobile || Math.random() > 0.4) return; // Giảm tải mobile
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([pos.x + (Math.random()-0.5)*2, pos.y + Math.random()*2, pos.z + (Math.random()-0.5)*2]), 3));
        const mat = new THREE.PointsMaterial({ color: 0xff4400, size: 2.0, transparent: true, opacity: 0.8, map: window.textureBuiFuji, blending: THREE.AdditiveBlending, depthWrite: false });
        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngFuji.push({ system: pts, velocities: [new THREE.Vector3(0, 0.1, 0)], life: 15, type: 'trail' });
    }

    // 🌟 3. ĐÚC MODEL: THIÊN THẠCH LỬA & KIẾM TÍM
    function taoVatTheFuji(tenFile, scaleSize, isHoaHoa = false, isKiemTim = false) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let danhSachMat = Array.isArray(c.material) ? c.material : [c.material];
                        danhSachMat.forEach(m => {
                            m.transparent = true;
                            // Nhuộm Thiên Thạch bốc cháy
                            if (isHoaHoa) {
                                if (m.color) m.color.setHex(0x552200); // Đá cháy sậm
                                if (m.emissive) m.emissive.setHex(0xff3300); // Lõi đỏ rực
                                m.opacity = 1.0; 
                            }
                            // Nhuộm Kiếm Khí màu tím trọng lực
                            if (isKiemTim) {
                                if (m.color) m.color.setHex(0x9933ff);
                            }
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

    window.thoiDiemChemCuoi_Fuji = window.thoiDiemChemCuoi_Fuji || 0;

    // ==========================================
    // 🏹 TUNG CHIÊU FUJITORA
    // ==========================================
    window.tungComboFujitora = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        let animCanMua = 'ATTACK1';
        if (phim === 'Q') animCanMua = 'ATTACK1';
        if (phim === 'E') animCanMua = 'ATTACK8';
        if (phim === 'R') animCanMua = 'ATTACK6';
        if (phim === 'F') animCanMua = 'ATTACK7';

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - window.thoiDiemChemCuoi_Fuji < 800) return;
            window.thoiDiemChemCuoi_Fuji = bayGio;
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
        }

        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
        let viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));
        
        let mucTieu = null;
        if (isRemote) {
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            let targetRadar = window.layMucTieuGanNhatFuji(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) mucTieu = window.layHitbox(targetRadar.mesh).tamNguc.clone();
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            
            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Fujitora',
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        const dameGoc = window.DAME_CUA_TOI || 100;
        let diemChanMucTieu = mucTieu.clone(); diemChanMucTieu.y = window.matDatY || 0;

        // ===============================================
        // 🔮 CHIÊU Q (ATTACK1): KIẾM KHÍ TRỌNG LỰC TÍM
        // ===============================================
        if (phim === 'Q') {
            setTimeout(() => {
                // Tái sử dụng KIEMQUANG nhưng bọc màu tím
                let soNgauNhien = Math.floor(Math.random() * 6) + 1;
                const kq = taoVatTheFuji('KIEMQUANG' + soNgauNhien, 40, false, true); 
                
                kq.position.copy(viTriGocToTam).add(huongMat.clone().multiplyScalar(2.5));
                kq.lookAt(mucTieu);
                scene.add(kq);

                kyNangFuji.push({
                    mesh: kq, type: 'BAY_THANG', speed: 12.0, life: 80, isKiem: true,
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.4, isRemote: isRemote, noBanKinh: 12
                }); 
            }, 300);
        }

        // ===============================================
        // 🔥 CHIÊU E (ATTACK8): 3 THIÊN THẠCH LỬA (RƠI NHANH)
        // ===============================================
        else if (phim === 'E') {


            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const thienThach = taoVatTheFuji('THIENTHACH', 25, true); 
                    
                    let posXuatPhat = diemChanMucTieu.clone();
                    posXuatPhat.y += 50; // Rơi từ 50m
                    posXuatPhat.x += (Math.random() - 0.5) * 15; 
                    posXuatPhat.z += (Math.random() - 0.5) * 15;
                    

                    let posDap = posXuatPhat.clone();
                    posDap.y = diemChanMucTieu.y;

                    thienThach.position.copy(posXuatPhat);
                    thienThach.lookAt(posDap); // Nhìn cắm xuống đất
                    scene.add(thienThach);

                    kyNangFuji.push({
                        mesh: thienThach, type: 'ROI_THANG_XUONG', speed: 2.0, life: 150,
                        targetPos: posDap, damage: dameGoc * 0.2, isRemote: isRemote, noBanKinh: 25
                    }); 
                }, 800 + i * 300); // Chờ 0.8s giơ kiếm rồi mới rớt
            }
        }

        // ===============================================
        // 🔥 CHIÊU R (ATTACK6): 1 THIÊN THẠCH KHỔNG LỒ RƠI CHẬM
        // ===============================================
        else if (phim === 'R') {
            setTimeout(() => {
                const thienThach = taoVatTheFuji('THIENTHACH', 60, true); // Size khổng lồ 60
                
                let posXuatPhat = diemChanMucTieu.clone();
                posXuatPhat.y += 70; // Xuất phát cao 70m
                
                thienThach.position.copy(posXuatPhat);
                thienThach.lookAt(diemChanMucTieu);
                scene.add(thienThach);

                kyNangFuji.push({
                    mesh: thienThach, type: 'ROI_THANG_XUONG', speed: 0.5, life: 250, // Tốc độ rơi rấy chậm (0.5 và gia tốc chậm)
                    isUltimate: true, // Cờ đánh dấu rớt chậm
                    targetPos: diemChanMucTieu, damage: dameGoc * 0.6, isRemote: isRemote, noBanKinh: 40
                }); 
            }, 1000);
        }

        // ===============================================
        // 🔥 CHIÊU F (ATTACK7): MƯA THIÊN THẠCH LỬA 3 GIÂY
        // ===============================================
        else if (phim === 'F') {
            let tongThoiGian = 3000;
            let soLuongMua = 15;
            let delayPerMeteor = tongThoiGian / soLuongMua;

            for (let i = 0; i < soLuongMua; i++) {
                setTimeout(() => {
                    const thienThach = taoVatTheFuji('THIENTHACH', 32, true); // To hơn chiêu E (25 -> 32)
                    
                    let posXuatPhat = diemChanMucTieu.clone();
                    posXuatPhat.y += 80 + Math.random()*20; // Rơi từ rất cao
                    posXuatPhat.x += (Math.random() - 0.5) * 45; // Diện rộng 45m
                    posXuatPhat.z += (Math.random() - 0.5) * 45;

                    let posDap = posXuatPhat.clone();
                    posDap.y = diemChanMucTieu.y;
                    
                    thienThach.position.copy(posXuatPhat);
                    thienThach.lookAt(posDap);
                    scene.add(thienThach);

                    kyNangFuji.push({
                        mesh: thienThach, type: 'ROI_THANG_XUONG', speed: 1.5, life: 150,
                        targetPos: posDap, damage: dameGoc * 0.066, isRemote: isRemote, noBanKinh: 25
                    }); 
                }, 500 + i * delayPerMeteor);
            }
        }
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU FUJITORA
    // ==========================================
    window.updateCombatFuji = function () {
        
        for (let i = kyNangFuji.length - 1; i >= 0; i--) {
            let s = kyNangFuji[i]; s.life--;

            if (s.type === 'BAY_THANG') {
                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) {
                    gaySatThuongFuji(s.targetPos, s.damage, s.noBanKinh, s.isKiem);
                    taoHieuUngNoFuji(s.targetPos, false, s.isKiem);
                    s.life = 0;
                }
            }
            // 🌟 VẬT LÝ THIÊN THẠCH RƠI XUỐNG
            else if (s.type === 'ROI_THANG_XUONG') {
                if (s.mesh.children.length > 0) s.mesh.children[0].rotateZ(0.2); // Thiên thạch xoay mủi khoan

                // Gia tốc trọng trường
                if (s.isUltimate) {
                    s.speed *= 1.03; // Chiêu R rơi chậm tăng tốc chậm
                    if (s.speed > 8.0) s.speed = 8.0; 
                } else {
                    s.speed *= 1.08; // E và F rơi nhanh
                    if (s.speed > 15.0) s.speed = 15.0; 
                }
                
                s.mesh.position.y -= s.speed;
                
                // Tạo đuôi lửa xẹt xẹt khi bay
                taoDuoiLuaFuji(s.mesh.position);

                if (s.mesh.position.y <= s.targetPos.y + 2) {
                    gaySatThuongFuji(s.targetPos, s.damage, s.noBanKinh);
                    taoHieuUngNoFuji(s.targetPos, s.isUltimate, false); // Nổ siêu to nếu là R
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                scene.remove(s.mesh);
                kyNangFuji.splice(i, 1);
            }
        }

        // Cập nhật Bụi Lửa & Đuôi Lửa
        for (let i = hieuUngFuji.length - 1; i >= 0; i--) {
            let h = hieuUngFuji[i]; h.life--;
            
            if (h.type === 'trail') {
                let posArr = h.system.geometry.attributes.position.array;
                for (let j = 0; j < posArr.length / 3; j++) {
                    posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                }
                h.system.geometry.attributes.position.needsUpdate = true;
                h.system.material.opacity = h.life / 15;
            } else {
                let posArr = h.system.geometry.attributes.position.array;
                for (let j = 0; j < posArr.length / 3; j++) {
                    posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                    h.velocities[j].multiplyScalar(0.9); h.velocities[j].y += 0.05; 
                }
                h.system.geometry.attributes.position.needsUpdate = true;
                h.system.material.opacity = h.life / 30;
            }
            
            if (h.life <= 0) { scene.remove(h.system); hieuUngFuji.splice(i, 1); }
        }

        // Cập nhật Số dame
        for (let i = danhSachSoBayFuji.length - 1; i >= 0; i--) {
            let it = danhSachSoBayFuji[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';
            if (it.life <= 0) { it.el.remove(); danhSachSoBayFuji.splice(i, 1); window.tongSoChuNoi_Fuji--; }
        }
    };
    setInterval(window.updateCombatFuji, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.trim() !== '') {
        window.HePhaiHienTai = {
            tenPhai: "Hổ Tím Fujitora",
            khoiTao: function () {
                console.log("☄️ Trọng Lực Áp Đảo! Khởi động Đô Đốc Fujitora!");

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
            tungChieu: window.tungComboFujitora,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
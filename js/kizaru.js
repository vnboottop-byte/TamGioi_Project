// ==========================================
// 🌟 HỆ THỐNG KỸ NĂNG ĐOẠT XÁ: ĐÔ ĐỐC KIZARU (HỆ ÁNH SÁNG)
// ==========================================

(function () {
    const kyNangKizaru = [];
    const hieuUngKizaru = [];
    const danhSachSoBayKZR = [];

    // 🌟 ĐỒNG BỘ THỜI GIAN HỒI CHIÊU & SÁT THƯƠNG CHUẨN PHÁP SƯ (Tổng 2.5x)
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    window.tongSoChuNoi_KZR = 0;
    function taoSoSatThuongKZR(pos3D, satThuong, mauSac = '#ffcc00') {
        if (window.isMobile) return; 
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_KZR > 5) return;
        window.tongSoChuNoi_KZR++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #ff6600';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayKZR.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatKZR = function(viTriGoc) {
        let targetPos = null; let minD = 500; 
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minD) { minD = d; targetPos = hit.tamNguc; }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minD) { minD = d; targetPos = hit.tamNguc; }
                }
            });
        }
        return targetPos;
    };

    function gaySatThuongKZR(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongKZR(posHienSo, luongSatThuong, '#ffaa00');
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
                            taoSoSatThuongKZR(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongKZR(hit.tamNguc.clone(), luongSatThuong);
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

    window.thoiDiemNoCuoiCungKZR = window.thoiDiemNoCuoiCungKZR || 0;

    // 💥 HIỆU ỨNG NỔ ÁNH SÁNG (BỤI VÀNG TUNG TÓE CỰC MỊN)
    function taoVuNoAnhSangKZR(pos, isRemote = false, luongDame = 100, banKinh = 15) {
        if (isRemote === false && luongDame > 0) gaySatThuongKZR(pos, luongDame, banKinh);
        else if (typeof isRemote === 'number' && isRemote > 0) {
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, isRemote, banKinh);
        }

        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungKZR < 250) return; 
        window.thoiDiemNoCuoiCungKZR = bayGio;

        const soLuong = window.isMobile ? 15 : 100; // 🌟 Xả 100 hạt bụi vàng tung tóe
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            // 🌟 Ép văng tung tóe lên cao rồi mới rớt xuống
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 10, Math.random() * 12, (Math.random() - 0.5) * 10));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        // 🌟 BÙA CHÚ TẠO HẠT BỤI VÀNG MỊN NHƯ CỦA PHÁP SƯ
        if (!window.textureBuiVangMin) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   // Lõi trắng chói
            gradient.addColorStop(0.3, 'rgba(255, 200, 0, 0.9)'); // Viền vàng óng mịn màng
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');         // Tàng hình ở mép
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiVangMin = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xffdd00, size: window.isMobile ? 5.0 : 8.0, map: window.textureBuiVangMin, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngKizaru.push({ system: pts, velocities: vels, life: 35, type: 'explosion' }); 
    }




    // ==========================================
    // 🔪 KỸ XẢO 1: LƯỠI ĐAO BÁN NGUYỆT CHIÊU E (BẢN MỊN MÀNG - KHÔNG SỌC)
    // ==========================================
    function taoHinhBanNguyet(banKinh, colorHex) {
        const group = new THREE.Group();
        
        // 🌟 LỚP VỎ: Vàng óng, mờ ảo
        const geoVo = new THREE.CylinderGeometry(banKinh, banKinh, 1.5, 32, 1, true, 0, Math.PI); 
        const matVo = new THREE.MeshBasicMaterial({ 
            color: colorHex, transparent: true, opacity: 0.6, 
            blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false 
        });
        const meshVo = new THREE.Mesh(geoVo, matVo);
        
        // 🌟 LỚP LÕI: Trắng toát, dày dặn
        const geoLoi = new THREE.CylinderGeometry(banKinh * 0.8, banKinh * 0.8, 0.8, 32, 1, true, 0, Math.PI);
        const matLoi = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, transparent: true, opacity: 1.0, 
            blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false 
        });
        const meshLoi = new THREE.Mesh(geoLoi, matLoi);

        const luoiDaoGroup = new THREE.Group();
        luoiDaoGroup.add(meshVo);
        luoiDaoGroup.add(meshLoi);
        // ĐÃ VỨT BỎ CÁI LỚP WIREFRAME (SỌC SỌC) VÀO SỌT RÁC! 🗑️

        luoiDaoGroup.rotation.y = -Math.PI / 2; // Bụng đâm tới, sừng vuốt ra sau
        luoiDaoGroup.scale.set(2.0, 2.0, 3.0);  // Giữ nguyên độ bành trướng khổng lồ

        group.add(luoiDaoGroup);
        return group;
    }

    



    // ==========================================
    // ⚡ KỸ XẢO 2: TIA LAZER KÉO DÀI 1 ĐƯỜNG TỚI ĐÍCH (Q, R, F)
    // ==========================================
    function taoTiaLazerLienTuc(startPos, endPos, radius, colorHex) {
        const group = new THREE.Group();
        let dist = startPos.distanceTo(endPos);
        if (dist < 0.1) dist = 0.1;

        const geoLoi = new THREE.CylinderGeometry(radius * 0.4, radius * 0.4, dist, 8);
        geoLoi.rotateX(Math.PI / 2); // Nằm ngang
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false });
        const loi = new THREE.Mesh(geoLoi, matLoi);
        
        const geoVo = new THREE.CylinderGeometry(radius, radius, dist, 8);
        geoVo.rotateX(Math.PI / 2);
        const matVo = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
        const vo = new THREE.Mesh(geoVo, matVo);
        
        group.add(loi); group.add(vo);

        // Kéo tia lazer nằm ngay giữa điểm bắn và đích đến, mặt chĩa vào đích
        let midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
        group.position.copy(midPoint);
        group.lookAt(endPos);

        return group;
    }

    // ==========================================
    // ✨ TUNG CHIÊU KIZARU (BẮT ĐÚNG THỊT BLENDER, TRỄ 0.5S)
    // ==========================================
    window.tungComboKizaru = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc && !isRemote) return;

        // 1. ÁP ANIMATION CHUẨN TỪ BLENDER
        let tenAnimMua = 'ATTACK1';
        if (phim === 'Q') tenAnimMua = 'ATTACK1';      // Số 4
        else if (phim === 'E') tenAnimMua = 'ATTACK2'; // Số 5
        else if (phim === 'F') tenAnimMua = 'ATTACK3'; // Số 25
        else if (phim === 'R') tenAnimMua = 'ATTACK4'; // Số 26

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;

            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua);
        }

        let viTriGocToTam = new THREE.Vector3();
        let upVector = nvc ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); 
        if (nvc) { nvc.getWorldDirection(huongMat); huongMat.normalize(); }
        let mucTieu = null;

        if (isRemote) {
            viTriGocToTam = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            upVector = viTriGocToTam.clone().normalize(); 
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            viTriGocToTam = nvc.position.clone();
            viTriGocToTam.add(upVector.clone().multiplyScalar(4.0));
            
            let target = window.layMucTieuGanNhatKZR(viTriGocToTam);
            mucTieu = target ? target.clone() : viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(300));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Kizaru', 
                    origin: {x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z}, target: {x: mucTieu.x, y: mucTieu.y, z: mucTieu.z}, dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z}, weaponUrl: ""
                })), { reliable: true });
            }
        }

        const dameGoc = window.DAME_CUA_TOI || 100; // ĐỒNG BỘ DAME 100

        // =====================================
        // 2. ĐỘ TRỄ 500MS VÀ KÍCH HOẠT SÁT THƯƠNG
        // =====================================
        setTimeout(() => {
            let viTriXuatChieu = viTriGocToTam.clone(); 
            
            // 🌟 MÁY DÒ THỊT (MESH TRACKER: Tóm đúng Object Blender của Sếp)
            let tenMeshCanTim = 'Object_28'; // Mặc định Q và R
            if (phim === 'E') tenMeshCanTim = 'Object_19';
            if (phim === 'F') tenMeshCanTim = 'Object_12';

            if (nvc) {
                let timThayThit = null;
                nvc.traverse(c => {
                    if (c.isMesh && c.name === tenMeshCanTim) timThayThit = c;
                });
                // Nếu tìm thấy thịt, chiếu tia đúng từ lõi cục thịt đó ra!
                if (timThayThit) {
                    timThayThit.getWorldPosition(viTriXuatChieu);
                }
            }

            if (phim === 'Q') {
                // ⚡ CHẮC CHẮN TRÚNG ĐÍCH TỨC THÌ
                const tiaSang = taoTiaLazerLienTuc(viTriXuatChieu, mucTieu, 0.6, 0xffff00); 
                scene.add(tiaSang); 
                
                taoVuNoAnhSangKZR(mucTieu, isRemote, dameGoc * 0.4, 5); // Tính Dame Q: 0.4
                kyNangKizaru.push({ mesh: tiaSang, type: 'TIA_CHOP', life: 15 });
            }
            else if (phim === 'E') {
                // 🔪 BÁN NGUYỆT ĐAO: Quét tới phía trước
                const luoiDao = taoHinhBanNguyet(5.0, 0xffcc00);
                luoiDao.position.copy(viTriXuatChieu); 
                luoiDao.up.copy(upVector); 
                luoiDao.lookAt(mucTieu); 
                scene.add(luoiDao);
                
                kyNangKizaru.push({ mesh: luoiDao, type: 'E_BLADE', life: 80, speed: 12.0, targetPos: mucTieu, damage: dameGoc * 0.6, isRemote: isRemote, upVector: upVector.clone() });
            }
            else if (phim === 'R') {
                // ⚡ LIÊN HOÀN LAZER: 8 tia bắn bủa vây xung quanh kẻ địch
                for(let i = 0; i < 8; i++) {
                    let offset = new THREE.Vector3((Math.random() - 0.5)*8, (Math.random() - 0.5)*8, (Math.random() - 0.5)*8);
                    let targetLech = mucTieu.clone().add(offset);
                    
                    const tiaNho = taoTiaLazerLienTuc(viTriXuatChieu, targetLech, 0.4, 0xffaa00);
                    scene.add(tiaNho);
                    
                    // Tính Dame R: 8 tia x 0.075 = 0.6 tổng
                    taoVuNoAnhSangKZR(targetLech, isRemote, dameGoc * 0.075, 8);
                    kyNangKizaru.push({ mesh: tiaNho, type: 'TIA_CHOP', life: 15 });
                }
            }
            else if (phim === 'F') {
                // ⚡ ĐẠI LAZER: Bắn tia siêu to, trúng ngay lập tức
                const tiaBu = taoTiaLazerLienTuc(viTriXuatChieu, mucTieu, 5.0, 0xff5500); 
                scene.add(tiaBu);
                
                taoVuNoAnhSangKZR(mucTieu, isRemote, dameGoc * 0.9, 35); // Tính Dame F: 0.9
                kyNangKizaru.push({ mesh: tiaBu, type: 'TIA_CHOP', life: 25 });
            }
        }, 500); // ⏳ Độ trễ 500 mili-giây
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ KIZARU 
    // ==========================================
    window.updateCombatKizaru = function () {
        for (let i = kyNangKizaru.length - 1; i >= 0; i--) {
            let s = kyNangKizaru[i]; s.life--;

            // ⚡ Tia sáng tức thì: Mờ dần và tắt (Không cần bay vì đục trúng mục tiêu rồi)
            if (s.type === 'TIA_CHOP') {
                s.mesh.traverse(c => { if (c.material) c.material.opacity *= 0.8; });
            }

            // 🔪 Lưỡi Đao Bán Nguyệt: TẦM NHIỆT KHÓA CHẾT MỤC TIÊU VÀ BÀNH TRƯỚNG
            else if (s.type === 'E_BLADE') {
                s.mesh.translateZ(s.speed);
                
                // Bành trướng đao quang (Quét rộng ra hai bên)
                s.mesh.scale.x += 0.2; 
                s.mesh.scale.z += 0.2; 
                
                // 🌟 AI TẦM NHIỆT: CHẮC CHẮN TRÚNG 100%
                if (s.targetPos) {
                    if (!s.isRemote) {
                        // Liên tục dò vị trí hiện tại của kẻ địch đang chạy
                        const mucTieuMoi = window.layMucTieuGanNhatKZR(s.mesh.position);
                        if (mucTieuMoi) s.targetPos = mucTieuMoi;
                    }
                    
                    // Khóa cứng mục tiêu: Ép đao quang bẻ lái ôm cua khét lẹt rượt theo
                    const dummy = new THREE.Object3D(); 
                    dummy.position.copy(s.mesh.position); 
                    dummy.up.copy(s.upVector || new THREE.Vector3(0,1,0));
                    dummy.lookAt(s.targetPos);
                    
                    // Hệ số 0.3 là bẻ lái cực gắt, địch tàng hình cũng rượt trúng!
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.3); 
                }

                if (s.mesh.position.distanceTo(s.targetPos) < s.speed + 8 || s.life < 5) {
                    taoVuNoAnhSangKZR(s.targetPos, s.isRemote, Math.round(s.damage), 30); 
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangKizaru.splice(i, 1);
            }
        }

        // 🌟 Cập nhật hạt bụi vàng nổ tung tóe và rơi lả tả
        for (let i = hieuUngKizaru.length - 1; i >= 0; i--) {
            let h = hieuUngKizaru[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; 
                posArr[j * 3 + 1] += h.velocities[j].y; 
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                // 🌟 Lực cản không khí và Trọng lực
                h.velocities[j].x *= 0.9; // Tản ra 2 bên chậm dần
                h.velocities[j].z *= 0.9; 
                h.velocities[j].y -= 0.5; // Bị hút rơi lả tả xuống đất giống Jimbei!
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 35; // Mờ dần

            if (h.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(h.system); else scene.remove(h.system);
                hieuUngKizaru.splice(i, 1);
            }
        }

        // Số bay UI
        for (let i = danhSachSoBayKZR.length - 1; i >= 0; i--) {
            let it = danhSachSoBayKZR[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayKZR.splice(i, 1); window.tongSoChuNoi_KZR--; }
        }
    };

    setInterval(window.updateCombatKizaru, 30);

    // ==========================================
    // 🌟 KHỞI TẠO BỘ TỪ ĐIỂN AI (GÁN ĐÚNG ANIMATION CỦA SẾP)
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('kizaru')) {
        window.HePhaiHienTai = {
            tenPhai: "Đô Đốc Kizaru",
            khoiTao: function () {
                console.log("⚡ Tốc độ ánh sáng! Kizaru đã được định tuyến!");

                if (window.animationsMap) {
                    window.animationsMap['CHAYBO'] = window.animationsMap['CHAYBO']; // Anim 23
                    window.animationsMap['BAY']    = window.animationsMap['BAY'];    // Anim 18
                }
            },
            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) {
                window.tungComboKizaru(phim, isRemote, origin, target, dir, casterId, weaponUrl);
            },
            capNhat: function () {
                // 🧠 AI RANDOM NHÀN RỖI: Đảo ngẫu nhiên 5 dáng đứng (15, 16, 21, 22, 31, 32)
                if (!window.dangMuaChieu && !window.isMoving && window.animationsMap) {
                    let bayGio = Date.now();
                    if (!window.lastIdleSwap || bayGio - window.lastIdleSwap > 5000) {
                        window.lastIdleSwap = bayGio;
                        
                        let cacTheNhanRoi = ['NHANROI', 'NHANROI2', 'HOME', 'HOME2', 'HOME3'];
                        
                        // Lọc những cái Sếp đã nhúng thành công vào Blender
                        let cacTheSanCo = cacTheNhanRoi.filter(t => window.animationsMap[t]);
                        
                        if (cacTheSanCo.length > 0) {
                            let chonBua = cacTheSanCo[Math.floor(Math.random() * cacTheSanCo.length)];
                            
                            // Tráo ruột Từ điển, để khi Engine gọi 'NHANROI', nó sẽ ra dáng mới!
                            window.animationsMap['NHANROI'] = window.animationsMap[chonBua];
                            if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMapChar[chonBua];
                        }
                    }
                }
            } 
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
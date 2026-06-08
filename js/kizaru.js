// ==========================================
// ⚡ MÔN PHÁI ĐOẠT XÁ: ĐÔ ĐỐC KIZARU (HỆ ÁNH SÁNG - MASTER FILE V3)
// 👑 CÔNG NGHỆ: DYNAMIC MESH TRACKER + KIẾM QUANG ÁNH SÁNG CHỮ X + INSTANT CAST
// ==========================================

(function () {
    const kyNangKizaru = [];
    const hieuUngKizaru = [];
    const danhSachSoBayKZR = [];

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

    function taoVuNoAnhSangKZR(pos, isRemote = false, luongDame = 100, banKinh = 15, upVector = new THREE.Vector3(0, 1, 0)) {
        if (isRemote === false && luongDame > 0) {
            gaySatThuongKZR(pos, luongDame, banKinh);
        }
        else if (typeof isRemote === 'number' && isRemote > 0) {
            if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pos, luongDame, banKinh);
        }

        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungKZR < 250) return; 
        window.thoiDiemNoCuoiCungKZR = bayGio;

        const soLuong = window.isMobile ? 15 : 100; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 10, Math.random() * 12, (Math.random() - 0.5) * 10));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiVangMin) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   
            gradient.addColorStop(0.3, 'rgba(255, 200, 0, 0.9)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');         
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiVangMin = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xffdd00, size: window.isMobile ? 5.0 : 8.0, map: window.textureBuiVangMin, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngKizaru.push({ system: pts, velocities: vels, life: 35, type: 'explosion', upVector: upVector.clone() }); 
    }

    // 🌟 1. VÁ LỖI: ĐÚC LƯỠI KIẾM ÁNH SÁNG TỪ KIEMQUANG2.GLB CỦA ZORO
    function taoKiemQuangVang(scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/KIEMQUANG2.glb'; // Lấy thẳng KIEMQUANG số 2 siêu đẹp

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let danhSachMat = Array.isArray(c.material) ? c.material : [c.material];
                        danhSachMat.forEach(m => {
                            m.transparent = true;
                            // Nhuộm Vàng Ánh Sáng để khớp với Kizaru
                            if (m.color) m.color.setHex(0xffff00); 
                            if (m.emissive) { m.emissive.setHex(0xffaa00); m.emissiveIntensity = 2.0; }
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

    function taoTiaLazerLienTuc(startPos, endPos, radius, colorHex) {
        const group = new THREE.Group();
        let dist = startPos.distanceTo(endPos);
        if (dist < 0.1) dist = 0.1;

        const geoLoi = new THREE.CylinderGeometry(radius * 0.4, radius * 0.4, dist, 8);
        geoLoi.rotateX(Math.PI / 2); 
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false });
        const loi = new THREE.Mesh(geoLoi, matLoi);
        
        const geoVo = new THREE.CylinderGeometry(radius, radius, dist, 8);
        geoVo.rotateX(Math.PI / 2);
        const matVo = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
        const vo = new THREE.Mesh(geoVo, matVo);
        
        group.add(loi); group.add(vo);

        let midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
        group.position.copy(midPoint);
        group.lookAt(endPos);

        return group;
    }

    // ==========================================
    // ✨ TUNG CHIÊU KIZARU V2
    // ==========================================
    window.tungComboKizaru = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc && !isRemote) return;

        let tenAnimMua = 'ATTACK1';
        if (phim === 'Q') tenAnimMua = 'ATTACK1';      
        else if (phim === 'E') tenAnimMua = 'ATTACK2'; 
        else if (phim === 'F') tenAnimMua = 'ATTACK3'; 
        else if (phim === 'R') tenAnimMua = 'ATTACK4'; 

        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua);
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua);

            if (window.henGioTatMuaKZR) clearTimeout(window.henGioTatMuaKZR);
            window.henGioTatMuaKZR = setTimeout(() => { window.dangMuaChieu = false; }, 600);
        }

        let viTriGocToTam = new THREE.Vector3();
        let upVector = nvc ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); 
        
        if (nvc) {
            nvc.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
            if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }
        }
        let mucTieu = null;

        if (isRemote) {
            viTriGocToTam = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            upVector = viTriGocToTam.clone().normalize(); 
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(4.0));
            let target = window.layMucTieuGanNhatKZR(viTriGocToTam);
            mucTieu = target ? target.clone() : viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(300));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Kizaru', 
                    origin: {x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z}, target: {x: mucTieu.x, y: mucTieu.y, z: mucTieu.z}, dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z}, weaponUrl: ""
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

        setTimeout(() => {
            let tenMeshCanTim = 'Object_28'; 
            if (phim === 'E') tenMeshCanTim = 'Object_19';
            if (phim === 'F') tenMeshCanTim = 'Object_12';

            let curNvc = nvc;
            if (!isRemote) {
                curNvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
            }
            if (!curNvc) return;

            let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
            let viTriXuatChieu = curNvc.position.clone().add(curUp.clone().multiplyScalar(4.0));

            let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
            if (curDir.lengthSq() < 0.001) curDir.set(0, 0, 1).applyQuaternion(curNvc.quaternion).projectOnPlane(curUp).normalize();
            
            let timThayThit = null;
            curNvc.traverse(c => {
                if (c.isMesh && c.name === tenMeshCanTim) timThayThit = c;
            });
            if (timThayThit) timThayThit.getWorldPosition(viTriXuatChieu);

            if (phim === 'Q') {
                const tiaSang = taoTiaLazerLienTuc(viTriXuatChieu, mucTieu, 0.6, 0xffff00); 
                scene.add(tiaSang); 
                taoVuNoAnhSangKZR(mucTieu, isRemote, dameGoc * 0.4, 5, curUp); 
                kyNangKizaru.push({ mesh: tiaSang, type: 'TIA_CHOP', life: 15 });
            }
            // =====================================
            // 🌟 2. VÁ LỖI: CHIÊU E SAO CHÉP HOÀN HẢO KIẾM KHÍ CHÉO CỦA ZORO
            // =====================================
            else if (phim === 'E') {
                let offsetRight = new THREE.Vector3().crossVectors(curDir, curUp).normalize();
                
                // Phóng 2 nhát chém tản ngang ra một chút tạo thành chữ X cực lớn
                for (let i = 0; i < 2; i++) {
                    const kq = taoKiemQuangVang(50); // Scale to 50 cho lực Ánh sáng
                    
                    let offset = (i - 0.5) * 2.0; 
                    let diemBan = viTriXuatChieu.clone().add(offsetRight.clone().multiplyScalar(offset));
                    
                    kq.position.copy(diemBan); 
                    kq.up.copy(curUp); // ÉP TRỤC CẦU 100% CHUẨN
                    
                    let targetBay = mucTieu ? mucTieu.clone() : viTriXuatChieu.clone().add(curDir.clone().multiplyScalar(150));
                    kq.lookAt(targetBay); 
                    
                    // 🌟 Bí thuật của Zoro: Xoay nghiêng 45 độ để 2 nhát tạo thành chữ X
                    kq.rotateZ((i % 2 === 0) ? (Math.PI / 4) : (-Math.PI / 4));
                    
                    scene.add(kq);
                    
                    kyNangKizaru.push({ 
                        mesh: kq, type: 'E_BLADE', speed: 18.0, life: 80, // Tốc độ 18.0 nhanh hơn Zoro
                        targetPos: targetBay, damage: dameGoc * 0.3, isRemote: isRemote, upVector: curUp.clone() 
                    });
                }
            }
            else if (phim === 'R') {
                for(let i = 0; i < 8; i++) {
                    let offset = new THREE.Vector3((Math.random() - 0.5)*8, (Math.random() - 0.5)*8, (Math.random() - 0.5)*8);
                    let targetLech = mucTieu.clone().add(offset);
                    
                    const tiaNho = taoTiaLazerLienTuc(viTriXuatChieu, targetLech, 0.4, 0xffaa00);
                    scene.add(tiaNho);
                    
                    taoVuNoAnhSangKZR(targetLech, isRemote, dameGoc * 0.0625, 8, curUp);
                    kyNangKizaru.push({ mesh: tiaNho, type: 'TIA_CHOP', life: 15 });
                }
            }
            else if (phim === 'F') {
                const tiaBu = taoTiaLazerLienTuc(viTriXuatChieu, mucTieu, 5.0, 0xff5500); 
                scene.add(tiaBu);
                taoVuNoAnhSangKZR(mucTieu, isRemote, dameGoc * 1.0, 35, curUp);
                kyNangKizaru.push({ mesh: tiaBu, type: 'TIA_CHOP', life: 25 });
            }
        }, 300); // 🌟 ÉP XUNG XUỐNG CÒN 300MS CHO MƯỢT
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ KIZARU 
    // ==========================================
    window.updateCombatKizaru = function () {
        for (let i = kyNangKizaru.length - 1; i >= 0; i--) {
            let s = kyNangKizaru[i]; s.life--;

            if (s.type === 'TIA_CHOP') {
                s.mesh.traverse(c => { if (c.material) c.material.opacity *= 0.8; });
            }
            // 🌟 3. VÁ LỖI: VẬT LÝ CHIÊU E BAY THẲNG TẮP KHÔNG LƯỢN VÒNG VÈO NỮA
            else if (s.type === 'E_BLADE') {
                s.mesh.translateZ(s.speed); // Bay thẳng xuyên suốt như Tu Tiên
                
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 8 || s.life < 5) {
                    taoVuNoAnhSangKZR(s.targetPos, s.isRemote, Math.round(s.damage), 20, s.upVector || new THREE.Vector3(0,1,0)); 
                    s.life = 0;
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangKizaru.splice(i, 1);
            }
        }

        for (let i = hieuUngKizaru.length - 1; i >= 0; i--) {
            let h = hieuUngKizaru[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            
            let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(-0.4) : new THREE.Vector3(0, -0.4, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; 
                posArr[j * 3 + 1] += h.velocities[j].y; 
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].x *= 0.9; 
                h.velocities[j].z *= 0.9; 
                h.velocities[j].add(fallVec); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 35; 

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngKizaru.splice(i, 1);
            }
        }

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
    // 🌟 KHỞI TẠO BỘ TỪ ĐIỂN AI 
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('kizaru')) {
        window.HePhaiHienTai = {
            tenPhai: "Đô Đốc Kizaru",
            khoiTao: function () {
                console.log("⚡ Kizaru V3: Kiếm Khí Chữ X Tốc Độ Ánh Sáng Xuất Chiến!");

                // 🌟 4. VÁ LỖI: PRELOAD THÊM KIEMQUANG2.glb CỦA ZORO ĐỂ BĂM NGAY TỨC KHẮC
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/KIEMQUANG2.glb', () => {});
                }

                if (window.animationsMap) {
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) {
                            window.animationsMap['CHAYBO'] = window.animationsMap[key];
                        }
                        if (k.includes('BAY') || k.includes('FLY')) {
                            window.animationsMap['BAY'] = window.animationsMap[key];
                        }
                    }
                }
            },
            tungChieu: function (phim, isRemote, origin, target, dir, casterId, weaponUrl) {
                window.tungComboKizaru(phim, isRemote, origin, target, dir, casterId, weaponUrl);
            },
            capNhat: function () {
                if (!window.dangMuaChieu && !window.isMoving && window.animationsMap) {
                    let bayGio = Date.now();
                    if (!window.lastIdleSwap || bayGio - window.lastIdleSwap > 60000) {
                        window.lastIdleSwap = bayGio;

                        let cacTheSanCo = Object.keys(window.animationsMap).filter(k =>
                            (k.includes('HOME') || k.includes('NHANROI2')) && k !== 'NHANROI' && k !== 'IDLE'
                        );

                        if (cacTheSanCo.length > 0) {
                            let chonBua = cacTheSanCo[Math.floor(Math.random() * cacTheSanCo.length)];
                            if (typeof window.epNhanVatMua === 'function') {
                                window.epNhanVatMua(chonBua);
                            } else if (typeof window.playAnim === 'function') {
                                window.playAnim(chonBua);
                            }
                        }
                    }
                }
            }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
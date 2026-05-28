// ==========================================
// 🐉 HỆ THỐNG KỸ NĂNG: GOKU (SIÊU SAIYAN)
// 👑 V5: HACK LÕI ENGINE (CHỐNG KẸT COMBO) & ÉP QUẢ CẦU PHÌNH TO
// ==========================================

(function () {
    const kyNangGoku = [];
    const hieuUngGoku = [];
    const danhSachSoBayGK = [];

    const THOI_GIAN_HOI = { 'Q': 2000, 'E': 5000, 'R': 8000, 'F': 18000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    window.tongSoChuNoi_GK = 0;
    function taoSoSatThuongGK(pos3D, satThuong, mauSac = '#ffcc00') {
        if (window.isMobile && window.tongSoChuNoi_GK > 10) return;
        if (satThuong <= 0) return;
        window.tongSoChuNoi_GK++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 8px #000, 2px 2px 0px #aa0000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayGK.push({ el: div, pos: pos3D.clone(), life: 40, offsetY: 0 });
    }

    window.layMucTieuGanNhatGK = function(viTriGoc) {
        if (window.mucTieuHienTai && window.mucTieuHienTai.mesh && !window.mucTieuHienTai.isDead) {
            let hit = window.layHitbox(window.mucTieuHienTai.mesh);
            if (viTriGoc.distanceTo(hit.tamNguc) <= 300) return window.mucTieuHienTai;
        }
        let targetNguoi = null; let minDNguoi = 300; 
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
        
        let targetQuai = null; let minDQuai = 300;
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

    function gaySatThuongGK(tamNo, luongSatThuong, banKinh, mauSac = '#ffcc00') {
        let daTrung = false;
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        daTrung = true;
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongGK(posHienSo, luongSatThuong, mauSac);
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
                        daTrung = true;
                        if (quai.isBoss) {
                            taoSoSatThuongGK(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongGK(hit.tamNguc.clone(), luongSatThuong, mauSac);
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
        return daTrung;
    }

    // ==========================================
    // 🎯 HỆ THỐNG DÒ TÌM BÀN TAY (Object_31)
    // ==========================================
    window.layViTriTayGoku = function(nvc, fallbackHuong) {
        let tayPos = new THREE.Vector3();
        let obj31 = null;
        
        if (nvc) {
            if (nvc.userData && nvc.userData.object31) {
                obj31 = nvc.userData.object31;
            } else {
                nvc.traverse((child) => {
                    if (child.name === 'Object_31' || child.name.includes('Object_31')) {
                        obj31 = child;
                        if (!nvc.userData) nvc.userData = {};
                        nvc.userData.object31 = child; 
                    }
                });
            }
        }
        
        if (obj31) {
            obj31.getWorldPosition(tayPos);
        } else {
            if (nvc) nvc.getWorldPosition(tayPos);
            tayPos.y += 5;
            if (fallbackHuong) tayPos.add(fallbackHuong.clone().multiplyScalar(2));
        }
        return tayPos;
    };

    function taoCauAnhSang(banKinh, colorHex) {
        const group = new THREE.Group();
        const geoLoi = new THREE.SphereGeometry(banKinh * 0.7, 16, 16);
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0 });
        const loi = new THREE.Mesh(geoLoi, matLoi);

        const geoVo = new THREE.SphereGeometry(banKinh, 16, 16);
        const matVo = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
        const vo = new THREE.Mesh(geoVo, matVo);

        group.add(loi); group.add(vo);
        return group;
    }

    function taoTiaKamehameha(radius, colorHex) {
        const group = new THREE.Group();
        const geoLoi = new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, 1, 16);
        geoLoi.rotateX(Math.PI / 2); 
        const matLoi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false });
        const loi = new THREE.Mesh(geoLoi, matLoi);
        
        const geoVo = new THREE.CylinderGeometry(radius, radius, 1, 16);
        geoVo.rotateX(Math.PI / 2);
        const matVo = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
        const vo = new THREE.Mesh(geoVo, matVo);
        
        group.add(loi); group.add(vo);
        return group;
    }

    window.thoiDiemNoCuoiCungGK = 0;
    function taoVuNoKame(pos, colorHex = 0xffcc00, banKinh = 10) {
        let bayGio = Date.now();
        if (bayGio - window.thoiDiemNoCuoiCungGK < 100) return; 
        window.thoiDiemNoCuoiCungGK = bayGio;
        if (typeof window.phatAmThanh === 'function') window.phatAmThanh('uploads/anims/hit.mp3', 0.5);

        const soLuong = window.isMobile ? 10 : 30; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            vels.push(new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 15, (Math.random() - 0.5) * 15));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        const mat = new THREE.PointsMaterial({
            color: colorHex, size: 8.0, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngGoku.push({ system: pts, velocities: vels, life: 20 }); 
    }

    // ==========================================
    // ✨ TUNG CHIÊU GOKU
    // ==========================================
    window.tungComboGoku = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc && !isRemote) return;

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;

            let nutKyNang = document.getElementById('btn' + phim.toUpperCase()) || document.getElementById('skill' + phim.toUpperCase());
            if (nutKyNang) {
                nutKyNang.style.pointerEvents = 'none'; nutKyNang.style.filter = 'brightness(0.4) grayscale(100%)';
                setTimeout(() => { nutKyNang.style.filter = ''; nutKyNang.style.pointerEvents = ''; }, THOI_GIAN_HOI[phim]);
            }
        }

        let viTriGoc = new THREE.Vector3(); 
        let huongMat = new THREE.Vector3(); 
        let mucTieuGoc = new THREE.Vector3();
        const dameGoc = window.DAME_CUA_TOI || 100;

        if (isRemote) {
            viTriGoc.set(remoteGoc.x, remoteGoc.y, remoteGoc.z); 
            huongMat.set(remoteHuong.x, remoteHuong.y, remoteHuong.z); 
            mucTieuGoc.set(remoteDich.x, remoteDich.y, remoteDich.z); 
        } else {
            nvc.getWorldPosition(viTriGoc); 
            nvc.getWorldDirection(huongMat); huongMat.normalize();
            
            let targetQuai = window.layMucTieuGanNhatGK(viTriGoc);
            if (targetQuai && targetQuai.mesh) {
                let hit = window.layHitbox(targetQuai.mesh);
                mucTieuGoc = hit.tamNguc.clone();
                let dummy = new THREE.Object3D(); dummy.position.copy(nvc.position); dummy.lookAt(mucTieuGoc.x, nvc.position.y, mucTieuGoc.z);
                nvc.quaternion.copy(dummy.quaternion);
                nvc.getWorldDirection(huongMat);
            } else {
                mucTieuGoc = viTriGoc.clone().add(huongMat.clone().multiplyScalar(60));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Goku', 
                    origin: { x: viTriGoc.x, y: viTriGoc.y, z: viTriGoc.z }, target: { x: mucTieuGoc.x, y: mucTieuGoc.y, z: mucTieuGoc.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        // 🛑 HÀM BỌC THÉP: LIÊN TỤC RESET ĐỒNG HỒ ENGINE ĐỂ CHỐNG BỊ KẸT / ĐÈ ANIMATION BAY
        function hackKhoaEngine(tenChieu, thoiGian) {
            if (!isRemote) {
                if (typeof window.kichHoatKhiencAnimation === 'function') window.kichHoatKhiencAnimation(thoiGian);
                window.dangMuaChieu = true; 
                window.thoiDiemBatDauMua = Date.now(); // RESET BỘ ĐẾM 1.5 GIÂY CỦA ENGINE!
                if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenChieu);
            }
        }

        // =====================================
        // Q: BẮN 1 QUẢ CẦU
        // =====================================
        if (phim === 'Q') {
            hackKhoaEngine('ATTACK', 1000);
            
            let tayPos = window.layViTriTayGoku(nvc, huongMat);
            let cauQ = taoCauAnhSang(2.0, 0xffcc00);
            cauQ.position.copy(tayPos);
            cauQ.lookAt(mucTieuGoc);
            scene.add(cauQ);
            
            kyNangGoku.push({ mesh: cauQ, type: 'CAU_THUONG', speed: 10.0, life: 100, targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.5, isRemote: isRemote });
        }
        
        // =====================================
        // E: KAMEHAMEHA 1 GIÂY
        // =====================================
        else if (phim === 'E') {
            hackKhoaEngine('ATTACKhold', 1500);

            let tiaE = taoTiaKamehameha(3.0, 0x00ffff); 
            scene.add(tiaE);
            
            kyNangGoku.push({ mesh: tiaE, type: 'TIA_KAME', life: 30, owner: nvc, targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.15, isRemote: isRemote, color: 0x00ffff });
        }

        // =====================================
        // R: ĐẠI KAMEHAMEHA 2 GIÂY 
        // =====================================
        else if (phim === 'R') {
            hackKhoaEngine('ATTACKhold', 2500);

            let tiaR = taoTiaKamehameha(5.0, 0xff0000); 
            scene.add(tiaR);
            
            kyNangGoku.push({ mesh: tiaR, type: 'TIA_KAME', life: 60, owner: nvc, targetPos: mucTieuGoc.clone(), damage: dameGoc * 0.2, isRemote: isRemote, color: 0xff0000 });
        }

        // =====================================
        // F: CHUỖI TỤ KHÍ CẦU KÊNH KHI (VƯỢT RÀO ENGINE 100%)
        // =====================================
        else if (phim === 'F') {
            // Bước 1: Gọi END1 (Đã được dán mác ATTACK_END1)
            hackKhoaEngine('ATTACK_END1', 800);

            // Bước 2: Gọi START sau 600ms
            setTimeout(() => {
                hackKhoaEngine('ATTACK_START', 800);
            }, 600);

            // Bước 3: Gọi HOLD sau 1200ms
            setTimeout(() => {
                hackKhoaEngine('ATTACK_HOLD', 1200);
            }, 1200);

            // Bước 4: TUNG ĐÒN sau 2200ms
            setTimeout(() => {
                hackKhoaEngine('ATTACK', 1000);
                
                let tayPosMoi = window.layViTriTayGoku(nvc, huongMat);
                // 🛑 Đẩy nhẹ quả cầu ra xa ngực 4 mét để lúc phóng to nó không nuốt chửng Goku
                tayPosMoi.add(huongMat.clone().multiplyScalar(4));

                let cauGenki = taoCauAnhSang(1.0, 0x00aaff); 
                cauGenki.position.copy(tayPosMoi);
                cauGenki.lookAt(mucTieuGoc);
                scene.add(cauGenki);
                
                kyNangGoku.push({ mesh: cauGenki, type: 'GENKI_DAMA', speed: 6.0, life: 150, targetPos: mucTieuGoc.clone(), damage: dameGoc * 2.0, isRemote: isRemote });

                // Bước 5: Gọi END kết thúc chuỗi
                setTimeout(() => {
                    hackKhoaEngine('ATTACK_END', 1000);
                }, 300);

            }, 2200);
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ GOKU
    // ==========================================
    window.updateCombatGoku = function () {
        for (let i = kyNangGoku.length - 1; i >= 0; i--) {
            let s = kyNangGoku[i]; 
            s.life--;

            if (s.type === 'CAU_THUONG') {
                s.mesh.translateZ(s.speed);
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 3) {
                    taoVuNoKame(s.mesh.position, 0xffcc00, 10);
                    if (!s.isRemote) gaySatThuongGK(s.mesh.position, s.damage, 10); 
                    s.life = 0;
                }
            }
            
            else if (s.type === 'GENKI_DAMA') {
                s.mesh.translateZ(s.speed);
                
                // 🛑 CÁCH PHÓNG TO AN TOÀN 100% (ÉP TRỰC TIẾP MATRIX)
                let curScale = s.mesh.scale.x;
                if (curScale < 30.0) { // Cầu Kênh Khi khổng lồ gấp 30 lần
                    curScale += 0.5; // Phình to cực nhanh
                    s.mesh.scale.set(curScale, curScale, curScale); 
                }

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 10) {
                    taoVuNoKame(s.mesh.position, 0x00aaff, 35);
                    if (!s.isRemote) gaySatThuongGK(s.mesh.position, s.damage, 35); 
                    s.life = 0;
                }
            }

            else if (s.type === 'TIA_KAME') {
                if (s.owner && s.owner.parent) {
                    let fwd = new THREE.Vector3(); s.owner.getWorldDirection(fwd);
                    
                    let startPos = window.layViTriTayGoku(s.owner, fwd);
                    
                    if (!s.isRemote) {
                        let mucTieuMoi = window.layMucTieuGanNhatGK(startPos);
                        if (mucTieuMoi && mucTieuMoi.mesh) {
                            let hit = window.layHitbox(mucTieuMoi.mesh);
                            s.targetPos = hit.tamNguc.clone();
                            let dummy = new THREE.Object3D(); dummy.position.copy(s.owner.position); dummy.lookAt(s.targetPos.x, s.owner.position.y, s.targetPos.z);
                            s.owner.quaternion.slerp(dummy.quaternion, 0.2);
                        }
                    }

                    let endPos = s.targetPos;
                    let dist = startPos.distanceTo(endPos);
                    if (dist < 1) dist = 1;

                    s.mesh.scale.z = dist; 
                    let midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
                    s.mesh.position.copy(midPoint);
                    s.mesh.lookAt(endPos);

                    if (s.life % 5 === 0) {
                        taoVuNoKame(endPos, s.color, 8);
                        if (!s.isRemote) gaySatThuongGK(endPos, s.damage, 8, (s.color === 0xff0000 ? '#ff0000' : '#00ffff'));
                    }
                } else {
                    s.life = 0; 
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangGoku.splice(i, 1);
            }
        }

        for (let i = hieuUngGoku.length - 1; i >= 0; i--) {
            let h = hieuUngGoku[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].x *= 0.85; h.velocities[j].z *= 0.85; h.velocities[j].y -= 0.2; 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 20;
            if (h.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(h.system); else scene.remove(h.system);
                hieuUngGoku.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayGK.length - 1; i >= 0; i--) {
            let it = danhSachSoBayGK[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayGK.splice(i, 1); window.tongSoChuNoi_GK--; }
        }
    };

    setInterval(window.updateCombatGoku, 30);

    // ==========================================
    // 🌟 KHỞI TẠO BỘ TỪ ĐIỂN AI (HACK VƯỢT RÀO ENGINE)
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('goku')) {
        window.HePhaiHienTai = {
            tenPhai: "Siêu Saiyan Goku",
            khoiTao: function () {
                console.log("🐉 Lõi Kamehameha kích hoạt: Combo F đã được Hack vượt rào Engine V52!");

                if (window.animationsMap) {
                    // 🛑 ÉP CHẾT CẤM ĐI BỘ
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK') || k.includes('JUMP') || k.includes('FALL')) {
                            if (window.animationsMap['BAY']) window.animationsMap[key] = window.animationsMap['BAY'];
                            else if (window.animationsMap['FLY']) window.animationsMap[key] = window.animationsMap['FLY'];
                        }
                    }
                    if (window.animationsMap['NHANROI']) {
                        window.animationsMap['IDLE'] = window.animationsMap['NHANROI'];
                        window.animationsMap['WAIT'] = window.animationsMap['NHANROI'];
                        if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap['NHANROI'];
                    }

                    // 🛑 BÍ QUYẾT TỐI THƯỢNG: TRÁO RUỘT TỪ ĐIỂN ĐỂ LỪA MÁY QUÉT ENGINE V52
                    // Engine V52 cấm múa các chiêu không có chữ ATTACK, nên ta tự dán mác ATTACK cho tụi nó!
                    if (window.animationsMap['END1']) window.animationsMap['ATTACK_END1'] = window.animationsMap['END1'];
                    if (window.animationsMap['START']) window.animationsMap['ATTACK_START'] = window.animationsMap['START'];
                    if (window.animationsMap['HOLD']) window.animationsMap['ATTACK_HOLD'] = window.animationsMap['HOLD'];
                    else if (window.animationsMap['hold']) window.animationsMap['ATTACK_HOLD'] = window.animationsMap['hold'];
                    if (window.animationsMap['END']) window.animationsMap['ATTACK_END'] = window.animationsMap['END'];
                }
            },
            tungChieu: window.tungComboGoku,
            capNhat: function () {} 
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
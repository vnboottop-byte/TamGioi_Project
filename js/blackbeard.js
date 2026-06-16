// ==========================================
// 🕳️ MÔN PHÁI ĐOẠT XÁ: TỨ HOÀNG RÂU ĐEN (MARSHALL D. TEACH)
// 👑 CÔNG NGHỆ: MỞ KHÓA SPAM QERF + VÁ LỖI TRỤC CẦU 3D + KHÔI PHỤC SÁT THƯƠNG
// ==========================================

(function () {
    // 🌟 BẢN VÁ 1: BỘ NHỚ TOÀN CỤC CHỐNG ĐÓNG BĂNG ĐẠN KHI CÓ 2 RÂU ĐEN
    window.kyNangBB_Global = window.kyNangBB_Global || [];
    window.hieuUngBB_Global = window.hieuUngBB_Global || [];
    window.danhSachSoBayBB_Global = window.danhSachSoBayBB_Global || [];

    let kyNangBB = window.kyNangBB_Global;
    let hieuUngBB = window.hieuUngBB_Global;
    let danhSachSoBayBB = window.danhSachSoBayBB_Global;

    window.KHO_ANIM_NHANROI = [];
    window.tongSoChuNoi_BB = 0;

    function taoSoSatThuongBB(pos3D, satThuong, mauSac = '#9900ff') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_BB > 5) return;
        window.tongSoChuNoi_BB++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #1a0033';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayBB.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatBB = function (viTriGoc) {
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

    function gaySatThuongBB(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongBB(posHienSo, luongSatThuong);
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
                            taoSoSatThuongBB(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff0000');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongBB(hit.tamNguc.clone(), luongSatThuong);
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

    function taoHieuUngNoDenBB(pos, isBig = false, isContinuous = false, upVector = new THREE.Vector3(0, 1, 0)) {
        if (!isContinuous) {
            if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
            else if (typeof window.playSound === 'function') window.playSound('no');
        }

        const soLuong = isBig ? 80 : 25; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            let offset = isBig ? (Math.random() - 0.5) * 20 : (Math.random() - 0.5) * 5;
            let speedY = Math.random() * 2.0 + 1.0;
            
            let pLocal = new THREE.Vector3(offset, Math.random() * 2, offset);
            pLocal.applyQuaternion(qNolo);
            posArr[i * 3] = pos.x + pLocal.x; 
            posArr[i * 3 + 1] = pos.y + pLocal.y; 
            posArr[i * 3 + 2] = pos.z + pLocal.z;
            
            let vLocal = new THREE.Vector3((Math.random() - 0.5) * 0.5, speedY, (Math.random() - 0.5) * 0.5);
            vLocal.applyQuaternion(qNolo);
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiDenBB) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(50, 0, 80, 0.9)'); 
            gradient.addColorStop(0.4, 'rgba(10, 10, 10, 0.8)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiDenBB = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0x220033, size: window.isMobile ? 10.0 : 18.0, map: window.textureBuiDenBB,
            transparent: true, opacity: 0.8, blending: THREE.NormalBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngBB.push({ system: pts, velocities: vels, life: 40, upVector: upVector.clone() });
    }

    function taoThamLuaDenBB(pos, banKinh, upVector = new THREE.Vector3(0, 1, 0)) {
        const soLuong = 100; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            let angle = Math.random() * Math.PI * 2;
            let r = Math.sqrt(Math.random()) * banKinh; 
            
            let pLocal = new THREE.Vector3(Math.cos(angle) * r, 0.2 + (Math.random() * 1.5), Math.sin(angle) * r);
            pLocal.applyQuaternion(qNolo);
            posArr[i * 3] = pos.x + pLocal.x;
            posArr[i * 3 + 1] = pos.y + pLocal.y; 
            posArr[i * 3 + 2] = pos.z + pLocal.z;
            
            let vLocal = new THREE.Vector3((Math.random() - 0.5) * 0.2, Math.random() * 0.4 + 0.1, (Math.random() - 0.5) * 0.2);
            vLocal.applyQuaternion(qNolo);
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x110022, size: 25.0, map: window.textureBuiDenBB, 
            transparent: true, opacity: 0.6, blending: THREE.NormalBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngBB.push({ system: pts, velocities: vels, life: 45, upVector: upVector.clone() });
    }

    function taoVatTheBB(tenFile, scaleSize, forceDark = false) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        if (forceDark || tenFile === 'blackenergy') {
                            let hinhTronDen = new THREE.MeshBasicMaterial({
                                color: 0x05001a, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.NormalBlending
                            });
                            c.material = hinhTronDen; 
                        } else {
                            let m = c.material.clone(); m.transparent = true; c.material = m;
                        }
                    }
                });

                if (v.animations && v.animations.length > 0) {
                    let mixer = new THREE.AnimationMixer(v);
                    mixer.clipAction(v.animations[0]).play();
                    group.userData = group.userData || {}; group.userData.mixer = mixer;
                }

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

    function timXuong(nvc, dsTen) {
        let xuong = null;
        nvc.traverse(c => {
            if (dsTen.includes(c.name) && !xuong) xuong = c;
        });
        return xuong;
    }

    // ==========================================
    // 🌟 1. HÀM TẠO VẾT NỨT (MƯỢN TỪ BỐ GIÀ)
    // ==========================================
    window.taoVetNutBangCodeBB = function (pos, curUp) {
        const soTia = 15 + Math.floor(Math.random() * 10); 
        const material = new THREE.LineBasicMaterial({
            color: 0x110022, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending
        });

        const points = [];
        for (let i = 0; i < soTia; i++) {
            let angle = (i / soTia) * Math.PI * 2 + (Math.random() - 0.5);
            let d1 = 5 + Math.random() * 5;
            let px1 = Math.cos(angle) * d1, py1 = Math.sin(angle) * d1, pz1 = (Math.random() - 0.5) * d1;
            points.push(0, 0, 0, px1, py1, pz1); 

            if (Math.random() > 0.2) { 
                let a2 = angle + (Math.random() - 0.5); let d2 = d1 + 3 + Math.random() * 5;
                let px2 = Math.cos(a2) * d2, py2 = Math.sin(a2) * d2, pz2 = (Math.random() - 0.5) * d2;
                points.push(px1, py1, pz1, px2, py2, pz2);
            }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        geometry.setDrawRange(0, 0); 

        const line = new THREE.LineSegments(geometry, material);
        line.position.copy(pos); line.scale.set(4, 4, 4); 
        if (curUp) line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curUp);
        scene.add(line);

        kyNangBB.push({ mesh: line, type: 'VET_NUT_CODE', life: 75, maxDraw: points.length, currentDraw: 0, growth: 8 });
    };

    // 🌟 KỸ XẢO: RUNG LẮC MÀN HÌNH CỦA RÂU ĐEN
    window.kichHoatDongDatBB = function (intensity = 25, duration = 1500) {
        if (typeof window.kichHoatDongDat === 'function') {
            window.kichHoatDongDat(intensity, duration); return; // Nếu có hàm gốc thì xài
        }
        if (typeof camera === 'undefined') return;
        let start = Date.now();
        let idShake = setInterval(() => {
            let elapsed = Date.now() - start;
            if (elapsed > duration) { clearInterval(idShake); return; }
            let heSo = 1.0 - (elapsed / duration); // Giảm dần độ rung
            camera.position.x += (Math.random() - 0.5) * (intensity / 10) * heSo;
            camera.position.y += (Math.random() - 0.5) * (intensity / 10) * heSo;
            camera.position.z += (Math.random() - 0.5) * (intensity / 10) * heSo;
        }, 30);
    };

    // ==========================================
    // 🌟 2. HÀM TUNG COMBO (ĐÃ DỌN SẠCH RÁC HOẠT HÌNH)
    // ==========================================
    window.tungComboBlackbeard = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        
        // Cấp thể xác chuẩn
        if (isRemote && casterId) {
            if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            } else if (typeof window.danhSachQuaiVat !== 'undefined') {
                let boss = window.danhSachQuaiVat.find(q => q.id == casterId || q.id === casterId);
                if (boss && boss.mesh) nvc = boss.mesh;
            }
        }
        if (!nvc) return;

        let animCanMua = phim;
        if (typeof phim === 'string') {
            let pUp = phim.toUpperCase();
            if (pUp.includes('ATTACK4') || pUp === 'Q') animCanMua = 'ATTACK4';
            else if (pUp.includes('ATTACK3') || pUp === 'E') animCanMua = 'ATTACK3';
            else if (pUp.includes('ATTACK1') || pUp === 'R') animCanMua = 'ATTACK1';
            else if (pUp.includes('ATTACK2') || pUp === 'F') animCanMua = 'ATTACK2';
        }

        // KÍCH HOẠT HOẠT HÌNH CHUẨN ENGINE (Không dùng userData rác)
        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
            if (window.henGioTatMuaBB) clearTimeout(window.henGioTatMuaBB);
            window.henGioTatMuaBB = setTimeout(() => { window.dangMuaChieu = false; }, 600);
        }

        // Trục Cầu
        let upVector = new THREE.Vector3(0, 1, 0);
        if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
            upVector = nvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
        } else if (nvc.up) {
            upVector = nvc.up.clone().normalize();
        }

        let huongMat = new THREE.Vector3(); 
        if (typeof camera !== 'undefined' && !isRemote) {
            camera.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
            if (huongMat.lengthSq() < 0.001) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
        } else {
            nvc.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
        }
        if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }

        let viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));

        let mucTieu = null;
        if (isRemote) {
            if (remoteDich) mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
        } else {
            let targetRadar = window.layMucTieuGanNhatBB(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) {
                let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(targetRadar.mesh) : null;
                mucTieu = (hitBox && hitBox.tamNguc && typeof hitBox.tamNguc.clone === 'function') ? hitBox.tamNguc.clone() : targetRadar.mesh.position.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        let diemChanMucTieu = mucTieu.clone(); 
        
        if (animCanMua === 'ATTACK4') { 
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                
                let tayTraiQ = timXuong(curNvc, ['LHand_Palm_042', 'LHand']); 
                let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                if (tayTraiQ) tayTraiQ.getWorldPosition(diemBan);

                let targetBay = mucTieu ? mucTieu.clone() : diemBan.clone().add(curDir.clone().multiplyScalar(150));
                
                const cauDen = taoVatTheBB('energy', 2); 
                cauDen.position.copy(diemBan).add(curDir.clone().multiplyScalar(1.5));
                cauDen.up.copy(curUp); 
                cauDen.lookAt(targetBay); scene.add(cauDen);

                kyNangBB.push({ 
                    mesh: cauDen, type: 'BAY_THANG_PHINH_TO', speed: 6.0, life: 120, 
                    currentScale: 2, maxScale: 15, growthRate: 0.6,
                    targetPos: targetBay, damage: dameGoc * 0.4, noBanKinh: 25, isRemote: isRemote, upVector: curUp.clone()
                });
            }, 300);
        }
        else if (animCanMua === 'ATTACK3') { 
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let diemNo = diemChanMucTieu.clone();

                const luaDen = taoVatTheBB('fire4', 5, true); 
                luaDen.position.copy(diemNo);
                luaDen.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curUp); 
                scene.add(luaDen);

                kyNangBB.push({
                    mesh: luaDen, type: 'HOA_TRU_DEN', speed: 0, life: 90, 
                    currentScale: 5, maxScale: 40, growthRate: 1.5,
                    targetPos: diemNo, damage: dameGoc * 0.375, isRemote: isRemote, noBanKinh: 30, upVector: curUp.clone()
                });
            }, 500);
        }
        else if (animCanMua === 'ATTACK1') { 
            let curNvc = nvc; if (!curNvc) return;
            let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
            let tayPhaiR = timXuong(curNvc, ['RHand_Palm_049', 'RHand']); 
            let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
            if (tayPhaiR) tayPhaiR.getWorldPosition(diemBan);

            // BẢO VỆ HOẠT HÌNH: Chỉ người chơi mới bị chặn IDLE khi gồng
            if (isRemote === false) {
                window.dangGongChieuR_BB = true;
                if (!window.playAnimGocBB) window.playAnimGocBB = window.playAnim || window.epNhanVatMua;
                window.playAnim = window.epNhanVatMua = function(name) {
                    if (window.dangGongChieuR_BB && (name.includes('NHANROI') || name.includes('IDLE'))) return; 
                    if (typeof window.playAnimGocBB === 'function') window.playAnimGocBB(name);
                };
            }

            const blackHole = taoVatTheBB('blackenergy', 2.0, true); 
            blackHole.position.copy(diemBan);
            scene.add(blackHole);

            let skillTuLuc = { 
                mesh: blackHole, type: 'DANG_TU_LUC', life: 1000, 
                boneAttach: tayPhaiR, offset: huongMat.clone(), 
                startTime: Date.now(), upVector: curUp.clone()
            };
            kyNangBB.push(skillTuLuc);

            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                
                let targetBay = mucTieu ? mucTieu.clone() : curNvc.position.clone().add(huongMat.clone().multiplyScalar(150));
                
                if (!isRemote) {
                    let objMoi = window.layMucTieuGanNhatBB(blackHole.position);
                    if (objMoi && objMoi.mesh) {
                        let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(objMoi.mesh) : null;
                        targetBay = (hitBox && hitBox.tamNguc && typeof hitBox.tamNguc.clone === 'function') ? hitBox.tamNguc.clone() : objMoi.mesh.position.clone();
                    }
                }

                skillTuLuc.type = 'BAY_CHAM_PHINH_TO_R'; 
                skillTuLuc.life = 200; skillTuLuc.speed = 2.5; 
                skillTuLuc.currentScale = 5; skillTuLuc.maxScale = 50; 
                skillTuLuc.growthRate = 0.5; skillTuLuc.targetPos = targetBay;
                skillTuLuc.damage = dameGoc * 0.5; skillTuLuc.noBanKinh = 50;
                skillTuLuc.isRemote = isRemote;

                blackHole.up.copy(cUp); 
                blackHole.lookAt(targetBay);

                // NHẢ KHÓA HOẠT HÌNH
                if (isRemote === false) {
                    window.dangMuaChieu = false;
                    window.dangGongChieuR_BB = false;
                    if (typeof window.playAnimGocBB === 'function') window.playAnimGocBB('NHANROI');
                }
            }, 2000); 
        }
        else if (animCanMua === 'ATTACK2') { 
            setTimeout(() => {
                let diemNo = diemChanMucTieu.clone();

                let geoPlane = new THREE.CircleGeometry(60, 32); 
                let matPlane = new THREE.MeshBasicMaterial({ color: 0x050011, transparent: true, opacity: 0.8, depthWrite: false });
                let darkAura = new THREE.Mesh(geoPlane, matPlane);
                darkAura.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upVector); 
                darkAura.position.copy(diemNo).add(upVector.clone().multiplyScalar(0.2)); 
                scene.add(darkAura);

                const loiDen = taoVatTheBB('blackenergy1', 25);
                loiDen.position.copy(diemNo); 
                loiDen.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector); 
                scene.add(loiDen);

                const groupF = new THREE.Group();
                groupF.add(darkAura); groupF.add(loiDen); scene.add(groupF);

                kyNangBB.push({
                    mesh: groupF, type: 'AOE_LUA_DEN', life: 150, 
                    targetPos: diemNo, damage: dameGoc * 0.1, noBanKinh: 60, isRemote: isRemote, upVector: upVector.clone()
                });
            }, 800);
        }
    };

    // ==========================================
    // 🌟 3. VÒNG LẶP VẬT LÝ VÀ KÍCH HOẠT NỨT KHÔNG GIAN
    // ==========================================
    window.updateCombatBB = function () {

        let nvc = window.nhanVatChinh;
        if (nvc && !nvc.daGanVuKhiBB && window.HePhaiHienTai && window.HePhaiHienTai.tenPhai === "Tứ Hoàng Râu Đen") {
            let tayPhai = timXuong(nvc, ['RHand_Palm_049', 'RHand']);
            let tayTrai = timXuong(nvc, ['LHand_Palm_042', 'LHand']);
            if (tayPhai) { let darkOrb = taoVatTheBB('blackenergy', 0.58, true); tayPhai.add(darkOrb); }
            if (tayTrai) { let lightOrb = taoVatTheBB('energy', 0.58, false); tayTrai.add(lightOrb); }
            nvc.daGanVuKhiBB = true;
        }

        for (let i = kyNangBB.length - 1; i >= 0; i--) {
            let s = kyNangBB[i];
            if (s.type !== 'DANG_TU_LUC') s.life--;

            if (s.mesh.userData && s.mesh.userData.mixer) {
                s.mesh.userData.mixer.update(0.03);
            }

            if (s.type === 'BAY_THANG_PHINH_TO') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                
                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    if (!isNaN(huongBay.x)) s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    if (s.isRemote === false) gaySatThuongBB(s.targetPos, s.damage, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                    
                    taoHieuUngNoDenBB(s.targetPos, false, false, s.upVector);
                    s.life = 0;
                }
            }

            else if (s.type === 'HOA_TRU_DEN') {
                if (s.mesh.createHologramDone === undefined && s.mesh.children.length > 0) {
                    s.mesh.children[0].rotateY(0.3);
                }
                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                if (s.life % 10 === 0) { 
                    if (s.isRemote === false) gaySatThuongBB(s.targetPos, s.damage * 0.2, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage * 0.2, s.noBanKinh);
                    taoHieuUngNoDenBB(s.targetPos, false, true, s.upVector);
                }
            }

            else if (s.type === 'DANG_TU_LUC') {
                s.life--; 
                if (s.boneAttach) {
                    let pos = new THREE.Vector3(); s.boneAttach.getWorldPosition(pos);
                    s.mesh.position.copy(pos); 
                }
                let thoiGianNen = Date.now() - (s.startTime || Date.now());
                let scalePulse = 2.0 + Math.sin(thoiGianNen * 0.02) * 1.8;
                s.mesh.scale.set(scalePulse, scalePulse, scalePulse);
                if (s.life <= 0) s.life = 0;
            }

            else if (s.type === 'BAY_CHAM_PHINH_TO_R') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
                
                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    if (!isNaN(huongBay.x)) s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else s.mesh.translateZ(s.speed);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4 || s.life <= 0) {
                    if (s.isRemote === false) gaySatThuongBB(s.targetPos, s.damage, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);

                    const vfx = taoVatTheBB('vfxenergy', 30);
                    vfx.position.copy(s.targetPos); 
                    if (s.upVector) {
                        vfx.up.copy(s.upVector);
                        vfx.lookAt(s.targetPos.clone().add(s.upVector));
                    }
                    scene.add(vfx);
                    kyNangBB.push({ mesh: vfx, type: 'NO_CHUNG_DONG_VFX', life: 100, currentScale: 30, maxScale: 400, growthRate: 15.0 });
                    
                    // KÍCH HOẠT ĐỘNG ĐẤT & VẾT NỨT BỐ GIÀ TẠI ĐÂY
                    if (typeof window.kichHoatDongDatBB === 'function') window.kichHoatDongDatBB(25, 1500);
                    if (typeof window.taoVetNutBangCodeBB === 'function') window.taoVetNutBangCodeBB(s.targetPos, s.upVector);
                    
                    s.life = 0;
                }
            }

            else if (s.type === 'AOE_LUA_DEN') {
                if (s.mesh.children[1] && s.mesh.children[1].children.length > 0) s.mesh.children[1].children[0].rotateY(-0.1);
                if (s.life % 5 === 0) taoThamLuaDenBB(s.targetPos, s.noBanKinh, s.upVector);
                if (s.life % 15 === 0) {
                    if (s.isRemote === false) gaySatThuongBB(s.targetPos, s.damage, s.noBanKinh);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                }
                if (s.life < 20) {
                    if (s.mesh.children[0]) s.mesh.children[0].material.opacity = (s.life / 20) * 0.8;
                }
            }

            else if (s.type === 'NO_CHUNG_DONG_VFX') {
                if (s.currentScale < s.maxScale) {
                    s.currentScale += s.growthRate;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }
            }

            // VẼ VẾT NỨT TỪ TỪ RA KHÔNG GIAN
            else if (s.type === 'VET_NUT_CODE') {
                if (s.currentDraw < s.maxDraw) {
                    s.currentDraw += s.growth; 
                    s.mesh.geometry.setDrawRange(0, Math.floor(s.currentDraw));
                }
                if (s.life <= 15) { 
                    s.mesh.material.opacity = s.life / 15;
                }
            }

            if (s.life <= 0 && s.type !== 'DANG_TU_LUC') {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangBB.splice(i, 1);
            }
        } 

        // 🌟 BẢN VÁ: BƠM KHÍ NÓNG CHO KHÓI ĐEN BỐC CAO LÊN TRỜI
        for (let i = hieuUngBB.length - 1; i >= 0; i--) {
            let h = hieuUngBB[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            
            // 🌟 Đổi từ (-0.1) thành (+0.08) để khói nổ bốc ngược lên theo trục hành tinh!
            let riseVec = h.upVector ? h.upVector.clone().multiplyScalar(0.08) : new THREE.Vector3(0, 0.08, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; 
                posArr[j * 3 + 1] += h.velocities[j].y; 
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].x *= 0.95; h.velocities[j].z *= 0.95; 
                h.velocities[j].add(riseVec); // Bốc lên liên tục
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = (h.life / 40) * 0.8;

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngBB.splice(i, 1);
            }
        }

        // 🌟 TRẢ LẠI VÒNG LẶP BAY CHỮ SỐ SÁT THƯƠNG
        for (let i = danhSachSoBayBB.length - 1; i >= 0; i--) {
            let it = danhSachSoBayBB[i]; it.offsetY += 0.05; it.life--;
            if (typeof camera !== 'undefined' && it.pos) {
                const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
                if (p.z < 1) {
                    it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
                } else it.el.style.display = 'none';
            }
            if (it.life <= 0) {
                if (it.el && it.el.parentNode) it.el.parentNode.removeChild(it.el);
                danhSachSoBayBB.splice(i, 1); window.tongSoChuNoi_BB--;
            }
        }
    }; // <--- ĐÂY LÀ KẾT THÚC CỦA HÀM UPDATECOMBATBB
    if (window.idVongLapCombatBB) clearInterval(window.idVongLapCombatBB);
    window.idVongLapCombatBB = setInterval(window.updateCombatBB, 30);

    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('blackbeard')) {
        window.HePhaiHienTai = {
            tenPhai: "Tứ Hoàng Râu Đen",
            khoiTao: function () {
                console.log("🕳️ Hắc Ám Nuốt Chửng Tất Cả! Khởi động Râu Đen (Mở Khóa SPAM 100% - Trục Cầu - Sát thương to)!");

                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/energy.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/fire4.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/blackenergy.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/blackenergy1.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/vfxenergy.glb', () => {});
                }

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
            // 🌟 BẢN VÁ ĐIỀU RĂN 2: Ép chạy hàm trung gian để luôn luân chuyển mảng đạn mới nhất!
            tungChieu: function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
                if (typeof window.tungComboBlackbeard === 'function') {
                    window.tungComboBlackbeard(phim, isRemote, remoteGoc, remoteDich, remoteHuong, casterId, weaponUrl);
                }
            },
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();

// 🌟 THÔNG NÃO NGÔN NGỮ CHO BOSS AI
window.tungComboblackbeard = window.tungComboBlackbeard;
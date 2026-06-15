// ==========================================
// 🍖 MÔN PHÁI ĐOẠT XÁ: LUFFY (TRÁI GOMU GOMU - MASTER V2)
// 👑 CÔNG NGHỆ: DYNAMIC BOOMERANG + PRELOAD RAM + TRỌNG LỰC CẦU HAKI
// ==========================================

(function () {
    const kyNangLuffy = [];
    const hieuUngLuffy = [];
    
    // 🌟 ĐÃ XÓA SẠCH BỘ ĐẾM COOLDOWN CỤC BỘ (GIAO CHO CONTROLLER XỬ LÝ)

    // ==========================================
    // 🛡️ HỆ THỐNG PHIỄU GOM SÁT THƯƠNG
    // ==========================================
    window.phieuDameLuffy = {}; 
    const danhSachSoBayLF = [];
    window.tongSoChuNoi_LF = 0;

    function hienThiSoDameGom(pos3D, satThuong) {
        if (window.isMobile && window.tongSoChuNoi_LF > 40) return;
        if (satThuong <= 0) return;
        window.tongSoChuNoi_LF++;
        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 8px #000, 2px 2px 0px #aa0000';
        div.style.cssText = `position:absolute; color:#ff3333; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayLF.push({ el: div, pos: pos3D.clone(), life: 40, offsetY: 0 });
    }

    // ==========================================
    // 💥 HỆ THỐNG VỤ NỔ HAKI CHUẨN TRỤC CẦU
    // ==========================================
    window.thoiDiemNoCuoiCungLF = window.thoiDiemNoCuoiCungLF || 0;

    function taoVuNoLuffy(pos, banKinh = 10, upVector = new THREE.Vector3(0, 1, 0)) {
        let bayGio = Date.now();
        if (bayGio - window.thoiDiemNoCuoiCungLF > 100) {
            window.thoiDiemNoCuoiCungLF = bayGio;
            if (typeof window.phatAmThanh === 'function') window.phatAmThanh('uploads/anims/hit.mp3', 0.5); 
        }

        const soLuong = window.isMobile ? 10 : 30; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        
        // 🌟 Nắn vụ nổ bung ra theo Trục Cầu
        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
            let vLocal = new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 12, (Math.random() - 0.5) * 15);
            vLocal.applyQuaternion(qNolo); // Văng ra chuẩn không gian
            vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureHakiLF) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 200, 200, 1)');   
            gradient.addColorStop(0.3, 'rgba(255, 50, 50, 0.9)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureHakiLF = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xff3333, size: window.isMobile ? 6.0 : 12.0, map: window.textureHakiLF, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngLuffy.push({ system: pts, velocities: vels, life: 20, upVector: upVector.clone() }); 
    }

    setInterval(() => {
        for (let id in window.phieuDameLuffy) {
            let data = window.phieuDameLuffy[id];
            if (data.dame > 0 && data.pos) { hienThiSoDameGom(data.pos, data.dame); data.dame = 0; }
        }
    }, 400); 

    // ==========================================
    // 🎯 RADAR PVP/PVE 
    // ==========================================
    window.layMucTieuGanNhatLF = function(viTriGoc) {
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

    function gaySatThuongLuffy(tamNo, luongSatThuong, banKinh, upVector) {
        let daTrungMucTieu = false;
        
        function taoSuoiSo(posGoc) {
            let posMoi = posGoc.clone();
            posMoi.x += (Math.random() - 0.5) * 4; 
            posMoi.y += (Math.random() - 0.5) * 4; 
            posMoi.z += (Math.random() - 0.5) * 4;
            hienThiSoDameGom(posMoi, luongSatThuong);
        }

        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        daTrungMucTieu = true;
                        taoVuNoLuffy(hit.tamNguc.clone(), 10, upVector); 
                       
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSuoiSo(posHienSo);
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
                        daTrungMucTieu = true;
                        taoVuNoLuffy(hit.tamNguc.clone(), 10, upVector); 
                        let posHienSo = hit.tamNguc.clone();
                        taoSuoiSo(posHienSo);
                        
                        if (quai.isBoss) { if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong); } 
                        else {
                            quai.hp -= luongSatThuong; 
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
        return daTrungMucTieu;
    }

    // 🌟 ĐÚC NẮM ĐẤM (GLB)
    function taoNamDamGatling(loaiNMDam, scaleSize) {
        const handGroup = new THREE.Group(); 
        let url = (loaiNMDam === 'LON') ? 'uploads/anims/NAMDAMLON.glb' : 'uploads/anims/NAMDAMNHO.glb';
        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(url, (vuKhi) => {
                vuKhi.position.set(0, 0, 0); 
                vuKhi.rotation.set(0, 0, 0); 
                vuKhi.scale.set(1, 1, 1);
                vuKhi.traverse(c => { if (c.isMesh) { c.visible = true; } });
                handGroup.add(vuKhi);
            });
        }
        handGroup.scale.set(scaleSize, scaleSize, scaleSize);
        return handGroup;
    }

    // ==========================================
    // ✨ TUNG CHIÊU LUFFY V2 (TỌA ĐỘ ĐỘNG BOOMERANG)
    // ==========================================
    window.tungComboLuffy = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        if (!nvc) return;

        let tenAnimMua = '';
        if (phim === 'Q') tenAnimMua = 'ATTACK3'; else if (phim === 'E') tenAnimMua = 'ATTACK4';
        else if (phim === 'R') tenAnimMua = 'ATTACK2'; else if (phim === 'F') tenAnimMua = 'ATTACK1'; 

        // 🌟 BẤM LÀ ĐÁNH (Instant Cast)
        if (!isRemote) { 
            window.dangMuaChieu = true;
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(tenAnimMua); 
            else if (typeof window.playAnim === 'function') window.playAnim(tenAnimMua); 
            
            if (window.henGioTatMuaLF) clearTimeout(window.henGioTatMuaLF);
            window.henGioTatMuaLF = setTimeout(() => { window.dangMuaChieu = false; }, 600);
        }

        let curUp = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let fwd = new THREE.Vector3(); 
        
        if (typeof camera !== 'undefined' && !isRemote) {
            camera.getWorldDirection(fwd);
            fwd.projectOnPlane(curUp).normalize();
            if (fwd.lengthSq() < 0.001) { nvc.getWorldDirection(fwd); fwd.projectOnPlane(curUp).normalize(); }
        } else {
            nvc.getWorldDirection(fwd);
            fwd.projectOnPlane(curUp).normalize();
        }
        if (fwd.lengthSq() < 0.001) { fwd.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(curUp).normalize(); }

        let targetPoint = null;

        // 🌟 BẢN VÁ 2: HỆ THỐNG PHÂN BIỆT ĐỊCH/TA RÕ RÀNG
        if (isRemote && remoteDich) {
            // Boss đánh: Khóa mõm Radar, ép mục tiêu là vị trí của Sếp do Server cung cấp!
            targetPoint = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            if (remoteHuong) fwd = new THREE.Vector3(remoteHuong.x, remoteHuong.y, remoteHuong.z).normalize();
        } else {
            // Người chơi đánh: Xách Radar tự động tìm quái gần nhất
            let target = window.layMucTieuGanNhatLF(nvc.position);
            if (target && target.mesh) {
                let hit = window.layHitbox(target.mesh);
                targetPoint = hit.tamNguc.clone();
                
                let dummy = new THREE.Object3D();
                dummy.position.copy(nvc.position);
                dummy.up.copy(curUp);
                dummy.lookAt(targetPoint);
                nvc.quaternion.copy(dummy.quaternion); 
                
                nvc.getWorldDirection(fwd);
                fwd.projectOnPlane(curUp).normalize();
            }
        }

        if (isRemote === false && window.room && window.room.localParticipant) {
            window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'TUNG_CHIEU', skillType: phim, className: 'Luffy', origin: {x: nvc.position.x, y: nvc.position.y, z: nvc.position.z}, target: {x: 0, y: 0, z: 0}, dir: {x: fwd.x, y: fwd.y, z: fwd.z}, weaponUrl: "" })), { reliable: false });
        }
        
        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                dameGoc = window.remotePlayers[casterId].damage || 100;
            }
        }

        // 🚀 BƯỚC 2: HÀM BẮN GATLING BOOMERANG (CHUẨN TỌA ĐỘ ĐỘNG)
        function banGatling(soLuong, heSoDame, tocDoBay, scaleTay, loaiDam) {
            let baseTarget = targetPoint ? targetPoint.clone() : nvc.position.clone().add(fwd.clone().multiplyScalar(30));

            for (let i = 0; i < soLuong; i++) {
                setTimeout(() => {
                    // 🌟 BẢN VÁ 1: ÉP LẤY ĐÚNG THỰC THỂ ĐANG MÚA (BOSS HOẶC NGƯỜI CHƠI)
                    let curNvc = nvc; // Tuyệt đối cấm xài playerModel ở đây nữa!
                    if (!curNvc) return;
                    let cUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let cDir = new THREE.Vector3(); curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize();
                    if (cDir.lengthSq() < 0.001) cDir.set(0, 0, 1).applyQuaternion(curNvc.quaternion).projectOnPlane(cUp).normalize();
                    let right = new THREE.Vector3().crossVectors(cDir, cUp).normalize(); // Chỉ sang Phải
                    let isRight = (i % 2 === 0);
                    let tayClone = taoNamDamGatling(loaiDam, scaleTay);
                    let posSpawn = curNvc.position.clone().add(cUp.clone().multiplyScalar(5));
                    posSpawn.add(cDir.clone().multiplyScalar(1.5)); 
                    let lechNgang = right.clone().multiplyScalar(isRight ? -1.5 : 1.5); 
                    posSpawn.add(lechNgang);
                    tayClone.position.copy(posSpawn);
                    tayClone.up.copy(cUp); // 🌟 ÉP TRỤC CẦU CHO TAY BOOMERANG
                    let doLan = (loaiDam === 'LON') ? 2.5 : 1.5;
                    let targetBay = baseTarget.clone().add(new THREE.Vector3((Math.random()-0.5)*doLan, (Math.random()-0.5)*doLan, (Math.random()-0.5)*doLan));           
                    tayClone.lookAt(targetBay);
                    scene.add(tayClone);
                    let maxDist = Math.min(posSpawn.distanceTo(targetBay) + 2, 50);
                    kyNangLuffy.push({ 
                        mesh: tayClone, type: 'BULLET_PUNCH', 
                        speed: tocDoBay, state: 'OUT', life: 100, 
                        startPos: posSpawn.clone(), maxDist: maxDist,
                        isRemote: isRemote, damage: dameGoc * heSoDame,
                        upVector: cUp.clone() // Lấy Trục để rớt Haki
                    });
                }, i * 35); // 🌟 XẢ GATLING 35ms SIÊU TỐC
            }
        }
        if (phim === 'Q') banGatling(10, 0.04, 8.0, 5.0, 'NHO');   
        else if (phim === 'E') banGatling(6, 0.1, 8.0, 3.5, 'LON');  
        else if (phim === 'R') banGatling(4, 0.125, 8.0, 3.5, 'LON');
        else if (phim === 'F') banGatling(4, 0.25, 8.0, 3.5, 'LON'); 
    };
    // =========================================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU LUFFY (BẢN VÁ THEO PHONG CÁCH ZORO.JS)
    // =========================================================
    window.updateCombatLuffy = function () {
        for (let i = kyNangLuffy.length - 1; i >= 0; i--) {
            let s = kyNangLuffy[i]; 
            if (s.type === 'BULLET_PUNCH') {
                s.life--;        
                
                if (s.state === 'OUT') {
                    // 🌟 HỌC TẬP ZORO.JS: Tính toán hướng bay theo tọa độ thế giới tuyệt đối, chống ngược trục của model Boss
                    if (s.targetPos) {
                        let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                        s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                        s.mesh.lookAt(s.targetPos); // Giữ hướng đấm chuẩn xác nhìn về mục tiêu
                    } else {
                        s.mesh.translateZ(s.speed);
                    }

                    let daTrung = false;
                    if (s.isRemote === false) {
                        daTrung = gaySatThuongLuffy(s.mesh.position, s.damage, 12, s.upVector); 
                    } 
                    else {
                        // Radar đo khoảng cách chạm vào Sếp
                        if (window.playerModel && typeof window.isDead !== 'undefined' && !window.isDead) {
                            let khoangCach = s.mesh.position.distanceTo(window.playerModel.position);
                            if (khoangCach <= 15) { 
                                if (typeof window.gaySatThuongBossToPlayer === 'function') {
                                    window.gaySatThuongBossToPlayer(s.mesh.position, s.damage, 15);
                                }
                                if (typeof taoVuNoLuffy === 'function') taoVuNoLuffy(s.mesh.position.clone(), 10, s.upVector); 
                                daTrung = true; 
                            }
                        }
                    }

                    let bayĐuocBaoXa = s.startPos.distanceTo(s.mesh.position);
                    // Phòng hờ đấm bay lố qua mục tiêu thì ép quay đầu thu tay về liền
                    let denDich = s.targetPos ? (s.mesh.position.distanceTo(s.targetPos) < s.speed + 2) : false;

                    if (daTrung || bayĐuocBaoXa >= s.maxDist || denDich || s.life < 10) {
                        s.state = 'IN'; 
                    }
                }
                else if (s.state === 'IN') {
                    // 🌟 HỌC TẬP ZORO.JS: Thu tay về thế giới thực nương theo startPos, không xài âm speed cục bộ
                    if (s.startPos) {
                        let huongVe = new THREE.Vector3().subVectors(s.startPos, s.mesh.position).normalize();
                        s.mesh.position.add(huongVe.multiplyScalar(s.speed * 2.0));
                        s.mesh.lookAt(s.startPos); // Quay mặt tay về gông vai xuất phát
                    } else {
                        s.mesh.translateZ(-s.speed * 2.0);
                    }
                }

                // Kiểm tra xem tay đã thu hồi về sát nách hay chưa
                let veNhaChua = s.startPos ? (s.mesh.position.distanceTo(s.startPos) < s.speed * 3) : true;
                if (s.life <= 0 || (s.state === 'IN' && veNhaChua)) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                    kyNangLuffy.splice(i, 1);
                }
            }
        }

        for (let i = danhSachSoBayLF.length - 1; i >= 0; i--) {
            let it = danhSachSoBayLF[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayLF.splice(i, 1); window.tongSoChuNoi_LF--; }
        }

        // 🌟 XỬ LÝ HẠT HAKI BAY TUNG TOÉ (RƠI CHUẨN THEO TRỤC CẦU)
        for (let i = hieuUngLuffy.length - 1; i >= 0; i--) {
            let h = hieuUngLuffy[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(-0.6) : new THREE.Vector3(0, -0.6, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x;
                posArr[j * 3 + 1] += h.velocities[j].y;
                posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].multiplyScalar(0.9);
                h.velocities[j].add(fallVec); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 20;

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngLuffy.splice(i, 1);
            }
        }
    };
    setInterval(window.updateCombatLuffy, 30);

    // ==========================================
    // 🌟 KHỞI TẠO TỪ ĐIỂN & PRELOAD RAM
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('luffy')) {
        window.HePhaiHienTai = {
            tenPhai: "Hải Tặc Luffy",
            khoiTao: function () {
                console.log("⚓ Luffy Auto-Lock & Boomerang Sẵn Sàng! Kích hoạt Động cơ Preload!");
                
                // 🌟 VÁ LỖI 2: PRELOAD CACHE HAI CÁI NẮM ĐẤM
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/NAMDAMLON.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/NAMDAMNHO.glb', () => {});
                }

                setTimeout(() => {
                    let nvc = window.playerModel;
                    if (nvc) nvc.traverse(c => { if ((c.isMesh || c.isSkinnedMesh) && (c.name.toLowerCase().includes('giga') || c.name.toLowerCase().includes('giant') || c.name.toLowerCase().includes('big'))) c.visible = false; });
                }, 1000);
                
                if (window.animationsMap) {
                    let animNhanRoi = null;
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        if (k.includes('NHANROI') || k.includes('IDLE')) animNhanRoi = window.animationsMap[key];
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) window.animationsMap['CHAYBO'] = window.animationsMap[key];
                        if (k.includes('BAY') || k.includes('FLY')) window.animationsMap['BAY'] = window.animationsMap[key];
                    }
                    if (animNhanRoi) { window.animationsMap['NHANROI'] = animNhanRoi; if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = animNhanRoi; }
                }
            },
            tungChieu: window.tungComboLuffy,
            capNhat: function () {}
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
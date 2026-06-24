// ==========================================
// ⚔️ MÔN PHÁI: HẢI MINH APOO (OTO ITO NO MI - SÓNG ÂM)
// 👑 CÔNG NGHỆ: CỘT TRỤ SÁT THƯƠNG XUYÊN KHÔNG GIAN + HITBOX 100% CHUẨN
// ==========================================

(function () {
    const kyNangApoo = [];
    const hieuUngApoo = [];
    const danhSachSoBayApoo = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Apoo = 0;

    // ==========================================
    // 1. LÕI TIỆN ÍCH CƠ BẢN
    // ==========================================
    function taoSoSatThuongApoo(pos3D, satThuong, mauSac = '#00ffff') {
        if (window.isMobile) return;
        if (satThuong <= 0 || (window.isMobile && window.tongSoChuNoi_Apoo > 5)) return;
        window.tongSoChuNoi_Apoo++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #005555';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayApoo.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    // 🌟 BẢN VÁ: HITBOX CỘT TRỤ (Xuyên Lên Trời Cào Xuống Đất 200m)
    function gaySatThuongAoEApoo(tamNo, upVector, luongSatThuong, banKinh) {
        let mucTieuDaXyLy = new Set();
        
        let kiemTraTrungDon = function(meshMucTieu) {
            let hit = window.layHitbox(meshMucTieu);
            // Loại bỏ trục dọc để tính khoảng cách 2D phẳng
            let vecToTarget = new THREE.Vector3().subVectors(hit.tamNguc, tamNo);
            let docY = vecToTarget.dot(upVector); // Độ cao của mục tiêu so với sóng âm
            let vecNgang = vecToTarget.clone().sub(upVector.clone().multiplyScalar(docY));
            let khoangCachNgang = vecNgang.length();

            // Nếu nằm trong Bán Kính Ngang VÀ Không bay quá 200m thì bị dính đòn!
            if (khoangCachNgang <= (banKinh + hit.banKinh) && Math.abs(docY) <= 200) {
                return { trung: true, hit: hit };
            }
            return { trung: false };
        };

        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                let laBoss = window.danhSachQuaiVat && window.danhSachQuaiVat.some(q => String(q.id) === String(id) || "PLAYER_" + q.id === String(id) || "BOSS_" + q.id === String(id));
                if (rp.status === 'ready' && rp.mesh && !laBoss && !mucTieuDaXyLy.has(rp.mesh)) {
                    let kt = kiemTraTrungDon(rp.mesh);
                    if (kt.trung) {
                        mucTieuDaXyLy.add(rp.mesh);
                        let posHienSo = kt.hit.tamNguc.clone(); posHienSo.y += (kt.hit.chieuCao / 2);
                        taoSoSatThuongApoo(posHienSo, luongSatThuong, '#00ffff');
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh && !mucTieuDaXyLy.has(quai.mesh) && quai.classCode !== 'TRANG_TRI') {
                    let kt = kiemTraTrungDon(quai.mesh);
                    if (kt.trung) {
                        mucTieuDaXyLy.add(quai.mesh);
                        if (quai.isBoss) {
                            taoSoSatThuongApoo(kt.hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongApoo(kt.hit.tamNguc.clone(), luongSatThuong);
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

    // ==========================================
    // 2. KHO VŨ KHÍ SÓNG ÂM
    // ==========================================
    function taoVongSongAm(mauSac) {
        const geo = new THREE.TorusGeometry(1, 0.15, 8, 32); 
        geo.rotateX(Math.PI / 2); 
        const mat = new THREE.MeshBasicMaterial({ color: mauSac, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
        return new THREE.Mesh(geo, mat);
    }

    function taoVongLangQuang(mauSac) {
        class WavyCurve extends THREE.Curve {
            getPoint(t, optionalTarget = new THREE.Vector3()) {
                let theta = t * Math.PI * 2;
                let r = 1 + Math.sin(theta * 10) * 0.15; 
                return optionalTarget.set(Math.cos(theta) * r, 0, Math.sin(theta) * r);
            }
        }
        const path = new WavyCurve();
        const geo = new THREE.TubeGeometry(path, 64, 0.1, 8, true);
        const mat = new THREE.MeshBasicMaterial({ color: mauSac, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
        return new THREE.Mesh(geo, mat);
    }

    function taoCotAmThanh(mauSac, chieuCao) {
        const group = new THREE.Group();
        const m = new THREE.MeshBasicMaterial({ color: mauSac, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
        
        const g1 = new THREE.CylinderGeometry(0.8, 0.1, chieuCao, 8); 
        g1.translate(0, chieuCao / 2, 0); 
        const c1 = new THREE.Mesh(g1, m);
        
        const g2 = new THREE.TorusGeometry(1.2, 0.1, 8, 16);
        g2.rotateX(Math.PI / 2);
        g2.translate(0, chieuCao * 0.8, 0);
        const c2 = new THREE.Mesh(g2, m);

        group.add(c1); group.add(c2);
        return group;
    }

    function taoBuiAmThanh(pos, upVector, mauSac) {
        const soLuong = 10;
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3); const vels = [];
        let qNolo = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);

        for (let i = 0; i < soLuong; i++) {
            posArr[i*3] = pos.x; posArr[i*3+1] = pos.y + 1; posArr[i*3+2] = pos.z;
            let vLocal = new THREE.Vector3((Math.random()-0.5)*2, Math.random()*3, (Math.random()-0.5)*2);
            vLocal.applyQuaternion(qNolo); vels.push(vLocal);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        const mat = new THREE.PointsMaterial({ color: mauSac, size: 4.0, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngApoo.push({ system: pts, velocities: vels, life: 20, upVector: upVector.clone() });
    }

    // ==========================================
    // 3. TUNG CHIÊU & TÂM SÓNG ÂM
    // ==========================================
    window.tungComboApoo = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        
        if (isRemote && casterId) {
            if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            } else if (typeof window.danhSachQuaiVat !== 'undefined') {
                let boss = window.danhSachQuaiVat.find(q => q.id == casterId || q.id === casterId);
                if (boss && boss.mesh) nvc = boss.mesh;
            }
        }
        if (!nvc && !isRemote) return;

        let loaiChieu = phim;
        let animCanMua = 'ATTACK1';
        if (typeof phim === 'string') {
            let pUp = phim.toUpperCase();
            if (pUp.includes('ATTACK4') || pUp === 'F') { loaiChieu = 'F'; animCanMua = 'ATTACK4'; }
            else if (pUp.includes('ATTACK3') || pUp === 'R') { loaiChieu = 'R'; animCanMua = 'ATTACK3'; }
            else if (pUp.includes('ATTACK2') || pUp === 'E') { loaiChieu = 'E'; animCanMua = 'ATTACK2'; }
            else if (pUp.includes('ATTACK1') || pUp === 'Q') { loaiChieu = 'Q'; animCanMua = 'ATTACK1'; }
            else if (pUp.includes('ATTACK') || pUp.includes('SKILL')) {
                let arr = ['Q', 'E', 'R', 'F'];
                loaiChieu = arr[Math.floor(Math.random() * arr.length)];
            }
        }

        if (isRemote === false) {
            window.dangMuaChieu = true;
            if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
                animCanMua = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
            }
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
            
            if (window.henGioTatMuaApoo) clearTimeout(window.henGioTatMuaApoo);
            window.henGioTatMuaApoo = setTimeout(() => { window.dangMuaChieu = false; }, 800);
        } else {
            if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
                animCanMua = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
            }
            if (nvc.userData && nvc.userData.mixer && nvc.userData.animationsMap && nvc.userData.animationsMap[animCanMua]) {
                nvc.userData.animationsMap[animCanMua].reset().fadeIn(0.2).play();
            }
        }

        let viTriGocToTam = new THREE.Vector3();
        let upVector = new THREE.Vector3(0, 1, 0);

        if (isRemote) {
            if (remoteGoc) {
                viTriGocToTam.set(remoteGoc.x, remoteGoc.y, remoteGoc.z);
                if (viTriGocToTam.lengthSq() > 0.001) upVector.copy(viTriGocToTam).normalize(); 
            } else if (nvc) {
                if (nvc.position.lengthSq() > 0.001) upVector.copy(nvc.position).normalize();
                viTriGocToTam.copy(nvc.position);
            }
        } else {
            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                upVector = nvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
            } else if (nvc.up) { upVector = nvc.up.clone().normalize(); }

            viTriGocToTam = nvc.position.clone(); 

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Apoo', 
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, dir: { x: 0, y: 1, z: 0 }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) dameGoc = window.remotePlayers[casterId].damage || 100;
        }

        let mauSacAmThanh = [0xff00ff, 0x00ffff, 0xffff00, 0x00ff00, 0xffaa00]; 

        // 🌟 TẤT CẢ CÁC VÒNG ĐỀU CÓ THÊM BIẾN `daGayDame: false`
        if (loaiChieu === 'Q') {
            setTimeout(() => {
                let curNvc = nvc; if (!curNvc) return;
                let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                let tamPhat = curNvc.position.clone().add(cUp.clone().multiplyScalar(0.5)); 

                const vong = taoVongSongAm(mauSacAmThanh[1]); 
                vong.position.copy(tamPhat);
                vong.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cUp);
                vong.scale.set(0.1, 0.1, 0.1);
                scene.add(vong);
                
                kyNangApoo.push({
                    mesh: vong, type: 'VONG_TOA_RA', speed: 4.5, life: 150, progress: 0.1, daGayDame: false,
                    visualMaxScale: 200, damageRadius: 15, damage: dameGoc * 0.4, isRemote: isRemote, upVector: cUp.clone(), tamNo: tamPhat
                });
            }, 100);
        }

        else if (loaiChieu === 'E') {
            for(let i=0; i<3; i++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                    let tamPhat = curNvc.position.clone().add(cUp.clone().multiplyScalar(0.5));

                    const vong = taoVongSongAm(mauSacAmThanh[i % mauSacAmThanh.length]); 
                    vong.position.copy(tamPhat);
                    vong.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cUp);
                    vong.scale.set(0.1, 0.1, 0.1);
                    scene.add(vong);
                    
                    kyNangApoo.push({
                        mesh: vong, type: 'VONG_TOA_RA', speed: 5.0, life: 150, progress: 0.1, daGayDame: false,
                        visualMaxScale: 250, damageRadius: 20, damage: dameGoc * 0.2, isRemote: isRemote, upVector: cUp.clone(), tamNo: tamPhat
                    });
                }, i * 200); 
            }
        }

        else if (loaiChieu === 'R') {
            for(let i=0; i<5; i++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                    let tamPhat = curNvc.position.clone().add(cUp.clone().multiplyScalar(0.5));

                    const vongLQ = taoVongLangQuang(mauSacAmThanh[i % mauSacAmThanh.length]); 
                    vongLQ.position.copy(tamPhat);
                    vongLQ.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cUp);
                    vongLQ.scale.set(0.1, 0.1, 0.1);
                    scene.add(vongLQ);
                    
                    kyNangApoo.push({
                        mesh: vongLQ, type: 'VONG_TOA_RA', speed: 5.5, life: 150, progress: 0.1, daGayDame: false,
                        visualMaxScale: 300, damageRadius: 30, damage: dameGoc * 0.15, isRemote: isRemote, upVector: cUp.clone(), tamNo: tamPhat
                    });
                }, i * 150); 
            }

            for(let k=0; k<10; k++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                    
                    let cDir = new THREE.Vector3(); curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize();
                    let rightVec = new THREE.Vector3().crossVectors(cDir, cUp).normalize();
                    
                    let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(0.2))
                        .add(rightVec.multiplyScalar((Math.random() - 0.5) * 60))
                        .add(cDir.clone().multiplyScalar((Math.random() - 0.5) * 60));

                    const cot = taoCotAmThanh(mauSacAmThanh[Math.floor(Math.random()*mauSacAmThanh.length)], 15);
                    cot.position.copy(diemBan);
                    cot.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cUp);
                    cot.scale.set(1, 0.01, 1); 
                    scene.add(cot);

                    kyNangApoo.push({
                        mesh: cot, type: 'COT_DAM_LEN', speed: 0.1, life: 40, progress: 0.01,
                        damage: dameGoc * 0.1, isRemote: isRemote, upVector: cUp.clone(), tamNo: diemBan, mauHienTai: mauSacAmThanh[k % mauSacAmThanh.length]
                    });
                }, k * 100);
            }
        }

        else if (loaiChieu === 'F') {
            for(let i=0; i<10; i++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                    let tamPhat = curNvc.position.clone().add(cUp.clone().multiplyScalar(0.5));

                    const vongLQ = taoVongLangQuang(mauSacAmThanh[i % mauSacAmThanh.length]); 
                    vongLQ.position.copy(tamPhat);
                    vongLQ.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cUp);
                    vongLQ.scale.set(0.1, 0.1, 0.1);
                    scene.add(vongLQ);
                    
                    kyNangApoo.push({
                        mesh: vongLQ, type: 'VONG_TOA_RA', speed: 7.0, life: 150, progress: 0.1, daGayDame: false,
                        visualMaxScale: 400, damageRadius: 60, damage: dameGoc * 0.2, isRemote: isRemote, upVector: cUp.clone(), tamNo: tamPhat
                    });
                }, i * 100); 
            }

            for(let k=0; k<30; k++) {
                setTimeout(() => {
                    let curNvc = nvc; if (!curNvc) return;
                    let cUp = isRemote ? upVector.clone() : (curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0));
                    
                    let cDir = new THREE.Vector3(); curNvc.getWorldDirection(cDir); cDir.projectOnPlane(cUp).normalize();
                    let rightVec = new THREE.Vector3().crossVectors(cDir, cUp).normalize();
                    
                    let diemBan = curNvc.position.clone().add(cUp.clone().multiplyScalar(0.2))
                        .add(rightVec.multiplyScalar((Math.random() - 0.5) * 120))
                        .add(cDir.clone().multiplyScalar((Math.random() - 0.5) * 120));

                    const cot = taoCotAmThanh(mauSacAmThanh[Math.floor(Math.random()*mauSacAmThanh.length)], 25);
                    cot.position.copy(diemBan);
                    cot.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cUp);
                    cot.scale.set(1, 0.01, 1);
                    scene.add(cot);

                    kyNangApoo.push({
                        mesh: cot, type: 'COT_DAM_LEN', speed: 0.15, life: 40, progress: 0.01,
                        damage: dameGoc * 0.1, isRemote: isRemote, upVector: cUp.clone(), tamNo: diemBan, mauHienTai: mauSacAmThanh[k % mauSacAmThanh.length]
                    });
                }, k * 50);
            }
        }
    };

    // ==========================================
    // 4. VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU 
    // ==========================================
    window.updateCombatApoo = function () {
        for (let i = kyNangApoo.length - 1; i >= 0; i--) {
            let s = kyNangApoo[i]; s.life--;

            // =========================
            // LÕI VÒNG TỎA RA (Q, E, R, F)
            // =========================
            if (s.type === 'VONG_TOA_RA') {
                s.progress += s.speed;
                s.mesh.scale.set(s.progress, s.progress, s.progress);
                
                let tileOpacity = 1 - (s.progress / s.visualMaxScale);
                s.mesh.material.opacity = Math.max(0, tileOpacity);
                s.mesh.rotateY(0.1); 

                // 🌟 CHỐT SÁT THƯƠNG 100% TRÚNG (Khi chạm ngưỡng Bán kính)
                if (!s.daGayDame && s.progress >= s.damageRadius) {
                    s.daGayDame = true;
                    if (s.isRemote === false) gaySatThuongAoEApoo(s.tamNo, s.upVector, s.damage, s.damageRadius);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') {
                        let nvc = window.nhanVatChinh || (typeof playerModel !== 'undefined' ? playerModel : null);
                        if (nvc) {
                            let vecToTarget = new THREE.Vector3().subVectors(nvc.position, s.tamNo);
                            let docY = vecToTarget.dot(s.upVector);
                            let vecNgang = vecToTarget.clone().sub(s.upVector.clone().multiplyScalar(docY));
                            // Kiểm tra xuyên cao 200m y hệt hàm gốc
                            if (vecNgang.length() <= s.damageRadius && Math.abs(docY) <= 200) {
                                window.gaySatThuongBossToPlayer(nvc.position, s.damage, 15);
                            }
                        }
                    }
                }

                if (s.progress >= s.visualMaxScale) s.life = 0;
            }
            
            // =========================
            // LÕI CỘT NHẢY TUNG TĂNG TỪ ĐẤT (R, F)
            // =========================
            else if (s.type === 'COT_DAM_LEN') {
                if (s.progress < 1) {
                    s.progress += s.speed;
                    if (s.progress > 1) s.progress = 1;
                    s.mesh.scale.set(1 + s.progress*0.5, s.progress, 1 + s.progress*0.5);
                }

                if (s.mesh.children[1]) s.mesh.children[1].rotateY(0.2);

                if (s.life === 30) {
                    if (s.isRemote === false) gaySatThuongAoEApoo(s.tamNo, s.upVector, s.damage, 5);
                    else if (typeof window.gaySatThuongBossToPlayer === 'function') {
                        let nvc = window.nhanVatChinh || (typeof playerModel !== 'undefined' ? playerModel : null);
                        if (nvc) {
                            let vecToTarget = new THREE.Vector3().subVectors(nvc.position, s.tamNo);
                            let docY = vecToTarget.dot(s.upVector);
                            let vecNgang = vecToTarget.clone().sub(s.upVector.clone().multiplyScalar(docY));
                            if (vecNgang.length() <= 5 && Math.abs(docY) <= 200) window.gaySatThuongBossToPlayer(nvc.position, s.damage, 15);
                        }
                    }
                    taoBuiAmThanh(s.tamNo, s.upVector, s.mauHienTai);
                }

                if (s.life < 10) {
                    let tile = Math.max(0.01, s.life / 10);
                    s.mesh.scale.set(tile, tile, tile);
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                kyNangApoo.splice(i, 1);
            }
        }

        // BỤI ÂM THANH RƠI RỤNG
        for (let i = hieuUngApoo.length - 1; i >= 0; i--) {
            let h = hieuUngApoo[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            
            let fallVec = h.upVector ? h.upVector.clone().multiplyScalar(-0.05) : new THREE.Vector3(0, -0.05, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                h.velocities[j].multiplyScalar(0.9); h.velocities[j].add(fallVec); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 20; 

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose(); if (h.system.material) h.system.material.dispose();
                hieuUngApoo.splice(i, 1);
            }
        }

        for (let i = danhSachSoBayApoo.length - 1; i >= 0; i--) {
            let it = danhSachSoBayApoo[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';
            if (it.life <= 0) { it.el.remove(); danhSachSoBayApoo.splice(i, 1); window.tongSoChuNoi_Apoo--; }
        }
    };
    setInterval(window.updateCombatApoo, 30);

    // ==========================================
    // 5. KHỞI TẠO & ĐĂNG KÝ HỆ PHÁI
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.toLowerCase().includes('apoo')) {
        window.HePhaiHienTai = {
            tenPhai: "Hải Minh Apoo",
            khoiTao: function () {
                console.log("🎶 Khởi động sức mạnh Sóng Âm Apoo!");
                if (window.animationsMap) {
                    window.KHO_ANIM_NHANROI = [];
                    window.KHO_ANIM_TANCONG = [];
                    let coBay = false; let coChay = false; let animBay = null; let animChay = null;
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase(); let clip = window.animationsMap[key];
                        if (k.includes('ATTACK') || k.includes('SKILL') || k.includes('COMBO')) {
                            if (clip && clip.tracks) {
                                clip.tracks = clip.tracks.filter(track => {
                                    let tenTrack = track.name.toLowerCase();
                                    if (tenTrack.includes('.position') && (tenTrack.includes('armature') || tenTrack.includes('hips') || tenTrack.includes('pelvis') || tenTrack.includes('root'))) return false;
                                    return true;
                                });
                            }
                        }
                        const tuKhoaCam = ['hit', 'hurt', 'damage', 'die', 'death', 'dead', 'defend'];
                        if (tuKhoaCam.some(tuCam => k.includes(tuCam.toUpperCase()))) continue;

                        if (k.includes('NHANROI') || k.includes('IDLE') || k.includes('WAIT')) window.KHO_ANIM_NHANROI.push(key);
                        if (k.includes('ATTACK') || k.includes('SKILL')) window.KHO_ANIM_TANCONG.push(key);
                        if (k.includes('BAY') || k.includes('FLY')) { coBay = true; animBay = clip; window.animationsMap['BAY'] = animBay; }
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) { coChay = true; animChay = clip; window.animationsMap['CHAYBO'] = animChay; }
                    }
                    if (coChay && !coBay) { window.animationsMap['BAY'] = animChay; window.animationsMap['FLY'] = animChay; }
                    if (coBay && !coChay) { window.animationsMap['CHAYBO'] = animBay; window.animationsMap['RUN'] = animBay; }
                    if (window.KHO_ANIM_NHANROI.length === 0) window.KHO_ANIM_NHANROI.push('NHANROI1');
                    let defaultIdle = window.KHO_ANIM_NHANROI[0];
                    window.animationsMap['NHANROI'] = window.animationsMap[defaultIdle];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[defaultIdle];
                }
            },
            tungChieu: window.tungComboApoo,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();

// =========================================================================
// 6. ÁNH XẠ CHỮA BỆNH CÂM NÍN 100% CHO AI BOSS
// =========================================================================
window.tungComboapoo = window.tungComboApoo;
window.tungComboApoo = window.tungComboApoo;
window.tungComboHaiMinh = window.tungComboApoo;
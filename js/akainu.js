// ==========================================
// 🌋 MÔN PHÁI ĐOẠT XÁ: THỦY SƯ ĐÔ ĐỐC AKAINU (CHÓ ĐỎ)
// 👑 CÔNG NGHỆ: MAGMA WRAPPER + CROSS-LOGIC PHYSICS + VRAM OPTIMIZED
// ==========================================

(function () {
    const kyNangAkainu = [];
    const hieuUngAkainu = [];
    const danhSachSoBayAk = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];
    window.tongSoChuNoi_Ak = 0;

    // 🌟 1. HIỂN THỊ DAME DUNG NHAM (ĐỎ CAM RỰC)
    function taoSoSatThuongAk(pos3D, satThuong, mauSac = '#ff2200') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_Ak > 5) return;
        window.tongSoChuNoi_Ak++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #660000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayAk.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatAk = function (viTriGoc) {
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

    function gaySatThuongAk(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongAk(posHienSo, luongSatThuong, '#ff2200');
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
                            taoSoSatThuongAk(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff0000');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongAk(hit.tamNguc.clone(), luongSatThuong);
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

    // 🌟 2. BỤI DUNG NHAM & ĐUÔI LỬA
    function taoHieuUngNoAk(pos, isBig = false) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        else if (typeof window.playSound === 'function') window.playSound('no');

        const soLuong = isBig ? 120 : 40; 
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

        if (!window.textureMagmaAk) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 50, 0, 1)'); // Màu Đỏ Cam Magma
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureMagmaAk = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xff3300, size: window.isMobile ? 3.0 : 6.0, map: window.textureMagmaAk,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngAkainu.push({ system: pts, velocities: vels, life: 30 });
    }

    function taoDuoiLuaAk(pos, direction, speed) {
        if (window.isMobile && Math.random() > 0.4) return;
        const soLuong = 6;
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            let offset = new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
            posArr[i * 3] = pos.x + offset.x; posArr[i * 3 + 1] = pos.y + offset.y; posArr[i * 3 + 2] = pos.z + offset.z;

            let tocDoHat = (speed * 0.3) + Math.random();
            let vec = direction.clone().multiplyScalar(tocDoHat).add(offset.multiplyScalar(0.1));
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        const bangMau = [0xff6600, 0xff2200, 0x660000]; // Cam, Đỏ rực, Đỏ bầm (Magma)
        const mauChon = bangMau[Math.floor(Math.random() * bangMau.length)];

        const mat = new THREE.PointsMaterial({ color: mauChon, size: 6.0 + Math.random() * 5, transparent: true, opacity: 0.8, map: window.textureMagmaAk, blending: THREE.AdditiveBlending, depthWrite: false });
        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngAkainu.push({ system: pts, velocities: vels, life: 20, type: 'trail' });
    }

    // 🌟 3. ĐÚC MODEL: BỌC DUNG NHAM CHO THIÊN THẠCH VÀ TAY AKAINU
    function taoVatTheAk(tenFile, scaleSize, isMagma = false) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let danhSachMat = Array.isArray(c.material) ? c.material : [c.material];
                        danhSachMat.forEach(m => {
                            m.transparent = true;
                            // 🌋 BÍ THUẬT: NHUỘM DUNG NHAM ĐỎ BẦM CHO THIÊN THẠCH & TAY
                            if (isMagma) {
                                m.map = null; // 🌟 Lột sạch vân đá cũ để màu Đỏ Đô lên ngôi!
                                if (m.color) m.color.setHex(0x550000); // Màu Đỏ Đô / Đỏ sẫm nguyên chất
                                if (m.emissive) {
                                    m.emissive.setHex(0xff2200); // Lõi đỏ cam rực rỡ
                                    m.emissiveIntensity = 2.0; 
                                }
                                m.opacity = 1.0; 
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

    window.thoiDiemChemCuoi_Ak = window.thoiDiemChemCuoi_Ak || 0;

    // ==========================================
    // 🌋 TUNG CHIÊU AKAINU (BẢN FIX CHUẨN ĐẠI TAY VÀ MƯA DUNG NHAM)
    // ==========================================
    window.tungComboAkainu = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        // Bốc thăm đòn đánh
        let animCanMua = 'ATTACK1';
        if (window.KHO_ANIM_TANCONG && window.KHO_ANIM_TANCONG.length > 0) {
            animCanMua = window.KHO_ANIM_TANCONG[Math.floor(Math.random() * window.KHO_ANIM_TANCONG.length)];
        }

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - window.thoiDiemChemCuoi_Ak < 800) return;
            window.thoiDiemChemCuoi_Ak = bayGio;
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
            let targetRadar = window.layMucTieuGanNhatAk(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) mucTieu = window.layHitbox(targetRadar.mesh).tamNguc.clone();
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Akainu',
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: true });
            }
        }

        const dameGoc = window.DAME_CUA_TOI || 100;
        let diemChanMucTieu = mucTieu.clone(); diemChanMucTieu.y = window.matDatY || 0;

        // ===============================================
        // 🌋 CHIÊU Q: VÒNG TRÒN NẮM ĐẤM (COPY CHUẨN KATAKURI R) -> DPS: 8 hit x 0.05 = 0.4
        // ===============================================
        if (phim === 'Q') {
            const soLuong = 8;
            let qHanhTinh = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVector);
            for (let i = 0; i < soLuong; i++) {
                const phi = Math.acos(-1 + (2 * i) / soLuong); const theta = Math.sqrt(soLuong * Math.PI) * phi;
                let localDir = new THREE.Vector3(Math.cos(theta)*Math.sin(phi), Math.abs(Math.cos(phi))+0.1, Math.sin(theta)*Math.sin(phi)).normalize();
                
                let huongRaNgoai = localDir.applyQuaternion(qHanhTinh).normalize();
                const posNgoai = mucTieu.clone().add(huongRaNgoai.multiplyScalar(35)); 
                posNgoai.add(upVector.clone().multiplyScalar(12)); 
                
                const tayAkainu = taoVatTheAk('tayakainu', 15.5, true); 
                tayAkainu.position.copy(posNgoai); 
                tayAkainu.up.copy(upVector);
                tayAkainu.lookAt(mucTieu); scene.add(tayAkainu);
                
                kyNangAkainu.push({ 
                    mesh: tayAkainu, type: 'BAY_THANG_GOM', speed: 4.0, life: 150, delay: i * 5, 
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.05, isRemote: isRemote, noBanKinh: 12
                });
            }
        }
        // ===============================================
        // 🌋 CHIÊU E: ĐẠI THỦ GIÁNG XUỐNG (BƠM TAY KHỔNG LỒ size 18 & FIX PIVOT ĐỈNH ĐẦU TU TIÊN)
        // ===============================================
        else if (phim === 'E') {
            const pivotGroup = new THREE.Group(); 
            // 🌟 Đặt tâm xoay CỐ ĐỊNH trên đỉnh đầu nhân vật (cao lên 15m chuẩn Tutien)
            pivotGroup.position.copy(viTriGocToTam).add(upVector.clone().multiplyScalar(15)); 
            pivotGroup.up.copy(upVector);
            pivotGroup.lookAt(mucTieu); // Trục hướng thẳng về phía quái
            
            const tayGiga = taoVatTheAk('tayakainu', 150.0, true); // 🌟 Phóng to Đại Thủ size 18 khổng lồ y hệt Đại Kiếm
            tayGiga.rotateX(-Math.PI * 0.8); // 🌟 Bẻ ngửa cánh tay ra tít phía sau lưng y hệt Đại Kiếm
            
            pivotGroup.add(tayGiga); 
            scene.add(pivotGroup);

            kyNangAkainu.push({ 
                mesh: pivotGroup, swordMesh: tayGiga, speed: 0, life: 100, ticks: 0, 
                type: 'F_CHOP_TUTIEN', targetPos: mucTieu.clone(), damage: dameGoc * 0.6, isRemote: isRemote, noBanKinh: 30
            });
        }
        // ===============================================
        // 🌋 CHIÊU R: MƯA LƯU TINH (ĐÃ FIX TÊN FILE VÀ ĐỎ ĐÔ DUNG NHAM)
        // ===============================================
        else if (phim === 'R') {
            let tongThoiGian = 3000;
            let soLuongMua = 15;
            let delayPerMeteor = tongThoiGian / soLuongMua;

            for (let i = 0; i < soLuongMua; i++) {
                setTimeout(() => {
                    const thienThach = taoVatTheAk('THIENTHACH', 32, true); 
                    
                    let posDap = diemChanMucTieu.clone();
                    posDap.x += (Math.random() - 0.5) * 45; 
                    posDap.z += (Math.random() - 0.5) * 45;

                    let posXuatPhat = posDap.clone();
                    posXuatPhat.y += 160 + Math.random() * 40; 
                    posXuatPhat.sub(huongMat.clone().multiplyScalar(80)); 

                    thienThach.position.copy(posXuatPhat);
                    thienThach.lookAt(posDap);
                    scene.add(thienThach);

                    kyNangAkainu.push({
                        mesh: thienThach, type: 'BAY_THANG', speed: 3.5, life: 150, isMeteor: true,
                        targetPos: posDap, damage: dameGoc * 0.04, isRemote: isRemote, noBanKinh: 25
                    });
                }, 500 + i * delayPerMeteor);
            }
        }
        // ===============================================
        // 🌋 CHIÊU F: KHỐI DUNG NHAM KHỔNG LỒ (ĐÃ FIX KHÔNG XOAY MŨI KHOAN)
        // ===============================================
        else if (phim === 'F') {
            setTimeout(() => {
                const thienThach = taoVatTheAk('THIENTHACH2', 60, true); 
                
                let posDap = diemChanMucTieu.clone();
                let posXuatPhat = posDap.clone();
                posXuatPhat.y += 140; 
                posXuatPhat.sub(huongMat.clone().multiplyScalar(70)); 

                thienThach.position.copy(posXuatPhat);
                thienThach.lookAt(posDap);
                scene.add(thienThach);

                kyNangAkainu.push({
                    mesh: thienThach, type: 'BAY_THANG', speed: 1.0, life: 250, isMeteor: true, isUltimate: true,
                    noRotate: true, // Cờ cấm xoay
                    targetPos: posDap, damage: dameGoc * 1.0, isRemote: isRemote, noBanKinh: 45
                });
            }, 1000);
        }
    };
    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU AKAINU ( FIX LỖI GOM Q VÀ BỔ E TU TIÊN)
    // ==========================================
    window.updateCombatAkainu = function () {
        
        // 1. VÒNG LẶP VẬT LÝ
        for (let i = kyNangAkainu.length - 1; i >= 0; i--) {
            let s = kyNangAkainu[i]; 
            if (s.delay > 0) { s.delay--; continue; }
            s.life--;

            // 🌟 VÁ CHIÊU Q: HỒI SINH QUỸ ĐẠO VÒNG TRÒN BAY GOM
            if (s.type === 'BAY_THANG_GOM') {
                if (s.targetPos) {
                    const dummy = new THREE.Object3D(); dummy.position.copy(s.mesh.position); dummy.lookAt(s.targetPos);
                    s.mesh.quaternion.slerp(dummy.quaternion, 0.15); 
                }
                s.mesh.translateZ(s.speed);

                let dirNguoc = new THREE.Vector3(); s.mesh.getWorldDirection(dirNguoc); dirNguoc.negate();
                taoDuoiLuaAk(s.mesh.position, dirNguoc, s.speed * 0.5);

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 3) {
                    gaySatThuongAk(s.mesh.position, s.damage, s.noBanKinh);
                    taoHieuUngNoAk(s.mesh.position, false);
                    s.life = 0;
                }
            }
            // 🌟 VÁ CHIÊU E: VẬT LÝ BỔ TRỤC XOAY CHUẨN F ĐẠI KIẾM TU TIÊN (TỪ ĐẦU NGÃI XUỐNG ĐẤT)
            else if (s.type === 'F_CHOP_TUTIEN') {
                if (s.swordMesh) {
                    s.swordMesh.rotateX(0.12); // Tốc độ đập gập xuống gắt
                    s.ticks++;
                    
                    // Hiệu ứng xịt lửa lửa Magma khi tay đang đập xuống
                    let tayPos = new THREE.Vector3();
                    s.swordMesh.getWorldPosition(tayPos);
                    taoDuoiLuaAk(tayPos, new THREE.Vector3(0, 1, 0), 1.5); 

                    if (s.ticks > 25 || s.life <= 5) { // Canh đúng nhịp tay chạm đất cái rầm
                        gaySatThuongAk(s.targetPos, s.damage, s.noBanKinh);
                        taoHieuUngNoAk(s.targetPos, true); // Nổ Bùng Magma
                        s.life = 0;
                    }
                }
            }
            // Xử lý rơi thiên thạch xéo (Chiêu R, F)
            else if (s.type === 'BAY_THANG') {
                let huongBay = null;
                if (s.targetPos) {
                    huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else {
                    s.mesh.translateZ(s.speed);
                }

                // GỌI HIỆU ỨNG ĐUÔI LỬA CHO THIÊN THẠCH
                if (s.isMeteor && huongBay) {
                    // KHÔNG XOAY NẾU CÓ CỜ noRotate (CHIÊU F)
                    if (!s.noRotate && s.mesh.children.length > 0) s.mesh.children[0].rotateZ(0.2); 
                    
                    let dirNguoc = huongBay.clone().negate(); 
                    taoDuoiLuaAk(s.mesh.position, dirNguoc, s.speed);
                    
                    if (s.isUltimate) {
                        s.speed *= 1.03; if (s.speed > 8.0) s.speed = 8.0; 
                    } else {
                        s.speed *= 1.08; if (s.speed > 15.0) s.speed = 15.0; 
                    }
                }

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) {
                    gaySatThuongAk(s.targetPos, s.damage, s.noBanKinh);
                    taoHieuUngNoAk(s.targetPos, s.isUltimate);
                    s.life = 0;
                }
            }

            // 🛑 DỌN RÁC MODEL 3D TẬN GỐC (Bản bọc thép)
            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') {
                    window.donRac3D(s.mesh);
                } else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangAkainu.splice(i, 1);
            }
        }

        // 🛑 VỌNG LẶP DỌN RÁC HẠT VFX (Bản bọc thép)
        for (let i = hieuUngAkainu.length - 1; i >= 0; i--) {
            let h = hieuUngAkainu[i]; h.life--;

            if (h.type === 'trail') {
                let posArr = h.system.geometry.attributes.position.array;
                for (let j = 0; j < posArr.length / 3; j++) {
                    posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                    h.velocities[j].multiplyScalar(0.9);
                }
                h.system.geometry.attributes.position.needsUpdate = true;
                h.system.material.opacity = h.life / 20;
                h.system.material.size *= 0.95;
            } else {
                let posArr = h.system.geometry.attributes.position.array;
                for (let j = 0; j < posArr.length / 3; j++) {
                    posArr[j * 3] += h.velocities[j].x; posArr[j * 3 + 1] += h.velocities[j].y; posArr[j * 3 + 2] += h.velocities[j].z;
                    h.velocities[j].multiplyScalar(0.9); h.velocities[j].y += 0.05;
                }
                h.system.geometry.attributes.position.needsUpdate = true;
                h.system.material.opacity = h.life / 30;
            }

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose(); 
                if (h.system.material) h.system.material.dispose(); 
                hieuUngAkainu.splice(i, 1);
            }
        }

        // Dọn rác Thẻ số nhảy dame
        for (let i = danhSachSoBayAk.length - 1; i >= 0; i--) {
            let it = danhSachSoBayAk[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else it.el.style.display = 'none';
            if (it.life <= 0) {
                it.el.remove(); 
                danhSachSoBayAk.splice(i, 1);
                window.tongSoChuNoi_Ak--;
            }
        }
    };
    setInterval(window.updateCombatAkainu, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.trim() !== '') {
        window.HePhaiHienTai = {
            tenPhai: "Đô Đốc Akainu",
            khoiTao: function () {
                console.log("🌋 Chính Nghĩa Tuyệt Đối! Khởi động Đô Đốc Akainu!");

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
            tungChieu: window.tungComboAkainu,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
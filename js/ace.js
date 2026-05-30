// ==========================================
// 🔥 MÔN PHÁI ĐOẠT XÁ: HỎA QUYỀN PORTGAS D. ACE (BẢN VẬT LÝ CODE)
// 👑 CÔNG NGHỆ: TỰ ĐỘNG XOAY MODEL BẰNG CODE + FIX LỖI ẨN DAME
// ==========================================

(function () {
    const kyNangAce = [];
    const danhSachSoBayAce = [];

    window.KHO_ANIM_NHANROI = [];
    window.KHO_ANIM_TANCONG = [];

    window.tongSoChuNoi_Ace = 0;

    // 🌟 HÀM TẠO SỐ ĐAM ĐỎ CHÓT CỦA LỬA
    function taoSoSatThuong(pos3D, satThuong, mauSac = '#ff5500') {
        if (window.isMobile) return;
        if (satThuong <= 0) return;
        if (window.isMobile && window.tongSoChuNoi_Ace > 5) return;
        window.tongSoChuNoi_Ace++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #880000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayAce.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    window.layMucTieuGanNhatAce = function (viTriGoc) {
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

    function gaySatThuongAce(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuong(posHienSo, luongSatThuong, '#ff5500');
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
                            taoSoSatThuong(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff0000');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuong(hit.tamNguc.clone(), luongSatThuong);
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
    // 🌟 ĐÚC VẬT THỂ LỬA BẰNG HÀM ENGINE GỐC ĐỂ KHÔNG BỊ LỖI
    // ==========================================
    function taoLuaFile(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    // Đắp vật liệu cho nó phát sáng mạnh
                    if (c.isMesh && c.material) {
                        if (Array.isArray(c.material)) {
                            c.material.forEach(m => { m.transparent = true; m.blending = THREE.AdditiveBlending; });
                        } else {
                            c.material.transparent = true;
                            c.material.blending = THREE.AdditiveBlending;
                        }
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

    window.thoiDiemChemCuoi_Ace = window.thoiDiemChemCuoi_Ace || 0;

    window.tungComboAce = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        let animCanMua = 'ATTACK1';
        if (phim === 'Q') animCanMua = 'ATTACK1';
        if (phim === 'E') animCanMua = 'ATTACK2';
        if (phim === 'R') animCanMua = 'ATTACK3';
        if (phim === 'F') animCanMua = 'ATTACK4';

        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - window.thoiDiemChemCuoi_Ace < 800) return;
            window.thoiDiemChemCuoi_Ace = bayGio;

            window.dangMuaChieu = true;
            window.currentAnimName = '';
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
        }

        let viTriGocToTam = new THREE.Vector3();
        let upVector = nvc.up ? nvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
        let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
        let mucTieu = null;

        if (isRemote) {
            viTriGocToTam = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            upVector = viTriGocToTam.clone().normalize();
            mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
        } else {
            viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));
            let targetRadar = window.layMucTieuGanNhatAce(viTriGocToTam);

            if (targetRadar && targetRadar.mesh) {
                let hit = window.layHitbox(targetRadar.mesh);
                mucTieu = hit.tamNguc.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }
        }

        const dameGoc = window.DAME_CUA_TOI || 100;

        let xuongTayPhai = null; let xuongTayTrai = null;
        nvc.traverse(c => {
            if (c.name === 'RHand_Palm_015' || (c.name === 'Object_20' && !xuongTayPhai)) xuongTayPhai = c;
            if (c.name === 'LHand_Palm_011' || (c.name === 'Object_16' && !xuongTayTrai)) xuongTayTrai = c;
        });

        // ===============================================
        // 🔥 CHIÊU Q: MŨI KHOAN TỐC ĐỘ CAO (VIÊN ĐẠN NHỎ LẠI 50%)
        // ===============================================
        if (phim === 'Q') {
            let soVien = 10;
            for (let i = 0; i < soVien; i++) {
                setTimeout(() => {
                    let tayBan = (i % 2 === 0) ? xuongTayPhai : xuongTayTrai;
                    let diemBan = viTriGocToTam.clone();
                    if (tayBan) tayBan.getWorldPosition(diemBan);

                    const lua = taoLuaFile('fire1', 4); // 🌟 Đã bóp nhỏ 50% (Từ 8 xuống 4)
                    lua.position.copy(diemBan).add(huongMat.clone().multiplyScalar(1.5));

                    let doLan = 3.0;
                    let targetBay = mucTieu.clone().add(new THREE.Vector3((Math.random() - 0.5) * doLan, (Math.random() - 0.5) * doLan, 0));

                    lua.lookAt(targetBay);
                    scene.add(lua);

                    kyNangAce.push({
                        mesh: lua, type: 'BAY_THANG', speed: 6.0, life: 100,
                        skillId: 'Q',
                        targetPos: targetBay, damage: dameGoc * 0.4, isRemote: isRemote, noBanKinh: 10
                    });
                }, 200 + (i * 150));
            }
        }

        // ===============================================
        // 🔥 CHIÊU E: HỎA ĐẠN NÉM THẲNG (KHÔNG XOAY)
        // ===============================================
        else if (phim === 'E') {
            setTimeout(() => {
                let diemBan = viTriGocToTam.clone();
                if (xuongTayPhai) xuongTayPhai.getWorldPosition(diemBan);

                const lua = taoLuaFile('fire2', 25);
                lua.position.copy(diemBan).add(huongMat.clone().multiplyScalar(2.0));
                lua.lookAt(mucTieu);
                scene.add(lua);

                kyNangAce.push({
                    mesh: lua, type: 'BAY_THANG', speed: 4.5, life: 120,
                    skillId: 'E', // 🌟 Tí nữa vòng lặp vật lý sẽ bỏ qua không xoay chiêu này
                    targetPos: mucTieu.clone(), damage: dameGoc * 0.6, isRemote: isRemote, noBanKinh: 15
                });
            }, 1300);
        }

        // ===============================================
        // 🔥 CHIÊU R: THIÊN THẠCH VIÊM ĐẾ (ĐÂM XUỐNG CHÂN MỤC TIÊU)
        // ===============================================
        else if (phim === 'R') {
            setTimeout(() => {
                let diemBanPhai = viTriGocToTam.clone(); let diemBanTrai = viTriGocToTam.clone();
                if (xuongTayPhai) xuongTayPhai.getWorldPosition(diemBanPhai);
                if (xuongTayTrai) xuongTayTrai.getWorldPosition(diemBanTrai);

                let diemBan = new THREE.Vector3().addVectors(diemBanPhai, diemBanTrai).multiplyScalar(0.5);
                diemBan.y += 15.0; // Xuất phát tít trên cao

                // 🌟 ĐỒNG BỘ TOẠ ĐỘ ĐẤT: ÉP ĐIỂM ĐÁP XUỐNG CHÂN MỤC TIÊU (Giống chiêu F)
                let diemChanMucTieu = mucTieu.clone();
                diemChanMucTieu.y = window.matDatY || 0;

                const lua = taoLuaFile('fire3', 45);
                lua.position.copy(diemBan);
                lua.lookAt(diemChanMucTieu); // Lao thẳng xuống chân quái
                scene.add(lua);

                kyNangAce.push({
                    mesh: lua, type: 'BAY_THANG', speed: 5.0, life: 250,
                    skillId: 'R',
                    targetPos: diemChanMucTieu, // Đâm trúng sàn chân quái thì nổ
                    damage: dameGoc * 1.0, isRemote: isRemote, noBanKinh: 30
                });
            }, 1000);
        }

        // ===============================================
        // 🔥 CHIÊU F: HỎA TRỤ (Xoay tròn & Phình to ra 50m)
        // ===============================================
        else if (phim === 'F') {
            setTimeout(() => {
                let diemNo = mucTieu.clone();
                diemNo.y = window.matDatY || 0;

                // Scale gốc cực nhỏ: Bắt đầu từ 5m
                const lua = taoLuaFile('fire4', 5);
                lua.position.copy(diemNo);
                scene.add(lua);

                kyNangAce.push({
                    mesh: lua, type: 'NO_TAI_CHO', speed: 0,
                    life: 120, // Tồn tại 120 frame
                    skillId: 'F', currentScale: 5, maxScale: 50, // Tham số để làm phình to
                    targetPos: diemNo, damage: dameGoc * 1.5, isRemote: isRemote, noBanKinh: 40
                });

                gaySatThuongAce(diemNo, dameGoc * 1.5, 40);

            }, 500);
        }
    };

    // ==========================================
    // 🌪️ VÒNG LẶP RENDER VẬT LÝ TOÀN CẦU ACE
    // ==========================================
    window.updateCombatAce = function () {
        for (let i = kyNangAce.length - 1; i >= 0; i--) {
            let s = kyNangAce[i]; s.life--;

            // 🛑 BẢN VÁ TỐI THƯỢNG: Chỉ xoay cái ruột 3D (children[0]), giữ nguyên cái vỏ bên ngoài!
            if (s.mesh && s.mesh.children.length > 0) {
                let ruotLua = s.mesh.children[0];

                if (s.skillId === 'Q') ruotLua.rotateZ(0.8); // Q - Mũi khoan: Xoay tít quanh lõi ngang

                if (s.skillId === 'R') ruotLua.rotateY(0.2); // R - Viêm Đế: Xoay lốc xoáy quanh trục dọc của chính nó

                if (s.skillId === 'F') {
                    ruotLua.rotateY(0.3); // F - Hỏa Trụ
                    if (s.currentScale < s.maxScale) {
                        s.currentScale += 1.5;
                        s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                    }
                }
            }

            // 🛑 ĐỘNG CƠ TÌM ĐƯỜNG TUYỆT ĐỐI (Toán học Vector)
            if (s.type === 'BAY_THANG') {
                if (s.targetPos) {
                    // Kéo 1 đường thẳng tắp từ tọa độ đạn tới chân quái vật, không bao giờ bị bẻ lái!
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else {
                    s.mesh.translateZ(s.speed);
                }

                // Kích nổ khi chạm đích
                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) {
                    gaySatThuongAce(s.targetPos, s.damage, s.noBanKinh);

                    if (s.skillId === 'R') {
                        s.type = 'NO_TAI_CHO';
                        s.life = 60; // Đâm trúng sàn thì đứng im diễn lốc xoáy nổ tiếp
                    } else {
                        s.life = 0;
                    }
                }
            }

            if (s.life <= 0) {
                if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                if (typeof scene !== 'undefined') scene.remove(s.mesh);
                kyNangAce.splice(i, 1);
            }
        }

        // 🛑 PHỤC HỒI CODE HIỂN THỊ DAME MÁU
        for (let i = danhSachSoBayAce.length - 1; i >= 0; i--) {
            let it = danhSachSoBayAce[i]; it.offsetY += 0.05; it.life--;
            const p = it.pos.clone(); p.y += it.offsetY; p.project(camera);
            if (p.z < 1) {
                it.el.style.left = `${(p.x * 0.5 + 0.5) * window.innerWidth}px`; it.el.style.top = `${(p.y * -0.5 + 0.5) * window.innerHeight}px`;
            } else { it.el.style.display = 'none'; }
            if (it.life <= 0) { it.el.remove(); danhSachSoBayAce.splice(i, 1); window.tongSoChuNoi_Ace--; }
        }
    };

    setInterval(window.updateCombatAce, 30);

    // ==========================================
    // 🌟 KHỞI TẠO HỆ PHÁI
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.trim() !== '') {
        window.HePhaiHienTai = {
            tenPhai: "Hỏa Quyền",
            khoiTao: function () {
                console.log("🔥 Đã kế thừa ý chí của Ace! Kích hoạt Động cơ Vật lý Code!");

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
            tungChieu: window.tungComboAce,
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
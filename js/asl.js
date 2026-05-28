// ==========================================
// 👦 HỆ THỐNG KỸ NĂNG: BỘ BA ASL (ACE - SABO - LUFFY)
// 👑 BẢN VÁ LỖI V2: TRÁO RUỘT TỪ ĐIỂN & ÉP BUỘC ANIMATION
// ==========================================

(function() {
    let hieuUngASL = [];
    let danhSachSoBayASL = []; 

    window.trangThaiASL = {
        state: 'IDLE', 
        target: null,
        skillKey: null,
        dameRatio: 1
    };

    window.tongSoChuNoi_ASL = 0; 
    function taoSoSatThuongASL(pos3D, satThuong, mauSac = '#ff2222') {
        if (window.isMobile) return; 
        if(satThuong <= 0) return;
        window.tongSoChuNoi_ASL++;

        const div = document.createElement('div');
        div.innerText = "-" + Math.round(satThuong);
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000, -2px -2px 0px #000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999; transition: 0.1s;`;
        document.body.appendChild(div);
        
        setTimeout(() => { div.style.transform = `scale(1.5)`; }, 20);
        setTimeout(() => { div.style.transform = `scale(1.0)`; }, 100);

        danhSachSoBayASL.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }

    const THOI_GIAN_HOI = { 'Q': 4000, 'E': 4000, 'R': 4000, 'F': 4000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    function layQuaiVatGanNhatASL(viTriGoc) {
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
    }

    function gaySatThuongASL(tamNgucDich, luongSatThuong, banKinh) {
        function kichHoatHutMau() {
            let nvc = window.playerModel || window.nhanVatChinh;
            if (nvc && nvc.hp < (nvc.maxHp || 1000)) {
                nvc.hp = Math.min((nvc.maxHp || 1000), nvc.hp + (luongSatThuong * 0.05));
                if (document.getElementById('health-bar')) document.getElementById('health-bar').style.width = (nvc.hp / (nvc.maxHp || 1000) * 100) + '%';
            }
        }

        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongASL(posHienSo, luongSatThuong, '#ffaa00');
                        kichHoatHutMau(); 
                        if (typeof window.chemTrungNguoiChoi === 'function') window.chemTrungNguoiChoi(id, luongSatThuong, posHienSo);
                    }
                }
            }
        }
        
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh);
                    if (tamNgucDich.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        if (quai.isBoss) {
                            taoSoSatThuongASL(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            kichHoatHutMau(); 
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongASL(hit.tamNguc.clone(), luongSatThuong);
                            kichHoatHutMau(); 
                            if (quai.tagEl) { let bar = quai.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (quai.hp / (quai.maxHp || 4000)) * 100) + '%'; }
                            if (quai.hp <= 0) {
                                quai.isDead = true; if (typeof quai.playAnim === 'function') quai.playAnim('DIE'); else quai.mesh.visible = false;
                                if (quai.tagEl) quai.tagEl.style.display = 'none';
                                if (typeof window.congKinhNghiem === 'function') window.congKinhNghiem(500);
                                setTimeout(() => { quai.hp = quai.maxHp || 4000; quai.isDead = false; if (typeof quai.playAnim === 'function') quai.playAnim('IDLE'); else quai.mesh.visible = true; if (quai.tagEl) { quai.tagEl.querySelector('.hp-bar').style.width = '100%'; quai.tagEl.style.display = 'block'; } }, 5000);
                            } else { if (typeof quai.playAnim === 'function') quai.playAnim('HIT'); }
                        }
                    }
                }
            });
        }
    }

    window.thoiDiemNoCuoiCungASL = window.thoiDiemNoCuoiCungASL || 0;
    function taoVuNoASL(pos, upV, mauHex, banKinh) {
        let bayGio = Date.now();
        if (window.isMobile && bayGio - window.thoiDiemNoCuoiCungASL < 300) return;
        window.thoiDiemNoCuoiCungASL = bayGio;

        if (typeof window.phatAmThanhNo === 'function') window.phatAmThanhNo();

        const vfxGroup = new THREE.Group();
        vfxGroup.position.copy(pos);

        const soLuong = window.isMobile ? 5 : 125; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = 0; posArr[i * 3 + 1] = 0; posArr[i * 3 + 2] = 0;
            let dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            let speed = 1 + Math.random() * 3; 
            vels.push(dir.multiplyScalar(speed));
        }

        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        const texture = (typeof window.layTextureLua === 'function') ? window.layTextureLua() : null;
        const mat = new THREE.PointsMaterial({ 
            color: mauHex || 0xffddaa,
            size: window.isMobile ? 9.0 : 6.0, 
            map: texture, 
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false 
        });
        
        const pts = new THREE.Points(geo, mat);
        vfxGroup.add(pts);

        let songXungKich = null;
        if (!window.isMobile) {
            const geoSong = new THREE.RingGeometry(0.1, 2, 32);
            const matSong = new THREE.MeshBasicMaterial({
                color: mauHex || 0xffaa00, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            songXungKich = new THREE.Mesh(geoSong, matSong);
            songXungKich.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upV);
            songXungKich.position.add(upV.clone().multiplyScalar(0.5)); 
            vfxGroup.add(songXungKich);
        }

        scene.add(vfxGroup);
        hieuUngASL.push({ group: vfxGroup, pts: pts, velocities: vels, songXungKich: songXungKich, life: window.isMobile ? 20 : 40, maxScale: banKinh });
    }

    // 🌟 AI: RANDOM ATTACK TỪ 1 ĐẾN 5 CÔNG BẰNG TUYỆT ĐỐI
    function bốcChiêuTấnCôngNgẫuNhiên() {
        const khoChiêu = ['ATTACK1', 'ATTACK2', 'ATTACK3', 'ATTACK4', 'ATTACK5'];
        return khoChiêu[Math.floor(Math.random() * khoChiêu.length)];
    }

    window.tungComboASL = function (phim, isRemote = false) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc || isRemote) return;

        let bayGio = Date.now();
        if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
        choHoiChieu[phim] = bayGio;

        // BÍ QUYẾT 1: KHÓA MÕM ENGINE GỐC NGAY LẬP TỨC ĐỂ NÓ KHÔNG CHÈN ATTACK1
        window.dangMuaChieu = true;

        if (!isRemote) {
            let nutKyNang = document.getElementById('btn' + phim.toUpperCase()) || document.getElementById('skill' + phim.toUpperCase());
            if (!nutKyNang) {
                let cacNut = document.querySelectorAll('div, button');
                for (let n of cacNut) {
                    if (n.innerText && n.innerText.trim().toUpperCase() === phim.toUpperCase() && (n.style.borderRadius === '50%' || n.className.includes('skill'))) {
                        nutKyNang = n; break;
                    }
                }
            }

            if (nutKyNang) {
                nutKyNang.style.pointerEvents = 'none'; 
                nutKyNang.style.filter = 'brightness(0.4) grayscale(100%)'; 
                
                let idDongHo = 'dongho_asl_' + phim;
                let soDemNguoc = document.getElementById(idDongHo);
                if (!soDemNguoc) {
                    soDemNguoc = document.createElement('div');
                    soDemNguoc.id = idDongHo;
                    soDemNguoc.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:18px; font-weight:900; text-shadow:0px 0px 6px #000, 1px 1px 2px #000; z-index:999; pointer-events:none;';
                    nutKyNang.appendChild(soDemNguoc);
                }
                
                let thoiGian = THOI_GIAN_HOI[phim] / 1000;
                soDemNguoc.innerText = thoiGian.toFixed(1);
                
                let demDongHo = setInterval(() => {
                    thoiGian -= 0.1;
                    if (thoiGian <= 0) {
                        clearInterval(demDongHo);
                        if (soDemNguoc && soDemNguoc.parentNode) soDemNguoc.parentNode.removeChild(soDemNguoc); 
                        nutKyNang.style.filter = ''; nutKyNang.style.pointerEvents = ''; 
                    } else {
                        soDemNguoc.innerText = thoiGian.toFixed(1);
                    }
                }, 100);
            }
        }

        let viTriGoc = nvc.position.clone();
        let targetQuai = layQuaiVatGanNhatASL(viTriGoc);

        if (targetQuai) {
            const dameChiTiet = { 'Q': 1.0, 'E': 1.2, 'R': 1.5, 'F': 2.0 };
            window.trangThaiASL.state = 'DASHING';
            window.trangThaiASL.target = targetQuai;
            window.trangThaiASL.skillKey = phim;
            window.trangThaiASL.dameRatio = dameChiTiet[phim];
            
            // Ép chạy bộ khi lướt tới
            if(typeof window.epNhanVatMua === 'function') window.epNhanVatMua('CHAYBO');
        } else {
            // ĐÁNH KHÔNG KHÍ
            window.trangThaiASL.state = 'HITTING'; 
            let randomAtk = bốcChiêuTấnCôngNgẫuNhiên();
            
            // ÉP CHIÊU BẰNG LỆNH MẠNH NHẤT
            if(typeof window.epNhanVatMua === 'function') window.epNhanVatMua(randomAtk);
            else if(typeof window.playAnim === 'function') window.playAnim(randomAtk);
            
            let nvcUp = nvc.up.clone().normalize();
            let banKinhNo = (phim === 'F') ? 15 : 5;
            taoVuNoASL(viTriGoc, nvcUp, 0xffaa00, banKinhNo);

            // Giữ khóa 1 giây cho múa xong rồi mới thả
            setTimeout(() => { 
                window.dangMuaChieu = false; 
                window.trangThaiASL.state = 'IDLE';
            }, 1000);
        }
    };

    // ========================================================
    // 🌟 AI: RANDOM NHÀN RỖI (TRÁO RUỘT TỪ ĐIỂN ĐỂ LỪA ENGINE)
    // ========================================================
    window.vongLapNhanRoiASL = null;
    function batDauAutoNhanRoi() {
        if (window.vongLapNhanRoiASL) clearTimeout(window.vongLapNhanRoiASL);
        
        let thoiGianCho = 5000 + Math.random() * 5000; 

        window.vongLapNhanRoiASL = setTimeout(() => {
            if (window.trangThaiASL.state === 'IDLE' && !window.dangMuaChieu) {
                const khoNhanRoi = [];
                for(let i=1; i<=13; i++) khoNhanRoi.push('NHANROI' + i);
                
                let tenAnim = khoNhanRoi[Math.floor(Math.random() * khoNhanRoi.length)];
                
                // BÍ QUYẾT 2: TRÁO RUỘT TỪ ĐIỂN! 
                // Khi Engine Game tự động gọi 'NHANROI', nó sẽ bốc phải cái ruột mới này!
                if (window.animationsMap && window.animationsMap[tenAnim]) {
                    window.animationsMap['NHANROI'] = window.animationsMap[tenAnim];
                    if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap[tenAnim];
                    
                    // Phát ngay lập tức
                    if (typeof window.playAnim === 'function') window.playAnim('NHANROI');
                }
            }
            batDauAutoNhanRoi();
        }, thoiGianCho);
    }

    if (window.SCRIPT_PHAI_CUA_TOI && (window.SCRIPT_PHAI_CUA_TOI.includes('phai_luyenthe') || window.SCRIPT_PHAI_CUA_TOI.includes('asl') || window.SCRIPT_PHAI_CUA_TOI.includes('asl.js'))) {

        window.HePhaiHienTai = {
            tenPhai: "Bộ Ba Băng Đảng Nhí ASL",
            khoiTao: function () {
                console.log("🔥 Biệt Đội ASL Đã Sẵn Sàng (Bản Vá Lỗi Auto Anim)!");
                
                if (window.playerModel && (!window.MOUNT_URL || window.MOUNT_URL.trim() === "")) {
                    window.playerModel.scale.multiplyScalar(1.6); 
                }

                if (window.animationsMap) {
                    if (window.animationsMap['CHAYBO']) {
                        window.animationsMap['BAY'] = window.animationsMap['CHAYBO'];
                        window.animationsMap['FLY'] = window.animationsMap['CHAYBO'];
                    }
                    if (window.animationsMap['NHANROI1']) {
                        window.animationsMap['NHANROI'] = window.animationsMap['NHANROI1'];
                        if (window.animationsMapChar) window.animationsMapChar['NHANROI'] = window.animationsMap['NHANROI1'];
                    }
                }

                // Kích hoạt AI Đứng Nhàn Rỗi Random
                batDauAutoNhanRoi();

                const vuKhiLoader = new THREE.GLTFLoader();
                if (window.loaderSieuToc) vuKhiLoader.setDRACOLoader(window.loaderSieuToc);

                let linkBaoTay = window.WEAPON_URL;
                if (!linkBaoTay || linkBaoTay.trim() === '') return; 

                vuKhiLoader.load(linkBaoTay, (gltf) => {
                    window.vuKhiModel = gltf.scene;
                    let xuongTayPhai = null;
                    let modelNguoi = window.nhanVatChinh || window.playerModel; 
                    modelNguoi.traverse(c => {
                        if (c.isBone && (c.name.toLowerCase().includes('hand_r') || c.name.toLowerCase().includes('righthand') || c.name.toLowerCase().includes('hand.r'))) {
                            xuongTayPhai = c;
                        }
                    });
                    if (xuongTayPhai) {
                        xuongTayPhai.add(window.vuKhiModel);
                        window.vuKhiModel.position.set(0, 0, 0); 
                        window.vuKhiModel.scale.set(3, 3, 3); 
                    } else {
                        modelNguoi.add(window.vuKhiModel); window.vuKhiModel.position.set(-1, 5, 1);
                    }
                });
            },
            tungChieu: function (phim, isRemote = false) { 
                window.tungComboASL(phim, isRemote); 
            },
            vongLapVatLy: function () {
                let nvc = window.playerModel;
                if (!nvc) return;

                if (window.trangThaiASL.state === 'DASHING' && window.trangThaiASL.target) {
                    let t = window.trangThaiASL.target;
                    if (t.isDead) { 
                        window.trangThaiASL.state = 'IDLE'; 
                        window.dangMuaChieu = false;
                        return; 
                    }
                    
                    let tHit = window.layHitbox(t.mesh);
                    let myHit = window.layHitbox(nvc);
                    
                    let diemDen = tHit.tamNguc.clone();
                    diemDen.y -= (myHit.chieuCao / 2); 
                    
                    let khoangCach = nvc.position.distanceTo(diemDen);
                    
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(nvc.position);
                    dummy.up.copy(nvc.up);
                    let vecToTarget = new THREE.Vector3().subVectors(tHit.tamNguc, nvc.position);
                    let vertComp = vecToTarget.clone().projectOnVector(nvc.up);
                    vecToTarget.sub(vertComp);
                    dummy.lookAt(nvc.position.clone().add(vecToTarget));
                    nvc.quaternion.slerp(dummy.quaternion, 0.3); 
                    
                    if (khoangCach > 2.2) {
                        nvc.position.lerp(diemDen, 0.25); 
                        if (window.controls) window.controls.target.lerp(tHit.tamNguc, 0.1);
                    } 
                    else {
                        window.trangThaiASL.state = 'HITTING';
                        
                        // 🌟 TỚI NƠI ĐÁNH TRÚNG THÌ RANDOM CHIÊU TỪ 1 ĐẾN 5 & ÉP KỸ NĂNG MẠNH NHẤT
                        let randomAtk = bốcChiêuTấnCôngNgẫuNhiên();
                        if(typeof window.epNhanVatMua === 'function') window.epNhanVatMua(randomAtk);
                        else if(typeof window.playAnim === 'function') window.playAnim(randomAtk);
                        
                        let banKinhNo = (window.trangThaiASL.skillKey === 'F') ? 15 : 5;
                        taoVuNoASL(tHit.tamNguc, nvc.up.clone().normalize(), 0xffaa00, banKinhNo);
                        gaySatThuongASL(tHit.tamNguc, (window.DAME_CUA_TOI || 200) * window.trangThaiASL.dameRatio, banKinhNo);
                        
                        if(window.currentActionChar) {
                            window.currentActionChar.setEffectiveTimeScale(0.01);
                            setTimeout(() => { if(window.currentActionChar) window.currentActionChar.setEffectiveTimeScale(1.5); }, 100);
                        }
                        
                        let camY = camera.position.y; let camX = camera.position.x;
                        let shake = setInterval(() => { 
                            camera.position.y = camY + (Math.random()-0.5) * 1.5; 
                            camera.position.x = camX + (Math.random()-0.5) * 1.5; 
                        }, 20);
                        setTimeout(() => { 
                            clearInterval(shake); 
                            camera.position.y = camY; camera.position.x = camX; 
                        }, 120);
                        
                        // Đợi 1 giây múa xong mới thả tự do cho Engine
                        setTimeout(() => { 
                            window.dangMuaChieu = false;
                            if(window.trangThaiASL.state === 'HITTING') window.trangThaiASL.state = 'IDLE'; 
                        }, 1000);
                    }
                }

                for (let i = hieuUngASL.length - 1; i >= 0; i--) {
                    let vfx = hieuUngASL[i];
                    vfx.life--;
                    let posArr = vfx.pts.geometry.attributes.position.array;
                    for (let j = 0; j < posArr.length / 3; j++) {
                        posArr[j * 3] += vfx.velocities[j].x;
                        posArr[j * 3 + 1] += vfx.velocities[j].y;
                        posArr[j * 3 + 2] += vfx.velocities[j].z;
                        vfx.velocities[j].x *= 0.85; vfx.velocities[j].y *= 0.85; vfx.velocities[j].z *= 0.85;
                    }
                    vfx.pts.geometry.attributes.position.needsUpdate = true;
                    
                    vfx.pts.material.size += 0.2; 
                    vfx.pts.material.opacity = vfx.life / 40;
                    if (vfx.life < 25) vfx.pts.material.color.setHex(0xff3300); 
                    if (vfx.life < 10) {
                        vfx.pts.material.color.setHex(0x111111); 
                        vfx.pts.material.blending = THREE.NormalBlending;
                    }
                    if (vfx.songXungKich) {
                        let tienTrinh = 1 - (vfx.life / 40);
                        let scaleSong = vfx.maxScale * (tienTrinh * 0.75); 
                        vfx.songXungKich.scale.set(scaleSong, scaleSong, 1);
                        vfx.songXungKich.material.opacity = (vfx.life / 40) * 0.6;
                    }
                    if (vfx.life <= 0) {
                        if (typeof window.donRac3D === 'function') window.donRac3D(vfx.group);
                        else scene.remove(vfx.group);
                        hieuUngASL.splice(i, 1);
                    }
                }

                for (let i = danhSachSoBayASL.length - 1; i >= 0; i--) {
                    let item = danhSachSoBayASL[i];
                    item.offsetY += 0.05; item.life--;
                    const screenPos = item.pos.clone(); screenPos.y += item.offsetY; screenPos.project(camera);
                    if (screenPos.z < 1) {
                        item.el.style.left = `${(screenPos.x * 0.5 + 0.5) * window.innerWidth}px`;
                        item.el.style.top = `${(screenPos.y * -0.5 + 0.5) * window.innerHeight}px`;
                    } else { item.el.style.display = 'none'; }
                    if (item.life < 20) item.el.style.opacity = item.life / 20;
                    if (item.life <= 0) { item.el.remove(); danhSachSoBayASL.splice(i, 1); window.tongSoChuNoi_ASL--; }
                }
            },
            capNhat: function () {} 
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
// ==========================================
// 🥊 HỆ THỐNG KỸ NĂNG: LUYỆN THỂ (V16 - MIỄN NHIỄM LỖI TRÙNG LẶP)
// ==========================================

// BỌC TOÀN BỘ CODE VÀO HỘP KÍN ĐỂ KHÔNG ĐỤNG CHẠM VỚI TU TIÊN / PHÁP SƯ
(function() {
    const hieuUngLuyenThe = [];
    const danhSachSoBayLT = []; 




    window.tongSoChuNoi_LT = 0; // Biến đếm
    function taoSoSatThuongLT(pos3D, satThuong, mauSac = '#ff2222') {
        if (window.isMobile) return; // 🌟 CỨU SỐNG CPU MOBILE!
        if(satThuong <= 0) return;
        // 🌟 KHÓA VAN MOBILE
        if (window.isMobile && window.tongSoChuNoi_LT > 5) return;
        window.tongSoChuNoi_LT++;

        const div = document.createElement('div');
        div.innerText = "-" + satThuong;
        let bongChu = window.isMobile ? '1px 1px 0px #000' : '0px 0px 10px #000, 2px 2px 0px #000, -2px -2px 0px #000';
        div.style.cssText = `position:absolute; color:${mauSac}; font-weight:900; font-size:35px; text-shadow:${bongChu}; pointer-events:none; z-index:9999;`;
        document.body.appendChild(div);
        danhSachSoBayLT.push({ el: div, pos: pos3D.clone(), life: 60, offsetY: 0 });
    }





    


     // ⏳ BỘ ĐẾM THỜI GIAN HỒI CHIÊU CHUẨN (Đồng bộ 4 phái)
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 5000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    function layQuaiVatGanNhatLT(viTriGoc) {
        let targetQuai = null; 
        let minD = 250; // 🌟 Bơm tầm nhìn lên 250m để xài chiêu lướt (Dash) cho dễ
        
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minD) { minD = d; targetQuai = { isPlayer: true, id: id, mesh: rp.mesh }; }
                }
            }
        }
        if (typeof window.danhSachQuaiVat !== 'undefined') {
            window.danhSachQuaiVat.forEach(quai => {
                if (!quai.isDead && quai.mesh) {
                    let hit = window.layHitbox(quai.mesh); let d = viTriGoc.distanceTo(hit.tamNguc);
                    if (d > 0.1 && d < minD) { minD = d; targetQuai = quai; }
                }
            });
        }
        return targetQuai;
    }






    function gaySatThuongLT(tamNo, luongSatThuong, banKinh) {
        if (typeof remotePlayers !== 'undefined') {
            for (let id in remotePlayers) {
                let rp = remotePlayers[id];
                if (rp.status === 'ready' && rp.mesh) {
                    let hit = window.layHitbox(rp.mesh);
                    if (tamNo.distanceTo(hit.tamNguc) <= (banKinh + hit.banKinh)) {
                        let posHienSo = hit.tamNguc.clone(); posHienSo.y += (hit.chieuCao / 2);
                        taoSoSatThuongLT(posHienSo, luongSatThuong, '#ffaa00');
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
                            taoSoSatThuongLT(hit.tamNguc.clone().add(new THREE.Vector3(0, 5, 0)), luongSatThuong, '#ff00ff');
                            if (typeof window.chemTrungBoss === 'function') window.chemTrungBoss(quai.id, luongSatThuong);
                        } else {
                            quai.hp -= luongSatThuong; taoSoSatThuongLT(hit.tamNguc.clone(), luongSatThuong);
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







    

    // 🌟 THÊM BIẾN upV ĐỂ BẺ GÓC VÒNG RING
    function taoSongXungKichLT(viTri, upV, mauSac = 0xff3300, scaleMax = 20) {
        const geo = new THREE.RingGeometry(0.1, 2, 32);
        const mat = new THREE.MeshBasicMaterial({ color: mauSac, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        
        // Nâng lên khỏi mặt đất 0.5m theo trục hành tinh để không bị cắm xuống đất
        mesh.position.copy(viTri).add(upV.clone().multiplyScalar(0.5)); 
        
        // 🌟 ÉP NẰM NGANG ÔM THEO MẶT ĐẤT DỐC
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upV);
        
        scene.add(mesh);
        hieuUngLuyenThe.push({ mesh: mesh, life: 1.0, scaleMax: scaleMax, type: 'shockwave' });
    }








    window.tungComboLuyenThe = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (!nvc && !isRemote) return;


        if (!isRemote) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;
            // 🌟 ĐÓNG DẤU BẢN QUYỀN LUYỆN THỂ
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua('CHIEU' + phim + '_LUYENTHE'); 
        }




        let viTriGoc, upVector;
        const dameGoc = window.DAME_CUA_TOI || 200; // Cận chiến dame tay luôn to hơn 

        if (isRemote) {
            viTriGoc = new THREE.Vector3(remoteGoc.x, remoteGoc.y, remoteGoc.z);
            upVector = viTriGoc.clone().normalize();
        } else {
            viTriGoc = nvc.position.clone();
            upVector = nvc.up.clone().normalize();
        }

        let targetQuai = layQuaiVatGanNhatLT(viTriGoc);
        
        // 🌟 HỆ SỐ CÂN BẰNG TỔNG 2.5
        const dameChiTiet = { 'Q': 0.4, 'E': 0.5, 'R': 0.6, 'F': 1.0 };

        if (phim === 'Q') {
            if (!isRemote && targetQuai) {
                // Lướt tới mục tiêu (Kèm theo upVector để tạo sóng nổ cho đúng)
                hieuUngLuyenThe.push({ type: 'dash', mesh: nvc, target: targetQuai.mesh.position.clone(), speed: 10, dame: dameGoc * dameChiTiet['Q'], upV: upVector });
            } else if (typeof isRemote === 'number' && isRemote > 0) {
                taoSongXungKichLT(viTriGoc, upVector, 0xffaa00, 15);
                if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(viTriGoc, isRemote, 15);
            }
        } 
        else if (phim === 'E' || phim === 'R' || phim === 'F') {
            let vungNo = (phim === 'F') ? 40 : (phim === 'R' ? 25 : 15); 
            let mauNo = (phim === 'F') ? 0xff00ff : (phim === 'R' ? 0xffff00 : 0xff3300);
            
            taoSongXungKichLT(viTriGoc, upVector, mauNo, vungNo); // Gọi nổ theo hình cầu
            
            if (isRemote === false) gaySatThuongLT(viTriGoc, dameGoc * dameChiTiet[phim], vungNo);
            else if (typeof isRemote === 'number' && isRemote > 0) { 
                if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(viTriGoc, isRemote, vungNo); 
            }
        }
    };











    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('phai_luyenthe')) {
        window.HePhaiHienTai = {
            tenPhai: "Luyện Thể",
            khoiTao: function () {
                console.log("💪 Môn Phái Luyện Thể Đã Sẵn Sàng!");
                const vuKhiLoader = new THREE.GLTFLoader();
                if (window.loaderSieuToc) vuKhiLoader.setDRACOLoader(window.loaderSieuToc);

                vuKhiLoader.load(window.WEAPON_URL || 'uploads/anims/BAOTAY.glb', (gltf) => {
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
                        window.vuKhiModel.rotation.set(0, 0, 0);
                        window.vuKhiModel.scale.set(3, 3, 3); 
                    } else {
                        modelNguoi.add(window.vuKhiModel); window.vuKhiModel.position.set(-1, 5, 1);
                    }
                });
            },
            tungChieu: function (phim, isRemote = false, origin = null, target = null, dir = null, casterId = null) { 
                window.tungComboLuyenThe(phim, isRemote, origin, target, dir, casterId); 
            },
            vongLapVatLy: function () {
                for (let i = hieuUngLuyenThe.length - 1; i >= 0; i--) {
                    let hieuUng = hieuUngLuyenThe[i];
                    if (hieuUng.type === 'shockwave') {
                        hieuUng.life -= 0.05;
                        let scaleSize = hieuUng.scaleMax * (1 - hieuUng.life);
                        hieuUng.mesh.scale.set(scaleSize, scaleSize, scaleSize);
                        hieuUng.mesh.material.opacity = hieuUng.life;
                        if (hieuUng.life <= 0) { 
                            // 🌟 QUĂNG SÓNG XUNG KÍCH VÀO LÒ ĐỐT RÁC VRAM
                            if (typeof window.donRac3D === 'function') window.donRac3D(hieuUng.mesh); 
                            hieuUngLuyenThe.splice(i, 1); 
                        }
                    } 
                    else if (hieuUng.type === 'dash') {
                        let khoangCach = hieuUng.mesh.position.distanceTo(hieuUng.target);
                        if (khoangCach > hieuUng.speed) {
                            // BAY CẢ NHÂN VẬT TỚI MỤC TIÊU
                            hieuUng.mesh.position.lerp(hieuUng.target, 0.2); 
                        } else {
                            taoSongXungKichLT(hieuUng.mesh.position, 0xffaa00, 15);
                            gaySatThuongLT(hieuUng.mesh.position, hieuUng.dame, 15); 
                            
                            // 🌟 KHÔNG ĐỐT RÁC Ở ĐÂY VÌ ĐÂY LÀ NHÂN VẬT (Chỉ xóa khỏi mảng để dừng lướt)
                            hieuUngLuyenThe.splice(i, 1);
                        }
                    }
                }

                for (let i = danhSachSoBayLT.length - 1; i >= 0; i--) {
                    let item = danhSachSoBayLT[i];
                    item.offsetY += 0.05; item.life--;
                    const screenPos = item.pos.clone(); screenPos.y += item.offsetY; screenPos.project(camera);
                    if (screenPos.z < 1) {
                        item.el.style.left = `${(screenPos.x * 0.5 + 0.5) * window.innerWidth}px`;
                        item.el.style.top = `${(screenPos.y * -0.5 + 0.5) * window.innerHeight}px`;
                    } else { item.el.style.display = 'none'; }



                    if (item.life < 20) item.el.style.opacity = item.life / 20;
                    if (item.life <= 0) { item.el.remove(); danhSachSoBayLT.splice(i, 1); window.tongSoChuNoi_LT--; } // 🌟 Xả van



                }

                if (window.playerModel && typeof window.danhSachQuaiVat !== 'undefined') {
                    window.danhSachQuaiVat.forEach(quai => {
                        if (!quai.isDead && quai.mesh && quai.mesh.position.distanceTo(window.playerModel.position) < 15) {
                            quai.mesh.lookAt(window.playerModel.position);
                            if (!quai.dangCan && Math.random() < 0.015) {
                                quai.dangCan = true; 
                                if (typeof quai.playAnim === 'function') quai.playAnim('ATTACK'); 
                                if (!window.isDead && typeof window.mauBanThan !== 'undefined') {
                                    window.mauBanThan -= 150; 
                                    taoSoSatThuongLT(window.playerModel.position.clone().add(new THREE.Vector3(0,5,0)), 150, '#f1c40f');
                                    const uiThanhMau = document.getElementById('thanhMauHienTai'); 
                                    const uiSoMau = document.getElementById('soMauHienTai');
                                    if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
                                    if (uiSoMau) uiSoMau.innerText = Math.max(0, window.mauBanThan).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
                                    if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') window.xuLyCaiChetNhanVat(quai.name || "Quái Vật Luyện Thể");
                                }
                                setTimeout(() => { quai.dangCan = false; }, 1000);
                            }
                        }
                    });
                }
            },
            capNhat: function () {} 
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
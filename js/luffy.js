// ==========================================
// 🍖 HỆ THỐNG ĐOẠT XÁ: LUFFY (TRÁI GOMU GOMU)
// 👑 PHIÊN BẢN: ĐIỀU KHIỂN XƯƠNG GIGA (BẢN FIX TÊN OBJECT)
// ==========================================

(function () {
    const kyNangLuffy = [];
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 4000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    // ==========================================
    // ✨ TUNG CHIÊU LUFFY
    // ==========================================
    window.tungComboLuffy = function(phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        // 🌟 KIỂM TRA ĐỒNG HỒ & GẮN UI
        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;
            
            // Xử lý UI Đồng hồ (Lược giản để tập trung vào logic 3D)
            let nutKyNang = document.getElementById('btn' + phim.toUpperCase()) || document.getElementById('skill' + phim.toUpperCase());
            if (nutKyNang) {
                nutKyNang.style.pointerEvents = 'none'; nutKyNang.style.filter = 'brightness(0.4) grayscale(100%)';
                setTimeout(() => { nutKyNang.style.filter = ''; nutKyNang.style.pointerEvents = ''; }, THOI_GIAN_HOI[phim]);
            }
        }

        // Bắn sóng mạng
        if (!isRemote && window.room && window.room.localParticipant) {
            let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                type: 'TUNG_CHIEU', skillType: phim, className: 'Luffy', 
                origin: {x: nvc.position.x, y: nvc.position.y, z: nvc.position.z}, target: {x: 0, y: 0, z: 0}, dir: {x: huongMat.x, y: huongMat.y, z: huongMat.z}, weaponUrl: ""
            })), { reliable: true });
        }

        let fwd = new THREE.Vector3(); nvc.getWorldDirection(fwd);
        
        // =====================================
        // 👊 CHIÊU Q: GOMU GOMU NO PISTOL (KÉO GIÃN XƯƠNG TAY PHẢI BÌNH THƯỜNG)
        // =====================================
        if (phim === 'Q') {
            if (typeof window.playAnim === 'function') window.playAnim('ATTACK1');

            let xuongTay = null;
            nvc.traverse(c => {
                // Lấy xương cẳng tay hoặc bàn tay phải bình thường
                if (c.isBone && c.name === 'RArm_Fore_0101') {
                    xuongTay = c;
                }
            });

            if (xuongTay) {
                let scaleGoc = xuongTay.scale.clone();
                let posGoc = xuongTay.position.clone();

                // 1. Phóng to nắm đấm lên 4 lần
                xuongTay.scale.set(4, 4, 4);
                // Kéo dài ra trước. Model này hình như trục Y là chiều dài cánh tay.
                xuongTay.translateY(30); 

                // 2. Giật ngược lại sau 0.4s
                setTimeout(() => {
                    xuongTay.scale.copy(scaleGoc);
                    xuongTay.position.copy(posGoc);
                }, 400);
            }
        }

        // =====================================
        // 🐘 CHIÊU R: GEAR 3 - ELEPHANT GUN (MỞ KHÓA TAY KHỔNG LỒ)
        // =====================================
        else if (phim === 'R') {
            if (typeof window.playAnim === 'function') window.playAnim('ATTACK3');

            // 1. Phóng to xương GIGA (Khổng lồ) lên, thu nhỏ xương Thường lại
            nvc.traverse(c => {
                if (c.isBone) {
                    let ten = c.name;
                    // Bật cánh tay khổng lồ (Giga)
                    if (ten.includes('arm_giga') || ten.includes('arm_ele')) {
                        c.scale.set(1, 1, 1); // Trả về kích thước thật
                    }
                    // Giấu cánh tay bình thường đi (Thu nhỏ = 0)
                    if (ten === 'RArm_Upper_091' || ten === 'LArm_Upper_069') {
                        c.scale.set(0.001, 0.001, 0.001); 
                    }
                }
            });

            // 2. Trả lại như cũ sau 2 giây (Khi múa xong chiêu)
            setTimeout(() => {
                nvc.traverse(c => {
                    if (c.isBone) {
                        let ten = c.name;
                        if (ten.includes('arm_giga') || ten.includes('arm_ele')) {
                            c.scale.set(0.001, 0.001, 0.001); // Giấu tay to
                        }
                        if (ten === 'RArm_Upper_091' || ten === 'LArm_Upper_069') {
                            c.scale.set(1, 1, 1); // Bật tay thường
                        }
                    }
                });
            }, 2000);
        }

        // =====================================
        // 🥊 CHIÊU E: GATLING GUN (COPY BÀN TAY NÉM ĐI NHƯ MƯA)
        // =====================================
        else if (phim === 'E') {
            if (typeof window.playAnim === 'function') window.playAnim('ATTACK4');

            // Lấy đại 1 cục thịt bàn tay để làm đạn
            let tayMau = null;
            nvc.traverse(c => {
                // Object_33 hoặc 34 thường là chi tiết bàn tay hoặc ngón tay
                if (c.isMesh && (c.name === 'Object_32' || c.name === 'Object_33')) {
                    if(!tayMau) tayMau = c; 
                }
            });

            if (tayMau) {
                for(let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        let tayClone = tayMau.clone();
                        tayClone.visible = true; 
                        tayClone.scale.set(15, 15, 15); // Phóng to chà bá
                        
                        let posSpawn = nvc.position.clone().add(new THREE.Vector3(0, 15, 0));
                        let offset = new THREE.Vector3((Math.random()-0.5)*15, (Math.random()-0.5)*15, 0);
                        posSpawn.add(offset);
                        tayClone.position.copy(posSpawn);
                        
                        let targetBay = posSpawn.clone().add(fwd.clone().multiplyScalar(40)); 
                        tayClone.lookAt(targetBay);
                        scene.add(tayClone);

                        kyNangLuffy.push({ 
                            mesh: tayClone, type: 'E_GATLING', speed: 3.0, life: 15, 
                            targetPos: targetBay, isRemote: isRemote 
                        });
                    }, i * 50); // Bắn liên thanh
                }
            }
        }
    };

    // ==========================================
    // ⚙️ VÒNG LẶP VẬT LÝ LUFFY
    // ==========================================
    window.updateCombatLuffy = function () {
        for (let i = kyNangLuffy.length - 1; i >= 0; i--) {
            let s = kyNangLuffy[i]; 
            if (s.type === 'E_GATLING') {
                s.life--;
                s.mesh.translateZ(s.speed); 
                
                if (s.life <= 0) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                    kyNangLuffy.splice(i, 1);
                }
            }
        }
    };
    setInterval(window.updateCombatLuffy, 30);

    // ==========================================
    // 🌟 KHỞI TẠO TỪ ĐIỂN VÀ XỬ LÝ MODEL MẶC ĐỊNH
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('luffy')) {
        window.HePhaiHienTai = {
            tenPhai: "Thuyền Trưởng Luffy",
            khoiTao: function () {
                console.log("⚓ Khởi tạo Luffy Haki!");
                // 🛑 GIẤU CÁC CÁNH TAY KHỔNG LỒ LÚC VỪA VÀO GAME
                setTimeout(() => {
                    let nvc = window.playerModel;
                    if (nvc) {
                        nvc.traverse(c => {
                            if (c.isBone) {
                                // Thu nhỏ các xương có chữ Giga hoặc Ele (Elephant) thành hạt cát
                                if (c.name.includes('arm_giga') || c.name.includes('arm_ele') || c.name.includes('palm_ele')) {
                                    c.scale.set(0.001, 0.001, 0.001);
                                }
                            }
                        });
                    }
                }, 2000); // Đợi load xong model rồi mới giấu

                // Chuẩn hóa Animation
                if (window.animationsMap) {
                    let animNhanRoiDiBo = null; let animNhanRoiCuoiThu = null;
                    for (let key in window.animationsMap) {
                        let k = key.toUpperCase();
                        if (k.includes('NHANROI1')) animNhanRoiDiBo = window.animationsMap[key];
                        else if (k.includes('NHANROI') && !k.includes('NHANROI1')) animNhanRoiCuoiThu = window.animationsMap[key];
                        if (k.includes('CHAYBO') || k.includes('RUN') || k.includes('WALK')) window.animationsMap['CHAYBO'] = window.animationsMap[key];
                        if (k.includes('BAY') || k.includes('FLY')) window.animationsMap['BAY'] = window.animationsMap[key];
                    }
                    if (animNhanRoiDiBo) window.animationsMap['NHANROI'] = animNhanRoiDiBo;
                    if (animNhanRoiCuoiThu && window.animationsMapChar) window.animationsMapChar['NHANROI'] = animNhanRoiCuoiThu;
                }
            },
            tungChieu: window.tungComboLuffy,
            capNhat: function () {}
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
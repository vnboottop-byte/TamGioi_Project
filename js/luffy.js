// ==========================================
// 🍖 HỆ THỐNG ĐOẠT XÁ: LUFFY (TRÁI GOMU GOMU)
// 👑 TÍNH NĂNG: BẺ XƯƠNG CAO SU & ẢO THUẬT TÀNG HÌNH THỊT
// ==========================================

(function () {
    const kyNangLuffy = [];
    const THOI_GIAN_HOI = { 'Q': 1500, 'E': 4000, 'R': 8000, 'F': 15000 };
    const choHoiChieu = { 'Q': 0, 'E': 0, 'R': 0, 'F': 0 };

    // 🌟 MÁY QUÉT X-QUANG ĐỂ SẾP ĐỌC TÊN THỊT & XƯƠNG
    window.daQuetLuffy = false;
    function quetCoTheLuffy(nvc) {
        if (window.daQuetLuffy) return;
        console.log("========================================");
        console.log("🍖 MÁY QUÉT X-QUANG LUFFY KHỞI ĐỘNG 🍖");

        nvc.traverse(c => {
            if (c.isMesh) {
                console.log("🥩 Lớp Thịt (Mesh):", c.name);
                // Mặc định giấu hết mấy cái tay khổng lồ lúc vừa vào game
                let ten = c.name.toLowerCase();
                if (ten.includes('giant') || ten.includes('big') || ten.includes('angry')) {
                    c.visible = false;
                }
            }
            if (c.isBone) {
                console.log("🦴 Khớp Xương (Bone):", c.name);
            }
        });
        console.log("========================================");
        window.daQuetLuffy = true;
    }

    // ==========================================
    // ✨ TUNG CHIÊU LUFFY
    // ==========================================
    window.tungComboLuffy = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        if (isRemote && casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
            nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
        }
        if (!nvc) return;

        // Quét cơ thể vào lần vung tay đầu tiên
        if (!isRemote) quetCoTheLuffy(nvc);

        // 🌟 KIỂM TRA ĐỒNG HỒ & GẮN UI
        if (isRemote === false) {
            let bayGio = Date.now();
            if (bayGio - choHoiChieu[phim] < THOI_GIAN_HOI[phim]) return;
            choHoiChieu[phim] = bayGio;
            // ... (Phần code UI đồng hồ giống Katakuri, tôi rút gọn cho dễ nhìn) ...
        }

        // Bắn sóng mạng
        if (!isRemote && window.room && window.room.localParticipant) {
            let huongMat = new THREE.Vector3(); nvc.getWorldDirection(huongMat); huongMat.normalize();
            window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                type: 'TUNG_CHIEU', skillType: phim, className: 'Luffy',
                origin: { x: nvc.position.x, y: nvc.position.y, z: nvc.position.z }, target: { x: 0, y: 0, z: 0 }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
            })), { reliable: true });
        }

        let fwd = new THREE.Vector3(); nvc.getWorldDirection(fwd);

        // =====================================
        // 👊 CHIÊU Q: GOMU GOMU NO PISTOL (KÉO GIÃN XƯƠNG)
        // =====================================
        if (phim === 'Q') {
            if (typeof window.playAnim === 'function') window.playAnim('ATTACK1');

            let xuongTay = null;
            nvc.traverse(c => {
                // Tự động tìm xương tay phải (Hand_R, RightHand...)
                if (c.isBone && (c.name.includes('Hand_R') || c.name.includes('RightHand') || c.name.toLowerCase().includes('handr'))) {
                    xuongTay = c;
                }
            });

            if (xuongTay) {
                let scaleGoc = xuongTay.scale.clone();
                let posGoc = xuongTay.position.clone();

                // 1. Kéo giãn và phóng to nắm đấm lên 3 lần
                xuongTay.scale.set(3, 3, 3);
                xuongTay.translateY(15); // Vươn dài ra trước (Tùy model có thể là Z hoặc X)

                // 2. Giật ngược lại sau 0.4s
                setTimeout(() => {
                    xuongTay.scale.copy(scaleGoc);
                    xuongTay.position.copy(posGoc);
                }, 400);
            }
        }

        // =====================================
        // 🐘 CHIÊU R: GEAR 3 - ELEPHANT GUN (BẬT TẮT THỊT)
        // =====================================
        else if (phim === 'R') {
            if (typeof window.playAnim === 'function') window.playAnim('ATTACK3');

            // 1. Tàng hình tay nhỏ, Bật tay Khổng Lồ
            nvc.traverse(c => {
                if (c.isMesh) {
                    let ten = c.name.toLowerCase();
                    if (ten.includes('normal') || ten.includes('base')) c.visible = false;
                    if (ten.includes('giant') || ten.includes('big')) c.visible = true;
                }
            });

            // 2. Ảo thuật: 1.5 giây sau xì hơi về lại tay nhỏ
            setTimeout(() => {
                nvc.traverse(c => {
                    if (c.isMesh) {
                        let ten = c.name.toLowerCase();
                        if (ten.includes('normal') || ten.includes('base')) c.visible = true;
                        if (ten.includes('giant') || ten.includes('big')) c.visible = false;
                    }
                });
            }, 1500);
        }

        // =====================================
        // 🥊 CHIÊU E: GATLING GUN (PHƯƠNG ÁN COPY TAY KATAKURI)
        // =====================================
        else if (phim === 'E') {
            if (typeof window.playAnim === 'function') window.playAnim('ATTACK4');

            // 1. Tìm lấy hình mẫu cái tay (Mesh)
            let tayMau = null;
            nvc.traverse(c => {
                if (c.isMesh && (c.name.toLowerCase().includes('hand') || c.name.toLowerCase().includes('arm'))) {
                    if (!tayMau) tayMau = c; // Lấy cục thịt tay đầu tiên tìm thấy
                }
            });

            // 2. Bắn liên thanh 10 cái tay ra phía trước
            if (tayMau) {
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        let tayClone = tayMau.clone();
                        tayClone.visible = true;
                        tayClone.scale.set(3, 3, 3); // Phóng to bàn tay lên

                        // Đặt vị trí trước mặt Luffy, hơi lệch ngẫu nhiên để giống đấm loạn đả
                        let posSpawn = nvc.position.clone().add(new THREE.Vector3(0, 1, 0));
                        let offset = new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0);
                        posSpawn.add(offset);

                        tayClone.position.copy(posSpawn);

                        let targetBay = posSpawn.clone().add(fwd.clone().multiplyScalar(20)); // Bay tới 20m
                        tayClone.lookAt(targetBay);
                        scene.add(tayClone);

                        kyNangLuffy.push({
                            mesh: tayClone, type: 'E_GATLING', speed: 1.5, life: 20,
                            targetPos: targetBay, isRemote: isRemote
                        });
                    }, i * 50); // Cách nhau 50ms bắn 1 phát
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
                s.mesh.translateZ(s.speed); // Đấm thẳng tới trước

                if (s.life <= 0) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh); else scene.remove(s.mesh);
                    kyNangLuffy.splice(i, 1);
                }
            }
        }
    };
    setInterval(window.updateCombatLuffy, 30);

    // ==========================================
    // 🌟 KHỞI TẠO TỪ ĐIỂN
    // ==========================================
    if (window.SCRIPT_PHAI_CUA_TOI && window.SCRIPT_PHAI_CUA_TOI.includes('luffy')) {
        window.HePhaiHienTai = {
            tenPhai: "Thuyền Trưởng Luffy",
            khoiTao: function () {
                console.log("⚓ Gomu Gomu no... Đã Sẵn Sàng!");
                // Chuẩn hóa Animation (Giống Katakuri)
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
            capNhat: function () { }
        };
        window.HePhaiHienTai.khoiTao();
    }
})();
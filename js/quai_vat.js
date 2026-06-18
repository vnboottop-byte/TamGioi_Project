// ==========================================
// 👹 MODULE: HỆ THỐNG BOSS TỐI THƯỢNG (BẢN V62 - FIX GÓC -Y BLENDER & TỌA ĐỘ MỒM RỒNG)
// ==========================================
console.log("🟢 Khởi động Module Boss V62 - Đã bù trừ góc -Y và Fix Tọa Độ Mồm Rồng!");

// ==========================================
// 📚 TỪ ĐIỂN AI BÁCH THÚ (BỘ NÃO TRUNG TÂM)
// ==========================================

window.TU_DIEN_AI_QUAI = window.TU_DIEN_AI_QUAI || {};

// 1. TẠO VỎ BỌC AN TOÀN TRƯỚC (CHỐNG GHI ĐÈ FILE CHIM_CA VÀ RONG)
window.TU_DIEN_AI_QUAI['CHIM'] = window.TU_DIEN_AI_QUAI['CHIM'] || {};
window.TU_DIEN_AI_QUAI['CA'] = window.TU_DIEN_AI_QUAI['CA'] || {};
window.TU_DIEN_AI_QUAI['RONG'] = window.TU_DIEN_AI_QUAI['RONG'] || {};

// 2. BƠM CHỈ SỐ BẰNG OBJECT.ASSIGN ĐỂ BẢO TOÀN HÀM TẤN CÔNG
Object.assign(window.TU_DIEN_AI_QUAI['CHIM'], {
    he: 'BAY',
    getTamDanh: (scale) => Math.max(3.0, (scale || 1) * 4.0),
    getTamNhin: (scale) => Math.max(50, (scale || 1) * 60),
    getGioiHanLanhTho: (tamNhin, scale) => Math.max(100, Math.min(3000, tamNhin * 1.5)),
    khoangCachAnToan: 5.0, 
    banKinhTuanTra: (scale) => Math.max(20, scale * 30),
    doCaoBay: 25,
    lucNghieng: 0.15,
    getChieuCaoNgam: () => 1.5, 
    getTocDoRuot: (scale) => Math.max(15.0, scale * 15.0),
    choPhepLuiBinh: true
});

// CÁ xài chung não với CHIM NHƯNG BƠI ĐÙ ĐỜ VÀ CHẬM HƠN
Object.assign(window.TU_DIEN_AI_QUAI['CA'], window.TU_DIEN_AI_QUAI['CHIM'], {
    getTocDoRuot: (scale) => Math.max(5.0, scale * 5.0), // 🐌 Cá bơi tốc độ 5
    lucNghieng: 0.05 // Cá lượn lờ ít nghiêng
});

// 🐲 BỘ NÃO RỒNG (ĐÃ CẮT GÂN TẦM ĐÁNH TỪ 400m XUỐNG 80m)
window.TU_DIEN_AI_QUAI['RONG'] = {
    he: 'BAY',
    getTamDanh: (scale) => Math.min(80, (scale * 5) + 40),
    getTamNhin: (scale) => Math.min(150, (scale * 10) + 80),
    getGioiHanLanhTho: (tamNhin, scale) => Math.max(100, Math.min(1000, (tamNhin * 1.5))),
    khoangCachAnToan: 12.0,
    banKinhTuanTra: (scale) => Math.max(20, scale * 80),
    doCaoBay: 60,
    lucNghieng: 0.03,
    getChieuCaoNgam: () => 35,
    getTocDoRuot: (scale) => Math.max(15.0, scale * 15.0),
    choPhepLuiBinh: false
};

// 🐋 BỘ NÃO SINH VẬT CẢNH (BAY LƯỢN TỰ DO, KHÔNG ĐÁNH NHAU)
window.TU_DIEN_AI_QUAI['TRANG_TRI'] = {
    he: 'BAY',
    getTamDanh: () => 0, // Không đánh ai
    getTamNhin: () => 0, // Mù với thế sự
    getGioiHanLanhTho: () => 999999, // Đi muôn nơi không giới hạn
    khoangCachAnToan: 0,
    banKinhTuanTra: () => 0, // Sẽ dùng thuật toán Waypoint riêng
    doCaoBayMin: 20, // Cao tối thiểu 20m
    doCaoBayMax: 100, // Cao tối đa 100m
    lucNghieng: 0.2, // Độ nghiêng khi ôm cua
    choPhepLuiBinh: false
};

// 🥊 BỘ NÃO LUYỆN THỂ & CẬN CHIẾN (CHẠY ĐẾN ÁP SÁT ĐẤM TÉT MÁU PHẠM VI GẦN)
window.TU_DIEN_AI_QUAI['LUYEN_THE'] = {
    he: 'BO',
    getTamDanh: () => 12, // Ép chạy vào sát nách 12 mét mới được đấm
    getTamNhin: () => 300,
    getGioiHanLanhTho: () => 450,
    khoangCachAnToan: 2,
    choPhepLuiBinh: false,
    thucHienTanCong: function (quai, playerModel, delta) {
        if (Date.now() - (quai.lastAttackTime || 0) > 1500) {
            quai.lastAttackTime = Date.now();
            
            // Kích hoạt hoạt ảnh đấm đá cận chiến ngẫu nhiên có sẵn trong model
            if (typeof quai.playAnim === 'function') {
                let danhSachDon = Object.keys(quai.anims).filter(k => /attack|punch|kick|combo/i.test(k));
                let chieuChon = danhSachDon.length > 0 ? danhSachDon[Math.floor(Math.random() * danhSachDon.length)] : 'ATTACK';
                quai.playAnim(chieuChon);
            }

            let dmgBoss = 20 * (quai.level || 1);
            let bOrigin = quai.mesh.position.clone();
            let pTarget = playerModel.position.clone();
            let bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize();
            // 🌟 BẢN VÁ: ĐẨY NÒNG SÚNG RA KHỎI BỤNG BOSS (CHỐNG TỰ SÁT)
                        let kcDenSep = bOrigin.distanceTo(pTarget);
                        let sizeBoss = quai.heSoToLon || 1;
                        // Đẩy nòng súng ra ngoài 10m (hoặc tùy size Boss), nhưng không đẩy lố qua mặt Sếp
                        let pushDist = Math.min(Math.max(10, sizeBoss * 8), kcDenSep * 0.8); 
                        bOrigin.add(bDir.clone().multiplyScalar(pushDist));

            // Mượn hiệu ứng vạt cào tóe máu đỏ của hệ Chim/Cá để diễn hoạt chấn lực đấm
            if (typeof window.tungComboChimCa === 'function') {
                window.tungComboChimCa('CAN_CHIEN', dmgBoss, bOrigin, pTarget, bDir, quai.id, null, true);
            }

            if (!window.IS_IN_SAFE_ZONE) {
                // 🛑 ĐÃ LỘT BỎ ÁO GIÁP ADMIN CHO BOSS LUYỆN THỂ
                if (true) {
                    window.mauBanThan -= Math.round(dmgBoss);
                    if (typeof window.taoSoSatThuong === 'function') window.taoSoSatThuong(playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), Math.round(dmgBoss));

                    const uiThanhMau = document.getElementById('thanhMauHienTai');
                    const uiSoMau = document.getElementById('soMauHienTai');
                    if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
                    if (uiSoMau) uiSoMau.innerText = Math.max(0, Math.round(window.mauBanThan)).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";

                    if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') window.xuLyCaiChetNhanVat("Bị Quái Vật Luyện Thể Đấm Chết");
                }
            }
            if (window.room && window.room.state === 'connected') {
                try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'BOSS_SKILL', bossId: quai.id, target: { x: pTarget.x, y: pTarget.y, z: pTarget.z }, phai: 'CHIM', chieu: 'CAN_CHIEN', dmg: dmgBoss })), { reliable: true }); } catch (e) { }
            }
        }
    }
};
window.TU_DIEN_AI_QUAI['CAN_CHIEN'] = window.TU_DIEN_AI_QUAI['LUYEN_THE'];









window.danhSachQuaiVat = window.danhSachQuaiVat || [];
window.bossSkills = window.bossSkills || [];
window.danhSachQuaiVatDangTai = window.danhSachQuaiVatDangTai || {};



    function thucHienCaiChetCuaBoss(boss, isServerConfirmed = false) {
    // 1. CHỈ CHẠY ANIMATION CHẾT 1 LẦN DỰA THEO CLIENT (Cho game mượt)
    if (!boss.isDeadVisual) {
        boss.isDeadVisual = true; 
        boss.isDead = true; // 🌟 BẢN VÁ: Khóa mõm AI ngay lập tức, cấm gọi lệnh chạy nhảy!
        boss.hp = 0; 
        boss.state = 'DEAD';
        boss.mesh.userData.ignore = true; 

        if (typeof boss.playAnim === 'function') boss.playAnim('DIE');
        if (boss.tagEl) {
            boss.tagEl.style.display = 'none';
        }
    }

    // 2. CHỈ NHẬN EXP VÀ ĐỒ KHI SERVER ĐÃ CHỐT SỔ TỬ! (isServerConfirmed = true)
    if (isServerConfirmed && !boss.daNhanExp) {
        boss.daNhanExp = true;      // Đóng dấu xác nhận đã nhận quà

        let bossLevel = boss.level || 1;
        let expNhanDuoc = bossLevel * 20;
        if (typeof window.congKinhNghiem === 'function') {
            window.congKinhNghiem(expNhanDuoc, bossLevel);
        }

        if (typeof window.taoHieuUngLootVang === 'function') {
            // 🌟 ĐÃ NỐI DÂY CHUẨN XÁC: Gọi Server nhả đồ sau khi nó đã biết Boss chết!
            window.taoHieuUngLootVang(boss.mesh.position, boss.id);
        }

        // Dọn xác sau 3 giây kể từ khi chốt sổ
        setTimeout(() => {
            window.danhSachQuaiVat = window.danhSachQuaiVat.filter(q => q.id !== boss.id);
            if (boss.mesh) {
                scene.remove(boss.mesh);
                if (typeof window.donRac3D === 'function') window.donRac3D(boss.mesh);
            }
            if (boss.tagEl && boss.tagEl.parentNode) {
                boss.tagEl.parentNode.removeChild(boss.tagEl);
            }
        }, 3000);
    }
}






window.dameGomChoBoss = window.dameGomChoBoss || {};
window.bossSyncTimer = window.bossSyncTimer || {};


window.chemTrungBoss = function (bossId, dame) {
    let boss = window.danhSachQuaiVat.find(q => q.id == bossId);
    
    // Nếu boss không tồn tại hoặc đã bú xong EXP/Đồ thì tha cho nó
    if (!boss || boss.daNhanExp) return;

    boss.hp -= dame; if (boss.hp < 0) boss.hp = 0;
    if (boss.tagEl) { let bar = boss.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%'; }

    // Chết tức thì phần NHÌN (Dự đoán Client - isServerConfirmed = false)
    if (boss.hp <= 0) thucHienCaiChetCuaBoss(boss, false);
    else if (typeof boss.playAnim === 'function' && boss.state !== 'ATTACK') boss.playAnim('HIT');

    window.dameGomChoBoss[bossId] = (window.dameGomChoBoss[bossId] || 0) + dame;

    if (!window.bossSyncTimer[bossId]) {
        window.bossSyncTimer[bossId] = setTimeout(() => {
            let dmgThucTe = window.dameGomChoBoss[bossId];

            if (window.room && window.room.state === 'connected') {
                try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'BOSS_HIT', id: bossId, damageDealt: dmgThucTe })), { reliable: false }); } catch (e) { }
            }

            let fd = new FormData(); fd.append('boss_id', bossId); fd.append('damage', dmgThucTe);

            fetch('api/danh_boss.php', { method: 'POST', body: fd }).then(res => res.json()).then(data => {
                if (data.status === 'success') { 
                    boss.hp = data.hp;  
                    // 🌟 MẤU CHỐT LÀ ĐÂY: Báo cho Client biết Server đã duyệt tử hình (isServerConfirmed = true)
                    if (boss.hp <= 0) thucHienCaiChetCuaBoss(boss, true); 
                } else if (data.status === 'dead') {
                    thucHienCaiChetCuaBoss(boss, true);
                }
            }).catch(e => { });

            window.dameGomChoBoss[bossId] = 0;
            window.bossSyncTimer[bossId] = null;
        }, 1000);
    }
};




window.sinhRaQuaiVat = function (x, z, tenQuai, level, hpMax, scaleSize, posY, isBoss = true, bossId = null, modelUrl = null, hpCurrent = null, respawnInSec = 0, classCode = 'TU_TIEN') {
    const id = bossId || ('B_' + Date.now());

    

    if (window.danhSachQuaiVatDangTai[id]) return;
    if (window.danhSachQuaiVat.find(q => q.id == id)) return;
    window.danhSachQuaiVatDangTai[id] = true;

    const modelFile = modelUrl || 'uploads/anims/mimi_3d.glb';
    if (typeof window.taiHoacNhanBanAsset !== 'function') { delete window.danhSachQuaiVatDangTai[id]; return; }

    window.taiHoacNhanBanAsset(modelFile, function (quai, gltfAnimations) {
        delete window.danhSachQuaiVatDangTai[id];
        if (window.danhSachQuaiVat.find(q => q.id == id)) return;




        // 🌟 BẢN VÁ AAA: Ép quái vật dùng thước đo tàng hình của Engine để chống bệnh Khổng Lồ!
        if (typeof window.chuanHoaKichThuoc === 'function') {
            window.chuanHoaKichThuoc(quai, scaleSize);
        } else {
            quai.scale.set(scaleSize, scaleSize, scaleSize);
        }




        const BAN_KINH_ONG = 20000;
        let anToanX = Math.max(-BAN_KINH_ONG + 1, Math.min(BAN_KINH_ONG - 1, x));
        let yChuan = posY || -Math.sqrt(BAN_KINH_ONG * BAN_KINH_ONG - anToanX * anToanX);





        quai.position.set(x, yChuan, z);
        
        // 🌟 BẢN VÁ AAA: TỐI ƯU HÓA TÀI NGUYÊN CHO SINH VẬT CẢNH
        let laTrangTri = (classCode === 'TRANG_TRI');

        quai.traverse(c => {
            if (c.isMesh) { 
                c.frustumCulled = false; 
                
                if (laTrangTri) {
                    // 1. Cắt Đổ Bóng (Tiết kiệm 30% GPU)
                    c.castShadow = false; 
                    c.receiveShadow = false;
                    // 2. Chặn Máy Quét Chuột (Tiết kiệm CPU Core 1)
                    c.raycast = function() {}; 
                    
                    // 3. Ép vật liệu Basic trên Mobile (Bỏ tính toán bóng bẩy)
                    if (window.isMobile && c.material) {
                        let mats = Array.isArray(c.material) ? c.material : [c.material];
                        let newMats = mats.map(mat => {
                            let basicMat = new THREE.MeshBasicMaterial({
                                map: mat.map,
                                color: mat.color || 0xffffff,
                                transparent: mat.transparent,
                                opacity: mat.opacity,
                                side: mat.side || THREE.FrontSide
                            });
                            if (c.isSkinnedMesh) basicMat.skinning = true; // Chìa khóa để vây cá voi vẫn vẫy
                            return basicMat;
                        });
                        c.material = newMats.length === 1 ? newMats[0] : newMats;
                    }
                } else {
                    c.castShadow = true; 
                }
            }
        });
        // 4. Báo cho hệ thống đánh nhau bỏ qua cục thịt này
        if (laTrangTri) quai.userData = { ignore: true };
        if (typeof scene !== 'undefined') scene.add(quai);
        const mixer = new THREE.AnimationMixer(quai);
        const anims = {};
        if (gltfAnimations) { gltfAnimations.forEach(clip => { anims[clip.name.toUpperCase()] = mixer.clipAction(clip); }); }

        const tag = document.createElement('div');
        const mauHienTai = (hpCurrent !== null) ? hpCurrent : hpMax;
        // 🌟 BẢN VÁ: Cảm biến tự động thu nhỏ font chữ và thanh máu
        let sizeChu = window.isMobile ? "9px" : "12px";
        let widthMau = window.isMobile ? "40px" : "60px";
        // 👑 ĐẶC QUYỀN ADMIN: Mắt thần soi ID Boss
        let chuoiIDAdmin = "";
        let roleAuth = (window.ROLE || "").toLowerCase();
        let nameAuth = (window.ADMIN_NAME || window.myUsername || "").toLowerCase();
        if (roleAuth === "admin" || nameAuth === "admin") {
            chuoiIDAdmin = `<div style="color:#00ffcc; font-size:10px; margin-bottom:2px; text-shadow:1px 1px 0 #000;">[ID: ${id}]</div>`;
        }
        tag.innerHTML = `
            <div style="color:#ff0000; font-weight:bold; font-size:${sizeChu}; text-shadow:1px 1px 0 #000; text-align:center; white-space:nowrap;">
                ${chuoiIDAdmin}
                <span style="color:#f1c40f;">[Lv.${level}]</span> 👑 ${tenQuai}
            </div>
            <div style="width:${widthMau}; height:4px; background:rgba(0,0,0,0.5); border:1px solid #fff; border-radius:2px; margin:2px auto 0 auto;">
                <div class="hp-bar" style="width:${(mauHienTai / hpMax) * 100}%; height:100%; background:#2ecc71; transition: width 0.2s;"></div>
            </div>`;
        tag.style.cssText = 'position:absolute; pointer-events:none; z-index:10; transform:translate(-50%, -100%); display:none;';
        document.body.appendChild(tag);

        const info = {
            id: id, classCode: classCode, level: level, isBoss: isBoss, mesh: quai, mixer: mixer, anims: anims, tagEl: tag,
            maxHp: hpMax, hp: mauHienTai, isDead: (mauHienTai <= 0), spawnX: x, spawnZ: z, state: 'IDLE', lastAttackTime: 0, currentAnimName: '',
            modelFile: modelFile, // 🌟 BẢN VÁ: Lưu vết file đẻ quái để trích xuất tên kịch bản đoạt xá động
            playAnim: function (ten) {
                let theLoaiCanTim = ten.toUpperCase();
                if (this.currentAnimName === theLoaiCanTim) return;

                let danhSachTenGoc = Object.keys(this.anims);
                if (danhSachTenGoc.length === 0) return;

                let tenTrungKhop = null;

                if (danhSachTenGoc.length === 1) {
                    tenTrungKhop = danhSachTenGoc[0];
                }
                else {
                    tenTrungKhop = danhSachTenGoc.find(n => n === theLoaiCanTim);
                    // ==========================================
                    // 🌟 BẢN VÁ AAA: MA TRẬN DỰ PHÒNG (FALLBACK) CHO QUÁI VẬT NHÀ NGHÈO
                    // ==========================================
                    if (!tenTrungKhop) {
                        // 1. 🌟 MÁY QUÉT MỚI: GOM VÀO RỔ VÀ BỐC THĂM RANDOM ĐỂ ĐA DẠNG CHIÊU THỨC
                        let animChayBay = danhSachTenGoc.find(n => /move f|swim|fly|run|chaybo|walk|chase|circling|bay|chạy|dibo|move|fall/i.test(n));
                        let animChet = danhSachTenGoc.find(n => /death|die|dead|drop|chet/i.test(n));

                        // Gom tất cả hoạt ảnh NGHỈ NGƠI vào rổ rồi bốc thăm
                        let roDungIm = danhSachTenGoc.filter(n => /surface|idle|wait|rest|stand|nghỉ|nhanroi/i.test(n));
                        let animDungIm = roDungIm.length > 0 ? roDungIm[Math.floor(Math.random() * roDungIm.length)] : null;

                        // Gom tất cả hoạt ảnh TẤN CÔNG (từ 1 đến 10) vào rổ rồi bốc thăm
                        let roDanh = danhSachTenGoc.filter(n => /attack|bite|breath|fire|strike|magic|skill|cạp|đánh|phun|chieuq|chieue|chieur|chieuf|tancong/i.test(n));
                        let animDanh = roDanh.length > 0 ? roDanh[Math.floor(Math.random() * roDanh.length)] : null;

                        // 2. Thuật toán bù trừ chéo (Thay thế mấy cái index cứng ngắc [1], [2] dễ gây Crash)
                        if (theLoaiCanTim === 'IDLE' || theLoaiCanTim === 'NHANROI') {
                            tenTrungKhop = animDungIm || animChayBay || danhSachTenGoc[0];
                        }
                        else if (theLoaiCanTim === 'RUN' || theLoaiCanTim === 'CHAYBO' || theLoaiCanTim === 'BAY' || theLoaiCanTim === 'FLY') {
                            // Cần bay/chạy mà không có thì mượn thế đứng im trượt tới (bóng ma)
                            tenTrungKhop = animChayBay || animDungIm || danhSachTenGoc[0];
                        }
                        else if (theLoaiCanTim === 'ATTACK' || theLoaiCanTim.includes('CHIEU')) {
                            // Cần đánh mà không có hoạt ảnh đánh thì mượn dáng chạy lao húc thẳng vào mặt!
                            tenTrungKhop = animDanh || animChayBay || animDungIm || danhSachTenGoc[0];
                        }
                        else if (theLoaiCanTim === 'DIE') {
                            tenTrungKhop = animChet || danhSachTenGoc[0];
                        }
                        else {
                            tenTrungKhop = danhSachTenGoc[0]; // Cứu cánh cuối cùng, nhét đại cái đầu tiên vào chống Crash
                        }
                    }

                    if (!tenTrungKhop) {
                        if (theLoaiCanTim === 'IDLE' || theLoaiCanTim === 'NHANROI') tenTrungKhop = danhSachTenGoc[0];
                        else if (theLoaiCanTim === 'RUN' || theLoaiCanTim === 'CHAYBO') tenTrungKhop = danhSachTenGoc[1] || danhSachTenGoc[0];
                        else if (theLoaiCanTim === 'ATTACK' || theLoaiCanTim.includes('CHIEU')) tenTrungKhop = danhSachTenGoc[2] || danhSachTenGoc[0];
                        else tenTrungKhop = danhSachTenGoc[0];
                    }
                }

                let action = this.anims[tenTrungKhop];
                if (action) {
                    if (this.cur) this.cur.fadeOut(0.2);
                    this.cur = action;
                    this.currentAnimName = theLoaiCanTim;

                    if (theLoaiCanTim === 'DIE') {
                        action.setLoop(THREE.LoopOnce);
                        action.clampWhenFinished = true;
                    } else {
                        action.setLoop(THREE.LoopRepeat);
                    }
                    action.reset().fadeIn(0.2).play();
                }
            }
        };

        if (info.isDead) { quai.visible = false; tag.style.display = 'none'; } else { info.playAnim('IDLE'); }
        window.danhSachQuaiVat.push(info);
    });
};

function getBossObj(type, size, color = 0xffffff) {
    const group = new THREE.Group();
    if (type === 'KIEM' && window.phiKiemModel) group.add(window.phiKiemModel.clone());
    else if (type === 'VONG' && window.vongPhepModel) group.add(window.vongPhepModel.clone());
    else if (type === 'DAN' && window.viendanModel) group.add(window.viendanModel.clone());
    else if (type === 'PHICO' && window.phicoModel) group.add(window.phicoModel.clone());
    else {
        let geo, mat, mesh;
        if (type === 'KIEM') { geo = new THREE.ConeGeometry(0.8, 5, 8); geo.rotateX(Math.PI / 2); mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true }); }
        else if (type === 'VONG') { geo = new THREE.TorusGeometry(3, 0.2, 16, 32); geo.rotateX(Math.PI / 2); mat = new THREE.MeshBasicMaterial({ color: 0x9b59b6, transparent: true, opacity: 0.8 }); }
        else if (type === 'PHICO') { geo = new THREE.TetrahedronGeometry(2.5); mat = new THREE.MeshBasicMaterial({ color: 0xe74c3c, wireframe: true }); }
        else { geo = new THREE.SphereGeometry(1.5, 16, 16); mat = new THREE.MeshBasicMaterial({ color: 0xf1c40f }); }
        mesh = new THREE.Mesh(geo, mat); group.add(mesh);
    }
    group.scale.set(size, size, size); return group;
}

window.bossTungTuyetKieu = function (quai, targetPos, phaiIn, chieuIn) {
    if (!quai || !quai.mesh) return;
    const startPos = quai.mesh.position.clone(); startPos.y += 10;
    const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
    const dmg = quai.damage || 100;
    const phai = phaiIn || ['TU_TIEN', 'PHAP_SU', 'XA_THU', 'CUNG_THU', 'LAZER'][Math.floor(Math.random() * 5)];
    const chieu = chieuIn || ['Q', 'E', 'R', 'F'][Math.floor(Math.random() * 4)];

    if (phai === 'TU_TIEN') {
        if (chieu === 'F') {
            const pivot = new THREE.Group(); pivot.position.set(targetPos.x, targetPos.y + 20, targetPos.z); pivot.lookAt(targetPos);
            const s = getBossObj('KIEM', 4); s.rotateX(-Math.PI * 0.8); pivot.add(s); scene.add(pivot);
            window.bossSkills.push({ mesh: pivot, sword: s, type: 'KIEM_F', ticks: 0, life: 100, target: targetPos.clone(), dmg: dmg * 2 });
        } else {
            const s = getBossObj('KIEM', 1); s.position.copy(startPos); s.lookAt(targetPos); scene.add(s);
            window.bossSkills.push({ mesh: s, type: 'BAY_THANG', speed: 4, life: 100, target: targetPos.clone(), dmg: dmg });
        }
    } else if (phai === 'PHAP_SU') {
        if (chieu === 'E' || chieu === 'F') {
            const v = getBossObj('VONG', 15); v.position.copy(targetPos).add(new THREE.Vector3(0, 10, 0)); v.rotation.x = -Math.PI / 2; scene.add(v);
            window.bossSkills.push({ mesh: v, type: 'VONG_EP', ticks: 0, life: 100, target: targetPos.clone(), dmg: dmg * 2 });
        } else {
            const v = getBossObj('VONG', 5); v.position.copy(startPos); v.lookAt(targetPos); v.rotateX(Math.PI / 2); scene.add(v);
            window.bossSkills.push({ mesh: v, type: 'BAY_THANG', speed: 3, life: 120, target: targetPos.clone(), dmg: dmg });
        }
    } else if (phai === 'XA_THU') {
        if (chieu === 'F') {
            const jet = getBossObj('PHICO', 8); jet.position.copy(startPos).sub(dir.clone().multiplyScalar(50)); jet.lookAt(targetPos); scene.add(jet);
            window.bossSkills.push({ mesh: jet, type: 'JET_DIVE', state: 'FLY', speed: 3, life: 200, target: targetPos.clone(), dmg: dmg * 5 });
        } else {
            for (let i = 0; i < 10; i++) {
                const d = getBossObj('DAN', 2); d.position.set(targetPos.x + (Math.random() - 0.5) * 40, targetPos.y + 80, targetPos.z + (Math.random() - 0.5) * 40); d.lookAt(targetPos); scene.add(d);
                window.bossSkills.push({ mesh: d, type: 'BAY_XUONG', speed: 5, delay: i * 2, life: 100, target: targetPos.clone(), dmg: dmg });
            }
        }
    } else if (phai === 'CUNG_THU') {
        const arrow = getBossObj('DAN', 3, 0x00ff00); arrow.position.copy(startPos); arrow.lookAt(targetPos); scene.add(arrow);
        window.bossSkills.push({ mesh: arrow, type: 'BAY_THANG', speed: 6, life: 100, target: targetPos.clone(), dmg: dmg });
    } else if (phai === 'LAZER') {
        const geo = new THREE.CylinderGeometry(2, 2, 10, 8); geo.rotateX(Math.PI / 2); const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
        const l = new THREE.Mesh(geo, mat); l.position.copy(startPos); l.lookAt(targetPos); scene.add(l);
        window.bossSkills.push({ mesh: l, type: 'LAZER_GROW', life: 30, target: targetPos.clone(), dmg: dmg });
    }
};

window.xuLyQuaiLuiBinh = function (quai, targetPos, delta) {
    if (!quai.thoiDiemDam) return false;
    let thoiGianDaQua = Date.now() - quai.thoiDiemDam;
    if (thoiGianDaQua > 500) return false;

    quai.state = 'RETREAT';
    if (typeof quai.playAnim === 'function') quai.playAnim('RUN');

    let huongLui = new THREE.Vector3().subVectors(quai.mesh.position, targetPos).normalize();
    huongLui.projectOnPlane(quai.upVector).normalize();

    let tocDoLui = Math.max(5.0, (quai.heSoToLon || 1) * 3.0);
    quai.mesh.position.add(huongLui.multiplyScalar(tocDoLui * delta));

    let huongNhinPhang = new THREE.Vector3().subVectors(targetPos, quai.mesh.position).projectOnPlane(quai.upVector).normalize();
    let dummy = new THREE.Object3D();
    dummy.position.copy(quai.mesh.position); dummy.up.copy(quai.upVector);
    dummy.lookAt(quai.mesh.position.clone().add(huongNhinPhang));
    quai.mesh.quaternion.slerp(dummy.quaternion, 0.1);

    return true;
};

// ========================================================
// 🧠 TRÍ TUỆ NHÂN TẠO AI BOSS TOÀN VŨ TRỤ (BẢN VÁ LIỀN TRỤC CHUẨN)
// ========================================================
window.capNhatAIQuaiVat = function (delta) {
    if (!window.danhSachQuaiVat || !playerModel) return;
    window.danhSachQuaiVat.forEach(quai => {
            if (!quai || !quai.mesh) return;
            if (quai.mixer) quai.mixer.update(delta);
            // ==========================================
            // 🛡️ 1. HỆ THỐNG QUẢN LÝ BẢNG TÊN (VÁ LỖI KẸT & NHẤP NHÁY)
            // ==========================================
            if (quai.tagEl && typeof camera !== 'undefined' && typeof playerModel !== 'undefined' && playerModel) {
                // Nếu quái chết hoặc tàng hình -> Ép ẩn ngay lập tức!
                if (quai.isDead || !quai.mesh.visible) {
                    quai.tagEl.style.display = 'none';
                } else {
                    const worldPos = new THREE.Vector3(); 
                    quai.mesh.getWorldPosition(worldPos);
                    let khoangCach = worldPos.distanceTo(playerModel.position);                  
                    if (khoangCach > (window.isMobile ? 1500 : 2500)) { 
                        quai.tagEl.style.display = 'none'; 
                    } else {
                        // Vá lỗi sập biến upVector
                        let upV = new THREE.Vector3(0, 1, 0);
                        if (quai.mesh.up) upV.copy(quai.mesh.up).normalize();
                        else if (quai.upVector) upV.copy(quai.upVector).normalize();
                        
                        let chieuCao = quai.chieuCaoThuc || quai.chieuCao || 5;
                        let viTriTag = worldPos.clone().add(upV.multiplyScalar(chieuCao + 2.0));
                        viTriTag.project(camera);
                        
                        if (viTriTag.z < 1) {
                            quai.tagEl.style.left = `${(viTriTag.x * 0.5 + 0.5) * window.innerWidth}px`;
                            quai.tagEl.style.top = `${(viTriTag.y * -0.5 + 0.5) * window.innerHeight}px`;
                            quai.tagEl.style.display = 'block'; 
                        } else { 
                            quai.tagEl.style.display = 'none'; 
                        }
                    }
                }
            }
            // Kẻ chết không được phép chạy AI hay trượt đi đâu cả
            if (quai.isDead) return;

            // ==========================================
            // 🛡️ 2. CHẾ ĐỘ CON RỐI (CHỐNG GIẬT LAG ANIMATION)
            // ==========================================
            if (quai.thoiGianBiDieuKhienQuaMang && Date.now() < quai.thoiGianBiDieuKhienQuaMang) {
                if (quai.targetPosLK) quai.mesh.position.lerp(quai.targetPosLK, 0.15); // Trượt tọa độ
                if (quai.targetQuatLK) quai.mesh.quaternion.slerp(quai.targetQuatLK, 0.2); // Xoay cổ
                
                // 🌟 BẢN VÁ KẾT LIỄU BỆNH GIẬT: ÉP CON RỐI SAO CHÉP 100% TÊN ANIMATION CỦA MÁY CHỦ!
                let dangMuaChieu = quai.thoiGianKhoaChieu && Date.now() < quai.thoiGianKhoaChieu;
                if (!dangMuaChieu && quai.targetAnimLK) {
                    if (typeof quai.playAnim === 'function') {
                        // Máy chủ gửi 'RUN' thì chạy 'RUN', gửi 'IDLE' thì chạy 'IDLE' -> Mượt tuyệt đối!
                        quai.playAnim(quai.targetAnimLK);
                    }
                }
                return; // Thoát ngang an toàn
            }
        // Tự động tính toán hệ số to lớn và lõi thịt của Boss
        if (!quai.heSoToLon) {
            quai.mesh.updateMatrixWorld(true);
            let box = new THREE.Box3().setFromObject(quai.mesh);
            let size = new THREE.Vector3(); box.getSize(size);
            let worldSize = Math.max(size.x, size.y, size.z);
            
            const center = new THREE.Vector3(); 
            box.getCenter(center);
            quai.tamThucTeLocal = quai.mesh.worldToLocal(center); 
            quai.chieuCaoThuc = box.max.y - box.min.y; 

            quai.heSoToLon = worldSize / 25;
            if (quai.heSoToLon < 0.5) quai.heSoToLon = 0.5;
        }
        // 🌟 BẢN VÁ AAA: BỌC THÉP TRỤC TRỌNG LỰC QUÁI VẬT
        // Chỉ bẻ cong nếu đang ở Map Cầu. Map Phẳng thì 100% đứng thẳng!
        if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
            quai.upVector = quai.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
        } else {
            quai.upVector = new THREE.Vector3(0, 1, 0);
        }
        // Radar quét cao độ mặt đất của quái
        if (quai.frameQuetDat === undefined) quai.frameQuetDat = Math.floor(Math.random() * 30);
        quai.frameQuetDat++;

        if (quai.frameQuetDat > 15) {
            quai.frameQuetDat = 0;
            if (!window.radarQuaiVat) window.radarQuaiVat = new THREE.Raycaster();
            let tiaBatDau = quai.mesh.position.clone().add(quai.upVector.clone().multiplyScalar(2000));
            let huongXuongDat = quai.upVector.clone().negate();
            window.radarQuaiVat.set(tiaBatDau, huongXuongDat);

            if (window.DANH_SACH_MAT_DAT && window.DANH_SACH_MAT_DAT.length > 0) {
                let vaCham = window.radarQuaiVat.intersectObjects(window.DANH_SACH_MAT_DAT, true);
                if (vaCham.length > 0) quai.mucTieuY = vaCham[0].point;
            }
        }
        // ========================================================
        // 🐋 AI ĐỘC QUYỀN: SINH VẬT TRANG TRÍ (QUỸ ĐẠO BÁM VỎ TRÁI ĐẤT & BẦU TRỜI)
        // ========================================================
        if (quai.classCode === 'TRANG_TRI') {
            let boNao = window.TU_DIEN_AI_QUAI['TRANG_TRI'];
            if (!quai.spawnPos) quai.spawnPos = new THREE.Vector3(quai.spawnX || quai.mesh.position.x, quai.mesh.position.y, quai.spawnZ || quai.mesh.position.z);
            
            // 1. TẠO "HẠT GIỐNG TOÁN HỌC" TỪ ID CỦA BOSS (CHỈ TẠO 1 LẦN)
            if (quai.seedToanHoc === undefined) {
                let hash = 0; let strId = String(quai.id);
                for (let i = 0; i < strId.length; i++) hash = Math.imul(31, hash) + strId.charCodeAt(i) | 0;
                quai.seedToanHoc = (Math.abs(hash) % 10000) / 10000; 
                
                // 🌟 BẢN VÁ: Thiết lập thông số bay An toàn tuyệt đối
                // Map Cầu bay rộng bao phủ cả Map, Map Phẳng giới hạn max 4000m để không húc lưới Mây
                quai.banKinhBay = 3000 + (quai.seedToanHoc * 3000); 
                quai.tocDoGoc = 0.005 + (quai.seedToanHoc * 0.01); 
                quai.chieuThuan = (quai.seedToanHoc > 0.5) ? 1 : -1; 
                // Khóa độ cao chỉ từ 50m đến TỐI ĐA 300M (Tuyệt đối không bay ra vũ trụ)
                quai.doCaoNhaoLon = 50 + (quai.seedToanHoc * 250); 
            }

            // 2. LẤY THỜI GIAN CHUNG TOÀN SERVER (Cùng 1 mili-giây, mọi máy vẽ giống nhau)
            let tChung = Date.now() / 1000; 

            // HÀM TÍNH TỌA ĐỘ VÀ UỐN CONG THEO VỎ TRÁI ĐẤT (FULL HÀNH TINH)
            let tinhToaDoToanHoc = function(tOffset) {
                let goc = ((tChung + tOffset) * quai.tocDoGoc * quai.chieuThuan) + (quai.seedToanHoc * Math.PI * 2);
                let kq = new THREE.Vector3();
                
                if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                    let tam = window.TAM_HANH_TINH_HIEN_TAI;
                    let R_matDat = quai.spawnPos.distanceTo(tam); 
                    let vUp = quai.spawnPos.clone().sub(tam).normalize();
                    
                    let right = new THREE.Vector3(1, 0, 0).cross(vUp).normalize();
                    if (right.lengthSq() < 0.001) right.set(0, 0, 1).cross(vUp).normalize();
                    let forward = new THREE.Vector3().crossVectors(right, vUp).normalize();
                    
                    // 🌟 BẢN VÁ: THÁO XÍCH MAP CẦU (BAY KHẮP HÀNH TINH)
                    // Bỏ qua banKinhBay, ép góc quay chạy tới vô cực để cá bơi vòng quanh Trái Đất!
                    let angleX = goc; // Quay vòng quanh kinh độ
                    let angleZ = goc * 0.8; // Quay vòng quanh vĩ độ (Tạo đường bơi chéo len lỏi khắp map)
                    
                    let qX = new THREE.Quaternion().setFromAxisAngle(forward, angleX);
                    let qZ = new THREE.Quaternion().setFromAxisAngle(right, -angleZ);
                    
                    // Uốn quỹ đạo bám sát vỏ Trái Đất (Du lịch khắp 5 châu 4 bể)
                    let finalDir = vUp.clone().applyQuaternion(qX).applyQuaternion(qZ).normalize();
                    
                    // Bơm thêm độ cao y (Chỉ nổi lên 50-300m so với mặt đất)
                    let heightOffset = Math.abs(Math.sin(goc * 1.5)) * quai.doCaoNhaoLon;
                    kq.copy(tam).add(finalDir.multiplyScalar(R_matDat + heightOffset));
                } else {
                    // 🌟 MAP PHẲNG: Vẫn khóa cứng max 4000m để không đâm vào lưới Mây ở viền Map
                    let maxFlat = 4000; 
                    let dx = Math.sin(goc) * Math.min(quai.banKinhBay, maxFlat);
                    let dz = Math.cos(goc * 0.8) * Math.min(quai.banKinhBay, maxFlat);
                    let dy = Math.abs(Math.sin(goc * 1.5)) * quai.doCaoNhaoLon; // Nổi lên 50-300m
                    
                    kq.set(quai.spawnPos.x + dx, quai.spawnPos.y + dy, quai.spawnPos.z + dz);
                }
                return kq;
            };

            // 3. XÁC ĐỊNH VỊ TRÍ VÀ HƯỚNG NHÌN
            let viTriDich = tinhToaDoToanHoc(0);
            let viTriTuongLai = tinhToaDoToanHoc(0.5); // Nhìn trước 0.5s để chỉnh mõm cá

            quai.mesh.position.copy(viTriDich);
            
            // 🌟 CẬP NHẬT TRỤC UP LIÊN TỤC THEO ĐIỂM CHẠM MỚI NHẤT (CHỐNG LỘN ĐẦU LỘN ĐÍT)
            let upV = new THREE.Vector3(0, 1, 0);
            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                upV.copy(quai.mesh.position).sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
            }
            quai.upVector = upV;

            let huongBay = new THREE.Vector3().subVectors(viTriTuongLai, viTriDich).normalize();

            // QUAY MẶT VÀ NGHIÊNG CÁNH CHUẨN XÁC
            if (huongBay.lengthSq() > 0.001) {
                let dummy = new THREE.Object3D(); 
                dummy.position.copy(quai.mesh.position); 
                dummy.up.copy(upV); // 🌟 Dùng đúng cái Trục Lưng chuẩn để không bị lật ngửa
                dummy.lookAt(quai.mesh.position.clone().add(huongBay));

                let rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(dummy.quaternion);
                let lucNghieng = huongBay.dot(rightVec); 
                dummy.rotateZ(lucNghieng * (boNao.lucNghieng || 1.5)); 

                quai.mesh.quaternion.slerp(dummy.quaternion, 0.3); 
            }

            if (typeof quai.playAnim === 'function') quai.playAnim('RUN'); 
            if (quai.tagEl) quai.tagEl.style.display = 'none';
            return; 
        }

        // ========================================================
        // 🎯 TÍNH TOÁN KHOẢNG CÁCH CHUNG CHO MỌI LOẠI QUÁI (MẮT THẦN ĐA MỤC TIÊU)
        // ========================================================
        let mucTieuTotNhat = playerModel;
        let myDist = (typeof window.isDead !== 'undefined' && window.isDead) ? Infinity : quai.mesh.position.distanceTo(playerModel.position);

        // 🌟 QUÉT ĐA MỤC TIÊU: MẮT THẦN NÂNG CẤP CHỐNG LÚ (VÁ LỖI BẮN NHAU)
        if (typeof window.remotePlayers !== 'undefined') {
            for (let id in window.remotePlayers) {
                let rp = window.remotePlayers[id];
                
                // 🛑 BẢN VÁ AAA: Ép chuỗi ID thành in hoa và chặn tuyệt đối Bóng Ma + Boss Ảo
                let uid = String(id).toUpperCase();
                if (rp && rp.status === 'ready' && rp.mesh && !uid.includes("PHANTOM") && !uid.includes("BOSS")) {
                    let d = quai.mesh.position.distanceTo(rp.mesh.position);
                    if (d < myDist) {
                        myDist = d;
                        mucTieuTotNhat = rp.mesh; 
                    }
                }
            }
        }
        let posNguoiChoi = mucTieuTotNhat.position.clone();
        let isMucTieuLaToi = (mucTieuTotNhat === playerModel);
        let posNgangQuai = quai.mesh.position.clone().projectOnPlane(quai.upVector);
        let posNgangSep = posNguoiChoi.clone().projectOnPlane(quai.upVector);
        let distNgang = posNgangQuai.distanceTo(posNgangSep);
        let isClosest = true;

        // 🌟 KIẾN TRÚC MỞ AAA: RÚT THÔNG SỐ TỪ NÃO CỦA JS RIÊNG TỪNG PHÁI
        let phaiCode = quai.classCode ? quai.classCode.toUpperCase().trim() : 'TU_TIEN';
        
        // 🔮 THUẬT TOÁN ĐOẠT XÁ CỦA SẾP: Băm mảng, lấy khúc đuôi cùng!
        if (phaiCode === 'ALL' && quai.modelFile) {
            let tenFile = quai.modelFile.split('/').pop().split('.')[0].toUpperCase();
            phaiCode = tenFile.split('_').pop(); 
        }

        // Quy đổi chuẩn hóa các phái gốc
        if (phaiCode === 'CUNG_TEN') phaiCode = 'CUNG_THU';
        if (phaiCode === 'SUNG_DAN' || phaiCode === 'XA_THU') phaiCode = 'BAN_SUNG';
        if (phaiCode === 'SIEUANHHUNG') phaiCode = 'LAZER';
        if (phaiCode === 'CAN_CHIEN') phaiCode = 'LUYEN_THE';

        let boNao = window.TU_DIEN_AI_QUAI[phaiCode];
        let scaleTamNhin = 120;  
        let scaleTamDanh = 80;   
        let gioiHanLanhTho = 300;
        let khoangCachAnToan = 0;
        
        if (boNao) {
            scaleTamDanh = boNao.getTamDanh(quai.heSoToLon || 1);
            scaleTamNhin = boNao.getTamNhin(quai.heSoToLon || 1);
            if (typeof boNao.getGioiHanLanhTho === 'function') gioiHanLanhTho = boNao.getGioiHanLanhTho(scaleTamNhin, quai.heSoToLon || 1);
            else gioiHanLanhTho = scaleTamNhin * 1.5;
            khoangCachAnToan = boNao.khoangCachAnToan || 0;
        } 
        
        if (quai.lastHp === undefined) quai.lastHp = quai.hp;
        if (quai.hp < quai.lastHp) { quai.thoiDiemBiChocGian = Date.now(); quai.lastHp = quai.hp; }
        else if (quai.hp > quai.lastHp) { quai.lastHp = quai.hp; }
        let dangCayCu = (quai.thoiDiemBiChocGian && (Date.now() - quai.thoiDiemBiChocGian < 15000));
        
        // 🛑 BẢN VÁ AAA (SỐ 1): CHỐT CHẶT ĐIỂM HỒI SINH TỪ SQL ĐỂ CHỐNG DỊCH CHUYỂN KHI ĐỔI HOST!
        if (quai.spawnPos === undefined) quai.spawnPos = new THREE.Vector3(quai.spawnX || quai.mesh.position.x, quai.mesh.position.y, quai.spawnZ || quai.mesh.position.z);
        
        // 🛑 BẢN VÁ AAA (SỐ 2): DÂY XÍCH (LEASH) PHẢI ĐO TỪ ĐIỂM HỒI SINH ĐẾN KẺ ĐỊCH GẦN NHẤT (NICK B), CHỨ KHÔNG ĐO ĐẾN SẾP NỮA!
        let cachXaO = quai.spawnPos.distanceTo(posNguoiChoi);
        
        if (dangCayCu && scaleTamNhin < gioiHanLanhTho) scaleTamNhin = gioiHanLanhTho;

        // ========================================================
        // ⚙️ MÁY PHÂN TÍCH HÀNH VI (ATTACK - CHASE - IDLE)
        // ========================================================
        // 🛑 BẢN VÁ AAA (SỐ 3): ĐÃ XÓA '!window.isDead' - CHO PHÉP BOSS TIẾP TỤC ĐÁNH NICK B DÙ NICK A (HOST) ĐÃ CHẾT!
        if (isClosest && myDist < scaleTamNhin && cachXaO < gioiHanLanhTho) {
            let dangLui = false;
            if (boNao && boNao.choPhepLuiBinh) {
                // 🌟 BẢN VÁ: Lùi xa khỏi kẻ địch gần nhất chứ không phải Sếp
                dangLui = window.xuLyQuaiLuiBinh(quai, posNguoiChoi, delta);
            }
            // 🌟 1. LÁ CHẮN BẢO VỆ ANIMATION (CHỐNG TRƯỢT BĂNG & ĐÈ CHIÊU LÚC ĐANG RƯỢT)
            let dangMuaChieu = quai.thoiGianKhoaChieu && Date.now() < quai.thoiGianKhoaChieu;
            if (dangLui) {
                // Đang lùi binh
            }
            else if (myDist < scaleTamDanh || dangMuaChieu) { // Ép đứng lại nếu đang múa dở
                quai.state = 'ATTACK';               
                if (boNao && typeof boNao.thucHienTanCong === 'function') {
                    // Rồng, Chim, Cá tự lo logic
                    boNao.thucHienTanCong(quai, playerModel, delta);
                }
                else {
                    // Nếu đang múa chiêu dở dang -> Khóa chân, chỉ xoay mặt liếc theo Sếp
                    if (dangMuaChieu) {
                        // 🌟 BẢN VÁ: Liếc theo Nick B nếu B đứng gần hơn
                        let huongNhin = new THREE.Vector3().subVectors(posNguoiChoi, quai.mesh.position).projectOnPlane(quai.upVector).normalize();
                        let dummy = new THREE.Object3D();
                        dummy.position.copy(quai.mesh.position); dummy.up.copy(quai.upVector);
                        dummy.lookAt(quai.mesh.position.clone().add(huongNhin));
                        quai.mesh.quaternion.slerp(dummy.quaternion, 0.1);
                    } 

                    // Nếu hồi chiêu xong -> Bắt đầu xả chiêu mới
                    else if (Date.now() - (quai.lastAttackTime || 0) > 3000) {
                        quai.lastAttackTime = Date.now();
                        quai.thoiGianKhoaChieu = Date.now() + 1500; // 🌟 KHÓA CHÂN 1.5 GIÂY CHO MÚA XONG
                        const chieu = ['Q', 'E', 'R', 'F'][Math.floor(Math.random() * 4)];
                        if (typeof quai.playAnim === 'function') quai.playAnim('CHIEU' + chieu);
                        
                        // 🌟 Xoay mặt thẳng vào KẺ ĐỨNG GẦN NHẤT lúc vung tay
                        let huongNhin = new THREE.Vector3().subVectors(posNguoiChoi, quai.mesh.position).projectOnPlane(quai.upVector).normalize();
                        let dummy = new THREE.Object3D();
                        dummy.position.copy(quai.mesh.position); dummy.up.copy(quai.upVector);
                        dummy.lookAt(quai.mesh.position.clone().add(huongNhin));
                        quai.mesh.quaternion.slerp(dummy.quaternion, 0.5);

                        let dmgBoss = 30 * (quai.level || 1);        
                        
                        // Lấy tọa độ từ lõi ngực Boss
                        const bOrigin = quai.tamThucTeLocal ? quai.tamThucTeLocal.clone().applyMatrix4(quai.mesh.matrixWorld) : quai.mesh.position.clone();
                        if (!quai.tamThucTeLocal) bOrigin.y += 5; 
                        
                        // 🌟 Khóa mục tiêu chiêu mạng vào KẺ ĐỨNG GẦN NHẤT
                        const pTarget = posNguoiChoi.clone(); pTarget.y += 5;
                        let bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize(); 
                        
                        // 🌟 KÉO NÒNG SÚNG RA KHỎI BỤNG BOSS CHỐNG KẸT ĐẠN
                        let khoangCach = bOrigin.distanceTo(pTarget);
                        let doDayBung = (quai.heSoToLon || 1) * 6;
                        let dayRaNgoai = Math.min(doDayBung, khoangCach * 0.8);
                        bOrigin.add(bDir.clone().multiplyScalar(dayRaNgoai));

                        // 🌟 BẢN VÁ PHÂN TÁCH LÕI KHI XUẤT CHIÊU
                        let phaiCode = quai.classCode ? quai.classCode.toUpperCase().trim() : 'TU_TIEN';
                        if (phaiCode === 'ALL' && quai.modelFile) {
                            let tenFile = quai.modelFile.split('/').pop().split('.')[0].toUpperCase();
                            phaiCode = tenFile.split('_').pop(); // Lấy đúng đuôi USOPP
                        }

                        if (phaiCode === 'CUNG_TEN') phaiCode = 'CUNG_THU';
                        if (phaiCode === 'SUNG_DAN' || phaiCode === 'XA_THU') phaiCode = 'BAN_SUNG';
                        if (phaiCode === 'SIEUANHHUNG') phaiCode = 'LAZER';
                        if (phaiCode === 'CAN_CHIEN') phaiCode = 'LUYEN_THE';

                        let bossWeapon = (typeof window.VUKHI_MAC_DINH_CAC_PHAI !== 'undefined' && window.VUKHI_MAC_DINH_CAC_PHAI[phaiCode]) ? window.VUKHI_MAC_DINH_CAC_PHAI[phaiCode] : null;
                         
                        let tenHamMap = {
                            'TU_TIEN': 'tungComboTuTien',
                            'PHAP_SU': 'tungComboPhapSu',
                            'CUNG_TEN': 'tungComboCungThu', 'CUNG_THU': 'tungComboCungThu',
                            'SUNG_DAN': 'tungComboBanSung', 'XA_THU': 'tungComboBanSung', 'BAN_SUNG': 'tungComboBanSung',
                            'SIEUANHHUNG': 'tungComboLazer', 'LAZER': 'tungComboLazer',
                            'CAN_CHIEN': 'tungComboLuyenThe', 'LUYEN_THE': 'tungComboLuyenThe'
                        };
                        let funcName = tenHamMap[phaiCode];
                        if (!funcName) {
                            let parts = (phaiCode || "").split('_');
                            let camelCase = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
                            funcName = 'tungCombo' + camelCase;
                        }

                        // 🛑 Cấp CCCD ảo cho Boss để 100+ file võ công không bị lỗi Undefined
                        let renderId = "BOSS_" + String(quai.id); 

                        let thiTrienVoCong = function() {
                            if (typeof window[funcName] === 'function') {
                                if (typeof window.remotePlayers !== 'undefined') window.remotePlayers[renderId] = { status: 'ready', mesh: quai.mesh, damage: 0 };
                                
                                // 🛑 BẢN VÁ AAA: BẮT BUỘC TRUYỀN TRUE ĐỂ TẮT AUTO AIM LÀM LỆCH ĐẠN
                                try { window[funcName](chieu, true, bOrigin, pTarget, bDir, renderId, bossWeapon); } catch(e){}
                                
                                // 💣 HỆ THỐNG SÁT THƯƠNG NỔ CHẬM: 1.5s sau ai đứng gần đích sẽ mất máu!
                                setTimeout(() => {
                                    if (!window.isDead && window.playerModel && window.playerModel.position.distanceTo(pTarget) < 25) {
                                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pTarget, dmgBoss, 25);
                                    }
                                }, 1500);

                                // TĂNG THỜI GIAN SỐNG LÊN 8 GIÂY để đạn nổ xong mới dọn rác
                                setTimeout(() => { if (typeof window.remotePlayers !== 'undefined') delete window.remotePlayers[renderId]; }, 8000);
                            } else {
                                if (typeof window.bossTungTuyetKieu === 'function') window.bossTungTuyetKieu(quai, pTarget, phaiCode, chieu);
                            }
                        };




                        if (typeof window[funcName] === 'function') {
                            thiTrienVoCong(); 
                        } else {
                            if (!window.dangTaiVoCongBoss) window.dangTaiVoCongBoss = {};
                            if (!window.dangTaiVoCongBoss[phaiCode]) {
                                window.dangTaiVoCongBoss[phaiCode] = true;
                                
                                let scriptSrc = 'js/' + phaiCode.toLowerCase() + '.js?v=' + Date.now();
                                console.log(`🌀 [CORE-LOAD] Triệu hồi kịch bản võ công cách ly cho Boss: ${scriptSrc}`);

                                // Sử dụng Fetch để ép trình duyệt tải nội dung về trước
                                fetch(scriptSrc)
                                    .then(res => { if (!res.ok) throw new Error("404"); return res.text(); })
                                    .then(code => {
                                        // 🛡️ BẬT VÒM SẮT: Sao lưu tuyệt đối thông số của Người Chơi Chính
                                        let backup_script = window.SCRIPT_PHAI_CUA_TOI;
                                        let backup_idle = window.KHO_ANIM_NHANROI ? [...window.KHO_ANIM_NHANROI] : [];
                                        let backup_atk = window.KHO_ANIM_TANCONG ? [...window.KHO_ANIM_TANCONG] : [];
                                        let backup_hephai = window.HePhaiHienTai;

                                        // 🛑 KHÓA ĐỒNG BỘ: Ép tàng hình căn cước người chơi trong tích tắc kích hoạt Script
                                        window.SCRIPT_PHAI_CUA_TOI = '';

                                        try {
                                            let scriptEl = document.createElement('script');
                                            scriptEl.textContent = code + `\n//# sourceURL=${scriptSrc}`;
                                            // Ép thực thi đồng bộ ngay tại đây khi append
                                            document.head.appendChild(scriptEl); 
                                        } catch (e) { console.error("❌ Lỗi biên dịch võ công Boss tại lõi:", e); }

                                        // 🛡️ HỒI SỨC CẤP CỨU: Trả lại 100% quyền lực và võ công gốc cho Người Chơi
                                        window.SCRIPT_PHAI_CUA_TOI = backup_script;
                                        window.KHO_ANIM_NHANROI = backup_idle;
                                        window.KHO_ANIM_TANCONG = backup_atk;
                                        window.HePhaiHienTai = backup_hephai;

                                        // Boss học võ xong, khai hỏa xuất chiêu thức!
                                        thiTrienVoCong();
                                    })
                                    .catch(err => {
                                        console.warn(`⚠️ [CORE-LOAD] Không tìm thấy võ công [js/${phaiCode.toLowerCase()}.js], Boss xài đấm thường.`);
                                        thiTrienVoCong();
                                    });
                            }
                        }



                        
                        if (window.room && window.room.state === 'connected') {
                            try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'BOSS_SKILL', bossId: quai.id, target: { x: pTarget.x, y: pTarget.y, z: pTarget.z }, phai: quai.classCode, chieu: chieu, dmg: dmgBoss })), { reliable: true }); } catch (e) { }
                        }
                    }
                }
            }
            else {
                
                // CHỈ RƯỢT ĐUỔI KHI KHÔNG BỊ KHÓA MÚA CHIÊU
                if (!dangMuaChieu) {
                    quai.state = 'CHASE';
                    if (typeof quai.playAnim === 'function') quai.playAnim('RUN');
                    let tocDoRuot = (boNao && typeof boNao.getTocDoRuot === 'function') ? boNao.getTocDoRuot(quai.heSoToLon || 1) : 25;
                    
                    if (boNao && boNao.he === 'BAY') {
                        // 🌟 Boss Hệ Bay: Rượt theo KẺ ĐỨNG GẦN NHẤT
                        let mucTieuBay = posNguoiChoi.clone();
                        let chieuCaoNgam = typeof boNao.getChieuCaoNgam === 'function' ? boNao.getChieuCaoNgam() : 15;
                        mucTieuBay.add(quai.upVector.clone().multiplyScalar(chieuCaoNgam));
                        let huongBay = new THREE.Vector3().subVectors(mucTieuBay, quai.mesh.position).normalize();
                        quai.mesh.position.add(huongBay.multiplyScalar(tocDoRuot * delta));
                    } else {
                        // 🌟 BẢN VÁ AAA: ĐẠP HƯ KHÔNG! Thú đi bộ rượt 3D thẳng lên trời (Không dùng huongRuotNgang nữa)
                        let huongRuot = new THREE.Vector3().subVectors(posNguoiChoi, quai.mesh.position).normalize();
                        quai.mesh.position.add(huongRuot.multiplyScalar(tocDoRuot * delta));
                    }
                    
                    // 🌟 Xoay mặt nhìn chằm chằm KẺ ĐỨNG GẦN NHẤT lúc rượt (Vẫn giữ trục phẳng để lưng luôn thẳng)
                    let huongRuotPhang = new THREE.Vector3().subVectors(posNguoiChoi, quai.mesh.position).projectOnPlane(quai.upVector).normalize();
                    if (huongRuotPhang.lengthSq() > 0.001) {
                        let dummy = new THREE.Object3D();
                        dummy.position.copy(quai.mesh.position); dummy.up.copy(quai.upVector);
                        dummy.lookAt(quai.mesh.position.clone().add(huongRuotPhang));
                        quai.mesh.quaternion.slerp(dummy.quaternion, 0.1);
                    }
                }
            }

        }
              else {
            // HẾT THẤY ĐỊCH THÌ TỰ ĐỘNG ĐỨNG THỞ HOẶC ĐI TUẦN TRA
            quai.state = 'IDLE';
            let thoiGianDaQua = Date.now() - (quai.lastAttackTime || 0);

            if (thoiGianDaQua > 1500) {

                // 🌟 BẢN VÁ AAA: TUẦN TRA QUỸ ĐẠO SỐ 8 (CHỈ BAY KHI KHÔNG CÓ ĐỊCH)
                if (['RONG', 'CHIM', 'CA'].includes(quai.classCode)) {
                    if (quai.tFlying === undefined) {
                        quai.tFlying = Math.random() * Math.PI * 2;
                        if (!quai.spawnPos) quai.spawnPos = new THREE.Vector3(quai.spawnX || quai.mesh.position.x, quai.mesh.position.y, quai.spawnZ || quai.mesh.position.z);
                        quai.gocY = quai.spawnPos.y;
                    }

                    let banKinhBay = 150 * (quai.heSoToLon || 1); 
                    quai.tFlying += 0.15 * delta; 
                    
                    let dx = Math.sin(quai.tFlying) * banKinhBay;
                    let dz = Math.sin(quai.tFlying) * Math.cos(quai.tFlying) * banKinhBay;
                    let dy = Math.abs(Math.sin(quai.tFlying)) * (banKinhBay * 0.4); 

                    let viTriDich = quai.spawnPos.clone();

                    if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                        let upSpawn = quai.spawnPos.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                        let rightSpawn = new THREE.Vector3(1, 0, 0).cross(upSpawn).normalize();
                        if (rightSpawn.lengthSq() < 0.001) rightSpawn.set(0, 0, 1).cross(upSpawn).normalize();
                        let forwardSpawn = new THREE.Vector3().crossVectors(rightSpawn, upSpawn).normalize();
                        
                        viTriDich.add(rightSpawn.multiplyScalar(dx));
                        viTriDich.add(forwardSpawn.multiplyScalar(dz));
                        viTriDich.add(upSpawn.multiplyScalar(dy));
                    } else {
                        viTriDich.x += dx;
                        viTriDich.z += dz;
                        viTriDich.y = quai.gocY + dy;
                    }

                    let huongBayRaw = new THREE.Vector3().subVectors(viTriDich, quai.mesh.position);
                    let khoangCach = huongBayRaw.length();
                    let huongBay = huongBayRaw.normalize();

                    // 🛑 BẢN VÁ CẮT DÂY THUN: Bắt buộc dùng Vật lý Bước chân, cấm Dịch chuyển!
                    let tocDoDiDao = 60 * (quai.heSoToLon || 1);
                    let maxStep = tocDoDiDao * delta;
                    
                    if (khoangCach > maxStep) {
                        quai.mesh.position.add(huongBay.clone().multiplyScalar(maxStep));
                    } else {
                        quai.mesh.position.copy(viTriDich);
                    }

                    if (huongBay.lengthSq() > 0.001) {
                        let dummy = new THREE.Object3D();
                        dummy.position.copy(quai.mesh.position);
                        dummy.up.copy(quai.upVector);
                        dummy.lookAt(quai.mesh.position.clone().add(huongBay));

                        let rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(dummy.quaternion);
                        let lucNghieng = huongBay.dot(rightVec);
                        dummy.rotateZ(lucNghieng * 1.5); 

                        quai.mesh.quaternion.slerp(dummy.quaternion, 0.05);
                    }

                    if (typeof quai.playAnim === 'function') quai.playAnim('RUN');
                }
                else {
                    // 🌟 BẢN VÁ AAA: TUẦN TRA QUỸ ĐẠO SỐ 8 TRÊN MẶT ĐẤT
                    if (quai.tFlying === undefined) {
                        quai.tFlying = Math.random() * Math.PI * 2; 
                        if (!quai.spawnPos) quai.spawnPos = new THREE.Vector3(quai.spawnX || quai.mesh.position.x, quai.mesh.position.y, quai.spawnZ || quai.mesh.position.z);
                        quai.gocY = quai.spawnPos.y;
                    }
                    
                    let banKinhBay = 250 * (quai.heSoToLon || 1); 
                    quai.tFlying += 0.08 * delta; 
                    let dx = Math.sin(quai.tFlying) * banKinhBay;
                    let dz = Math.sin(quai.tFlying) * Math.cos(quai.tFlying) * banKinhBay;

                    let viTriDich = quai.spawnPos.clone();

                    if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                        let upSpawn = quai.spawnPos.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                        let rightSpawn = new THREE.Vector3(1, 0, 0).cross(upSpawn).normalize();
                        if (rightSpawn.lengthSq() < 0.001) rightSpawn.set(0, 0, 1).cross(upSpawn).normalize();
                        let forwardSpawn = new THREE.Vector3().crossVectors(rightSpawn, upSpawn).normalize();
                        
                        viTriDich.add(rightSpawn.multiplyScalar(dx));
                        viTriDich.add(forwardSpawn.multiplyScalar(dz));
                    } else {
                        viTriDich.x += dx;
                        viTriDich.z += dz;
                        viTriDich.y = quai.gocY; 
                    }

                    let huongBayRaw = new THREE.Vector3().subVectors(viTriDich, quai.mesh.position);
                    let khoangCach = huongBayRaw.length();
                    let huongBay = huongBayRaw.normalize();

                    // 🛑 BẢN VÁ CẮT DÂY THUN: Bắt buộc dùng Vật lý Bước chân, cấm Dịch chuyển!
                    let tocDoDiDao = 40 * (quai.heSoToLon || 1);
                    let maxStep = tocDoDiDao * delta;

                    if (khoangCach > maxStep) {
                        quai.mesh.position.add(huongBay.clone().multiplyScalar(maxStep));
                    } else {
                        quai.mesh.position.copy(viTriDich);
                    }

                    // 🌟 BẢN VÁ: Ép góc nhìn song song mặt đất để Boss không bị cắm mặt xuống đất khi bước xuống không khí
                    let huongNhinPhang = huongBay.clone().projectOnPlane(quai.upVector).normalize();
                    if (huongNhinPhang.lengthSq() > 0.001) {
                        let dummy = new THREE.Object3D();
                        dummy.position.copy(quai.mesh.position);
                        dummy.up.copy(quai.upVector);
                        dummy.lookAt(quai.mesh.position.clone().add(huongNhinPhang));
                        
                        quai.mesh.quaternion.slerp(dummy.quaternion, 0.05);
                    }

                    if (typeof quai.playAnim === 'function') quai.playAnim('RUN');
                }
            }
        }

        // ========================================================
        // 🌍 LÕI TRỌNG LỰC ĐA CHIỀU (BẢN VÁ: ĐI BỘ TRÊN KHÔNG & HẠ CÁNH MƯỢT MÀ)
        // ========================================================
        if (quai.mucTieuY) {
            let dangHuyetChien = (quai.state === 'CHASE' || quai.state === 'ATTACK');
            let isFlying = (boNao && boNao.he === 'BAY') || dangHuyetChien;
            let kcAnToan = boNao ? boNao.khoangCachAnToan : 0;

            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                let kcQuai = quai.mesh.position.distanceTo(window.TAM_HANH_TINH_HIEN_TAI);
                let kcDat = quai.mucTieuY.distanceTo(window.TAM_HANH_TINH_HIEN_TAI);
                
                if (kcQuai < kcDat + kcAnToan) { 
                    let viTriCuuHo = window.TAM_HANH_TINH_HIEN_TAI.clone().add(quai.upVector.clone().multiplyScalar(kcDat + kcAnToan));
                    quai.mesh.position.lerp(viTriCuuHo, 0.5);
                } 
                else if (!isFlying && kcQuai > kcDat + kcAnToan + 1.0) { 
                    // 🌟 BẢN VÁ: TỪ TỪ BƯỚC XUỐNG CẦU THANG TÀNG HÌNH (Rơi 20m/s thay vì rớt tự do)
                    let viTriDat = window.TAM_HANH_TINH_HIEN_TAI.clone().add(quai.upVector.clone().multiplyScalar(kcDat + kcAnToan));
                    let tocDoRoi = 20 * delta; 
                    if (quai.mesh.position.distanceTo(viTriDat) > tocDoRoi) {
                        let huongRoi = new THREE.Vector3().subVectors(viTriDat, quai.mesh.position).normalize();
                        quai.mesh.position.add(huongRoi.multiplyScalar(tocDoRoi));
                    } else {
                        quai.mesh.position.copy(viTriDat);
                    }
                }
            } 
            else if (window.KIEU_TRONG_LUC === 'PHANG') {
                if (quai.mesh.position.y < quai.mucTieuY.y + kcAnToan) { 
                    quai.mesh.position.y += (quai.mucTieuY.y + kcAnToan - quai.mesh.position.y) * 0.5;
                }
                else if (!isFlying && quai.mesh.position.y > quai.mucTieuY.y + kcAnToan + 1.0) { 
                    // 🌟 BẢN VÁ: TỪ TỪ BƯỚC XUỐNG CẦU THANG TÀNG HÌNH
                    let tocDoRoi = 20 * delta;
                    quai.mesh.position.y -= tocDoRoi;
                    if (quai.mesh.position.y < quai.mucTieuY.y + kcAnToan) quai.mesh.position.y = quai.mucTieuY.y + kcAnToan;
                }
            }
        }

        if (quai.upVector) {
            let trucUpHienTai = new THREE.Vector3(0, 1, 0).applyQuaternion(quai.mesh.quaternion);
            let nanTrucQuat = new THREE.Quaternion().setFromUnitVectors(trucUpHienTai, quai.upVector);
            quai.mesh.quaternion.premultiply(nanTrucQuat);
        }

        // ========================================================
        // 🏷️ BẢN VÁ LIVE-RADAR 2D: ÉP BẢNG TÊN HIỆN ĐÚNG TRÊN ĐỈNH ĐẦU VÀ ẨN KHI Ở XA
        // ========================================================
        if (quai.tagEl && typeof camera !== 'undefined') {
            const worldPos = new THREE.Vector3();
            quai.mesh.getWorldPosition(worldPos);
            
            // 🌟 CHỐNG NHÌN XUYÊN TÂM TRÁI ĐẤT: Giấu tên nếu Boss cách xa hơn 800m (PC) hoặc 500m (Mobile)
            let khoangCachDenSep = worldPos.distanceTo(playerModel.position);
            let tamNhinTen = window.isMobile ? 500 : 800; 

            if (khoangCachDenSep > tamNhinTen) {
                quai.tagEl.style.display = 'none'; // Ở xa quá thì tàng hình tên đi cho sạch màn hình
            } else {
                // Đẩy bảng tên lên cao qua đỉnh đầu con Boss
                let chieuCaoBoss = quai.chieuCaoThuc || 5;
                let viTriTag = worldPos.clone().add(quai.upVector.clone().multiplyScalar(chieuCaoBoss + 2.0));
                
                viTriTag.project(camera);
                if (viTriTag.z < 1) {
                    quai.tagEl.style.left = `${(viTriTag.x * 0.5 + 0.5) * window.innerWidth}px`;
                    quai.tagEl.style.top = `${(viTriTag.y * -0.5 + 0.5) * window.innerHeight}px`;
                    quai.tagEl.style.display = 'block'; // Bật hiện hình bảng tên chuẩn chỉ
                } else {
                    quai.tagEl.style.display = 'none';
                }
            }
        }

        // ========================================================
        // 📡 MÁY PHÁT SÓNG: ĐỒNG BỘ TỌA ĐỘ, GÓC XOAY VÀ ANIMATION LÊN MẠNG
        // ========================================================
        // 🌟 BẢN VÁ: Cấm Sinh Vật Cảnh (TRANG TRÍ) lên sóng LiveKit, vì nó đã dùng thuật toán đồng bộ tuyệt đối rồi!
        if (quai.classCode !== 'TRANG_TRI') {
            if (window.room && window.room.state === 'connected') {
                if (Date.now() - (quai.lastPosSync || 0) > 100) {
                    quai.lastPosSync = Date.now();
                    let rot = quai.mesh.rotation; 
                    let hienTrangAnim = quai.currentAnimName || quai.state || 'IDLE'; 
                    
                    try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ 
                        type: 'BOSS_POS', bossId: quai.id, 
                        x: parseFloat(quai.mesh.position.x.toFixed(2)), y: parseFloat(quai.mesh.position.y.toFixed(2)), z: parseFloat(quai.mesh.position.z.toFixed(2)), 
                        rx: parseFloat(rot.x.toFixed(3)), ry: parseFloat(rot.y.toFixed(3)), rz: parseFloat(rot.z.toFixed(3)), 
                        anim: hienTrangAnim 
                    })), { reliable: false }); } catch (e) { }
                }
            }
        }
    });
};

// 6. VÒNG LẶP SKILL VÀ SÁT THƯƠNG BOSS THƯỜNG
setInterval(() => {
    for (let i = window.bossSkills.length - 1; i >= 0; i--) {
        let s = window.bossSkills[i];
        if (s.delay && s.delay > 0) { s.delay--; continue; }
        s.life--; let hit = false;

        if (s.type === 'BAY_THANG' || s.type === 'BAY_XUONG') {
            s.mesh.translateZ(s.speed); if (s.mesh.position.distanceTo(s.target) < 10 || s.mesh.position.y < s.target.y + 1) hit = true;
        } else if (s.type === 'KIEM_F' || s.type === 'VONG_EP') {
            if (s.sword) s.sword.rotateX(0.1); s.ticks++; if (s.ticks > 40) hit = true;
        } else if (s.type === 'LAZER_GROW') {
            s.mesh.scale.z += 5; s.mesh.material.opacity = s.life / 30; if (s.life === 25 && typeof playerModel !== 'undefined' && playerModel && s.mesh.position.distanceTo(playerModel.position) < 50) hit = true;
        } else if (s.type === 'JET_DIVE') {
            if (s.state === 'FLY') { s.mesh.translateZ(s.speed); if (s.mesh.position.distanceTo(s.target) < 100) s.state = 'DIVE'; }
            else { s.mesh.lookAt(s.target); s.speed *= 1.1; s.mesh.translateZ(s.speed); if (s.mesh.position.distanceTo(s.target) < 10) hit = true; }
        }

        if (hit || s.life <= 0) {
            if (hit && typeof playerModel !== 'undefined' && playerModel && !window.isDead && typeof window.mauBanThan !== 'undefined') {

                if ((s.mesh ? s.mesh.position : s.target).distanceTo(playerModel.position) < 30) {
                    if (true) { // 🛑 GỠ GIÁP ĐẠN BAY
                        window.mauBanThan -= Math.round(s.dmg);

                        // 🌟 BẢN VÁ: ĐÃ THÊM WINDOW. ĐỂ NẢY SỐ DAME KHI ĐẠN NỔ TRÚNG NGƯỜI
                        if (typeof window.taoSoSatThuong === 'function') window.taoSoSatThuong(playerModel.position.clone().add(new THREE.Vector3(0, 5, 0)), Math.round(s.dmg), '#ff0000');
                        const uiThanhMau = document.getElementById('thanhMauHienTai'); const uiSoMau = document.getElementById('soMauHienTai');
                        if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
                        if (uiSoMau) uiSoMau.innerText = Math.max(0, window.mauBanThan).toLocaleString() + " / " + window.MAU_TOI_DA.toLocaleString() + " HP";
                        if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') window.xuLyCaiChetNhanVat("Tuyệt Kỹ Boss");
                    }
                }
            }
            if (typeof window.taoVuNoTuTien === 'function') window.taoVuNoTuTien(s.mesh ? s.mesh.position : s.target, true, 0);
            if (typeof window.donRac3D === 'function') { window.donRac3D(s.mesh); if (s.marker) window.donRac3D(s.marker); if (s.warningMesh) window.donRac3D(s.warningMesh); if (s.sword) window.donRac3D(s.sword); }
            window.bossSkills.splice(i, 1);
        } // <--- CHÍNH CÁI DẤU NGOẶC NÀY BỊ MẤT TRONG FILE CŨ CỦA SẾP!
    }
}, 30);

// =====================================================================
// 👤 MODULE ĐẶC BIỆT: HỆ THỐNG "PHANTOM" - GIẢ LẬP NGƯỜI CHƠI (BẢN V16 - NPC QUA ĐƯỜNG)
// =====================================================================
window.taoTenNguoiChoiGia = function () {
    const ho = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Bạch", "Diệp"];
    const ten = ["Phong", "Linh", "Hải", "Tuấn", "Nam", "Long", "Vy", "Trang", "Anh", "Minh", "Khang", "Hùng", "Bảo", "Nhi", "Hân", "Thành", "Đạt", "Thịnh", "Huy", "Phúc", "Kiwii", "Ken", "Bo", "Bin"];
    const hauTo = ["", "", "", "9x", "8x", "Pro", "VIP", "2k", "Gaming", "_VN", "deptrai", "cute", "123", "999"];
    let kieuTen = Math.random();
    if (kieuTen < 0.3) return ho[Math.floor(Math.random() * ho.length)] + " " + ten[Math.floor(Math.random() * ten.length)];
    else if (kieuTen < 0.7) { let t = ten[Math.floor(Math.random() * ten.length)]; t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D"); return t + hauTo[Math.floor(Math.random() * hauTo.length)]; }
    else { let h = ho[Math.floor(Math.random() * ho.length)]; let t = ten[Math.floor(Math.random() * ten.length)]; let full = (h + t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D"); return full + (Math.random() > 0.5 ? hauTo[Math.floor(Math.random() * hauTo.length)] : ""); }
};

window.TU_DIEN_AI_QUAI['FAKE_PLAYER'] = {
    he: 'BAY',
    getTamDanh: () => 80,
    getTamNhin: () => 150,
    getGioiHanLanhTho: () => 300,
    khoangCachAnToan: 5,
    choPhepLuiBinh: false,

    thucHienTanCong: function (bot, playerModel, delta) {
        if (bot.chuSohuu !== window.myUsername) return; // Chỉ Master mới chạy AI

        if (!bot.soLanDaDanh) bot.soLanDaDanh = 0;
        if (!bot.altOffset) bot.altOffset = (Math.random() * 15 + 15);

        let distToPlayer = bot.mesh.position.distanceTo(playerModel.position);
        let ptHP = bot.hp / (bot.maxHp || 1);
        // 🌟 BẢN VÁ AAA: BỌC THÉP TRỤC PHANTOM
        let botUp = (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) ? bot.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize() : new THREE.Vector3(0, 1, 0);


        if (bot.hp <= 0 && !bot.daBaoTu) {
            bot.daBaoTu = true;
            if (typeof window.hienThiThongBao === 'function') window.hienThiThongBao("⚔️ Bạn đã hạ gục [" + bot.name + "]!", "#f1c40f");
            return;
        }

        // 🌟 KỊCH BẢN 1: KHÁCH QUA ĐƯỜNG (PASSERBY) - CHỈ BAY NGANG QUA RỒI CÚT
        if (bot.kieuBot === 'PASSERBY') {
            if (typeof bot.playAnim === 'function') bot.playAnim('RUN');

            if (!bot.diemCuoi) bot.diemCuoi = playerModel.position.clone(); // Backup lỗi

            let huongBayNgang = new THREE.Vector3().subVectors(bot.diemCuoi, bot.mesh.position).projectOnPlane(botUp).normalize();

            // Tốc độ lề mề thong dong (1.5)
            bot.mesh.position.add(huongBayNgang.clone().multiplyScalar(1.5 * (delta * 60)));

            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                let newBotUp = bot.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                let rSep = playerModel.position.distanceTo(window.TAM_HANH_TINH_HIEN_TAI);
                // Giữ nguyên độ cao ổn định trên trời
                bot.mesh.position.copy(window.TAM_HANH_TINH_HIEN_TAI.clone().add(newBotUp.multiplyScalar(rSep + bot.altOffset)));
                let targetMat = new THREE.Matrix4().lookAt(bot.mesh.position, bot.mesh.position.clone().add(huongBayNgang), newBotUp);
                bot.mesh.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.1);
            }

            // Bay tới đích (sang hông bên kia) hoặc đi quá xa thì tự xóa sổ nhẹ nhàng
            if (bot.mesh.position.distanceTo(bot.diemCuoi) < 100 || distToPlayer > 11000) {
                window.xoaPhantomLocal(bot.id);
                if (window.room && window.room.state === 'connected') {
                    window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'DESPAWN_PHANTOM', id: bot.id })), { reliable: true });
                }
            }
            return; // 🛑 CHỐT CHẶN: Dừng lại ở đây, KHÔNG chạy xuống logic bắn súng bên dưới!
        }

        // 🌟 KỊCH BẢN 2: SÁT THỦ (HUNTER) - RƯỢT ĐUỔI VÀ BẮN TỈA (GIỮ NGUYÊN V15)
        if (bot.soLanDaDanh >= 4 || ptHP <= 0.4 || bot.trangThaiHanhDong === 'FLEE') {
            bot.trangThaiHanhDong = 'FLEE';
        } else if (distToPlayer > 80) {
            bot.trangThaiHanhDong = 'APPROACH';
        } else {
            bot.trangThaiHanhDong = 'ATTACK';
        }

        if (bot.trangThaiHanhDong === 'FLEE') {
            if (typeof bot.playAnim === 'function') bot.playAnim('RUN');
            if (!bot.huongTauThoat) bot.huongTauThoat = new THREE.Vector3().subVectors(playerModel.position, bot.mesh.position).projectOnPlane(botUp).normalize();
            bot.mesh.position.add(bot.huongTauThoat.clone().multiplyScalar(1.0 * (delta * 60)));

            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                let newBotUp = bot.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                let rSep = playerModel.position.distanceTo(window.TAM_HANH_TINH_HIEN_TAI);
                bot.mesh.position.copy(window.TAM_HANH_TINH_HIEN_TAI.clone().add(newBotUp.multiplyScalar(rSep + bot.altOffset)));
                let targetMat = new THREE.Matrix4().lookAt(bot.mesh.position, bot.mesh.position.clone().add(bot.huongTauThoat), newBotUp);
                bot.mesh.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.2);
            }

            if (distToPlayer > 1200) {
                window.xoaPhantomLocal(bot.id);
                if (window.room && window.room.state === 'connected') {
                    window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'DESPAWN_PHANTOM', id: bot.id })), { reliable: true });
                }
            }
        }
        else if (bot.trangThaiHanhDong === 'APPROACH') {
            if (typeof bot.playAnim === 'function') bot.playAnim('RUN');
            let huongToi = new THREE.Vector3().subVectors(playerModel.position, bot.mesh.position).projectOnPlane(botUp).normalize();
            bot.mesh.position.add(huongToi.multiplyScalar(1.5 * (delta * 60)));

            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                let newBotUp = bot.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                let rSep = playerModel.position.distanceTo(window.TAM_HANH_TINH_HIEN_TAI);
                bot.mesh.position.copy(window.TAM_HANH_TINH_HIEN_TAI.clone().add(newBotUp.multiplyScalar(rSep + bot.altOffset)));
                let targetMat = new THREE.Matrix4().lookAt(bot.mesh.position, bot.mesh.position.clone().add(huongToi), newBotUp);
                bot.mesh.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.3);
            }
        }
        else if (bot.trangThaiHanhDong === 'ATTACK') {
            if (typeof bot.playAnim === 'function') bot.playAnim('IDLE');
            let huongNhinSep = playerModel.position.clone().sub(bot.mesh.position).projectOnPlane(botUp).normalize();

            if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
                let newBotUp = bot.mesh.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
                let rSep = playerModel.position.distanceTo(window.TAM_HANH_TINH_HIEN_TAI);
                bot.mesh.position.copy(window.TAM_HANH_TINH_HIEN_TAI.clone().add(newBotUp.multiplyScalar(rSep + bot.altOffset)));
                let targetMat = new THREE.Matrix4().lookAt(bot.mesh.position, bot.mesh.position.clone().sub(huongNhinSep), newBotUp);
                bot.mesh.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(targetMat), 0.5);
            }

            if (Date.now() - (bot.lastAttackTime || 0) > 1200) {
                bot.lastAttackTime = Date.now();
                let nextChieu = ['Q', 'E', 'R', 'F'][bot.soLanDaDanh % 4];
                bot.soLanDaDanh++;

                if (typeof bot.playAnim === 'function') bot.playAnim('ATTACK');
                let bOrigin = bot.mesh.position.clone();
                let pTarget = playerModel.position.clone(); pTarget.y += 3;
                let bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize();
                
                // 🌟 BẢN VÁ 3: ĐẨY NÒNG SÚNG VÀ CẤP ID CHUẨN CHO PHANTOM
                let khoangCach = bOrigin.distanceTo(pTarget);
                bOrigin.add(bDir.clone().multiplyScalar(Math.min(5, khoangCach * 0.8)));
                
                let botFakeId = String(bot.id);
                let dmgBot = 30 * (bot.level || 1);

                if (typeof window.remotePlayers !== 'undefined') {
                    window.remotePlayers[botFakeId] = { status: 'ready', mesh: bot.mesh, name: bot.name, damage: dmgBot, classCode: bot.fakePhai };
                }

                // 🌟 KHAI BÁO BIẾN BỊ THIẾU ĐỂ CỨU GAME KHỎI SẬP
                let phaiDung = bot.fakePhai || 'TU_TIEN';

                // 🌟 TỰ ĐỘNG LẤY ĐÚNG VŨ KHÍ CỦA MÔN PHÁI TỪ BẢNG GAME_CLASSES
                let phantomWeapon = (typeof window.VUKHI_MAC_DINH_CAC_PHAI !== 'undefined' && window.VUKHI_MAC_DINH_CAC_PHAI[phaiDung]) ? window.VUKHI_MAC_DINH_CAC_PHAI[phaiDung] : null;

                // 🌟 BẢN VÁ AI TỐI THƯỢNG CHO PHANTOM (Đã phục hồi đoạn if bị mất)
                let maPhaiBot = phaiDung;
                if (maPhaiBot === 'XA_THU' || maPhaiBot === 'SUNG_DAN') maPhaiBot = 'BanSung';
                else if (maPhaiBot === 'SIEUANHHUNG') maPhaiBot = 'Lazer';
                else if (maPhaiBot === 'CUNG_TEN') maPhaiBot = 'CungThu';
                else {
                    maPhaiBot = maPhaiBot.split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
                }
                let tenHamBot = 'tungCombo' + maPhaiBot;

                // Tự động gọi chiêu thức nếu có Script
                if (typeof window[tenHamBot] === 'function') {
                    window[tenHamBot](nextChieu, dmgBot, bOrigin, pTarget, bDir, botFakeId, phantomWeapon);
                } else if (typeof window.bossTungTuyetKieu === 'function') {
                    window.bossTungTuyetKieu(bot, pTarget, phaiDung, nextChieu);
                }

                // Giữ kết nối sát thương 2 giây để đạn bay tới nơi (Thay vì 100ms như cũ)
                setTimeout(() => { if (typeof window.remotePlayers !== 'undefined') delete window.remotePlayers[botFakeId]; }, 2000);
                // 🛑 ĐÃ QUÉT SẠCH CỤC MÌN GÂY SÁT THƯƠNG ẢO LÀM CHẾT OAN NGƯỜI CHƠI TẠI ĐÂY!
                if (window.room && window.room.state === 'connected') {
                    window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                        type: 'BOSS_SKILL', bossId: bot.id, target: { x: pTarget.x, y: pTarget.y, z: pTarget.z }, phai: 'FAKE_PLAYER', classCode: phaiDung, chieu: nextChieu, dmg: dmgBot
                    })), { reliable: true });
                }  
            }
        }
    }
};

// =====================================================================
// 📡 MÁY PHÁT SÓNG ĐỒNG BỘ: SỬA LỖI ĐỒNG BỘ NICK PHỤ
// =====================================================================
if (!window.daCaiLiveKitPhantom) {
    window.daCaiLiveKitPhantom = true;
    let checkRoom = setInterval(() => {
        if (window.room && window.room.state === 'connected') {
            window.room.on('dataReceived', (payload) => {
                try {
                    let data = JSON.parse(new TextDecoder().decode(payload));
                    if (data.type === 'SPAWN_PHANTOM') {
                        let pos = new THREE.Vector3(data.x, data.y, data.z);
                        let diemCuoiVec = data.diemCuoi ? new THREE.Vector3(data.diemCuoi.x, data.diemCuoi.y, data.diemCuoi.z) : null;
                        // Gắn thêm kieuBot và diemCuoi vào hàm Local
                        window.spawnPhantomLocal(data.id, pos, data.name, data.level, data.hp, data.phai, data.model, data.altOffset, data.owner, data.kieuBot, diemCuoiVec);
                    }
                    else if (data.type === 'DESPAWN_PHANTOM') window.xoaPhantomLocal(data.id);
                    else if (data.type === 'BOSS_SKILL' && data.phai === 'FAKE_PLAYER') {
                        let bot = window.danhSachQuaiVat ? window.danhSachQuaiVat.find(q => q.id === data.bossId) : null;
                        if (bot) {
                            let bOrigin = bot.mesh.position.clone();
                            let pTarget = new THREE.Vector3(data.target.x, data.target.y, data.target.z);
                            let bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize();
                            let botFakeId = "PLAYER_" + bot.id;
                            let phaiDung = data.classCode || 'TU_TIEN';

                            if (typeof window.remotePlayers !== 'undefined') {
                                window.remotePlayers[botFakeId] = { status: 'ready', mesh: bot.mesh, name: bot.name, damage: 0, classCode: phaiDung };
                            }

                            if (phaiDung === 'TU_TIEN' && typeof window.tungComboTuTien === 'function') window.tungComboTuTien(data.chieu, true, bOrigin, pTarget, bDir, botFakeId, 'uploads/anims/PHIKIEM.glb');
                            else if (phaiDung === 'PHAP_SU' && typeof window.tungComboPhapSu === 'function') window.tungComboPhapSu(data.chieu, true, bOrigin, pTarget, bDir, botFakeId, 'uploads/anims/vong_phep.glb');
                            else if (phaiDung === 'CUNG_THU' && typeof window.tungComboCungThu === 'function') window.tungComboCungThu(data.chieu, true, bOrigin, pTarget, bDir, botFakeId, 'uploads/anims/CUNGTEN.glb');
                            else if (phaiDung === 'XA_THU' && typeof window.tungComboBanSung === 'function') window.tungComboBanSung(data.chieu, true, bOrigin, pTarget, bDir, botFakeId, 'uploads/anims/GUN.glb');
                            else if (phaiDung === 'LAZER' && typeof window.tungComboLazer === 'function') window.tungComboLazer(data.chieu, true, bOrigin, pTarget, bDir, botFakeId, null);

                            setTimeout(() => { if (typeof window.remotePlayers !== 'undefined') delete window.remotePlayers[botFakeId]; }, 100);
                        }
                    }
                    else if (data.type === 'BOSS_HIT') {
                        let bot = window.danhSachQuaiVat ? window.danhSachQuaiVat.find(q => q.id === data.id) : null;
                        if (bot && bot.fakePhai) {
                            bot.hp -= data.damageDealt;
                            if (bot.hp < 0) bot.hp = 0;
                            if (bot.tagEl) {
                                let bar = bot.tagEl.querySelector('.hp-bar');
                                if (bar) bar.style.width = Math.max(0, (bot.hp / bot.maxHp) * 100) + '%';
                            }
                        }
                    }
                } catch (e) { }
            });
            clearInterval(checkRoom);
        }
    }, 1000);
}

// 🛠️ HÀM ĐẺ LOCAL (THÊM THAM SỐ KIEU BOT & DIEM CUOI)
window.spawnPhantomLocal = function (botId, posBot, tenBot, levelBot, hpBot, phaiChon, modelBot, altOffset, chuSohuu, kieuBot, diemCuoi) {
    if (window.danhSachQuaiVat && window.danhSachQuaiVat.find(q => q.id === botId)) return;

    if (typeof window.sinhRaQuaiVat === 'function') {
        window.sinhRaQuaiVat(posBot.x, posBot.z, tenBot, levelBot, hpBot, 2.5, posBot.y, true, botId, modelBot, hpBot, 0, 'FAKE_PLAYER');

        let vongLapGiauTen = setInterval(() => {
            let botHienTai = window.danhSachQuaiVat && window.danhSachQuaiVat.find(q => q.id === botId);
            if (botHienTai && botHienTai.tagEl) {
                botHienTai.chuSohuu = chuSohuu;
                botHienTai.kieuBot = kieuBot || 'HUNTER'; // Mặc định là Sát thủ nếu mất gói tin
                botHienTai.diemCuoi = diemCuoi;
                botHienTai.altOffset = altOffset || (Math.random() * 15 + 15);
                botHienTai.fakePhai = phaiChon;
                botHienTai.name = tenBot;
                botHienTai.exp = 20;
                botHienTai.damage = Math.max(5, (levelBot || 1) * 8);

                let htmlMoi = `<div style="color:#2ecc71; font-weight:bold; font-size:16px; text-shadow:1px 1px 0 #000; text-align:center;">${tenBot}</div>
                               <div style="width:80px; height:5px; background:rgba(0,0,0,0.5); border:1px solid #fff; border-radius:3px; margin:0 auto; margin-top:3px; overflow:hidden;">
                                   <div class="hp-bar" style="width:100%; height:100%; background:#e74c3c; transform-origin: left center; transition: width 0.2s, transform 0.2s;"></div>
                               </div>`;
                botHienTai.tagEl.innerHTML = htmlMoi;
                clearInterval(vongLapGiauTen);
            }
        }, 10);
        setTimeout(() => clearInterval(vongLapGiauTen), 3000);
    }
};

// 🛠️ HÀM XÓA LOCAL
window.xoaPhantomLocal = function (id) {
    if (!window.danhSachQuaiVat) return;
    let bot = window.danhSachQuaiVat.find(q => q.id === id);
    if (bot) {
        if (bot.tagEl && bot.tagEl.parentNode) bot.tagEl.parentNode.removeChild(bot.tagEl);
        if (typeof window.donRac3D === 'function') window.donRac3D(bot.mesh); else if (typeof scene !== 'undefined') scene.remove(bot.mesh);
        window.danhSachQuaiVat = window.danhSachQuaiVat.filter(q => q.id !== id);
    }
};

// 3. MÁY PHÁT HÀNH LÒ ĐẺ (CHIA NHÂN PHẨM 50/50)
window.mayPhatHanhBotGia = function () {
    if (!window.playerModel || window.isDead) return;

    let tongLevel = window.LEVEL_CUA_TOI || 1; let soNguoi = 1;
    if (window.remotePlayers) {
        for (let id in window.remotePlayers) {
            let rp = window.remotePlayers[id];
            if (rp && rp.status === 'ready' && rp.mesh && window.playerModel.position.distanceTo(rp.mesh.position) < 5000) {
                tongLevel += (window.LEVEL_CUA_TOI || 1) + Math.floor((Math.random() - 0.5) * 5); soNguoi++;
            }
        }
    }
    let levelBot = Math.max(1, Math.round(tongLevel / soNguoi));
    let hpBot = 500 + ((levelBot - 1) * 20);

    const phaiNguoi = ['TU_TIEN', 'PHAP_SU', 'XA_THU', 'CUNG_THU', 'LAZER'];
    let phaiChon = phaiNguoi[Math.floor(Math.random() * phaiNguoi.length)];

    let modelBot = 'uploads/anims/mimi_3d.glb';
    if (typeof window.MODEL_MAC_DINH_CAC_PHAI !== 'undefined' && window.MODEL_MAC_DINH_CAC_PHAI[phaiChon]) {
        modelBot = window.MODEL_MAC_DINH_CAC_PHAI[phaiChon];
    }

    let fwd = new THREE.Vector3(); window.playerModel.getWorldDirection(fwd);
    let upV = window.playerModel.up.clone().normalize();
    let right = new THREE.Vector3().crossVectors(fwd, upV).normalize();

    // 🌟 QUAY SỐ NHÂN PHẨM: 50% là Sát thủ (HUNTER), 50% là Người qua đường (PASSERBY)
    let kieuBot = Math.random() < 0.5 ? 'PASSERBY' : 'HUNTER';

    let posBot = window.playerModel.position.clone();
    let diemCuoi = null;
    let altOffset = Math.random() * 15 + 15;

    if (kieuBot === 'PASSERBY') {
        // Đẻ từ cách Sếp 2000m bên hông trái/phải, và 600m trước mặt để tránh bị Sếp vô tình va quệt
        let laBenTrai = Math.random() > 0.5;
        let khoangCachTruocMat = 200 + Math.random() * 100;
        let khoangCachNgang = 10000;

        posBot.add(fwd.clone().multiplyScalar(khoangCachTruocMat));
        posBot.add(right.clone().multiplyScalar(laBenTrai ? -khoangCachNgang : khoangCachNgang));
        posBot.add(upV.clone().multiplyScalar(altOffset));

        // Đích đến là bờ bên kia đại dương
        diemCuoi = window.playerModel.position.clone();
        diemCuoi.add(fwd.clone().multiplyScalar(khoangCachTruocMat));
        diemCuoi.add(right.clone().multiplyScalar(laBenTrai ? khoangCachNgang : -khoangCachNgang));
        diemCuoi.add(upV.clone().multiplyScalar(altOffset));

        console.log(`🕊️ PHANTOM: [Người qua đường] đang bay lướt ngang qua!`);
    } else {
        // Hunter thì đẻ gần hơn để rượt (như cũ)
        let khoangCachDe = 500 + Math.random() * 100;
        let laTruocMat = Math.random() > 0.5;
        let gocDe = (laTruocMat ? 0 : Math.PI) + (Math.random() * 0.4 - 0.2);

        posBot.add(fwd.multiplyScalar(Math.cos(gocDe) * khoangCachDe));
        posBot.add(right.multiplyScalar(Math.sin(gocDe) * khoangCachDe));
        posBot.add(upV.multiplyScalar(altOffset));

        console.log(`⚔️ PHANTOM: [Sát thủ] đang tiếp cận!`);
    }

    let tenBot = window.taoTenNguoiChoiGia();
    let botId = "PHANTOM_" + Date.now() + "_" + Math.floor(Math.random() * 100);

    window.spawnPhantomLocal(botId, posBot, tenBot, levelBot, hpBot, phaiChon, modelBot, altOffset, window.myUsername, kieuBot, diemCuoi);

    if (window.room && window.room.state === 'connected') {
        let dcObj = diemCuoi ? { x: diemCuoi.x, y: diemCuoi.y, z: diemCuoi.z } : null;
        let data = { type: 'SPAWN_PHANTOM', id: botId, x: posBot.x, y: posBot.y, z: posBot.z, name: tenBot, level: levelBot, hp: hpBot, phai: phaiChon, model: modelBot, altOffset: altOffset, owner: window.myUsername, kieuBot: kieuBot, diemCuoi: dcObj };
        window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(data)), { reliable: true });
    }
};

// 4. KIỂM SOÁT DÂN SỐ (10 PHÚT ĐẺ 1 LẦN)
setInterval(() => {
    if (!window.playerModel || window.isDead) return;

    // Tìm xem xung quanh có thằng Phantom nào đang bay không
    let botGanToi = 0;
    if (window.danhSachQuaiVat) {
        botGanToi = window.danhSachQuaiVat.filter(q => q.id && q.id.includes("PHANTOM") && !q.isDead && q.mesh && q.mesh.position.distanceTo(window.playerModel.position) < 5000).length;
    }

    // Nếu vắng bóng Phantom (dưới 1 con) thì chắc chắn 100% đẻ ra 1 con!
    if (botGanToi < 1) window.mayPhatHanhBotGia();

}, 600000); // 600.000 mili-giây = 10 phút!
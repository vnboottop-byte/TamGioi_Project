// ==========================================
// 🐲 MÔN PHÁI: RỒNG THẦN (BẢN V67 - ĐỘC TÔN HỎA LONG CHÂN CHÍNH)
// ==========================================
console.log("🐲 Đã load Bí Kíp Rồng (Xóa Lazer - Hỏa Long bành trướng)!");

window.hieuUngRong = window.hieuUngRong || [];







// 🌟 KHAI BÁO KHO CHỨA HỒI CHIÊU CỦA BOSS RỒNG
window.thoiGianChoRong = window.thoiGianChoRong || {};

// 🌟 ĐÃ THÊM ĐUÔI isRemote = false
window.tungComboRong = function(chieu, dmgBoss, bOrigin, pTarget, bDir, tempId, weaponUrl, isRemote = false) {
    if (!window.scene) return;
    
    // 🛑 BỘ LỌC CHỐNG SPAM KHẠC LỬA (NGHỈ 3 GIÂY)
    let bayGio = Date.now();
    if (tempId) {
        // Khạc 3 giây + Nghỉ 3 giây = Tổng Cooldown là 6000ms
        if (window.thoiGianChoRong[tempId] && bayGio - window.thoiGianChoRong[tempId] < 6000) {
            return; // Đang kiệt sức, chưa hồi xong thì nghỉ!
        }
        window.thoiGianChoRong[tempId] = bayGio; // Lưu lại thời điểm bắt đầu khạc
    }

    let mucTieu = new THREE.Vector3(pTarget.x, pTarget.y, pTarget.z);
    let huong = new THREE.Vector3().subVectors(mucTieu, bOrigin).normalize();

    // 🌟 TRUYỀN isRemote XUỐNG HÀM TẠO LỬA
    taoBuiLuaMienMan(bOrigin, huong, dmgBoss, isRemote);
};







 

// 🌟 CHIÊU DUY NHẤT: BỤI LỬA NỞ TO DẦN (Phun xa & Rộng)
function taoBuiLuaMienMan(origin, dir, dame, isRemote) {
    let ticks = 0;
    // Bắn liên tục trong 3 giây (30 nhịp * 100ms)
    let luongPhat = setInterval(() => {
        ticks++;
        if (ticks > 30) { clearInterval(luongPhat); return; } // 🌟 SỬA 60 THÀNH 30 ĐỂ KHẠC ĐÚNG 3 GIÂY

        // 🌟 BẮT ĐẦU DÁN: RADAR QUÉT MỤC TIÊU LIÊN TỤC (BẢN KHÔNG GIAN CONG)









        // 🌟 BẮT ĐẦU DÁN: RADAR QUÉT MỤC TIÊU LIÊN TỤC (BẢN KHÔNG GIAN CONG)
        if (!isRemote && window.playerModel) {
            let mucTieuHienTai = window.playerModel.position.clone();
            // Cập nhật nhắm thẳng vào ngực theo trục UP của Sếp (Bỏ trục Y)
            mucTieuHienTai.add(window.playerModel.up.clone().multiplyScalar(5)); 
            dir = new THREE.Vector3().subVectors(mucTieuHienTai, origin).normalize();
        }
        // 🌟 KẾT THÚC DÁN











        const soLuong = 200; // Nhả cực nhiều hạt bụi
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = origin.x; posArr[i * 3 + 1] = origin.y; posArr[i * 3 + 2] = origin.z;
            
            // Góc tản mác siêu nhỏ lúc ở mồm (để lửa nén lại)
            let spreadX = (Math.random() - 0.5) * 1.5;
            let spreadY = (Math.random() - 0.5) * 1.5;
            let spreadZ = (Math.random() - 0.5) * 1.5;
            
            let speed = 15 + Math.random() * 10; // Bay cực nhanh, lao thẳng tới người chơi
            let v = dir.clone().multiplyScalar(speed).add(new THREE.Vector3(spreadX, spreadY, spreadZ));
            vels.push(v);
        }

        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        
        const texture = (typeof window.layTextureLua === 'function') ? window.layTextureLua() : null;
        const mat = new THREE.PointsMaterial({ 
            color: 0xffddaa, // Trắng vàng chói lóa
            size: 15.0, // 🌟 Bắt đầu ở mồm rồng với size rất nhỏ
            map: texture, 
            transparent: true, 
            opacity: 1.0, 
            blending: THREE.AdditiveBlending, 
            depthWrite: false 
        });
        
        const pts = new THREE.Points(geo, mat);
        window.scene.add(pts);

        // Life: 80 Frames (~2.5 giây bay xa tít tắp)
        window.hieuUngRong.push({ system: pts, velocities: vels, life: 200, damage: dame });
    }, 100); 
}

// ==========================================
// ⚙️ VÒNG LẶP XỬ LÝ VẬT LÝ VÀ DỌN RÁC TOÀN CẦU CHO RỒNG
// ==========================================
if (!window.loopRongRunning) {
    window.loopRongRunning = true;
    setInterval(() => {
        for (let i = window.hieuUngRong.length - 1; i >= 0; i--) {
            let h = window.hieuUngRong[i];
            h.life--;

            if (h.system) {
                let posArr = h.system.geometry.attributes.position.array;
                for (let j = 0; j < posArr.length / 3; j++) {
                    posArr[j*3] += h.velocities[j].x;
                    posArr[j*3+1] += h.velocities[j].y;
                    posArr[j*3+2] += h.velocities[j].z;
                    
                    // Lửa tản mác ra xung quanh khi bay xa
                    h.velocities[j].x *= 1.01; 
                    h.velocities[j].y *= 1.01;
                    h.velocities[j].z *= 1.01;
                }
                h.system.geometry.attributes.position.needsUpdate = true;
                
                // 🌟 THUẬT TOÁN ĂN TIỀN: Lửa phình to cực đại theo thời gian bay
                h.system.material.size += 2.0; 
                
                // Mờ dần theo thời gian
                h.system.material.opacity = h.life / 200;
                
                // Nguội dần khi bay xa
                if (h.life < 50) h.system.material.color.setHex(0xff3300); // Cam rực
                if (h.life < 20) h.system.material.color.setHex(0x550000); // Khói đỏ đen

                // Quét sát thương (Tầm ảnh hưởng tăng theo độ bự của lửa)
                if (h.life % 5 === 0 && window.playerModel) {
                    let pPos = new THREE.Vector3(posArr[0], posArr[1], posArr[2]);
                    let tamSatThuong = h.system.material.size * 0.8; // Càng bay xa, vùng chết chóc càng lớn
                    if (pPos.distanceTo(window.playerModel.position) < tamSatThuong) {
                        if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(pPos, h.damage, tamSatThuong);
                    }
                }

                // Chết là đưa vào Lò Đốt Rác ngay
                if (h.life <= 0) {
                    if (typeof window.donRac3D === 'function') window.donRac3D(h.system);
                    window.hieuUngRong.splice(i, 1);
                }
            }
        }
    }, 30);
}


// ==========================================
// 🌟 TIÊM LÕI AI TẤN CÔNG VÀO TỪ ĐIỂN BÁCH THÚ (RỒNG)
// ==========================================
window.TU_DIEN_AI_QUAI = window.TU_DIEN_AI_QUAI || {};
window.TU_DIEN_AI_QUAI['RONG'] = window.TU_DIEN_AI_QUAI['RONG'] || {};

window.TU_DIEN_AI_QUAI['RONG'].thucHienTanCong = function (quai, playerModel, delta) {
    let thoiGianCho = Date.now() - quai.lastAttackTime;

    // Từ giây 3 đến 5.5: Xoay cổ rà mục tiêu cực chậm
    if (thoiGianCho > 3000 && thoiGianCho < 5500) {
        let huongRongPhang = new THREE.Vector3().subVectors(playerModel.position, quai.mesh.position).projectOnPlane(quai.upVector).normalize();
        let dummy = new THREE.Object3D();
        dummy.position.copy(quai.mesh.position);
        dummy.up.copy(quai.upVector);
        dummy.lookAt(quai.mesh.position.clone().add(huongRongPhang));
        quai.mesh.quaternion.slerp(dummy.quaternion, 0.015);
    }

    // Giây thứ 6: Khạc lửa
    if (thoiGianCho > 6000) {
        quai.lastAttackTime = Date.now();
        let sizeChuan = quai.heSoToLon * 20;
        const bOrigin = quai.mesh.position.clone(); bOrigin.add(quai.upVector.clone().multiplyScalar(sizeChuan * 0.4));
        const pTarget = playerModel.position.clone(); pTarget.add(playerModel.up.clone().multiplyScalar(5));
        const bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize(); bOrigin.add(bDir.clone().multiplyScalar(sizeChuan * 0.5));
        let dmgBoss = quai.maxHp * 0.05;

        if (typeof window.tungComboRong === 'function') window.tungComboRong('F', dmgBoss, bOrigin, pTarget, bDir, "BOSS_" + quai.id, null);
        if (window.room && window.room.state === 'connected') {
            try { window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'BOSS_SKILL', bossId: quai.id, target: { x: pTarget.x, y: pTarget.y, z: pTarget.z }, phai: quai.classCode, chieu: 'F' })), { reliable: true }); } catch (e) { }
        }
    }
};
// ==========================================
// 🌐 LIVEKIT ĐA VŨ TRỤ (BẢN V21 - CÔNG NGHỆ NHÂN BẢN VÔ TÍNH SKELETON UTILS)
// ==========================================
const livekitScript = document.createElement('script');
livekitScript.src = 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js';
document.head.appendChild(livekitScript);
window.remotePlayers = {}; 
window.room = null;
window.khoModelMau = {}; // 🌟 KHO CHỨA MODEL MẪU ĐỂ NHÂN BẢN (CHỐNG GIẬT LAG)
// 🌟 BỘ MÁY AI PHIÊN DỊCH ANIMATION TỰ ĐỘNG (DÙNG CHO 1000 NHÂN VẬT)
window.phienDichAnimation = function(mixer, clips) {
    const kq = {};
    if (!clips) return kq;
    clips.forEach(clip => {
        let tenGoc = clip.name.toUpperCase();
        let act = mixer.clipAction(clip);
        kq[tenGoc] = act; 
        
        if (tenGoc.includes('RUN') || tenGoc.includes('WALK')) kq['CHAYBO'] = act;
        
        // 🌟 Bổ sung từ khóa nhận diện Bay/Bơi
        if (tenGoc.includes('JUMP') || tenGoc.includes('FLY') || tenGoc.includes('FLOAT') || tenGoc.includes('SWIM')) kq['BAY'] = act;
        
        if (tenGoc.includes('DAMAGE') || tenGoc.includes('HIT')) kq['HIT'] = act;
        if (tenGoc.includes('LOSE') || tenGoc.includes('DIE') || tenGoc.includes('DEATH')) kq['CHET'] = act;
        
        if (tenGoc.includes('IDLE') || tenGoc.includes('WAIT')) {
            if (tenGoc.includes('HOME') || tenGoc.includes('SIT')) kq['NHANROI_CUOITHU'] = act;
            if (!kq['NHANROI']) kq['NHANROI'] = act; 
        }
    });
    if (!kq['NHANROI_CUOITHU']) kq['NHANROI_CUOITHU'] = kq['NHANROI'];
    // 🌟 THUẬT TOÁN THÔNG MINH: Nếu không có Animation CHẠY BỘ, lấy Animation BAY đắp vào!
    if (!kq['CHAYBO']) kq['CHAYBO'] = kq['BAY'] || kq['NHANROI']; 
    return kq;
};

// 🌟 HÀM TẢI HOẶC NHÂN BẢN SIÊU TỐC (CHÌA KHÓA CỦA ĐỘ MƯỢT)
function taiHoacNhanBan(url, callback) {
    // Nếu trong kho đã có rồi -> Photocopy ngay lập tức, không tải nữa
    if (window.khoModelMau[url]) {
        console.log("⚡ Nhân bản siêu tốc từ kho: " + url);
        const cloneScene = SkeletonUtils.clone(window.khoModelMau[url].scene);
        callback(cloneScene, window.khoModelMau[url].animations);
        return;
    }

    // Nếu chưa có -> Tải về và cất vào kho
    const loader = window.loaderSieuToc || new THREE.GLTFLoader();
    loader.load(url, (gltf) => {
        window.khoModelMau[url] = { scene: gltf.scene, animations: gltf.animations };
        console.log("📦 Đã tải và cất vào kho model mẫu: " + url);
        const cloneScene = SkeletonUtils.clone(gltf.scene);
        callback(cloneScene, gltf.animations);
    });
}

// 🌟 TÁI TẠO NGƯỜI CHƠI TỪ TỔNG KHO ASSET (BẢN V22 - FIX CÚ PHÁP VÀ VŨ KHÍ)
function taoBanSaoNguoiChoi(identity, data) {
    if (window.remotePlayers[identity]) return;
    
    let rp = { status: 'loading', pos: new THREE.Vector3(data.x, data.y, data.z) };
    window.remotePlayers[identity] = rp;

    const tag = document.createElement('div');
    
    // 🌟 BẢN VÁ: Thu nhỏ bảng tên người chơi
    let sizeChu = window.isMobile ? "10px" : "13px";
    let widthMau = window.isMobile ? "45px" : "65px";

    tag.innerHTML = `
        <div style="color:#00ffff; font-weight:bold; font-size:${sizeChu}; text-shadow:1px 1px 0 #000; text-align:center; white-space:nowrap;">
            ${identity}
        </div>
        <div style="width:${widthMau}; height:4px; background:rgba(0,0,0,0.5); border:1px solid #fff; margin:2px auto 0 auto; border-radius:2px;">
            <div class="hp-bar" style="width:${(data.hp/data.maxHp)*100}%; height:100%; background:#e74c3c; transition: width 0.2s;"></div>
        </div>`;
        
    tag.style.cssText = 'position:absolute; pointer-events:none; z-index:9; transform:translate(-50%, -100%); display:none;';
    document.body.appendChild(tag);

    rp.tag = tag;

    // TẬN DỤNG TỔNG KHO ASSET
    const mountUrl = data.mount;
    const charUrl = data.model;
    // 🌟 BẢN VÁ AAA: GIẢI PHÓNG TRẠNG THÁI LOADING NẾU HỤT DATA SQL ĐỂ THỬ LẠI KHUNG HÌNH SAU!
    if (!charUrl || charUrl.trim() === '') {
        if (tag) tag.remove();
        delete window.remotePlayers[identity];
        return;
    }



    if (mountUrl && mountUrl.trim() !== "") {
        // 1. TẢI RỒNG
        window.taiHoacNhanBanAsset(mountUrl, (thuCuoi, animationsMount) => {
            if (typeof epKhuonChuan === 'function') epKhuonChuan(thuCuoi, 15);
            thuCuoi.position.copy(rp.pos); 
            thuCuoi.traverse(c => { if (c.isMesh) { c.frustumCulled = false; c.castShadow = true; } }); 
            scene.add(thuCuoi);

            const mixer = new THREE.AnimationMixer(thuCuoi); const anims = {};
            if(animationsMount) animationsMount.forEach(clip => { anims[clip.name.toUpperCase()] = mixer.clipAction(clip); });

            // 2. TẢI NGƯỜI CƯỠI RỒNG
            window.taiHoacNhanBanAsset(charUrl, (nhanVat, animationsChar) => {
                // 🛑 VÁ LỖI 1: Dùng thước đo tối tân của Engine
                if (typeof window.chuanHoaKichThuoc === 'function') window.chuanHoaKichThuoc(nhanVat, 2.5);
                nhanVat.traverse(c => { if (c.isMesh) c.frustumCulled = false; });

                let mixerChar = new THREE.AnimationMixer(nhanVat); 
                const animsChar = window.phienDichAnimation(mixerChar, animationsChar);

                // TÌM YÊN NGỰA
                let xuongYenNgua = null;
                thuCuoi.traverse(c => { if (c.isBone && c.name.toUpperCase().includes('YENNGUA')) xuongYenNgua = c; });
                let chaCuaNhanVat = xuongYenNgua ? xuongYenNgua : thuCuoi;
                chaCuaNhanVat.add(nhanVat);

                // 🛑 VÁ LỖI 2: TIÊM KHÁNG SINH CHỐNG TEO NHỎ (Y hệt engine.js)
                let tyLeThuCuoi = thuCuoi.scale.x === 0 ? 1 : thuCuoi.scale.x;
                nhanVat.scale.set(
                    nhanVat.scale.x / tyLeThuCuoi,
                    nhanVat.scale.y / tyLeThuCuoi,
                    nhanVat.scale.z / tyLeThuCuoi
                );

                nhanVat.position.set(0, (xuongYenNgua ? 0 : 3), 0);

                let isCungThu = data.phai && data.phai.toLowerCase().includes('cungthu');
                // 🌟 BẢN VÁ: Gọt sạch CUNG.glb. Dùng trực tiếp data mạng truyền về!
                let linkVuKhi = data.weapon;

                if (linkVuKhi && linkVuKhi.trim() !== "") {

                    window.taiHoacNhanBanAsset(linkVuKhi, (vuKhi) => {
                        vuKhi.traverse(c => { if (c.isMesh) c.frustumCulled = false; });
                        let tayCam = null;
                        
                        nhanVat.traverse(c => { 
                            if (c.isBone) {
                                let n = c.name.toUpperCase();
                                if (isCungThu && (n.includes('HAND_L') || n.includes('HAND.L') || n.includes('LEFTHAND'))) {
                                    tayCam = c;
                                } else if (!isCungThu && (n.includes('HAND_R') || n.includes('HAND.R') || n.includes('RIGHTHAND'))) {
                                    tayCam = c;
                                }
                            } 
                        });

                        if (tayCam) { 
                            tayCam.add(vuKhi); 
                            vuKhi.position.set(0,0,0); 
                            vuKhi.rotation.set(0,0,0); 
                            
                            // Nắn tỷ lệ và ẨN MẶC ĐỊNH cho Cung, chờ file phai_cungthu.js gọi nó ra!
                            if (isCungThu) {
                                vuKhi.updateMatrixWorld(true);
                                const box = new THREE.Box3().setFromObject(vuKhi);
                                const size = new THREE.Vector3(); box.getSize(size);
                                const maxDim = Math.max(size.x, size.y, size.z);
                                if (maxDim > 0.05) vuKhi.scale.setScalar(1.8 / maxDim);
                                vuKhi.visible = false; 
                            }
                        } 
                        else { nhanVat.add(vuKhi); vuKhi.position.set(1, 1, 0); }
                        
                        // 🌟 CHÌA KHÓA TRAO QUYỀN LỰC CHO SẾP (NÓ SẼ TỰ ĐỘNG LIVE)
                        rp.vuKhiModel = vuKhi;
                    });
                }
                rp.mesh = thuCuoi; rp.meshChar = nhanVat; rp.mixer = mixer; rp.mixerChar = mixerChar; rp.anims = anims; rp.animsChar = animsChar; rp.status = 'ready'; rp.currentAnim = '';
            });
        });
    } else {
        // 1. TẢI NGƯỜI ĐI BỘ
        window.taiHoacNhanBanAsset(charUrl, (nhanVat, animationsChar) => {
            if (typeof window.chuanHoaKichThuoc === 'function') window.chuanHoaKichThuoc(nhanVat, 2.5);
            nhanVat.position.copy(rp.pos); 
            nhanVat.traverse(c => { if (c.isMesh) { c.frustumCulled = false; c.castShadow = true; } }); 
            scene.add(nhanVat);

            let mixer = new THREE.AnimationMixer(nhanVat); 
            const anims = window.phienDichAnimation(mixer, animationsChar);




            // 2. 🌟 TẢI VŨ KHÍ CHO NGƯỜI ĐI BỘ (BẢN VÁ ĐỒNG BỘ LIVE 100%)
            let isCungThu = data.phai && data.phai.toLowerCase().includes('cungthu');
            let linkVuKhi = isCungThu ? 'uploads/anims/CUNG.glb' : data.weapon;

            if (linkVuKhi && linkVuKhi.trim() !== "") {
                window.taiHoacNhanBanAsset(linkVuKhi, (vuKhi) => {
                    vuKhi.traverse(c => { if (c.isMesh) c.frustumCulled = false; });
                    let tayCam = null;
                    
                    nhanVat.traverse(c => { 
                        if (c.isBone) {
                            let n = c.name.toUpperCase();
                            if (isCungThu && (n.includes('HAND_L') || n.includes('HAND.L') || n.includes('LEFTHAND'))) {
                                tayCam = c;
                            } else if (!isCungThu && (n.includes('HAND_R') || n.includes('HAND.R') || n.includes('RIGHTHAND'))) {
                                tayCam = c;
                            }
                        } 
                    });

                    if (tayCam) { 
                        tayCam.add(vuKhi); 
                        vuKhi.position.set(0,0,0); 
                        vuKhi.rotation.set(0,0,0); 
                        
                        if (isCungThu) {
                            vuKhi.updateMatrixWorld(true);
                            const box = new THREE.Box3().setFromObject(vuKhi);
                            const size = new THREE.Vector3(); box.getSize(size);
                            const maxDim = Math.max(size.x, size.y, size.z);
                            if (maxDim > 0.05) vuKhi.scale.setScalar(1.8 / maxDim);
                            
                            // 🌟 ẨN CUNG ĐI (Để phai_cungthu.js tự lo việc mở lên khi bắn)
                            vuKhi.visible = false; 
                        }
                    } 
                    else { nhanVat.add(vuKhi); vuKhi.position.set(1, 1, 0); }

                    // 🌟 LƯU VÀO RP ĐỂ CÁC FILE HỆ PHÁI CÓ THỂ "LIVE" NÓ
                    rp.vuKhiModel = vuKhi;
                });
            }


            
            rp.mesh = nhanVat; rp.meshChar = nhanVat; rp.mixer = mixer; rp.anims = anims; rp.status = 'ready'; rp.currentAnim = '';
        });
    }
}

// ==========================================
// 🔴 PHẦN LOGIC MẠNG (GIỮ NGUYÊN 100%)
// ==========================================
livekitScript.onload = async () => {
    const loginGate = document.getElementById('loginGate');
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            if (loginBtn.disabled) return; 
            const userText = document.getElementById('usernameInput').value.trim();
            if (userText.length < 2) return; 
            loginBtn.disabled = true;
            try {
                const response = await fetch('api/lk_token.php?u=' + encodeURIComponent(userText) + '&nocache=' + Date.now());
                const authData = await response.json();
                if (!authData.token) { loginBtn.disabled = false; return; }
                window.myUsername = authData.username;
                window.room = new LivekitClient.Room({ adaptiveStream: false, dynacast: false, autoSubscribe: true });

                await window.room.connect(authData.url, authData.token);
                console.log("%c🟢 Đã vào Cổng Cực Lạc: " + window.room.name, "color:#2ecc71; font-weight:bold;");
                if (loginGate) loginGate.style.display = 'none';









                // 🛑 ĐÃ GỠ BỎ TƯỜNG LỬA PUBLISH_DATA GÂY TÀNG HÌNH NGƯỜI CHƠI!
                
                // ==========================================
                // 🚪 XỬ LÝ NGƯỜI CHƠI THOÁT GAME 
                // ==========================================
                window.room.on('participantDisconnected', (participant) => {
                    if (window.remotePlayers && window.remotePlayers[participant.identity]) {
                        const playerLeaver = window.remotePlayers[participant.identity];
                        if (playerLeaver.mesh) {
                            if (playerLeaver.mesh.parent) playerLeaver.mesh.parent.remove(playerLeaver.mesh);
                            scene.remove(playerLeaver.mesh);
                        }
                        if (playerLeaver.tag) playerLeaver.tag.remove();
                        delete window.remotePlayers[participant.identity];
                    }
                });

                window.room.on('trackSubscribed', (track, publication, participant) => {
                    if (track.kind === 'audio') {
                        const audioElement = track.attach();
                        audioElement.style.display = 'none'; document.body.appendChild(audioElement);
                        audioElement.play().catch((error) => {});
                    }
                });

                window.room.on('trackUnsubscribed', (track, publication, participant) => {
                    track.detach().forEach(el => el.remove());
                });

                window.room.on('dataReceived', (payload, participant) => {
                    try {
                        let data = JSON.parse(new TextDecoder().decode(payload));
                        const senderId = participant.identity;

                        // ==========================================
                        // 1. NẾU LÀ MẢNG (DATA TỌA ĐỘ NGƯỜI CHƠI)
                        // ==========================================
                        if (Array.isArray(data) && data[0] === 1) {
                            // 🌟 BẢN VÁ: Chỉ lọc Map khi Controller có gửi Map (Tránh xóa nhầm tàng hình)
                            let senderZone = data[16];
                            if (senderZone && window.ZONE_ID && senderZone !== window.ZONE_ID) {
                                if (window.remotePlayers[senderId]) {
                                    let rpLeaver = window.remotePlayers[senderId];
                                    if (rpLeaver.mesh) { if (rpLeaver.mesh.parent) rpLeaver.mesh.parent.remove(rpLeaver.mesh); scene.remove(rpLeaver.mesh); }
                                    if (rpLeaver.tag) rpLeaver.tag.remove();
                                    delete window.remotePlayers[senderId];
                                }
                                return; 
                            }

                            let pX = data[1], pY = data[2], pZ = data[3];
                            let khoangCachNguoiChoi = (window.playerModel) ? window.playerModel.position.distanceTo(new THREE.Vector3(pX, pY, pZ)) : 0;
                            
                            if (window.isMobile && khoangCachNguoiChoi > 2500) {
                                if (window.remotePlayers[senderId] && window.remotePlayers[senderId].mesh) {
                                    window.remotePlayers[senderId].mesh.visible = false;
                                    if (window.remotePlayers[senderId].tag) window.remotePlayers[senderId].tag.style.display = 'none';
                                }
                                return; 
                            }

                            let mappedData = {
                                type: 'vitri', x: data[1], y: data[2], z: data[3], rx: data[4], ry: data[5], rz: data[6],
                                size: data[7], hp: data[8], maxHp: data[9], anim: data[10], model: data[11], weapon: data[12], mount: data[13], phai: data[14], vuKhiHienThi: data[15]
                            };

                            let rp = window.remotePlayers[senderId];
                            if (rp && rp.mesh) rp.mesh.visible = true; 

                            if (!rp) { taoBanSaoNguoiChoi(senderId, mappedData); }
                            else if (rp.status === 'ready') {
                                rp.targetPos = new THREE.Vector3(mappedData.x, mappedData.y, mappedData.z);
                                rp.targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(mappedData.rx, mappedData.ry, mappedData.rz, 'XYZ'));
                                
                                if (mappedData.size > 0 && rp.mesh.scale.x !== mappedData.size) rp.mesh.scale.setScalar(mappedData.size);

                                let hpBar = rp.tag ? rp.tag.querySelector('.hp-bar') : null;
                                if (hpBar) hpBar.style.width = Math.max(0, (mappedData.hp / mappedData.maxHp) * 100) + '%';
                                if (rp.vuKhiModel && mappedData.vuKhiHienThi !== undefined) rp.vuKhiModel.visible = (mappedData.vuKhiHienThi === 1);

                                if (mappedData.anim && mappedData.anim !== rp.currentAnim) {
                                    let upAnim = mappedData.anim.toUpperCase();
                                    if (upAnim === 'NHANROI' && mappedData.mount && mappedData.mount.trim() !== '') upAnim = 'NHANROI_CUOITHU';
                                    if (rp.anims && Object.keys(rp.anims).length > 0) {
                                        let action = rp.anims[upAnim] || rp.anims['NHANROI'] || Object.values(rp.anims)[0];
                                        if (action) { if (rp.activeAction) rp.activeAction.fadeOut(0.2); rp.activeAction = action; rp.activeAction.reset().fadeIn(0.2).play(); }
                                    }
                                    if (rp.animsChar && Object.keys(rp.animsChar).length > 0) {
                                        let actionChar = rp.animsChar[upAnim] || rp.animsChar['NHANROI'] || Object.values(rp.animsChar)[0];
                                        if (actionChar) { if (rp.activeActionChar) rp.activeActionChar.fadeOut(0.2); rp.activeActionChar = actionChar; rp.activeActionChar.reset().fadeIn(0.2).play(); }
                                    }
                                    rp.currentAnim = mappedData.anim;
                                }
                            }
                        }

                        // ==========================================
                        // 2. NẾU LÀ ĐỐI TƯỢNG (DATA BOSS, SKILL, PVP)
                        // ==========================================
                        else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {



                            // ==========================================
                            // 👥 CẢM BIẾN TỔ ĐỘI (PARTY)
                            // ==========================================
                            if (data.type === 'PT_INVITE' && data.target === window.myUsername) {
                                let box = document.getElementById('ptInviteBox');
                                if (!box) {
                                    box = document.createElement('div');
                                    box.id = 'ptInviteBox';
                                    box.style.cssText = 'position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(10,15,20,0.95); border:2px solid #2ecc71; padding:15px 25px; border-radius:10px; color:white; z-index:999999; text-align:center; box-shadow:0 0 20px rgba(46, 204, 113, 0.6); animation: nhipTho 1s infinite;';
                                    document.body.appendChild(box);
                                }
                                box.innerHTML = `
                                    <h3 style="margin:0 0 10px 0; color:#2ecc71; text-shadow:0 0 10px #2ecc71;">💌 LỜI MỜI TỔ ĐỘI</h3>
                                    <div style="font-size:14px; margin-bottom:15px;">Đạo hữu <b style="color:#f1c40f; font-size:18px;">${data.sender}</b> muốn mời bạn vào Đội!</div>
                                    <div style="display:flex; gap:10px; justify-content:center;">
                                        <button onclick="traLoiPT('${data.sender}', true)" style="background:linear-gradient(90deg, #2ecc71, #27ae60); border:none; padding:8px 20px; color:black; font-weight:900; border-radius:5px; cursor:pointer;">✅ ĐỒNG Ý</button>
                                        <button onclick="traLoiPT('${data.sender}', false)" style="background:#e74c3c; border:none; padding:8px 20px; color:white; font-weight:900; border-radius:5px; cursor:pointer;">❌ TỪ CHỐI</button>
                                    </div>
                                `;
                                box.style.display = 'block';
                                setTimeout(() => { if (box) box.style.display = 'none'; }, 10000); // 10s tự hủy
                                return;
                            }

                            else if (data.type === 'PT_REPLY' && data.target === window.myUsername) {
                                if (data.accept) {
                                    if (typeof window.hienThongBaoGame === 'function') window.hienThongBaoGame(`🎉 ${data.sender} đã gia nhập Tổ Đội!`, true);
                                } else {
                                    if (typeof window.hienThongBaoGame === 'function') window.hienThongBaoGame(`❌ ${data.sender} đã từ chối lời mời PT!`, false);
                                }
                                return;
                            }




                            if (data.zone_id && window.ZONE_ID && data.zone_id !== window.ZONE_ID) return; 

                            if (data.type === 'BOSS_HIT') {
                                if (typeof window.danhSachQuaiVat !== 'undefined') {
                                    let boss = window.danhSachQuaiVat.find(q => q.id == data.id);
                                    if (boss && !boss.isDead) {
                                        if (data.damageDealt > 0 && typeof taoSoSatThuong === 'function') taoSoSatThuong(new THREE.Vector3(boss.mesh.position.x, boss.mesh.position.y + 10, boss.mesh.position.z), data.damageDealt);
                                        if (typeof boss.playAnim === 'function' && boss.state !== 'ATTACK') boss.playAnim('HIT');
                                        boss.hp = Math.max(0, boss.hp - data.damageDealt);
                                        if (boss.tagEl) { let bar = boss.tagEl.querySelector('.hp-bar'); if (bar) bar.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%'; }
                                    }
                                }
                            }
                            else if (data.type === 'BOSS_POS') {
                                if (typeof window.danhSachQuaiVat !== 'undefined') {
                                    let boss = window.danhSachQuaiVat.find(q => q.id == data.bossId);
                                    if (boss && !boss.isDead) {
                                        let toiLaHost = (!boss.thoiGianBiDieuKhienQuaMang || boss.thoiGianBiDieuKhienQuaMang < Date.now());
                                        if (toiLaHost && window.myUsername > senderId) boss.thoiGianBiDieuKhienQuaMang = Date.now() + 3000;
                                        else if (!toiLaHost) boss.thoiGianBiDieuKhienQuaMang = Date.now() + 3000;

                                        boss.targetPosLK = new THREE.Vector3(data.x, data.y, data.z);
                                        boss.targetAnimLK = data.anim;
                                        if (data.rx !== undefined) boss.targetQuatLK = new THREE.Quaternion().setFromEuler(new THREE.Euler(data.rx, data.ry, data.rz, 'XYZ'));
                                    }
                                }
                            }
                            // ==========================================
                            // 🛡️ XỬ LÝ CHIÊU THỨC BOSS (BÍ THUẬT SPECTATOR CHỐNG ĐẠN ĐUỔI)
                            // ==========================================
                            else if (data.type === 'BOSS_SKILL') {
                                if (data.phai === 'FAKE_PLAYER') return; // Quái ảo để cho quai_vat.js lo

                                if (typeof window.danhSachQuaiVat !== 'undefined') {
                                    let boss = window.danhSachQuaiVat.find(q => q.id == data.bossId);
                                    if (boss && !boss.isDead) {
                                        boss.thoiGianBiDieuKhienQuaMang = Date.now() + 3000;
                                        boss.thoiGianKhoaChieu = Date.now() + 1500; // 🌟 KHÓA CHÂN CHỐNG TRƯỢT
                                        boss.mesh.lookAt(data.target.x, data.target.y, data.target.z);
                                        if (typeof boss.playAnim === 'function') boss.playAnim('ATTACK');
                                        
                                        let dmgBoss = data.dmg || 30;

                                        if (data.phai === 'RONG' && typeof window.tungComboRong === 'function') {
                                            const box = new THREE.Box3().setFromObject(boss.mesh); const size = new THREE.Vector3(); box.getSize(size);
                                            let bOrigin = boss.mesh.position.clone(); bOrigin.y += size.y * 0.35;
                                            let pTarget = new THREE.Vector3(data.target.x, data.target.y, data.target.z);
                                            let bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize(); bOrigin.add(bDir.clone().multiplyScalar(size.z * 0.1));
                                            window.tungComboRong(data.chieu, dmgBoss, bOrigin, pTarget, bDir, data.bossId, null, true);
                                            return; 
                                        }
                                        else if ((data.phai === 'CHIM' || data.phai === 'CA') && typeof window.tungComboChimCa === 'function') {
                                            let bOrigin = boss.mesh.position.clone(); let pTarget = new THREE.Vector3(data.target.x, data.target.y, data.target.z);
                                            let bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize();
                                            window.tungComboChimCa('CAN_CHIEN', dmgBoss, bOrigin, pTarget, bDir, data.bossId, null, true);
                                            return; 
                                        }

                                        let phaiCode = data.phai || 'TU_TIEN'; 
                                        let parts = phaiCode.split('_'); let camelCase = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
                                        let funcName = 'tungCombo' + camelCase;

                                        if (phaiCode === 'SIEUANHHUNG') funcName = 'tungComboLazer';
                                        if (phaiCode === 'CUNG_TEN') funcName = 'tungComboCungThu';
                                        if (phaiCode === 'CAN_CHIEN') funcName = 'tungComboLuyenThe';

                                        let bOrigin = boss.mesh.position.clone();
                                        if (boss.tamThucTeLocal) bOrigin = boss.tamThucTeLocal.clone().applyMatrix4(boss.mesh.matrixWorld); else bOrigin.y += 5;
                                        let pTarget = new THREE.Vector3(data.target.x, data.target.y, data.target.z);
                                        let bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize();
                                        let bossWeapon = (typeof window.VUKHI_MAC_DINH_CAC_PHAI !== 'undefined' && window.VUKHI_MAC_DINH_CAC_PHAI[phaiCode]) ? window.VUKHI_MAC_DINH_CAC_PHAI[phaiCode] : null;
                                        let renderId = "BOSS_" + String(boss.id);




                                        let thiTrienQuaMang = function() {
                                            if (typeof window[funcName] === 'function') {
                                                if (typeof window.remotePlayers !== 'undefined') window.remotePlayers[renderId] = { status: 'ready', mesh: boss.mesh, damage: 0 };

                                                let backupPlayerModel = window.playerModel;
                                                window.playerModel = { position: pTarget.clone() };

                                                // 🌟 BẢN VÁ CUỐI CÙNG: TRUYỀN DAME THẬT! Đạn nổ ai đứng gần sẽ mất máu!
                                                try { window[funcName](data.chieu, dmgBoss, bOrigin, pTarget, bDir, renderId, bossWeapon); } catch (e) { }

                                                window.playerModel = backupPlayerModel;

                                                // Chờ 8s cho đạn bay xong mới dọn Bóng ma Boss
                                                setTimeout(() => { if (typeof window.remotePlayers !== 'undefined') delete window.remotePlayers[renderId]; }, 8000);
                                            } else {
                                                if (typeof window.bossTungTuyetKieu === 'function') window.bossTungTuyetKieu(boss, pTarget, phaiCode, data.chieu);
                                            }
                                        };



                                        if (typeof window[funcName] === 'function') thiTrienQuaMang();
                                        else {
                                            if (!window.dangTaiVoCongBoss) window.dangTaiVoCongBoss = {};
                                            if (!window.dangTaiVoCongBoss[phaiCode]) {
                                                window.dangTaiVoCongBoss[phaiCode] = true;
                                                let fileName = phaiCode.toLowerCase().replace(/_/g, ''); 
                                                let theScript = document.createElement('script');
                                                theScript.src = 'js/' + fileName + '.js?v=' + Date.now();
                                                theScript.onload = function() { thiTrienQuaMang(); };
                                                document.head.appendChild(theScript);
                                            }
                                        }
                                    }
                                }
                            }
















                            // 🌟 BẢN VÁ AAA: LAZY LOAD VÀ BÍ THUẬT LÁ CHẮN TỔ ĐỘI (CHỐNG MẤT MÁU X2)
                            else if (data.type === 'TUNG_CHIEU') {
                                let tenHam = 'tungCombo' + data.className;

                                // ========================================================
                                // 🛡️ BÍ THUẬT HẠT TIÊU: ÉP DAME CỦA TẤT CẢ ĐẠN BAY VỀ 0.000001
                                // ========================================================
                                function runSkill() {
                                    let origDmg = null;
                                    // Ép sát thương của TẤT CẢ người chơi khác (Địch lẫn Ta) về mức Vi hạt
                                    // Dame thật sự sẽ chỉ được nhận qua đường truyền 'BI_CHEM'
                                    if (window.remotePlayers[senderId]) {
                                        origDmg = window.remotePlayers[senderId].damage;
                                        window.remotePlayers[senderId].damage = 0.000001;
                                    }

                                    if (typeof window[tenHam] === 'function') {
                                        window[tenHam](data.skillType, true, data.origin, data.target, data.dir, senderId, data.weaponUrl);
                                    }

                                    if (window.remotePlayers[senderId] && origDmg !== null) {
                                        window.remotePlayers[senderId].damage = origDmg; // Trả lại sức mạnh ngay sau khi xuất chiêu
                                    }
                                }

                                if (typeof window[tenHam] === 'function') { runSkill(); }
                                else {
                                    if (!window.dangTaiVoCong) window.dangTaiVoCong = {};
                                    if (window.dangTaiVoCong[data.className]) return;
                                    window.dangTaiVoCong[data.className] = true;

                                    let backupHePhai = window.HePhaiHienTai; let backupIdle = window.KHO_ANIM_NHANROI ? [...window.KHO_ANIM_NHANROI] : []; let backupAtk = window.KHO_ANIM_TANCONG ? [...window.KHO_ANIM_TANCONG] : []; let backupAnimNhanRoi = window.animationsMap ? window.animationsMap['NHANROI'] : null;

                                    let theScript = document.createElement('script');
                                    theScript.src = 'js/' + data.className.toLowerCase() + '.js?v=' + Date.now();

                                    theScript.onload = function () {
                                        window.HePhaiHienTai = backupHePhai; window.KHO_ANIM_NHANROI = backupIdle; window.KHO_ANIM_TANCONG = backupAtk; if (window.animationsMap && backupAnimNhanRoi) window.animationsMap['NHANROI'] = backupAnimNhanRoi;
                                        runSkill();
                                    };
                                    theScript.onerror = function () {
                                        let scriptDuPhong = document.createElement('script');
                                        scriptDuPhong.src = 'js/phai_' + data.className.toLowerCase() + '.js?v=' + Date.now();
                                        scriptDuPhong.onload = function () {
                                            window.HePhaiHienTai = backupHePhai; window.KHO_ANIM_NHANROI = backupIdle; window.KHO_ANIM_TANCONG = backupAtk; if (window.animationsMap && backupAnimNhanRoi) window.animationsMap['NHANROI'] = backupAnimNhanRoi;
                                            runSkill();
                                        };
                                        document.head.appendChild(scriptDuPhong);
                                    };
                                    document.head.appendChild(theScript);
                                }
                            }

                            else if (data.type === 'BI_CHEM') {
                                // 🛡️ CHỐT CHẶN CỬA BẢO HỘ: NẾU NGƯỜI CHÉM LÀ ĐỒNG ĐỘI THÌ HỦY BỎ TẤT CẢ TÁC ĐỘNG!
                                if (typeof window.danhSachDongDoi !== 'undefined' && window.danhSachDongDoi.includes(senderId)) {
                                    return;
                                }

                                if (data.victimId === window.myUsername && !window.isDead && typeof window.mauBanThan !== 'undefined') {
                                    window.mauBanThan -= Math.round(data.damage);
                                    if (typeof taoSoSatThuong === 'function') taoSoSatThuong(new THREE.Vector3(data.posX, data.posY, data.posZ), Math.round(data.damage), '#ff0000');
                                    const uiThanhMau = document.getElementById('thanhMauHienTai');
                                    if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';

                                    if (window.mauBanThan <= 0 && typeof window.xuLyCaiChetNhanVat === 'function') window.xuLyCaiChetNhanVat(senderId);
                                }
                            }













                            



                            // 🌟 BẢN VÁ: NHẬN THÔNG BÁO "NẠN NHÂN ĐÃ CHẾT, HÚP EXP THÔI!"
                            else if (data.type === 'XAC_NHAN_GUC_NGA') {
                                if (data.killerId === window.myUsername) {
                                    if (typeof window.vinhDanhDoSat === 'function') window.vinhDanhDoSat(senderId, data.victimLevel);
                                }
                            }

                        }
                    } catch (e) {
                        // Bắt lỗi âm thầm, không cho sập vòng lặp
                    }
                });

            } catch (err) { loginBtn.disabled = false; }
        });
       
    }

    setInterval(() => {
        if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers !== null) {
            for (let id in window.remotePlayers) {
                let rp = window.remotePlayers[id];


                if (rp && rp.status === 'ready' && rp.targetPos && rp.mesh) {
                    rp.mesh.position.lerp(rp.targetPos, 0.15); 
    
                   // 🌟 BẢN VÁ: DÙNG SLERP ĐỂ TÌM GÓC XOAY NGẮN NHẤT, CHỐNG LỘN VÒNG
                   if (rp.targetQuat) {
                   rp.mesh.quaternion.slerp(rp.targetQuat, 0.15);
                   }

                    if (rp.tag && typeof camera !== 'undefined') {
                        // 🌟 BẢN VÁ: QUÉT TRỰC TIẾP TỌA ĐỘ GỐC CỦA MESH
                        const footPos = new THREE.Vector3();
                        rp.mesh.getWorldPosition(footPos); 

                        let upV = rp.mesh.up ? rp.mesh.up.clone().normalize() : new THREE.Vector3(0,1,0);

                        // Giữ lại Hitbox ngực để Sếp đánh nhau không bị hụt
                        let isMount = (rp.meshChar && rp.meshChar !== rp.mesh);
                        let tagHeight = isMount ? 4.5 : 2.5;
                        rp.hitCenterWorld = footPos.clone().add(upV.clone().multiplyScalar(tagHeight / 2));

                        // 🌟 DÁN BẢNG TÊN VÀO GÓT CHÂN (Bỏ cộng chiều cao)
                        const tagPos = footPos.clone(); 

                        tagPos.project(camera);
                        if (tagPos.z < 1) {
                            rp.tag.style.left = `${(tagPos.x * 0.5 + 0.5) * window.innerWidth}px`;
                            rp.tag.style.top = `${(tagPos.y * -0.5 + 0.5) * window.innerHeight}px`;
                            
                            // 🌟 Ép CSS không nhô lên nữa, đè bẹp xuống đất luôn
                            rp.tag.style.transform = 'translate(-50%, 0%)'; 
                            rp.tag.style.display = 'block';
                        } else {
                            rp.tag.style.display = 'none';
                        }
                    }

                }
            }
        }
    }, 30);
};

// ==========================================
// 🎙️ HỆ THỐNG PUSH-TO-TALK (NHẤN ĐỂ NÓI)
// ==========================================
const micBtn = document.getElementById('micButton');
let isMicOn = false;

// 🟢 Hàm BẬT Mic khi đè tay
async function batMic(e) {
    if (e && e.cancelable) e.preventDefault(); // Chống lỗi zoom/scroll màn hình trên Mobile
    if (!window.room || window.room.state !== 'connected' || isMicOn) return;
    try {
        isMicOn = true;
        await window.room.localParticipant.setMicrophoneEnabled(true);
        micBtn.classList.add('active');
        micBtn.style.transform = 'scale(1.1)'; // Hiệu ứng phình to khi đang đè nút
    } catch (err) { isMicOn = false; micBtn.classList.remove('active'); }
}

// 🔴 Hàm TẮT Mic khi buông tay
async function tatMic(e) {
    if (e && e.cancelable) e.preventDefault();
    if (!window.room || window.room.state !== 'connected' || !isMicOn) return;
    try {
        isMicOn = false;
        await window.room.localParticipant.setMicrophoneEnabled(false);
        micBtn.classList.remove('active');
        micBtn.style.transform = 'scale(1)'; // Trả nút về bình thường
    } catch (err) { }
}

// 🖱️ BẮT SỰ KIỆN TRÊN MÁY TÍNH (CHUỘT)
micBtn.addEventListener('mousedown', batMic);
micBtn.addEventListener('mouseup', tatMic);
micBtn.addEventListener('mouseleave', tatMic); // Lỡ kéo chuột ra khỏi nút cũng tự tắt cho an toàn

// 📱 BẮT SỰ KIỆN TRÊN ĐIỆN THOẠI (CẢM ỨNG)
micBtn.addEventListener('touchstart', batMic, {passive: false});
micBtn.addEventListener('touchend', tatMic);
micBtn.addEventListener('touchcancel', tatMic);
// ==========================================
// ⚔️ TỔNG PHỄU GOM SÁT THƯƠNG PVP (CHỐNG SPAM DATA KHI PK)
// ==========================================
window.dameGomChoNguoi = window.dameGomChoNguoi || {};
window.nguoiSyncTimer = window.nguoiSyncTimer || {};

window.chemTrungNguoiChoi = function(victimId, dame, hitPos) {
    // Không tự chém mình hoặc chém hư vô
    if (!victimId || victimId === window.myUsername) return; 

    // Nhỏ giọt sát thương của bất kỳ hệ phái nào vào Phễu của nạn nhân này
    window.dameGomChoNguoi[victimId] = (window.dameGomChoNguoi[victimId] || 0) + dame;

    // Van xả tự động 300ms một lần
    if (!window.nguoiSyncTimer[victimId]) {
        window.nguoiSyncTimer[victimId] = setTimeout(() => {
            if (window.room && window.room.state === 'connected') {
                let syncData = { 
                    type: 'BI_CHEM', 
                    victimId: victimId, 
                    damage: window.dameGomChoNguoi[victimId], // Gửi cục Dame chà bá đã gom
                    posX: hitPos ? parseFloat(hitPos.x.toFixed(2)) : 0, 
                    posY: hitPos ? parseFloat(hitPos.y.toFixed(2)) : 0, 
                    posZ: hitPos ? parseFloat(hitPos.z.toFixed(2)) : 0 
                };
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(syncData)), { reliable: true });
            }
            
            // Xả xong thì đóng van, reset Phễu về 0
            window.dameGomChoNguoi[victimId] = 0;
            window.nguoiSyncTimer[victimId] = null;
        }, 300);
    }
};

// ==========================================
// 📡 RADAR TÒA ÁN TỐI CAO V2.1 (BẢN VÁ ÉP ĐẺ TỪ TỪ CHỐNG SẬP iPHONE)
// ==========================================
window.radarDongBoThucTe = function () {
    let currentZone = window.ZONE_ID || 'TRUNG_CHAU';
    fetch('api/get_bosses.php?v=' + Date.now() + '&zone=' + currentZone).then(res => res.json()).then(data => {
        if (data.status === 'success' && window.danhSachQuaiVat) {
            
            let thoiGianTre = 0; // 🌟 Biến tạo khoảng nghỉ cho CPU

            data.data.forEach(bossSQL => {
                let id = bossSQL.id;
                let sqlHp = parseInt(bossSQL.hp);
                
                let bossLocal = window.danhSachQuaiVat.find(q => q.id == id);
                
                // 🌟 TỐI ƯU: Ép Boss đẻ gần lại
                let bossPos = new THREE.Vector3(parseFloat(bossSQL.pos_x), parseFloat(bossSQL.pos_y), parseFloat(bossSQL.pos_z));
                let khoangCach = (window.playerModel) ? window.playerModel.position.distanceTo(bossPos) : 0;
                let maxDist = window.isMobile ? 1500 : 3000; 

                // NẾU CHƯA CÓ MÀ MÁU > 0 -> BÀN TAY SÁNG THẾ ĐẺ RA!
                if (!bossLocal && sqlHp > 0 && khoangCach <= maxDist) {
                    
                    thoiGianTre += window.isMobile ? 200 : 0; // 🌟 Mobile đẻ 1 con xong bắt CPU nghỉ thở 200ms mới đẻ con tiếp theo
                    
                    setTimeout(() => {
                        if (typeof window.sinhRaQuaiVat === 'function') {
                            let scaleTuSQL = parseFloat(bossSQL.scale || 1.0);
                            let classTuSQL = bossSQL.class_code || 'TU_TIEN';
                            let levelTuSQL = parseInt(bossSQL.level || 1);
                            window.sinhRaQuaiVat(parseFloat(bossSQL.pos_x), parseFloat(bossSQL.pos_z), bossSQL.name, levelTuSQL, parseInt(bossSQL.max_hp), scaleTuSQL, parseFloat(bossSQL.pos_y), true, id, bossSQL.model_url, sqlHp, 0, classTuSQL);
                        }
                    }, thoiGianTre);
                }

                // NẾU ĐÃ CÓ RỒI -> CẬP NHẬT MÁU CỨNG TỪ SQL
                else if (bossLocal) {
                    bossLocal.hp = sqlHp;
                    if (bossLocal.tagEl) {
                        let bar = bossLocal.tagEl.querySelector('.hp-bar');
                        if (bar) bar.style.width = Math.max(0, (bossLocal.hp / bossLocal.maxHp) * 100) + '%';
                    }
                    
                    if (sqlHp <= 0 && !bossLocal.isDead) {
                        bossLocal.isDead = true; 
                        bossLocal.tagEl.style.display = 'none';
                        if (typeof bossLocal.playAnim === 'function') bossLocal.playAnim('DIE');
                        setTimeout(() => { if (bossLocal.mesh) { scene.remove(bossLocal.mesh); if(typeof window.donRac3D === 'function') window.donRac3D(bossLocal.mesh); } }, 3000);
                    }
                    // 🌟 BẢN VÁ CHỐNG HỒI SINH MA (Dán đè đoạn else if trong Radar)
                    else if (sqlHp > 0 && bossLocal.isDead) {
                    // CHỈ HỒI SINH NẾU: Con Boss này thực sự không còn trong Scene (đã dọn rác xong sau 3s)
                    // Điều này ngăn chặn việc Radar "cướp diễn" khi Boss đang chạy Animation DIE
                    if (bossLocal.mesh && !scene.children.includes(bossLocal.mesh)) {
                    bossLocal.isDead = false; 
                    bossLocal.state = 'IDLE';
                    bossLocal.mesh.visible = true; 
                    bossLocal.mesh.position.set(bossLocal.spawnX, bossLocal.mesh.position.y, bossLocal.spawnZ); 
                    scene.add(bossLocal.mesh);
        
                   if (typeof bossLocal.playAnim === 'function') bossLocal.playAnim('IDLE');
                   if (bossLocal.tagEl) bossLocal.tagEl.style.display = 'block'; 
                   console.log(`♻️ Radar đã hồi sinh Boss: ${bossLocal.id}`);
                    }
                  }
                }
            });
        }
    }).catch(e => { });
};
setInterval(window.radarDongBoThucTe, 3000);

// ==========================================
// 🩸 HỆ THỐNG AUTO-SAVE MÁU (CHỐNG HACK F5 HỒI MÁU)
// ==========================================
(function() {
    let lastSavedHp = -1;
    setInterval(() => {
        if (typeof window.mauBanThan !== 'undefined' && window.mauBanThan !== lastSavedHp) {
            let fd = new FormData(); fd.append('hp', Math.floor(window.mauBanThan));
            fetch('api/save_hp.php', { method: 'POST', body: fd }).catch(e => {});
            lastSavedHp = window.mauBanThan;
        }
    }, 10000);

    window.addEventListener('beforeunload', () => {
        if (typeof window.mauBanThan !== 'undefined') {
            let fd = new FormData(); fd.append('hp', Math.floor(window.mauBanThan));
            navigator.sendBeacon('api/save_hp.php', fd);
        }
    });
})();







window.traLoiPT = function (nguoiMoi, isAccept) {
    document.getElementById('ptInviteBox').style.display = 'none'; // Tắt bảng

    if (isAccept) {
        // Gửi thông điệp Đồng ý lại cho Đội trưởng
        let data = { type: 'PT_REPLY', sender: window.myUsername, target: nguoiMoi, accept: true };
        window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(data)), { reliable: true });

        // Gọi lên Server để lưu CSDL Nhóm
        let fd = new FormData(); fd.append('action', 'join'); fd.append('leader', nguoiMoi);
        fetch('api/party.php', { method: 'POST', body: fd }).then(r => r.json()).then(res => {
            if (res.status === 'success') {
                window.hienThongBaoGame("Đã gia nhập Đội của " + nguoiMoi, true);
            }
        });
    } else {
        // Gửi thông điệp Từ chối
        let data = { type: 'PT_REPLY', sender: window.myUsername, target: nguoiMoi, accept: false };
        window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(data)), { reliable: true });
    }
};

// ==========================================
// 🛡️ HỆ THỐNG LÁ CHẮN ĐỒNG ĐỘI & RADAR NHẬN DIỆN
// ==========================================
window.danhSachDongDoi = [];
window.MY_PARTY_ID = 0;
window.MY_GUILD_ID = 0;








// 1. MÁY QUÉT ĐỒNG ĐỘI & BƠM MÃ CHO KHUNG CHAT (SỬA LỖI CHAT)
window.quetDongDoi = function() {
    fetch('api/get_allies.php').then(r=>r.json()).then(data => {
        if(data.status === 'success') {
            window.danhSachDongDoi = data.allies || [];
            window.MY_PARTY_ID = data.party_id;
            window.MY_GUILD_ID = data.guild_id;

            // 🌟 CHÌA KHÓA FIX CHAT LÀ Ở ĐÂY: Truyền ID Nhóm vào Kênh Chat!
            if (window.kenhChatHienTai === 'PARTY') window.idKenhHienTai = window.MY_PARTY_ID;
            if (window.kenhChatHienTai === 'GUILD') window.idKenhHienTai = window.MY_GUILD_ID;
        }
    }).catch(e=>{});
};
setInterval(window.quetDongDoi, 3000);
setTimeout(window.quetDongDoi, 1000);

// 2. GẮN LÁ CHẮN VÀO LƯỠI KIẾM (Chặn sát thương đồng đội)
if (!window.daBocThepChemNguoi) {
    const oldChemTrung = window.chemTrungNguoiChoi;
    window.chemTrungNguoiChoi = function(victimId, dame, hitPos) {
        if (window.danhSachDongDoi.includes(victimId)) {
            if (typeof taoSoSatThuong === 'function' && hitPos && Math.random() < 0.1) taoSoSatThuong(hitPos, "Đồng đội", '#2ecc71');
            return; 
        }
        if (oldChemTrung) oldChemTrung(victimId, dame, hitPos);
    };
    window.daBocThepChemNguoi = true;
}

// 3. ĐỔI MÀU BẢNG TÊN, CẤY CHIP 3D & CẬP NHẬT GIAO DIỆN TỔ ĐỘI VLTK
setInterval(() => {
    // A. Cấy Chip 3D
    if (typeof window.remotePlayers !== 'undefined') {
        for (let id in window.remotePlayers) {
            let rp = window.remotePlayers[id];
            if (rp && rp.mesh) {
                let nameDiv = rp.tag ? rp.tag.querySelector('div:first-child') : null;
                if (window.danhSachDongDoi.includes(id)) {
                    rp.mesh.userData.isAlly = true; 
                    if(rp.meshChar) rp.meshChar.userData.isAlly = true; 
                    if(nameDiv) { nameDiv.style.color = '#2ecc71'; nameDiv.style.textShadow = '0 0 5px #2ecc71, 1px 1px 0 #000'; }
                } else {
                    rp.mesh.userData.isAlly = false;
                    if(rp.meshChar) rp.meshChar.userData.isAlly = false;
                    if(nameDiv) { nameDiv.style.color = '#e74c3c'; nameDiv.style.textShadow = '0 0 5px #e74c3c, 1px 1px 0 #000'; }
                }
            }
        }
    }

    // B. Đổ Dữ Liệu Lên Khung HUD Võ Lâm Bên Trái
    let hud = document.getElementById('vltkPartyHUD');
    let list = document.getElementById('vltkPartyList');
    if (!hud || !list) return;

    if (window.MY_PARTY_ID == 0 || window.danhSachDongDoi.length === 0) {
        hud.style.display = 'none'; // Giấu đi nếu không có nhóm
        return;
    }

    hud.style.display = 'flex';
    let html = '';

    // Bản thân mình (Luôn đứng đầu)
    let myHpPct = (window.mauBanThan / window.MAU_TOI_DA) * 100;
    html += `
    <div class="pt-card-hud" onclick="xemToDoiCuaToi(); toggleRadarTab();" style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.6); padding:4px 6px; border-radius:20px 5px 5px 20px; width:150px; border:1px solid rgba(46,204,113,0.5); cursor:pointer;">
        <div class="pt-card-avt" style="width:26px; height:26px; border-radius:50%; background:#2ecc71; border:1px solid #fff; display:flex; justify-content:center; align-items:center; font-size:12px; font-weight:bold;">ME</div>
        <div style="flex:1;">
            <div class="pt-card-name" style="color:#fff; font-size:11px; font-weight:bold; text-shadow:1px 1px 0 #000; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px;">${window.myUsername}</div>
            <div style="width:100%; height:4px; background:#222; border-radius:2px; margin-top:2px; overflow:hidden; border:1px solid #000;">
                <div style="width:${Math.max(0, myHpPct)}%; height:100%; background:linear-gradient(90deg, #27ae60, #2ecc71); transition:0.2s;"></div>
            </div>
        </div>
    </div>`;

    // Quét dàn Đồng Đội
    window.danhSachDongDoi.forEach(name => {
        // 🌟 FIX LỖI 2: Chặn triệt để việc clone tên chính mình (Xử lý cả vụ in hoa/thường)
        if (name.toLowerCase() === window.myUsername.toLowerCase()) return; 

        let rp = window.remotePlayers[name];
        let hpPct = 100; 
        let isOffline = true;

        if (rp && rp.status === 'ready') {
            isOffline = false; 
            let hpBar = rp.tag ? rp.tag.querySelector('.hp-bar') : null;
            if (hpBar) hpPct = parseFloat(hpBar.style.width) || 0;
        }

        let avtColor = isOffline ? '#555' : '#3498db';
        let barColor = isOffline ? '#555' : 'linear-gradient(90deg, #2980b9, #3498db)';
        let textColor = isOffline ? '#aaa' : '#fff';
        let borderColor = isOffline ? 'rgba(85,85,85,0.5)' : 'rgba(52,152,219,0.5)';

        // 🌟 FIX LỖI 3: Đổi onclick từ Mời PT sang Mở Bảng Xem
        html += `
        <div class="pt-card-hud" onclick="xemToDoiCuaToi(); toggleRadarTab();" style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.6); padding:4px 6px; border-radius:20px 5px 5px 20px; width:150px; border:1px solid ${borderColor}; cursor:pointer; opacity:${isOffline ? 0.7 : 1};">
            <div class="pt-card-avt" style="width:26px; height:26px; border-radius:50%; background:${avtColor}; border:1px solid #fff; display:flex; justify-content:center; align-items:center; font-size:12px;">👤</div>
            <div style="flex:1;">
                <div class="pt-card-name" style="color:${textColor}; font-size:11px; font-weight:bold; text-shadow:1px 1px 0 #000; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px;">${name}</div>
                <div style="width:100%; height:4px; background:#222; border-radius:2px; margin-top:2px; overflow:hidden; border:1px solid #000;">
                    <div style="width:${hpPct}%; height:100%; background:${barColor}; transition:0.2s;"></div>
                </div>
            </div>
        </div>`;
    });

    list.innerHTML = html;
}, 1000);

// 4. API BÁO ĐỊCH DÀNH CHO AUTO-AIM
window.laKeDich = function(id) {
    if (!id || id === window.myUsername) return false;
    if (window.danhSachDongDoi.includes(id)) return false; 
    return true; 
};

// =======================================================
// 🚪 HỆ THỐNG AUTO LEAVE CHỐNG KẸT NICK (GHOST PARTY)
// =======================================================
// Giải pháp: Gắn kíp nổ vào sự kiện Đóng Trình Duyệt / Tắt Game. 
// Chỉ cần Sếp tắt Web, game sẽ bắn tia laser ngầm lên Server để gạch tên Sếp khỏi PT ngay lập tức!
window.addEventListener('beforeunload', () => {
    if (window.MY_PARTY_ID > 0) {
        let fd = new FormData(); 
        fd.append('action', 'leave');
        // sendBeacon là siêu vũ khí bắn ngầm kể cả khi Tab đã đóng
        navigator.sendBeacon('api/party.php', fd); 
    }
});
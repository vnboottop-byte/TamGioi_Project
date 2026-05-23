// ==========================================
// 🌐 LIVEKIT ĐA VŨ TRỤ (BẢN V21 - CÔNG NGHỆ NHÂN BẢN VÔ TÍNH SKELETON UTILS)
// ==========================================
const livekitScript = document.createElement('script');
livekitScript.src = 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js';
document.head.appendChild(livekitScript);

window.remotePlayers = {}; 
window.room = null;
window.khoModelMau = {}; // 🌟 KHO CHỨA MODEL MẪU ĐỂ NHÂN BẢN (CHỐNG GIẬT LAG)



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
    tag.innerHTML = `<div style="color:#00ffff; font-weight:bold; font-size:16px; text-shadow:1px 1px 0 #000;">${identity}</div><div style="width:80px; height:5px; background:rgba(0,0,0,0.5); border:1px solid #fff;"><div class="hp-bar" style="width:${(data.hp/data.maxHp)*100}%; height:100%; background:#e74c3c;"></div></div>`;
    tag.style.cssText = 'position:absolute; pointer-events:none; z-index:9; transform:translate(-50%, -100%); display:none;';
    document.body.appendChild(tag);
    rp.tag = tag;



    // TẬN DỤNG TỔNG KHO ASSET
    const mountUrl = data.mount;
    const charUrl = data.model;
    // 🌟 BẢN VÁ: Trust 100% SQL, không có model thì hủy tạo Clone
    if (!charUrl || charUrl.trim() === '') return;



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

                let mixerChar = new THREE.AnimationMixer(nhanVat); const animsChar = {};
                if (animationsChar) animationsChar.forEach(clip => { animsChar[clip.name.toUpperCase()] = mixerChar.clipAction(clip); });

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

            let mixer = new THREE.AnimationMixer(nhanVat); const anims = {};
            if(animationsChar) animationsChar.forEach(clip => { anims[clip.name.toUpperCase()] = mixer.clipAction(clip); });




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
                // ==========================================
                // 🌟 BỘ PHẬN ĐÓNG DẤU HẢI QUAN TỰ ĐỘNG (CHỐNG CHIÊU THỨC BAY XUYÊN VŨ TRỤ)
                // ==========================================
                const publishGoc = window.room.localParticipant.publishData;
                window.room.localParticipant.publishData = function(payload, options) {
                    try {
                        let textStr = new TextDecoder().decode(payload);
                        // Nếu Sếp xả Skill, gọi Đệ tử, hay Báo Máu (Gói tin dạng JSON Object)
                        if (textStr.startsWith('{')) { 
                            let dataObj = JSON.parse(textStr);
                            // Tự động đóng dấu Hộ chiếu Map vào gói tin
                            if (!dataObj.zone_id) dataObj.zone_id = window.ZONE_ID || 'TRUNG_CHAU';
                            payload = new TextEncoder().encode(JSON.stringify(dataObj));
                        }
                    } catch(e) {}
                    return publishGoc.call(this, payload, options); // Gửi đi
                };
                
                // ==========================================
                // 🚪 XỬ LÝ NGƯỜI CHƠI THOÁT GAME (BẢN AN TOÀN - KHÔNG PHÁ ĐỒ CHUNG)
                // ==========================================
                window.room.on('participantDisconnected', (participant) => {
                    if (window.remotePlayers && window.remotePlayers[participant.identity]) {
                        const playerLeaver = window.remotePlayers[participant.identity];

                        if (playerLeaver.mesh) {
                            // 🌟 THAY VÌ donRac3D, TA CHỈ GỠ KHỎI MÀN HÌNH
                            // Để giữ lại bộ khung (Geometry) cho những người chơi cùng hệ phái khác đang đứng đó.
                            if (playerLeaver.mesh.parent) playerLeaver.mesh.parent.remove(playerLeaver.mesh);
                            scene.remove(playerLeaver.mesh);
                        }

                        if (playerLeaver.tag) playerLeaver.tag.remove();

                        // Xóa dữ liệu trong mảng quản lý
                        delete window.remotePlayers[participant.identity];
                    }
                });





                // ==========================================
                // 🔊 LẮP LOA: PHÁT ÂM THANH KHI CÓ NGƯỜI NÓI (BẢN PRO)
                // ==========================================
                window.room.on('trackSubscribed', (track, publication, participant) => {
                    if (track.kind === 'audio') {
                        const audioElement = track.attach();
                        audioElement.style.display = 'none'; // Giấu cái loa đi
                        document.body.appendChild(audioElement);
                        console.log("🔊 Đã gắn Mic của: " + participant.identity);

                        // Cưỡng chế phát âm thanh và báo cáo nếu bị trình duyệt chặn
                        audioElement.play().catch((error) => {
                            console.warn("⚠️ Mute: Trình duyệt chặn âm thanh của " + participant.identity + " do bạn chưa click chuột vào Game!", error);
                        });
                    }
                });

                // Gỡ loa ra khi người ta tắt Mic hoặc thoát Game
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

                            // 🌟 HẢI QUAN ĐA VŨ TRỤ: Kẻ nào không cùng Map thì tàng hình!
                            let senderZone = data[16] || 'TRUNG_CHAU';
                            if (window.ZONE_ID && senderZone !== window.ZONE_ID) {
                                if (window.remotePlayers[senderId]) {
                                    if (window.remotePlayers[senderId].mesh) window.remotePlayers[senderId].mesh.visible = false;
                                    if (window.remotePlayers[senderId].tag) window.remotePlayers[senderId].tag.style.display = 'none';
                                }
                                return; 
                            }

                            // 🌟 TỐI ƯU MOBILE: Nếu người chơi khác ở quá xa (> 2500m), không cần tải/Render để tiết kiệm VRAM!
                            let pX = data[1], pY = data[2], pZ = data[3];
                            let khoangCachNguoiChoi = (window.playerModel) ? window.playerModel.position.distanceTo(new THREE.Vector3(pX, pY, pZ)) : 0;
                            
                            if (window.isMobile && khoangCachNguoiChoi > 2500) {
                                if (window.remotePlayers[senderId] && window.remotePlayers[senderId].mesh) {
                                    window.remotePlayers[senderId].mesh.visible = false;
                                    if (window.remotePlayers[senderId].tag) window.remotePlayers[senderId].tag.style.display = 'none';
                                }
                                return; // Khất từ việc tải mô hình nếu họ ở quá xa
                            }

                            let mappedData = {





                                type: 'vitri', x: data[1], y: data[2], z: data[3], rx: data[4], ry: data[5], rz: data[6],
                                size: data[7], hp: data[8], maxHp: data[9], anim: data[10], model: data[11], weapon: data[12], mount: data[13], phai: data[14],
                                vuKhiHienThi: data[15]
                            };

                            let rp = window.remotePlayers[senderId];
                            if (rp && rp.mesh) rp.mesh.visible = true; // 🌟 Trùng Map thì hiện hình lại

                            // Nếu chưa có nhân vật -> Nặn ra
                            if (!rp) {
                                taoBanSaoNguoiChoi(senderId, mappedData);
                            }
                            // 🌟 Nếu có rồi -> Kéo tọa độ đi (KHÚC NÀY CỦA SẾP PHẢI GIỮ NGUYÊN)
                            else if (rp.status === 'ready') {
                                rp.targetPos = new THREE.Vector3(mappedData.x, mappedData.y, mappedData.z);
                                rp.targetRot = new THREE.Euler(mappedData.rx, mappedData.ry, mappedData.rz);
                                // 🌟 ÉP SIZE ĐỒNG BỘ TỪ MÁY CHỦ SANG!
                                if (mappedData.size > 0 && rp.mesh.scale.x !== mappedData.size) {
                                    rp.mesh.scale.setScalar(mappedData.size);
                                }

                                let hpBar = rp.tag ? rp.tag.querySelector('.hp-bar') : null;
                                if (hpBar) hpBar.style.width = Math.max(0, (mappedData.hp / mappedData.maxHp) * 100) + '%';

                                // 🌟 THỰC THI ÁN LỆNH: Bật/Tắt vũ khí Live theo đúng ý Sếp!
                                if (rp.vuKhiModel && mappedData.vuKhiHienThi !== undefined) {
                                    rp.vuKhiModel.visible = (mappedData.vuKhiHienThi === 1);
                                }



                                if (mappedData.anim && mappedData.anim !== rp.currentAnim) {
                                    let upAnim = mappedData.anim.toUpperCase();
                                    
                                    // 🌟 NÃO BỘ NGƯỜI CHƠI BẢN SAO (HỆ TIẾNG VIỆT)
                                    if (rp.animsChar && Object.keys(rp.animsChar).length > 0) {
                                        let actionChar = rp.animsChar[upAnim];
                                        // Luật dự phòng: Không có chân thì dồn về BAY
                                        if (!actionChar && !upAnim.includes('CHIEU') && upAnim !== 'CHET' && upAnim !== 'DIE') {
                                            actionChar = rp.animsChar['BAY'];
                                        }
                                        if (!actionChar) actionChar = rp.animsChar['NHANROI'] || Object.values(rp.animsChar)[0];
                                        
                                        if (actionChar) { if (rp.activeActionChar) rp.activeActionChar.fadeOut(0.2); rp.activeActionChar = actionChar; rp.activeActionChar.reset().fadeIn(0.2).play(); }
                                    }

                                    // 🌟 NÃO BỘ THÚ CƯỠI BẢN SAO (HỆ TIẾNG ANH)
                                    if (rp.anims && Object.keys(rp.anims).length > 0) {
                                        let checkNameThu = upAnim;
                                        // Dịch thuật từ gói tin Tiếng Việt sang Tiếng Anh cho thú hiểu
                                        if (upAnim === 'NHANROI') checkNameThu = 'IDLE';
                                        else if (upAnim === 'CHAYBO' || upAnim === 'DIBO') checkNameThu = 'RUN';
                                        else if (upAnim === 'BAY') checkNameThu = 'FLY';
                                        else if (upAnim === 'CHET' || upAnim === 'DIE') checkNameThu = 'DIE';
                                        
                                        let actionThu = rp.anims[checkNameThu];
                                        // Vét máng dự phòng nếu Model Thú trên mạng đặt tên tào lao
                                        if (!actionThu) {
                                            if (checkNameThu === 'RUN') actionThu = rp.anims['WALK'] || rp.anims['FLY'];
                                            else if (checkNameThu === 'IDLE') actionThu = rp.anims['WAIT'] || rp.anims['FLY'];
                                            else if (checkNameThu === 'FLY') actionThu = rp.anims['JUMP'] || rp.anims['RUN'];
                                        }
                                        if (!actionThu) actionThu = rp.anims['IDLE'] || Object.values(rp.anims)[0];

                                        // Thú chỉ diễn cảnh Di chuyển/Đứng/Chết. Bỏ qua các lệnh Múa Chiêu!
                                        if (!upAnim.includes('CHIEU') || checkNameThu === 'DIE') {
                                            if (actionThu) { if (rp.activeAction) rp.activeAction.fadeOut(0.2); rp.activeAction = actionThu; rp.activeAction.reset().fadeIn(0.2).play(); }
                                        }
                                    }

                                    rp.currentAnim = mappedData.anim;
                                }

                            }
                        }

                        // ==========================================
                        // 2. NẾU LÀ ĐỐI TƯỢNG (DATA BOSS, SKILL, PVP)
                        // ==========================================
                        else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                            
                            // 🌟 HẢI QUAN CHẶN KHÁC MAP (BẢN VÁ: CHỐNG TÀNG HÌNH CHIÊU THỨC VÀ PHANTOM)
                            if (data.zone_id && window.ZONE_ID && data.zone_id !== window.ZONE_ID) {
                                return; // Nếu chiêu thức bay từ Map khác tới -> Tịch thu, hủy ngay lập tức!
                            }
                            // 🌟 CHỈ NHẬN HIỆU ỨNG SÁT THƯƠNG (KHÔNG ÉP MÁU)
                            if (data.type === 'BOSS_HIT') {
                                if (typeof window.danhSachQuaiVat !== 'undefined') {
                                    let boss = window.danhSachQuaiVat.find(q => q.id == data.id);
                                    if (boss && !boss.isDead) {
                                        // Hiển thị số sát thương nhảy lên đầu Boss
                                        if (data.damageDealt > 0) {
                                            let posNo = new THREE.Vector3(boss.mesh.position.x, boss.mesh.position.y + 10, boss.mesh.position.z);
                                            if (typeof taoSoSatThuong === 'function') taoSoSatThuong(posNo, data.damageDealt);
                                        }
                                        // Khớp animation
                                        if (typeof boss.playAnim === 'function' && boss.state !== 'ATTACK') boss.playAnim('HIT');
                                        
                                        // Trừ máu ảo trên UI cho mượt (Máu thật sẽ do Radar 3s ép)
                                        boss.hp = Math.max(0, boss.hp - data.damageDealt);
                                        if (boss.tagEl) {
                                            let bar = boss.tagEl.querySelector('.hp-bar');
                                            if (bar) bar.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%';
                                        }
                                    }
                                }
                            }
                            



                            else if (data.type === 'BOSS_POS') {
                                if (typeof window.danhSachQuaiVat !== 'undefined') {
                                    let boss = window.danhSachQuaiVat.find(q => q.id == data.bossId);
                                    if (boss && !boss.isDead) { 
                                        boss.targetPosLK = new THREE.Vector3(data.x, data.y, data.z); 
                                        boss.targetAnimLK = data.anim; 
                                    }
                                }
                            }




                            else if (data.type === 'BOSS_SKILL') {
                                if (typeof window.danhSachQuaiVat !== 'undefined') {
                                    let boss = window.danhSachQuaiVat.find(q => q.id == data.bossId);
                                    if (boss && !boss.isDead) {
                                        boss.mesh.lookAt(data.target.x, data.target.y, data.target.z);
                                        if (typeof boss.playAnim === 'function') boss.playAnim('ATTACK');
                                        
                                        // 🌟 HẢI QUAN MẠNG: Kích hoạt Lửa Rồng cho máy người xem
                                        if (data.phai === 'RONG' && typeof window.tungComboRong === 'function') {
                                            const box = new THREE.Box3().setFromObject(boss.mesh);
                                            const size = new THREE.Vector3(); box.getSize(size);
                                            let bOrigin = boss.mesh.position.clone();
                                            bOrigin.y += size.y * 0.35; // Tọa độ vàng của Sếp
                                            let pTarget = new THREE.Vector3(data.target.x, data.target.y, data.target.z);
                                            let bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize();
                                            bOrigin.add(bDir.clone().multiplyScalar(size.z * 0.1));
                                            
                                            // Gọi hàm Rồng với cờ isRemote = true ở cuối cùng
                                             // 🌟 SỬA SỐ 0 THÀNH SÁT THƯƠNG THỰC TẾ ĐỂ GÂY ĐAM LAN (AoE) CHO NGƯỜI ĐỨNG GẦN
                                            let dmgBoss = boss.maxHp * 0.05;
                                            window.tungComboRong(data.chieu, dmgBoss, bOrigin, pTarget, bDir, data.bossId, null, true);
                                        }
                                        // Sếp chèn đoạn này ngay dưới cái ngoặc của: if (data.phai === 'RONG' ...) { ... } 
else if ((data.phai === 'CHIM' || data.phai === 'CA') && typeof window.tungComboChimCa === 'function') {
    let bOrigin = boss.mesh.position.clone();
    let pTarget = new THREE.Vector3(data.target.x, data.target.y, data.target.z);
    let bDir = new THREE.Vector3().subVectors(pTarget, bOrigin).normalize();
    // Gây dame = 0 vì mạng chỉ cần diễn hình ảnh máu xịt cho đẹp
    window.tungComboChimCa('CAN_CHIEN', 0, bOrigin, pTarget, bDir, data.bossId, null, true);
}




                                        else {
                                            if (typeof window.bossTungTuyetKieu === 'function') window.bossTungTuyetKieu(boss, new THREE.Vector3(data.target.x, data.target.y, data.target.z), data.phai, data.chieu);
                                        }
                                    }
                                }
                            }

















                            // TẠI FILE: multiplayer.js
                            // 🌟 BẢN VÁ AAA: LAZY LOAD - TỰ ĐỘNG HỌC LỎM VÕ CÔNG CỦA KẺ ĐỊCH
                            else if (data.type === 'TUNG_CHIEU') {
                                let tenHam = 'tungCombo' + data.className; 
                                
                                // 1. Nếu trong não đã có sẵn võ công này thì tung chiêu luôn!
                                if (typeof window[tenHam] === 'function') {
                                    window[tenHam](data.skillType, true, data.origin, data.target, data.dir, senderId, data.weaponUrl);
                                } 
                                // 2. NẾU CHƯA BIẾT CHIÊU NÀY -> TỰ ĐỘNG TẢI FILE SÁCH VÕ CÔNG VỀ HỌC NGAY!
                                else {
                                    if (!window.dangTaiVoCong) window.dangTaiVoCong = {};
                                    if (window.dangTaiVoCong[data.className]) return; // Tránh tải trùng lặp
                                    window.dangTaiVoCong[data.className] = true;

                                    console.log("⏳ Kẻ địch xài chiêu lạ! Đang Auto-Download data của: " + data.className);

                                    let theScript = document.createElement('script');
                                    // Quy tắc 1: Thử tải theo tên chuẩn (VD: js/jimbei.js)
                                    theScript.src = 'js/' + data.className.toLowerCase() + '.js';

                                    theScript.onload = function() {
                                        console.log("✅ Đã học xong võ công của: " + data.className);
                                        if (typeof window[tenHam] === 'function') {
                                            window[tenHam](data.skillType, true, data.origin, data.target, data.dir, senderId, data.weaponUrl);
                                        }
                                    };

                                    theScript.onerror = function() {
                                        // Quy tắc 2: Nếu file ko tồn tại, thử tải theo đuôi cũ (VD: js/phai_jimbei.js)
                                        let scriptDuPhong = document.createElement('script');
                                        scriptDuPhong.src = 'js/phai_' + data.className.toLowerCase() + '.js';
                                        
                                        scriptDuPhong.onload = function() {
                                            console.log("✅ Đã học xong võ công của: " + data.className);
                                            if (typeof window[tenHam] === 'function') {
                                                window[tenHam](data.skillType, true, data.origin, data.target, data.dir, senderId, data.weaponUrl);
                                            }
                                        };
                                        document.head.appendChild(scriptDuPhong);
                                    };

                                    document.head.appendChild(theScript);
                                }
                            }




















   
                            
                            else if (data.type === 'BI_CHEM') {
                                if (data.victimId === window.myUsername && !window.isDead && typeof window.mauBanThan !== 'undefined') {
                                    window.mauBanThan -= Math.round(data.damage);
                                    if (typeof taoSoSatThuong === 'function') taoSoSatThuong(new THREE.Vector3(data.posX, data.posY, data.posZ), Math.round(data.damage), '#ff0000');
                                    const uiThanhMau = document.getElementById('thanhMauHienTai'); 
                                    if (uiThanhMau) uiThanhMau.style.width = Math.max(0, (window.mauBanThan / window.MAU_TOI_DA) * 100) + '%';
                                    
                                    // 🌟 TRUYỀN TÊN KẺ GIẾT VÀO HÀM (senderId)
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
                    rp.mesh.rotation.x += (rp.targetRot.x - rp.mesh.rotation.x) * 0.15;
                    rp.mesh.rotation.y += (rp.targetRot.y - rp.mesh.rotation.y) * 0.15;
                    rp.mesh.rotation.z += (rp.targetRot.z - rp.mesh.rotation.z) * 0.15;






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
                
                // 🌟 TỐI ƯU MOBILE: Đo khoảng cách, xa quá 2500m thì KHÔNG thèm tải Boss vào RAM!
                let bossPos = new THREE.Vector3(parseFloat(bossSQL.pos_x), parseFloat(bossSQL.pos_y), parseFloat(bossSQL.pos_z));
                let khoangCach = (window.playerModel) ? window.playerModel.position.distanceTo(bossPos) : 0;
                let maxDist = window.isMobile ? 2500 : 8000;

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
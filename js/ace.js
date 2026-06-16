// ==========================================
// 🔥 MÔN PHÁI ĐOẠT XÁ: HỎA QUYỀN PORTGAS D. ACE (MASTER FILE V2)
// 👑 CÔNG NGHỆ: PRELOAD RAM + KHÓA TRỤC CẦU + TỌA ĐỘ ĐỘNG + INSTANT CAST
// ==========================================

(function () {
    const kyNangAce = [];
    const danhSachSoBayAce = [];
    const hieuUngAce = []; 

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
    // 💥 HIỆU ỨNG NỔ
    // ==========================================
    function taoHieuUngNoAce(pos, isBig = false) {
        if (typeof window.playSound3D === 'function') window.playSound3D('no', pos); 
        else if (typeof window.playSound === 'function') window.playSound('no');

        const soLuong = isBig ? 120 : 30; 
        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(soLuong * 3);
        const vels = [];

        for (let i = 0; i < soLuong; i++) {
            posArr[i * 3] = pos.x; posArr[i * 3 + 1] = pos.y + (isBig ? 2 : 1); posArr[i * 3 + 2] = pos.z;
            let speed = isBig ? (Math.random() * 2 + 1) : (Math.random() * 1 + 0.5);
            let vec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
            vels.push(vec);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

        if (!window.textureBuiLuaAce) {
            let canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; let ctx = canvas.getContext('2d');
            let gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 100, 0, 1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
            window.textureBuiLuaAce = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.PointsMaterial({
            color: 0xff5500, size: window.isMobile ? 3.0 : 6.0, map: window.textureBuiLuaAce,
            transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const pts = new THREE.Points(geo, mat); scene.add(pts);
        hieuUngAce.push({ system: pts, velocities: vels, life: 30 }); 
    }
   
    // ==========================================
    // 🌟 ĐÚC VẬT THỂ LỬA (DÙNG CACHE RAM)
    // ==========================================
    function taoLuaFile(tenFile, scaleSize) {
        const group = new THREE.Group();
        let urlCanTai = 'uploads/anims/' + tenFile + '.glb';

        let quangSangGlow = null;
        if (tenFile === 'fire1') {
            if (!window.textureGlowAce) {
                let canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
                let ctx = canvas.getContext('2d');
                let gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');     
                gradient.addColorStop(0.2, 'rgba(255, 200, 0, 0.8)');    
                gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.3)');    
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');            
                ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
                window.textureGlowAce = new THREE.CanvasTexture(canvas);
            }
            
            let spriteMat = new THREE.SpriteMaterial({ 
                map: window.textureGlowAce, color: 0xffdd00, transparent: true, 
                blending: THREE.AdditiveBlending, depthWrite: false 
            });
            quangSangGlow = new THREE.Sprite(spriteMat);
        }

        if (typeof window.taiHoacNhanBanAsset === 'function') {
            window.taiHoacNhanBanAsset(urlCanTai, (v) => {
                v.traverse(c => {
                    if (c.isMesh && c.material) {
                        let danhSachMat = Array.isArray(c.material) ? c.material : [c.material];
                        danhSachMat.forEach(m => { 
                            m.transparent = true; m.blending = THREE.AdditiveBlending; 
                            if (tenFile === 'fire1') {
                                if (m.color) m.color.setHex(0xffaa00);
                                if (m.emissive) { m.emissive.setHex(0xffdd00); m.emissiveIntensity = 2.0; }
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

                if (quangSangGlow) {
                    quangSangGlow.scale.set(maxDim * 3.5, maxDim * 3.5, 1);
                    v.add(quangSangGlow);
                }
                group.add(v);
            });
        }
        return group;
    }

    // ==========================================
    // 🏹 TUNG CHIÊU ACE (ĐÃ BỌC THÉP ẢO TƯỞNG & NGÔN NGỮ AI)
    // ==========================================
    window.tungComboAce = function (phim, isRemote = false, remoteGoc = null, remoteDich = null, remoteHuong = null, casterId = null, weaponUrl = null) {
        let nvc = (typeof playerModel !== 'undefined' && playerModel) ? playerModel : window.nhanVatChinh;
        
        // 🌟 BẢN VÁ: Cấp đúng thể xác cho Boss AI
        if (isRemote && casterId) {
            if (typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) {
                nvc = window.remotePlayers[casterId].meshChar || window.remotePlayers[casterId].mesh;
            } else if (typeof window.danhSachQuaiVat !== 'undefined') {
                let boss = window.danhSachQuaiVat.find(q => q.id == casterId || q.id === casterId);
                if (boss && boss.mesh) nvc = boss.mesh;
            }
        }
        if (!nvc) return;

        // 🌟 BẢN VÁ: THÔNG NÃO NGÔN NGỮ AI (CHỮA CÂM NÍN)
        let loaiChieu = phim;
        let animCanMua = 'ATTACK1';
        if (typeof phim === 'string') {
            let pUp = phim.toUpperCase();
            if (pUp.includes('ATTACK4') || pUp === 'F') { loaiChieu = 'F'; animCanMua = 'ATTACK4'; }
            else if (pUp.includes('ATTACK3') || pUp === 'R') { loaiChieu = 'R'; animCanMua = 'ATTACK3'; }
            else if (pUp.includes('ATTACK2') || pUp === 'E') { loaiChieu = 'E'; animCanMua = 'ATTACK2'; }
            else if (pUp.includes('ATTACK1') || pUp === 'Q') { loaiChieu = 'Q'; animCanMua = 'ATTACK1'; }
            else if (pUp.includes('ATTACK') || pUp.includes('SKILL')) {
                let arr = ['Q', 'E', 'R', 'F'];
                loaiChieu = arr[Math.floor(Math.random() * arr.length)];
                if (loaiChieu === 'Q') animCanMua = 'ATTACK1';
                if (loaiChieu === 'E') animCanMua = 'ATTACK2';
                if (loaiChieu === 'R') animCanMua = 'ATTACK3';
                if (loaiChieu === 'F') animCanMua = 'ATTACK4';
            }
        }

        // 🌟 BẢN VÁ: BẢO VỆ HOẠT HÌNH
        if (isRemote === false) {
            window.dangMuaChieu = true;
            window.currentAnimName = '';
            if (typeof window.epNhanVatMua === 'function') window.epNhanVatMua(animCanMua);
            else if (typeof window.playAnim === 'function') window.playAnim(animCanMua);
            
            if (window.henGioTatMuaAce) clearTimeout(window.henGioTatMuaAce);
            window.henGioTatMuaAce = setTimeout(() => { window.dangMuaChieu = false; }, 600);
        } else {
            if (nvc.userData && nvc.userData.mixer && nvc.userData.animationsMap && nvc.userData.animationsMap[animCanMua]) {
                nvc.userData.animationsMap[animCanMua].reset().fadeIn(0.2).play();
            }
        }

        let upVector = new THREE.Vector3(0, 1, 0);
        if (window.KIEU_TRONG_LUC === 'CAU' && window.TAM_HANH_TINH_HIEN_TAI) {
            upVector = nvc.position.clone().sub(window.TAM_HANH_TINH_HIEN_TAI).normalize();
        } else if (nvc.up) {
            upVector = nvc.up.clone().normalize();
        }

        let huongMat = new THREE.Vector3(); 
        if (typeof camera !== 'undefined' && !isRemote) {
            camera.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
            if (huongMat.lengthSq() < 0.001) { nvc.getWorldDirection(huongMat); huongMat.projectOnPlane(upVector).normalize(); }
        } else {
            nvc.getWorldDirection(huongMat);
            huongMat.projectOnPlane(upVector).normalize();
        }
        if (huongMat.lengthSq() < 0.001) { huongMat.set(0, 0, 1).applyQuaternion(nvc.quaternion).projectOnPlane(upVector).normalize(); }

        let viTriGocToTam = nvc.position.clone().add(upVector.clone().multiplyScalar(3.5));

        let mucTieu = null;
        if (isRemote) {
            if (remoteDich) mucTieu = new THREE.Vector3(remoteDich.x, remoteDich.y, remoteDich.z);
            else mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
        } else {
            let targetRadar = window.layMucTieuGanNhatAce(viTriGocToTam);
            if (targetRadar && targetRadar.mesh) {
                // 🌟 BẢN VÁ: CHỐNG CRASH HITBOX
                let hitBox = typeof window.layHitbox === 'function' ? window.layHitbox(targetRadar.mesh) : null;
                mucTieu = (hitBox && hitBox.tamNguc && typeof hitBox.tamNguc.clone === 'function') ? hitBox.tamNguc.clone() : targetRadar.mesh.position.clone();
            } else {
                mucTieu = viTriGocToTam.clone().add(huongMat.clone().multiplyScalar(150));
            }

            if (window.room && window.room.localParticipant) {
                window.room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({
                    type: 'TUNG_CHIEU', skillType: phim, className: 'Ace',
                    origin: { x: viTriGocToTam.x, y: viTriGocToTam.y, z: viTriGocToTam.z }, target: { x: mucTieu.x, y: mucTieu.y, z: mucTieu.z }, dir: { x: huongMat.x, y: huongMat.y, z: huongMat.z }, weaponUrl: ""
                })), { reliable: false });
            }
        }

        let dameGoc = window.DAME_CUA_TOI || 100;
        if (isRemote !== false) {
            if (typeof isRemote === 'number' && isRemote > 0) dameGoc = isRemote;
            else if (casterId && typeof window.remotePlayers !== 'undefined' && window.remotePlayers[casterId]) dameGoc = window.remotePlayers[casterId].damage || 100;
        }

        let diemChanMucTieu = mucTieu.clone(); 

        if (loaiChieu === 'Q') {
            let soVien = 10;
            for (let i = 0; i < soVien; i++) {
                setTimeout(() => {
                    let curNvc = nvc; // 🌟 BẢN VÁ: KHÓA ẢO TƯỞNG CỤC BỘ
                    if (!curNvc) return;
                    let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                    let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                    if (curDir.lengthSq() < 0.001) curDir.set(0, 0, 1).applyQuaternion(curNvc.quaternion).projectOnPlane(curUp).normalize();

                    let tayBan = timXuong(curNvc, (i % 2 === 0) ? ['RHand_Palm_015', 'Object_20'] : ['LHand_Palm_011', 'Object_16']);
                    let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                    if (tayBan) tayBan.getWorldPosition(diemBan);

                    const lua = taoLuaFile('fire1', 2); 
                    lua.position.copy(diemBan).add(curDir.clone().multiplyScalar(1.5));
                    lua.up.copy(curUp); 

                    let targetBay = mucTieu ? mucTieu.clone() : curNvc.position.clone().add(curDir.clone().multiplyScalar(150));
                    let rightV = new THREE.Vector3().crossVectors(curDir, curUp).normalize();
                    targetBay.add(rightV.multiplyScalar((Math.random() - 0.5) * 3));
                    targetBay.add(curUp.clone().multiplyScalar((Math.random() - 0.5) * 3));

                    lua.lookAt(targetBay); scene.add(lua);

                    kyNangAce.push({
                        mesh: lua, type: 'BAY_THANG', speed: 6.0, life: 100, skillId: 'Q', 
                        targetPos: targetBay, damage: dameGoc * 0.04, isRemote: isRemote, noBanKinh: 10, upVector: curUp.clone()
                    });
                }, 150 + (i * 100)); 
            }
        }
        else if (loaiChieu === 'E') {
            setTimeout(() => {
                let curNvc = nvc; 
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();
                if (curDir.lengthSq() < 0.001) curDir.set(0, 0, 1).applyQuaternion(curNvc.quaternion).projectOnPlane(curUp).normalize();

                let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(3.5));
                let xuongPhai = timXuong(curNvc, ['RHand_Palm_015', 'Object_20']);
                if (xuongPhai) xuongPhai.getWorldPosition(diemBan);

                const lua = taoLuaFile('fire2', 25);
                lua.position.copy(diemBan).add(curDir.clone().multiplyScalar(2.0));
                lua.up.copy(curUp); 

                let targetBay = mucTieu ? mucTieu.clone() : curNvc.position.clone().add(curDir.clone().multiplyScalar(150));
                lua.lookAt(targetBay); scene.add(lua);

                kyNangAce.push({
                    mesh: lua, type: 'BAY_THANG', speed: 4.5, life: 120, skillId: 'E',
                    targetPos: targetBay, damage: dameGoc * 0.6, isRemote: isRemote, noBanKinh: 15, upVector: curUp.clone()
                });
            }, 500); 
        }
        else if (loaiChieu === 'R') {
            setTimeout(() => {
                let curNvc = nvc; 
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                let diemBan = curNvc.position.clone().add(curUp.clone().multiplyScalar(15.0)); 
                let tBay = diemChanMucTieu ? diemChanMucTieu.clone() : curNvc.position.clone().add(curDir.clone().multiplyScalar(100));

                const lua = taoLuaFile('fire3', 45);
                lua.position.copy(diemBan);
                lua.up.copy(curUp); 
                lua.lookAt(tBay); scene.add(lua);

                kyNangAce.push({
                    mesh: lua, type: 'BAY_THANG', speed: 5.0, life: 250, skillId: 'R',
                    targetPos: tBay, damage: dameGoc * 0.5, isRemote: isRemote, noBanKinh: 30, upVector: curUp.clone()
                });
            }, 800); 
        }
        else if (loaiChieu === 'F') {
            setTimeout(() => {
                let curNvc = nvc; 
                if (!curNvc) return;
                let curUp = curNvc.up ? curNvc.up.clone().normalize() : new THREE.Vector3(0, 1, 0);
                let curDir = new THREE.Vector3(); curNvc.getWorldDirection(curDir); curDir.projectOnPlane(curUp).normalize();

                let diemNo = diemChanMucTieu ? diemChanMucTieu.clone() : curNvc.position.clone().add(curDir.clone().multiplyScalar(20));

                const lua = taoLuaFile('fire4', 5);
                lua.position.copy(diemNo);
                lua.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), curUp); 
                scene.add(lua);

                kyNangAce.push({
                    mesh: lua, type: 'NO_TAI_CHO', speed: 0, life: 120, 
                    skillId: 'F', currentScale: 5, maxScale: 50, 
                    targetPos: diemNo, damage: dameGoc * 1.0, isRemote: isRemote, noBanKinh: 40, upVector: curUp.clone()
                });

                if (isRemote === false) gaySatThuongAce(diemNo, dameGoc * 1.0, 40);
                else {
                    // 🌟 BẢN VÁ CHIÊU F: Gỡ khiên number
                    if (typeof window.gaySatThuongBossToPlayer === 'function') window.gaySatThuongBossToPlayer(diemNo, dameGoc * 1.0, 40);
                } 
                taoHieuUngNoAce(diemNo, true);

            }, 300); 
        }
    };

    window.updateCombatAce = function () {
        for (let i = kyNangAce.length - 1; i >= 0; i--) {
            let s = kyNangAce[i]; s.life--;

            if (s.mesh && s.mesh.children.length > 0) {
                let ruotLua = s.mesh.children[0];
                if (s.skillId === 'Q') ruotLua.rotateZ(0.8); 
                if (s.skillId === 'R') ruotLua.rotateY(0.2); 
                if (s.skillId === 'F') {
                    ruotLua.rotateY(0.3); 
                    if (s.currentScale < s.maxScale) {
                        s.currentScale += 1.5;
                        s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                    }
                }
            }

            if (s.type === 'BAY_THANG') {
                if (s.targetPos) {
                    let huongBay = new THREE.Vector3().subVectors(s.targetPos, s.mesh.position).normalize();
                    // 🌟 BẢN VÁ: VECTOR NaN
                    if (!isNaN(huongBay.x)) s.mesh.position.add(huongBay.multiplyScalar(s.speed));
                } else {
                    s.mesh.translateZ(s.speed);
                }

                if (s.targetPos && s.mesh.position.distanceTo(s.targetPos) < s.speed + 4) {
                    if (s.isRemote === false) gaySatThuongAce(s.targetPos, s.damage, s.noBanKinh);
                    else {
                        // 🌟 BẢN VÁ: BẺ KHIÊN NUMBER
                        if (typeof window.gaySatThuongBossToPlayer === 'function') {
                            window.gaySatThuongBossToPlayer(s.targetPos, s.damage, s.noBanKinh);
                        }
                    } 
                    taoHieuUngNoAce(s.targetPos, s.skillId === 'R');

                    if (s.skillId === 'R') {
                        s.type = 'NO_TAI_CHO'; s.life = 60; 
                    } else {
                        s.life = 0;
                    }
                }
            }

            if (s.life <= 0) {
                if (typeof window.donRac3D === 'function') window.donRac3D(s.mesh);
                else {
                    if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
                    if (typeof scene !== 'undefined') scene.remove(s.mesh);
                }
                kyNangAce.splice(i, 1);
            }
        }

        // 🌟 BẢN VÁ: KHÓI LỬA BAY LÊN DỌC THEO TRỤC ĐỊA CẦU
        for (let i = hieuUngAce.length - 1; i >= 0; i--) {
            let h = hieuUngAce[i]; h.life--;
            let posArr = h.system.geometry.attributes.position.array;
            
            // Ép khí nóng bốc ngược lên tâm hành tinh
            let riseVec = h.upVector ? h.upVector.clone().multiplyScalar(0.08) : new THREE.Vector3(0, 0.08, 0);

            for (let j = 0; j < posArr.length / 3; j++) {
                posArr[j * 3] += h.velocities[j].x; 
                posArr[j * 3 + 1] += h.velocities[j].y; 
                posArr[j * 3 + 2] += h.velocities[j].z;
                
                h.velocities[j].x *= 0.85; h.velocities[j].z *= 0.85; h.velocities[j].y *= 0.85; 
                h.velocities[j].add(riseVec); 
            }
            h.system.geometry.attributes.position.needsUpdate = true;
            h.system.material.opacity = h.life / 30; 

            if (h.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(h.system);
                if (h.system.geometry) h.system.geometry.dispose();
                if (h.system.material) h.system.material.dispose();
                hieuUngAce.splice(i, 1);
            }
        }

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
    // 🌟 KHỞI TẠO HỆ PHÁI VÀ PRELOAD RAM
    // ==========================================
    if (typeof window.SCRIPT_PHAI_CUA_TOI !== 'undefined' && window.SCRIPT_PHAI_CUA_TOI.trim() !== '') {
        window.HePhaiHienTai = {
            tenPhai: "Hỏa Quyền",
            khoiTao: function () {
                console.log("🔥 Đã kế thừa ý chí của Ace! Kích hoạt Động cơ Preload RAM và Trục Không Gian!");

                // 🌟 VÁ LỖI 2: PRELOAD CACHE 4 LOẠI LỬA CHỐNG SẬP LOADER
                if (typeof window.taiHoacNhanBanAsset === 'function') {
                    window.taiHoacNhanBanAsset('uploads/anims/fire1.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/fire2.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/fire3.glb', () => {});
                    window.taiHoacNhanBanAsset('uploads/anims/fire4.glb', () => {});
                }

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


// =========================================================================
// 🌟 BẢN VÁ: ÁNH XẠ TOÀN DIỆN MỌI BIẾN THỂ CHỮ HOA/THƯỜNG (CHỮA CÂM NÍN)
// =========================================================================
window.tungComboAce           = window.tungComboAce;
window.tungComboace           = window.tungComboAce;
window.tungComboPortgasDAce   = window.tungComboAce;
window.tungComboportgasdace   = window.tungComboAce;
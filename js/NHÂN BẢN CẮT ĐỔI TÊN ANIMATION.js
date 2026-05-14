import { dedup, prune } from '@gltf-transform/functions';

// ==========================================
// ⚙️ KHU VỰC ĐIỀU KHIỂN CỦA SẾP
// ==========================================

// 1. SAO CHÉP (NHÂN BẢN) ANIMATION
// Nhìn vào số thứ tự trên màn hình gltf.report
// Cú pháp: Số_thứ_tự_gốc : "TÊN_BẢN_SAO_MỚI"
const SAO_CHEP = {
    1: "ATTACK_1", // Ví dụ: Nhân bản Animation số 1 thành bản mới tên ATTACK_1
    1: "ATTACK_2", // Có thể nhân bản số 1 thêm lần nữa thành ATTACK_2
    1: "DIE"       // Nhân bản thêm phát nữa để làm hiệu ứng chết
};

// 2. CẮT ANIMATION (XÉN THỜI GIAN)
// Sếp bấm Play animation trên màn hình, nhìn số Giây (Seconds) để biết điểm đầu/cuối
// Cú pháp: "TÊN_ANIMATION" : [Giây_bắt_đầu, Giây_kết_thúc]
const CAT_ANIMATION = {
    "ATTACK_1": [1.5, 3.2], // Cắt bản ATTACK_1, chỉ lấy từ giây 1.5 đến giây 3.2
    "ATTACK_2": [4.0, 5.8], // Cắt bản ATTACK_2, chỉ lấy từ giây 4.0 đến 5.8
    "DIE":      [8.0, 10.5] // Cắt bản DIE, chỉ lấy từ giây 8.0 đến 10.5
};

// ==========================================
// 🚀 BỘ MÁY XỬ LÝ SAO CHÉP VÀ CẮT GỌT
// ==========================================
const root = document.getRoot();
const animations = root.listAnimations();

console.log(`📦 Bắt đầu xử lý. Đang có ${animations.length} Animation gốc.`);

// --- HÀM HỖ TRỢ NHÂN BẢN SÂU (DEEP CLONE KEYFRAMES) ---
function nhanBanAnimation(doc, oldAnim, newName) {
    const newAnim = doc.createAnimation(newName);
    const samplerMap = new Map();

    // 1. Photo copy toàn bộ điểm neo thời gian (Keyframes)
    for (const sampler of oldAnim.listSamplers()) {
        const newSampler = doc.createSampler()
            .setInput(sampler.getInput().clone())
            .setOutput(sampler.getOutput().clone())
            .setInterpolation(sampler.getInterpolation());
        newAnim.addSampler(newSampler);
        samplerMap.set(sampler, newSampler);
    }

    // 2. Nối dây thần kinh từ Keyframe mới vào Xương cũ
    for (const channel of oldAnim.listChannels()) {
        const newChannel = doc.createChannel()
            .setTargetPath(channel.getTargetPath())
            .setTargetNode(channel.getTargetNode())
            .setSampler(samplerMap.get(channel.getSampler()));
        newAnim.addChannel(newChannel);
    }
    return newAnim;
}

// --- BƯỚC 1: TIẾN HÀNH SAO CHÉP ---
for (let stt in SAO_CHEP) {
    let index = parseInt(stt) - 1; // Máy tính đếm từ 0
    if (animations[index]) {
        let tenCu = animations[index].getName();
        let tenMoi = SAO_CHEP[stt];
        nhanBanAnimation(document, animations[index], tenMoi);
        console.log(`✔️ ĐÃ SAO CHÉP: Từ "${tenCu}" (Số ${stt}) ➔ Tạo ra bản mới "${tenMoi}"`);
    } else {
        console.warn(`⚠️ KHÔNG TÌM THẤY Animation số ${stt} để sao chép!`);
    }
}

// --- Lấy danh sách mới bao gồm cả những bản vừa nhân bản ---
const allAnimations = root.listAnimations();

// --- BƯỚC 2: TIẾN HÀNH CẮT GỌT ---
for (let tenAnim in CAT_ANIMATION) {
    let khoangThoiGian = CAT_ANIMATION[tenAnim];
    let tStart = khoangThoiGian[0];
    let tEnd = khoangThoiGian[1];

    let targetAnim = allAnimations.find(a => a.getName() === tenAnim);
    
    if (targetAnim) {
        let soTrackBiCat = 0;
        
        for (const sampler of targetAnim.listSamplers()) {
            const inputAcc = sampler.getInput();
            const outputAcc = sampler.getOutput();
            
            const inputArr = inputAcc.getArray();
            const outputArr = outputAcc.getArray();
            const elemSize = outputAcc.getElementSize(); // Đo xem dữ liệu là 3D (XYZ) hay 4D (Góc xoay Quat)

            const newTimes = [];
            const newValues = [];

            // Máy xén thời gian: Chỉ nhặt những khung hình nằm trong khoảng Sếp chọn
            for (let i = 0; i < inputArr.length; i++) {
                const t = inputArr[i];
                if (t >= tStart && t <= tEnd) {
                    newTimes.push(t - tStart); // 🌟 Ép thời gian bắt đầu quay về số 0 giây
                    for (let j = 0; j < elemSize; j++) {
                        newValues.push(outputArr[i * elemSize + j]);
                    }
                }
            }

            // Ghi đè dữ liệu mới đã xén vào Animation
            if (newTimes.length > 0) {
                inputAcc.setArray(new Float32Array(newTimes));
                outputAcc.setArray(new Float32Array(newValues));
                soTrackBiCat++;
            }
        }
        console.log(`✂️ ĐÃ CẮT: Animation "${tenAnim}" (Từ ${tStart}s đến ${tEnd}s).`);
    } else {
        console.warn(`⚠️ KHÔNG THỂ CẮT: Không tìm thấy Animation tên "${tenAnim}"`);
    }
}

// --- BƯỚC 3: DỌN RÁC NHẸ NHÀNG ---
await document.transform(
    prune(), 
    dedup()
);
console.log(`🎉 HOÀN TẤT! File hiện tại có ${root.listAnimations().length} Animations.`);
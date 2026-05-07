import { dedup, prune, textureCompress, draco, weld, resample, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

// Khởi động động cơ gọt lưới của Meshoptimizer
await MeshoptSimplifier.ready;

await document.transform(
    // 1. DỌN RÁC TOÀN DIỆN
    prune(),
    dedup(),

    // 2. ÉP XƯƠNG (ANIMATION): Xóa bớt các khung hình (Keyframe) thừa thãi của chuyển động. 
    // Quái đứng xa múa hơi giật một xíu không ai rảnh mà soi!
    resample({ tolerance: 0.01 }), 

    // Hàn điểm ảnh trước khi gọt
    weld(),

    // 3. GỌT THỊT (CỰC KỲ ÁC): Lệnh này sẽ chặt chém 80% số lượng lưới Đa giác (Polygons) của con quái. 
    // Chỉ giữ lại 20% (ratio: 0.2). Đứng xa nhìn vẫn ra hình con rồng, nhưng nhẹ bằng một cọng lông!
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.2, error: 0.05 }),

    // 4. LUỘC DA (TEXTURE): Ép độ phân giải ảnh của da, lông, vảy xuống mức bùn lầy (256x256). 
    textureCompress({
        targetFormat: 'webp',
        resize: [256, 256] // Cực kỳ bạo lực. Sếp có thể tăng lên [512, 512] nếu thấy nó quá mờ.
    }),

    // 5. NÉN KỊCH KHUNG DRACO (0 LÀ MỨC ÉP TÀN NHẪN NHẤT)
    draco({ 
        method: 'edgebreaker', 
        encodeSpeed: 0, 
        decodeSpeed: 0 
    })
);









https://drive.google.com/drive/folders/1rEYcXxj-EwtSt4WX4cjYqT-bWP78D-3E?usp=sharing







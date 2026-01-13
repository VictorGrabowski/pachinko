import sharp from 'sharp';
import path from 'path';

const inputDir = 'C:/Users/v.grabowski/.gemini/antigravity/brain/20bed691-42f6-438e-a2cc-0a3eab12b813';
const outputDir = 'c:/Users/v.grabowski/WebstormProjects/pachinko-team-6/public/assets/tutorial';

const images = [
    { input: 'uploaded_image_0_1768294585259.png', output: 'yokai_1.png' },
    { input: 'uploaded_image_1_1768294585259.png', output: 'yokai_2.png' },
    { input: 'uploaded_image_2_1768294585259.png', output: 'yokai_3.png' },
    { input: 'uploaded_image_3_1768294585259.png', output: 'yokai_4.png' }
];

async function cropToSquare() {
    for (const img of images) {
        const inputPath = path.join(inputDir, img.input);
        const outputPath = path.join(outputDir, img.output);

        try {
            // Get image metadata
            const metadata = await sharp(inputPath).metadata();
            const { width, height } = metadata;

            // Calculate square crop (center)
            const size = Math.min(width, height);
            const left = Math.floor((width - size) / 2);
            const top = Math.floor((height - size) / 2);

            // Crop and resize to 100x100 for display
            await sharp(inputPath)
                .extract({ left, top, width: size, height: size })
                .resize(100, 100)
                .toFile(outputPath);

            console.log(`Created: ${img.output}`);
        } catch (err) {
            console.error(`Error processing ${img.input}:`, err.message);
        }
    }
}

cropToSquare();

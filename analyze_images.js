const fs = require('fs');
const path = require('path');

function getPngSize(buffer) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
}

function getJpegSize(buffer) {
    let i = 2;
    while (i < buffer.length) {
        const marker = buffer.readUInt16BE(i);
        i += 2;
        if (marker >= 0xFFC0 && marker <= 0xFFC3) {
            i += 3;
            const height = buffer.readUInt16BE(i);
            const width = buffer.readUInt16BE(i + 2);
            return { width, height };
        }
        i += buffer.readUInt16BE(i);
    }
}

const files = [
    'public/photo_booth/frame.JPEG',
    'public/photo_booth/frame.PNG',
    'public/photo_booth/left_up.PNG',
    'public/photo_booth/left_down.PNG',
    'public/photo_booth/right_up.PNG',
    'public/photo_booth/right_down.PNG'
];

const basePath = 'c:\\Users\\djcom\\.gemini\\antigravity\\scratch\\seungseop-grad';

let output = '';
files.forEach(f => {
    const fullPath = path.join(basePath, f);
    if (!fs.existsSync(fullPath)) {
        output += `${f}: Not found\n`;
        return;
    }
    const buffer = fs.readFileSync(fullPath);
    let size = null;
    if (f.endsWith('.PNG')) {
        size = getPngSize(buffer);
    } else if (f.endsWith('.JPEG') || f.endsWith('.jpg')) {
        size = getJpegSize(buffer);
    }
    if (size) {
        output += `${f}: ${size.width}x${size.height}\n`;
    } else {
        output += `${f}: Could not determine size\n`;
    }
});
fs.writeFileSync('image_info.txt', output);
console.log('Results written to image_info.txt');

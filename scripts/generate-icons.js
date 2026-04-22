import sharp from 'sharp'

const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#6366f1"/>
  <text
    x="${size / 2}" y="${size / 2 + size * 0.04}"
    font-family="-apple-system, PingFang SC, Helvetica Neue, sans-serif"
    font-size="${Math.round(size * 0.44)}"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
  >做！</text>
</svg>`

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg(size)))
    .resize(size, size)
    .png()
    .toFile(`public/icon-${size}.png`)
  console.log(`✓ icon-${size}.png`)
}

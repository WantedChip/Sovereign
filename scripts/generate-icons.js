import fs from "fs"
import path from "path"
import zlib from "zlib"

// Generates an uncompressed RGBA PNG buffer of given width, height, and solid/drawn pixels
function createPNG(width, height, drawPixel) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr.writeUInt8(8, 8) // Bit depth
  ihdr.writeUInt8(6, 9) // Color type: RGBA (6)
  ihdr.writeUInt8(0, 10) // Compression
  ihdr.writeUInt8(0, 11) // Filter
  ihdr.writeUInt8(0, 12) // Interlace

  const ihdrChunk = createChunk("IHDR", ihdr)

  // IDAT raw scanlines (1 filter byte + 4 bytes per pixel)
  const rowSize = 1 + width * 4
  const rawData = Buffer.alloc(height * rowSize)

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize
    rawData[rowOffset] = 0 // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4
      const [r, g, b, a] = drawPixel(x, y, width, height)
      rawData[pixelOffset] = r
      rawData[pixelOffset + 1] = g
      rawData[pixelOffset + 2] = b
      rawData[pixelOffset + 3] = a
    }
  }

  const compressedData = zlib.deflateSync(rawData)
  const idatChunk = createChunk("IDAT", compressedData)

  // IEND chunk
  const iendChunk = createChunk("IEND", Buffer.alloc(0))

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

function createChunk(type, data) {
  const len = data.length
  const buf = Buffer.alloc(8 + len + 4)
  buf.writeUInt32BE(len, 0)
  buf.write(type, 4, 4, "ascii")
  data.copy(buf, 8)

  const crcVal = crc32(buf.subarray(4, 8 + len))
  buf.writeUInt32BE(crcVal >>> 0, 8 + len)
  return buf
}

// CRC32 calculation table
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return crc ^ 0xffffffff
}

// Drawing function for Sovereign logo (Dark background #0D0F12, Brass #C4A47C compass diamond)
function drawSovereignIcon(x, y, width, height) {
  const cx = width / 2
  const cy = height / 2
  const maxR = width / 2

  const dx = x - cx
  const dy = y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Background dark ink (#0D0F12)
  let r = 0x0d
  let g = 0x0f
  let b = 0x12
  let a = 255

  // Outer border ring (#1E232B)
  if (dist > maxR * 0.88 && dist <= maxR * 0.95) {
    r = 0x33
    g = 0x3b
    b = 0x47
  }

  // Brass compass diamond in center (#C4A47C)
  const normX = Math.abs(dx) / (maxR * 0.55)
  const normY = Math.abs(dy) / (maxR * 0.55)

  if (normX + normY <= 1.0) {
    r = 0xc4
    g = 0xa4
    b = 0x7c

    // Highlight inner center diamond accent (#D4B892)
    const innerX = Math.abs(dx) / (maxR * 0.25)
    const innerY = Math.abs(dy) / (maxR * 0.25)
    if (innerX + innerY <= 1.0) {
      r = 0xdf
      g = 0xc7
      b = 0xa6
    }
  }

  return [r, g, b, a]
}

const iconsDir = path.resolve("public/icons")
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

console.log("Generating PWA icons...")
const icon192 = createPNG(192, 192, drawSovereignIcon)
fs.writeFileSync(path.join(iconsDir, "icon-192.png"), icon192)
console.log("Generated icon-192.png")

const icon512 = createPNG(512, 512, drawSovereignIcon)
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), icon512)
console.log("Generated icon-512.png")

const iconMaskable = createPNG(512, 512, drawSovereignIcon)
fs.writeFileSync(path.join(iconsDir, "icon-maskable-512.png"), iconMaskable)
console.log("Generated icon-maskable-512.png")

console.log("All PWA icons generated successfully!")

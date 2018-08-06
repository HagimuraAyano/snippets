/**
 * @description Utf16 相關計算和判定
 */

const BigEndian = Buffer.from([0xfe, 0xff]);
const littleEndian = Buffer.from([0xff, 0xfe]);


/**
 * 判斷是否位 big indian
 * @param {Buffer} buffer 字符串緩存
 */
const isBigEndian = buffer => buffer.slice(0, 2).compare(BigEndian) === 0;


/**
 * 判斷是否位 little endian
 * @param {Buffer} buffer 字符串緩存
 */
const isLittleEndian = buffer => buffer.slice(0, 2).compare(littleEndian) === 0;


/**
 * 判斷字符串是否不是 utf16 編碼
 * @param {Buffer} buffer 字符串緩存
 */
const illegal = buffer => !(isBigEndian(buffer) || isLittleEndian(buffer));

/**
 * 轉換基本多語言平面
 * @param {Number} code 字符編碼
 * @param {Boolean} le 轉換爲 little-endian 還是 big-indian
 */
const bmp2buffer = (code, le) => {
  const mask = 2 ** 8 - 1;
  const high = code >> 8;
  const low = code & mask;
  return le ? Buffer.from([low, high]) : Buffer.from([high, low]);
}
/**
 * 轉換輔助平面
 * @param {Number} code 字符編碼
 * @param {Boolean} le 轉換爲 little-endian 還是 big-indian
 */
const sp2buffer = (code, le) => {
  const mask = 2 ** 8 - 1;
  const v = code - 0x10000;
  const high = (v >> 10) + 0xd800;
  const low = (v & (2 ** 10 - 1)) + 0xdc00;

  arr = le ? [high & mask, high >> 8, low & mask, low >> 8] : [high >> 8, high & mask, low >> 8, low & mask];
  return Buffer.from(arr);
}
/**
 * 將 charcode 轉換成 buffer 形式
 * @param {Number} code 字符編碼
 * @param {Boolean} le 轉換爲 little-endian 還是 big-indian
 */
const charCode2buffer = (code, le = true) => {
  return code < 0x10000 ? bmp2buffer(code, le) : sp2buffer(code, le);
}


/**
 * 轉換基本多語言平面
 * @param {Buffer} buffer 字符串緩存
 * @param {Boolean} le 轉換爲 little-endian 還是 big-indian
 */
const bmp2charCode = (buffer, le = true) => {
  return le ? (buffer[1] << 8) + buffer[0] : (buffer[0] << 8) + buffer[1];
}


/**
 * 轉換輔助平面
 * @param {Buffer} buffer 字符串緩存
 * @param {Boolean} le 轉換爲 little-endian 還是 big-indian
 */
const sp2charCode = (buffer, le = true) => {
  const high = le
    ? (buffer[1] << 8) + buffer[0]
    : (buffer[0] << 8) + buffer[1];
  const low = le
    ? (buffer[3] << 8) + buffer[2]
    : (buffer[2] << 8) + buffer[3];
  console.log(low)
  return (high - 0xd800 << 10) + low - 0xdc00 + 0x10000;
}


/**
 * 將字符串緩存轉換成字符編碼
 * @param {Buffer} buffer 字符串緩存
 * @param {Boolean} le 轉換爲 little-endian 還是 big-indian
 */
const buffer2charCode = (buffer, le = true) => {
  return buffer.length === 2 ? bmp2charCode(buffer, le) : sp2charCode(buffer, le);
}

module.exports = {
  isBigEndian,
  isLittleEndian,
  illegal,
  charCode2buffer,
  buffer2charCode,
}
const BigEndian = Buffer.from([0x00, 0x00, 0xfe, 0xff]);
const littleEndian = Buffer.from([0xff, 0xfe, 0x00, 0x00]);

const isBigEndian = buffer => buffer.slice(0, 4).compare(BigEndian) === 0;
const isLittleEndian = buffer => buffer.slice(0, 4).compare(littleEndian) === 0;

/**
 * 判斷字符串是否不是 utf32 編碼
 * @param {Buffer} buffer 字符串緩存
 */
const illegal = buffer => !(isBigEndian(buffer) || isLittleEndian(buffer));

module.exports = {
  isBigEndian,
  isLittleEndian,
  illegal,
}
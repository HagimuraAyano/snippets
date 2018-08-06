/* 计算对数 */
const log = (N, a) => Math.log(N) / Math.log(a);

/* 将数字填充成指定长度 */
const pad = (str, len = 8) => str.length < len ? '0'.repeat(len - str.length) + str : str;

/* 转变buffer内数字的显示方式 */
const showBufferAs = (buffer, bit = 2) => buffer.reduce((list, byte) => (list.push(pad(byte.toString(bit), log(256, bit))), list), []);

/* 计算数字的位数 */
const bitCount = number => {
  let count = 1;
  while (number >>= 1) count ++;
  return count;
}

module.exports = {
  pad, showBufferAs, bitCount
}
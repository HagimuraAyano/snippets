/**
 * @description utf8 相關判定與計算
 */

/* utf8字符起始字節的特徵 */
const utf8FeatureList = [
  { shift: 7, value: 0 },
  { shift: 5, value: 0b110 },
  { shift: 4, value: 0b1110 },
  { shift: 3, value: 0b11110 },
  { shift: 2, value: 0b111110 },
  { shift: 1, value: 0b1111110 },
];

/* BOM 字符串的起始符號 */
const BOMFeature = Buffer.from([0xef, 0xbb, 0xbf]);

/**
 * 根據utf8字符的第一個字節判斷該字符佔據的內存空間大小，-1表示不是utf8的起始字節
 * @param {Number} number 字符第一個字節的數據
 */
function utf8CharSize(number) {
  for (let i = utf8FeatureList.length - 1; i >= 0; i -= 1) {
    const { shift, value } = utf8FeatureList[i];
    if (number >> shift === value) {
      return i + 1;
    }
  }
  return -1;
}


/**
 * 判斷一個字符串是否爲 utf8 編碼
 * @param {Buffer} buffer 字符串的緩衝
 */
function isUtf8(buffer) {
  let i = 0;
  let succ = 0;
  let total = 0;
  const ln = buffer.length;

  while (i < ln) {
    const length = utf8CharSize(buffer[i]);
    /* 是一個 utf8字符的起始字節 */
    if (length > 0) {
      let legal = true;
      let pos = i;
      /* 判斷之後的字節是否合法 */
      while (++pos < i + length) {
        legal = legal && (buffer[pos] >> 6) === 2;
      }
      /* 如果合法，就跳過這一段 */
      if (legal) {
        i += length;
        succ += 1;
      } else {
        i += 1;
      }
    } else {
      i += 1;
    }
    total += 1;
  }
  console.log(succ / total, total - succ)
  return succ / total > 0.9 || total - succ < 2;
}


/**
 * 判斷一個字符串是否爲 BOM 類型
 * @param {Buffer} buffer 字符串的緩衝
 */
function isBOM(buffer) {
  return !buffer.slice(0, 3).compare(BOMFeature) && isUtf8(buffer);
}

/* 计算数字的位数 */
const bitCount = number => {
  let count = 1;
  while (number >>= 1) count++;
  return count;
}


/**
 * 根據佔據的字節數給出代表的標誌
 * @param {Number} len unicode佔據的字節數
 */
function lead(len) {
  if (len === 0) {
    return 0;
  }
  let ret = 0;
  for (let i = 0; i < len; i += 1) {
    ret = ret << 1;
    ret += 1;
  }
  for (let i = 0; i < 8 - len; i += 1) {
    ret = ret << 1;
  }
  return ret;
}


/**
 * 計算碼點佔據的字節數
 * @param {Number} code unicode 碼點
 */
function byteUsage(code) {
  return Math.ceil((bitCount(code) - 1) / 5);
}


/**
 * 將碼點轉換成 buffer
 * @param {Number} code unicode 字符碼點
 */
function charCode2buffer(code) {
  /* 單字節字符 */
  if (code < 2**8) {
    return Array.from([code]);
  }
  
  let byte = byteUsage(code);
  let arr = [];
  const mask = 2**6 - 1;
  const leadVal = lead(byte);
  /* 將編碼分割存儲到不同的字節 */
  while(byte > 0) {
    let val = code & mask;
    if (byte > 1) {
      arr.unshift(val + 0x80);
    } else {
      arr.unshift(val)
    }
    code = code >> 6;
    byte --;
  }
  /* 添加上字節計數標誌 */
  arr[0] += leadVal;
  return Buffer.from(arr);
}

/**
 * 將 buffer 轉換位碼點
 * @param {Buffer} buffer 字符緩存
 */
function buffer2charcode(buffer) {
  const len = buffer.length;
  if (len === 1) {
    return buffer[0];
  }
  /* 計算起始字節 */
  let code = buffer[0] - lead(len) << 6 * (len - 1);
  /* 計算剩餘字節 */
  for (let i = 1; i < len; i += 1) {
    code += (buffer[i] & 2**6 - 1) << 6 * (len - 1 - i);
  }
  return code;
}


module.exports = {
  isUtf8,
  isBOM,
  utf8CharSize,
  charCode2buffer,
  buffer2charcode,
};
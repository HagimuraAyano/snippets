/**
 * 計算數字中小數的位數
 * @param {Number} number 數字
 */
function countDecimal(number) {
    const numberString = String(number);
    const idx = numberString.indexOf('.');
    return idx === -1 ? 0 : numberString.length - idx - 1;
}
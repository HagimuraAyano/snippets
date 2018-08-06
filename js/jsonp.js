/**
 * 解析，获取JSONP当中的数据
 * @param {string} jsonp JSONP数据
 * @returns {any} jsonp当中的数据
 */
function parse(jsonp) {
  return Function('return ' + jsonp.slice(jsonp.indexOf('(') + 1, jsonp.indexOf(')')))();
}

module.exports = parse;
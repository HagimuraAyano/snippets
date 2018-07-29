/**
 * 將 node 命令行輸入的參數列表轉換成對象的形式
 * @param {Array} arglist process.argv 傳入的參數數組
 */
export function nodeList(arglist) {
    const map = {};
    let stack = [];
    let key = '';

    function commit() {
        if (stack.length) {
            map[key] = stack.length > 1 ? stack : stack[0];
        }
    }
    for (let i = 0, ln = arglist.length; i < ln; i += 1) {
        const token = arglist[i];
        /* is key */
        if (token.startsWith('-')) {
            /* 如果key已經存在 */
            if (key) {
                commit();
                stack = [];
            }
            key = token[1] === '-' ? token.slice(2) : token.slice(1);
        } else {
            /* 是值 */
            stack.push(token);
        }
    }

    commit();

    return map;
}


/**
 * 命令行中傳遞的參數有如下幾種格式：
 * 
 * --key
 * -key
 * value
 * "value"
 * "val ue"
 * 'value'
 * 'val ue'
 * 
 * 按照類型分爲兩類：key 和 value
 * 按照特徵分爲三類：slash標註的參數，字符串，使用引號標註的字符串
 * 
 * 解析器按照特徵進行分類，標註按照類型進行分類
 */
const tokenParserList = [
    {
        type: 'key',
        match(char) {
            return char === '-';
        },
        process(string, idx) {
            const re = /\s/;
            const ln = string.length;
            let position = string[idx + 1] === '-' ? idx + 2 : idx + 1;
            let content = '';

            while (!re.test(string[position]) && position < ln) {
                content += string[position];
                position += 1;
            }

            return { content, position };
        },
    },
    {
        type: 'value',
        match(char) {
            return char === '"' || char === '\'';
        },
        process(string, idx) {
            const endChar = string[idx];
            const ln = string.length;
            let position = idx + 1;
            let content = '';
            while (
                /* 終結條件是存在字符而且不是轉義字符 */
                !(
                    string[position - 1] !== '\\'
                    && string[position] === endChar
                )
                && position < ln
            ) {
                content += string[position];
                position += 1;
            }

            return { content, position };
        },
    }, {
        type: 'value',
        match(char) {
            return /[^\s-"']/.test(char);
        },
        process(string, idx) {
            const ln = string.length;
            let content = '';
            let position = idx;

            while (!/\s/.test(string[position]) && position < ln) {
                content += string[position];
                position += 1;
            }

            return { content, position };
        },
    },
];

/**
 * 對傳入的命令行參數做分詞處理
 * @param {string} string 傳入的命令行字符串
 */
export function tokenizer(string) {
    const ln = string.length;
    const tokenList = [];
    let position = 0;
    let char;

    while (position < ln) {
        let idx = 0;
        const len = tokenParserList.length;
        char = string[position];
        while (idx < len) {
            const { type, match, process } = tokenParserList[idx];
            if (match(char)) {
                const { content, position: newPosition } = process(string, position);
                tokenList.push({ type, content });
                /* 更新位置 */
                position = newPosition;
                break;
            }
            idx += 1;
        }
        /* 匹配到的是空字符，+1 */
        if (idx === len) {
            position += 1;
        }
        // console.log(char, position, idx, len);
    }

    return tokenList;
}


/**
 * 將 token 列表轉換成可用的 js 對象
 * @param {Array} tokenList token 列表
 * @param {Object} limits 對於每個參數個數的限定
 */
export function renderer(tokenList, limits = {}) {
    const map = {};
    const list = [];
    let stack = [];
    let key = '';

    function commit() {
        /* token 爲 key */
        if (key) {
            if (!(key in limits) || limits[key] < 1) {
                /* 無效的 limit 或者 limit 不存在 */
                map[key] = stack.length === 1 ? stack[0] : stack;
            } else if (stack.length === 1) {
                [map[key]] = stack;
            } else {
                map[key] = stack.slice(0, limits[key]);
                Array.prototype.push.apply(list, stack.slice(limits[key]));
            }
        } else {
            Array.prototype.push.apply(list, stack);
        }
    }

    tokenList.forEach((token) => {
        const { type, content } = token;
        if (type === 'key') {
            commit();
            key = content;
            stack = [];
        } else {
            /* token 爲 value */
            stack.push(content);
        }
    });

    commit();

    return { map, list };
}
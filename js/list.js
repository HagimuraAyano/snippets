/* 创建一个等差序列的几种方法 */
{
    // Array.apply
    Array.apply(null, { length: 10 }).map((v, idx) => idx);
}

{
    // Array.from
    Array.from(Array(10), (v, k)=>k);
}
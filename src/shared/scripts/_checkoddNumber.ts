/**
 * 奇数かどうか判定。
 * @param {Number} number 判定する数字
 * @returns {boolean}
 */
export const checkOddNumber: (number: number) => boolean = (
  number: number
): boolean => !(number % 2 !== 0);

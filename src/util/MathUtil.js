class MathUtil {
  static round (number, precision = 0) {
    if (typeof number !== 'number' || typeof precision !== 'number') return false

    const numSign = number >= 0 ? 1 : -1

    return (
      Math.round(number * Math.pow(10, precision) + numSign * 0.0001) /
            Math.pow(10, precision)
    ).toFixed(precision)
  }
}

module.exports = MathUtil

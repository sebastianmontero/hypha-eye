const assert = require('assert')
const { MathUtil } = require('../util')

const parseAssetRegex = /^\s*(-?\d+.?(\d*))\s*([a-zA-Z]+)\s*$/

class Asset {
  constructor (amount, symbol, precision = 4) {
    this.amount = Number(amount)
    this.symbol = symbol
    this.precision = precision
  }

  static max (a1, a2) {
    return a1.amount > a2.amount ? a1 : a2
  }

  static parse (assetStr) {
    const result = parseAssetRegex.exec(assetStr)
    if (!result) {
      throw new Error('String is not a valid Asset')
    }
    return new this(result[1], result[3], result[2].length)
  }

  multiply (value) {
    return new Asset(this.amount * value, this.symbol, this.precision)
  }

  roundedAmount () {
    return Number(this._roundedStr())
  }

  _roundedStr () {
    return MathUtil.round(this.amount, this.precision)
  }

  compare (asset) {
    assert(this.symbol === asset.symbol, "Can't compare assets of different type")
    return this.roundedAmount() - asset.roundedAmount()
  }

  toString () {
    return `${this._roundedStr()} ${this.symbol}`
  }
}

module.exports = Asset

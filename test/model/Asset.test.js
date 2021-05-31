/* eslint-disable no-undef */
const { Asset } = require('../../src/model')

describe('roundedAmount', () => {
  test('variuos assets', async () => {
    let asset = new Asset(1.95848549, 'USD', 2)
    expect(asset.roundedAmount()).toBe(1.96)

    asset = new Asset(1.43999999999, 'USD', 2)
    expect(asset.roundedAmount()).toBe(1.44)

    asset = new Asset(1.43999999999, 'USD', 4)
    expect(asset.roundedAmount()).toBe(1.44)

    asset = new Asset(1.43579999999, 'USD', 4)
    expect(asset.roundedAmount()).toBe(1.4358)
  })

  test('parse', async () => {
    let asset = Asset.parse('505.69 HUSD')
    expect(asset.amount).toBe(505.69)
    expect(asset.symbol).toBe('HUSD')
    expect(asset.precision).toBe(2)

    asset = Asset.parse('1505.6993 EOS')
    expect(asset.amount).toBe(1505.6993)
    expect(asset.symbol).toBe('EOS')
    expect(asset.precision).toBe(4)
  })

  test('toString', async () => {
    let asset = new Asset(1.95848549, 'USD', 2)
    expect(asset.toString()).toBe('1.96 USD')

    asset = new Asset(1.43999999999, 'USD', 2)
    expect(asset.toString()).toBe('1.44 USD')

    asset = new Asset(1.43999999999, 'USD', 4)
    expect(asset.toString()).toBe('1.4400 USD')

    asset = new Asset(1.43579999999, 'USD', 4)
    expect(asset.toString()).toBe('1.4358 USD')
  })
})

/* eslint-disable no-undef */
const DGraph = require('../../src/service/DGraph')
const Period = require('../../src/model/Period')

jest.setTimeout(20000)

let dgraph = null
let period = null

beforeAll(async () => {
  dgraph = new DGraph({
    addr: 'https://alpha.tekit.io'
  })
  period = new Period(dgraph)
  await period.load()
  console.log(JSON.stringify(period.periods, null, 4))
})

describe('periods', () => {
  test('getPeriod', async () => {
    expect(period.getPeriod(period.periods[0].hash)).toBe(period.periods[0])
    expect(period.getPeriod(period.periods[1].hash)).toBe(period.periods[1])
    expect(period.getPeriod(period.periods[5].hash)).toBe(period.periods[5])
  })

  test('getPeriod should throw for non existant hash', async () => {
    try {
      await period.getPeriod('nonexistant')
      fail('Should have thrown error for non existant hash')
    } catch (e) {
      expect(e.message).toContain('Period with hash')
    }
  })

  test('getStartDate', async () => {
    expect(period.getStartDate()).toBeInstanceOf(Date)
  })

  test('getEndPeriod', async () => {
    expect(period.getEndPeriod(period.periods[0].hash, 1)).toBe(period.periods[0])
    expect(period.getEndPeriod(period.periods[2].hash, 2)).toBe(period.periods[3])
    expect(period.getEndPeriod(period.periods[2].hash, 5)).toBe(period.periods[6])
  })

  test('isActive', async () => {
    expect(period.isActive(period.periods[0].hash, 100000)).toBe(true)
    expect(period.isActive(period.periods[0].hash, 1)).toBe(false)
    expect(period.isActive(period.periods[0].hash, 1, new Date('2019-07-09T10:55:00.000Z'))).toBe(true)
    expect(period.isActive(period.periods[0].hash, 1, new Date('2019-07-10T10:55:00.000Z'))).toBe(true)
    expect(period.isActive(period.periods[0].hash, 1, new Date('2019-07-16T21:39:00.000Z'))).toBe(false)
  })
})

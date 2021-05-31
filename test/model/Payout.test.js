/* eslint-disable no-undef */
const DGraph = require('../../src/service/DGraph')
const { Asset, Payout } = require('../../src/model')

jest.setTimeout(20000)

let dgraph = null
let payout = null

beforeAll(async () => {
  dgraph = new DGraph({
    addr: 'https://alpha.tekit.io'
  })
  payout = new Payout(dgraph)
})

describe('payouts', () => {
  test('fetch', async () => {
    const from = new Date('2021-04-20T20:22:26Z')
    const to = new Date('2021-05-21T20:22:26Z')
    const payouts = await payout.fetch({
      from,
      to
    })
    // console.log('assignments: ', JSON.stringify(assignments, null, 4))
    expect(payouts).not.toBeNull()
    expect(payouts).toBeInstanceOf(Array)
    expect(payouts.length).toBeGreaterThan(0)
    assertPayouts(payouts, from, to)
  })
})

function assertPayouts (payouts, from, to) {
  for (const p of payouts) {
    expect(p.title).not.toBeNull()
    expect(p.recipient).not.toBeNull()
    expect(p.paymentDate).toBeInstanceOf(Date)
    expect(p.seedsAmount).toBeInstanceOf(Asset)
    expect(p.husdAmount).toBeInstanceOf(Asset)
    expect(p.hvoiceAmount).toBeInstanceOf(Asset)
    expect(p.paymentDate.getTime()).toBeGreaterThanOrEqual(from.getTime())
    expect(p.paymentDate.getTime()).toBeLessThanOrEqual(to.getTime())
  }
}

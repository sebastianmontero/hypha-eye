/* eslint-disable no-undef */
const DGraph = require('../../src/service/DGraph')
const Assignment = require('../../src/model/Assignment')
const Period = require('../../src/model/Period')
const { Asset } = require('../../src/model')

jest.setTimeout(30000)

let dgraph = null
let period = null
let assignment = null

beforeAll(async () => {
  dgraph = new DGraph({
    addr: 'https://alpha.tekit.io'
  })
  period = new Period(dgraph)
  await period.load()
  assignment = new Assignment(dgraph, period)
})

describe('assignments', () => {
  test('fetch', async () => {
    const assignments = await assignment.fetch({ limit: 2 })
    // console.log('assignments: ', JSON.stringify(assignments, null, 4))
    expect(assignments).not.toBeNull()
    expect(assignments).toBeInstanceOf(Array)
    expect(assignments.length).toBe(2)
    const a = assignments[0]
    expect(a.createdDate).toBeInstanceOf(Date)
    expect(a.hyphaSalary).toBeInstanceOf(Asset)
    expect(a.husdSalary).toBeInstanceOf(Asset)
    expect(a.hvoiceSalary).toBeInstanceOf(Asset)
    expect(a.startPeriod).not.toBeNull()
    expect(a.endPeriod).not.toBeNull()
  })

  test('fetchActive', async () => {
    const assignments = await assignment.fetchActive()
    // console.log('assignments: ', JSON.stringify(assignments, null, 4))
    expect(assignments).not.toBeNull()
    expect(assignments).toBeInstanceOf(Array)
    expect(assignments.length).toBeGreaterThan(0)
    const a = assignments[0]
    expect(a.createdDate).toBeInstanceOf(Date)
    expect(a.hyphaSalary).toBeInstanceOf(Asset)
    expect(a.husdSalary).toBeInstanceOf(Asset)
    expect(a.hvoiceSalary).toBeInstanceOf(Asset)
    expect(a.startPeriod).not.toBeNull()
    expect(a.endPeriod).not.toBeNull()
  })
})

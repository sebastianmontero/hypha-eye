
const tags = ['assignment']

const periodSchema = {
  type: 'object',
  properties: {
    hash: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' }
  },
  nullable: true,
  additionalProperties: false
}

const assignmentSchema = {
  type: 'object',
  properties: {
    hash: { type: 'string' },
    title: { type: 'string' },
    assignee: { type: 'string' },
    startPeriod: periodSchema,
    endPeriod: periodSchema,
    usdSalary: { type: 'string' },
    husdSalary: { type: 'string' },
    hyphaSalary: { type: 'string' },
    hvoiceSalary: { type: 'string' },
    startPeriodHash: { type: 'string' },
    periodCount: { type: 'integer' },
    timeSharex100: { type: 'integer' },
    deferredPercx100: { type: 'integer' }
  },
  additionalProperties: false
}

const listAssignmentSchema = {
  tags,
  produces: [
    'application/json',
    'text/csv'
  ],
  response: {
    200: {
      type: 'object',
      required: ['assignments'],
      properties: {
        assignments: {
          type: 'array',
          items: assignmentSchema
        }
      }
    }
  }
}

module.exports = {
  listAssignmentSchema
}

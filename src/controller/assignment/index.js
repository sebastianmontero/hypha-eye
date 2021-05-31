'use strict'

const { parse } = require('json2csv')
const {
  listAssignmentSchema
} = require('./schemas')

module.exports = async function (fastify, opts) {
  // Route registration
  // fastify.<method>(<path>, <schema>, <handler>)
  // schema is used to validate the input and serialize the output

  // Logged APIs
  fastify.register(async function (fastify) {
    fastify.get('/active', { schema: listAssignmentSchema }, activeHandler)
  })
}

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
    fastify: [
      'assignment'
    ]
  }
}

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration

async function activeHandler (req, reply) {
  const { accept } = req.headers
  const assignments = await this.assignment.fetchActive()
  if (accept === 'text/csv') {
    reply.header('Content-Disposition', 'attachment; filename=active-assignments.csv')
    return parse(assignments, {
      transforms: [
        a => ({
          hash: a.hash,
          title: a.title,
          assignee: a.assignee,
          startDate: a.startPeriod.startDate.toISOString(),
          endDate: a.endPeriod ? a.endPeriod.endDate.toISOString() : null,
          usdSalary: a.usdSalary.toString(),
          husdSalary: a.husdSalary.toString(),
          hyphaSalary: a.hyphaSalary.toString(),
          hvoiceSalary: a.hvoiceSalary.toString(),
          startPeriodHash: a.startPeriodHash,
          periodCount: a.periodCount,
          timeSharex100: a.timeSharex100,
          deferredPercx10: a.deferredPercx100
        })
      ]
    })
  }
  return {
    assignments
  }
}

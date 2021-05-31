'use strict'

const { parse } = require('json2csv')
const {
  listPayoutSchema
} = require('./schemas')

module.exports = async function (fastify, opts) {
  // Route registration
  // fastify.<method>(<path>, <schema>, <handler>)
  // schema is used to validate the input and serialize the output

  // Logged APIs
  fastify.register(async function (fastify) {
    fastify.get('/', { schema: listPayoutSchema }, listHandler)
  })
}

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
    fastify: [
      'payout'
    ]
  }
}

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration

async function listHandler (req, reply) {
  const { accept } = req.headers
  const {
    from,
    to,
    account
  } = req.query
  console.log('Query: ', req.query)
  const payouts = await this.payout.fetch({
    from: new Date(from),
    to: new Date(to),
    account
  })
  if (accept === 'text/csv') {
    reply.header('Content-Disposition', `attachment; filename=payouts-${new Date().toISOString()}.csv`)
    return parse(payouts, {
      transforms: [
        p => ({
          hash: p.hash,
          title: p.title,
          recipient: p.recipient,
          paymentDate: p.paymentDate.toISOString(),
          seedsAmount: p.seedsAmount.toString(),
          usdAmount: p.usdAmount.toString(),
          husdAmount: p.husdAmount.toString(),
          hyphaAmount: p.hyphaAmount.toString(),
          hvoiceAmount: p.hvoiceAmount.toString()
        })
      ]
    })
  }
  return {
    payouts
  }
}

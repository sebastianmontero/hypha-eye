
const tags = ['payout']

const payoutSchema = {
  type: 'object',
  properties: {
    hash: { type: 'string' },
    title: { type: 'string' },
    recipient: { type: 'string' },
    seedsAmount: { type: 'string' },
    usdAmount: { type: 'string' },
    husdAmount: { type: 'string' },
    hyphaAmount: { type: 'string' },
    hvoiceAmount: { type: 'string' },
    paymentDate: { type: 'string' }
  },
  additionalProperties: false
}

const listPayoutSchema = {
  tags,
  produces: [
    'application/json',
    'text/csv'
  ],
  query: {
    from: {
      type: 'string',
      format: 'date-time',
      example: '2021-05-01T16:15:08.5Z'
    },
    to: {
      type: 'string',
      format: 'date-time',
      example: '2021-05-31T16:15:08.5Z'
    },
    account: {
      type: 'string',
      nullable: true
    }
  },
  response: {
    200: {
      type: 'object',
      required: ['payouts'],
      properties: {
        payouts: {
          type: 'array',
          items: payoutSchema
        }
      }
    }
  }
}

module.exports = {
  listPayoutSchema
}

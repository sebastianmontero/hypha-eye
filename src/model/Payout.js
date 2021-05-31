const Asset = require('./Asset')
const Document = require('./Document')

const payoutsQuery = `
    query payouts($from: string, $to: string) {
      var(func: has(payout)){
        payouts as payout @filter(between(created_date, $from, $to)) @cascade{
          created_date
        }
      }
      payouts(func: uid(payouts), orderasc:created_date){
        hash
        creator
        created_date
        content_groups {
            contents {
              label
              type
              value
            }
        }
      }
    }
  `

const payoutsByUserQuery = `
  query payouts($account: string, $from: string, $to: string) {
    var(func: has(payout)){
      payouts as payout @filter(between(created_date, $from, $to)) @cascade{
        created_date
        content_groups {
          contents  @filter(eq(value,$account) and eq(label, "recipient")){
            label
            value
          }
        }
      }
    }
    payouts(func: uid(payouts), orderasc:created_date){
      hash
      creator
      created_date
      content_groups {
          contents {
            label
            type
            value
          }
      }
    }
  }
`
const payoutProps = {
  contentGroups: [
    {
      label: 'system',
      props: {
        legacy_object_created_date: 'paymentDate',
        original_approved_date: 'paymentDate'
      }
    },
    {
      label: 'details',
      props: {
        title: 'title',
        recipient: 'recipient',
        seeds_escrow_amount: 'seedsAmount',
        seeds_amount: 'seedsAmount',
        usd_amount: 'usdAmount',
        husd_amount: 'husdAmount',
        hvoice_amount: 'hvoiceAmount',
        hypha_amount: 'hyphaAmount',
        payment_date: 'paymentDate'
      }
    }
  ]
}

const migrationDate = new Date('2021-02-14T21:35:05.5Z')

class Payout {
  constructor (dgraph) {
    this.dgraph = dgraph
    this.activeFromDate = null
  }

  async fetch ({
    from,
    to,
    account = null
  }) {
    let query = payoutsQuery

    const params = {
      $from: from.toISOString(),
      $to: (to.getTime() < migrationDate.getTime() ? migrationDate : to).toISOString()
    }
    if (account) {
      params.$account = account
      query = payoutsByUserQuery
    }
    let { payouts } = await this.dgraph.query(
      query,
      params
    )
    payouts = this.parse(payouts, payoutProps)
    return payouts.filter(p => from.getTime() <= p.paymentDate.getTime() && to.getTime() >= p.paymentDate.getTime())
  }

  parse (docs) {
    const parsed = []
    for (const doc of docs) {
      const p = Document.parseDoc(doc, payoutProps)
      if (!p.usdAmount) {
        p.usdAmount = new Asset(0, 'USD', 2)
      }
      if (!p.husdAmount) {
        p.husdAmount = new Asset(0, 'HUSD', 2)
      }
      if (!p.paymentDate) {
        p.paymentDate = p.createdDate
      }
      parsed.push(p)
    }
    return parsed
  }
}

module.exports = Payout

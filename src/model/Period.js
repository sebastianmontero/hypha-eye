const Document = require('./Document')

const periodsQuery = `
    {
      documents as var(func: type(Document))@cascade{
        hash
        content_groups {
          contents  @filter(eq(value,"period") and eq(label, "type")){
            label
            type
          }
        }
      }
      periods(func: uid(documents)) {
        hash
        content_groups {
            expand(_all_) {
            expand(_all_)
          }
        }
      }
    }
  `

class Period {
  constructor (dgraph) {
    this.dgraph = dgraph
    this.periods = null
    this.positionMap = null
  }

  async fetch () {
    const { periods } = await this.dgraph.query(
      periodsQuery
    )
    return periods
  }

  async load () {
    this.periods = []
    const prds = await this.fetch()
    for (const prd of prds) {
      const cg = Document.getContentGroup(prd, 'details')
      if (cg) {
        this.periods.push({
          hash: prd.hash,
          startDate: Document.getValue(cg, 'start_time'),
          endDate: null
        })
      }
    }
    this.periods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    for (var i = 1; i < this.periods.length; i++) {
      this.periods[i - 1].endDate = this.periods[i].startDate
    }
    this.periods.pop()
    this.positionMap = {}
    this.periods.forEach((p, i) => {
      this.positionMap[p.hash] = i
    })
  }

  getByPos (pos) {
    if (pos >= this.periods.length) {
      throw new Error(`Position: ${pos} is greater than number of periods: ${this.periods.length}`)
    }
    return this.periods[pos]
  }

  getStartDate (pos = 0) {
    return this.getByPos(pos).startDate
  }

  getPeriod (hash) {
    const pos = this.positionMap[hash]
    if (pos == null) {
      throw new Error(`Period with hash: ${hash} not found`)
    }
    return this.getByPos(pos)
  }

  getEndPeriod (hash, periodCount) {
    const pos = this.positionMap[hash]
    const endPos = pos + periodCount - 1
    return pos != null && endPos < this.periods.length ? this.getByPos(endPos) : null
  }

  isActive (hash, periodCount, date = null) {
    const epochTime = (date || new Date()).getTime()
    const start = this.getPeriod(hash)
    const end = this.getEndPeriod(hash, periodCount)
    return start.startDate.getTime() <= epochTime && (end == null || epochTime < end.endDate.getTime())
  }
}

module.exports = Period

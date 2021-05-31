const Asset = require('./Asset')
const Document = require('./Document')

const assignmentsQuery = `
    query assignments($first: int, $offset: int, $from: string) {
      var(func: has(assignment)){
        assignments as assignment @filter(ge(created_date, $from )) @cascade{
        content_groups {
            contents  @filter(eq(value,"assignment") and eq(label, "type")){
              label
              value
            }
          }
        }
      }
      assignments(func: uid(assignments), orderasc:created_date, first: $first, offset: $offset){
        hash
        creator
        created_date
        content_groups{
            contents {
              label
              type
              value
            }
        }
      }
    }
  `
const assignmentProps = {
  contentGroups: [
    {
      label: 'details',
      props: {
        title: 'title',
        assignee: 'assignee',
        usd_salary_value_per_phase: 'usdSalary',
        husd_salary_per_phase: 'husdSalary',
        hypha_salary_per_phase: 'hyphaSalary',
        hvoice_salary_per_phase: 'hvoiceSalary',
        start_period: 'startPeriodHash',
        period_count: 'periodCount',
        time_share_x100: 'timeSharex100',
        deferred_perc_x100: 'deferredPercx100'

      }
    }
  ]
}
const ACTIVE_FROM_DATE_KEY = 'activeFromDate'

class Assignment {
  constructor ({
    dgraph,
    period,
    store
  }) {
    this.dgraph = dgraph
    this.period = period
    this.store = store
    this.activeFromDate = this.getActiveFromDate()
    console.log('activeFromDate: ', this.activeFromDate)
  }

  getActiveFromDate () {
    return this.store.has(ACTIVE_FROM_DATE_KEY) ? new Date(this.store.get(ACTIVE_FROM_DATE_KEY)) : null
  }

  async fetch ({
    from = null,
    limit,
    offset
  }) {
    from = from || this.period.getStartDate()
    offset = offset || 0
    limit = limit || 10
    const { assignments } = await this.dgraph.query(
      assignmentsQuery,
      {
        $from: from.toISOString(),
        $first: `${limit}`,
        $offset: `${offset}`
      }
    )
    return this.parse(assignments)
  }

  async fetchActive (date = null) {
    const active = []
    let assignments
    const limit = 30
    let offset = 0
    const isCurrentDate = date == null
    date = date || new Date()
    do {
      assignments = await this.fetch({
        offset,
        limit,
        from: this.activeFromDate
      })
      for (const assignment of assignments) {
        if (this.isActive(assignment, date)) {
          active.push(assignment)
        }
      }
      offset += limit
    } while (assignments.length >= limit)
    if (isCurrentDate) {
      this.activeFromDate = active.length > 0 ? active[0].createdDate : date
      this.store.set(ACTIVE_FROM_DATE_KEY, this.activeFromDate)
    }
    return active
  }

  parse (docs) {
    const parsed = []
    for (const doc of docs) {
      parsed.push(this.parseOne(doc))
    }
    return parsed
  }

  parseOne (doc) {
    const map = Document.parseDoc(doc, assignmentProps)
    const {
      startPeriodHash,
      periodCount,
      husdSalary
    } = map
    if (!husdSalary) {
      map.husdSalary = new Asset(0, 'HUSD', 2)
    }
    map.startPeriod = this.period.getPeriod(startPeriodHash)
    map.endPeriod = this.period.getEndPeriod(startPeriodHash, periodCount)
    return map
  }

  isActive (assignment, date = null) {
    const epochTime = (date || new Date()).getTime()
    const {
      startPeriod: {
        startDate
      },
      endPeriod
    } = assignment
    return startDate.getTime() <= epochTime && (endPeriod == null || epochTime < endPeriod.endDate.getTime())
  }
}

module.exports = Assignment

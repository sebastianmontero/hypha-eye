const Asset = require('./Asset')
const { DataTypes } = require('../const')

// Example props
// {
//   contentGroups:[
//     {
//       label: 'contentGroupLabelValue',
//       props: {
//         contentLabelValue1: 'nameOfPropInMap',
//         contentLabelValue2: 'nameOfPropInMap'
//       }
//     }
//   ]
// }

class Document {
  static getContentGroup (doc, label) {
    for (var cg of doc.content_groups) {
      if (cg.contents.some(c => c.label === 'content_group_label' && c.value === label)) {
        return cg
      }
    }
    return null
  }

  static parseDocs (docs, props) {
    const parsed = []
    for (const doc of docs) {
      parsed.push(this.parseDoc(doc, props))
    }
    return parsed
  }

  static parseDoc (doc, props) {
    const map = {
      hash: doc.hash,
      createdDate: new Date(doc.created_date),
      creator: doc.creator
    }

    if (props.contentGroups) {
      this.parseContentGroups(doc, props.contentGroups, map)
    }
    return map
  }

  static parseContentGroups (doc, cgProps, map) {
    for (const cgp of cgProps) {
      const cg = this.getContentGroup(doc, cgp.label)
      if (!cg) {
        throw new Error(`Content group with label: ${cgp.label} not found`)
      }
      this.parseContents(cg, cgp.props, map)
    }
  }

  static parseContents (contentGroup, props, map) {
    for (const c of contentGroup.contents) {
      if (props[c.label]) {
        map[props[c.label]] = this.parseValue(c)
      }
    }
  }

  static parseValue (content) {
    let value = content.value
    if (content.type === DataTypes.ASSET) {
      value = Asset.parse(value)
    } else if (content.type === DataTypes.TIME_POINT) {
      value = new Date(value + 'Z')
    } else if (content.type === DataTypes.INT64) {
      value = Number(value)
    }
    return value
  }

  static getContent (contentGroup, label) {
    return contentGroup.contents.find(c => c.label === label)
  }

  static getValue (contentGroup, label) {
    return this.parseValue(this.getContent(contentGroup, label))
  }
}

module.exports = Document

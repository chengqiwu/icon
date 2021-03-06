import React, {Component} from 'react'
import PropTypes from 'prop-types'
import CreateField from 'map/CreateField'
import StartField from 'map/StartField'
import FormField from 'map/FormField'
import ol from 'openlayers'

import { connect } from 'react-redux'
import { saveField } from '_redux/actions/field'
class FieldContent extends Component {
  constructor() {
    super()
    this.state = {
      name: '',      // 命名
      next: false,    // 下一步
    }
    this.setFeatureId = this.setFeatureId.bind(this)
    this.startPlaint = this.startPlaint.bind(this)
  }
  setFeatureId(name) {
    if (this.props.feature) {
      this.props.feature.setId(name)         
      this.setState({
        name
      })
    }
  }
  startPlaint() {
    this.setState({
      next: true
    })
  }
  render() {
    console.log('polygon')
    const geojson = new ol.format.GeoJSON()
    let geom = undefined
    if (this.props.feature) {
      const json = (geojson.writeFeature(this.props.feature, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }))
      geom = JSON.stringify(JSON.parse(json).geometry)
    }
    const props = {
      area: this.props.area,
      setFeatureId: this.setFeatureId,
      name: this.state.name,
      startPlaint: this.startPlaint,
      geom
    }
    return (
      <div>
        {this.props.initial && <CreateField {...props} />}
        {!this.props.initial && !this.state.next && <StartField {...props} />}
        {this.state.next && <FormField {...props} />}
      </div>
    )
  }
   
}

FieldContent.propTypes = {
  field: PropTypes.object,
  saveField: PropTypes.func,
  area: PropTypes.string,
  feature: PropTypes.object,
  initial: PropTypes.bool
}
const mapStateToProps = (state) => {
  return {
    field: state.field
  }
}
const mapDispathToProps = (dispatch) => {
  return {
    saveField: (name) => {
      dispatch(saveField(name))
    }
  }
}

FieldContent = connect(mapStateToProps, mapDispathToProps)(FieldContent)

export default FieldContent
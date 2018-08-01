import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { getArea } from 'utils/tools'
// import PlantingSeason from './season/PlantingSeason'
import EnvirAndFac from './envirAndFac/EnvirAndFac'
import Soil from './soil/Soil'
import 'css/index/field/message.scss'
import { setFieldMessage, showFieldMessage, startFieldMessage } from '_redux/actions/fieldMessage'

class Message extends Component {
  componentDidMount() {
    this.showMess && this.showMess.scrollIntoView(true)
  }
  componentDidUpdate() {

    this.mess && this.mess.scrollIntoView(true)
    this.showMess && this.showMess.scrollIntoView(true)

  }
  closer = (e) => {
    e.preventDefault()
    // const { start, show } = this.props.fieldMessage
    // start && this.props.startFieldMessage(false)
    // show && this.props.showFieldMessage(false)
    this.props.showFieldMessage(false)
  }
  render() {
    const {feature: {feature}} = this.props
    return <div className='filed-message' ref={showMess => this.showMess = showMess}>
      <h3 ref={title => this.title = title} className='filed-title'>{feature.get('name')}-田地信息 | 位置：{feature.get('address')} | 面积：{getArea(feature).acre} 亩 / {getArea(feature).hectare} 公顷</h3>
      <a href="#" className="filed-closer" onClick={this.closer}></a>
      <div className="filed-content">
        {/* <ShowMessage /> */}
        <div className='message'>
          {/* <PlantingSeason/> */}
          <EnvirAndFac/>
          <Soil/>
        </div>
      </div>
    </div>
  }
}
Message.propTypes = {
  feature: PropTypes.object,
  showFieldMessage: PropTypes.func
}
const mapStateToProps = (state) => {
  return {
    feature: state.feature,
    fieldMessage: state.fieldMessage
  }
}
const mapDispathToProps = (dispatch) => {
  return {
    startFieldMessage: (start) => {
      dispatch(startFieldMessage(start))
    },
    setFieldMessage: (message) => {
      dispatch(setFieldMessage(message))
    },
    showFieldMessage: (show) => {
      dispatch(showFieldMessage(show))
    }
  }
}
export default connect(mapStateToProps, mapDispathToProps)(Message)
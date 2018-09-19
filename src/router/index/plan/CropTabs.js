import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Tabs, Button } from 'antd'
import Units from './Units'
import Tab from './Tab'
import {
  updateContrast,
  updateOrigin,
  updateDetail,
  updateSchedule,
  updateTargetVo,
  updateDescribe,
  updateId
} from '_redux/actions/cropPlan'
import 'css/index/plan/tabs.scss'
import { findSimple, findByPlantingSeasonCropsId } from 'utils/Api'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

const TabPane = Tabs.TabPane

class CropTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeKey: undefined,
      panes: [],
      info: ''
    }
  }
  componentDidMount() {
    const { feature } = this.props.feature
    const farmlandId = feature.getId().replace('tb_farmland.', '')
    const fd = new FormData()
    fd.append('farmlandId', farmlandId)
    findSimple(fd)
      .then(e => e.data)
      .then(data => {
        if(data.msg === '200') {
          if (!data.result[0].id) {
            toast.info('您尚未添加种植季和作物信息。')
            this.setState({
              info: '请先添加种植季和作物信息！'
            })
            return
          }
          this.setState({
            panes: data.result.map(crop => ({
              title: crop.cropsName,
              key: crop.id
            })),
            activeKey: data.result[0].id
          })
          
          this.callBack(data.result[0].id)
        }
        
      })
  }
  onChange = (activeKey) => {
    this.setState({ activeKey })
    this.callBack(activeKey)
  }
  callBack = (activeKey) => {
    const fd = new FormData()
    fd.append('landId', this.props.feature.feature.getId().replace('tb_farmland.', ''))
    fd.append('plantingSeasonCropsId', activeKey)
    findByPlantingSeasonCropsId(fd)
      .then(e => e.data)
      .then(data => {
        if (data.msg === '200') {

          const { plantingSeasonCropsVo = {} } = data.result
          plantingSeasonCropsVo.organicMatter = data.result.organicMatter
          plantingSeasonCropsVo.ph = data.result.ph
          this.props.updateDetail(plantingSeasonCropsVo)

          if (!data.result.contrastSchedule) {
            data.result.contrastSchedule = []
          }
          if (!data.result.originSchedule) {
            data.result.originSchedule = []
          }
          if (!data.result.executionPlanVos) {
            data.result.executionPlanVos = []
          }
          // fertilizerDetailKvs
          this.props.updateContrast(data.result.contrastSchedule.map((c, i) => ({ ...c, key: i })))
          this.props.updateOrigin(data.result.originSchedule.map((c, i) => ({ ...c, key: i })))
          const schedule = data.result.executionPlanVos.map((c, i) => {
            const vo = {}
            const { fertilizerDetailKvs = [] } = c
            fertilizerDetailKvs.forEach(fer => {
              switch (fer.key) {
              case '0':
                vo.urea = fer.value
              case '1':
                vo.ammonium = fer.value
              case '2':
                vo.diammonium = fer.value
              case '3':
                vo.kso4 = fer.value
              case '4':
                vo.znso4 = fer.value
              case '5':
                vo.boron = fer.value
              case '6':
                vo.h2kp = fer.value
              case '7':
                vo.canola = fer.value
              case '8':
                vo.kcl = fer.value
              case '9':
                vo.nacterial = fer.value
              case '10':
                vo.organic = fer.value
              case '11':
                vo.other = fer.value
              case '12':
                vo.maxed = fer.value
              case '13':
                vo.compound = fer.value
              default:
                break
              }
            })

            return { ...c, key: c.id, ...vo }
          })
          this.props.updateSchedule(schedule)
          this.props.updateTargetVo(data.result.targetVo || {
            nitrogen: 0,
            phosphorus: 0,
            potassium: 0,
            sulfur: 0,
            zinc: 0,
            boron: 0,
          })
          this.props.updateDescribe(data.result.describe || '')
          this.props.updateId(data.result.id)
        }
      })
  }
  render() {
    return (
      <div className='croptabs'>
        <div className='croptabs-info'>
          {this.state.info}
        </div>
        <Tabs
          tabBarExtraContent={<Units />}
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          type="card"
        >
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>
            <Tab
              plantingSeasonCropsId={pane.key}
              landId={this.props.feature.feature.getId().replace('tb_farmland.', '')}
            />
          </TabPane>)}
        </Tabs>
      </div>

    )
  }
}

CropTab.propTypes = {
  feature: PropTypes.object,
  updateContrast: PropTypes.func,
  updateOrigin: PropTypes.func,
  updateDetail: PropTypes.func,
  updateSchedule: PropTypes.func,
  updateTargetVo: PropTypes.func,
  updateDescribe: PropTypes.func,
  updateId: PropTypes.func,
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateContrast: function (contrast) {
      dispatch(updateContrast(contrast))
    },
    updateOrigin: function (origin) {
      dispatch(updateOrigin(origin))
    },
    updateDetail: function (details) {
      dispatch(updateDetail(details))
    },
    updateSchedule: function (schedule) {
      dispatch(updateSchedule(schedule))
    },
    updateTargetVo: function (targetVo) {
      dispatch(updateTargetVo(targetVo))
    },
    updateDescribe: function (describe) {
      dispatch(updateDescribe(describe))
    },
    updateId: function(id) {
      dispatch(updateId(id))
    }
  }
}
export default connect(({ feature }) => ({ feature }), mapDispatchToProps)(CropTab)
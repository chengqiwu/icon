import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Scrollbar from 'smooth-scrollbar'
import Dropzone from 'react-dropzone'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import zh from 'moment/locale/zh-cn'
moment.locale('zh')
import md5 from 'js-md5'
import arrow from 'images/index/picture/arrow.png'
import 'react-datepicker/dist/react-datepicker.css'
import { confirmAlert } from 'react-confirm-alert' // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import { farmLandLogSave, findlandLogList, findLogPhotoById, deleteLogPhotoById, findReasonById } from 'utils/Api'
import Item from './Item'

// import FarmlandLogVo from './class/FarmlandLogVo'
import add from 'images/index/picture/+_.png'

import { connect } from 'react-redux'
import { updateLists } from '_redux/actions/picture.js'

class AddLogger extends Component {
  constructor() {
    super()
    this.state = {
      files: [],
      startDate: moment(),
      content: '',
      submiting: false,
      list: [],
      describe: {},
      idDescribe: {},
      showLoggerImg: false
    }
  }
  componentDidMount() {
    if (!this.props.logger) {
      return
    }
    this.getInfo(this.props.logger)
    Scrollbar.init(this.logger)
  }
  getInfo = (logger) => {
    const fd = new FormData()
    fd.append('pageNo', '1')
    fd.append('pageSize', '-1')
    fd.append('logId', logger.id)
    findLogPhotoById(fd).then(e => e.data)
      .then(data => {
        if (data.msg === '200') {
          const { list } = data.result
          if (list) {
            this.setState({
              list,
              startDate: moment(this.props.logger.date),
              content: this.props.logger.content
            })
          } else {
            this.setState({
              list: [],
              startDate: moment(this.props.logger.date),
              content: this.props.logger.content
            })
          }

        }

      })
  }
  componentWillUpdate(nextProps, nextState) {
    const length = this.state.files.length + this.state.list.length
    const nextLen = nextState.files.length + nextState.list.length
    if (length !== nextLen) {
      Scrollbar.destroy(this.logger)
    }
   
  }
  //组件将被卸载  
  componentWillUnmount() {
    //重写组件的setState方法，直接返回空
    this.setState = (state, callback) => {
      return
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (!this.props.logger) {
      Scrollbar.init(this.logger)
      return
    }
    if (prevProps.logger.id !== this.props.logger.id) {
      this.getInfo(this.props.logger)
    }
    Scrollbar.init(this.logger)
  }
  handleChange = (date) => {
    this.setState({
      startDate: date
    })
  }
  contentChange = (e) => {
    this.setState({
      content: e.target.value
    })
  }
  describe = (obj) => {
    console.log(obj)
    const { describe, idDescribe } = this.state
    if (obj.idDescribe) {
      idDescribe[obj.id] = obj.content
    } else {
      describe[obj.name] = obj.content
    }
    this.setState({
      describe,
      idDescribe
    })
  }
  upload = () => {
    const { feature } = this.props.feature
    const id = feature.getId().replace('tb_farmland.', '')
    const seasonId = feature.get('season_id')
    const fd = new FormData()

    fd.append('farmlandLogStr', JSON.stringify({
      seasonId,
      landId: id,
      date: this.state.startDate.format('YYYY-MM-DD'),
      content: this.state.content,
      id: this.props.logger && this.props.logger.id,
      type: '0',
    }))
    this.state.files.map(file => fd.append('images', file))
    const { describe, idDescribe } = this.state
    const describeStr = []
    Object.keys(describe).map(key => {
      describeStr.push({
        key,
        value: describe[key]
      })
    })
    describeStr.length !== 0 &&fd.append('describeStr', JSON.stringify(describeStr))

    const idDescribeKvsStr = []
    Object.keys(idDescribe).map(key => {
      idDescribeKvsStr.push({
        key,
        value: idDescribe[key]
      })
    })
    idDescribeKvsStr.length !== 0 && fd.append('idDescribeKvsStr', JSON.stringify(idDescribeKvsStr))
    return farmLandLogSave(fd)
      .then(e => e.data)
      .then(data => {
        if (data.msg === '200') {
          this.successCallback()
          this.updateLists()
        }
        this.setState({
          submiting: false
        })
      })
  }

  submit = (e) => {
    e.preventDefault()
    this.setState({
      submiting: true
    })
    this.upload()
  }
  updateLists = () => {
    const { feature } = this.props.feature
    const id = feature.getId().replace('tb_farmland.', '')
    const seasonId = feature.get('season_id')
    const fd = new FormData()
    fd.append('pageNo', 1)
    fd.append('pageSize', -1)
    fd.append('landId', id)
    fd.append('seasonId', seasonId)
    findlandLogList(fd)
      .then(e => e.data)
      .then(data => {
        if (data.msg === '200') {
          const { list } = data.result
          if (list) {
            this.props.updateLists(list)
          }
        }
      })
  }
  successCallback() {
    if (this.props.logger && this.props.logger.id) {
      confirmAlert({
        // title: 'Confirm to submit',
        message: '修改成功',
        buttons: [
          {
            label: '退出',
            onClick: () => this.props.close()
          }
        ]
      })
      return
    }
    confirmAlert({
      message: '日志已创建，是否继续添加？',
      buttons: [
        {
          label: '是',
          onClick: () => {
            this.setState({
              files: [],
              startDate: moment(),
              content: '',
              submiting: false,
              list: [],
              describe: {},
              showLoggerImg: false,
            })
          }
        },
        {
          label: '否',
          onClick: () => this.props.close()
        }
      ]
    })
  }
  onDrop = (files, rejectFiles) => {
    if (rejectFiles.length > 1) {
      alert('上传文件错误，请重新上传')
      return
    }
    files.map((file, i) => {
      file.md5 = md5((Date.now() + i).toString())
    })

    this.setState({
      files: [
        ...this.state.files,
        ...files
      ]
    })
  }


  deleteFileByIndex = (e) => {
    e.preventDefault()
    const md5 = e.target.getAttribute('data-index')
    this.setState({
      files: this.state.files.filter(file => file.md5 !== md5)
    })
  }
  deletelistById = (e) => {

    e.preventDefault()
    const id = e.target.getAttribute('data-index')
    const fd = new FormData()
    fd.append('id', id)
    deleteLogPhotoById(fd)
      .then(e => e.data)
      .then(data => {
        if (data.msg === '200') {
          const { list } = this.state
          this.setState({
            list: list.filter(list => list.id !== id)
          })
          this.updateLists(list)
        }
      })
       
  }
  showLoggerImg = () => {
    this.setState({
      showLoggerImg: !this.state.showLoggerImg
    })
  }
  deleteLandLog = (e) => {
    e.preventDefault()
    confirmAlert({
      message: '确认删除？',
      buttons: [
        {
          label: '确认',
          onClick: () => {
            this.props.delete(this.props.logger.id)
            this.props.close()
          }
        },
        {
          label: '取消',
          onClick: () => {}
        }
      ]
    })
    
  }
  render() {
    return (
      // }
      <div className='add-logger' style={{width: this.props.width}} >
        <form onSubmit={this.submit}>
          <div className='log-str'>
            <div className='input-group'>
              <label htmlFor="date">日期：</label>
              <DatePicker
                dateFormat="YYYY-MM-DD"
                selected={this.state.startDate}
                onSelect={this.handleChange}
              />
            </div>
            <div className='input-group'>
              <label htmlFor="logger"> 日志：</label>
              <textarea name="logger" id="logger"
                value={this.state.content}
                onChange={this.contentChange} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 15px', cursor: 'pointer' }} onClick={this.showLoggerImg}>
            <img src={arrow} />
            添加照片
            <div style={{ borderBottom: '1px solid #ddd', flexGrow: 1 }}></div>
          </div>
          <div className='logger-img' ref={logger => this.logger = logger} style={{ display: this.state.showLoggerImg ? 'block' : 'none' }}>
            {/* 本地上传列表 */}
            {
              this.state.files.map((file, i) => <Item
                key={file.md5}
                id={file.md5}
                file={file}
                url={file.preview}
                delete={this.deleteFileByIndex}
                describe={this.describe} />)

            }
            {/* 从服务器获得列表 */}
            {
              this.state.list.map(list => <Item
                key={list.id}
                file={list}
                id={list.id}
                url={list.originalPath}
                delete={this.deletelistById}
                describe={this.describe} />)
            }
            <div className='logger-box'>
              <Dropzone className='drop-zone'
                accept="image/*"
                onDrop={this.onDrop}
                multiple={true}>
                <img src={add} alt="" />
                <label>添加照片</label>
              </Dropzone>
            </div>
          </div>
          <div className='submit'>
            <input type="submit" value={this.state.submiting ? '保存中...' : '保存'} disabled={this.state.submiting} />
            {/* <input type="submit" value={'删除'}/> */}
            {this.props.logger && 
              this.props.logger.id && 
              <a href='#' className='delete' onClick={this.deleteLandLog}>删除</a>}
          </div>
        </form>

      </div>)
  }
}
AddLogger.propTypes = {
  feature: PropTypes.object,
  close: PropTypes.func,
  updateLists: PropTypes.func,
  log: PropTypes.object,
  logger: PropTypes.object,
  delete: PropTypes.func,
  width: PropTypes.string
}
const mapStateToProps = function (state) {
  return {
    picture: state.picture,
    feature: state.feature
  }
}
const mapDispatchToProps = function (dispath) {
  return {
    updateLists: (show) => {
      dispath(updateLists(show))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(AddLogger)
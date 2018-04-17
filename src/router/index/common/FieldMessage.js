import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnams from 'classnames'
import { connect } from 'react-redux'
import FromMessage from './fromMessage'
import { fromFeature } from '_redux/actions/feature'
import ShowMessage from './showMessage'
import { Field, reduxForm } from 'redux-form'
import { findReasonById, saveSeasonInfo } from 'utils/Api'
import { setFieldMessage, showFieldMessage } from '_redux/actions/fieldMessage'

import 'css/index/common/filedMessage.scss'

class FiledMessage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showMessage: false,
            initialize: {}
        }
        this.nextSubmit = this.nextSubmit.bind(this)
    }
    nextSubmit(submitData) {
        var fd = new FormData()
        fd.append('landInfo', JSON.stringify({
            ...submitData,
            landId: this.props.feature.id
        }))

        saveSeasonInfo(fd).then(e => e.data).then(data => {
            if (data.msg === '200') {
                this.props.setFieldMessage(submitData)
                console.log('setFieldMessage')
                this.props.showFieldMessage(true)
                const { feature } = this.props.feature
                feature.set('isNew', 0)
            }
        })
    }
    componentDidUpdate() {
        this.mess && this.mess.scrollIntoView(true)
    }
    getMessage(defaultValue) {
        const { id } = this.props.feature

        if (!id) {
            return
        }
        findReasonById({
            farmLandId: id,
            isNew: 1
        }).then(e => e.data)
            .then(data => {
                if (data.msg === '200') {
                    this.props.initialize({
                        ...defaultValue,
                        ...data.result
                    })
                }
            })
    }
    closer() {
        this.props.fromFeature(false)
    }
    render() {
        const { handleSubmit, pristine, reset, submitting } = this.props
        if (!this.props.flag) {
            return null
        }
        const { message, flag } = this.props.fieldMessage
        console.log(this.props.fieldMessage)
        
        return  flag 
            ? 
            <div className='filed-message'>
                <h3 ref={title => this.title = title} className='filed-title'>伊尔力可多乡山地A-田地信息</h3>
                <a href="#" className="filed-closer" onClick={this.closer.bind(this)}></a>
                <div className="filed-content">
                    <ShowMessage defaultValue={message} />                
                </div>
            </div> 
            :
            <form onSubmit={handleSubmit(e => this.nextSubmit(e))} ref={mess => this.mess = mess} className='filed-message'>
                <h3 ref={title => this.title = title} className='filed-title'>伊尔力可多乡山地A-田地信息</h3>
                <a href="#" className="filed-closer" onClick={this.closer.bind(this)}></a>
                <div className="filed-content">
                    {!this.state.showMessage && <FromMessage feature={this.props.feature.feature} getMessage={this.getMessage.bind(this)}/>}
                    
                    {!this.state.showMessage && <div className='submit'>
                        <button type="submit">保存</button>
                    </div>}
                    
                </div>
            </form>
        
    }
}
FiledMessage.propTypes = {
    flag: PropTypes.bool,
    fromFeature: PropTypes.func,
    handleSubmit: PropTypes.func,
    pristine: PropTypes.bool,
    reset: PropTypes.func,
    submitting: PropTypes.bool,
    feature: PropTypes.object,
    initialize: PropTypes.func,
    fieldMessage: PropTypes.object,
    setFieldMessage: PropTypes.func,
    showFieldMessage: PropTypes.func
}
const mapStateToProps = (state) => {
    return {
        feature: state.feature,
        flag: state.feature.flag,
        fieldMessage: state.fieldMessage
    }
}
const mapDispathToProps = (dispatch) => {
    return {
        fromFeature: (flag) => {
            dispatch(fromFeature(flag))
        },
        setFieldMessage: (message) => {
            dispatch(setFieldMessage(message))
        },
        showFieldMessage: (flag) => {
            dispatch(showFieldMessage(flag))
        }
    }
}

export default reduxForm({
    form: 'simple',
})(connect(mapStateToProps, mapDispathToProps)(FiledMessage))
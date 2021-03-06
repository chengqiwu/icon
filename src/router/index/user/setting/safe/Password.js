import React, { Component } from 'react'
import { updatePassword } from 'utils/Api'
import { blowfish } from 'utils/tools'
import { toast } from 'react-toastify'
import history from 'router/history'
import Cookies from 'js-cookie'
class Password extends Component {
  constructor() {
    super()
    this.state = {
      password: '',
      newPassword: '',
      passwordConfirm: ''
    }
  }
    changeValue = (e) => {
      this.setState({
        Email: e.target.value
      })
    }
    activeModify = (e) => {
      this.setState({
        modify: true
      })
    }
    submit = (e) => {
      e.preventDefault()
      console.log(this.state)
      const {password, newPassword,passwordConfirm} = this.state
      if (!password) {
        toast.info('要想修改密码，请先输入你的旧密码')
        return
      }
      if (!newPassword) {
        toast.info('要想修改密码，请输入您的新密码')
        return
      }
      if (newPassword !== passwordConfirm) {
        toast.info('两次密码输入不一致，请重新输入')
        this.setState({
          password: '',
          newPassword: '',
          passwordConfirm: ''
        })
        return 
      }
      if (!newPassword.match(/^[^\u4e00-\u9fa5]{6,24}$/)) {
        toast.info('输入密码格式不正确')
        this.setState({
          password: '',
          newPassword: '',
          passwordConfirm: ''
        })
        return 
        // 由英文字母、数字或英文特殊字符组成，6-24位
      }
      var fd = new FormData()
      // fd.append('password', 1)
      fd.append('password', blowfish(this.state.newPassword))
      fd.append('oldPassword', blowfish(this.state.password))
      updatePassword(fd)
        .then(e => e.data)
        .then(data => {
          if (data.msg === '200') {
            toast.success('密码修改成功，请返回登录页重新登陆', {
              autoClose: 1000,
              onClose: () => history.push('/')
            })
            sessionStorage.clear()
            Cookies.remove('name', { path: '' })
          }
        })
    }
    changePassword = (e) => {
      const { value, name } = e.target
      this.setState({
        [name]: value
      })
    }
    render() {
      return (
        <form onSubmit={this.submit}>
          <div className='box' style={{marginBottom: 0}}>
            <div>
              <div className='input-group'>
                <label htmlFor="password">原密码：</label>
                <input type="password"
                  name='password'
                  id='password'
                  onChange={this.changePassword}
                  value={this.state.password} />
              </div>
              <div className='input-group'>
                <label htmlFor="newPassword">新密码：</label>
                <input type="password"
                  name='newPassword'
                  id='newPassword'
                  onChange={this.changePassword}
                  value={this.state.newPassword} />
                <span className='tip'>不修改密码请置空</span>
              </div>
              <div className='input-group'>
                <label htmlFor="passwordConfirm">确认新密码：</label>
                <input type="password"
                  name='passwordConfirm'
                  id='passwordConfirm'
                  onChange={this.changePassword}
                  value={this.state.passwordConfirm} />
              </div>
              <div className='submit'>
                <input type="submit" value="保存" />
              </div>
            </div>
                    
          </div>

        </form>
      )

    }
}

export default Password
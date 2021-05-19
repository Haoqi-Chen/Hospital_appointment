const app = getApp();
Page({



  // ---------------------------------数据区---------------------------------
  data: {
    cardId: '',
    name: '',
    sex: '',
    Company: '',
    Phone: '',
    ID: '',
    gender: [{
      id: 1,
      value: '男',
      string: 'male'
    }, {
      id: 2,
      value: '女',
      string: 'female'
    }],
  },



  // ---------------------------------姓名输入---------------------------------
  bindKeyInputName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },



  // ---------------------------------性别选择---------------------------------
  radioChange: function (e) {
    //console.log('radio发生change事件，携带value值为：', e.detail.value)
    const gender = this.data.gender
    for (let i = 0, len = gender.length; i < len; ++i) {
      if (gender[i].id == e.detail.value) {
        gender[i].checked = 1;
        this.setData({
          sex: gender[i].string
        })
      }
    }
  },



  // ---------------------------------工号输入---------------------------------
  bindKeyInputCardID: function (e) {
    this.setData({
      cardId: e.detail.value
    })
  },



  // ---------------------------------部门输入---------------------------------
  bindKeyInputCompany: function (e) {
    this.setData({
      Company: e.detail.value
    })
  },



  // ---------------------------------身份证号输入---------------------------------
  bindKeyInputID: function (e) {
    this.setData({
      ID: e.detail.value
    })
  },



  // ---------------------------------电话号码输入---------------------------------
  bindKeyInputPhone: function (e) {
    this.setData({
      Phone: e.detail.value
    })
  },



  // ---------------------------------绑定按钮---------------------------------
  binds: function () {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '请在确认绑定信息无误后点击确定',
      success: function (confirm) {
        if (confirm.confirm) {
          //下列if判断的是如果有一个输入框是空的，则弹窗
          if (!that.data.name || !that.data.sex || !that.data.cardId || !that.data.Company || !that.data.ID || !that.data.Phone) {
            wx.showModal({
              content: '输入框不能为空',
              contentColor: '#FF556A',
              showCancel: false,
              confirmText: '确定',
              confirmColor: '#FF556A'
            })
            // 如果姓名字符串大于18位报错
          } else if (that.data.name.length > 18) {
            wx.showModal({
              content: '请输入正确的姓名',
              contentColor: '#FF556A',
              showCancel: false,
              confirmText: '确定',
              confirmColor: '#FF556A'
            })
            // 如果工号长度大于5，或者小于4会报错
          } else if (that.data.cardId.length > 5 || that.data.cardId.length < 4) {
            wx.showModal({
              content: '请输入正确的工号',
              contentColor: '#FF556A',
              showCancel: false,
              confirmText: '确定',
              confirmColor: '#FF556A'
            })
            // 如果部门字符串大于25位会报错
          } else if (that.data.Company.length > 25) {
            wx.showModal({
              content: '请输入正确的部门名称',
              contentColor: '#FF556A',
              showCancel: false,
              confirmText: '确定',
              confirmColor: '#FF556A'
            })
            // 如果身份证号不是18位会报错
          } else if (that.data.ID.length != 18) {
            wx.showModal({
              content: '请输入正确的身份证号',
              contentColor: '#FF556A',
              showCancel: false,
              confirmText: '确定',
              confirmColor: '#FF556A'
            })
            //如果不是11位得手机号，会报错
          } else if (that.data.Phone.length != 11) {
            wx.showModal({
              content: '请输入11位的手机号码',
              contentColor: '#FF556A',
              showCancel: false,
              confirmText: '确定',
              confirmColor: '#FF556A'
            })
            //---------------------------------绑定API------------------------------
          } else {
            wx.request({
              url: 'https://hanhaoxiang.xyz/api/wxapi/bind',
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded',
              },
              //---------------------------------数据赋值------------------------------
              data: {
                openId: app.globalData.openId,
                name: that.data.name,
                sex: that.data.sex, // 上传的数据得是male/female
                cardId: that.data.cardId,
                company: that.data.Company,
                peopleId: that.data.ID,
                phone: that.data.Phone,
              },
              //------------------------------API的success------------------------------
              success: res => {
                if (res.data.error) {
                  //API访问失败，打印原因，并输出交互弹窗
                  console.log(res.data.reason);
                  wx.showToast({
                    title: '绑定请求失败',
                    icon: 'error',
                    duration: 1500,
                  })
                } else {
                  wx.showToast({
                    title: '绑定成功',
                    icon: 'success',
                    duration: 1500,
                    //---------------------------弹窗的success----------------------------
                    success: res => {
                      //对全局变量修改，表明已经绑定
                      app.globalData.state = 1;
                      setTimeout(function () {
                        wx.navigateBack({
                          delta: 1 //返回一层
                        })
                      }, 1500);
                    }
                  })
                }
              }
            })
          }
        } else if (confirm.cancel) {
          //点击了取消按钮，结束弹窗,无任何实际操作
        }
      }
    })
  },



  // ---------------------------------分享部分---------------------------------
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true,
      //只开放了分享给朋友
      menus: ['shareAppMessage']
    })
    return {
      title: '综合门诊部体检预约小程序'
    }
  }



  //-------------------------------结束部分------------------------------------
})
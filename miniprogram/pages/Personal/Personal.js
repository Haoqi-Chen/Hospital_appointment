const app = getApp();
Page({



  //----------------------------数据区--------------------------------
  data: {
    openId: '',
    state: 1, //默认是未绑定状态
    //用户头像获取相关数据
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
  },



  //----------------------------用户头像获取相关函数---------------------
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },


  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },



  //------------------------页面加载----------------------------------------
  onLoad: function () {
    //用户头像获取判断
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    };
    //LOGIN请求--------------------------------------------------------------
    let that = this;
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            url: 'https://hanhaoxiang.xyz/api/wxapi/getOpenId',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            data: {
              code: res.code
            },
            success: (res) => {
              //登录请求失败
              if (res.data.error) {
                console.log(res.data.reason);
                wx.showToast({
                  title: '登陆请求失败',
                  icon: 'error',
                  duration: 1500
                })
              }
              //登录请求成功
              else {
                var openId = res.data.result.openid;
                var state = res.data.result.state;
                app.globalData.openId = openId;
                app.globalData.state = state;
                that.setData({
                  openId: openId,
                  state: state,
                });
              }
              if (state) { // 若已绑定，则跳转到appoint页面，否则就在个人中心页面
                wx.switchTab({
                  url: '/pages/Appointment/Appointment',
                });
              }
            }
          })
        } else { //请求失败
          console.log('登录失败！' + res.errMsg)
          wx.showToast({
            title: '登陆失败!',
            icon: 'error',
            duration: 1500
          })
        }
      }
    })
  },



  //----------------------------页面刷新----------------------------
  onShow: function () {
    this.setData({
      openId: app.globalData.openId,
      state: app.globalData.state,
    });
  },



  //------------------------取消绑定按钮-----------------------------
  cancelBind() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除绑定信息吗？',
      success: function (confirm) {
        if (confirm.confirm) {
          wx.request({
            url: 'https://hanhaoxiang.xyz/api/wxapi/bindCancel',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            data: {
              openId: app.globalData.openId,
            },
            success: res => {
              if (res.data.error) {
                console.log(res.data.reason);
                wx.showToast({
                  title: '取消绑定失败',
                  icon: 'error',
                  duration: 1500,
                });
              } else {
                wx.showToast({
                  title: '取消成功',
                  icon: 'success',
                  duration: 1500,
                  success: function () {
                    app.globalData.state = 0;
                    that.setData({
                      state: 0,
                    });
                  }
                })
              }
            }
          })
        } else if (confirm.cancel) {
          // 取消“取消绑定”，无任何操作结束弹窗
        }
      }
    });
  },



  //-----------------------------绑定按钮-----------------------------
  Binding() {
    wx.navigateTo({
      url: '/pages/Bind/Bind',
      success: () => {
        wx.setNavigationBarTitle({
          title: "绑定用户身份信息"
        })
      }
    })
  },



  //----------------------------记录按钮------------------------------
  Record() {
    wx.navigateTo({
      url: '/pages/Record/Record',
    })
  },



  //----------------------------分享按钮------------------------------
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    })
    return {
      title: '综合门诊部体检预约小程序'
    }
  },



  //----------------------------结束部分-----------------------------
})
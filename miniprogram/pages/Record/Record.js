const app = getApp();
Page({



  //-------------------------------------数据区-------------------------------------
  data: {
    temp: [],
    records: [],
    today: '',
    flag: false,
    icon: [],
  },



  //--------------------------------------加载部分---------------------------------
  onLoad: function (options) {
    this.GetToday();
    //数据刷新
    this.SHOW();
  },


  //页面内容请求部分
  SHOW: function () {
    let that = this;
    that.setData({
      icon: []
      // 将ICON清空,对应于刷新
    })
    wx.request({
      url: 'https://hanhaoxiang.xyz/api/wxapi/showAppoint',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: {
        openId: app.globalData.openId
      },
      success: (res) => {
        //历史请求失败反馈
        if (res.data.error) {
          console.log(res.data.reason);
          wx.showToast({
            title: '历史请求失败',
            icon: 'error',
            duration: 1500
          })
        }
        //API历史请求成功
        else {
          //不对原参数修改，只对目前的目标进行修改
          that.setData({
            temp: res.data.result,
          });
          let i = 0;
          for (let item of that.data.temp) {
            // 修改state => 根据date把undone分成undone和done
            //done已被舍弃---------------------------------------------------
            //如果是今天之前的记录，取消操作的button不能点击
            i++;
            if (item.state == "cancel") {
              item.state = "已经取消";
              that.setData({
                icon: that.data.icon.concat(false),
              });
            } else if (item.state == "undone") {
              if (item.state < that.data.today) {
                item.state = "体检过了";
                that.setData({
                  icon: that.data.icon.concat(false),
                });
              } else {
                item.state = "还未体检";
                that.setData({
                  icon: that.data.icon.concat(true),
                });
              }
            }
          }
          //对象数组复制部分写法参考---------------------------------------------------
          for (let i in that.data.temp) {
            that.data.temp[i]['icon'] = that.data.icon[i];
          }
          //倒叙反置
          that.data.temp.reverse();
          that.setData({
            records: that.data.temp,
          })
        }
      }
    })
  },


  //获取today
  GetToday: function () {
    let nowDate = new Date();
    let year = nowDate.getFullYear();
    let month = nowDate.getMonth() + 1;
    let day = nowDate.getDate();
    //针对不到两位数的补充显示(月份,天数)
    if (month < 10) {
      if (day < 10) {
        this.setData({
          //这里专门用的“ ` ”
          today: `${year}-0${month}-0${day}`,
        })
      } else if (day >= 10) {
        this.setData({
          //这里专门用的“ ` ”
          today: `${year}-0${month}-${day}`,
        })
      }
    }
    //针对不到两位数的补充显示(天数)
    else {
      if (day < 10) {
        this.setData({
          //这里专门用的“ ` ”
          today: `${year}-${month}-0${day}`,
        })
      } else if (day >= 10) {
        this.setData({
          //这里专门用的“ ` ”
          today: `${year}-${month}-${day}`,
        })
      }
    }
  },



  //------------------------------------取消预约部分-------------------------
  cancelAppoint: function (e) {
    let record_id = e.currentTarget.dataset.id;
    let that = this;
    wx.showModal({
      content: '确定要取消预约吗?',
      contentColor: '#FF556A',
      showCancel: true,
      confirmText: '确定',
      confirmColor: '#FF556A',
      success: (res) => {
        //点击了确定按钮
        if (res.confirm == true) {
          wx.request({
            url: 'https://hanhaoxiang.xyz/api/wxapi/appointCancel',
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            data: {
              recordId: record_id,
              openId: app.globalData.openId,
            },
            success: (res) => {
              //取消请求失败
              if (res.data.error) {
                console.log(res.data.reason);
                wx.showToast({
                  title: '取消请求失败',
                  icon: 'error',
                  duration: 1500
                })
              }
              //取消请求成功
              else {
                //对GLOBAL设置一个剩余预约量，设置成-，到时候执行刷新操作
                wx.showToast({
                  title: '取消预约成功',
                  duration: 2000,
                  success: (res) => {
                    that.SHOW();
                    // //页面刷新部分,不好用,需要让button更改
                    // // const pages = getCurrentPages()
                    // // //声明一个pages使用getCurrentPages方法
                    // // const perpage = pages[pages.length - 1]
                    // // //声明一个当前页面
                    // // perpage.onLoad()
                    // // //执行刷新
                  }
                })
              }
            }
          })
        }

      }
    })

  },



  //--------------------------------体检结果部分--------------------------
  RESULT: function (e) {
    let temp_id = e.currentTarget.dataset.id;
    let that = this;
    for (let item of that.data.records) {
      if (item.id == temp_id) {
        console.log(item)
        wx.showModal({
          cancelColor: 'cancelColor',
          showCancel: false,
          content: `${item.text==''?'暂无体检结果':item.text}`,
        })
      }
    }

  },



  //-------------------分享部分----------------------
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    return {
      title: '综合门诊部体检预约小程序'
    }
  }


  //---------------------------结束部分-----------------------
})
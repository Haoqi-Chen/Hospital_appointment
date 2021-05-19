const app = getApp();
Page({



  //--------------------------------数据区--------------------------
  data: {
    date: '请点击', //显示日期,以及每次选择的日期
    pm: '-', //这里使用pm,来表示每天的最大可预约名额,舍弃了am
    confirmDate: '', // 存放要预约的日子(存放的是点击的日期)
    issearched: 0, //是否点击过了查询按钮,影响到了button的显示
    today: '', //用来存放当天的日期
    records: [], //Initflag中用到的变量
    flag: false, //用来判断7天内是否已有还未执行的预约
    appointId: '', //预约的序号
  },



  //--------------------------------每次切回页面的刷新--------------------------
  onShow: function () {
    //只有当button处于可点击状态,才进行刷新(对应于二次返回该页面的操作)
    if (this.data.issearched) {
      //对每日最大预约量进行赋值,对选中日期进行赋值,对issearched进行赋值
      this.search();
      //因为是在record页面取消的预约,所以这里需要进行加载时就进行flag初始化
      this.InitFlag();
    }
  },



  //--------------------------------页面的初始化-------------------------------
  onLoad: function () {
    this.GetToday();
  },



  //--------------------------------选择日期-----------------------------------
  bindDateChange: function (e) {
    // 是点击一次确定后,才返回日期(不是滑动日历插件返回日期)
    this.setData({
      date: e.detail.value
    })
    //日期确定后的传值部分
    this.search();
  },


  //根据日期进行传值, (today,today+6)算上今天,总计一周
  search: function () {
    let that = this;
    //判断是否为一周内，包括今天
    if (this.IsdateOK()) {
      wx.showModal({
        content: '请查询一周内的日期',
        contentColor: '#FF556A',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#FF556A'
      })
    }
    //API请求部分-------------------------------------------------
    else {
      wx.request({
        url: 'https://hanhaoxiang.xyz/api/wxapi/showAppointRemain',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        //将选中的日期返还给数据库
        data: {
          date: that.data.date,
        },
        success: res => {
          //查询请求失败会有相应反馈
          if (res.data.error) {
            console.log(res.data.reason);
            wx.showToast({
              title: '查询请求失败',
            })
          }
          //请求成功
          else {
            that.setData({
              //请求成功之后才会将选中日期赋给确定日期
              confirmDate: that.data.date,
              //将"button"可点击化
              issearched: 1,
              //将最大预约量(pm)赋给局部变量
              pm: res.data.pm,
            })
          }
        }
      })
    }
  },


  //判断点击日期是否处于一周之内,作为判断返回值使用
  IsdateOK: function () {
    let temp_date = this.getUnixTime(this.data.date);
    let temp_today = this.getUnixTime(this.data.today);
    let temp_num = this.dateCompare(temp_date, temp_today);
    if (temp_num < 7 && temp_num >= 0) {
      return 0;
    } else return 1;
  },



  //---------------------------------预约相关函数------------------------------
  //button的点击函数
  pm: function (e) {
    this.setData({
      ampm: 'pm',
    })
    this.appoint('pm');
  },


  //预约函数
  appoint: function (ampm) {
    let that = this;
    //对flag初始化,这个地方会和下方的执行顺序异步,所以确保执行,多加一次-----------
    that.InitFlag();
    //如果没有绑定,弹回绑定页面
    if (app.globalData.state == 0) {
      wx.showToast({
        title: '请先绑定',
        duration: 1500,
        success: (res) => {
          setTimeout(() => {
            //tarbar的跳转只能用switchtab
            wx.switchTab({
              url: '/pages/Personal/Personal',
            })
          }, 1500);
        }
      });
    }
    //如果已有7日内且未执行的预约记录,无法预约
    else if (that.data.flag) {
      wx.showModal({
        content: '一周内只能预约一次',
        contentColor: '#FF556A',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#FF556A'
      })
    }
    //API请求部分--------------------------------
    else {
      wx.request({
        url: 'https://hanhaoxiang.xyz/api/wxapi/appoint',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          openId: app.globalData.openId,
          ampm: ampm,
          date: that.data.confirmDate,
        },
        success: (res) => {
          //预约请求发送失败的反馈
          if (res.data.error) {
            console.log(res.data.reason);
            wx.showToast({
              title: '预约请求失败',
              icon: 'error',
              duration: '2000'
            })
          }
          // 预约请求成功的反馈
          else {
            //pm的更新
            that.setData({
              pm: that.data.pm - 1,
            })
            //用弹窗显示序号
            wx.showToast({
              title: `预约序号为${res.data.appointId}`,
              icon: 'success',
              duration: 1500
            })
          }
          //由于异步影响,每次结束后都要初始化-------------------------------
          that.InitFlag();
        }
      });
    }
  },


  InitFlag: function () {
    let that = this;
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
        //初始化请求失败
        if (res.data.error) {
          console.log(res.data.reason);
          wx.showToast({
            title: '初始化请求失败',
            icon: 'error',
            duration: 1500
          })
        }
        //API请求成功后的初始化 
        else {
          that.setData({
            records: res.data.result
          });
          for (let item of that.data.records) {
            //这里后端没变动,所以先判断是否7天内,再判断是否undone----------------------
            //是一周之内的日期记录就进行下一层判断
            if (that.CanAppointment(item.date)) {
              //如果这条记录的操作还是undone状态,那就会flag置1,跳出循环
              if (item.state == "undone") {
                that.setData({
                  flag: true,
                })
                break;
              }
              //如果是一周内的日期,但是已经cancel了,flag置0
              else {
                that.setData({
                  flag: false
                })
              }
            }
            //对于非一周内的日期直接flag置0
            else {
              that.setData({
                flag: false
              })
            }
          }
        }
      }
    })
  },


  //判断预约记录中的日期是否是一周之内的
  CanAppointment: function (dateStr) {
    let temp_date = this.getUnixTime(dateStr);
    let temp_today = this.getUnixTime(this.data.today);
    let temp_num = this.dateCompare(temp_today, temp_date);
    //用今天去减去item.date来判断是否<=0(=0说明今天已经预约过)，> -7(在7天内)
    if (temp_num <= 0 && temp_num > -7) {
      return 1;
    } else return 0;
  },



  //-----------------------------日期计算相关函数-----------------------------------
  //日期转时间戳
  getUnixTime: function (dateStr) {
    let newstr = dateStr.replace(/-/g, '/'); //并没有修改源字符串
    let new_date = new Date(newstr);
    //getTime 方法返回一个整数值，这个整数代表了从 1970 年 1 月 1 日开始计算到 Date 对象中的时间之间的毫秒数。
    let time_str = new_date.getTime().toString();
    return time_str.substr(0, 10); //去掉毫秒，单位变成秒
  },


  //判断选中日期与今天相差多少天,参数为时间戳
  dateCompare: function (time_chosen, time_today) {
    let dayNum = 0;
    dayNum = Math.floor((time_chosen - time_today) / 86400);
    return dayNum;
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



  // -----------------------------------------分享函数-----------------------------
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true,
      // 只允许给朋友分享
      menus: ['shareAppMessage']
    })
    return {
      title: '综合门诊部体检预约小程序'
    }
  },



  // -----------------------------------------结束部分-----------------------------
})
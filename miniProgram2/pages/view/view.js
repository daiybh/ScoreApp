//view.js
const app = getApp()

Page({
  data: {
    name: '',
    subject: '',
    scores: [],
    searched: false
  },

  onLoad: function () {
    // 页面加载时的逻辑
  },

  bindNameInput: function(e) {
    this.setData({
      name: e.detail.value
    })
  },

  bindSubjectInput: function(e) {
    this.setData({
      subject: e.detail.value
    })
  },

  searchScores: function() {
    const { name, subject } = this.data;

    if (!name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    // 显示加载中
    wx.showLoading({
      title: '查询中...',
    });

    // 构建查询参数
    let url = `${app.globalData.serverUrl}/scores?name=${encodeURIComponent(name)}`;
    if (subject) {
      url += `&subject=${encodeURIComponent(subject)}`;
    }

    // 发送请求到服务器
    wx.request({
      url: url,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();

        if (res.data.success) {
          this.setData({
            scores: res.data.data,
            searched: true
          });

          if (res.data.data.length === 0) {
            wx.showToast({
              title: '没有找到相关成绩',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: res.data.message || '查询失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        console.error(err);
      }
    });
  }
})
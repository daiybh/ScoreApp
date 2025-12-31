//add.js
const app = getApp()

Page({
  data: {
    name: '',
    score: '',
    maxScore: '',
    avgScore: '',
    rank: '',
    subject: '',
    examContent: '',
    examTime: '',
  },

  onLoad: function () {
    // 页面加载时的逻辑
  },

  bindNameInput: function(e) {
    this.setData({
      name: e.detail.value
    })
  },

  bindScoreInput: function(e) {
    this.setData({
      score: e.detail.value
    })
  },

  bindMaxScoreInput: function(e) {
    this.setData({
      maxScore: e.detail.value
    })
  },

  bindAvgScoreInput: function(e) {
    this.setData({
      avgScore: e.detail.value
    })
  },

  bindRankInput: function(e) {
    this.setData({
      rank: e.detail.value
    })
  },

  bindSubjectInput: function(e) {
    this.setData({
      subject: e.detail.value
    })
  },

  bindExamContentInput: function(e) {
    this.setData({
      examContent: e.detail.value
    })
  },

  bindDateChange: function(e) {
    this.setData({
      examTime: e.detail.value
    })
  },

  submitForm: function() {
    const { name, score, maxScore, avgScore, rank, subject, examContent, examTime } = this.data;

    // 表单验证
    if (!name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    if (!score) {
      wx.showToast({
        title: '请输入当前成绩',
        icon: 'none'
      });
      return;
    }

    if (!subject) {
      wx.showToast({
        title: '请输入科目',
        icon: 'none'
      });
      return;
    }

    if (!examTime) {
      wx.showToast({
        title: '请选择考试时间',
        icon: 'none'
      });
      return;
    }

    // 显示加载中
    wx.showLoading({
      title: '提交中...',
    });

    // 发送请求到服务器
    wx.request({
      url: `${app.globalData.serverUrl}/scores`,
      method: 'POST',
      data: {
        name,
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        avgScore: parseFloat(avgScore),
        rank: parseInt(rank),
        subject,
        examContent,
        examTime
      },
      success: (res) => {
        wx.hideLoading();

        if (res.data.success) {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 2000
          });

          // 清空表单
          this.setData({
            name: '',
            score: '',
            maxScore: '',
            avgScore: '',
            rank: '',
            subject: '',
            examContent: '',
            examTime: '',
          });

          // 返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        } else {
          wx.showToast({
            title: res.data.message || '提交失败',
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
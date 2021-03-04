//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        a: 1,
        hide: false
    },
    onLoad: function () {
        console.log('-------onload!!!!')
    },
    onShow: function () {
        console.log('-------show!!!!', this)
    },
    onResize: function () {
        console.log('-------resize!!!!', this)
    },
    onReachBottom: function () {
        console.log('-------buttom!!!!')
    },
    onReady: function () {
        console.log('-------ready!!!!', this)
    },
    click: function () {
        console.log(this)
        this.setData({
            a: false
        })
        const func = function () {
            this.setData({
                a: true
            })
        }.bind(this);
        setTimeout(func, 1500)
    },
    click2: function () {
        this.setData({
            hide: true
        })
        const func = function () {
            this.setData({
                hide: false
            })
        }.bind(this);
        setTimeout(func, 1500)
    }
})

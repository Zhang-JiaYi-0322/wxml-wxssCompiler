
const options = {
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
        a = !a;
        this.setData({
            a
        })
    },
    click2: function () {
        b = !b;
        this.setData({
            hide: b
        })
    }
}

let a = true;
let b = false;

Page('./miniprogram/pages/index/index.wxml.js',
    './miniprogram/pages/index/index.wxss.json',
    options
);


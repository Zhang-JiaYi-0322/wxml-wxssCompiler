var path = require('path');
var fs = require('fs');


module.exports = {
    mode: 'development',
    // entry: './out/src/webpack-dev-server/index.js',
    entry: './test_miniprogram/pages/index/compiler.index.js',
    // output: {
    //     path: path.resolve(__dirname, 'dist'),
    //     // filename: 'vdom.bundle.js'
    //     filename: 'compiler.js'
    // },
    target: ['web', 'es5'],
    // target:"electron-main",
    devServer: {
        port: 8000,
        open: true
    }
};
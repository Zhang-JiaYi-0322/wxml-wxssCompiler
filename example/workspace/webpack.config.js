const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: 'development',
  // entry: './out/src/webpack-dev-server/index.js',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '/dist/bundle.js'),
  },
  target: 'web',
  devServer: {
    port: 7000,
    open: false
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
};
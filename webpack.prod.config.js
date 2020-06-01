process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const { getBaseConfig } = require('@edx/frontend-build');
const config = getBaseConfig('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const getClientEnvironment = require('./config/env');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

Object.assign(config, {
  entry: {
    app: path.resolve(process.cwd(), 'webpack_xblock/static/js/src/main.js'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(process.cwd(), 'webpack_xblock/static/js/dist'),
  },
  optimization: {
    minimize: false,
  },
  externals: {
  },
});

console.log( config.plugins );

config.plugins.splice(4, 1);
config.plugins.splice(2, 1);
config.plugins.splice(1, 1);
config.resolve.modules = ['node_modules'].concat(
  process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
);
config.plugins.push(new MiniCssExtractPlugin({
  filename: '[name].css',
}));


console.log({ config });

module.exports = config;

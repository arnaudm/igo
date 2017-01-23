
const _       = require('lodash');
const path    = require('path');

const webpack = require('webpack');

// plugins
const CleanWebpackPlugin    = require('clean-webpack-plugin');
const AutoCleanBuildPlugin  = require('webpack-auto-clean-build-plugin');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');
const webpackUglifyJsPlugin = require('webpack-uglify-js-plugin');

//
module.exports = {
  entry: {
    main:   './js/main.js',
    vendor: './js/vendor.js',
    styles: './scss/styles.scss'
  },
  output: {
    filename: '[name]-[chunkhash].js',
    path:     './public/dist'
  },
  module: {
    rules: [{
      test: /\.scss$/,
      exclude: /node_modules/,
      loader: ExtractTextPlugin.extract({
        loader: ['css-loader', 'sass-loader']
      })
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url-loader?limit=100000'
    }]
  },
  // devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(['public/dist', 'build'], {
      root: __dirname,
      verbose: true,
      dry: false,
      exclude: ['chunks.json']
    }),
    new AutoCleanBuildPlugin(),
    new ExtractTextPlugin({
      filename:   '[name]-[chunkhash].css',
      disable:    false,
      allChunks:  true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest']
    }),
    // save stats
    function() {
      this.plugin("done", function(stats) {
        var chunks = _.map(stats.compilation.chunks, function(chunk) {
          return _.pick(chunk, [
            'id', 'ids', 'debugId', 'name',
            'files', 'hash', 'renderedHash'
          ]);
        });
        require("fs").writeFileSync(
          './public/dist/chunks.json',
          JSON.stringify(chunks));
      });
    }
  ]
};

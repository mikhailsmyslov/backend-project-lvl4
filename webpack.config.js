const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
      }),
    ],
  },
  mode: process.env.NODE_ENV || 'development',
  entry: ['./src/index.js'],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'main.js',
    publicPath: '/public',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader',
          'postcss-loader',
        ],
      },
      { test: /\.(woff|woff2|eot|ttf|svg)(\?.*)?$/, loader: 'url-loader?limit=100000' },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css',
    }),
    new webpack.DefinePlugin({
      'require.specified': 'require.resolve',
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en-gb/),
  ],
};

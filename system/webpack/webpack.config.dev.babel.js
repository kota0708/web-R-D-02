import conf from '../config';
import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';

import baseConfig from './webpack.config.base.babel';

const { DIST, PORT } = conf;

const {
  DefinePlugin,
  HotModuleReplacementPlugin,
  NoEmitOnErrorsPlugin
} = webpack;

export default merge(baseConfig, {
  output: {
    path: `${path.resolve('')}/${process.env.NODE_ENV}`,
    filename: '[name]',
    publicPath: '/'
  },
  mode: 'development',
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(DIST)
    }),
    new HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`You application is running here http://localhost:${PORT}`]
      },
      onErrors: () => {},
      clearConsole: true
    }),
    new NoEmitOnErrorsPlugin()
  ]
});

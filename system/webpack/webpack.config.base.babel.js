import conf from '../config';
import glob from 'glob';

const { SRC, INDEX, EXTENSION_JS, EXTENSION_TSX } = conf;

const entries = {};

glob
  .sync(`./${SRC}/**/${EXTENSION_JS}`, {
    ignore: `./${SRC}/**/_${EXTENSION_JS}`
  })
  .map(file => {
    const regEx = new RegExp(`./${SRC}/`);
    // `./src/`の文字列を取り除く
    const key = file
      .replace(regEx, '')
      .replace('.ts', '.js')
      .replace(`${INDEX}/`, '');

    return (entries[key] = file);
  });

glob
  .sync(`./${SRC}/**/${EXTENSION_TSX}`, {
    ignore: `./${SRC}/**/react/**/${EXTENSION_TSX}`
  })
  .map(file => {
    const regEx = new RegExp(`./src/`);
    const key = file
      .replace(regEx, '')
      .replace('.tsx', '.js')
      .replace(`${INDEX}/`, '');

    entries[key] =
      process.env.NODE_ENV !== 'production'
        ? [file, 'webpack/hot/dev-server', 'webpack-hot-middleware/client']
        : file;
  });

export default {
  entry: entries,

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
      {
        enforce: 'pre',
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          fix: true
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      name: 'shared/script/vendor.js',
      chunks: 'initial'
    }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  }
};

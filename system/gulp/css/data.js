import autoPrefixer from 'autoprefixer';
import mqpacker from 'css-mqpacker';
import easing from 'postcss-easings';
import nested from 'postcss-nested';
import reporter from 'postcss-reporter';
import cssDeclarationSorter from 'css-declaration-sorter';
import clean from 'postcss-clean';
import prettify from 'postcss-prettify';
import _import from 'postcss-easy-import';
import flexbugs from 'postcss-flexbugs-fixes';

import conf from '../../config';

const { SRC, DIST, INDEX, EXTENSION_CSS } = conf;

const entry = [
  `./${SRC}/**/!(_)${EXTENSION_CSS}`,
  `!./${SRC}/${INDEX}/**/${EXTENSION_CSS}`
];

const entryIndex = `./${SRC}/${INDEX}/**/!(_)${EXTENSION_CSS}`;

const opts = [
  _import({
    path: ['node_modules'],
    glob: true
  }),
  easing(),
  mqpacker({ sort: true }),
  autoPrefixer(),
  flexbugs(),
  reporter({ clearMessages: true }),
  nested
];

const optsProd = [...opts];

optsProd.push(
  clean(), // 圧縮
  // prettify(),　// 整形
  cssDeclarationSorter({
    order: 'smacss'
  })
);

export const PROCESS_DATAS = [
  {
    name: 'css:dev',
    entry,
    dist: DIST,
    options: opts
  },
  {
    name: 'css:index:dev',
    entry: entryIndex,
    dist: DIST,
    options: opts
  },
  {
    name: 'css:prod',
    entry,
    dist: process.env.NODE_ENV,
    options: optsProd
  },
  {
    name: 'css:index:prod',
    entry: entryIndex,
    dist: process.env.NODE_ENV,
    options: optsProd
  }
];

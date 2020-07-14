import gulp from 'gulp';
import plumber from 'gulp-plumber';
import gulpIf from 'gulp-if';
import notify from 'gulp-notify';
import pug from 'gulp-pug';
import pugLinter from 'gulp-pug-linter';
import pugLintStylish from 'puglint-stylish';
import htmlbeautify from 'gulp-html-beautify';
import rename from 'gulp-rename';

import conf from '../../config';

import { PROCESS_DATAS, BEATIFY_CONF } from './data';

const { EXTENSION_HTML, SRC } = conf;

gulp.task('pug:lint', () => {
  return gulp.src(`./${SRC}/**/${EXTENSION_HTML}`).pipe(
    pugLinter({
      reporter: pugLintStylish
    })
  );
});

const onProcess = config => {
  const { name, entry, dist, data, isClean, isBeatify } = config;

  return gulp.task(
    name,
    gulp.parallel('pug:lint', () => {
      return gulp
        .src(entry)
        .pipe(
          plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
          })
        )
        .pipe(
          pug({
            basedir: SRC,
            pretty: !isClean,
            cache: false,
            data: { data }
          })
        )
        .pipe(gulpIf(isBeatify, htmlbeautify(BEATIFY_CONF)))
        .pipe(
          rename(path => {
            path.dirname += '/../'; // 一つ上の階層に移動
          })
        )
        .pipe(gulp.dest(dist));
    })
  );
};

PROCESS_DATAS.forEach(r => {
  const { name, entry, dist, data, isClean, isBeatify } = r;

  onProcess({
    name,
    entry,
    dist,
    data,
    isClean,
    isBeatify
  });
});

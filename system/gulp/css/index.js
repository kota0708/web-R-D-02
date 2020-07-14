import gulp from 'gulp';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import notify from 'gulp-notify';
import postcss from 'gulp-postcss';
import sass from 'gulp-sass';
import reporter from 'postcss-reporter';
import stylelints from 'stylelint';
import scss from 'postcss-scss';

import conf from '../../config';
import { PROCESS_DATAS } from './data';

const { SRC, EXTENSION_CSS } = conf;

gulp.task('stylelint', () => {
  return gulp
    .src(`./${SRC}/**/${EXTENSION_CSS}`)
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      })
    )
    .pipe(
      postcss([stylelints, reporter({ clearMessages: true })], { syntax: scss })
    );
});

const onProcess = config => {
  const { name, entry, dist, options } = config;

  return gulp.task(
    name,
    gulp.parallel('stylelint', () => {
      return gulp
        .src(entry)
        .pipe(
          plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
          })
        )
        .pipe(
          sass({
            outputStyle: 'expand'
          })
        )
        .pipe(postcss(options))
        .pipe(rename({ extname: '.css' }))
        .pipe(gulp.dest(dist));
    })
  );
};

PROCESS_DATAS.forEach(r => {
  const { name, entry, dist, options } = r;

  onProcess({
    name,
    entry,
    dist,
    options
  });
});

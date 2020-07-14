import conf from '../config';
import gulp from 'gulp';

const { SRC, EXTENSION_HTML, EXTENSION_CSS, EXTENSION_JS, DATA } = conf;

gulp.task(
  'watch',
  gulp.parallel('browser', done => {
    gulp.watch(
      `./${SRC}/**/${EXTENSION_HTML}`,
      gulp.parallel('html:dev', 'html:index:dev', 'reload')
    );
    gulp.watch(
      `./${DATA}/**`,
      gulp.parallel('html:dev', 'html:index:dev', 'reload')
    );
    gulp.watch(
      `./${SRC}/**/${EXTENSION_CSS}`,
      gulp.parallel('css:dev', 'css:index:dev', 'reload')
    );
    gulp.watch(`./${SRC}/**/${EXTENSION_JS}`, gulp.task('reload'));
    done();
  })
);

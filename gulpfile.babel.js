const gulp = require('gulp');
const path = require('path');
const clean = require('gulp-clean');
const filesize = require('gulp-check-filesize');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const gutil = require('gulp-util');
const rollup = require('rollup').rollup;
const rollupBabel = require('rollup-plugin-babel');
const file = require('gulp-file');
const notifier = require('node-notifier');

function reportError(error) {
  gutil.log(gutil.colors.red('[ERROR]'));
  gutil.log(gutil.colors.red(`${error.message}\n`) + error.codeFrame);
  notifier.notify({
    title: 'Error!',
    icon: path.join(__dirname, 'app/public/icon.jpg'),
    message: error.message,
    sound: false
  });
}

gulp.task('clean', () => {
  return gulp
    .src('build', { read: false })
    .pipe(clean({ force: true }));
});

gulp.task('build:server:js', () => {
  return gulp
    .src(['app/**/*.js', '!app/public/**'])
    .pipe(sourcemaps.init())
    .pipe(babel({
      plugins: ['source-map-support'],
      presets: ['es2015']
    }))
    .on('error', function(error) {
      reportError(error);
      this.emit('end');
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'));
});

gulp.task('build:server:views', () => {
  return gulp
    .src('app/views/**/*.mustache')
    .pipe(filesize())
    .pipe(gulp.dest('build/views'));
});

gulp.task('build:resources', () => {
  return gulp
    .src('app/resources/**/*')
    .pipe(gulp.dest('build/resources'));
});

gulp.task('build:client:js', () => {
  console.log('build client');
  return rollup({
    entry: 'app/public/js/app.js',
    plugins: [
      rollupBabel({
        presets: [[
          'es2015', {
            modules: false
          }
        ]],
        sourceMaps: true,
        exclude: 'node_modules/**'
      })
    ]
  }).then(bundle => {
    return bundle.generate({
      format: 'umd',
      moduleName: 'app'
    })
  }).then(generated => {
    return file('app.js', generated.code, { src: true })
      .pipe(gulp.dest('build/public/js'));
  }).catch(error => reportError(error));
});

gulp.task('build:client', ['build:client:js']);
gulp.task('build:server', ['build:server:js', 'build:server:views']);

gulp.task('watch', () => {
  gulp.watch('app/public/**/*.js', ['build:client:js']);
  gulp.watch(['app/**/*.js', '!app/public/**'], ['build:server:js']);
  gulp.watch('app/views/**/*.mustache', ['build:server:views']);
});

gulp.task('build', ['build:resources', 'build:server', 'build:client']);

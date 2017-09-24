require('dotenv').config();
const gulp = require('gulp');
const path = require('path');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const uglifycss = require('gulp-uglifycss');
const uglifyjs = require('gulp-uglify');
const filesize = require('gulp-check-filesize');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const gutil = require('gulp-util');
const rollup = require('rollup-stream');
const notifier = require('node-notifier');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browsersync = require('browser-sync');

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
    .pipe(filesize())
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

gulp.task('build:client:sass', () => {
  return gulp
    .src('app/public/sass/app.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer())
    .pipe(uglifycss())
    .pipe(filesize())
    .pipe(gulp.dest('build/public/css'));
});

gulp.task('build:client:js', () => {
  return rollup('rollup.config.js')
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel())
    .pipe(uglifyjs())
    .pipe(filesize())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/public/js'));
});

gulp.task('build:client', ['build:client:js', 'build:client:sass']);
gulp.task('build:server', ['build:server:js', 'build:server:views']);

gulp.task('watch', () => {
  browsersync({
    proxy: `localhost:${process.env.PORT}`,
    open: false
  });

  gulp.watch('app/public/**/*.js', ['build:client:js', browsersync.reload]);
  gulp.watch(['app/**/*.js', '!app/public/**'], ['build:server:js']);
  gulp.watch('app/views/**/*.mustache', ['build:server:views', browsersync.reload]);
  gulp.watch('app/public/**/*.scss', ['build:client:sass', browsersync.reload]);
});

gulp.task('build', ['build:resources', 'build:server', 'build:client']);

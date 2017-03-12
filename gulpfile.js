var gulp = require('gulp');
var clean = require('gulp-clean');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', function () {
    return gulp.src('./dist/*', {read: false})
        .pipe(clean());
});

gulp.task('compile-ts', function () {
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return tsResult.js
        .pipe(sourcemaps.write('../dist'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['compile-ts']);
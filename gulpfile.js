var gulp = require('gulp');
var browserify = require('gulp-browserify');

var paths = {
  scripts: ['public/js/data-record.js', 'public/js/script.js']
};

gulp.task('scripts', function() {
	gulp.src(paths.scripts)
    .pipe(browserify())
    .pipe(gulp.dest('public/js/build'));
})

gulp.task('default', function(){
	//watch js
	gulp.watch(paths.scripts, function() {
    gulp.run('scripts');
  })
});
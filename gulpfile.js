var gulp 			= require('gulp'),
	order 			= require("gulp-order"),
	concat 			= require("gulp-concat"),
	watch 			= require('gulp-watch');
	csso 			= require("gulp-csso"),
	autoprefixer 	= require("gulp-autoprefixer");

gulp.task('build', function() {

	gulp.
		src("frontdev/**/*.css")
		.pipe(order([
			"common.blocks/**/*.css",
			"desktop.blocks/**/*.css"
		]))
		.pipe(concat("main.css"))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: true
		}))
		.pipe(csso())
		.pipe(gulp.dest("public/stylesheets"));

});

gulp.task("watch", function () {
	watch("frontdev/**/*.css", function () {
		gulp.start('build');
	});
});
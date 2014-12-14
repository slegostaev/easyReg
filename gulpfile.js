var gulp 			= require('gulp'),
	order 			= require("gulp-order"),
	concat 			= require("gulp-concat"),
	watch 			= require('gulp-watch');
	csso 			= require("gulp-csso"),
	uglify 			= require("gulp-uglify"),
	autoprefixer 	= require("gulp-autoprefixer");

gulp.task('build', function () {

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

gulp.task('build-dhtmlx', function () {
	gulp.src("frontdev/libs/dhtmlx/**/*.js")
		.pipe(concat("dhtmlx.js"))
		.pipe(uglify())
		.pipe(gulp.dest("public/javascripts"));
});

gulp.task("watch", function () {
	watch("frontdev/**/*.css", function () {
		gulp.start('build');
	});
});
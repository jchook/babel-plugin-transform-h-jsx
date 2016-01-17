var
  gulp = require("gulp"),
  babel = require("gulp-babel")
;

gulp.task("build", function(){
  gulp.src("src/*.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"))
  ;
});

gulp.task("default", ["build"]);

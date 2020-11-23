const { src, dest, watch, series, parallel } = require("gulp");
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const fileinclude = require("gulp-file-include");
const uglifycss = require("gulp-uglifycss");
const imagemin = require("gulp-imagemin");
const terser = require("gulp-terser");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const babel = require("gulp-babel");
const sass = require("gulp-sass");
const del = require("del");

function clean() {
  return del(["dist/*"]);
}

function html() {
  return src("src/*.html")
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
      }),
    )
    .pipe(dest("dist"));
}

function js() {
  return src("src/scripts/**/*.js")
    .pipe(concat("main.js"))
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(terser({ mangle: false }))
    .pipe(rename({ extname: ".min.js" }))
    .pipe(dest("dist"))
    .pipe(browserSync.stream());
}

function css() {
  return src("src/styles/main.scss")
    .pipe(sass({ includePaths: ["./node_modules"] }).on("error", sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(uglifycss({ uglyComments: true }))
    .pipe(rename({ basename: "main", extname: ".min.css" }))
    .pipe(dest("dist"))
    .pipe(browserSync.stream());
}

function images() {
  return src("src/assets/images/**/*").pipe(imagemin()).pipe(dest("dist/images"));
}

function fonts() {
  return src("src/fonts/*").pipe(dest("dist/fonts"));
}

function livereload() {
  browserSync.init({
    port: 3000,
    server: {
      baseDir: "dist/",
    },
  });

  watch("src/styles/**/*.scss", css);
  watch("src/assets/fonts/**/*", fonts);
  watch("src/assets/images/**/*", images);
  watch("src/**/*.html", html).on("change", browserSync.reload);
  watch("src/scripts/**/*.js", js).on("change", browserSync.reload);
}

exports.default = series(clean, html, parallel(js, css), parallel(fonts, images));

exports.watch = livereload;

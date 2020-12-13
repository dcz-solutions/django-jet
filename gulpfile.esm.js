import {dest, parallel, series, src, watch} from "gulp";
import browserify from "browserify";
import concatCss from "gulp-concat-css";
import cleanCSS from "gulp-clean-css";
import sass from "gulp-sass";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";
import sourcemaps from "gulp-sourcemaps";
import merge from "merge-stream";
import postcss from "gulp-postcss";
import pxtorem from "postcss-pxtorem";
import autoprefixer from "autoprefixer";
import shell from "gulp-shell";
import replace from "gulp-replace";
import {polyfill} from "es6-promise";
import DartSass from "sass";
import terser from "gulp-terser-js";

polyfill();

sass.compiler = DartSass;

const cssProcessors = [
    autoprefixer(),
    pxtorem({
        rootValue: 14,
        replace: false,
        propWhiteList: []
    })
];

function scripts() {
    return browserify("./jet/static/jet/js/src/main.js", {debug: true})
        .bundle()
        .on("error", error => console.error(error))
        .pipe(source("bundle.min.js"))
        .pipe(buffer())
        .pipe(terser())
        .pipe(dest("./jet/static/jet/js/build/"));
}

function styles() {
    return src("./jet/static/jet/css/**/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: "compressed"
        }))
        .on("error", error => console.error(error))
        .pipe(postcss(cssProcessors))
        .on("error", error => console.error(error))
        .pipe(sourcemaps.write("./"))
        .pipe(dest("./jet/static/jet/css"));
}

function vendor_styles() {
    return merge(
        src("./node_modules/jquery-ui/themes/base/images/*")
            .pipe(dest("./jet/static/jet/css/jquery-ui/images/")),
        merge(
            src([
                "./node_modules/select2/dist/css/select2.css",
                "./node_modules/timepicker/jquery.ui.timepicker.css"
            ]),
            src([
                "./node_modules/jquery-ui/themes/base/all.css"
            ])
                .pipe(cleanCSS()) // needed to remove jQuery UI comments breaking concatCss
                .on("error", error => console.error(error))
                .pipe(concatCss("jquery-ui.css", {
                    rebaseUrls: false
                }))
                .on("error", error => console.error(error))
                .pipe(replace("images/", "jquery-ui/images/"))
                .on("error", error => console.error(error)),
            src([
                "./node_modules/perfect-scrollbar/src/css/main.scss"
            ])
                .pipe(sass({
                    outputStyle: "compressed"
                }))
                .on("error", error => console.error(error))
        )
            .pipe(postcss(cssProcessors))
            .on("error", error => console.error(error))
            .pipe(concatCss("vendor.css", {
                rebaseUrls: false
            }))
            .on("error", error => console.error(error))
            .pipe(cleanCSS())
            .on("error", error => console.error(error))
            .pipe(dest("./jet/static/jet/css"))
    );
}

function vendor_translations() {
    return merge(
        src(["./node_modules/jquery-ui/ui/i18n/*.js"]).pipe(dest("./jet/static/jet/js/i18n/jquery-ui/")),
        src(["./node_modules/timepicker/i18n/*.js"]).pipe(dest("./jet/static/jet/js/i18n/jquery-ui-timepicker/")),
        src(["./node_modules/select2/dist/js/i18n/*.js"]).pipe(dest("./jet/static/jet/js/i18n/select2/"))
    );
}

function locales() {
    return series(shell.task("python manage.py compilemessages", {quiet: true}));
}

const mainBuild = () => parallel(scripts, styles, vendor_styles, vendor_translations, locales());

function watchAll() {
    return parallel(
        watch(["./jet/static/jet/js/src/**/*.js"], scripts),
        watch(["./jet/static/jet/css/**/*.scss"], styles),
        watch(["./jet/locale/**/*.po", "./jet/dashboard/locale/**/*.po"], locales())
    );
}

const main = () => series(build, watchAll());

export default main;
export const build = mainBuild();

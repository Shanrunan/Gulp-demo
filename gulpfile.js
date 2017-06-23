// 引入 gulp
var gulp = require('gulp');

// 引入组件
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat'); //合并多个css js文件
var uglify = require('gulp-uglify'); //压缩美化js
var minifycss = require('gulp-minify-css'); //压缩css
var imagemin = require('gulp-imagemin'); //压缩图片
var clean = require('gulp-clean'); //目标目录清理，在用于gulp任务执行前清空目标目录
var cache = require('gulp-cache'); //资源缓存处理，可用于缓存已压缩过的资源，如：图片
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var express = require('express');

// 检查脚本
gulp.task('lint', function () {
    gulp.src('./src/main/webapp/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 编译Sass
gulp.task('sass', function () {
    gulp.src('./src/main/webapp/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./src/main/webapp/public/dist/css'))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./src/main/webapp/public/dist/css'))
        .pipe(minifycss())
        .pipe(gulp.dest('./src/main/webapp/public/dist/css'))
        .pipe(notify({
            message: '样式文件处理完成'
        }));
});

// 合并，压缩文件
gulp.task('scripts', function () {
    gulp.src('./src/main/webapp/js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./src/main/webapp/public/dist/js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./src/main/webapp/public/dist/js'))
        .pipe(notify({
            message: 'js文件处理完成'
        }));
});
gulp.task('images', function () {
    gulp.src('./src/main/webapp/img/*')
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })) //压缩图片
        // 如果想对变动过的文件进行压缩，则使用下面一句代码
        // .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('./src/main/webapp/public/dist/img'))
        .pipe(notify({
            message: '图片处理完成'
        }));
});
// 目标目录清理
gulp.task('clean', function () {
    return gulp.src(['./src/main/webapp/public/dist/css', './src/main/webapp/public/dist/js', './src/main/webapp/public/dist/img'], {
            read: false
        })
        .pipe(clean());
});

// 默认任务
gulp.task('default', function () {
    gulp.run('lint', 'sass', 'scripts');

    // 监听文件变化
    gulp.watch('./src/main/webapp/js/*.js', function () {
        console.log("watch");
        gulp.run('lint', 'sass', 'scripts');
    });
});


gulp.task('serve', ['clean', 'lint', 'sass', 'scripts', 'images', 'default'], function () {
    var app = express();

    app.get('/', function (req, res) {
        res.send('Hello World!');
    });

    var server = app.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Example app listening at http://%s:%s', host, port);
    });
    browserSync.init({
        server: {
            baseDir: "./src/main/webapp/",
            index: "index.html"
        }
    });
    gulp.watch("./src/main/webapp/*.html").on("change", reload);
    gulp.watch("./src/main/webapp/scss/*.css").on("change", reload);
    gulp.watch("./src/main/webapp/js/*.js").on("change", reload);

});

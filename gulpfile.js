'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');

var imagemin = require('gulp-imagemin');
var autoprefixer = require('gulp-autoprefixer');
var notify = require('gulp-notify');
var cache = require('gulp-cache');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');

var gutil = require('gulp-util');

var bower = require('gulp-bower');

var spritesmith = require('gulp.spritesmith')

var optipng = require('imagemin-optipng');
var pngquant = require('imagemin-pngquant');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var humans = require('gulp-humans');
var rev = require('gulp-rev');
var rimraf          = require('rimraf');
var revOutdated     = require('gulp-rev-outdated');
var path            = require('path');
var through         = require('through2')
var debug = require('gulp-debug');
var changed = require('gulp-changed');

var packageJson = require('./package.json');
var bowerJson = require('./bower.json');

var date = new Date();
var config = {
    bases: {
        app: 'src/',
        dist: 'dist/'
    },
    paths: {
        php: ['**/*.php'],
        sass: 'assets/sass/**/*.scss',
        images: ['assets/images/**/*'],
        fonts: ['assets/fonts/**/*'],
        js: ['assets/js/*.js'],
        utilJs: ['assets/js/util/*.js'],
        css: ['*.css'],
        cssDist: 'assets/css/',
        fontDist: 'assets/fonts/',
        jsDist: 'assets/js/',
        imageDist: 'assets/images/'
    },
    sassPath: 'assets/sass/style.scss',
    bowerDir: './bower_components',
    humans: {
        header: 'WP Theme',
        team: {
            "Morgan O'Neal": {
                'Role': 'Developer',
                'Twitter': '@morganoneal',
                'Email': 'morgan@ghostbyte.com',
                'Site': 'http://www.ghostbyte.com',
                'Location': 'Bend, Oregon'
            }
        },
        site: {
            'Last update': date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate(),
            'Standards': 'HTML5, CSS3',
            'Components': 'jQuery',
            'Doctype': 'HTML5',
            'IDE': 'PhpStorm, Photoshop',
            'Software': ''
        },
        'note': "Handcrafted by Morgan O'Neal.",
        out: 'humans.txt'
    },
    sftp: {
        remotePath: '',
        host: ''
    }
};
// Update software from package.json
function update_humans_config() {
    var count = 0
    for( var prop in packageJson.devDependencies ) {
        if ( count == 0 && '' != config.humans.site.Software) {
            config.humans.site.Software += ', ';
        }
        count++;
        config.humans.site.Software += prop;
        if (Object.keys(packageJson.devDependencies).length > count) {
            config.humans.site.Software += ', ';
        }
    }
    var count = 0
    for( var prop in bowerJson.dependencies ) {
        if ( count == 0 && '' != config.humans.site.Components) {
            config.humans.site.Components += ', ';
        }
        count++;
        config.humans.site.Components += prop;
        if (Object.keys(bowerJson.dependencies).length > count) {
            config.humans.site.Components += ', ';
        }
    }
}

gulp.task('sync-live', /*['build-frontend'],*/ function() {

    return gulp
        .src([
            //'assets/**/*.*',
            //'inc/**/*.*',
            //'languages/**/*.*',
            '!node_modules/**',
            '!bower_components/**',
            '!src/**',
            '!bower.json',
            '!package.json',
            '!gulpfile.js',
            './**/*.*',
        ])
        //.pipe(changed('./', {hasChanged: changed.compareSha1Digest}))
        .pipe(debug())
        //.pipe(gulp.dest('./'))
        /*
         .pipe(sftp
         ({

         host: config.sftp.host,
         port: config.sftp.port,
         user: config.sftp.user,
         pass: config.sftp.pass,
         remotePath: ( config.sftp.remotePath )

         }))
         */
        ;

});
/*
function cleaner() {
    return through.obj(function(file, enc, cb){
        rimraf( path.resolve( (file.cwd || process.cwd()), file.path), function (err) {
            if (err) {
                this.emit('error', new gutil.PluginError('Cleanup old files', err));
            }
            this.push(file);
            cb();
        }.bind(this));
    });
}
gulp.task('clean', function() {
    gulp.src( ['assets/** remove /*.*'], {read: false})
        .pipe( revOutdated(1) ) // leave 1 latest asset file for every file name prefix.
        .pipe( cleaner() );

    return;
});

*/
// Delete the dist directory
gulp.task('clean', function() {
    return gulp.src(config.bases.dist, {read: false})
        .pipe(clean({force:true}));
});

gulp.task('clear', function (done) {
    return cache.clearAll(done);
});

gulp.task('copy-php', [], function() {
    gulp.src(config.paths.php, {cwd: config.bases.app})
        .pipe(gulp.dest(config.bases.dist));
});

gulp.task('copy-css', [], function() {
    gulp.src(config.paths.css, {cwd: config.bases.app})
        .pipe(gulp.dest(config.bases.dist));
});
gulp.task('copy-fonts', function() {
    // Font Awesome Fonts
    gulp.src('*.*', {cwd: config.bowerDir + '/font-awesome/fonts'})
        .pipe(gulp.dest( config.bases.dist + config.paths.fontDist));
    return gulp.src(config.paths.fonts, {cwd: config.bases.app})
        .pipe(gulp.dest( config.bases.dist + config.paths.fontDist));
});
gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir))
});

// Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
gulp.task('humans', function () {
    //humans(config.humans);
    update_humans_config();
    gulp.src('/dev/null')
        .pipe(humans(config.humans))
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    gulp.src([
            config.bowerDir + '/bootstrap-sass-official/assets/javascripts/bootstrap/transition.js',
            config.bowerDir + '/bootstrap-sass-official/assets/javascripts/bootstrap/collapse.js',
            config.bowerDir + '/bootstrap-sass-official/assets/javascripts/bootstrap/dropdown.js',
            config.bowerDir + '/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
            config.bowerDir + '/bootstrap-sass-official/assets/javascripts/bootstrap/carousel.js',
            config.bowerDir + '/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
            config.bowerDir + '/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
            config.bowerDir + '/matchHeight/jquery.matchHeight.js',
            //config.bowerDir + '/jquery-cycle2/build/jquery.cycle2.js'
        ],
        {base: config.bowerDir})
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest( config.bases.dist + config.paths.jsDist ))
        //.pipe(rename('vendor.min.js'))
        .pipe(uglify())
        //.pipe(gulp.dest('assets/js'))
        //.pipe(rev())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.bases.dist + config.paths.jsDist))
        //.pipe(rev.manifest({merge:true}))
        //.pipe(gulp.dest('./'))
    ;
    gulp.src( config.paths.js, {cwd: config.bases.app})
        .pipe(concat('main.js'))
        .pipe(gulp.dest(config.bases.dist + config.paths.jsDist))
        //.pipe(rename('main.min.js'))
        .pipe(uglify({
            mangle: {
                except: ['modal'] // Modal gets all messed up and can't be called with javascript, needed for header book now link
            }
        }))
        //.pipe(gulp.dest('assets/js'))
        //.pipe(rev())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.bases.dist + config.paths.jsDist))
        //.pipe(rev.manifest({merge:true}))
        //.pipe(gulp.dest('./'))
    ;
    gulp.src( config.paths.utilJs, {cwd: config.bases.app})
        .pipe(gulp.dest(config.bases.dist + config.paths.jsDist + '/util/'))
        //.pipe(rename('main.min.js'))
        .pipe(uglify({
            mangle: {
                except: ['modal'] // Modal gets all messed up and can't be called with javascript, needed for header book now link
            }
        }))
        //.pipe(gulp.dest('assets/js'))
        //.pipe(rev())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.bases.dist + config.paths.jsDist + '/util/'))
        //.pipe(rev.manifest({merge:true}))
        //.pipe(gulp.dest('./'))
    ;
    return;
});

// Styles
gulp.task('styles', [], function() {
    //gulp.src(config.paths.php, {cwd: config.bases.app})
    //    .pipe(gulp.dest(config.bases.dist));
    //return gulp.src('src/sass/style.scss')
    return gulp.src(config.paths.sass, {cwd: config.bases.app})
        .pipe(sourcemaps.init({loadMaps: true}))
        //.pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compact',
            imagePath: "../images",
            includePaths: [
                config.bowerDir + '/bootstrap-sass-official/assets/stylesheets',
                config.bowerDir + '/font-awesome/scss'
            ]})
            .on("error", notify.onError(function (error) {
                this.emit('end');
                return "Error: " + error.message;
             })))
        .pipe(autoprefixer('last 2 version', 'ff 8', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(sourcemaps.write('./',{includeContent: false}))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(config.bases.dist + config.paths.cssDist))
        .pipe(minifycss())
        //.pipe(gulp.dest('assets/css'))
        //.pipe(rev())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.bases.dist + config.paths.cssDist))
        /*
        .pipe(rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest('./'))
        */
        .pipe(notify({ message: 'Styles task complete' }));
});

// Images
gulp.task('images', function() {
    return gulp.src(config.paths.images, {cwd: config.bases.app})
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeUnknownsAndDefaults: false}],
            //use: [optipng({optimizationLevel: 5})]
            use: [pngquant({ quality: '65-80', speed: 4 })]
        })))
        .pipe(gulp.dest( config.bases.dist + config.paths.imageDist))
        //.pipe(notify({ message: 'Images task complete' }));

});

// Sprites
gulp.task('sprite', function () {

    var spriteData = gulp.src('src/assets/images/weather-icons/*.gif').pipe(spritesmith({
        imgName: '../../images/weather-icons.png',
        imgPath: '../images/weather-icons.png',
        cssSpritesheetName: 'weather-spritesheet',
        cssName: '_weather-icons.scss'
    }));
    spriteData.pipe(gulp.dest('src/assets/sass/utils/'));

    var actionSprites = gulp.src('src/assets/images/action-icons/*.png').pipe(spritesmith({
        imgName: '../../images/action-icons.png',
        imgPath: '../images/action-icons.png',
        cssName: '_action-icons.scss',
        cssSpritesheetName: 'action-spritesheet',
        cssOpts: {
            functions: false
        }
    }));
    actionSprites.pipe(gulp.dest('src/assets/sass/utils/'));
});

gulp.task('reload-sass', ['styles'], function(){
    browserSync.reload();
})

gulp.task('reload-scripts', ['lint', 'scripts'], function(){
    browserSync.reload();
})

gulp.task('reload-images', ['sprite', 'images', 'humans'], function(){
    browserSync.reload();
})

gulp.task('reload-php', ['copy-php'], function(){
    browserSync.reload();
})

gulp.task('browser-sync', function() {
    browserSync({
        proxy: "localhost:3000",
        open: false
    });
});

gulp.task('watch', ['copy-php', 'copy-css', 'copy-fonts','images', 'styles', 'lint', 'scripts', 'browser-sync'], function() {

    // --------------------------
    // watch:sass
    // --------------------------
    gulp.watch( config.bases.app + config.paths.sass, ['reload-sass']);

    // --------------------------
    // watch:js
    // --------------------------
    gulp.watch(config.bases.app + config.paths.js, ['reload-scripts']);

    // --------------------------
    // watch:images
    // --------------------------
    //gulp.watch(config.bases.app + config.paths.images, ['reload-images']);

    // --------------------------
    // watch:php
    // --------------------------
    gulp.watch( config.bases.app + config.paths.php, ['reload-php']);

    gutil.log(gutil.colors.bgGreen('Watching for changes...'));
});



gulp.task('default', ['watch']);

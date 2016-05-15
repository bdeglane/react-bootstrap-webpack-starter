var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.config.js');
var webserver = require('gulp-webserver');
var path = require('path');

//var dist = path.join(__dirname, 'dist', '/');
var dist = path.join('./dist', '/');

gulp.task('default', ['webpack-dev-server']);
// Build and watch cycle (another option for development)
// Advantage: No server required, can run app from filesystem
// Disadvantage: Requests are not blocked until bundle is available,
//               can serve an old app on refresh
gulp.task('build-dev', ['webpack:build-dev'], function() {
    gulp.watch(['app/**/*'], ['webpack:build-dev']);
});

// Production build
gulp.task('build', ['webpack:build']);

gulp.task('webpack:build', function(callback) {
    // modify some webpack config options
    var productionConfig = Object.create(webpackConfig);
    productionConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }));

    webpack(productionConfig, function(err, stats) {
        if (err) throw new gutil.PluginError('webpack:build', err);
        gutil.log('[webpack:build]', stats.toString({
            colors: true
        }));
        callback();
    });
});

// modify some webpack config options
var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = 'sourcemap';
myDevConfig.debug = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack(myDevConfig);

// development build
gulp.task('webpack:build-dev', function(callback) {
    // run webpack
    devCompiler.run(function(err, stats) {
        if (err) throw new gutil.PluginError('webpack:build-dev', err);
        gutil.log('[webpack:build-dev]', stats.toString({
            colors: true
        }));
        callback();
    });
});

// webpack-dev-server
// Advantage: reload app in browser when change
// Disadvantage: on windows, app doesn't rebuild, process 'build-dev' needed in
//               a second terminal
gulp.task('webpack-dev-server', function(callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    // myConfig.devtool = 'eval';
    myConfig.devtool = 'sourcemap';
    myConfig.debug = true;

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(myConfig), {
        // publicPath: dist,
        publicPath: myConfig.output.publicPath,
        stats: {
            colors: true
        },
        // watchOptions: {
        //     aggregateTimeout: 300,
        //     poll: 1000
        // },
        // hot: true
    }).listen(8080, 'localhost', function(err) {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/dist/index.html');
    });
});

// simple webserver
gulp.task('server', function() {
    gulp.src('./dist/')
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            open: 'http://localhost:8080/index.html',
            port: 8080,
            fallback: 'index.html'
        }));
});

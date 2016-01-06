const path = require('path');
const gulp = require('gulp');
const util = require('gulp-util');
const del = require('del');
const zip = require('gulp-zip');

const packageName = 'thuthesis';

const config = {
    template: {
        files: ['thuthesis.ins',
                'thuthesis.dtx',
                'thuthesis.bst',
                'thuthesis.sty',
                'ctex-fontset-thuthesis.def',
                'zhfonts.py',
                'Makefile',
                'latexmkrc',
                'README.md',
                'thuthesis.pdf'],
        generated: ['thuthesis.cls',
                    'thuthesis.cfg']
    },

    example: {
        files: ['main.tex',
                'shuji.tex',
                'main.pdf',
                'shuji.pdf',
                'data/*.tex',
                'figures/*.*',
                'ref/*.bib']
    },

    dist: {
        root: './dist',
        build: '',
        zip: ''
    },

    isCTAN: false
};

function usage() {
    util.log('Usage:');
    util.log('\t make dist version=[x.y.z | ctan]');
    util.log('\t gulp build --version=[x.y.z | ctan]');
}

gulp.task('default', function(callback) {
    usage();

    callback();
});

gulp.task('bootstrap', function(callback) {
    if (!util.env.hasOwnProperty('version')) {
        usage();

        process.exit(1);
    }

    const version = util.env.version.toString().toLowerCase();
    config.isCTAN = version === 'ctan';

    util.log(util.colors.yellow('⚠️  Ensure all files are generated.'));

    if (config.isCTAN) {
        config.dist.build = `${packageName}`;
    } else {
        config.template.files.push(...config.template.generated);
        config.dist.build = `${packageName}-v${version}`;
    }
    config.dist.zip = `${config.dist.build}.zip`;

    util.log(`Removing ${config.dist.build}...`);
    del.sync([path.join(config.dist.root, config.dist.build),
              path.join(config.dist.root, config.dist.zip)]);

    callback();
});

gulp.task('copy', ['bootstrap'], function() {
    const src = [...config.template.files, ...config.example.files];
    const dest = path.join(config.dist.root, config.dist.build);

    return gulp.src(src, {
        cwdbase: true
    })
        .pipe(gulp.dest(dest));
});

gulp.task('zip', ['copy'], function() {
    const src = path.join(config.dist.build, '**/*');

    return gulp.src(src, {
        cwd: config.dist.root,
        cwdbase: true
    })
        .pipe(zip(config.dist.zip))
        .pipe(gulp.dest(config.dist.root));
});

gulp.task('build', ['zip'], function(callback) {
    del.sync([path.join(config.dist.root, config.dist.build)]);

    util.log(util.colors.green.bold('🍺  Build Succeeded.'));

    callback();
});
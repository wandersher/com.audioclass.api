const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');

const app = require('./package.json')

module.exports = function (grunt) {
    const filename = `${app.version}.zip`
    const filepath = `dist/${filename}`

    grunt.initConfig({
        zip: {
            packing: {
                cwd: 'build/',
                src: [
                    "build/config/**",
                    "build/constants/**",
                    "build/src/**",
                    "build/package.json",
                ],
                dest: filepath
            },
        },
        publish: {},
        clean: {}
    });

    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('publish', 'Publish assets to github release', async function () {
        var done = this.async();
        try {
            grunt.log.writeln('Start publishing...');
            const form = new FormData();
            form.append('file', fs.createReadStream(filepath));
            const response = await fetch(`${app.config.deploy.url}/${app.name}/${filename}`, {
                method: 'POST',
                headers: form.getHeaders(),
                body: form
            })
            const message = await response.text()
            if (response.status === 200) {
                grunt.log.writeln(`🟢 Asset publishing completed!`);
            } else {
                grunt.log.writeln(`🔴 Publishing error: ${message}`);
            }
        } catch (error) {
            grunt.log.writeln(`🔴 Publishing error`, error);
        } finally {
            done()
        }
    });
    grunt.registerTask('clean', 'Delete assets from dist folder', async function () {
        var done = this.async();
        try {
            await fs.promises.unlink(filepath)
            grunt.log.writeln(`🟢 Asset deleting completed!`);
        } catch (error) {
            grunt.log.writeln(`🔴 Error when try delete asset ${filepath}`, error);
        } finally {
            done()
        }
    });
};
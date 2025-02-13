const StreamZip = require('node-stream-zip');
const fs = require('fs');
const path = require('node:path')

async function handleZip(filepath) {

    var decompressed_files = [];
    var is_complete = false;

    var zip = new StreamZip({
        file: filepath,
        storeEntries: true
    });

    zip.on('error', function(err) {
        console.error(err);
    });

    zip.on('ready', function() {
        is_complete = true;
    });

    zip.on('entry', function (entry) {
        var pathname = path.resolve('./uploads', entry.name);
        if (/\.\./.test(path.relative('./uploads', pathname))) {
            console.warn("[zip warn]: ignoring maliciously crafted paths in zip file:", entry.name);
            return;
        }
        if ('/' === entry.name[entry.name.length - 1]) {
            console.log('[DIR]', entry.name);
            return;
        }

        // console.log('[FILE]', entry.name);

        zip.stream(entry.name, function (err, stream) {
            if (err) {
                console.error(err);
                return;
            }

            stream.on('error', function (err) {
                console.log(err);
                return;
            });

            fs.mkdir(
                path.dirname(pathname),
                {recursive: true},
                function (err) {
                    stream.pipe(fs.createWriteStream(pathname));
                }
            );
        });

        decompressed_files.push(pathname)
    })

    while (!is_complete) {
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        })
    }

    return decompressed_files;
}


module.exports = { handleZip };

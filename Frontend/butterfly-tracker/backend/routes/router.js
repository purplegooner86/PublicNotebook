const express = require('express')
const router = express.Router()
const schemas = require('../models/schemas')
const fs = require('fs')
const formidable = require('formidable')


router.get("/api/butterflieslist", async(req, res) => {
    try {
        const butterflylist = schemas.Butterflies;
        const items = await butterflylist.find();
        
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.post("/api/butterflieslist", async(req, res) => {
    try {
        const {species, wingspan, color, date} = req.body;
        
        const butterflyData = {
            species: species, 
            wingspan: wingspan,
            color: color,
            date: date,
        }

        const newButterfly = new schemas.Butterflies(butterflyData);
        const saveButterfly = await newButterfly.save();
        if (saveButterfly) {
            res.send("Butterfly Created");
        } else {
            res.send("Failed to create Butterfly");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

function handleFileUpload(req) {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm({multiples: true});
        form.parse(req, (error, fields, files) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({...fields, ...files});
        });
    });
}

router.post( "/api/fileupload", async (req, res) => {
    try {
        const body = await handleFileUpload(req);

        var file_list = [];

        if (body.file[0].originalFilename.endsWith(".zip")) {
            const ziphandler = require('../ziphandler/ziphandler')

            file_list = await ziphandler.handleZip(body.file[0].filepath);
        } else {
            const filedata = fs.readFileSync(body.file[0].filepath);
            fs.writeFileSync(`./uploads/${body.file[0].originalFilename}`, filedata)


            file_list = [`./uploads/${body.file[0].originalFilename}`];
        }

        // console.log(file_list)

        for ( var filename in file_list ) {
            fs.readFile(file_list[filename], async (err, e) => {
                if (err) {
                    console.log(err);
                }
            
                var newButterfliesJSON = []
                try {
                    newButterfliesJSON = JSON.parse(e.toString())
                } catch (err) {
                    res.status(301).send("Could not Parse JSON from your file");
                    newButterfliesJSON = [];
                }


                for (var butterfly in newButterfliesJSON) {
                    if ( !(
                        "date" in newButterfliesJSON[butterfly] &&
                        "species" in newButterfliesJSON[butterfly] &&
                        "color" in newButterfliesJSON[butterfly] &&
                        "wingspan" in newButterfliesJSON[butterfly]
                    ) ) {
                        continue;
                    }

                    var bDate = new Date(Date.parse(newButterfliesJSON[butterfly]["date"]));
                    
                    if (isNaN(bDate)) {
                        continue;
                    }

                    var butterflyData = {
                        species: newButterfliesJSON[butterfly]['species'], 
                        wingspan: newButterfliesJSON[butterfly]['wingspan'],
                        color: newButterfliesJSON[butterfly]['color'],
                        date: bDate,
                    }

                    // console.log("butterflyData:", butterflyData);

                    const newButterfly = new schemas.Butterflies(butterflyData);
                    await newButterfly.save();
                }
            });
        };
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
});
    
module.exports = router;

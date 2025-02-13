import { Box, Typography, useTheme, TextField, Button } from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";

import { useState } from "react"
import axios from "axios"

const FileUpload = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [file, setFile] = useState();

    function handleUpload() {
        if (!file) {
            console.log("No file selected");
            return;
        }

        const fd = new FormData();
        fd.append('file', file);
        fd.append('filename', `upload_${Date.now()}`);

        axios.post(process.env.REACT_APP_BACKEND_URL + "/api/fileupload", fd)
        .then(response => console.log(response))
        .catch(error => console.error(error));

        let fileSelector = document.getElementById('fileSelector');
        fileSelector.value = "";
    }

    const sampleData = [
        {
            "species": "monarch",
            "wingspan": 10,
            "color": "orange",
            "date": "2009-11-31"
        },
        {
            "species": "painted lady",
            "wingspan": 11,
            "color": "yellow",
            "date": "2003-11-15"
        },
        {
            "species": "swallowtail",
            "wingspan": 9,
            "color": "black",
            "date": "2005-8-15"
        }
    ]


    return (
        <Box m="20px">
            <Header title="Add Butterflies from File" />
            <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: colors.grey[100] }}
            >
                Upload a json file containing butterflies of the form:
            </Typography>
            <pre style={{color:colors.greenAccent[500]}}>{JSON.stringify(sampleData, null, 4)}</pre>
            <p style={{color:colors.grey[100]}}>
                A .zip file containing 1 or more compressed json files of the above form will also be accepted
            </p>
            <form>
                <Box display="flex" justifyContent="start" mt="20px">
                    <TextField 
                        type="file"
                        variant="standard"
                        id="fileSelector"
                        InputProps={{ disableUnderline: true }}
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <Button variant="contained" color="secondary" onClick={handleUpload}>
                        Upload
                    </Button>
                </Box>
            </form>
        </Box>

    )
}

export default FileUpload;
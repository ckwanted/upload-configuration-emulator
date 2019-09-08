require('dotenv').config();

// MARK: - Modules
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const cors = require('cors');
const log = require('./utils/logger');

// MARK: - Server Config
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw({ type: 'image/*', limit: '8mb' }));
app.use(bodyParser.text({
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf;
    }
}));
app.use(
    morgan('short', {
        stream: {
            write: message => log.info(message.trim())
        }
    })
);

const CONFIGURATION_FILE_NAME = "configuration";

// MARK: - END POINTS
const API_PREFIX = process.env.API_PREFIX || "/api";

app.get('/', (req, res) => {
    res.send("Alto Avion API");
});

app.get(`${API_PREFIX}/version`, (req, res) => {
    res.send("configuration version 1.0");
});

app.get(`${API_PREFIX}/configuration`, (req, res) => {
    try {
        res.sendFile(`${__dirname}/${path.join(CONFIGURATION_FILE_NAME)}`);
    }
    catch(error) {
        res.status(400);
        res.json({error: "File not found"});
    }
});

app.post(`${API_PREFIX}/configuration`, (req, res) => {
    let fileContent = req.rawBody;

    if(!fileContent) {
        res.status(400);
        res.json({error: "Empty body, try to send plan text or binary data"});
        return
    }

    fs.writeFile(CONFIGURATION_FILE_NAME, fileContent, (err) => {
        if(err) throw err;
        res.json({message: "Configuration file is updated ..."});
    });
});

// MARK: - Listeners
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    log.info(`Listen to port ${PORT}.`);
});

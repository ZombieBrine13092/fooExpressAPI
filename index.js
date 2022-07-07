// import shiz
import express, { text } from 'express';
import https from 'https';
import chalk from 'chalk';
import crypto from 'crypto';
import fs from 'fs';
import yaml from 'js-yaml';
var app = express();

// script version
var version = 4.0;

// error catcher 9000 (can check before config is loaded)
if (!fs.existsSync('./config/config.yml')) {
    console.log('Process terminating: File not found');
    console.log(chalk.italic('./config/config.yml') + ' is not present!')
    process.exit();
}

// load config
console.log('Loading config @ ./config/config.yml');
var config = yaml.load(fs.readFileSync('./config/config.yml', 'utf8'));

// error catcher 2: electric boogaloo (can only check after config is loaded)
if (!fs.existsSync(config.certPath) && !fs.existsSync(config.keyPath)) {
    console.log('Process terminating: Files not found');
    console.log(chalk.italic(config.keyPath) + ' and ' + chalk.italic(config.certPath) + ' are not present!')
    console.log('Change the config to properly define the location of these files.');
    process.exit();
}
if (!fs.existsSync(config.keyPath)) {
    console.log('Process terminating: File not found');
    console.log(chalk.italic(config.keyPath) + ' is not present!')
    console.log('Change the config to properly define the location of this file.');
    process.exit();
}
if (!fs.existsSync(config.certPath)) {
    console.log('Process terminating: File not found');
    console.log(chalk.italic(config.certPath) + ' is not present!')
    console.log('Change the config to properly define the location of this file.');
    process.exit();
}
if (config.version) {
    console.log('WARNING: Config version does not match script version!');
} else {
    console.log('Process terminating: Could not determine config version');
    console.log('This could be caused by an older config that does not specify a version.');
    process.exit();
}

if (config.clearConsoleOnStart == true) {console.clear();} // clear console if config says so

// hash up the management password
var hash = crypto.createHash('md5').update(config.managePassword).digest('hex');

// logger functions
// works only when logging is set to true in the config
// address, code, loc, qLoc, agent
function log(reqData) {
    if (config.logging == false) {return;} // if logging is set to false, don't
    if (config.hideGetFavicon == true && reqData[2] == '/favicon.ico' || reqData[3].includes("favicon.ico") == true) {return;} 
    // ^ if hideGetFavicon is set to true and the request is for the favicon, don't
    if (config.simplifiedLogging == false) {
        console.log(chalk.inverse(reqData[0]) + ' ' + chalk.yellow(reqData[1]) + ' ' + getLoc(reqData) + ' ' + chalk.italic(chalk.gray('(' + reqData[4] + ')')));
    } else if (config.simplifiedLogging == true) {
        console.log(chalk.gray(reqData[0]) + ' ' + getLoc(reqData));
    } else {
        console.log('WARNING: simplifiedLogging is not true or false! Defaulting to false..');
        console.log(chalk.inverse(reqData[0]) + ' ' + chalk.yellow(reqData[1]) + ' ' + getLoc(reqData) + ' ' + chalk.italic(chalk.gray('(' + reqData[4] + ')')));
    }
}
function getLoc(reqData) { // return value based upon hideQueryString in config
    if (config.hideQueryString == true) {
        return reqData[2];
    } else if (config.hideQueryString == false) {
        return reqData[3];
    } else {
        console.log('WARNING: hideQueryString is not true or false! Defaulting to true..')
        return reqData[2];
    }
} // does not include query

// routes
app.get('/', (req, res) => {
    res.status(200).setHeader("Content-Type", "text/plain").send('{"status":"OK"}');
    const reqData = [req.ip, 200, req.path, req.originalUrl, req.get('User-Agent')];
    log(reqData);
});
app.get('/ip', (req, res) => {
    if (req.query.type == 'json') {
        res.status(200).setHeader("Content-Type", "text/plain").send('{"ip":"' + req.ip + '"}');
        var code = 200;
    } else if (req.query.type == 'plaintext') {
        res.status(200).setHeader("Content-Type", "text/plain").send(req.ip);
        var code = 200;
    } else {
        res.sendStatus(400);
        var code = 400;
    }
    const reqData = [req.ip, code, req.path, req.originalUrl, req.get('User-Agent')];
    log(reqData);
});
app.get('/manage', (req, res) => {
    if (req.query.pass !== undefined) {
        if (crypto.createHash('md5').update(req.query.pass).digest('hex') == hash) {
            res.status(200).setHeader("Content-Type", "text/plain").send('foobar management page');
            var code = 200;
            // do management stuff
        } else {
            res.sendStatus(400);
            var code = 400;
        }
    } else {
        res.sendStatus(400);
        var code = 400;
    }
    const reqData = [req.ip, code, req.path, req.originalUrl, req.get('User-Agent')];
    log(reqData);
});
app.get('*', (req, res) => {
    res.sendStatus(404);
    const reqData = [req.ip, 404, req.path, req.originalUrl, req.get('User-Agent')];
    log(reqData);
});

// https.listen on config port
https.createServer(
    {key: fs.readFileSync(String(config.keyPath)),cert: fs.readFileSync(String(config.certPath))},
    app).listen(config.port, config.address);
console.log('Server listening on ' + chalk.inverse(config.address + ':' + config.port));
// log config status
if (config.logging == false) {
    console.log('Logging is disabled');
} else {
    if (config.simplifiedLogging == true) {
        console.log('Simplified Logging is enabled');
    } else {
        console.log('Logging is enabled');
    }
}

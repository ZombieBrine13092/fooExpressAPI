// import shiz
import express from 'express';
import https from 'https';
import chalk from 'chalk';
import crypto from 'crypto';
import fs from 'fs';
import yaml from 'js-yaml';
var app = express();

// script version
var version = 5.0;

// check if config even fuckin exists
if (!fs.existsSync('./config/config.yml')) {
    msgLog('fatal', 'File not found')
    msgLog('fatal', chalk.italic('./config/config.yml') + ' is not present')
    process.exit();
}

// load config
console.log('Loading config @ ./config/config.yml');
var config = yaml.load(fs.readFileSync('./config/config.yml', 'utf8'));

if (config.clearConsoleOnStart == true) {console.clear()} // clear console on start if config says so

// fatal error catcher
if (config.version !== version) { // compare config version and script version
    msgLog('warn', 'Config version does not match script version')
}
if (!fs.existsSync(config.certPath) && !fs.existsSync(config.keyPath)) {
    msgLog('fatal', 'Files not found');
    msgLog('fatal', chalk.italic(config.keyPath) + ' and ' + chalk.italic(config.certPath) + ' are not present!');
    msgLog('fatal', 'Change the config to properly define the location of these files');
    process.exit();
}
if (!fs.existsSync(config.keyPath)) { // check to make sure key exists
    msgLog('fatal', 'File not found');
    msgLog('fatal', chalk.italic(config.keyPath) + ' is not present')
    msgLog('fatal', 'Change the config to properly define the location of this file');
    process.exit();
}
if (!fs.existsSync(config.certPath)) { // check to make sure cert exists
    msgLog('fatal', 'File not found');
    msgLog('fatal', chalk.italic(config.certPath) + ' is not present')
    msgLog('fatal', 'Change the config to properly define the location of this file');
    process.exit();
}

// hash up the management password
var passHash = crypto.createHash('md5').update(config.managePassword).digest('hex');

// logger functions
// works only when logging is set to true in the config
// address, code, loc, qLoc, agent
function log(reqData) {
    if (config.logging == false) {return;} // if logging is set to false, don't
    if (config.hideGetFavicon == true && reqData[2].includes("/favicon.ico")) {return;} // if hideGetFavicon is set to true and the request is for the favicon, don't
    if (config.simplifiedLogging == true) {
        console.log(chalk.gray(getIpAddress(reqData)) + ' ' + getLoc(reqData));
    } else {
        console.log(chalk.inverse(getIpAddress(reqData)) + ' ' + chalk.yellow(reqData[1]) + ' ' + getLoc(reqData) + ' ' + chalk.italic(chalk.gray('(' + getUserAgent(reqData) + ')')));
    }
}
function getLoc(reqData) { // return value based upon hideQueryString in config
    if (config.hideQueryString == false) {
        return reqData[3];
    } else {
        return reqData[2];
    }
} // does not include query
function getIpAddress(reqData) {
    if (config.hideIpAddress == false) {
        return '';
    } else {
        return reqData[0];
    }
}
function getUserAgent(reqData) {
    if (config.hideUserAgent == false) {
        return '';
    } else {
        return reqData[4];
    }
}

// general logging
function msgLog(type, message) {
    if (type == 'info') {
        console.log(chalk.white(chalk.bold('[INFO] ') + message));
        return;
    }
    if (type == 'warn') {
        console.log(chalk.yellow(chalk.bold('[WARN] ') + message));
        return;
    }
    if (type == 'fatal') {
        console.log(chalk.red(chalk.bold('[FATAL] ') + message));
        return;
    }
}

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
        if (crypto.createHash('md5').update(req.query.pass).digest('hex') == passHash) {
            // do management stuff
            // this one is just a proof of concept
            var code = 200;
            res.sendStatus(code);
        } else {
            var code = 400;
            res.sendStatus(code);
        }
    } else {
        var code = 401;
        res.sendStatus(code);
    }
    const reqData = [req.ip, code, req.path, req.originalUrl, req.get('User-Agent')];
    log(reqData);
});
app.get('*', (req, res) => {
    res.sendStatus(404);
    const reqData = [req.ip, 404, req.path, req.originalUrl, req.get('User-Agent')];
    log(reqData);
});

https.createServer( // https.listen on config port
    {key: fs.readFileSync(String(config.keyPath)),cert: fs.readFileSync(String(config.certPath))},
    app).listen(config.port, config.address);
msgLog('info', 'Server listening on ' + chalk.bold(config.address + ':' + config.port));
// log config status
if (config.logging == false) {
    msgLog('info', 'Logging is ' + chalk.italic('disabled'));
} else if (config.logging == true) {
    if (config.simplifiedLogging == true) {
        msgLog('info', 'Simplified Logging is ' + chalk.italic('enabled'));
    } else {
        msgLog('info', 'Logging is ' + chalk.italic('enabled'));
    }
}

// boolean config checks
if (config.logging !== true && config.logging !== false) {
    msgLog('warn', 'logging is neither true nor false, defaulting to true..');
}
if (config.simplifiedLogging !== true && config.simplifiedLogging !== false) {
    msgLog('warn', 'simplifiedLogging is neither true nor false, defaulting to false..');
}
if (config.hideGetFavicon !== true && config.hideGetFavicon !== false) {
    msgLog('warn', 'hideGetFavicon is neither true nor false, defaulting to false..');
}
if (config.hideQueryString !== true && config.hideQueryString !== false) {
    msgLog('warn', 'hideQueryString is neither true nor false, defaulting to true..');
}
if (config.clearConsoleOnStart !== true && config.clearConsoleOnStart !== false) {
    msgLog('warn', 'clearConsoleOnStart is neither true nor false, defaulting to true..');
}
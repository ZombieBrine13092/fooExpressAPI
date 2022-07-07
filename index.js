// import shiz
import express from 'express';
import https from 'https';
import chalk from 'chalk';
import crypto from 'crypto';
import fs from 'fs';
import yaml from 'js-yaml';
var app = express();
// load config
console.log('Loading config @ ./config/config.yml');
var config = yaml.load(fs.readFileSync('./config/config.yml', 'utf8'));

// hash up the management password
var hash = crypto.createHash('md5').update(config.managePassword).digest('hex');

// simpl logger
function log(loc, address, code, agent) {
    if (config.logging == true && config.simple == false) {
        console.log(chalk.bgWhite(address) + ' ' + chalk.yellow(code) + ' ' + loc + ' ' + chalk.italic(chalk.gray('(' + agent + ')')));
    } else if (config.logging == true && config.simple == true) {
        console.log(chalk.gray(address) +  ' ' + loc);
    } else if (config.logging == false) {
        return;
    }
}

// routes
app.get('/', (req, res) => {
    res.statusCode = 200;
    var code = 200;
    res.setHeader("Content-Type", "text/plain");
    res.send('Hello world!');
    var address = req.ip;
    var mount = req.path;
    var agent = req.get('User-Agent');
    log(mount, address, code, agent);
});
app.get('/manage', (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    if (req.query.pass !== undefined) {
        if (crypto.createHash('md5').update(req.query.pass).digest('hex') == hash) {
            res.send('200 OK');
            var code = 200;
            res.statusCode = 200;
        } else {
            res.send('401 Unauthorized');
            var code = 401;
            res.statusCode = 401;
        }
    } else {
        res.send('401 Unauthorized');
        var code = 401;
        res.statusCode = 401;
    }
    var address = req.ip;
    var mount = req.path;
    var agent = req.get('User-Agent');
    log(mount, address, code, agent);
});
app.get('/favicon.ico', (req, res) => {
    res.statusCode = 200;
    var code = 200;
    res.setHeader("Content-Type", "image/x-icon");
    res.send(fs.readFileSync('./favicon.ico'));
    var address = req.ip;
    var mount = req.path;
    var agent = req.get('User-Agent');
    log(mount, address, code, agent);
});
app.get('*', (req, res) => {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.send('404 Not found');
    var address = req.ip;
    var code = 404;
    var mount = req.path;
    var agent = req.get('User-Agent');
    log(mount, address, code, agent);
});

// https.listen on config port
https.createServer(
    {key: fs.readFileSync('./config/key.pem'),cert: fs.readFileSync('./config/cert.pem')},app
    ).listen(config.port, config.address);
console.log('Server listening on ' + chalk.bgWhite(config.address + ':' + config.port + ''));
// log config
if (config.logging == false) {
    console.log('Logging is disabled');
} else {
    if (config.simple == true) {
        console.log('Simple logging is enabled');
    } else {
        console.log('Logging is enabled');
    }
}
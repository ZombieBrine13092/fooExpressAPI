# fooExpressAPI
working express API to clone

you have no reason to use it

## getting a cert for https
[Certbot](https://certbot.eff.org/)

Give the CLI app the domain, email, select a temporary webserver,

ensure that you can access the temporary webserver via the domain on port 443,

put fullchain.pem and privkey.pem into ./config/,

then rename them to the filenames in the config or modify the config to point to the files certbot produced.

## running that shiz
```
npm install && npm run start
```

## how do i config????
use that monkey brain of yours to read the yaml keys

and make an estimated guess at what they do

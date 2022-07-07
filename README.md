# fooExpressAPI
working express API to clone
you have no reason to use it

## getting a cert for https
[Certbot](https://certbot.eff.org/)
give the CLI app the domain, email, select a temporary webserver,
then put fullchain.pem and privkey.pem into /config/
**Rename fullchain.pem to cert.pem
and privkey.pem to key.pem**
i may fix this using the config later so it won't be so strict with filenames
but yknow /shrug

## running that shiz
```
node .\index.js
```

## how do i config????
use that monkey brain of yours to read the yaml keys
and make an estimated guess at what they do

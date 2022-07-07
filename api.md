# API Usage
While this API is mostly for my own personal use, I thought it could be useful to anyone.

The content type of any response will be `text/plain` unless specified.

## /
Returns a JSON block with the server status.
  Will always be the same unless the server is.. well, offline.

Request
```
/
```
Response
```
{"status":"OK"}
```

## /ip
Returns the address of the IPv4 host that made the request.
  Query `?type=` to specify the type of response.
  This can be either `json` or `plaintext`.

Example Request
```
/ip?type=json
```
Example Response
```
{"ip":"1.1.1.1"}
```

## /manage
A proof of concept for returning something when provided with the correct passphrase.

Example Request
```
/manage?pass=changeme
```
Example Response
```
foobar management page
```

The default passphrase as defined in the config is `changeme`.
  The default response as defined in the script is `foobar management page`.
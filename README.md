# thisdb-js-sdk

[![Latest Version](https://img.shields.io/github/release/thisdb/thisdb-js-sdk.svg?style=flat-square)](https://github.com/thisdb/thisdb-js-sdk/releases)

Official JS SDK for ThisDB

Website and documentation: https://www.thisdb.com

The cloud key/value database built from the ground up for serverless applications. It's fast, secure, cost effective, and is easy to integrate.

```
var thisDB = new ThisDB('<your-api-key>');

thisDB.get('<your-bucket>', '<your-key>', function(response) {
  alert(response);
});
```

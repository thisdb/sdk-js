# ThisDB JS SDK

[![Latest Version](https://img.shields.io/github/release/thisdb/sdk-js.svg?style=flat-square)](https://github.com/thisdb/sdk-js/releases)

Official ThisDB SDK for Javascript

Website and documentation: https://www.thisdb.com

The cloud key/value database built from the ground up for serverless applications. It's fast, secure, cost effective, and is easy to integrate.

```javascript
var thisDB = new ThisDB({ apiKey: '<your-api-key>' });

thisDB.get({ bucket: '<your-bucket>', key: '<your-key>' }, function(response) {
  alert(response);
});
```

## Installation

To use the SDK in the browser, simply add the following script tag to your HTML pages:

```
<script type="text/javascript" src="https://cdn.thisdb.com/sdk/js/0.1.0/thisdb.min.js"></script>
```

var ThisDB = function(apiKey, keyType) {
  keyType = keyType || "Api-Key";

  var endpoint = 'https://api.thisdb.com/v1/';
  var version = '1.0.0';

  var formatParams = function(params){
    if (params === "" || typeof params === 'undefined') {
      return "";
    }
    return "?" + Object
          .keys(params)
          .map(function(key){
            return key+"="+encodeURIComponent(params[key])
          })
          .join("&")
  };

  var serialise = function(obj) {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  };

  this.createToken = function(bucket, prefix, permissions, ttl, cb) {
    cb = cb || function(){};

    var args = {
      bucket: bucket,
      prefix: prefix,
      permissions: permissions,
      ttl: ttl
    };

    this.query("POST", "tokens", args, cb);
  };

  this.get = function(bucket, key, cb) {
    cb = cb || function(){};

    this.query("GET", bucket + "/" + key, "", cb);
  };

  this.set = function(bucket, key, value, cb) {
    cb = cb || function(){};
    this.query("POST", bucket + "/" + key, value, cb);
  };

  this.increment = function(bucket, key, value, cb) {
    cb = cb || function(){};
    this.query("PATCH", bucket + "/" + key, value, cb);
  };

  this.delete = function(bucket, key, cb) {
    cb = cb || function(){};
    this.query("DELETE", bucket+ "/" + key, "", cb);
  };

  this.createBucket = function(cb) {
    cb = cb || function(){};
    this.query("POST", "", "", cb);
  };

  this.listBucket = function(bucket, format, cb) {
    cb = cb || function(){};
    format = format || 'text';

    var args = { format: format };

    this.query("GET", bucket, args, cb);
  };

  this.updateBucket = function(bucket, defaultTTL, cb) {
    cb = cb || function(){};
    var args = { default_ttl: defaultTTL };

    this.query("PATCH", bucket, args, cb);
  };

  this.deleteBucket = function(bucket, cb) {
    cb = cb || function(){};
    this.query("DELETE", bucket, "", cb);
  };

  this.query = function(method, url, args, cb) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState === 4) {
        switch(anHttpRequest.status) {
          case 200:
            cb(anHttpRequest.responseText);
            break;
          case 404:
            throw new ResourceNotFoundError(anHttpRequest.responseText);
            break;
          default:
            throw new Error(anHttpRequest.responseText);
        }
      }
    }
    switch(method) {
      case "GET":
        var fullURL = endpoint + url + formatParams(args);
        anHttpRequest.open("GET", fullURL, true);
        anHttpRequest.setRequestHeader("X-" + keyType, apiKey);
        anHttpRequest.send(null);
        break;
      case "POST":
        var fullURL = endpoint + url;
        anHttpRequest.open("POST", fullURL, true);
        anHttpRequest.setRequestHeader("X-" + keyType, apiKey);
        if (typeof args === 'object') {
          args = serialise(args);
          anHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        anHttpRequest.send(args);
        break;
      case "PATCH":
        var fullURL = endpoint + url;
        anHttpRequest.open("PATCH", fullURL, true);
        anHttpRequest.setRequestHeader("X-" + keyType, apiKey);
        if (typeof args === 'object') {
          args = serialise(args);
          anHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        anHttpRequest.send(args);
        break;
      case "DELETE":
        var fullURL = endpoint + url;
        anHttpRequest.open("DELETE", fullURL, true);
        anHttpRequest.setRequestHeader("X-" + keyType, apiKey);
        if (typeof args === 'object') {
          args = serialise(args);
          anHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        anHttpRequest.send(args);
        break;
      default:
        // code block
    }
  };
};
function ResourceNotFoundError() {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'ResourceNotFoundError';
    this.message = temp.message;
    if(Object.defineProperty) {
        // getter for more optimizy goodness
        /*this.stack = */Object.defineProperty(this, 'stack', {
            get: function() {
                return temp.stack
            },
            configurable: true // so you can change it if you want
        })
    } else {
        this.stack = temp.stack
    }
}
//inherit prototype using ECMAScript 5 (IE 9+)
ResourceNotFoundError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: ResourceNotFoundError,
        writable: true,
        configurable: true
    }
});
var ThisDB = function(initArgs) {
  var apiKey = initArgs.apiKey || "";
  var token = initArgs.token || "";
  var defaultResponseFormat = initArgs.defaultResponseFormat || 'text';

  var endpoint = 'https://api.thisdb.com/v1/';
  var version = '0.1.1';

  var headerMap = {};

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

  this.createToken = function(args, cb) {
    cb = cb || function(){};

    var inputArgs = {
      bucket: args.bucket,
      prefix: args.prefix,
      permissions: args.permissions,
      ttl: args.ttl
    };

    this.query("POST", "tokens", inputArgs, false, cb);
  };

  this.get = function(args, cb) {
    cb = cb || function(){};

    if (args.format) {
      var inputArgs = { format: args.format };
    } else {
      var inputArgs = "";
    }

    this.query("GET", args.bucket + "/" + args.key, inputArgs, false, cb);
  };

  this.set = function(args, cb) {
    cb = cb || function(){};
    this.query("POST", args.bucket + "/" + args.key, args.value, true, cb);
  };

  this.increment = function(args, cb) {
    cb = cb || function(){};
    this.query("PATCH", args.bucket + "/" + args.key, args.value, false, cb);
  };

  this.delete = function(args, cb) {
    cb = cb || function(){};
    this.query("DELETE", args.bucket + "/" + args.key, "", true, cb);
  };

  this.createBucket = function(args, cb) {
    cb = cb || function(){};

    if (args.defaultTTL) {
      var inputArgs = { default_ttl: args.defaultTTL };
    } else {
      var inputArgs = "";
    }

    this.query("POST", "", inputArgs, false, cb);
  };

  this.listBucket = function(args, cb) {
    cb = cb || function(){};

    var bucket = args.bucket;
    delete args.bucket;

    if (!isEmpty(args)) {
      var inputArgs = args;
    } else {
      var inputArgs = "";
    }

    this.query("GET", bucket, inputArgs, false, cb);
  };

  this.updateBucket = function(args, cb) {
    cb = cb || function(){};
    
    if (args.defaultTTL) {
      var inputArgs = { default_ttl: args.defaultTTL };
    } else {
      var inputArgs = "";
    }

    this.query("PATCH", args.bucket, inputArgs, true, cb);
  };

  this.deleteBucket = function(args, cb) {
    cb = cb || function(){};
    this.query("DELETE", args.bucket, "", true, cb);
  };

  this.query = function(method, url, args, returnBool, cb) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if(anHttpRequest.readyState == anHttpRequest.HEADERS_RECEIVED) {
        var headers = anHttpRequest.getAllResponseHeaders();
        var arr = headers.trim().split(/[\r\n]+/);
        arr.forEach(function (line) {
          var parts = line.split(': ');
          var header = parts.shift();
          var value = parts.join(': ');
          headerMap[header] = value;
        });
      }
      if (anHttpRequest.readyState === 4) {
        // If response is JSON, decode
        if (headerMap['content-type'].includes('application/json')) {
          var response = JSON.parse(anHttpRequest.responseText);
        } else {
          var response = anHttpRequest.responseText;
        }
        switch(anHttpRequest.status) {
          case 200:
            (returnBool) ? cb(true) : cb(response);
            break;
          case 404:
            throw new ResourceNotFoundError(response);
            break;
          default:
            throw new Error(response);
        }
      }
    }

    switch(method) {
      case "GET":
        var fullURL = endpoint + url + formatParams(args);
        anHttpRequest.open("GET", fullURL, true);
        break;
      case "POST":
        var fullURL = endpoint + url;
        anHttpRequest.open("POST", fullURL, true);
        break;
      case "PATCH":
        var fullURL = endpoint + url;
        anHttpRequest.open("PATCH", fullURL, true);
        break;
      case "DELETE":
        var fullURL = endpoint + url;
        anHttpRequest.open("DELETE", fullURL, true);
        break;
      default:
        // code block
    }

    if (initArgs.apiKey) {
      anHttpRequest.setRequestHeader("X-Api-Key", apiKey);
    } else {
      anHttpRequest.setRequestHeader("X-Token", token);
    }

    if (defaultResponseFormat !== "text") {
      if (defaultResponseFormat === "json") {
        anHttpRequest.setRequestHeader("Accept", "application/json");
      }
    }

    if (typeof args === 'object') {
      args = serialise(args);
      anHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }

    if (method === "GET") {
      anHttpRequest.send(null);
    } else {
      anHttpRequest.send(args);
    }
  };
};
function isEmpty(map) {
  for(var key in map) {
    if (map.hasOwnProperty(key)) {
       return false;
    }
  }
  return true;
}
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
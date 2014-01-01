   /**
 * Attribute definition for: ERROR-CODE
 */

var utils = require('./utils')
  , btools = require('buffertools'); 

exports.type = 0x0009; 
exports.name = 'ErrorCode';         

exports.encode = function (code, fn) {
    if('undefined' === typeof utils.errors[code]){
        throw "NOPE"; 
    }
    var b = new Buffer(4); 

    b.fill(0, 0, 1)
    b[2] = '0x'+(parseInt(code.charAt(0)).toString()); 
    b[3] = code.substr(1);
    b.write(utils.errors[code], 4, 'utf8'); 
    var c = new Buffer(utils.errors[code]); 
    c.write(utils.errors[code]); 
    
    var rval = btools.concat(b, c); 
    fn(utils.tlv_encode(this.type, rval.length, rval)); 
} 

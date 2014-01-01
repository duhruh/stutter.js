/**
 * Attribute definition for: UNKNOWN-ATTRIBUTES
 */
var utils = require('./utils'); 

exports.type = 0x000A; 
exports.name = 'UnknownAttributes';

exports.encode = function (arr) {
    var b = new Buffer(2*arr.length); 
    var pointer = 0; 
    for(var i = 0;  i < arr.length; i++){
        var a = b.write(arr[i], pointer, pointer+2, 'utf8'); 
        pointer += a; 
    }    
    return utils.tlv_encode(attributes.UNKNOWN-ATTRIBUTES, b.length, b); 
} 

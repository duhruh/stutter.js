/**
 * Attribute definition for: USERNAME
 */
var utils = require('./utils'); 

exports.type = 0x0006; 
exports.name = 'Username';

exports.encode = function (str, fn) {
    //TODO:probably should run SASLprep here
    var b = new Buffer(str); 
    fn(utils.tlv_encode(this.type, b.length, b)); 
} 
exports.decode = function (value, fn){
    fn(value.toString()); 
}

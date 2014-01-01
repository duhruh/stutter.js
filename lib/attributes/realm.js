/**
 * Attribute definition for: REALM
 */

var utils = require('./utils'); 

exports.type = 0x0014; 
exports.name = 'Realm';         

exports.encode = function (str, fn) {
    //NEED TO SASLprep
    var b = new Buffer(str); 
    fn(utils.tlv_encode(this.type, b.length, b)); 
}
exports.decode = function (value, fn){
    fn(value.toString()); 
}

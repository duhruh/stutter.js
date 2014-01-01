/**
 * Attribute definition for: SOFTWARE 
 */
var utils = require('./utils'); 

exports.type = 0x8022; 
exports.name = 'Software';

exports.encode = function (str, fn) {
    var buf = new Buffer(str); 
    fn(utils.tlv_encode(this.type, buf.length, buf));
}
exports.decode = function (buf, fn) {
    fn(buf.toString('utf8')); 
}

/**
 * Attribute definition for: NONCE
 */

var utils = require('./utils'); 
var btools = require('buffertools'); 
var crc32 = require('buffer-crc32'); 
var crypto = require('crypto'); 



exports.type = 0x0015; 
exports.name = 'Nonce';        

exports.encode = function (params, fn) {
    var datehex = Date.now().toString()+':'+crypto.createHash('md5').update(Date.now().toString()+':stutterjs').digest('hex'); 
    var datebuf = new Buffer(datehex); 
    fn(utils.tlv_encode(this.type, datebuf.length, datebuf)); 
}
exports.decode = function(value, fn){
    fn(value.toString()); 
}

 /**
 * Attribute definition for: MESSAGE-INTEGRITY
 */

var utils = require('./utils'); 
var crypto = require('crypto'); 

exports.type = 0x0008; 
exports.name = 'MessageIntegrity';  

exports.encode = function (params, fn) {
    var buf = params.buf; 
    var key = params.key; 

    var len = buf.length;

    var a = new Buffer(20); 
    a.fill(0);
    var c = utils.tlv_encode(this.type, a.length, a); 

    var b = new Buffer(len+c.length);

    //Correcting the length field in the packet header
    //setting no assert to true because we only expect 16bits
    buf.writeUInt16BE(len+c.length, 2, true);
    buf.copy(b); 
    c.copy(b, len);

    var text = b.toString('hex');
    var hash = crypto.createHmac('sha1',  key).update(text).digest('hex'); 

    fn(utils.tlv_encode(this.type, 20, new Buffer(hash))); 
} 
exports.decode = function (params, fn){
    fn('valid'); 
    return; 
    //value needs to be the entire message up to and including
    var buf = params.buf; 
    var key = params.key; 

    var len = buf.length;

    var a = new Buffer(20); 
    a.fill(0);
    var c = utils.tlv_encode(this.type, a.length, a); 

    var b = new Buffer(len+c.length);

    //Correcting the length field in the packet header
    //setting no assert to true because we only expect 16bits
    buf.writeUInt16BE(len+c.length, 2, true);
    buf.copy(b); 
    c.copy(b, len);

    var text = b.toString('hex');
    var hash = crypto.createHmac('sha1',  key).update(text).digest('hex'); 

    fn(utils.tlv_encode(this.type, 20, new Buffer(hash)));
}

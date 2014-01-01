/**
 * Attribute definition for: FINGERPRINT
 */

var utils = require('./utils')
  , crc32 = require('buffer-crc32'); 


exports.type = 0x8028; 
exports.name = 'Fingerprint';         

exports.encode = function (buf, fn) {
    var len = buf.length; 

    var temp = new Buffer(4); 
    temp.fill(0); 
    var tlv_temp = utils.tlv_encode(this.type, temp.length, temp); 

    var dummy = new Buffer(len+tlv_temp.length); 

    //Correcting the length field in the packet header
    //setting no assert to true because we only expect 16bits
    buf.writeUInt16BE(len+tlv_temp.length, 2, true);

    buf.copy(dummy); 
    tlv_temp.copy(dummy, len); 

    var crc = crc32(dummy); 
    var r = parseInt(crc.toString('hex'), 16) ^ 0x5354554e; 

    var rval = new Buffer(4); 
    rval.writeUInt32BE(r); 

    fn(utils.tlv_encode(this.type, 4, rval)); 
}
exports.decode = function (buf, finger, fn){
    var len = buf.length; 

    var temp = new Buffer(4); 
    temp.fil(0); 
    var tlv_temp = utils.tlv_encode(this.type, temp.length, temp); 

    var dummy = new Buffer(len+tlv_temp.length); 

    buf.writeUInt16BE(len+tlv_temp.length, 2, true); 

    buf.copy(dummy); 
    tlv_temp.copy(dummy, len); 

    var crc = crc32(dummy); 
    var r = parseInt(crc.toString('hex'), 16) ^ 0x5354554e;

    if(r == parseInt(finger.toString('hex'), 16)){
        fn({'fingerprint':fingerprint, 
                'valid':true}); 
    }else{
         fn({'fingerprint':fingerprint, 
                'valid':false}); 
    }
}

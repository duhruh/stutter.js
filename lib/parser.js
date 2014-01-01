var MAGIC_COOKIE = 0x2112A442
  , ZEROS = 0x00; 
var btools = require('buffertools')

var binding = {
        'request':0x0001,
        'indication':0x0011, 
        'success':0x0101, 
        'error':0x0111
    }; 
var utils = require('./utils'); 
var Attributes =require('./attributes'); 

exports.Attributes; 


exports.decodePacket = function(protocol, packet){
    switch (protocol){
        case 'stun':
            return {header: this.decodeHeader(packet), 
                    attributes:this.decodeAttributes(packet.slice(20))}; 
        break; 
        case 'turn':
        break; 
        default:
            throw 'not a valid protocol stun|turn'; 
        break; 
    }
} 
exports.decodeHeader = function(packet){
    var zeros = packet.slice(0, 1)
      , message_type = packet.slice(0, 2)
      , message_length = packet.slice(2, 4)
      , magic_cookie = packet.slice(4, 8)
      , transaction_id = packet.slice(8, 20); 
    
    //TODO: need to find all methods!
    if(!zeros.equals(ZEROS.toString()) &&
       !magic_cookie.equals(MAGIC_COOKIE.toString()) &&
       message_length.toString('hex') < 0 &&
       !utils.find(message_type.toString('hex'), binding)){

        //the message is "silently" discarded
        console.log("  udp4  |  discarding packet, Not a STUN packet"); 
        throw "Not a STUN packet"; 
    }else{
        return {
            'zeros':zeros, 
            'message_type':message_type, 
            'message_length':message_length, 
            'magic_cookie':magic_cookie, 
            'transaction_id':transaction_id, 
            'error':null
        }
    }
}
exports.decodeAttributes = function(attributes){
    if(attributes.length){
        return Attributes.decode(attributes); 
    }
}
exports.encodePacket = function(packet){
    // Base header stuff
    var header = new Buffer(20); 
    header.writeUInt16BE(binding.success, 0); 
    header.writeUInt32BE(MAGIC_COOKIE, 4)
    packet.header.transaction_id.copy(header, 8, 0, packet.header.transaction_id.length);

    var fingerprint = packet.attributes.fingerprint
      , message_integrity = packet.attributes.message_integrity; 

    if('undefined' != typeof fingerprint){delete(packet.attributes.fingerprint)}; 
    if('undefined' != typeof message_integrity){delete(packet.attributes.message_integrity)}; 

    var attr = []; 
    console.log(packet); 
    for(var k in packet.attributes){
        if(!packet.attributes.hasOwnProperty(k)) continue; 
        Attributes.encode(k, packet.attributes[k], function(obj){
            attr.push(obj); 
        }); 
    }
 
    // Fix the header length field
    header.writeUInt16BE(utils.bufferLength(attr), 2, true);

    if(message_integrity){
        message_integrity.buf = btools.concat(header, Buffer.concat(attr)) 
        attributes.encode('MessageIntegrity', message_integrity, function(obj){
            attr.push(obj); 
        }); 
        header.writeUInt16BE(utils.bufferLength(attr), 2, true);
    }
    if(fingerprint){
        fingerprint.buf = btools.concat(header, Buffer.concat(attr)); 
        attributes.encode('Fingerprint', btools.concat(header, Buffer.concat(attr)), function(obj){
            attr.push(obj); 
        }); 
        header.writeUInt16BE(utils.bufferLength(attr), 2, true);
    }
    return btools.concat(header, Buffer.concat(attr)); 
}

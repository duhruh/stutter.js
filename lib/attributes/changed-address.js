/**
 * Attribute definition for: CHANGED-ADDRESS
 */

var utils = require('./utils'); 

exports.type = 0x0005; 
exports.name = 'ChangedAddress';        

exports.encode = function (taddress) {
     var buf = new Buffer(8); 

    buf.writeUInt8(0x00, 0);

    taddress.family == 'IPv4' ? buf.writeUInt8(utils.IP.v4, 1) : buf.writeUInt8(utils.IP.v6, 1); 
    buf.writeUInt16BE(taddress.port, 2); 

    var ip = taddress.address.split('.'); 
    buf.writeUInt8(ip[0], 4); 
    buf.writeUInt8(ip[1], 5); 
    buf.writeUInt8(ip[2], 6); 
    buf.writeUInt8(ip[3], 7); 

    return utils.tlv_encode(attributes.changed_address, buf.length, buf);           
}
exports.decode = function (buf, fn) {
    console.log(buf); 
     var zeros = buf[0]
       , family = 'unknown'
       , port = buf.slice(2, 4)
       , xaddress = buf.slice(4)
       , address = (xaddress[0]) +'.'+
                   (xaddress[1]).toString() +'.'+
                   (xaddress[2]).toString() +'.'+
                   (xaddress[3]).toString(); 

     if(buf[1] == 1){
        family = 'IPv4'
     }else if(buf[1] == 0){
        family = 'IPv6'
     }

     fn({zeros: zeros,
         family: family, 
         port: parseInt(port.toString('hex'), 16), 
         address: address});
}

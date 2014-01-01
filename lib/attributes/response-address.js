/**
 * Attribute definition for: RESPONSE-ADDRESS
 */

var utils = require('./utils'); 

exports.type = 0x0002; 
exports.name = 'ResponseAddress';          

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

    return utilstlv_encode(attributes.response_address, buf.length, buf);        
}

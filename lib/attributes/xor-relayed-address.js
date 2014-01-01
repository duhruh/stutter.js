var utils = require('./utils'); 

exports.type = 0x0016; 
exports.name = 'xorRelayedAddress'; 

exports.encode = function(taddress, fn){
    var buf = new Buffer(8); 

    buf.writeUInt8(0x00, 0);

    taddress.family === 'IPv4' ? buf.writeUInt8(utils.IP.v4, 1) : buf.writeUInt8(utils.IP.v6, 1);

    buf.writeUInt16BE(taddress.port ^ 0x2112, 2); 

    var ip = taddress.address.split('.'); 
    buf.writeUInt8(ip[0] ^ 0x21, 4); 
    buf.writeUInt8(ip[1] ^ 0x12, 5); 
    buf.writeUInt8(ip[2] ^ 0xA4, 6); 
    buf.writeUInt8(ip[3] ^ 0x42, 7); 

    fn(utils.tlv_encode(this.type, buf.length, buf));        
}
exports.decode = function(buf, fn){
     var zeros = buf[0]
       , family = 'unknown'
       , xport = buf.slice(2, 4)
       , xaddress = buf.slice(4)
       , address = (xaddress[0] ^ 0x21) +'.'+
                   (xaddress[1] ^ 0x12).toString() +'.'+
                   (xaddress[2] ^ 0xA4).toString() +'.'+
                   (xaddress[3] ^ 0x42).toString(); 

     if(buf[1] == 1){
        family = 'IPv4'
     }else if(buf[1] == 0){
        family = 'IPv6'
     }

     fn({zeros: zeros,
         family: family, 
         xport:xport.toString('hex'), 
         xaddress: xaddress.toString('hex'), 
         port: '0x'+xport.toString('hex') ^ 0x2112, 
         address: address}); 
}

var utils = require('./utils'); 

exports.type = 0x0019; 
exports.name = 'RequestedTransport'; 

exports.encode = function(protocol, fn){
    var buf = new Buffer(4); 
    buf[0] = utils.pnumbers[protocol]; 
    buf.fill(0x00, 1); 
    fn(utils.tlv_encode(this.type, buf.length, buf)); 
}
exports.decode = function(buf, fn){
    var key = utils.find(buf[0], utils.pnumbers); 
    
   fn({'transport':key, 'rffu':0x000000}) 
}

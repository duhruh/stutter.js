var utils = require('./utils'); 

exports.type = 0x000C; 
exports.name = 'ChannelNumber'; 

exports.encode = function(channel, fn){
    var buf = new Buffer(4); 
    buf.writeUInt16BE(channel, 0); 
    buf.writeUInt16BE(0x0000, 2); 
    fn(utils.tlv_encode(this.type, buf.length, buf)); 
}
exports.decode = function(buf, fn){
    fn({
        'channel':buf.readUInt16BE(0), 
        'rffu':buf.readUInt16BE(2) 
    }); 
}


var utils = require('./utils'); 

exports.type = 0x000D; 
exports.name = 'Lifetime'; 
exports.encode = function(lifetime, fn){
    var buf = new Buffer(lifetime.toString(16)); 
    //buf.writeUInt32BE(lifetime); 
    fn(utils.tlv_encode(this.type, buf.length, buf)); 
}
exports.decode = function(buf, fn){
    fn({'duration':buf.readUInt32BE(0)}); 
}


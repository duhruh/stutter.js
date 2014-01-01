var utils = require('./utils'); 

exports.type = 0x001A; 
exports.name = 'DontFragment'; 
exports.encode = function(nope, fn){
    fn(utils.tlv_encode(this.type, 0, new Buffer(0))); 
}
exports.decode = function(value, fn){
    fn({df:true}); 
}

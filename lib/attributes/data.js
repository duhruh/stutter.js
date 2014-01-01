var utils = require('./utils'); 

exports.type = 0x0013;
exports.name = 'Data'; 
exports.encode = function(data, fn){
    fn(utils.tlv_encode(this.type, data.length, data)); 
}
exports.decode = function(data, fn){
    fn(data); 
}


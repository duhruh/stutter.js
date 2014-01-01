var utils = require('./utils'); 

exports.type = 0x0022; 
exports.name = 'ReservationToken'; 
exports.encode = function(token, fn){
    var buf = new Buffer(token, 'hex'); 
    fn(utils.tlv_encode(this.type, buf.length, buf)); 
}
exports.decode = function(value, fn){
    var token = value.toString(); 
    fn({token:token}); 
}


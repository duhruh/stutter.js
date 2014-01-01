exports.type = 0x0018; 
exports.name = 'EvenPort'; 
exports.encode = function(high, fn){
    var buf = new Buffer(1);

    if(high == 1){
         buf[0] = 0x80; 
    }else{
        buf[0] = 0x00; 
    }

    fn(utils.tlv_encode(this.type, buf.length, buf)); 
}
exports.decode = function(buf, fn){
    var rffu; 
    if(buf[0] == 0x00 || buf[0] == 0x80){
        rffu = 0; 
    }
    fn({
        'reserve':buf[0], 
        'rffu':rffu
    }); 
}

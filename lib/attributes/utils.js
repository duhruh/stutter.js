exports.errors = {
    300: 'Try Alternate', 
    400: 'Bad Request', 
    401: 'Unauthorized', 
    403: 'Forbidden', 
    420: 'Unknown Attribute', 
    437: 'Allocation Mismatch', 
    438: 'Stale Nounce', 
    441: 'Wrong Credentials', 
    442: 'Unsupported Transport Protocol', 
    486: 'Allocation Quota Reached', 
    500: 'Server Error', 
    508: 'Insufficient Capacity'
}; 
exports.pnumbers = {
    upd:0x11
}; 

exports.IP = {
    v4: 0x01, 
    v6: 0x02   
}
exports.tlv_encode = function(type, length, value){
    var val = this.padBuffer(value); 

    var buf = new Buffer(4+val.length); 
    buf.writeUInt16BE(type, 0); 
    buf.writeUInt16BE(length, 2); 
    val.copy(buf, 4); 
    return buf;
} 

exports.find = function (needle,hay) {
    for (var k in hay) {
        if (!hay.hasOwnProperty(k)) continue;
        if (hay[k] === needle) {
            return k; //true
        }
    }
    return false;
}
exports.findObjectInArray = function (needle, hay, key) {
    for (var k in hay) {
        if(!hay.hasOwnProperty(k)) continue; 
        if(hay[k][key] == needle){
            return k; 
        }
    }
    return false; 
}
exports.padBuffer = function (buf){
    if(buf.length%4 != 0){
        var b = new Buffer(4-buf.length%4); 
        b.fill(0x00);
        return Buffer.concat([buf, b]); 
    }else { return buf; }
}

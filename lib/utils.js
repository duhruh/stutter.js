exports.find = function (needle, hay) {
    for (var k in hay) {
        if (!hay.hasOwnProperty(k)) continue;
        if (hay[k] === needle) {
            return true;
        }
    }
    return false;
}
exports.bufferLength = function (attr) {
    var len = 0; 
    for (var k in attr) {
        if (!attr.hasOwnProperty(k)) continue; 
        len += attr[k].length; 
    }
    return len; 
}
exports.findObjectInArray = function (needle, hay) {
    for (var k in hay) {
        if(!hay.hasOwnProperty(k)) continue; 
        if('undefined' != typeof hay[k][needle]){
            return k; 
        }
    }
    return false; 
}
exports.padBuffer = function (buf){
    if(buf.length%4 != 0){
        var b = new Buffer(buf.length%4); 
        b.fill('0');
        return Buffer.concat([buf, a]); 
    }else { return buf; }
}

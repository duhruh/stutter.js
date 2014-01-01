module.exports = function(binding transaction_id){
    var header = new Buffer(20); 
    header.writeUInt16BE(binding, 0); 
    header.writeUInt32BE(0x2112A442, 4)
    transaction_id.copy(header, 8, 0, transaction_id.length);

    return header; 
}

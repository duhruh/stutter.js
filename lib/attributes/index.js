/**
 * Module dependencies
 */
var fs = require('fs')
  , attr = []
  , utils = require('./utils'); 

/**
 * Requires all attributes
 */
//__dirname = '/home/david/Documents/code/Javascript/stutterjs'; 
fs.readdirSync(__dirname).forEach(function(file){
    if(!~['index.js', 'utils.js'].indexOf(file)){
        var obj = require('./'+file);
        attr.push(obj); 
    }
});


exports.decode = function(bytes){
    var pointer = 0; 
    var packet = {}
    while(pointer < bytes.length){
        var type = bytes.slice(pointer, pointer+2); 
        var length = bytes.slice(pointer+2, pointer+4); 
        var value = bytes.slice(pointer+4, pointer+length.readUInt16BE(0)+4); 
        var padding = 0; 

        if(length.readUInt16BE(0)%4 != 0){
            padding = 4-length.readUInt16BE(0)%4; 
        }

        var index = utils.findObjectInArray(type.readUInt16BE(0), attr, 'type'); 

        if('string' === typeof index){
                attr[index].decode(value, function(obj){
                packet[attr[index].name] = obj; 
            }); 
        }
 
        pointer += (4 +value.length)+padding;
    }
    return packet; 
}

exports.encode = function(attribute, params, fn){
      var index = utils.findObjectInArray(attribute, attr, 'name'); 
    attr[index].encode(params, fn)
}

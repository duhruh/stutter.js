
/**
 * Module dependencies
 */
var btools = require('buffertools')
  , Attributes = require('./attributes')
  , parser = require('./parser') 
  , utils = require('./utils'); 


var methods = {
    'binding':{
        'request':0x0001,
        'indication':0x0011, 
        'success':0x0101, 
        'error':0x0111
    }, 
    'allocate':{
        'request':0x0003, 
        'success':0x0103, 
        'error':0x0113
    }, 
    'refresh':{
        'request':0x0004, 
        'success':0x0104, 
        'error':0x0114
    }, 
    'send':{
        'indication':0x0016
    }, 
    'data':{
        'indication':0x0017
    }, 
    'createPermission':{
        'request':0x0009, 
        'success':0x0109, 
        'error':0x0119
    }
}; 
var attributes = {
    "channel_number": 0x000C,
    "lifetime": 0x000D,
    "bandwidth": 0x0010,
    "xor_peer_address": 0x0012,
    "data": 0x0013,
    "xor_relayed_address": 0x0016,
    "even_port": 0x0018,
    "requested_transport": 0x0019,
    "dont_fragment": 0x001A,
    "timer_val": 0x0021,
    "reservation_token": 0x0022
}

exports = module.exports = TurnResolver; 

function TurnResolver (packet, source, options) {
    var parsedPacket; 

    try{
        parsedPacket = parser.decodePacket('stun', packet); 
    } catch (err) {
       //TODO: Try to parse packet another way 
       console.log(err); 
    }
    //console.log(parsedPacket); 
    this.type = parsedPacket.header.message_type; 
    this.transaction_id = parsedPacket.header.transaction_id; 
    this.message_length = parsedPacket.header.message_length; 
    this.transport_address = source; 
    this.attributes = parsedPacket.attributes; 
    this.original_packet = packet; 
    this.options = options; 
    this.errors = parsedPacket.errors; 
}

TurnResolver.prototype.resolve = function(){
    if(parseInt(this.type.toString('hex'), 16) == methods.binding.request){
        return this.bindingResponse(); 
    }else if(parseInt(this.type.toString('hex'), 16) == methods.allocate.request){

        if(this.attributes.packets['MessageIntegrity']){
            var Relay = require('./relay')(options.allocationLifetime, global.port); 
             
            console.log('Send good response')   
            var response =this.allocateResponse({address:this.options.host, family:'IPv4', port:Relay.port}); 
            return {relay:Relay, response:response}; 
        }
        return this.allocateErrorResponse();  
    }
}
TurnResolver.prototype.allocateErrorResponse = function(){
        var header = new Buffer(20); 
        header.writeUInt16BE(methods.allocate.error, 0); 
        header.writeUInt32BE(0x2112A442, 4)
        this.transaction_id.copy(header, 8, 0, this.transaction_id.length);

        var attr = []; 
        var Attribute = new Attributes();
        Attribute.encode({attr:'ErrorCode', params:'401'}, function(obj){
            attr.push(obj); 
        });
        Attribute.encode({attr:'Realm', params:'stutter.js'}, function(obj){
            attr.push(obj); 
        }); 
         Attribute.encode({attr:'Nonce', params:null}, function(obj){
            attr.push(obj); 
        });
        Attribute.encode({attr:'Software', params:'stutter.js - RFC5389'}, function(obj){
            attr.push(obj); 
        }); 

        header.writeUInt16BE(utils.bufferLength(attr), 2, true);
        return btools.concat(header, Buffer.concat(attr));  
}
TurnResolver.prototype.allocateResponse = function(){
         var header = new Buffer(20); 
        header.writeUInt16BE(methods.allocate.success, 0); 
        header.writeUInt32BE(0x2112A442, 4)
        this.transaction_id.copy(header, 8, 0, this.transaction_id.length);

        var attr = []; 
        var Attribute = new Attributes();
        Attribute.encode({attr:'xorMappedAddress', params:this.transport_address}, function(obj){
            attr.push(obj); 
        }); 
        Attribute.encode({attr:'Software', params:'stutter.js - RFC5389'}, function(obj){
            attr.push(obj); 
        }); 
        Attribute.encode({attr:'Lifetime', params:600}, function(obj){
            attr.push(obj); 
        }); 
        Attribute.encode({attr:'xorRelayedAddress', params:arguments[0]}, function(obj){
            attr.push(obj); 
        });
        Attribute.encode({attr:'MessageIntegrity', 
                          params:{'buf':btools.concat(header, Buffer.concat(attr)), 
                                  'key':this.options.authentication.password}}, function(obj){
                                      attr.push(obj); 
                                  })

        header.writeUInt16BE(utils.bufferLength(attr), 2, true);
        return btools.concat(header, Buffer.concat(attr));     
}
TurnResolver.prototype.bindingResponse = function(){
        var header = new Buffer(20); 
        header.writeUInt16BE(methods.binding.success, 0); 
        header.writeUInt32BE(0x2112A442, 4)
        this.transaction_id.copy(header, 8, 0, this.transaction_id.length);
        
        var attr = []; 
        var Attribute = new Attributes();
        Attribute.encode({attr:'MappedAddress', params:this.transport_address}, function(obj){
            attr.push(obj); 
        }); 
        Attribute.encode({attr:'xorMappedAddress', params:this.transport_address}, function(obj){
            attr.push(obj); 
        }); 
        Attribute.encode({attr:'Software', params:'stutter.js - RFC5389'}, function(obj){
            attr.push(obj); 
        }); 
            
        header.writeUInt16BE(utils.bufferLength(attr), 2, true); 
         

        if (this.options.backwards_compatibility) {
            attr.push(Attribute.response_address(source), 
                      Attribute.changed_address(source)); 
            header.writeUInt16BE(utils.bufferLength(attr), 2, true); 
        }
        
        //TODO: find out authentication type, figure out data type
        // MAKE IT WORK!
        if (this.options.authentication === 'none') {
            Attribute.encode({attr:'Username', params:'stutterjs'}, function(obj){
                attr.push(obj); 
            })
            if(this.options.authentication.type == 'short-term'){
                Attribute.encode({attr:'MessageIntegrity', 
                                  params:{'buf':btools.concat(header, Buffer.concat(attr)), 
                                          'key':this.options.authentication.password}}, function(obj){
                                              attr.push(obj); 
                                          })
                //Correcting the header length
                header.writeUInt16BE(utils.bufferLength(attr), 2, true);
            }else if (this.options.authentication.type == 'long-term'){
                 Attribute.encode({attr:'MessageIntegrity', 
                                  params:{'buf':btools.concat(header, Buffer.concat(attr)), 
                                          'key':this.options.authentication.username
                                                +':'+this.options.authentication.realm
                                                +':'+this.options.authentication.password}}, function(obj){
                                              attr.push(obj); 
                                          })           
                //Correcting the header length
                header.writeUInt16BE(utils.bufferLength(attr), 2, true);
            }else{
                throw 'unknown authentication type'; 
            }
        }
        if (this.options.fingerprint) {
            attr.push(Attribute.fingerprint(btools.concat(header, 
                                                           Buffer.concat(attr)))); 
            header.writeUInt16BE(utils.bufferLength(attr), 2, true); 
        }

        return btools.concat(header, Buffer.concat(attr));  
}

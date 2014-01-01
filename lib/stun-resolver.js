
/**
 * Module dependencies
 */
var btools = require('buffertools')
  , Parser = require('./parser') 
  , utils = require('./utils') 
  , Attributes = Parser.Attributes; 
/**
 * Shortcut HEX codes for the binding method
 */
var binding = {
        'request':0x0001,
        'indication':0x0011, 
        'success':0x0101, 
        'error':0x0111
    }; 
var errors = {}; 

/**
 * Exposing the constructor
 */
exports = module.exports = StunResolver; 

/**
 * The packet should be encoded in hex
 */
function StunResolver (options){
    this.options = options; 
}

StunResolver.prototype.resolve = function(packet, source){
    var parsedPacket = Parser.decodePacket('stun', packet)
      , type = parsedPacket.header.message_type
      , transaction_id = parsedPacket.header.transaction_id
      , message_length = parsedPacket.header.message_length 
      , transport_address = source
      , attributes = parsedPacket.attributes
      , original_packet = packet
      , errors = parsedPacket.errors; 

    //need to ensure the scope of it
    this.rval = {header:{
        transaction_id: transaction_id
    }}; 


    //TODO: should also check if the type is a valid binding method before sending response

    if(this.options.authentication != 'none'){
        if('undefined' === typeof this.attributes ||
           'undefined' === typeof this.attributes.MessageIntegrity ||
           'undefined' === typeof this.attributes.Username){

            this.rval.header.type = binding.error; 
            this.rval.attributes.ErrorCode = "400"; 
            
            // fill the error object
            this.errors.authentication = "The client did not provide message integrity, username, or both"; 

        }else{this.rval.header.type = binding.success;}
    }else{this.rval.header.type = binding.success;}


    switch(this.rval.header.type){
        case binding.request:
            break; 
        case binding.success:
            return this.bindingSuccess(source); 
            break; 
        case binding.error:
            break; 
        case binding.indication:
            break; 
    }

    //TODO: check if auth error
    if(parseInt(this.type.toString('hex'), 16) == binding.request){
        rval.header.type = binding.succes; 

        rval.attributes = {
            MappedAddress: this.transport_address, 
            xorMappedAddress: this.transport_address, 
            Software: 'stutter.js - RFC5389'
        }; 

                     
        if (this.options.backwards_compatibility) {
            rval.attributes.ResponseAddress = this.transport_address; 
            rval.attributes.ChangedAddress = this.transport_address; 
        }
        
        //TODO: find out authentication type, figure out data type
        // MAKE IT WORK!
        if (this.options.authentication != 'none') {
            rval.attributes.Username = 'stutter.js'; 
            Attributes.encode({attr:'Username', params:'stutterjs'}, function(obj){
                attr.push(obj); 
            })
            if(this.options.authentication.type == 'short-term'){
                rval.attributes.MessageIntegrity = {key: this.options.authentication.password}

            }else if (this.options.authentication.type == 'long-term'){
                rval.attributes.MessageIntegrity = {key: this.options.authentication.username
                                                +':'+this.options.authentication.realm
                                                +':'+this.options.authentication.password}; 
            }else{
                throw 'unknown authentication type'; 
            }
        }
        if (this.options.fingerprint) {
            rval.attributes.Fingerprint = true; 
        }

        //return btools.concat(header, Buffer.concat(attr));    
    }
    return Parser.encodePacket(rval); 
}

StunResolver.prototype.bindingSuccess = function(source){
    this.transport_address = source; 
    //Base attributes
    this.rval.attributes = {
        MappedAddress: this.transport_address, 
        xorMappedAddress: this.transport_address, 
        Software: 'stutter.js - RFC5389'
    }; 
    //check if we are in bc mode
    if (this.options.backwards_compatibility) {
        this.rval.attributes.ResponseAddress = this.transport_address; 
        this.rval.attributes.ChangedAddress = this.transport_address; 
    }
    
    //TODO: do something with authentication here

    return Parser.encodePacket(this.rval); 

}
StunResolver.prototype.bindingError = function(packet, source){
    //TODO: send error response
}
StunResolver.prototype.bindingRequest = function(packet, source){
    var header = packet.header
      , attributes = {}; 
      
    header.message_type = binding.success

    attributes.MappedAddress = {params: source}; 
    attributes.xorMappedAddress = {params: source}; 
    attributes.Software = {params: 'stutter.js - RFC5389'}; 

    
    if (this.options.backwards_compatibility) {
        //attr.push(Attribute.response_address(source), 
        //          Attribute.changed_address(source)); 
        //header.writeUInt16BE(utils.bufferLength(attr), 2, true); 
    }
    if (this.options.authentication != 'none') {
        attributes.Username = { params: 'stutterjs'}; 

        if(this.options.authentication.type == 'short-term'){
            attributes.MessageIntegrity = { params: {
                key: this.options.authentication.password 
            }}; 
        }else if (this.options.authentication.type == 'long-term'){
            attributes.MessageIntegrity = {
                params:{key:this.options.authentication.username
                            +':'+this.options.authentication.realm
                            +':'+this.options.authentication.password}
            }; 
        }else{
            throw 'unknown authentication type'; 
        }
    }
    return Parser.encodePacket({header:header, attributes: attributes}); 
}

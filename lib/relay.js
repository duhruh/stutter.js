var dgram = require('dgram'); 
var EventEmitter = process.EventEmitter; 

exports = module.exports = Relay; 

function Relay(lifetime, port){
    this.lifetime = lifetime; 
    this.port = port; 
    this.udp4 = dgram.createSocket('udp4'); 
    this.__init(); 
}

Relay.prototype.__proto__ = EventEmitter.prototype; 

//get this right
Relay.prototype.__init = function(){
    this.udp4.on('message', this.emit('message')); 

    this.bind(this.port); 
}
Relay.prototype.send = function(){
    this.udp4.send(arguments); 
}
Relay.prototype.bind = function(port){
    try{
        this.udp4.bind(port)
        global.allocatedPort = port; 
        this.port = port; 
        console.log('OMGOMGOMGOMGOMGOMMOGMOGMOGMOGMOGMOGMOMGOMGOGMO')
    }catch{
        this.bind(port+1); 
    }
}

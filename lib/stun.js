/**
 * Module dependencies
 */
var dgram = require('dgram')
  , net = require('net') 
  , StunResolver = require('./stun-resolver') 
  , winston = require('winston'); 

/**
 * Setting up winston logger
 */
winston.remove(winston.transports.Console); 
winston.add(winston.transports.Console,  {"timestamp":false, "colorize":true}); 

exports = module.exports = Stun;  

function Stun(options){
    if('undefined' === typeof options){options = {} }
    if('undefined' === typeof options.protocol){options.protocol = 'both';}
    if('undefined' === typeof options.port){options.port = 19302;}
    if('undefined' === typeof options.authentication){options.authentication = 'none';}
    if('undefined' === typeof options.debug){options.debug = false;}

    this.options = options; 
    this.Resolver = new StunResolver(this.options); 
}

Stun.prototype.createServer = function(){

    switch(this.options.protocol){
        case 'tcp':
            startTCP()
            break; 
        case 'udp':
            startUDP(); 
            break; 
        case 'both':
            this.startTCP(); 
            this.startUDP(); 
            break;
        default:
            throw "unrecognized protocol"; 
            break; 
    }
}

/**
 * Creates the udp4 server
 */
Stun.prototype.startUDP = function(){
    var self = this; 
    var udp = dgram.createSocket('udp4'); 
     
    udp.on('message', function(msg, rinfo){
        self.options.debug && winston.log('info', "  stun-udp4  |  udp got connection: " 
                         + rinfo.address + ":" + rinfo.port);

        var rval = self.Resolver.resolve(msg, rinfo); 

        self.options.debug && winston.log('info', "  stun-udp4  |  udp sending response"); 

        udp.send(rval, 0, rval.length, rinfo.port, rinfo.address, function(err,bytes){
            self.options.debug && winston.log('info', "  stun-udp4  |  error:" + err); 
            self.options.debug && winston.log('info', "  stun-udp4  |  bytes sent:"+ bytes); 
        });

    }); 

    udp.on('listening', function(){
        var address = udp.address(); 
        winston.log('info', '  stun-udp4  |  udp listening ' 
        + address.address + ':' + address.port); 
    }); 

    udp.bind(this.options.port); 
}

/**
 * Creates the tcp server
 */
Stun.prototype.startTCP = function(){
    var self = this; 
    var tcp = net.createServer(function(socket){
        this.options.debug && winston.log('info', '  stun-tcp   |  tcp got connection: ' 
                         + socket.address.address + ':' + socket.address.port); 

        socket.on('data', function(data){

            var rval = this.Resolver.resolve(data, socket.address()); 

            self.options.debug && winston.log('info', "  stun-tcp   |  tcp sending response"); 

            socket.write(rval); 
        }); 
    }); 

    tcp.listen(this.options.port, function(){
        var address = tcp.address()
        self.options.debug && winston.log('info', "  stun-tcp   |  tcp listening " 
                         + address.address + ':' + address.port); 
    }); 
}

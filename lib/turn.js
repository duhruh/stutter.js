/**
 * Module dependencies
 */
var dgram = require('dgram')
  , net = require('net') 
  , TurnResolver = require('./turn-resolver') 
  , winston = require('winston'); 

/**
 * Setting up winston logger
 */
winston.remove(winston.transports.Console); 
winston.add(winston.transports.Console,  {"timestamp":false, "colorize":true}); 

exports.createTurnServer = function(options){
    
    if('undefined' === typeof options){options = {} }
    if('undefined' === typeof options.protocol){options.protocol = 'both';}
    if('undefined' === typeof options.port){options.port = 3479;}
    if('undefined' === typeof options.authentication){options.authentication = {'type':'long-term', 'username':'stutterjs', 'password':'pass'};}
    if('undefined' === typeof options.debug){options.debug = true;}
    if('undefined' === typeof options.software){options.software = 'stutter.js - RFC5389'}
    if('undefined' === typeof options.allocationMinPort){options.allocationMinPort = 49152}
    if('undefined' === typeof options.allocationMaxPort){options.allocationMaxPort = 65535}
    if('undefined' === typeof options.allocationLifetime){options.allocationLifetime = 600}
    if('undefined' === typeof options.host){options.host = '127.0.0.1'}

    switch(options.protocol){
        case 'tcp':
            startTCP(options)
            break; 
        case 'udp':
            startUDP(options); 
            break; 
        case 'both':
            startTCP(options); 
            startUDP(options); 
            break;
        default:
            throw "unrecognized protocol"; 
            break; 
    }
    global.allocatedPort = options.allocationMinPort; 
}
/**
 * Creates the udp4 server
 */
function startUDP(options){
    var udp = dgram.createSocket('udp4'); 
     
    udp.on('message', function(msg, rinfo){
        options.debug && winston.log('info', "  turn-udp4  |  udp got connection: " 
                         + rinfo.address + ":" + rinfo.port);

        var resolver = new TurnResolver(msg, rinfo, options); 
        var rval = resolver.resolve(); 

        options.debug && winston.log('info', "  turn-udp4  |  udp sending response"); 

        udp.send(rval, 0, rval.length, rinfo.port, rinfo.address, function(err,bytes){
            options.debug && winston.log('info', "  turn-udp4  |  error:" + err); 
            options.debug && winston.log('info', "  turn-udp4  |  bytes sent:"+ bytes); 
        });

    }); 

    udp.on('listening', function(){
        var address = udp.address(); 
        winston.log('info', '  turn-udp4  |  udp listening ' 
        + address.address + ':' + address.port); 
    }); 

    udp.bind(options.port); 
}

/**
 * Creates the tcp server
 */
function startTCP(options){
    var tcp = net.createServer(function(socket){
        options.debug && winston.log('info', '  turn-tcp   |  tcp got connection: ' 
                         + socket.address.address + ':' + socket.address.port); 

        socket.on('data', function(data){
            var resolver = new TurnResolver(data, socket.address(), options);
            var rval = resolver.resolve(); 

            options.debug && winston.log('info', "  turn-tcp   |  tcp sending response"); 

            socket.write(rval); 
        }); 
    }); 

    tcp.listen(options.port, function(){
        var address = tcp.address()
        options.debug && winston.log('info', "  turn-tcp   |  tcp listening " 
                         + address.address + ':' + address.port); 
    }); 
}

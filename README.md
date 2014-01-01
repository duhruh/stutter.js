#Stutter.js
===========

RFC-5389 Stun Node.js implementation

## Example
```javascript
    var stutter = require('./').Stun; 
    var Stun = new stutter({port:1234, 
                            debug:true, 
                            authentication:'none'}); 
    Stun.createServer(); 

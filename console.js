const repl = require("repl");
replServer = repl.start({});

replServer.context.crypto = require("crypto");

replServer.context.jsbn = require("./jsbn");
replServer.context.BigPrimeGenerator = require("./bigPrimeGenerator");
replServer.context.BigIntegerGenerator = require("./bigIntegerGenerator");
replServer.context.Ffs = require("./ffs");

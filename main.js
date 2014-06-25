#!/usr/bin/node
var Lexer = require("./lexer.js"),
	Util = require("./util.js");


var t, lex = Lexer.lexer_open("test.cog");

try {
	lex.parseAll();

	while ((t = lex.next()).tok !== "#eof")
	{
		console.log(":: '" + t.tok + "'");
	};
} catch (e) {
	if (typeof e === "string")
		Util.display(e);
	else
		throw e;
	process.exit(-1);
}

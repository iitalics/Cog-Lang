#!/usr/bin/node

var Lexer = require("./lexer"),
	Util = require("./util"),
	Parser = require("./parser");


var t, lex;

try {
	lex = Lexer.lexer_open("test.cog");
	lex.parseAll();

	var env = Parser.environment(lex);

} catch (e) {
	if (typeof e === "string")
		Util.display(e);
	else
		throw e;
	process.exit(-1);
}

var Lexer = require("./lexer");

function unexpect (t)
{
	return t.span.error("unexpected token '" + t.tok + "'");
}


function environment (lexer)
{
	throw unexpect(lexer.next());
	throw lexer.next().span.error("too lazy to implement everything")
}





exports.environment = environment;

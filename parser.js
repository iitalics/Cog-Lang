var Lexer = require("./lexer");

function unexpect (t)
{
	return t.span.error("unexpected token '" + t.tok + "'");
}


function environment (lexer)
{
	//throw unexpect(lexer.next());

	var tok, span;
	
	while ((tok = lexer.next()).tok != "#eof")
		span = (span || tok.span).join(tok.span);
	
	throw span.error("too lazy to implement everything");
}





exports.environment = environment;

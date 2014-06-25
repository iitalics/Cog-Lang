var Util = require("./util"),
	Lexer = require("./lexer");

function unexpect (t)
{
	return t.span.error("unexpected token '" + t.tok + "'");
}
function unexpect_now (lex)
{
	return unexpect(lex.get(0));
}

function expect (lex, types, flush)
{
	var arr = true;
	
	if (!(types instanceof Array))
	{
		types = [types];
		arr = false;
	}
	
	var t, out = [], i = 0;
	
	types.forEach(function (tok)
	{
		t = lex.get(i);
		
		if (lex.get(i).tok == tok) {
			out.push(t);
			
			if (flush)
				lex.next();
			else
				i++;
		}
		else
			throw lex.get(i).span.error("expected '" +
					Lexer.token_name(tok) + "', got '" + Lexer.token_name(t) + "'");
	});
	
	return arr ? out : out[0];
}

// tfw no partial application
// it's a sad feeling
var expectf = Util.curryl(Util.curryr, expect);

function parse_list (lex, func, end, start, allow_lazy)
{
	if (start) {
		var a = end; // poo
		end = start;
		start = a;
		
		expect(lex, start, true);
	}
	
	var s, out = [];
	
	for (;;) {
		out.push(func(lex));
		
		s = lex.next();
		if (s.tok != "," && s.tok != end) {
			throw s.span.error("expected ',' or '" +
					Lexer.token_name(end) + "', got '" +
					Lexer.token_name(s) + "'");
		} else if (s.tok == end) {
			break;
		} else if (allow_lazy && lex.get(0).tok == end) {
			lex.next();
			break;
		}
	}
	// tfw no generators
	// it's a horrible feeling
	return out;
}




function environment (lex)
{
	while (!lex.empty()) {
		if (lex.get(0).tok == "#id") {
			var id = lex.next().name;
			var template = [];
			
			if (lex.get(0).tok == "<")
				template = parse_list(lex, expectf("#id", true), "<", ">").
					map(Util.getter("name"));
			
			console.log(id + " <" + template + ">");
		}
		else
			throw unexpect_now(lex);
	}
}





exports.environment = environment;

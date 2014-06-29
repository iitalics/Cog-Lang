var Util = require("./util"),
	Lexer = require("./lexer");

var Type = exports.Type = require("./parser/type"),
	Block = exports.Block = require("./parser/block"),
	Exp = exports.Exp = require("./parser/exp");


/*

pass 1					"parse"
	function definitions
	type definition
	parse syntax:
		'let' definitions
		order of operations
		expression fragments (enums)
	
	
pass 2					"formalize"
	formalize expressions (enums)
	formalize types
	ensure function calls are valid?
	
	
pass 3					"bind"
	determine expression types
	find operator overloads
	determine if-else-block types
	determine overloaded functions
	infer types in definitions
	infer types in templates
	check types in expressions
	fix incomplete-typed arrays  ([], [* n])
	find invalid casts (scalar to non-scalar)


types are correct now, compile
	
*/


var unexpect = exports.unexpect = function (t)
{
	return t.span.error("unexpected token '" + Lexer.token_name(t) + "'");
};

var unexpect_now = exports.unexpect_now = function unexpect_now (lex)
{
	return unexpect(lex.get());
};

var expect = exports.expect = function (lex, toks, flush)
{
	var arr = true;
	
	if (!(toks instanceof Array))
	{
		toks = [toks];
		arr = false;
	}
	
	var t, out = [], i = 0;
	var first, last;
	
	toks.forEach(function (tok)
	{
		t = lex.get(i);
		
		first = first || t;
		last = t;
		
		if (lex.get(i).tok === tok) {
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
	
	out.span = first.span.join(last.span);
	
	return arr ? out : out[0];
};


var expectf = exports.expectf = Util.curryl(Util.curryr, expect);



var parse_list = exports.parse_list = function (lex, func, start, end, allow_lazy)
{
	var span = expect(lex, start, true).span;
	
	var s, out = [];
	
	// this is yucky
	if (lex.get().tok == end)
		span = span.join(lex.next().span);
	else
		for (;;) {
			out.push(func(lex));
			
			s = lex.next();
			span = span.join(s.span);
			
			if (s.tok !== "," && s.tok !== end) {
				throw s.span.error("expected ',' or '" +
						Lexer.token_name(end) + "', got '" +
						Lexer.token_name(s) + "'");
			} else if (s.tok === end) {
				break;
			} else if (allow_lazy && lex.get().tok === end) {
				span = span.join(lex.next().span);
				break;
			}
		}
	
	out.span = span;
	return out;
};

var id_template = exports.id_template = function (lex, declaration)
{
	var span = lex.get().span;
	var name = expect(lex, "#id", true).name;
	var templates = [];
	
	if (lex.get().tok === "<")
	{
		throw lex.get().span.error("templates unsupported");
		
		templates = parse_list(lex, function ()
		{
			if (declaration)
				return expect(lex, "#id", true).name;
			else
				return Type.parse(lex);
		}, "<", ">");
		
		span = span.join(templates.span);
	}
	
	return {
		name: name,
		templates: templates,
		span: span
	};
};


function environment (lex)
{
	var b = Block.parse(lex);
	
	b.statements.forEach(function (s)
	{
		console.log(s);
	});
	
	console.log("void-eval? ", b.void_eval);
}





exports.environment = environment;

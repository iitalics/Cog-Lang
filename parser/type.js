var Parser = require("../parser"),
	Util = require("../util"),
	Types = require("../types"),
	Lexer = require("../lexer");
//


var formalizer = exports.formalizer = function ()
{
	var obj = {};
	
	obj.formalize = function (env)
	{
		return this;
	};
	
	return obj;
};



function tuple_struct (types, func)
{
	var out;
	
	if (types.length == 1 && func == Types.tuple)
		out = types[0];
	else
		out = func(types);
	
	out.span = types.span;
	return out;
}


var parse = exports.parse = function (lex)
{
	var start = lex.get(),
		out;
	
	if (start.tok === "#id") {
		var d = Parser.id_template(lex);
		out = Types.basic(d.name, d.templates);
		out.span = d.span;
	} else if (Types.basic_types.indexOf(start.tok) !== -1) {
		out = Types.basic(lex.next().tok);
		out.span = start.span;
	} else if (start.tok === "(") {
		var types = Parser.parse_list(lex, parse, "(", ")");
		out = tuple_struct(types, Types.tuple);
	} else if (start.tok === "{") {
		var types = Parser.parse_list(lex, parse, "{", "}");
		out = tuple_struct(types, Types.struct);
	} else
		throw start.span.error("expected type, got '" + Lexer.token_name(start) + "'");
	
	for (;;)
		if (lex.get().tok === "[") {
			var end = Parser.expect(lex, ["[", "]"], true);
			var span = out.span.join(end.span);
			
			out = Types.array(out);
			out.span = span;
		
		} else if (lex.get().tok === "?") {
			var span = out.span.join(lex.next().span);
			
			out = Types.nullable(out);
			out.span = span;
		} else
			break;
	
	return out;
};
var Parser = require("../parser"),
	Lexer = require("../lexer");


/*
 exp = term
       term op exp
 
term =
		# basic
	number
	id<T>		# evals to either variable or enum
	id<T> | exp
	
		# list
	(exp, ..)	# if len = 1, just eval. otherwise tuple
	{exp, ..}	# struct with size 1 is allowed
	[exp, ..]
	
		# postfix
	term(exp, ..)
	term => type	# NOT an operator
	
		# prefix
	'not' term
	- term
	
  op = + - * / % ^

*/

function id (name)
{
	var obj = {};
	
	obj.formalize = function (env)
	{
		// enum or variable?
	};
	
	return obj;
}
function num (t)
{
	var obj = {};
	
	obj.formalize = function (env) { return this; };
	
	obj.num = t.value;
	obj.type = t.type;
	obj.span = t.span;
	return obj;
}








var id_parser = {
	valid: function (lex) { return lex.get().tok == "#id"; },
	
	parse: function (lex)
	{
		var d = Parser.id_template(lex);
		var is_enum = false;
		var enum_arg = null;
		var span = d.span;
		var out;
		
		if (lex.get().tok == "|")
		{
			lex.next();
			enum_arg = parse(lex);
			is_enum = true;
			
			span = span.join(enum_arg.span);
		}
		else if (d.templates.length > 0)
			is_enum = true;
		
		if (is_enum)
			throw span.error("enumerated types not supported yet");
		else
			out = id(d.name)
		
		out.span = span;
		return out;
	}
};

var num_parser = {
	valid: function (lex) { return lex.get().tok == "#num"; },
	parse: function (lex) { return num(lex.next()); }
};




var parsers = [id_parser];



var parse_term = exports.parse = function (lex)
{
};

var parse = exports.parse = function (lex)
{
	for (var i = 0; i < parsers.length; i++)
		if (parsers[i].valid(lex))
			return parsers[i].parse(lex);
	
	var t = lex.get();
	throw t.span.error("expected '<expression>', got '" + Lexer.token_name(t) + "'");
};
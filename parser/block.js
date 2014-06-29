var Parser = require("../parser");





function let_definition (name, exp, type)
{
	var obj = {};
	
	obj.formalize = function ()
	{
		obj.exp = obj.exp.formalize();
		
		if (obj.type != null)
			obj.type = obj.type.formalize();
		
		return this;
	};
	
	obj.name = name;
	obj.exp = exp;
	obj.type = type;
	
	return obj;
}



function statement (lex) // "let", or "expression"
{
	if (lex.get().tok === "let") {
		lex.next();
		
		var name = Parser.expect(lex, "#id", true);
		var type = null;
	}
	
}




function block ()
{
	var obj = {};
	
	obj.formalize = function (env)
	{
		return this;
	};
	
	obj.statements = [];
	obj.void_eval = true;
	return obj;
}


var parse = exports.parse = function (lex)
{
	var b = block(), s;
	b.span = Parser.expect(lex, "{", true).span;
	
	for (;;)
		if (lex.get().tok === ";") {
			b.void_eval = true;
			lex.next();
		} else if (lex.get().tok === "}") {
			b.span = b.span.join(lex.next().span);
			break;
		} else {
			s = statement(lex);
			b.statements.push(s);
			
			b.void_eval = s.type !== "expression";
		}
	
	return b;
};
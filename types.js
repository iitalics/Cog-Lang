var Parser = require("./parser");

/*	what capabilities does the type system interface need?


does one type implicitly cast to another?
	equal types do implicitly cast


->	soft cast
=>	hard cast


if the types do not implicitly cast, THEY MUST BE EXPLICTLY CASTED

	func foo (x: uint) ...
	func bar (x: int) ...

	foo(4) 			invalid narrow cast!
	foo(4u)			good
	foo(4 => uint)		good

	bar(5.)			invalid narrow cast!
	bar(5)			good
	bar(5u)			valid! compiler inserts cast

	


types:	T		basic
	T?		nullable
	T[]		array
	(T, U)		tuple
	{T, U}		strong tuple

soft casts:
	T -> U		where U >= T
	T -> T?

	(..) -> {..}

hard casts:
	T => U		string doesn't cast with anything lol
	T => U?		as long as T => U


	string => char[]	?? this could be useful
*/

var basic_types = exports.basic_types =
	[
		"char",
		"byte",
		"uint",
		"int",
		"long",
		"float",
		"string"
	];


/*	sizeof char	implementation defined, 1 or 2
	sizeof byte	always 1
	sizeof (u)int	4
	sizeof long	8
	sizeof float	8  */


function equals (t1, t2)
{
	if (t1.kind !== t2.kind) {
		return false;
	} else if (t1.subtype) {
		return equals(t1.subtype, t2.subtype);	
	} else if (t1.subtypes) {
		if (t1.subtypes.length !== t2.subtypes.length)
			return false;

		for (var i in t1.subtypes)
			if (!equals(t1.subtypes[i], t2.subtypes[i]))
				return false;

	} else if (t1.kind === "basic") {
		return t1.name === t2.name;
	}
	
	return true;
}

function basic (name, templates)
{
	var obj = Parser.Type.formalizer();

	// TODO: numeric casts? is this even a thing?
	obj.soft_cast = function (src) { return equals(obj, src); };
	
	obj.kind = "basic";	
	obj.name = name;
	obj.templates = templates || [];
	return obj;
}
function nullable (sub)
{
	var obj = Parser.Type.formalizer();
	
	obj.soft_cast = function (src)
	{
		if (src.kind === "nullable")
			return obj.subtype.soft_cast(src.subtype);
		else
			return obj.subtype.soft_cast(src);
	};

	obj.kind = "nullable";
	obj.subtype = sub;
	return obj;
}
function array (sub)
{
	var obj = Parser.Type.formalizer();
	
	obj.soft_cast = function (src) { return equals(obj, src); };

	obj.kind = "array";
	obj.subtype = sub;
	return obj;
}
function tuple (sub, names)
{
	var obj = Parser.Type.formalizer();
	
	obj.soft_cast = function (src) { return equals(obj, src); };

	obj.kind = "tuple";
	obj.subtypes = sub;
	obj.names = names || [];
	return obj;
}
function struct (sub, names)
{
	var obj = Parser.Type.formalizer();
	
	obj.soft_cast = function (src) { return equals(obj, src); };

	obj.kind = "tuple";
	obj.subtypes = sub;
	obj.names = names || [];
	return obj;
}

exports.basic = basic;
exports.nullable = nullable;
exports.array = array;
exports.tuple = tuple;
exports.struct = struct;


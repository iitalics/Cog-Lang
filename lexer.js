var fs = require("fs");
var Span = exports.Span =
	require("./lexer/span");


const comment_char = "#";
const comment_begin = "#/";
const comment_end   = "/#";

const regex_digit = /^\d+/;
const regex_space = /^\s+/;
const regex_symbol = /^[a-zA-Z\d_]+/;

function isdigit (c)  { return !!regex_digit.exec(c); } 
function isspace (c)  { return !!regex_space.exec(c); } 
function issymbol (c) { return !!regex_symbol.exec(c); } 

var keywords =
	("if else elif " +
	"for while match return " +
	"const let func type enum " +
	"byte int uint long real string " +
	"and or not " +

	"").split(" ");

var seq = 
	("== != <= >= ... .. -> =>").split(" ");

function lexer (filename, data)
{
	var obj = {},
		pos = 0,
		eof_tok;

	function eof () { return pos >= obj.str.length; }
	function cur () { return eof() ? "" : obj.str[pos]; }
	function next () { return eof() ? "" : obj.str[pos++]; }
	function sub () { return eof() ? "" : obj.str.substring(pos); }
	
	
	function trim_comment ()
	{
		if (sub().indexOf(comment_begin) === 0) {
			pos += comment_begin.length;

			var dis = sub().indexOf(comment_end);
			if (dis === -1)
				throw Span.span(obj, pos - comment_begin.length,
							comment_begin.length).
					error("unclosed multi-line comment, expected '" + comment_end + "'",
						"comment begins here");

			pos += dis + comment_end.length;
		}
		else {
			var dis = sub().indexOf("\n");

			if (dis === -1) // comment goes to end of file
				pos = obj.str.length;
			else
				pos += dis;
		}
	}
	function triml ()
	{
		for (;;) {
			while (isspace(cur()))
				next();

			if (cur() === comment_char)
				trim_comment();
			else
				break;
		}
	};
	
	function parse_symbol ()
	{
		var spn, sym;

		sym = regex_symbol.exec(sub())[0];
		spn = Span.span(obj, pos, sym.length);
		pos += sym.length;

		if (keywords.indexOf(sym) !== -1)
			return {
				tok: sym,
				span: spn, 
			};
		else
			return {
				tok: "#id",
				name: sym,
				span: spn
			};
	}
	
	function parse_number ()
	{
		// ###
		// ###u
		// ###L
		// ###.###
		// 0x####


		// holy shit what is this
		// what have i done i'm so sorry

		
		var exp = /^(\d+(u|L|\.\d*)?|0x[\da-fA-F]+)(?![a-zA-Z\d_])/.exec(sub());

		if (!exp)
		{
			var portion = /^(\d+(u|L|\.\d*)?|0x[\da-fA-F]+)[a-zA-Z\d_]*/.exec(sub());
			
			var len = portion ? portion[0].length
			                  : 1;

			throw Span.span(obj, pos, len).error("invalid number literal");
		}
		var data = exp[0];
		
		var base = 10;
		
		if (data.indexOf("0x") === 0)
			base = 16;

		var type, value = parseInt(data, base);
		
		if (data[data.length - 1] === "u")
			type = "uint";
		else if (data[data.length - 1] === "L")
			type = "long";
		else if (data.indexOf(".") !== -1)
		{
			value = parseFloat(data);
			type = "float"
		}
		else
			type = "int";

		var tok = {
			tok: "#num",
			type: type,
			value: value,
			span: Span.span(obj, pos, data.length)
		};
		pos += data.length;
		return tok;
	}

	obj.parse = function ()
	{
		var tok, i;

		triml();

		if (eof())
			return eof_tok; 
		else if (isdigit(cur()))
			return parse_number();
		else if (issymbol(cur()))
			return parse_symbol();
		else {
			for (var i in seq) {
				var len = seq[i].length;

				if (obj.str.substring(pos, pos + len) === seq[i]) {
					tok = {
						tok: seq[i],
						span: Span.span(obj, pos, len)
					};
					pos += len;
					return tok;
				}
			}
			
			tok = {
				tok: cur(),
				span: Span.span(obj, pos, 1)
			};
			next();
			return tok;

		}

	};
	obj.parseAll = function ()
	{
		var t;
		
		while ((t = obj.parse()) !== eof_tok)
			obj.tokens.push(t);

		return obj.tokens;
	};

	obj.next = function ()
	{
		if (obj.tokens.length == 0)
			return obj.parse();
		else
			return obj.tokens.shift();
	};
	
	obj.filename = filename;
	obj.str = data.replace(/[\r\0]/g, "");
	obj.tokens = [];
	
	eof_tok = { tok: "#eof", span: Span.span(obj, obj.str.length, 1) };

	return obj;
}

function lexer_open (filename)
{
	var data = null;
	try {
		data = fs.readFileSync(filename, { encoding: "utf8" });
	} catch (e) {
		throw Span.span(null).error("could not open file '" + filename + "'")
	};

	return lexer(filename, data);
}

function token_name (t)
{
	if (typeof t == "string")
	{
		if (t == "#num")
			return "<number>";
		else
			return token_name({ tok: t });
	}

	switch (t.tok)
	{
	case "#id": return "<identifier>";
	case "#str": return "<string>";
	case "#eof": return "<eof>";
	case "#num": return "<number: " + t.type + ">";
	default:
		return t.tok;
	}
}

exports.lexer = lexer;
exports.lexer_open = lexer_open;
exports.token_name = token_name;

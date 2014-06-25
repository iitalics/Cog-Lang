
var colors = {
	error: "31",
	warning: "33",
	none: "0"
};
function esc (c, bold)
{
	if (!colors[c])
		return "";

	return "\x1b[" + colors[c] + (bold ? ";1" : "") + "m";
}
function esc_string (str, c, bold)
{
	return esc(c, bold) + str + esc("none");
}

function span (lexer, start, len)
{
	var obj = {};

	obj.join = function (other)
	{
		const start = Math.min(obj.start, other.start);
		const end = Math.max(obj.end, other.end);

		return span(other.lexer, start, end - start);
	};
	obj.error = function (msg, post)
	{
		var title = esc_string("error: ", "error") + msg + "\n";
		post = post ? (post + "\n") : "";

		if (!lexer)
			return title + post;
		else
			return title + obj.message("error") + post;
	};
	obj.message = function (color)
	{
		const lines = lexer.str.split("\n");
		const start_line = lexer.str.substring(0, obj.start).split("\n").length - 1;
		const num_lines = lexer.str.substring(obj.start, obj.end).split("\n").length;
		
		var i, j, str, squiggle, pad, depth,
			line, line_num, col_num, arrow,
			color_active;

		str = "";
		pad = obj.start;
		squiggle = 0;

		for (i = 0; i < start_line; i++)
			pad -= lines[i].length + 1;
		
		col_num = pad + 1;
		line_num = start_line + 1;

		for (i = start_line; squiggle < obj.len; i++) {
			if (i > lines.length)
				break;

			line = lines[i].replace(/\t/g, " ");
			arrow = (squiggle === 0);
			color_active = false;
			
			if (line.trim().length == 0)
			{
				squiggle += line.length + 1;
				pad = 0;
				continue;
			}

			str += line + "\n";
			
			for (j = 0; j < pad; j++)
				str += " ";	
			
			for (; line[j] === " "; j++) {
				str += " ";
				squiggle++;
			}

			for (; squiggle < obj.len && 
					j < line.length; j++) {
				if (line.substring(j).trim().length == 0)
					break;

				if (color && !color_active) {
					if (!arrow)
						str += esc(color);
					color_active = true;
				}
				
				if (arrow)
					str += color ? (esc(color, true) + "^" + esc("none") + esc(color))
					             : "^";
				else
					str += "~";
				
				arrow = false;
				squiggle++;
			}

			squiggle += line.length - j;
			squiggle++; // line break counts as a character
			pad = 0;
			if (color)
				str += esc("none");
			str += "\n";
		}

		return lexer.filename +
			": line " + line_num + ", col " + col_num +
			":\n" + str;
	};
	
	len = len || 1;
	start = start || 0;

	obj.start = start;
	obj.end = start + len;
	obj.len = len;
	obj.lexer = lexer;
	return obj;
}


exports.span = span;

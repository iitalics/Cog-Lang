
//
// seperates CSI codes into stderr
// produces no newlines
//


var DISABLE_COLORS = false;


var array = exports.array = function array (a)
{
	return Array.prototype.slice.apply(a, [0]);
};

var display = exports.display = function display ()
{
	array(arguments).forEach(function (str)
	{
		while (str.length > 0) {
			
			var match = /([^\x1b]*)(\x1b\[[\d;]+.)?/.exec(str);
			str = str.substring(match[0].length);
	
			var normal = match[1];
			var csi = match[2];
	
			process.stdout.write(normal);
			if  (csi && !DISABLE_COLORS)
				process.stderr.write(csi);
		}
	});
};

var getter = exports.getter = function (field)
{
	return function (a) { return a[field]; };
};

var make_curry = function (f)
{
	return function (func)
	{
		var a = array(arguments).slice(1);
		
		return function ()
		{
			var b = array(arguments);
			
			return func.apply(this, f(a, b));
		};
	};
};
var curryl = exports.curryl = make_curry(function (l, r) { return l.concat(r); });
var curryr = exports.curryr = make_curry(function (r, l) { return l.concat(r); });
// we functional now!

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

var curryl = exports.curryl = function curryl (func)
{
	var a = array(arguments).slice(1);
	
	return function ()
	{
		var b = array(arguments);
		
		return func.apply(this, a.concat(b));
	};
};

var curryr = exports.curryr = function curryr (func)
{
	var a = array(arguments).slice(1);
	
	return function ()
	{
		var b = array(arguments);
		
		return func.apply(this, b.concat(a));
	};
};
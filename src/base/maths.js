Scoped.define("module:Maths", [], function () {
	return {
		
	    discreteCeil: function (number, steps, max) {
	        var x = Math.ceil(number / steps) * steps;
	        return max && x > max ? 0 : x;
	    }
	
	};
});
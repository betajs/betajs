BetaJS.Class.extend("BetaJS.Profiling.PerformanceProfiler", [
	BetaJS.Events.EventsMixin,
	{
		
	execute: function (name, callback) {
		var start_time = BetaJS.Time.now();
		callback.apply();
		var end_time = BetaJS.Time.now();
		var diff_time = end_time - start_time;
		this.trigger("execute", name, diff_time, start_time, end_time);
	}
	
}]);

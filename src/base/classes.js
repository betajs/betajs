BetaJS.Classes = {};

BetaJS.Classes.AutoDestroyMixin = {
	
	enter: function () {
		if (!this.__enter_count)
			this.__enter_count = 0;
		this.__enter_count++;
	},
	
	leave: function () {
		if (!this.__enter_count)
			this.__enter_count = 0;
		this.__enter_count--;
		if (this.__enter_count < 1)
			this.destroy();
	}
		
};

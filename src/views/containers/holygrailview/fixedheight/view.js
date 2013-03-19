var HolygrailView;

$(document).ready(function () {
	HolygrailView = View.extend({
		
		template: _.template($("#holygrailview-template").html()),
		
		_afterInitialize: function () {
			
			this.left_container = this.addView(new ContainerView({
				attributes: ""
				}), {bind_selector: "[data-selector='left']"}
			);
			
			this.center_container = this.addView(new ContainerView({
				attributes: ""
				}), {bind_selector: "[data-selector='center']"}
			);
			
			this.right_container = this.addView(new ContainerView({
				attributes: ""
				}), {bind_selector: "[data-selector='right']"}
			);			
		}
	});
});
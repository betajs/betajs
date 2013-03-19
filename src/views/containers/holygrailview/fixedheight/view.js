var HolygrailView;

$(document).ready(function () {
	HolygrailView = RichView.extend({
		
		template: _.template($("#holygrail-view-template").html()),
		
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
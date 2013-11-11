BetaJS.Views.ListContainerView.extend("BetaJS.Views.DropdownView", {
	
	constructor : function(options) {
		options = options || {};
		options.alignment = "vertical";
		this._setOption(options, "elements", ["1","2"]);
		this._inherited(BetaJS.Views.DropdownView, "constructor", options);
	},
	
	_domain_defaults: function () {
		return BetaJS.Objs.extend(this._inherited(BetaJS.Views.DropdownView, "_domain_defaults"), {
			"LogoDropDownView": function (page) {
				return {
					type: "BetaJS.Views.ButtonView",
					parent: "logo_dropdown_view.overlay_inner",
					options: {
						children_classes: "text-container"
					}
				};
			}
		});
	},
	
	_domain: function () {
		var test = this.__elements;
		return {
			
			button: {
				type: "ButtonView",
				options: {
					label: "Button",
				},
				events: {
					"click": function () {
						this.domain.ns.dropdown_view.toggle();
					}
				},
			},
 			
			dropdown_view: {
				type: "OverlayView",
				options: function (page) {
					return {
						anchor: "relative",
						element: page.ns.logo_view,
						overlay_inner: new BetaJS.Views.ListContainerView({
							el_classes: "dropdown",
							alignment: "vertical"
						})
					};
				},
			},
			
			dropdown_button: {
				type: "ButtonView",
				parent: "dropdown_view.overlay_inner",			
				options: {
					children_classes: "text-container",
					label: "Test"
				},
				events: {
					"click": function () {
						for (var i=0;i<test.length;i++){
							alert(test[i]);
						}
					}
				},
			},
			
			dropdown_button2: {
				type: "ButtonView",
				parent: "dropdown_view.overlay_inner",
				after: ["dropdown_button"],			
				options: {
					children_classes: "text-container",
					label: "Test2"
				},
				events: {
					"click": function () {
						alert("Test2");
					}
				},
			},
			
			// for (var i=0;i<test.length;i++){
				// dropdown_button[i]: {
					// type: "ButtonView",
					// parent: "dropdown_view.overlay_inner",			
					// options: {
						// children_classes: "text-container",
						// label: "Test"
					// },
					// events: {
						// "click": function () {						
							// alert(test[i]);
						// }
					// },
				// },
			// },

		};
	}
		
});

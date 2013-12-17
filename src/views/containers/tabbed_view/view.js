BetaJS.Views.ListContainerView.extend("BetaJS.Views.TabbedView", {
	
	constructor: function (options) {
		options = BetaJS.Objs.extend(options || {}, {
			"alignment": "vertical",
			"positioning": "none"
		});
		this._inherited(BetaJS.Views.TabbedView, "constructor", options);
		this.toolbar = this.addChild(new BetaJS.Views.ToolBarView());
		this.container = this.addChild(new BetaJS.Views.SwitchContainerView());
		this.toolbar.on("item:click", function (view) {
			this.select(view);
		}, this);
		if (options.tabs) {
			BetaJS.Objs.iter(options.tabs, function (tab) {
				this.addTab(tab);
			}, this);
		}
	},
	
	addTab: function (options) {
		options = BetaJS.Objs.extend(options, {
			selectable: true,
			deselect_all: true						
		});
		var button = this.toolbar.addItem(options);
		button.__tabView = this.container.addChild(options.view);
		options.view.__tabButton = button;
		if (options.selected)
			this.select(button);
		return button.__tabView;
	},
	
	select: function (item_ident_or_view) {
		var tab_view = null;
		if (BetaJS.Types.is_string(item_ident_or_view))
			tab_view = this.toolbar.itemByIdent(item_ident_or_view).__tabView;
		else if (item_ident_or_view.__tabButton)
			tab_view = item_ident_or_view;
		else
			tab_view = item_ident_or_view.__tabView;
		this.container.select(tab_view);
		tab_view.__tabButton.select();
		this.trigger("select", tab_view);
		return tab_view;
	}
	
});
BetaJS.Browser.Dom = {
	
	parentElementBySelection : function() {
		if (window.getSelection) {
			var target = window.getSelection().getRangeAt(0).commonAncestorContainer;
			return target.nodeType === 1 ? target : target.parentNode;
		} else if (document.selection)
			return document.selection.createRange().parentElement();
		return null;
	},

	parentElement : function(current) {
		return "parentNode" in current ? current.parentNode : current.parentElement();
	},

	elementInScope : function(element, ancestor, including) {
		including = BetaJS.Types.is_defined(including) ? including : true;
		return element == ancestor ? including : (element == null ? false : this.elementInScope(this.parentElement(element), ancestor, including));
	},

	parentElements : function(element, ancestor, including) {
		var result = [];
		var current = element;
		while (current != null && (!ancestor || current != ancestor)) {
			result.push(current);
			current = this.parentElement(current);
		}
		if (current == null && ancestor)
			return [];
		if (ancestor && including)
			result.push(ancestor);
		return result;
	},

	hasParentElementsTag : function(tag, element, ancestor, including) {
		var elements = this.parentElements(element, ancestor, including);
		tag = tag.toLowerCase();
		return BetaJS.Objs.exists(elements, function(parent) {
			return parent.tagName.toLowerCase() == tag;
		});
	}
};

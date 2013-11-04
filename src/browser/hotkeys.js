BetaJS.Browser = BetaJS.Browser || {};

/**
 * Uses modified portions of:
 * 
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */

BetaJS.Browser.Hotkeys = {
	
	SHIFT_NUMS: {
		"`":"~",
		"1":"!",
		"2":"@",
		"3":"#",
		"4":"$",
		"5":"%",
		"6":"^",
		"7":"&",
		"8":"*",
		"9":"(",
		"0":")",
		"-":"_",
		"=":"+",
		";":":",
		"'":"\"",
		",":"<",
		".":">",
		"/":"?",
		"\\":"|"
	},
	
	SPECIAL_KEYS: {
		'esc':27,
		'escape':27,
		'tab':9,
		'space':32,
		'return':13,
		'enter':13,
		'backspace':8,

		'scrolllock':145,
		'scroll_lock':145,
		'scroll':145,
		'capslock':20,
		'caps_lock':20,
		'caps':20,
		'numlock':144,
		'num_lock':144,
		'num':144,
		
		'pause':19,
		'break':19,
		
		'insert':45,
		'home':36,
		'delete':46,
		'end':35,
		
		'pageup':33,
		'page_up':33,
		'pu':33,

		'pagedown':34,
		'page_down':34,
		'pd':34,

		'left':37,
		'up':38,
		'right':39,
		'down':40,

		'f1':112,
		'f2':113,
		'f3':114,
		'f4':115,
		'f5':116,
		'f6':117,
		'f7':118,
		'f8':119,
		'f9':120,
		'f10':121,
		'f11':122,
		'f12':123
	},
	
	MODIFIERS: ["ctrl", "alt", "shift", "meta"],
	
	keyCodeToCharacter: function (code) {
		if (code == 188)
			return ",";
		else if (code == 190)
			return ".";
		return String.fromCharCode(code).toLowerCase();
	},
	
	register: function (hotkey, callback, context, options) {
		options = BetaJS.Objs.extend({
			"type": "keyup",
			"propagate": false,
			"disable_in_input": false,
			"target": document,
			"keycode": false
		}, options);
		options.target = BetaJS.$(options.target);
		var keys = hotkey.toLowerCase().split("+");
		var func = function (e) {
			if (options.disable_in_input) {
				var element = e.target || e.srcElement || null;
				if (element && element.nodeType == 3)
					element = element.parentNode;
				if (element && (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA'))
					return;
			}
			var code = e.keyCode || e.which || 0;
			var character = BetaJS.Browser.Hotkeys.keyCodeToCharacter(code);
			var kp = 0;
			var modifier_map = {};
			BetaJS.Objs.iter(BetaJS.Browser.Hotkeys.MODIFIERS, function (mod) {
				modifier_map[mod] = {
					pressed: e[mod + "Key"],
					wanted: false
				};
			}, this);
			BetaJS.Objs.iter(keys, function (key) {
				if (key in modifier_map) {
					modifier_map[key].wanted = true;
					kp++;
				} else if (key.length > 1) {
					if (BetaJS.Browser.Hotkeys.SPECIAL_KEYS[key] == code)
						kp++;
				} else if (options.keycode) {
					if (options.keycode == code)
						kp++;
				} else if (character == key || (e.shiftKey && BetaJS.Browser.Hotkeys.SHIFT_NUMS[character] == key)) {
					kp++;
				}
			}, this);
			if (kp == keys.length && BetaJS.Objs.all(modifier_map, function (data) { return data.wanted == data.pressed; })) {
				callback.apply(context || this);
				if (!options.propagate)
					e.preventDefault();
			}
		};
		options.target.on(options.type, func);
		return {
			target: options.target,
			type: options.type,
			func: func
		};
	},
	
	unregister: function (handle) {
		handle.target.off(handle.type, handle.func);
	} 
	
};

Scoped.define("module:Structures.AvlTree", function() {

    /**
     * Abstract AvlTree Structure
     * 
     * @module BetaJS.Structures.AvlTree
     */
    return {

        /**
         * Returns an empty avl tree.
         * 
         * @return {object} empty avl tree
         */
        empty: function() {
            return null;
        },

        /**
         * Returns a singleton avl tree.
         * 
         * @param data data for singleton node
         * 
         * @return {object} singleton avl tree
         */
        singleton: function(data) {
            return {
                data: data,
                left: null,
                right: null,
                height: 1,
                length: 1
            };
        },

        /**
         * Returns the smallest data item in an avl tree.
         * 
         * @param {object} root tree root
         * @return smallest data item
         */
        min: function(root) {
            return root.left ? this.min(root.left) : root.data;
        },

        /**
         * Returns the largest data item in an avl tree.
         * 
         * @param {object} root tree root
         * @return largest data item
         */
        max: function(root) {
            return root.right ? this.max(root.right) : root.data;
        },

        /**
         * Returns the height of an avl tree.
         * 
         * @param {object} root tree root
         * @return {int} height
         */
        height: function(node) {
            return node ? node.height : 0;
        },

        /**
         * Returns the number of nodes in an avl tree.
         * 
         * @param {object} root tree root
         * @return {int} number of nodes
         */
        length: function(node) {
            return node ? node.length : 0;
        },

        /**
         * @private
         */
        __height_join: function(left, right) {
            return 1 + Math.max(this.height(left), this.height(right));
        },

        /**
         * @private
         */
        length_join: function(left, right) {
            return 1 + this.length(left) + this.length(right);
        },

        /**
         * @private
         */
        __create: function(data, left, right) {
            return {
                data: data,
                left: left,
                right: right,
                height: this.__height_join(left, right),
                length: this.length_join(left, right)
            };
        },

        /**
         * Creates a new balanced tree from a tree of small elements, a tree of large elements and a data item inbetween.
         * 
         * @param data data item
         * @param {object} left avl tree of small elements
         * @param {object} right avl tree of large elements
         * 
         * @return {object} avl tree containing all data
         */
        balance: function(data, left, right) {
            if (this.height(left) > this.height(right) + 2) {
                if (this.height(left.left) >= this.height(left.right))
                    return this.__create(left.data, left.left, this.__create(data,
                        left.right, right));
                else
                    return this.__create(left.right.data, this.__create(left.data,
                        left.left, left.right.left), this.__create(data,
                        left.right.right, right));
            } else if (this.height(right) > this.height(left) + 2) {
                if (this.height(right.right) >= this.height(right.left))
                    return this.__create(right.data, this.__create(data, left,
                        right.left), right.right);
                else
                    return this.__create(right.left.data, this.__create(data, left,
                        right.left.left), this.__create(right.data,
                        right.left.right, right.right));
            } else
                return this.__create(data, left, right);
        },

        /**
         * @private
         */
        __add_left: function(data, left) {
            return left ? this.balance(left.data, this.__add_left(data, left.left),
                left.right) : this.singleton(data);
        },

        /**
         * @private
         */
        __add_right: function(data, right) {
            return right ? this.balance(right.data, right.data, this.__add_right(
                data, right.right)) : this.singleton(data);
        },

        /**
         * @private
         */
        __join: function(data, left, right) {
            if (!left)
                return this.__add_left(data, right);
            else if (!right)
                return this.__add_right(data, left);
            else if (this.height(left) > this.height(right) + 2)
                return this.balance(left.data, left.left, this.__join(data,
                    left.right, right));
            else if (this.height(right) > this.height(left) + 2)
                return this.balance(right.data, this.__join(data, left, right.left),
                    right.right);
            else
                return this.__create(data, left, right);
        },

        /**
         * Returns and removes the smallest item from the tree.
         * 
         * @param {object} root avl tree
         * 
         * @return {array} array, containing the smallest element and the remaining tree
         */
        take_min: function(root) {
            if (!root.left)
                return [root.data, root.right];
            var result = this.take_min(root.left);
            return [result[0], this.__join(root.data, result[1], root.right)];
        },

        /**
         * Returns and removes the largest item from the tree.
         * 
         * @param {object} root avl tree
         * 
         * @return {array} array, containing the largest element and the remaining tree
         */
        take_max: function(root) {
            if (!root.right)
                return [root.data, root.left];
            var result = this.take_max(root.right);
            return [result[0], this.__join(root.data, root.left, result[1])];
        },

        /*
        reroot : function(left, right) {
        	if (!left || !right)
        		return left || right;
        	if (this.height(left) > this.height(right)) {
        		var max = this.take_max(left);
        		return this.__join(max[0], max[1], right);
        	}
        	var min = this.take_min(right);
        	return this.__join(min[0], left, min[1]);
        },
        */

        /**
         * Returns and removes the smallest item from the tree, denaturalizing the tree in an iterative fashion.
         * 
         * @param {object} root avl tree
         * 
         * @return {array} array, containing the smallest element and the remaining denaturalized tree
         */
        take_min_iter: function(root) {
            if (!root)
                return null;
            if (!root.left)
                return [root.data, root.left];
            return this.take_min_iter(this.__create(root.left.data, root.left.left,
                this.__create(root.data, root.left.right, root.right)));
        },

        /**
         * Returns and removes the largest item from the tree, denaturalizing the tree in an iterative fashion.
         * 
         * @param {object} root avl tree
         * 
         * @return {array} array, containing the largest element and the remaining denaturalized tree
         */
        take_max_iter: function(root) {
            if (!root)
                return null;
            if (!root.right)
                return [root.data, root.right];
            return this.take_max_iter(this.__create(root.right.data, this.__create(
                root.data, root.left, root.right.left), root.right.right));
        }

    };

});


Scoped.define("module:Structures.TreeMap", ["module:Structures.AvlTree"], function(AvlTree) {

    /**
     * TreeMap Structure, based on AvlTree
     * 
     * @module BetaJS.Structures.TreeMap
     */
    return {

        /**
         * Returns an empty Tree Map.
         * 
         * @param {function} compare data comparison function
         * @return {object} empty tree map
         */
        empty: function(compare) {
            return {
                root: null,
                compare: compare || function(x, y) {
                    return x > y ? 1 : x < y ? -1 : 0;
                }
            };
        },

        /**
         * Determines whether a tree map is empty.
         * 
         * @param {object} t tree map
         * @return {boolean} true if empty
         */
        is_empty: function(t) {
            return !t.root;
        },

        /**
         * Returns the number of elements in the map.
         * 
         * @param {object} t tree map
         * @return {int} number of elements
         */
        length: function(t) {
            return t.root ? t.root.length : 0;
        },

        /**
         * @private
         */
        __add: function(key, value, t, node) {
            var kv = {
                key: key,
                value: value
            };
            if (!node)
                return AvlTree.singleton(kv);
            var c = t.compare(key, node.data.key);
            if (c === 0) {
                node.data = kv;
                return node;
            } else if (c < 0)
                return AvlTree.balance(node.data, this.__add(key, value, t, node.left), node.right);
            else
                return AvlTree.balance(node.data, node.left, this.__add(key, value, t, node.right));
        },

        /**
         * Add a key value mapping to the map.
         * 
         * @param key key
         * @param value value
         * @param {object} t tree map
         * 
         * @return {object} updated tree map
         */
        add: function(key, value, t) {
            t.root = this.__add(key, value, t, t.root);
            return t;
        },

        /**
         * Creates a singleton tree map.
         * 
         * @param key key
         * @param value value
         * @param {function} compare comparison function
         * 
         * @return {object} singleton tree map
         */
        singleton: function(key, value, compare) {
            return this.add(key, value, this.empty(compare));
        },

        /**
         * @private
         */
        __find: function(key, t, root) {
            if (!root)
                return null;
            var c = t.compare(key, root.data.key);
            return c === 0 ? root.data.value : this.__find(key, t, c < 0 ? root.left : root.right);
        },

        /**
         * Finds a value for a key in the map.
         * 
         * @param key key
         * @param {object} t tree map
         * @return value for key
         */
        find: function(key, t) {
            return this.__find(key, t, t.root);
        },

        /**
         * @private
         */
        __iterate: function(t, node, callback, context, reverse) {
            if (!node)
                return true;
            return (
                this.__iterate(t, reverse ? node.right : node.left, callback, context, reverse) &&
                (callback.call(context, node.data.key, node.data.value) !== false) &&
                this.__iterate(t, reverse ? node.left : node.right, callback, context, reverse));
        },

        /**
         * Iterates over the tree map.
         * 
         * @param {object} t tree map
         * @param {function} callback callback function
         * @param {object} context optional callback context
         * @param {boolean} reverse optional reverse direction flag
         */
        iterate: function(t, callback, context, reverse) {
            this.__iterate(t, t.root, callback, context, reverse);
        },

        /**
         * @private
         */
        __iterate_from: function(key, t, node, callback, context, reverse) {
            if (!node)
                return true;
            var c = t.compare(key, node.data.key) * (reverse ? -1 : 1);
            if (c < 0 && !this.__iterate_from(key, t, reverse ? node.right : node.left, callback, context, reverse))
                return false;
            if (c <= 0 && callback.call(context, node.data.key, node.data.value) === false)
                return false;
            return this.__iterate_from(key, t, reverse ? node.left : node.right, callback, context, reverse);
        },

        /**
         * Iterates over the tree map starting with a key.
         * 
         * @param key key to start with
         * @param {object} t tree map
         * @param {function} callback callback function
         * @param {object} context optional callback context
         * @param {boolean} reverse optional reverse direction flag
         */
        iterate_from: function(key, t, callback, context, reverse) {
            this.__iterate_from(key, t, t.root, callback, context, reverse);
        },

        /**
         * Iterates over the tree map between two keys.
         * 
         * @param from_key key to start with
         * @param to_key key to end with
         * @param {object} t tree map
         * @param {function} callback callback function
         * @param {object} context optional callback context
         * @param {boolean} reverse optional reverse direction flag
         */
        iterate_range: function(from_key, to_key, t, callback, context, reverse) {
            this.iterate_from(from_key, t, function(key, value) {
                return t.compare(key, to_key) * (reverse ? -1 : 1) <= 0 && callback.call(context, key, value) !== false;
            }, this, reverse);
        },

        /*
        __downpath: function (current, reverse, path) {
        	path = path || [];
        	while (current) {
        		path.push(current);
        		current = reverse ? current.right : current.left
        	}
        	return path;
        },
		
        iteratorInit: function (t, reverse) {
        	return {
        		path: this.__downpath(t.root, reverse),
        		reverse: reverse
        	};
        },
		
        iteratorHasNext: function (iter) {
        	return iter.path.length > 0;
        },
		
        iteratorNext: function (iter) {
        	var current = iter.path[iter.path.length - 1];
        	var data = current.data;
        	var next = iter.reverse ? current.left : current.right;
        	if (next)
        		iter.path = this.__downpath(next, iter.reverse, iter.path);
        	else {
        		while (iter.path.length > 0) {
        			var child = iter.path.pop();
        			current = iter.path[iter.path.length - 1];
        			next = iter.reverse ? current.left : current.right;
        			if (current !== next)
        				break;
        		}
        	}
        	return data;
        },
        */

        /**
         * Returns and removes the smallest element from the tree.
         * 
         * @param {object} tree map
         * @return {object} smalles key value pair
         */
        take_min: function(t) {
            var a = AvlTree.take_min(t.root);
            a[1] = {
                compare: t.compare,
                root: a[1]
            };
            return a;
        },

        /**
         * @private
         */
        __treeSizeLeft: function(key, t, node) {
            var c = t.compare(key, node.data.key);
            if (c < 0)
                return this.__treeSizeLeft(key, t, node.left);
            return 1 + (node.left ? node.left.length : 0) + (c > 0 ? this.__treeSizeLeft(key, t, node.right) : 0);
        },

        /**
         * @private
         */
        __treeSizeRight: function(key, t, node) {
            var c = t.compare(key, node.data.key);
            if (c > 0)
                return this.__treeSizeRight(key, t, node.right);
            return 1 + (node.right ? node.right.length : 0) + (c < 0 ? this.__treeSizeRight(key, t, node.left) : 0);
        },

        /**
         * @private
         */
        __distance: function(keyLeft, keyRight, t, node) {
            var cLeft = t.compare(keyLeft, node.data.key);
            var cRight = t.compare(keyRight, node.data.key);
            if (cLeft > 0 || cRight < 0)
                return this.__distance(keyLeft, keyRight, t, cLeft > 0 ? node.right : node.left);
            return 1 + (cRight > 0 ? this.__treeSizeLeft(keyRight, t, node.right) : 0) + (cLeft < 0 ? this.__treeSizeRight(keyLeft, t, node.left) : 0);
        },

        /**
         * Counts the number of keys smaller than a given key.
         * 
         * @param key key
         * @param {object} t tree map
         * @return {int} number of keys smaller than given key
         */
        treeSizeLeft: function(key, t) {
            return this.__treeSizeLeft(key, t, t.root);
        },

        /**
         * Counts the number of keys larger than a given key.
         * 
         * @param key key
         * @param {object} t tree map
         * @return {int} number of keys larger than given key
         */
        treeSizeRight: function(key, t) {
            return this.__treeSizeRight(key, t, t.root);
        },

        /**
         * Counts the number of keys between two keys.
         * 
         * @param keyLeft first key
         * @param keyRight second key
         * @param {object} t tree map
         * @return {int} number of keys in-between
         */
        distance: function(keyLeft, keyRight, t) {
            return t.compare(keyLeft, keyRight) < 0 ? this.__distance(keyLeft, keyRight, t, t.root) - 1 : 0;
        }

    };

});
Scoped.define("module:Maths", [], function () {
    /**
     * This module contains auxilary math functions.
     *
     * @module BetaJS.Maths
     */
    return {
        /**
         * Ceiling an integer to be a multiple of another integer.
         *
         * @param {int} number the number to be ceiled
         * @param {int} steps the multiple
         * @param {int} max an optional maximum
         *
         * @return {int} ceiled integer
         */
        discreteCeil: function (number, steps, max) {
            var x = Math.ceil(number / steps) * steps;
            return max && x > max ? 0 : x;
        },
        /**
         * Clamps number between an upper and lower bound.
         *
         * @param {number} number the number to clamp
         * @param {number} lower the lower bound
         * @param {number} upper the upper bound
         *
         * @returns {number} the clamped number
         */
        clamp: function (number, lower, upper) {
            if (lower === void 0) { lower = -Infinity; }
            if (upper === void 0) { upper = Infinity; }
            if (number < lower)
                return lower;
            if (number > upper)
                return upper;
            return number;
        }
    };
});

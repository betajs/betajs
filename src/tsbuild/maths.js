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
         * @return {number} the clamped number
         */
        clamp: function (number, lower, upper) {
            if (lower === void 0) { lower = -Infinity; }
            if (upper === void 0) { upper = Infinity; }
            if (number < lower)
                return lower;
            if (number > upper)
                return upper;
            return number;
        },
        /**
         * Creates an array of numbers that contains an arithmetic progression.
         *
         * @param {number} start initial term
         * @param {number} end upper bound
         * @param {number} step step between consecutive terms
         *
         * @return {Array} the arithmetic progression
         */
        range: function (start, end, step) {
            var array = [];
            var current = start;
            var sgn = end >= start ? 1 : -1;
            if (!step)
                step = sgn;
            var stepsgn = step >= 0 ? 1 : -1;
            if (stepsgn != sgn || step === 0)
                return array;
            while (start < end ? current <= end : current >= end) {
                array.push(current);
                current += step;
            }
            return array;
        }
    };
});

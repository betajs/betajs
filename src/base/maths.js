Scoped.define("module:Maths", [], function() {
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
        discreteCeil: function(number, steps, max) {
            var x = Math.ceil(number / steps) * steps;
            return max && x > max ? 0 : x;
        }

    };
});
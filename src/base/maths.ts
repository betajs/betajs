declare var Scoped: any;

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
        discreteCeil: function(number: number, steps: number, max: number): number {
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
        clamp: function(number: number, lower: number = -Infinity, upper: number = Infinity): number {
            if (number < lower) return lower;
            if (number > upper) return upper;
            return number;
        },

        /**
         * Creates an array of numbers that contains an arithmetic progression.
         *
         * @param {number} start initial term
         * @param {number} end upper bound (inclusive)
         * @param {number} step step between consecutive terms
         *
         * @return {Array} the arithmetic progression
         */
        range: function(start: number, end: number, step: number) {
            if (start === end) return [start];
            var array: number[] = [];
            var current = start;
            var sgn = end >= start ? 1 : -1;
            if (!step)
                step = sgn;
            var stepsgn = step >= 0 ? 1 : -1;
            if (stepsgn != sgn || step === 0)
                return array;
            while (start <= end ? current <= end : current >= end) {
                array.push(current);
                current += step;
            }
            return array;
        },

        /**
         * Generates random integer between min and max
         *
         * @param {int} min minimum value for random integer
         * @param {int} max maximum value for random integer
         *
         * @return {int} the random integer
         */
        randomInt: function(min, max) {
            if (!max) {
                max = min;
                min = 0;
            }
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

    };
});
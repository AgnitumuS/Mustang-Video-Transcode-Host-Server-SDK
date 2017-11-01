/**************************************************************
 * Copyright (c) 2017 IEI Integration Corp. http://www.ieiworld.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cardMap = require('../config/cardMap');

function sortCardMap() {
    var array = selectionSort(Object.keys(cardMap));
}

function selectionSort(array) {
    if (array == undefined || array.length == 0) {
        return;
    }
    for (var i = 0; i < array.length - 1; i++) {
        var min = i;
        for (var j = i + 1; j < array.length; j++) {
            if (array[j].replace("CARD", "") < array[min].replace("CARD", "")) {
                min = j;
            }
        }
        swap(array, i, min);
    }
    return array;
}

function swap(array, left, right) {
    var temp = array[left];
    array[left] = array[right];
    array[right] = temp;
}

module.exports = sortCardMap;
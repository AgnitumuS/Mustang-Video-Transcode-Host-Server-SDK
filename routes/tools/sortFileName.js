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

function sortFileName(array) {
	if (array == undefined) {
		return undefined;
	}
	for (var i = 0; i < array.length; i++) {
		var min = i;
		for (var j = i + 1; j < array.length; j++) {
			if (compareTwoString(array[j], array[min])) {
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

function compareTwoString(str1, str2) {
	// return true if str1 < str2
	var i = 0;
	while (i < str1.length && i < str2.length) {
		if (str1[i].name.toLowerCase() < str2[i].name.toLowerCase()) {
			return true;
		} else if (str1[i].name.toLowerCase() == str2[i].name.toLowerCase()) {
			i++;
		} else {
			return false;
		}
	}
	if (str1.length < str2.length) {
		return true;
	}
	return false;
}

module.exports = sortFileName;
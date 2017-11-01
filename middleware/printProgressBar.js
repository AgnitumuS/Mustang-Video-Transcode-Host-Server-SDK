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
function printProgressBar(percentage) {
    data = percentage * 10;
    switch (data) {
        case 0:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[                                       ] 0%");
            break;
        case 10:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>>                                    ] 10%");
            break;
        case 20:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>> >>>                                ] 20%");
            break;
        case 30:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>> >>> >>>                            ] 30%");
            break;
        case 40:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>> >>> >>> >>>                        ] 40%");
            break;
        case 50:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>> >>> >>> >>> >>>                    ] 50%");
            break;
        case 60:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>> >>> >>> >>> >>> >>>                ] 60%");
            break;
        case 70:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>> >>> >>> >>> >>> >>> >>>            ] 70%");
            break;
        case 80:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>> >>> >>> >>> >>> >>> >>> >>>        ] 80%");
            break;
        case 90:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>> >>> >>> >>> >>> >>> >>> >>> >>>    ] 90%");
            break;
        case 100:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>> >>> >>> >>> >>> >>> >>> >>> >>> >>>] 100%");
            console.log("\n");
            break;
        default:
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("[>>> >>> >>> >>> >>> >>> >>> >>> >>> >>>] 100%");
    }
}

module.exports = printProgressBar;
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
var MVT = require('../class/card');
var loadPortInfo = require('./loadPortInfo');

function loadCards(cardsInfo) {
    if (cardsInfo == undefined) {
        return;
    }
    for (var i = 0; i < cardsInfo.length - 1; i++) {
        var min = i;
        for (var j = i + 1; j < cardsInfo.length; j++) {
            cardidateA = cardsInfo[i].cardid.replace("CARD", "");
            cardidateB = cardsInfo[j].cardid.replace("CARD", "");
            if (Number.parseInt(cardidateA, 16) > Number.parseInt(cardidateB, 16)) {
                min = j;
            }
        }
        var temp = cardsInfo[i];
        cardsInfo[i] = cardsInfo[min];
        cardsInfo[min] = temp;
    }

    for (var i = 0; i < cardsInfo.length; i++) {
        if (cardsInfo[i].cpu.length == 2) {
            var card = createCard(cardsInfo[i].cardid, cardsInfo[i].cpu[0].cpuid, cardsInfo[i].cpu[1].cpuid);
            cardMap[card.cardID()] = card;
            card.setInfo(cardsInfo[i]);
            setCPUConfig(cardsInfo[i]);
        }
    }
    loadPortInfo();
}

function createCard(cardID, cpu1ID, cpu2ID) {
    var card = new MVT(cardID, cpu1ID, cpu2ID);
    return card;
}

function setCPUConfig(input) {
    var cardid = input.cardid;
    for (var j = 0; j < input.cpu.length; j++) {
        if (j == 0) {
            cardMap[cardid].cpu1().setConfig(input.cpu[j]);
        } else if (j == 1) {
            cardMap[cardid].cpu2().setConfig(input.cpu[j]);
        }
    }
}

module.exports = loadCards;
/*global console, document, window */
// Using Module Syntax
let BaselineTest = (function () {
    'use strict';
    return {
        settings: {
            // Define what tags to run it on, and what baseline we are trying to achieve.
            tags            : ['h1', 'h2', 'h3', 'p', 'small', 'ul li', 'ol li', 'tc', 'span', 'img', 'a', 'cite', 'code'],
            desiredBaseline : 16,
            container       : 'body',
            proposals       : [],
            proposalTags    : []
        },
        init: function () {
            let i = 0,
                tags = this.settings.tags;
            while (i < tags.length) {
                this.check(tags[i]);
                i += 1;
            }
        },
        check: function (tag) {
            let current = this.utilSelector(this.settings.container, tag);
            if (current === undefined) {
                return "That element doesn’t exist on this page.";
            }
            // Can only read inline element's height if they
            // are inline blocks, this converts them.
            if (window.getComputedStyle(current).display === 'inline') {
                current.style.display = 'inline-block';
            }
            return this.displayOutput(tag, current);
        },
        utilPx: function (input) {
            //Remove the units and then convert to a number from a string.
            return parseInt(input.replace('px', ''), 10);
        },
        utilCheck: function (input) {
            return (input % this.settings.desiredBaseline === 0 || input === 0)
        },
        utilSelector: function (container, tag) {
            return document.querySelectorAll(container + " " + tag)[0];
        },
        utilPropose: function (check, propose, current, unit, remove) {
            let proposeHeightPx,
                proposeHeightMult;
            if (check === true) {
                return true;
            }
            proposeHeightPx = ((Math.ceil(propose /
                this.settings.desiredBaseline)) *
                this.settings.desiredBaseline);
            // option to remove border from output value of padding
            if (remove) {
                proposeHeightPx -= remove;
                // Make sure it's positive after removal
                if (proposeHeightPx <= 0) {
                    proposeHeightPx += this.calcFontSize(current);
                }
            }
            proposeHeightMult = proposeHeightPx / this.calcFontSize(current);
            if ((proposeHeightMult * 1000) === Math.ceil(proposeHeightMult * 1000)) {
                // If Multiplier height isnt crazy use that.
                // (max of three decimal places)
                return proposeHeightMult + unit;
            }
            return proposeHeightPx + 'px /* ideally change the font-size first */';
        },
        utilPrinter: function (tag, name, what) {
            let changes,
                alreadyChanges,
                array = this.settings.proposalTags;
            if (what !== true) {
                changes = tag + '{ ' + name + ': ' + what + ';}';
                alreadyChanges = name + ': ' + what + ';}';
                // document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', '<style>' + changes + '</style>');
                if (array.indexOf(tag) !== -1) {
                    this.settings.proposals[array.indexOf(tag)] = this.settings.proposals[array.indexOf(tag)].replace('}', ' ');
                    this.settings.proposals[array.indexOf(tag)] += alreadyChanges;
                    return changes;
                }
                this.settings.proposalTags.push(tag);
                this.settings.proposals.push(changes);
                return changes;
            }
        },
        calcPosition: function (current) {
            if (window.getComputedStyle(current).position !== 'static') {
                return 'static';
            }
            return true;
        },
        calcHeight: function (current) {
            return current.getBoundingClientRect().bottom -
                current.getBoundingClientRect().top -
                this.calcPaddingTop(current) -
                this.calcPaddingBottom(current) -
                this.calcBorderTop(current) -
                this.calcBorderBottom(current);
        },
        calcFontSize: function (current) {
            return this.utilPx(window.getComputedStyle(current).fontSize);
        },
        calcLineHeight: function (current) {
            const lineheight = window.getComputedStyle(current).lineHeight;
            if (lineheight !== 'normal') {
                return lineheight;
            }
            return this.calcHeight(current) / this.calcFontSize(current);
        },
        calcBorderTop: function (current) {
            return this.utilPx(window.getComputedStyle(current).borderTopWidth);
        },
        calcBorderBottom: function (current) {
            return this.utilPx(window.getComputedStyle(current).borderBottomWidth);
        },
        calcPaddingTop: function (current) {
            return this.utilPx(window.getComputedStyle(current).paddingTop);
        },
        calcPaddingBottom: function (current) {
            return this.utilPx(window.getComputedStyle(current).paddingBottom);
        },
        calcMarginTop: function (current) {
            return this.utilPx(window.getComputedStyle(current).marginTop);
        },
        calcMarginBottom: function (current) {
            return this.utilPx(window.getComputedStyle(current).marginBottom);
        },
        checkBaseline: function (current) {
            if (this.calcHeight(current) %
                    this.settings.desiredBaseline === 0) {
                return true;
            }
            current.style.color = 'Salmon';
            return false;
        },
        paddingTop: function (current) {
            return this.utilCheck(this.calcPaddingTop(current) + this.calcBorderTop(current));
        },
        paddingBottom: function (current) {
            return this.utilCheck(this.calcPaddingBottom(current) + this.calcBorderBottom(current));
        },
        checkPadding: function (current) {
            if (this.paddingTop(current) && this.paddingBottom(current)) {
                return true;
            }
            if (this.paddingTop(current) || this.paddingBottom(current)) {
                current.style.backgroundColor = 'DarkOrange';
            } else {
                current.style.backgroundColor = 'Crimson';
            }
            return false;
        },
        marginTop: function (current) {
            return this.utilCheck(this.calcMarginTop(current));
        },
        marginBottom: function (current) {
            return this.utilCheck(this.calcMarginBottom(current));
        },
        checkMargin: function (current) {
            if (this.marginTop(current) && this.marginBottom(current)) {
                return true;
            }
            if (this.marginTop(current) || this.marginBottom(current)) {
                current.style.opacity = '0.5';
            } else {
                current.style.opacity = '0.25';
            }
            return false;
        },
        proposeHeight: function (current) {
            return this.utilPropose(this.checkBaseline(current), this.calcHeight(current), current, '', 0);
        },
        proposePaddingTop: function (current) {
            return this.utilPropose(this.checkPadding(current), this.calcPaddingTop(current), current, 'em', this.calcBorderTop(current));
        },
        proposePaddingBottom: function (current) {
            return this.utilPropose(this.checkPadding(current), this.calcPaddingBottom(current), current, 'em', this.calcBorderBottom(current));
        },
        proposeMarginTop: function (current) {
            return this.utilPropose(this.checkMargin(current), this.calcMarginTop(current), current, 'em', 0);
        },
        proposeMarginBottom: function (current) {
            return this.utilPropose(this.checkMargin(current), this.calcMarginBottom(current), current, 'em', 0);
        },
        consoleOutput: function (tag, current) {
            console.log(tag + ' is ' + this.calcHeight(current) + 'px high' +
                ', I propose a line height of ' + this.proposeHeight(current) +
                ', and its font-size is ' + this.calcFontSize(current) + 'px ' +
                ', and the line-height is ' + this.calcLineHeight(current) +
                ', a match is ' + this.checkBaseline(current) +
                ', and a margin match is ' + this.checkMargin(current) +
                ', and a padding match is ' + this.checkPadding(current) +
                ', recommended top-padding is ' + this.proposePaddingTop(current) +
                ', and the top-border is ' + this.calcBorderTop(current));
        },
        displayOutput: function (tag, current) {
            this.utilPrinter(tag, 'position', this.calcPosition(current));
            this.checkBaseline(current);
            this.checkMargin(current);
            this.utilPrinter(tag, 'margin-top', this.proposeMarginTop(current));
            this.utilPrinter(tag, 'padding-top', this.proposePaddingTop(current));
            this.utilPrinter(tag, 'line-height', this.proposeHeight(current));
            this.utilPrinter(tag, 'padding-bottom', this.proposePaddingBottom(current));
            this.utilPrinter(tag, 'margin-bottom', this.proposeMarginBottom(current));
        },
        displayAllOutput: function () {
            let output = this.settings.proposals;
            if (output.length === 0) {
                output = 'Everything you checked is fine.';
            } else {
                output = output.join("<br/><br/>");
            }
            output = '<div id="baseline-display" style="margin: 2em 0; padding: 1em; background: whitesmoke; box-shadow: 0 0 1px gray; ">' + output + '</div>';
            document.body.insertAdjacentHTML('beforeend', output);
        }
    };
}());
BaselineTest.init(); // Call itself
BaselineTest.displayAllOutput();
//Choose what functions should be private and which should be public.

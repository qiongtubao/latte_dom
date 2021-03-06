var oop = require("./lib/oop");
var dom = require("./lib/dom");

/**
 * @class Tooltip
 **/

/**
 * @param {Element} parentNode
 *
 * @constructor
 **/
function Tooltip (parentNode) {
    this.isOpen = false;
    this.$element = null;
    this.$parentNode = parentNode;
}

(function() {
    this.$init = function() {
        this.$element = dom.createElement("div");
        this.$element.className = "ace_tooltip";
        this.$element.style.display = "none";
        this.$parentNode.appendChild(this.$element);
        return this.$element;
    };

    /**
     * @returns {Element}
     **/
    this.getElement = function() {
        return this.$element || this.$init();
    };

    /**
     * @param {String} text
     **/
    this.setText = function(text) {
        dom.setInnerText(this.getElement(), text);
    };

    /**
     * @param {String} html
     **/
    this.setHtml = function(html) {
        this.getElement().innerHTML = html;
    };

    /**
     * @param {Number} x
     * @param {Number} y
     **/
    this.setPosition = function(x, y) {
        this.getElement().style.left = x + "px";
        this.getElement().style.top = y + "px";
    };

    /**
     * @param {String} className
     **/
    this.setClassName = function(className) {
        dom.addCssClass(this.getElement(), className);
    };

    /**
     * @param {String} text
     * @param {Number} x
     * @param {Number} y
     **/
    this.show = function(text, x, y) {
        if (text != null)
            this.setText(text);
        if (x != null && y != null)
            this.setPosition(x, y);
        if (!this.isOpen) {
            this.getElement().style.display = "block";
            this.isOpen = true;
        }
    };

    this.hide = function() {
        if (this.isOpen) {
            this.getElement().style.display = "none";
            this.isOpen = false;
        }
    };

    /**
     * @returns {Number}
     **/
    this.getHeight = function() {
        return this.getElement().offsetHeight;
    };

    /**
     * @returns {Number}
     **/
    this.getWidth = function() {
        return this.getElement().offsetWidth;
    };

}).call(Tooltip.prototype);

exports.Tooltip = Tooltip;
/* 
 * 
 */

var $appendSelect = {
    container: 0, //Html object of the select container.
    box: {},
    selectedBoxes: {},
    values: [],
    select2: false,
    data: [],
    jq: false,
    addButtonText: 'Add',
    removeButtonText: 'Remove',
    emptyPlaceholder: 'No data provided',
    pickedAllOptionsText: 'You already picked all options!',
    selectedAI: 0,

    construct: function (ID, data, config, callback) {
        if (typeof callback === 'undefined') {
            callback = function () {
                return;
            };
        }
        if (typeof config === 'undefined') {
            config = {};
        }
        if (typeof data === 'undefined') {
            data = [];
        }
        ID = ID.replace(/^#/, '');
        this.container = document.getElementById(ID);

        this.data = data;
        if (typeof this.data.name === 'undefined' || this.data.name === '') {
            this.data.name = 'append-' + key;
        }
        this.container.innerHTML += "<div id='append-select-" + data.name + "-values'>";
        this.box.elementsIDs = {values: "append-select-" + data.name + "-values"};
        if (this.container === null) {
            throw "Specified element (#" + ID + ") not found in dom!";
        }
        for (var key in config) {
            if (key === 'select2' && config[key] === true || config[key] === 1) {
                this.select2 = true;
                if (typeof jQuery === 'undefined') {
                    if (typeof config.jQuery === 'undefined' || typeof window[config.jQuery] === 'undefined' || typeof window[config.jQuery].getJSON === 'undefined') {
                        throw "You seem to have chosen to use select2 but we could not find jQuery!";
                    } else {
                        this.jq = window[config.jQuery];
                    }
                } else {
                    this.jq = jQuery;
                }
            }
        }
        return this.generateHTML(callback);

    },
    generateHTML: function (callback) {
        var boxHTML;
        var readOnly;
        var emptyPlaceholder;
        readOnly = false;

        if (typeof this.data.options === 'undefined' || !this.data.options.length) {
            if (typeof this.data.emptyPlaceholder !== 'undefined') {
                emptyPlaceholder = this.data.emptyPlaceholder;
            } else {
                emptyPlaceholder = this.emptyPlaceholder;
            }
            this.data.options = [{value: 0, text: emptyPlaceholder}];
            readOnly = true;
        }
        boxHTML = "<div class='append-select-container'><select style='width: auto; display: inline;' id='append-select-" + this.data.name + "-box' class='append-select-box form-control' " + ((readOnly) ? 'disabled="disabled"' : '') + ">";
        var options = this.data.options;
        for (var key2 = 0; key2 < options.length; key2++) {
            boxHTML += "<option class='append-select-option' value='" + options[key2].value + "'>" + options[key2].text + "</option>";
        }
        boxHTML += "</select><button style='width: auto; display: inline;' id='append-select-" + this.data.name + "-add-button' class='append-select-button form-control'>" + this.addButtonText + "</button></div>";
        this.container.innerHTML += boxHTML;
        this.box.defaultHtml = boxHTML;
        this.box.elementsIDs.box = "append-select-" + this.data.name + "-box";
        this.box.elementsIDs.addButton = "append-select-" + this.data.name + "-add-button";
        if (this.select2) {
            this.launchSelect2();
        }
        this.createEventsListeners();
        return this;
    },
    launchSelect2: function () {
        var selectBox = document.getElementById('append-select-' + this.data.name + '-box');
        if (selectBox.classList.contains('select2-hidden-accessible')) {
            this.jq('#append-select-' + this.data.name + '-box').select2('destroy');
        }
        this.jq('#append-select-' + this.data.name + '-box').select2();
        var select2Box = document.getElementById('select2-append-select-' + this.data.name + '-box-container');
        select2Box.parentElement.setAttribute('style', 'height: calc(2.25rem); margin-top: -5px;');
        select2Box.setAttribute('style', 'line-height: calc(2.25rem);');
    },
    destroySelect2: function () {
        var selectBox = document.getElementById('append-select-' + this.data.name + '-box');
        if (selectBox.classList.contains('select2-hidden-accessible')) {
            this.jq('#append-select-' + this.data.name + '-box').select2('destroy');
        }
    },
    createEventsListeners: function () {
        var addButton = document.getElementById(this.box.elementsIDs.addButton);
        var removeButtons = document.getElementsByClassName("append-select-" + this.data.name + "-remove-button");

        var _self = this;
        if (addButton !== null) {
            addButton.addEventListener('click', addEventHandler = function () {
                _self.addElementClick();
            });
        }

        for (var i = 0; i < removeButtons.length; i++) {
            removeButtons[i].addEventListener('click', removeEventHandler = function (e) {
                _self.removeElementClick(e);
            });
        }
    },
    removeEventsListeners: function () {
        var addButton = document.getElementById(this.box.elementsIDs.addButton);
        var removeButtons = document.getElementsByClassName("append-select-" + this.data.name + "-remove-button");
        if (addButton !== null) {
            addButton.removeEventListener('click', addEventHandler);
        }

        for (var i = 0; i < removeButtons.length; i++) {
            removeButtons[i].removeEventListener('click', removeEventHandler);
        }
    },
    removeElementClick: function (e) {
        this.removeEventsListeners();
        var button = document.getElementById(e.srcElement.id);
        var box = document.getElementById(this.box.elementsIDs.box);
        if (!('remove' in Element.prototype) && button !== null) {
            button.parentNode.parentNode.removeChild(button.parentNode);
        } else if (button !== null) {
            button.parentNode.remove();
        }
        if (box === null) {
            var emptyOptions = document.getElementById(this.box.elementsIDs.emptyOptions);
            if (!('remove' in Element.prototype)){
                emptyOptions.parentNode.removeChild(emptyOptions);
            }
            else {
                emptyOptions.remove();
            }
        } else {
            if (!('remove' in Element.prototype)) {
                box.parentNode.parentNode.removeChild(box.parentNode);
            } else {
                box.parentNode.remove();
            }
        }
        this.container.innerHTML += this.box.defaultHtml;
        this.filterOptions();
        this.createEventsListeners();
    },
    addElementClick: function () {
        var box = document.getElementById(this.box.elementsIDs.box);
        var options = box.getElementsByTagName('option');
        var button = document.getElementById(this.box.elementsIDs.addButton);
        var boxClass = " append-select-" + this.data.name + "-selected";
        var buttonClass = " append-select-" + this.data.name + "-remove-button";
        var hiddenElement = "<input type='hidden' name='" + this.data.name + "[]' value='" + box.value + "'>";
        this.removeEventsListeners();

        if (this.select2) {
            this.destroySelect2();
        }

        for (var key = options.length - 1; key >= 0; key--) {
            if (!options[key].selected) {
                if (!('remove' in Element.prototype)) {
                    options[key].parentNode.removeChild(options[key]);
                } else {
                    box.remove(key);
                }
            }
        }
        box.setAttribute('disabled', 'disabled');
        var newID = "append-select-" + this.data.name + "-selected-" + this.selectedAI;

        box.className += boxClass;
        box.id = newID + "-box";
        button.id = newID + "-remove-button";
        button.className += buttonClass;

        button.innerHTML = this.removeButtonText;

        box.parentNode.innerHTML += hiddenElement;
        this.container.innerHTML += this.box.defaultHtml;
        if (this.select2) {
            this.launchSelect2();
        }
        this.selectedAI++;
        this.filterOptions();
        this.createEventsListeners();
    },
    filterOptions: function () {
        var selectedOptions = document.getElementsByName(this.data.name + "[]");
        var box = document.getElementById(this.box.elementsIDs.box);
        var options = box.getElementsByTagName('option');
        for (var key = 0; key < selectedOptions.length; key++) {
            for (var key2 = options.length - 1; key2 >= 0; key2--) {
                if (options[key2].value === selectedOptions[key].value) {
                    if (!('remove' in Element.prototype)) {
                        options[key2].parentNode.removeChild(options[key2]);
                    } else {
                        options[key2].remove();
                    }
                }
            }
        }
        options = box.getElementsByTagName('option');
        if (!options.length) {
            this.box.elementsIDs.emptyOptions = "append-select-'+this.box.name+'-empty-options";
            box.parentNode.innerHTML = '<select style="width: auto; display: inline;" class="form-control" id="' + this.box.elementsIDs.emptyOptions + '" disabled="disabled"><option>' + this.pickedAllOptionsText + '</option></select>';
        }
    }
};

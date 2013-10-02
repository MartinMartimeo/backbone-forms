/**
 * Select editor
 *
 * Renders a <select> with given options
 *
 * Requires an 'options' value on the schema.
 *  Can be an array of options, a function that calls back with the array of options, a string of HTML
 *  or a Backbone collection. If a collection, the models must implement a toString() method
 */
Form.editors.Select = Form.editors.Base.extend({

  tagName: 'select',

  events: {
      'change': function (event) {
          this.trigger('change', this);
    },
      'focus': function (event) {
          this.trigger('focus', this);
    },
      'blur': function (event) {
          this.trigger('blur', this);
    }
  },

    initialize: function (options) {
        Form.editors.Base.prototype.initialize.call(this, options);

        if (this.schema.collection) {
            this.schema.options = (_.isString(this.schema.collection) && window[this.schema.collection]) ? new window[this.schema.collection]() : this.schema.collection;
        }

        if (!this.schema || !this.schema.options) {
            throw "Missing required 'schema.options'";
        }
    },

    render: function () {
        this.setOptions(this.schema.options);

    return this;
  },

  /**
   * Sets the options that populate the <select>
   *
   * @param {Mixed} options
   */
  setOptions: function (options) {
      var self = this;

    //If a collection was passed, check if it needs fetching
    if (options instanceof Backbone.Collection) {

      //Don't do the fetch if it's already populated
        if (options.length > 0) {
            this.renderOptions(options);
      } else {
            options.fetch({
                success: function () {
                    self.renderOptions(options);
          }
        });
      }
    }

    //If a function was passed, run it to get the options
    else if (_.isFunction(options)) {
        options(function (result) {
            self.renderOptions(result);
      }, self);
    }

    //Otherwise, ready to go straight to renderOptions
    else {
      this.renderOptions(options);
    }
  },

  /**
   * Adds the <option> html to the DOM
   * @param {Mixed} options   Options as a simple array e.g. ['option1', 'option2']
   *                          or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
   *                          or as a string of <option> HTML to insert into the <select>
   *                          or any object
   */
  renderOptions: function (options) {
      var $select = this.$el,
          html;

      html = this._getOptionsHtml(options);

    //Insert options
    $select.html(html);

    //Select correct option
    this.setValue(this.value);
  },

    _getOptionsHtml: function (options) {
        var html;
    //Accept string of HTML
    if (_.isString(options)) {
      html = options;
    }

    //Or array
    else if (_.isArray(options)) {
      html = this._arrayToHtml(options);
    }

    //Or Backbone collection
    else if (options instanceof Backbone.Collection) {
      html = this._collectionToHtml(options);
    }

    else if (_.isFunction(options)) {
      var newOptions;

      options(function(opts) {
        newOptions = opts;
      }, this);

      html = this._getOptionsHtml(newOptions);

    //Or any object
    }else{
      html=this._objectToHtml(options);
    }

    return html;
  },

    /**
     *
     * @param [as_model] get value as model if init as collection
     */
    getValue: function (as_model) {
        return (as_model && this.$el.find(":selected").data("value")) || this.$el.val();
    },

    setValue: function (value) {
        this.$el.val(value);
  },

    focus: function () {
        if (this.hasFocus) return;

    this.$el.focus();
  },

    blur: function () {
        if (!this.hasFocus) return;

    this.$el.blur();
  },

  /**
   * Transforms a collection into HTML ready to use in the renderOptions method
   * @param {Backbone.Collection} collection
   * @return {Array}
   */
  _collectionToHtml: function (collection) {
      var html = [];

      if (this.schema.allowEmpty) {
          html.push('<option></option>');
      }

      //Generate HTML
      collection.each(function (model) {
          var $option = $('<option value="' + model.id + '">' + model.toString() + '</option>');
          $option.data("value", model);
          html.push($option);
      });

      return html;
  },
  /**
   * Transforms an object into HTML ready to use in the renderOptions method
   * @param {Object} obj
   * @return {String}
   */
  _objectToHtml: function(obj) {
    //Convert object to array first
    var array = [];
    for(var key in obj){
      if( obj.hasOwnProperty( key ) ) {
        array.push({ val: key, label: obj[key] });
      }
    }

    //Now convert to HTML
    return this._arrayToHtml(array);
  },



  /**
   * Create the <option> HTML
   * @param {Array} array   Options as a simple array e.g. ['option1', 'option2']
   *                        or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
   * @return {String} HTML
   */
  _arrayToHtml: function (array) {
      var html = [];

    //Generate HTML
      _.each(array, function (option) {
          if (_.isObject(option)) {
        if (option.group) {
            html.push('<optgroup label="' + option.group + '">');
            html.push(this._getOptionsHtml(option.options));
            html.push('</optgroup>');
        } else {
          var val = (option.val || option.val === 0) ? option.val : '';
            html.push('<option value="' + val + '">' + option.label + '</option>');
        }
      }
      else {
              html.push('<option>' + option + '</option>');
          }
    }, this);

    return html.join('');
  }

});

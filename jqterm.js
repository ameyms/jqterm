/**
* jqterm.js v0.2.0 by @ameyms
* Copyright (c) 2013 Amey Sakhadeo http://ameyms.com
*/

if (!jQuery) { throw new Error("JqTerm requires jQuery") }

/* ========================================================================
 * JQterm: jqterm.js v0.2.0
 * http://ameyms.github.com/jqterm
 * ========================================================================
 *
 * Licensed under the MIT license.
 */


(function($, window)
{

    var template = '<div class="jq-term-history"></div><div class="jq-term-prompt" data-jsh="input"><div contenteditable="true" class="jq-term-prompt-input"></div></div>'
    var errTemplate = '<span class="jq-term-err">Error occured</span>';
    var opTemplate = '<span class="jq-term-op"></span>';
    var cmdTemplate = '<span class="jq-term-cmdline"></span>';
    var welcomeTemplate = '<div class="jq-term-welcome"></div>';

    var KeyCodes = {

        ENTER : 13,
        TAB : 9,
        UP : 38,
        DOWN : 40,
        BACKSPACE: 8
    };

    var parseCmd = function (cmdLine)
    {
        var foundQuotes = false
        ,   tokens = []
        ,   temp = ''
        ,   curr = ''
        ,   i = 0
        ,   cmdLine = $.trim(cmdLine);

        for(;i< cmdLine.length; i++)
        {
            curr = cmdLine[i];

            if( curr === ' ' && foundQuotes === false) {
                tokens.push(temp);
                temp = '';
            }

            else if(curr === '"') {

                if(foundQuotes === true) {

                    tokens.push('"'+temp+'"');
                    foundQuotes = false;
                    temp = '';
                }
                else {

                    foundQuotes = true;
                }
            }
            else
            {
                temp+=curr;
            }
        }
        if(temp)
        {
            tokens.push(temp);
        }
        return tokens;
    }

	var normalize = function (text) {

		return text.replace('\\n', '\n').replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/\\n/g, '<br>').replace(/ /g, '&nbsp;');
	}
    var noop = function(data) {

        var promise = $.Deferred();
        promise.resolveWith(data);

        return promise;
    }

    var isIgnorableKey = function(k)
    {
        if(k === KeyCodes.TAB)
        {
            return true;
        }
    }

    var isSpecialCommand = function(cmd) {

        switch(cmd[0])
        {
            case 'clear':
                if(cmd.length === 1)
                {
                    this.clearAll();
                    return true;
                }

            default:
                return false;
        }

    }

    var setWelcomeText = function(text) {

        this.$history.append('<br/>');
        this.$history.append($(welcomeTemplate).html(text))
    };

    var JqTerm = function (el) {

        this.$el = $(el);
        this.interpreter = noop;
        this.historyPtr = -1;
        this.history = [];
        this.format = function (data) {

            return data.output;
        }

    }

    JqTerm.DEFAULTS = {

        

    };


    JqTerm.prototype.init = function (options) {
        
        var self = this;

        options = typeof options === 'object'? options : {};
        options = $.extend({}, JqTerm.DEFAULTS, options);

        this.$input = this.$el.append($(template)).find('.jq-term-prompt-input').keydown(function(e){

            
            if(isIgnorableKey(e.keyCode))
            {
                e.preventDefault();
                //ignore
            }
            else if(e.keyCode === KeyCodes.ENTER)
            {
                e.preventDefault();
                self.fireCommand();
            }
            else if(e.keyCode === KeyCodes.UP)
            {
                self.rewindHistory();
            }
            else if(e.keyCode === KeyCodes.DOWN)
            {
                self.forwardHistory();
            }
            else if(e.keyCode === KeyCodes.BACKSPACE)
            {
                if(self.$input.text().length === 1)
                {
                    e.preventDefault();
                }
            }

            
        });

        self.$el.click(function () {

                self.$input.focus();
        });
            

        if(typeof options.interpreter === 'function') {

            this.interpreter = options.interpreter;

        }

        this.$history = this.$el.find('.jq-term-history');
        this.$prompt = this.$el.find('.jq-term-prompt');
        //this.$el.find('.jq-term-prompt-input::before').css('content', '$');

        if(options.welcome) {
            setWelcomeText.call(this, options.welcome);
        }
        this.clearInputLine();

    };

    JqTerm.prototype.clearAll = function () {

        this.$history.html('');

    };

    JqTerm.prototype.clearInputLine = function () {

        this.$input.html('&nbsp;');
        this.$input.focus();

    };
    JqTerm.prototype.rewindHistory = function () {

        if(+this.historyPtr >= 0)
        {
            this.$input.text(this.history[this.historyPtr]);
            this.historyPtr--;
        }

    };

    JqTerm.prototype.forwardHistory = function () {

        if(this.historyPtr < this.history.length && this.history.length >0)
        {
            this.$input.text(this.history[++this.historyPtr]);
        }

    };

    JqTerm.prototype.togglePrompt = function () {

        this.$prompt.toggle();
        this.$input.focus();
    }

    JqTerm.prototype.fireCommand = function() {
    
        var dfd
        ,   self = this
        ,   cmd = $.trim(this.$input.text())
        ,   tokenizedCmd = cmd?parseCmd(cmd):undefined;

        this.appendCmd(cmd);
        this.clearInputLine();
        
		if(!tokenizedCmd) {
		
			return;
		
		}
		
        if(isSpecialCommand.call(this, tokenizedCmd)) {

            //do nothing else
        }
        else {

            self.togglePrompt();
            dfd = this.interpreter.call(this.$el, tokenizedCmd);

            dfd.done(function (data) {

                self.appendOutput(self.format(data));
                self.togglePrompt();

            });

            dfd.fail(function (jqXhr, err) {

                self.appendError('Failed due to '+err);
                self.togglePrompt();
            });
        }

        if (this.history.length <= 0 || this.history[length-1] !== cmd)
        {
            this.history.push(cmd);
        }

        this.historyPtr = this.history.length-1;

    };


    JqTerm.prototype.appendOutput = function(text) {

		var op = normalize(text)
        this.$history.append($(opTemplate).html(op));
		
    };

    JqTerm.prototype.appendCmd = function(text) {

        if(this.$history.find('.jq-term-cmdline').length > 0) {
            this.$history.append('<br/>');
        }
        this.$history.append($(cmdTemplate).text('$ '+text));
		if($.trim(text))
		this.$history.append('<br/>');

    };

    JqTerm.prototype.appendError = function(errText) {

        this.$history.append('<br/>');
        this.$history.append($(errTemplate).text(errText));
    };

    $.fn.term = function (options) {

        return this.each(function () {

            if($(this).data('terminal') === 'active') {

                throw new Error('Terminal already initialized');
                return;

            }
            else {
                
                $(this).addClass('jq-term-term').attr('contenteditable', false).data('terminal','active');
                var term = new JqTerm($(this));
                term.init(options);
            }
        });
    }


})(jQuery, window);

(function($){
    $.memoryForms = function(el, elements, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("memoryForms", base);
        
        base.init = function(){
            if( typeof( elements ) === "undefined" || elements === null ) elements = base.$el.find('input, select, textarea');
            
            base.elements = elements;
            
            base.options = $.extend({},$.memoryForms.defaultOptions, options);
            
            
            base.setupBindings();
        };
        
        


        base.setupBindings = function(){

            if (! $.jStorage) {
                throw 'jStorage not available!';
            }


            var preservations = {
                'input' : {
                    'getData' : function (element) {
                        if (element.attr('type') == 'checkbox'){
                            return $(element).prop('checked');
                        }
                        else if (element.attr('type') == 'radio'){
                            $('[name="'+$(element).attr('name')+'"]').each(function (i, radio){
                                if ($(radio).attr('id') != $(element).attr('id')){
                                   
                                    $.jStorage.set($(radio).attr('id'), false);
                                }
                            })
                            return $(element).is(':checked');
                        }

                        return $(element).attr('value')
                    },
                    'setData' : function (element, data){
                        if (data == null){return false;}
                        


                        if (element.attr('type') == 'checkbox'){
                            $(element).prop('checked', data);
                        }
                        else if (element.attr('type') == 'radio'){
                            $(element).prop('checked', data);
                        }
                        else {
                            $(element).attr('value', data);
                        }
                    }

                },
                'select' : {
                    'getData' : function (element){
                        var selected = $(element).find('option:selected');
                        selectedIndexes = [];
                        selected.each(function(i, v){
                            selectedIndexes.push($(v).index());
                        });
                        return selectedIndexes;
                    },
                    'setData' : function (element, selectedOptions) {
                        if (selectedOptions != null){
                            $(element).find('option').each(function(i, v){
                                if (selectedOptions.indexOf(i) != -1){
                                    $(v).prop('selected','selected')
                                }
                            });  
                        }
                    }
                },
                'textarea' : {
                    'getData' : function (element){
                        return $(element).val();
                    },
                    'setData' : function (element, data){
                        $(element).val(data);
                    }
                }
            }




            $(this.elements).each(function(i, element){
                if ($(element).attr('id') != undefined)
                {   
                    $(element).bind('change.memoryForms', function (e){
                        $.jStorage.set($(this).attr('id'), preservations[$(this)[0].tagName.toLowerCase()].getData($(this)));
/*                         console.log(base); */
                        if (base.options.TTL != undefined && typeof(base.TTL) === 'number') {
/*                         console.log('set', base.options.TTL); */
	                         $.jStorage.setTTL($(this).attr('id'), base.options.TTL);
                        }
                    });

/*                     console.log($.jStorage.getTTL($(element).attr('id')),$(element).attr('id')); */
                    if ($.jStorage.getTTL($(element).attr('id')) > 0){
                    	preservations[$(element)[0].tagName.toLowerCase()].setData($(element), $.jStorage.get($(element).attr('id')));
                    }
                }
            });

            base.$el.bind('submit',function (e){
                $.jStorage.flush();
            });

        };
        
        // Run initializer
        base.init();
    };
    
    $.memoryForms.defaultOptions = {

    };
    
    $.fn.memoryForms = function(elements, options){
        return this.each(function(){
            (new $.memoryForms(this, elements, options));
        });
    };
    
})(jQuery);
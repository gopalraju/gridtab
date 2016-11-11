/*
  Version: 1.0.0
   Author: Gopal Raju
  Website: http://www.productivedreams.com
     Docs: https://gopalraju.github.io/gridtab
     Repo: https://gopalraju.github.io/gridtab
   Issues: https://gopalraju.github.io/gridtab/issues

  */
;
(function($, window, document, undefined) {

    // Check instance count
    var instanceCount = 0,
        gridtab = 'gridtab',
        defaults = {
            grid: 4,
            borderWidth: 2,
            tabBorderColor: "#ddd",
            tabPadding: 25,
            contentBorderColor: "#ddd",
            contentPadding: 25,
            contentBackground: "#fff",
            activeTabBackground: "#fff",
            keepOpen: false,
            speed: 500,
            layout: 'grid',
            activeTab: 0,
            responsive: null,
            callbacks: {
                open: false,
                close: false
            }


        };

    // The Gridtab constructor
    function Gridtab(element, options) {
        var _ = this;
        _.element = element;
        _.options = $.extend({}, defaults, options);
        _.defaults = defaults;
        _.name = gridtab;
        _.cssRules = '';
        _.breakpoints = [];
        _.activeTab = _.options.activeTab - 1;
        _.tabs = $(_.element).find('> dt');
        _.contents = $(_.element).find('> dd');
        _.init();
        _.generateStylesheet(_.cssRules);
        _.setContentOrder();
        instanceCount++;
    }
    /**
     * Initializes Gridtab plugin
     */
    Gridtab.prototype.init = function() {
        var _ = this;
        $(_.element).addClass('gridtab gridtab--' + instanceCount);
        _.setTabOrder();
        _.addCssRules(_.options.grid, _.options.borderWidth, _.options.tabPadding, _.options.tabBorderColor, _.options.contentPadding, _.options.contentBorderColor, _.options.contentBackground, _.options.activeTabBackground, null);
        _.responsiveBreakpoints();
        //If activeTab value exists and is less than total number of tabs
        if (_.activeTab > -1 && _.activeTab < _.tabs.length) {
            _.slideContent(_.tabs[_.activeTab]);
        }
        $(_.element).on('click', '> dt', function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            _.slideContent(this);
        });
    };

    /**
     * Sets the order of the content based on grid count
     */
    Gridtab.prototype.setContentOrder = function() {
        var _ = this,
            //Container width divided by first element width
            grid = Math.round($(_.element).outerWidth() / $($(_.element).children()[0]).outerWidth()),
            rowCount = Math.ceil(_.contents.length / grid);
        for (var i = 0; i < rowCount; i++) {
            //Select first n elements, second n elements etc and set order
            _.contents.slice(i * grid, grid * (i + 1)).css('order', '' + ((i + 1) * grid));
        }
    };
    /**
     * Sets the order of each tab
     */
    Gridtab.prototype.setTabOrder = function() {
        var _ = this;
        //Iterate through each tab and set flex order for each tab
        _.tabs.each(function(i) {
            $(this).css('order', '' + i);
        });
    };
    /**
     * Generate CSS rules
     */
    Gridtab.prototype.addCssRules = function(grid, borderWidth, tabPadding, tabBorderColor, contentPadding, contentBorderColor, contentBackground, activeTabBackground, breakpoint) {
        var _ = this;
        if (grid !== null || borderWidth !== null || tabPadding !== null || tabBorderColor !== null || contentBorderColor !== null || contentPadding !== null || contentBackground !== null || activeTabBackground !== null) {
            var cssRules = '';
            if (grid !== null || borderWidth !== null || tabBorderColor !== null || tabPadding !== null) {
                //Container Styles
                (borderWidth !== null) && (cssRules += '.gridtab--' + instanceCount + '{padding:' + borderWidth + 'px 0 0 ' + borderWidth + 'px;}');
                //Tab Styles
                var tabWidth = '';
                (grid !== null) && (tabWidth = Math.floor((100 / grid) * 100) / 100);
                cssRules += '.gridtab--' + instanceCount + ' > dt{';
                (borderWidth !== null) && (cssRules += 'margin:-' + borderWidth + 'px 0 0 -' + borderWidth + 'px;');
                (grid !== null) && (cssRules += 'min-width:calc(' + tabWidth + '% + ' + borderWidth + 'px);flex-basis:' + tabWidth + '%;-ms-flex-basis:' + tabWidth + '%;');
                (borderWidth !== null) && (cssRules += 'border-width:' + borderWidth + 'px;');
                (tabPadding !== null) && (cssRules += 'padding:' + tabPadding + 'px;');
                (tabBorderColor !== null) && (cssRules += 'border-color:' + tabBorderColor + ';');
                cssRules += '}';
            }
            //active Tab Styles
            (activeTabBackground !== null) && (cssRules += '.gridtab--' + instanceCount + ' >dt.is-active{background:' + activeTabBackground + ';}');
            (_.options.layout == 'tab' && activeTabBackground !== null && borderWidth !== null) && (cssRules += '.gridtab--' + instanceCount + ' >dt.is-active:after{background:' + activeTabBackground + ';height:' + borderWidth + 'px;bottom:-' + borderWidth + 'px;}');
            //Content Styles
            if (contentBorderColor !== null || borderWidth !== null || contentBackground !== null || contentPadding !== null) {
                cssRules += '.gridtab--' + instanceCount + '>dd{';
                cssRules += 'min-width:calc(100% + ' + borderWidth + 'px);';
                (borderWidth !== null) && (cssRules += 'margin:-' + borderWidth + 'px 0 0 -' + borderWidth + 'px !important;border-width:' + borderWidth + 'px;');
                (contentBorderColor !== null) && (cssRules += 'border-color:' + contentBorderColor + ';');
                (contentPadding !== null) && (cssRules += 'padding:' + contentPadding + 'px;');
                (contentBackground !== null) && (cssRules += 'background:' + contentBackground + ';');
                cssRules += '}';
            }
            //If has breakpoints generate mediaquery
            _.cssRules += (breakpoint !== null) ? ('@media (max-width:' + breakpoint + 'px){' + cssRules + '}') : cssRules;
        }
    };
    /**
     * Generate Stylesheet and append CSS rules
     */
    Gridtab.prototype.generateStylesheet = function(cssRules) {
        var style = $('head').append('<style>' + cssRules + '</style>');
    };

    /**
     * For each breakpoint add CSS rules and set content order
     */
    Gridtab.prototype.responsiveBreakpoints = function() {
        var _ = this;
        if (_.options.responsive && _.options.responsive.length) {
            //Sort Responsive Options by MediaQuery in descending order
            _.options.responsive.sort(function(a, b) {
                return parseFloat(b.breakpoint) - parseFloat(a.breakpoint);
            });
            for (var i in _.options.responsive) {
                var responsiveSettings = _.options.responsive[i].settings,
                    grid = responsiveSettings.grid || null,
                    borderWidth = responsiveSettings.borderWidth || _.options.borderWidth,
                    tabBorderColor = responsiveSettings.tabBorderColor || null,
                    tabPadding = responsiveSettings.tabPadding || null,
                    activeTabBackground = responsiveSettings.activeTabBackground || null,
                    contentPadding = responsiveSettings.contentPadding || null,
                    contentBorderColor = responsiveSettings.contentBorderColor || null,
                    contentBackground = responsiveSettings.contentBackground || null,
                    breakpoint = _.options.responsive[i].breakpoint || null;
                _.addCssRules(grid, borderWidth, tabPadding, tabBorderColor, contentPadding, contentBorderColor, contentBackground, activeTabBackground, breakpoint);
                _.breakpoints.push(breakpoint);
                window.matchMedia("(max-width:" + _.breakpoints[i] + "px)").addListener(function() {
                    _.setContentOrder();
                });
            }
        }
    };
    /**
     * Slide up and slide down contents based on tab clicked
     */
    Gridtab.prototype.slideContent = function(currTab) {

        var _ = this,
            $currTab = $(currTab),
            $prevTab = $(_.element).find('>dt.is-active').not(currTab);

        if (!$currTab.hasClass('is-disabled')) {
            //If an active tab already exists
            if ($prevTab.length) {
                _.tabs.addClass('is-disabled');
                $prevTab.next().stop(true).slideUp(_.options.speed, function() {
                    $prevTab.removeClass('is-active');
                    _.tabs.next().stop(true);
                    (_.options.callbacks.close) && (_.options.callbacks.close.call(this));
                    $currTab.addClass('is-active').next().stop(true).slideDown(_.options.speed, function() {
                        (_.options.callbacks.open) && (_.options.callbacks.open.call(this));
                        _.tabs.removeClass('is-disabled');
                        return false;
                    });
                    return false;

                });

            } else {
                if (_.options.keepOpen) {
                    $currTab.addClass('is-active').next().stop(true).slideDown(_.options.speed, function() {
                        (_.options.callbacks.open) && (_.options.callbacks.open.call(this));
                    });
                    return false;
                } else {
                    _.tabs.addClass('is-disabled');
                    $currTab.addClass('is-active').next().stop(true).slideToggle(_.options.speed, function() {

                        if ($(this).is(':hidden')) {
                            $currTab.removeClass('is-active');
                            (_.options.callbacks.close) && (_.options.callbacks.close.call(this));
                        } else {
                            (_.options.callbacks.open) && (_.options.callbacks.open.call(this));
                        }
                        _.tabs.removeClass('is-disabled');
                        return false;
                    });
                }

            }


            return false;
        }
    };

    $.fn[gridtab] = function(options) {
        return this.each(function() {

            if (!$.data(this, 'plugin_' + gridtab)) {
                $.data(this, 'plugin_' + gridtab,
                    new Gridtab(this, options));
            }
        });

    };

})(jQuery, window, document);

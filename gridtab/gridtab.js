/*
  Version: 2.1.1
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
      contentPadding: 35,
      contentBackground: "#fff",
      activeTabBackground: "#fff",
      responsive: null,
      selectors: {
        tab: '>dt',
        closeButton: '.gridtab__close',
        nextArrow: '.gridtab__next.gridtab__arrow',
        prevArrow: '.gridtab__prev.gridtab__arrow',
        disabledArrow: '.is-disabled'
      },
      config: {
        layout: 'grid',
        keepOpen: false,
        speed: 500,
        activeTab: 0,
        showClose: false,
        showArrows: false,
        scrollToTab:false,
        rtl:false
      },
      callbacks: {
        open: false,
        close: false
      }
    };

  // The Gridtab constructor
  function Gridtab(element, options) {
    var _ = this;
    _.element = element;
    _.options = $.extend(true, {}, defaults, options);
    _.defaults = defaults;
    _.name = gridtab;
    _.cssRules = '';
    _.breakpoints = [];
    _.grids = [];
    _.activeTab = _.options.config.activeTab - 1;
    _.tabs = $(_.element).find('> dt');
    _.contents = $(_.element).find('> dd');
    _.init();
    _.generateStylesheet(_.cssRules);
    instanceCount++;
  }
  /**
   * Initializes Gridtab plugin
   */
  Gridtab.prototype.init = function() {
    var _ = this;
    $(_.element).addClass('gridtab gridtab--' + instanceCount);
    (_.options.config.rtl) && ($(_.element).attr('dir','rtl'));
    _.setTabOrder();
    _.showControls();
    _.addCssRules(_.options.grid, _.options.borderWidth, _.options.tabPadding, _.options.tabBorderColor, _.options.contentPadding, _.options.contentBorderColor, _.options.contentBackground, _.options.activeTabBackground, null);
    (_.options.responsive !== null) ? _.responsiveBreakpoints() : _.setContentOrder(_.options.grid);


    //If activeTab value exists and is less than total number of tabs
    if (_.activeTab > -1 && _.activeTab < _.tabs.length) {
      _.slideContent(_.tabs[_.activeTab], false, false);
    }

    $(_.element).on('click', _.options.selectors.tab, function(e) {
      //if selector has href, prevent jump
      ($(this).attr('href')) && (e.preventDefault());
      e.stopPropagation();
      e.stopImmediatePropagation();
      _.slideContent($(this).closest('dt'), false, _.options.config.scrollToTab);
    });

  };

  /**
   * Show Controls (prev,next and close)
   */
  Gridtab.prototype.showControls = function() {
    var _ = this;

    if (_.options.config.showClose || _.options.config.showArrows) {

      var controlsGroup = $('<div class="gridtab__controls"></div>').appendTo(_.contents);
      //If showClose is set to true
      if (_.options.config.showClose) {
        $('<a class="' + _.options.selectors.closeButton.replace(/\./g, ' ') + '" href="#">Close</a>').appendTo(controlsGroup);
      }

      //If showArrows is set to true
      if (_.options.config.showArrows) {
        //If items exist and the count is greater than or equal to 2
        if (_.contents.length && _.contents.length >= 2) {
          var nextArrow = _.options.selectors.nextArrow.replace(/\./g, ' '),
            prevArrow = _.options.selectors.prevArrow.replace(/\./g, ' '),
            disabledArrow = _.options.selectors.disabledArrow.replace(/\./g, ' '),
            prevElem = '<a class="' + prevArrow + '" title="previous" href="#">Prev</a>',
            nextElem = '<a class="' + nextArrow + '" title="next" href="#">Next</a>',
            prevDisabled = '<span class="' + prevArrow + ' ' + disabledArrow + '">Prev</span>',
            nextDisabled = '<span class="' + nextArrow + ' ' + disabledArrow + '">Next</span>';
          //If there are more than 2 items add both (prev and next) arrows to all items from second to second last
          if (_.contents.length > 2) {
            $(prevElem + nextElem).appendTo(_.contents.slice(1, -1).find(controlsGroup));
          }
          //For the last item add prev and next arrows, but keep next disabled
          $(prevElem + nextDisabled).appendTo($(_.contents[_.contents.length - 1]).find(controlsGroup));
          //For the first item add prev and next arrows, but keep prev disabled
          $(prevDisabled + nextElem).appendTo($(_.contents[0]).find(controlsGroup));
        }
      }

      $(controlsGroup).on('click', 'a', function(e) {
        e.preventDefault();
        var currIndex = _.contents.index($(this).parent().parent());
        //If clicked item is prev arrow, slide the prev content
        if ($(this).hasClass(prevArrow)) {
          _.slideContent(_.tabs[currIndex - 1], false, _.options.config.scrollToTab);
        }
        //else if next arrow, slide the next
        else if ($(this).hasClass(nextArrow)) {
          _.slideContent(_.tabs[currIndex + 1], false, _.options.config.scrollToTab);
        }
        //else it's a close button
        else {
          _.slideContent(_.tabs[currIndex], true, false);
        }
      });


    }
  };

  /**
   * Sets the order of the content based on grid count
   */
  Gridtab.prototype.setContentOrder = function(grid) {
    var _ = this,
      //Container width divided by first element width
      rowCount = Math.ceil(_.contents.length / grid);
    for (var i = 0; i < rowCount; i++) {
      //Select first n elements, second n elements etc and set order
      var j = i + 1;
      _.contents.slice(i * grid, grid * j).css({'order': '' + (j * grid), 'flex-order': '' + (j * grid)});
    }
  };
  /**
   * Sets the order of each tab
   */
  Gridtab.prototype.setTabOrder = function() {
    var _ = this;
    //Iterate through each tab and set flex order for each tab
    _.tabs.each(function(i) {
      $(this).css({'order': '' + i, 'flex-order':'' + i});
    });
  };
  /**
   * Generate CSS rules
   */
  Gridtab.prototype.addCssRules = function(grid, borderWidth, tabPadding, tabBorderColor, contentPadding, contentBorderColor, contentBackground, activeTabBackground, breakpoint) {
    var _ = this;
    if (grid !== null || borderWidth !== null || tabPadding !== null || tabBorderColor !== null || contentBorderColor !== null || contentPadding !== null || contentBackground !== null || activeTabBackground !== null) {
      var cssRules = '';
      var tabWidth = '';
      (grid !== null) && (tabWidth = Math.floor((100 / grid) * 100) / 100);
      if (grid !== null || borderWidth !== null || tabBorderColor !== null || tabPadding !== null) {
        //Container Styles
        (borderWidth !== null) && (cssRules += '.gridtab--' + instanceCount + '{padding:' + borderWidth + 'px 0 0 ' + borderWidth + 'px;}');
        //Tab Styles
        cssRules += '.gridtab--' + instanceCount + ' > dt{';
        (borderWidth !== null) && (cssRules += 'margin:-' + borderWidth + 'px 0 0 -' + borderWidth + 'px;');
        (grid !== null) && (cssRules += 'min-width:calc(' + tabWidth + '% + ' + borderWidth + 'px);width:calc(' + tabWidth + '% + ' + borderWidth + 'px);');
        (borderWidth !== null) && (cssRules += 'border-width:' + borderWidth + 'px;');
        (tabPadding !== null) && (cssRules += 'padding:' + tabPadding + 'px;');
        (tabBorderColor !== null) && (cssRules += 'border-color:' + tabBorderColor + ';');
        cssRules += '}';
      }
      //active Tab Styles
      (activeTabBackground !== null) && (cssRules += '.gridtab--' + instanceCount + ' >dt.is-active{background:' + activeTabBackground + ';}');
      (_.options.config.layout == 'tab' && activeTabBackground !== null && borderWidth !== null) && (cssRules += '.gridtab--' + instanceCount + ' >dt.is-active:after{background:' + activeTabBackground + ';height:' + borderWidth + 'px;bottom:-' + borderWidth + 'px;}');
      //Content Styles
      if (contentBorderColor !== null || borderWidth !== null || contentBackground !== null || contentPadding !== null) {
        cssRules += '.gridtab--' + instanceCount + '>dd{';
        cssRules += 'min-width:calc(' + (tabWidth * grid) + '% + ' + borderWidth + 'px);max-width:calc(' + (tabWidth * grid) + '% + ' + borderWidth + 'px);';
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
      var mqls = [];

      function getBreakpoint() {
        var bpArray = [];
        mqls.filter(function(el) {

          //If breakpoint matches convert it to number and push the breakpoint to bpArray
          if (el.matches) {
            bpArray.push(parseInt(el.media.replace(/[^\d.]/g, '')));
          }


        });


        //If bpArray exists, find the smallest breakpoint and its index in -.breakpoints
        //else use the default grid value from options
        var grid = (bpArray.length ? _.grids[_.breakpoints.indexOf(Math.min.apply(null, bpArray))] : _.options.grid);

        _.setContentOrder(grid);
      }

      for (var i in _.options.responsive) {
        var responsiveSettings = _.options.responsive[i].settings,
          grid = responsiveSettings.grid || _.options.grid,
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
        _.grids.push(grid);
        mqls.push(window.matchMedia("(max-width:" + _.breakpoints[i] + "px)"));
        getBreakpoint(window.matchMedia("(max-width:" + _.breakpoints[i] + "px)"));
      }

      //For each MedaiQuery
      for (var i = 0; i < mqls.length; i++) { // loop through queries
        mqls[i].addListener(getBreakpoint) // call handler function whenever the media query is triggered;
      }

    }
  };
  /**
   * Scroll to active tab
   */
  Gridtab.prototype.scrollToTab = function() {
    var _ = this;
    var page = $('html, body');
    page.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function() {
      page.stop();
    });
    page.animate({
      scrollTop: $(_.element).find('.is-active').offset().top
    }, 1000, function() {
      page.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove");
    });
  };
  /**
   * Slide up and slide down contents based on tab clicked
   */
  Gridtab.prototype.slideContent = function(currTab, closeBtnClick, scrollToTab) {
    var _ = this,
      $currTab = $(currTab),
      $prevTab = $(_.element).find('>dt.is-active').not(currTab);
    if (!$currTab.hasClass('is-disabled')) {
      //If an active tab already exists
      if ($prevTab.length) {
        //Keep all tabs disabled while the transition happens
        _.tabs.addClass('is-disabled');
        $prevTab.next().stop(true).slideUp(_.options.config.speed, function() {
          $prevTab.removeClass('is-active');
          _.tabs.next().stop(true);
          (_.options.callbacks.close) && (_.options.callbacks.close.call(this));
          $currTab.addClass('is-active').next().stop(true).slideDown(_.options.config.speed, function() {
            (_.options.callbacks.open) && (_.options.callbacks.open.call(this));
            (scrollToTab) && (_.scrollToTab());
            //Remove disabled after transition is complete
            _.tabs.removeClass('is-disabled');
            return false;
          });
          return false;

        });

      } else {
        //If keepOpen is true and close button is not clicked
        if (_.options.config.keepOpen && !closeBtnClick) {
          if (!$currTab.hasClass('is-active')) {
            $currTab.addClass('is-active').next().stop(true).slideDown(_.options.config.speed, function() {
              (_.options.callbacks.open) && (_.options.callbacks.open.call(this));
              (scrollToTab) && (_.scrollToTab());
            });
            return false;
          }
        } else {
          //Keep all tabs disabled while the transition happens
          _.tabs.addClass('is-disabled');
          $currTab.toggleClass('is-active').next().stop(true).slideToggle(_.options.config.speed, function() {

            if ($(this).is(':hidden')) {
              (_.options.callbacks.close) && (_.options.callbacks.close.call(this));

            } else {
              (_.options.callbacks.open) && (_.options.callbacks.open.call(this));
              (scrollToTab) && (_.scrollToTab());
            }
            //Remove disabled after transition is complete
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

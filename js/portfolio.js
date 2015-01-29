(function($, window){
    'use strict';
    
    var isTouch = !!("ontouchstart" in window) || !!(navigator.msMaxTouchPoints);
    var cookie = {
        get: function(name) {
          var value = "; " + document.cookie;
          var parts = value.split("; " + name + "=");
          if (parts.length == 2){
            return parts.pop().split(";").shift();
          }  
        },
        set: function(name, value, props) {
            props = props || {};
            var exp = props.expires;
            if (typeof exp == "number" && exp) {
                var d = new Date();
                d.setTime(d.getTime() + exp*1000);
                exp = props.expires = d;
            }

            if(exp && exp.toUTCString){
                props.expires = exp.toUTCString();
            }
        
            //value = encodeURIComponent(value);
            var updatedCookie = name + "=" + value;
            for(var propName in props){
                updatedCookie += "; " + propName;
                var propValue = props[propName];
                if(propValue !== true){
                    updatedCookie += "=" + propValue;
                }
            }
            document.cookie = updatedCookie;
        }
    };

    function utms(){
        var params = location.search.match(/[^&?][utm].*?=[^&?]*/g);
        var from;
        if(params){
            var splited,
                i = 0;
        
            from = {};
        
            for(; i<params.length; i++){
                splited = params[i].split('=');
                from[splited[0]] = splited[1];
            }
            
            cookie.set('from', JSON.stringify(from), {path: '/'});
        }else{
            from = cookie.get('from');
            if(from){
                from = JSON.parse(from);
            }
        }
        return from;
    }

    $.fn.imgLoad = function(options){

        if(!options.items) return;

        var defaults = {
            items: [],
            event: 'scroll',
            attr: 'data-original',
            limit: 0,
            trigger: false,
            load: function (item, src){
                item.src = attr;    
            }
        };

        $.extend(defaults, options);

        var container = this;
        var items = defaults.items;

        function update(){
            var len = items.length,
                info = getInfo($(this)),
                remove = false,
                i = 0,
                item;

            if(len){
                for(i; i < len; i++){
                    item = items[i];
 
                    var rect = {left: item.offsetLeft + item.offsetWidth, top: item.offsetTop + item.offsetHeight},
                        top = (rect.top  > info.top && rect.top < info.bottom),
                        left = (rect.left > info.left && rect.left < info.right);

                    if(left && top){
                        defaults.load(items[i], items[i].getAttribute(defaults.attr), i);
                        if(remove === false){
                            remove = [i, 1];
                        }else{
                            remove[1]++;
                        }
                    }
                }
                if(remove){
                    items.splice(remove[0], remove[1]);
                }
            }
        } 

        function getInfo(el){
            var rect = {top: el.scrollTop(), left: el.scrollLeft()};
            var limit = defaults.limit;
            rect.bottom = limit + rect.top + el.height();
            rect.right = limit + rect.left + el.width();
            rect.top = rect.top - limit;
            rect.left = rect.left - limit;
            return rect;
        }

        update.call(container[0]);

        defaults.event && container.on(defaults.event, update);

        $(window).resize(function(){
            update.call(container[0]);
        });
        
        if(defaults.trigger){
            $(document).on(defaults.trigger, function(event, data){
                if(data){
                    if(data.add){
                        items = items.add(data.add);
                    }else if(data.replace){
                        items = data.replace;
                    }
                    if(data.limit){
                        defaults.limit = data.limit;
                    }
                }
                update.call(container[0]);
            });
        }$
    }
        
    $.fn.brief = function(){
        var self = this,
            current = 1,
            checkboxes = this.find('.brief__checkbox');

        /*добавляем ссылки*/
        /*window.projects.then(function(data){
            var links = {0: [], 1: [], 2: []};
            $.each(data, function(index, item){
                if(item.hasOwnProperty('project_type')){
                    var type = {'Мобильный бизнес-сайт': 0, 'Мобильный промо-сайт': 1, 'Мобильный интернет-магазин': 2}[item.project_type];
                    if(type != undefined){
                        links[type].push(['<a href="/portfolio-item?itemId=', item.id, '">', item.name, '</a>'].join(''));
                    } 
                }
            });
            self.find('.brief__info .brief__info__links').each(function(index, item){
                if(links[index]){
                    item.innerHTML = links[index].slice(-5).join(', ');   
                }
            });
        });*/
        
        /*если есть метки добавляем поля*/
        var from = utms();
        
        if(from){
            var hiddenFields = [];
            var ids = {utm_source: 'f13', utm_medium: 'f14', utm_campaign: 'f15', utm_term: 'f16', utm_content: 'f17'};
            
            $.each(from, function(index, item){
                hiddenFields.push('<input type="hidden" name="', ids[index], '" value="', item,'"/>');
            }); 
            this.append(hiddenFields.join(''));
        };
        
        var nextStep = self.find('.brief__button--next');   
        var tabFields = this.find('.brief-step--form input[type="text"]');
            
        $(document).on('keydown', function(e){
            if(e.keyCode == 9){
                if(current == 1){
                    var index = checkboxes.filter(':checked').attr('checked', null).index('.brief__checkbox') + 1;
                    $(checkboxes[index > checkboxes.size() - 1 ? 0 : index ]).attr('checked', true).trigger('change'); 
                }else if(current == 4){
                    var tabIndex = document.activeElement ? document.activeElement.getAttribute('tabindex') : null;
                    var index = +(tabIndex != null ? tabIndex : -1) + 1;
                    tabFields[index > tabFields.size() -1 ? 0 : index].focus();
                }
                e.preventDefault();
            }  
        });
    
        this.on('click', '.brief__button', function(e){
            var type = checkboxes.filter(':checked').val(),
                next = current + (this.className.indexOf('brief__button--prev') + 1 ? -1 : 1);

            if(next < 3 && type){
                current = next;

                if(current == 2){
                    var price = self.find('.brief__price--'+type).val().split(',').join(' — ') + ' тыс.рублей';
                    var time = self.find('.brief__time').val().split(',').join(' — ') + ' месяца';



                    var description = self.find('.brief__info--' + type + ' .brief__info__description').clone();
                    description.find('.brief__info__title').toggleClass('brief__info__title brief__site__title').prepend('<img height="42" src="/public/images/brief/ico_' + ({company: 'company', promo: 'promo', shop: 'shop'})[type] + '.png" />');
                    console.log(type);
                    self.find('.brief__result').html([
                        description.html(), 
                        '<table class="brief__step--4__table"><tr><td><h3 class="brief__site__title">Ваш бюджет:</h3><div class="brief__step--4__icon"><img src="/public/images/brief/ico_price.png" /></div>',
                        price, 
                        '</td><td><h3 class="brief__site__title">Ваши сроки:</h3><div class="brief__step--4__icon"><img src="/public/images/brief/ico_time.png" /></div>',
                        time,
                        '</td></tr></table>'
                    ].join(''));
                }
                self[0].className = 'brief brief--' + current + (current == 2 ? ' brief--' + type : '');;

            }else if(self[0].className.indexOf('brief--submited') == -1){

                if(self[0].checkValidity()){
                    var params = {submit: 'submit'};
                    self.serializeArray().forEach(function(item){
                        params[item.name] = item.value;
                    });
                    $.post(self.attr('action'), params);
                    self[0].className += ' brief--submited';
                }else{
                    self.addClass('form--validate');
                }
            }
    
            e.preventDefault();
            e.stopPropagation();
        });
        
        $('.brief__button_f').on('click', function(){
            nextStep.trigger('click');
        });
            
        $('.label-box label').click(function() {
            $('.label-box label').removeClass('active');
            $(this).addClass('active');
            var type = checkboxes.filter(':checked').val();
            $('.toggle_sl').removeClass('active');
            $('.brief__price--'+type).parents('.toggle_sl').addClass('active');

        }); 
        /*var typeSite = location.search.replace('?type=', '');
        if(typeSite){
            $(checkboxes[typeSite]).trigger('click');
            nextStep.trigger('click');            
        }*/
        var type = checkboxes.filter(':checked').val();
        var months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        this.find('.slider').slider({tooltip_split: true, formater: function(val){
            var format = this.element.attr('data-format'); 
            if(format == 'date'){
                var date = new Date(),
                    year = date.getFullYear(),
                    month = date.getMonth() - 1 + val;
    
                if(month > 11){
                    month =  month - 12;
                    year += 1;
                }
                return [months[month], year].join(' ');;
            }else{

                    return [val, (format || '')].join(' ');

                
            }
        },
        min: (type == 'company'?50:200),
        max: (type == 'company'?250:400)
        });
    };
    
    $.fn.initMaps = function(){
        var map = new window.google.maps.Map(this[0], {
            disableDefaultUI: true,
            center: new google.maps.LatLng(55.776, 37.505), 
            zoom: 14,
            styles: [{
                "elementType": "labels",
                "stylers": [{
                    "visibility": "off"
                }]
                }, {
                    "featureType": "transit.station.rail",
                    "elementType": "labels",
                    "stylers": [{
                        "visibility": "on"
                    }]
                }, {
                "featureType": "landscape.man_made",
                "stylers": [
                  { "hue": "#ffc300" },
                  { "lightness": -20 },
                  { "saturation": 35 }
                ]
              }, {
                "featureType": "poi",
                "stylers": [{
                    "color": "#ddbe6e"
                }]
            }, {
                "featureType": "water",
                "stylers": [{
                    "color": "#c9dbda"
                }]
            }, {
                "featureType": "road",
                "stylers": [{
                    "color": "#ffffff"
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "color": "#ddbe6e"
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "color": "#ffffff"
                }, {
                    "visibility": "on"
                }]
            }, {
                "featureType": "road.arterial",
                "stylers": [{
                    "weight": 2.3
                }]
            }, {
                "featureType": "road.local",
                "stylers": [{
                    "weight": 0.3
                }]
            }, {
                "featureType": "road.highway",
                "stylers": [{
                    "weight": 2.5
                }]
            }, {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#ddbe6e"
                }, {
                    "visibility": "on"
                }]
            }, {
                "featureType": "road.arterial",
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "color": "#ffffff"
                }]
            }, {
                "featureType": "transit.station.rail",
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "color": "#f48080"
                }]
            }]
        });

        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(55.7663, 37.5325),
          map: map
        });
    }
    
    $.fn.pageScroll = function(options){
        var $this = this,
            breakpoints = [],
            scroll = $('html body'),
            path = options.path ? this[0].location.pathname.split('/')[1] : this[0].location.hash.slice(1),
            sections = $(options.section),
            current = {index: 0, active: false};
    
        sections.each(function(index, item){
            //by path active
            if(item.id == path){
                current.index = index;
            }
            
            item.id && breakpoints.push({
                id: '#' + item.id,
                position: item.offsetTop
            });
        });

        function activateMenu(top){
            var len = breakpoints.length;
            var item;
            while(len--){
                item = breakpoints[len];
                if(top >= item.position){
                    $this.trigger('links-update', item.id);
                    current = {index: len, active: false};
                    break;
                }
               
            }
        }
        
        function animateScroll(){
            var item = breakpoints[current.index];
            if(item){ //not page
                current.active = true;
                scroll.stop().animate({'scrollTop': item.position}, function(){
                    location.hash = item.id;
                    current.active = false;
                    $this.trigger('links-update', item.id); 
                });
            }
        }
    
        this.on('click', '.anchor-scroll', function (e){
            e.preventDefault();
            if(current.active) return;
            /* about section hardcode reset */
            if(this.hash == '#about') {
                move('#about_company').translate(0).duration('2s').end();
                move('#about_team').translate(0).duration('2s').end();
                move('#about_feedback').translate(0).duration('2s').end();
                move('#about_office').translate(0).duration('2s').end();
                move('#about_index').translate(0).duration('2s').end();
            };
            /* /about section hardcode reset */
            for(var i = 0; i < breakpoints.length; i++){
                if(breakpoints[i].id == this.hash){
                    current = {index: i, active: true};
                    animateScroll();
                    break;
                }
            }
        });
        
        if(!isTouch){ 
            var timeout;
            var lock;
            document.body.style.overflow = 'hidden';
    
            this.on('mousewheel DOMMouseScroll', function(e){
                if(!lock){
                    var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
                    if(current.active || (!current.index && delta > 0) || (current.index == breakpoints.length - 1 && delta < 0)){
                        return
                    }
            
                    current.index += (delta < 0 ? 1 : -1);
                    
                    animateScroll();
                    lock = true;
                }
                clearTimeout(timeout);
                timeout = setTimeout(function(){
                    lock = false;
                }, 60);
            });
        }else{
            $(window).on('scroll', function(){
                if(!current.active){
                    activateMenu(this.scrollY);
                }
            });
        }
        
        animateScroll();
        return this;
    };

    $.fn.portfolio = function (data, params){
        if(!data) return;
        
        //categories
        var year, 
        	item, 
        	category,
        	categories = {'years': {title: 'По годам', sub: {}}}; 

        for(var i = 0; i < data.length; i++){
            item = data[i];
            item.cats = {}; //add cats;
            if(item.date){
                year = item.date.split('.')[2];
                item.cats[year] = year;
                
                delete categories.years;// ! delete
                categories[year] = {title: year};// !delete
                //categories.years.sub[year] = {title: year}; // uncoment
            }/* uncoment
            for(var j = 0; j < item.categories.length; j++){
                category = item.categories[j];
                item.cats[category.id] = category.title;
                categories[category.id] = {title: category.title};
            }*/
        }

        //write categories
	    function buildCategories(obj, reverse){
	        var tmp = [];
	        for(var category in obj){
	            if(obj[category].sub){
	                tmp.push('<span class="portfolio__filter" data-category="subcategory">' + obj[category].title + '<span class="portfolio__filter--subcategory">' + buildCategories(obj[category].sub, true) + '</span></span>');
	            }else{
	                tmp.push('<span class="portfolio__filter" data-category="' + category + '">' + obj[category].title + '</span>');
	            }
	        }
	        return (reverse ? tmp.reverse() : tmp).join('');
	    }

	    var $this = this;
		var $scroller = $this.find('.scroller');
		var source = data; //sorted data;
		var filtered = []; //filtered data

		var currentPage = 0;
		var positions = [];
		var templates = {
	        'image': '<a href="portfolio-item?itemId={id}" class="portfolio__page" data-original="{project_img_big}"><div class="portfolio__details"><div class="portfolio__details__title">{name}</div><div class="portfolio__details__desc">{project_type}<div class="portfolio__details__date">{date}</div></div></div></a>',
	        'tile':  '<a href="portfolio-item?itemId={id}" class="portfolio__tile {cls}" style="background-size: cover; background-image: url({image})"><div class="portfolio__details"><div class="portfolio__details__title">{name}</div><div class="portfolio__details__desc">{type}<div class="portfolio__details__date">{date}</div></div></div></a>'
	    };
        
		function tileSort(data){
		    var tiles = {result: [], tmp: []},
		        len = data.length;

		    for(var i = 0; i < len; i++){
		        tiles[data[i].project_weight == 4 ? 'result' : 'tmp'].push(data[i]);
		        if(tiles.tmp.length == 4){
		            tiles.result = tiles.result.concat(tiles.tmp.splice(0, 4));
		        }
		    }
            if(tiles.tmp.length){
                $.each(tiles.tmp, function(index, item){
                    item.project_weight = 4;
                });
            }
		    return tiles.result.concat(tiles.tmp);
		}

	    function render(string, data, prop) {
	        for (prop in data) {
	            if(data.hasOwnProperty(prop)){
	                string = string.replace(new RegExp('{' + prop + '}', 'g'), data[prop] || '');
	            }
	        }
	        return string;
	    }

		this.changeView = function (view) {
			if(!view){
				view = this.data('view') || params.view;
			}
			// render filtered items or source items
			var html = [];
			var i = 0;
	        
			//fullscreen
			if(view == 'image'){
				for(; i < source.length; i++){
	                if(source[i].project_img_big){
	                    html.push(render(templates[view], source[i]));
	                }
	            }
	        //tiles    
			}else if(view == 'tile'){
			    var result = tileSort(filtered && filtered.length ? filtered : source),
	                nextIndex = 1,
	                place = 1,
	                weight,
                    len = result.length;

	            for(; i < len; i++){
	                weight = +result[i].project_weight || 1;
	                result[i].cls = nextIndex + '-' + place;
	                nextIndex += weight;

	                if(nextIndex > 4){
	                    nextIndex = 1;
	                    place++;
	                    if(place > 4){
	                        place = 1;
	                    }
	                }

	                if(result[i].cls == '1-1'){
	                    html.push((i ? '</div>' : '') + '<div class="portfolio__page">');
	                }
//lookup
	                html.push(render(templates[view], {
	                    id: result[i].id,
	                    date: result[i].date,
	                    name: result[i].name,
	                    text: result[i].text,
	                    type: result[i].project_type,
	                    cls: 'portfolio__tile--' + result[i].cls + (weight > 1 ? ' portfolio__tile--big' : ' portfolio__tile--small'),
	                    image: result[i][weight > 1 ? 'project_img_middle' : 'project_img_small']
	                }));

	                (i == result.length) && html.push('</div>');
	            }
			}

			var currentView = this.data('view');
			if(currentView){
				this.removeClass('portfolio--' + currentView);
			}

			this.addClass('portfolio--' + view);
			$this.data('view', view);
			
	        //up
	        var tmp = $(html.join(''));
	        $scroller.html(tmp.before(tmp.last().clone()));
            setTimeout(function(){
                $this.updatePositions(1);
            },0);
			//сохраняем категорию
	        this.trigger('view-changed', view);
		}
        
		this.updatePositions = function(page){
            var elements = $scroller.find('.portfolio__page');
			positions = [];
			elements.each(function (index, item) {
				positions.push(item.offsetLeft);
			});
			if(page){
				currentPage = page;
			}
			//positions[currentPage]
            $scroller.trigger('done', {replace: elements, limit: $(window).width() + 200});
            $scroller.scrollLeft(positions[currentPage]);
		}
         
		$(window).on('resize', function(e){
            setTimeout(function(){
                 $this.updatePositions();
            }, 50);
		});

		//switchView
		this.on('click', '.portfolio__switch', function(e){;
			$this.changeView($this.data('view') == 'tile' ? 'image' : 'tile');
	    });

		this.on('click', '.portfolio__filter', function(e){
	        var category = this.getAttribute('data-category');
	        if(category == 'subcategory'){
	            if(!this.subcategory){
	                this.subcategory = $(this).addClass('portfolio__filter--subcategory--open');
	            }else{
	                this.subcategory.removeClass('portfolio__filter--subcategory--open');
	                this.subcategory = null;
	            }
	        }else{
	        	filtered = []; //clear filtered;

	            if(category != $this.data('filter')){
	                this.subcategory && this.subcategory.removeClass('portfolio__filter--subcategory--open');
	                $this.find('.portfolio__filter').removeClass('portfolio__filter--active');
	            
	                for(var i=0;i<source.length;i++){
	                    if(source[i].cats[category]){
	                        filtered.push(source[i]);
	                    }
	                }
	                $(this).addClass('portfolio__filter--active');

	                if(typeof(+category) == 'number' && category.length == 4){
	                    (this.subcategory || $this.find('.portfolio__filter[data-category="subcategory"]')).addClass('portfolio__filter--active');
	                    
	                }

	                $this.data('filter', category);
	                this.subcategory = null;

	                $this.changeView();
	            }
	            
	            //сохраняем фильтер
                $this.trigger('filter-changed', category);
	        }
	        
	        e.stopPropagation();
	    });

		//scroll
		this.on('click', '.scroller__ctrl', function(e){
	        var next = currentPage + ((this.className.indexOf('scroller__ctrl--left') + 1) ? -1 : 1);
	        if(next > -1 && next < positions.length){
	            currentPage = next;
	            $scroller.stop().animate({scrollLeft: positions[currentPage]}, function(){
	                $scroller.trigger('done'); 
	            });
	        }else{
	            //move to clone and fire click
	            currentPage = next == -1 ? positions.length - 1 : 0;
	            $scroller.scrollLeft(positions[currentPage]);
	            $scroller.trigger('done');
	            $(this).trigger('click');
	        }
	    });

		//touch
		if(isTouch && Hammer){
	        Hammer($('.portfolio')[0]).on('swipeleft', function(e) {
	            e.preventDefault();
	            $this.find('.scroller__ctrl--left').trigger('click');
	        }).on('swiperight', function(e) {
	            e.preventDefault();
	            $this.find('.scroller__ctrl--right').trigger('click');
	        });
	    }

	    $scroller.imgLoad({event: null, items: $scroller.find('.portfolio__page'), limit: $(window).width() + 200, load: function (item, src, index){
	        var $window = $(window);
	        var width = $window.width();
	        var height = $window.height();

	        if(width <= 1024 && height < 700){
	            width = 1024;
	        }else if(width <= 1280){
	            width = 1280;
	        }else if(width <= 1440){
	            width = 1440;
	        }else if(width <= 1920){
	            width = 1920;
	        }
	        item.style.cssText = 'background: url(' + src + '.w' + width + '.jpg) no-repeat';
	    }, trigger: 'done'});

        //init
        $this.find('.portfolio__filters').html(buildCategories({'byDate': {title: 'По дате'}}) + buildCategories(categories));
		if(params.view == 'tile'){
			$this.find('.portfolio__filter[data-category="' + params.filter + '"]').trigger('click');
		}
		$this.changeView(params.view);

		return this;
	}

})(jQuery, window);
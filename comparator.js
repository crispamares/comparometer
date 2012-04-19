function compare(amount, el) {
    console.log("*** Compare", amount);

    /**
     * Those references should be got from the backend
     */
    var references = [{count: 18, 
		       icon: "http://trac.opencoin.org/trac/opencoin/export/343/trunk/sandbox/jhb/mobile/icons/coins.svg",
	               head: 'stolen money',
		       classed: 'stolen',
	               desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt '
			     + 'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco'
			     + ' laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in '
			     + 'voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat'
			     + ' non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' 
		      },
		      {count: 7, 
		       icon: "http://trac.opencoin.org/trac/opencoin/export/343/trunk/sandbox/jhb/mobile/icons/coins.svg",
	               head: 'fiscal fraud',
		       classed: 'fraud',
	               desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt '
			     + 'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco'
			     + ' laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in '
			     + 'voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat'
			     + ' non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' 
		      }];

    var model = new ComparatorModel({amount:amount, references:references});
    var view = new ComparatorView({model: model, el:el});
    view.render();
}

var ComparatorModel = Backbone.Model.extend({
    defaults: function () {
	return {
	    amount: 0,
	    references: []   
	    /*
	     * [{count: 5.3, 
	     *   icon: "http://trac.opencoin.org/trac/opencoin/export/343/trunk/sandbox/jhb/mobile/icons/coins.svg",
	     *   head: 'stolen money',
	     *   desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' 
	     * }]
	     */
	};
    }
});

var ComparatorView = Backbone.View.extend({
    initialize: function(args){
	_.bindAll(this);

	paco = this.model;
	console.log("model", this.model);

	var w = args.width || this.$el.width();
	var h = args.height || w / 2;
	this.margin = args.margin || {top: 10, right: 10, bottom: 20, left: 10}; // top right bottom left
	this.sideMargin = 20;
	this.intraReferencesMargin = 10;
	this.width = w - this.margin.right - this.margin.left,
	this.height = h - this.margin.top - this.margin.bottom;
	this.sideWidth = this.width/2 - this.sideMargin/2;

	var template = '';
	var compiled = _.template(template);
	
	this.$el.html(compiled);

	this.g = d3.selectAll(this.$el.selector)
	    .append('svg:svg')
	    .attr("width", this.width + this.margin.right + this.margin.left)
	    .attr("height", this.height + this.margin.top + this.margin.bottom)
	    .append("svg:g")
	    .attr("class", "canvas")
	    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

	this.gAmount = this.g.append('svg:g')
	    .attr("class", "amount");

	this.gReferences = this.g.append('svg:g')
	    .attr("class", "references")
	    .attr("transform", "translate(" + (this.sideWidth + this.sideMargin) + "," + 0 + ")");

    },
    render: function(){
	console.log("*** Rendering...");
	this.amount = this.model.get('amount');
	this.references = this.model.get('references');

	var referencesCount = _.reduce(this.references, 
				       function(memo, d) {return memo + d.count;},
				       0);
	
	yCount = Math.round(Math.sqrt(referencesCount));
	xCount = ( Math.pow(yCount,2) == referencesCount )? yCount : yCount + 1;

	iconSize = this.height / yCount;

	x = d3.scale.linear()
	    .domain([0, xCount])
	    .range([0, this.sideWidth]);
	y = d3.scale.linear()	    
	    .domain([0, yCount])
	    .range([0, this.height]);
	

	var rectAmount = this.gAmount.selectAll('rect.amount')
	    .data([this.amount]);
	rectAmount.enter()
	    .append('svg:rect')
	    .classed('amount', true)
	    .attr('x', this.width / 4)
	    .attr('y', this.height / 2)
	    .attr('rx', '15px')
	    .attr('ry', '15px')
	    .attr('width', 0)
	    .attr('height', 0)
	   .transition()
	    .attr('x', 0)
	    .attr('y', 0)
	    .attr('width', this.sideWidth)
	    .attr('height', this.height);
	rectAmount.enter().append("svg:title")
            .text(function(d) { return ''+ d + ' €'; });


  	var referenceData = _.reduce(this.references, function(memo, d){ _.each(_.range(d.count), function(){memo.push(d);}); return memo;}, []);

	var rectReference = this.gReferences.selectAll('rect.reference')
	    .data(referenceData);
	rectReference.enter()
	    .append('svg:rect')
	    .attr('class', function(d,i) {return d.classed;})
	    .classed('reference', true)
 	    .attr('x', function(d, i) {return x(Math.floor(i / xCount)) + iconSize/2;})
	    .attr('y', function(d, i) {return y(i % yCount) + iconSize/2;})
	    .attr('rx', '15px')
	    .attr('ry', '15px')
	    .attr('width', 0)
	    .attr('height', 0)
	   .transition()
	    .delay(function(d,i) {return i*20;})
	    .attr('x', function(d, i) {return x(Math.floor(i / xCount));})
	    .attr('y', function(d, i) {return y(i % yCount);})
	    .attr('width', iconSize)
	    .attr('height', iconSize);
	rectReference.enter().append("svg:title")
            .text(function(d) { return d.head; });

	
    }
});
/**
 * https://docs.google.com/spreadsheet/ccc?key=0AgLTtFH_1iwUdFNHeFVzRVZSS2Y2R0ZHeDByTjBXNXc
 */
function compare(amount, el, google_key) {
    console.log("*** Compare", amount);

    /**
     * Those references should be gotten from the backend
     */
    var references = [{count: 18, 
		       icon: "http://trac.opencoin.org/trac/opencoin/export/343/trunk/sandbox/jhb/mobile/icons/coins.svg",
	               headline: 'stolen money',
		       classed: 'stolen',
	               description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt '
			     + 'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco'
			     + ' laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in '
			     + 'voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat'
			     + ' non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' 
		      },
		      {count: 7, 
		       icon: "http://trac.opencoin.org/trac/opencoin/export/343/trunk/sandbox/jhb/mobile/icons/coins.svg",
	               headline: 'fiscal fraud',
		       classed: 'fraud',
	               description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt '
			     + 'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco'
			     + ' laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in '
			     + 'voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat'
			     + ' non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' 
		      }];

    ds = new Miso.Dataset({
		 importer : Miso.Importers.GoogleSpreadsheet,
		 parser : Miso.Parsers.GoogleSpreadsheet,
		 key : google_key,
		 worksheet : "1"
    });

    ds.fetch({ 
	success : function() {
	    console.log(ds.columnNames());
	    //references = ds.rows().toJSON();
	    draw(amount, ds, el);
	    el.append('<a href="https://docs.google.com/spreadsheet/ccc?key='+google_key+'" target="_blank"> datos </a>');
	},
	error : function() {
	    alert("Are you sure you are connected to the internet?");
	}
    });

 
    
}

function draw(amount, references, el) {
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
	     *   headline: 'stolen money',
	     *   desccription: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' 
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

	var ref = this.references.rows().toJSON();
	var referencesCount = this.references.sum('count');
  	var referenceData = _.reduce(ref, function(memo, d){ _.each(_.range(d.count), function(){memo.push(d);}); return memo;}, []);

	var gridfn = gridLayout()
	    .width(this.sideWidth)
	    .height(this.height)
	    .count(referencesCount);	    
	var grid = gridfn();
	
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

	var rectReference = this.gReferences.selectAll('rect.reference')
	    .data(referenceData);
	var rectReferenceEnter = rectReference.enter();
	 
	rectReferenceEnter.append('svg:image')
	    .attr('xlink:href', function(d){return d.icon;})
 	    .attr('x', function(d, i) {return grid.x(i) + grid.xSize/2;})
	    .attr('y', function(d, i) {return grid.y(i) + grid.ySize/2;})
	    .attr('rx', '15px')
	    .attr('ry', '15px')
	    .attr('width', 0)
	    .attr('height', 0)
	    .attr('data-content', function(d) {return d.description;})
	    .attr('data-original-title', function(d) {return d.headline;})
	   .transition()
	    .delay(function(d,i) {return i*20;})
	    .attr('x', function(d, i) {return grid.x(i);})
	    .attr('y', function(d, i) {return grid.y(i);})
	    .attr('width', grid.xSize)
	    .attr('height', grid.ySize);

	rectReferenceEnter.append('svg:rect')
	    .attr('class', function(d,i) {return d.classed;})
	    .classed('reference', true)
 	    .attr('x', function(d, i) {return grid.x(i) + grid.xSize/2;})
	    .attr('y', function(d, i) {return grid.y(i) + grid.ySize/2;})
	    .attr('rx', '15px')
	    .attr('ry', '15px')
	    .attr('width', 0)
	    .attr('height', 0)
	    .attr('data-content', function(d) {return d.description;})
	    .attr('data-original-title', function(d) {return d.headline;})
	   .transition()
	    .delay(function(d,i) {return i*20;})
	    .attr('x', function(d, i) {return grid.x(i);})
	    .attr('y', function(d, i) {return grid.y(i);})
	    .attr('width', grid.xSize)
	    .attr('height', grid.ySize);
	rectReference.each( function (p) { $(this).popover({placement:'bottom'});});

	
    }
});



function gridLayout() {
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 960,
      height = 500;

    var count = 10,
	x = d3.scale.linear(),
	y = d3.scale.linear();

    function gridLayout() {
	var xCount = Math.ceil(Math.sqrt(count)),
	    yCount = xCount,
	    xSize = (width - margin.right - margin.left) / xCount,
	    ySize = (height - margin.top - margin.bottom) / yCount;
	console.log(count, xCount, yCount, width, height);

	x.domain([0, xCount]).range([0, width - margin.right - margin.left]);
	y.domain([0, yCount]).range([0, height - margin.top - margin.bottom]);

	return {x: function(i) {return x(i % xCount) ;},
		y: function(i) {return y(Math.floor(i / xCount)) ;},
		xSize: xSize,
	        ySize: ySize};
    }

    gridLayout.count = function(_) {
	if (!arguments.length) return count;
	count = _;
	return gridLayout;
    };

    gridLayout.margin = function(_) {
	if (!arguments.length) return margin;
	margin = _;
	return gridLayout;
    };

    gridLayout.width = function(_) {
	if (!arguments.length) return width;
	width = _;
	return gridLayout;
    };

    gridLayout.height = function(_) {
	if (!arguments.length) return height;
	height = _;
	return gridLayout;
    };

    return gridLayout;
}
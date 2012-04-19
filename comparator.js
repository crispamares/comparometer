function compare(amount, el) {
    console.log("*** Compare", amount);

    /**
     * Those references should be got from the backend
     */
    var references = [{count: 5.3, 
		       icon: "http://trac.opencoin.org/trac/opencoin/export/343/trunk/sandbox/jhb/mobile/icons/coins.svg",
	               head: 'stolen money',
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

	var w = args.width || this.$el.width();
	var h = args.height || w / 2;
	this.margin = args.margin || {top: 10, right: 10, bottom: 20, left: 10}; // top right bottom left
	this.width = w - this.margin.right - this.margin.left,
	this.height = h - this.margin.top - this.margin.bottom;

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
	    .attr("transform", "translate(" + this.width / 2 + "," + 0 + ")");

    },
    render: function(){
	console.log("*** Rendering...");
	this.amount = this.model.get('amount');
	this.references = this.model.get('references');
	
	this.gAmount.selectAll('rect.amount')
	    .data([this.amount])
	  .enter()
	    .append('svg:rect')
	    .classed('amount', true)
	    .style('title', String)
	    .attr('x', 0)
	    .attr('y', 0)
	    .attr('width', 0.9 * this.width/2)
	    .attr('height', 0.9 * this.height)
	   .append("svg:title")
            .text(function(d) { return ''+ d + ' €'; });
    }
});
//A library to service common queries against the StarMetrics API
//Define an anonymous function as a wrapper
//This is good practice when writing a library to avoid namespace collisions
//DEPENDENCIES
//jQuery -  using jQuery's ajax lib to handle requests (jsonp) at the moment instead of writing our own, we use jQuery's deferred object too so think about this if you intend to write your own and remove the jQuery dependency
//underscore.js - functional programming library for JavaScript
(function(){
	//the first thing we do when we load is to check for private data access
	//we set the apiurl accordingly
	var StarMetrics = function() {
		var proposalaccessallowed = false;
		var apiurl = 'http://rd-dashboard.nitrd.gov/star/api/';

	    // Check to see if we have access to nsfstarmetrics server
		var accesschecked = false;
		var checkAccess = function(topics) {
			var d = $.Deferred();

			//load topiclegends if not loaded
			if (!accesschecked) {
			    $.ajax({
			      url: "http://128.150.10.70/py/api/access",
			      dataType: 'JSONP',
			      timeout: 500
				}).done(function(data){
					proposalaccessallowed = true;
					apiurl = "http://128.150.10.70/py/api/";
					accesschecked = true;
					d.resolve();
				}).fail(function(data){
					accesschecked = true;
					d.reject();
				});
			} else {
				d.resolve();
			}

			return d.promise();			
		};
	
		//legend placeholders
		var legend_topics = {}; //this will come from the API
		var legend_divisions = {
		"OCI":"Office of Cyberinfrastructure",
		"OGC":"Office of the General Counsel",
		"OIA":"Office of Integrative Activities",
		"OISE":"Office of International Science and Engineering",
		"ODI":"Office of Diversity and Inclusion (ODI)",
		"OLPA":"Office of Legislative & Public Affairs",
		"ANT":"Antarctic Sciences",
		"ARC":"Arctic Sciences",
		"AIL":"Antarctic Infrastructure and Logistics",
		"PEHS":"Office of Polar Environment, Health and Safety",
		"A/D":"Front Office",
		"NSB":"Office of the Assistant Director",
		"OIG":"Office of the Assistant Director",
		"MCB":"Division of Molecular & Cellular Biosciences",
		"DBI":"Division of Biological Infrastructure",
		"IOS":"Division of Integrative Organismal Systems",
		"DEB":"Division of Environmental Biology",
		"EF":"Emerging Frontiers Office",
		"CCF":"Division of Computing and Communication Foundations",
		"CNS":"Division of Computer and Network Systems",
		"IIS":"Division of Information and Intelligent Systems",
		"DRL":"Division of Research on Learning in Formal and Informal Settings",
		"DGE":"Division of Graduate Education",
		"HRD":"Division of Human Resource Development",
		"DUE":"Division of Undergraduate Education",
		"CBET":"Division of Chemical, Bioengineering, Environmental, and Transport Systems",
		"CMMI":"Division of Civil, Mechanical & Manufacturing Innovation",
		"ECCS":"Division of Electrical, Communications & Cyber Systems",
		"EEC":"Division of Engineering Education & Centers",
		"EFRI":"Office of Emerging Frontiers in Research & Innovation",
		"IIP":"Division of Industrial Innovation & Partnerships",
		"ENG":"Office of the Assistant Director",
		"AGS":"Division of Atmospheric and Geospace Sciences",
		"EAR":"Division of Earth Sciences",
		"OCE":"Division of Ocean Sciences",
		"GEO":"Office of the Assistant Director",
		"AST":"Division of Astronomical Sciences",
		"CHE":"Division of Chemistry",
		"DMR":"Division of Materials Research",
		"DMS":"Division of Mathematical Sciences",
		"PHY":"Division of Physics",
		"MPS":"Office of the Assistant Director",
		"SES":"Division of Social and Economic Sciences",
		"BCS":"Division of Behavioral and Cognitive Sciences",
		"NCSE":"National Center for Science and Engineering Statistics",
		"SMA":"SBE Office of Multidisciplinary Activities",
		"SBE":"Office of the Assistant Director",
		"BD":"Budget Division",
		"DACS":"Division of Acquisition and Cooperative Support",
		"DFM":"Division of Financial Management",
		"DGA":"Division of Grants & Agreements",
		"DIAS":"Division of Institution and Award Support",
		"HRM":"Division of Human Resource Management",
		"DIS":"Division of Information Systems",
		"DAS":"Division of Administrative Services",
		"EPSCoR":"Office of Experimental Program To Stimulate Competitive Research",
		"EPS":"Office of Experimental Program to Stimulate Competitive Research"
		};
		
		//RESOURCES
		//exposed methods to retrieve data
		//define a topics resource
		this.topics = function(options,callback) {
			//set up options
			options = options || {};
			options = {
				org: options.org || '',
				year: options.year || ''
			};
			checkAccess().always(function() {
				if (!proposalaccessallowed) {
					callback(false);
				} else {
					$.when(
						getTopics(options,'t1'),
						getTopics(options,'t2'),
						getTopics(options,'t3'),
						getTopics(options,'t4')
					)
					.pipe(collateTopics)
					.done(function(result) {
						//set topic legends
						setTopicLegend(result).done(function(result) { callback(result); });
					});					
				}
			});
		};
		
		//topics legend resource
		this.topiclegends = function(callback) {
			if (_.size(legend_topics)==0) {
				getTopicLegend().done(function(){callback(legend_topics);});
			} else {
				//return
				return legend_topics;
			}
		};
				
		//define a programs resource
		this.programs = function(options,callback) {
			//set up options
			options = options || {};
			options = {
				org: options.org || '',
				year: options.year || '',
				t: options.t || ''
			};
			checkAccess().always(function() {
				if (!proposalaccessallowed) {
					callback(false);
				} else {
					$.when(
						getPrograms(options)
					).done(function(result) {
						setProgramLegend(result).done(function(result) { callback(result); });
					});			
				}
			});
		};
		
		//program legend resource
		this.programlegends = function(options,callback) {
			//options is a comma separated list of pge codes
			getProgramLegend(options).done(function(legend){return legend;});
		};
				
		//define a divisions resource
		this.divisions = function(options,callback) {
			//set up options
			options = options || {};
			options = {
				org: options.org || '',
				year: options.year || '',
				t: options.t || ''
			};
			checkAccess().always(function() {
				if (!proposalaccessallowed) {
					callback(false);
				} else {
					$.when(
						getDivisions(options)
					).done(function(result) {
						setDivisionLegend(result);
						callback(result);
					});		
				}
			});
		};
		
		//define a proposals resource
		this.proposals = function(options,callback) {
			//set up options
			options = options || {};
			options = {
				org: options.org || '',
				year: options.year || '',
				t: options.t || ''
			};
			checkAccess().always(function() {
				if (!proposalaccessallowed) {
					callback(false);
				} else {
					$.when(
						getProposals(options)
					).done(function(result) {
						callback(result);
					});					
				}
			});
		}
		
		//define a proposal resource
		this.proposal = function(propid,callback) {
			checkAccess().always(function() {
				if (!proposalaccessallowed) {
					callback(false);
				} else {
					$.when(
						getProposal(propid)
					).done(function(result) {
						callback(result);
					});								
				}
			});
		}

		//define a institutions resource
		this.institutions = function(options,callback) {
			//set up options
			options = options || {};
			options = {
				org: options.org || '',
				year: options.year || '',
				t: options.t || ''
			};
			checkAccess().always(function() {
				if (!proposalaccessallowed) {
					callback(false);
				} else {
					$.when(
						getInstitutions(options)
					).done(function(result) {
						callback(result);
					});								
				}
			});
		}

		//define a institution resource
		this.institution = function(instid,callback) {
			checkAccess().always(function() {
				if (!proposalaccessallowed) {
					callback(false);
				} else {
					$.when(
						getInstitution(instid)
					).done(function(result) {
						callback(result);
					});											
				}
			});
		}

		//define a researchers resource
		this.researchers = function(options,callback) {
			//set up options
			options = options || {};
			options = {
				org: options.org || '',
				year: options.year || '',
				t: options.t || '',
				id: options.id || ''
			};
			checkAccess().always(function() {
				if (!proposalaccessallowed) {
					callback(false);
				} else {
					$.when(
						getResearchers(options)
					).done(function(result) {
						callback(result);
					});								
				}
			});
		}

		//define a researcher resource
		this.researcher = function(researcherid,callback) {
			checkAccess().always(function() {
				if (!proposalaccessallowed) {
					callback(false);
				} else {
					$.when(
						getResearcher(researcherid)
					).done(function(result) {
						callback(result);
					});			
				}
			});
		}

		//Lower level functions to service the resources
		//topics data handling
		var getTopics = function(params,topicrelevance) {
			params.summ = 'status,year,'+topicrelevance; //t1,t2,t3,t4
		    return $.ajax({
		      url: apiurl+"topic?"+toParam(params),
		      dataType: 'JSONP'
			 }).pipe(function(data) {
				var rawdata = data["data"];
				//alert(topicrelevance+' '+rawdata.length);			

				//make a list of the years
				var years = _.pluck(rawdata,"year");
				years = _.uniq(years);

				//prepare data
				//group by t
				var grouped = _.groupBy(rawdata,function(row) { return row[topicrelevance]; });
				//now assemble
				var collated = [];
				for (var t in grouped) {
					if (t!='undefined') {
						var topicid = t;
						//now reduce
						var tmp = _.reduce(grouped[t],function(memo,row) {
							//counts and funding
							var count_awarded = 0;
							var count_declined = 0;
							var count_other = 0;
							var funding_awarded = 0;
							var funding_requested = 0;
							if (row["status"]=="award") {
								funding_awarded = row["awarded_dollar"];
								count_awarded = row["count"];
							} else if (row["status"]=="decline") {
								count_declined = row["count"];
							} else {
								count_other = row["count"];
							}
							if (row["request_dollar"]) funding_requested = row["request_dollar"];
							return {t:memo["t"],count:{award:memo.count.award+count_awarded,decline:memo.count.decline+count_declined,other:memo.count.other+count_other},funding:{award:memo.funding.award+funding_awarded,request:memo.funding.request+funding_requested}};
						},{t:topicid,count:{award:0,decline:0,other:0},funding:{award:0,request:0}});

						var topic_by_year = {};
						_.each(years, function(year) {
							var filtered = _.filter(grouped[t], function(item) { return item.year==year; });	
							topic_by_year[year] = _.reduce(filtered, function(memo,row) {
								var awarded_count = 0, declined_count = 0, other_count = 0;
								var awarded_dollar = 0, requested_dollar = 0;
								if (row.status=='award') {
									awarded_count = row["count"];
									awarded_dollar = row["awarded_dollar"];
								}
								else if (row.status=='decline') {
									declined_count = row["count"];
									requested_dollar = row["requested_dollar"];
								} else {
									other_count = row["count"];
								}
								return {count:{award:memo.count.award+awarded_count, decline:memo.count.decline+declined_count,other:memo.count.other+other_count}, funding:{award:memo.funding.award+awarded_dollar,request:memo.funding.request+requested_dollar}};
							},{count:{award:0,decline:0,other:0},funding:{award:0,request:0}});			
						});						
						tmp.years = topic_by_year;

						//save it
						collated.push(tmp);				
					}
				}

				//make an array hash which is much faster than an array for searching
				var data_hash = {};
				_.each(collated, function(row) {
					data_hash[row.t] = row;
				});		

				//return
				return data_hash;			
			}).fail();			
		};
		
		//collate topics
		//take the data from 4 relevance calls and put it all together
		var collateTopics = function(t1_data,t2_data,t3_data,t4_data){
			var topicsbyrelevance = {'t1':t1_data,'t2':t2_data,'t3':t3_data,'t4':t4_data};
			var loaded_topicids = [];
			var loaded_topics = []; //this will end up looking like [ { t:topicid, label: label, words: words, t1: {count: count, etc. }, t2: {count: count, etc. }}]
			
			loaded_topicids = loaded_topicids.concat(_.keys(t1_data,'t'));
			loaded_topicids = loaded_topicids.concat(_.keys(t2_data,'t'));
			loaded_topicids = loaded_topicids.concat(_.keys(t3_data,'t'));
			loaded_topicids = loaded_topicids.concat(_.keys(t4_data,'t'));
			
			//var unique_topicids = _.uniq(this.loaded_topicids); //do not use this, very slow in ie for large arrays (falls down with 2000+)
			var unique_topicids = function(arr) {
		        var o = {}, i, l = arr.length, r = [];
		        for(i=0; i<l;i+=1) o[arr[i]] = arr[i];
		        for(i in o) r.push(o[i]);
		        return r;
		    }(loaded_topicids);
			//using the unique list of retrieved topic ids
			for (var i=0, len=unique_topicids.length; i<len; i++) {
				var topicid = unique_topicids[i];
				var tmp = {t:topicid, label:null, words:null};
				//for each relevance
				_.each([1,2,3,4], function(topicrelevance) {
					topicrelevance = 't'+topicrelevance.toString();
					var topic = topicsbyrelevance[topicrelevance][topicid];
					tmp[topicrelevance] = topic;
				});
				loaded_topics.push(tmp);
			}
			
			return loaded_topics;
		};
		
		//set topic legend
		var setTopicLegend = function(topics) {
			var d = $.Deferred();

			//load topiclegends if not loaded
			if (_.size(legend_topics)==0) {
				getTopicLegend().done(function(){
					applyTopicLegend(topics);
					d.resolve(topics);
				});
			} else {
				applyTopicLegend(topics);
				d.resolve(topics);
			}

			return d.promise();			
		};
		
		//get topic legends
		var getTopicLegend = function() {
			return $.getJSON(apiurl+'topic?legend=topic'+'&jsoncallback=?').pipe(function(data) {
				_.each(data, function(item) {
					legend_topics[item["topic"]] = {"words":item["words"],"label":item["label"]};
				});
			});			
		}	
			
		//apply topic legends
		var applyTopicLegend = function(topics) {
			for (var i=0, limit=topics.length;i<limit;i++) {
				var topicid = topics[i].t;
				//words and labels
				if (!legend_topics[topicid]["label"]) var label = 'Not Electronically Readable';
				else var label = legend_topics[topicid]["label"];
				if (!legend_topics[topicid]["words"]) var words = '';
				else var words = legend_topics[topicid]["words"];

				//set
				topics[i].label = label;
				topics[i].words = words;
			}
			
			return topics;			
		};

		//programs data handling
		var getPrograms = function(params) {
			params.summ = 'status,year,pge';
		    return $.ajax({
		      url: apiurl+"topic?"+toParam(params),
		      dataType: 'JSONP'
			 }).pipe(function(data) {
				//the collection will calculate low level counts that we need everywhere
				//make a list of the years
				var years = _.pluck(data["data"],"year");
				years = _.uniq(years);
				//group by pge
				var grouped = _.groupBy(data["data"], function(item) {
					return item.pge;
				});
				var collated = [];
				for (var pge in grouped) {
					//counts
					var tmp = _.reduce(grouped[pge], function(memo,row) {
						var awarded_count = 0, declined_count = 0, other_count = 0;
						var awarded_dollar = 0, requested_dollar = 0;
						if (row.status=='award') {
							awarded_count = row["count"];
							awarded_dollar = row["awarded_dollar"];
						}
						else if (row.status=='decline') {
							declined_count = row["count"];
							requested_dollar = row["requested_dollar"];
						} else {
							other_count = row["count"];
						}
						return {pge:memo.pge, label:row.label, count:{award:memo.count.award+awarded_count, decline:memo.count.decline+declined_count,other:memo.count.other+other_count}, funding:{award:memo.funding.award+awarded_dollar,request:memo.funding.request+requested_dollar}};
					},{pge:pge,label:null,count:{award:0,decline:0,other:0},funding:{award:0,request:0}});			

					var pge_by_year = {};
					_.each(years, function(year) {
						var filtered = _.filter(grouped[pge], function(item) { return item.year==year; });	
						pge_by_year[year] = _.reduce(filtered, function(memo,row) {
							var awarded_count = 0, declined_count = 0, other_count = 0;
							var awarded_dollar = 0, requested_dollar = 0;
							if (row.status=='award') {
								awarded_count = row["count"];
								awarded_dollar = row["awarded_dollar"];
							}
							else if (row.status=='decline') {
								declined_count = row["count"];
								requested_dollar = row["requested_dollar"];
							} else {
								other_count = row["count"];
							}
							return {count:{award:memo.count.award+awarded_count, decline:memo.count.decline+declined_count,other:memo.count.other+other_count}, funding:{award:memo.funding.award+awarded_dollar,request:memo.funding.request+requested_dollar}};
						},{count:{award:0,decline:0,other:0},funding:{award:0,request:0}});			
					});
					tmp.years = pge_by_year;

					//save it
					collated.push(tmp);
				}	

				return collated;
			}).fail();			
		};
		
		//set program legend
		var setProgramLegend = function(programs) {
			var pges = [];
			_.each(programs, function(program) { pges.push(program.pge); });
			//set program legends
			var d = $.Deferred();

			getProgramLegend(pges.join()).done(function(legend){
				applyProgramLegend(programs,legend);
				d.resolve(programs);
			});

			return d.promise();			
		};
		
		//get program legends
		var getProgramLegend = function(pges) {
			return $.getJSON(apiurl+"prop?legend=nsf_pge&q="+pges+"&jsoncallback=?");			
		}	
			
		//apply program legends
		var applyProgramLegend = function(programs,legend) {
			//set the labels
			for (var i=0,limit=programs.length;i<limit;i++) {
				var pge = _.find(legend, function(item) {
					return item.nsf_pge==programs[i].pge;
				});
				programs[i].label = '';
				if (pge) programs[i].label = pge.label;
			}

			return programs;			
		};
				
		//divisions data handling
		var getDivisions = function(params) {
			params.summ = 'status,year,org';
		    return $.ajax({
		      url: apiurl+"topic?"+toParam(params),
		      dataType: 'JSONP'
			 }).pipe(function(data) {
				var rawdata = data["data"];

				//make a list of the years
				var years = _.pluck(rawdata,"year");
				years = _.uniq(years);

				//prepare data
				//group by org
				var grouped = _.groupBy(rawdata,function(row) { return row["org"]; });
				//now assemble
				var collated = [];
				for (var org in grouped) {
					//now reduce
					var tmp = _.reduce(grouped[org],function(memo,row) {
						//counts and funding
						var count_awarded = 0;
						var count_declined = 0;
						var count_other = 0;
						var funding_awarded = 0;
						var funding_requested = 0;
						if (row["status"]=="award") {
							funding_awarded = row["awarded_dollar"];
							count_awarded = row["count"];
						} else if (row["status"]=="decline") {
							count_declined = row["count"];
						} else {
							count_other = row["count"];
						}
						if (row["request_dollar"]) funding_requested = row["request_dollar"];
						return {org:memo["org"],count:{award:memo.count.award+count_awarded,decline:memo.count.decline+count_declined,other:memo.count.other+count_other},funding:{award:memo.funding.award+funding_awarded,request:memo.funding.request+funding_requested}};
					},{org:org,count:{award:0,decline:0,other:0},funding:{award:0,request:0}});

					var org_by_year = {};
					_.each(years, function(year) {
						var filtered = _.filter(grouped[org], function(item) { return item.year==year; });	
						org_by_year[year] = _.reduce(filtered, function(memo,row) {
							var awarded_count = 0, declined_count = 0, other_count = 0;
							var awarded_dollar = 0, requested_dollar = 0;
							if (row.status=='award') {
								awarded_count = row["count"];
								awarded_dollar = row["awarded_dollar"];
							}
							else if (row.status=='decline') {
								declined_count = row["count"];
								requested_dollar = row["requested_dollar"];
							} else {
								other_count = row["count"];
							}
							return {count:{award:memo.count.award+awarded_count, decline:memo.count.decline+declined_count,other:memo.count.other+other_count}, funding:{award:memo.funding.award+awarded_dollar,request:memo.funding.request+requested_dollar}};
						},{count:{award:0,decline:0,other:0},funding:{award:0,request:0}});			
					});
					tmp.years = org_by_year;

					//save it
					collated.push(tmp);				
				}
				return collated;
			}).fail();			
		};

		//set division legends
		var setDivisionLegend = function(divisions) {
			for (var i=0, limit=divisions.length;i<limit;i++) {
				var org = divisions[i].org;
				//labels
				if (!legend_divisions[org]) var label = 'Not Available';
				else var label = legend_divisions[org];

				//set
				divisions[i].label = label;
			}
			
			return divisions;			
		};
		
		//get proposals
		var getProposals = function(params) {
			params.page = 'grant';
		    return $.ajax({
		      url: apiurl+"topic?"+toParam(params),
		      dataType: 'JSONP'
			 });		
		};

		//get researchers
		var getResearchers = function(params) {
			params.page = 'pi';
		    return $.ajax({
		      url: apiurl+"topic?"+toParam(params),
		      dataType: 'JSONP'
			 });		
		};

		//get institutions
		var getInstitutions = function(params) {
			params.page = 'org';
		    return $.ajax({
		      url: apiurl+"topic?"+toParam(params),
		      dataType: 'JSONP'
			 });		
		};
		
		//get proposal
		var getProposal = function(id) {
		    return $.ajax({
		      url: apiurl+"prop?id="+id,
		      dataType: 'JSONP'
			 });		
		};

		//get researcher
		var getResearcher = function(id) {
		    return $.ajax({
		      url: apiurl+"user?id="+id,
		      dataType: 'JSONP'
			 });		
		};

		//get institution
		var getInstitution = function(id) {
		    return $.ajax({
		      url: apiurl+"org?id="+id,
		      dataType: 'JSONP'
			 });		
		};

		//general use functions
		function toParam(obj) {
			//could jQuery's $.param here as we already have a jQuery dependency
			var str = '';
			var separator = '&';
			for (key in obj) {
				if (obj[key]) {
					if (str!=='') str += separator;
					str += key + '=' + obj[key];
				}
			}
			return str;
		};
	};

	//attach this functionality to the document
	var sm = new StarMetrics;
	
	//this is how underscore.js does it
	var root = this;
  // Export the StarMetrics object for **Node.js** and **"CommonJS"**, with
  // backwards-compatibility for the old `require()` API. If we're not in
  // CommonJS, add `_` to the global object via a string identifier for
  // the Closure Compiler "advanced" mode, and optionally register as an
  // AMD module via define().
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = sm;
    }
    exports.StarMetrics = sm;
  } else {
    if (typeof define === 'function' && define.amd) {
      define('starmetrics', function() {
        return sm;
      });
    }
    root['StarMetrics'] = sm;
  }

}).call(this); //execute the function immediately

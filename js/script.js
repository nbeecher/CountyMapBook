require([
  "esri/Map",
  "esri/views/MapView",   
  "esri/widgets/Print",
  "esri/layers/VectorTileLayer", 
  "esri/layers/FeatureLayer",
  "esri/layers/TileLayer",
  "esri/widgets/Expand",
  "esri/widgets/Search",
  "esri/widgets/LayerList",
  "esri/tasks/support/PrintTemplate", 
  "dojo/domReady!"
], function(Map, MapView, Print, VectorTileLayer, FeatureLayer, TileLayer, Expand, Search, LayerList, PrintTemplate) {

	//SPM tiles (for testing)
	var tiled = new TileLayer({
		url: "http://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/Statewide_Planning_Map/MapServer" 
	});

	var map = new Map({
		layers: [tiled]
	});
	  

	// Vector basemap service
 //  	var CountyVectorLayer = new VectorTileLayer({	
 //  		//County map book vector tiles	
	// 	url: "https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_County_Mapbook_Basemap/VectorTileServer"		
 
	// }); 

  	// var map = new Map({
  	// 	layers: [CountyVectorLayer]
  	// });
  

  	var view = new MapView({
    	container: "viewDiv",  // Reference to the DOM node that will contain the view
    	map: map,               // References the map object created in step 3
    	center: [-99.341389, 31.132222],
    	zoom: 5,
    	spatialReference: {wkid:102100}
  	});



	view.when(function(){
  		var print = new Print({
			view: view, 						
			printServiceUrl: "http://txapp39/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export Web Map Task"
		});

		var printExpander = new Expand({
			view: view,
			content: print,
			expandIconClass: "esri-icon-printer"
		});
	
		view.ui.add(printExpander, "top-right"); 

	}, function(error){
 		console.log("Error displaying print widget");
	});

	// var lyrlist = new LayerList({
	// 	view: view
	// });

		
	// view.ui.add(lyrlist, "top-left");

	var searchW = new Search({
		view:view,
		allPlaceholder: "County"
	});
			
	searchW.sources.push({
		featureLayer: new FeatureLayer({
			url: "http://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/Texas_Counties_Detailed/FeatureServer/0",
			outFields: ["*"]
		}),	            
            searchFields: ["CNTY_NM"],
            displayField: "CNTY_NM",
            exactMatch: false,
            autoSelect: true,
            name: "County",
            outFields: ["*"],
            placeholder: "ex Travis",	            
            maxResults: 6,
            maxSuggestions: 6,             
            enableSuggestions: true,
            //zoomScale: 500000,
            minCharacters: 0
		});	

	view.ui.add(searchW, "top-right");	





});

		
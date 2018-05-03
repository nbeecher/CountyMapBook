require([
  "esri/Map",
  "esri/views/MapView",   
  "esri/widgets/Print",
  "esri/layers/VectorTileLayer", 
  "esri/layers/FeatureLayer",  
  "esri/widgets/Expand",
  "esri/widgets/Search",
  "esri/widgets/LayerList",
  "esri/tasks/support/PrintTemplate", 
  "esri/widgets/ScaleBar",  
  "esri/widgets/Home", 
  "dojo/domReady!"
], function(Map, MapView, Print, VectorTileLayer, FeatureLayer, Expand, Search, 
  LayerList, PrintTemplate, ScaleBar, Home) {


	//Vector basemap service
  	var CountyVectorLayer = new VectorTileLayer({	
  		//County map book vector tiles	
		url: "https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_County_Mapbook_Basemap/VectorTileServer"		
 
	}); 

  	var map = new Map({
  		layers: [CountyVectorLayer]
  	});
  

  	var view = new MapView({
    	container: "viewDiv",  // Reference to the DOM node that will contain the view
    	map: map,               // References the map object created in step 3
    	center: [-99.341389, 31.132222],
    	zoom: 5,
    	spatialReference: {wkid:102100}
  	});

    //widget to zoom back to full extent of map
  var homeWidget = new Home({
    view: view

  });

  view.ui.add(homeWidget, "top-left");


    //Extender for print widget
    //print widget
	view.when(function(){
  		var print = new Print({
			view: view, 						
			printServiceUrl: "http://txapp39/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
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

  //Displays layers
	// var lyrlist = new LayerList({
	// 	view: view
	// });

		
	// view.ui.add(lyrlist, "top-left");



//Search widget allows user to search by district or county
//when user hits enter the map zooms to user selection
	var searchWidget = new Search({
        view: view,
        allPlaceholder: "District or County",
        sources: [{
          featureLayer: new FeatureLayer({
            url: "https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Districts/FeatureServer/0",         
          }),
          	searchFields: ["DIST_NM"],
            displayField: "DIST_NM",
            exactMatch: false,
            autoSelect: true,
            name: "District",
            outFields: ["*"],
            placeholder: "ex. Austin",	            
            maxResults: 6,
            maxSuggestions: 6,             
            enableSuggestions: true,            
            minCharacters: 0, 
            popupOpenOnSelect: false,  
            resultSymbol:{
              type: "simple-line",
              color: "yellow",
              width: "4px",
            }
        }, {
          featureLayer: new FeatureLayer({
            url: "http://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/Texas_Counties_Detailed/FeatureServer/0",        
          }),
            searchFields: ["CNTY_NM"],
            displayField: "CNTY_NM",
            exactMatch: false,
            autoSelect: true,
            name: "County",
            outFields: ["*"],
            placeholder: "ex. Travis",	            
            maxResults: 6,
            maxSuggestions: 6,             
            enableSuggestions: true,            
            minCharacters: 0,
            popupOpenOnSelect: false,
            resultSymbol:{
              type: "simple-line",
              color: "yellow",
              width: "4px",
            }          
        }]
  });

  searchWidget.startup();

      // Add the search widget to the top left corner of the view
  view.ui.add(searchWidget, {
    position: "top-right"
  });


	//renderer/symbol for grid
	var gridRenderer = {
		type: "simple",
		symbol:{
		type: "simple-fill",
		color: [0,0,0,0.0], //white and transparant fill
		//color: "white",
		outline: {
			width: 0.5,
			color: "black"
			}
		}
	};


  const grid_72 = new FeatureLayer({
   	 	url: "https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/POD_GRID72224/FeatureServer",
    	//legendEnabled: false,    	

    	renderer: gridRenderer
  });

  grid_72.minScale = 300000;
  
  map.add(grid_72);  // adds the layer to the map


});

		
require([
  "esri/Map",
  "esri/views/MapView",  
  "esri/views/ui/DefaultUI", 
  "esri/widgets/Print",
  "esri/layers/VectorTileLayer", 
  "esri/layers/FeatureLayer",  
  "esri/widgets/Expand",
  "esri/widgets/Search",
  "esri/widgets/LayerList",
  "esri/tasks/support/PrintTemplate", 
  "esri/widgets/ScaleBar",  
  "esri/widgets/Home", 
  "esri/widgets/Print/TemplateOptions",
  "esri/tasks/PrintTask",
  "esri/tasks/support/PrintParameters",
  "esri/request",   
  "esri/geometry/Extent",
  "esri/Basemap",
  "esri/widgets/BasemapToggle",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/tasks/support/FeatureSet",
  "dojo/domReady!"
], function(Map, MapView, DefaultUI, Print, VectorTileLayer, FeatureLayer, Expand, Search, 
  LayerList, PrintTemplate, ScaleBar, Home, TemplateOptions, PrintTask,
  PrintParameters, esriRequest, Extent, Basemap, BasemapToggle, QueryTask, Query, FeatureSet) {

  $('#loader').hide();

	//Vector basemap service
  	var CountyVectorLayer = new VectorTileLayer({	
  	url: "https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_County_Mapbook_Basemap/VectorTileServer",
    listMode: "hide"	 
	}); 

    var myBasemap = new Basemap({  
      baseLayers: CountyVectorLayer,  
      thumbnailUrl: "/images/thumbnail.jpg"  
    });  

  	var map = new Map({
  		//layers: [CountyVectorLayer] 
      basemap: myBasemap  
  	});
  

  	var view = new MapView({
    	container: "viewDiv",  // Reference to the DOM node that will contain the view
    	map: map,               // References the map object created in step 3
    	center: [-99.341389, 31.132222],
    	zoom: 5,      
    	spatialReference: {wkid:102100},
      constraints: {
        minZoom: 5,        
        rotationEnabled: false
      }
  	});

  //global varibales to update district name and county name custom text
  DistName = [];
  CountName = [];
  dName = "";
  cName = "";

   //print task! with custom button
  function printMap(){  
    //the load spinner with show while this function is running 
    $('#loader').show();

    //get extent of the map on the view
    var extentOfPrint = view.extent;  
        
    //call the query to get the county names in the extent    
    countyQuery();

    //the function for getting the county names in the extent
    function countyQuery(){

      var queryCountyTextTask = new QueryTask({
          url: "http://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/Texas_Counties_Detailed/FeatureServer/0"
      });

      var queryCountyText = new Query({
        geometry: extentOfPrint,
        spatialRelationship: "intersects",
        orderByFields: "CNTY_NM ASC",        
        outFields: ["CNTY_NM"]
      });      

      //execute query THEN get the result and save the information to the global variables
      queryCountyTextTask.execute(queryCountyText).then(countyResult);      

      //result function
      function countyResult(r){       
       
        //This loop will get all the county names in the extent
        //and save them in an array (global variable)
        for (var i=0; i < r.features.length; i++){
          console.log(r.features[i].attributes.CNTY_NM);
          var cnty = r.features[i].attributes.CNTY_NM;
          CountName.push(cnty);
        }
        
        console.log(CountName);        

        //This saves the array of county names into a string
        //this will be used in the custom text section below  
        if(CountName.length > 4){
          cName = "Multiple Counties";
        }
        else if (CountName.length == 1){
          cName = CountName + " County";
        }else{
          cName = CountName.join(', ') + " Counties";
        } 

        //after the countyQuery finishes then the district query is called
        districtQuery();
      };  

    };

    //the function for getting the district names in the extent
    function districtQuery(){  

      var queryDistrictTextTask = new QueryTask({
          url: "https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Districts/FeatureServer/0"
      });

      var queryDistrictText = new Query({
        geometry: extentOfPrint,
        spatialRelationship: "intersects",
        orderByFields: "DIST_NM ASC",        
        outFields: ["DIST_NM"]
      });      

      //execute query THEN get the result and save the information to the global variables
      queryDistrictTextTask.execute(queryDistrictText).then(result);      

      function result(r){       
        
        //This loop will get all the district names in the extent
        //and save them in an array (global variable)
        for (var i=0; i < r.features.length; i++){
          console.log(r.features[i].attributes.DIST_NM);
          var dist = r.features[i].attributes.DIST_NM;
          DistName.push(dist);
        }

        console.log(DistName);        

        //This saves the array of district names into a string
        //this will be used in the custom text section below  
        if(DistName.length > 4){
          dName = "Multiple Districts";
        }
        else if (DistName.length == 1){
          dName = DistName + " District";
        }else{
          dName = DistName.join(', ') + " Districts";
        }     

        //after the districtQuery finishes then the print task is called
        pT();
      };          

    };
  

    function pT(){

      var pt = new PrintTemplate({        
        format: "pdf",
        //legendEnabled: true,
        layout: "8.5x11_Landscape_Template",
        layoutOptions: {
          customTextElements: [
          {"District Name": dName}, //from the districtQuery above
          {"County Name": cName}    //from the countyQuery above
          ]
        }

      });

      var params = new PrintParameters({
        view: view,
        template: pt
      });

      var printTask = new PrintTask({
        url: "http://txapp39/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
        mode: "async"
      });

      console.log(pt.layoutOptions);

      //execute query THEN get the result or error
      printTask.execute(params).then(printResult, printError);

     //opens new website window with map export
     //loaded is stopped and hidden from the view
      function printResult(result){
          console.log(result.url);
          window.open(result.url, "_blank"); 
          $('#loader').hide();     
      }
      function printError(result){
          console.log(result);
      }

    };
     
    //resets arrays and strings for next print  
    DistName = [];
    dName = "";
    CountName = [];
    cName = "";
};

  //print task is exectued by print button
  document.getElementById("print").addEventListener("click", printMap);

  //sets view back to orginal extent (whole state of TX)
  function homeExtent(){
    view.center = [-99.341389, 31.132222];
    view.zoom = 5;
    view.spatialReference = {wkid:102100};    
  };

  //get exten function is execute through extent button
  document.getElementById("extent").addEventListener("click", homeExtent);
 


  //Extender for layer list widget
  //layer list widget
  view.when(function(){
    var lyrlist = new LayerList({
    view: view 
  });

    var lyrExpander = new Expand({
      view: view,
      content: lyrlist,
      container: "expandDiv",
      expandTooltip: "List of layers",
      expandIconClass: "esri-icon-layers"
    });
  
    view.ui.add(lyrExpander, "top-left");
  });

 
  //adds evacuation routes to map
  const evacRoute = new FeatureLayer({
        url: "https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Evacuation_Routes/FeatureServer/0",
        legendEnabled: true,
        visible: false,
        title: "Evacuation Routes"
  });

  map.add(evacRoute);  // adds the layer to the map


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
    	title: "Grid", 
      visible: false,   	

    	renderer: gridRenderer
  });

  grid_72.minScale = 600000;
  
  map.add(grid_72);  // adds the layer to the map

  var toggle = new BasemapToggle({    
    view: view, 
    nextBasemap: "satellite" // allows for toggling to the 'satellite' basemap
  });

  // Add widget to the top right corner of the view
  view.ui.add(toggle, "bottom-left");


});

		
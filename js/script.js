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
  "esri/widgets/Legend",
  "esri/core/watchUtils",
  "esri/PopupTemplate",
  "dojo/domReady!"
], function(Map, MapView, DefaultUI, Print, VectorTileLayer, FeatureLayer, Expand, Search, 
  LayerList, PrintTemplate, ScaleBar, Home, TemplateOptions, PrintTask,
  PrintParameters, esriRequest, Extent, Basemap, BasemapToggle, QueryTask, Query, FeatureSet, 
  Legend, watchUtils, PopupTemplate) {

  $('#loader').hide();
  $('#loaderOverlay').hide();

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
    $('#loaderOverlay').show();
    document.getElementById("extent").disabled = true;
    document.getElementById("print").disabled = true;  
    

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
          cName = "Counties: Multiple";
        }
        else if (CountName.length == 1){
          cName = "County: " + CountName;
        }else{
          cName = "Counties: " + CountName.join(', ');
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
          dName = "Districts: Multiple";
        }
        else if (DistName.length == 1){
          dName = "District: " + DistName;
        }else{
          dName = "Districts: " + DistName.join(', ');
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
          $('#loaderOverlay').hide();
          document.getElementById("extent").disabled = false;    
          document.getElementById("print").disabled = false;  
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

  var evacTemplate = {
    title: "Evacuation Route",
    content:[{
        type: "fields",
        fieldInfos:[{
        fieldName: "RTE_RB_NM",
        label: "Route Roadbed Name",
        visible: true
      }, {
        fieldName: "ROUTE_TYPE",
        label: "Type",
        visible: true
      }]   
    }]
  };

  //adds evacuation routes to map
  const evacRoute = new FeatureLayer({
        url: "https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Evacuation_Routes/FeatureServer/0",
        legendEnabled: true,
        visible: false,
        popupEnabled: true,
        outFields: ["*"],
        popupTemplate: evacTemplate,
        title: "Evacuation Routes"
  });

  map.add(evacRoute);  // adds the layer to the map

  function evacRouteDisplay(){
    var object = document.getElementById("Evacuation_Route");
    if(evacRoute.visible == false){
      evacRoute.visible = true;
      object.style.color="red";
    }else{
      evacRoute.visible = false;
      object.style.color="black";
    }

 };

  document.getElementById("Evacuation_Route").addEventListener("click", evacRouteDisplay);

    var funcTemplate = {
    title: "Functional Classification",
    content:[{
        type: "fields",
        fieldInfos:[{
        fieldName: "RTE_NM",
        label: "Route Roadbed Name",
        visible: true
      }, {
        fieldName: "FC_DESC",
        label: "Functional Classification",
        visible: true
      }]   
    }]
  };

  const functionClass = new FeatureLayer({
    url: "https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Functional_Classification/FeatureServer/0",
    legendEnabled: true,
    visible: false,
    popupEnabled: true,
    outFields: ["*"],
    popupTemplate: funcTemplate,
    title: "Functional Classification"
  });
  
  map.add(functionClass);

  function functionalSysDisplay(){
    var object = document.getElementById("FC_System");
    if(functionClass.visible == false){
      functionClass.visible = true;
      object.style.color="red";
    }else{
      functionClass.visible = false;
      object.style.color="black";
    }

 };

  document.getElementById("FC_System").addEventListener("click", functionalSysDisplay);

  var lowRender = {
  type: "unique-value",  
  field: "LWX_TYPE",
  defaultLabel: "All other values",
  defaultSymbol: { type: "simple-marker",  outline: {
        color: [0, 0, 0, 0]}, size: 7, color: [230, 152, 0, 1] }, 
  uniqueValueInfos: [{    
    value: "BRIDGE CLASS",
    symbol: {
      type: "simple-marker",  
      color: "blue",
      outline: {
        color: [0, 0, 0, 0]},
        size: 7
    }
  }, {   
    value: "PEDESTRIAN CROSSING",
    symbol: {
      type: "simple-marker", 
      color: "green",
      outline: {
        color: [0, 0, 0, 0]},
        size: 7
    }
  }, {   
    value: "UNVENTED FORD",
    symbol: {
      type: "simple-marker",  
      color: "red",
      outline: {
        color: [0, 0, 0, 0]},
        size: 7
    }
  }, {   
    value: "VENTED FORD",
    symbol: {
      type: "simple-marker",  
      color: [169, 0, 230, 1],
      outline: {
        color: [0, 0, 0, 0]},
        size: 7
    }
  }]
};

    var lowTemplate = {
    title: "Low Water Crossing",
    content:[{
        type: "fields",
        fieldInfos:[{
        fieldName: "ROAD",
        label: "Route Name",
        visible: true
      }, {
        fieldName: "LWX_TYPE",
        label: "Type",
        visible: true
      }, {
        fieldName: "FLOWSOURCE",
        label: "Flow Source",
        visible: true
      }]   
    }]
  };


  const lowWater = new FeatureLayer({
    url: "https://webservices.tnris.org/arcgis/rest/services/Low_Water_Crossings/Low_Water_Crossings/MapServer/0",
    legendEnabled: true,
    visible: false,
    opupEnabled: true,
    outFields: ["*"],
    popupTemplate: lowTemplate,
    renderer: lowRender,
    title: "Low Water Crossing"
  });
  
  map.add(lowWater);

  function lowWaterDisplay(){
    var object = document.getElementById("Low_Water");
    if(lowWater.visible == false){
      lowWater.visible = true;
      object.style.color="red";
    }else{
      lowWater.visible = false;
      object.style.color="black";      
    }

 };

  document.getElementById("Low_Water").addEventListener("click", lowWaterDisplay);

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

  const grid = new FeatureLayer({
      url: "https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/POD_GRID72224/FeatureServer",
      title: "Grid", 
      visible: false,
      legendEnabled: false,
      renderer: gridRenderer
  });

  map.add(grid);  // adds the layer to the map


  function gridDisplay(){
    var object = document.getElementById("Grid");
    if(grid.visible == false){
      grid.visible = true;
      object.style.color="red";
    }else{
      grid.visible = false;
      object.style.color="black";
    }

 };

  document.getElementById("Grid").addEventListener("click", gridDisplay);

  function clearAll(){
    var evac = document.getElementById("Evacuation_Route");
    var fc = document.getElementById("FC_System");    
    var low = document.getElementById("Low_Water");
    var g = document.getElementById("Grid");

    evacRoute.visible = false;
    evac.style.color="black";
    functionClass.visible = false;
    fc.style.color="black"; 
    lowWater.visible = false;
    low.style.color="black";
    grid.visible = false;
    g.style.color="black";


    //legend.container.style.display = 'none';
  };

  document.getElementById("clear").addEventListener("click", clearAll);
    
  var legend = new Legend({
    view:view,
    container: "legendDiv",    
    layerInfos: [{
      layer: evacRoute,      
      },{
      layer: functionClass  
      },{
      layer: lowWater   
      },{
      layer: grid       
    }]
  });   

//Search widget allows user to search by district or county
//when user hits enter the map zooms to user selection
	var searchWidget = new Search({
        view: view,
        allPlaceholder: "District or County",    
        container: "search",   
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
  //view.ui.add(searchWidget, {position: "top-right"});


 

  var toggle = new BasemapToggle({    
    view: view, 
    nextBasemap: "satellite" // allows for toggling to the 'satellite' basemap
  });

  // Add widget to the top right corner of the view
  view.ui.add(toggle, "bottom-right");


});

		
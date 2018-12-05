 require([
      "esri/config",
      "esri/core/watchUtils",
      // ArcGIS
      "esri/Map",
      "esri/WebMap",
      "esri/views/MapView",
      "esri/layers/WMTSLayer",
      // Widgets
      "esri/widgets/Home",
      "esri/widgets/Zoom",
      "esri/widgets/Compass",
      "esri/widgets/Search",
      "esri/widgets/Legend",
      "esri/widgets/BasemapToggle",
      "esri/widgets/ScaleBar",
      "esri/widgets/Attribution",
      "esri/layers/FeatureLayer",
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask",
      "esri/widgets/Print/TemplateOptions",
      "esri/tasks/PrintTask",
      "esri/tasks/support/PrintParameters",
      "esri/tasks/support/PrintTemplate",
      "esri/widgets/LayerList",    
      "esri/layers/OpenStreetMapLayer",
  
      "esri/layers/VectorTileLayer",
      "esri/Basemap",
      "dojo/domReady!"
    ], function(esriConfig, watchUtils, Map, WebMap, MapView, WMTSLayer, Home, Zoom, Compass, Search, Legend, BasemapToggle, ScaleBar, Attribution, 
      FeatureLayer, Query, QueryTask, TemplateOptions, PrintTask, PrintParameters, PrintTemplate, LayerList, OpenStreetMapLayer, VectorTileLayer, Basemap) {


      var beginScale;

     $('.btn-expand-collapse').click(function(e) {
        $('.navbar-primary').toggleClass('collapsed'); 
        
      });

     // Get the modal
      var modal = document.getElementById('myModal');

      // Get the button that opens the modal
      var btn = document.getElementById("about");

      // Get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[0];

      // When the user clicks the button, open the modal 
      btn.onclick = function() {
          modal.style.display = "block";
      }

      // When the user clicks on <span> (x), close the modal
      span.onclick = function() {
          modal.style.display = "none";
      }

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function(event) {
          if (event.target == modal) {
              modal.style.display = "none";
          }
      }

      ////////////////////////////////////////////////////////////////
      // Changes up and down arrows when Overlays is opened and closed 
      function overlaysButton(){
        var btn = document.getElementById("overlaysDown");
        if(btn.classList.contains("glyphicon-menu-down"))
        {
          btn.classList.remove("glyphicon-menu-down");
          btn.classList.add("glyphicon-menu-up");
        }
        else
        {
          btn.classList.remove("glyphicon-menu-up");
          btn.classList.add("glyphicon-menu-down")
        }       

      };

      document.getElementById("overlays").addEventListener("click", overlaysButton);
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Changes up and down arrows when Basemaps is opened and closed 
      function basemapsButton(){
        var btn = document.getElementById("basemapDown");
        if(btn.classList.contains("glyphicon-menu-down"))
        {
          btn.classList.remove("glyphicon-menu-down");
          btn.classList.add("glyphicon-menu-up");
        }
        else
        {
          btn.classList.remove("glyphicon-menu-up");
          btn.classList.add("glyphicon-menu-down")
        }       

      };

      document.getElementById("basemaps").addEventListener("click", basemapsButton);
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Changes up and down arrows when Print is opened and closed 
      function printButton(){
        var btn = document.getElementById("printDown");
        if(btn.classList.contains("glyphicon-menu-down"))
        {
          btn.classList.remove("glyphicon-menu-down");
          btn.classList.add("glyphicon-menu-up");
        }
        else
        {
          btn.classList.remove("glyphicon-menu-up");
          btn.classList.add("glyphicon-menu-down")
        }       

      };

      document.getElementById("print").addEventListener("click", printButton);
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Changes up and down arrows when TxDOT Links is opened and closed 
      function linksButton(){
        var btn = document.getElementById("linksDown");
        if(btn.classList.contains("glyphicon-menu-down"))
        {
          btn.classList.remove("glyphicon-menu-down");
          btn.classList.add("glyphicon-menu-up");
        }
        else
        {
          btn.classList.remove("glyphicon-menu-up");
          btn.classList.add("glyphicon-menu-down")
        }       

      };

      document.getElementById("link").addEventListener("click", linksButton);
      ////////////////////////////////////////////////////////////////


      ////////////////////////////////////////////////////////////////
      // Get the value from the drop down data list
      // On button click grab value and download zip

      var val;
  
      $(document).on("input", "#county", function(){
        val = this.value;
        
        if($('#countyList').find('option').filter(function(){
              return this.value.toUpperCase() === val.toUpperCase();        
          }).length) {
              //send ajax request
              //console.log(this.value);
              val = this.value;
              val = val.toUpperCase();
              //console.log(val);
          }
          
      });

      function printCounty()
      {
        //console.log(val);
        window.location = 'https://www.dot.state.tx.us/apps-cg/grid_search/_includes/countymapbook/Zipfiles/'+ val + '.zip'
      };
      
      document.getElementById("countyButton").addEventListener("click", printCounty);      
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Changes left and right arrows on navbar collapse and open 
      function menuSlide(){
        var slidebtn = document.getElementById("slidebtn");        
        slidebtn.classList.toggle("glyphicon-menu-right");
      };
    
      document.getElementById("banner").addEventListener("click", menuSlide);
      ////////////////////////////////////////////////////////////////
 
      ////////////////////////////////////////////////////////////////
      //  Set CountyVectorLayer to the correct vector tile layer
      var CountyVectorLayer = new VectorTileLayer({
        url: "https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_County_Mapbook_Basemap/VectorTileServer",
        id: "txdot"        
      });
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Create new basemap with the base layer as the vector tile
      var myBasemap = new Basemap({
        baseLayers: CountyVectorLayer        
      });
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Create new map
      var map = new Map({        
        basemap: myBasemap
      });
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Set the map view and its properties
      var mapView = new MapView({
        container: "mapViewDiv",  // Reference to the DOM node that will contain the view
        map: map,               // References the map object created in step 3
        center: [-100.341389, 31.132222],
        zoom: 5,
        spatialReference: {wkid:102100},
        constraints: {
          minZoom: 5,
          rotationEnabled: false
        }
      });
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      //sets view back to orginal extent (whole state of TX)
      function homeExtent(){
        mapView.center = [-99.341389, 31.132222];
        mapView.zoom = 5;
        mapView.spatialReference = {wkid:102100};
      };

      //get exten function is execute through extent button
      document.getElementById("extent").addEventListener("click", homeExtent);
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Search - add to navbar
      var searchWidget = new Search({
        container: "searchWidgetDiv",
        view: mapView,
        allPlaceholder: "District or County",
        includeDefaultSources: false,
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
     ////////////////////////////////////////////////////////////////

     ////////////////////////////////////////////////////////////////
      // Set zoom buttons to top right of map view
      var zoom = new Zoom({
        view: mapView
      });
      mapView.ui.add(zoom, "top-right");
      ////////////////////////////////////////////////////////////////
             
         
      var attribution = new Attribution({
        view: mapView
      });
      mapView.ui.add(attribution, "manual");


      ////////////////////////////////////////////////////////////////
      // Code for Basemaps div
      var id = "txdotDiv";
      document.getElementById(id).style.borderLeft = "5px solid red";

      //Esri Light Gray Basemap
      function esriLightGray(){
        var title = map.get("basemap.baseLayers.items.0.id");
        //console.log(title);   
        document.getElementById(id).style.borderLeft = "5px solid rgb(225, 225, 225)";   

        var esriLightGray = new VectorTileLayer({
          url: "https://www.arcgis.com/sharing/rest/content/items/5dd75c1a544b46c3af01ba5736bfdfa0/resources/styles/root.json?f=pjson",
          id: "gray"
        });

        if(title == "gray")
        {
          console.log("already the basemap");
        }
        else
        {
          map.basemap.baseLayers = esriLightGray;
        }

        id = "esriLightGray";

        document.getElementById(id).style.borderLeft = "5px solid red";
      
        //console.log(title);
    
      
      };
      document.getElementById("esriLightGray").addEventListener("click", esriLightGray);

      //TxDOT Basemap
      function txdotBase(){       
        var title = map.get("basemap.baseLayers.items.0.id");
        //console.log(title);
        document.getElementById(id).style.borderLeft = "5px solid rgb(225, 225, 225)";

        var CountyVectorLayer = new VectorTileLayer({
          url: "https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_County_Mapbook_Basemap/VectorTileServer",
          //url: "https://www.arcgis.com/sharing/rest/content/items/5dd75c1a544b46c3af01ba5736bfdfa0/resources/styles/root.json?f=pjson",
          id: "txdot"
        });

        //map.add(CountyVectorLayer);

        if(title == "txdot")
        {
          console.log("already the basemap");
        }
        else
        {
          map.basemap.baseLayers = CountyVectorLayer;
        }

        id = "txdotDiv";

        document.getElementById(id).style.borderLeft = "5px solid red";
        
      };
      document.getElementById("txdotDiv").addEventListener("click", txdotBase);

      //Texas google imagery
      function googleBase(){
        var title = map.get("basemap.baseLayers.items.0.id");
        //console.log(title);
        document.getElementById(id).style.borderLeft = "5px solid rgb(225, 225, 225)";
      // Name server with CORS enabled for Google Imagery     
        esriConfig.request.corsEnabledServers.push ("https://txgi.tnris.org");

      // Add Google Imagery WMTS layer
          google = new WMTSLayer({
            url: "https://txgi.tnris.org/login/path/pegasus-horizon-castro-comrade/wmts", 
            serviceMode: "KVP",
            id: "googles"
          });

        if(title == "googles")
        {
          console.log("already the basemap");
        }
        else
        {
          map.basemap.baseLayers = google;
        }

        id = "googleDiv";

        document.getElementById(id).style.borderLeft = "5px solid red";

      };
      document.getElementById("googleDiv").addEventListener("click", googleBase);

      //Esri Streets
      function esriStreets(){
        var title = map.get("basemap.baseLayers.items.0.id");
        //console.log(title);
        document.getElementById(id).style.borderLeft = "5px solid rgb(225, 225, 225)";
        var streets = new VectorTileLayer({
          url: "https://www.arcgis.com/sharing/rest/content/items/a60a37a27cc140ddad15f919cd5a69f2/resources/styles/root.json?f=pjson",
          id:"street"
        });

        if(title == "street")
        {
          console.log("already the basemap");
        }
        else
        {
          map.basemap.baseLayers = streets;
        }
      
        id = "streetsDiv";

        document.getElementById(id).style.borderLeft = "5px solid red";
      };
      document.getElementById("streetsDiv").addEventListener("click", esriStreets);

     //OSM
      function osm(){
        var title = map.get("basemap.baseLayers.items.0.id");
        //console.log(title);
        document.getElementById(id).style.borderLeft = "5px solid rgb(225, 225, 225)";
        osmLayer = new OpenStreetMapLayer({
          id: "osm"
        });

        if(title == "osm")
        {
          console.log("already the basemap");
        }
        else
        {
          map.basemap.baseLayers = osmLayer;
        }

       id = "osm";

        document.getElementById(id).style.borderLeft = "5px solid red";
      };
      document.getElementById("osm").addEventListener("click", osm);
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Code for functional classification in Overlays
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
        definitionExpression: "RTE_PRFX = 'IH' AND RDBD_TYPE = 'KG'",
        legendEnabled: true,
        visible: false,
        popupEnabled: true,
        outFields: ["*"],
        popupTemplate: funcTemplate,
        title: "Functional Classification"
      });

      map.add(functionClass);

      function functionalSysDisplay(){           
        if(functionClass.visible == false){
          functionClass.visible = true;                  
        }else{
          functionClass.visible = false;                     
        }
      };

      document.getElementById("onFun").addEventListener("click", functionalSysDisplay);
      document.getElementById("offFun").addEventListener("click", functionalSysDisplay);

      $(document).ready(function(){
        $('.funMiddle').click(function() {
          $('.inactiveFun, .activeFun').toggle();
        });
      });

      function fcLegendDisplay(){
        var legendBtn = document.getElementById("fcBtn");
        legendBtn.classList.toggle("glyphicon-menu-up");  
      };

      document.getElementById("fcBtn").addEventListener("click", fcLegendDisplay);
      ////////////////////////////////////////////////////////////////  


      ////////////////////////////////////////////////////////////////
      // Code for low water crossing in Overlays
      var lowRender = {
        type: "unique-value",
        field: "LWX_TYPE",

        uniqueValueInfos: [{
          value: "BRIDGE CLASS",
          label: "Bridge Class",
          symbol: {
            type: "simple-marker",
            color: "blue",
            outline: {
              color: [0, 0, 0, 0]},
              size: 7
          }
        }, {
          value: "PEDESTRIAN CROSSING",
          label: "Pedestrian Crossing",
          symbol: {
            type: "simple-marker",
            color: "green",
            outline: {
              color: [0, 0, 0, 0]},
              size: 7
          }
        }, {
          value: "UNVENTED FORD",
          label: "Unvented Ford",
          symbol: {
            type: "simple-marker",
            color: "red",
            outline: {
              color: [0, 0, 0, 0]},
              size: 7
          }
        }, {
          value: "VENTED FORD",
          label: "Vented Ford",
          symbol: {
            type: "simple-marker",
            color: [169, 0, 230, 1],
            outline: {
              color: [0, 0, 0, 0]},
              size: 7
            }        

        },{
          
          value: "NA",
          label: "All other values",
          symbol: {
            type: "simple-marker",
            color: "black",
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
        if(lowWater.visible == false){
          lowWater.visible = true;                 
        }else{
          lowWater.visible = false;                    
        }

     };      

      document.getElementById("onLow").addEventListener("click", lowWaterDisplay);
      document.getElementById("offLow").addEventListener("click", lowWaterDisplay); 

      $(document).ready(function(){
        $('.middle').click(function() {
          $('.inactive, .active').toggle();
        });
      });

      function lwLegendDisplay(){
        var legendBtn = document.getElementById("lwBtn");
        legendBtn.classList.toggle("glyphicon-menu-up");  
      };

      document.getElementById("lwBtn").addEventListener("click", lwLegendDisplay);
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Code for evacuation route in Overlays
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
        title: "Evacuation Route"
      });

      map.add(evacRoute);  

      function evacRouteDisplay(){   
        //var legendBtn = document.getElementById("erBtn");        
        if(evacRoute.visible == false){
          evacRoute.visible = true;       

          //legendBtn.style.visibility = "visible";           
        }
        else
        {          
          evacRoute.visible = false;
          //legendBtn.style.visibility = "hidden"; 
          
        }
      };      

      document.getElementById("onEvac").addEventListener("click", evacRouteDisplay);
      document.getElementById("offEvac").addEventListener("click", evacRouteDisplay);


      $(document).ready(function(){
        $('.evacMiddle').click(function() {
          $('.inactiveEvac, .activeEvac').toggle();
        });
      });

      function evacRouteLegendDisplay(){
        var legendBtn = document.getElementById("erBtn");
        legendBtn.classList.toggle("glyphicon-menu-up");  
      };

      document.getElementById("erBtn").addEventListener("click", evacRouteLegendDisplay);
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Code for evacuation route legend
      var legendEvacRoute = new Legend({
          container: "legendEvacRouteDiv",
          view: mapView,
          layerInfos: [{          
            layer: evacRoute,
            title: " "         
          }]
        });
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // Code for functional classification legend
      var legendFuncClass = new Legend({
        container: "legendFuncClassDiv",
        view: mapView,
        layerInfos: [{          
          layer: functionClass,
          title: " "          
        }]
      });
      ////////////////////////////////////////////////////////////////
      
      ////////////////////////////////////////////////////////////////
      // Code for low water crossing legend
      var legendLowWater = new Legend({
        container: "legendLowWaterDiv",
        view: mapView,        
        layerInfos: [{          
          layer: lowWater,
          title: " "
        }]
      });
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
     // USE WATCHUTILS TO LISTEN FOR ZOOM-END
     // https://community.esri.com/thread/220324-how-to-simulate-listening-for-zoom-end-in-the-4x-framework
      watchUtils.when(mapView, "interacting", function() {
        beginScale = mapView.get('zoom');
      });

      watchUtils.when(mapView, "stationary", function() {
        const currentScale = mapView.get('zoom');
        if (currentScale !== beginScale) {
          console.log("zoom done",mapView.zoom);
          scaleDependentQueries();
        }
      });
      ////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////
      // NOTE THAT WEBGL MUST BE ENABLED TO AVOID THIS ERROR:
      // https://community.esri.com/thread/217436-feature-layer-definition-expression-error
      function scaleDependentQueries() {  
          if (functionClass.visible) {
              if (mapView.zoom<9) {
                 functionClass.definitionExpression = "RTE_PRFX ='IH' AND RDBD_TYPE = 'KG'";
              }
              if (mapView.zoom>8&&mapView.zoom<11) {
                 functionClass.definitionExpression = "(RTE_PRFX IN ('IH', 'US') OR F_SYSTEM IN (1,2,3)) AND RDBD_TYPE = 'KG'";

              }

              if (mapView.zoom>10&&mapView.zoom<13) {
                 functionClass.definitionExpression = "RDBD_TYPE = 'KG'";
              }

              if (mapView.zoom>=13) {
                 functionClass.definitionExpression = "";
              }
          }
      }
      ////////////////////////////////////////////////////////////////


      ////////////////////////////////////////////////////////////////
     //global varibales to update district name and county name custom text
      DistName = [];
      CountName = [];
      dName = "";
      cName = "";
      legendTitle = "Notes";

      //print task! with custom button
      function printMap(){
        //the load spinner with show while this function is running
        // $('#loader').show();
        // $('#loaderOverlay').show();
        // document.getElementById("extent").disabled = true;
        // document.getElementById("print").disabled = true;


        //get extent of the map on the view
        var extentOfPrint = mapView.extent;

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


            //are any layers turned on?
            if(functionClass.visible == true || lowWater.visible == true || evacRoute.visible == true){
              legendTitle = "Selected Overlays";
            }

            //after the districtQuery finishes then the print task is called
            pT();
          };

        };


        function pT(){

          var pt = new PrintTemplate({
            format: "pdf",
            //legendEnabled: true,
            layout: "PoD_Template",            
            layoutOptions: {  
              legendLayer: [],
              customTextElements: [
              {"District Name": dName}, //from the districtQuery above
              {"County Name": cName},  //from the countyQuery above
              {"LegendTitle": legendTitle}    
              ]
            }

          });

          var params = new PrintParameters({
            view: mapView,
            template: pt
          });

          var printTask = new PrintTask({
            url: "https://10.146.128.199:6443/arcgis/rest/services/ExportWebMap/GPServer/Export%20Web%20Map"
          });

          console.log(pt.layoutOptions);

          //execute query THEN get the result or error
          printTask.execute(params).then(printResult, printError);

         //opens new website window with map export
         //loaded is stopped and hidden from the view
          function printResult(result){
              console.log(result.url);
              window.open(result.url, "_blank");
              // $('#loader').hide();
              // $('#loaderOverlay').hide();
              // document.getElementById("extent").disabled = false;
              // document.getElementById("print").disabled = false;
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
      document.getElementById("printSingleDiv").addEventListener("click", printMap);
      ////////////////////////////////////////////////////////////////



    });
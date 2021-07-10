(function () {

   // initialize map
  const map = L.map('map', {
    zoomSnap: .1,
    center: [-.23, 37.8],
    zoom: 6,
    minZoom: 2,
    maxZoom: 9,
    zoomControl: false,
    maxBounds: L.latLngBounds([33.91941161324584, -116.32235385820431], [41.51987019900627, -120.23348678739423])
  });

  // add control in new position
  L.control.zoom({ position: 'topright' }).addTo(map);

  // mapbox API parameters
  const accessToken =
    'pk.eyJ1IjoiYXNobGV5bHlnaXMiLCJhIjoiY2tpOWVpcWQyMDgxeDJ3bWcyazF0ZTdhciJ9.bG8tuQ9_quB2pp-KIHKg1w'
  const yourName = 'ashleylygis'
  const yourMap = 'ckpvioajn0chp19qkylamjs5x'

  // request a mapbox raster tile layer and add to map
  // create base map
  L.tileLayer(
    `https://api.mapbox.com/styles/v1/${yourName}/${yourMap}/tiles/256/{z}/{x}/{y}?access_token=${accessToken}`, {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(map);

  // Use omnivore to load the CSV data
  omnivore.csv('data/food_and_bev_ca_19_17.csv')
    .on('ready', function (e) {
      // access to the GeoJSON here!
      console.log(e.target.toGeoJSON())
      drawMap(e.target.toGeoJSON());
      drawLegend(e.target.toGeoJSON()); // add this statement
    })
    .on('error', function (e) {
      console.log(e.error[0].message);
    })

  // DRAW MAP
  function drawMap(data) {

    console.log(data);

    // circle marker style
		var breweryStyles = {
			stroke: true,
      color: '#D96D02',
      weight: 2,
      opacity: 1,
      fill: true,
      fillColor: '#D96D02',          
      fillOpacity: 0.2,
		}

    var wineryStyles = {
			stroke: true,
      color: '#720a1f',
      weight: 2,
      opacity: 1,
      fill: true,
      fillColor: '#720a1f',          
      fillOpacity: 0.2,
		}

    var otherStyles = {
			stroke: true,
      color: '#3E27B0',
      weight: 2,
      opacity: 1,
      fill: true,
      fillColor: '#3E27B0',          
      fillOpacity: 0.2,
		}
    
    // create layers from GeoJSON data
    const breweryLayer = L.geoJson(data, {
      pointToLayer: function (feature, layer) {
        return L.circleMarker(layer, breweryStyles);
      },
        filter: function (feature) {
          var status = feature.properties['TYPE']
          if (status === "BREWERY") {
            return feature
          };
        }
      }).addTo(map)

      const wineryLayer = L.geoJson(data, {
        pointToLayer: function (feature, layer) {
          return L.circleMarker(layer, wineryStyles);
        },
          filter: function (feature) {
            var status = feature.properties['TYPE']
            if (status === "WINERY") {
              return feature
            };
          }
        }).addTo(map)
          
        const otherLayer = L.geoJson(data, {
          pointToLayer: function (feature, layer) {
            return L.circleMarker(layer, otherStyles);
          },
            filter: function (feature) {
              var status = feature.properties['TYPE']
              if (status === "OTHER") {
                return feature
              };
            }
          }).addTo(map)
          
    // adjust zoom level of map
    map.setZoom(map.getZoom() - .2);

    // update circle sizes with first grade
    resizeCircles(breweryLayer, wineryLayer, otherLayer, currentYear);
   
     sequenceUI(breweryLayer, wineryLayer, otherLayer);

    // add the layer controls 
    drawLayerControl(breweryLayer, wineryLayer, otherLayer, currentYear);

    // // add the slider
    // drawSlider(breweryLayer, wineryLayer, otherLayer, currentYear);

    // // process each layer's data
    // processLayer(breweryLayer, wineryLayer, otherLayer, currentYear);

  } // end drawMap()

  let currentYear = 19;

  // DRAW LAYER CONTROLS
function drawLayerControl(breweryLayer, wineryLayer, otherLayer, currentYear) {

  // add layer controls
  const sourceLayers = {
      "Brewery": breweryLayer,
      "Winery": wineryLayer,
      "Other": otherLayer
  }

  // create Leaflet control for layer visibility
  // basemap, source layers, options
  var layerControl = L.control.layers(null, sourceLayers, { 
      collapsed: false, 
      position: 'topleft',
  }).addTo(map);

}

  // DRAW LEGEND
  function drawLegend(data) {
    
    // create Leaflet control for the legend
    const legendControl = L.control({
      position: 'bottomright'
    });

    // when the control is added to the map
    legendControl.onAdd = function (map) {

      // select the legend using id attribute of legend
      const legend = L.DomUtil.get("legend");

      // disable scroll and click functionality 
      L.DomEvent.disableScrollPropagation(legend);
      L.DomEvent.disableClickPropagation(legend);

      // return the selection
      return legend;
    }
   
    // empty array to hold values
    const dataValues = [];

    // loop through all features 
    data.features.forEach(function (layer) {
      // for each year in a type
      for (let year in layer.properties) {
        // shorthand to each value
        const value = layer.properties[year];
        // if the value can be converted to a number 
        // the + operator in front of a number returns a number
        if (+value) {
          //return the value to the array
          dataValues.push(+value);
        }
      }
    });
    // verify your results!
    console.log(dataValues);

    // sort our array
    const sortedValues = dataValues.sort(function (a, b) {
      return b - a;
    });

    // round the highest number and use as our large circle diameter
    const maxValue = Math.round(sortedValues[0] / 1000) * 1000;

    console.log(maxValue);

    // calc the diameters
    const largeDiameter = calcRadius(maxValue) * 2,
      smallDiameter = largeDiameter / 2;

    // select our circles container and set the height
    $(".legend-circles").css('height', largeDiameter.toFixed());

    // set width and height for large circle
    $('.legend-large').css({
      'width': largeDiameter.toFixed(),
      'height': largeDiameter.toFixed()
    });

    // set width and height for small circle and position
    $('.legend-small').css({
      'width': smallDiameter.toFixed(),
      'height': smallDiameter.toFixed(),
      'top': largeDiameter - smallDiameter,
      'left': smallDiameter / 2
    })

    // label the max and median value
    $(".legend-large-label").html(maxValue.toLocaleString());
    $(".legend-small-label").html((maxValue / 2).toLocaleString());

    // adjust the position of the large based on size of circle
    $(".legend-large-label").css({
      'top': -11,
      'left': largeDiameter + 30,
    });

    // adjust the position of the large based on size of circle
    $(".legend-small-label").css({
      'top': smallDiameter - 11,
      'left': largeDiameter + 30
    });

    // insert a couple hr elements and use to connect value label to top of each circle
    $("<hr class='large'>").insertBefore(".legend-large-label")
    $("<hr class='small'>").insertBefore(".legend-small-label").css('top', largeDiameter - smallDiameter - 8);

    legendControl.addTo(map);

    
  } // end drawLegend()


  // UPDATE CIRCLE SIZES
  function resizeCircles(breweryLayer, wineryLayer, otherLayer, currentYear) {

    // Update girl circle sizes with value selected in slider 
    breweryLayer.eachLayer(function (layer) {
      const radius = calcRadius(Number(layer.feature.properties['TOT_RELEASE_' + currentYear]));
      layer.setRadius(radius);
    });

    wineryLayer.eachLayer(function (layer) {
      const radius = calcRadius(Number(layer.feature.properties['TOT_RELEASE_' + currentYear]));
      layer.setRadius(radius);
    });

    otherLayer.eachLayer(function (layer) {
      const radius = calcRadius(Number(layer.feature.properties['TOT_RELEASE_' + currentYear]));
      layer.setRadius(radius);
    });

    // // Update boy circle sizes with value selected in slider
    // bevLayer.eachLayer(function (layer) {
    //   const radius = calcRadius(Number(layer.feature.properties.BEV_TOTAL_RELEASE));
    //   layer.setRadius(radius);
    // });

    //Retrieve data for info window- update the hover window with current grade's
    retrieveInfo(breweryLayer, wineryLayer, otherLayer, currentYear);

  } // end resizeCircles()

  
  // CALCULATE RADIUS
  function calcRadius(val) {
   
    const radius = Math.sqrt(val / Math.PI);
    return radius * .5; // adjust .5 as a scale factor

  } // end calcRadius()


  // CREATE LEAFLET CONTROL FOR THE SLIDER
  function sequenceUI(breweryLayer, wineryLayer, otherLayer) {

    // create leaflet control for the slider
    const sliderControl = L.control({
      position: 'bottomleft'
    });

    sliderControl.onAdd = function (map) {

      const controls = L.DomUtil.get("slider");

      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);

      return controls;

    }

    //select the slider's input and listen for change
    $('#slider input[type=range]')
      .on('input', function () {

        // current value of slider is current grade level
        var currentYear = this.value;

        // resize the circles with updated grade level
        resizeCircles(breweryLayer, wineryLayer, otherLayer, currentYear);

        // populate HTML elements with relevant info
        $('.year span').html(`${currentYear}`);
      });

    // add it to the map
    sliderControl.addTo(map);

  } // end sequenceUI()


  // SHOW INFO WINDOW FOR SELECTED SCHOOL
  function retrieveInfo(breweryLayer, currentYear) {
   
    // select the element and reference with variable
    // and hide it from view initially
    const info = $('#info').hide();

    // ** Need only one layer because both layers have the same data **
    // since boysLayer is on top, use to detect mouseover events
    breweryLayer.on('mouseover', function (e) {

      // On mouseover, show info window
      // remove the none class to display and show
      info.show();

      // Access CSV properties by currently selected grade level
      // access properties of target layer
      const props = e.layer.feature.properties;

      // Populate info window with properties
      // populate HTML elements with relevant info
      $('#info span').html(props.FACILITY_NAME);
      $(".brewery span:first-child").html('Brewery');
      $("#infoYear").html(currentYear);
     
      // raise opacity level as visual affordance
      e.layer.setStyle({
        fillOpacity: .6
      });

    // hide the info panel when mousing off layergroup and remove affordance opacity
    boysLayer.on('mouseout', function (e) {

      // hide the info panel
      info.hide();

      // reset the layer style
      e.layer.setStyle({
        fillOpacity: 0
      });
    });
  });

    // when the mouse moves on the document
    $(document).mousemove(function (e) {
      // first offset from the mouse position of the info window
      info.css({
        "left": e.pageX + 6,
        "top": e.pageY - info.height() - 25
      });

      console.log(e.pageX, e.pageY)

      // if it crashes into the top, flip it lower right
      if (info.offset().top < 4) {
        info.css({
          "top": e.pageY + 15
        });
      }
      // if it crashes into the right, flip it to the left
      if (info.offset().left + info.width() >= $(document).width() - 40) {
        info.css({
          "left": e.pageX - info.width() - 80
        });
      }
    });
 } // end retrieveInfo()

})();
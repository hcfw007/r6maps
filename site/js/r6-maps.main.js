'use strict';

(function(pagecode) { //eslint-disable-line wrap-iife
  pagecode(window.jQuery, window, document, R6MapsData, R6MapsRender, R6MapsControls);
}(function($, window, document, R6MapsData, R6MapsRender, R6MapsControls, undefined) {
  var map,
    mapElements,
    HASH_SPLIT_CHAR = '/';

  $(function() { // equivanelt to $(document).ready() - but a bit faster
    map = $('#map');
    mapElements = map.find('.elements');

    R6MapsControls.populateMapOptions(R6MapsData.maps);
    tryLoadSavedMapAndObjective();

    loadMap();
    tryLoadSavedFloor();

    setupEvents();
    R6MapsControls.setupZoom(map, mapElements);
  });

  var loadMap = function loadMap() {
    var currentlySelectedMap = R6MapsControls.getCurrentlySelectedMap();

    R6MapsControls.populateFloorOptions(R6MapsData.maps[currentlySelectedMap].floors);
    R6MapsRender.renderMap(R6MapsData.maps[currentlySelectedMap], mapElements);
    setupCameraScreenshots();
    showSelectedFloor();
    showSelectedObjective();
  };

  var tryLoadSavedMapAndObjective = function tryLoadSavedMapAndObjective() {
    var hashArgs = getHashArgs(),
      mapArg = hashArgs[0],
      objectiveArg = hashArgs[2];

    R6MapsControls.trySelectMap(mapArg);
    R6MapsControls.trySelectObjective(objectiveArg);
  };

  var tryLoadSavedFloor = function tryLoadSavedFloor() {
    var hashArgs = getHashArgs(),
      floorArg = hashArgs[1];

    if (R6MapsControls.trySelectFloor(floorArg)) {
      showSelectedFloor();
    }
  };

  var getHashArgs = function getHashArgs() {
    return window.location.hash.substr(1).split(HASH_SPLIT_CHAR);
  };

  var setupEvents = function setupEvents() {
    map.on('click', outputCoordinates);

    R6MapsControls.setupObjectiveChangeEvent(handleObjectiveChange);
    R6MapsControls.setupMapChangeEvent(handleMapChange);
    R6MapsControls.setupFloorChangeEvent(handleFloorChange);
    R6MapsControls.setupFloorHotkeys(showSelectedFloor);
  };

  var handleMapChange = function handleMapChange() {
    sendMapSelectAnalyticsEvent();
    loadMap();
    updateUrl();
  };

  var handleObjectiveChange = function handleObjectiveChange() {
    sendObjectiveSelectAnalyticsEvent();
    showSelectedObjective();
    updateUrl();
  };

  var handleFloorChange = function handleFloorChange() {
    sendFloorSelectAnalyticsEvent();
    showSelectedFloor();
    updateUrl();
  };

  var sendMapSelectAnalyticsEvent = function sendMapSelectAnalyticsEvent() {
    sendControlAnalyticsEvent('Map', R6MapsControls.getCurrentlySelectedMap());
  };

  var sendObjectiveSelectAnalyticsEvent = function sendObjectiveSelectAnalyticsEvent() {
    sendControlAnalyticsEvent('Objective', R6MapsControls.getCurrentlySelectedObjective());
  };

  var sendFloorSelectAnalyticsEvent = function sendFloorSelectAnalyticsEvent() {
    sendControlAnalyticsEvent('Floor', R6MapsControls.getCurrentlySelectedFloor());
  };

  var sendControlAnalyticsEvent = function sendControlAnalyticsEvent(control, value) {
    ga('send', {
      hitType: 'event',
      eventCategory: 'Controls',
      eventAction: control,
      eventLabel: value
    });
  };

  var updateUrl = function updateUrl() {
    var hashText = '';

    hashText += '' + R6MapsControls.getCurrentlySelectedMap();
    hashText += HASH_SPLIT_CHAR + R6MapsControls.getCurrentlySelectedFloor();
    hashText += HASH_SPLIT_CHAR + R6MapsControls.getCurrentlySelectedObjective();
    window.location.hash = hashText;
  };

  var outputCoordinates = function outputCoordinates(e) {
    var warning = R6MapsControls.isZoomed() ? ' Warning, currently zoomed, coordinates are not accurate for CSS.' : '';

    console.log(
      'top: ' + Math.round(e.pageY - mapElements.offset().top) + ', ' +
      'left: ' + Math.round(e.pageX - mapElements.offset().left) +
      warning
    );
  };

  var setupCameraScreenshots = function setupCameraScreenShots(){
    $('a.camera').fancybox({
      padding: 0,
      helpers: {
        overlay: {
          css: {
            background: 'rgba(48,113,169, 0.3)'
          }
        }
      }
    });
  };

  var showSelectedFloor =  function showSelectedFloor() {
    R6MapsRender.showFloor(R6MapsControls.getCurrentlySelectedFloor(), mapElements);
  };

  var showSelectedObjective =  function showSelectedObjective() {
    R6MapsRender.showObjective(R6MapsControls.getCurrentlySelectedObjective(), mapElements);
  };
}));

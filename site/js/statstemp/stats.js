'use strict';

(function(pagecode) { //eslint-disable-line wrap-iife
  pagecode(window.jQuery, window, document, R6MapsCommonLangTerms, R6MapsStatsData, R6MapsStatsControls);
}(function($, window, document, R6MapsCommonLangTerms, R6MapsStatsData, R6MapsStatsControls, undefined) {
  var $mainHeader,
    $filtersHeader,
    $mapHeader,
    $mapOutput,
    $mapHeader,
    $mapLoader,
    $sectionMap,
    $sectionOperators,
    $operatorsHeader,
    $operatorsOutput,
    $operatorsLoader,
    $seasonsLabel,
    $seasonsSelect,
    $platformsLabel,
    $platformsSelect,
    $mapsLabel,
    $mapsSelect,
    $gameModesLabel,
    $gameModesSelect,
    $objectiveLocationsLabel,
    $objectiveLocationsSelect,
    $loadButton,
    $skillRanksHeader,
    $skillRanksControl,
    $skillRanksShower,
    $loadAnchor,
    statsData,
    statTerms,
    QUERY_PARAMS = {
      SEASON: 'season',
      PLATFORM: 'platform',
      MAP: 'mapName',
      MODE: 'gameMode',
      LOCATION: 'objectiveLocation'
    };

  $(function() { // equivanelt to $(document).ready() - but a bit faster
    R6MapsCommonHelpers.tryLoadStartingLanguage(R6MapsCommonLangTerms.tryLoadLanguage);
    statsData = R6MapsStatsData.getData();
    statTerms = R6MapsCommonLangTerms.terms.stats;
    assignPageElements();
    setupStaticElements();
    setupControls();
    window.onpopstate = handleHistoryPop;
  });

  var assignPageElements = function assignPageElements() {
    $mainHeader = $('#header-main');
    $filtersHeader = $('nav h2');
    $sectionMap = $('#section-map');
    $mapHeader = $('#section-map h2');
    $mapOutput = $('#section-map div.output');
    $mapLoader = $('#section-map div.output');
    $sectionOperators = $('#section-operators');
    $operatorsHeader = $('#section-operators h2');
    $operatorsOutput = $('#section-operators div.output');
    $operatorsLoader = $('#section-operators div.loader');

    $seasonsLabel = $('#seasons-control label'),
    $seasonsSelect = $('#seasons-control select'),
    $platformsLabel = $('#platforms-control label'),
    $platformsSelect = $('#platforms-control select'),
    $mapsLabel = $('#maps-control label'),
    $mapsSelect = $('#maps-control select'),
    $gameModesLabel = $('#game-modes-control label'),
    $gameModesSelect = $('#game-modes-control select'),
    $objectiveLocationsLabel = $('#objective-locations-control label'),
    $objectiveLocationsSelect = $('#objective-locations-control select'),
    $loadButton = $('#load-control'),
    $skillRanksHeader = $('#skill-ranks-header');
    $skillRanksControl = $('#skill-ranks-control');
    $skillRanksShower = $('#skill-ranks-shower');
    $loadAnchor = $('#load-anchor');
  };

  var clearOutputSections = function clearOutputSections() {
    $mapOutput.html('');
    $operatorsOutput.html('');
  };

  var disableLoadControl = function disableLoadControl() {
    $('body').addClass('disable-load');
  };

  var enableLoadControl = function enableLoadControl() {
    $('body').removeClass('disable-load');
  };

  var getSkillRanksForSeason = function getSkillRanksForSeason(selectedSeason) {
    var sd,
      result = [];

    for (var key in statsData.skillRanks) {
      sd = statsData.skillRanks[key];
      if ((selectedSeason >= sd.seasonSpan[0]) && (selectedSeason <= sd.seasonSpan[1])) {
        result.push(key);
      }
    }
    return result;
  };

  var handleGameModeChange = function handleGameModeChange() {
    R6MapsStatsControls.objectiveLocations.update(
      $objectiveLocationsSelect,
      statsData.mapsGameModeObjectiveLocations,
      R6MapsStatsControls.seasons.get($seasonsSelect),
      R6MapsStatsControls.maps.get($mapsSelect),
      R6MapsStatsControls.gameModes.get($gameModesSelect)
    );
    enableLoadControl();
  };

  var handleApiAllSuccess = function handleApiAllSuccess() {
    $('body').removeClass('load-in-progress');
    $loadAnchor.focus();
    enableLoadControl();
  };

  var handleApiMapSuccess = function handleApiMapSuccess(mapData) {
    R6MapsStatsMapRender.render(mapData, $mapOutput, statsData);
    $sectionMap.removeClass('load-in-progress');
  };

  var handleApiMapError = function handleApiMapError(mapData) {
    $('body').removeClass('load-in-progress');
    $sectionMap.removeClass('load-in-progress');
    $mapOutput.html('<p class="error">' + R6MapsCommonLangTerms.terms.stats.error + '</p>');
  };

  var handleApiOperatorSuccess = function handleApiOperatorSuccess(operatorsData) {
    console.log('Operators success', R6MapsStatsOperatorsData.get()); // TODO TEMP OR WRAP IN DEV MODE CONFIG SETTING
    tryLoadSavedOperatorsSortField();

    R6MapsStatsOperatorsRender.render(
      R6MapsStatsOperatorsData.get(),
      $operatorsOutput,
      statsData,
      getSkillRanksForSeason(R6MapsStatsControls.seasons.get($seasonsSelect)),
      resortOperators
    );
    $sectionOperators.removeClass('load-in-progress');
  };

  var handleApiOperatorError = function handleApiOperatorError(operatorsData) {
    $sectionOperators.removeClass('load-in-progress');
    $operatorsOutput.html('<p class="error">' + R6MapsCommonLangTerms.terms.stats.error + '</p>');
  };

  var handleHistoryPop = function handleHistoryPop() {
    setupControls();
    enableLoadControl();
  };

  var handleLoadButtonClick = function handleLoadButtonClick() {
    var possibleParams = [
        { string: QUERY_PARAMS.SEASON, currentValue: R6MapsStatsControls.seasons.get($seasonsSelect)},
        { string: QUERY_PARAMS.PLATFORM, currentValue: R6MapsStatsControls.platforms.get($platformsSelect)},
        { string: QUERY_PARAMS.MAP, currentValue: R6MapsStatsControls.maps.get($mapsSelect)},
        { string: QUERY_PARAMS.MODE, currentValue: R6MapsStatsControls.gameModes.get($gameModesSelect)},
        { string: QUERY_PARAMS.LOCATION, currentValue: R6MapsStatsControls.objectiveLocations.get($objectiveLocationsSelect)}
      ],
      queryString = '',
      counter = 0;

    possibleParams.forEach(function(param) {
      if (param.currentValue && (param.currentValue != R6MapsStatsControls.ALL_KEY)) {
        queryString += (counter == 0) ? '?' : '&';
        queryString += param.string + '=' + param.currentValue;
        counter++;
      }
    });
    history.pushState({}, '', [location.protocol, '//', location.host, location.pathname].join('') + queryString);

    $('body').removeClass('not-loaded-yet');
    $sectionMap.addClass('load-in-progress');
    $sectionOperators.addClass('load-in-progress');
    $('body').addClass('load-in-progress');
    disableLoadControl();

    clearOutputSections();
    savePlatformOption(R6MapsStatsControls.platforms.get($platformsSelect));
    sendLoadStatsAnalyticsEvent(queryString);

    R6MapsStatsApi.getMapAndOperators(
      handleApiMapSuccess,
      handleApiMapError,
      handleApiOperatorSuccess,
      handleApiOperatorError,
      handleApiAllSuccess,
      queryString,
      statsData
    );
  };

  var handleMapChange = function handleMapChange() {
    var selectedSeason = R6MapsStatsControls.seasons.get($seasonsSelect),
      selectedMap = R6MapsStatsControls.maps.get($mapsSelect);

    R6MapsStatsControls.gameModes.update(
      $gameModesSelect,
      statsData.gameModes,
      statsData.mapsGameModeObjectiveLocations,
      selectedSeason,
      selectedMap
    );
    R6MapsStatsControls.objectiveLocations.update(
      $objectiveLocationsSelect,
      statsData.mapsGameModeObjectiveLocations,
      selectedSeason,
      selectedMap,
      R6MapsStatsControls.gameModes.get($gameModesSelect)
    );
    enableLoadControl();
  };

  var handleSeasonChange = function handleSeasonChange() {
    var selectedSeason = R6MapsStatsControls.seasons.get($seasonsSelect);

    R6MapsStatsControls.platforms.update(
      $platformsSelect,
      statsData.platforms,
      selectedSeason
    );

    R6MapsStatsControls.maps.update(
      $mapsSelect,
      statsData.mapsGameModeObjectiveLocations,
      selectedSeason
    );
    handleMapChange();

    R6MapsStatsControls.skillRanks.setup(
      $skillRanksHeader,
      $skillRanksControl,
      statsData.skillRanks,
      R6MapsStatsControls.seasons.get($seasonsSelect),
      handleSkillRankChange
    );
    handleSkillRankChange();

    enableLoadControl();
  };

  var handleSkillRankChange = function handleSkillRankChange() {
    var selectedSkillRanks = R6MapsStatsControls.skillRanks.get($skillRanksControl);

    $skillRanksShower.removeClass();
    selectedSkillRanks.forEach(function(skillRank) {
      $skillRanksShower.addClass('show-' + statsData.skillRanks[skillRank].cssClass);
    });
    saveSkillRankOptions(selectedSkillRanks);
  };

  var resortOperators = function resortOperators(sortField, sortRank) {
    R6MapsStatsOperatorsData.trySort(sortField, sortRank);
    R6MapsStatsOperatorsRender.render(
      R6MapsStatsOperatorsData.get(),
      $operatorsOutput,
      statsData,
      getSkillRanksForSeason(R6MapsStatsControls.seasons.get($seasonsSelect)),
      resortOperators
    );
    saveOperatorsSortField(sortField, sortRank);
  };

  var saveOperatorsSortField = function saveOperatorsSortField(sortField, optionalRank) {
    localStorage.setItem('statssortfield', sortField + ',' + optionalRank);
  };

  var savePlatformOption = function savePlatformOption(platformOption) {
    localStorage.setItem('statsplatform', platformOption);
  };

  var saveSkillRankOptions = function saveSkillRankOptions(selectedSkillRanks) {
    localStorage.setItem('statsskillrankoptions', selectedSkillRanks.join());
  };

  var setupControls = function setupControls() {
    R6MapsStatsControls.seasons.setup(
      $seasonsSelect,
      $seasonsLabel,
      statsData.seasons,
      handleSeasonChange
    );
    R6MapsStatsControls.seasons.trySelect($seasonsSelect, R6MapsCommonHelpers.queryString(QUERY_PARAMS.SEASON));

    R6MapsStatsControls.platforms.setup(
      $platformsSelect,
      $platformsLabel,
      statsData.platforms,
      R6MapsStatsControls.seasons.get($seasonsSelect),
      enableLoadControl
    );
    tryLoadSavedPlatformOption();
    R6MapsStatsControls.platforms.trySelect($platformsSelect, R6MapsCommonHelpers.queryString(QUERY_PARAMS.PLATFORM));

    R6MapsStatsControls.maps.setup(
      $mapsSelect,
      $mapsLabel,
      statsData.mapsGameModeObjectiveLocations,
      R6MapsStatsControls.seasons.get($seasonsSelect),
      handleMapChange
    );
    R6MapsStatsControls.maps.trySelect($mapsSelect, R6MapsCommonHelpers.queryString(QUERY_PARAMS.MAP));

    R6MapsStatsControls.gameModes.setup(
      $gameModesSelect,
      $gameModesLabel,
      statsData.gameModes,
      statsData.mapsGameModeObjectiveLocations,
      handleGameModeChange,
      R6MapsStatsControls.seasons.get($seasonsSelect),
      R6MapsStatsControls.maps.get($mapsSelect)
    );
    R6MapsStatsControls.gameModes.trySelect($gameModesSelect, R6MapsCommonHelpers.queryString(QUERY_PARAMS.MODE));

    R6MapsStatsControls.objectiveLocations.setup(
      $objectiveLocationsSelect,
      $objectiveLocationsLabel,
      statsData.mapsGameModeObjectiveLocations,
      R6MapsStatsControls.seasons.get($seasonsSelect),
      R6MapsStatsControls.maps.get($mapsSelect),
      R6MapsStatsControls.gameModes.get($gameModesSelect),
      enableLoadControl
    );
    R6MapsStatsControls.objectiveLocations.trySelect($objectiveLocationsSelect, R6MapsCommonHelpers.queryString(QUERY_PARAMS.LOCATION));

    R6MapsStatsControls.skillRanks.setup(
      $skillRanksHeader,
      $skillRanksControl,
      statsData.skillRanks,
      R6MapsStatsControls.seasons.get($seasonsSelect),
      handleSkillRankChange
    );
    tryLoadSavedSkillRankOptions();
    handleSkillRankChange();

    $loadButton.html(statTerms.loadButtonText);
    $loadButton.on('click', handleLoadButtonClick);
  };

  var sendLoadStatsAnalyticsEvent = function sendLoadStatsAnalyticsEvent(queryString) {
    ga('send', {
      hitType: 'event',
      eventCategory: 'Controls',
      eventAction: 'LoadStats',
      eventLabel: queryString
    });
  };

  var setupStaticElements = function setupStaticElements() {
    $mainHeader.find('.page-title').html(statTerms.headerMain);
    $filtersHeader.html(statTerms.headerFilters);
    $mapHeader.html(statTerms.headerMap);
    $operatorsHeader.html(statTerms.headerOperators);
    $('p.all-text').html(statTerms.allOption);
    $('p.instructions').html(statTerms.instructions);
  };

  var tryLoadSavedOperatorsSortField = function tryLoadSavedOperatorsSortField() {
    var sortFieldOptions = localStorage.getItem('statssortfield'),
      sortField,
      optionalRank;

    if (sortFieldOptions) {
      sortField = sortFieldOptions.split(',')[0],
      optionalRank = sortFieldOptions.split(',')[1];
    } else {
      sortField = 'name'; //fallback
    }

    R6MapsStatsOperatorsData.trySort(sortField, optionalRank);
  };

  var tryLoadSavedPlatformOption = function tryLoadSavedPlatformOption() {
    var platformOption = localStorage.getItem('statsplatform');

    if (platformOption !== null) {
      R6MapsStatsControls.platforms.trySelect($platformsSelect, platformOption);
    }
  };

  var tryLoadSavedSkillRankOptions = function tryLoadSavedSkillRankOptions() {
    var previouslySelectedSkillRanks = localStorage.getItem('statsskillrankoptions');

    if (previouslySelectedSkillRanks) {
      R6MapsStatsControls.skillRanks.trySelect(
        $skillRanksControl,
        previouslySelectedSkillRanks.split(',')
      );
    }
  };
}));

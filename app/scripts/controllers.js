'use strict';
angular.module('MetalorgieMobile.controllers', [])

.controller('AppController', function($scope, $ionicSideMenuDelegate) {
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
})

.controller('NewsCtrl', function($scope, News) {
    if(typeof analytics !== "undefined") { analytics.trackView("News Controller"); }
    $scope.news = [];

    $scope.noMoreItemsAvailable = false;

    $scope.loadMore = function() {
        var newsPromise = News.find($scope.news.length, 40);
        newsPromise.then(function(result) {  // this is only run after $http completes
            $scope.news.push.apply($scope.news, result);
            if ( $scope.news.length == 2000 ) {
                $scope.noMoreItemsAvailable = true;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
        if(typeof analytics !== "undefined") { analytics.trackEvent('News', 'LoadMore'); }
    };

    $scope.doRefresh = function() {
        var newsPromise = News.find(0, 40);
        newsPromise.then(function(result) {  // this is only run after $http completes
            $scope.news.push.apply($scope.news, result);
            $scope.$broadcast('scroll.refreshComplete');
        });
        if(typeof analytics !== "undefined") { analytics.trackEvent('News', 'DoRefresh'); }
    };

    var newsPromise = News.last();
    newsPromise.then(function(result) {  // this is only run after $http completes
        $scope.news = result;
    });
})

.controller('NewsDetailCtrl', function($scope, $stateParams, News) {
    if(typeof analytics !== "undefined") { analytics.trackView("News Detail Controller"); }
    var newsDetailPromise = News.get($stateParams.newsId);
    newsDetailPromise.then(function(result) {
        $scope.news = result;
    });
})

.controller('BandsCtrl', function($scope, Band) {
        if(typeof analytics !== "undefined") { analytics.trackView("Bands Controller"); }

        $scope.bands = [];

        //if(typeof analytics !== "undefined") { analytics.trackView("Bands Controller"); }
        var bandsPromise = Band.latest(0,40);
        bandsPromise.then(function(result) {
            $scope.bands = result;
        });

        $scope.loadMore = function() {
            var bandsPromise = Band.latest($scope.bands.length, 40);
            bandsPromise.then(function(result) {  // this is only run after $http completes
                $scope.bands.push.apply($scope.bands, result);
                if ( $scope.bands.length == 10000 ) {
                    $scope.noMoreItemsAvailable = true;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            if(typeof analytics !== "undefined") { analytics.trackEvent('Bands', 'LoadMore'); }
        };

        $scope.query = {term: ''};

        $scope.search = function() {
            if ($scope.query.term.length > 2) {
                var bandsPromise = Band.search($scope.query.term, 0, 40);
                bandsPromise.then(function(result) {  // this is only run after $http completes
                    $scope.bands = result;
                });
                if(typeof analytics !== "undefined") { analytics.trackEvent('Bands', 'Search'); }
            }
        };
})

.controller('BandDetailCtrl', function($scope, $stateParams, Band) {
    var bandDetailPromise = Band.get($stateParams.slug);
    bandDetailPromise.then(function(result) {
        $scope.band = result;
    });
})

.controller('AlbumCtrl', function($scope, $stateParams, Album) {
    var albumPromise = Album.get($stateParams.id);
        albumPromise.then(function(result) {
        $scope.album = result;
    });
})

.controller('ReleasesCtrl', function($scope) {

})

.controller('LivesCtrl', function($scope, Lives, $cordovaGeolocation, $ionicPopup, City) {
    $cordovaGeolocation
        .getCurrentPosition()
        .then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;

            var livesPromise = Lives.incoming(lat, long);
            livesPromise.then(function(result) {  // this is only run after $http completes
                $scope.lives = result;
            });
        }, function(err) {
            // error
        });

        $scope.data = {};
        $scope.cities = [];

        $scope.searchCity = function() {
            var cityPromise = City.search($scope.data.city);
            cityPromise.then(function(result) {
                $scope.cities = result;
            });
        };

        var popup = null;

        $scope.showChooseCity = function() {
            // An elaborate, custom popup
            popup = $ionicPopup.show({
                templateUrl: 'templates/popup-choose-city.html',
                title: 'Choisissez une ville',
                subTitle: 'Taper le nom de la ville',
                scope: $scope,
                buttons: [
                    { text: 'Annuler' }
                ]
            });
            popup.then(function(res) {
                console.log('Tapped!', res);
            });
        };

        $scope.chooseCity = function(city) {
            var livesPromise = Lives.incoming(city.lat, city.long);
            livesPromise.then(function(result) {
                $scope.lives = result;
                popup.close();
            });
        };
})
.controller('LiveDetailCtrl', function($scope, $stateParams, Lives) {
    var liveDetailPromise = Lives.get($stateParams.slug);
    liveDetailPromise.then(function(result) {
        $scope.live = result;
    });
})

.controller('ReleasesCtrl', function($scope, Releases, $filter) {
    var releasesPromise = Releases.incoming();
    releasesPromise.then(function(releases) {
        $scope.releases = {};
        var contactsLength = releases.length;
        for (var i = 0; i < contactsLength; i++) {
            var dateStr = $filter('date')(releases[i].date, "dd/MM/yyyy");
            if(!$scope.releases[dateStr]) {
                $scope.releases[dateStr] = [];
            }

            $scope.releases[dateStr].push ( releases[i] );
        }
        console.log($scope.releases);
    });
})
;

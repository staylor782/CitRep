var app = angular.module('CitRep', ['ui.router', 'firebase', 'ngMaterial']);

app.config(function($mdThemingProvider, $stateProvider, $urlRouterProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey', {
            'default': '900', // by default use shade 400 from the palette for primary intentions
            'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
            'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
            'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        })
        .accentPalette('blue');
    
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('home', {
            //parent controller - add ng-controller to index.html
            controller: 'mainCtrl',
            url: '/',
            views: {
                'maps': {
                    templateUrl: 'js/Maps/maps.html',
                    controller: 'mapsCtrl'
                },
                'sideMenu': {
                    templateUrl: 'js/SideMenu/sideMenu.html',
                    controller: 'sideMenuCtrl'
                }
            }
    })
});

app.constant('fb', {
    url: 'https://citrep.firebaseio.com/';
});
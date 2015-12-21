var app = angular.module('CitRep');

app.controller('mainCtrl', function($scope, $firebaseAuth, fb) {
    $scope.loggedIn = false;
    
    $scope.isAdmin = false;
    
    var ref = new Firebase(fb.url);
    
    $scope.authObj = $firebaseAuth(ref);
    $scope.user = $scope.authObj.$getAuth();
  
    $scope.login = function() {
        $scope.authObj.$authWithOAuthRedirect("google");
    };
  
    $scope.authObj.$onAuth(function(authObj) {
        $scope.user = authObj;
        $scope.loggedIn = true;
    });
  
    $scope.logout = function() {
        $scope.authObj.$unauth();
        $scope.loggedIn = false;
    };
}
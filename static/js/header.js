(function(){
  var app = angular.module('lstc.header', []);
  app.controller('HeaderController', ['$location', function($location) {
    this.menuIsOpen = false;
    this.toggleMenu = function() {
      this.menuIsOpen = !this.menuIsOpen;
    };
    this.isActive = function(viewLocation) {
      return viewLocation === $location.path();
    }
  }]);
  app.directive('appHeader', function(){
    return {
      restrict: 'E',
      templateUrl: '/static/partials/app-header.html',
      controller: ['$location', function($location) {
        this.menuIsOpen = false;
        this.toggleMenu = function() {
          this.menuIsOpen = !this.menuIsOpen;
        };
        this.isActive = function(viewLocation) {
          //tests if a view is active
          return viewLocation === $location.path();
        }
      }],
      controllerAs: 'header'
    }
  });
})();

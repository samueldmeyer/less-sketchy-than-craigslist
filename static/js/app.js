/**
 * Created by home on 9/13/14.
 */

(function(){stuff = [
  {
    id: 1,
    title: "Old Couch",
    cost: "145.23",
    location: "North Pole, Colorado",
    owner: {id: 1, name: "bob"},
    description: "this is longer than the others by a bit.",
    picture: "http://placekitten.com/g/20/30"
  },
  {
    id: 2,
    title: "New Bike",
    cost: "500",
    location: "1234 Main Street, San Francisco",
    owner: {id: 2, name: "User1234"},
    picture: "http://placekitten.com/g/21/30"
  },
  {
    id: 3,
    title: "Telsa Model S",
    cost: "1000000000000",
    location: "Telsa Meseum",
    owner: {id: 3, name: "Andrew"},
    picture: "http://placekitten.com/g/22/30"
  }
]

people = [
  {
    id: 1,
    name: "bob",
    averageRating: 3,
    ratingList: [2, 4],
    email: "bob@example.com"
  },
  {
    id: 2,
    name: "User1234",
    averageRating: 1,
    ratingList: [1],
    email: "User1234@example.com"
  },
  {
    id: 3,
    name: "Andrew",
    averageRating: 0,
    ratingList: [],
    email: "Andrew@example.com"
  }
]


var app = angular.module('lessSketchy', [
  'ngResource', 
  'ngRoute', 
  'lstc.items', 
  'lstc.users']
  );


app.controller('HeaderController', ['$location', function($location) {
  this.menuIsOpen = false;
  this.toggleMenu = function() {
    this.menuIsOpen = !this.menuIsOpen;
  };
  this.clickTest = function() {
    testFactory.testFunc();
  };
  this.isActive = function(viewLocation) {
    return viewLocation === $location.path();
  }
}])

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

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: '/static/partials/home.html'
      }).
      when('/listedstuff', {
        templateUrl: '/static/partials/item-list.html',
        controller: 'AllItemsController'
      }).
      when('/listedstuff/:itemId', {
        templateUrl: '/static/partials/item-detail.html',
        controller: 'SingleItemController'
      }).
      when('/sell', {
        templateUrl: '/static/partials/sell.html',
        controller: 'sellFormController'
      }).
      when('/appusers/:user_id', {
        templateUrl: '/static/partials/user-detail.html',
        controller: 'SinglePersonController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

 })();




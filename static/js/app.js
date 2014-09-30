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


var app = angular.module('lessSketchy', ['ngResource', 'ngRoute'])
.controller('lessSketchyCtrl', function() {
  this.yourName = "bob";
})
.controller('MainPanelCtrl', function() {
  this.tab = 1;
  this.selectTab = function(newTab) {
    this.tab = newTab;
  }
  this.isSelected = function(checkTab) {
    return this.tab === checkTab;
  }
})
.controller('StuffListCtrl', ['stuffList', function (stuffList) {
  this.stuffList = stuffList.all;
  this.clickTest = function() {
    alert(testFactory.currentNum);
  };
  this.activate = function(id) {
    stuffList.setThing(id);
  };

}])
.controller('SingleStuffCtrl', ['stuffList', 'peopleList', '$routeParams', function (stuffList, peopleList, $routeParams) {

  stuffList.setThing($routeParams.itemId);

  this.thing = stuffList.currentThing;
  this.goToOwner = function() {
    peopleList.setPerson(this.thing.owner.id)
  }
}])
.controller('SinglePersonCtrl', ['peopleList', '$resource', '$routeParams', function (peopleList, $resource, $routeParams) {
  var Person = $resource('/users/:id', {id: '@id'})
  console.log()
  this.person = Person.get({id: $routeParams.user_id})
}])
.controller('PeopleListCtrl', function() {
  this.peopleList = people;
})
.controller('HeaderCtrl', ['$location', function($location) {
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
.controller('sellFormController', ['$resource', '$location', function($resource, $location){
  this.sell = {};

  //this.newId = 4;

  var SellItem = $resource('/items/:id', {id: '@id'}, {});

  this.addItem = function() {
    var newItem = new SellItem(this.sell);
    var ctrl = this;
    newItem.$save(function(item) {
      stuff.push(item);
      ctrl.sell = {};
      console.log("/listedstuff/" + item.id);
      $location.path( "/listedstuff/" + item.id );
    });
  };
    // SellItem.save(this.sell, function() {
    //   stuff.push(this.sell);
    //   console.log(JSON.stringify(this.sell));
    //   this.sell = {};

    //});
    //this.sell.id = newItem.id;
  
}])
.controller('ratingFormController', ['$resource', function($resource){
  this.review = {};
  // var Rating = $resource('/users/reviews/:review_id');
  var Rating = $resource('/users/:app_user_id/reviews/:review_id', {app_user_id: '@app_user_id'});
  this.addRating = function(user) {
    //recalculate average rating
    var newRating = new Rating(this.review);
    console.log(user.id);
    newRating.app_user_id = user.id;
    newRating.$save(function(review) {
      console.log
      var ratingListLength = user.rating_list.length;
      user.rating = 
        (user.rating * ratingListLength + parseInt(review.rating)) / 
        (ratingListLength + 1);
      user.rating_list.push(review)
      this.review = {};
    });

  };
}]);

app.factory('stuffList', ['$filter', '$resource', function($filter, $resource) {
  var fac = {};

  //fac.all = stuff;

  var SellItemList = $resource('/items');

  var SellItem = $resource('/items/:id', {id: '@id'}, {});

  fac.all = SellItemList.query();

  fac.currentThing = { };
  fac.setThing = function(id) {
    // Sets current shown item
    angular.copy($filter('filter')(this.all, {id: id})[0], this.currentThing);
    if (!this.currentThing.id) {
      this.currentThing = SellItem.get({id: id})
    }
  };

  return fac; 
}]);

app.factory('peopleList', ['$filter', function($filter) {
  var fac = {}

  fac.all = people;
  fac.currentPerson = { };
  fac.setPerson = function(id) {
    // Sets current shown person
    angular.copy($filter('filter')(this.all, {id: id})[0], this.currentPerson);
  };

  return fac; 
}]);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: '/static/partials/home.html'
      }).
      when('/listedstuff', {
        templateUrl: '/static/partials/item-list.html',
        controller: 'StuffListCtrl'
      }).
      when('/listedstuff/:itemId', {
        templateUrl: '/static/partials/item-detail.html',
        controller: 'SingleStuffCtrl'
      }).
      when('/sell', {
        templateUrl: '/static/partials/sell.html',
        controller: 'sellFormController'
      }).
      when('/appusers/:user_id', {
        templateUrl: '/static/partials/user-detail.html',
        controller: 'SinglePersonCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

 })();




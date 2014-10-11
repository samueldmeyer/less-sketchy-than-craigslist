// This module includes all controllers and services for items, including displaying and adding
angular.module('lstc.items', [])
// Services
.factory('ItemsApi', ['$resource', function($resource){
  return $resource('/items/:id', {id: '@id'}, {});
}])
.factory('Items', ['$filter', 'ItemsApi', function($filter, ItemsApi){
  var fac = {}
  fac.currentItem = { };

  fac.all = ItemsApi.query();

  fac.setCurrent = function(id) {
    // Sets item based on item id
    this.currentItem = ItemsApi.get({id: id});
  };

  fac.addItem = function(item, success) {
    //success is a function that accepts an item returned from the server as input
    // newItem = ItemsApi.createInstance([item]);
    var addToListAndSuccess = function (item) {
      fac.all.push(item);
      (success || angular.noop)(item);
    }
    ItemsApi.save(item, addToListAndSuccess);
  }

  return fac;
}])



// Controllers
.controller('AllItemsController', ['Items', function (Items) {
  this.items = Items.all;
  // this.activate = function(id) {
  //   items.setThing(id);
  // };
}])
.controller('SingleItemController', ['Items', '$routeParams', function (Items, $routeParams) {
  Items.setCurrent($routeParams.itemId);
  this.item = Items.currentItem;
  this.emailTab = function() {
    // open email in a new tab
    console.log("clicked");
    window.open("mailto:" + this.item.email + "?subject=" + this.item.title);
  }
}])
.controller('sellFormController', ['Items', '$location', function(Items, $location){
  this.sell = {};

  this.addItem = function() {
    var ctrl = this;
    Items.addItem(this.sell, function(item) {
      ctrl.sell = {};
      $location.path( "/listedstuff/" + item.id );
    });
  };
  
}]);
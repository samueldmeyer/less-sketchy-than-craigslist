// This module includes all controllers and services for items, including displaying and adding
angular.module('lstc.items', [])
// Services
.factory('Items', ['$filter', '$resource', function($filter, $resource){
  var fac = {}
  var SellItem = $resource('/items/:id', {id: '@id'}, {});
  fac.currentItem = { };

  fac.all = SellItem.query();

  fac.setCurrent = function(id) {
  // Sets item based on item id
    angular.copy($filter('filter')(fac.all, {id: id})[0], this.currentItem);
    // If item is not in the current list in memory, get from server
    if (!this.currentItem.id) {
      this.currentItem = SellItem.get({id: id});
    }
  };

  fac.addItem = function(item, success) {
    //success is a function that takes an item as an input
    newItem = new SellItem(item);
    var addToListAndSuccess = function (item) {
      fac.all.push(item);
      success(item);
    }
    newItem.$save(addToListAndSuccess);
  }

  return fac;
}])
// .factory('AllItems', ['$filter', '$resource', function($filter, $resource) {
//   //Controls both the list of items and single items
//   var fac = {};
//   var SellItemList = $resource('/items');

  

//   return fac; 
// }])



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
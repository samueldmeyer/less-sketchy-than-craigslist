// This module includes all controllers and services for items, including displaying and adding
(function(){
  var app = angular.module('lstc.items', []);
  // Services
  app.factory('ItemsApi', ['$resource', function($resource){
    return $resource('/items/:id', {id: '@id'}, {});
  }]);
  app.factory('Items', ['$filter', 'ItemsApi', function($filter, ItemsApi){
    var fac = {};
    fac.currentItem = {};

    fac.all = ItemsApi.query();

    fac.fullItems = [];

    fac.setCurrent = function(id) {
      // Sets item based on item id if not already done
      if ($filter('filter')(fac.fullItems, {id: id})[0] !== this.currentItem) {
        angular.copy($filter('filter')(fac.fullItems, {id: id})[0], this.currentItem);
      }
      // If item is not in the current list in memory, get from server
      if (!this.currentItem.id) {
        this.currentItem = ItemsApi.get({id: id});
        this.fullItems.push(this.currentItem);
      }
    };

    fac.addItem = function(item, success) {
      //success is an optional function that accepts an item returned from the server as input
      // newItem = ItemsApi.createInstance([item]);
      var addToListAndSuccess = function (item) {
        fac.all.push(item);
        fac.fullItems.push(item);
        (success || angular.noop)(item);
      }
      ItemsApi.save(item, addToListAndSuccess);
    }

    return fac;
  }]);



  // Controllers
  app.controller('AllItemsController', ['Items', function (Items) {
    this.items = Items.all;
  }]);
  app.controller('SingleItemController', ['Items', '$routeParams', function (Items, $routeParams) {
    this.item = {};

    this.init = function() {
      Items.setCurrent($routeParams.itemId);
      this.item = Items.currentItem;
    };

    this.emailTab = function() {
      // open email in a new tab/window
      window.open('mailto:' + encodeURIComponent(this.item.email) + 
        '?subject=' + encodeURIComponent(this.item.title));
    };

    this.init();
  }]);
  app.controller('SellFormController', ['Items', '$location', function(Items, $location){
    this.sell = {};

    this.addItem = function() {
      var ctrl = this;
      Items.addItem(this.sell, function(item) {
        ctrl.sell = {};
        $location.path( '/listedstuff/' + item.id );
      });
    };
    
  }]);
})();

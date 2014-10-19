(function(){
  var app = angular.module('lstc.users', []);
  app.factory('ReviewApi', ['$resource', function($resource) {
    return $resource('/users/:app_user_id/reviews/:review_id', 
      {app_user_id: '@app_user_id'});
  }]);
  app.controller('SinglePersonController', ['$resource', '$routeParams', function ($resource, $routeParams) {
    var Person = $resource('/users/:id', {id: '@id'});
    this.person = Person.get({id: $routeParams.user_id});
  }]);
  app.controller('ratingFormController', ['$resource', 'ReviewApi', function($resource, ReviewApi){
    this.review = {};
    this.formDisabled = false;
    this.formSubmitError = false;
    this.formErrorMessage = '';

    this.addRating = function(user) {
      //save rating and recalculate average rating
      this.formDisabled = true;
      this.formSubmitError = false;
      this.review.app_user_id = user.id;

      var ctrl = this;
      ReviewApi.save(this.review, function(review) {
        var ratingListLength = user.rating_list.length;
        user.rating = 
          (user.rating * ratingListLength + parseInt(review.rating)) / 
          (ratingListLength + 1);
        user.rating_list.push(review);
        ctrl.review = {};
      }, function(err) {
        ctrl.formDisabled = false;
        ctrl.formSubmitError = true;
        ctrl.formErrorMessage = err.data;
      });
    };
  }]);
})();

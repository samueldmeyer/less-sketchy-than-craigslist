angular.module('lstc.users', [])
.controller('SinglePersonCtrl', ['$resource', '$routeParams', function ($resource, $routeParams) {
  var Person = $resource('/users/:id', {id: '@id'})
  this.person = Person.get({id: $routeParams.user_id})
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
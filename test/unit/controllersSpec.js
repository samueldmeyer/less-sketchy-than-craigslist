describe('AllItemsController', function(){

  beforeEach(module('lessSketchyThanCraigslist'));

  it('should initialize', inject(function($controller) {
    var ctrl = $controller('AllItemsController');
    expect(true).toBeTruthy();
  }));

});

describe('SingleItemController', function() {
  beforeEach(module('lessSketchyThanCraigslist'));

  it('should get an item on initialization', inject(function($controller, ItemsApi) {
    var ctrl = $controller('SingleItemController', {$routeParams: {id: "15"}});
    spyOn(ItemsApi, "get").and.returnValue({
      description: "A good couch for you to sit on.",
      title: "A couch",
      selling_app_user_id: 5629499534213129,
      id: "15",
      cost: 400,
      location: "1234 Main Street, Smallville, OK",
      email: "test@example.com"
    });

    ctrl.init();
    expect(ctrl.item.id).toBe("15");
    expect(ctrl.item.cost).toBe(400);
  }));
});

describe('SellFormController', function() {
  beforeEach(module('lessSketchyThanCraigslist'));

  it('should add new items to the list and redirect', inject(function($controller, ItemsApi, $location) {
    var ctrl = $controller('SellFormController');
    spyOn($location, "path");

    spyOn(ItemsApi, "save").and.callFake(function(input, success) {
      input.id = "16"
      success(input);
    });

    ctrl.sell = {
      description: "All your base.",
      title: "The Base",
      selling_app_user_id: 5629499534213121,
      cost: 10000,
      location: "Everywhere",
      email: "test2@example.com"
    }

    ctrl.addItem();

    expect(ctrl.sell).toEqual({});
    expect($location.path).toHaveBeenCalled();
    expect($location.path).toHaveBeenCalledWith("/listedstuff/" + "16");

  }));
});

xdescribe('SinglePersonController', function() {
  // Only initialization exists, and it is not yet tested
  beforeEach(module('lessSketchyThanCraigslist'));

  xit('should initialize a person', inject(function($controller) {
    ctrl = $controller('SinglePersonController', {});
    ctrl.init();
    expect(ctrl.person).toBe({id:1, name: "bob"});
  }));
});

describe('ratingFormController', function() {
  beforeEach(module('lessSketchyThanCraigslist'));

  it('should add a rating', inject(function($controller, ReviewApi) {
    ctrl = $controller('ratingFormController');
    spyOn(ReviewApi, 'save').and.callFake(function(input, success) {
      input.source_user_id = 345234;
      delete input.app_user_id;
      success(input);
    })
    ctrl.review = {
      rating: 1
    }

    user = {
      id: "15",
      rating_list: [{
        rating: 5,
        source_user_id: 345234
      }, {
        rating: 3,
        source_user_id: 334
      }],
      rating: 4
    }

    ctrl.addRating(user);

    expect(ctrl.review).toEqual({});
    expect(user.rating_list).toEqual([{
        rating: 5,
        source_user_id: 345234
      }, {
        rating: 3,
        source_user_id: 334
      }, {
        rating: 1,
        source_user_id: 345234
      }]);
    expect(user.rating).toEqual(3);
    expect(ctrl.formDisabled).toBeTruthy();
  }));
});

describe('HeaderController', function() {
  beforeEach(module('lessSketchyThanCraigslist'));

  beforeEach(inject(function($controller) {
    ctrl = $controller('HeaderController');
    ctrl.menuIsOpen = false;
  }));

  it('should toggle the menu', function() {
    ctrl.toggleMenu();
    expect(ctrl.menuIsOpen).toBeTruthy();
    ctrl.toggleMenu();
    expect(ctrl.menuIsOpen).toBeFalsy();
  });

  it('should check if a view is active', inject(function($location) {
    spyOn($location, 'path').and.returnValue('/here/there');
    expect(ctrl.isActive('/here/there')).toBeTruthy();
    expect(ctrl.isActive('/there/here')).toBeFalsy();
  }));
});


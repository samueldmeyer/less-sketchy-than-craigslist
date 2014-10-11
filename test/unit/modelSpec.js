describe('testTest', function() {
  it('should run a test', function() {
    expect(true).toBeTruthy();
  });
});

describe('module', function() {
  it('should load', function() {
    module('lessSketchy')
    expect(true).toBeTruthy();
  })
})

describe('Items', function() {

  beforeEach(module('lessSketchyThanCraigslist'));

  it('should set the current Item using ItemsApi', inject(function(Items, ItemsApi) {
    spyOn(ItemsApi, "get").and.returnValue({
      description: "A good couch for you to sit on.",
      title: "A couch",
      selling_app_user_id: 5629499534213129,
      id: "15",
      cost: 400,
      location: "1234 Main Street, Smallville, OK",
      email: "test@example.com"
    });
    
    Items.setCurrent(15);
    expect(Items.currentItem.description).toBe("A good couch for you to sit on.");
    expect(Items.currentItem.title).toBe("A couch");
    expect(Items.currentItem.selling_app_user_id).toBe(5629499534213129);
    expect(Items.currentItem.id).toBe("15");
    expect(Items.currentItem.cost).toBe(400);
    expect(Items.currentItem.location).toBe("1234 Main Street, Smallville, OK");
    expect(Items.currentItem.email).toBe("test@example.com");
  }));

  it('should add a saved item to the list', inject(function(Items, ItemsApi) {
    spyOn(ItemsApi, "createInstance").and.returnValue({
      $save: function(action) {
        action({
          description: "All your base.",
          title: "The Base",
          selling_app_user_id: 5629499534213121,
          id: "16",
          cost: 10000,
          location: "Everywhere",
          email: "test2@example.com"
        });
      }
    });
    var foo = {
      functionToCall: function() {}
    };
    spyOn(foo, 'functionToCall');

    Items.addItem({id:"16"}, foo.functionToCall);
    expect(Items.all.length).toBe(1);
    expect(foo.functionToCall).toHaveBeenCalled();

  }));


});

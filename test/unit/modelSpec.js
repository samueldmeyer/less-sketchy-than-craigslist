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
    spyOn(ItemsApi, "save").and.callFake(function(input, success) {
      input.id = "16"
      success(input);
    });

    var foo = {
      functionToCall: function() {}
    };
    spyOn(foo, 'functionToCall');

    Items.all = [{id: 2}]

    var newItem = {
      description: "All your base.",
      title: "The Base",
      selling_app_user_id: 5629499534213121,
      cost: 10000,
      location: "Everywhere",
      email: "test2@example.com"
    }

    Items.addItem(newItem, foo.functionToCall);
    expect(Items.all.length).toBe(2);
    expect(Items.fullItems.length).toBe(1);
    expect(Items.all[1].title).toBe("The Base");
    expect(Items.all[1].id).toBe("16");
    expect(foo.functionToCall).toHaveBeenCalled();

  }));


});

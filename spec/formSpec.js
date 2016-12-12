describe("form initialization", function() {
  beforeEach(function () {
    jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';
    loadFixtures('form.html');
    var date = new Date(2015, 2, 1);
    form.init($j("form")[0], date);
  });

  it("sets the month of the given date", function() {
    expect($j("form .raise_month option[value=3]")).toBeSelected();
  });

  it("sets the year of the given date", function() {
    expect($j("form .raise_year option[value=2015]")).toBeSelected();
  });
});

describe("get user inputs", function() {
  beforeEach(function () {
    jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';
    loadFixtures('form.html');
    this.inputs = form.userInputs($j("form")[0]);
  });

  it("returns the user current salary", function() {
    expect(this.inputs.salary).toEqual(2000);
  });

  it("returns the user last raise month", function() {
    expect(this.inputs.lastRaiseMonth).toEqual(4);
  });

  it("returns the user last raise year", function() {
    expect(this.inputs.lastRaiseYear).toEqual(2008);
  });
});

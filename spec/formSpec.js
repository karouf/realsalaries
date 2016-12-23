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

  it("returns the country the user lives in", function() {
    expect(this.inputs.country).toEqual("CAN");
  });
});

describe("update", function() {
  beforeEach(function () {
    jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';
    loadFixtures('form.html');
  });

  it("sets inner text of the given element to the gain/loss to inflation", function() {
    var baseTime = new Date(2015, 2, 1);
    jasmine.clock().mockDate(baseTime);
    $j("form .salary").val("100");
    $j("form .raise_month").val("1");
    $j("form .raise_year").val("2015");
    $j("form .country").val("CAN");

    var theForm = document.getElementsByTagName("form")[0];
    var element = document.getElementsByClassName("inflation-impact")[0];
    form.update(theForm, element);

    expect($j(".inflation-impact").text()).toEqual("-1.43");
  });
});

describe(".inflation behavior", function() {
  it("updates result on salary change", function() {
    spyOn(form, "update");

    $j(".inflation").trigger("change");

    expect(form.update).toHaveBeenCalled();
  });
});

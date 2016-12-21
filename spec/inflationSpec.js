describe("loss or gain to inflation", function() {
  it("inflation steady at 100% for 1 month", function() {
    monthlyInflation = [100];
    salary = 100;

    result = inflation.impact(salary, monthlyInflation);

    expect(result).toEqual(-50);
  });

  it("inflation steady at -50% for 1 month", function() {
    monthlyInflation = [-50];
    salary = 100;

    result = inflation.impact(salary, monthlyInflation);

    expect(result).toEqual(100);
  });

  it("inflation steady at 1% for 3 months", function() {
    monthlyInflation = [1, 1, 1];
    salary = 100;

    result = inflation.impact(salary, monthlyInflation);

    expect(result).toEqual(-2.94);
  });

  it("inflation steady at -1% for 3 months", function() {
    monthlyInflation = [-1, -1, -1];
    salary = 100;

    result = inflation.impact(salary, monthlyInflation);

    expect(result).toEqual(3.06);
  });

  it("inflation steady at -1% for 3 months then 1% for 3 months", function() {
    monthlyInflation = [-1, -1, -1, 1, 1, 1];
    salary = 100;

    result = inflation.impact(salary, monthlyInflation);

    expect(result).toEqual(0.03);
  });

  it("inflation steady at 1% for 3 months then -1% for 3 months", function() {
    monthlyInflation = [1, 1, 1, -1, -1, -1];
    salary = 100;

    result = inflation.impact(salary, monthlyInflation);

    expect(result).toEqual(0.03);
  });

  it("inflation grows 1 point every month for 6 months", function() {
    monthlyInflation = [1, 2, 3, 4, 5, 6];
    salary = 100;

    result = inflation.impact(salary, monthlyInflation);

    expect(result).toEqual(-18.58);
  });

  it("inflation shrinks 1 point every month for 6 months", function() {
    monthlyInflation = [-1, -2, -3, -4, -5, -6];
    salary = 100;

    result = inflation.impact(salary, monthlyInflation);

    expect(result).toEqual(23.95);
  });

  it("real life example", function() {
    monthlyInflation = [1.742614,-1.386395,2.242823,2.03575,2.201071,2.158202];
    salary = 100;

    result = inflation.impact(salary, monthlyInflation);

    expect(result).toEqual(-8.49);
  });
});

describe("data", function() {
  it("returns inflation data for the given country and period", function() {
    var startPeriod = new Date(2015, 0, 1);
    var endPeriod = new Date(2015, 2, 1);
    var result = inflation.data("CAN", startPeriod, endPeriod);

    expect(result).toEqual([0.9748172, 1.047542, 1.201923]);
  });
});

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
});

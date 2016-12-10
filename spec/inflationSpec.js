describe("loss or gain to inflation", function() {
  it("inflation steady at 100% for 1 month", function() {
    monthlyInflation = [100];
    salary = 100;

    result = inflation.impact(salary, monthlyInflation);

    expect(result).toEqual(-50);
  });
});

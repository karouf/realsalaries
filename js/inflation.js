var inflation = {
  impact: function(salary, inflation) {
    var totalInflation = inflation.reduce(function(acc, monthly) {
      return acc * ((monthly / 100) + 1);
    }, 1);
    var idealSalary = salary * totalInflation;
    var realSalary = salary * (salary / idealSalary);
    var evolution = realSalary - salary;

    return Math.round(evolution * 100) / 100;
  }
};

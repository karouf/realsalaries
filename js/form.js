var form = {
  init: function(form, date) {
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var monthInput = form.getElementsByClassName("raise_month")[0];
    var yearInput = form.getElementsByClassName("raise_year")[0];
    var resultElement = document.getElementsByClassName("inflation-impact")[0];
    var thisObject = this;

    monthInput.value = month;
    yearInput.value = year;

    form.addEventListener("change", function() {
      thisObject.update(form, resultElement);
    });
  },
  userInputs: function(form) {
    var salary = form.getElementsByClassName("salary")[0];
    var lastRaiseMonth = form.getElementsByClassName("raise_month")[0];
    var lastRaiseYear = form.getElementsByClassName("raise_year")[0];
    var country = form.getElementsByClassName("country")[0];

    return {
      salary: parseInt(salary.value),
      lastRaiseMonth: parseInt(lastRaiseMonth.value),
      lastRaiseYear: parseInt(lastRaiseYear.value),
      country: country.value
    };
  },
  update: function(form, element) {
    var now = new Date();
    var inputs = this.userInputs(form);
    var raiseDate = new Date(inputs.lastRaiseYear, inputs.lastRaiseMonth - 1, 1);
    var inflationData = inflation.data(inputs.country, raiseDate, now);

    impact = inflation.impact(inputs.salary, inflationData);
    element.textContent = impact;
  }
}

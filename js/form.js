var form = {
  init: function(form, date) {
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var monthInput = form.getElementsByClassName("raise_month")[0];
    var yearInput = form.getElementsByClassName("raise_year")[0];

    monthInput.value = month;
    yearInput.value = year;
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
  }
}

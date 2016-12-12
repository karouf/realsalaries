var form = {
  init: function(form, date) {
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var monthInput = form.getElementsByClassName("raise_month")[0];
    var yearInput = form.getElementsByClassName("raise_year")[0];

    monthInput.value = month;
    yearInput.value = year;
  }
}

Number.prototype.pad = function(size) {
      var s = String(this);
      while (s.length < (size || 2)) {s = "0" + s;}
      return s;
    }

var inflation = {
  impact: function(salary, inflation) {
    var totalInflation = inflation.reduce(function(acc, monthly) {
      return acc * ((monthly / 100) + 1);
    }, 1);
    var idealSalary = salary * totalInflation;
    var realSalary = salary * (salary / idealSalary);
    var evolution = realSalary - salary;

    return Math.round(evolution * 100) / 100;
  },
  data: function(country, startPeriod, endPeriod) {
    startPeriod.setDate(startPeriod.getDate() - 28);
    var xmlHttp = new XMLHttpRequest();
    var indexes = new Array();
    var rates = new Array();
    var result, observations, values;
    var url = "https://stats.oecd.org/sdmx-json/data/DP_LIVE/";
    url += country;
    url += ".CPI.TOT.IDX2010.M/OECD?contentType=json&startPeriod=";
    url += startPeriod.getFullYear() + "-" + (startPeriod.getMonth() + 1).pad();
    url += "&endPeriod=";
    url += endPeriod.getFullYear() + "-" + (endPeriod.getMonth() + 1).pad();

    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    result = JSON.parse(xmlHttp.responseText);

    observations = result.dataSets[0].series["0:0:0:0:0"].observations;

    for (var key in observations) {
      if (Object.prototype.hasOwnProperty.call(observations, key)) {
        indexes.push(observations[key][0]);
      }
    }

    for (var i = 1; i < indexes.length; i++) {
      var rate = ((indexes[i] / indexes[i - 1]) - 1) * 100;
      rates.push(parseFloat(rate.toFixed(3)));
    }

    return rates;
  }
};

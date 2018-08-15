'use strict'
const request = require('./request.js')

let parseOrigins = function ($) {
  let output = {}
  $('option').each(function (i, option) {
    if ($(this).attr('value') !== '') {
      output[$(this).attr('value').substring(0, $(this).attr('value').indexOf('.'))] = $(this).text();
    }
  })
  return output
}
let parseYears = function ($) {
  let output = []
  $('select').each(function (i, select) {
    if ($(this).attr('name') === 'ay') {
      $(this).children().each(function (j, option) {
        output.push($(this).text())
      })
    }
  })
  return output
}
let parseDestinations = function ($) {
  let output = {}
  $('select').each(function (i, select) {
    if ($(this).attr('name') === 'oia') {
      $(this).children().each(function (j, option) {
        if ($(this).attr('value')) {
          output[$(this).attr('value').match('oia=(.*)&')[1]] = $(this).text().substring(21).trim();
        }
      });
    }
  })
  return output;
}
let parseMajors = function ($) {
  let output = {}
  $('select').each(function (i, select) {
    if ($(this).attr('name') === 'dora') {
      $(this).children().each(function (j, option) {
        if ($(this).attr('value') && $(this).attr('value') !== '-1') {
          output[$(this).attr('value')] = $(this).text().trim();
        }
      });
    }
  });
  return output;
}
let getOrigins = function (callback) {
  let url = 'http://www.assist.org/web-assist/welcome.html'
  request(url, function ($) {
    callback({ origins: parseOrigins($) });
  });
}
let getDestinationsAndYears = function (origin, callback) {
  let url = 'http://www.assist.org/web-assist/' + origin + '.html'
  request(url, function ($) {
    callback({
      destinations: parseDestinations($),
      years: parseYears($)
    });
  });
}
let getMajors = function (origin, destination, year, callback) {
  let url = 'http://web2.assist.org/web-assist/articulationAgreement.do?inst1=none&inst2=none' + '&ia=' + origin + '&ay=' + year + '&oia=' + destination + '&dir=1';
  request(url, function ($) { callback({ majors: parseMajors($) }) });
}
let getAgreement = function (origin, destination, year, major, callback) {
  let url = 'http://web2.assist.org/cgi-bin/REPORT_2/Rep2.pl?' +
    'aay=' + year +
    '&dora=' + major +
    '&oia=' + destination +
    '&ay=' + year +
    '&event=19' +
    '&ria=' + destination +
    '&agreement=aa' +
    '&sia=' + origin +
    '&ia=' + origin +
    '&dir=1&&sidebar=false&rinst=left&mver=2&kind=5&dt=2';
  request(url, function ($) { callback({ agreement: $('body').text() }) });
}

let parseOriginName = function ($) {
  let output;
  $('#ia').children().each(function (i, option) {
    if ($(this).attr('selected') !== undefined && $(this).text() !== '') {
      output = $(this).html().trim();
    }
  });
  return output;
}
let parseDestinationName = function ($) {
  let output;
  $('#oia').children().each(function (i, option) {
    if ($(this).attr('selected') !== undefined && $(this).text() !== '') {
      output = $(this).text().substring(21).trim();
    }
  });
  return output;
}
let resolveOriginName = function (origin, callback) {
  let url = 'http://www.assist.org/web-assist/' + origin + '.html';
  request(url, function ($) {
    callback({ origin: { name: parseOriginName($) } });
  });
}
let resolveDestinationAndOriginName = function (origin, destination, year, callback) {
  let url = 'http://web2.assist.org/web-assist/articulationAgreement.do?inst1=none&inst2=none' + '&ia=' + origin + '&ay=' + year + '&oia=' + destination + '&dir=1';
  request(url, function ($) {
    callback({ destination: { name: parseDestinationName($) } });
  });
}

module.exports = {
  getOrigins,
  getDestinationsAndYears,
  getMajors,
  getAgreement,
  resolveOriginName,
  resolveDestinationAndOriginName,
}

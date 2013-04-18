var recaptchaErrorMessage = function(textCode) {
  console.log('received text code: ' + textCode);
  if (textCode === 'invalid-site-private-key') {
    return "We weren't able to verify the private key.";
  } else if (textCode === 'invalid-request-cookie') {
    return 'The challenge parameter of the verify script was incorrect.';
  } else if (textCode === 'incorrect-captcha-sol') {
    return 'The CAPTCHA solution was incorrect.'
  } else if (textCode === 'captcha-timeout') {
    return 'The solution was received after the CAPTCHA timed out.';
  }
  return textCode;
};

Parse.Cloud.beforeSave("Captcha", function(request, response) {
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'http://www.google.com/recaptcha/api/verify',
    params: {
      privatekey: '6LcNpt8SAAAAAC15LTAPRznY5rmUBzmCpmjEMgAa',
      remoteip: request.object.get('ip'),
      challenge: request.object.get('challenge'),
      response: request.object.get('response')
    },
    success: function(httpResponse) {
      var lines = httpResponse.text.split("\n");
      if (lines.length > 0 && lines[0] == "true") {
        response.success();
        return;
      }
      response.error(recaptchaErrorMessage(lines[1]));
    }, error: function(httpResponse) {
      response.error(httpResponse.text);
    }
  });
});

Parse.Cloud.define("Export", function(request, response) {
  var query = new Parse.Query("Captcha");
  query.equalTo("identifier", request.params.identifier);
  query.equalTo("sessionNum", request.params.sessionNum);
  query.find().then(function(results) {
    var row = ['sessionNum', 'identifier', 'number of captchas'];
    var csv = [ row.join(',') ];
    if (results.length > 0) {
      var row = [];
      row.push(results[0].get('sessionNum'));
      row.push(results[0].get('identifier'));
      row.push(results.length);
      csv.push(row.join(','));
    } else {
      csv.push("No data yet");
    }
    response.success(csv.join("\n"));
  }, function(error) {
    response.error(error);
  });
});


// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.beforeSave("Captcha", function(request, response) {
  console.log(request);
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'http://www.google.com/recaptcha/api/verify',
    params: {
      privatekey: '6LcNpt8SAAAAAC15LTAPRznY5rmUBzmCpmjEMgAa',
      remoteip: '24.130.138.138',
      challenge: request.object.get('challenge'),
      response: request.object.get('response')
    },
    success: function(httpResponse) {
      console.log("success callback");
      console.log(httpResponse.text);
      var lines = httpResponse.text.split("\n");
      if (lines.length > 0 && lines[0] == "true") {
        response.success();
        return;
      }
      response.error(lines[1]);
    }, error: function(httpResponse) {
      console.log("failure callback");
      console.log(httpResponse);
      response.error(httpResponse.text);
    }
  });
});

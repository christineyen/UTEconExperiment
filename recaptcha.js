window.UT = {};
UT = function() {
  Parse.initialize("4mgZKN5Hnb8S6xNvEfSDRC062ka8qZIygSjDgpuI", "nXUyDw8w7wpS7Sx11UTYi4e4L5OCsm3Y3D3VvHov");

  var attempt = 0;

  var setupRecaptcha = function() {
    $('#num_recaptchas').text('Correctly solved: ' + attempt);
    Recaptcha.create("6LcNpt8SAAAAAMf7duWh1n6EJToKcEEAA39sfcPU",
      "recaptcha_div",
      { callback: Recaptcha.focus_response_field }
    );
  };

  var submitSuccess = function(object) {
    Recaptcha.destroy();
    attempt++;
    setupRecaptcha();
  };

  var submitError = function(error) {
    console.log('error! ' + error);
  };

  $('input#submitButton').click(function() {
    var Captcha = Parse.Object.extend("Captcha");
    var captcha = new Captcha();
    captcha.save({
        attempt: attempt,
        challenge: Recaptcha.get_challenge(),
        response: Recaptcha.get_response()
      }, {
        success: submitSuccess,
        error: submitError
      });
    return false;
  });

  // could later wrap this in an init() if we have other things we want to do
  // after initialization
  setupRecaptcha();

  return {
    attempt: attempt,
  }
}();


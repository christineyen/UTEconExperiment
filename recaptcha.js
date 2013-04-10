// Customizing the look and feel:
// https://developers.google.com/recaptcha/docs/customization

window.UT = {};
UT = function() {
  Parse.initialize("4mgZKN5Hnb8S6xNvEfSDRC062ka8qZIygSjDgpuI", "nXUyDw8w7wpS7Sx11UTYi4e4L5OCsm3Y3D3VvHov");

  var self = this;
  var identifier = '';
  var IP = '';
  var attempt = 0;

  var setupRecaptcha = function() {
    $('#num_recaptchas').text('Correctly solved: ' + attempt);
    Recaptcha.create("6LcNpt8SAAAAAMf7duWh1n6EJToKcEEAA39sfcPU",
      "recaptcha_div",
      { callback: Recaptcha.focus_response_field }
    );
  };

  var setIP = function(ip) {
    IP = ip;
    $('#submitComputer').show();
    $('#ipDone').text(IP).show();
    $('#ipLoading').hide();
  };

  var init = function() {
    // Get IP address
    $.get('http://api.hostip.info/get_html.php', function(data) {
      var info = data.split('\n');
      $.each(info, function(idx, line) {
        var components = line.split(':');
        if (components[0] === 'IP') {
          setIP(components[1].trim());
        }
      });
    }).fail(function() {
      setIP('4.6.051.02');
    });
  };

  // When a user clicks the "Set Computer" button, store that information and
  // begin the reCAPTCHA process.

  $('input#submitComputer').click(function() {
    identifier = $('input#computerInput').attr('value');
    if (identifier.length > 0) {
      $('#computerSetup').hide();
      $('#computerInfo').children('h1').text("Using Computer: " + identifier);
      $('#computerInfo').show();
      $('#content').show();
      setupRecaptcha();
    }
  });

  var submitSuccess = function(object) {
    Recaptcha.destroy();
    attempt++;
    setupRecaptcha();
  };

  var submitError = function(object, error) {
    // console.log(error.message);
    Recaptcha.destroy();
  };

  $('input#submitButton').click(function() {
    var Captcha = Parse.Object.extend("Captcha");
    var captcha = new Captcha();
    captcha.save({
        identifier: identifier,
        ip: IP,
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

  init();

  return {
    identifier: identifier,
    IP: IP,
    attempt: attempt,
  }
}();


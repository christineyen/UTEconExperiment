// Customizing the look and feel:
// https://developers.google.com/recaptcha/docs/customization

window.UT = {};

UT = function() {
  Parse.initialize("4mgZKN5Hnb8S6xNvEfSDRC062ka8qZIygSjDgpuI", "nXUyDw8w7wpS7Sx11UTYi4e4L5OCsm3Y3D3VvHov");

  var generateUuid = function() {
    var result = '';
    for(var i=0; i<32; i++) {
      result += Math.floor(Math.random()*16).toString(16).toUpperCase();
    }
    return result
  };

  var uuid = generateUuid();
  var identifier = '';
  var IP = '';
  var successCount = 0;

  var setupRecaptcha = function() {
    $('#results_recaptchas').text(successCount);
    $('#results_tokens').text(Math.floor(successCount/5));
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

  var submitComputerInfo = function() {
    identifier = $('input#computerInput').attr('value');
    if (identifier.length > 0) {
      $('#computerSetup').hide();
      $('#computerInfo').children('h1').text("Using Computer: " + identifier);
      $('#computerInfo').show();
      $('#content').show();
      setupRecaptcha();
    }
  };

  var submitCaptcha = function() {
    var Captcha = Parse.Object.extend("Captcha");
    var captcha = new Captcha();
    var spinner = $('#submitButton').next();
    spinner.show();
    captcha.save({
        uuid: uuid,
        identifier: identifier,
        ip: IP,
        challenge: Recaptcha.get_challenge(),
        response: Recaptcha.get_response()
      }, {
      success: function(object) {
        spinner.hide();
        Recaptcha.destroy();
        successCount++;
        setupRecaptcha();
      },
      error: function(object, error) {
        spinner.hide();
        $('#flash_error').text(error.message).fadeIn().delay(3000).fadeOut();
        Recaptcha.destroy();
        setupRecaptcha();
      },
    });
    return false;
  };

  // Kick off IP resolving + revealing of necessary components
  init();

  // No public members
  return {
    submitComputerInfo: submitComputerInfo,
    submitCaptcha: submitCaptcha,
  }
}();


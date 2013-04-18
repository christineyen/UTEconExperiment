// Customizing the look and feel:
// https://developers.google.com/recaptcha/docs/customization

window.UT = {};

UT = function() {
  Parse.initialize("4mgZKN5Hnb8S6xNvEfSDRC062ka8qZIygSjDgpuI",
                   "nXUyDw8w7wpS7Sx11UTYi4e4L5OCsm3Y3D3VvHov");

  var generateUuid = function() {
    var result = '';
    for(var i=0; i<32; i++) {
      result += Math.floor(Math.random()*16).toString(16).toUpperCase();
    }
    return result
  };

  // We generate a Universally Unique ID to mark a single "session" filling out
  // captchas. Each time you manually refresh the page, this value gets reset.
  var uuid = generateUuid();

  // Identifier = the name of the computer station they're working at.
  var identifier = '';

  // Session Number = the number of the session
  var sessionNum = 0;

  // We pass this to reCAPTCHA because they want to prevent bots from spamming
  // their service.
  var IP = '';

  // Tracks the number of times the user has successfully solved a captcha.
  // Displayed on the page.
  var successCount = 0;

  var refreshCountDisplay = function() {
    $('#results_recaptchas').text(successCount);
    $('#results_tokens').text(Math.floor(successCount/5));
  };

  // Resets the captcha in between successful or failed solvings of the captcha.
  var setupRecaptcha = function() {
    refreshCountDisplay();
    Recaptcha.create("6LcNpt8SAAAAAMf7duWh1n6EJToKcEEAA39sfcPU",
      "recaptcha_div",
      { callback: Recaptcha.focus_response_field }
    );
  };

  // Set up the Javascript gating on the page. On success, exposes the computer
  // information form.
  var init = function() {
    var setIP = function(ip) {
      IP = ip;
      $('#submitComputer').show();
      $('#ipDone').text(IP).show();
      $('#ipLoading').hide();
    };

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
      // Randomly generate an IP address so we can move on
      var fakeIP = [];
      for (var i = 0; i < 4; i++) {
        fakeIp.push(Math.floor(Math.random() * 256))
      }
      setIP(fakeIp.join('.'));
    });
  };

  // Move past the "Computer Information" gate. Store the name of the computer
  // we're working at and move on to the reCAPTCHA process.
  var submitComputerInfo = function() {
    identifier = $('input#computerInput').attr('value');
    var sessionInput = $('input#sessionInput').attr('value');
    sessionNum = $.isNumeric(sessionInput) ? parseInt(sessionInput) : 0;
    if (identifier.length > 0) {
      $('#computerSetup').hide();
      $('#computerInfo').children('h1').text("Using Computer: " + identifier);
      $('#computerInfo').show();
      $('#content').show();
      setupRecaptcha();

      // JUST IN CASE the user has already done some in this session/computer,
      // we should display the correct # of captchas done.
      var query = new Parse.Query("Captcha");
      query.equalTo("identifier", identifier);
      query.equalTo("sessionNum", sessionNum);
      query.count().then(function(count) {
        successCount = count;
        refreshCountDisplay();
      }); // ignore on error
    }
  };

  // Actually submit the captcha to the server. On return, reset the captcha
  // (either incrementing our "success" counter on success or displaying an
  // error message on error).
  var submitCaptcha = function() {
    var Captcha = Parse.Object.extend("Captcha");
    var captcha = new Captcha();
    var spinner = $('#submitButton').next();
    spinner.show();
    captcha.save({
        uuid: uuid,
        identifier: identifier,
        sessionNum: sessionNum,
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

  // Call Cloud Code function to export this session's data
  var exportData = function() {
    var params = {
      identifier: identifier,
      sessionNum: sessionNum
    };
    if (window.admin) {
      params = {};
    }
    Parse.Cloud.run('Export', params, {
      success: function(csv) {
        var uriContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        window.location = uriContent;
      }, error: function(error) {
        $('#flash_error').text(error.message).fadeIn().delay(3000).fadeOut();
      }
    });
    return false;
  };

  // HERE WE GO!
  // Kick off IP resolving + revealing of necessary components
  init();

  return {
    submitComputerInfo: submitComputerInfo,
    submitCaptcha: submitCaptcha,
    exportData: exportData,
  };
}();


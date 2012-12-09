var flite = require('flite')

var message = "you know what we need? some more waffles!"

flite(function (err, speech) {
  speech.say(message, function (err) {
    if (err) console.error('I\'m afraid I can\'t do that, Dave', err);
  });
});

function triggerMouseEvent(node, eventType) {
  var clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}
var interval = setInterval(function () {
  if (document.querySelector(".view-go")) {
    triggerMouseEvent(document.querySelector(".view-go"), "mousedown")
  }
  if (document.querySelector(".view-result")) {
    triggerMouseEvent(document.querySelector(".view-result"), "mousedown");
  }
}, 20);


setInterval(function () {
  let getNumber = setInterval(function () {
    try {
      let toGuess = document.getElementsByClassName('big-number')[0].innerHTML;
      if (toGuess) {
        console.log(toGuess);
        clearInterval(getNumber);
        try {
          let pasteNumber = setInterval(function () {
            let y = document.getElementsByClassName('ng-pristine')[1];
            if (y) {
              document.getElementsByClassName('ng-pristine')[1].value = toGuess;
              clearInterval(pasteNumber);
            }
          })
        } catch (err) {}
      }
    } catch (err) {}
  }, 100);
}, 100);


setTimeout(function () {

  var keyboardEvent = document.createEvent("KeyboardEvent");
  var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";


  keyboardEvent[initMethod](
    "keydown", // event type : keydown, keyup, keypress
    true, // bubbles
    true, // cancelable
    window, // viewArg: should be window
    false, // ctrlKeyArg
    false, // altKeyArg
    false, // shiftKeyArg
    false, // metaKeyArg
    13, // keyCodeArg : unsigned long the virtual key code, else 0
    13 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
  );
  document.dispatchEvent(keyboardEvent);
  console.log('done');
}, 3000);


setTimeout(function () {
  element.dispatchEvent(new KeyboardEvent('keypress', {
    'key': 'a'
  }));
}, 3000);


document.querySelector('.ng-valid.ng-valid-pattern.ng-dirty.ng-valid-parse.ng-touched').dispatchEvent(new KeyboardEvent('keyup', {
  key: 'Enter'
}));


function win(maxScore) {
  let start = new Date();
  let words = [];
  let x = setInterval(function () {
    try {
      let wordTest = document.querySelector('.word.ng-scope').querySelector('.ng-binding').innerHTML;
      if (words.some((word) => word == wordTest)) { //if seen
        document.getElementsByClassName('actions')[0].getElementsByClassName('button')[0].click();

      } else {
        words.push(wordTest);
        document.getElementsByClassName('actions')[0].getElementsByClassName('button')[1].click();
        console.log(words.length);
      }
    } catch (err) {
      console.error(err);
    }
    if (words.length === maxScore) {
      let time = ((new Date()) - start);
      console.log(time / 1000);
      console.log(words.length / (time * 1.6666666666667E-5), 'answers per minute');
      clearInterval(x);
    }
  }, 1);
}
win(69);

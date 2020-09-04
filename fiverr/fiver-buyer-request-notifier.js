// ==UserScript==
// @name         Fiver Notifier
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.fiverr.com/users/*/requests*
// @grant        none
// ==/UserScript==

// MDN way of doing notifications
function notifyMe(msg,interval) {
  // Let's check if the browser supports notifications
  var notification = undefined;
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    notification = new Notification(msg);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        notification = new Notification(msg);
      }
    });
  }
  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them any more.
   notification.onclick = function(event) {
        event.preventDefault(); // prevent the browser from focusing the Notification's tab
        // clear interval for now
        // TODO: open the same page or focus to the tab
        clearInterval(interval);
   }
}

(function() {
    'use strict';

    var minuet = (1000 * 60);
    var span = (minuet * 5);
    var int = setInterval(function(){
        var trs = $('table').children("tbody").children("tr");
        var requestLength = trs.length;
        // check if the only tr in the table is with no requests found text if it's the case then set Request lenght to 0
        if(requestLength===1){
            // get text from the span of 1st tr element that we found possibly having only one td element
            var notFound = ($(trs).children('td').children('span').text() === 'No requests found.')? true:false;
            // no requests are found set request length to 0
            requestLength = notFound===true? 0 : requestLength;
        }

        // if 1 or more buyer requests are found notify otherwise clear interval and reload.
        if(requestLength > 0){
            notifyMe(`Buyer Requests Available : ${requestLength}`, int);
        } else {
            clearInterval(int);
            window.location.reload();
        }
},span);

})();

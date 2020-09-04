// ==UserScript==
// @name         Fiver Notifier
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.fiverr.com/users/*/requests*
// @grant        none
// ==/UserScript==





class NotifierSettings {
    constructor(minutes = 5, notify = true) {
        this._minutes = minutes;
        this._notify = notify;
    }
}

class Notifier {
    constructor(settings = undefined) {
        this._minutes = (settings === undefined) ? 5 : settings._minutes;
        this._showDesktopNotification = (settings === undefined) ? true : settings._notify;
        this._interval = undefined;
        this._isRunning = true;
    }

    // Methods
    // MDN way of doing notifications
    getNotification(msg){
        return new Notification('Fiver Notifier',{
            body: msg,
            icon: 'https://cdn.discordapp.com/attachments/720994921435234304/724286369488175195/pv_icon.ico',
        });
    }
    notify(msg, interval) {
        // Let's check if the browser supports notifications
        var notification = undefined;
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            notification = this.getNotification(msg);
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    notification = this.getNotification(msg); //new Notification(msg);
                }
            });
        }

        console.log(`actions ${notification.actions}`);
        // At last, if the user has denied notifications, and you
        // want to be respectful there is no need to bother them any more.
        // TODO: not clear what to do here so fuck it for now.
        // notification.onclick = function (event) {
        //     event.preventDefault(); // prevent the browser from focusing the Notification's tab
        //     // clear interval for now
        //     // TODO: open the same page or focus to the tab
        //     clearInterval(interval);
        //     this._isRunning = false;
        // }
    }

    start() {
        var minuet = (1000 * 60);
        var span = (minuet * this._minutes);

        this._interval = setInterval(function () {
            var trs = $('table').children("tbody").children("tr");
            var requestLength = trs.length;
            // check if the only tr in the table is with no requests found text if it's the case then set Request lenght to 0
            if (requestLength === 1) {
                // get text from the span of 1st tr element that we found possibly having only one td element
                var notFound = ($(trs).children('td').children('span').text() === 'No requests found.' && $(trs).children('td').length == 1) ? true : false;
                // no requests are found set request length to 0
                requestLength = notFound === true ? 0 : requestLength;
            }
            // if 1 or more buyer requests are found notify otherwise clear interval and reload.
            if (requestLength > 0 && this._showDesktopNotification===true) {
                    this.notify(`Buyer Requests Available : ${requestLength}`, this._interval);
            } else {
                clearInterval(this._interval);
                window.location.reload();
            }
            console.log('running...');
        }.bind(this), span);
    }

    get runningStatus() { return this._isRunning; }
    set runningStatus(newStatus) { this._isRunning = newStatus }

    get interval() { return this._interval; }
    get minutes() { return this._minutes; }
}

class StorageHelper {
    _NOTIFIER_SETTINGS = 'notifier_settings';
    constructor() {
        this._localStorage = undefined;
        if (typeof (Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            this._localStorage = localStorage;
        } else {
            // Sorry! No Web Storage support..
            alert('Sorry! No Web Storage support');
        }
    }

    setSettings(settings) {
        this._localStorage.setItem(this._NOTIFIER_SETTINGS, JSON.stringify(settings))
    }

    getSettings() {
        return JSON.parse(this._localStorage.getItem(this._NOTIFIER_SETTINGS));
    }

    removeSettings() { this._localStorage.removeItem(this._NOTIFIER_SETTINGS) }
}

class NotiWidget {
    constructor() {
        this._notifier;
        this._storage = new StorageHelper();
    }

    static wrapper(content) {
        return `<div class="notifier-settings-wrapper" style="position: fixed;top: auto;bottom: 100px;right: 38px;background: rgb(218, 218, 218);padding: 15px;z-index: 10001;border-radius: 5px 5px 13px;display: none;min-height: 40px;">${content}</div>`
    }
    static getTemplate() {
        var c = ``;
        c += `<button class="notifier-widget-close-js" style="float: right;background: red;border: 1px solid red;padding: 0px 5px 5px 8px;color: white;position: absolute;right: 0;top: 0;border-radius: 0px 0px 0px 18px;">&#10006;</button>`
        c += ``;
        c += `<section class="form-wrapper" style="padding: 12px 5px 0px;">`;
        c += `<input type="number" id="n-minutes" class="false" placeholder="Minutes" maxlength="150">`;
        c += `<div class="item-cell" style="margin: 10px 0px 0px 0px;">
        <span class="">
            <label class="fake-check-black" for="n-notify">
                <input name="n-notify" type="hidden" value="">
                <input class="js-extra-checkbox" id="n-notify" name="n-notify" type="checkbox" value="">
                <span class="chk-img"></span>
            </label>
        </span>
        <span class="title">Notify On Desktop</span>
    </div>`
        c += `<div class="btns-container">
                    <input type="button" class="btn-standard btn-green-grad save-settings-js" value="Save">
                </div>`;
        c += `</section>`;
        c += `<div>
                <ul class="rf m-t-10">
                    <li class="toggle-wrapper toggle-custom-orders">
                        <label class="js-btn-toggle-notifier-status" >
                            <span class ="status-js">Run Status</span>
                            <input type="checkbox" name="toggle-notifier-status" id="db-toggle-notifier-status">
                            <span class="fake-toggle"></span>
                        </label>
                    </li>
                </ul>
            </div>`;
        return this.wrapper(c);
    }

    updateRunningStatus() {
        $('.status-js').text(`${this._notifier.runningStatus === true ? 'Running' : 'Stoped'}`);
        $('.status-js').css({ 'color': `${this._notifier.runningStatus === true ? '#1dbf73' : '#cf1e1e'}` });
        $('#notifier-js').css({ 'background': `${this._notifier.runningStatus === true ? '#1dbf73' : '#cf1e1e'}` });
        $('#db-toggle-notifier-status').attr('checked', this._notifier.runningStatus);
        console.log(`Updating Status...`)
    }

    renderWidget() {
        $('body').append(NotiWidget.getTemplate());
        $('body').append(`<div id="notifier-js" style="bottom: 100px !important;box-sizing: border-box;cursor: move;font-size: 25px;position: fixed;text-align: center;fill: currentcolor;vertical-align: sub;left: auto;right: 38px;z-index: 10000;background: rgb(255, 255, 255);padding: 3px;border-radius: 33px 12px 12px 33px;height: 66px;min-width: 81px;max-width: 81px;box-shadow: rgba(22, 45, 61, 0.36) 0px 0px 14px 0px;transform: translate(0px, 0px);bottom: 16px;display: block;"><span tabindex="0" role="button" aria-label="Help Center Widget" aria-haspopup="dialog" aria-expanded="false" id="launcher-icon" style="box-sizing: border-box;cursor: pointer;font-size: 25px;position: absolute;text-align: center;transition: all 0.2s ease-out 0s;fill: rgb(255, 255, 255);color: rgb(255, 255, 255);vertical-align: sub;height: 60px;min-width: 60px;max-width: 60px;left: 3px;top: 3px;background-color: rgb(20 62 78);border-radius: 30px;outline: none;"><span id="open-launcher-icon" style="transition: transform 0.2s ease 0s; position: absolute; top: 0px; left: 0px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 929.2 815.3" width="30" height="30" fill="currentColor"><defs><style>.cls-1{fill:#41de78;}.cls-2{fill:#29bfff;}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M0,.1,65.2,120.6H719.4l-37.9,67.7H461.9L388.7,320.5l69.8,118.1,72-128.6h222L929.2,0Z"></path><path class="cls-2" d="M103.2,194.8H245.8L462,569.3,576.2,371.8H715.7L462.2,815.3Z"></path></g></g></svg><span style="position: absolute; height: 20px; min-width: 20px; background-color: rgb(56, 158, 236); border-radius: 12px; font-size: 12px; font-weight: bold; font-family: sans-serif; line-height: 20px; border: 2px solid white; top: -4px; left: -4px; box-sizing: border-box; display: none;"></span></span><span id="close-launcher-icon" style="transition: transform 0.2s ease 0s; position: absolute; top: 0px; left: 0px; width: 60px; height: 60px; transform: rotateZ(-45deg); opacity: 0; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path fill="#FFF" fill-rule="evenodd" d="M15.465.53l.007.008a1.834 1.834 0 01-.007 2.589l-4.952 4.941 4.786 4.826a1.827 1.827 0 01-.005 2.576 1.804 1.804 0 01-2.56-.007l-4.78-4.841-4.85 4.841a1.826 1.826 0 01-2.567.013 1.786 1.786 0 01-.028-2.525l.012-.013 4.885-4.897L.53 3.103A1.836 1.836 0 01.516.536 1.757 1.757 0 013.027.52l4.927 4.967L12.895.534a1.817 1.817 0 012.57-.003z"></path></svg></span></span><span id="ans-launcher-drag-handle" style="display: flex; justify-content: center; width: 10px; transform: translateY(-50%); fill: rgb(29, 191, 115); position: absolute; font-size: 19px; letter-spacing: -0.6px; right: 4px; top: 50%; cursor: move; user-select: none;"><svg width="2" height="14" xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd"><circle transform="rotate(90 1 1)" cx="1" cy="1" r="1"></circle><circle transform="rotate(90 1 5)" cx="1" cy="5" r="1"></circle><circle transform="rotate(90 1 9)" cx="1" cy="9" r="1"></circle><circle transform="rotate(90 1 13)" cx="1" cy="13" r="1"></circle></g></svg></span></div>`);

        // bind events
        $('.stop-js').click(function (e) {
            e.preventDefault();
            this._notifier.runningStatus = false;
            console.log(`interval {${this._notifier.interval}} stoped`)
            clearInterval(this._notifier.interval);
            this.updateRunningStatus();
        }.bind(this));

        $('.reset-js').click(function (e) {
            e.preventDefault();
            this.init();
            this.updateRunningStatus();
        }.bind(this));


        $('#notifier-js').click(function (e) {
            e.preventDefault();
            $('.notifier-settings-wrapper').css({ 'display': 'block' });
            var settings = this._storage.getSettings();
            $('#n-minutes').val(settings._minutes);
            $('#n-notify').attr('checked', settings._notify);
        }.bind(this));

        $('.js-btn-toggle-notifier-status').change(function (e) {
            e.preventDefault();
            var runningCheckValue = $('#db-toggle-notifier-status').is(':checked');
            // restart the shit
            if (runningCheckValue === true) {
                this.init();
            }
            // stop shit
            else {
                this._notifier.runningStatus = false;
                console.log(`interval {${this._notifier.interval}} stoped`)
                clearInterval(this._notifier.interval);
            }
            this.updateRunningStatus();
        }.bind(this));

        $('.notifier-widget-close-js').click(function (e) {
            e.preventDefault();
            $('.notifier-settings-wrapper').css({ 'display': 'none' });
        });

        // storage settings
        $('.save-settings-js').click(function (e) {
            e.preventDefault();
            var notiSet = new NotifierSettings($('#n-minutes').val(), $('#n-notify').is(':checked'));
            this._storage.removeSettings();
            this._storage.setSettings(notiSet);
            this.init();
        }.bind(this));
    }

    init() {
        if (this._storage.getSettings() === null) {
            this._storage.setSettings(new NotifierSettings())
        }
        var settings = this._storage.getSettings();
        console.log(settings);
        this._notifier = new Notifier(settings);
        this._notifier.start();
        console.log('initializing...')
    }

    run() {
        this.init();
        this.renderWidget();
        console.log('running...')
        this.updateRunningStatus();
        console.log(`Last Reload At :  ${new Date()}`);
    }
}

(function () {
    'use strict';
    var widget = new NotiWidget();
    widget.run();
})();
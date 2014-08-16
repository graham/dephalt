var last = null;
var storage = localStorage;

var defaults = [
    "https://mail.google.com/",
    "https://www.google.com/calendar/",
    "https://www.dropbox.com/photos",
    "https://github.com/graham/dephalt"
];

function get_pins() {
    if (storage.getItem('dephalt_pins') == undefined) {
        set_pins(defaults);
        return defaults;
    } else {
        try {
            return JSON.parse(storage.getItem('dephalt_pins'));
        } catch (err) {
            set_pins(defaults);
            return defaults;
        }
    }
}

function set_pins(s) {
    try {
        storage.setItem('dephalt_pins', JSON.stringify(s));
    } catch (err) {
        storage.setItem('dephalt_pins', JSON.stringify(defaults));
    }
}

function get_current_window_id(cb) {
    chrome.tabs.query({active:true, currentWindow:true}, function(tab) {
        if (tab) {
            cb(tab[0].windowId);
        }
    })
}

var str_trim = function(s) { return s.replace(/^\s+|\s+$/g, "").replace(/^[\n|\r]+|[\n|\r]+$/g, ""); };

chrome.browserAction.onClicked.addListener( function(activeTab) {
    var newURL = chrome.extension.getURL("/config.html");
    chrome.tabs.create({ url: newURL });
});

(function() {
	chrome.commands.onCommand.addListener(function(command) {
        if (command == "cleanup-and-reset") {
            get_current_window_id(function(current_win_id) {
                chrome.tabs.query({windowId:current_win_id}, function(tabs) {
                    var to_open = [];
                    var pins = get_pins();
                    for( var i = 0; i < pins.length; i++ ) {
                        var hit = false;
                        for( var j = 0; j < tabs.length; j++ ) {
                            var tab = tabs[j].url;
                            if (tab.slice(0, pins[i].length) == pins[i] &&
                                tabs[j].pinned == true) {
                                hit = true;
                                chrome.tabs.move(tabs[j].id, {index:i}, function() {});
                            }
                        }
                        if (hit == false) {
                            to_open.push(pins[i]);
                        }
                    }
                    
                    for( var i = 0; i < to_open.length; i++ ) {
                        var url = to_open[i];
                        chrome.tabs.create({ active:false, url: url, pinned:true, windowId:current_win_id });
                    }
                    
                    console.log("Received the command.");
                });
            });
        }
	});
})();


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.type == "save") {
          var pins = request.content.split('\n');
          for( var i = 0; i < pins.length; i++ ) {
              pins[i] = str_trim(pins[i]);
          }
          set_pins(pins);
          sendResponse({response:"done", result:pins});
      } else if (request.type == "get") {
          sendResponse({response:get_pins()});
      }
  });

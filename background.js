var last = null;

var pins = [
    "https://pulled.site44.com/",
    "https://mail.google.com/",
    "https://www.google.com/calendar/",
    "https://app.asana.com/",
    "https://trello.com/",
    "https://dayboard.co/",
    "https://github.com/graham"
];

function get_current_window_id(cb) {
    chrome.tabs.query({active:true, currentWindow:true}, function(tab) {
        if (tab) {
            cb(tab[0].windowId);
        }
    })
}

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

                    for( var i = 0; i < pins.length; i++ ) {
                        var hit = false;
                        
                        for( var j = 0; j < tabs.length; j++ ) {
                            var tab = tabs[j].url;
                            
                            console.log('tab: ' + tabs[j].windowId + ":" + tabs[j].index);
                            
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

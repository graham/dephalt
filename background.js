var last = null;

var pins = [
    "https://pulled.site44.com/",
    "https://mail.google.com/",
    "https://www.google.com/calendar/",
    "https://app.asana.com/",
    "https://trello.com/",
    "https://dayboard.co/home",
    "https://github.com/graham"
];

(function() {
	chrome.commands.onCommand.addListener(function(command) {
        if (command == "cleanup-and-reset") {
            chrome.tabs.query({}, function(tabs) {
                var to_open = [];

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
                    chrome.tabs.create({ active:false, url: url, pinned:true });
                }

                console.log("Received the command.");
            });
        }
	});
})();

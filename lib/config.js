$(document).ready( function() {
    chrome.runtime.sendMessage({type:'get'}, function(response) {
        var pins = response.response;
        $('#links').val(pins.join('\n'));
    });

    $('#save').click( function() { 
        chrome.runtime.sendMessage({type:'save', content: $("#links").val()}, function(response) {
            $("#save").val("Saved");
        });
    })

});

function publish() {
   
    pubnub = new PubNub({
        publishKey : 'pub-c-fbdca561-b5c2-419c-9d57-1a311b4f4e9d',
        subscribeKey : 'sub-c-5c325260-16f0-11e8-b32f-5ea260837941', 
        ssl: true
    })
       
    function publishSampleMessage() {
        console.log("Since we're publishing on subscribe connectEvent, we're sure we'll receive the following publish.");
        var publishConfig = {
            channel : "hello_world",
            message : "Hello from PubNub Docs!"
        }
        pubnub.publish(publishConfig, function(status, response) {
            console.log(status, response);
        })
    }
       
    pubnub.addListener({
        status: function(statusEvent) {
            if (statusEvent.category === "PNConnectedCategory") {
                publishSampleMessage();
            }
        },
        message: function(message) {
            console.log("New Message!!", message);
        },
        presence: function(presenceEvent) {
            // handle presence
        }
    })      
    console.log("Subscribing..");
    pubnub.subscribe({
        channels: ['hello_world'] 
    });
};

function makeLogin(form) {
    console.log('LOGGING IN')
    var phone = window.phone = PHONE({
        number        : form.username.value || "Anonymous", // listen on username line else Anonymous
        publish_key   : 'pub-c-fbdca561-b5c2-419c-9d57-1a311b4f4e9d',
        subscribe_key : 'sub-c-5c325260-16f0-11e8-b32f-5ea260837941',
    }); 
    phone.ready(function(){ form.username.style.background="#55ff5b"; });
    phone.receive(function(session){
        session.connected(function(session) { video_out.appendChild(session.video); });
        session.ended(function(session) { video_out.innerHTML=''; });
    });
    return false;   // So the form does not submit.
}

function makeCall(form){
    if (!window.phone) alert("Login First!");
    else phone.dial(form.number.value);
    return false;
}
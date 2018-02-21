(function(){

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Generate Random Number if Needed
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var my_number       = "VOUS";
var number          = "INSTRUCTEUR"

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Calling & Answering Service
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var video_out = PUBNUB.$('video-display');
var img_out   = PUBNUB.$('video-thumbnail');
var img_self  = PUBNUB.$('video-self');

console.log('VIDEO OUT');
console.log(video_out);

var phone     = window.phone = PHONE({
    number        : my_number, // listen on this line
    publish_key : 'pub-c-fbdca561-b5c2-419c-9d57-1a311b4f4e9d',
    subscribe_key : 'sub-c-5c325260-16f0-11e8-b32f-5ea260837941', 
    ssl: true
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Video Session Connected
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function connected(session) {
    video_out.innerHTML = '';
    video_out.appendChild(session.video);

    PUBNUB.$('number').value = ''+session.number;
    sounds.play('sound/hi');
    console.log("Hi!");
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Video Session Ended
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function ended(session) {
    clearInterval(thumbnail.ival);
    thumbnail.ival = 0;
    set_icon('facetime-video');
    img_out.innerHTML = '';
    sounds.play('sound/goodbye');
    console.log("Bye!");
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Video Session Ended
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function set_icon(icon) {
    video_out.innerHTML = '<span class="glyphicon glyphicon-' +
        icon + '"></span>';
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Start Phone Call
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function dial(number) {
    // Dial Number
    var session = phone.dial(number);

    // No Dupelicate Dialing Allowed
    if (!session) return;

    // Show Connecting Status
    set_icon('send');
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Ready to Send or Receive Calls
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
phone.ready(function(){
    // Ready To Call
    set_icon('facetime-video');
    dial(number);   

    // Make a Phone Call
    PUBNUB.bind( 'mousedown,touchstart', PUBNUB.$('dial'), function(){
        var number = PUBNUB.$('number').value;
        if (!number) return;
        dial(number);
    } );

    // Hanup Call
    PUBNUB.bind( 'mousedown,touchstart', PUBNUB.$('hangup'), function() {
        phone.hangup();
        set_icon('facetime-video');
    } );

    // Take Picture
    PUBNUB.bind( 'mousedown,touchstart', PUBNUB.$('snap'), function() {
        var photo = phone.snap();

        if (!(photo && photo.image))
            return console.error(
                '%c Connect your video with a partner first.',
                'font-size:30px;background:#f00;color:#fff'
            );

        img_self.innerHTML = ' ';
        img_self.appendChild(photo.image);
        setTimeout( function() { img_self.innerHTML = ' ' }, 750 );
    } );
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Received Call Thumbnail
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function thumbnail(session) {
    img_out.innerHTML = '';
    img_out.appendChild(session.image);
    img_out.appendChild(phone.snap().image);
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Receiver for Calls
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
phone.receive(function(session){
    session.message(message);
    session.thumbnail(thumbnail);
    session.connected(connected);
    session.ended(ended);

    if (!thumbnail.ival)
        thumbnail.ival = setInterval( () => thumbnail(session), 100 );
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Chat
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var chat_in  = PUBNUB.$('pubnub-chat-input');
var chat_out = PUBNUB.$('pubnub-chat-output');

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Send Chat MSG and update UI for Sending Messages
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
PUBNUB.bind( 'keydown', chat_in, function(e) {
    if ((e.keyCode || e.charCode) !== 13)     return true;
    if (!chat_in.value.replace( /\s+/g, '' )) return true;

    phone.send({ text : chat_in.value });
    add_chat( my_number.number + " (Me)", chat_in.value );
    chat_in.value = '';
} )

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Update Local GUI
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function add_chat( number, text ) {
    if (!text.replace( /\s+/g, '' )) return true;

    var newchat       = document.createElement('div');
    newchat.innerHTML = PUBNUB.supplant(
        '<strong>{number}: </strong> {message}', {
        message : safetxt(text),
        number  : safetxt(number)
    } );
    chat_out.insertBefore( newchat, chat_out.firstChild );
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// WebRTC Message Callback
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function message( session, message ) {
    add_chat( session.number, message.text );
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// XSS Prevent
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function safetxt(text) {
    return (''+text).replace( /[<>]/g, '' );
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Problem Occured During Init
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
phone.unable(function(details){
    console.log("Alert! - Reload Page.");
    console.log(details);
    set_icon('remove');
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Debug Output
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
phone.debug(function(details){
     // console.log(details);
});

})();
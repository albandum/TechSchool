(()=>{
    'use strict';

    function number() { return (''+Math.random()*100000).split('.')[0] }

    // ~Warning~ You must get your own API Keys for non-demo purposes.
    // ~Warning~ Get your PubNub API Keys: https://www.pubnub.com/get-started/
    // The phone *number* can by any string value
    const pubkey  = 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c';
    const subkey  = 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe';

    const INSTRUCTOR = 113112222
    const STUDENT = number()

    var url_string = window.location.href; //window.location.href
    var url = new URL(url_string);
    if (url.searchParams.get("instructor") > 0) {
        var userType = "INSTRUCTOR"
        var phone1num       = INSTRUCTOR;
        var phone2num = STUDENT;
    } else {
        var userType = "STUDENT"
        var phone1num       = STUDENT;
        var phone2num = INSTRUCTOR;
    }

    console.log(userType);


    // Phone One
    let   phoneOneSession = null;
    let   phoneOneReady   = false;
    const numberOne       = phone1num;
    const phoneOne        = PHONE({
        number        : numberOne
    ,   publish_key   : pubkey
    ,   subscribe_key : subkey 
    });

    // Phone Two
    let   phoneTwoSession = null;
    let   phoneTwoReady   = false;
    const numberTwo       = phone2num;
    let   phoneTwo        = null;

    // Local Camera Display
    phoneOne.camera.ready( video => {
        phoneOne.$('video-self').appendChild(video);
        phoneOne.debug( info => console.info(info) );
    });


    function phoneCallInstructor() {
        console.log('Calling '+INSTRUCTOR)
        // if (!(phoneOneReady)) return;
        phoneOneSession = phoneOne.dial(INSTRUCTOR);
    }


    // CALL HANDLING
    phoneOne.ready(()=>{
        phoneOneReady = true;

        if (userType == "STUDENT") {
            console.log('Preparing to call...')
            phoneCallInstructor();
        }
        // When Call Comes In or is to be Connected
        phoneOne.receive( session => {
            console.log('Receiving a call...');

            // Display Your Friend's Live Video
            session.connected( session => {
                console.log('Remote caller: CONNECTED');
                phoneOne.$('video-out').appendChild(session.video);
            });

            session.ended( session => console.log('Remote caller: ENDED') );

        });
    });

  

})();
(()=>{
    'use strict';

    function number() { return (''+Math.random()*100000).split('.')[0] }

    // ~Warning~ You must get your own API Keys for non-demo purposes.
    // ~Warning~ Get your PubNub API Keys: https://www.pubnub.com/get-started/
    // The phone *number* can by any string value
    const pubkey  = 'pub-c-fbdca561-b5c2-419c-9d57-1a311b4f4e9d';
    const subkey  = 'sub-c-5c325260-16f0-11e8-b32f-5ea260837941';

    const INSTRUCTOR = 7276594876
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
        console.log('Camera ready !');
        let video_self = phoneOne.$('video-self')
        video_self.appendChild(video);
        // phoneOne.debug( info => console.info(info) );
    });


    function phoneCallInstructor() {
        console.log('Calling '+INSTRUCTOR)
        // if (!(phoneOneReady)) return;
        phoneOneSession = phoneOne.dial(INSTRUCTOR);
    }


    // CALL HANDLING
    phoneOne.ready(()=>{
        let video_remote = phoneOne.$('video-remote')


        phoneOneReady = true;

        if (userType == "STUDENT") {
            console.log('Preparing to call...')
            phoneCallInstructor();
        }
        // When Call Comes In or is to be Connected
        phoneOne.receive( session => {
            console.log('Receiving a call from '+session.number+'...');

            console.log(session)
            // Display Your Friend's Live Video
            session.connected( session => {
                console.log('Remote caller: CONNECTED');
                console.log(session.video);
                video_remote.appendChild(session.video);
            });

            session.ended( session => {
                console.log('Remote caller: ENDED')
                video_remote.innerHTML = '';
            } );

        });
    });

  

})();
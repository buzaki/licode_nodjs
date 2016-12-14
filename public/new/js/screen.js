var localStream, room, screen_stream;
 
DEMO.init_demo = function (my_name) {

  var screen = true;
  screen_stream = Erizo.Stream({screen: screen, extensionId: 'bgjclminejjkjajmaimgjcclifjokfej'});
  localStream = Erizo.Stream({audio: true, video: true, data: true, screen: false, attributes: {name: my_name}});
  DEMO.chat_stream = localStream;
  
  DEMO.create_token("user", "presenter", function (response) {
    var token = response;
    console.log(token);
    room = Erizo.Room({token: token});

    screen_stream.addEventListener("access-accepted", function () {
      room.publish(screen_stream);
      screen_publishing = true;
      var b = document.getElementById('share_button');
      b.className = b.className + ' intermittent';
      document.getElementById('share_message').innerHTML = '你现在正在分享你的桌面.';
      b.innerHTML = '停止分享';
    });

    localStream.addEventListener("access-accepted", function () {
      var subscribeToStreams = function (streams) {
        for (var index in streams) {
          var stream = streams[index];
          if (localStream.getID() !== stream.getID() && screen_stream.getID() !== stream.getID()) {
            room.subscribe(stream);
          }
        }
      };

      room.addEventListener("room-connected", function (roomEvent) {
        DEMO.connect_to_chat();
        room.publish(localStream);
        subscribeToStreams(roomEvent.streams);
      });

      room.addEventListener("stream-subscribed", function(streamEvent) {
        var stream = streamEvent.stream;

        if (stream.hasScreen()) {
          hide_share_panel();
          stream.show('screen');
        } else {
          add_div_to_grid("test" + stream.getID())
          stream.show("test" + stream.getID());
          stream.addEventListener("stream-data", DEMO.chat_message_received);
          DEMO.add_chat_participant(stream.getAttributes().name);
        }
        
      });

      room.addEventListener("stream-added", function (streamEvent) {
        var streams = [];
        streams.push(streamEvent.stream);
        subscribeToStreams(streams);
      });

      room.addEventListener("stream-removed", function (streamEvent) {
        // Remove stream from DOM
        var stream = streamEvent.stream;
        if (stream.elementID !== undefined) {
          if (stream.hasScreen()) {
            document.getElementById('screen').innerHTML = '';
            show_share_panel();
          } else {
            remove_div_from_grid(stream.elementID);
          }
        }
      });

      room.connect();

      create_grid();

      add_div_to_grid("localVideo");
      localStream.show("localVideo");

    });
    localStream.init();

  });
};

var screen_publishing = false;

var show_share_panel = function () {
  var share_panel = document.createElement('div');
  share_panel.setAttribute("id", "share_panel");
  var p = document.createElement('h2');
  p.setAttribute("id", "share_message");
  p.innerHTML = '还没有人分享桌面，点击分享按钮分享你的桌面给大家.';
  p.className = "lead";

  var b = document.createElement('button');
  b.setAttribute("id", "share_button");
  b.className = 'btn btn-large btn-primary';
  b.innerHTML = '分享桌面';

  b.onclick = function () {
    if (screen_publishing) {
      screen_stream.close();
      screen_publishing = false;
      b.className = b.className.replace(/\bintermittent\b/,'');
      p.innerHTML = '还没有人分享桌面，点击分享按钮分享你的桌面给大家.';
      b.innerHTML = '分享桌面';
    } else {
      screen_stream.init();
      
    }
    
  };

  share_panel.appendChild(p);
  share_panel.appendChild(b);
  share_panel.setAttribute("style", "margin-top: 20%; margin-left: 20%;");
  document.getElementById('screen').appendChild(share_panel);

  if (document.getElementById('full_screen_button')) {
    document.getElementById('screen').removeChild(document.getElementById('full_screen_button'));
  }
}

var hide_share_panel = function () {

  var b = document.createElement('img');
  b.setAttribute("id", "full_screen_button");
  b.src = "/images/full_screen.png";
  b.setAttribute("style", "right: 0px; position: absolute; z-index: 1; width: 35px; cursor: pointer;");

  var full_screen = false;


  b.onclick = function () {

    var elem = document.getElementById('video_grid');

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else {
      return;
    }

    $('#video_grid').css('width', '99%');
    $('#video_grid').css('height', '100%');
    $('#full_screen_button').css('display', 'none');

    $('#conference_video_grid').css('display', 'none');
    $('#screen').css('height', '100%');

  }

  var fullScreenChanged = function () {

    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

    if (fullscreenElement === null) {
      $('#video_grid').css('width', '');
      $('#video_grid').css('height', '');
      $('#full_screen_button').css('display', '');

      $('#conference_video_grid').css('display', '');
      $('#screen').css('height', '80%');
    }
  }

  $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', fullScreenChanged);

  document.getElementById('screen').appendChild(b);

  document.getElementById('screen').removeChild(document.getElementById('share_panel'));
}

var create_grid = function() {

  var grid = document.getElementById('video_grid');
  var newDiv = document.createElement('div');
  newDiv.className = newDiv.className + " grid_element_border";
  newDiv.setAttribute("id", 'screen');

  var newDiv3 = document.createElement('div');
  newDiv3.setAttribute("id", 'conference_video_grid');

  grid.appendChild(newDiv);  
  grid.appendChild(newDiv3);

  //$('#screen').css('text-align', 'center');
  $('#conference_video_grid').css('height', '20%');
  $('#screen').css('height', '80%');
  $('#screen').css('width', '100%');
  $('#screen').css('background-color', 'white');

  show_share_panel();
}

var add_div_to_grid = function(divId) {

    $('#video_grid').css('border', 'none');

    var grid = document.getElementById('conference_video_grid');
    var newDiv = document.createElement('div');
    newDiv.setAttribute("id", divId + '_container');
    newDiv.className = newDiv.className + " grid_element_border";

    var newDiv2 = document.createElement('div');
    newDiv2.setAttribute("id", divId);
    newDiv2.className = newDiv2.className + " grid_element";
    newDiv.appendChild(newDiv2);

    grid.appendChild(newDiv);   
    resizeGrid();
}

var remove_div_from_grid = function(divId) {

    var grid = document.getElementById('conference_video_grid');
    grid.removeChild(document.getElementById(divId + '_container'));
    resizeGrid();
}

var resizeGrid = function() {

    var grid = document.getElementById('conference_video_grid');
    var nChilds = grid.childElementCount;

    if (nChilds < 6) {

      var w = 20*nChilds + '%';
      var m = (100-(nChilds*20))/2 + '%';
      
      $('#conference_video_grid').css('width', w);
      $('#conference_video_grid').css('margin-left', m);

      for(var i = 0; i < nChilds; i++) {

          grid.childNodes[i].setAttribute("style", "width: " + 100/nChilds + "%; height: 100%;");

      }
    } else {

      $('#conference_video_grid').css('width', '100%');
      $('#conference_video_grid').css('margin-left', '0');

      for(var i = 0; i < nChilds; i++) {

          grid.childNodes[i].setAttribute("style", "width: " + 100/nChilds + "%; height: 100%;");

      }


    }
} 

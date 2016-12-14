var serverUrl = "/";

var DEMO = {};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getParameterByName1() {
    
    var result = location.pathname;
    result = result.replace('/room/', '');
    
    console.log('************',result);
    
    return result;
}

DEMO.create_token = function(userName, role, callback) {

    var req = new XMLHttpRequest();
    var url = serverUrl + 'token';
    var body = {roomId: getParameterByName1(), username: userName, role: role};

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            callback(req.responseText);
        }
    };

    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(body));
}

window.onload = function () {

    $('#connection_panel').modal({keyboard: false, backdrop: 'static'});
    var messText = document.getElementById('chat_message');
    var notepad_list = document.getElementById('notepad-list');
    var lajitong = document.getElementById('lajitong');
    var curr_drag = null;
    
    // lajitong
    
    lajitong.ondrop = function(event) {
        var text = event.dataTransfer.getData("Text");
        console.log('ondrop', text);
        if(curr_drag != null) {
            //curr_drag.innerHTML = '';
            if (DEMO.chat_stream) {
                    DEMO.chat_stream.sendData({msg: 'delete_notepad', name: curr_drag.id});
            }
            notepad_list.removeChild(curr_drag);            
            curr_drag = null;           
        }
        event.preventDefault();
        lajitong.style.width = '128px';
        lajitong.style.height = '128px';
        
    };
    
    lajitong.ondragover = function (event) {  
        console.log("onDrop over");  
        event.dataTransfer.dropEffect = 'copy';
        event.preventDefault(); 
         
    }  

    lajitong.ondragenter = function (event) {  
        console.log("onDrop enter");  
        lajitong.style.width = '150px';
        lajitong.style.height = '150px';
    }  

    lajitong.ondragleave = function (event) {  
        console.log("onDrop leave");  
        lajitong.style.width = '128px';
        lajitong.style.height = '128px';
    }  

    lajitong.ondragend = function (event) {  
        console.log("onDrop end");  
        lajitong.style.width = '128px';
        lajitong.style.height = '128px';
        
    } 

    
    // notepad list
    
    //var notepad_index = 0;
    
    var add_text_to_notepad = function(notepad_index_, text) {
        var p = document.createElement('p');
        p.setAttribute('draggable', true);
        p.setAttribute('id', "notepad_"+ notepad_index_);
        p.ondragstart = function (event) {  
            console.log("dragStart");              
            curr_drag = p;
            event.dataTransfer.setData("Text", p.innerHTML);  
            event.dataTransfer.effectAllowed = 'all';
        };
        p.innerHTML = text;
        notepad_list.appendChild(p);
        notepad_list.scrollTop = notepad_list.scrollHeight;
    }
    
    notepad_list.ondrop = function(event) {
        /*if(event.dataTransfer.files) {
            for (var i = 0; i < event.dataTransfer.files.length; i++) {  
                var file = event.dataTransfer.files[i];  
                console.log(file.name);
                add_text_to_notepad(file.name);
            }
        } else {*/
            var text = event.dataTransfer.getData("Text");
            console.log('ondrop', text);
            //notepad_index++;
            var notepad_index = new Date().getTime();
            add_text_to_notepad(notepad_index, text);
            
            if (DEMO.chat_stream) {
                DEMO.chat_stream.sendData({msg: 'add_notepad', name: 'notepad_'+notepad_index, text: text});
            }
            
        //}
        event.preventDefault();
    };
    
    notepad_list.ondragover = function (event) {  
        console.log("onDrop over");  
        event.dataTransfer.dropEffect = 'copy';
        event.preventDefault();          
    }  

    notepad_list.ondragenter = function (event) {  
        console.log("onDrop enter");  
    }  

    notepad_list.ondragleave = function (event) {  
        console.log("onDrop leave");  
    }  

    notepad_list.ondragend = function (event) {  
        console.log("onDrop end");  
    } 
    
    
    
    var chat_body = document.getElementById('chat_body');

    var my_name;

    DEMO.close = function () {
        window.location.href = '/';
    }

    for(var i in document.getElementsByClassName('close_button')) {
        document.getElementsByClassName('close_button')[i].onclick = DEMO.close;
    }

    //document.getElementById('back_icon').onclick = DEMO.close;

    messText.onkeyup = function(e) {
      e = e || event;
      if (e.ctrlKey && e.keyCode === 13) {
          DEMO.send_chat_message();
      }
      return true;
    }

    var add_text_to_chat = function(text, style) {
        var p = document.createElement('div');
        p.setAttribute('draggable', true);
	p.setAttribute('style', 'overflow:auto;');
        p.ondragstart = function (event) {  
            console.log("dragStart");  
            curr_drag = p;
            event.dataTransfer.setData("Text", p.innerHTML);  
            event.dataTransfer.effectAllowed = 'all';
        };
        p.className = 'chat_' + style;
        //var unmark_str = '# Buaiti\n\n* Rendered by **marked**.\n\n* ![buaiti](https://www.buaiti.com/images/buaiti-logo.png)\n\n* ' + text;
        var unmark_str = text;
        var mark_str = marked(unmark_str);
        p.innerHTML = mark_str;
        chat_body.appendChild(p);
        chat_body.scrollTop = chat_body.scrollHeight;
    }

    DEMO.connect_to_chat = function() {
        add_text_to_chat('进入房间成功', 'italic');
    }

    DEMO.add_chat_participant = function(name) {
        add_text_to_chat('有人进入房间: ' + name, 'italic');
    }

    DEMO.send_chat_message = function() {
        if(messText.value.match (/\S/)) {
            if (DEMO.chat_stream) {
                DEMO.chat_stream.sendData({msg: messText.value, name: my_name});
            }
            add_text_to_chat(my_name + ': ', 'name');
            add_text_to_chat(messText.value, '');
        }
        messText.value = '';
    };

	function notify(msg) {
		if (window.Notification) {
			if (window.Notification.permission === 'granted') {
				if(msg.name === undefined || msg.msg === undefined) return;
				var not = new Notification(msg.name+'：', { icon: "/images/buaiti-logo.png", sound:'/images/notify.mp3', tag: "通知", body: msg.msg });
				//not.onclick = function() { not.cancel(); };                   
			} else {
				window.Notification.requestPermission();
			}
		}
	}

    DEMO.chat_message_received = function(evt) {
        var msg = evt.msg;
        
        if(msg.msg === 'delete_notepad') {
            var notepad_obj = document.getElementById(msg.name);
            notepad_list.removeChild(notepad_obj);
            
        } else if(msg.msg === 'add_notepad') {
            var p = document.createElement('p');
            p.setAttribute('draggable', true);
            p.setAttribute('id', msg.name);
            p.ondragstart = function (event) {  
                console.log("dragStart");  
                curr_drag = p;
                event.dataTransfer.setData("Text", p.innerHTML);  
                event.dataTransfer.effectAllowed = 'all';
                
                
            };
            p.innerHTML = msg.text;
            notepad_list.appendChild(p);
            notepad_list.scrollTop = notepad_list.scrollHeight;
        } else {
            add_text_to_chat(msg.name + ': ', 'name');
            add_text_to_chat(msg.msg, '');
            
            if(!window.is_page_show) {
		        notify(msg);
	        }
        }
    }

    var connect_user = function () {
        $('#connection_panel').modal('hide');
        my_name = document.getElementById('username_txt').value;
        DEMO.init_demo(my_name);
    }
    var username = getParameterByName("username");
    if (username !== undefined && username !== "") {
        document.getElementById('username_txt').value = username;
	connect_user();
    }

    document.getElementById('username_txt').onkeyup = function(e) {
      e = e || event;
      if (e.keyCode === 13) {
          connect_user();
      }
      return true;
    }

    document.getElementById('connect_button').onclick = connect_user;
}

/* Copyright (c) 2011 Andy Shora, andyshora@gmail.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 


*/

// taskmanager object
var taskmanager = {};

// ------- VARS -------
taskmanager.username = "";
taskmanager.color = "";
taskmanager.currentUsers = [];

// ------- CORE FUNCTIONS -------

// create a labelled point in the space to represent a user
taskmanager.createUser = function(username, color, notifyServer){
	
	if (notifyServer === undefined) notifyServer = true;

	taskmanager.currentUsers.push({'username':username, 'color':color});
	
	taskmanager.log('Creating user:{0} with color:{1}'.format2(username,color));

	var html = '<li class="taskmanager_users" id="taskmanager_user_{1}">' +
	'<div class="taskmanager_icon" {3}><div class="taskmanager_icon_inner" style="background-color:{2};"></div></div><div class="taskmanager_user">{0}</div>' +
	'</li>';
	
	var onclick = (username===taskmanager.username) ? 'onclick="taskmanager.changeColorPrompt();"' : "";
	$('ul#users').append(html.format(username, taskmanager.getFriendly(username), color, onclick));
	
	$('ul#users > li:last').animate({ right:0 }, 800, 'easeInOutCirc');
		
};

taskmanager.removeUser = function(username){
	$('#taskmanager_user_' + taskmanager.getFriendly(username)).animate({ right:'-100px' }, 800, 'easeInOutCirc', function(){
		$(this).remove();
	});
};

taskmanager.changeColorPrompt = function(){
	taskmanager.color = prompt("What's your new color?", "");
	// change the color
	taskmanager.changeColor(taskmanager.username, taskmanager.color);
	// broadcast the change
	now.sv_ChangeColor(taskmanager.username, taskmanager.color);
};

taskmanager.changeColor = function(username, color){
	taskmanager.log('Changing {0}\'s color to {1}'.format(username, color));
	username = taskmanager.getFriendly(username);
	$("#taskmanager_user_" + username + " div.taskmanager_icon_inner").css('background-color',color);
};

// ------- EVENT HANDLERS -------



$(document).ready(function(){
	
	now.CreateUser = function(username, color){
		//if () return false;
		if ((taskmanager.username !== username) && (!taskmanager.doesUserExist(username))){
			taskmanager.log('NOW Push Received {0} {1} {2}'.format2("CreateUser",username,color));
			taskmanager.createUser(username, color, false);
		}
	};
	
	// send beacon to server to alert new user
	now.SendBeacon = function(new_username){
		// if this request for beacons was not from me
		if (new_username !== taskmanager.username){
			taskmanager.log('Sending a beacon intended for {0}'.format2(new_username));
			now.sv_SendBeacon(new_username, taskmanager.username, taskmanager.color); // alert the new guy of my presence
		}
	};
	
	// receive beacons
	now.ReceiveBeacon = function(new_username, username, color){
		taskmanager.log('Received a beacon from {0} which was requested from {1}'.format(username, new_username));
		// only the guy who made the request for beacons needs to create the other users
		if (taskmanager.username === new_username){
			taskmanager.log('Creating user from beacon {0} {1}'.format2(username, color));
			taskmanager.createUser(username, color, false);
		}
	};
	
	// change color on users list
	now.ChangeColor = function(username, color){
		// if this user made the request then the color has already been changed
		if (taskmanager.username !== username){
			taskmanager.log('Received a color change request from {0}, who want to change their color to {1}'.format(username, color));
			taskmanager.changeColor(username, color);
		}
	};
	
	// user disconnected, remove them
	now.RemoveUser = function(username){
		// if this user made the request then the color has already been changed
		if (taskmanager.username !== username){
			taskmanager.log('{0} disconnected'.format(username));
			taskmanager.removeUser(username);
		}
	};
	
});


//taskmanager.name = function(){};


// ------- HELPER FUNCTIONS -------

// log a message to the console
taskmanager.log = function(msg){
		$console = $('#console');
		if ($console.length>0)
			$console.prepend(msg + '<br>');
		
};

taskmanager.doesUserExist = function(username){
	for (var x in taskmanager.currentUsers){
		if (x.username === username) return true;
	}
	return false;
};

taskmanager.getFriendly = function(str){
	str = str.replace(/\s/g,'_');
	str = str.replace(/\W/g,'');
	return str;
};


// ------- UTILITY FUNCTIONS -------

// format string with arguments
String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};
// format string with arguments and underline arguments
String.prototype.format2 = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, '<u>'+arguments[i]+'</u>');
    }
    return formatted;
};
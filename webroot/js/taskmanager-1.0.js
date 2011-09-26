/* Copyright (c) 2011 Andy Shora, andyshora@gmail.com

You may not use any of the files on this website without permission from the above stated person.

*/

// taskmanager object
var taskmanager = {};

// ------- VARS -------
taskmanager.username = "";
taskmanager.color = "";
taskmanager.code = "123456";
taskmanager.currentUsers = [];
taskmanager.colors = ['red','blue','green','yellow','pink','purple','aqua','orange','white'];

// ------- CORE FUNCTIONS -------

// create a labelled point in the space to represent a user
taskmanager.createUser = function(username, color){

	if (taskmanager.doesUserExist(username)) return false;

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
	// remove from array
	var i = -1;
	for (u in taskmanager.currentUsers){
		if (username === (taskmanager.currentUsers[u]).username) i=u;
	}
	
	if (i!==-1) taskmanager.currentUsers.splice(i, 1);
	
	$('#taskmanager_user_' + taskmanager.getFriendly(username)).animate({ right:'-100px' }, 800, 'easeInOutCirc', function(){
		$(this).remove();
	});
};

taskmanager.changeColorPrompt = function(){
	//taskmanager.color = prompt("What's your new color?", "");
	// change the color
	//taskmanager.changeColor(taskmanager.username, taskmanager.color);
	// broadcast the change
	//now.sv_ChangeColor(taskmanager.username, taskmanager.color);
	$("#color_picker_wrap").show();
};

taskmanager.changeMyColor = function(color){
	taskmanager.color = color;
	$("#color_picker_wrap").hide();
	taskmanager.changeColor(taskmanager.username, color);
	// broadcast the change
	now.sv_ChangeColor(taskmanager.username, taskmanager.color);
	
};

taskmanager.changeColor = function(username, color){
	taskmanager.log('Changing {0}\'s color to {1}'.format(username, color));
	username = taskmanager.getFriendly(username);
	$("#taskmanager_user_" + username + " div.taskmanager_icon_inner").css('background-color',color);
};

taskmanager.initColorPicker = function(){
	var html = '<div id="color_picker_wrap"><ul id="color_picker">';
	for (c in taskmanager.colors){
		html += '<li title="{0}" style="background-color:{0};" onclick="taskmanager.changeMyColor(\'{0}\');"></li>'.format(taskmanager.colors[c]);
	}
	html += '</ul></div>';
	
	$('footer').append(html);
};

taskmanager.initControls = function(){
	$('#add').bind('keydown', function(e){
		if (e.keyCode == 13){
			var text = $(this).val();
			taskmanager.log("Adding item: {0}".format(text));
			taskmanager.addToList(text);
			$(this).val('');
			now.sv_AddToList(text, taskmanager.username, taskmanager.code, 1);
		}
	});
};

taskmanager.addToList = function(text){
	var html = '<li class="item">{0}</li>'.format(text);
	if (($('li.item')).length > 0){
		$('li.item:last').after(html);
	} else {
		$('li#add_row').before(html);
	}
};

// ------- EVENT HANDLERS -------



$(document).ready(function(){
	
	now.CreateUser = function(username, color){
		//if () return false;
		if (taskmanager.username !== username){
			taskmanager.log('NOW Push Received {0} {1} {2}'.format2("CreateUser",username,color));
			taskmanager.createUser(username, color);
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
			taskmanager.createUser(username, color);
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
			taskmanager.log('{0} disconnected'.format(username));
			taskmanager.removeUser(username);
	};
	
	// add tast to list, if this user didnt add it
	now.AddToList = function(text, username){
			if (username !== taskmanager.username){
				taskmanager.addToList(text);
			}
	};
	
	taskmanager.initColorPicker();
	taskmanager.initControls();
	
	$('#add').focus();
	
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
		if ((taskmanager.currentUsers[x]).username === username) return true;
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
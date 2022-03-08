const socket = io('/');

socket.emit('join-room', ROOM_ID, 10);
// socket.on('user-connected', userId => {
//     console.log('User connected: ' + userId);
// })

// Get user name and room name
socket.on('name room', nameAndRoom => {
    socket.emit('find mate', nameAndRoom);
});

// Socket emit
// Emit new object
let lastObj = canvas.item(canvas.size() - 1);
function emitObject() {
    let newObj = canvas.item(canvas.size() - 1);
    if (newObj != lastObj) {
        let json = JSON.stringify(newObj.toJSON(['name']));
        let data = {
            json: json,
            grouped: "false",
            modified: "false"
        };
        socket.emit('drawing', data);
        lastObj = newObj;
    }
}

// Emit modified object/group
function emitModified(type) {
    let newObj = canvas.getActiveObject();
    let json = JSON.stringify(newObj.toJSON(['name']));

    let data;

    if (type == "group") {
        data = {
            json: json,
            grouped: "true",
            modified: "false"
        };
    } else if (type == "object") {
        data = {
            json: json,
            grouped: "false",
            modified: "true"
        };
    }

    socket.emit('drawing', data);
    lastObj = newObj;
}

// Emit command
function sendCommand(command) {
    let jsonCommand = JSON.stringify(command);
    socket.emit('send command', jsonCommand);
}

// Socket on
// Get object
socket.on('drawing', function (obj) {
    let jsonObj = JSON.parse(obj.json);
    if (obj.modified === "true") {
        canvas.remove(canvas.getItemByName(jsonObj.name));
        canvas.requestRenderAll();
    }
    if (obj.grouped === "false") {
        fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
            canvas.add(enlivenedObjects[0]);
            canvas.requestRenderAll();
        });
    } else if (obj.grouped === "true") {
        fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
            canvas.add(enlivenedObjects[0]);
            canvas.setActiveObject(enlivenedObjects[0]);
            canvas.getActiveObject().toActiveSelection();
            canvas.getActiveObjects().forEach(element => canvas.remove(canvas.getItemByName(element.name)));
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        });
    }
    // addToStory('object');
});

// Get command
socket.on('get command', function (cmd) {
    let command = JSON.parse(cmd);
    if (command == "undo") {
        undo();
    } else if (command == "redo") {
        redo();
    } else if (command == "clear") {
        clearCanvas();
    } else if (command == "none") {
        setPattern(command);
    } else if (command == "sq") {
        setPattern(command);
    } else if (command == "line") {
        setPattern(command);
    } else if (command == "dot") {
        setPattern(command);
    } else if (command == "deleteDone") {
        // addToStory('object');
    } else {
        canvas.remove(canvas.getItemByName(command));
    }
});

// Get canvas
socket.on('get canvas', function (obj) {
    canvas.loadFromJSON(obj.data);
    undo_history = obj.undo;
    redo_history = obj.redo;
    $('.patterns').css('background-image',`url(../assets/icons/${obj.pattern}.svg)`);
    $(".canvasPatterns button").removeClass('active');
    $(`.${obj.pattern}`).addClass('active');
    currentPattern = obj.pattern;
});

// Send canvas to new user
socket.on('get requester', requesterID => {
    let data = {
        data: JSON.stringify(canvas.toJSON(['name'])),
        undo: undo_history,
        redo: redo_history,
        pattern: currentPattern
    };
    socket.emit('send canvas', requesterID, data);
});
const canvas = this.__canvas = new fabric.Canvas('c');

fabric.Object.prototype.objectCaching = false;
fabric.Object.prototype.centeredScaling = true;
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.transparentCorners = false;
fabric.Canvas.prototype.getItemByName = function(name) {
    var object = null,
        objects = this.getObjects();
  
    for (var i = 0, len = this.size(); i < len; i++) {
        if (objects[i].name && objects[i].name === name) {
            object = objects[i];
            break;
        }
    }
    return object;
};

// Init variables
let div = $("#canvasWrapper");
let $canvas = $("#c");
// Width & height of canvas's wrapper
let w, h;
w = div.width();
h = div.height();
$canvas.width(w).height(h);
// Set width & height for canvas
canvas.setHeight(h);
canvas.setWidth(w);

$(window)
    // Canvas resize
    .on('resize', function () {
        w = div.width();
        h = div.height();
        canvas.setHeight(h);
        canvas.setWidth(w);
        $canvas.width(w).height(h);
    })

    // Delete key
    .on('keydown', function (e) {
        if (e.keyCode === 46) {
            deleteObject();
        }
    });

// Default brush settings
let widthOption = 5;
let colorOption = 'black';
// Change tool
function changeAction(target) {
    ['select','erase','brush'].forEach(action => {
        const t = document.getElementById(action);
        t.classList.remove('active');
    });
    if(typeof target==='string') target = document.getElementById(target);
    target.classList.add('active');
    switch (target.id) {
        case "select":
            canvas.isDrawingMode = false;
            break;
        case "erase":
            canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
            canvas.freeDrawingBrush.width = 35;
            canvas.isDrawingMode = true;
            break;
        case "brush":
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.width = widthOption;
            canvas.freeDrawingBrush.color = colorOption;
            canvas.isDrawingMode = true;
            break;
        default:
            break;
    }
}
// Default tool
changeAction('brush');

// Canvas events
canvas.on("object:added", function (e) {
    if (e.target.name === undefined) {
        let objectName = (Math.random()).toString().substring(2, 17);
        e.target.set('name', objectName);
    }
});
canvas.on("path:created", function (e) {
    story("added", e.path.name, JSON.stringify(e.path.toJSON(['name'])));
    emitObject();
});
canvas.on("object:modified", function (e) {
    if (e.target.type === 'activeSelection') {
        let i = 0;
        let activeObjectNames = [];
        let activeObjects = [];
        e.target._objects.forEach(element => {
            activeObjectNames.push(element.name);
        });
        canvas.discardActiveObject();
        activeObjectNames.forEach(element => {
            activeObjects.push(canvas.getItemByName(element));
        });
        activeObjects.forEach(element => {
            story(i, element.name, JSON.stringify(element.toJSON(['name'])));
            i++;
        });
        let selection = new fabric.ActiveSelection(activeObjects, {
            canvas: canvas
        });
        canvas.setActiveObject(selection);
        // emitModified('group');
    } else {
        story("modified", e.target.name, JSON.stringify(e.target.toJSON(['name'])));
        emitModified('object');
    }
});
canvas.on("erasing:end", function () {
    // e.path.globalCompositeOperation = 'destination-out';
    // emitObject();
    console.log("erasing:end");
});
// canvas.on("selection:created", function(e) {
//     console.log("selection:created");
// });
// canvas.on("selection:updated", function(e) {
//     console.log("selection:updated");
// });
// canvas.on("before:selection:cleared", function(e) {
//     console.log("before:selection:cleared");
// });

// let rendrd = 0;
// canvas.on("after:render", function() {
//     console.log("rendered " + rendrd + " times");
//     rendrd++;
// });

// Duplicate / Delete object buttons
var deleteIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-circle-x' width='24' height='24' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Ccircle cx='12' cy='12' r='9' /%3E%3Cpath d='M10 10l4 4m0 -4l-4 4' /%3E%3C/svg%3E";
// var cloneIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-copy' width='24' height='24' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Crect x='8' y='8' width='12' height='12' rx='2' /%3E%3Cpath d='M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2' /%3E%3C/svg%3E"

var deleteImg = document.createElement('img');
deleteImg.src = deleteIcon;

// var cloneImg = document.createElement('img');
// cloneImg.src = cloneIcon;

function renderIcon(icon) {
    return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
        var size = this.cornerSize;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(icon, -size/2, -size/2, size, size);
        ctx.restore();
    }
}

fabric.Object.prototype.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -16,
    offsetX: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObject,
    render: renderIcon(deleteImg),
    cornerSize: 24
});

// fabric.Object.prototype.controls.clone = new fabric.Control({
//     x: -0.5,
//     y: -0.5,
//     offsetY: -16,
//     offsetX: -16,
//     cursorStyle: 'pointer',
//     mouseUpHandler: cloneObject,
//     render: renderIcon(cloneImg),
//     cornerSize: 24
// });

// Delete object
function deleteObject(eventData, transform) {
    if (canvas.getActiveObject().type === 'group') {
        canvas.getActiveObject().toActiveSelection();
    }
    let activeGroup = canvas.getActiveObjects();

    if (activeGroup) {
        // addToStory('object');
        canvas.discardActiveObject();
        activeGroup.forEach(function (object) {
            sendCommand(object.name)
            canvas.remove(object);
        });
        sendCommand('deleteDone');
    }
}

// Clone object
function cloneObject() {
    canvas.getActiveObject().toActiveSelection();
    if(canvas.getActiveObject().get('type')==="image") {
        var copyData = canvas.getActiveObject().toObject();
        fabric.util.enlivenObjects([copyData], function(objects) {
            objects.forEach(function(clonedImg) {
                clonedImg.set('top', clonedImg.top - 20);
                clonedImg.set('left', clonedImg.left + 20);
                canvas.add(clonedImg);
                canvas.setActiveObject(clonedImg);
            });
            canvas.requestRenderAll();
            emitObject();
        });
    } else {
        canvas.getActiveObject().clone(function(cloned) {
            _clipboard = cloned;
        });
        _clipboard.clone(function(clonedObj) {
            canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 20,
                top: clonedObj.top - 20,
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                // Active selection needs a reference to the canvas
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(function(obj) {
                    canvas.add(obj);
                });
                // This should solve the unselectability
                clonedObj.setCoords();
            } else {
                canvas.add(clonedObj);
            }
            _clipboard.top -= 20;
            _clipboard.left += 20;
            canvas.setActiveObject(clonedObj).toGroup();
            canvas.requestRenderAll();
            emitGroup();
        });
    }
}

// Clear canvas
function clearCanvas() {
    let objects = canvas.getObjects();
    objects.forEach(function (object) {
        canvas.remove(object);
    });
}

// Brush settings
function setBrush(options) {
    if (options.width !== undefined) {
        canvas.freeDrawingBrush.width = parseInt(options.width, 10);
        widthOption = parseInt(options.width, 10);
    }

    if (options.color !== undefined) {
        canvas.freeDrawingBrush.color = options.color;
        colorOption = options.color;
    }
}

// Set brush size
$(".brushSizes button").on('click', function () {
    $(".brushSizes button").removeClass('active');
    $(this).addClass('active');
});

// Set brush color
$(".brushColors button").on('click', function () {
    let val = $(this).data('value');
    activeColor = val;
    $("#brushColors").val(val);
    setBrush({color: val});
    $('.colors').css('background-color', val);
});
$(".color-input").on('change', function () {
    let val = $(this).val();
    activeColor = val;
    setBrush({color: val});
    $('.colors').css('background-color', val);
});

// Set canvas pattern
let currentPattern = 'none';
function setPattern(name) {
    canvas.setBackgroundColor({source: `/assets/patterns/pattern_${name}.svg`, repeat: 'repeat'}, function () {
        canvas.requestRenderAll();
    });
    $('.patterns').css('background-image',`url(../assets/icons/${name}.svg)`);
    $(".canvasPatterns button").removeClass('active');
    $(`.${name}`).addClass('active');
    currentPattern = name;
};
// Default canvas pattern
setTimeout(() => {
    setPattern('none');
}, 300);

let menuToggle = false;

// Brush color panel
$('.colors').click(function(){
    if (menuToggle === false) {
        $(".brushColors").fadeIn(100);
        setTimeout(() => {
            menuToggle = true;
        }, 200);
    } else {
        $(".brushColors").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});
$('.color-input').hover(function(){
    menuToggle = false;
}, function(){
    menuToggle = true;
});

// Brush size panel
$('.sizes').click(function(){
    if (menuToggle === false) {
        $(".brushSizes").fadeIn(100);
        setTimeout(() => {
            menuToggle = true;
        }, 200);
    } else {
        $(".brushSizes").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});
$('.small').click(function(){
    $('.sizes').css('background-size','50%');
});
$('.middle').click(function(){
    $('.sizes').css('background-size','76%');
});
$('.big').click(function(){
    $('.sizes').css('background-size','110%');
});

// Canvas pattern panel
$('.patterns').click(function(){
    if (menuToggle === false) {
        $(".canvasPatterns").fadeIn(100);
        setTimeout(() => {
            menuToggle = true;
        }, 200);
    } else {
        $(".canvasPatterns").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});

$('body').click(function(){
    if (menuToggle === true) {
        $(".brushColors").fadeOut(100);
        $(".brushSizes").fadeOut(100);
        $(".canvasPatterns").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});
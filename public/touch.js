let list = document.getElementById('canvasWrapper');
let touch = new Hammer(list);

touch.get('pan').set({ enable: false });
touch.get('pinch').set({ enable: true });

let i = 1;
let prevScale = 0;
touch.on('pinch', function(ev) {
    canvas.isDrawingMode = false;
    let scale = (ev.scale).toString().substring(0, 5);
    let delta = 0;
    if (scale > prevScale) {
        delta = -7;
        prevScale = scale;
    } else if (scale < prevScale) {
        delta = 7;
        prevScale = scale;
    }
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 1) zoom = 1;
    if (zoom < 0.1) zoom = 0.1;
    canvas.setZoom(zoom);
    // console.log(ev.type + " " + i + " " + ev.distance);
    // console.log(ev.type + " " + i + " " + ev.deltaX + " " + ev.deltaY);
    // console.log(ev.type + " " + i + " " + (ev.scale).toString().substring(0, 5));
    // ev.distance
    i++;
});
// touch.on('pinchstart', function() {
//     canvas.requestRenderAll();
// });
touch.on('pinchend', function() {
    // canvas.requestRenderAll();
    setTimeout(() => {
        canvas.isDrawingMode = true;
    }, 100);
});
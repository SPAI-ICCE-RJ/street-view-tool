function addpairC(load) {
    if (pPanorama.visible == false) {
        pPanorama.setVisible(true)
        document.getElementsByName('Date')[0].value = Object.values(pPanoramas[ntimes])[1]
    }

    var hd = pPanorama.pov.heading;
    var zm = Math.tan(45 / Math.pow(2, pPanorama.getZoom()) * Math.PI / 180);

    if (load.position !== undefined) {
        var pos1 = {
            lat: load.position[0],
            lng: load.position[1]
        }
        var pos2 = {
            lat: load.position[2],
            lng: load.position[3]
        }

    } else {

        var pos1 = {
            lat: pPanorama.position.lat() + 2 * Math.cos(Math.PI * hd / 180) / (60 * 1852) / zm,
            lng: pPanorama.position.lng() + 2 * Math.sin(Math.PI * hd / 180) / (60 * 1852) / zm
        }
        var pos2 = pos1;

    }
    var lab1 = "0m";
    var tit1 = String(aux.length);
    var lab2 = "--";
    var tit2 = String(aux.length)

    var point1 = new google.maps.Marker({
        position: pos1,
        map: pMap,
        draggable: true,
        label: lab1,
        title: tit1,
    });


    var point2 = new google.maps.Marker({
        position: pos2,
        map: pMap,
        draggable: true,
        label: lab2,
        title: tit2,
    });
}

adcElementoC = function() {
    var Panorama = pPanorama;
    var name = []
    const rul = [" B: Base", "A: Altura"]

    name[0] = Panorama.getPano() + "A"
    name[1] = Panorama.getPano() + "B"

    if (Panorama.__gm.panes.overlayLayer.children[name[1]] == undefined) {
        SVO.panWidth = Object.values(pMap.__gm.pixelBounds)[2] - Object.values(pMap.__gm.pixelBounds)[0];
        SVO.panHeight = Object.values(pMap.__gm.pixelBounds)[3] - Object.values(pMap.__gm.pixelBounds)[1];
        SVO.markerWidth = 12;
        SVO.markerHeight = 12;

        var divNova = document.createElement("i");
        divNova.id = 'centro'
        divNova.style.position = "absolute"
        divNova.style.top = (SVO.panHeight - SVO.markerHeight) / 2 + "px"
        divNova.style.left = (SVO.panWidth - SVO.markerWidth) / 2 + "px"
        divNova.style.fontSize = "12px"
        divNova.style.color = "black"
        divNova.classList.add('fa', 'fa-dot-circle-o')
        Panorama.__gm.panes.overlayImage.appendChild(divNova)

        for (ii = 0; ii < 2; ii++) {

            var divNova = document.createElement("i");
            divNova.id = name[ii]
            divNova.style.position = "absolute"
            divNova.style.top = (SVO.panHeight - SVO.markerHeight) / 2 + "px"
            divNova.style.left = (SVO.panWidth - SVO.markerWidth) / 2 + "px"
            divNova.style.fontSize = "12px"
            divNova.style.color = "red"
            divNova.sheading = Panorama.getPov().heading;
            divNova.spitch = Panorama.getPov().pitch;
            divNova.cPosition = cartesian(Panorama.position.lat(), Panorama.position.lng())
            divNova.classList.add('fa', 'fa-dot-circle-o')
            var conteudoNovo = document.createTextNode(rul[ii]);
            divNova.appendChild(conteudoNovo);

            Panorama.__gm.panes.overlayLayer.appendChild(divNova);
            dragElement(eid(name[ii]));
        }

    }
}

dragElement = function(elmnt) {
    var pos1 = 0
      , pos2 = 0
      , pos3 = 0
      , pos4 = 0;
    if (document.getElementById(elmnt.id)) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id).onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {

        SVO.panWidth = Object.values(pMap.__gm.pixelBounds)[2] - Object.values(pMap.__gm.pixelBounds)[0];
        SVO.panHeight = Object.values(pMap.__gm.pixelBounds)[3] - Object.values(pMap.__gm.pixelBounds)[1];

        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

        var l_pov = pPanorama.getPov();
        var l_zoom = l_pov.zoom;

        // scale according to street view zoom level
        var l_adjustedZoom = 45 / Math.pow(2, 0.85 * (l_zoom - 1));
        //var l_adjustedZoom = 45/Math.pow(2 , (0.86*l_zoom-0.81));

        //var l_adjustedZoom= -0.2468*Math.pow(l_zoom,5)+2.4709*Math.pow(l_zoom,4)
        //-7.9271*Math.pow(l_zoom,3)+9.8120*Math.pow(l_zoom,2)-21.1090*l_zoom+62
        var l_fovAngle = 1 / (Math.tan((l_adjustedZoom) * Math.PI / 180));

        var l_midX = SVO.panWidth / 2;
        var l_midY = SVO.panHeight / 2;

        var l_diffHeading = 2 * (elmnt.offsetLeft - pos1 - l_midX + SVO.markerWidth / 2) / (SVO.panWidth);
        var l_diffPitch = 2 * (elmnt.offsetTop - pos2 - l_midY + SVO.markerHeight / 2) / (SVO.panWidth);

        elmnt.sheading = l_pov.heading + Math.atan(l_diffHeading / l_fovAngle) * 180 / Math.PI;

        elmnt.spitch = l_pov.pitch - Math.atan(l_diffPitch / l_fovAngle) * 180 / Math.PI;

        if (pPanorama.__gm.panes.overlayLayer.children.length > 2) {
            slt = solverH(pPanorama.__gm.panes.overlayLayer.children);

            for (ii = 0; ii < pPanorama.__gm.panes.overlayLayer.children.length / 2; ii++) {
                pPanorama.__gm.panes.overlayLayer.children[2 * ii + 1].innerText = 'Altura [cm]: ' + String(parseFloat(slt[0]).toFixed(1)) + '±' + String(parseFloat(slt[1]).toFixed(1));

                pPanorama.__gm.panes.overlayLayer.children[2 * ii].innerText = 'Base [cm]: ' + String(parseFloat(slt[2]).toFixed(1)) + '±' + String(parseFloat(slt[3]).toFixed(1));
            }
        }

    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;

    }

}

// create the 'marker' (a div containing an image which can be clicked)

m_updateMarker = function(elmnt) {
    SVO.panWidth = Object.values(pMap.__gm.pixelBounds)[2] - Object.values(pMap.__gm.pixelBounds)[0];
    SVO.panHeight = Object.values(pMap.__gm.pixelBounds)[3] - Object.values(pMap.__gm.pixelBounds)[1];

    var l_pov = pPanorama.getPov();
    if (l_pov) {
        var l_zoom = l_pov.zoom;

        // scale according to street view zoom level
        var l_adjustedZoom = 45 / Math.pow(2, 0.85 * (l_zoom - 1));

        //var l_adjustedZoom= -0.2468*Math.pow(l_zoom,5)+2.4709*Math.pow(l_zoom,4)
        //-7.9271*Math.pow(l_zoom,3)+9.8120*Math.pow(l_zoom,2)-21.1090*l_zoom+62

        var l_fovAngle = 1 / (Math.tan((l_adjustedZoom) * Math.PI / 180));

        var l_midX = SVO.panWidth / 2;
        var l_midY = SVO.panHeight / 2;

        var trans = 1;

        var l_diffHeading = (normalizeAngle(l_pov.heading - elmnt.sheading)) * Math.PI / 180;

        var l_diffPitch = (normalizeAngle(l_pov.pitch - elmnt.spitch)) * Math.PI / 180

        l_diffHeading = (l_fovAngle) * (-Math.tan(l_diffHeading));

        l_diffPitch = (l_fovAngle) * (Math.tan(l_diffPitch));

        var x = l_midX + l_diffHeading * (SVO.panWidth) / 2 - SVO.markerWidth / 2;
        var y = l_midY + l_diffPitch * (SVO.panWidth) / 2 - SVO.markerHeight / 2;

        var l_markerDiv = elmnt;

        //l_markerDiv.style.display = "block";
        l_markerDiv.style.left = x + "px";
        l_markerDiv.style.top = y + "px";

        // hide marker when its beyond the maximum distance
        l_markerDiv.style.display = (45 / Math.pow(2, (l_zoom - 1))) > Math.abs(normalizeAngle(l_pov.heading - elmnt.sheading)) ? "block" : "none";

    }
}

// utils
function eid(id) {
    return document.getElementById(id);
}

function normalizeAngle(a) {

    while (a > 180) {
        a -= 360;
    }

    while (a < -180) {
        a += 360;
    }

    return a;
}

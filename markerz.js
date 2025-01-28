// the main application object

adcElemento = function() {
    var Panorama = rPanorama;
    var name = []
    const rul = [" B: Base", "A: Altura"]

    name[0] = Panorama.getPano() + "A"
    name[1] = Panorama.getPano() + "B"

    if (Panorama.__gm.panes.overlayLayer.children[name[1]] == undefined) {
        SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
        SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
        SVO.markerWidth = 18;
        SVO.markerHeight = 18;

        if (Panorama.__gm.panes.overlayLayer.children.length == 0) {
            var divNova = document.createElement("i");
            divNova.id = "centroR"
            divNova.style.position = "absolute"
            divNova.style.top = (SVO.panHeight - SVO.markerWidth) / 2 + "px"
            divNova.style.left = (SVO.panWidth - SVO.markerWidth) / 2 + "px"
            divNova.style.fontSize = SVO.markerWidth + "px"
            divNova.style.color = "red"
            divNova.classList.add('fa', 'fa-plus-circle')

            Panorama.__gm.panes.overlayImage.appendChild(divNova)
        }

        for (ii = 0; ii < 2; ii++) {
            var divNova = document.createElement("i");
            divNova.id = name[ii]
            divNova.style.position = "absolute"
            divNova.style.top = (SVO.panHeight - SVO.markerHeight) / 2 + "px"
            divNova.style.left = (SVO.panWidth - SVO.markerWidth) / 2 + "px"
            divNova.style.fontSize = SVO.markerWidth + "px"
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

        Panorama.addListener('zoom_changed', function() {
            SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
            SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
            if ((this.__gm.panes.overlayLayer.children[this.getPano() + "A"])) {
                m_updateMarker(eid(this.getPano() + "A"), this.getPov())
                m_updateMarker(eid(this.getPano() + "B"), this.getPov())

            }
        });

        Panorama.addListener('pov_changed', function() {
            SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
            SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
            if ((this.__gm.panes.overlayLayer.children[this.getPano() + "A"])) {
                m_updateMarker(eid(this.getPano() + "A"), this.getPov())
                m_updateMarker(eid(this.getPano() + "B"), this.getPov())
            }
        });

        Panorama.addListener('pitch_changed', function() {
            SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
            SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
            if ((this.__gm.panes.overlayLayer.children[this.getPano() + "A"])) {
                m_updateMarker(eid(this.getPano() + "A"), this.getPov())
                m_updateMarker(eid(this.getPano() + "B"), this.getPov())
            }
        });

        Panorama.addListener('pano_changed', function() {
            SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
            SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
            if ((this.__gm.panes.overlayLayer.children[this.getPano() + "A"])) {
                m_updateMarker(eid(this.getPano() + "A"), this.getPov())
                m_updateMarker(eid(this.getPano() + "B"), this.getPov())
            }
            if (this.__gm.panes.overlayLayer.children.length > 0) {
                for (kk = 0; kk < this.__gm.panes.overlayLayer.children.length / 2; kk++) {
                    this.__gm.panes.overlayLayer.children[2 * kk].style.display = this.getPano() + "A" == this.__gm.panes.overlayLayer.children[2 * kk] ? "block" : "none";
                    this.__gm.panes.overlayLayer.children[2 * kk + 1].style.display = this.getPano() + "B" == this.__gm.panes.overlayLayer.children[2 * kk + 1] ? "block" : "none";
                }
            }
        });
    } else {
        Panorama.__gm.panes.overlayLayer.children[name[1]].remove();
        Panorama.__gm.panes.overlayLayer.children[name[0]].remove();
    }
}

adcElementoC = function() {
    var oPanorama = []
    numb = String(rPanorama.__gm.panes.overlayLayer.children.length)
    oPanorama[0] = rPanorama;
    oPanorama[1] = pPanorama;
    SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
    SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
    SVO.markerWidth = 18;
    SVO.markerHeight = 18;

    if (!eid("centroR")) {
        var divNova = document.createElement("i");
        divNova.id = "centroR"
        divNova.style.position = "absolute"
        divNova.style.top = (SVO.panHeight - SVO.markerWidth) / 2 + "px"
        divNova.style.left = (SVO.panWidth - SVO.markerWidth) / 2 + "px"
        divNova.style.fontSize = SVO.markerWidth + "px"
        divNova.style.color = "red"
        divNova.classList.add('fa', 'fa-plus-circle')

        rPanorama.__gm.panes.overlayImage.appendChild(divNova)
        if (!eid("centroP")) {
            var divNova = document.createElement("i");
            divNova.id = "centroP"
            divNova.style.position = "absolute"
            divNova.style.top = (SVO.panHeight - SVO.markerWidth) / 2 + "px"
            divNova.style.left = (SVO.panWidth - SVO.markerWidth) / 2 + "px"
            divNova.style.fontSize = SVO.markerWidth + "px"
            divNova.style.color = "red"
            divNova.classList.add('fa', 'fa-plus-circle')
            pPanorama.__gm.panes.overlayImage.appendChild(divNova)
        }

    } else {
        for (ii = 0; ii < 2; ii++) {

            var rul = []
            Panorama = oPanorama[ii];

            rul[0] = "A" + numb
            rul[1] = "B" + numb
            name = Panorama.getPano() + rul[ii]

            if (ii==0) {
                var divNova = document.createElement("i");
                divNova.id = name + "C"
                divNova.style.position = "absolute"
                divNova.style.top = "50%"
                divNova.style.left = "50%"
                divNova.style.zIndex = "10";
                divNova.style.fontSize = SVO.markerWidth + "px"
                divNova.style.color = "red"
                divNova.classList.add('fa', 'fa-dot-circle-o', 'marker')
                var conteudoNovo = popupOriginal.document.createTextNode("C" + numb);
                divNova.appendChild(conteudoNovo);
                popupOriginal.document.getElementById("image-original").appendChild(divNova);
                dragElement(popupOriginal.document.getElementById(name + "C"), rPanorama.getPov())
            }

            var divNova = document.createElement("i");
            divNova.id = name
            divNova.style.position = "absolute"
            divNova.style.top = (SVO.panHeight - SVO.markerHeight) / 2 + "px"
            divNova.style.left = (SVO.panWidth - SVO.markerWidth) / 2 + "px"
            divNova.style.fontSize = SVO.markerWidth + "px"
            divNova.style.color = "red"
            divNova.sheading = Panorama.getPov().heading;
            divNova.spitch = Panorama.getPov().pitch;
            divNova.cPosition = cartesian(Panorama.position.lat(), Panorama.position.lng())
            divNova.classList.add('fa', 'fa-dot-circle-o')
            var conteudoNovo = document.createTextNode(rul[ii]);
            divNova.appendChild(conteudoNovo);
            Panorama.__gm.panes.overlayLayer.appendChild(divNova);
            dragElement(eid(name), Panorama.getPov());

            Panorama.addListener('zoom_changed', function() {
                SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
                SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
                for (let kk = 0; kk < 2; kk++) {
                    for (let jj = 0; jj <= this.__gm.panes.overlayLayer.children.length; jj++) {

                        numb = String(jj)
                        ru = ["A" + numb, "B" + numb]
                        if ((this.__gm.panes.overlayLayer.children[this.getPano() + ru[kk]])) {
                            m_updateMarker(eid(this.getPano() + ru[kk]), this.getPov())
                        }
                    }
                }
            });

            Panorama.addListener('pov_changed', function() {
                SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
                SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];

                for (let kk = 0; kk < 2; kk++) {
                    for (let jj = 0; jj <= this.__gm.panes.overlayLayer.children.length; jj++) {

                        numb = String(jj)
                        ru = ["A" + numb, "B" + numb]
                        if ((this.__gm.panes.overlayLayer.children[this.getPano() + ru[kk]])) {
                            m_updateMarker(eid(this.getPano() + ru[kk]), this.getPov())
                        }
                    }
                }
            });

            Panorama.addListener('pitch_changed', function() {
                SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
                SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
                for (let kk = 0; kk < 2; kk++) {
                    for (let jj = 0; jj <= this.__gm.panes.overlayLayer.children.length; jj++) {

                        numb = String(jj)
                        ru = ["A" + numb, "B" + numb]
                        if ((this.__gm.panes.overlayLayer.children[this.getPano() + ru[kk]])) {
                            m_updateMarker(eid(this.getPano() + ru[kk]), this.getPov())
                        }
                    }
                }
            });

            Panorama.addListener('pano_changed', function() {
                SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
                SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
                for (let kk = 0; kk < 2; kk++) {
                    for (let jj = 0; jj <= this.__gm.panes.overlayLayer.children.length; jj++) {

                        numb = String(jj)
                        ru = ["A" + numb, "B" + numb]
                        if ((this.__gm.panes.overlayLayer.children[this.getPano() + ru[kk]])) {
                            m_updateMarker(eid(this.getPano() + ru[kk]), this.getPov())
                        }
                    }
                }
                if (this.__gm.panes.overlayLayer.children.length > 0) {
                    for (kk = 0; kk < this.__gm.panes.overlayLayer.children.length / 2; kk++) {
                        this.__gm.panes.overlayLayer.children[2 * kk].style.display = this.getPano() == this.__gm.panes.overlayLayer.children[2 * kk] ? "block" : "none";
                        this.__gm.panes.overlayLayer.children[2 * kk + 1].style.display = this.getPano() == this.__gm.panes.overlayLayer.children[2 * kk + 1] ? "block" : "none";
                    }
                }
            });
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
        popupOriginal.document.getElementById(elmnt.id).onmousedown = dragMouseDown;
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
        if (popupOriginal) {
            popupOriginal.document.onmouseup = closeDragElement;
            popupOriginal.document.onmousemove = elementDrag;
        }

    }

    function elementDrag(e) {
        SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
        SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];

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

        var l_pov

        if (SVO.panWidth > e.clientX) {
            l_pov = rPanorama.getPov()
        } else {
            l_pov = pPanorama.getPov()
        }

        var l_zoom = l_pov.zoom;

        // scale according to street view zoom level
        var l_adjustedZoom = 45 / Math.pow(1.5 + 0.5 * (1 / (1 + Math.exp((-l_zoom + 1) * 3))), 0.85 * (l_zoom - 1));
        //var l_adjustedZoom = 45/Math.pow(2 , (0.86*l_zoom-0.81));

        //var l_adjustedZoom= -0.2468*Math.pow(l_zoom,5)+2.4709*Math.pow(l_zoom,4)
        //-7.9271*Math.pow(l_zoom,3)+9.8120*Math.pow(l_zoom,2)-21.1090*l_zoom+62
        var l_fovAngle = 1 / (Math.tan((l_adjustedZoom) * Math.PI / 180));

        var l_midX = (SVO.panWidth) / 2;
        var l_midY = (SVO.panHeight) / 2;

        var l_diffHeading = 2 * (elmnt.offsetLeft - pos1 - l_midX + SVO.markerWidth / 2) / (SVO.panWidth);
        var l_diffPitch = 2 * (elmnt.offsetTop - pos2 - l_midY + SVO.markerHeight / 2) / (SVO.panWidth);

        elmnt.sheading = l_pov.heading + Math.atan(l_diffHeading / l_fovAngle) * 180 / Math.PI;
        elmnt.spitch = l_pov.pitch - Math.atan(l_diffPitch / l_fovAngle) * 180 / Math.PI;

        if (rPanorama.__gm.panes.overlayLayer.children.length > 2 && !popupOriginal) {
            slt = solverH(rPanorama.__gm.panes.overlayLayer.children);
            for (ii = 0; ii < rPanorama.__gm.panes.overlayLayer.children.length / 2; ii++) {
                rPanorama.__gm.panes.overlayLayer.children[2 * ii].innerText = '0 [cm] ';
                rPanorama.__gm.panes.overlayLayer.children[2 * ii + 1].innerText = '\n Altura: ' + String(parseFloat(slt[0]).toFixed(1)) + ' (σ=' + String(parseFloat(slt[1]).toFixed(1)) + ')'
                //+
                //   '\n Afastamento: ' + String(parseFloat(slt[2]).toFixed(1)) + ' (σ=' + String(parseFloat(slt[3]).toFixed(1))+')' +
                //     ' \n Distância: ' + String(parseFloat(slt[4]).toFixed(1)) + ' (σ=' + String(parseFloat(slt[5]).toFixed(1))+')';
                if (slt[2].toFixed(1) == 0) {
                    rPanorama.__gm.panes.overlayLayer.children[2 * ii + 1].innerText = '\n Altura: ' + String(parseFloat(slt[0]).toFixed(1)) + ' (σ=' + String(parseFloat(slt[1]).toFixed(1)) + ')'
                } else {
                    rPanorama.__gm.panes.overlayLayer.children[2 * ii + 1].innerText = '\n Altura: ' + String(parseFloat(slt[0]).toFixed(1)) + ' (σ=' + String(parseFloat(slt[1]).toFixed(1)) + ')' + '\n Afastamento: ' + String(parseFloat(slt[2]).toFixed(1)) + ' (σ=' + String(parseFloat(slt[3]).toFixed(1)) + ')' + ' \n Distância: ' + String(parseFloat(slt[4]).toFixed(1)) + ' (σ=' + String(parseFloat(slt[5]).toFixed(1)) + ')';
                }
            }
        }else{


           console.log(solverP(rPanorama.__gm.panes.overlayLayer.children[0],pPanorama.__gm.panes.overlayLayer.children[0]))
        }
    }
    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
        if (popupOriginal) {
            popupOriginal.document.onmouseup = null;
            popupOriginal.document.onmousemove = null;
        }
    }
}

// create the 'marker' (a div containing an image which can be clicked)

m_updateMarker = function(elmnt, l_pov) {
    SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
    SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];

    if (l_pov) {
        var l_zoom = l_pov.zoom;

        // scale according to street view zoom level
        var l_adjustedZoom = 45 / Math.pow(1.5 + 0.5 * (1 / (1 + Math.exp((-l_zoom + 1) * 3))), 0.85 * (l_zoom - 1));

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

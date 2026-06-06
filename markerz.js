// the main application object
adcElemento = function () {
    var Panorama = rPanorama;
    var Name = []
    const rul = ["--", "0 [cm]"]

    Name[0] = JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) +
        Panorama.getPano() + "A"
    Name[1] = JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) +
        Panorama.getPano() + "B"

    if (Panorama.__gm.panes.overlayLayer.children[Name[1]] == undefined || Math.abs(Panorama.__gm.panes.overlayLayer.children.length % 2) == 1) {

        SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
        SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
        SVO.markerWidth = 18    ;
        SVO.markerHeight = SVO.markerWidth;

        if (Panorama.__gm.panes.overlayLayer.children[Name[0]] == undefined) {
            ii = 0
            Dates.add(JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11))

        }
        if (Panorama.__gm.panes.overlayLayer.children[Name[1]] == undefined) { ii = 1 }


        var divNova = document.createElement("i");
        divNova.id = Name[ii]
        divNova.style.position = "absolute"
        divNova.style.top = SVO.panHeight/2 - SVO.markerHeight/1.9 +"px"
        divNova.style.left = SVO.panWidth/2 - SVO.markerWidth/2.2  + "px"
        divNova.style.fontSize = SVO.markerWidth + "px"
        divNova.style.color = "red"
        divNova.style.filter = "drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.8))";
        divNova.style.fontWeight = "bold"

        divNova.sheading = Panorama.getPov().heading;
        divNova.spitch = Panorama.getPov().pitch;
        divNova.cPosition = cartesian(Panorama.position.lat(), Panorama.position.lng())
        divNova.pano=Panorama.getPano()
        divNova.classList.add('fa', 'fa-dot-circle-o')
        var conteudoNovo = document.createTextNode(rul[ii]);
        divNova.appendChild(conteudoNovo);
        Panorama.__gm.panes.overlayLayer.appendChild(divNova);
        dragElement(eid(Name[ii]));


        Panorama.addListener('pov_changed', function () {
            SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
            SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
            var neime = JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) +
                this.getPano()

            if ((this.__gm.panes.overlayLayer.children[neime + "A"])) {
                m_updateMarker(eid(neime + "A"), this.getPov())
            }
            if ((this.__gm.panes.overlayLayer.children[neime + "B"])) {
                m_updateMarker(eid(neime + "B"), this.getPov())
            }
        });

        Panorama.addListener('pano_changed', function () {
            let ii
            SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
            SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
            var neime = JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) +
                this.getPano()

            if ((this.__gm.panes.overlayLayer.children[neime + "A"])) {
                m_updateMarker(eid(neime + "A"), this.getPov())
            }
            if ((this.__gm.panes.overlayLayer.children[neime + "B"])) {
                m_updateMarker(eid(neime + "B"), this.getPov())
            }
            if (this.__gm.panes.overlayLayer.children.length > 0) {
                for (kk = 0; kk < this.__gm.panes.overlayLayer.children.length / 2; kk++) {
                    this.__gm.panes.overlayLayer.children[2 * kk].style.display = neime + "A" ==
                        this.__gm.panes.overlayLayer.children[2 * kk] ? "block" : "none";
                    this.__gm.panes.overlayLayer.children[2 * kk + 1].style.display = neime + "B" ==
                        this.__gm.panes.overlayLayer.children[2 * kk + 1] ? "block" : "none";
                }
            }
        });
    } else {
        Panorama.__gm.panes.overlayLayer.children[Name[1]].remove();
        Panorama.__gm.panes.overlayLayer.children[Name[0]].remove();
    }
    if (rPanorama.__gm.panes.overlayLayer.children.length > 2 && !popupOriginal && Math.abs(rPanorama.__gm.panes.overlayLayer.children.length % 2) == 0) {
        slt = solverH(rPanorama.__gm.panes.overlayLayer.children);
        for (ii = 0; ii < rPanorama.__gm.panes.overlayLayer.children.length / 2; ii++) {
            if (rPanorama.__gm.panes.overlayLayer.children[2 * ii].id.split("&").length == 1) {
                rPanorama.__gm.panes.overlayLayer.children[2 * ii].innerText = '0 [cm] ';

                rPanorama.__gm.panes.overlayLayer.children[2 * ii + 1].innerText = '\n z: ' + String(parseFloat(slt[0]).toFixed(1)) + ' (σ=' + String(parseFloat(slt[1]).toFixed(1)) + ')' + '\n r: ' + String(parseFloat(slt[2]).toFixed(1)) + ' (σ=' + String(parseFloat(slt[3]).toFixed(1)) + ')' + ' \n √(z²+r²): ' + String(parseFloat(slt[4]).toFixed(1)) + ' (σ=' + String(parseFloat(slt[5]).toFixed(1)) + ')';
            }
        }
    }
}

adcElementoP = function () {

    var oPanorama = []
    numb = String(popupOriginal.document.all.length - 8)

    oPanorama[0] = rPanorama;
    oPanorama[1] = pPanorama;

    SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
    SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
    SVO.markerWidth = 15;
    SVO.markerHeight = 15;

    if (!eid("centroR")) {

    }

    NameQ = combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano())

    numbL = countElementsByIdPrefix(popupOriginal.document, NameQ);

    var divNova = document.createElement("i");
    divNova.id = NameQ + "Q" + numb;
    divNova.IDz = NameQ
    divNova.IDs = numb;
    divNova.style.position = "absolute"
    divNova.style.top = "50%"
    divNova.style.left = "50%"
    divNova.style.zIndex = "10";
    divNova.style.fontSize = Math.round(popupOriginal.document.getElementById("image-original").children.image.height / (5*SVO.markerHeight)) + "px"
    divNova.style.color = "red"
    divNova.style.filter = "drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.8))";
    divNova.style.fontWeight = "bold"

    divNova.classList.add('fa', 'fa-dot-circle-o', 'marker')
    divNova.onclick = function () {
        const id = this.id;
        window._marcadoresPContagem[id] = (window._marcadoresPContagem[id] || 0) + 1;

        // Adiciona marcador se ainda não está na lista
        if (!window._marcadoresPSelecionados.includes(this)) {
            window._marcadoresPSelecionados.push(this);
        }

        // Se dois marcadores diferentes foram clicados duas vezes cada
        if (
            window._marcadoresPSelecionados.length === 2 &&
            window._marcadoresPContagem[window._marcadoresPSelecionados[0].id] >= 2 &&
            window._marcadoresPContagem[window._marcadoresPSelecionados[1].id] >= 2
        ) {
            desenhaRetaEntreMarcadoresP(window._marcadoresPSelecionados[0], window._marcadoresPSelecionados[1]);
            // Adiciona listeners para atualizar a linha ao mover os marcadores
            window._marcadoresPSelecionados.forEach(marker => {
                marker._updateLineP = function () {
                    desenhaRetaEntreMarcadoresP(window._marcadoresPSelecionados[0], window._marcadoresPSelecionados[1]);
                };
                marker.addEventListener('mouseup', marker._updateLineP);
            });
            // Limpa seleção para novo par
            window._marcadoresPSelecionados = [];
            window._marcadoresPContagem = {};
        }
    };

    var conteudoNovo = popupOriginal.document.createTextNode("Q" + numbL);
    divNova.appendChild(conteudoNovo);
    popupOriginal.document.getElementById("image-original").appendChild(divNova);
    dragElement(popupOriginal.document.getElementById(NameQ + "Q" + numb), rPanorama.getPov())

    for (ii = 0; ii < 2; ii++) {

        var Panorama = oPanorama[ii];
        var rul = "P" + numb
        Name = Panorama.getPano() + rul

        var divNova = document.createElement("i");
        divNova.id = Name
        divNova.style.position = "absolute"
        divNova.style.top = (SVO.panHeight) / 2 - (SVO.markerHeight) / 1.9 + "px"
        divNova.style.left = (SVO.panWidth) / 2 - (SVO.markerWidth) / 2.2 + "px"
        divNova.style.fontSize = SVO.markerWidth + "px"
        divNova.style.color = "red"

        divNova.style.filter = "drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.8))";

        divNova.sheading = Panorama.getPov().heading;
        divNova.spitch = Panorama.getPov().pitch;
        // divNova.cPosition = cartesian(Panorama.position.lat(), Panorama.position.lng())

        divNova.gPosition = Panorama.position
        divNova.pano = Panorama.pano
        //divNova.day = JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11)


        divNova.classList.add('fa', 'fa-dot-circle-o')
        var conteudoNovo = document.createTextNode("P" + numbL);
        divNova.appendChild(conteudoNovo);
        Panorama.__gm.panes.overlayLayer.appendChild(divNova);

        dragElement(eid(Name), Panorama.getPov());

        if (numb == 0) {
            Panorama.addListener('pov_changed', function () {
                const self = this;
                setTimeout(() => {
                    SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
                    SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];

                    for (let jj = 0; jj <= this.__gm.panes.overlayLayer.children.length; jj++) {

                        numb = String(jj)
                        ru = ["P" + numb]
                        if ((this.__gm.panes.overlayLayer.children[this.getPano() + ru]) &&
                            popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + String(jj)]) {
                            m_updateMarker(eid(this.getPano() + ru), this.getPov())
                        }
                    }
                }, 50);
            });


            Panorama.addListener('pano_changed', function () {
                const self = this;
                setTimeout(() => {
                    SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
                    SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];

                    for (kk = 0; kk < rPanorama.__gm.panes.overlayLayer.children.length; kk++) {
                        if (rPanorama.__gm.panes.overlayLayer.children[kk]) {
                            rPanorama.__gm.panes.overlayLayer.children[kk].style.display = "none";
                        }
                    }
                    for (kk = 0; kk < pPanorama.__gm.panes.overlayLayer.children.length; kk++) {
                        if (pPanorama.__gm.panes.overlayLayer.children[kk]) {
                            pPanorama.__gm.panes.overlayLayer.children[kk].style.display = "none";
                        }
                    }


                    for (kk = 0; kk < popupOriginal.document.all.length - 8 - 2 * window._marcadoresPLinhasCount; kk++) {

                        numb = String(kk)
                        ru = ["P" + numb]
                        if (rPanorama.__gm.panes.overlayLayer.children[kk]) {
                            rPanorama.__gm.panes.overlayLayer.children[kk].style.display = "none";
                        }
                        if (pPanorama.__gm.panes.overlayLayer.children[kk]) {
                            pPanorama.__gm.panes.overlayLayer.children[kk].style.display = "none";
                        }

                        if (rPanorama.__gm.panes.overlayLayer.children[this.getPano() + ru]) {
                            this.__gm.panes.overlayLayer.appendChild(rPanorama.__gm.panes.overlayLayer.children[this.getPano() + ru])
                        }
                        if (pPanorama.__gm.panes.overlayLayer.children[this.getPano() + ru]) {
                            this.__gm.panes.overlayLayer.appendChild(pPanorama.__gm.panes.overlayLayer.children[this.getPano() + ru])
                        }


                        if (popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + String(kk)]) {
                            popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + String(kk)].style.display = "block";
                            if (this.__gm.panes.overlayLayer.children[this.getPano() + ru]) {

                                this.__gm.panes.overlayLayer.children[this.getPano() + ru].style.display = "block";
                                m_updateMarker(eid(this.getPano() + ru), this.getPov())
                            }
                        } else {
                            popupOriginal.document.all[8 + kk].style.display = "none";
                        }


                        //  this.__gm.panes.overlayLayer.children[kk].style.display = this.getPano() ==
                        //    this.__gm.panes.overlayLayer.children[2 * kk] ? "block" : "none";
                    }
                }, 50);
            });

        }
    }
    if (popupOriginal) {
        solverP()
    }
}

adcElementoC = function () {
    var oPanorama = []
    numb = String(rPanorama.__gm.panes.overlayLayer.children.length +
        pPanorama.__gm.panes.overlayLayer.children.length)

    oPanorama[0] = rPanorama;
    oPanorama[1] = pPanorama;

    SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
    SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];
    SVO.markerWidth = 15;
    SVO.markerHeight = 15;

    numbL = countElementsByIdPrefix(document, [rPanorama.getPano() + "&" + pPanorama.getPano()]) / 2;
    var AB = []
    AB[0] = ""
    const inputElement = document.getElementById("distance-value");

    AB[1] = "(" + (inputElement ? inputElement.value : "0") + " cm)"
    for (ii = 0; ii < 2; ii++) {
        var Panorama = oPanorama[ii];
        if (ii == 0) {
            NameQ = [rPanorama.getPano() + "&" + pPanorama.getPano()]
        } else {
            NameQ = [pPanorama.getPano() + "&" + rPanorama.getPano()]
        }

        for (jj = 0; jj < 2; jj++) {

            if (inputElement.value.length == 0 || inputElement.value === "0") {
                if (numbL > 0) {
                    Name = NameQ + "C" + String(2 * (Number(numbL) - 1) + jj)
                    Panorama.__gm.panes.overlayLayer.children[Name].remove();
                    if (rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "B"] &&
                        rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "B"]) {
                        rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "A"].cPosition =
                         cartesian(rPanorama.position.lat(), rPanorama.position.lng());
                        rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "B"].cPosition = 
                         cartesian(rPanorama.position.lat(), rPanorama.position.lng());
                        rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "A"].cPosition = 
                         cartesian(pPanorama.position.lat(), pPanorama.position.lng());
                        rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "B"].cPosition = 
                         cartesian(pPanorama.position.lat(), pPanorama.position.lng());
                    }
                }
            } else {

                var rul = "C" + numbL + AB[jj]
                Name = NameQ + "C" + String(2 * Number(numbL) + jj)
                var divNova = document.createElement("i");
                divNova.id = Name
                divNova.IDs = rul;
                divNova.style.position = "absolute"
                divNova.style.top = (SVO.panHeight - SVO.markerHeight) / 2 + "px"
                divNova.style.left = ((SVO.panWidth - SVO.markerWidth) / 2 - 50 + jj * 100) + "px"
                divNova.style.fontSize = SVO.markerWidth + "px"
                divNova.style.color = "red"
                divNova.style.filter = "drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.8))";
        divNova.style.fontWeight = "bold"


                divNova.sheading = Panorama.getPov().heading;
                divNova.spitch = Panorama.getPov().pitch;
                // divNova.cPosition = cartesian(Panorama.position.lat(), Panorama.position.lng())

                divNova.gPosition = Panorama.position
                divNova.pano = Panorama.pano
                divNova.reference = inputElement ? inputElement.value : "0"
                //divNova.day = JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11)


                divNova.classList.add('fa', 'fa-dot-circle-o')
                var conteudoNovo = document.createTextNode(rul);
                divNova.appendChild(conteudoNovo);
                Panorama.__gm.panes.overlayLayer.appendChild(divNova);

                dragElement(eid(Name), Panorama.getPov());
            }
            if (numbL == 0) {
                Panorama.addListener('pov_changed', function () {
                    const self = this;
                    setTimeout(() => {
                        SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
                        SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];

                        for (let jj = 0; jj <= this.__gm.panes.overlayLayer.children.length; jj++) {
                            ru = ["C" + String(jj)]
                            if ((this.__gm.panes.overlayLayer.children[this.getPano() + "&" + rPanorama.getPano() + ru])) {
                                m_updateMarker(eid(this.getPano() + "&" + rPanorama.getPano() + ru), this.getPov())
                            }
                            if ((this.__gm.panes.overlayLayer.children[this.getPano() + "&" + pPanorama.getPano() + ru])) {
                                m_updateMarker(eid(this.getPano() + "&" + pPanorama.getPano() + ru), this.getPov())
                            }
                        }
                    }, 1);
                });


                Panorama.addListener('pano_changed', function () {
                    const self = this;
                    setTimeout(() => {
                        SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
                        SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];

                        for (kk = 0; kk < rPanorama.__gm.panes.overlayLayer.children.length; kk++) {
                            if (rPanorama.__gm.panes.overlayLayer.children[kk]) {
                                rPanorama.__gm.panes.overlayLayer.children[kk].style.display = "none";
                            }
                        }
                        for (kk = 0; kk < pPanorama.__gm.panes.overlayLayer.children.length; kk++) {
                            if (pPanorama.__gm.panes.overlayLayer.children[kk]) {
                                pPanorama.__gm.panes.overlayLayer.children[kk].style.display = "none";
                            }
                        }
                        nb = String(rPanorama.__gm.panes.overlayLayer.children.length +
                            pPanorama.__gm.panes.overlayLayer.children.length)


                        for (kk = 0; kk < nb; kk++) {
                            ru = ["C" + String(kk)]
                            if (rPanorama.__gm.panes.overlayLayer.children[kk]) {
                                rPanorama.__gm.panes.overlayLayer.children[kk].style.display = "none";
                            }
                            if (pPanorama.__gm.panes.overlayLayer.children[kk]) {
                                pPanorama.__gm.panes.overlayLayer.children[kk].style.display = "none";
                            }

                            if (rPanorama.__gm.panes.overlayLayer.children[this.getPano() + "&" + rPanorama.getPano() + ru]) {
                                this.__gm.panes.overlayLayer.appendChild(rPanorama.__gm.panes.overlayLayer.children[this.getPano() + "&" + rPanorama.getPano() + ru])
                                this.__gm.panes.overlayLayer.children[this.getPano() + "&" + rPanorama.getPano() + ru].style.display = "block";
                                m_updateMarker(eid(this.getPano() + "&" + rPanorama.getPano() + ru), this.getPov())

                            }
                            if (pPanorama.__gm.panes.overlayLayer.children[this.getPano() + "&" + pPanorama.getPano() + ru]) {
                                this.__gm.panes.overlayLayer.appendChild(pPanorama.__gm.panes.overlayLayer.children[this.getPano() + "&" + pPanorama.getPano() + ru])
                                this.__gm.panes.overlayLayer.children[this.getPano() + "&" + pPanorama.getPano() + ru].style.display = "block";
                                m_updateMarker(eid(this.getPano() + "&" + pPanorama.getPano() + ru), this.getPov())
                            }
                        }
                    }, 1);
                });
            }
        }

    }
}

dragElement = function (elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    if (document.getElementById(elmnt.id)) {
        document.getElementById(elmnt.id).onmousedown = dragMouseDown;
    } else {
        popupOriginal.document.getElementById(elmnt.id).onmousedown = dragMouseDown;
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
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

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

        var l_pov = (SVO.panWidth > e.clientX) ? rPanorama.getPov() : pPanorama.getPov();
        var l_zoom = l_pov.zoom;

        var l_fovAngle = l_zoom === 0 ? 0.475 : Math.pow(2, l_zoom - 1);

        var l_midX = SVO.panWidth / 2;
        var l_midY = SVO.panHeight / 2;

        // Posição atual do marcador na tela (o que o usuário arrastou)
        var targetX = elmnt.offsetLeft - pos1;
        var targetY = elmnt.offsetTop - pos2;

        // Função de custo: m_updateMarker produz (x,y) a partir de (sheading, spitch)
        // queremos que produza exatamente (targetX, targetY)
        function cost(v) {
            var sheading = v[0];
            var spitch = v[1];

            var θ_P = sheading * Math.PI / 180;
            var γ_P = spitch * Math.PI / 180;
            var θ_0 = l_pov.heading * Math.PI / 180;
            var γ_0 = l_pov.pitch * Math.PI / 180;

            var dθ = θ_P - θ_0;

            var cos_γ0 = Math.cos(γ_0), sin_γ0 = Math.sin(γ_0);
            var cos_γP = Math.cos(γ_P), sin_γP = Math.sin(γ_P);
            var cos_dθ = Math.cos(dθ), sin_dθ = Math.sin(dθ);

            var Sx = cos_γP * sin_dθ;
            var Sy = cos_γ0 * cos_γP * cos_dθ + sin_γ0 * sin_γP;
            var Sz = cos_γ0 * sin_γP - sin_γ0 * cos_γP * cos_dθ;

            if (Sy <= 0) return 1e10;

            var proj_x = Sx / Sy;
            var proj_y = Sz / Sy;

            // Idêntico ao m_updateMarker
            var x = l_midX + l_fovAngle * proj_x * l_midX - SVO.markerWidth / 2.2;
            var y = l_midY - l_fovAngle * proj_y * l_midX - SVO.markerHeight / 1.9;

            var dx = targetX - x;
            var dy = targetY - y;
            return dx * dx + dy * dy;
        }

        // Chute inicial: ângulos atuais do marcador
        var h_init = elmnt.sheading || l_pov.heading;
        var p_init = elmnt.spitch || l_pov.pitch;

        var result = numeric.uncmin(cost, [h_init, p_init]);

        elmnt.sheading = result.solution[0];
        elmnt.spitch = result.solution[1];


        if (rPanorama.__gm.panes.overlayLayer.children.length > 2 && !popupOriginal &&
            Math.abs(rPanorama.__gm.panes.overlayLayer.children.length % 2) == 0) {
            slt = solverH(rPanorama.__gm.panes.overlayLayer.children);
            for (ii = 0; ii < rPanorama.__gm.panes.overlayLayer.children.length / 2; ii++) {
                if (rPanorama.__gm.panes.overlayLayer.children[2 * ii].id.split("&").length == 1) {
                    rPanorama.__gm.panes.overlayLayer.children[2 * ii].innerText = '0 [cm] ';
                    rPanorama.__gm.panes.overlayLayer.children[2 * ii + 1].innerText =
                        '\n z: ' + parseFloat(slt[0]).toFixed(1) +
                        ' (σ=' + parseFloat(slt[1]).toFixed(1) + ')' +
                        '\n r: ' + parseFloat(slt[2]).toFixed(1) +
                        ' (σ=' + parseFloat(slt[3]).toFixed(1) + ')' +
                        ' \n √(z²+r²): ' + parseFloat(slt[4]).toFixed(1) +
                        ' (σ=' + parseFloat(slt[5]).toFixed(1) + ')';
                }
            }
        }
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        if (popupOriginal) {
            popupOriginal.document.onmouseup = null;
            popupOriginal.document.onmousemove = null;
            solverP();
        } else {
            solverC()
        }
    }
}

// create the 'marker' (a div containing an image which can be clicked)

m_updateMarker = function (elmnt, l_pov) {
    SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
    SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];

    if (!l_pov) return;

    var l_zoom = l_pov.zoom;

    var l_fovAngle = l_zoom === 0 ? 0.475 : Math.pow(2, l_zoom - 1);

    var l_midX = SVO.panWidth / 2;
    var l_midY = SVO.panHeight / 2;

    var θ_P = elmnt.sheading * Math.PI / 180;
    var γ_P = elmnt.spitch * Math.PI / 180;
    var θ_0 = l_pov.heading * Math.PI / 180;
    var γ_0 = l_pov.pitch * Math.PI / 180;

    var dθ = θ_P - θ_0;

    var cos_γ0 = Math.cos(γ_0), sin_γ0 = Math.sin(γ_0);
    var cos_γP = Math.cos(γ_P), sin_γP = Math.sin(γ_P);
    var cos_dθ = Math.cos(dθ), sin_dθ = Math.sin(dθ);

    // Componentes após rotação inversa da câmera
    var Sx = cos_γP * sin_dθ;
    var Sy = cos_γ0 * cos_γP * cos_dθ + sin_γ0 * sin_γP;  // profundidade
    var Sz = cos_γ0 * sin_γP - sin_γ0 * cos_γP * cos_dθ;

    // Ponto atrás da câmera
    if (Sy <= 0) {
        elmnt.style.display = "none";
        return;
    }

    // Projeção perspectiva completa
    var proj_x = Sx / Sy;
    var proj_y = Sz / Sy;

    var x = l_midX + l_fovAngle * proj_x * l_midX - SVO.markerWidth / 2.2;
    var y = l_midY - l_fovAngle * proj_y * l_midX - SVO.markerHeight / 1.9;

    elmnt.style.left = x + "px";
    elmnt.style.top = y + "px";
    elmnt.style.display = "block";
};

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

function combineStringsCommutative(str1, str2) {
    // Ordena as strings alfabeticamente para garantir que a ordem não importe
    const sorted = [str1, str2].sort();
    return sorted.join("&");
}

function countElementsByIdPrefix(container, prefix) {
    let count = 0;
    for (let i = 0; i < container.all.length; i++) {
        if (container.all[i].id && container.all[i].id.startsWith(prefix)) {
            count++;
        }
    }
    return count;
}

function splitStringsCommutative(combinedStr) {
    const parts = combinedStr.split("&");
    if (parts.length !== 2) {
        throw new Error("Formato inválido para splitStringsCommutative");
    }
    // Retorna as duas strings em ordem alfabética (como estavam na combinação)
    return { str1: parts[0], str2: parts[1] };
}

// Inicialize o array global para as linhas, se ainda não existir
if (!window._marcadoresPLinhasCount) window._marcadoresPLinhasCount = 0;

function desenhaRetaEntreMarcadoresP(m1, m2) {

    // Se já existe, não cria outro
    if (popupOriginal.document.getElementById(combineStringsCommutative(String(m1.IDs), String(m2.IDs))) == undefined) {
        const segmentId = combineStringsCommutative(String(m1.IDs), String(m2.IDs));
        const overlayLayer = m1.parentNode;
        const x1 = parseFloat(m1.style.left) + SVO.markerWidth / 4 - 1;
        const y1 = parseFloat(m1.style.top) + SVO.markerHeight / 4 - 1;
        const x2 = parseFloat(m2.style.left) + SVO.markerWidth / 4 - 1;
        const y2 = parseFloat(m2.style.top) + SVO.markerHeight / 4 - 1;

        const svgNS = "http://www.w3.org/2000/svg";
        let svg = document.createElementNS(svgNS, "svg");
        svg.id = segmentId;
        svg.classList.add("markerP-connection-line");
        svg.style.position = "absolute";
        svg.style.left = "0";
        svg.style.top = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.pointerEvents = "none";
        svg.style.zIndex = "1000";

        let line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "blue");
        line.setAttribute("stroke-width", "2");

        svg.appendChild(line);
        overlayLayer.appendChild(svg);

        // Calcule o centro da linha
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        // Crie o input com id único
        let input = document.createElement("input");
        input.type = "text";
        //input.value = "0";
        //input.id = segmentId + "-input";
        input.style.position = "absolute";
        input.style.left = (centerX - SVO.markerWidth / 2) + "px";
        input.style.top = (centerY - SVO.markerHeight / 2) + "px";
        input.style.width = 1.5 * SVO.markerWidth + "px";
        input.style.height = SVO.markerHeight + "px";
        input.style.fontSize = SVO.markerWidth / 2 + "px";
        input.style.zIndex = "1100";
        input.style.MozAppearance = "textfield";
        input.style.appearance = "textfield";
        input.style.WebkitAppearance = "none";
        input.style.textAlign = "center";

        overlayLayer.appendChild(input);

        // Atualize a posição do input ao mover os marcadores
        function updateInputPosition() {
            const nx1 = parseFloat(m1.style.left) + SVO.markerWidth / 4 - 1;
            const ny1 = parseFloat(m1.style.top) + SVO.markerHeight / 4 - 1;
            const nx2 = parseFloat(m2.style.left) + SVO.markerWidth / 4 - 1;
            const ny2 = parseFloat(m2.style.top) + SVO.markerHeight / 4 - 1;
            input.style.left = ((nx1 + nx2) / 2 - SVO.markerWidth / 2) + "px";
            input.style.top = ((ny1 + ny2) / 2 - SVO.markerHeight / 2) + "px";
            line.setAttribute("x1", nx1);
            line.setAttribute("y1", ny1);
            line.setAttribute("x2", nx2);
            line.setAttribute("y2", ny2);
        }
        m1.addEventListener('mouseup', updateInputPosition);
        m2.addEventListener('mouseup', updateInputPosition);

        // Após overlayLayer.appendChild(input);
        window._marcadoresPLinhasCount++;
    }
}
var rPanorama;
var pPanorama;
var meusPontos;
var indice;
var dados = [];
var act;
var Data = [];
var DatA = [];
var CheckPoints = [];
var pCheckPoints = [];
var ntimes = [];
var rPanoramas;
var pPanoramas;
var CheckPano = [];
var Markers = [];
var aux = [];
var rMap;
var json = [];
var sv;
var pntimes = [];
var markerPanoID = [];
const Dates = new Set()
var psize = 0;
var State = new Array(2);
var Calibration = new Array();
let popupOriginal
let popupDoc
let loca
var pTimes = [];
var plinks = 0
var altern = 0;

// Variáveis globais para seleção e linha dos marcadores P
window._marcadoresPSelecionados = [];
window._marcadoresPContagem = {};
window._marcadoresPLinha = null;
window._marcadoresPLinhasCount = 0;
// Inicialize a variável global no início do seu script
//let elevator

let zoomUpdateTimeout = null;

let lastUpdate = 0;

var SVO = new Object;

var astorPlace = {
    lat: -22.90799,
    lng: -43.182550
};

async function initMap() {
    // Set up the map

    const { Map } = await google.maps.importLibrary("maps");
    const { PlacesService } = await google.maps.importLibrary("places");
    const { encoding } = await google.maps.importLibrary("geometry");

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    rMap = new Map(document.getElementById('rMap'), {
        center: astorPlace,
        zoom: 19,
        //MapId:'8e94d9d2a45feb08',
        mapTypeId: "hybrid",
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: false,
        scaleControl: true,
        zoomControl: false,
        styles: [{
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{
                visibility: 'off'
            }]
        }, {
            featureType: 'poi',
            stylers: [{
                visibility: 'off'
            }]
        }, {
            featureType: 'road',
            stylers: [{
                visibility: 'on'
            }]
        },]
    });
    document.getElementById('rMap').style.width = '100%'

    //  const advancedMarker = new AdvancedMarkerElement({
    //map: rMap,
    //    position: astorPlace2,
    //    title: "Astor Place"
    // });

    pMap = new Map(document.getElementById('pMap'), {
        center: astorPlace,
        zoom: 19,
        mapTypeId: "hybrid",
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: false,
        zoomControl: false,
        styles: [{
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{
                visibility: 'off'
            }]
        }, {
            featureType: 'poi',
            stylers: [{
                visibility: 'off'
            }]
        }, {
            featureType: 'road',
            stylers: [{
                visibility: 'on'
            }]
        },]

    });

    rMap.data.setStyle(function (feature) {
        if (feature.getProperty('radius') && feature.getGeometry().getType() === 'Point') {
            return {
                visible: false
            };
        }
        return {};
    });

    rMap.setTilt(0)

    sv = new google.maps.StreetViewService();

    rMap.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('files'));
    rMap.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(document.getElementById('floating-Load'));
    rMap.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(document.getElementById('floating-download'));
    //pMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('file_input'));

    meusPontos = [];
    indice = 0;

    // We get the map's default rPanorama and set up some defaults.
    // Note that we don't yet set it visible.
    rPanorama = rMap.getStreetView();
    rPanorama.setOptions({
        disableDefaultUI: true,
        linksControl: true,
        panControl: false,
        clickToGo: false,
        enableCloseButton: true,
        imageDateControl: true,
        disableKeyboardShortcuts: true,
        zoomControlOptions: false,
        zoomControl: false,
        motionTracking: false,
        motionTrackingControl: false,
        twoWayTouchControls: false
    });
    rPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('floating-Down'))
    rPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('floating-Up'))
    rPanorama.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('floating-alternate'))
    rPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('floating-Date'))
    rPanorama.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('file_txt_container'));
    rPanorama.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('floating-ruler2'));
    rPanorama.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('floating-twoScreens1'));

    // 2. Cria o elemento HTML da cruz guia

    rPanorama.controls[google.maps.ControlPosition.CENTER].push(document.getElementById("minha-cruz-guia1"));

    rPanorama.setVisible(true)
    rPanorama.setVisible(false)

    pPanorama = pMap.getStreetView()
    pPanorama.setOptions({
        linksControl: true,
        panControl: false,
        clickToGo: false,
        disableDefaultUI: true,
        enableCloseButton: false,
        imageDateControl: true,
        disableDefaultUI: true,
        zoomControlOptions: true,
        zoomOptions: false,
        motionTracking: false,
        motionTrackingControl: false,
        // Opcional: Impede que gestos de toque específicos ativem o movimento do sensor
        twoWayTouchControls: false
    });
    // pPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('floating-point'));

    pPanorama.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('file_txt_container'));
    pPanorama.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('download-btn'));
    pPanorama.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('input-points'));
    pPanorama.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('file_input_container'));
    // pPanorama.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('floating-point2'));
    // pPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('input-match'));
    pPanorama.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('floating-rulerC'));

    pPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('floating-pairC'));

    pPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('input-pair'));

    pPanorama.controls[google.maps.ControlPosition.CENTER].push(document.getElementById("minha-cruz-guia2"));

    //pPanorama.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('floating-twoScreens2'));

    pPanorama.setVisible(true)
    pPanorama.setVisible(false)

    rPanorama.addListener('visible_changed', function () {
        const self = this;

        setTimeout(() => {
            if (!this.getVisible()) {
                setMapOnAll(rMap, CheckPoints);
                document.getElementById('rMap').style.width = '100%'
                document.getElementById('pMap').style.display = 'none'

            } else {
                setMapOnAll(null, CheckPoints);
            }
        }
            , 50);
    });

    pPanorama.addListener('visible_changed', function () {
        if (!pPanorama.getVisible()) {
            for (ii = 0; ii < pTimes.length; ii++) {
                setMapOnAll(pMap, pCheckPoints[CheckPano[pTimes[ii]]])
            }
        } else {
            setMapOnAll(null, pCheckPoints)
        }
    });

    rPanorama.addListener("position_changed", function () {
        const self = this;
        setTimeout(() => {
            if (this.location) {

                if (markerPanoID != this.getPano()) {
                    markerPanoID = this.getPano()
                    sv.getPanorama({
                        pano: this.getPano()
                    }, rPanoSetting);
                }
            }
        }
            , 1000);
    });

    pPanorama.addListener("position_changed", function () {
        const self = this;
        setTimeout(() => {
            if (this.streetViewDataProviders != rPanorama.streetViewDataProviders) {
                this.setPano(rPanorama.links[plinks].pano);
            } else {
                if (this.pano === rPanorama.pano) {
                    this.setPano(rPanorama.links[plinks].pano);
                    plinks = plinks + 1 > rPanorama.links.length - 1 ? 0 : plinks + 1;
                }
            }
        }
            , 1000);
    });

    /*  rMap.addListener('click', function (event) {
         var rPlace = event.latLng;
         for (i = -3; i < 3; i++) {
             for (j = -3; j < 3; j++) {
                 sv.getPanorama({
                     location: {
                         lat: rPlace.lat() + 2 * (i) / (60 * 1852),
                         lng: rPlace.lng() + 2 * (j) / (60 * 1852)
                     },
                     radius: 2,
                 }, processSVData);
             }
         }
         if (CheckPoints[0]) {
             astorPlace = {
                 lat: CheckPoints[0].position.lat(),
                 lng: CheckPoints[0].position.lng(),
             };
         }
     }); */

    async function setupAutocomplete() {
        const { Autocomplete } = await google.maps.importLibrary("places");
        const input = document.getElementById('pac-input');

        // Instancia o Autocomplete clássico no seu input comum
        const autocomplete = new Autocomplete(input, {
            fields: ["geometry", "name", "formatted_address"],
        });

        rMap.controls[google.maps.ControlPosition.LEFT_TOP].push(input);

        // REGEX para validar se o texto digitado são coordenadas válidas (ex: -22.95, -43.21)
        const regexCoordenadas = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

        // Função interna para mover o mapa e abrir o Street View
        function moverParaCoordenadas(lat, lng) {
            const posicao = { lat: parseFloat(lat), lng: parseFloat(lng) };

            rMap.setCenter(posicao);
            rMap.setZoom(17);

            sv.getPanorama({
                location: posicao,
                radius: 10,
            }, rPanoSetting);
        }

        // --- INTERCEPTOR DE COORDENADAS (O segredo) ---
        // Escuta o Enter direto no input. Se for coordenada, cancela a busca do Google.
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                const textoDigitado = input.value || "";

                if (regexCoordenadas.test(textoDigitado.trim())) {
                    // Impede o Google de tentar buscar isso como um texto/lugar comum
                    event.preventDefault();
                    event.stopPropagation();

                    // Separa Lat e Lng e executa o teletransporte
                    const [lat, lng] = textoDigitado.split(",");
                    moverParaCoordenadas(lat.trim(), lng.trim());
                } else {
                     window.alert("Clique nas sugestões ou insira coordenadas no formato: lat, lng (ex: -22.95, -43.21).");
                return;
                }
            } 
        });

        // --- FLUXO NORMAL DO GOOGLE (Para nomes de lugares) ---
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            

            if (place.geometry.viewport) {
                rMap.fitBounds(place.geometry.viewport);

                sv.getPanorama({
                    location: {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    },
                    radius: 10,
                }, rPanoSetting);

            } else {
                rMap.setCenter(place.geometry.location);
                rMap.setZoom(17);

                sv.getPanorama({
                    location: {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    },
                    radius: 10,
                }, rPanoSetting);
            }

            
        });

        
    }
    setupAutocomplete();

    State[0] = {
        heading: 0
    };
    var zum1 = 0

    window.addEventListener('keydown', {
        passive: true
    }, (event) => {
        if ((// Change or remove this condition depending on your requirements.
            event.key === 'ArrowUp' || // Move forward
            event.key === 'ArrowDown' || // Move forward
            event.key === 'ArrowLeft' || // Pan left
            event.key === 'ArrowRight'// Pan right
        ) && !event.metaKey && !event.altKey && !event.ctrlKey) {
            event.stopPropagation()
        }
        ;
    }
        , {
            capture: true
        },);

    // Cria a instância da ElevationService
    // elevator = new google.maps.ElevationService();

    // Chama a função para obter a elevação

}

function setMapOnAll(map, Markers) {
    if (Markers != undefined) {
        if (Markers["visible"]) {
            Markers.setMap(map)
        } else {
            for (var i = 0; i < Markers.length; i++) {
                Markers[i].setMap(map);
            }
        }
    }
}

function toggleDown() {

    if (Markers[rPanorama.pano]) {
        setMapOnAll(null, Markers[rPanorama.pano].Points);
        setMapOnAll(null, Markers[rPanorama.pano].Matches);
    }

    if (Markers[pPanorama.pano]) {
        setMapOnAll(null, Markers[pPanorama.pano].Points);
        setMapOnAll(null, Markers[pPanorama.pano].Matches);
    }

    if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
        setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
    }

    if (ntimes == 0) {
        ntimes = rPanoramas.length - 1
    } else {
        ntimes--
    }
    rPanorama.setPano(rPanoramas[ntimes].pano);

    document.getElementsByName('Date')[0].value = JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 8)
    setMapOnAll(null, pCheckPoints)
    data = Data[CheckPano[markerPanoID]]

    if (data) {
        for (ii = 0; ii < data.links.length; ii++) {
            pPano = Object.values(data.links[ii])[2]
            tdata = Data[CheckPano[pPano]]
            if (tdata) {
                var pTime = [];
                aTime = JSON.stringify(Object.values(rPanoramas[ntimes])[1]);
                for (jj = 0; jj < tdata.time.length; jj++) {
                    sTime = JSON.stringify(Object.values(tdata.time[jj])[1])
                    if (sTime === aTime) {
                        pTime = Object.values(tdata.time[jj])[0];
                        pntimes = jj;
                        pPanoramas = tdata.time

                        setMapOnAll(pMap, pCheckPoints[CheckPano[pPano]])
                        pPanorama.setPano(pTime);
                        pPanorama.setVisible(true)
                    } else {
                        pPanorama.setVisible(false)
                    }
                }
            }
        }
    }
    if (Markers[rPanorama.pano] && document.getElementById('rMap').style.width == '50%') {
        setMapOnAll(rMap, Markers[rPanorama.pano].Points);
    }

    if (Markers[pPanorama.pano] && document.getElementById('rMap').style.width == '50%') {
        setMapOnAll(pMap, Markers[pPanorama.pano].Points);
    }

    if (Markers[Object.values(rPanoramas[ntimes])[1]] && document.getElementById('rMap').style.width == '100%') {
        setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
    }

}

function toggleUp() {

    if (Markers[rPanorama.pano]) {
        setMapOnAll(null, Markers[rPanorama.pano].Points);
    }

    if (Markers[pPanorama.pano]) {
        setMapOnAll(null, Markers[pPanorama.pano].Points);
    }

    if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
        setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
    }

    if (ntimes == rPanoramas.length - 1) {
        ntimes = 0
    } else {
        ntimes++
    }
    rPanorama.setPano(rPanoramas[ntimes].pano);

    document.getElementsByName('Date')[0].value = JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 8)

    setMapOnAll(null, pCheckPoints)
    data = Data[CheckPano[markerPanoID]]
    if (data) {
        for (ii = 0; ii < data.links.length; ii++) {
            pPano = Object.values(data.links[ii])[2]
            tdata = Data[CheckPano[pPano]]
            if (tdata) {
                var pTime = [];
                aTime = JSON.stringify(Object.values(rPanoramas[ntimes])[1]);
                for (jj = 0; jj < tdata.time.length; jj++) {
                    sTime = JSON.stringify(Object.values(tdata.time[jj])[1])
                    if (sTime === aTime) {
                        pTime = Object.values(tdata.time[jj])[0];
                        pntimes = jj;
                        pPanoramas = tdata.time
                        setMapOnAll(pMap, pCheckPoints[CheckPano[pPano]])
                        pPanorama.setPano(pTime);
                        pPanorama.setVisible(true)
                    } else {
                        pPanorama.setVisible(false)
                    }

                }
            }
        }
    }

    if (Markers[rPanorama.pano] && document.getElementById('rMap').style.width == '50%') {
        setMapOnAll(rMap, Markers[rPanorama.pano].Points);
    }

    if (Markers[pPanorama.pano] && document.getElementById('rMap').style.width == '50%') {
        setMapOnAll(pMap, Markers[pPanorama.pano].Points);
    }

    if (Markers[Object.values(rPanoramas[ntimes])[1]] && document.getElementById('rMap').style.width == '100%') {
        setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
    }

}

// function processSVData(data, status) {

//     if (status === 'OK') {
//         cont = 1;
//         if (indice > 0) {
//             for (ii = 0; ii < indice; ii++) {
//                 if ((data.location.latLng.lng() == meusPontos[ii].lng && data.location.latLng.lat() == meusPontos[ii].lat)) {
//                     cont++
//                 }
//             }
//         }
//         if (indice > 0 && cont == 1) {
//             meusPontos[indice] = {
//                 lng: data.location.latLng.lng(),
//                 lat: data.location.latLng.lat()
//             };
//             indice++
//         }
//         if (indice == 0) {
//             meusPontos[indice] = {
//                 lng: data.location.latLng.lng(),
//                 lat: data.location.latLng.lat()

//             };

//             indice = 1;
//         }
//         if (cont == 1) {
//             //  dados = dados + data.location.pano + " " + data.location.latLng.lat() + " " + data.location.latLng.lng() + " " + data.tiles.originHeading + " " + data.tiles.originPitch + "\r\n";
//             checkpoint = new google.maps.Marker({
//                 position: data.location.latLng,
//                 map: rMap,
//                 icon: {
//                     path: google.maps.SymbolPath.CIRCLE,
//                     scale: 7,
//                 },
//                 lable: indice,
//                 opacity: 1
//             });

//             pcheckpoint = new google.maps.Marker({
//                 position: data.location.latLng,
//                 map: pMap,
//                 icon: {
//                     path: google.maps.SymbolPath.CIRCLE,
//                     scale: 7,
//                 },
//                 lable: indice,
//                 opacity: 1,
//             });

//             // setMapOnAll(null, pCheckPoints);
//             if (Markers[rPanorama.pano]) {
//                 setMapOnAll(null, Markers[rPanorama.pano].Points);
//             }
//             // rPanorama.setPano(data.location.pano)
//             // rPanoramas = data.time;
//             //  ntimes = data.time.length - 1;
//             Data.push(data)

// /*             checkpoint.addListener('click', function () {
//                 pTimes = []
//                 if (Markers[rPanorama.pano]) {
//                     setMapOnAll(null, Markers[rPanorama.pano].Points);
//                 }

//                 rPanorama.setVisible(true);
//                 setMapOnAll(null, CheckPoints)

//                 markerPanoID = data.location.pano;

//                 if (rPanorama.pano != markerPanoID) {

//                     if (ntimes.length != 0) {
//                         Pano = Object.values(rPanoramas[ntimes])[1];
//                         aTime = JSON.stringify(Object.values(rPanoramas[ntimes])[1]);
//                         var stime = [];
//                         for (ii = 0; ii < data.time.length; ii++) {
//                             sTime = JSON.stringify(Object.values(data.time[ii])[1])
//                             if (sTime === aTime) {
//                                 ntimes = ii;
//                                 stime = 1;
//                             }
//                         }
//                         if (stime == 1) {
//                             rPanoramas = data.time
//                             rPanorama.setPano(Object.values(rPanoramas[ntimes])[0])
//                         } else {
//                             if (Markers[Object.values(rPanoramas[ntimes])[1]] && document.getElementById('rMap').style.width == '100%') {
//                                 if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
//                                     setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
//                                 }
//                             }

//                             rPanorama.setPano(markerPanoID);
//                             rPanoramas = data.time;
//                             ntimes = data.time.length - 1;
//                             if (Markers[Object.values(rPanoramas[ntimes])[1]] && document.getElementById('rMap').style.width == '100%') {
//                                 if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
//                                     setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
//                                 }
//                             }
//                         }
//                     } else {
//                         rPanorama.setPano(markerPanoID);
//                         rPanoramas = data.time;
//                         ntimes = data.time.length - 1;
//                     }

//                     if (Markers[rPanorama.pano] && document.getElementById('rMap').style.width == '50%') {
//                         setMapOnAll(rMap, Markers[rPanorama.pano].Points);
//                     }
//                     document.getElementsByName('Date')[0].value = Object.values(rPanoramas[ntimes])[1]

//                     setMapOnAll(null, pCheckPoints)

//                     for (ii = 0; ii < data.links.length; ii++) {
//                         pPano = Object.values(data.links[ii])[2]
//                         tdata = Data[CheckPano[pPano]]
//                         if (tdata) {
//                             var pTime = [];
//                             aTime = JSON.stringify(Object.values(rPanoramas[ntimes])[1]);
//                             for (jj = 0; jj < tdata.time.length; jj++) {
//                                 sTime = JSON.stringify(Object.values(tdata.time[jj])[1])
//                                 if (sTime === aTime) {
//                                     pTime = Object.values(tdata.time[jj])[0];
//                                     pntimes = jj;
//                                     pPanoramas = tdata.time

//                                     if (document.getElementById('rMap').style.width == '50%') {
//                                         setMapOnAll(pMap, pCheckPoints[CheckPano[pPano]])
//                                     }
//                                     pPanorama.setPano(pTime);
//                                     pTimes.push(pPano)

//                                 }
//                             }
//                         }
//                     }
//                     pPanorama.setVisible(true)
//                     if (!pTime) {
//                         pPanorama.setVisible(false);
//                     } else { }

//                     rPanorama.setVisible(true);
//                     setMapOnAll(null, CheckPoints)
//                     if (Markers[pTime] && document.getElementById('rMap').style.width == '50%') {
//                         setMapOnAll(pMap, Markers[pTime].Points);
//                         //setMapOnAll(pMap, Markers[pPanorama.pano].Pairs);
//                     }
//                 }

//             });

//             pcheckpoint.addListener('click', function () {
//                 markerPanoID = data.location.pano;

//                 if (rPanorama.pano != markerPanoID) {
//                     if (Markers[pPanorama.pano]) {
//                         setMapOnAll(null, Markers[pPanorama.pano].Points);
//                         //  setMapOnAll(null, Markers[pPanorama.pano].Pairs);
//                         //  setMapOnAll(null, Markers[pPanorama.pano].Matches);
//                     }
//                     if (pntimes.length != 0) {
//                         Pano = Object.values(pPanoramas[pntimes])[1];
//                         aTime = JSON.stringify(Object.values(pPanoramas[pntimes])[1]);
//                         var stime = [];
//                         for (ii = 0; ii < data.time.length; ii++) {
//                             sTime = JSON.stringify(Object.values(data.time[ii])[1])
//                             if (sTime === aTime) {
//                                 pntimes = ii;
//                                 stime = 1;
//                             }
//                         }
//                         if (stime == 1) {
//                             pPanoramas = data.time
//                             pPanorama.setPano(Object.values(pPanoramas[pntimes])[0])
//                             pPanorama.setVisible(true);
//                             setMapOnAll(null, pCheckPoints)

//                         }
//                     } else {
//                         pPanorama.setPano(markerPanoID);
//                         pPanoramas = data.time;
//                         pntimes = data.time.length - 1;
//                         rPanorama.setVisible(true);
//                         setMapOnAll(null, CheckPoints)
//                     }
//                     if (Markers[pPanorama.pano]) {
//                         setMapOnAll(pMap, Markers[pPanorama.pano].Points);
//                         //  setMapOnAll(pMap, Markers[pPanorama.pano].Pairs);
//                         //  setMapOnAll(pMap, Markers[pPanorama.pano].Matches);
//                     }
//                 }

//             }); */

//             CheckPano[data.location.pano] = indice - 1
//             pCheckPoints.push(pcheckpoint)
//             CheckPoints.push(checkpoint)
//         }
//     } else {//console.error('Street View data not found for this location.');
//     }

// }

function rPanoSetting(data, status) {
    if (status === 'OK') {
        pTimes = []
        markerPanoID = data.location.pano;
        DatA = data
        if (ntimes.length != 0) {
            Pano = Object.values(rPanoramas[ntimes])[1];
            var aTime = JSON.stringify(Object.values(rPanoramas[ntimes])[1]);
            var stime = [];
            for (ii = 0; ii < data.time.length; ii++) {
                var sTime = JSON.stringify(Object.values(data.time[ii])[1])
                if (sTime === aTime) {
                    ntimes = ii;
                    stime = 1;
                }
            }
            if (stime == 1) {
                rPanoramas = data.time
                rPanorama.setPano(Object.values(rPanoramas[ntimes])[0])
            } else {
                if (Markers[Object.values(rPanoramas[ntimes])[1]] && document.getElementById('rMap').style.width == '100%') {
                    if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
                        setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
                    }
                }

                rPanorama.setPano(markerPanoID);
                rPanoramas = data.time;
                ntimes = data.time.length - 1;
                if (Markers[Object.values(rPanoramas[ntimes])[1]] && document.getElementById('rMap').style.width == '100%') {
                    if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
                        setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
                    }
                }
            }
        } else {
            rPanorama.setPano(markerPanoID);
            rPanoramas = data.time;
            ntimes = data.time.length - 1;
        }
        rPanorama.setVisible(true);

        if (Markers[rPanorama.pano] && document.getElementById('rMap').style.width == '50%') {
            setMapOnAll(rMap, Markers[rPanorama.pano].Points);
        }
        document.getElementsByName('Date')[0].value = JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 8)

        if (data.links.length != 0) {
            pPano = Object.values(data.links[0])[2]
            sv.getPanorama({
                pano: pPano
            }, pPanoSetting);
            pPanorama.setPano(pPano);
            pPanorama.setVisible(true)
        } else {
            pPanorama.setVisible(false);
        }

    }
}

function pPanoSetting(data, status) {
    if (status === 'OK') {
        pTimes = []
        pPanoramas = data.time
        if (ntimes.length != 0) {
            //Pano = Object.values(rPanoramas[pntimes])[1];
            aTime = JSON.stringify(Object.values(rPanoramas[ntimes])[1]);
            var stime = [];
            for (ii = 0; ii < data.time.length; ii++) {
                sTime = JSON.stringify(Object.values(data.time[ii])[1])
                if (sTime === aTime) {
                    pntimes = ii;
                    stime = 1;
                }
            }
            if (stime == 1) {
                pPanorama.setPano(Object.values(pPanoramas[pntimes])[0])
                pPanorama.setVisible(true);
                setMapOnAll(null, pCheckPoints)
            }
        } else {
            pPanorama.setPano(data.location.pano);
            pntimes = data.time.length - 1;
            rPanorama.setVisible(true);
            setMapOnAll(null, CheckPoints)
        }
    }
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function duplicate(s) {
    if (s == 1) {
        if (document.getElementById('rMap').style.width == '50%') {
            document.getElementById('rMap').style.width = '100%'

            if (Markers[rPanorama.pano]) {
                setMapOnAll(null, Markers[rPanorama.pano].Points);
                setMapOnAll(null, Markers[pPanorama.pano].Points);
                if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
                    setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
                }

            }

            if (Markers[pPanorama.pano]) {
                setMapOnAll(null, Markers[pPanorama.pano].Points);
            }

            rPanorama.setVisible(false)
            rPanorama.setVisible(true)

            document.getElementById('pMap').style.display = 'none'

            if (document.getElementById('centroR') != undefined) {
                document.getElementById('centroR').style.left = (2 * SVO.panWidth - SVO.markerWidth) / 2 + "px"
            }

        } else {
            document.getElementById('rMap').style.width = '50%'
            rPanorama.setVisible(false)
            pPanorama.setVisible(false)

            if (Markers[rPanorama.pano]) {
                setMapOnAll(rMap, Markers[rPanorama.pano].Points);
            }

            if (Markers[pPanorama.pano]) {
                setMapOnAll(pMap, Markers[pPanorama.pano].Points);
            }

            if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
                setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
            }

            document.getElementById('pMap').style.display = 'block'

            rPanorama.setVisible(true)
            pPanorama.setVisible(true)
            if (document.getElementById('centroR') != undefined) {
                document.getElementById('centroR').style.left = (SVO.panWidth / 2 - SVO.markerWidth) / 2 + "px"
            }

        }
    }
    if (s == 2) {
        if (document.getElementById('pMap').style.width == '50%') {

            document.getElementById('pMap').style.width = '100%'

            if (Markers[pPanorama.pano]) {
                setMapOnAll(null, Markers[pPanorama.pano].Points);
            }

            if (Markers[rPanorama.pano]) {
                setMapOnAll(null, Markers[rPanorama.pano].Points);

            }

            if (Markers.length > 0) {
                setMapOnAll(pMap, Markers[Object.values(pPanoramas[ntimes])[1]].Pairs);
            }

            pPanorama.setVisible(false)
            pPanorama.setVisible(true)
            document.getElementById('rMap').style.display = 'none'

            document.getElementById('centro').style.top = (SVO.panHeight - 18) / 2 + "px"
            document.getElementById('centro').style.left = 2 * (SVO.panWidth - 18) / 2 + "px"

        } else {
            document.getElementById('pMap').style.width = '50%'
            rPanorama.setVisible(false)
            pPanorama.setVisible(false)

            if (Markers[pPanorama.pano]) {
                setMapOnAll(null, Markers[pPanorama.pano].Points);
            }

            if (Markers[rPanorama.pano]) {
                setMapOnAll(null, Markers[rPanorama.pano].Points);
            }

            if (Markers.length > 0) {
                setMapOnAll(null, Markers[Object.values(pPanoramas[ntimes])[1]].Pairs);
            }

            document.getElementById('rMap').style.display = 'block'
            pPanorama.setVisible(false)
            pPanorama.setVisible(true)
            rPanorama.setVisible(true)

            SVO.panWidth = Object.values(rMap.__gm.pixelBounds)[2] - Object.values(rMap.__gm.pixelBounds)[0];
            SVO.panHeight = Object.values(rMap.__gm.pixelBounds)[3] - Object.values(rMap.__gm.pixelBounds)[1];

            document.getElementById('centro').style.top = (SVO.panHeight - 18) / 2 + "px"
            document.getElementById('centro').style.left = (SVO.panWidth - 18) / 2 + "px"
        }
    }

}

function toggledownload() {
    rPanorama.setVisible(false)
    var Posicao = [];
    for (var i = 0; i < Object.keys(Markers).length; i++) {
        Panora = [];
        var pointsJSON = [];
        var pairsJSON = [];
        var matchesJSON = [];
        console.log(rPanorama.getPosition())
        pnt = Markers[Object.keys(Markers)[i]].Points;
        prs = Markers[Object.keys(Markers)[i]].Pairs;
        mtc = Markers[Object.keys(Markers)[i]].Matches;
        for (var j = 0; j < pnt.length; j++) {
            if (pnt[j]) {
                pointsJSON.push({
                    "position": [pnt[j].position.lat(), pnt[j].position.lng()],
                    "index": pnt[j].title,
                })
            }
        }
        for (var j = 0; j < prs.length; j++) {
            if (prs[2 * j]) {
                pairsJSON.push({
                    "position": [prs[2 * j].position.lat(), prs[2 * j].position.lng(), prs[2 * j + 1].position.lat(), prs[2 * j + 1].position.lng()],
                    "index": [prs[2 * j].title, prs[2 * j + 1].title],
                })
            }
        }
        for (var j = 0; j < mtc.length; j++) {
            if (mtc[j]) {
                matchesJSON.push({
                    "position": [mtc[j].position.lat(), mtc[j].position.lng()],
                    "index": mtc[j].title,
                })
            }
        }
        Panora = ({
            "rPanorama": Object.keys(Markers)[i],
            "photo": Markers[Object.keys(Markers)[i]].Photo,
            "position": Markers[Object.keys(Markers)[i]].Position,
            "points": pointsJSON,
            "pairs": pairsJSON,
            "matches": matchesJSON
        })
        Posicao.push(Panora);
    }

    // console.save(Posicao,'dados.json')
    //saveJSON(JSON.stringify(Posicao));

}

function download(filename, text) {
    solverP()
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

}

function saveJSON(points) {
    let data = points;
    let bl = new Blob([data], {
        type: "text/html"
    });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(bl);
    // a.href= "../data.json";
    //console.log(a.href)
    a.download = "data.json";
    a.hidden = true;
    document.body.appendChild(a);
    a.innerHTML = "someinnerhtml";
    a.click();
}

//function handleFileSelect(evt) {
//var files = evt.target.files;

// FileList object
// files is a FileList of File objects. List some properties.
//}

function handleFileSelect(evt) {
    var files = evt.target.files;
    if (!files || files.length === 0)
        return;
    var f = files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
        // Aqui você recebe o conteúdo do TXT como string:
        var conteudo = e.target.result;
        LoadFile(txtParaObjeto(conteudo))
    }
        ;
    reader.readAsText(f);

}

function txtParaObjeto(conteudo) {
    const linhas = conteudo.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    // Usa & ou : como separador
    const objeto = linhas.map(linha => {
        return linha.split(/[&;]/).map(e => e.trim());
    }
    );
    return objeto;

}

function LoadFile(pontos) {
    rPanorama.setVisible(false)
    pPanorama.setVisible(false)
    for (q = 0; q < pontos.length; q++) {
        sv.getPanoramaById(pontos[q][0], rPanoSetting);
        sv.getPanoramaById(pontos[q][1], pPanoSetting);
        if (pontos[q][0] != rPanorama.pano) {
            rPanorama.setPano(pontos[q][0])
        }

        rPanorama.setPov({
            heading: parseFloat(pontos[q][8]),
            pitch: parseFloat(pontos[q][10])
        });
        if (pontos[q][1] != pPanorama.pano) {
            pPanorama.setPano(pontos[q][1])
        }
        pPanorama.setPov({
            heading: parseFloat(pontos[q][9]),
            pitch: parseFloat(pontos[q][11])
        });
        //sleep(1000)
        adcElementoP(pontos[q][5], pontos[q][6])

    }
    rPanorama.setVisible(true)
    pPanorama.setVisible(true)

}

function cartesian(lat2, lon2) {
    var R = 6371;
    // km (change this constant to get miles)
    lat1 = astorPlace.lat;
    lon1 = astorPlace.lng;
    //console.log([lat1,lon1])
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(0 * dLat / 2) * Math.sin(0 * dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var x = R * c * 1000 * Math.sign(dLon);

    a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(0 * dLon / 2) * Math.sin(0 * dLon / 2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var y = R * c * 1000 * Math.sign(dLat);
    var d = distance(lat1, lon1, lat2, lon2)
    //x= (x && x/Math.abs(x))*Math.sqrt(Math.pow(d,2)-Math.pow(y,2))  
    return [x, y];
}

function distanceC(point1, point2, Cal) {

    Ra1 = new Array()
    Ra2 = new Array()

    var xm1 = 0
    var ym1 = 0

    for (k = 0; k < Cal.Pt[0].length; k++) {
        xm1 = +Cal.Pt[0][k][0]
        ym1 = +Cal.Pt[0][k][1]
    }

    R1 = cartesian(point1.position.lat(), point1.position.lng())
    R2 = cartesian(point2.position.lat(), point2.position.lng())

    C1 = cartesian(point1.Cam[0], point1.Cam[1])
    C2 = cartesian(point2.Cam[0], point2.Cam[1])

    H = Cal.cal

    Nv1 = Cal.N1
    Nv2 = Cal.N2;

    for (ii = 0; ii < 2; ii++) {
        Ra1[ii] = H[0] * (R1[ii] - C1[ii]) / (H[0] + H[1] - Nv1[0] * (R1[0] - C1[0]) - Nv1[1] * (R1[1] - C1[1])) + C1[ii]
        Ra2[ii] = H[0] * (R2[ii] - C2[ii]) / (H[0] + H[1] - Nv2[0] * (R2[0] - C2[0]) - Nv2[1] * (R2[1] - C2[1])) + C2[ii]
    }
    var d = Math.sqrt((Ra1[0] - Ra2[0]) * (Ra1[0] - Ra2[0]) + (Ra1[1] - Ra2[1]) * (Ra1[1] - Ra2[1]))
    return d
}

function distC() {
    var den = 0;
    var num = 0;

    for (k = 0; k < rPanoramas.length; k++) {

        if (Calibration[Object.values(rPanoramas[k])[1]]) {
            if (Calibration[Object.values(rPanoramas[k])[1]].cal[2]) {

                den = den + Calibration[Object.values(rPanoramas[k])[1]].dist / Math.pow(Calibration[Object.values(rPanoramas[k])[1]].cal[2], 2);

                num = num + 1 / Math.pow(Calibration[Object.values(rPanoramas[k])[1]].cal[2], 2);
            }
        }
    }
    var dist = [];

    dist[1] = Math.sqrt(1 / num);
    dist[0] = den / num;
    return dist
}

function normalV(photo1) {
    theta = (90 - photo1.heading) * Math.PI / 180;
    tphi = -photo1.pitch * Math.PI / 180;
    Nv = [-Math.tan(tphi) * Math.cos(theta), -Math.tan(tphi) * Math.sin(theta)]
    return Nv;
}

function distance(lat1, lon1, lat2, lon2) {
    var R = 6371;
    // km (change this constant to get miles)
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000
    //  if (d > 1)
    //   return Math.round(d) + "km";
    // else if (d <= 1)
    //     return parseFloat(1000 * d).toFixed(2) + ' m';
}

function distanceGoogle(point1, point2) {
    var d = google.maps.geometry.spherical.computeDistanceBetween(point1.position, point2.position);
    return parseFloat(d).toFixed(2);
}

function LocationElevation(location, elevator) {
    return elevator.getElevationForLocations({
        locations: [location]
    }).then(({ results }) => {
        if (results[0]) {
            return results[0].elevation;
            // Retorna a elevação
        } else {
            throw new Error("No results found");
        }
    }
    ).catch((error) => {
        console.error("Elevation service failed due to:", error);
        return null;
    }
    );
    //uso
    //LocationElevation(pPanorama.location.latLng, elevator).then( (result) => {
    // hc=result;  
}

function alternate() {

    if (popupOriginal) {
    } else {

        for (let ii = altern; ii < rPanorama.__gm.panes.overlayLayer.children.length; ii++) {
            if (rPanorama.getPano() != rPanorama.__gm.panes.overlayLayer.children[ii].pano && altern < rPanorama.__gm.panes.overlayLayer.children.length) {
                rPanorama.setPano(rPanorama.__gm.panes.overlayLayer.children[altern].pano)
            } else {
                altern = altern + 1
            }
            if (altern == rPanorama.__gm.panes.overlayLayer.children.length - 1) {
                altern = 0
            }
        }
    }
}

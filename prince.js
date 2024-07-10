var rPanorama;
var meusPontos;
var indice;
var dados = [];
var act;
var Data = [];
var CheckPoints = [];
var pCheckPoints = [];
var ntimes = [];
var rPanoramas;
var pPanoramas;
var CheckPano = [];
var Markers = [];
var aux = [];
var rMap;
var json;
var sv;
var pntimes = [];
var markerPanoID = [];
var psize = 0;
var State = new Array(2);
var Calibration = new Array();

var SVO = new Object;

var astorPlace = {
    lat: -22.90799,
    lng: -43.182550
};

function initMap() {
    // Set up the map

    rMap = new google.maps.Map(document.getElementById('rMap'),{
        center: astorPlace,
        zoom: 19,
        mapTypeId: "hybrid",
        streetViewControl: false,
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
        }, ]
    });
    document.getElementById('rMap').style.width = '50%'
    pMap = new google.maps.Map(document.getElementById('pMap'),{
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
        }, ]

    });

    rMap.data.setStyle(function(feature) {
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
    // rMap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('floating-twoScreens'));

    meusPontos = [];
    indice = 0;

    // We get the map's default rPanorama and set up some defaults.
    // Note that we don't yet set it visible.
    rPanorama = rMap.getStreetView();
    rPanorama.setOptions({
        disableDefaultUI: true,
        linksControl: false,
        panControl: false,
        clickToGo: false,
        enableCloseButton: true,
        imageDateControl: false,
        disableDefaultUI: true,

    });
    rPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('floating-Down'))
    rPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('floating-Up'))
    rPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('floating-Date'))
    // rPanorama.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('input-point'));

    rPanorama.setVisible(true)
    rPanorama.setVisible(false)

    pPanorama = pMap.getStreetView()
    pPanorama.setOptions({
        linksControl: false,
        panControl: false,
        clickToGo: false,
        disableDefaultUI: true,
        enableCloseButton: true,
        imageDateControl: true,
        disableDefaultUI: true,
    });
    pPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('floating-point'));

    // pPanorama.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('input-match'));
    rPanorama.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('floating-ruler2'));
    pPanorama.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('floating-rulerC'));

    rPanorama.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('floating-pair'));
    pPanorama.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('floating-pairC'));

    rPanorama.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('floating-twoScreens1'));
    pPanorama.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('floating-twoScreens2'));

    pPanorama.setVisible(true)
    pPanorama.setVisible(false)

    rMap.addListener('click', function(event) {
        var rPlace = event.latLng;
        for (i = -5; i < 5; i++) {
            for (j = -5; j < 5; j++) {
                sv.getPanorama({
                    location: {
                        lat: rPlace.lat() + 2 * (i) / (60 * 1852),
                        lng: rPlace.lng() + 2 * (j) / (60 * 1852)
                    },
                    radius: 2,
                }, processSVData);
            }
        }
    });

    // Crea// the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    rMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    rMap.addListener('bounds_changed', function() {
        searchBox.setBounds(rMap.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        setMapOnAll(null, CheckPoints);
        CheckPoints = [];
        rMap.fitBounds(bounds);
        pMap.fitBounds(bounds);
    });

    State[0] = {
        heading: 0
    };
    var zum1 = 0

    window.addEventListener('keydown', (event)=>{
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
    }, );

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

    document.getElementsByName('Date')[0].value = Object.values(rPanoramas[ntimes])[1]
    setMapOnAll(null, pCheckPoints)
    data = Data[CheckPano[markerPanoID]]
    pPanorama.setVisible(false)
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
                    }
                }
            }
        }
    }
    if (Markers[rPanorama.pano]) {
        setMapOnAll(rMap, Markers[rPanorama.pano].Points);
        setMapOnAll(rMap, Markers[rPanorama.pano].Matches);
    }

    if (Markers[pPanorama.pano]) {
        setMapOnAll(pMap, Markers[pPanorama.pano].Points);
        setMapOnAll(pMap, Markers[pPanorama.pano].Matches);
    }

    if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
        setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
    }
}

function toggleUp() {

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

    if (ntimes == rPanoramas.length - 1) {
        ntimes = 0
    } else {
        ntimes++
    }
    rPanorama.setPano(rPanoramas[ntimes].pano);

    document.getElementsByName('Date')[0].value = Object.values(rPanoramas[ntimes])[1]

    setMapOnAll(null, pCheckPoints)
    data = Data[CheckPano[markerPanoID]]
    pPanorama.setVisible(false)
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
                    }
                }
            }
        }
    }
    if (Markers[rPanorama.pano]) {
        setMapOnAll(rMap, Markers[rPanorama.pano].Points);
        setMapOnAll(rMap, Markers[rPanorama.pano].Matches);
    }

    if (Markers[pPanorama.pano]) {
        setMapOnAll(pMap, Markers[pPanorama.pano].Points);
        setMapOnAll(pMap, Markers[pPanorama.pano].Matches);
    }

    if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
        setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
    }
}

function processSVData(data, status) {
    if (status === 'OK') {
        cont = 1;
        if (indice > 0) {
            for (ii = 0; ii < indice; ii++) {
                if ((data.location.latLng.lng() == meusPontos[ii].lng && data.location.latLng.lat() == meusPontos[ii].lat)) {
                    cont++
                }
            }
        }
        if (indice > 0 && cont == 1) {
            meusPontos[indice] = {
                lng: data.location.latLng.lng(),
                lat: data.location.latLng.lat()
            };
            indice++
        }
        if (indice == 0) {
            meusPontos[indice] = {
                lng: data.location.latLng.lng(),
                lat: data.location.latLng.lat()
            };
            indice = 1;
        }
        if (cont == 1) {
            dados = dados + data.location.pano + " " + data.location.latLng.lat() + " " + data.location.latLng.lng() + " " + data.tiles.originHeading + " " + data.tiles.originPitch + "\r\n";
            checkpoint = new google.maps.Marker({
                position: data.location.latLng,
                map: rMap,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 5,
                },
                lable: indice,
                opacity: 0.3
            });
            pcheckpoint = new google.maps.Marker({
                position: data.location.latLng,
                map: pMap,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 5,
                },
                lable: indice,
                opacity: 0.3
            });
            // setMapOnAll(null, pCheckPoints);
            if (Markers[rPanorama.pano]) {
                setMapOnAll(null, Markers[rPanorama.pano].Points);
                setMapOnAll(null, Markers[rPanorama.pano].Matches);
            }
            // rPanorama.setPano(data.location.pano)
            // rPanoramas = data.time;
            //  ntimes = data.time.length - 1;
            Data.push(data)

            checkpoint.addListener('click', function() {
                markerPanoID = data.location.pano;

                if (rPanorama.pano != markerPanoID) {
                    if (Markers[rPanorama.pano]) {
                        setMapOnAll(null, Markers[rPanorama.pano].Points);
                        // setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
                        setMapOnAll(null, Markers[rPanorama.pano].Matches);
                    }
                    if (Markers[pPanorama.pano]) {
                        setMapOnAll(null, Markers[pPanorama.pano].Points);
                        //setMapOnAll(null, Markers[pPanorama.pano].Pairs);
                        // setMapOnAll(null, Markers[pPanorama.pano].Matches);
                    }
                    if (ntimes.length != 0) {
                        Pano = Object.values(rPanoramas[ntimes])[1];
                        aTime = JSON.stringify(Object.values(rPanoramas[ntimes])[1]);
                        var stime = [];
                        for (ii = 0; ii < data.time.length; ii++) {
                            sTime = JSON.stringify(Object.values(data.time[ii])[1])
                            if (sTime === aTime) {
                                ntimes = ii;
                                stime = 1;
                            }
                        }
                        if (stime == 1) {
                            rPanoramas = data.time
                            rPanorama.setPano(Object.values(rPanoramas[ntimes])[0])
                        } else {
                            if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
                                if (Markers[Object.values(rPanoramas[ntimes])[1]].Pairs != undefined) {
                                    setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
                                }
                            }

                            rPanorama.setPano(markerPanoID);
                            rPanoramas = data.time;
                            ntimes = data.time.length - 1;
                            if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
                                if (Markers[Object.values(rPanoramas[ntimes])[1]].Pairs != undefined) {
                                    setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
                                }
                            }
                        }
                    } else {
                        rPanorama.setPano(markerPanoID);
                        rPanoramas = data.time;
                        ntimes = data.time.length - 1;
                    }
                    if (Markers[rPanorama.pano] && document.getElementById('rMap').style.width == '50%') {
                        setMapOnAll(rMap, Markers[rPanorama.pano].Points);
                        setMapOnAll(rMap, Markers[rPanorama.pano].Matches);
                    }
                    document.getElementsByName('Date')[0].value = Object.values(rPanoramas[ntimes])[1]

                    setMapOnAll(null, pCheckPoints)

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
                                }
                            }
                        }
                    }
                    pPanorama.setVisible(true)
                    if (!pTime) {
                        pPanorama.setVisible(false);
                    } else {}

                    rPanorama.setVisible(true);

                   
                    
                    
                    if (Markers[pTime]) {
                        setMapOnAll(pMap, Markers[pTime].Points);
                        //setMapOnAll(pMap, Markers[pPanorama.pano].Pairs);
                        //setMapOnAll(pMap, Markers[pPanorama.pano].Matches);
                    }
                }
            });

            pcheckpoint.addListener('click', function() {
                var markerPanoID = data.location.pano;
                if (rPanorama.pano != markerPanoID) {
                    if (Markers[pPanorama.pano]) {
                        setMapOnAll(null, Markers[pPanorama.pano].Points);
                        //  setMapOnAll(null, Markers[pPanorama.pano].Pairs);
                        //  setMapOnAll(null, Markers[pPanorama.pano].Matches);
                    }
                    if (pntimes.length != 0) {
                        Pano = Object.values(pPanoramas[pntimes])[1];
                        aTime = JSON.stringify(Object.values(pPanoramas[pntimes])[1]);
                        var stime = [];
                        for (ii = 0; ii < data.time.length; ii++) {
                            sTime = JSON.stringify(Object.values(data.time[ii])[1])
                            if (sTime === aTime) {
                                pntimes = ii;
                                stime = 1;
                            }
                        }
                        if (stime == 1) {
                            pPanoramas = data.time
                            pPanorama.setPano(Object.values(pPanoramas[pntimes])[0])
                            pPanorama.setVisible(true);
                        }
                    } else {
                        pPanorama.setPano(markerPanoID);
                        pPanoramas = data.time;
                        pntimes = data.time.length - 1;
                        rPanorama.setVisible(true);
                    }
                    if (Markers[pPanorama.pano]) {
                        setMapOnAll(pMap, Markers[pPanorama.pano].Points);
                        //  setMapOnAll(pMap, Markers[pPanorama.pano].Pairs);
                        //  setMapOnAll(pMap, Markers[pPanorama.pano].Matches);
                    }
                }

            });

            CheckPano[data.location.pano] = indice - 1
            pCheckPoints.push(pcheckpoint)
            CheckPoints.push(checkpoint)

        }
    } else {// console.error('Street View data not found for this location.');
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
            }

            if (Markers[pPanorama.pano]) {
                setMapOnAll(null, Markers[pPanorama.pano].Points);

            }

            if (Markers.length > 0) {
                setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
            }

            rPanorama.setVisible(false)
            rPanorama.setVisible(true)
            document.getElementById('pMap').style.display = 'none'

        } else {
            document.getElementById('rMap').style.width = '50%'
            rPanorama.setVisible(false)
            pPanorama.setVisible(false)

            if (Markers[rPanorama.pano]) {
                setMapOnAll(null, Markers[rPanorama.pano].Points);
            }

            if (Markers[pPanorama.pano]) {
                setMapOnAll(null, Markers[pPanorama.pano].Points);
            }

            if (Markers.length > 0) {
                setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
            }

            document.getElementById('pMap').style.display = 'block'

            rPanorama.setVisible(true)
            pPanorama.setVisible(true)
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
    //localStorage.setItem('C:/Users/Gustavo%20Maia/OneDrive/Projetos/Speed%20King/API%20Google/jason.json', JSON.stringify(Posicao)) 

}

function download(filename, text) {
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
    let bl = new Blob([data],{
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
    document.getElementById('files').addEventListener('change', handleFileSelect, false);

    var files = evt.target.files;
    // FileList object
    // files is a FileList of File objects. List some properties.
    var output = [];
    f = files[0]
    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            //console.log('e readAsText = ', e);
            //console.log('e readAsText target = ', e.target.result);
            try {
                json = JSON.parse(e.target.result);
                console.log(json)
                //alert('json global var has been set to parsed json of this file here it is unevaled = \n' + JSON.stringify(json));
            } catch (e) {//alert('ex when trying to parse json = ' + ex);
            }
        }
    }
    )(f);
    reader.readAsText(f);
}

function LoadFile(evt) {
    Markers = [];
    for (q = 0; q < json.length; q++) {

        astorPlace.lat = json[q].position[0];
        astorPlace.lng = json[q].position[1];
        if (q == 0) {
            initMap()
        }

        for (i = -2; i < 2; i++) {
            for (j = -2; j < 2; j++) {
                sv.getPanorama({
                    location: {
                        lat: astorPlace.lat + 2 * (i) / (60 * 1852),
                        lng: astorPlace.lng + 2 * (j) / (60 * 1852)
                    },
                    radius: 2.5,
                    preference: google.maps.StreetViewPreference.BEST
                }, processSVData);
            }
        }

        Markers[json[q].rPanorama] = ({
            "Points": [],
            "Pairs": [],
            "Matches": [],
            "Position": json[q].position,
            "Photo": json[q].photo
        });

        rPanorama.setPano(json[q].rPanorama)

        for (k = 0; k < json[q].points.length; k++) {

            if (json[q].points[k]) {
                addpoint(json[q].points[k])
                console.log(Markers)
            }
            if (json[q].pairs[k]) {
                addpair(json[q].pairs[k])
            }
            if (json[q].matches[k]) {
                addmatch(json[q].matches[k])
            }
        }
        setMapOnAll(null, Markers[json[q].rPanorama].Points);

    }
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

        if (Calibration[Object.values(rPanoramas[k])[1]] != undefined) {
            if (Calibration[Object.values(rPanoramas[k])[1]].cal[2] != undefined) {

                den = den + Calibration[Object.values(rPanoramas[k])[1]].dist / Math.pow(Calibration[Object.values(rPanoramas[k])[1]].cal[2],2);

                num = num + 1 / Math.pow(Calibration[Object.values(rPanoramas[k])[1]].cal[2],2);
            }
        }
    }
    var dist=[];
    dist[0] = den / num;
    dist[1] = Math.sqrt(1 / num);
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
    if (d > 1)
        return Math.round(d) + "km";
    else if (d <= 1)
        return parseFloat(1000 * d).toFixed(2) + ' m';
}

function distanceGoogle(point1, point2) {
    var d = google.maps.geometry.spherical.computeDistanceBetween(point1.position, point2.position);
    return parseFloat(d).toFixed(2);
}

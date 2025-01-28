function addpoint(load) {
    var Maps = []
    var Panorama = []

    Map[0] = rMap
    Map[1] = pMap
    Panorama[0] = rPanorama
    Panorama[1] = pPanorama

    if (typeof (Calibration[Object.values(rPanoramas[ntimes])[1]]) == 'undefined') {
        Calibration[Object.values(rPanoramas[ntimes])[1]] = {
            Pt: new Array(),
            Cm: new Array(),
            Nv: new Array(),
            cal: [3, 0.3],
        };
        Calibration[Object.values(rPanoramas[ntimes])[1]].Pt[0] = new Array();
        Calibration[Object.values(rPanoramas[ntimes])[1]].Pt[0][0] = new Array();
        Calibration[Object.values(rPanoramas[ntimes])[1]].Pt[1] = new Array();
        Calibration[Object.values(rPanoramas[ntimes])[1]].Pt[1][0] = new Array();
        Calibration[Object.values(rPanoramas[ntimes])[1]].Cm[0] = new Array();
        Calibration[Object.values(rPanoramas[ntimes])[1]].Cm[0][0] = new Array();
        Calibration[Object.values(rPanoramas[ntimes])[1]].Cm[1] = new Array();
        Calibration[Object.values(rPanoramas[ntimes])[1]].Cm[1][0] = new Array();
        psize = 0

    }

    rphoto = rPanorama.getPhotographerPov()
    pphoto = pPanorama.getPhotographerPov()
    Nv1 = normalV(rphoto)
    Nv2 = normalV(pphoto)

    //theta=[0,90];
    //tphi=[0,0];

    for (ii = 0; ii < 2; ii++) {
        if (Panorama[ii].visible == false) {
            Panorama[ii].setVisible(true)
            document.getElementsByName('Date')[0].value = Object.values(rPanoramas[ntimes])[1];
        }

        if (Markers[Panorama[ii].pano]) {} else {
            Markers[Panorama[ii].pano] = ({
                "Points": [],
                "Matches": [],
                "Position": [Panorama[ii].getPosition().lat(), Panorama[ii].getPosition().lng()],
                "Photo": Panorama[ii].getPhotographerPov()
            });
        }

        if (Markers[Panorama[ii].pano].Points) {
            aux = Markers[Panorama[ii].pano].Points;
            setMapOnAll(Map[ii], Markers[Panorama[ii].pano].Points);
            setMapOnAll(null, Markers[Panorama[ii].pano].Pairs);
            setMapOnAll(null, Markers[Panorama[ii].pano].Matches);
        } else {
            aux = []
        }

        var hd = rPanorama.pov.heading;
        var pt = Math.tan(Math.PI * (rPanorama.pov.pitch + 90) / 360);
        var zm = Math.tan(45 / Math.pow(2, rPanorama.getZoom()) * Math.PI / 180);

        if (load.position !== undefined) {
            var pos = {
                lat: load.position[0],
                lng: load.position[1]
            }
            var lab = "P" + load.index;
            var tit = load.index
        } else {
            var pos = {
                lat: rPanorama.location.latLng.lat() + 2 * Math.cos(Math.PI * hd / 180) / (60 * 1852) / Math.pow(zm, Math.pow(pt, 1.5)),
                lng: rPanorama.location.latLng.lng() + 2 * Math.sin(Math.PI * hd / 180) / (60 * 1852) / Math.pow(zm, Math.pow(pt, 1.5))
            }
            var lab = "P" + String(psize);
            var tit = String(psize)
        }

        var point = new google.maps.Marker({
            position: pos,
            map: Map[ii],
            draggable: true,
            label: lab,
            title: tit,
        });

        aux.push(point)

        Calibration[Object.values(rPanoramas[ntimes])[1]].Cm[ii][parseInt(point.title, 10)] = cartesian(Panorama[ii].location.latLng.lat(), Panorama[ii].location.latLng.lng());
        Calibration[Object.values(rPanoramas[ntimes])[1]].Pt[ii][parseInt(point.title, 10)] = cartesian(point.position.lat(), point.position.lng());

        Calibration[Object.values(rPanoramas[ntimes])[1]].Nv[parseInt(point.title, 10)] = [(Nv1[0] + Nv2[0]) / 2, (Nv1[1] + Nv2[1]) / 2];

        if (ii == 0) {
            var point1 = point;
            var i1 = ii
            google.maps.event.addListener(point1, 'drag', function() {

                Calibration[Object.values(rPanoramas[ntimes])[1]].Cm[0][parseInt(this.title, 10)] = cartesian(this.map.streetView.position.lat(), this.map.streetView.position.lng())
                Calibration[Object.values(rPanoramas[ntimes])[1]].Pt[0][parseInt(this.title, 10)] = cartesian(this.position.lat(), point1.position.lng());
                Calibration[Object.values(rPanoramas[ntimes])[1]].cal = solver(Calibration[Object.values(rPanoramas[ntimes])[1]])

            })
        } else {
            var point2 = point;
            if (Markers[pPanorama.pano].Points) {
                google.maps.event.addListener(point2, 'drag', function() {
                    Calibration[Object.values(rPanoramas[ntimes])[1]].Cm[1][parseInt(this.title, 10)] = cartesian(this.map.streetView.position.lat(), point2.map.streetView.position.lng());
                    Calibration[Object.values(rPanoramas[ntimes])[1]].Pt[1][parseInt(this.title, 10)] = cartesian(this.position.lat(), point2.position.lng());
                    Calibration[Object.values(rPanoramas[ntimes])[1]].cal = solver(Calibration[Object.values(rPanoramas[ntimes])[1]])
                });
            }
        }
        Markers[Panorama[ii].pano].Points = aux;

    }
    psize = Calibration[Object.values(rPanoramas[ntimes])[1]].Pt[0].length

}

function addpair(load) {
    if (rPanorama.visible == false) {
        rPanorama.setVisible(true)
        document.getElementsByName('Date')[0].value = Object.values(rPanoramas[ntimes])[1]
    }

    if (Markers[Object.values(rPanoramas[ntimes])[1]]) {} else {
        Markers[Object.values(rPanoramas[ntimes])[1]] = ({
            "Pairs": []
        });

        if (Markers[Object.values(rPanoramas[ntimes])[1]].Pairs) {
            aux = Markers[Object.values(rPanoramas[ntimes])[1]].Pairs;
            setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
        } else {
            aux = []
        }
        var hd = rPanorama.pov.heading;
        var zm = Math.tan(45 / Math.pow(2, rPanorama.getZoom()) * Math.PI / 180);
        var pt = Math.tan(Math.PI * (rPanorama.pov.pitch + 90) / 360);

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
                lat: rPanorama.location.latLng.lat() + 2 * Math.cos(Math.PI * hd / 180) / (60 * 1852) / Math.pow(zm, pt),
                lng: rPanorama.location.latLng.lng() + 2 * Math.sin(Math.PI * hd / 180) / (60 * 1852) / Math.pow(zm, pt)
            }
            var pos2 = pos1;

        }
        var lab1 = "0m";
        var tit1 = String(aux.length);
        var lab2 = "--";
        var tit2 = String(aux.length)

        var point1 = new google.maps.Marker({
            position: pos1,
            map: rMap,
            draggable: true,
            label: lab1,
            title: tit1,
        });
        point1.Cam = [rPanorama.location.latLng.lat(), rPanorama.location.latLng.lng()]
        point1.rPh = rPanorama.getPhotographerPov()

        var point2 = new google.maps.Marker({
            position: pos2,
            map: rMap,
            draggable: true,
            label: lab2,
            title: tit2,
        });
        point2.Cam = [rPanorama.location.latLng.lat(), rPanorama.location.latLng.lng()]
        point2.rPh = rPanorama.getPhotographerPov()

        // var rulerpoly = new google.maps.Polyline({
        //   path: [point1.position, point2.position],
        //  strokeColor: "#FFFF00",
        // strokeOpacity: 1,
        // strokeWeight: 7
        //});
        //rulerpoly.setMap(rMap);
        if (Calibration[Object.values(rPanoramas[ntimes])[1]]) {

            rphoto = rPanorama.getPhotographerPov()
            Calibration[Object.values(rPanoramas[ntimes])[1]].N1 = normalV(rphoto)
            Calibration[Object.values(rPanoramas[ntimes])[1]].N2 = normalV(pphoto)

        }

        // rPanorama.addListener('pano_changed', function() {
        //   if (Calibration[Object.values(rPanoramas[ntimes])[1]]) {                            
        //         var pos = solverC(Markers[Object.values(rPanoramas[ntimes])[1]].Pairs[0], Calibration[Object.values(rPanoramas[ntimes])[1]])
        //       myLatlng = new google.maps.LatLng(pos[0],pos[1]),
        //     Markers[Object.values(rPanoramas[ntimes])[1]].Pairs[0].setPosition(myLatlng);                   
        //        var pos = solverC(Markers[Object.values(rPanoramas[ntimes])[1]].Pairs[1], Calibration[Object.values(rPanoramas[ntimes])[1]])
        //         myLatlng = new google.maps.LatLng(pos[0],pos[1]),
        //          Markers[Object.values(rPanoramas[ntimes])[1]].Pairs[1].setPosition(myLatlng);            
        //  }
        //});

        google.maps.event.addListener(point1, 'drag', function() {

            if (Markers[rPanorama.pano]) {
                setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Points);
                setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
                setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Matches);
            }
            if (Calibration[Object.values(rPanoramas[ntimes])[1]]) {
                rphoto = rPanorama.getPhotographerPov()
                Calibration[Object.values(rPanoramas[ntimes])[1]].N1 = normalV(rphoto)
                Calibration[Object.values(rPanoramas[ntimes])[1]].C1 = [rPanorama.location.latLng.lat(), rPanorama.location.latLng.lng()]

                if (Calibration[Object.values(rPanoramas[ntimes])[1]].Pt[1].length > 2) {
                    label = String(parseFloat(distanceC(point1, point2, Calibration[Object.values(rPanoramas[ntimes])[1]])).toFixed(2)) + ' (σ=' + String(parseFloat(Calibration[Object.values(rPanoramas[ntimes])[1]].cal[2]).toFixed(2)) + ')';
                } else {
                    label = distanceGoogle(point1, point2);
                }

            } else {
                label = distanceGoogle(point1, point2);
            }
            point1.Cam = [rPanorama.location.latLng.lat(), rPanorama.location.latLng.lng()]
            point1.Pos = [point1.position.lat(), point1.position.lng()]
            point1.rPh = rPanorama.getPhotographerPov()

            point2.setLabel(label);

            // rulerpoly.setPath([point1.getPosition(), point2.getPosition()]);
        });

        google.maps.event.addListener(point2, 'drag', function() {

            if (Markers[Object.values(rPanoramas[ntimes])[1]]) {
                setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Points);
                setMapOnAll(rMap, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
                setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Matches);
            }
            if (Calibration[Object.values(rPanoramas[ntimes])[1]]) {
                rphoto = rPanorama.getPhotographerPov()
                Calibration[Object.values(rPanoramas[ntimes])[1]].N2 = normalV(rphoto)

                if (Calibration[Object.values(rPanoramas[ntimes])[1]].Pt[1].length > 2) {

                    Calibration[Object.values(rPanoramas[ntimes])[1]].dist = distanceC(point1, point2, Calibration[Object.values(rPanoramas[ntimes])[1]]);

                    DistE = distC()
                    label = String(parseFloat(DistE[0]).toFixed(2)) + ' (σ=' + String(parseFloat(DistE[1]).toFixed(2)) + ')';

                } else {
                    label = distanceGoogle(point1, point2);
                }

            } else {
                label = distanceGoogle(point1, point2);
            }
            point2.Cam = [rPanorama.location.latLng.lat(), rPanorama.location.latLng.lng()]
            point2.rPh = rPanorama.getPhotographerPov()

            point2.setLabel(label);
            point2.Pos = [point2.position.lat(), point2.position.lng()]

        });

        aux.push(point1)
        aux.push(point2)

        Markers[Object.values(rPanoramas[ntimes])[1]].Pairs = aux;
    }
}

function addmatch(load) {
    Panorama[0] = rPanorama
    Panorama[1] = pPanorama

    if (rPanorama.visible == false) {
        rPanorama.setVisible(true)
        document.getElementsByName('Date')[0].value = rPanoramas[ntimes].hf
    }

    if (Markers[rPanorama.pano]) {} else {
        Markers[rPanorama.pano] = ({
            "Points": [],
            "Matches:": [],
            "Position": [rPanorama.getPosition().lat(), rPanorama.getPosition().lng()],
            "Photo": rPanorama.getPhotographerPov()
        });
    }

    if (Markers[rPanorama.pano].Matches) {
        aux = Markers[rPanorama.pano].Matches;
        setMapOnAll(null, Markers[rPanorama.pano].Points);
        setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
        setMapOnAll(rMap, Markers[rPanorama.pano].Matches);
    } else {
        aux = []
    }
    var hd = rPanorama.pov.heading;
    var zm = Math.tan(45 / Math.pow(2, rPanorama.getZoom()) * Math.PI / 180);
    if (load.position !== undefined) {
        var pos = {
            lat: load.position[0],
            lng: load.position[1]
        }
        var lab = "C" + load.index;
        var tit = load.index
    } else {
        var pos = {
            lat: rPanorama.location.latLng.lat() + 2 * Math.cos(Math.PI * hd / 180) / (60 * 1852) / zm,
            lng: rPanorama.location.latLng.lng() + 2 * Math.cos(Math.PI * hd / 180) / (60 * 1852) / zm
        }
        var lab = "C" + String(aux.length);
        var tit = String(aux.length)
    }
    var point = new google.maps.Marker({
        position: {
            lat: rPanorama.location.latLng.lat() + 2 * Math.cos(Math.PI * hd / 180) / (60 * 1852) / zm,
            lng: rPanorama.location.latLng.lng() + 2 * Math.cos(Math.PI * hd / 180) / (60 * 1852) / zm
        },
        map: rMap,
        draggable: true,
        label: lab,
        title: tit,
    });

    aux.push(point)
    google.maps.event.addListener(point, 'click', function() {
        point.setTitle(String((parseInt(point.title, 10) + 1)));
        point.setLabel("C" + String((parseInt(point.title, 10))));
    });

    google.maps.event.addListener(point, 'dblclick', function() {
        var input = document.getElementById('input-match');
        point.setLabel("C" + input.value);
        point.setTitle(input.value);
    });

    google.maps.event.addListener(point, 'drag', function() {
        setMapOnAll(null, Markers[rPanorama.pano].Points);
        setMapOnAll(null, Markers[Object.values(rPanoramas[ntimes])[1]].Pairs);
        setMapOnAll(rMap, Markers[rPanorama.pano].Matches);
    });
    Markers[rPanorama.pano].Matches = aux;

    rPanorama.addListener('zoom_changed', function() {
        ajd = rPanorama.getPov();
        State[0].heading = ajd.heading
        State[0].pitch = ajd.pitch
        State[0].zoom = ajd.zoom
        State[0].fov = (180 / Math.pow(2, State[0].zoom));
        State[0].pano = rPanorama.pano;
        zumn1 = Math.round(2 * State[0].zoom)
        if (zum1 != zumn1 && State[0].pano) {
            zum1 = zumn1;
            State[0].position = [rPanorama.location.latLng.lat(), rPanorama.location.latLng.lng()];
            loadPanoUrl()
        }

    });

    State[1] = {
        heading: 0
    };

    var zum2 = 0
    pPanorama.addListener('zoom_changed', function() {
        ajd = this.getPov();
        State[1].heading = ajd.heading
        State[1].pitch = ajd.pitch
        State[1].zoom = ajd.zoom
        State[1].fov = (180 / Math.pow(2, State[1].zoom));
        State[1].pano = this.pano;

        zumn2 = Math.round(2 * State[1].zoom)
        if (zum2 != zumn2 && State[1].pano) {
            zum2 = zumn2;
            State[1].position = [this.location.latLng.lat(), this.location.latLng.lng()];

            loadPanoUrl()
        }
    });

}

function solverH(child) {

    var funcao1 = function (params, hd, ps) {
        return (Math.abs(Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * (params[0] - ps[0]) + ps[1] - params[1])) * (Math.abs(Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * (params[0] - ps[0]) + ps[1] - params[1])) / (Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) + 1)
    };

    var funcao2 = function (params, hd, ps) {
        return (Math.abs(Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * (params[0] - ps[0]) + ps[1] - params[1])) * (Math.abs(Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * (params[0] - ps[0]) + ps[1] - params[1])) / (Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) + 1)
    };

    var funcao3 = function (params, pt, hd, ps) {
        var v = [
            Math.cos(normalizeAngle(90 - hd) * Math.PI / 180),
            Math.sin(normalizeAngle(90 - hd) * Math.PI / 180),
            0
        ];
        const P0 = [ps[0], ps[1], 0]
        const Q = [params[0], params[1], 0]

        const PQ = subtract(Q, P0);
        const t = dot(PQ, v) / dot(v, v);

        const proj = add(P0, scale(v, t));

        params = [proj[0], proj[1]];
        return Math.sqrt((params[0] - ps[0]) * (params[0] - ps[0]) + (params[1] - ps[1]) * (params[1] - ps[1])) * (Math.tan(pt * Math.PI / 180))
    };

    var objective = function (params) {
        var total = 0.0;
        for (var i = 0; i < child.length / 2; ++i) {
            if (child[2 * i].id.split("&").length == 1) {

                var resultThisDatum1 = funcao1([params[0], params[1]], child[2 * i].sheading, child[2 * i].cPosition)
                //(Math.pow(params[0]-child[2 * i].cPosition[0], 2)+ Math.pow(params[1]-child[2 * i].cPosition[1], 2));
                var resultThisDatum2 = funcao2([params[2], params[3]], child[2 * i + 1].sheading, child[2 * i + 1].cPosition)
                //(Math.pow(params[2]-child[2 * i + 1].cPosition[0], 2)+ Math.pow(params[3]-child[2 * i + 1].cPosition[1], 2));
                var resultThisDatum3 = funcao3([params[2], params[3]], child[2 * i + 1].spitch, child[2 * i + 1].sheading, child[2 * i + 1].cPosition)
                    - funcao3([params[0], params[1]], child[2 * i].spitch, child[2 * i].sheading, child[2 * i].cPosition)
                resultThisDatum3 = Math.pow(params[4] - resultThisDatum3, 2)
                //(Math.pow(params[0]-child[2 * i].cPosition[0], 2)+Math.pow(params[1]-child[2 * i].cPosition[1], 2)+Math.pow(params[2]-child[2 * i + 1].cPosition[0], 2)+Math.pow(params[3]-child[2 * i + 1].cPosition[1], 2));;

                var delta = resultThisDatum1 + resultThisDatum2 + 4 * (resultThisDatum3)

                total += delta
            }
        }
        return total;
    };

    var initial = [0, 0, 0, 0, 0];
    var minimiser = numeric.uncmin(objective, initial)
    var mini = minimiser.solution

    var varianceD = 0
    var varianceH = 0
    var varianceR = 0
    var N = 0
    for (var i = 0; i < child.length / 2; ++i) {

        if (child[2 * i].id.split("&").length == 1) {
            var objective2 = function (params) {
                var total = 0.0;
                var resultThisDatum1 = funcao1([mini[0] + params[0], mini[1] + params[1]], child[2 * i].sheading, child[2 * i].cPosition);
                var resultThisDatum2 = funcao2([mini[2] + params[0], mini[3] + params[1]], child[2 * i + 1].sheading, child[2 * i + 1].cPosition);
                var resultThisDatum3 = funcao3([mini[2] + params[0], mini[3] + params[1]], child[2 * i + 1].spitch, child[2 * i + 1].sheading, child[2 * i + 1].cPosition)
                    - funcao3([mini[0] + params[0], mini[1] + params[1]], child[2 * i].spitch, child[2 * i].sheading, child[2 * i].cPosition)

                resultThisDatum3 = Math.pow(mini[4] - resultThisDatum3, 2);
                var delta = resultThisDatum1 + resultThisDatum2 + 4 * (resultThisDatum3);
                total += delta
                return total;
            };
            var initial = [0, 0];
            var minimiser = numeric.uncmin(objective2, initial)
            var mini2 = minimiser.solution

            var vD = funcao1([mini[0] + mini2[0], mini[1] + mini2[1]], child[2 * i].sheading, child[2 * i].cPosition)
                + funcao2([mini[2] + mini2[0], mini[3] + mini2[1]], child[2 * i + 1].sheading, child[2 * i + 1].cPosition);

            var vH = funcao3([mini[2], mini[3]], child[2 * i + 1].spitch, child[2 * i + 1].sheading, child[2 * i + 1].cPosition)
                - funcao3([mini[0], mini[1]], child[2 * i].spitch, child[2 * i].sheading, child[2 * i].cPosition)

            vH = Math.pow(Math.abs(mini[4]) - Math.abs(vH), 2);

            var Vr = Math.pow(mini[0] - child[2 * i].cPosition[0], 2) + Math.pow(mini[1] - child[2 * i].cPosition[1], 2) +
                Math.pow(mini[2] - child[2 * i + 1].cPosition[0], 2) + Math.pow(mini[3] - child[2 * i + 1].cPosition[1], 2)
            Vr = (Math.pow(Math.tan((1 / 37) * Math.PI / 180), 2) * Vr / (6))

            varianceD += vD
            varianceH += vH
            varianceR += Vr
            N += 1
        }
    }

    var sigmaD = Math.sqrt(varianceD)
    var sigmaH1 = Math.sqrt(varianceH)
    var sigmaH2 = Math.sqrt(varianceR);


    var TtoZ = new Array(48.708214452165244, 11.48955747209132, 5.683429728017456, 3.7909207269803726, 2.9262296683675344, 2.449018247850975, 2.152346300023746, 1.9523018491244912, 1.8092690499229827, 1.7023885604126112, 1.6197379377987728, 1.554053109515788, 1.5006760617797121, 1.4564923568713442, 1.4193458735692075, 1.38769939229789, 1.3604290248993753, 1.3366950053149462, 1.3158578313076081, 1.29742229562672, 1.2809991999462553, 1.2662785865982753, 1.253010654596091, 1.2409919136309646, 1.230054978213468, 1.2200609362108157, 1.210893567256538, 1.2024549098736896, 1.194661825116317, 1.187443305579971, 1.1807383482759786, 1.174494258552857, 1.1686652867539373, 1.1632115240583867, 1.1580980019250842, 1.1532939527465254, 1.1487721990956394, 1.144508646261788, 1.140481858303641, 1.1366727020338454, 1.1330640465999315, 1.1296405088050157, 1.126388236258088, 1.1232947219696368, 1.1203486452090792, 1.1175397343864137, 1.114858648493144, 1.112296874237702)

    var resl = mini[4]
    var larg = Math.sqrt(Math.pow((mini[0] - mini[2]), 2) + Math.pow((mini[3] - mini[1]), 2))
    var diag = Math.sqrt(Math.pow(resl, 2) + Math.pow(larg, 2));

    var sol = [100 * resl, 100 * (TtoZ[N - 2] * sigmaH1 + sigmaH2) / Math.sqrt(N - 1), 100 * larg, 100 * (TtoZ[N - 2] * sigmaD + sigmaH2) / Math.sqrt(N - 1), 100 * diag]
    sol.push(Math.sqrt(Math.pow(sol[1] * sol[0] / sol[4], 2) + Math.pow(sol[3] * sol[2] / sol[4], 2)))
    return sol
}

function solverP() {
    astorPlace = {
        lat: rPanorama.position.lat(),
        lng: rPanorama.position.lng(),
    };

    var contC = countElementsByIdPrefix(document, [rPanorama.getPano() + "&" + pPanorama.getPano()])
    var contP = popupOriginal.document.getElementById("image-original").children.length-1

    var objective = function (params) {
        var total = 0.0;
        var cont = 0

        var C1i = cartesian(rPanorama.position.lat(), rPanorama.position.lng())
        var C2i = cartesian(pPanorama.position.lat(), pPanorama.position.lng())

        var v = subtract(C2i, C1i);
        var pv = [v[0], v[1], 0]

        if (window._marcadoresPLinhasCount > 0 || contC > 0) {
            pv = scale(pv, 1 / norm(pv, pv));
        } else {
            pv = [0, 0, 0];
        }



        v = [-v[1], v[0], 0]

        if (norm(v, v) != 0) {
            var nv = scale(v, 1 / norm(v, v));
        } else {
            var nv = [0, 0, 0];
        }


        C1 = [C1i[0] + params[0] * pv[0], C1i[1] + params[0] * pv[1], 0];
        C2 = [C2i[0] + nv[0] * params[1], C2i[1] + nv[1] * params[1], params[2]];


        for (let kk = 0; kk < contP; kk++) {
            if (popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + String(kk)]) {
                cont = cont + 1

                var child1 = rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "P" + String(kk)];
                var child2 = pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "P" + String(kk)];

                var v1 = [Math.cos(child1.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - child1.sheading) * Math.PI / 180), Math.cos(child1.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - child1.sheading) * Math.PI / 180), Math.sin(child1.spitch * Math.PI / 180)];
                var v2 = [Math.cos(child2.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - child2.sheading) * Math.PI / 180), Math.cos(child2.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - child2.sheading) * Math.PI / 180), Math.sin(child2.spitch * Math.PI / 180)];

                var resultThisDatum = computeShortestSegment(C1, v1, C2, v2);
                if (cont + 1 > parseInt(document.querySelector('#input-points input').value) + 1) {
                    total += Math.pow(resultThisDatum.distance,2);

                }
                popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + String(kk)].Point = resultThisDatum.midpoint;

                popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + String(kk)].err = Math.sqrt(resultThisDatum.distance);

                rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "P" + String(kk)].camera = C1;
                pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "P" + String(kk)].camera = C2;

                if (cont < parseInt(document.querySelector('#input-points input').value) + 1) {// console.log(kk,resultThisDatum.midpoint,resultThisDatum.distance/2)
                }
            }
        }

        for (let kk = contP; kk < popupOriginal.document.all.length; kk++) {
            var par = popupOriginal.document.all[kk].id.split("&");
            if (par.length == 2) {
                if (popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + par[0]] && popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + par[1]]) {
                    var I1 = popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + par[0]].Point
                    var I2 = popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + par[1]].Point
                    var distance = norm(subtract(I1, I2));
                    var reference = parseFloat(popupOriginal.document.all[kk + 2].value) / 100;

                    total += Math.pow((distance - reference), 2);
                }
            }
        }

        for (let kk = 0; kk < contC; kk++) {
            if (rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "&" + pPanorama.getPano() + "C" + String(kk)] &&
                pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "&" + rPanorama.getPano() + "C" + String(kk)]) {

                var child1 = rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "&" + pPanorama.getPano() + "C" + String(kk)];
                var child2 = pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "&" + rPanorama.getPano() + "C" + String(kk)];

                var v1 = [Math.cos(child1.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - child1.sheading) * Math.PI / 180), Math.cos(child1.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - child1.sheading) * Math.PI / 180), Math.sin(child1.spitch * Math.PI / 180)];
                var v2 = [Math.cos(child2.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - child2.sheading) * Math.PI / 180), Math.cos(child2.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - child2.sheading) * Math.PI / 180), Math.sin(child2.spitch * Math.PI / 180)];

                var resultThisDatum = computeShortestSegment(C1, v1, C2, v2);

                if (kk % 2 === 0) {
                    var I1 = resultThisDatum.midpoint;
                    total += resultThisDatum.distance;
                } else {
                    var I2 = resultThisDatum.midpoint;
                    var distance = norm(subtract(I1, I2));
                    var reference = parseFloat(child1.reference) / 100;
                    rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "&" + pPanorama.getPano() + "C" + String(kk-1)].innerText=
                    rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "&" + pPanorama.getPano() + "C" + String(kk-1)].IDs+" ("+100*distance.toFixed(2)+")";
                    pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "&" + rPanorama.getPano() + "C" + String(kk-1)].innerText=
                    pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "&" + rPanorama.getPano() + "C" + String(kk-1)].IDs+" ("+100*distance.toFixed(2)+")";
                    total += Math.pow(resultThisDatum.distance,2);
                    total += Math.pow((distance - reference), 2);
                }
            }
        }
        return total;
    };

    var initial = [0, 0, 0]
    var minimiser = numeric.uncmin(objective, initial)
    var sol = minimiser;
    dados = [];

    for (kk = 0; kk < contP; kk++) {
        if (popupOriginal.document.getElementById("image-original").children[kk + 1].Point!= undefined) {
            NameQ = popupOriginal.document.getElementById("image-original").children[kk + 1].IDz;
            numb = countElementsByIdPrefix(popupOriginal.document, NameQ);

            pano = popupOriginal.document.getElementById("image-original").children[kk + 1].IDz.split("&");

            var loc = popupOriginal.document.getElementById("image-original").children[kk + 1].Point
            var uu = parseInt(popupOriginal.document.getElementById("image-original").children[kk + 1].style.left) + Math.round(popupOriginal.document.getElementById("image-original").children.image.height / (5 * SVO.markerHeight)) / 2
            var vv = parseInt(popupOriginal.document.getElementById("image-original").children[kk + 1].style.top) + Math.round(popupOriginal.document.getElementById("image-original").children.image.height / (5 * SVO.markerHeight)) / 2

            if (rPanorama.__gm.panes.overlayLayer.children[pano[0] + "P" + String(kk)]) {
                var sh1 = rPanorama.__gm.panes.overlayLayer.children[pano[0] + "P" + String(kk)].sheading;
                var sp1 = rPanorama.__gm.panes.overlayLayer.children[pano[0] + "P" + String(kk)].spitch;
            } else {
                var sh1 = pPanorama.__gm.panes.overlayLayer.children[pano[0] + "P" + String(kk)].sheading;
                var sp1 = pPanorama.__gm.panes.overlayLayer.children[pano[0] + "P" + String(kk)].spitch;
            }

            if (rPanorama.__gm.panes.overlayLayer.children[pano[1] + "P" + String(kk)]) {
                var sh2 = rPanorama.__gm.panes.overlayLayer.children[pano[1] + "P" + String(kk)].sheading;
                var sp2 = rPanorama.__gm.panes.overlayLayer.children[pano[1] + "P" + String(kk)].spitch;
            } else {
                var sh2 = pPanorama.__gm.panes.overlayLayer.children[pano[1] + "P" + String(kk)].sheading;
                var sp2 = pPanorama.__gm.panes.overlayLayer.children[pano[1] + "P" + String(kk)].spitch;
            }

            dados = dados + popupOriginal.document.getElementById("image-original").children[kk + 1].IDz + ";" + loc[0] + ";" + loc[1] + ";" + loc[2] + ";" + uu + ";" + vv + ";" + popupOriginal.document.getElementById("image-original").children[kk + 1].err + ";" + sh1 + ";" + sh2 + ";" + sp1 + ";" + sp2 + "\r\n";
        }
    }
    return sol
}

function solverC() {
    var objective = function (params) {
        var total = 0.0;
        var cont = countElementsByIdPrefix(document, [rPanorama.getPano() + "&" + pPanorama.getPano()])
        if (rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "&" + pPanorama.getPano() + "C" + 0] &&
            pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "&" + rPanorama.getPano() + "C" + 0]) {


            var C1i = cartesian(rPanorama.position.lat(), rPanorama.position.lng())
            var C2i = cartesian(pPanorama.position.lat(), pPanorama.position.lng())

            var v = subtract(C2i, C1i);
            var pv = [v[0], v[1], 0]
            pv = scale(pv, 1 / norm(pv, pv));

            v = [-v[1], v[0], 0]
            if (norm(v, v) != 0) {
                var nv = scale(v, 1 / norm(v, v));
            } else {
                var nv = [0, 0, 0];
            }

            C1 = [C1i[0] , C1i[1] , 0];
            C2 = [C2i[0] +  params[0], C2i[1] + params[1], params[2]];

            for (let kk = 0; kk < cont; kk++) {
                if (rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "&" + pPanorama.getPano() + "C" + String(kk)] &&
                    pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "&" + rPanorama.getPano() + "C" + String(kk)]) {

                    var child1 = rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "&" + pPanorama.getPano() + "C" + String(kk)];
                    var child2 = pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "&" + rPanorama.getPano() + "C" + String(kk)];

                    var v1 = [Math.cos(child1.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - child1.sheading) * Math.PI / 180), Math.cos(child1.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - child1.sheading) * Math.PI / 180), Math.sin(child1.spitch * Math.PI / 180)];
                    var v2 = [Math.cos(child2.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - child2.sheading) * Math.PI / 180), Math.cos(child2.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - child2.sheading) * Math.PI / 180), Math.sin(child2.spitch * Math.PI / 180)];

                    var resultThisDatum = computeShortestSegment(C1, v1, C2, v2);
                    total += Math.pow(resultThisDatum.distance/(norm(subtract(C1, resultThisDatum.midpoint))+norm(subtract(C2, resultThisDatum.midpoint))), 2);


                    if (kk % 2 === 0) {
                        var I1 = resultThisDatum.midpoint;
                    } else {
                        var I2 = resultThisDatum.midpoint;
                        var distance = norm(subtract(I1, I2));
                        rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "&" + pPanorama.getPano() + "C" + String(kk-1)].innerText=
                        rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "&" + pPanorama.getPano() + "C" + String(kk-1)].IDs+" ("+100*distance.toFixed(2)+")";
                        pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "&" + rPanorama.getPano() + "C" + String(kk-1)].innerText=
                        pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "&" + rPanorama.getPano() + "C" + String(kk-1)].IDs+" ("+100*distance.toFixed(2)+")";
                        var reference = parseFloat(child1.reference) / 100;
                        total += Math.pow((distance - reference)/(norm(subtract(C1, I2))+norm(subtract(C2, I2))), 2);
                    }
                    if (rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "B"] &&
                        rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "B"]) {
                        rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "A"].cPosition = C1;
                        rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "B"].cPosition = C1;
                        rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "A"].cPosition = C2;
                        rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "B"].cPosition = C2;
                    }
                }
            }

            if (rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "B"] &&
                rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "B"] &&
                cont > 0) {
                var childA1 = rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "A"];
                var childB1 = rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "B"];
                var childA2 = rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "A"];
                var childB2 = rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "B"];


                var vA1 = [Math.cos(childA1.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - childA1.sheading) * Math.PI / 180), Math.cos(childA1.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - childA1.sheading) * Math.PI / 180), Math.sin(childA1.spitch * Math.PI / 180)];
                var vA2 = [Math.cos(childA2.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - childA2.sheading) * Math.PI / 180), Math.cos(childA2.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - childA2.sheading) * Math.PI / 180), Math.sin(childA2.spitch * Math.PI / 180)];

                var resultThisDatum = computeShortestSegment(C1, vA1, C2, vA2);
                total += Math.pow(resultThisDatum.distance/norm(subtract(C1, resultThisDatum.midpoint)), 2)  ;

                var vB1 = [Math.cos(childB1.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - childB1.sheading) * Math.PI / 180), Math.cos(childB1.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - childB1.sheading) * Math.PI / 180), Math.sin(childB1.spitch * Math.PI / 180)];
                var vB2 = [Math.cos(childB2.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - childB2.sheading) * Math.PI / 180), Math.cos(childB2.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - childB2.sheading) * Math.PI / 180), Math.sin(childB2.spitch * Math.PI / 180)];

                var resultThisDatum = computeShortestSegment(C1, vB1, C2, vB2);
                total += Math.pow(resultThisDatum.distance/norm(subtract(C2, resultThisDatum.midpoint)), 2);

                rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "A"].cPosition = C1;
                rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + rPanorama.getPano() + "B"].cPosition = C1;
                rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "A"].cPosition = C2;
                rPanorama.__gm.panes.overlayLayer.children[JSON.stringify(Object.values(rPanoramas[ntimes])[1]).substring(1, 11) + pPanorama.getPano() + "B"].cPosition = C2;
            }
        }
        return total;
    };

    var initial = [0, 0, 0]
    var minimiser = numeric.uncmin(objective, initial)
    var sol = minimiser;
    return sol
}


function computeShortestSegment(C1, v1, C2, v2) {
    const w = subtract(C2, C1);
    const n = cross(v1, v2);
    const nNormSq = dot(n, n);

    Int = intersecaoPlanoXY(C1, v1, C2, v2);

    if (nNormSq === 0) {
        throw new Error("Retas paralelas ou coincidentes.");
    }

    const D = scale(n, dot(w, n) / nNormSq);
    var objective = function (params) {
        var resultThisDatum1 = subtract([params[0], params[1], 0], Int);
        var resultThisDatum2 = norm(subtract([params[0], params[1], 0], [C1[0], C1[1], 0])) * v1[2] /
            Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
        var resultThisDatum3 = norm(subtract([params[0], params[1], 0], [C2[0], C2[1], 0])) * v2[2] /
            Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
        var delta = dot(resultThisDatum1, resultThisDatum1)
            + Math.pow(resultThisDatum2 - resultThisDatum3 - C2[2], 2);
        return delta;
    };

    var initial = [0, 0];

    var minimiser = numeric.uncmin(objective, initial)

    const midpoint = minimiser.solution;

    midpoint[2] = norm(subtract([midpoint[0], midpoint[1], 0], [C1[0], C1[1], 0])) * v1[2] /
        Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const distance = minimiser.f;
    return {
        distance,
        midpoint
    };
}


function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scale(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
}

function norm(v) {
    return Math.sqrt(dot(v, v));
}

function project(a, b) {
    const scaleFactor = dot(a, b) / dot(b, b);
    return scale(b, scaleFactor);
}

function intersecaoPlanoXY(C1, v1, C2, v2) {
    // Garante que os vetores sejam 3D
    const to3D = v => [v[0], v[1], v[2] ?? 0];

    const A = to3D(C1);
    const B = to3D(v1);
    const C = to3D(C2);
    const D = to3D(v2);

    // Ignora componente Z
    const Ax = A[0], Ay = A[1];
    const Bx = B[0], By = B[1];
    const Cx = C[0], Cy = C[1];
    const Dx = D[0], Dy = D[1];

    // Determinante (produto vetorial escalar 2D)
    const det = Bx * Dy - By * Dx;
    if (Math.abs(det) < 1e-12) {
        // Retas paralelas ou coincidentes
        return null;
    }

    // Cálculo do parâmetro t (para a reta 1)
    const t = ((Cx - Ax) * Dy - (Cy - Ay) * Dx) / det;

    // Ponto de interseção (no plano XY)
    const Px = Ax + t * Bx;
    const Py = Ay + t * By;

    // Mantém Z = 0 explicitamente
    return [Px, Py, 0];
}




function solver(Calibration) {

    var funcao = function (params, Pr, Pp, Cr, Cp, Nv) {

        return (((params[0] * (Pr[1] - Cr[1]) / (params[1] + params[0] - Nv[0] * (Pr[0] - Cr[0]) - Nv[1] * (Pr[1] - Cr[1])) + Cr[1]) - (params[0] * (Pp[1] - Cp[1]) / (params[1] + params[0] - Nv[0] * (Pp[0] - Cp[0]) - Nv[1] * (Pp[1] - Cp[1])) + Cp[1])) * ((params[0] * (Pr[1] - Cr[1]) / (params[1] + params[0] - Nv[0] * (Pr[0] - Cr[0]) - Nv[1] * (Pr[1] - Cr[1])) + Cr[1]) - (params[0] * (Pp[1] - Cp[1]) / (params[1] + params[0] - Nv[0] * (Pp[0] - Cp[0]) - Nv[1] * (Pp[1] - Cp[1])) + Cp[1])) + ((params[0] * (Pr[0] - Cr[0]) / (params[1] + params[0] - Nv[0] * (Pr[0] - Cr[0]) - Nv[1] * (Pr[1] - Cr[1])) + Cr[0]) - (params[0] * (Pp[0] - Cp[0]) / (params[1] + params[0] - Nv[0] * (Pp[0] - Cp[0]) - Nv[1] * (Pp[1] - Cp[1])) + Cp[0])) * ((params[0] * (Pr[0] - Cr[0]) / (params[1] + params[0] - Nv[0] * (Pr[0] - Cr[0]) - Nv[1] * (Pr[1] - Cr[1])) + Cr[0]) - (params[0] * (Pp[0] - Cp[0]) / (params[1] + params[0] - Nv[0] * (Pp[0] - Cp[0]) - Nv[1] * (Pp[1] - Cp[1])) + Cp[0])));
    };

    var objective = function (params) {
        var total = 0.0;
        for (var i = 0; i < Calibration.Pt[0].length; ++i) {
            var resultThisDatum = funcao(params, Calibration.Pt[0][i], Calibration.Pt[1][i], Calibration.Cm[0][i], Calibration.Cm[1][i], Calibration.Nv[i]);
            var delta = resultThisDatum;
            total += delta;
        }
        return total;
    };

    var initial = [3, 0];
    var minimiser = numeric.uncmin(objective, initial);

    var TtoZ = new Array(24.7210645292706, 3.85430803919157, 2.26831429504208, 1.78799800829126, 1.56588077031271, 1.43977787235914, 1.35902263974776, 1.30306304129452, 1.26207205498723, 1.23078550392891, 1.20613845263661, 1.18622896675453, 1.16981585969576, 1.15605543082363, 1.14435451785446, 1.13428412521363, 1.12552641540871, 1.11784096028684, 1.11104256561747, 1.10498629506257, 1.09955710991186, 1.09466254780588, 1.09022745000777, 1.08619009894154, 1.08249934511727, 1.07911244012803, 1.07599338140668, 1.07311163318891, 1.07044112763907, 1.06795947711349);

    minimiser.solution.push(TtoZ[Calibration.Pt[0].length - 1] * Math.sqrt(minimiser.f / (Calibration.Pt[0].length - 1)))
    return minimiser.solution
}

function solverC_old(point, Cal) {
    var objective = function (params) {
        Ra1 = new Array()
        Ra2 = new Array()

        R1 = cartesian(params[0], params[1])
        R2 = cartesian(point.Pos[0], point.Pos[0])

        C1 = cartesian(rPanorama.location.latLng.lat(), rPanorama.location.latLng.lng())
        C2 = cartesian(point.Cam[0], point.Cam[1])

        H = Cal.cal

        rphoto = rPanorama.getPhotographerPov()

        Nv1 = normalV(rphoto);
        Nv2 = normalV(point.rPh)

        Nv = [(Nv1[0] + Nv2[0]) / 2, (Nv1[1] + Nv2[1]) / 2];

        for (ii = 0; ii < 2; ii++) {
            Ra1[ii] = H[0] * (R1[ii] - C1[ii]) / (H[0] + H[1] - Nv[0] * (R1[0] - C1[0]) - Nv[1] * (R1[1] - C1[1])) + C1[ii]
            Ra2[ii] = H[0] * (R2[ii] - C2[ii]) / (H[0] + H[1] - Nv[0] * (R2[0] - C2[0]) - Nv[1] * (R2[1] - C2[1])) + C2[ii]
        }
        var d = ((Ra1[0] - Ra2[0]) * (Ra1[0] - Ra2[0]) + (Ra1[1] - Ra2[1]) * (Ra1[1] - Ra2[1]))
        return d
    };

    var initial = [rPanorama.location.latLng.lat(), rPanorama.location.latLng.lng()];
    var minimiser = numeric.uncmin(objective, initial, 1e-12);


    return minimiser.solution
}

function solverH_old1(child) {


    var funcao1 = function (params, hd, ps) {
        return (Math.abs(Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * (params[0] - ps[0]) + ps[1] - params[1])) * (Math.abs(Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * (params[0] - ps[0]) + ps[1] - params[1])) / (Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) + 1)
    };

    var funcao2 = function (params, hd, ps) {
        return (Math.abs(Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * (params[0] - ps[0]) + ps[1] - params[1])) * (Math.abs(Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * (params[0] - ps[0]) + ps[1] - params[1])) / (Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) + 1)
    };

    var funcao3 = function (params, pt, hd, ps) {
        var v = [
            Math.cos(normalizeAngle(90 - hd) * Math.PI / 180),
            Math.sin(normalizeAngle(90 - hd) * Math.PI / 180),
            0
        ];
        const P0 = [ps[0], ps[1], 0]
        const Q = [params[0], params[1], 0]

        const PQ = subtract(Q, P0);
        const t = dot(PQ, v) / dot(v, v);

        const proj = add(P0, scale(v, t));

        // params = [proj[0],proj[1]];
        return Math.sqrt((params[0] - ps[0]) * (params[0] - ps[0]) + (params[1] - ps[1]) * (params[1] - ps[1])) * (Math.tan(pt * Math.PI / 180))
    };

    var objective = function (params) {
        var total = 0.0;
        for (var i = 0; i < child.length / 2; ++i) {
            var resultThisDatum1 = funcao1([params[0], params[1]], child[2 * i].sheading, child[2 * i].cPosition);
            var resultThisDatum2 = funcao2([params[2], params[3]], child[2 * i + 1].sheading, child[2 * i + 1].cPosition);
            var resultThisDatum3 = funcao3([params[2], params[3]], child[2 * i + 1].spitch, child[2 * i + 1].sheading, child[2 * i + 1].cPosition)
                - funcao3([params[0], params[1]], child[2 * i].spitch, child[2 * i].sheading, child[2 * i].cPosition)
            resultThisDatum3 = Math.pow(params[4] - Math.abs(resultThisDatum3), 2);


            var delta = resultThisDatum1 + resultThisDatum2 + resultThisDatum3

            total += delta
        }
        return total;
    };

    var initial = [0, 0, 0, 0, 0];
    var minimiser = numeric.uncmin(objective, initial)
    var mini = minimiser.solution

    var varianceD = 0
    var varianceH = 0
    var varianceR = 0
    for (var i = 0; i < child.length / 2; ++i) {
        var objective2 = function (params) {
            var total = 0.0;
            var resultThisDatum1 = funcao1([mini[0] + params[0], mini[1] + params[1]], child[2 * i].sheading, child[2 * i].cPosition);
            var resultThisDatum2 = funcao2([mini[2] + params[0], mini[3] + params[1]], child[2 * i + 1].sheading, child[2 * i + 1].cPosition);
            var resultThisDatum3 = funcao3([mini[2] + params[0], mini[3] + params[1]], child[2 * i + 1].spitch, child[2 * i + 1].sheading, child[2 * i + 1].cPosition)
                - funcao3([mini[0] + params[0], mini[1] + params[1]], child[2 * i].spitch, child[2 * i].sheading, child[2 * i].cPosition)

            resultThisDatum3 = Math.pow(mini[4] - Math.abs(resultThisDatum3), 2);
            var delta = resultThisDatum1 + resultThisDatum2 + resultThisDatum3
            total += delta
            return total;
        };
        var initial = [0, 0];
        var minimiser = numeric.uncmin(objective2, initial)
        var mini2 = minimiser.solution

        var vD = funcao1([mini[0] + mini2[0], mini[1] + mini2[1]], child[2 * i].sheading, child[2 * i].cPosition)
            + funcao2([mini[2] + mini2[0], mini[3] + mini2[1]], child[2 * i + 1].sheading, child[2 * i + 1].cPosition);

        var vH = funcao3([mini[2], mini[3]], child[2 * i + 1].spitch, child[2 * i + 1].sheading, child[2 * i + 1].cPosition)
            - funcao3([mini[0], mini[1]], child[2 * i].spitch, child[2 * i].sheading, child[2 * i].cPosition)


        vH = Math.pow(mini[4] - Math.abs(vH), 2);



        var Vr = Math.pow(mini[0] - child[2 * i].cPosition[0], 2) + Math.pow(mini[1] - child[2 * i].cPosition[1], 2) +
            Math.pow(mini[2] - child[2 * i + 1].cPosition[0], 2) + Math.pow(mini[3] - child[2 * i + 1].cPosition[1], 2)
        Vr = (Math.pow(Math.tan((1 / 37) * Math.PI / 180), 2) * Vr / (6))

        varianceD += vD
        varianceH += vH
        varianceR += Vr
    }

    var sigmaD = Math.sqrt(varianceD)
    var sigmaH1 = Math.sqrt(varianceH)

    var TtoZ = new Array(24.7210645292706, 3.85430803919157, 2.26831429504208, 1.78799800829126, 1.56588077031271, 1.43977787235914, 1.35902263974776, 1.30306304129452, 1.26207205498723, 1.23078550392891, 1.20613845263661, 1.18622896675453, 1.16981585969576, 1.15605543082363, 1.14435451785446, 1.13428412521363, 1.12552641540871, 1.11784096028684, 1.11104256561747, 1.10498629506257, 1.09955710991186, 1.09466254780588, 1.09022745000777, 1.08619009894154, 1.08249934511727, 1.07911244012803, 1.07599338140668, 1.07311163318891, 1.07044112763907, 1.06795947711349);
    var resl = mini[4]
    var larg = Math.sqrt(Math.pow((mini[0] - mini[2]), 2) + Math.pow((mini[3] - mini[1]), 2))
    var diag = Math.sqrt(Math.pow(resl, 2) + Math.pow(larg, 2));
    var sigmaH2 = Math.sqrt(varianceR);

    var sol = [100 * resl, 100 * (TtoZ[child.length / 2 - 2] * sigmaH1 + 2 * sigmaH2) / Math.sqrt(child.length / 2), 100 * larg, 100 * (TtoZ[child.length / 2 - 2] * sigmaD + sigmaH2) / Math.sqrt(child.length / 2 - 1), 100 * diag]
    sol.push(Math.sqrt(Math.pow(sol[1] * sol[0] / sol[4], 2) + Math.pow(sol[3] * sol[2] / sol[4], 2)))
    return sol
}

function solverH_old2(child) {
    var funcao = function (params, hd, ps) {
        return (Math.abs(Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * (params[0] - ps[0]) + ps[1] - params[1])) * (Math.abs(Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * (params[0] - ps[0]) + ps[1] - params[1])) / (Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) * Math.tan(normalizeAngle(90 - hd) * Math.PI / 180) + 1)
    };

    var objective1 = function (params) {
        var total = 0.0;
        for (var i = 0; i < child.length / 2; ++i) {
            var resultThisDatum = funcao(params, child[2 * i].sheading, child[2 * i].cPosition);
            var delta = resultThisDatum;
            total += delta
        }
        return total;
    };

    var objective2 = function (params) {
        var total = 0.0;
        for (var i = 0; i < child.length / 2; ++i) {
            var resultThisDatum = funcao(params, child[2 * i + 1].sheading, child[2 * i + 1].cPosition);
            var delta = resultThisDatum;
            total += delta
        }
        return total;
    };

    var initial = [0, 0];
    var minimiser1 = numeric.uncmin(objective1, initial)
    var minimiser2 = numeric.uncmin(objective2, initial)
    var minimiser = minimiser1.solution
    minimiser.push(minimiser2.solution[0])
    minimiser.push(minimiser2.solution[1])

    minimiser.push(Math.sqrt(((minimiser1.f) + (minimiser2.f))) / (child.length / 2 - 1))
    var tot = 0.0;
    var tot2 = 0.0;
    var totd = 0.0;

    for (var i = 0; i < child.length / 2; ++i) {

        var resultThisM = Math.sqrt((minimiser[2] - child[2 * i + 1].cPosition[0]) * (minimiser[2] - child[2 * i + 1].cPosition[0]) + (minimiser[3] - child[2 * i + 1].cPosition[1]) * (minimiser[3] - child[2 * i + 1].cPosition[1])) * (Math.tan(child[2 * i + 1].spitch * Math.PI / 180)) - Math.sqrt((minimiser[0] - child[2 * i].cPosition[0]) * (minimiser[0] - child[2 * i].cPosition[0]) + (minimiser[1] - child[2 * i].cPosition[1]) * (minimiser[1] - child[2 * i].cPosition[1])) * (Math.tan(child[2 * i].spitch * Math.PI / 180));

        var resultThisM2 = Math.pow(Math.sqrt((minimiser[2] - child[2 * i + 1].cPosition[0]) * (minimiser[2] - child[2 * i + 1].cPosition[0]) + (minimiser[3] - child[2 * i + 1].cPosition[1]) * (minimiser[3] - child[2 * i + 1].cPosition[1])) * (Math.tan(child[2 * i + 1].spitch * Math.PI / 180)) - Math.sqrt((minimiser[0] - child[2 * i].cPosition[0]) * (minimiser[0] - child[2 * i].cPosition[0]) + (minimiser[1] - child[2 * i].cPosition[1]) * (minimiser[1] - child[2 * i].cPosition[1])) * (Math.tan(child[2 * i].spitch * Math.PI / 180)), 2);

        var resultThisMd = minimiser[4] * (Math.tan(child[2 * i + 1].spitch * Math.PI / 180) - Math.tan(child[2 * i].spitch * Math.PI / 180));

        tot += resultThisM
        tot2 += resultThisM2
        totd += resultThisMd
    }

    // console.log(child)
    var TtoZ = new Array(24.7210645292706, 3.85430803919157, 2.26831429504208, 1.78799800829126, 1.56588077031271, 1.43977787235914, 1.35902263974776, 1.30306304129452, 1.26207205498723, 1.23078550392891, 1.20613845263661, 1.18622896675453, 1.16981585969576, 1.15605543082363, 1.14435451785446, 1.13428412521363, 1.12552641540871, 1.11784096028684, 1.11104256561747, 1.10498629506257, 1.09955710991186, 1.09466254780588, 1.09022745000777, 1.08619009894154, 1.08249934511727, 1.07911244012803, 1.07599338140668, 1.07311163318891, 1.07044112763907, 1.06795947711349);
    var resl = Math.abs(tot / (child.length / 2))

    var sigmaH1 = Math.sqrt((2 * tot2 / child.length - Math.pow(2 * tot / child.length, 2)));

    var larg = Math.sqrt(Math.pow((minimiser[0] - minimiser[2]), 2) + Math.pow((minimiser[3] - minimiser[1]), 2))
    var diag = Math.sqrt(Math.pow(resl, 2) + Math.pow(larg, 2));
    var sigmaH2 = totd;

    var sol = [100 * resl, 100 * TtoZ[child.length / 2 - 2] * (sigmaH1 + sigmaH2) / Math.sqrt(child.length / 2), 100 * larg, 100 * TtoZ[child.length / 2 - 2] * (minimiser[4]) / Math.sqrt(child.length / 2 - 1), 100 * diag]
    sol.push(Math.sqrt(Math.pow(sol[1] * sol[0] / sol[4], 2) + Math.pow(sol[3] * sol[2] / sol[4], 2)))
    return sol
}


function solverP_old() {

    var objective = function (params) {
        var total = 0.0;
        var cont = 0
        for (let kk = 0; kk < popupOriginal.document.all.length - 8 - 3 * window._marcadoresPLinhasCount; kk++) {
            if (popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + String(kk)]) {
                cont = cont + 1

                var child1 = rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "P" + String(kk)];
                var child2 = pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "P" + String(kk)];

                var P1 = cartesian(rPanorama.position.lat(), rPanorama.position.lng())
                var P2 = cartesian(pPanorama.position.lat(), pPanorama.position.lng())

                var v = subtract(P2, P1);
                var pv = [v[0], v[1], 0]

                if (window._marcadoresPLinhasCount > 0) {
                    pv = scale(pv, 1 / norm(pv, pv));
                } else {
                    pv = [0, 0, 0];
                }

                v = [-v[1], v[0], 0]

                if (norm(v, v) != 0) {
                    var nv = scale(v, 1 / norm(v, v));
                } else {
                    var nv = [0, 0, 0];
                }

                P1 = [P1[0] + params[0] * pv[0], P1[1] + params[0] * pv[1], 0];
                P2 = [P2[0] + nv[0] * params[1], P2[1] + nv[1] * params[1], params[2]];

                var v1 = [Math.cos(child1.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - child1.sheading) * Math.PI / 180), Math.cos(child1.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - child1.sheading) * Math.PI / 180), Math.sin(child1.spitch * Math.PI / 180)];
                var v2 = [Math.cos(child2.spitch * Math.PI / 180) * Math.cos(normalizeAngle(90 - child2.sheading) * Math.PI / 180), Math.cos(child2.spitch * Math.PI / 180) * Math.sin(normalizeAngle(90 - child2.sheading) * Math.PI / 180), Math.sin(child2.spitch * Math.PI / 180)];

                var resultThisDatum = computeShortestSegment(P1, v1, P2, v2);
                if (cont + 1 > parseInt(document.querySelector('#input-points input').value) + 1) {
                    total += Math.pow(resultThisDatum.distance, 2);
                }
                popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + String(kk)].Point = resultThisDatum.midpoint;

                popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + String(kk)].err = resultThisDatum.distance / 2;

                rPanorama.__gm.panes.overlayLayer.children[rPanorama.getPano() + "P" + String(kk)].camera = P1;
                pPanorama.__gm.panes.overlayLayer.children[pPanorama.getPano() + "P" + String(kk)].camera = P2;

                if (cont < parseInt(document.querySelector('#input-points input').value) + 1) {// console.log(kk,resultThisDatum.midpoint,resultThisDatum.distance/2)
                }

            }

        }

        for (let kk = popupOriginal.document.all.length - 3 * window._marcadoresPLinhasCount; kk < popupOriginal.document.all.length; kk++) {

            var par = popupOriginal.document.all[kk].id.split("&");
            if (par.length == 2) {
                if (popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + par[0]] && popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + par[1]]) {

                    var I1 = popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + par[0]].Point
                    var I2 = popupOriginal.document.all[combineStringsCommutative(rPanorama.getPano(), pPanorama.getPano()) + "Q" + par[1]].Point

                    var distance = norm(subtract(I1, I2));
                    var reference = parseFloat(popupOriginal.document.all[kk + 2].value) / 100;

                    total += Math.pow(distance - reference, 2);

                }
            }
        }
        return total;
    };

    var initial = [0, 0, 0]
    var minimiser = numeric.uncmin(objective, initial)
    var sol = minimiser;

    dados = [];

    for (kk = 0; kk < popupOriginal.document.all.length - 8 - 3 * window._marcadoresPLinhasCount; kk++) {
        NameQ = popupOriginal.document.getElementById("image-original").children[kk + 1].IDz;
        numb = countElementsByIdPrefix(popupOriginal.document, NameQ);

        pano = popupOriginal.document.getElementById("image-original").children[kk + 1].IDz.split("&");

        var loc = popupOriginal.document.getElementById("image-original").children[kk + 1].Point
        var uu = parseInt(popupOriginal.document.getElementById("image-original").children[kk + 1].style.left) + SVO.markerWidth / 4 - 1
        var vv = parseInt(popupOriginal.document.getElementById("image-original").children[kk + 1].style.top) + SVO.markerWidth / 4 - 1

        if (rPanorama.__gm.panes.overlayLayer.children[pano[0] + "P" + String(kk)]) {
            var sh1 = rPanorama.__gm.panes.overlayLayer.children[pano[0] + "P" + String(kk)].sheading;
            var sp1 = rPanorama.__gm.panes.overlayLayer.children[pano[0] + "P" + String(kk)].spitch;
        } else {
            var sh1 = pPanorama.__gm.panes.overlayLayer.children[pano[0] + "P" + String(kk)].sheading;
            var sp1 = pPanorama.__gm.panes.overlayLayer.children[pano[0] + "P" + String(kk)].spitch;
        }

        if (rPanorama.__gm.panes.overlayLayer.children[pano[1] + "P" + String(kk)]) {
            var sh2 = rPanorama.__gm.panes.overlayLayer.children[pano[1] + "P" + String(kk)].sheading;
            var sp2 = rPanorama.__gm.panes.overlayLayer.children[pano[1] + "P" + String(kk)].spitch;
        } else {
            var sh2 = pPanorama.__gm.panes.overlayLayer.children[pano[1] + "P" + String(kk)].sheading;
            var sp2 = pPanorama.__gm.panes.overlayLayer.children[pano[1] + "P" + String(kk)].spitch;
        }

        dados = dados + popupOriginal.document.getElementById("image-original").children[kk + 1].IDz + ";" + loc[0] + ";" + loc[1] + ";" + loc[2] + ";" + uu + ";" + vv + ";" + popupOriginal.document.getElementById("image-original").children[kk + 1].err + ";" + sh1 + ";" + sh2 + ";" + sp1 + ";" + sp2 + "\r\n";
    }
    return sol
}

function computeShortestSegment_old(C1, v1, C2, v2) {
    const w = subtract(C2, C1);
    const n = cross(v1, v2);
    const nNormSq = dot(n, n);

    if (nNormSq === 0) {
        throw new Error("As retas são paralelas ou coincidentes.");
    }

    const D = scale(n, dot(w, n) / nNormSq);

    var objective = function (params) {
        var resultThisDatum1 = cross(subtract(params, C1), v1);
        var resultThisDatum2 = cross(subtract(add(params, D), C2), v2);
        var delta = dot(resultThisDatum1, resultThisDatum1) + dot(resultThisDatum2, resultThisDatum2);
        return delta;
    };

    var initial = [0, 0, 0];

    var minimiser = numeric.uncmin(objective, initial)

    const midpoint = add(minimiser.solution, scale(D, 0.5));
    const distance = minimiser.f;

    return {
        distance,
        midpoint
    };
}

        function calibrateCamera() {
            // Pontos no mundo real (em 3D, Z ≠ 0 para generalização)
            const objectPoints = [
                [0, 0, 0],
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
                [0, 0, 1],
                [1, 0, 1],
                [1, 1, 1],
                [0, 1, 1]
            ];

            // Pontos correspondentes na imagem (2D)
            const imagePoints = [
                [150, 150],
                [400, 150],
                [400, 400],
                [150, 400],
                [200, 200],
                [450, 200],
                [450, 450],
                [200, 450]
            ];

            // Converter pontos para Matrices (cv.Mat)
            let objectPointsMat = cv.matFromArray(objectPoints.length, 1, cv.CV_32FC3, objectPoints.flat());
            let imagePointsMat = cv.matFromArray(imagePoints.length, 1, cv.CV_32FC2, imagePoints.flat());

            // Estimativa inicial para a matriz da câmera (3x3)
            const cameraMatrixArray = [
                1, 0, 0,  // f_x, c_x
                0, 1, 0,  // f_y, c_y
                0, 0, 1   // 1
            ];
            let cameraMatrix = cv.matFromArray(3, 3, cv.CV_32F, cameraMatrixArray);

            // Estimativa inicial para os parâmetros de distorção (sem distorção)
            let distCoeffs = cv.matFromArray(1, 5, cv.CV_32F, [0, 0, 0, 0, 0]);

            // Usar solvePnP para estimar a pose da câmera
            let rvec = new cv.Mat();
            let tvec = new cv.Mat();
            let success = cv.solvePnP(objectPointsMat, imagePointsMat, cameraMatrix, distCoeffs, rvec, tvec);

            // Exibir resultados
            const output = document.getElementById("output");
            output.innerText = `
Matriz de Câmera Estimada:
${cameraMatrix.data32F}

Vetores de Rotação (rvec):
${rvec.data32F}

Vetores de Translação (tvec):
${tvec.data32F}`;

            // Limpeza de objetos
            objectPointsMat.delete();
            imagePointsMat.delete();
            rvec.delete();
            tvec.delete();
            distCoeffs.delete();
            cameraMatrix.delete();
        }

        document.getElementById("calibrate-btn").addEventListener("click", calibrateCamera);

 <button id="calibrate-btn">Calibrar Câmera</button>
            <pre id="output"></pre>
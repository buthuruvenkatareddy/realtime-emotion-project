const video = document.getElementById("video");

function webCam() {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    }).then(
        (stream) => {
            video.srcObject = stream;
        }
    ).catch(
        (error) => {
            console.log(error);
        }
    );
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),


]).then(webCam);



video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    faceapi.matchDimensions(canvas, { height: video.height, width: video.width });




    setInterval(async () => {
        const detection = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions().withAgeAndGender();
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        const resizeWindow = faceapi.resizeResults(detection, {
            height: video.height,
            width: video.width,
        });

        faceapi.draw.drawDetections(canvas, resizeWindow);
        faceapi.draw.drawFaceLandmarks(canvas, resizeWindow);
        faceapi.draw.drawFaceExpressions(canvas, resizeWindow);

        resizeWindow.forEach(detection => {
            const box = detection.detection.box
            const drawBox = new faceapi.draw.DrawBox(box, {
                label: Math.round(detection.age) + " year old " + detection.gender,
            });
            drawBox.draw(canvas);
        });
        console.log(detection);

    }, 100);
});



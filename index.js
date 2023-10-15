const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');
const audioAlert = new Audio('audio_file.mp3');

async function app() {
  net = await mobilenet.load();

  await setupWebcam();

  const addExample = classId => {
    const activation = net.infer(webcamElement, 'conv_preds');
    classifier.addExample(activation, classId);
  };

  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      const activation = net.infer(webcamElement, 'conv_preds');
      const result = await classifier.predictClass(activation);

      const classes = ['Class A', 'Class B'];
      
      if (classes[result.classIndex] === 'Class B') {
        await audioAlert.play();
        document.body.style.backgroundColor = "rgb(168, 63, 63)";
      } else {
        document.body.style.backgroundColor = "rgb(80, 168, 80)";
      }
    }

    await tf.nextFrame();
  }
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
      navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
      navigatorAny.msGetUserMedia;
    
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: true },
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata', () => resolve(), false);
        },
        error => reject(error)
      );
    } else {
      reject('getUserMedia not supported');
    }
  });
}

app();

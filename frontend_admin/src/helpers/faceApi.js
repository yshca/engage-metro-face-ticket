import * as faceapi from 'face-api.js';


export const loadModels = () => {
  const MODEL_URL = `${process.env.PUBLIC_URL}/models`;

  return Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
  ]);
};

export const detectFaces = async (image) => {
  if (!image) {
    console.log('yep')
    return;
  }

  const imgSize = image.getBoundingClientRect();
  const displaySize = { width: imgSize.width, height: imgSize.height };
  // console.log(displaySize)

  if (displaySize.height === 0) {
    return;
  }

  const faces = await faceapi
    .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  // console.log(faces)
  return faceapi.resizeResults(faces, displaySize);
};

export const drawResults = async (image, canvas, results, type) => {
  if (image && canvas && results) {
    const imgSize = image.getBoundingClientRect();
    const displaySize = { width: imgSize.width, height: imgSize.height };
    faceapi.matchDimensions(canvas, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    const resizedDetections = faceapi.resizeResults(results, displaySize);

    switch (type) {
      case 'landmarks':
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        break;
      case 'expressions':
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        break;
      case 'box':
        faceapi.draw.drawDetections(canvas, resizedDetections);
        break;
      case 'boxLandmarks':
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        break;
      default:
        break;
    }
  }
};


export async function getDescriptorsFromDB(image, allFaces) {
  // Get all the face data from mongodb and loop through each of them to read the data
  // for (var i = 0; i < faces.length; i++) {
  //   console.log(faces[i])
  //   faces[i].description = [faces[i].description]
  // }
  console.log(allFaces)
  let faces = allFaces.slice();
  for (let i = 0; i < faces.length; i++) {
    // console.log(faces[i])

    // Change the face data descriptors from Objects to Float32Array type
    for (let j = 0; j < faces[i].description.length; j++) {
      faces[i].description[j] = new Float32Array(Object.values(faces[i].description[j]));
    }
    // Turn the DB face docs to
    faces[i] = new faceapi.LabeledFaceDescriptors(faces[i].label, faces[i].description);
  }
  // console.log(faces)
  // Load face matcher to find the matching face
  const faceMatcher = new faceapi.FaceMatcher(faces, 0.6);

  // Read the image using canvas or other method
  // const img = await canvas.loadImage(image);
  let temp = faceapi.createCanvasFromMedia(image);
  // // Process the image for the model
  // const displaySize = { width: img.width, height: img.height };
  const imgSize = image.getBoundingClientRect();
  const displaySize = { width: imgSize.width, height: imgSize.height };

  faceapi.matchDimensions(temp, displaySize);

  // Find matching faces
  const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));
  return results;
}


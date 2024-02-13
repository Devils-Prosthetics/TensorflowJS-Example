# TensorFlow.js Example
Simple handwritten digit recongition using TensorFlow.js.


## Setup
To install dependencies:
```bash
npm install
```

Then build the code to Typescript, remember everytime you make a change you must rerun this command.
```bash
npm run build
```

To convert the jpg files into a csv for the neural network. Really recommend checking out the process script in `./src/process.ts` to understand what is happening more!
```bash
npm run process
```

## Training the Model
To train the model:

```bash
npm run start
```
See the code being run in `./src/index.ts`

## So what's happening?
The model is being trained on the MNIST dataset, which is a dataset of 60,000 28x28 grayscale images of the 10 digits, along with a test set of 10,000 images. These images are first converted into a single dimensional array with just the strength of the pixel being represented by a value between 0 and 255. The model is then trained on these images to predict the digit that the image represents.



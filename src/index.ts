import * as tf from '@tensorflow/tfjs-node';
import fs from 'node:fs';

import seedrandom from 'seedrandom'

// This function just removes a random percent of elements from an array
function removeRandomElements<T>(arr: T[], percent: number, randomState: string | undefined = undefined) {
	const rng = seedrandom(randomState)
	const result = arr.slice(0)
	for (let i = 0; i < Math.floor(arr.length * percent); i++) {
		const index = Math.floor(rng() * result.length)
		result.splice(index, 1)
	}
	return result as T[]
}

// This function splits the data you have and randomizes it so that you can train and test your model.
function trainTestSplit(X: number[][], y: number[], testSize = 0.2, randomState: string | undefined = undefined) {
	const rng = seedrandom(randomState)
	// Combine X and y into a single array
	const data = X.map((x: number[], i: number) => [x, y[i]])

	// Shuffle the data using Fisher-Yates shuffle algorithm
	for (let i = data.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[data[i], data[j]] = [data[j], data[i]]
	}

	// Calculate the split index
	const splitIndex = Math.floor(data.length * (1 - testSize))

	// Split the data into train and test sets
	const XTrain = data.slice(0, splitIndex).map((d) => d[0])
	const yTrain = data.slice(0, splitIndex).map((d) => d[1])
	const XTest = data.slice(splitIndex).map((d) => d[0])
	const yTest = data.slice(splitIndex).map((d) => d[1])

	return [XTrain, XTest, yTrain, yTest]
}

// This gets all files in the data directory and checks if they are csvs then concatenates them
function readAllFiles() {
	const files = fs.readdirSync('./data');
	let data = '';
	for (const file of files) {
		if (file.slice(-3) !== 'csv') continue;
		data += fs.readFileSync(`./data/${file}`, 'utf-8');
	}

	return data;
}

async function main() {
	// Get all the files data
	const data = readAllFiles();

	// First this removes whitespace at the beginning and the end of the string then it splits the string at every new line, then it loops every split line and splits that line at every comma and makes it an int.
	const numberData = data.trim().split('\n').map((row) => row.split(',').map(item => parseInt(item)));
	const trimedData = removeRandomElements<number[]>(numberData, 0.9); // Remove a bunch of data randomly just to make running it faster

	const features = trimedData.map(row => row.slice(0, -1)); // takes all the rows and removes the last element
	const labels = trimedData.map(row => row.slice(-1)[0]);	// takes all the rows and takes only the last element

	let [XTrain, XTest, yTrain, yTest] = trainTestSplit(features, labels, 0.2); // Split the data into train and test sets

	// Convert the data into tensors
	const xTrainTensor = tf.tensor(XTrain); 
	const yTrainTensor = tf.tensor(yTrain);
	const XTestTensor = tf.tensor(XTest);
	const yTestTensor = tf.tensor(yTest);

	// Create a simple model.
	const model = tf.sequential();
	model.add(tf.layers.dense({units: 16, activation: 'relu', inputShape: [features[0].length]}));
	model.add(tf.layers.dense({units: 16, activation: 'relu'}));
	model.add(tf.layers.dense({ units: labels.length, activation: 'softmax' }))

	// Try out this model to see the difference in accuracy and the speed at which it takes to train in comparison!
	// const model = tf.sequential();
	// model.add(tf.layers.dense({units: 1024, activation: 'relu', inputShape: [features[0].length]}));
	// model.add(tf.layers.dense({units: 512, activation: 'relu'}));
	// model.add(tf.layers.dense({units: 16, activation: 'relu'}));
	// model.add(tf.layers.dense({ units: labels.length, activation: 'softmax' }))

	// Compile the model
	model.compile({
		optimizer: 'adam', // This is the optimizer that the model will use to minimize the loss
		loss: 'sparseCategoricalCrossentropy', // This is the loss function that the model will use to calculate the difference between the predicted and the actual output
		metrics: ['accuracy'] // This is the metric that the model will use to determine how well it is doing
	})

	await model.fit(xTrainTensor, yTrainTensor, {epochs: 10, validationData: [XTestTensor, yTestTensor]}); // Train the model

	const result = model.evaluate(XTestTensor, yTestTensor) as tf.Scalar[]; // Evaluate the model

	const loss = result[0].dataSync()[0] // Get the loss
	const accuracy = result[1].dataSync()[0] // Get the accuracy

	console.log(loss, accuracy); // Log the loss and accuracy
}

main();

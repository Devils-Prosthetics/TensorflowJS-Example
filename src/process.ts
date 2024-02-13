import Jimp from 'jimp';
import fs from 'node:fs';
import path from 'path';

// This function takes an image location and a label and makes a csv file with the image data and the label
async function csvImage(iamgeLocation: string, label: number) {
	const image = await Jimp.read(iamgeLocation);

	let row = '';

	// Loop through every pixel in the image and add it to the row
	image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
		var pixelValue = this.bitmap.data[idx + 0];
		row += pixelValue + ',';
	});

	row += `${label}\n`; // Add the label to the end of the row

	fs.appendFileSync(`./data/${label}.csv`, row, 'utf-8'); // Write the row to the file
}

async function processDirectory(label: number) {
	const csvLocaiton = path.resolve(`./data/${label}.csv`);
	if (fs.existsSync(csvLocaiton)) fs.rmSync(csvLocaiton); // Remove the file if it exists
	const files = await fs.promises.readdir('./data/trainingSet/' + label); // Get all the files in the directory

	for (const file of files) { // Loop through all the files
		await csvImage(`./data/trainingSet/${label}/${file}`, label); // Process the image
	}
}

for (let i = 0; i <= 9; i++) { // Loop through all the labels 0-9
	processDirectory(i);
}


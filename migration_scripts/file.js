const fsp = require('fs/promises');
const fs = require('fs');
const logger = require('../lib/logger.js');

const oldDataFolder = '../data';
const newDataFolder = '../newdata';

(async () => {
	if (!fs.existsSync(oldDataFolder)) {
		logger.error('Old data folder not found!');
	}

	if (!fs.existsSync(newDataFolder)) {
		await fsp.mkdir(newDataFolder);
	}


	const oldPasteData = await fsp.readdir(oldDataFolder);
	logger.info(`Current file db has ${oldPasteData.length} pastes.`);

	for (const paste of oldPasteData) {
		logger.info(`Handling paste ${paste}`);
		const pasteContent = await fsp.readFile(`${oldDataFolder}/${paste}`, { encoding: 'utf8' });

		const newFormat = JSON.stringify({
			data: pasteContent,
			deleteKey: null,
			creationDate: null
		});

		await fsp.writeFile(`${newDataFolder}/${paste}`, newFormat);
	}
})();


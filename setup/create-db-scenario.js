require('dotenv').config()
const {createDb, areTablesActive} = require('./createDb')
const seedDb = require('./seedDb')

const awaitFor = ms => new Promise(resolve => setTimeout(resolve, ms))

const seedDbWhenAvailable = async () => {
	const isDbReady = await areTablesActive()
	if (!isDbReady) {
		console.log('Waiting tables to be ready...')
		await awaitFor(5000)
		return seedDbWhenAvailable()
	}
	await seedDb()
}

;(async () => {
	await createDb()
	await seedDbWhenAvailable()
})()

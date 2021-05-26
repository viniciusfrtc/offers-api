const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB()

const log = message => process.env.NODE_ENV !== 'test' && console.log(message)

const listTables = () => new Promise((resolve, reject) =>
	dynamodb.listTables((err, data) => {
		if (err) {
			console.error(err)
			reject(err)
		}
		resolve(data.TableNames)
	}),
)

const createTable = params => new Promise((resolve, reject) =>
	dynamodb.createTable(params, (err) => {
		if (err) {
			console.error(err)
			reject(err)
		}
		log(`Table ${params.TableName} successfully created`)
		resolve()
	}),
)

const describeTable = params => new Promise((resolve, reject) =>
	dynamodb.describeTable(params, (err, data) => {
		if (err) {
			console.error(err)
			reject(err)
		}
		resolve(data)
	}),
)

const offersParams = {
	TableName : process.env.OFFERS_DYNAMODB_TABLE,
	KeySchema: [
		{ AttributeName: 'brandId', KeyType: 'HASH'},
		{ AttributeName: 'id', KeyType: 'RANGE' },
	],
	AttributeDefinitions: [
		{ AttributeName: 'brandId', AttributeType: 'S' },
		{ AttributeName: 'id', AttributeType: 'S' },
	],
	ProvisionedThroughput: {
		ReadCapacityUnits: 1,
		WriteCapacityUnits: 1,
	},
}

const locationsParams = {
	TableName : process.env.LOCATIONS_DYNAMODB_TABLE,
	KeySchema: [
		{ AttributeName: 'brandId', KeyType: 'HASH'},
		{ AttributeName: 'id', KeyType: 'RANGE' },
	],
	AttributeDefinitions: [
		{ AttributeName: 'brandId', AttributeType: 'S' },
		{ AttributeName: 'id', AttributeType: 'S' },
	],
	ProvisionedThroughput: {
		ReadCapacityUnits: 1,
		WriteCapacityUnits: 1,
	},
}

const tablesToCreate = [offersParams, locationsParams]

module.exports = {
	createDb: async () => {
		try {
			const tableNames = await listTables()
			for (const tableParams of tablesToCreate) {
				if (!tableNames.includes(tableParams.TableName)) {
					await createTable(tableParams)
				} else {
					log(`Table ${tableParams.TableName} already exists`)
				}
			}
		} catch (err) {
			console.error(`An error has occured: ${err}`)
		}
	},
	areTablesActive: async () => {
		const tableNames = [
			process.env.OFFERS_DYNAMODB_TABLE,
			process.env.LOCATIONS_DYNAMODB_TABLE,
		]
		const tables = await Promise.all(
			tableNames.map(tableName =>
				describeTable({TableName: tableName}),
			),
		)
		return tables.every(({Table}) => Table.TableStatus === 'ACTIVE')
	},
}

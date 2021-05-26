const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

const logger = require('../logger')

const tableName = process.env.OFFERS_DYNAMODB_TABLE

const createOffer = offer => new Promise((resolve, reject) =>
	docClient.put({
		TableName: tableName,
		Item: offer,
	}, (err, data) => {
		if (err) {
			logger.error(err)
			reject(err)
		}
		resolve(data)
	}),
)

const getOffer = (brandId, id) => new Promise((resolve, reject) =>
	docClient.get({
		TableName: tableName,
		Key: {
			brandId,
			id,
		},
	}, (err, data) => {
		if (err) {
			logger.error(err)
			reject(err)
		}
		resolve(data.Item)
	}),
)

const incrementOfferLocations = ({brandId, id}) => new Promise((resolve, reject) => {
	const params = {
		TableName: tableName,
		Key:{
			brandId,
			id,
		},
		UpdateExpression: 'set locationsTotal = locationsTotal + :value',
		ExpressionAttributeValues: {
			':value': 1,
		},
	}
	docClient.update(params, (err) => {
		if (err) {
			logger.error(err)
			reject(err)
		}
		resolve()
	})
})


module.exports = {
	createOffer,
	getOffer,
	incrementOfferLocations,
}

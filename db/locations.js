const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

const logger = require('../logger')

const tableName = process.env.LOCATIONS_DYNAMODB_TABLE

const createLocation = location => new Promise((resolve, reject) =>
	docClient.put({
		TableName: tableName,
		Item: location,
	}, (err, data) => {
		if (err) {
			logger.error(err)
			reject(err)
		}
		resolve(data)
	}),
)

const getLocation = (brandId, id) => new Promise((resolve, reject) =>
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

const addOfferToLocation = (location, offerId) => new Promise((resolve, reject) => {
	const offers = location.offers && Array.isArray(location.offers)
		? [...location.offers]
		: []
	offers.push(offerId)
	const params = {
		TableName: tableName,
		Key:{
			brandId: location.brandId,
			id: location.id,
		},
		UpdateExpression: 'set offers = :offers, hasOffer = :hasOffer',
		ExpressionAttributeValues: {
			':offers': offers,
			':hasOffer': true,
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
	createLocation,
	getLocation,
	addOfferToLocation,
}

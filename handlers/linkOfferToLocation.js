const generateResponse = require('../util/responseGenerator')
const {linkOfferToLocationValidator: isRequestValid} = require('../util/requestValidator')
const logger = require('../logger')
const offersDb = require('../db/offers')
const locationsDb = require('../db/locations')

module.exports.linkOfferToLocation = async (event, context, callback) => {
	const {body} = event
	let parsedBody

	try {
		parsedBody = JSON.parse(body)
	} catch (error) {
		return callback(
			null,
			generateResponse(400, {message: 'Invalid request'}),
		)
	}

	if (!isRequestValid(parsedBody)) {
		return callback(
			null,
			generateResponse(400, {message: 'Invalid request'}),
		)
	}

	const {brandId, offerId, locationId} = parsedBody
	const [offer, location] = await Promise.all([
		offersDb.getOffer(brandId, offerId),
		locationsDb.getLocation(brandId, locationId),
	])
	if (!offer || !location) {
		return callback(
			null,
			generateResponse(404, {message: 'Offer and/or location does not exist'}),
		)
	}

	try {
		await locationsDb.addOfferToLocation(location, offerId)
		await offersDb.incrementOfferLocations(offer)
	} catch (error) {
		logger.error({error, brandId, offerId, locationId})
		return callback(
			null,
			generateResponse(500, {message: 'An error has occurred'}),
		)
	}

	callback(
		null,
		generateResponse(200, {message: 'Offer successfully linked to location'}),
	)
}

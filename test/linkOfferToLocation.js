require('dotenv').config()
const {v4: uuid} = require('uuid')
process.env.OFFERS_DYNAMODB_TABLE = 'Offers-test'
process.env.LOCATIONS_DYNAMODB_TABLE = 'Locations-test'

const {createDb, areTablesActive} = require('../setup/createDb')
const seedDb = require('../setup/seedDb')
const {linkOfferToLocation} = require('../handlers/linkOfferToLocation')
const {getLocation} = require('../db/locations')
const {getOffer} = require('../db/offers')

let locationId, offerId, brandId

const callLinkOfferToLocation = async body => {
	let res
	const callbackMock = (error, response) => {
		res = {
			...response,
			body: response.body && JSON.parse(response.body),
		}
	}
	await linkOfferToLocation({body: JSON.stringify(body)}, null, callbackMock)
	return res
}

const awaitFor = ms => new Promise(resolve => setTimeout(resolve, ms))

const waitForDbAvailability = async () => {
	const isDbReady = await areTablesActive()
	if (!isDbReady) {
		console.log('Waiting tables to be ready...')
		await awaitFor(5000)
		return waitForDbAvailability()
	}
}

beforeAll(async () => {
	await createDb()
	await waitForDbAvailability()
	const testData = await seedDb()
	locationId = testData.locations[0]
	offerId = testData.offerId
	brandId = testData.brandId
}, 30000)

describe('linkOfferToLocation', () => {
	test('return error in case body is invalid', async () => {
		const response = await callLinkOfferToLocation('anything')
		expect(response.body).toEqual({message: 'Invalid request'})
	})
	test('return error in case fields are invalid', async () => {
		const response = await callLinkOfferToLocation({
			locationId: 'location',
			offerId: 'offer',
			brandId: 'brand',
		})
		expect(response.body).toEqual({message: 'Invalid request'})
	})
	test('return error in offer/location does not exist', async () => {
		const response = await callLinkOfferToLocation({
			locationId,
			offerId: uuid(),
			brandId,
		})
		expect(response.body).toEqual({
			message: 'Offer and/or location does not exist',
		})
	})
	test('success', async () => {
		const response = await callLinkOfferToLocation({
			locationId,
			offerId,
			brandId,
		})
		expect(response.body).toEqual({
			message: 'Offer successfully linked to location',
		})
		const [offer, location] = await Promise.all([
			getOffer(brandId, offerId),
			getLocation(brandId, locationId),
		])
		expect(offer.locationsTotal).toEqual(1)
		expect(location.hasOffer).toEqual(true)
		expect(location.offers[0]).toEqual(offerId)
	})
})

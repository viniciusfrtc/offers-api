const offersDb = require('../db/offers')
const locationsDb = require('../db/locations')

const generateLocation = (brandId, addressNumber, id) => ({
	brandId,
	address: `Address ${addressNumber || 1}`,
	id,
	hasOffer: false,
})

const log = message => process.env.NODE_ENV !== 'test' && console.log(message)

module.exports = async () => {
	const brandId = '692126c8-6e72-4ad7-8a73-25fc2f1f56e4'
	const offer = {
		name: 'Super Duper Offer',
		id: 'd9b1d9ff-543e-47c7-895f-87f71dcad91b',
		brandId,
		locationsTotal: 0,
	}
	await offersDb.createOffer(offer)
	const locations = [
		generateLocation(brandId, 1, '03665f6d-27e2-4e69-aa9b-5b39d03e5f59'),
		generateLocation(brandId, 2, '706ef281-e00f-4288-9a84-973aeb29636e'),
		generateLocation(brandId, 3, '1c7a27de-4bbd-4d63-a5ec-2eae5a0f1870'),
	]
	await Promise.all(locations.map(locationsDb.createLocation))
	log('Data was inserted to DB')
	return {
		brandId,
		offerId: offer.id,
		locations: locations.map(({id}) => id),
	}
}


const Ajv = require('ajv')
const ajv = new Ajv()
const {validate: validateUuid} = require('uuid')

const isUuid = uuid => validateUuid(uuid)

const linkOfferToLocationSchema = {
	type: 'object',
	properties: {
		locationId: {
			type: 'string',
		},
		offerId: {
			type: 'string',
		},
		brandId: {
			type: 'string',
		},
	},
	required: ['locationId', 'offerId', 'brandId'],
	additionalProperties: false,
}

module.exports = {
	linkOfferToLocationValidator: body => {
		const validateBody = ajv.compile(linkOfferToLocationSchema)
		if (!validateBody(body)) return false
		const {locationId, offerId, brandId} = body
		if (
			!isUuid(locationId) ||
            !isUuid(offerId) ||
            !isUuid(brandId)
		) return false
		return true
	},
}

const request = require('request-promise-native')

const path = require('path')
const env = require(path.join(process.env['srcRoot'], '/configs/env.json'))

let options = {
	url: env.postNL.reqUrl,
	method: 'POST',
	headers: {
		accept: 'application/json',
		apikey: env.postNL.apiKey
	},
	json: {}
}

async function completeAddress(addr) {
	try {
		let query = {}

		if (!addr.postalCode) return { error: 'missing addr.postalCode' }
		if (typeof addr.postalCode !== 'string') return { error: 'wrong type addr.postalCode' }
		if (addr.postalCode.length < 6) return { error: 'wrong length addr.postalCode (<6)' }

		let formattedPostalCode = addr.postalCode.replace(/\s/g, '')
		if (!formattedPostalCode.match(/\d\d\d\d[A-Z][A-Z]/i)) return { error: 'invalid addr.postalCode' }

		// all tests for addr.postalCode passed, adding to query
		query.PostalCode = formattedPostalCode

		// testing addr.houseNumber
		if (!addr.houseNumber) return { error: 'missing addr.houseNumber' }
		if (typeof addr.houseNumber !== 'string' && typeof addr.houseNumber !== 'number') {
			return { error: 'wrong type addr.houseNumber' }
		}

		// all tests for addr.houseNumber passed, adding to query
		query.HouseNumber = addr.houseNumber

		// testing addr.addition
		if (addr.addition) {
			if (typeof addr.addition !== 'string') {
				return { error: 'wrong type addr.addition' }
			}
			// all tests for addr.addition passed, adding to query
			query.Addition = addr.addition
		}

		options.json = query
		const response = await request(options)

		let places = []
		for (const place of response) {
			const customResponse = {
				city: place.City,
				postalCode: place.PostalCode,
				street: place.Street,
				houseNumber: place.HouseNumber,
				addition: typeof place.Addition === 'number' ? JSON.stringify(place.Addition) : place.Addition,
				formattedAddress: place.FormattedAddress,
				geo: {
					lat: place.geo.lat,
					long: place.geo.long1,
					rdxCoordinate: place.geo.rdxCoordinate,
					rdyCoordinate: place.geo.rdyCoordinate
				}
			}
			places.push(customResponse)
		}

		return places
	} catch (error) { return { error } }
}

module.exports = completeAddress

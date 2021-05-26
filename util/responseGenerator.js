module.exports = (statusCode, response) => ({
	statusCode,
	body: JSON.stringify(response, null, 2),
})

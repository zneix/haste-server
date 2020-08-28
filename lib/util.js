module.exports = class HasteUtils {
	//init class
	constructor(options = {}){
		//xd no options for now
	}

	//stringify json objects from winston message to cool "key=value" format
	stringifyJSONMessagetoLogs(info){
		//really KKona solution, but works for now
		let keys = Object.keys(info).filter(k => k != 'message' && k != 'level');
		return keys.map(k => `${k}=${info[k]}`).join(', ');
	}
};
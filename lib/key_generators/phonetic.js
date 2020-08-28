//inspiration from pwgen and https://tools.arantius.com/password

//helper function to get a random consonant / vowel
function randArray(collection){
	return collection[ Math.floor(Math.random() * collection.length) ];
}

const vovels = 'aeiou';
const consonants = 'bcdfghjklmnpqrstvwxyz';

module.exports = class PhoneticKeyGenerator {
	//generate a phonetic key consisting of random consonant & vowel
	createKey(keyLength){
		let text = '';
		const start = Math.floor(Math.random() * 2);

		for (let i = 0; i < keyLength; i++){
			text += randArray(i % 2 == start ? consonants : vovels);
		}
		return text;
	}

};

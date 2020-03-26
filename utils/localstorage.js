const db = {
	save(key, value) {
		uni.setStorageSync(key, JSON.stringify(value))
	},
	get(key, defaultValue = {}) {
		const value = uni.getStorageSync(key)
		if (value) {
			return JSON.parse(value)
		}
		return defaultValue
	},
	remove(key) {
		uni.removeStorageSync(key)
	},
	clear() {
		uni.clearStorageSync()
	}
}

export default db

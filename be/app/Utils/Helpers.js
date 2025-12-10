class Helpers {
    static formatDate(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    static generateOrderCode() {
        return Math.floor(Math.random() * 1000000);
    }
}

module.exports = Helpers;

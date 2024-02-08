/**
 * Generates the current date in DDMMYYYY format.
 * @returns {string} The current date formatted as DDMMYYYY.
 */
function getCurrentDateSimple() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    return day + month + year;
}

module.exports = {
    getCurrentDateSimple
}
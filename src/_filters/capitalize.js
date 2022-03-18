const capitalizeFirst = (value) => {
    return value.replace(/^\w/, (c) => c.toUpperCase());
};

const capitalizeAll = (value) => {
    return value.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
};

module.exports = {
    capitalizeFirst,
    capitalizeAll
};
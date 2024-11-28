const num = val => val ? +val : 0;

const yesterday = () => {
    const value = new Date();

    value.setDate(value.getDate() - 1);

    return value;
}

module.exports = { num, yesterday };

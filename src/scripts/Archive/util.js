module.exports = {
    dateIteratee: dateIteratee,
    formattedDate: formattedDate,
    objectValues: objectValues,
    paddedNum: paddedNum,
    compositeFilename: compositeFilename

};

function objectValues(obj) {
    return Object.keys(obj).map(function (key) {
        return obj[key];
    });
}

function dateIteratee(a, b) {
	return b.date - a.date;
}

function compositeFilename(composite) {
	return ['composite', composite.user, composite.id, composite.date].join('-') + '.png';
}

function formattedDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();

    return date.toDateString() + ', ' +
        (hours % 12 || 12) + ':' + paddedNum(minutes) + (hours < 12 ? 'am' : 'pm');
}

function paddedNum(num) {
    return (num < 10 ? '0' : '') + num;
}

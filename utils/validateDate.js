exports.validateDate = (inputDate) => {
    let dateformat = /^(\d+-?)+\d+$/;
    if (inputDate.match(dateformat)) {
        let splittedDate = inputDate.split("-");
        const yy = parseInt(splittedDate[0]);
        const mm = parseInt(splittedDate[1]);
        const dd = parseInt(splittedDate[2]);

        let listOfDaysInMonth = [
            [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        ];

        if (mm == 1 || mm > 2) {
            if (dd > listOfDaysInMonth[mm - 1]) {
                return false;
            } else {
                return true;
            }
        }

        if (mm == 2) {
            let lyear = false;
            if ((!(yy % 4) && yy % 100) || !(yy % 400)) {
                lyear = true;
            }
            if (lyear == false && dd >= 29) {
                return false;
            }
            if (lyear == true && dd > 29) {
                return false;
            }
        }
    } else {
        return false;
    }
    return true;
};

exports.compareTwoDates = (departure, arrival) => {
    let arr = new Date(arrival);
    let depar = new Date(departure);
    return arr.getTime() == depar.getTime() || arr.getTime() > depar.getTime();
};

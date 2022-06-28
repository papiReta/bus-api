exports.generateUniqueId = (origin, destination) => {
    const min = 1;
    const max = 10000;
    let mOrigin = origin.replace(" ", "-");
    let mDestination = destination.replace(" ", "-");
    const nOrigin = mOrigin.toLowerCase().trim();
    const nDestination = mDestination.toLowerCase().trim();
    let randomNumber = Math.floor(Math.random() * (max - min) + 1) + min;
    const randomToString = randomNumber.toString();
    // console.log(`${nOrigin}-${nDestination}-${randomNumber}`);
    return `${nOrigin}-${nDestination}-${randomToString}`;
};

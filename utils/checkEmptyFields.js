const checkEmptyFields = (userInputs, outPutValidationObject) => {
    let errors = [];
    const holderMessage = " is required";

    for (const userInput in userInputs) {
        if (
            userInputs[userInput] === "" ||
            userInputs[userInput] === null ||
            userInputs[userInput] === undefined
        ) {
            errors.push(userInput);
        }
    }
    let finalOutput = {};
    for (const output in outPutValidationObject) {
        for (let i = 0; i < errors.length; i++) {
            if (output === errors[i]) {
                finalOutput[outPutValidationObject[output]] = holderMessage;
            }
        }
    }

    let concatErrorMessages = "";
    for (const error in finalOutput) {
        let message = error + finalOutput[error] + "|";
        concatErrorMessages = concatErrorMessages + message;
    }
    // const objKeys = Object.keys(finalOutput);

    return concatErrorMessages;
};

module.exports = checkEmptyFields;

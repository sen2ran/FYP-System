/* eslint-disable no-useless-escape */
export default function (arr, objName, val) {
    return arr.some(function (el) {
        return el[objName] === val;
    });
}
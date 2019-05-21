/* eslint-disable no-useless-escape */
export default function (JSONobject) {
    return JSON.parse(JSON.stringify(JSONobject))
}
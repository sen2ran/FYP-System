/* eslint-disable no-console */
/* eslint-disable no-redeclare */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// function csvJSON(csv) {
//     var lines = csv.split("\n");
//     var result = [];
//     var headers;
//     for (var i = 0; i < lines.length - (lines.length - 1); i++) {
//         headers = lines[i].split("\n");
//         headers = headers[0].split(",");
//     }
//     var cont = 0;
//     for (var i = 1; i < lines.length - 1; i++) {
//         var obj = {};
//         var currentline = lines[i].split("\n");
//         for (var j = 0; j < headers.length; j++) {
//             obj[headers[j]] = currentline[0].split(",")[j];
//         }
//         cont++;
//         result.push(obj);
//     }
//     console.log(result);
//     return JSON.stringify(result); //JSON
// }

export default (value) => {
    var lines = csv.split("\n");
    var result = [];
    var headers;
    for (var i = 0; i < lines.length - (lines.length - 1); i++) {
        headers = lines[i].split("\n");
        headers = headers[0].split(",");
    }
    var cont = 0;
    for (var i = 1; i < lines.length - 1; i++) {
        var obj = {};
        var currentline = lines[i].split("\n");
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[0].split(",")[j];
        }
        cont++;
        result.push(obj);
    }
    console.log(result);
    return JSON.stringify(result); //JSON
}
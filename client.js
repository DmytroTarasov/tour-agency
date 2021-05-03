var net = require("net");
var readline = require("readline");
const { Tour } = require("./Entities/tour"),
    { TourismType } = require("./Entities/tourismType"),
    { Client } = require("./Entities/client"),
    { Employee } = require("./Entities/employee");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

var client = net.connect({ port: 20202 }, function () {
    console.log("connected to server!");
});

client.on("data", async function (data) {
    let request = {};
    console.log(data.toString());
    let ifExit = await askQuestion("Exit?(yes/no)\n");
    if (ifExit.toLowerCase().trim() === "no") {
        request.entity = await askQuestion("Enter entity (tours, tourismTypes, clients, employees)\n");
        request.action = await askQuestion("Enter action (get, getAll, insert, delete, search)\n");
        switch (request.action) {
            case "get":
                request.key = await askQuestion("Enter key\n");
                break;
            case "getAll":
                break;
            case "delete":
                request.key = await askQuestion("Enter key\n");
                break;
            case "search":
                request.filter = {};
                request.filter.property = await askQuestion("Enter filter property\n");
                request.filter.value = await askQuestion("Enter filter value\n");
                break;
            case "insert":
                var entity = {};
                switch (request.entity) {
                    case "tours":
                        entity = new Tour();
                        break;
                    case "tourismTypes":
                        entity = new TourismType();
                        break;
                    case "clients":
                        entity = new Client();
                        break;
                    case "employees":
                        entity = new Employee();
                        break;
                }
                for (let key of Object.keys(entity)) {
                    if (key != "id") {
                        entity[key] = await askQuestion(`Enter ${key}\n`);
                    }
                }
                request.object = entity;
                break;
        }
        client.write(JSON.stringify(request));
        // rl.on("line", () => {
        //     rl.close();
        // });
        //client.end();
    } else {
        client.end();
    }
});

client.on("error", function (error) {
    console.log(error);
});

client.on("end", function () {
    console.log("disconnected from server");
});

const askQuestion = async str => {
    return new Promise(resolve =>
        rl.question(str, answer => {
            resolve(answer);
        })
    );
};

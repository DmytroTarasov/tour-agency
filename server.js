var net = require("net");

const TestDataGenerator = require("./DataBase/testDataGenerator").TestDataGenerator,
    TourismType = require("./Entities/tourismType").TourismType,
    Tour = require("./Entities/tour").Tour,
    Client = require("./Entities/client").Client,
    Employee = require("./Entities/employee").Employee,
    Order = require("./Entities/order").Order,
    DataBase = require("./DataBase/dataBase").DataBase;

// const uof = new UnitOfWork(),
// const generator = new TestDataGenerator(uof);
const db = new DataBase();
//     generator = new TestDataGenerator(db);

// generator.generateAll();
var server = net.createServer();

server.on("connection", socket => {
    socket.write("Connection established");
    socket.on("data", async data => {
        const clAddress = socket.remoteAddress,
            clPort = socket.remotePort;

        data = data.toString();
        console.log("Data before parsing " + data);
        try {
            data = JSON.parse(data);
            console.log(data);
            var result = [];
            switch (data.action) {
                case "getAll":
                    result = await db.getAll(data.entity, true, clAddress, clPort);
                    console.log(result);
                    socket.write(JSON.stringify(result));
                    break;
                case "get":
                    result = await db.get(data.entity, +data.key, true, clAddress, clPort);
                    socket.write(JSON.stringify(result));
                    break;
                case "delete":
                    await db.delete(data.entity, data.key, true, clAddress, clPort);
                    socket.write(`Successfully deleted entity from table ${data.entity}, key ${data.key}`);
                    break;
                case "search":
                    result = await db.search(data.entity, data.filter.property, data.filter.value, true, clAddress, clPort);
                    socket.write(JSON.stringify(result));
                    break;

                case "insert":
                    console.log(data.object);
                    await db.insert(data.entity, data.object, true, clAddress, clPort);
                    socket.write(`Successfully added entity into table ${data.entity}`);
                    break;
            }
        } catch (err) {
            socket.end(
                JSON.stringify({
                    ok: false,
                    error: err,
                })
            );
        }
    });
});
server.listen(20202, () => {
    console.log("Server working on address %j", server.address());
});

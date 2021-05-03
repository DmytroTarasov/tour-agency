"use strict";

const sql = require("mssql"),
    fsp = require("fs").promises;

const dbConfig = require("./dbConfig.js").config;

let conn = new sql.ConnectionPool(dbConfig);

class DataBase {
    static getEntityValues(entity) {
        let entityValues = [];

        for (let key in entity) {
            if (key != "id") {
                entityValues.push(entity[key]);
            }
        }
        return entityValues;
    }

    insert(entityType, entity, log = true, clientAddress = "", clientPort = "") {
        let entityValues = DataBase.getEntityValues(entity);
        if (log) {
            this.log(`Insert into ${entityType}, id=${entity.id}, client ${clientAddress} ${clientPort}\n`);
        }

        return new Promise((resolve, reject) => {
            conn.connect(err => {
                if (err) {
                    reject(err);
                    return;
                }
                let request = "INSERT INTO " + entityType + " VALUES ";
                // console.log(request);
                request += "(";
                for (let i = 0; i < entityValues.length; i++) {
                    if (entityValues[i] == null) {
                        request += " null, ";
                    } else if (typeof entityValues[i] == Number) {
                        request += entityValues[i] + ", ";
                    } else if (entityValues[i].constructor.name == "Date") {
                        request +=
                            "'" + entityValues[i].getFullYear() + "-" + (entityValues[i].getMonth() + 1) + "-" + entityValues[i].getDate() + "', ";
                    } else {
                        request += "'" + entityValues[i] + "', ";
                    }
                }
                request = request.substr(0, request.length - 2);
                request += ")";
                console.log(request);
                conn.query(request, err => {
                    conn.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    get(entityType, key, log = true, clientAddress = "", clientPort = "") {
        if (log) {
            this.log(`Get from ${entityType}, id=${key}, client ${clientAddress} ${clientPort}\n`);
        }
        return new Promise((resolve, reject) => {
            conn.connect(err => {
                if (err) {
                    reject(err);
                    return;
                }
                conn.query("SELECT * FROM " + entityType + " WHERE id = " + key, (err, recordset) => {
                    console.log("SELECT * FROM " + entityType + " WHERE id = " + key);
                    conn.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(recordset.recordsets);
                    }
                });
            });
        });
    }

    update(entityType, property, value, key, log = true, clientAddress = "", clientPort = "") {
        if (log) {
            this.log(`Update in ${entityType}, id=${key}, client ${clientAddress} ${clientPort}\n`);
        }
        return new Promise((resolve, reject) => {
            conn.connect(err => {
                if (err) {
                    reject(err);
                    return;
                }
                let request = "UPDATE " + entityType + " SET " + property + "=" + value + " WHERE ID = " + key;
                conn.query(request, err => {
                    conn.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    delete(entityType, key, log = true, clientAddress = "", clientPort = "") {
        if (log) {
            this.log(`Delete from ${entityType}, id=${key}, client ${clientAddress} ${clientPort}\n`);
        }
        return new Promise((resolve, reject) => {
            conn.connect(err => {
                if (err) {
                    reject(err);
                    return;
                }
                conn.query("DELETE FROM " + entityType + " WHERE id = " + key, err => {
                    conn.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    search(entityType, property, value, log = true, clientAddress = "", clientPort = "") {
        if (log) {
            this.log(`Search in ${entityType}, prop=${property}, propertyValue=${value}, client ${clientAddress} ${clientPort}\n`);
        }
        return new Promise((resolve, reject) => {
            conn.connect(err => {
                if (err) {
                    reject(err);
                    return;
                }
                let request = "SELECT * FROM " + entityType + " WHERE " + property + "=";
                if (typeof value == Number) {
                    request += value;
                } else if (value.constructor.name == "Date") {
                    request += "'" + value.getFullYear() + "-" + (value.getMonth() + 1) + "-" + value.getDate() + "'";
                } else {
                    request += "'" + value + "'";
                }
                conn.query(request, (err, recordset) => {
                    conn.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(recordset.recordsets);
                    }
                });
            });
        });
    }

    getAll(entityType, log = true, clientAddress = "", clientPort = "") {
        if (log) {
            this.log(`getAll from ${entityType}, client ${clientAddress} ${clientPort}\n`);
        }
        return new Promise((resolve, reject) => {
            conn.connect(err => {
                if (err) {
                    reject(err);
                    return;
                }
                conn.query("select * from " + entityType, (err, recordset) => {
                    conn.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(recordset.recordsets);
                    }
                });
            });
        });
    }

    // async saveChanges() {
    //     try {
    //         let data = this.getAll(false);
    //         data = JSON.stringify(data, null, 2);
    //         zlib.deflate(data, (err, buffer) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             fsp.writeFile(this.filename, buffer.toString("base64"));
    //         });
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }
    // async readData() {
    //     await fsp
    //         .readFile(this.filename, "utf-8")
    //         .then(buffer => {
    //             zlib.inflate(Buffer.from(buffer, "base64"), (err, data) => {
    //                 if (err) {
    //                     throw err;
    //                 }
    //                 data = JSON.parse(data.toString());
    //                 data.forEach(obj => {
    //                     this.insert(obj, false);
    //                 });
    //             });
    //         })
    //         .catch(err => console.log(err));
    // }

    log(message) {
        try {
            const date = new Date(),
                fullYear = date.getFullYear(),
                month = date.getMonth(),
                day = date.getDate(),
                hours = date.getHours(),
                minutes = date.getMinutes();
            fsp.appendFile("TxtFiles/Log.txt", `${fullYear}-${month}-${day}T${hours}:${minutes}, ${message}`);
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports.DataBase = DataBase;

let inquirer = require("inquirer")
let mysql = require("mysql")
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Socks101",
    database: "bamazon"
})

let cart = {
    items: []
}

function start() {
    inquirer.prompt([
        {
            type: "rawlist",
            name: "managerChoice",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
        }
    ]).then(function (answer) {
        switch (answer.managerChoice) {
            case "View Products for Sale":
                connection.query("SELECT item_id, product_name, price, stock_quantity FROM products",
                    [],
                    function (err, res) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            console.log(res)
                            displaySaleItems(res)
                            start()
                        }
                    })
                break
            case "View Low Inventory":
                connection.query("SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 6",
                    [],
                    function (err, res) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            console.log(res)
                            displaySaleItems(res)
                            start()
                        }
                    })
                break
            case "Add to Inventory":
                connection.query("SELECT item_id, product_name, price, stock_quantity FROM products",
                    [],
                    function (err, res) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            console.log(res)
                            displaySaleItems(res)
                            inquirer.prompt([
                                {
                                    type: "input",
                                    name: "productChoice",
                                    message: "Enter ID of product."
                                }
                            ]).then(function (answer1) {
                                inquirer.prompt([
                                    {
                                        type: "input",
                                        name: "productQuantity",
                                        message: "Enter quantity of this product"
                                    }
                                ]).then(function (answer2) {
                                    let obj = []
                                    obj.push({ stock_quantity: parseFloat(answer2.productQuantity, 2) })
                                    obj.push({ item_id: answer1.productChoice })
                                    connection.query("UPDATE products SET ? WHERE ?",
                                        obj,
                                        function (err, res) {
                                            if (err) {
                                                console.log(err)
                                            }
                                            console.log(`${res.affectedRows} rows affected in database`)
                                            connection.query("SELECT item_id, product_name, price, stock_quantity FROM products",
                                                [],
                                                function (err, res) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                    else {
                                                        console.log(res)
                                                        displaySaleItems(res)
                                                        start()
                                                    }
                                                })
                                        })
                                })
                            })
                        }
                    })
                break
            case "Add New Product":
                connection.query("SELECT item_id, product_name, price, stock_quantity FROM products",
                    [],
                    function (err, res) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            displaySaleItems(res)
                            getNameOfProduct()
                            function getNameOfProduct() {
                                inquirer.prompt([
                                    {
                                        type: "input",
                                        name: "newProduct",
                                        message: "Enter name of new product"
                                    }
                                ]).then(function (answer) {
                                    connection.query("SELECT product_name FROM products WHERE ?",
                                        [{ product_name: answer.newProduct }],
                                        function (err, res1) {
                                            if (err) {
                                                console.log(err)
                                            }
                                            else {
                                                if (res1.length > 0) {
                                                    console.log(`Product ${answer.newProduct} already exist`)
                                                    getNameOfProduct()
                                                }
                                                else {
                                                    inquirer.prompt([
                                                        {
                                                            type: "input",
                                                            name: "department",
                                                            message: "Which department?"
                                                        },
                                                        {
                                                            type: "input",
                                                            name: "price",
                                                            message: "Enter price"
                                                        },
                                                        {
                                                            type: "input",
                                                            name: "stockQuantity",
                                                            message: "Enter amount of stock"
                                                        }
                                                    ]).then(function (answer1) {
                                                        console.log(answer.newProduct)
                                                        console.log(answer1.department)
                                                        console.log(answer1.price)
                                                        console.log(answer.newProduct)
                                                        connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES(?, ?, ?, ?)",
                                                            [
                                                                answer.newProduct,
                                                                answer1.department,
                                                                answer1.price,
                                                                answer1.stockQuantity,
                                                            ],
                                                            function (err, res1) {
                                                                if (err) {
                                                                    console.log(err)
                                                                }
                                                                else {
                                                                    console.log(`${res1.affectedRows} rows affected in database`)
                                                                    start()
                                                                }
                                                            })
                                                    })
                                                }
                                            }
                                        })
                                })
                            }
                        }
                    })
                break
            case "Exit":
                endSession()
                break
        }
    })
}

function displaySaleItems(res) {
    console.log("--------------------------------------")
    for (let i = 0; i < res.length; i++) {
        console.log(`${res[i].item_id} ${res[i].product_name} | $${res[i].price} | ${res[i].stock_quantity}`)
    }
    console.log("--------------------------------------")
}

function endSession() {
    connection.end()
}

start()


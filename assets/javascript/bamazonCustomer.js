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
    connection.query("SELECT * FROM products",
        function (err, res) {
            if (err) {
                console.log(err)
            }
            else {
                let choices = buildProductChoices(res)
                displayChoices(choices)
                displayCart()
                inquirer.prompt([
                    {
                        type: "input",
                        name: "productChoice",
                        message: "Enter ID of product. Enter 0 to checkout"
                    }
                ]).then(function (answer) {
                    if (answer.productChoice === "0") {
                        doCheckout()
                    }
                    else {
                        askQua()
                        function askQua() {
                            inquirer.prompt([
                                {
                                    type: "input",
                                    name: "productQauntity",
                                    message: "Enter quantity of this product"
                                }
                            ]).then(function (answer1) {
                                if(answer1.productQauntity < 0) {
                                    console.log("Quantity has to be 0 or more. 0 is for used for cancel")
                                    askQua()
                                }
                                else {
                                connection.query("SELECT item_id, product_name, price, stock_quantity FROM products WHERE ?",
                                    [{ item_id: answer.productChoice }],
                                    function (err, res) {
                                        if (err) {
                                            console.log(err)
                                        }
                                        else {
                                            if (isInStock(res, answer1.productQauntity)) {
                                                connection.query("UPDATE products SET ? WHERE ?",
                                                    [{ stock_quantity: res[0].stock_quantity - answer1.productQauntity }, { item_id: res[0].item_id }],
                                                    function (err, res1) {
                                                        if (err) {
                                                            console.error(err)
                                                        }
                                                        else {
                                                            if (res1.changedRows > 0) {
                                                                let cartItem = {
                                                                    item: res[0],
                                                                    quantityPurchased: answer1.productQauntity
                                                                }
                                                                cart.items.push(cartItem)    
                                                            }
                                                            start()
                                                        }
                                                    })
                                            }
                                            else {
                                                console.log(`There are only ${res[0].stock_quantity} items left. Reduce quantity`)
                                                askQua()
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        })

}

function buildProductChoices(products) {
    let choices = []
    for (let i = 0; i < products.length; i++) {
        choices.push(`Id ${products[i].item_id} | ${products[i].product_name} | price ${products[i].price} | ${products[i].stock_quantity} left in stock`)
    }
    return choices
}

function displayChoices(choices) {
    for (let i = 0; i < choices.length; i++) {
        console.log(choices[i])
    }
}

function isInStock(row, quantityRequested) {
    if (row[0].stock_quantity < quantityRequested) {
        return false
    }
    else {
        return true
    }
}

function displayCart() {
    let subTotal = 0
    console.log("--------------------------------------")
    console.log(`You have ${cart.items.length} item in the cart`)
    for (let i = 0; i < cart.items.length; i++) {
        subTotal = cart.items[i].item.price * cart.items[i].quantityPurchased
        console.log(`${cart.items[i].item.product_name} | $${cart.items[i].item.price} | ${cart.items[i].quantityPurchased} | $${subTotal}`)
    }
    console.log("--------------------------------------")
}

function doCheckout() {
    let grandTotal = 0
    let subTotal = 0
    console.log("--------------------------------------")
    for (let i = 0; i < cart.items.length; i++) {
        subTotal = cart.items[i].item.price * cart.items[i].quantityPurchased
        console.log(`${cart.items[i].item.product_name} | $${cart.items[i].item.price} | ${cart.items[i].quantityPurchased} | $${subTotal}`)
        grandTotal = grandTotal + subTotal
    }
    console.log(`Your grand total is $${grandTotal}`)
    connection.end()
}

start()
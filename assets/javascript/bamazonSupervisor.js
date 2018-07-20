const inquirer = require("inquirer")
const mysql = require("mysql")
const tto = require("terminal-table-output").create()

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Socks101",
    database: "bamazon"
})

function start() {
    inquirer.prompt([
        {
            type: "rawlist",
            name: "choice",
            choices: ["View Product Sales by Department", "Create New Department", "Exit"]
        }
    ]).then(function (answer) {
        switch (answer.choice) {
            case "View Product Sales by Department":
                connection.query("SELECT departments.department_id, departments.department_name, departments.over_head_cost, products.product_sales, products.product_sales - departments.over_head_cost AS total_profit FROM departments INNER JOIN products ON departments.department_name != products.product_name GROUP BY department_name ORDER BY department_name",
                    [],
                    function (err, res) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            tto.col('')
                            tto.col('DEPARTMENT_ID')
                            tto.col('DEPARTMENT_NAME')
                            tto.col('OVER_HEAD_COST')
                            tto.col('PRODUCT_SALES')
                            tto.col('TOTAL_PROFIT')
                            tto.col('\n')
                            tto.col('-------------')
                            tto.col('---------------')
                            tto.col('--------------')
                            tto.col('-------------')
                            tto.col('------------')
                            for(let i = 0; i < res.length; i++) {3
                                let temp = []
                                temp.push('', res[i].department_id)
                                temp.push(res[i].department_name)
                                temp.push(res[i].over_head_cost)
                                temp.push(res[i].product_sales)
                                temp.push(res[i].total_profit)
                                tto.pushrow(temp)
                            }
                            tto.print(true)
                            start()
                        }
                    })
                break;
            case "Create New Department":
                askDepName()
                function askDepName() {
                    inquirer.prompt([
                        {
                            type: "input",
                            name: "newDepartment",
                            message: "Enter new department name"
                        }
                    ]).then(function (answer1) {
                        console.log(answer.newDepartment)
                        if (answer1.newDepartment !== "" && answer1.newDepartment !== undefined) {
                            connection.query("SELECT department_name FROM departments WHERE ?",
                                [{ department_name: answer1.newDepartment }],
                                function (err, res) {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        if (res.length > 0) {
                                            console.log(`${answer1.newDepartment} already exist`)
                                            askDepName()
                                        }
                                        else {
                                            connection.query("INSERT INTO departments(department_name) VALUES(?)",
                                                [answer1.newDepartment],
                                                function (err, res1) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                    else {
                                                        console.log(`${res1.affectedRows} rows affected in database`)
                                                        start()
                                                    }
                                                })
                                        }

                                    }
                                })
                        }
                        else {
                            console.log("Department name can't be empty")
                            askDepName()
                        }
                    })
                }

                break;
            case "Exit":
                connection.end()
                break;
        }
    })
}

start()
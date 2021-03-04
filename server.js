const inquirer = require("inquirer");
const fs = require("fs");
const { printTable } = require("console-table-printer");

const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "12345678",
  database: "employees",
});

const start = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "start",
        choices: [
          "Add Department",
          "Add Role",
          "Add Employee",
          "View Departments",
          "View Roles",
          "View Employees",
          "Update Employee Role",
          "Update Employee Managers",
          "View Employees by Manager",
          "Remove Employee",
          "Remove Department",
          "Remove Role",
          "Exit",
        ],
      },
    ])
    .then((response) => {
      const answer = response.start;
      console.log(answer);
      switch (answer) {
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRoles();
          break;
        case "Add Employee":
          addEmployees();
          break;
        case "View Departments":
          viewDepartments();
          break;
        case "View Roles":
          viewRoles();
          break;
        case "View Employees":
          viewEmployees();
          break;
        case "Update Employee Role":
          updateRoles();
          break;
        case "Update Employee Managers":
          updateEmployeeManager();
          break;
        case "View Employees by Manager":
          viewEmployeeByManager();
          break;
        case "Remove Employee":
          removeEmployee();
          break;
        case "Remove Department":
          removeDept();
          break;
        case "Remove Role":
          removeRole();
          break;
        case "Exit":
          connection.end();
          break;
      }
    });
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department you are adding?",
        name: "addDepartment",
      },
    ])
    .then((response) => {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: response.addDepartment,
        },
        (err) => {
          if (err) throw err;
          console.log("Your department was created.");

          start();
        }
      );
    });
};

const addRoles = () => {
  connection.query("SELECT * FROM department", (err, res) => {
    const dept = res.map((dept) => {
      return {
        name: dept.name,
        value: dept.id,
      };
    });
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the name of the role you are adding?",
          name: "title",
        },
        {
          type: "input",
          message: "What is the salary of the role you are adding?",
          name: "salary",
        },
        {
          type: "list",
          message: "What is the department of the role?",
          name: "id",
          choices: dept,
        },
      ])
      .then((response) => {
        connection.query(
          "INSERT INTO role SET ?",
          {
            title: response.title,
            salary: response.salary,
            id: Math.floor(Math.random() * Math.floor(1000)),
          },
          (err) => {
            if (err) throw err;
            console.log("Your role was created.");
            start();
          }
        );
      });
  });
};

const addEmployees = () => {
  connection.query("SELECT * FROM role", (err, res) => {
    const roles = res.map((roles) => {
      return {
        name: roles.title,
        value: roles.id,
      };
    });
    connection.query("SELECT * FROM employee", (err, data) => {
      const manager = data.map((employee) => {
        return {
          name: employee.first_name + " " + employee.last_name,
          value: employee.id,
        };
      });
      inquirer
        .prompt([
          {
            type: "input",
            message: "What is the first name of the employee?",
            name: "first_name",
          },
          {
            type: "input",
            message: "What is the last name of the employee?",
            name: "last_name",
          },
          {
            type: "list",
            message: "What is the employees role?",
            name: "role",
            choices: roles,
          },
          {
            type: "list",
            message: "Who is the employee's manager?",
            name: "manager",
            choices: manager,
          },
        ])
        .then((response) => {
          connection.query(
            "INSERT INTO employee SET ?",
            {
              first_name: response.first_name,
              last_name: response.last_name,
              role_id: response.role,
              manager_id: response.manager,
            },
            (err) => {
              if (err) throw err;
              console.log("Your employee was created.");
              start();
            }
          );
        });
    });
  });
};

const viewDepartments = () => {
  connection.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    printTable(res);
    start();
  });
};

const viewRoles = () => {
  connection.query(
    `SELECT role.id, role.title, role.salary, (department.name) department
  FROM role 
  LEFT JOIN department
  ON role.id = department.id;`,
    (err, res) => {
      if (err) throw err;
      printTable(res);
      start();
    }
  );
};

const viewEmployees = () => {
  connection.query(
    `SELECT employee.id, employee.first_name, employee.last_name, role.title, CONCAT(manager.first_name, " ", manager.last_name) manager
  FROM employee 
  LEFT JOIN role
    ON role.id=employee.role_id
  LEFT JOIN employee manager
    ON manager.id=employee.id;`,
    (err, data) => {
      if (err) throw err;
      printTable(data);
      start();
    }
  );
};

const updateRoles = () => {
  connection.query("SELECT * FROM role", (err, res) => {
    const updatedRoles = res.map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
    connection.query("SELECT * FROM employee", (err, data) => {
      const updateEmployeeArr = data.map((employee) => {
        return {
          name: employee.first_name + " " + employee.last_name,
          value: employee.id,
        };
      });
      inquirer
        .prompt([
          {
            type: "list",
            message: "Which employee would you like to update?",
            name: "employee",
            choices: updateEmployeeArr,
          },
          {
            type: "list",
            message: "What is the employees new role?",
            name: "role",
            choices: updatedRoles,
          },
        ])
        .then((response) => {
          let roleRes = response.role;
          let employeeRes = response.employee;
          connection.query(
            `UPDATE employee SET role_id=${roleRes} WHERE id=${employeeRes}`
          );
          if (err) throw err;
          console.log("Employee updated.");
          start();
        });
    });
  });
};

const updateEmployeeManager = () => {
  connection.query("SELECT * FROM employee", (err, data) => {
    const updateEmployeeManagerArr = data.map((employee) => {
      return {
        name: employee.first_name + " " + employee.last_name,
        value: employee.id,
        manager: employee.manager_id,
      };
    });
    inquirer
      .prompt([
        {
          type: "list",
          message: "Which employee would you like to update?",
          name: "employee",
          choices: updateEmployeeManagerArr,
        },
        {
          type: "list",
          message: "Who is the employees new manager?",
          name: "newManager",
          choices: updateEmployeeManagerArr,
        },
      ])
      .then((response) => {
        let employeeChoice = response.employee;
        let updatedManager = response.newManager;
        connection.query(
          `UPDATE employee SET manager_id=${updatedManager} WHERE id=${employeeChoice}`
        );
        if (err) throw err;
        console.log("Employee's manager updated.");
        start();
      });
  });
};

const viewEmployeeByManager = () => {
  connection.query(
    `SELECT CONCAT(manager.first_name, " ", manager.last_name) manager, CONCAT(employee.first_name, ' ', employee.last_name) AS employee, role.title
  FROM employee 
  LEFT JOIN employee manager
  ON manager.id=employee.manager_id
  INNER JOIN role 
  ON employee.role_id=roles.id
  ORDER BY manager;`,
    (err, res) => {
      if (err) throw err;
      printTable(res);
      start();
    }
  );
};

const removeEmployee = () => {
  connection.query("SELECT * FROM employee", (err, res) => {
    let arr = res.map((employee) => {
      return {
        name: employee.first_name + " " + employee.last_name,
        value: employee.id,
      };
    });
    inquirer
      .prompt([
        {
          type: "list",
          message: `"Which employee would you like to remove?"`,
          name: "terminate",
          choices: arr,
        },
      ])
      .then((remove) => {
        let removeThis = remove.terminate;
        connection.query(`DELETE FROM employee WHERE id=${removeThis}`);
        if (err) throw err;
        console.log("Employee removed.");
        start();
      });
  });
};

const removeRole = () => {
  connection.query("SELECT * FROM role", (err, res) => {
    let arr = res.map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
    inquirer
      .prompt([
        {
          type: "list",
          message: `"Which role would you like to remove?"`,
          name: "terminate",
          choices: arr,
        },
      ])
      .then((remove) => {
        let removeThis = remove.terminate;
        connection.query(`DELETE FROM roles WHERE id=${removeThis}`);
        if (err) throw err;
        console.log("Role removed.");
        start();
      });
  });
};

const removeDept = () => {
  connection.query("SELECT * FROM department", (err, res) => {
    let arr = res.map((department) => {
      return {
        name: department.name,
        value: department.id,
      };
    });
    inquirer
      .prompt([
        {
          type: "list",
          message: `"Which department would you like to remove?"`,
          name: "terminate",
          choices: arr,
        },
      ])
      .then((remove) => {
        let removeThis = remove.terminate;
        connection.query(`DELETE FROM department WHERE id=${removeThis}`);
        if (err) throw err;
        console.log("Department removed.");
        start();
      });
  });
};

connection.connect((err) => {
  if (err) throw err;
  start();
});

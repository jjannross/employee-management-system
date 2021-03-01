const inquirer = require("inquirer");
const fs = require("fs");

const Manager = require("./lib/manager.js");
const Engineer = require("./lib/engineer.js");
const Intern = require("./lib/intern.js");

const managerHtml = require("./src/managerHtml.js");
const engineerHtml = require("./src/engineerHtml.js");
const internHtml = require("./src/internHtml.js");
const indexHtml = require("./src/indexHtml.js");
let teamName = "";
const teamMembersArr = [];

let createTeam = {
  type: "list",
  message: "Would you like to add more members?",
  name: "teamMembers",
  choices: [
    "Yes, I would like to add an Engineer.",
    "Yes, I would like to an Intern.",
    "No, my team is complete",
  ],
};

let managerPrompt = [
  {
    type: "input",
    message: "Welcome! To begin building your team, what is your team's name?",
    name: "teamName",
  },
  {
    type: "input",
    message: "What is your manager's name?",
    name: "managerName",
  },
  {
    type: "input",
    message: "What is your manager's employee ID?",
    name: "managerID",
  },
  {
    type: "input",
    message: "What is your manager's email address?",
    name: "managerEmail",
  },
  {
    type: "input",
    message: "What is your manager's office number",
    name: "managerOffice",
  },
];
let internPrompt = [
  {
    type: "input",
    message: "What is your intern's name?",
    name: "internName",
  },
  {
    type: "input",
    message: "What is your intern's employee ID?",
    name: "internID",
  },
  {
    type: "input",
    message: "What is your intern's email address?",
    name: "internEmail",
  },
  {
    type: "input",
    message: "What is your intern's school",
    name: "internSchool",
  },
];

let engineerPrompt = [
  {
    type: "input",
    message: "What is your engineer's name?",
    name: "engineerName",
  },
  {
    type: "input",
    message: "What is your engineer's employee ID?",
    name: "engineerID",
  },
  {
    type: "input",
    message: "What is your engineer's email address?",
    name: "engineerEmail",
  },
  {
    type: "input",
    message: "What is your engineer's GitHub username",
    name: "engineerGithub",
  },
];

function addTeam() {
  inquirer.prompt(createTeam).then((data) => {
    if (data.teamMembers === "Yes, I would like to add an Engineer.") {
      addEngineer();
    } else if (data.teamMembers === "Yes, I would like to an Intern.") {
      addIntern();
    } else {
      buildHtml();
      console.log("open new.html in a broswer to checkout your team!");
    }
  });
}

function addEngineer() {
  inquirer.prompt(engineerPrompt).then((data) => {
    const engineer = new Engineer(
      data.engineerName,
      data.engineerID,
      data.engineerEmail,
      data.engineerGithub
    );
    teamMembersArr.push(engineer);
    addTeam();
  });
}

function addIntern() {
  inquirer.prompt(internPrompt).then((data) => {
    const intern = new Intern(
      data.internName,
      data.internID,
      data.internEmail,
      data.internSchool
    );
    teamMembersArr.push(intern);
    addTeam();
  });
}

function buildHtml() {
  let addCard = "";

  for (let i = 0; i < teamMembersArr.length; i++) {
    if (teamMembersArr[i].getRole() === "Manager") {
      addCard = addCard + managerHtml(teamMembersArr[i]);
    } else if (teamMembersArr[i].getRole() === "Engineer") {
      addCard = addCard + engineerHtml(teamMembersArr[i]);
    } else if (teamMembersArr[i].getRole() === "Intern") {
      addCard = addCard + internHtml(teamMembersArr[i]);
    }
  }
  let teamHtml = indexHtml(teamName, addCard);

  fs.writeFileSync("./dist/new.html", teamHtml);
}

inquirer.prompt(managerPrompt).then((data) => {
  const manager = new Manager(
    data.managerName,
    data.managerID,
    data.managerEmail,
    data.managerOffice
  );

  teamName = data.teamName;
  teamMembersArr.push(manager);

  addTeam();
});

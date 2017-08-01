# Project Title

One Paragraph of project description goes here

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```
Give examples
```

### Installing

A step by step series of examples that tell you have to get a development env running

Say what the step will be

Install Node.js from [here](https://nodejs.org/en/download/)
```
node --version
```

Fork this repository

Go to the repository in command line and type
```
npm install
```
to automatically install the required packages

In order to start the server, type:
```
node app.js
```


End with an example of getting some data out of the system or using it for a little demo

## Running

Running application locally:
good luck

## Deployment

Add additional notes about how to deploy this on a live system

## Development

To add a Cloudant database to use: database.js
```
cloudant.db.create(<dbname>, function(err, res) {
  db.<dbname> = cloudant.use(<dbname>);
  // do stuff like initializing or whatever
});
```
To use the Cloudant database in other code:
```
var db = require('./database'); // relative file path may be different
db.<dbname>.get( ... // whatever function provided by cloudant-nano
...
```

## Built With

* [express.js](https://expressjs.com/) - The web framework used
* [Node.js](https://nodejs.org/) - Idk what

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Eric Xin** - *Initial work* - [theBowja](https://github.com/theBowja)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* etc

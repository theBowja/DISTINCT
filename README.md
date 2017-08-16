# DISTINCT

One Paragraph of project description goes here

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Node.js and [Bluemix CLI](https://clis.ng.bluemix.net/ui/home.html) for Deployment

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

Follow this guide for Bluemix [here](https://console.bluemix.net/docs/starters/upload_app.html)

## Development

To add a Cloudant database to use: **database.js**
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

## Development - Editor
Instructions on how to use the editor is listed in the .pug template file.

### \#svgfocus
This element deals with the focus on the SVG. Specifically, keycodes.
- case 27: // ESCAPE - for deselecting everything
- case 46: // DELETE - for deleting selected nodes/links

### control

### Options Panel - (function(shapes){...})
Parameter **shapes**: a string array of shapes that can be created. ```["circle", "cross", "diamond", "square", "star", "triangle", "wye"]```. Returns the function **createNodeOptionsPanel**.
An interface to allow editing the data of nodes/links. **svgeditor_optionspanel.js** contains a closure for some reason...

#### Creating editable properties
These schemas are split into base and the rest of the shapes. Base includes the array of specified editable properties that all shapes will have, "name" and "color". In order to add your own custom editable property, the object must have **label** and **type**. **Type** is the type of DOM element it will be which is limited to "input", "select", and "textarea". Additional types must be specified in the ```switch(trait.type) { ... }``` in the function createNodeOptionsPanel.

#### svgeditor_optionspanel.js - getShape(s)


### Toolbox
A clipPath specifies the boundaries of the toolbox. Each icon of the toolbox is 24px x 24px.
To add your own icon with functionality:
1. expand the height of the clipPath boundary by 24
2. follow the pattern of mediabutton/interationbutton/shapebutton

#### Toolbox - toolboxButtonMaker(name,transform)
Given the parameters provided, this function will create and return a button to fit in the toolbox. The *name* is used to set the id of the elements: "[name]-title" and "[name]-path". The *transform* is used to set the transform.

### topologySchema
A schema to verify the json of the topology. Uses AJV as its JSON Schema validator. The topology object must contain the array properties: "nodes" and "links". Each object element in the array "nodes" must have a property: "name". Each object element in the array "links" must have the properties: "source" and "target" which reference to an existing "name" in the "nodes" array.

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

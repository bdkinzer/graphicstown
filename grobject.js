
/**
 this file defines what a "graphics object" is for the graphics town system
 rather than defining a class, as you would in a conventional programming language,
 we define the properties that the objects must have.

 when you make a new object to put in the world, it must do the required things.
 you can make your own objects that do the right things.
 you can have these objects refer to the example objects as prototypes
 you can make your own prototypes
 and so forth...

 you should define your objects in javascript files that are loaded before the "main" part
 of graphics town

 your files should put these objects into the "grobjects" global array. if this list doesn't exist
 you must make it.

 it also provides the specifcaton for what the drawing state object will look like
 **/

var grobjects =[];


//
// utility routines
// find an object with a particular name
function findObj(name) {
    var rv = null;
    grobjects.forEach(function(obj) {
        if (obj.name == name) {
            rv = obj;
        }
    });
    return rv;
};

jqterm [![Build Status](https://travis-ci.org/ameyms/jqterm.png)](https://travis-ci.org/ameyms/jqterm)
======

A JQuery plugin for a commandline emulator with custom interpreters and formatter

Usage
-----

In your HTML file, include the jqterm js and css files

```html
<script type="text/javascript" src="jqterm.js"></script>
<link rel="stylesheet" type="text/css" href="jqterm.css" />
```

To use emulate terminal inside div with id `terminal`, use following code:

```javascript

$('#terminal').term({

  interpreter: invokeCommand,
  welcome: 'Welcome to jqTerm. The commandline emulator written in JQuery'

});

```
Where `invokeCommand` would be a function that accepts a tokenized command and returns jquery deferred
If the command entered is 
```shell
$ awesome_script -s "C:\Program Files\Foo\Bar One\my.pl" -o foo
```
The interpreter would receive following array as argument
```javascript
['awesome_script', '-s' 'C:\Program Files\Foo\Bar One\my.pl', '-o', 'foo']
```

So the `invokeCommand` function would look like
```javascript
function invokeCommand(cmd)
{
  return $.ajax({
    
    url: '/cmd_interpreter',
    dataType:'json',
    data: {'cmd':cmd}
  });
}
```



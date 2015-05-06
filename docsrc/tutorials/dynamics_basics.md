## BetaJS Dynamics Basics


```html

<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>Hello World</title>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        <script src="vendors/beta.js"></script>
        <script src="vendors/beta-browser-noscoped.js"></script>
	<script src="vendors/betajs-dynamics.js"></script>
</head>
<body>

	<div id="helloworld">{{replaced_value}}</div>

	<script>

		dynamic = new BetaJS.Dynamics.Dynamic({
			element: $("#helloworld")
		});

		dynamic.set("replaced_value", "Hello World");
		dynamic.activate();

	</script>

</body>
</html>

```

#### Now lets go briefly trough the individual parts:


```html

<div id="helloworld">{{replaced_value}}</div>

```

Inside {{}} ist an attribute property that we can control from other parts of the Program

```js

dynamic = new BetaJS.Dynamics.Dynamic({
	element: $("#helloworld")
});

```

Here we create a new BetaJS Dynamic,
what that means and what you can do with that
we will explore in more details in the rest of this Tutorial

The element part links the Javascript code of the Dynamic with the #helloworld element.
And hence we can have the control the BetaJS Dynamics provides over the #helloworld div
and its contents. We can then control the #helloworld div within our Javascript files
with the dynamic variable (Because of "dynamic = new BetaJS.Dynamics.Dynamic({").

An example on how to use this is the next line:

```js

dynamic.set("replaced_value", "Hello World");

```

Here we create a the property within the dynamic which is called "replaced_value"
and give it the value "Hello World". When the dynamic is loaded the attribute property
{{replaced_value}} will be replaced by its value in the HTML so that we see "Hello World"
on the actual site.
Properties are similar to variables in that they store data, more on BetaJS Properties can be found here: ...
One of the benefits of using a property here is that when we changed the value of "replaced_value"
the HTML view will update itself automatically.


```js

dynamic.activate();

```

This last part activates the dynamic and actually links the HTML with the Javascript.
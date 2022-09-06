# GMS Bubble Map

## Requirements

Save these JS files in a given directory:
- `main.js`
- `boundingboxes.js`
- `alpha2to3.js`

Make a reference to D3, Leaflet and Font Awesome (or save them locally), with these versions:

-     <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.6.1/d3.min.js" integrity="sha512-MefNfAGJ/pEy89xLOFs3V6pYPs6AmUhXJrRlydI/9wZuGrqxmrdQ80zKHUcyadAcpH67teDZcBeS6oMJLPtTqw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
-     <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.js" integrity="sha512-QVftwZFqvtRNi0ZyCtsznlKSWOStnDORoefr1enyq5mVL4tmKB3S/EnC3rRJcxCPavG10IcrVGSmPh6Qw5lwrg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
-     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.css" integrity="sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
-     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css" integrity="sha512-1sCRPdkRXhBV2PBLUdRb4tMg1w2YPf37qatUFeS7zlBy7jJI8Lf4VHwWfZZfpXtYSLy85pkm9GaYVYMfw5BC1A==" crossorigin="anonymous" referrerpolicy="no-referrer" />

## Using the code
In the desired page, load `main.js` as a module:

    <script type="module" src="./src/main.js"></script>
    
Then add this script, which calls the `createBubbleMap()` function:

```
<script type="module">
	import { createBubbleMap } from "./src/main.js";
	const parameters = {
		containerDivId: "someIdHere",
		dataUrl: "./somedata.csv",
		colors: ["#1b9e77","#d95f02","#7570b3"]
	};
	createBubbleMap(parameters);
</script>
``` 
  
 The parameters are:
 - `containerDivId`: the ID of the div which will hold the chart.
 - `dataUrl`: the relative link to the CSV data file.
 - `colors`: an array with the colors for the statuses, in alphabetical order.
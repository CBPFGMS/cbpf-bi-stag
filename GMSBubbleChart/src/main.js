//necessary external resourtces: d3.js, leaflet.js, leaflet.css
//d3 version: 7.6.1 (all listeners using the arguments in the sequence: event, datum)
//leaflet version: 1.4.0

import { countryBoundingBoxes } from "./boundingboxes.js";
import { isoAlpha2to3 } from "./alpha2to3.js";

const padding = [4, 4, 4, 4],
	legendSvgWidth = 90,
	legendSvgHeightColor = 38,
	legendSvgHeightSize = 98,
	legendSvgPadding = [4, 4, 4, 4],
	legendTitlePadding = 10,
	duration = 1000,
	tooltipMargin = 2,
	windowHeight = window.innerHeight,
	brighterFactor = 0.3,
	currentDate = new Date(),
	currentYear = currentDate.getFullYear(),
	localStorageTime = 3600000,
	localVariable = d3.local(),
	heightFactor = 0.6,
	adminLocLevels = 6,
	classPrefix = "gmsbmc",
	formatMoney0Decimals = d3.format(",.0f"),
	formatPercentage = d3.format(".0%"),
	zoomSnap = 0.25,
	zoomDelta = 0.5,
	maxZoomValue = 12,
	mapInitialLatitude = 20,
	mapInitialLongitude = 10,
	mapInitialZoom = 1.75,
	minCircleRadius = 1,
	maxCircleRadius = 32,
	disabledOpacity = 0.4,
	legendCirclePadding = 26,
	legendColorPadding = 20,
	legendRectWidth = 5,
	legendRectHeight = 7,
	legendLineHeight = 6,
	legendRectPadding = 10,
	legendSizeGroupPadding = 36,
	strokeOpacityValue = 0.8,
	fillOpacityValue = 0.5,
	circleColor = "#E56A54",
	circleGlobalColor = "#418FDE",
	unBlue = "#1F69B3",
	highlightColor = "#F79A3B",
	circleStroke = "#555",
	markerStroke = "#555",
	markerAttribute = "M0,0l-8.8-17.7C-12.1-24.3-7.4-32,0-32h0c7.4,0,12.1,7.7,8.8,14.3L0,0z",
	minValueColor = "#eee",
	stickHeight = 2,
	lollipopRadius = 3,
	formatSIaxes = d3.format("~s"),
	fadeOpacity = 0.4,
	fadeOpacityMenu = 0.5,
	separator = "##",
	pipeSeparator = "|||",
	displayModes = ["size", "color"],
	allFunds = "All countries",
	allSectors = "All sectors",
	allYears = "All years",
	allStatus = "All statuses",
	chartState = {
		selectedYear: null,
		selectedFund: null,
		selectedSector: null,
		selectedStatus: null,
		displayMode: null
	},
	cbpfStatusList = {},
	cerfIdsList = {},
	fundAbbreviatedNamesList = {},
	fundRegionsList = {},
	fundIsoCodesList = {},
	fundIsoCodes3List = {},
	fundLatLongList = {},
	yearsArray = [],
	inSelectionLists = {
		yearsInCurrentSelection: [],
		fundsInCurrentSelection: [],
		sectorsInCurrentSelection: [],
		statussInCurrentSelection: []
	},
	inAllDataLists = {
		yearsInAllData: [],
		fundsInAllData: [],
		sectorsInAllData: [],
		statussInAllData: []
	},
	lists = {
		fundNamesList: {},
		fundNamesListKeys: [],
		sectorNamesList: {}
	},
	colorScales = {},
	// masterFundsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
	masterFundsUrl = "https://cbpfapi.unocha.org/vo2/odata/MstPooledFund", //IMPORTANT: CHANGE THIS FOR THE UNIFIED ID SYSTEM, LINK ABOVE
	masterSectorTypesUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstCluster.json";

let cerfPooledFundId,
	frozenChartState,
	lastFilterClicked = null;

const colorScale = d3.scaleOrdinal();

const radiusScale = d3.scaleSqrt()
	.range([minCircleRadius, maxCircleRadius]);

const arcGenerator = d3.arc()
	.innerRadius(0);

const arcGeneratorEnter = d3.arc()
	.innerRadius(0)
	.outerRadius(0);

const pieGenerator = d3.pie()
	.value(d => d.value)
	.sort(null);

function createBubbleMap({ containerDivId, dataUrl, colors }) {

	const containerDiv = d3.select(`#${containerDivId}`);
	containerDiv.style("position", "relative");
	const containerDivSize = containerDiv.node().getBoundingClientRect();
	const width = containerDivSize.width;
	const height = width * heightFactor;

	const loader = createLoader(containerDiv);

	const tooltip = containerDiv.append("div")
		.attr("id", classPrefix + "tooltipDiv")
		.style("display", "none");

	const topDiv = containerDiv.append("div")
		.attr("class", classPrefix + "topDiv");

	const dropdownDiv = topDiv.append("div")
		.attr("class", classPrefix + "dropdownDiv");

	const filterDiv = topDiv.append("div")
		.attr("class", classPrefix + "filterDiv");

	const buttonsDiv = containerDiv.append("div")
		.attr("class", classPrefix + "buttonsDiv");

	const mapContainerDiv = containerDiv.append("div")
		.attr("id", classPrefix + "mapContainerDiv");

	const infoDiv = containerDiv.append("div")
		.attr("class", classPrefix + "infoDiv");

	const infoDivTitle = infoDiv.append("div")
		.attr("class", classPrefix + "infoDivTitle")
		.html("Additional Information");

	const infoDivBody = infoDiv.append("div")
		.attr("class", classPrefix + "infoDivBody");

	const leafletMap = L.map(`${classPrefix}mapContainerDiv`, {
		zoomSnap: zoomSnap,
		zoomDelta: zoomDelta
	});

	leafletMap.setView([mapInitialLatitude, mapInitialLongitude], mapInitialZoom);

	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: maxZoomValue
	}).addTo(leafletMap);

	const svgLayer = L.svg();

	svgLayer.addTo(leafletMap);

	const d3MapSvgGroup = d3.select(".leaflet-overlay-pane g")
		.attr("class", classPrefix + "D3MapSvg");

	const legendDiv = mapContainerDiv.append("div")
		.attr("class", classPrefix + "LegendDiv");

	const legendSvg = legendDiv.append("svg")
		.attr("class", classPrefix + "LegendSvg")
		.attr("width", legendSvgWidth)
		.attr("height", chartState.displayMode === "size" ? legendSvgHeightSize : legendColorPadding + legendSvgHeightColor * 3);

	Promise.all([fetchFile("masterFunds", masterFundsUrl, "master table for funds", "json"),
			fetchFile("masterSectorTypes", masterSectorTypesUrl, "master table for sector types", "json"),
			fetchFile("allocationsData", dataUrl, "allocations data", "csv")
		])
		.then(rawData => controlChart(rawData));

	function controlChart([masterFunds,
		masterSectorTypes,
		rawAllocationsData
	]) {

		removeLoader(loader);

		createFundsList(masterFunds.value); //REMOVE 'value' IN THE FINAL VERSION
		createSectorsList(masterSectorTypes);

		preProcessData(rawAllocationsData, colors);

		infoDivBody.html(`Hover over the ${chartState.displayMode === "size" ? "circles" : "markers"} for displaying additional information`);

		createColorScales();

		const allDropdowns = createDropdowns(dropdownDiv, filterDiv, tooltip);

		const buttons = createRadioButtons(buttonsDiv, tooltip);

		const data = processData(rawAllocationsData);

		disableDropdownOptions(allDropdowns);

		drawBubbleMap(data, d3MapSvgGroup, legendSvg, leafletMap, buttons, infoDivTitle, infoDivBody);

		leafletMap.on("zoom", () => redrawMap(d3MapSvgGroup, leafletMap));

		//listeners
		for (const dropdown in allDropdowns) {
			if (dropdown === "filterContainer") continue;
			const type = dropdown.replace("Dropdown", "");

			allDropdowns[dropdown].checkboxDiv.on("change", (event, d) => {
				lastFilterClicked = type;
				if (+d !== +d && d.includes("All")) {
					if (event.target.checked) {
						chartState[`selected${capitalize(type)}`] = inAllDataLists[`${type}sInAllData`].slice();
						allDropdowns[dropdown].checkbox.property("checked", false);
					} else {
						chartState[`selected${capitalize(type)}`].length = 0;
					};
				} else {
					if (event.target.checked) {
						if (chartState[`selected${capitalize(type)}`].length === inAllDataLists[`${type}sInAllData`].length) {
							chartState[`selected${capitalize(type)}`] = [d];
						} else {
							chartState[`selected${capitalize(type)}`].push(d);
						};
					} else {
						const thisIndex = chartState[`selected${capitalize(type)}`].indexOf(d);
						chartState[`selected${capitalize(type)}`].splice(thisIndex, 1);
					};
					allDropdowns[dropdown].allSelection.property("checked", false);
				};

				const names = type + "NamesList";

				allDropdowns[dropdown].title.html(chartState[`selected${capitalize(type)}`].length === inAllDataLists[`${type}sInAllData`].length ? (type === "status" ? "All statuses" : `All ${type}s`) :
					chartState[`selected${capitalize(type)}`].length > 1 ? (type === "status" ? "Multiple statuses" : `Multiple ${type}s`) :
					chartState[`selected${capitalize(type)}`].length === 1 ? ((lists[names] && lists[names][d]) ? lists[names][d] : d) :
					"No selection"
				);

				const data = processData(rawAllocationsData);

				disableDropdownOptions(allDropdowns);

				drawBubbleMap(data, d3MapSvgGroup, legendSvg, leafletMap, buttons, infoDivTitle, infoDivBody);

			});

		};

		allDropdowns.filterContainer.on("click", () => {
			for (const state in chartState) chartState[state] = structuredClone(frozenChartState[state]);
			const data = processData(rawAllocationsData);
			disableDropdownOptions(allDropdowns);
			drawBubbleMap(data, d3MapSvgGroup, legendSvg, leafletMap, buttons, infoDivTitle, infoDivBody);
			for (const dropdown in allDropdowns) {
				if (dropdown === "filterContainer") continue;
				const type = dropdown.replace("Dropdown", "");
				allDropdowns[dropdown].title.html(`Select ${capitalize(type)}`)
			};
		});

		//end of controlChart
	};

	//end of createBubbleMap;
};


function createDropdowns(dropdownDiv, filterDiv, tooltip) {

	const yearDropdown = createDropdown("year", allYears);
	const fundDropdown = createDropdown("fund", allFunds);
	const sectorDropdown = createDropdown("sector", allSectors);
	const statusDropdown = createDropdown("status", allStatus);

	const filterContainer = filterDiv.append("div")
		.attr("class", classPrefix + "filterContainer");

	filterContainer.append("i")
		.style("font-size", "22px")
		.attr("class", "fa-solid fa-filter-circle-xmark");

	filterContainer.on("mouseover", event => {
		tooltip.style("display", "block")
			.html(null);

		const innerTooltip = tooltip.append("div")
			.style("max-width", "120px")
			.style("white-space", "nowrap")
			.attr("id", classPrefix + "innerTooltipDiv");

		innerTooltip.html("Remove all filters.");

		const containerSize = tooltip.node().parentNode.getBoundingClientRect();
		const thisSize = event.currentTarget.getBoundingClientRect();
		const tooltipSize = tooltip.node().getBoundingClientRect();

		//IMPORTANT: add the function for positioning the tooltip
		tooltip.style("left", (thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
				"0px" : thisSize.left + thisSize.width / 2 - tooltipSize.width / 2 - containerSize.left + "px")
			.style("top", thisSize.top - containerSize.top + thisSize.height + 12 + "px");
	}).on("mouseout", () => {
		tooltip.html(null)
			.style("display", "none");
	});

	return { yearDropdown, fundDropdown, sectorDropdown, statusDropdown, filterContainer };

	function createDropdown(type, allOption) {

		//region checkboxes

		const dropdownContainer = dropdownDiv.append("div")
			.datum({
				clicked: false
			})
			.attr("class", classPrefix + type + "Container");

		//IMPROVE THIS, IF REQUESTED
		// dropdownContainer.on("mouseleave", (event, d) => d3.select(event.currentTarget)
		// 	.classed("active", d => d.clicked = false));

		const titleDiv = dropdownContainer.append("div")
			.attr("class", classPrefix + type + "TitleDiv");

		const title = titleDiv.append("div")
			.attr("class", classPrefix + type + "Title")
			.html("Select " + capitalize(type));

		const arrow = titleDiv.append("div")
			.attr("class", classPrefix + type + "Arrow");

		arrow.append("i")
			.attr("class", "fa fa-angle-down");

		const dropdown = dropdownContainer.append("div")
			.attr("class", classPrefix + type + "Dropdown");

		titleDiv.on("click", () => {
			dropdownDiv.selectChildren("div")
				.classed("active", (d, i, n) => d.clicked = (n[i] === dropdownContainer.node() ? !d.clicked : false));
		});

		const checkboxData = inAllDataLists[`${type}sInAllData`].slice();

		//IMPORTANT: sort the data
		// .sort(function(a, b) {
		// 	return (lists.regionNames[a]).localeCompare(lists.regionNames[b]);
		// })

		checkboxData.unshift(allOption);

		const checkboxDiv = dropdown.selectAll(null)
			.data(checkboxData)
			.enter()
			.append("div")
			.attr("class", classPrefix + type + "CheckboxDiv");

		const label = checkboxDiv.append("label");

		const input = label.append("input")
			.attr("type", "checkbox")
			.attr("value", d => d);

		if (type === "status") {
			label.append("i")
				.style("font-size", "0.8em")
				.style("color", d => colorScale(d))
				.attr("class", "fa-solid fa-circle");
		};

		const span = label.append("span")
			.attr("class", classPrefix + "checkboxText")
			.html(d => {
				const names = type + "NamesList";
				return (lists[names] && lists[names][d]) ? lists[names][d] : d;
			});

		const allSelection = checkboxDiv.filter(d => d === allOption).select("input");

		d3.select(allSelection.node().nextSibling)
			.attr("class", classPrefix + "checkboxTextAllRegions");

		const checkbox = checkboxDiv.filter(d => d !== allOption).select("input");

		// checkbox.property("disabled", d => !inSelectionLists[`${type}sInCurrentSelection`].includes(d));

		// allSelection.property("checked", () => chartState[`selected${capitalize(type)}`].length === inAllDataLists[`${type}sInAllData`].length);

		return { title, checkboxDiv, checkbox, allSelection };

		//end of createDropdown
	};

	//end of createDropdowns
};

function disableDropdownOptions(allDropdowns) {

	for (const dropdown in allDropdowns) {
		if (dropdown === "filterContainer") continue;
		const type = dropdown.replace("Dropdown", "");

		allDropdowns[dropdown].checkboxDiv.filter((_, i) => i)
			.style("opacity", d => inSelectionLists[`${type}sInCurrentSelection`].includes(d) ? 1 : disabledOpacity);

		allDropdowns[dropdown].checkbox.property("disabled", d => !inSelectionLists[`${type}sInCurrentSelection`].includes(d))
			.property("checked", d => chartState[`selected${capitalize(type)}`].length !== inAllDataLists[`${type}sInAllData`].length && chartState[`selected${capitalize(type)}`].includes(d))

		allDropdowns[dropdown].allSelection.property("checked", () => chartState[`selected${capitalize(type)}`].length === inAllDataLists[`${type}sInAllData`].length);
	};

};

function createRadioButtons(container, tooltip) {

	const radioTextDiv = container.append("div")
		.attr("class", classPrefix + "radioTextDiv");

	const radioDiv = container.append("div")
		.attr("class", classPrefix + "radioDiv");

	radioTextDiv.append("span")
		.html("Allocations value encoded by: ");

	const input = radioDiv.selectAll(null)
		.data(displayModes)
		.enter()
		.append("input")
		.attr("type", "radio")
		.attr("name", classPrefix + "radio")
		.attr("id", (_, i) => classPrefix + "option-" + (i + 1))
		.property("checked", d => d === chartState.displayMode)
		.attr("value", d => d);

	const label = radioDiv.selectAll(null)
		.data(displayModes)
		.enter()
		.append("label")
		.attr("for", (_, i) => classPrefix + "option-" + (i + 1))
		.attr("class", (_, i) => classPrefix + "option " + classPrefix + "option-" + (i + 1));

	label.append("div")
		.attr("class", classPrefix + "dot");

	label.append("span")
		.attr("class", classPrefix + "radioSpan")
		.html(d => capitalize(d));

	return input;

	//end of createRadioButtons
};

function drawBubbleMap(data, mapSvg, legendSvg, leafletMap, buttons, infoDivTitle, infoDivBody) {

	const mapCenter = leafletMap.getCenter();

	const noDataGroup = mapSvg.selectAll(`.${classPrefix}noDataGroup`)
		.data(data.length === 0 ? [true] : []);

	noDataGroup.exit().remove();

	const noDataGroupEnter = noDataGroup.enter()
		.append("g")
		.attr("class", classPrefix + "noDataGroup");

	noDataGroupEnter.append("text")
		.attr("class", classPrefix + "NoDataTextBack")
		.attr("y", leafletMap.latLngToLayerPoint(mapCenter).y)
		.attr("x", leafletMap.latLngToLayerPoint(mapCenter).x)
		.attr("text-anchor", "middle")
		.text("No data for the current selection");

	noDataGroupEnter.append("text")
		.attr("class", classPrefix + "NoDataText")
		.attr("y", leafletMap.latLngToLayerPoint(mapCenter).y)
		.attr("x", leafletMap.latLngToLayerPoint(mapCenter).x)
		.attr("text-anchor", "middle")
		.text("No data for the current selection");

	const maxValue = d3.max(data, d => d.totalValue);

	for (const status in colorScales) {
		const allValues = data.reduce((acc, curr) => {
			if (curr.status === status) acc.push(curr.totalValue)
			return acc;
		}, []);
		allValues.sort((a, b) => a - b);
		colorScales[status].domain(allValues);
	};

	radiusScale.domain([0, maxValue]);

	const extentLatitude = data.length === 1 ? [countryBoundingBoxes[isoAlpha2to3[fundIsoCodesList[data[0].fund]]].sw.lat, countryBoundingBoxes[isoAlpha2to3[fundIsoCodesList[data[0].fund]]].ne.lat] :
		d3.extent(data, d => +d.lat);

	const extentLongitude = data.length === 1 ? [countryBoundingBoxes[isoAlpha2to3[fundIsoCodesList[data[0].fund]]].sw.lon, countryBoundingBoxes[isoAlpha2to3[fundIsoCodesList[data[0].fund]]].ne.lon] :
		d3.extent(data, d => +d.lon);

	if (chartState.displayMode === "size") {
		drawSizeMap();
	} else {
		drawColorMap();
	};

	flyTo(extentLatitude, extentLongitude);

	redrawMap(mapSvg, leafletMap);

	createLegend();

	function drawSizeMap() {

		mapSvg.select(`.${classPrefix}ColorMapGroup`).remove();

		let sizeMapGroup = mapSvg.selectAll(`.${classPrefix}SizeMapGroup`)
			.data([true]);

		sizeMapGroup = sizeMapGroup.enter()
			.append("g")
			.attr("class", classPrefix + "SizeMapGroup")
			.merge(sizeMapGroup);

		let pieGroup = sizeMapGroup.selectAll("." + classPrefix + "pieGroup")
			.data(data, d => d.key);

		const pieGroupExit = pieGroup.exit();

		pieGroupExit.each((_, i, n) => {
			const thisGroup = d3.select(n[i]);
			thisGroup.selectAll("." + classPrefix + "slice")
				.transition()
				.duration(duration)
				.attrTween("d", (d, j, m) => {
					const finalObject = !j ? {
						startAngle: 0,
						endAngle: 0,
						outerRadius: 0
					} : {
						startAngle: Math.PI * 2,
						endAngle: Math.PI * 2,
						outerRadius: 0
					};
					const interpolator = d3.interpolateObject(localVariable.get(m[j]), finalObject);
					return t => arcGenerator(interpolator(t));
				})
				.on("end", () => thisGroup.remove())
		});

		const pieGroupEnter = pieGroup.enter()
			.append("g")
			.attr("class", classPrefix + "pieGroup");

		pieGroup = pieGroupEnter.merge(pieGroup);

		pieGroup.order();

		let slices = pieGroup.selectAll("." + classPrefix + "slice")
			.data(d => pieGenerator(d.values.filter(e => e.value !== 0)), d => d.data.status);

		const slicesRemove = slices.exit()
			.transition()
			.duration(duration)
			.attrTween("d", (d, i, n) => {
				const parentDatum = d3.select(n[i].parentNode).datum();
				const thisTotal = radiusScale(parentDatum.totalValue);
				const finalObject = !i ? {
					startAngle: 0,
					endAngle: 0,
					outerRadius: thisTotal
				} : {
					startAngle: Math.PI * 2,
					endAngle: Math.PI * 2,
					outerRadius: thisTotal
				};
				const interpolator = d3.interpolateObject(localVariable.get(n[i]), finalObject);
				return t => arcGenerator(interpolator(t));
			})
			.on("end", (_, i, n) => d3.select(n[i]).remove())

		const slicesEnter = slices.enter()
			.append("path")
			.attr("class", classPrefix + "slice")
			.style("pointer-events", "all")
			.style("fill", d => colorScale(d.data.status))
			.style("stroke", "#666")
			.style("stroke-width", "1px")
			.style("stroke-opacity", strokeOpacityValue)
			.style("fill-opacity", fillOpacityValue)
			.each((d, i, n) => {
				let siblingRadius = 0;
				const siblings = d3.select(n[i].parentNode).selectAll("path")
					.each((_, j, m) => {
						const thisLocal = localVariable.get(m[j])
						if (thisLocal) siblingRadius = thisLocal.outerRadius;
					});
				if (!i) {
					localVariable.set(n[i], {
						startAngle: 0,
						endAngle: 0,
						outerRadius: siblingRadius
					});
				} else {
					localVariable.set(n[i], {
						startAngle: Math.PI * 2,
						endAngle: Math.PI * 2,
						outerRadius: siblingRadius
					});
				};
			})

		slices = slicesEnter.merge(slices);

		slices.transition()
			.duration(duration)
			.attrTween("d", pieTween);

		function pieTween(d) {
			const i = d3.interpolateObject(localVariable.get(this), {
				startAngle: d.startAngle,
				endAngle: d.endAngle,
				outerRadius: radiusScale(d.data.total)
			});
			localVariable.set(this, i(1));
			return t => arcGenerator(i(t));
		};

		pieGroup.on("mouseover", (_, d) => populateInfoDiv(d, infoDivTitle, infoDivBody))
			.on("mouseout", () => clearInfoDiv(infoDivTitle, infoDivBody));

	};

	function drawColorMap() {

		mapSvg.select(`.${classPrefix}SizeMapGroup`).remove();

		let colorMapGroup = mapSvg.selectAll(`.${classPrefix}ColorMapGroup`)
			.data([true]);

		colorMapGroup = colorMapGroup.enter()
			.append("g")
			.attr("class", classPrefix + "ColorMapGroup")
			.merge(colorMapGroup);

		let colorMarkers = colorMapGroup.selectAll(`.${classPrefix}ColorMarkers`)
			.data(data, d => d.key);

		const colorMarkersExit = colorMarkers.exit().remove();

		const colorMarkersEnter = colorMarkers.enter()
			.append("path")
			.attr("class", classPrefix + "ColorMarkers")
			.attr("d", markerAttribute)
			.style("pointer-events", "all")
			.style("stroke", markerStroke);

		colorMarkers = colorMarkersEnter.merge(colorMarkers);

		colorMarkers.style("fill", d => colorScales[d.status](d.totalValue));

		colorMarkers.on("mouseover", (_, d) => populateInfoDiv(d, infoDivTitle, infoDivBody))
			.on("mouseout", () => clearInfoDiv(infoDivTitle, infoDivBody));
	};

	buttons.on("click", (_, d) => {
		chartState.displayMode = d;
		if (chartState.displayMode === "size") {
			drawSizeMap();
		} else {
			drawColorMap();
		};
		redrawMap(mapSvg, leafletMap);
		createLegend();
		clearInfoDiv(infoDivTitle, infoDivBody);
	});

	function createLegend() {

		const maxDataValue = radiusScale.domain()[1];

		const sizeCirclesData = [0, maxDataValue / 4, maxDataValue / 2, maxDataValue];

		legendSvg.attr("height", chartState.displayMode === "size" ? legendSvgHeightSize : legendColorPadding + legendSvgHeightColor * inSelectionLists.statussInCurrentSelection.length);

		let backgroundRectangle = legendSvg.selectAll(`.${classPrefix}backgroundRectangle`)
			.data([true]);

		backgroundRectangle = backgroundRectangle.enter()
			.append("rect")
			.attr("class", classPrefix + "backgroundRectangle")
			.style("fill", "#fff")
			.style("opacity", 0.6)
			.attr("width", legendSvgWidth)
			.merge(backgroundRectangle)
			.attr("height", chartState.displayMode === "size" ? legendSvgHeightSize : legendColorPadding + legendSvgHeightColor * inSelectionLists.statussInCurrentSelection.length);

		const legendTitle = legendSvg.selectAll(`.${classPrefix}LegendTitle`)
			.data([true])
			.enter()
			.append("text")
			.attr("class", classPrefix + "LegendTitle")
			.attr("x", legendSvgPadding[3])
			.attr("y", legendSvgPadding[0] + legendTitlePadding)
			.text("Legend");

		if (chartState.displayMode === "size") {
			createSizeLegend();
		} else {
			createColorLegend();
		};

		function createSizeLegend() {

			legendSvg.select(`.${classPrefix}LegendColorGroup`).remove();

			const legendSizeGroups = legendSvg.selectAll(`.${classPrefix}LegendSizeGroups`)
				.data([true])
				.enter()
				.append("g")
				.attr("class", classPrefix + "LegendSizeGroups");

			let legendSizeGroup = legendSizeGroups.selectAll(`.${classPrefix}LegendSizeGroup`)
				.data(sizeCirclesData);

			const legendSizeGroupEnter = legendSizeGroup.enter()
				.append("g")
				.attr("class", classPrefix + "LegendSizeGroup");

			const legendSizeLines = legendSizeGroupEnter.append("line")
				.attr("x1", legendSvgPadding[3] + radiusScale.range()[1])
				.attr("x2", legendSvgPadding[3] + radiusScale.range()[1] + 30)
				.attr("y1", d => d ? legendSvgPadding[0] + legendCirclePadding + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
					legendSvgPadding[0] + legendCirclePadding + (radiusScale.range()[1] * 2))
				.attr("y2", d => d ? legendSvgPadding[0] + legendCirclePadding + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
					legendSvgPadding[0] + legendCirclePadding + (radiusScale.range()[1] * 2))
				.style("stroke", "#666")
				.style("stroke-dasharray", "2,2")
				.style("stroke-width", "1px");

			const legendSizeCircles = legendSizeGroupEnter.append("circle")
				.attr("cx", legendSvgPadding[3] + radiusScale.range()[1])
				.attr("cy", d => legendSvgPadding[0] + legendCirclePadding + (radiusScale.range()[1] * 2) - radiusScale(d))
				.attr("r", d => !d ? 0 : radiusScale(d))
				.style("fill", "none")
				.style("stroke", "darkslategray");

			const legendSizeCirclesText = legendSizeGroupEnter.append("text")
				.attr("class", classPrefix + "LegendCirclesText")
				.attr("x", legendSvgPadding[3] + radiusScale.range()[1] + 34)
				.attr("y", (d, i) => i === 1 ? legendSvgPadding[0] + (legendCirclePadding + 5) + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
					i ? legendSvgPadding[0] + (legendCirclePadding + 3) + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
					legendSvgPadding[0] + (legendCirclePadding + 3) + (radiusScale.range()[1] * 2) - 2)
				.text(d => d ? d3.formatPrefix(".0", d)(d) : "0");

			legendSizeGroup = legendSizeGroup.merge(legendSizeGroupEnter);

			legendSizeGroup.select(`.${classPrefix}LegendCirclesText`)
				.text(d => d ? d3.formatPrefix(".0", d)(d) : "0");

			//end of createSizeLegend
		};

		function createColorLegend() {

			legendSvg.select(`.${classPrefix}LegendSizeGroups`).remove();

			let legendColorGroup = legendSvg.selectAll(`.${classPrefix}LegendColorGroup`)
				.data([true]);

			legendColorGroup = legendColorGroup.enter()
				.append("g")
				.attr("class", classPrefix + "LegendColorGroup")
				.merge(legendColorGroup);

			let statusGroup = legendColorGroup.selectAll(`.${classPrefix}statusGroup`)
				.data(inSelectionLists.statussInCurrentSelection, d => d);

			statusGroup.exit().remove();

			const statusGroupEnter = statusGroup.enter()
				.append("g")
				.attr("class", classPrefix + "statusGroup")
				.each((d, i, n) => localVariable.set(n[i], colorScales[d]))

			const legendColorTitle = statusGroupEnter.append("text")
				.attr("class", classPrefix + "legendColorTitle")
				.attr("y", legendRectPadding - 2)
				.attr("x", legendSvgPadding[3])
				.text(d => d === "Under Implementation" ? "Under Implem." : d);

			const legendRects = statusGroupEnter.selectAll(`.${classPrefix}LegendRects`)
				.data(d => [colorScales[d].domain()[0]].concat(colorScales[d].quantiles()))
				.enter()
				.append("rect")
				.attr("class", classPrefix + "LegendRects")
				.attr("y", legendRectPadding)
				.attr("x", (_, i) => legendSvgPadding[3] + i * (legendRectWidth + 3))
				.style("stroke", "#444")
				.attr("width", legendRectWidth)
				.attr("height", legendRectHeight)
				.style("fill", (d, i, n) => localVariable.get(n[i])(d));

			const legendColorLines = statusGroupEnter.selectAll(`.${classPrefix}LegendColorLines`)
				.data(d3.range(2))
				.enter()
				.append("line")
				.attr("class", classPrefix + "LegendColorLines")
				.attr("y1", legendRectPadding + legendRectHeight + 1)
				.attr("y2", legendRectPadding + legendRectHeight + legendLineHeight)
				.attr("x1", d => d ? legendSvgPadding[3] + 10 * (legendRectWidth + 3) - 3 : legendSvgPadding[3])
				.attr("x2", d => d ? legendSvgPadding[3] + 10 * (legendRectWidth + 3) - 3 : legendSvgPadding[3])
				.style("stroke-width", "1px")
				.style("shape-rendering", "crispEdges")
				.style("stroke", "#444");

			let legendColorTexts = statusGroupEnter.selectAll(`.${classPrefix}LegendColorTexts`)
				.data(d => d3.extent(colorScales[d].domain()))
				.enter()
				.append("text")
				.attr("class", classPrefix + "LegendColorTexts")
				.attr("y", legendRectPadding + legendRectHeight + legendLineHeight + 2)
				.attr("x", (_, i) => i ? legendSvgPadding[3] + 10 * (legendRectWidth + 3) - 3 : legendSvgPadding[3])
				.attr("text-anchor", (_, i) => i ? "end" : "start")
				.text(d => d ? d3.formatPrefix(".0", d)(d) : "0");

			statusGroup = statusGroupEnter.merge(statusGroup);

			statusGroup.attr("transform", (_, i) => `translate(0,${legendColorPadding + (i*legendSizeGroupPadding)})`);

			//IMPORTANT: UPDATE THE RECTANGLES' COLORS AND THE TEXT VALUES

			//end of createColorLegend
		};

		//end of createLegend
	};

	function flyTo(extentLatitude, extentLongitude) {

		const topLeftCorner = [extentLatitude[1], extentLongitude[0]];

		const bottomRightCorner = [extentLatitude[0], extentLongitude[1]];

		const bounds = L.latLngBounds(topLeftCorner, bottomRightCorner);

		leafletMap.flyToBounds(bounds, {
			paddingTopLeft: [2 * maxCircleRadius, maxCircleRadius],
			paddingBottomRight: [maxCircleRadius, maxCircleRadius],
			maxZoom: maxZoomValue
		});

		//end of flyTo
	};

	//end of drawBubbleMap
};

function populateInfoDiv(datum, infoDivTitle, infoDivBody) {
	console.log(datum)
	infoDivTitle.html(datum.adminLoc + " (" + lists.fundNamesList[datum.fund] + ")");
	infoDivBody.html(null);
	if (datum.projectList.length > 1) {
		infoDivBody.append("div")
			.attr("class", classPrefix + "infoDivProjectTotal")
			.html("Total allocated: ")
			.append("span")
			.html("$" + formatMoney0Decimals(datum.totalValue));
		infoDivBody.append("div")
			.attr("class", classPrefix + "projectListHeader")
			.html("List of Projects");
	};
	datum.projectList.forEach((project, index) => {
		infoDivBody.append("div")
			.attr("class", classPrefix + "infoDivProjectCode")
			.html("Project: " + project.projectCode);
		infoDivBody.append("div")
			.attr("class", classPrefix + "infoDivProjectTitle")
			.html(project.projectTitle);
		infoDivBody.append("div")
			.attr("class", classPrefix + "infoDivProjectTotal")
			.html("Total allocated: ")
			.append("span")
			.html("$" + formatMoney0Decimals(project.value));
		infoDivBody.append("div")
			.attr("class", classPrefix + "infoDivProjectStatus")
			.html("Status: ")
			.append("span")
			.html(project.status);
		infoDivBody.append("div")
			.attr("class", classPrefix + "infoDivSectorsTitle")
			.html("Sectors");
		Object.entries(project.sectorsList).forEach(sector => {
			const rowDiv = infoDivBody.append("div")
				.attr("class", classPrefix + "infoDivRow");
			const sectorName = rowDiv.append("div")
				.html(lists.sectorNamesList[sector[0]] + " (" + (formatPercentage(sector[1] / project.value)) + "): ");
			const sectorValue = rowDiv.append("div")
				.attr("class", classPrefix + "infoDivRowValue")
				.html("$" + formatMoney0Decimals(sector[1]));
		});
		if(datum.projectList.length > 1 && index < datum.projectList.length - 1){
			infoDivBody.append("div")
				.attr("class", classPrefix + "divider");
		};
	});
};

function clearInfoDiv(infoDivTitle, infoDivBody) {
	infoDivTitle.html("Additional Information");
	infoDivBody.html(`Hover over the ${chartState.displayMode === "size" ? "circles" : "markers"} for displaying additional information`);
};

function redrawMap(mapSvg, leafletMap) {

	const selectedClass = chartState.displayMode === "size" ? `.${classPrefix}pieGroup` : `.${classPrefix}ColorMarkers`;

	const scaleValue = chartState.displayMode === "size" ? 1 : 0.75;

	const markers = mapSvg.selectAll(selectedClass);

	markers.attr("transform", d => "translate(" + leafletMap.latLngToLayerPoint(d.coordinates).x + "," + leafletMap.latLngToLayerPoint(d.coordinates).y + ") scale(" + scaleValue + ")");

	const noDataText = mapSvg.selectAll(`.${classPrefix}NoDataText, .${classPrefix}NoDataTextBack`);

	if (noDataText) {
		const mapCenter = leafletMap.getCenter();
		noDataText.attr("y", leafletMap.latLngToLayerPoint(mapCenter).y)
			.attr("x", leafletMap.latLngToLayerPoint(mapCenter).x)
	};

	//end of redrawMap
};

function preProcessData(rawAllocationsData, colors) {
	const yearsSet = new Set(),
		fundsSet = new Set(),
		sectorsSet = new Set(),
		statusSet = new Set();

	rawAllocationsData.forEach(row => {
		yearsSet.add(row.AYr);
		fundsSet.add(row.PFId);
		if (+row.ClstAgg) {
			sectorsSet.add(row.ClstAgg);
		} else {
			row.ClstAgg.split(pipeSeparator).forEach(e => sectorsSet.add(+e));
		};
		statusSet.add(row.PrjCycleStatus);
	});

	yearsArray.push(...yearsSet);
	yearsArray.sort((a, b) => a - b);

	inAllDataLists.yearsInAllData.push(...yearsArray);
	inAllDataLists.fundsInAllData.push(...fundsSet);
	inAllDataLists.sectorsInAllData.push(...sectorsSet);
	inAllDataLists.statussInAllData.push(...statusSet);

	//set chartState defaults
	chartState.selectedYear = [yearsArray[yearsArray.length - 1]];
	chartState.selectedFund = inAllDataLists.fundsInAllData.slice();
	chartState.selectedSector = inAllDataLists.sectorsInAllData.slice();
	chartState.selectedStatus = inAllDataLists.statussInAllData.slice();
	chartState.displayMode = displayModes[0];

	inAllDataLists.statussInAllData.sort((a, b) => a.localeCompare(b));

	colorScale.range(colors)
		.domain(inAllDataLists.statussInAllData);

	frozenChartState = structuredClone(chartState);
	Object.freeze(frozenChartState);

};

function processData(rawAllocationsData) {

	//Object example:
	// 	{
	//     "FundId": 1,
	//     "PFId": 15,
	//     "PrjCode": "SUD-20/HSD20/RA 3/CCS/UN/17190",
	//     "AllSrc": 1,
	//     "PrjTitle": "2020 Multi Sector Needs Assessment to inform the HNO and HRP processes in Sudan",
	//     "ClstAgg": 12,
	//     "ClstPrct": 100,
	//     "AdmLocTypeIdAgg": "69##",
	//     "AdmLoc1": "Abyei",
	//     "AdmLocCord1": "9.59500000,28.43600000",
	//     "AdmLocClustBdg1": 1962.96,
	//     "AYr": 2020,
	//     "PrjCycleStatus": "Under Approval",
	//     "SubIPName": "Org1"
	// }

	const filterBy = (value, type) => chartState[`selected${type}`].includes(value);
	const filterBySector = arr => arr.some(e => chartState.selectedSector.includes(e));

	const yearsInCurrentSelectionSet = new Set(),
		fundsInCurrentSelectionSet = new Set(),
		sectorsInCurrentSelectionSet = new Set(),
		statussInCurrentSelectionSet = new Set();

	for (const selection in inSelectionLists) inSelectionLists[selection].length = 0;

	const data = [];

	rawAllocationsData.forEach(row => {

		let aggregatedObject = {};
		const aggregatedData = (+row.ClstAgg !== +row.ClstAgg) || (+row.AdmLocClustBdg1 !== +row.AdmLocClustBdg1);
		if (aggregatedData) {
			const sectorsList = row.ClstAgg.split(pipeSeparator);
			const valuesList = row.AdmLocClustBdg1.split(pipeSeparator);
			if (sectorsList.length !== valuesList.length) {
				console.warn("Pipe separators not matching. Row: " + JSON.stringify(row));
				return;
			};
			sectorsList.forEach((list, i) => {
				aggregatedObject[list] = +valuesList[i];
			});
		} else {
			aggregatedObject[row.ClstAgg] = +row.AdmLocClustBdg1;
		};

		const aggregatedObjectKeys = Object.keys(aggregatedObject).map(e => +e);

		//populates the 'inSelectionList' outside the filtered row
		if (chartState.selectedFund.length === inAllDataLists.fundsInAllData.length &&
			chartState.selectedSector.length === inAllDataLists.sectorsInAllData.length &&
			chartState.selectedStatus.length === inAllDataLists.statussInAllData.length) yearsInCurrentSelectionSet.add(row.AYr);
		//CHANGE THIS LOGIC!!!!
		if (lastFilterClicked === "fund") fundsInCurrentSelectionSet.add(row.PFId);
		if (lastFilterClicked === "sector") Object.keys(aggregatedObject).forEach(e => sectorsInCurrentSelectionSet.add(+e));
		if (lastFilterClicked === "status") statussInCurrentSelectionSet.add(row.PrjCycleStatus);

		//filter the row according to the filters
		if (filterBy(row.AYr, "Year") &&
			filterBy(row.PFId, "Fund") &&
			filterBy(row.PrjCycleStatus, "Status") &&
			filterBySector(aggregatedObjectKeys)) {

			//filters aggregatedObject
			for (const prop in aggregatedObject) {
				if (chartState.selectedSector.length !== inAllDataLists.sectorsInAllData.length && !chartState.selectedSector.includes(prop)) delete aggregatedObject[prop];
			};

			const aggregatedObjectSum = d3.sum(Object.values(aggregatedObject));

			//populates the 'inSelectionList'
			yearsInCurrentSelectionSet.add(row.AYr);
			fundsInCurrentSelectionSet.add(row.PFId);
			Object.keys(aggregatedObject).forEach(e => sectorsInCurrentSelectionSet.add(+e));
			statussInCurrentSelectionSet.add(row.PrjCycleStatus);

			const latLong = row.AdmLocCord1.split(",").map(e => +e);

			const thisKey = row.AdmLoc1 + Math.abs(Math.floor(latLong[0] * 1000)) + Math.abs(Math.floor(latLong[1] * 1000));

			const foundObject = data.find(e => e.key === thisKey);

			if (foundObject) {
				foundObject.projectList.push({
					projectCode: row.PrjCode,
					projectTitle: row.PrjTitle,
					status: row.PrjCycleStatus,
					value: aggregatedObjectSum,
					sectorsList: aggregatedObject,
				});
				foundObject.totalValue += aggregatedObjectSum;
				const foundStatus = foundObject.values.find(e => e.status === row.PrjCycleStatus);
				if (foundStatus) {
					foundStatus.value += aggregatedObjectSum;
				} else {
					foundObject.values.push({ value: aggregatedObjectSum, status: row.PrjCycleStatus });
				};
			} else {
				const valuesArray = [{ value: aggregatedObjectSum, status: row.PrjCycleStatus }];
				const copiedRow = {
					year: row.AYr,
					fund: row.PFId,
					projectList: [{
						projectCode: row.PrjCode,
						projectTitle: row.PrjTitle,
						status: row.PrjCycleStatus,
						value: aggregatedObjectSum,
						sectorsList: aggregatedObject,
					}],
					adminLoc: row.AdmLoc1,
					lat: latLong[0],
					lon: latLong[1],
					totalValue: aggregatedObjectSum,
					values: valuesArray,
					key: thisKey,
					coordinates: new L.LatLng(latLong[0], latLong[1])
				};

				data.push(copiedRow);
			};

		};

	});

	inSelectionLists.yearsInCurrentSelection.push(...yearsInCurrentSelectionSet);
	inSelectionLists.fundsInCurrentSelection.push(...fundsInCurrentSelectionSet);
	inSelectionLists.sectorsInCurrentSelection.push(...sectorsInCurrentSelectionSet);
	inSelectionLists.statussInCurrentSelection.push(...statussInCurrentSelectionSet);

	data.forEach(row => {
		row.values.sort((a, b) => a.value - b.value);
		row.values.forEach(valuesObj => valuesObj.total = row.totalValue);
		row.status = row.values[row.values.length - 1].status;
	})

	data.sort((a, b) => b.value - a.value);

	console.log(data);

	return data;

};

function createColorScales() {

	inAllDataLists.statussInAllData.forEach(status => {
		const color = colorScale(status),
			colorInterpolator = d3.interpolateRgb(minValueColor, color),
			colorsQuantile = d3.range(10).map(d => colorInterpolator(d / 9));
		colorScales[status] = d3.scaleQuantile()
			.range(colorsQuantile);
	});

};

function createFundsList(fundsData) {
	//TEMPORARY OBJECT:
	// 	{
	//     "PFId": 23,
	//     "PFName": "Afghanistan",
	//     "PFAbbrv": "AFG23",
	//     "PFLat": "34.53333300",
	//     "PFLong": "69.16666700",
	//     "PFCountryCode": "AF",
	//     "MAAgent": "OCHA",
	//     "AAgent": "MPTF",
	//     "IsPublic": true
	// }

	fundsData.forEach(row => {
		lists.fundNamesList[row.PFId + ""] = row.PFName;
		lists.fundNamesListKeys.push(row.PFId + "");
		fundIsoCodesList[row.PFId + ""] = row.PFCountryCode;
		fundLatLongList[row.PFCountryCode] = [row.PFLat, row.PFLong];
	});

	//REVERT TO: (???)
	// fundsData.forEach(row => {
	// 	cbpfStatusList[row.id + ""] = row.CBPFFundStatus;
	// 	cerfIdsList[row.id + ""] = row.CERFId;
	// 	fundNamesList[row.id + ""] = row.PooledFundName;
	// 	fundAbbreviatedNamesList[row.id + ""] = row.PooledFundNameAbbrv;
	// 	fundNamesListKeys.push(row.id + "");
	// 	fundRegionsList[row.id + ""] = row.RegionNameArr;
	// 	fundIsoCodesList[row.id + ""] = row.ISO2Code;
	// 	fundIsoCodes3List[row.id + ""] = row.CountryCode;
	// 	fundLatLongList[row.ISO2Code] = [row.latitude, row.longitude];
	// 	if (row.PooledFundName === "CERF") cerfPooledFundId = row.id;
	// });
};

function createSectorsList(sectorsData) {
	sectorsData.forEach(row => lists.sectorNamesList[row.id + ""] = row.ClustNm);
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

function createLoader(container) {

	const loader = container.append("div")
		.attr("class", classPrefix + "roller");

	loader.selectAll(null)
		.data(d3.range(8))
		.enter()
		.append("div")
		.attr("class", classPrefix + "rollerDots");

	loader.append("div")
		.attr("class", classPrefix + "rollerText")
		.html("Loading data...");

	return loader;
};

function removeLoader(loader) {
	loader.remove();
};

function fetchFile(fileName, url, warningString, method) {
	if (localStorage.getItem(fileName) &&
		JSON.parse(localStorage.getItem(fileName)).timestamp > (currentDate.getTime() - localStorageTime)) {
		const fetchedData = method === "csv" ? d3.csvParse(JSON.parse(localStorage.getItem(fileName)).data, d3.autoType) :
			JSON.parse(localStorage.getItem(fileName)).data;
		console.info("PFBI chart info: " + warningString + " from local storage");
		return Promise.resolve(fetchedData);
	} else {
		const fetchMethod = method === "csv" ? d3.csv : d3.json;
		const rowFunction = method === "csv" ? d3.autoType : null;
		return fetchMethod(url, rowFunction).then(fetchedData => {
			try {
				localStorage.setItem(fileName, JSON.stringify({
					data: method === "csv" ? d3.csvFormat(fetchedData) : fetchedData,
					timestamp: currentDate.getTime()
				}));
			} catch (error) {
				console.info("PFBI chart, " + error);
			};
			console.info("PFBI chart info: " + warningString + " from API");
			return fetchedData;
		});
	};
};

export { createBubbleMap };
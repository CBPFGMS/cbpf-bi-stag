(function flags() {
	/* global d3 */

	const flagsContainer = d3.select(".donor-flags-list"),
		totalContainer = d3.select("#flags-total"),
		formatMoney0Decimals = d3.format(",.0f"),
		tooltipWidth = 300,
		isPfbiSite = window.location.hostname === "cbpf.data.unocha.org",
		blankImg =
			"data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
			
	const tooltip = flagsContainer
		.append("div")
		.attr("id", "tooltipFlags")
		.style("display", "none");

	let totalValue = 0,
		firstYear = Number.POSITIVE_INFINITY;

	Promise.all([
		window.cbpfbiDataObject.contributionsTotalData,
		window.cbpfbiDataObject.flags60,
	]).then(createList);

	function createList([rawData, flagsData]) {
		const allDonors = rawData.reduce(function (acc, curr) {
			totalValue += +curr.PaidAmt + +curr.PledgeAmt;
			firstYear = Math.min(firstYear, +curr.FiscalYear);
			const foundDonor = acc.find(function (e) {
				return e.isoCode === curr.GMSDonorISO2Code;
			});
			if (foundDonor) {
				foundDonor.amount += +curr.PaidAmt + +curr.PledgeAmt;
			} else {
				acc.push({
					name: curr.GMSDonorName,
					isoCode: curr.GMSDonorISO2Code,
					amount: +curr.PaidAmt + +curr.PledgeAmt,
				});
			}
			return acc;
		}, []);
		allDonors.sort(function (a, b) {
			return a.name.localeCompare(b.name);
		});
		totalContainer
			.append("span")
			.attr("class", "highlightedSpan")
			.html(allDonors.length);
		totalContainer.append("span").html(" CBPF donors contributed ");
		totalContainer
			.append("span")
			.attr("class", "highlightedSpan")
			.html(function () {
				let siTotal = d3.formatPrefix(".2s", totalValue)(totalValue);
				const unit = siTotal.slice(-1);
				const unitText =
					unit === "k"
						? "Thousand"
						: unit === "M"
						? "Million"
						: unit === "G"
						? "Billion"
						: "";
				return siTotal.slice(0, -1) + " " + unitText;
			});
		totalContainer.append("span").html(" since " + firstYear);
		const div = flagsContainer
			.selectAll(null)
			.data(allDonors)
			.enter()
			.append("div")
			.attr("class", "flagDiv");
		div.append("div")
			.attr("class", "flagDivInner")
			.append("img")
			.attr("src", function (d) {
				if (d.name === "UNOCHA") return flagsData.un;
				if (d.name === "Multi-Donor Funds") return flagsData.private;
				if (!flagsData[d.isoCode.toLowerCase()]) {
					if (!isPfbiSite)
						console.warn(
							"Flag for " +
								d.name +
								' (ISO code "' +
								d.isoCode +
								'") is missing'
						);
					return blankImg;
				}
				return flagsData[d.isoCode.toLowerCase()];
			})
			.attr("alt", function (d) {
				if (d.name === "UNOCHA") return "United Nations Office for the Coordination of Humanitarian Affairs flag";
				if (d.name === "Multi-Donor Funds") return "Multi-Donor Funds flag";
				if (d.isoCode === "MK") return "North Macedonia flag";
				return d.name + " flag";
			});
		div.append("div")
			.attr("class", "flagName")
			.append("span")
			.html(function (d) {
				if (d.isoCode === "MK") return "Macedonia";
				return d.name;
			});

		div.on("mouseover", generateTooltip).on("mouseout", function () {
			tooltip.style("display", "none").html(null);
		});

		function generateTooltip(datum) {
			tooltip.style("display", "block").html(null);

			const innerTooltipDiv = tooltip
				.append("div")
				.style("max-width", tooltipWidth + "px")
				.attr("id", "flagsinnerTooltipDiv");

			const titleDiv = innerTooltipDiv
				.append("div")
				.attr("class", "flagstooltipTitleDiv")
				.style("margin-bottom", "18px");

			const titleNameDiv = titleDiv
				.append("div")
				.attr("class", "flagstitleNameDiv");

			titleNameDiv
				.append("strong")
				.style("font-size", "16px")
				.html(datum.isoCode === "MK" ? "North Macedonia" : datum.name);

			const tooltipContainer = innerTooltipDiv
				.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("white-space", "pre")
				.style("line-height", 1.4)
				.style("width", "100%");

			const rowDiv = tooltipContainer
				.append("div")
				.style("display", "flex")
				.style("align-items", "center")
				.style("margin-bottom", "4px")
				.style("width", "100%");

			rowDiv
				.append("span")
				.attr("class", "flagstooltipKeys")
				.html("Total contributions");

			rowDiv.append("span").attr("class", "flagstooltipLeader");

			rowDiv
				.append("span")
				.attr("class", "flagstooltipValues")
				.html("$" + formatMoney0Decimals(datum.amount));

			const thisBox = this.getBoundingClientRect();
			const containerBox = flagsContainer.node().getBoundingClientRect();
			const tooltipBox = tooltip.node().getBoundingClientRect();
			const thisOffsetTop =
				thisBox.top -
				containerBox.top -
				(tooltipBox.height - thisBox.height) / 2;
			const thisOffsetLeft =
				thisBox.left - containerBox.left >
				containerBox.width - tooltipBox.width - thisBox.width
					? thisBox.left - containerBox.left - tooltipBox.width
					: thisBox.right - containerBox.left;
			tooltip
				.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");
		}

		//No value for the time being
		// div.append("div")
		// 	.attr("class", "flagValue")
		// 	.append("span")
		// 	.html(function(d) {
		// 		return "($" + formatMoney0Decimals(d.amount) + ")";
		// 	});
	}
})();

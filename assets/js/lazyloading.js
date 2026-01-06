const isProdSite =
	document.location.hostname.search("cbpf.data.unocha.org") !== -1;

// Async script loader
function loadScript(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.async = true;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

// Use requestIdleCallback to defer non-critical work
function scheduleWork(callback, options = {}) {
	if ("requestIdleCallback" in window) {
		requestIdleCallback(callback, {
			timeout: options.timeout || 5000,
		});
	} else {
		setTimeout(callback, options.fallbackDelay || 100);
	}
}

// Load critical data first, with main-thread protection
document.addEventListener("DOMContentLoaded", function () {
	scheduleWork(() => {
		loadScript("assets/js/chartsdata.js").then(() => {
			// Use another idle callback for flags.js
			scheduleWork(
				() => {
					loadScript("assets/js/flags.js");
				},
				{ fallbackDelay: 500 }
			);
		});
	});
});

// Load non-critical scripts with main-thread protection
window.addEventListener("load", function () {
	// Defer script loading to avoid blocking main thread
	scheduleWork(
		() => {
			// Load scripts in smaller batches to avoid large main-thread blocks
			const scriptBatches = [
				// Batch 1: UI libraries and AOS
				[
					"https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js",
					"assets/js/bootstrap-toc.min.js",
					"https://cdnjs.cloudflare.com/ajax/libs/aos/2.1.1/aos.js",
				],

				// Batch 3: Theme and utilities (after plugins)
				[
					"assets/js/respond.js",
					"assets/js/theme.js",
					"https://kit.fontawesome.com/d5d759e566.js",
				],
				// Batch 4: Heavy libraries
				[
					"https://cdn.jsdelivr.net/npm/@ungap/url-search-params@0.1.2/min.min.js",
					"https://cbpfgms.github.io/libraries/html2canvas.min.js",
					"https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js",
					"https://cdnjs.cloudflare.com/ajax/libs/d3-sankey/0.12.3/d3-sankey.min.js",
				],
			];

			// Load each batch with idle callbacks
			function loadBatch(batchIndex) {
				if (batchIndex >= scriptBatches.length) {
					// All batches loaded - ticker is initialized by theme.js
					return;
				}

				Promise.all(scriptBatches[batchIndex].map(loadScript))
					.then(() => {
						// Load next batch in idle time
						scheduleWork(() => loadBatch(batchIndex + 1), {
							fallbackDelay: 50,
						});
					})
					.catch(error => {
						console.warn(`Batch ${batchIndex} failed:`, error);
						// Continue with next batch anyway
						scheduleWork(() => loadBatch(batchIndex + 1), {
							fallbackDelay: 50,
						});
					});
			}

			loadBatch(0);
		},
		{ timeout: 2000, fallbackDelay: 1000 }
	);
});

// Chart configuration with lazy loading
const chartConfig = {
	cbsank: {
		style: isProdSite
			? "./assets/css/charts/d3chartstylescbsank.css"
			: "./assets/css/charts/d3chartstylescbsank-stg.css",
		script: isProdSite
			? "./assets/js/charts/d3chartcbsank.min.js"
			: "./assets/js/charts/d3chartcbsank-stg.min.js",
		container: "#d3chartcontainercbsank",
	},
	pbiclc: {
		style: isProdSite
			? "./assets/css/charts/d3chartstylespbiclc.css"
			: "./assets/css/charts/d3chartstylespbiclc-stg.css",
		script: isProdSite
			? "./assets/js/charts/d3chartpbiclc.min.js"
			: "./assets/js/charts/d3chartpbiclc-stg.min.js",
		container: "#d3chartcontainerpbiclc",
	},
	pbicli: {
		style: isProdSite
			? "./assets/css/charts/d3chartstylespbicli.css"
			: "./assets/css/charts/d3chartstylespbicli-stg.css",
		script: isProdSite
			? "./assets/js/charts/d3chartpbicli.min.js"
			: "./assets/js/charts/d3chartpbicli-stg.min.js",
		container: "#d3chartcontainerpbicli",
	},
	pbialp: {
		style: isProdSite
			? "./assets/css/charts/d3chartstylespbialp.css"
			: "./assets/css/charts/d3chartstylespbialp-stg.css",
		script: isProdSite
			? "./assets/js/charts/d3chartpbialp.min.js"
			: "./assets/js/charts/d3chartpbialp-stg.min.js",
		container: "#d3chartcontainerpbialp",
	},
	pbifdc: {
		style: isProdSite
			? "./assets/css/charts/d3chartstylespbifdc.css"
			: "./assets/css/charts/d3chartstylespbifdc-stg.css",
		script: isProdSite
			? "./assets/js/charts/d3chartpbifdc.min.js"
			: "./assets/js/charts/d3chartpbifdc-stg.min.js",
		container: "#d3chartcontainerpbifdc",
	},
	pbiolc: {
		style: isProdSite
			? "./assets/css/charts/d3chartstylespbiolc.css"
			: "./assets/css/charts/d3chartstylespbiolc-stg.css",
		script: isProdSite
			? "./assets/js/charts/d3chartpbiolc.min.js"
			: "./assets/js/charts/d3chartpbiolc-stg.min.js",
		container: "#d3chartcontainerpbiolc",
	},
	pbiobe: {
		style: isProdSite
			? "./assets/css/charts/d3chartstylespbiobe.css"
			: "./assets/css/charts/d3chartstylespbiobe-stg.css",
		script: isProdSite
			? "./assets/js/charts/d3chartpbiobe.min.js"
			: "./assets/js/charts/d3chartpbiobe-stg.min.js",
		container: "#d3chartcontainerpbiobe",
	},
	pbiuac: {
		style: isProdSite
			? "./assets/css/charts/d3chartstylespbiuac.css"
			: "./assets/css/charts/d3chartstylespbiuac-stg.css",
		script: isProdSite
			? "./assets/js/charts/d3chartpbiuac.min.js"
			: "./assets/js/charts/d3chartpbiuac-stg.min.js",
		container: "#d3chartcontainerpbiuac",
	},
	pbigam: {
		style: isProdSite
			? "./assets/css/charts/d3chartstylespbigam.css"
			: "./assets/css/charts/d3chartstylespbigam-stg.css",
		script: isProdSite
			? "./assets/js/charts/d3chartpbigam.min.js"
			: "./assets/js/charts/d3chartpbigam-stg.min.js",
		container: "#d3chartcontainerpbigam",
	},
	pbinad: {
		style: isProdSite
			? "./assets/css/charts/d3chartstylespbinad.css"
			: "./assets/css/charts/d3chartstylespbinad-stg.css",
		script: isProdSite
			? "./assets/js/charts/d3chartpbinad.min.js"
			: "./assets/js/charts/d3chartpbinad-stg.min.js",
		container: "#d3chartcontainerpbinad",
	},
};

const loadedCharts = {};

// Intersection Observer for lazy loading charts with main-thread protection
const chartObserver = new IntersectionObserver(
	entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const chartType = entry.target.dataset.chartType;
				if (chartType && !loadedCharts[chartType]) {
					// Use idle callback to avoid blocking main thread
					scheduleWork(
						() => {
							loadChart(chartType);
						},
						{ timeout: 2000, fallbackDelay: 200 }
					);
					chartObserver.unobserve(entry.target);
				}
			}
		});
	},
	{
		rootMargin: "100px",
	}
);

// Wait for data to be available with idle callbacks
function waitForChartData() {
	return new Promise(resolve => {
		function checkData() {
			if (
				window.cbpfbiDataObject &&
				Object.keys(window.cbpfbiDataObject).length > 0
			) {
				resolve();
			} else {
				// Use idle callback for data checking to avoid blocking main thread
				scheduleWork(checkData, { fallbackDelay: 100 });
			}
		}
		checkData();
	});
}

// Load chart on demand with main-thread protection
function loadChart(chartType) {
	const config = chartConfig[chartType];
	if (!config || loadedCharts[chartType]) return;

	loadedCharts[chartType] = true;
	const container = document.querySelector(config.container);

	if (container) {
		container.innerHTML =
			'<div class="chart-loading">Loading chart...</div>';

		// Wait for data to be available before loading chart
		waitForChartData()
			.then(() => {
				// Load chart styles first with idle callbacks
				const loadStyle = new Promise(resolve => {
					scheduleWork(
						() => {
							const link = document.createElement("link");
							link.rel = "stylesheet";
							link.href = config.style;
							link.onload = resolve;
							link.onerror = resolve; // Continue even if style fails
							document.head.appendChild(link);
						},
						{ fallbackDelay: 50 }
					);
				});

				// Load chart script after styles and data are ready, with main-thread protection
				return loadStyle.then(() => {
					return new Promise((resolve, reject) => {
						scheduleWork(
							() => {
								loadScript(config.script)
									.then(resolve)
									.catch(reject);
							},
							{ timeout: 1000, fallbackDelay: 100 }
						);
					});
				});
			})
			.then(() => {
				scheduleWork(
					() => {
						const loadingElement =
							container.querySelector(".chart-loading");
						if (loadingElement) {
							loadingElement.remove();
						}
					},
					{ fallbackDelay: 50 }
				);
			})
			.catch(error => {
				console.error("Failed to load chart:", chartType, error);
				scheduleWork(
					() => {
						container.innerHTML =
							'<div class="chart-loading" style="color: red;">Failed to load chart</div>';
					},
					{ fallbackDelay: 50 }
				);
			});
	}
}

// Initialize chart observers when DOM is ready with main-thread protection
document.addEventListener("DOMContentLoaded", function () {
	scheduleWork(
		() => {
			// Load base chart styles
			const baseStyleLink = document.querySelector(
				'link[data-chart-style="base"]'
			);
			if (baseStyleLink) {
				baseStyleLink.rel = "stylesheet";
			}

			// Observe chart containers with batching to avoid blocking main thread
			const containers = document.querySelectorAll(
				'[id^="d3chartcontainer"]'
			);
			let index = 0;

			function processContainerBatch() {
				const batchSize = 3; // Process 3 containers at a time
				const endIndex = Math.min(index + batchSize, containers.length);

				for (let i = index; i < endIndex; i++) {
					const container = containers[i];
					const chartType = container.id.replace(
						"d3chartcontainer",
						""
					);
					container.dataset.chartType = chartType;
					chartObserver.observe(container);
				}

				index = endIndex;

				if (index < containers.length) {
					// Process next batch in idle time
					scheduleWork(processContainerBatch, {
						fallbackDelay: 10,
					});
				}
			}

			processContainerBatch();
		},
		{ fallbackDelay: 100 }
	);
});

// Fallback: Load visible charts after page load with main-thread protection
window.addEventListener("load", function () {
	scheduleWork(
		() => {
			const containers = document.querySelectorAll(
				'[id^="d3chartcontainer"]'
			);

			// Process visible charts in batches
			let index = 0;
			function checkVisibleBatch() {
				const batchSize = 2; // Check 2 charts at a time
				const endIndex = Math.min(index + batchSize, containers.length);

				for (let i = index; i < endIndex; i++) {
					const container = containers[i];
					const rect = container.getBoundingClientRect();
					const isVisible =
						rect.top < window.innerHeight && rect.bottom > 0;
					if (isVisible) {
						const chartType = container.dataset.chartType;
						if (chartType && !loadedCharts[chartType]) {
							loadChart(chartType);
						}
					}
				}

				index = endIndex;

				if (index < containers.length) {
					// Check next batch in idle time
					scheduleWork(checkVisibleBatch, {
						fallbackDelay: 50,
					});
				}
			}

			checkVisibleBatch();
		},
		{ timeout: 2000, fallbackDelay: 1000 }
	);
});

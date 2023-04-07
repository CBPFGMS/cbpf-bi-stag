//using a global object for sharing data
window.cbpfbiDataObject = {};

const localStorageTime = 3600000,
	currentDate = new Date(),
	consoleStyle = "background-color: #0d6cb6; color: white; padding: 2px;";

const filesURLs = [{
	name: "masterDonors",
	url: "https://cbpfgms.github.io/pfbi-data/mst/MstDonor.json",
	format: "json",
	usedBy: ["cbsank"]
}, {
	name: "masterFunds",
	url: "https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
	format: "json",
	usedBy: ["cbsank"]
}, {
	name: "masterAllocationTypes",
	url: "https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
	format: "json",
	usedBy: ["cbsank"]
}, {
	name: "flags",
	url: "https://cbpfgms.github.io/img/assets/flags24.json",
	format: "json",
	usedBy: ["cbsank"]
}, {
	name: "launchedAllocationsData",
	url: "https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&$format=csv",
	format: "csv",
	usedBy: ["cbsank", "pbinad", "pbialp", "pbiuac", "pbiolc", "pbigam"]
}, {
	name: "contributionsData",
	url: "https://cbpfgms.github.io/pfbi-data/contributionSummarySankey.csv",
	format: "csv",
	usedBy: ["cbsank"]
}, {
	name: "AllocationFlowData",
	url: "https://cbpfapi.unocha.org/vo2/odata/AllocationFlowByOrgType?PoolfundCodeAbbrv=&$format=csv",
	format: "csv",
	usedBy: ["pbinad"]
}, {
	name: "masterPooledFunds",
	url: "https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
	format: "csv",
	usedBy: ["pbinad"]
}, {
	name: "masterPartners",
	url: "https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
	format: "csv",
	usedBy: ["pbinad"]
}, {
	name: "masterSubPartners",
	url: "https://cbpfapi.unocha.org/vo2/odata/SubIPType?$format=csv",
	format: "csv",
	usedBy: ["pbinad"]
}, {
	name: "allocationsData",
	url: "https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?&ShowAllPooledFunds=1&FundingType=3&$format=csv",
	format: "csv",
	usedBy: ["pbialp"]
}, {
	name: "contributionsTotalData",
	url: "https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv&ShowAllPooledFunds=1",
	format: "csv",
	usedBy: ["pbiclc", "pbicli", "pbifdc"]
}, {
	name: "targetedPersonsData",
	url: "https://cbpfapi.unocha.org/vo2/odata/PoolFundBeneficiarySummary?$format=csv&ShowAllPooledFunds=1",
	format: "csv",
	usedBy: ["pbiolc"]
}, {
	name: "targetedPersonsDetailsData",
	url: "https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryBeneficiaryDetail?$format=csv&ShowAllPooledFunds=1",
	format: "csv",
	usedBy: ["pbiobe"]
}, {
	name: "dataGam",
	url: "https://cbpfapi.unocha.org/vo2/odata/ProjectGAMSummary?$format=csv&ShowAllPooledFunds=1",
	format: "csv",
	usedBy: ["pbigam"]
}, {
	name: "masterGam",
	url: "https://cbpfapi.unocha.org/vo2/odata/GenderMarker?$format=csv",
	format: "csv",
	usedBy: ["pbigam"]
}];

filesURLs.forEach(file => {
	cbpfbiDataObject[file.name] = fetchFile(file.name, file.url, file.format);
});

function fetchFile(fileName, url, method) {
	if (localStorage.getItem(fileName) &&
		JSON.parse(localStorage.getItem(fileName)).timestamp > (currentDate.getTime() - localStorageTime)) {
		const fetchedData = method === "csv" ? d3.csvParse(JSON.parse(localStorage.getItem(fileName)).data, d3.autoType) :
			JSON.parse(localStorage.getItem(fileName)).data;
		console.log(`%cInfo: data file ${fileName} retrieved from local storage`, consoleStyle);
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
				console.error(`Error fetching the file ${fileName}`);
			};
			console.info(`%cInfo: data file ${fileName} obtained from API call`, consoleStyle);
			return fetchedData;
		});
	};
};
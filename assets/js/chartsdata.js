/* global d3 */
//using a global object for sharing data
window.cbpfbiDataObject = {};

//constants used by the filters
const ipNames = ["ingo", "ngo", "o", "un"],
	subIpNames = ["ingo", "ngo", "o", "un", "og", "pc"],
	partnerLongNames = [
		"international ngo",
		"national ngo",
		"national partners",
		"red cross/red crescent society",
		"un agency",
		"others",
	],
	allocationTypes = ["standard", "reserve"],
	sectorLongNames = [
		"education",
		"emergency shelter and nfi",
		"health",
		"multi-sector",
		"protection",
		"water sanitation hygiene",
		"water, sanitation and hygiene",
		"food security",
		"early recovery",
		"nutrition",
		"camp coordination / management",
		"logistics",
		"coordination and support services",
		"emergency telecommunications",
		"covid-19",
		"multi-purpose cash",
	],
	GenderMarkerGroups = ["gam", "gm"],
	GenderMarkerCodes = ["2a", "2b"],
	maxDonorId = 250,
	maxFundId = 300;

const localStorageTime = 600000,
	currentDate = new Date(),
	isPfbiSite = window.location.hostname === "cbpf.data.unocha.org",
	consoleStyle = "background-color: #0d6cb6; color: white; padding: 2px;";

const filesURLs = [
	{
		name: "masterDonors",
		url: "https://cbpfgms.github.io/pfbi-data/mst/MstDonor.json",
		autoType: false,
		format: "json",
		usedBy: ["cbsank"],
		dataFilters: null,
	},
	{
		name: "masterFunds",
		url: "https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
		autoType: false,
		format: "json",
		usedBy: ["cbsank"],
		dataFilters: null,
	},
	{
		name: "masterRegionalFunds",
		url: "https://cbpfgms.github.io/pfbi-data/mst/MstRhpf.json",
		autoType: false,
		format: "json",
		usedBy: ["pbiclc", "pbialp", "pbifdc", "pbigam", "pbihrp"],
		dataFilters: null,
	},
	{
		name: "masterAllocationTypes",
		url: "https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
		autoType: false,
		format: "json",
		usedBy: ["cbsank"],
		dataFilters: null,
	},
	{
		name: "flags",
		url: "https://cbpfgms.github.io/img/assets/flags24.json",
		autoType: false,
		format: "json",
		usedBy: ["cbsank", "pbiclc", "pbicli", "pbifdc"],
		dataFilters: null,
	},
	{
		name: "flags60",
		url: "https://cbpfgms.github.io/img/assets/flags60.json",
		autoType: false,
		format: "json",
		usedBy: ["pbiflags"],
		dataFilters: null,
	},
	{
		name: "launchedAllocationsData",
		url: "https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&FundTypeId=1&$format=csv",
		autoType: true,
		format: "csv",
		usedBy: ["cbsank", "pbinad", "pbialp", "pbiuac", "pbiolc", "pbigam"],
		dataFilters: [
			{
				name: "AllocationTitle",
				type: "string",
				filterFunction: null,
			},
			{
				name: "AllocationSummary",
				type: t => t === null || typeof t === "string",
				filterFunction: null,
			},
			{
				name: "AllocationSource",
				type: "string",
				filterFunction: str =>
					allocationTypes.includes(str.toLowerCase()), //the allocation type must be one of the allocation types in the allocationTypes array
			},
			{
				name: "TotalUSDPlanned",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "PlannedStartDate",
				type: "string",
				filterFunction: null,
			},
			{
				name: "PlannedEndDate",
				type: "string",
				filterFunction: null,
			},
			{
				name: "Documents",
				type: null,
				filterFunction: null,
			},
			{
				name: "PooledFundId",
				type: "number",
				filterFunction: n => n > 0 && n <= maxFundId, //currently the max ID in the funds master table
			},
			{
				name: "PooledFundName",
				type: "string",
				filterFunction: null,
			},
			{
				name: "AllocationYear",
				type: "number",
				filterFunction: null,
			},
			{
				name: "HRPPlans",
				type: "string",
				filterFunction: null,
			},
			{
				name: "AllocationHCLastProjectApprovalDate",
				type: "string",
				filterFunction: null,
			},
			{
				name: "TotalProjectsunderApproval",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "TotalUnderApprovalBudget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "TotalProjectsApproved",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "TotalApprovedBudget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
		],
	},
	{
		name: "contributionsData",
		url: "https://cbpfgms.github.io/pfbi-data/contributionSummarySankey.csv",
		autoType: true,
		format: "csv",
		usedBy: ["cbsank"],
		dataFilters: [
			{
				name: "contributionYear",
				type: "number",
				filterFunction: null,
			},
			{
				name: "donorId",
				type: "number",
				filterFunction: n => n > 0 && n <= maxDonorId, //currently the max ID in the donors master table
			},
			{
				name: "fundId",
				type: "number",
				filterFunction: n => n > 0 && n <= maxFundId, //currently the max ID in the funds master table
			},
			{
				name: "paidAmount",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "pledgedAmount",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
		],
	},
	{
		name: "allocationFlowData",
		url: "https://cbpfapi.unocha.org/vo2/odata/AllocationFlowByOrgType?PoolfundCodeAbbrv=&$format=csv",
		autoType: false,
		format: "csv",
		usedBy: ["pbinad"],
		dataFilters: [
			{
				name: "source",
				type: t => typeof t === "number" || typeof t === "string", //the source can be either a number or a string
				filterFunction: n =>
					typeof n === "number"
						? n > 0 && n <= maxFundId
						: ipNames.includes(n.toLocaleLowerCase()), //a valid ID in the funds master table or a valid IP name
			},
			{
				name: "target",
				type: "string",
				filterFunction: str =>
					subIpNames.includes(str.toLocaleLowerCase()), //a valid subIP name
			},
			{
				name: "value",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "fund",
				type: "number",
				filterFunction: n => n > 0 && n <= maxFundId, //currently the max ID in the funds master table
			},
			{
				name: "targetType",
				type: "number",
				filterFunction: n => n === 1 || n === 2, //the target type must be either 1 or 2
			},
			{
				name: "year",
				type: "number",
				filterFunction: null,
			},
		],
	},
	{
		name: "masterPooledFunds",
		url: "https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
		autoType: true,
		format: "csv",
		usedBy: ["pbinad"],
		dataFilters: null,
	},
	{
		name: "masterPartners",
		url: "https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
		autoType: true,
		format: "csv",
		usedBy: ["pbinad"],
		dataFilters: null,
	},
	{
		name: "masterSubPartners",
		url: "https://cbpfapi.unocha.org/vo2/odata/SubIPType?$format=csv",
		autoType: true,
		format: "csv",
		usedBy: ["pbinad"],
		dataFilters: null,
	},
	{
		name: "allocationsData",
		url: "https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?&FundingType=3&$format=csv",
		autoType: true,
		format: "csv",
		usedBy: ["pbialp"],
		dataFilters: [
			{
				name: "AllocationYear",
				type: "number",
				filterFunction: null,
			},
			{
				name: "OrganizationType",
				type: "string",
				filterFunction: str =>
					partnerLongNames.includes(str.toLocaleLowerCase()),
			},
			{
				name: "PooledFundName",
				type: "string",
				filterFunction: null,
			},
			{
				name: "ApprovedReserveBudgetPercentage",
				type: "number",
				filterFunction: n => n >= 0 && n <= 100, //the percentage must be between 0 and 100
			},
			{
				name: "ApprovedStandardBudgetPercentage",
				type: "number",
				filterFunction: n => n >= 0 && n <= 100, //the percentage must be between 0 and 100
			},
			{
				name: "ApprovedBudget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "ApprovedReserveBudget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "ApprovedStandardBudget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "PipelineReserveBudgetPercentage",
				type: "number",
				filterFunction: n => n >= 0 && n <= 100, //the percentage must be between 0 and 100
			},
			{
				name: "PipelineStandardBudgetPercentage",
				type: "number",
				filterFunction: n => n >= 0 && n <= 100, //the percentage must be between 0 and 100
			},
			{
				name: "PipelineBudget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "PipelineReserveBudget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "PipelineStandardBudget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "FundingType",
				type: "number",
				filterFunction: n => n === 1 || n === 2, //the funding type must be either 1 or 2
			},
		],
	},
	{
		name: "contributionsTotalData",
		url: "https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv&ShowAllPooledFunds=1",
		autoType: false,
		format: "csv",
		usedBy: ["pbiclc", "pbicli", "pbifdc"],
		dataFilters: [
			{
				name: "FiscalYear",
				type: "number",
				filterFunction: null,
			},
			{
				name: "GMSDonorName",
				type: "string",
				filterFunction: null,
			},
			{
				name: "GMSDonorISO2Code",
				type: "string",
				filterFunction: str => str.length <= 3 || str.includes("-"), //the ISO2 code must be 3 characters or less, or include a hyphen for non-standard codes
			},
			{
				name: "PooledFundName",
				type: "string",
				filterFunction: null,
			},
			{
				name: "PooledFundISO2Code",
				type: "string",
				filterFunction: str => str.length === 2 || str.includes("-"), //the ISO2 code must be 2 characters, or include a hyphen for non-standard codes
			},
			{
				name: "PaidAmt",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "PledgeAmt",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "PledgeAmtLocalCurrency",
				type: t => typeof t === "string" || t === null, //the value must be either a string or null
				filterFunction: null,
			},
			{
				name: "PledgeAmtCurrencyExchangeRate",
				type: "number",
				filterFunction: null,
			},
			{
				name: "PaidAmtLocalCurrency",
				type: t => typeof t === "string" || t === null, //the value must be either a string or null
				filterFunction: null,
			},
			{
				name: "PaidAmtCurrencyExchangeRate",
				type: "number",
				filterFunction: null,
			},
			{
				name: "PledgeAmtLocal",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "PaidAmtLocal",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
		],
	},
	{
		name: "targetedPersonsData",
		url: "https://cbpfapi.unocha.org/vo2/odata/PoolFundBeneficiarySummary?$format=csv&ShowAllPooledFunds=1",
		autoType: true,
		format: "csv",
		usedBy: ["pbiolc"],
		dataFilters: [
			{
				name: "PooledFundId",
				type: "number",
				filterFunction: n => n > 0 && n <= maxFundId, //currently the max ID in the funds master table
			},
			{
				name: "PooledFundName",
				type: "string",
				filterFunction: null,
			},
			{
				name: "AllocationYear",
				type: "number",
				filterFunction: null,
			},
			{
				name: "Cluster",
				type: "string",
				filterFunction: str =>
					sectorLongNames.includes(str.toLocaleLowerCase()), //the sector must be one of the sectors in the sectorLongNames array
			},
			{
				name: "AllocationSourceName",
				type: "string",
				filterFunction: str =>
					allocationTypes.includes(str.toLowerCase()), //the allocation type must be one of the allocation types in the allocationTypes array
			},
			{
				name: "OrganizationTypeId",
				type: "number",
				filterFunction: n => n > 0 && n <= 4, //the organization type must be between 1 and 4
			},
			{
				name: "BeneficiariesPlannedTotal",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "BeneficiariesActualTotal",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "BudgetByCluster",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "ProjectCount",
				type: "number",
				filterFunction: n => n >= 0, //the number of projects must not be negative
			},
			{
				name: "PartnerCount",
				type: "number",
				filterFunction: n => n >= 0, //the number of partners must not be negative
			},
			{
				name: "ReportCount",
				type: "number",
				filterFunction: n => n >= 0, //the number of reports must not be negative
			},
		],
	},
	{
		name: "targetedPersonsDetailsData",
		url: "https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryBeneficiaryDetail?$format=csv",
		autoType: true,
		format: "csv",
		usedBy: ["pbiobe"],
		dataFilters: [
			{
				name: "PooledFundId",
				type: "number",
				filterFunction: n => n > 0 && n <= maxFundId, //currently the max ID in the funds master table
			},
			{
				name: "PooledFundName",
				type: "string",
				filterFunction: null,
			},
			{
				name: "AllocationSourceId",
				type: "number",
				filterFunction: n => n === 1 || n === 2, //the allocation source type must be either 1 or 2
			},
			{
				name: "AllocationYear",
				type: "number",
				filterFunction: null,
			},
			{
				name: "OrganizationId",
				type: "number",
				filterFunction: null,
			},
			{
				name: "OrganizationName",
				type: "string",
				filterFunction: null,
			},
			{
				name: "OrganizationTypeId",
				type: "number",
				filterFunction: n => n > 0 && n <= 4, //the organization type must be between 1 and 4
			},
			{
				name: "ChfProjectCode",
				type: "string",
				filterFunction: null,
			},
			{
				name: "PlannedMen",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "PlannedWomen",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "PlannedBoys",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "PlannedGirls",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "PlannedTotal",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "ActualMen",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "ActualWomen",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "ActualBoys",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "ActualGirls",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "ActualTotal",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
		],
	},
	{
		name: "dataGam",
		url: "https://cbpfapi.unocha.org/vo2/odata/ProjectGAMSummary?$format=csv",
		autoType: true,
		format: "csv",
		usedBy: ["pbigam"],
		dataFilters: [
			{
				name: "PooledFundId",
				type: "number",
				filterFunction: n => n > 0 && n <= maxFundId, //currently the max ID in the funds master table
			},
			{
				name: "PooledFundName",
				type: "string",
				filterFunction: null,
			},
			{
				name: "AllocationYear",
				type: "number",
				filterFunction: null,
			},
			{
				name: "GenderMarkerGroup",
				type: "string",
				filterFunction: str =>
					GenderMarkerGroups.includes(str.toLocaleLowerCase()),
			},
			{
				name: "GenderMarkerCode",
				type: t => typeof t === "number" || typeof t === "string", //the source can be either a number or a string
				filterFunction: n =>
					typeof n === "number"
						? n >= 0 && n <= 4
						: GenderMarkerCodes.includes(n.toLocaleLowerCase()), //the code must be between 0 and 4 or one of the accepted strings
			},
			{
				name: "TotalProjects",
				type: "number",
				filterFunction: n => n >= 0, //the number of projects must not be negative
			},
			{
				name: "TotalBeneficiaries",
				type: "number",
				filterFunction: n => n >= 0, //the number of beneficiaries must not be negative
			},
			{
				name: "TotalBudget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
		],
	},
	{
		name: "masterGam",
		url: "https://cbpfapi.unocha.org/vo2/odata/GenderMarker?$format=csv",
		autoType: true,
		format: "csv",
		usedBy: ["pbigam"],
		dataFilters: null,
	},
	{
		name: "worldMap",
		url: "https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/worldmap.json",
		autoType: false,
		format: "json",
		usedBy: ["pbifdc"],
		dataFilters: null,
	},
];

filesURLs.forEach(file => {
	window.cbpfbiDataObject[file.name] = fetchFile(
		file.name,
		file.url,
		file.format,
		file.autoType,
		file.dataFilters
	);
});

function fetchFile(fileName, url, method, autoType, dataFilter) {
	if (
		localStorage.getItem(fileName) &&
		JSON.parse(localStorage.getItem(fileName)).timestamp >
			currentDate.getTime() - localStorageTime
	) {
		const fetchedData =
			method === "csv"
				? d3.csvParse(
						JSON.parse(localStorage.getItem(fileName)).data,
						autoType ? d3.autoType : null
				  )
				: JSON.parse(localStorage.getItem(fileName)).data;
		console.log(
			`%cInfo: data file ${fileName} retrieved from local storage`,
			consoleStyle
		);
		return Promise.resolve(fetchedData);
	} else {
		const fetchMethod = method === "csv" ? d3.csv : d3.json;
		const rowFunctionWrapper =
			method === "csv"
				? d => verifyRow(d, dataFilter, url, autoType)
				: null;
		return fetchMethod(url, rowFunctionWrapper).then(fetchedData => {
			try {
				localStorage.setItem(
					fileName,
					JSON.stringify({
						data:
							method === "csv"
								? d3.csvFormat(fetchedData)
								: fetchedData,
						timestamp: currentDate.getTime(),
					})
				);
			} catch (error) {
				if (!isPfbiSite)
					console.warn(
						`Error saving the file ${fileName} in the local storage`
					);
			}
			console.info(
				`%cInfo: data file ${fileName} obtained from API call`,
				consoleStyle
			);
			return fetchedData;
		});
	}
}

function verifyRow(obj, dataFilter, url, autoType) {
	const copiedObj = Object.assign({}, obj);
	d3.autoType(copiedObj);
	let validRow;
	if (dataFilter) {
		let thisColumn, thisRule;
		validRow = dataFilter.every(column => {
			let filterResult, typeResult;
			thisColumn = column.name;
			thisRule = column;
			if (column.type) {
				typeResult =
					typeof column.type === "function"
						? column.type(copiedObj[column.name])
						: typeof copiedObj[column.name] === column.type;
			} else {
				typeResult = true;
			}
			if (typeResult)
				filterResult = column.filterFunction
					? column.filterFunction(copiedObj[column.name])
					: true;
			return filterResult && typeResult;
		});
		if (validRow) {
			return autoType ? copiedObj : obj;
		} else {
			if (!isPfbiSite)
				console.warn(
					`Problem with the dataset ${url}: a row doesn't follow the filter rules.\n----\nColumn: ${thisColumn}\n----\nRule: ${JSON.stringify(
						thisRule,
						stringifyFunction
					)}\n----\nOffending row: ${JSON.stringify(obj)}`
				);
			return null;
		}
	}
	return autoType ? copiedObj : obj;
}

function stringifyFunction(_, value) {
	return typeof value === "function" ? value.toString() : value;
}

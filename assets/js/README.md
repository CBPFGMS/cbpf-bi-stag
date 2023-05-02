## Data fields

This is a list of the accepted types (and values) for each column of the data files used for the visualizations.

### 1. Launched allocations data
Dataset: [https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&$format=csv](https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&$format=csv)

|Column name|Type | Restriction |
|--|--|--|
|AllocationTitle|string|no|
|AllocationSummary|string|no|
|AllocationSource|string|"reserve" or "standard"|
|TotalUSDPlanned|number|non-negative|
|PlannedStartDate|string|no|
|PlannedEndDate|string|no|
|Documents|string|no|
|PooledFundId|number|value must be in the master table|
|PooledFundName|string|no|
|AllocationYear|number|no|
|HRPPlans|string|no|
|AllocationHCLastProjectApprovalDate|string|no|
|TotalProjectsunderApproval|number|non-negative|
|TotalUnderApprovalBudget|number|non-negative|
|TotalProjectsApproved|number|non-negative|
|TotalApprovedBudget|number|non-negative|

> PS: The columns `PlannedStartDate`, `PlannedEndDate` and `AllocationHCLastProjectApprovalDate` should have this regex restriction: `/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}/`

### 2. Contributions data
Dataset: [https://cbpfgms.github.io/pfbi-data/contributionSummarySankey.csv](https://cbpfgms.github.io/pfbi-data/contributionSummarySankey.csv)

|Column name|Type | Restriction |
|--|--|--|
|contributionYear|number|non-negative|
|donorId|number|value must be in the master table|
|fundId|number|value must be in the master table|
|paidAmount|number|non-negative|
|pledgedAmount|number|non-negative|

### 3.  Allocations flow data
Dataset: [https://cbpfapi.unocha.org/vo2/odata/AllocationFlowByOrgType?PoolfundCodeAbbrv=&$format=csv](https://cbpfapi.unocha.org/vo2/odata/AllocationFlowByOrgType?PoolfundCodeAbbrv=&$format=csv)

|Column name|Type | Restriction |
|--|--|--|
|source|number or string|a valid number in the funds master table or a valid IP name|
|target|string|must be a valid subIP name|
|value|number|non-negative|
|fund|number|value must be in the master table|
|targetType|number|1 or 2|
|year|number|no|

> valid IP (implementing partner) names: "ingo", "ngo", "o", "un".

> valid subIP names: "ingo", "ngo", "o", "un", "og", "pc".

### 4. Allocations data
Dataset: [https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?&FundingType=3&$format=csv](https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?&FundingType=3&$format=csv)

|Column name|Type | Restriction |
|--|--|--|
|AllocationYear|number|no|
|OrganizationType|string|must be a valid partner name|
|PooledFundName|string|no|
|ApprovedReserveBudgetPercentage|number|between 0 and 100 (inclusive)|
|ApprovedStandardBudgetPercentage|number|between 0 and 100 (inclusive)|
|ApprovedBudget|number|non-negative|
|ApprovedReserveBudget|number|non-negative|
|ApprovedStandardBudget|number|non-negative|
|PipelineReserveBudgetPercentage|number|between 0 and 100 (inclusive)|
|PipelineStandardBudgetPercentage|number|between 0 and 100 (inclusive)|
|PipelineBudget|number|non-negative|
|PipelineReserveBudget|number|non-negative|
|PipelineStandardBudget|number|non-negative|
|FundingType|number|1 or 2|

> valid partner names: "international ngo", "national ngo", "national partners", "red cross/red crescent society", "un agency", "others"

### 5. Total contributions data
Dataset: [https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv&ShowAllPooledFunds=1](https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv&ShowAllPooledFunds=1)

|Column name|Type | Restriction |
|--|--|--|
|FiscalYear|number|non-negative|
|GMSDonorName|string|no|
|GMSDonorISO2Code|string|3 characters or less|
|PooledFundName|string|no|
|PooledFundISO2Code|string|2 characters|
|PaidAmt|number|non-negative|
|PledgeAmt|number|non-negative|
|PledgeAmtLocalCurrency|string|no|
|PledgeAmtCurrencyExchangeRate|number|no|
|PaidAmtLocalCurrency|string|no|
|PaidAmtCurrencyExchangeRate|number|no|
|PledgeAmtLocal|number|non-negative|
|PaidAmtLocal|number|non-negative|

### 6. Targeted persons data
Dataset: [https://cbpfapi.unocha.org/vo2/odata/PoolFundBeneficiarySummary?$format=csv&ShowAllPooledFunds=1](https://cbpfapi.unocha.org/vo2/odata/PoolFundBeneficiarySummary?$format=csv&ShowAllPooledFunds=1)

|Column name|Type | Restriction |
|--|--|--|
|PooledFundId|number|value must be in the master table|
|PooledFundName|string|no|
|AllocationYear|number|non-negative|
|Cluster|string|must be a valid sector name|
|AllocationSourceName|string|"reserve" or "standard"|
|OrganizationTypeId|number|1 to 4|
|BeneficiariesPlannedTotal|number|non-negative|
|BeneficiariesActualTotal|number|non-negative|
|BudgetByCluster|number|non-negative|
|ProjectCount|number|non-negative|
|PartnerCount|number|non-negative|
|ReportCount|number|non-negative|

> valid sector names: "education", "emergency shelter and nfi", "health", "multi-sector", "protection", "water sanitation hygiene", "food security", "early recovery", "nutrition", "camp coordination / management", "logistics", "coordination and support services", "emergency telecommunications", "covid-19", "multi-purpose cash".

### 7. Targeted persons details data
Dataset: [https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryBeneficiaryDetail?$format=csv](https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryBeneficiaryDetail?$format=csv)

|Column name|Type | Restriction |
|--|--|--|
|PooledFundId|number|value must be in the master table|
|PooledFundName|string|no|
|AllocationSourceId|number|1 or 2|
|AllocationYear|number|non-negative|
|OrganizationId|number|non-negative|
|OrganizationName|string|no|
|OrganizationTypeId|number|1 to 4|
|ChfProjectCode|string|no|
|PlannedMen|number|non-negative|
|PlannedWomen|number|non-negative|
|PlannedBoys|number|non-negative|
|PlannedGirls|number|non-negative|
|PlannedTotal|number|non-negative|
|ActualMen|number|non-negative|
|ActualWomen|number|non-negative|
|ActualBoys|number|non-negative|
|ActualGirls|number|non-negative|
|ActualTotal|number|non-negative|

### 8. GAM data
Dataset: [https://cbpfapi.unocha.org/vo2/odata/ProjectGAMSummary?$format=csv](https://cbpfapi.unocha.org/vo2/odata/ProjectGAMSummary?$format=csv)

|Column name|Type | Restriction |
|--|--|--|
|PooledFundId|number|value must be in the master table|
|PooledFundName|string|no|
|AllocationYear|number|no|
|GenderMarkerGroup|string|must be a valid gender marker group|
|GenderMarkerCode|string or number|must be a valid gender marker code|
|TotalProjects|number|non-negative|
|TotalBeneficiaries|number|non-negative|
|TotalBudget|number|non-negative|

> valid gender marker groups: "gm", "gam""

> valid gender marker codes: 0, 1, 2, 3, 4, 2a, 2b
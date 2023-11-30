// Lets fetch Stock List

let activeStock = "AAPL";
let activeTimeFrame = '1y';
let stockListData = "";


const fetchStockList = async () => {
  const response = await fetch(
    "https://stocks3.onrender.com/api/stocks/getstockstatsdata"
  );
  const data = await response.json();

  // Rendering Stocks List
  const stockListHtm = document.querySelector(".stock-list");
  stockListData = data.stocksStatsData[0];
  stockListHtm.innerHTML = "";
  for (let stock in stockListData) {

    if (stock == "_id") {
      return;
    }
    let value = stockListData[stock].bookValue;
    let profit = stockListData[stock].profit.toFixed(2);
    if (profit > 0) {
      stockListHtm.innerHTML += `
    <div data-id=${stock} class="stock-list-items">
                    <h4 data-id=${stock} class="stock-name">${stock}</h4>
                    <h4 data-id=${stock} class="stock-value">$${value}</h4>
                    <h4 data-id=${stock} class="stock-profit">${profit}%</h4>
                </div>
    `;
    } else {
      stockListHtm.innerHTML += `
    <div data-id=${stock} class="stock-list-items">
                    <h4 data-id=${stock} class="stock-name">${stock}</h4>
                    <h4 data-id=${stock} class="stock-value">$${value}</h4>
                    <h4 data-id=${stock} class="stock-loss">${profit}%</h4>
                </div>
    `;
    }
  }
};

// console.log("$%%%", stockListData);

const stockSummary = document.querySelector(".stock-summary");
let summaryData;

const renderSummary = (summaryData)=>{
    // console.log("Render Summary");
  // Render Summary
  stockSummary.innerHTML = "";
//   console.log("Active Stock:", activeStock);

  for (let stock in summaryData) {
    // console.log("Stocko:", stock);
let profit = stockListData[stock].profit;
    if (stock == activeStock) {
        // console.log("Yes");
      if (profit > 0) {
        stockSummary.innerHTML += `
                <h3>${stock} &nbsp; $${stockListData[stock].bookValue}  <span class="stock-profit">${stockListData[stock].profit}%</span></h3>
            <p>
                ${summaryData[stock].summary}
            </p>
                `;
      } else {
        stockSummary.innerHTML += `
                <h3>${stock} &nbsp; $${stockListData[stock].bookValue}  <span class="stock-loss">${stockListData[stock].profit}%</span></h3>
            <p>
                ${summaryData[stock].summary}
            </p>
                `;
      }
    }
  }
}

const stocksSummaryfunc = async () => {
//   console.log("HI");
  const response = await fetch(
    "https://stocks3.onrender.com/api/stocks/getstocksprofiledata"
  );
  const data = await response.json();
//   console.log("Data:", data);
  summaryData = data.stocksProfileData[0];
//   console.log("Summary Data:", summaryData);
  renderSummary(summaryData,activeStock)
};


// Lets Fetch Graph Data
let dataForGraph;
const fetchGraphData = async()=>{
let response = await fetch('https://stocks3.onrender.com/api/stocks/getstocksdata')
let data = await response.json();
// console.log("Graph Data:", data);
dataForGraph = data.stocksData[0];
}

(async function () {
  await fetchStockList();
  await stocksSummaryfunc();
  await fetchGraphData();
  await renderGraph(activeStock)
})();

const showRelatedData =(data)=>{
    activeStock = data;
    renderSummary(summaryData)
}


document.addEventListener('click',(e)=>{
let target = e.target;
let fetchId = target.id;
let fetchClass = target.className;

console.log("Target:",target);
console.log("FetchId:", fetchId);
console.log("FetchClass:",fetchClass);

if(fetchClass == "stock-name" || fetchClass == "stock-value" || fetchClass== "stock-loss" || fetchClass== "stock-list-items"){
    let stockname = target.getAttribute('data-id');
    // console.log("---Stock Name---:", stockname);
    showRelatedData(stockname);
    activeStock = stockname;
    renderGraph(stockname)
}

if(fetchId == "one-month"){
activeTimeFrame = '1mo'
renderGraph(activeStock)
}else if(fetchId == "three-month"){
activeTimeFrame = "3mo";
renderGraph(activeStock)

}else if(fetchId == "one-year"){
activeTimeFrame = '1y'
renderGraph(activeStock)

}else if(fetchId == "five-year"){
activeTimeFrame = '5y';
renderGraph(activeStock)

}
})





// trying to render graph

const currentVal = document.querySelector('.cur-val');
const bestVal = document.querySelector('.best-val');
const worstVal = document.querySelector('.worst-val');


function renderGraph(activeStock){
    let timestamps = [];
    let stockValue=[];
    
    switch (activeTimeFrame){
        case '1mo':
            stockValue = [...dataForGraph[activeStock]["1mo"].value];
            timestamps = [...dataForGraph[activeStock]["1mo"].timeStamp];
            break;
        
        case '3mo':
            stockValue =[...dataForGraph[activeStock]["3mo"].value];
            timestamps = [...dataForGraph[activeStock]["3mo"].timeStamp];
            break;
        
        case '5y':
            stockValue = [...dataForGraph[activeStock]["5y"].value];
            timestamps = [...dataForGraph[activeStock]["5y"].timeStamp];
            break;

        default:
            stockValue = [...dataForGraph[activeStock]["1y"].value];
            timestamps = [...dataForGraph[activeStock]["1y"].timeStamp];
            break;
    }

    let lowest = Math.min(...stockValue);
    let highest = Math.max(...stockValue);
    let current = stockValue[stockValue.length - 1]

    currentVal.textContent = current.toFixed(4);
    bestVal.textContent = highest.toFixed(4);
    worstVal.textContent = lowest.toFixed(4);


    // Convert timestamps to date and time strings
    const dateStrings = timestamps.map(timestamp => {
        const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
        return date.toDateString(); // Adjust the format as needed
    });

    Highcharts.chart('container', {

        title: {
            text: activeStock,
            align: 'left'
        },
    
        yAxis: {
            title: {
                text: 'Value in US Dollars($)'
            }
        },
    
        xAxis: {
            categories: dateStrings
        },
    
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
    
        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
                // pointStart: 2000
                
            }
        },
    
        series: [{
            name: activeStock,
            data: stockValue
        }],
    
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    
    });
}

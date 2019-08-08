import React from "react";
import { Chart } from "react-charts";

// var CanvasJSReact = require('../../components/canvasjs.react');
// var CanvasJS = CanvasJSReact.CanvasJS;
// var CanvasJS =require('../../components/canvasjs.min');
// var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class Chartss extends React.PureComponent {
  render() {
    // const options = {
    //   theme: "light2",
    //   animationEnabled: true,
    //   exportEnabled: true,
    //   title: {
    //     text: "Number of iPhones Sold"
    //   },
    //   axisY: {
    //     title: "Number of iPhones ( in Million )",
    //     includeZero: false,
    //   },
    //   data: [
    //   {
    //     type: "area",
    //     xValueFormatString: "YYYY",
    //     yValueFormatString: "#,##0.## Million",
    //     dataPoints: [
    //       { x: new Date(2017, 0), y: 7.6},
    //       { x: new Date(2016, 0), y: 7.3},
    //       { x: new Date(2015, 0), y: 6.4},
    //       { x: new Date(2014, 0), y: 5.3},
    //       { x: new Date(2013, 0), y: 4.5},
    //       { x: new Date(2012, 0), y: 3.8},
    //       { x: new Date(2011, 0), y: 3.2}
    //     ]
    //   }
    //   ]
    // }
    return (
      <div
        style={{
          marginLeft: "30px",
          width: "800px",
          height: "350px"
        }}
      >
        <Chart
          data={[
            {
              label: [0.227, 0.237, 0.347, 0.357, 0.401, 0.447, 0.551],
              data: [
                [0, 0],
                [0, 3],
                [1, 1],
                [1, 2],
                [2, 4],
                [2, 5],
                [3, 2],
                [4, 4],
                [4, 7],
                [5, 0]
              ],
              borderColor: "gray",
              fill: true
            }
          ]}
          axes={[
            { primary: true, type: "linear", position: "bottom" },
            { type: "linear", position: "left" }
          ]}
        />
      </div>
      //     <div>
      //         <CanvasJSChart options = {options}
      //     /* onRef={ref => this.chart = ref} */
      //   />
      //  </div>
    );
  }
}

export default Chartss;

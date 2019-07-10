import React from 'react';
import { Chart } from "react-charts";

class Chartss extends React.PureComponent{
    render(){
        return(
           
                <div
                  style={{
                    marginLeft:'30px',
                    width: "800px",
                    height: "350px",
                 
                  }}
                >
                
                  <Chart
                    data={[
                      {
                        label: [.227,.237,.347,.357,.401,.447,.551],
                        data: [[0, 0],[0, 3],[1, 1], [1, 2], [2, 4],[2, 5], [3, 2],[4, 4], [4, 7],[5,0]],
                        borderColor: "gray",
                        fill:true
                      },
                    
                    ]}
                    axes={[
                      { primary: true, type: "linear", position: "bottom" },
                      { type: "linear", position: "left" }
                    ]}
                  />
                </div>
             
        )
    }
}

export default Chartss;
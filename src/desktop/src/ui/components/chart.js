import React from 'react';
import { Chart } from 'react-charts';
import css from 'ui/views/wallet/wallet.scss';
class Chartss extends React.PureComponent {
    render() {
        return (
            <div className={css.chart_div}>
                <Chart
                    data={[
                        {
                            label: [0.227, 0.229, 0.231, 0.234, 0.236, 0.238, 0.24],
                            data: [[0, 0], [0, 3], [1, 1], [1, 2], [2, 4], [2, 5], [3, 2], [4, 4], [4, 7], [5, 0]],

                            borderColor: '#1A1B3C',
                            fill: true,
                        },
                    ]}
                    axes={[{ primary: true, type: 'linear', position: 'bottom' }, { type: 'linear', position: 'left' }]}
                />
            </div>
        );
    }
}

export default Chartss;

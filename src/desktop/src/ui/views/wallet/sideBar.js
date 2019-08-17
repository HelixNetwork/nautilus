import React from 'react';
import css from './wallet.scss';

class SideBar extends React.PureComponent {
    state = {  }
    render() { 
        return ( 
            <div className={css.side}>
                <ul>
                    <li>Menu</li>
                </ul>
            </div>
         );
    }
}
 
export default SideBar;
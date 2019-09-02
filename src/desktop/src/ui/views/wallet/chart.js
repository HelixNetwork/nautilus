import React from "react";
import { connect } from "react-redux";
import css from "./wallet.scss";
import classNames from "classnames";
import Top from "../../components/topbar";
import PropTypes from "prop-types";
import reload from "ui/images/refresh.svg";
import { withI18n } from "react-i18next";
import Chartss from "../../components/chart";

class Charts extends React.PureComponent {
  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired,
    t: PropTypes.func.isRequired
  };
  render() {
    const { t } = this.props;

    return (
      <div>
        <section className={css.home}>
     
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className={classNames(css.foo_bxx1)}>
                    {/* <h5>
                      Overview HLX chart<span>.</span>
                    </h5>
                   
                      <div className={classNames(css.topRight2)}>
                        <button style={{ right: "109px" }}>EUR</button>
                        <h6 >€0.02/mHLX</h6>
                        <hr/>
                        <button>24/h</button>
                      </div>
                      <Chartss />

                      <div className={classNames(css.topbottom)}>
                        <hr/>
                      </div>
                  */}
                   <p style={{margin:'205px',marginLeft:'400px'}}>Currently not available</p>
                  </div>
                </div>
              </div>
            </div>
         
        </section>
       
      </div>
    );
  }
}
const mapDispatchToProps = {};

export default connect(
  null,
  mapDispatchToProps
)(withI18n()(Charts));

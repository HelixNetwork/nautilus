import React from "react";
import { connect } from "react-redux";
import css from "./index.scss";
import classNames from "classnames";
import { withI18n, Trans } from "react-i18next";
import PropTypes from "prop-types";
import images from "ui/images/ic1.png";
import Button from "ui/components/button";
import Top from "../../components/topbar";
import Logos from "ui/components/logos";
import Lottie from "react-lottie";
import { setPassword } from "actions/wallet";
import * as animationData from "animations/done.json";
import {Row} from 'react-bootstrap'

class Done extends React.PureComponent {
  static propTypes = {
    history: PropTypes.object,
    t: PropTypes.func.isRequired,
    /** On animation end event callback */
    onEnd: PropTypes.func,
    /** Should animation loop */
    loop: PropTypes.bool,
    setPassword: PropTypes.func.isRequired
  };

  /**
   * Navigate to Login view
   * @returns {undefined}
   */

  // stepForward(route) {
  // this.handleClick=this.handleClick.bind(this);

  //     this.props.history.push(`/onboarding/${route}`);
  // }

  // setComplete = () => {
  //     const { history } = this.props;
  //     history.push('/onboarding/login');
  // };

  render() {
    const { loop, animate, onEnd } = this.props;
    const size = 190;
    const h_size = 120;

    const { history, t } = this.props;
    const defaultOptions = {
      loop: loop,
      autoplay: true,
      animationData: animationData.default,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    };
    return (
      <div>
        <Logos history={history} />
        <Row style={{ marginTop: '5vw' }}>
          <h1 className={classNames(css.head_h1)}>
            {t("onboardingComplete:allDone")}
            <span className={classNames(css.text_color)}>!</span>
          </h1>
        </Row>

        <Row className={css.centerBox1}>
          <Lottie
            className={classNames(css.lott)}
            width={size}
            height={h_size}
            options={defaultOptions}
            eventListeners={[
              {
                eventName: "complete",
                callback: () => {
                  if (typeof onEnd === "function") {
                    onEnd();
                  }
                }
              }
            ]}
          />
          <h6>{t("onboardingComplete:walletReady")}</h6>
        </Row>
        {/* <h1>{t('onboardingComplete:allDone')}<span className={classNames(css.text_color)}>!</span> </h1> */}

        <Row>
          <Button
            className="navleft"
            variant="backgroundNone"
            onClick={() =>
              this.props.history.push("/onboarding/seed-import")
            }
          >
            {t("global:goBack")} <span>></span>
          </Button>
          <Button
            className="navright"
            variant="backgroundNone"
            onClick={() => {
              setPassword({});
              this.props.history.push("/onboarding/login");
            }}
          >
            {t("login:login")} <span>></span>
          </Button>
        </Row>

        {/* <Button className="navright" variant="backgroundNone" onClick={() => this.props.history.push('/wallet')} >{t('login:login')} <span>></span></Button> */}
      </div>
            
    );
  }
}

const mapDispatchToProps = {
  setPassword
};

export default connect(
  null,
  mapDispatchToProps
)(withI18n()(Done));

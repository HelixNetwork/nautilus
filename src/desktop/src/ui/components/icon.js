import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import icons from "icons/icons";

import css from "./icon.scss";

/**
 * Icon component
 */
export default class Icon extends React.PureComponent {
  static propTypes = {
    /** Icon type */
    icon: PropTypes.oneOf(
      Object.keys(icons).concat(["seedVault", "seedWrite", "seedPrint"])
    ).isRequired,
    /** Icon size in pixels */
    size: PropTypes.number,
    /** Icon fill color */
    color: PropTypes.string
  };

  render() {
    const { size, icon, color } = this.props;

    if (icon === "seedVault") {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.799 16.347c10.898 0 16.195-8.223 16.334-7.949.115-.23 5.402 7.88 16.3 7.88 2.293 0 4.467-.625 6.413-1.743v22.93c0 13.382-22.634 26.23-22.795 26.143-.077.04-22.665-12.69-22.665-26.075v-22.93c1.947 1.12 4.12 1.744 6.413 1.744"
            className="colors-animations-3"
          />
          <path
            d="M32.044 29.288a4.077 4.077 0 0 1 4.072-4.072 4.077 4.077 0 0 1 4.072 4.072 4.076 4.076 0 0 1-4.072 4.07 4.076 4.076 0 0 1-4.072-4.07m9.717 0a5.652 5.652 0 0 0-5.645-5.646 5.652 5.652 0 0 0-5.645 5.646 5.652 5.652 0 0 0 4.858 5.589V48.78a.786.786 0 0 0 1.573 0v-.715h2.632a.57.57 0 0 0 0-1.137h-2.632v-.796h2.632a.57.57 0 0 0 0-1.137h-2.632v-10.12a5.653 5.653 0 0 0 4.859-5.588"
            className="colors-animations-4"
          />
          <path
            d="M56.501 27.044c4.939 0 8.95 4.01 8.95 8.95 0 4.94-4.011 8.95-8.95 8.95-4.94 0-8.95-4.01-8.95-8.95 0-4.94 4.01-8.95 8.95-8.95"
            className="colors-animations-2"
          />
          <path
            className="colors-animations-4"
            d="M55.179 36.852l3.989-4.071 1.188 1.164-5.156 5.262-.017-.017-.007.007-.835-.832-.328-.322.003-.003-1.72-1.714 1.174-1.177z"
          />
          <path
            d="M71.5 36c0 19.606-15.894 35.5-35.5 35.5S.5 55.606.5 36 16.394.5 36 .5 71.5 16.394 71.5 36zm-1 0C70.5 16.946 55.054 1.5 36 1.5 16.946 1.5 1.5 16.946 1.5 36c0 19.054 15.446 34.5 34.5 34.5 19.054 0 34.5-15.446 34.5-34.5z"
            className="colors-animations-4"
          />
        </svg>
      );
    }

    return (
      <span
        className={classNames(css.icon, css[icon])}
        style={{
          fontSize: size || 32,
          lineHeight: size ? `${size}px` : 32,
          color: color || null
        }}
      >
        {icons[icon]}
      </span>
    );
  }
}

import React from "react";
import PropTypes from "prop-types";

export const TooltipContext = React.createContext({});

export const TooltipProvider = ({
  children,
  tooltipPosition,
  helpAriaLabel,
  focusable = true,
  tooltipVisible,
  disabled = false,
  target,
}) => (
  <TooltipContext.Provider
    value={{
      tooltipPosition,
      helpAriaLabel,
      focusable,
      tooltipVisible,
      disabled,
      target,
    }}
  >
    {children}
  </TooltipContext.Provider>
);

TooltipProvider.propTypes = {
  children: PropTypes.node.isRequired,
  tooltipPosition: PropTypes.oneOf(["top", "bottom", "left", "right"]),
  helpAriaLabel: PropTypes.string,
  focusable: PropTypes.bool,
  tooltipVisible: PropTypes.bool,
  disabled: PropTypes.bool,
  target: PropTypes.instanceOf(Element),
};

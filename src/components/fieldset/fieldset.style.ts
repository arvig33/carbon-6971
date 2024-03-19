import styled, { css } from "styled-components";
import { margin } from "styled-system";

import FormFieldStyle from "../../__internal__/form-field/form-field.style";
import ValidationIconStyle from "../../__internal__/validations/validation-icon.style";
import StyledIcon from "../icon/icon.style";
import baseTheme from "../../style/themes/base";
import CheckboxStyle from "../checkbox/checkbox.style";

export interface StyledFieldsetProps {
  /** When true, legend is placed in line with the children */
  inline?: boolean;
  /** Flag to configure fields as mandatory. */
  isRequired?: boolean;
  /** Flag to configure fields as optional. */
  isOptional?: boolean;
}

const FieldsetStyle = styled.fieldset`
  margin: 0;
  ${margin}
  border: none;
  padding: 0;

  &&&& ${FormFieldStyle} {
    margin-top: 0;
    margin-bottom: -1px;
  }

  & ${CheckboxStyle} {
    padding-top: 8px;
    padding-bottom: 8px;
  }
`;

FieldsetStyle.defaultProps = {
  theme: baseTheme,
};

const LegendContainerStyle = styled.div<StyledFieldsetProps>`
  ${({ inline }) =>
    inline &&
    `
  margin-right: 32px;
  height: 34px !important;
  `}
  display: flex;
  align-items: center;
  margin-bottom: 32px;

  legend {
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
    margin-right: 4px;

    ${({ isRequired }) =>
      isRequired &&
      css`
        ::after {
          content: "*";
          line-height: 24px;
          color: var(--colorsSemanticNegative500);
          font-weight: var(--fontWeights700);
          margin-left: var(--spacing100);
          position: relative;
          top: 1px;
          left: -4px;
        }
      `}

    ${({ isOptional }) =>
      isOptional &&
      css`
        ::after {
          content: "(optional)";
          color: var(--colorsUtilityYin055);
          font-weight: var(--fontWeights400);
          margin-left: var(--spacing050);
        }
      `}
  }

  ${ValidationIconStyle} ${StyledIcon}:focus {
    outline: 2px solid #ffb500;
  }
`;

const FieldsetContentStyle = styled.div<StyledFieldsetProps>`
  ${({ inline }) => inline && "display: flex;"}
`;

export { FieldsetStyle, LegendContainerStyle, FieldsetContentStyle };

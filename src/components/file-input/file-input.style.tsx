import styled, { css } from "styled-components";
import type { InputProps } from "../../__internal__/input";
import type { ValidationProps } from "../../__internal__/validations";
import StyledTypography from "../typography/typography.style";

export const StyledHiddenFileInput = styled.input<InputProps>`
  display: none;
`;

interface StyledFileInputPresentationProps
  extends Pick<ValidationProps, "error"> {
  isDraggedOver?: boolean;
  isDraggingFile?: boolean;
  hasUploadStatus?: boolean;
  maxHeight?: string;
  maxWidth?: string;
  minHeight?: string;
  minWidth?: string;
}

export const StyledFileInputPresentation = styled.div<StyledFileInputPresentationProps>`
  ${({ hasUploadStatus, minWidth, minHeight, maxWidth, maxHeight }) => css`
    min-width: ${minWidth};
    min-height: ${minHeight};
    max-width: ${maxWidth};
    ${!hasUploadStatus &&
    css`
      padding: var(--spacing150);
      max-height: ${maxHeight};
    `}
  `}

  ${({ hasUploadStatus, isDraggedOver, isDraggingFile, error }) => {
    const borderWidthToken =
      error || isDraggingFile ? "borderWidth200" : "borderWidth100";
    let borderColorToken = "colorsUtilityMajor300";
    let backgroundColorToken = "colorsUtilityYang100";
    if (isDraggedOver) {
      borderColorToken = "colorsUtilityMajor400";
      backgroundColorToken = "colorsUtilityMajor100";
    } else if (isDraggingFile) {
      borderColorToken = "colorsUtilityMajor400";
    }
    if (error) {
      borderColorToken = `colorsSemanticNegative${isDraggingFile ? 600 : 500}`;
    }
    return (
      !hasUploadStatus &&
      css`
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: center;
        align-content: center;
        align-items: center;
        text-align: center;
        gap: var(--spacing150);
        border-radius: var(--borderRadius050);
        border: var(--${borderWidthToken}) dashed var(--${borderColorToken});
        background: var(--${backgroundColorToken});
        ${StyledTypography} {
          color: var(--colorsUtilityYin055);
        }
      `
    );
  }}
`;

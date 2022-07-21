import React from "react";
import { shallow, mount } from "enzyme";
import TestRenderer from "react-test-renderer";
import { act } from "react-dom/test-utils";

import { ThemeProvider } from "styled-components";
import SplitButton from "./split-button.component";
import StyledSplitButton from "./split-button.style";
import StyledSplitButtonToggle from "./split-button-toggle.style";
import StyledSplitButtonChildrenContainer from "./split-button-children.style";
import Icon from "../icon";
import Button from "../button";
import StyledButton from "../button/button.style";
import { rootTagTest } from "../../__internal__/utils/helpers/tags/tags-specs";
import mintTheme from "../../style/themes/mint";
import aegeanTheme from "../../style/themes/aegean";
import {
  assertStyleMatch,
  testStyledSystemMargin,
} from "../../__spec_helper__/test-utils";
import guid from "../../__internal__/utils/helpers/guid";

jest.mock("../../__internal__/utils/helpers/guid");
guid.mockImplementation(() => "guid-12345");

const sizes = ["small", "medium", "large"];

const themes = [
  ["mint", mintTheme],
  ["aegean", aegeanTheme],
];

const singleButton = <Button key="testKey">Single Button</Button>;
const multipleButtons = [
  <Button key="testKey1">Extra Button</Button>,
  <Button key="testKey2">Extra Button</Button>,
  <Button key="testKey3">Extra Button</Button>,
];

const render = (
  mainProps = {},
  childButtons = singleButton,
  renderer = shallow
) => {
  return renderer(
    <SplitButton
      {...mainProps}
      text="Split button"
      data-element="bar"
      data-role="baz"
    >
      {childButtons}
    </SplitButton>
  );
};

const renderAttached = (
  mainProps = {},
  childButtons = singleButton,
  renderer = mount
) => {
  return renderer(
    <SplitButton
      {...mainProps}
      text="Split button"
      data-element="bar"
      data-role="baz"
    >
      {childButtons}
    </SplitButton>,
    { attachTo: document.getElementById("enzymeContainer") }
  );
};

const renderWithTheme = (
  mainProps = {},
  childButtons = singleButton,
  renderer = shallow
) => {
  return renderer(
    <ThemeProvider theme={mainProps.carbonTheme}>
      <SplitButton
        {...mainProps}
        text="Split button"
        data-element="bar"
        data-role="baz"
      >
        {childButtons}
      </SplitButton>
    </ThemeProvider>
  );
};

const renderWithNoChildren = (mainProps = {}, renderer = shallow) => {
  return renderer(
    <SplitButton
      {...mainProps}
      text="Split button"
      data-element="bar"
      data-role="baz"
    >
      {singleButton}
    </SplitButton>
  );
};

const buildSizeConfig = (name, size) => {
  const sizeObj = {};
  sizeObj.fontSize = size === "large" ? "16px" : "14px";
  if (size === "small") {
    sizeObj.height = "32px";
    sizeObj.padding = "16px";
  } else if (size === "medium") {
    sizeObj.height = "40px";
    sizeObj.padding = "24px";
  } else if (size === "large") {
    sizeObj.height = "48px";
    sizeObj.padding = "32px";
  }
  return sizeObj;
};

describe("SplitButton", () => {
  let wrapper;
  let toggle;
  jest.useFakeTimers();

  testStyledSystemMargin((props) => (
    <SplitButton text="Test" {...props}>
      <Button>Test</Button>
    </SplitButton>
  ));

  describe("render with custom className", () => {
    beforeEach(() => {
      wrapper = render();
      toggle = wrapper.find('[data-element="toggle-button"]');
    });

    it("does not render additional buttons", () => {
      expect(wrapper.find("[data-element='additional-buttons']").exists()).toBe(
        false
      );
    });

    it("renders dropdown icon", () => {
      expect(
        toggle.contains(
          <Icon
            type="dropdown"
            color="#008200"
            disabled={false}
            bgSize="extra-small"
            bg="transparent"
          />
        )
      ).toBeTruthy();
    });
  });

  describe("when id passed", () => {
    it("the id is passed to the main button", () => {
      wrapper = render({ id: "customId" });

      expect(wrapper.find({ "data-element": "main-button" }).prop("id")).toBe(
        "customId"
      );
    });
  });

  describe("when there are no children", () => {
    it("does not throw an error", () => {
      expect(() => renderWithNoChildren()).not.toThrow();
    });
  });

  describe("when children are Button Components", () => {
    it("then they should change to Buttons with forwarded refs", () => {
      wrapper = render({}, singleButton, mount);
      openAdditionalButtons(wrapper);

      expect(wrapper.find(Button).exists()).toBe(true);
    });

    afterEach(() => {
      wrapper.unmount();
    });
  });

  describe("when children are not Button Components", () => {
    it("then child elements should be rendered as they are", () => {
      const spanElement = <span className="span-element" />;
      wrapper = render({}, spanElement, mount);
      openAdditionalButtons(wrapper);

      const element = wrapper
        .find(StyledSplitButtonChildrenContainer)
        .find(".span-element");
      expect(element.exists()).toBe(true);
    });

    afterEach(() => {
      wrapper.unmount();
    });
  });

  describe.each(themes)('when the theme is set to "%s"', (name, theme) => {
    let themedWrapper;

    beforeEach(() => {
      themedWrapper = mount(
        <StyledSplitButtonChildrenContainer theme={theme}>
          <StyledButton>Foo</StyledButton>
        </StyledSplitButtonChildrenContainer>
      );
    });

    it("has the expected style", () => {
      assertStyleMatch(
        {
          backgroundColor: "var(--colorsActionMajorYang100)",
          border: `1px solid var(--colorsActionMajorTransparent)`,
        },
        themedWrapper,
        { modifier: `${StyledButton}` }
      );
    });

    it('matches the expected style for the focused "additional button"', () => {
      themedWrapper.find("button").simulate("focus");
      assertStyleMatch(
        {
          backgroundColor: "var(--colorsActionMajor600)",
        },
        themedWrapper,
        { modifier: `${StyledButton}:focus` }
      );
    });

    afterEach(() => {
      themedWrapper.unmount();
    });
  });

  describe.each(themes)('when the theme is set to "%s"', (name, theme) => {
    const mockProps = { carbonTheme: theme, buttonType: "primary" };

    it("renders Toggle Button left border as expected", () => {
      wrapper = renderWithTheme(mockProps, singleButton, mount);
      assertStyleMatch(
        {
          position: "relative",
        },
        wrapper.find(StyledSplitButtonToggle)
      );
    });
  });

  describe.each(sizes)('when the "%s" size prop is passed', (size) => {
    describe.each(themes)('with the "%s" business theme', (name, theme) => {
      it("has the expected styling", () => {
        const children = [
          <StyledButton size={size} key={name}>
            Foo
          </StyledButton>,
        ];

        const themedWrapper = mount(
          <StyledSplitButtonChildrenContainer theme={theme}>
            {children}
          </StyledSplitButtonChildrenContainer>
        );

        const expectedStyle = buildSizeConfig(name, size);

        for (let index = 0; index < children.length - 1; index++) {
          assertStyleMatch(
            {
              fontSize: expectedStyle.fontSize,
            },
            themedWrapper,
            { modifier: `${StyledButton}` }
          );

          assertStyleMatch(
            {
              height: expectedStyle.height,
              paddingLeft: expectedStyle.padding,
              paddingRight: expectedStyle.padding,
            },
            TestRenderer.create(children[index]).toJSON()
          );
        }
      });
    });
  });

  describe("toggle button with mouse events", () => {
    describe("mouse enter dropdown toggle", () => {
      beforeEach(() => {
        wrapper = render(
          {
            text: "mainButton",
          },
          <Button>Second Button</Button>,
          mount
        );
        toggle = wrapper.find(StyledSplitButtonToggle);
      });

      it("renders additional buttons", () => {
        toggle.simulate("mouseenter");

        expect(
          wrapper.find("[data-element='additional-buttons']").exists()
        ).toBe(true);
      });

      it("when disabled it does not render additional buttons", () => {
        wrapper = render({ disabled: true }, singleButton, mount);
        toggle = wrapper.find(StyledSplitButtonToggle);
        toggle.simulate("mouseenter");

        expect(
          wrapper.find("[data-element='additional-buttons']").exists()
        ).toBe(false);
      });

      it("when disabled it has the expected styling", () => {
        wrapper = render({ disabled: true }, singleButton, mount);

        toggle = wrapper.find(StyledSplitButtonToggle);
        assertStyleMatch(
          {
            background: "transparent",
            color: "var(--colorsActionMajorYin030)",
          },
          toggle
        );
      });

      afterEach(() => {
        wrapper.unmount();
      });
    });

    describe("mouse leave split-button", () => {
      let mainButton;

      beforeEach(() => {
        wrapper = render({}, singleButton, mount);
        mainButton = wrapper.find(Button);
        toggle = wrapper.find(StyledSplitButtonToggle);
      });

      it("hides additional buttons", () => {
        toggle.simulate("mouseenter");

        expect(
          wrapper.find("[data-element='additional-buttons']").exists()
        ).toBe(true);

        act(() => {
          mainButton.simulate("mouseenter");
        });

        expect(
          wrapper.update().find("[data-element='additional-buttons']").exists()
        ).toBe(false);
      });

      afterEach(() => {
        wrapper.unmount();
      });
    });

    describe("clicking a button", () => {
      const handleMainButton = jasmine.createSpy("main");
      const handleSecondButton = jasmine.createSpy("second");
      beforeEach(() => {
        wrapper = mount(
          <SplitButton
            onClick={handleMainButton}
            text="Split button"
            data-element="bar"
            data-role="baz"
          >
            <Button onClick={handleSecondButton}>Second Button</Button>
            <Button>Noop button</Button>
          </SplitButton>
        );

        toggle = wrapper.find(StyledSplitButtonToggle);
      });

      afterEach(() => {
        wrapper.unmount();
      });

      it("the handler should be called on the main button", () => {
        toggle.simulate("mouseenter");

        const button = wrapper
          .find('[data-element="additional-buttons"]')
          .find(Button);
        button.at(0).simulate("click");
        expect(handleSecondButton).toHaveBeenCalled();
      });

      it("the menu should close", () => {
        toggle.simulate("mouseenter");
        const button = wrapper
          .find('[data-element="additional-buttons"]')
          .find(Button);
        button.at(0).simulate("click");

        wrapper.update();

        expect(wrapper.find(StyledSplitButtonChildrenContainer).exists()).toBe(
          false
        );
        toggle.simulate("focus");
      });

      it("does not throw error when button does not have an onclick prop", () => {
        expect(() => {
          toggle.simulate("mouseenter");

          const button = wrapper
            .find('[data-element="additional-buttons"]')
            .find(Button);

          button.at(1).simulate("click");
        }).not.toThrow();
      });
    });
  });

  describe("when the outside click event is triggered with menu open", () => {
    const nativeInputEvent = new Event("click", {
      bubbles: true,
      cancelable: true,
    });
    let domWrapper;

    beforeEach(() => {
      domWrapper = document.createElement("div");
      document.body.appendChild(domWrapper);
      wrapper = mount(
        <SplitButton text="Split button">{singleButton}</SplitButton>,
        { attachTo: domWrapper }
      );

      act(() => {
        openAdditionalButtons(wrapper);
      });
    });

    afterEach(() => {
      wrapper.detach();
      document.body.removeChild(domWrapper);
    });

    describe("on the Menu element", () => {
      it("then the Menu should not be closed", () => {
        expect(
          wrapper.update().find(StyledSplitButtonChildrenContainer).exists()
        ).toBe(true);

        act(() => {
          wrapper
            .find(StyledSplitButton)
            .getDOMNode()
            .dispatchEvent(nativeInputEvent);
        });
        jest.runAllTimers();
        wrapper.update();

        expect(
          wrapper.update().find(StyledSplitButtonChildrenContainer).exists()
        ).toBe(true);
      });
    });

    describe("on an external element", () => {
      it("then the Menu should be closed", () => {
        expect(
          wrapper.update().find(StyledSplitButtonChildrenContainer).exists()
        ).toBe(true);

        act(() => {
          domWrapper.dispatchEvent(nativeInputEvent);
        });

        expect(
          wrapper.update().find(StyledSplitButtonChildrenContainer).exists()
        ).toBe(false);
      });
    });
  });

  describe("tags", () => {
    describe("on component", () => {
      beforeEach(() => {
        wrapper = render();
        toggle = wrapper.find('[data-element="toggle-button"]');
      });

      it("include correct component, element and role data tags", () => {
        rootTagTest(wrapper, "split-button", "bar", "baz");
      });
    });

    describe.each(["additional-buttons", "main-button", "toggle-button"])(
      "%s element is tagged",
      (element) => {
        wrapper = render({}, multipleButtons, mount);

        toggle = wrapper.find(StyledSplitButtonToggle);
        toggle.simulate("mouseenter");

        expect(wrapper.find({ "data-element": element }).exists()).toBe(true);
      }
    );
  });

  describe("when focused on the toggle button", () => {
    const additionalButtonsSelector = '[data-element="additional-buttons"]';
    let container;

    beforeEach(() => {
      container = document.createElement("div");
      container.id = "enzymeContainer";
      document.body.appendChild(container);
      wrapper = renderAttached({}, multipleButtons);
      toggle = wrapper.find(StyledSplitButtonToggle);
      openAdditionalButtons(wrapper);
      jest.runAllTimers();
    });

    afterEach(() => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }

      container = null;
    });

    describe("using keyboard to open children container", () => {
      it.each([
        ["Enter", "Enter"],
        ["Space", " "],
        ["ArrowDown", "ArrowDown"],
        ["ArrowUp", "ArrowUp"],
      ])(
        "then the first additional button should be focused when %s key is pressed",
        (name, key) => {
          toggle.simulate("blur");
          wrapper.find(StyledSplitButton).simulate("mouseleave");
          wrapper.update();
          toggle.simulate("keydown", { key });
          jest.runAllTimers();

          const firstButton = wrapper
            .find(additionalButtonsSelector)
            .find("button")
            .at(0);
          expect(firstButton.getDOMNode()).toBe(document.activeElement);
        }
      );

      it("does not open additional buttons if opened already - coverage", () => {
        toggle.simulate("keydown", { key: "Enter" });
        jest.runAllTimers();
      });

      it("does not call preventDefault if key is not Enter, Space or ArrowDown", () => {
        const preventDefault = jest.fn();
        toggle.simulate("keydown", { key: "1", preventDefault });

        expect(preventDefault).not.toHaveBeenCalled();
      });
    });

    describe('when "up" key is pressed', () => {
      it("the additional buttons should be stepped through in sequence", () => {
        const additionalButtons = wrapper
          .find(additionalButtonsSelector)
          .find(Button);

        wrapper
          .find(StyledSplitButtonChildrenContainer)
          .simulate("keydown", { key: "ArrowDown" });
        wrapper
          .find(StyledSplitButtonChildrenContainer)
          .simulate("keydown", { key: "ArrowDown" });
        expect(
          additionalButtons.at(additionalButtons.length - 1).getDOMNode()
        ).toStrictEqual(document.activeElement);
        wrapper
          .find(StyledSplitButtonChildrenContainer)
          .simulate("keydown", { key: "ArrowUp" });
        expect(
          additionalButtons.at(additionalButtons.length - 2).getDOMNode()
        ).toStrictEqual(document.activeElement);
        wrapper
          .find(StyledSplitButtonChildrenContainer)
          .simulate("keydown", { key: "ArrowUp" });
        expect(additionalButtons.at(0).getDOMNode()).toStrictEqual(
          document.activeElement
        );
        wrapper
          .find(StyledSplitButtonChildrenContainer)
          .simulate("keydown", { key: "ArrowUp" });
        expect(additionalButtons.at(0).getDOMNode()).toStrictEqual(
          document.activeElement
        );
      });
    });

    describe('when "down" key is pressed', () => {
      it("the additional buttons should be stepped through in sequence", () => {
        const additionalButtons = wrapper
          .find(additionalButtonsSelector)
          .find(Button);

        wrapper
          .find(StyledSplitButtonChildrenContainer)
          .simulate("keydown", { key: "ArrowDown" });
        expect(
          additionalButtons.at(additionalButtons.length - 2).getDOMNode()
        ).toStrictEqual(document.activeElement);
        wrapper
          .find(StyledSplitButtonChildrenContainer)
          .simulate("keydown", { key: "ArrowDown" });
        expect(
          additionalButtons.at(additionalButtons.length - 1).getDOMNode()
        ).toStrictEqual(document.activeElement);
        wrapper
          .find(StyledSplitButtonChildrenContainer)
          .simulate("keydown", { key: "ArrowDown" });
        expect(
          additionalButtons.at(additionalButtons.length - 1).getDOMNode()
        ).toStrictEqual(document.activeElement);
      });
    });

    describe.each([
      ["Home", "Home", ""],
      ["Ctrl + ArrowUp", "ArrowUp", "ctrlKey"],
      ["Meta + ArrowUp", "ArrowUp", "metaKey"],
    ])("when %s key is pressed", (_, key, modifier) => {
      it("focuses the first button", () => {
        const additionalButtons = wrapper
          .find(additionalButtonsSelector)
          .find(Button);

        wrapper.find(StyledSplitButtonChildrenContainer).simulate("keydown", {
          key,
          ctrlKey: modifier === "ctrlKey",
          metaKey: modifier === "metaKey",
        });
        expect(additionalButtons.first().getDOMNode()).toStrictEqual(
          document.activeElement
        );
      });
    });

    describe.each([
      ["End", "End", ""],
      ["Ctrl + ArrowDown", "ArrowDown", "ctrlKey"],
      ["Meta + ArrowDown", "ArrowDown", "metaKey"],
      // eslint-disable-next-line
    ])("when %s key is pressed", (_, key, modifier) => {
      it("focuses the last button", () => {
        const additionalButtons = wrapper
          .find(additionalButtonsSelector)
          .find(Button);

        wrapper.find(StyledSplitButtonChildrenContainer).simulate("keydown", {
          key,
          ctrlKey: modifier === "ctrlKey",
          metaKey: modifier === "metaKey",
        });
        expect(additionalButtons.last().getDOMNode()).toStrictEqual(
          document.activeElement
        );
      });
    });

    describe("the tab key is pressed", () => {
      it("moves focus down the button children and closes container when the last one is focused", () => {
        const additionalButtons = wrapper
          .find(additionalButtonsSelector)
          .find(Button);

        additionalButtons.first().simulate("keydown", { key: "Tab" });
        expect(
          additionalButtons.at(additionalButtons.length - 2).getDOMNode()
        ).toStrictEqual(document.activeElement);

        additionalButtons
          .at(additionalButtons.length - 2)
          .simulate("keydown", { key: "Tab" });

        expect(additionalButtons.last().getDOMNode()).toStrictEqual(
          document.activeElement
        );

        act(() => {
          additionalButtons.last().simulate("keydown", { key: "Tab" });
          jest.runAllTimers();
        });

        expect(
          wrapper.update().find(StyledSplitButtonChildrenContainer).exists()
        ).toBeFalsy();
      });
    });

    describe("when shift and tab are pressed", () => {
      it("moves focus up the button children, closes container when the first one is focused and sets focus on the main button", () => {
        const additionalButtons = wrapper
          .find(additionalButtonsSelector)
          .find(Button);

        additionalButtons.first().simulate("keydown", { key: "Tab" });
        additionalButtons
          .last()
          .simulate("keydown", { key: "Tab", shiftKey: true });

        expect(additionalButtons.first().getDOMNode()).toStrictEqual(
          document.activeElement
        );

        act(() => {
          additionalButtons
            .first()
            .simulate("keydown", { key: "Tab", shiftKey: true });
          jest.runAllTimers();
        });

        expect(
          wrapper.update().find(StyledSplitButtonChildrenContainer).exists()
        ).toBeFalsy();

        expect(toggle.getDOMNode()).toStrictEqual(document.activeElement);
      });
    });

    describe("and mouse leaves the Split Button", () => {
      it("then the additional buttons menu should remain open", () => {
        const additionalButtons = wrapper
          .find(additionalButtonsSelector)
          .find(Button);

        additionalButtons
          .first()
          .simulate("keydown", { key: "Tab", shiftKey: true });
        jest.runAllTimers();

        toggle.simulate("mouseenter");

        wrapper.find(StyledSplitButton).simulate("mouseleave");

        expect(wrapper.find(additionalButtonsSelector).exists()).toStrictEqual(
          true
        );
      });
    });

    describe("and mouse leaves the Split Button after focus is out of toggle", () => {
      it("then the additional buttons menu should be closed", () => {
        toggle.simulate("blur");
        act(() => {
          wrapper.simulate("mouseleave");
        });

        expect(wrapper.update().find(additionalButtonsSelector).exists()).toBe(
          false
        );
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });
  });

  describe("when the esc key is pressed", () => {
    let container;
    beforeEach(() => {
      container = document.createElement("div");
      container.id = "enzymeContainer";
      document.body.appendChild(container);
      wrapper = mount(
        <SplitButton text="Split button">
          <Button>First</Button>
          <Button>Second</Button>
        </SplitButton>,
        { attachTo: document.getElementById("enzymeContainer") }
      );
    });

    afterEach(() => {
      container?.parentNode?.removeChild(container);
      wrapper.unmount();
      container = null;
    });

    it("hides the additional children buttons when key pressed and one is focused", () => {
      openAdditionalButtons(wrapper);

      expect(
        wrapper.update().find(StyledSplitButtonChildrenContainer).exists()
      ).toBeTruthy();
      act(() => {
        wrapper
          .find(StyledSplitButtonChildrenContainer)
          .simulate("keydown", { key: "Escape" });
      });
      expect(
        wrapper.update().find(StyledSplitButtonChildrenContainer).exists()
      ).toBeFalsy();
      expect(wrapper.find(StyledSplitButtonToggle).getDOMNode()).toStrictEqual(
        document.activeElement
      );
    });

    it("hides the additional children buttons when key pressed and focus is not on the list buttons", () => {
      const toggleButton = wrapper.find(StyledSplitButtonToggle);

      toggleButton.simulate("mouseEnter");
      expect(
        wrapper.update().find(StyledSplitButtonChildrenContainer).exists()
      ).toBeTruthy();
      act(() => {
        toggleButton.simulate("keydown", { key: "Escape" });
      });
      expect(
        wrapper.update().find(StyledSplitButtonChildrenContainer).exists()
      ).toBeFalsy();
    });
  });

  it("should set proper width of ButtonContainer", () => {
    spyOn(Element.prototype, "getBoundingClientRect");
    Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockImplementation(() => ({ width: 200 }));

    wrapper = render({}, singleButton, mount);
    openAdditionalButtons(wrapper);

    assertStyleMatch(
      { minWidth: `${0.75 * 200}px` },
      wrapper.find(StyledSplitButtonChildrenContainer)
    );

    jest.clearAllMocks();

    wrapper.unmount();
  });
});

function openAdditionalButtons(container) {
  const toggleButton = container.find('[data-element="toggle-button"]').at(0);

  toggleButton.simulate("keydown", { key: "ArrowDown" });
}

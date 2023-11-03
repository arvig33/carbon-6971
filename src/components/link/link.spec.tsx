import React from "react";
import { mount, ReactWrapper, shallow, ShallowWrapper } from "enzyme";
import { noThemeSnapshot } from "../../__spec_helper__/enzyme-snapshot-helper";
import Link from "./link.component";
import { assertStyleMatch } from "../../__spec_helper__/test-utils";
import { StyledLink } from "./link.style";
import Icon from "../icon";
import StyledIcon from "../icon/icon.style";
import Tooltip from "../tooltip";
import MenuContext from "../menu/menu.context";
import { baseTheme } from "../../style/themes";

function renderLink(props = {}, renderer = mount) {
  return renderer(<Link {...props}>Link Component</Link>);
}

describe("Link", () => {
  let wrapper: ShallowWrapper | ReactWrapper;

  beforeEach(() => {
    wrapper = renderLink();
  });

  it("renders as expected", () => {
    expect(
      noThemeSnapshot(shallow(<Link href="www.foo.com">test</Link>))
    ).toMatchSnapshot();
  });

  describe("If `isSkipLink` provided", () => {
    const skipLinkWrapper = mount(
      <Link href="#test" isSkipLink>
        Test Content
      </Link>
    );

    it("should render `Skip to main content` text inside of Link", () => {
      expect(skipLinkWrapper.text()).toBe("Skip to main content");
    });

    it("should render correct designs", () => {
      assertStyleMatch(
        {
          position: "absolute",
          paddingLeft: "24px",
          paddingRight: "24px",
          lineHeight: "36px",
          fontSize: "16px",
          left: "-999em",
          color: "var(--colorsUtilityYin090)",
          zIndex: `${baseTheme.zIndex.aboveAll}`,
          boxShadow: `inset 0 0 0 2px var(--colorsActionMajor500)`,
          border: `2px solid var(--colorsUtilityYang100)`,
        },
        skipLinkWrapper,
        { modifier: "a" }
      );

      assertStyleMatch(
        {
          top: "8px",
          left: "8px",
          color: "var(--colorsActionMajorYin090)",
        },
        skipLinkWrapper,
        { modifier: "a:focus" }
      );
    });
  });

  describe("The `disabled` prop", () => {
    it("should matches the expected style when true", () => {
      assertStyleMatch(
        {
          cursor: "not-allowed",
        },
        renderLink({ disabled: true }),
        { modifier: "a:hover" }
      );
    });

    it("should not call the onClick function when true and clicked", () => {
      const spy = jest.fn();
      wrapper = renderLink({ disabled: true, onClick: spy }, mount);
      wrapper.find("button").simulate("click");
      expect(spy).not.toHaveBeenCalled();
    });

    it("should call the onClick function when false and clicked", () => {
      const spy = jest.fn();
      wrapper = renderLink({ disabled: false, onClick: spy }, mount);
      wrapper.find("button").simulate("click");
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("when component received a `target` prop", () => {
    it("should render an `<a>` element with target attribute", () => {
      const target = "_blank";
      wrapper.setProps({ target });

      expect(wrapper.find("a").prop("target")).toBe(target);
    });
  });

  describe("when component received a `rel` prop", () => {
    it("should render an `<a>` element with rel attribute", () => {
      const rel = "alternate";
      wrapper.setProps({ rel });

      expect(wrapper.find("a").prop("rel")).toBe(rel);
    });
  });

  describe("when component received a `href` prop", () => {
    it("should render an `<a>` element", () => {
      wrapper.setProps({ href: "#" });

      expect(wrapper.find("a")).toHaveLength(1);
    });
  });

  describe("when component received a `href` prop and a `onClick` prop", () => {
    it("should render an `<a>` element and call the onClick function", () => {
      const onClickFn = jest.fn();
      wrapper.setProps({ href: "#", onClick: onClickFn });

      expect(wrapper.find("a")).toHaveLength(1);

      wrapper.find("a").simulate("click");

      expect(onClickFn).toHaveBeenCalled();
    });
  });

  describe("when component received an `icon` prop", () => {
    beforeEach(() => {
      wrapper.setProps({ icon: "basket" });
    });

    it("should render an `Icon` correctly with the `basket` value", () => {
      expect(wrapper.find(Icon).props().type).toEqual("basket");
    });

    it("should render an `Icon` on the left side of the component by default", () => {
      assertStyleMatch(
        {
          marginRight: "var(--spacing100)",
          position: "relative",
        },
        wrapper.find(StyledLink),
        { modifier: `a > ${StyledIcon}` }
      );
    });

    it("should render an `Icon` on the right", () => {
      wrapper.setProps({ iconAlign: "right" });
      assertStyleMatch(
        {
          marginRight: "0",
          marginLeft: "var(--spacing100)",
          position: "relative",
        },
        wrapper.find(StyledLink),
        { modifier: `a > ${StyledIcon}` }
      );
    });

    it("should render an `Icon` on the right with no margin when no children", () => {
      wrapper = mount(
        <Link iconAlign="right" icon="home" href="www.sage.com" />
      );
      assertStyleMatch(
        {
          marginRight: "0",
          marginLeft: "0",
          position: "relative",
        },
        wrapper.find(StyledLink),
        { modifier: `a > ${StyledIcon}` }
      );
    });

    it("should apply correct colour to icon on hover", () => {
      wrapper = mount(
        <Link iconAlign="right" icon="home" href="www.sage.com" />
      );
      assertStyleMatch(
        {
          color: "var(--colorsActionMajor600)",
        },
        wrapper.find(StyledLink),
        { modifier: `a:hover ${StyledIcon}` }
      );
    });

    it("should render a `Tooltip` if tooltipMessage is passed", () => {
      wrapper = mount(
        <Link
          iconAlign="right"
          icon="home"
          href="www.sage.com"
          tooltipMessage="foo"
        />
      );

      expect(wrapper.find(Tooltip).exists()).toBeTruthy();
    });
  });

  describe("when a link is rendered with an icon and no children", () => {
    beforeEach(() => {
      wrapper = mount(<Link icon="home" href="www.sage.com" />);
    });

    it("there should be no text decoration on the anchor element", () => {
      assertStyleMatch(
        {
          textDecoration: "none",
        },
        wrapper.find(StyledLink),
        { modifier: "a" }
      );
    });

    it("link should have the inline display property", () => {
      assertStyleMatch(
        {
          display: "inline",
        },
        wrapper.find(StyledLink),
        { modifier: `a > ${StyledIcon}` }
      );
    });
  });

  describe("when the `onKeyDown` event is triggered", () => {
    let onClickFn: () => jest.Mock;
    let onKeyDownFn: () => jest.Mock;

    beforeEach(() => {
      onClickFn = jest.fn();
      onKeyDownFn = jest.fn();
    });

    it("should trigger an `onKeyDown` prop", () => {
      wrapper.setProps({
        onKeyDown: onKeyDownFn,
      });
      wrapper.find("a").simulate("keydown", { keyCode: 13 });

      expect(onKeyDownFn).toHaveBeenCalled();
    });

    describe("and a `href` prop has been received", () => {
      it("should not trigger `onClick` prop", () => {
        wrapper.setProps({
          href: "#",
          onKeyDown: onKeyDownFn,
          onClick: onClickFn,
        });
        wrapper.find("a").simulate("keydown", { key: "Enter" });

        expect(onClickFn).not.toHaveBeenCalled();
      });
    });

    describe("and a `onClick` prop has been received", () => {
      it("should trigger `onClick` prop", () => {
        wrapper.setProps({
          onClick: onClickFn,
        });
        wrapper.find("button").simulate("keydown", { key: "Enter" });

        expect(onClickFn).toHaveBeenCalled();
      });
    });

    describe("when a key is pressed but no onClick prop received", () => {
      beforeEach(() => {
        wrapper.setProps({
          onKeyDown: onKeyDownFn,
        });
        wrapper.find("a").simulate("keydown", { key: "Enter" });
      });

      it("should trigger `onKeyDown` prop", () => {
        expect(onKeyDownFn).toHaveBeenCalled();
      });

      it("should not trigger an `onClick` prop", () => {
        expect(onClickFn).not.toHaveBeenCalled();
      });
    });
  });

  describe("onClick prop", () => {
    it("should render a button element", () => {
      wrapper = renderLink({ onClick: () => null });
      expect(wrapper.find("button")).toBeTruthy();
    });
  });

  describe("aria props", () => {
    describe("when rendered as an a element", () => {
      it("should set the aria attributes on the a", () => {
        wrapper = renderLink({ "aria-label": "test" });
        const anchor = wrapper.find("a").getDOMNode();

        expect(anchor.getAttribute("aria-label")).toEqual("test");
      });
    });

    describe("when rendered as an button element", () => {
      it("should set the aria attributes on the button", () => {
        wrapper = renderLink({ onClick: () => null, "aria-label": "test" });
        const anchor = wrapper.find("button").getDOMNode();

        expect(anchor.getAttribute("aria-label")).toEqual("test");
      });
    });

    describe("when removeAriaLabelOnIcon is true", () => {
      it("should set aria-label as undefined on icon", () => {
        wrapper = renderLink({
          onClick: () => null,
          icon: "home",
          "aria-label": "test",
          removeAriaLabelOnIcon: true,
        });

        expect(wrapper.find(Icon).props().ariaLabel).toBe(undefined);
      });
    });
  });

  describe("'negative' variant", () => {
    it("matches the styling when isDarkBackground is false", () => {
      wrapper = renderLink({
        href: "foo.com",
        isDarkBackground: false,
        icon: "home",
        variant: "negative",
      });

      assertStyleMatch(
        {
          color: "var(--colorsSemanticNegative500)",
        },
        wrapper,
        { modifier: "a" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsSemanticNegative500)",
        },
        wrapper,
        { modifier: `a ${StyledIcon}` }
      );

      assertStyleMatch(
        {
          color: "var(--colorsSemanticNegative600)",
        },
        wrapper,
        { modifier: "a:hover" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsSemanticNegative600)",
        },
        wrapper,
        { modifier: `a:hover ${StyledIcon}` }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
          backgroundColor: "var(--colorsSemanticFocus250)",
        },
        wrapper,
        { modifier: "a:focus" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
        },
        wrapper,
        { modifier: `a:focus ${StyledIcon}` }
      );
    });
  });

  describe("'neutral' variant", () => {
    it("matches the styling when isDarkBackground is false", () => {
      wrapper = renderLink({
        href: "foo.com",
        isDarkBackground: false,
        icon: "home",
        variant: "neutral",
      });

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
        },
        wrapper,
        { modifier: "a" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
        },
        wrapper,
        { modifier: `a ${StyledIcon}` }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajor600)",
        },
        wrapper,
        { modifier: "a:hover" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajor600)",
        },
        wrapper,
        { modifier: `a:hover ${StyledIcon}` }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
          backgroundColor: "var(--colorsSemanticFocus250)",
        },
        wrapper,
        { modifier: "a:focus" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
        },
        wrapper,
        { modifier: `a:focus ${StyledIcon}` }
      );
    });
  });

  describe("isDarkBackground", () => {
    it("matches the expected styling with default variant", () => {
      wrapper = renderLink({
        href: "foo.com",
        isDarkBackground: true,
        icon: "home",
      });

      assertStyleMatch(
        {
          color: "var(--colorsActionMajor350)",
        },
        wrapper,
        { modifier: "a" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajor350)",
        },
        wrapper,
        { modifier: `a ${StyledIcon}` }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajor450)",
        },
        wrapper,
        { modifier: "a:hover" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajor450)",
        },
        wrapper,
        { modifier: `a:hover ${StyledIcon}` }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
          backgroundColor: "var(--colorsSemanticFocus250)",
        },
        wrapper,
        { modifier: "a:focus" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
        },
        wrapper,
        { modifier: `a:focus ${StyledIcon}` }
      );
    });

    it("matches the expected styling when disabled", () => {
      wrapper = renderLink({
        href: "foo.com",
        isDarkBackground: true,
        disabled: true,
      });

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYang030)",
        },
        wrapper,
        { modifier: "a" }
      );
    });

    it("matches the styling when variant is set to 'negative'", () => {
      wrapper = renderLink({
        href: "foo.com",
        isDarkBackground: true,
        icon: "home",
        variant: "negative",
      });

      assertStyleMatch(
        {
          color: "var(--colorsSemanticNegative350)",
        },
        wrapper,
        { modifier: "a" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsSemanticNegative350)",
        },
        wrapper,
        { modifier: `a ${StyledIcon}` }
      );

      assertStyleMatch(
        {
          color: "var(--colorsSemanticNegative450)",
        },
        wrapper,
        { modifier: "a:hover" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsSemanticNegative450)",
        },
        wrapper,
        { modifier: `a:hover ${StyledIcon}` }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
          backgroundColor: "var(--colorsSemanticFocus250)",
        },
        wrapper,
        { modifier: "a:focus" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
        },
        wrapper,
        { modifier: `a:focus ${StyledIcon}` }
      );
    });

    it("matches the styling when variant is set to 'neutral'", () => {
      wrapper = renderLink({
        href: "foo.com",
        isDarkBackground: true,
        icon: "home",
        variant: "neutral",
      });

      assertStyleMatch(
        {
          color: "var(--colorsActionMinor100)",
        },
        wrapper,
        { modifier: "a" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMinor100)",
        },
        wrapper,
        { modifier: `a ${StyledIcon}` }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajor450)",
        },
        wrapper,
        { modifier: "a:hover" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajor450)",
        },
        wrapper,
        { modifier: `a:hover ${StyledIcon}` }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
          backgroundColor: "var(--colorsSemanticFocus250)",
        },
        wrapper,
        { modifier: "a:focus" }
      );

      assertStyleMatch(
        {
          color: "var(--colorsActionMajorYin090)",
        },
        wrapper,
        { modifier: `a:focus ${StyledIcon}` }
      );
    });
  });

  describe("link display styling", () => {
    it("when inside a menu, link element has display inline-block", () => {
      wrapper = mount(
        <MenuContext.Provider
          value={{
            inMenu: true,
            menuType: "light",
            openSubmenuId: null,
            setOpenSubmenuId: () => {},
          }}
        >
          <Link href="foo.com" />
        </MenuContext.Provider>
      );

      assertStyleMatch({ display: "inline-block" }, wrapper, { modifier: "a" });
    });

    it("when not inside a menu, link element has default display", () => {
      wrapper = renderLink({
        href: "foo.com",
        isDarkBackground: true,
        icon: "home",
      });

      assertStyleMatch({ display: undefined }, wrapper, { modifier: "a" });
    });
  });
});

import React, { useState } from "react";
import { action } from "@storybook/addon-actions";

import Alert from ".";
import Button from "../button";

export default {
  title: "Alert/Test",
  parameters: {
    info: { disable: true },
    chromatic: {
      disable: true,
    },
  },
  argTypes: {
    size: {
      options: [
        "auto",
        "extra-small",
        "small",
        "medium-small",
        "medium",
        "medium-large",
        "large",
        "extra-large",
      ],
      control: {
        type: "select",
      },
    },
  },
};

interface AlertStoryProps {
  title?: string;
  height?: string;
  children?: string;
  subtitle?: string;
}

export const DefaultStory = ({
  title,
  height,
  children,
  subtitle,
  ...args
}: AlertStoryProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleCancel = () => {
    setIsOpen(false);
    action("cancel")();
  };
  const handleOpen = () => {
    setIsOpen(true);
    action("open")();
  };
  return (
    <>
      <Button onClick={handleOpen}>Open Alert</Button>
      <Alert
        onCancel={handleCancel}
        open={isOpen}
        title={title}
        height={height}
        subtitle={subtitle}
        {...args}
      >
        {children}
      </Alert>
    </>
  );
};

DefaultStory.story = {
  name: "default",
  args: {
    title: "Title",
    disableEscKey: false,
    height: "",
    subtitle: "",
    showCloseIcon: true,
    size: "extra-small",
    children: "This is an example of an alert",
  },
};

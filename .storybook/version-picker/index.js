import React, { useEffect, useState } from "react";
import {
  IconButton,
  WithTooltip,
  TooltipLinkList,
} from "@storybook/components";
import compareBuild from "semver/functions/compare-build";

import { TOOL_ID } from "./constants";
import fetchData from "./fetch-data";

const semverSort = (list) => list.sort((a, b) => compareBuild(b.id, a.id));

const getDisplayedItems = (versions, onClick) => {
  let formattedVersions = [];

  for (const [key, value] of Object.entries(versions)) {
    formattedVersions.push({
      id: key,
      title: key,
      onClick,
      active: false,
      href: value,
      target: "_blank",
    });
  }

  semverSort(formattedVersions);
  formattedVersions[0].title = `${formattedVersions[0].title} (latest)`;

  return formattedVersions;
};

export const VersionPicker = () => {
  const [versions, setVersions] = useState();
  const [currentVersion, setCurrentVersion] = useState("Latest");

  console.log("Verision Picker initialised");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const version = urlParams.get("v");

    if (version) {
      setCurrentVersion(`v${version}`);
    }

    const getData = async () => {
      const data = await fetchData();
      console.log("Retrieved data:", data);
      setVersions(data.versions);
    };

    getData();
  }, []);

  if (versions) {
    return (
      <WithTooltip
        placement="top"
        trigger="click"
        closeOnClick
        tooltip={({ onHide }) => {
          return (
            <TooltipLinkList links={getDisplayedItems(versions, onHide)} />
          );
        }}
      >
        <IconButton
          key={TOOL_ID}
          active={false}
          title="Open docs for a different version"
        >
          {`${currentVersion}`}
        </IconButton>
      </WithTooltip>
    );
  }

  return null;
};

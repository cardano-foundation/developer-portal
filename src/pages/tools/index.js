import React, { useState, useMemo, useCallback, useEffect } from "react";

import Layout from "@theme/Layout";
import ShowcaseCheckbox from "@site/src/components/showcase/ShowcaseCheckbox";
import ShowcaseCard from "@site/src/components/showcase/ShowcaseCard";
import clsx from "clsx";

import PortalHero from "../portalhero";
import { toggleListItem } from "../../utils/jsUtils";
import { SortedShowcases, Tags, TagList } from "../../data/builder-tools";
import { useHistory, useLocation } from "@docusaurus/router";

const TITLE = "Builder Tools";
const DESCRIPTION = "Tools to help you build on Cardano";
const CTA = "Add your tool";
const FILENAME = "builder-tools.js";

function filterProjects(projects, selectedTags, operator) {
  if (selectedTags.length === 0) {
    return projects;
  }
  return projects.filter((showcase) => {
    if (showcase.tags.length === 0) {
      return false;
    }
    if (operator === "AND") { // no operator selection for the time being, we use OR
      return selectedTags.every((tag) => showcase.tags.includes(tag));
    } else {
      return selectedTags.some((tag) => showcase.tags.includes(tag));
    }
  });
}

function useFilteredProjects(projects, selectedTags, operator) {
  return useMemo(() => filterProjects(projects, selectedTags, operator), [
    projects,
    selectedTags,
    operator,
  ]);
}

const TagQueryStringKey = "tags";

function readSearchTags(search) {
  return new URLSearchParams(search).getAll(TagQueryStringKey);
}

function replaceSearchTags(search, newTags) {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey, tag));
  return searchParams.toString();
}

function useSelectedTags() {
  // The search query-string is the source of truth!
  const location = useLocation();
  const { push } = useHistory();

  // On SSR / first mount (hydration) no tag is selected
  const [selectedTags, setSelectedTags] = useState([]);

  // Sync tags from QS to state (delayed on purpose to avoid SSR/Client hydration mismatch)
  useEffect(() => {
    const tags = readSearchTags(location.search);
    setSelectedTags(tags);
  }, [location, setSelectedTags]);

  // Update the QS value
  const toggleTag = useCallback(
    (tag) => {
      const tags = readSearchTags(location.search);
      const newTags = toggleListItem(tags, tag);
      const newSearch = replaceSearchTags(location.search, newTags);
      push({ ...location, search: newSearch });
      // no need to call setSelectedTags, useEffect will do the sync
    },
    [location, push]
  );

  return { selectedTags, toggleTag };
}

function ShowcaseHeader() {
  return (
    <PortalHero
      title={TITLE}
      description={DESCRIPTION}
      cta={CTA}
      filename={FILENAME}
    />
  );
}

function ShowcaseFilters({ selectedTags, toggleTag, operator, setOperator }) {
  return (
    <div className="margin-top--l margin-bottom--md container">
      <div className="row">
        {TagList.map((tag) => {
          const { label, description, icon } = Tags[tag];
          return (
            <div key={tag} className="col col--2">
              <ShowcaseCheckbox
                // TODO add a proper tooltip
                title={`${label}: ${description}`}
                aria-label={`${label}: ${description}`}
                name={tag}
                label={
                  icon ? (
                    <>
                      {icon} {label}
                    </>
                  ) : (
                    label
                  )
                }
                onChange={() => toggleTag(tag)}
                checked={selectedTags.includes(tag)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShowcaseCards({ filteredProjects }) {
  return (
    <section className="container margin-top--lg">
      <h2>
        {filteredProjects.length} project
        {filteredProjects.length > 1 ? "s" : ""} 
      </h2>
      <div className="margin-top--lg">
        {filteredProjects.length > 0 ? (
          <div className="row">
            {filteredProjects.map((showcase) => (
              <ShowcaseCard
                key={showcase.title} // Title should be unique
                showcase={showcase}
              />
            ))}
          </div>
        ) : (
          <div className={clsx("padding-vert--md text--center")}>
            <h3>No result</h3>
          </div>
        )}
      </div>
    </section>
  );
}

function Showcase() {
  const { selectedTags, toggleTag } = useSelectedTags();
  const [operator, setOperator] = useState("OR");
  const filteredProjects = useFilteredProjects(
    SortedShowcases,
    selectedTags,
    operator
  );
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <ShowcaseHeader />
      <main className="container margin-vert--lg">
        <ShowcaseFilters
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          operator={operator}
          setOperator={setOperator}
        />
        <ShowcaseCards filteredProjects={filteredProjects} />
      </main>
    </Layout>
  );
}

export default Showcase;


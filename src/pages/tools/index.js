import React, { useState, useMemo, useCallback, useEffect } from "react";

import Layout from "@theme/Layout";
import ShowcaseTooltip from "@site/src/components/showcase/ShowcaseTooltip";
import ShowcaseTagSelect from "@site/src/components/showcase/ShowcaseTagSelect";
import ShowcaseCard from "@site/src/components/showcase/ShowcaseCard";
import ShowcaseFilterToggle, {
  Operator,
  readOperator
} from "@site/src/components/showcase/ShowcaseFilterToggle";
import clsx from "clsx";

import PortalHero from "../portalhero";
import { toggleListItem } from "../../utils/jsUtils";
import { SortedShowcases, Tags, TagList } from "../../data/builder-tools";
import { useHistory, useLocation } from "@docusaurus/router";
import styles from "./styles.module.css";

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';


const TITLE = "Builder Tools";
const DESCRIPTION = "Tools to help you build on Cardano";
const CTA = "Add your tool";
const FILENAME = "builder-tools.js";

export function prepareUserState() {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
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

function filterProjects(
  projects,
  selectedTags,
  operator,
  searchName,
) {
  if (searchName) {
    // eslint-disable-next-line no-param-reassign
    projects = projects.filter((project) =>
      project.title.toLowerCase().includes(searchName.toLowerCase()),
    );
  }
  if (selectedTags.length === 0) {
    return projects;
  }
  return projects.filter((project) => {
    if (project.tags.length === 0) {
      return false;
    }
    if (operator === 'AND') {
      return selectedTags.every((tag) => project.tags.includes(tag));
    } else {
      return selectedTags.some((tag) => project.tags.includes(tag));
    }
  })
}


function useFilteredUsers() {
  const location = useLocation();
  const [operator, setOperator] = useState('OR');
  // On SSR / first mount (hydration) no tag is selected
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchName, setSearchName] = useState(null);
  // Sync tags from QS to state (delayed on purpose to avoid SSR/Client hydration mismatch)
  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setOperator(readOperator(location.search));
    setSearchName(readSearchName(location.search));
  }, [location]);

  return useMemo(
    () => filterProjects(SortedShowcases, selectedTags, operator, searchName),
    [selectedTags, operator, searchName],
  );
}

function useSelectedTags() {
  // The search query-string is the source of truth!
  const location = useLocation();
  const { push } = useHistory();

  // On SSR / first mount (hydration) no tag is selected
  const [selectedTags, setSelectedTags] = useState([]);
  
  // Update the QS value
  const toggleTag = useCallback(
    (tag) => {
      const tags = readSearchTags(location.search);
      const newTags = toggleListItem(tags, tag);
      const newSearch = replaceSearchTags(location.search, newTags);
      push({ ...location, search: newSearch });
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

function ShowcaseFilters() {
  return (
    <div className="margin-top--l margin-bottom--md container">
       <div className={clsx("margin-bottom--sm", styles.filterCheckbox)}>
          <div>
            <h2>Filters</h2>
          </div>
          <ShowcaseFilterToggle />
        </div>
      <div className="row">
        {TagList.map((tag) => {
          const { label, description, color, icon } = Tags[tag];
          const id = `showcase_checkbox_id_${tag}`;
          return (
            <>
              <div className={styles.checkboxListItem}>
                <ShowcaseTooltip
                  id={id}
                  text={description}
                  anchorEl="#__docusaurus"
                >
                  <ShowcaseTagSelect
                    tag={tag}
                    id={id}
                    label={label}
                    icon={
                      tag === "favorite" ? (
                        <FavoriteIcon svgClass={styles.svgIconFavoriteXs} />
                      ) : (
                        <span
                          style={{
                            backgroundColor: color,
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            marginLeft: 8,
                          }}
                        />
                      )
                    }
                  />
                </ShowcaseTooltip>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}

function ShowcaseCards() {
  const filteredProjects = useFilteredUsers();
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
const SearchNameQueryKey = 'name';

function readSearchName(search) {
  return new URLSearchParams(search).get(SearchNameQueryKey);
}

function SearchBar() {
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(readSearchName(location.search));
  }, [location]);
  return (
    <div className={styles.searchContainer}>
      <input
        id="searchbar"
        placeholder="Search for site name..."
        value={value ?? undefined}
        onInput={(e) => {
          setValue(e.currentTarget.value);
          const newSearch = new URLSearchParams(location.search);
          newSearch.delete(SearchNameQueryKey);
          if (e.currentTarget.value) {
            newSearch.set(SearchNameQueryKey, e.currentTarget.value);
          }
          history.push({
            ...location,
            search: newSearch.toString(),
            state: prepareUserState(),
          });
          setTimeout(() => {
            document.getElementById('searchbar')?.focus();
          }, 0);
        }}
      />
    </div>
  );
}

function Showcase() {
  const { selectedTags, toggleTag } = useSelectedTags();
  const filteredProjects = useFilteredUsers();

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <ShowcaseHeader />
      <main className="container margin-vert--lg">
        <ShowcaseFilters
          selectedTags={selectedTags}
          toggleTag={toggleTag}
        />
        <SearchBar />
        <ShowcaseCards filteredProjects={filteredProjects} />
      </main>
    </Layout>
  );
}

export default Showcase;
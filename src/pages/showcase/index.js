import React, { useState, useMemo, useCallback, useEffect } from "react";
import Head from '@docusaurus/Head';
import Layout from "@theme/Layout";
import ShowcaseTooltip from "@site/src/components/showcase/ShowcaseTooltip";
import ShowcaseTagSelect from "@site/src/components/showcase/ShowcaseTagSelect";
import ShowcaseCard from "@site/src/components/showcase/ShowcaseCard/";
import OpenStickyButton from "../../components/buttons/openStickyButton";
import ShowcaseFilterToggle, {
  readOperator,
} from "@site/src/components/showcase/ShowcaseFilterToggle";
import clsx from "clsx";

import ShowcaseLatestToggle, {
  readLatestOperator,
} from "@site/src/components/showcase/ShowcaseLatestToggle";

import PortalHero from "../portalhero";
import { toggleListItem } from "../../utils/jsUtils";
import { SortedShowcases, Tags, TagList, Showcases } from "../../data/showcases";
import { useHistory, useLocation } from "@docusaurus/router";
import styles from "./styles.module.css";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import Fav from "../../svg/fav.svg";

const TITLE = "Showcase";
const DESCRIPTION = "See the awesome projects people are building with Cardano";
const CTA = "₳dd your project";
const FILENAME = "showcases.js";

export function prepareUserState() {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
}

const favoriteShowcases = SortedShowcases.filter((showcase) =>
  showcase.tags.includes("favorite")
);
const otherShowcases = SortedShowcases.filter(
  (showcase) => !showcase.tags.includes("favorite")
);

function restoreUserState(userState) {
  const { scrollTopPosition, focusedElementId } = userState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };
  document.getElementById(focusedElementId)?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

const TagQueryStringKey = "tags";

function readSearchTags(search) {
  return new URLSearchParams(search).getAll(TagQueryStringKey);
}

// Replace seach tags in the query
function replaceSearchTags(search, newTags) {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey, tag));
  return searchParams.toString();
}

// Filter projects based on chosen project tags, toggle operator or searchbar value
function filterProjects(projects, selectedTags, latest, operator, searchName, unfilteredProjects) {
  // Check if "LAST" filter is applied to decide if to filter through all projects or only last ones
  if (latest === "LAST") {
    var projects = unfilteredProjects.slice(-10);
  }

  if (searchName) {
    projects = projects.filter((project) =>
      project.title.toLowerCase().includes(searchName.toLowerCase())
    );
  }
  if (selectedTags.length === 0) {
    return projects;
  }

  return projects.filter((project) => {
    if (project.tags.length === 0) {
      return false;
    } else if (operator === "AND") {
      return selectedTags.every((tag) => project.tags.includes(tag));
    } else {
      return selectedTags.some((tag) => project.tags.includes(tag));
    }
  });
}

function useFilteredProjects() {
  const location = useLocation();
  const [operator, setOperator] = useState("OR");
  const [latest, setLatest] = useState("LAST");

  // On SSR / first mount (hydration) no tag is selected
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchName, setSearchName] = useState(null);

  // Sync tags from QS to state (delayed on purpose to avoid SSR/Client hydration mismatch)
  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setOperator(readOperator(location.search));
    setLatest(readLatestOperator(location.search));
    setSearchName(readSearchName(location.search));
    restoreUserState(location.state);
  }, [location]);

  return useMemo(
    () =>
      filterProjects(
        SortedShowcases,
        selectedTags,
        latest,
        operator,
        searchName,
        Showcases
      ),
    [selectedTags, latest, operator, searchName]
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
  const filteredProjects = useFilteredProjects();

  return (
    <div className="margin-top--l margin-bottom--md container">
      <div className={clsx("margin-bottom--sm", styles.filterCheckbox)}>
        <div>
          <h2>Filters</h2>
          <span>{`${filteredProjects.length} project${
            filteredProjects.length === 1 ? "" : "s"
          }`}</span>
        </div>
        <ShowcaseLatestToggle />
        <ShowcaseFilterToggle />
      </div>
      <div className={styles.checkboxList}>
        {TagList.map((tag, i) => {
          const { label, description, color } = Tags[tag];
          const id = `showcase_checkbox_id_${tag}`;
          return (
              <div key={i} className={styles.checkboxListItem}>
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
                      label === "Favorite" ? (
                        <span
                          style={{
                            marginLeft: 8,
                          }}
                        >
                          <Fav
                            className={styles.svgIconFavorite}
                            size="small"
                            style={{ display: "grid" }}
                          />
                        </span>
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
          );
        })}
      </div>
    </div>
  );
}

function ShowcaseCards() {
  const filteredProjects = useFilteredProjects();

  if (filteredProjects.length === 0) {
    return (
      <section className="margin-top--lg margin-bottom--xl">
        <div className="container padding-vert--md text--center">
          <h2>No result</h2>
          <SearchBar />
        </div>
      </section>
    );
  }

  return (
    <section className="margin-top--lg margin-bottom--xl">
      {filteredProjects.length === SortedShowcases.length ? (
        <>
          <div className={styles.showcaseFavorite}>
            <div className="container">
              <div
                className={clsx(
                  "margin-bottom--md",
                  styles.showcaseFavoriteHeader
                )}
              >
                <h2 className={styles.ourFavorites}>Our favorites</h2>
                <Fav className={styles.svgIconFavorite} size="small" />
                <SearchBar />
              </div>
              <ul className={clsx("container", styles.showcaseList)}>
                {favoriteShowcases.map((showcase) => (
                  <ShowcaseCard key={showcase.title} showcase={showcase} />
                ))}
              </ul>
            </div>
          </div>
          <div className="container margin-top--lg">
            <h2 className={styles.showcaseHeader}>All Projects</h2>
            <ul className={styles.showcaseList}>
              {otherShowcases.map((showcase) => (
                <ShowcaseCard key={showcase.title} showcase={showcase} />
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="container">
          <div
            className={clsx("margin-bottom--md", styles.showcaseFavoriteHeader)}
          >
            <SearchBar />
          </div>
          <ul className={styles.showcaseList}>
            {filteredProjects.map((showcase) => (
              <ShowcaseCard key={showcase.title} showcase={showcase} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
const SearchNameQueryKey = "name";

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
        placeholder="Search projects..."
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
            document.getElementById("searchbar")?.focus();
          }, 0);
        }}
      />
    </div>
  );
}

// Add open graph image to showcase page
function MetaData() {
  return (
    <Head>
      <meta property="og:image" content="https://developers.cardano.org/img/og/og-showcase.png" />
      <meta name="twitter:image" content="https://developers.cardano.org/img/og/og-showcase.png" />
    </Head>
  )
}

function Showcase() {
  const { selectedTags, toggleTag } = useSelectedTags();
  const filteredProjects = useFilteredProjects();

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <MetaData />
      <ShowcaseHeader />
      <ShowcaseFilters selectedTags={selectedTags} toggleTag={toggleTag} />
      <ShowcaseCards filteredProjects={filteredProjects} />
      <OpenStickyButton />
    </Layout>
  );
}

export default Showcase;

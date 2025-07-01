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
import {
  DomainsTags,
  LanguagesOrTechnologiesTags,
  SortedShowcases,
  Tags,
  Showcases,
  WorkflowCategories
} from "../../data/builder-tools";
import { useHistory, useLocation } from "@docusaurus/router";
import _debounce from 'lodash/debounce';
import styles from "./styles.module.css";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import Fav from "../../svg/fav.svg";

const TITLE = "Builder Tools";
const DESCRIPTION = "Tools to help you build on Cardano";
const CTA = "₳dd your tool";
const FILENAME = "builder-tools.js";

function CategoryCard({ category }) {
  // Find featured tools by exact title match (validation handled at build time)
  const tools = Showcases.filter(tool => 
    category.featured.includes(tool.title)
  ).slice(0, 3);
  
  return (
    <div className={styles.categoryCard}>
      <div className={styles.categoryHeader}>
        <h3 className={styles.categoryTitle}>{category.title}</h3>
        <p className={styles.categoryDescription}>{category.description}</p>
      </div>
      
      <div className={styles.categoryTools}>
        {tools.map((tool) => (
          <a 
            key={tool.title}
            href={tool.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.toolPreview}
          >
            <div className={styles.toolIcon}>
              🔧
            </div>
            <div className={styles.toolInfo}>
              <h4 className={styles.toolTitle}>{tool.title}</h4>
              <p className={styles.toolDescription}>
                {tool.description.length > 60 
                  ? `${tool.description.substring(0, 60)}...` 
                  : tool.description
                }
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function CategoryOverview() {
  return (
    <section className={styles.categoryOverview}>
      <div className="container">
        <div className={styles.overviewHeader}>
          <h2>Find tools for your project</h2>
          <p>
            Choose a category below, or{' '}
            <button className={styles.questionnaireLink} disabled>
              take our questionnaire
            </button>{' '}
            to get personalized recommendations.
          </p>
        </div>
        
        <div className={styles.categoryGrid}>
          {WorkflowCategories.map((category, index) => (
            <CategoryCard key={index} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

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
    }
    if (operator === "AND") {
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
    if (ExecutionEnvironment.canUseDOM && location.state) {
      setTimeout(() => {
        restoreUserState(location.state);
      }, 0);
    }
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

function ShowcaseFilters() {
  const filteredProjects = useFilteredProjects();

  return (
    <div className="margin-top--l margin-bottom--md container">
      <div className={clsx("margin-bottom--sm", styles.filterCheckbox)}>
        <div>
          <h2>Filters</h2>
          <span>{`${filteredProjects.length} builder tool${
            filteredProjects.length === 1 ? "" : "s"
          }`}</span>
        </div>
        <ShowcaseLatestToggle />
        <ShowcaseFilterToggle />
      </div>
        <h3>By language / technology</h3>
        {filterBy(LanguagesOrTechnologiesTags)}
        <br/>
        <h3>By domain</h3>
        {filterBy(DomainsTags)}
    </div>
  );
}

function filterBy(tags) {
  return (<div className={styles.checkboxList}>
    {tags.map((tag, i) => {
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
                icon={(<span
                  style={{
                    backgroundColor: color,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    marginLeft: 8,
                  }}/>
                )}
              />
            </ShowcaseTooltip>
          </div>
      );
    })}
  </div>);
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
            <h2 className={styles.showcaseHeader}>All Tools</h2>
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
  const [value, setValue] = useState(() => readSearchName(location.search) || '');

  useEffect(() => {
    setValue(readSearchName(location.search) || '');
  }, [location.search]);

  const debouncedHistoryPush = useCallback(
    _debounce((newSearchString) => {
      history.push({
        ...location,
        search: newSearchString,
        state: prepareUserState(),
      });
    }, 300),
    [history, location] // Dependencies for useCallback
  );

  return (
    <div className={styles.searchContainer}>
      <input
        id="searchbar"
        placeholder="Search builder tools..."
        value={value}
        onInput={(e) => {
          const currentInputValue = e.currentTarget.value;
          setValue(currentInputValue);
          const newSearch = new URLSearchParams(location.search);
          newSearch.delete(SearchNameQueryKey);
          if (currentInputValue) {
            newSearch.set(SearchNameQueryKey, currentInputValue);
          }
          debouncedHistoryPush(newSearch.toString());
        }}
      />
    </div>
  );
}

// Add open graph image to builder tool page
function MetaData() {
  return (
    <Head>
      <meta property="og:image" content="https://developers.cardano.org/img/og/og-builder-tools.png" />
      <meta name="twitter:image" content="https://developers.cardano.org/img/og/og-builder-tools.png" />
    </Head>
  )
}

function Showcase() {
  const { selectedTags, toggleTag } = useSelectedTags();
  const filteredProjects = useFilteredProjects();
  const location = useLocation();
  const history = useHistory();
  
  // Derive view state from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const isBrowseView = urlParams.get('view') === 'browse';
  const hasFiltersApplied = selectedTags.length > 0 || location.search.includes('name=');
  const showOverview = !isBrowseView && !hasFiltersApplied;

  const handleShowAllTools = () => {
    // Navigate to browse view while preserving other params
    const newParams = new URLSearchParams(location.search);
    newParams.set('view', 'browse');
    history.push({ 
      pathname: location.pathname, 
      search: newParams.toString(),
      state: prepareUserState()
    });
  };

  const handleBackToOverview = () => {
    // Clear all URL parameters and return to overview
    history.push({ 
      pathname: location.pathname, 
      search: '',
      state: prepareUserState()
    });
  };

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <MetaData/> 
      <PortalHero
        title={TITLE}
        description={DESCRIPTION}
        cta={CTA}
        filename={FILENAME}
        secondaryCta={showOverview && !hasFiltersApplied ? `Browse all tools` : "← Back to categories"}
        secondaryOnClick={showOverview && !hasFiltersApplied ? handleShowAllTools : handleBackToOverview}
      />
        
      {showOverview && !hasFiltersApplied && (
        <>
          <CategoryOverview />
        </>
      )}
      
      {(!showOverview || hasFiltersApplied) && (
        <>
          <ShowcaseFilters selectedTags={selectedTags} toggleTag={toggleTag} />
          <ShowcaseCards filteredProjects={filteredProjects} />
        </>
      )}
      
      <OpenStickyButton />
    </Layout>
  );
}

export default Showcase;

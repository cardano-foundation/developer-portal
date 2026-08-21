import React, { useState, useMemo, useCallback, useEffect } from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useHistory, useLocation } from "@docusaurus/router";
import _debounce from "lodash/debounce";
import clsx from "clsx";

import IntentChips from "@site/src/components/showcase/IntentChips";
import PageCTA from "@site/src/components/PageCTA";
import ShowcaseSort, {
  readSortOption,
  DEFAULT_SORT,
  SORT_IDS,
} from "@site/src/components/showcase/ShowcaseSort";
import { readSearchTags } from "@site/src/components/showcase/tagQueryString";
import SiteHero from "@site/src/components/Layout/SiteHero";
import { StarBadge } from "@site/src/components/AppTile";
import AppTileCarousel from "@site/src/components/AppTileCarousel";
import CategoryPanelsCarousel from "@site/src/components/CategoryPanelsCarousel";
import AppRow from "@site/src/components/AppRow";
import AppFilterPanel from "@site/src/components/AppFilterPanel";
import OpenStickyButton from "@site/src/components/buttons/OpenStickyButton";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

import {
  SortedShowcases,
  Showcases,
  Categories,
  CategoryList,
  LanguageList,
  InterfaceList,
} from "@site/src/data/builder-tools/showcase";

import styles from "./styles.module.css";

const TITLE = "Builder Tools";
const DESCRIPTION = "Tools to help you build on Cardano";
const HERO_DESCRIPTION = "Every tool for you to build with Cardano.";

function restoreUserState(userState) {
  const { scrollTopPosition, focusedElementId } = userState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };
  document.getElementById(focusedElementId)?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

const maintainerPicks = SortedShowcases.filter((t) => t.maintainerPick);

const isProminentCategory = (c) => Categories[c]?.prominent === true;
const isCompactCategory = (c) => Categories[c]?.prominent === false;

// Category order is derived by how many tools sit in each category (desc).
function deriveCategoryOrder(predicate) {
  const countByCat = {};
  Showcases.forEach((tool) => {
    if (!predicate(tool.category)) return;
    countByCat[tool.category] = (countByCat[tool.category] || 0) + 1;
  });
  return Object.keys(countByCat).sort((a, b) => countByCat[b] - countByCat[a]);
}

const PROMINENT_CATEGORY_ORDER = deriveCategoryOrder(isProminentCategory);
const COMPACT_CATEGORY_ORDER = deriveCategoryOrder(isCompactCategory);

const SearchNameQueryKey = "name";

// The primary list is the top of the sorted, filtered set. Its heading follows
// the sort so the control is never claiming an order the list is not in.
const PRIMARY_COUNT = 12;
const SORT_HEADINGS = {
  [SORT_IDS.NEWEST]: ["Recently added", "The newest tools in the directory"],
  [SORT_IDS.FEATURED]: ["Featured", "Maintainer picks first"],
  [SORT_IDS.ALPHABETICAL]: ["All tools, A to Z", "Every tool, alphabetically"],
};

function readSearchName(search) {
  return new URLSearchParams(search).get(SearchNameQueryKey);
}

// Insertion rank per tool: `Showcases` keeps the order entries were appended
// to tools.js, so a higher index is a more recent addition. Built once.
const INSERTION_RANK = new Map(Showcases.map((tool, i) => [tool.slug, i]));

function sortProjects(projects, sortOption) {
  if (sortOption === SORT_IDS.ALPHABETICAL) {
    return [...projects].sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sortOption === SORT_IDS.NEWEST) {
    return [...projects].sort(
      (a, b) => (INSERTION_RANK.get(b.slug) ?? 0) - (INSERTION_RANK.get(a.slug) ?? 0)
    );
  }
  // FEATURED: SortedShowcases order (maintainer picks first, then alphabetical).
  return projects;
}

function filterProjects(projects, selectedTags, searchName) {
  let result = projects;
  if (searchName) {
    result = result.filter((p) =>
      p.title.toLowerCase().includes(searchName.toLowerCase())
    );
  }
  if (selectedTags.length === 0) return result;

  // Faceted matching: AND across groups (category / language / interface),
  // OR within a group. Category=SDK + Language=TypeScript returns SDKs that use TypeScript.
  const category = selectedTags.find((t) => CategoryList.includes(t));
  const languages = selectedTags.filter((t) => LanguageList.includes(t));
  const interfaces = selectedTags.filter((t) => InterfaceList.includes(t));

  return result.filter((p) => {
    if (category && p.category !== category) return false;
    const props = p.properties || [];
    if (languages.length && !languages.some((l) => props.includes(l))) return false;
    if (interfaces.length && !interfaces.some((i) => props.includes(i))) return false;
    return true;
  });
}

function useFilteredProjects() {
  const location = useLocation();
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchName, setSearchName] = useState(null);
  const [sortOption, setSortOption] = useState(DEFAULT_SORT);

  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSearchName(readSearchName(location.search));
    setSortOption(readSortOption(location.search));
    if (
      ExecutionEnvironment.canUseDOM &&
      location.state &&
      !location.state.isSearch
    ) {
      setTimeout(() => {
        restoreUserState(location.state);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const filtered = useMemo(
    () =>
      sortProjects(
        filterProjects(SortedShowcases, selectedTags, searchName),
        sortOption
      ),
    [selectedTags, searchName, sortOption]
  );

  const isUnfiltered = selectedTags.length === 0 && !searchName;

  return { filtered, sortOption, isUnfiltered, selectedTags };
}

function ShowcaseHeader() {
  return (
    <SiteHero
      title={TITLE}
      description={HERO_DESCRIPTION}
      artwork={useBaseUrl("/img/hero/spheres.webp")}
    />
  );
}

function SearchBar() {
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = useState(() => readSearchName(location.search) || "");
  const inputRef = React.useRef(null);

  useEffect(() => {
    const newValue = readSearchName(location.search) || "";
    setValue(newValue);
    if (
      location.state?.isSearch &&
      inputRef.current &&
      document.activeElement !== inputRef.current
    ) {
      inputRef.current.focus();
    }
  }, [location]);

  const debouncedHistoryPush = useCallback(
    _debounce((newSearchString) => {
      history.push({
        ...location,
        search: newSearchString,
        state: { isSearch: true },
      });
    }, 300),
    [history, location]
  );

  const handleInput = (e) => {
    const currentInputValue = e.currentTarget.value;
    setValue(currentInputValue);
    const newSearch = new URLSearchParams(location.search);
    newSearch.delete(SearchNameQueryKey);
    if (currentInputValue) {
      newSearch.set(SearchNameQueryKey, currentInputValue);
    }
    debouncedHistoryPush(newSearch.toString());
  };

  return (
    <div className={styles.searchInputWrap}>
      <input
        ref={inputRef}
        id="searchbar"
        className={styles.searchInput}
        placeholder="Search tools, SDKs, APIs, docs..."
        value={value}
        onInput={handleInput}
      />
    </div>
  );
}

function SearchControls() {
  return (
    <section className={styles.controls}>
      <SearchBar />
      <div className={styles.controlsRight}>
        <ShowcaseSort />
      </div>
    </section>
  );
}

// Renders inside the browse column, which already supplies the container.
// Adding another one indents this section past the controls above it.
function HighlightsSection({ apps, title, subtitle }) {
  if (apps.length === 0) return null;
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.sectionSubtitle}>{subtitle}</span>
      </header>
      <AppTileCarousel apps={apps} ariaLabel={title} />
    </section>
  );
}

function GuidedPathsBanner() {
  const paths = [
    { to: "/docs/developers/", label: "Get started" },
    { to: "/docs/developers/curriculum/smart-contracts/overview", label: "Write smart contracts" },
    { to: "/docs/developers/curriculum/native-tokens/overview", label: "Create native tokens" },
    { to: "/docs/operators/", label: "Run a stake pool" },
  ];
  return (
    <section className={clsx("container", styles.guidedPathsBanner)}>
      <div className={styles.guidedPathsHeader}>
        <h2 className={styles.guidedPathsTitle}>Guided paths</h2>
        <span className={styles.guidedPathsSubtitle}>
          Step-by-step on the Developer Portal
        </span>
      </div>
      <ul className={styles.guidedPathChipList}>
        {paths.map((p) => (
          <li key={p.to}>
            <Link to={p.to} className={styles.guidedPathChip}>
              {p.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryBrowseSection({ categories, title, subtitle, muted = false }) {
  if (categories.length === 0) return null;
  return (
    <section
      className={clsx("container", styles.section, muted && styles.sectionMuted)}
    >
      <header className={styles.sectionHeader}>
        <h2 className={clsx(styles.sectionTitle, muted && styles.sectionTitleMuted)}>
          {title}
        </h2>
        <span className={styles.sectionSubtitle}>{subtitle}</span>
      </header>
      <CategoryPanelsCarousel categories={categories} ariaLabel={title} />
    </section>
  );
}

function BrowseByCategorySection() {
  return (
    <CategoryBrowseSection
      categories={PROMINENT_CATEGORY_ORDER}
      title="Browse tools by category"
      subtitle="The newest additions in each category."
    />
  );
}

function MoreToolsSection() {
  return (
    <CategoryBrowseSection
      categories={COMPACT_CATEGORY_ORDER}
      title="Utilities & more"
      subtitle="IDEs, testing, security, and operator tooling."
      muted
    />
  );
}

function MaintainerPicksSection({ apps }) {
  if (apps.length === 0) return null;
  return (
    <section className={clsx("container", styles.section)}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>★ Maintainer picks</h2>
        <span className={styles.sectionSubtitle}>
          Selected by the Developer Portal maintainers
        </span>
      </header>
      <AppTileCarousel
        apps={apps}
        ariaLabel="Maintainer picks"
        renderBadge={() => <StarBadge />}
      />
    </section>
  );
}

// `bare` drops the container for the in-column use; the full-width reveal
// below the browse grid still needs its own.
function AllToolsSection({ apps, sortOption, isUnfiltered, heading, bare = false }) {
  const visible = useMemo(
    () => (isUnfiltered ? sortProjects(SortedShowcases, sortOption) : apps),
    [isUnfiltered, sortOption, apps]
  );
  return (
    <section className={clsx(!bare && "container", styles.section)}>
      <header className={clsx(styles.sectionHeader, styles.allAppsHeader)}>
        <h2 className={styles.sectionTitle}>
          {heading}
          <span className={styles.countMuted}>
            {" · "}
            {visible.length}
          </span>
        </h2>
      </header>
      <ul className={styles.rowGrid}>
        {visible.map((tool) => (
          <li key={tool.slug}>
            <AppRow app={tool} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AllToolsReveal() {
  const [shown, setShown] = useState(false);
  if (shown) {
    return (
      <AllToolsSection
        apps={null}
        sortOption={SORT_IDS.ALPHABETICAL}
        isUnfiltered={true}
        heading={`All ${SortedShowcases.length} tools, A to Z`}
      />
    );
  }
  return (
    <section className={clsx("container", styles.section, styles.allAppsReveal)}>
      <button
        type="button"
        className={clsx("button button--secondary", styles.showAllButton)}
        onClick={() => setShown(true)}
      >
        {`View all ${SortedShowcases.length} tools alphabetically`}
      </button>
    </section>
  );
}

function SubmitCTA() {
  return (
    <PageCTA
      title="Built a tool for Cardano?"
      description="Add it to this page. The submission process is open and lightweight."
      href="/docs/contribute/portal-contribute"
      buttonText="Add your tool"
    />
  );
}

// The page splits in two: a browse column that sits beside the filter rail
// (controls, intents, the primary result set) and the full-width sections
// below it. Both read the same filter state, so it is derived once here
// rather than by each half calling useFilteredProjects separately.
function useSectionData() {
  const { filtered, sortOption, isUnfiltered, selectedTags } =
    useFilteredProjects();

  const filteredSlugs = useMemo(
    () => new Set(filtered.map((a) => a.slug)),
    [filtered]
  );

  // Was a fixed "newest 5" constant that ignored sortOption entirely, which
  // left the sort control inert on the default view.
  const primaryApps = useMemo(
    () => filtered.slice(0, PRIMARY_COUNT),
    [filtered]
  );

  const pickApps = useMemo(
    () =>
      isUnfiltered
        ? maintainerPicks
        : maintainerPicks.filter((a) => filteredSlugs.has(a.slug)),
    [filteredSlugs, isUnfiltered]
  );

  const scopeLabel =
    !isUnfiltered && selectedTags.length === 1
      ? Categories[selectedTags[0]]?.label
      : null;

  const [primaryTitle, primarySubtitle] =
    SORT_HEADINGS[sortOption] ?? SORT_HEADINGS[SORT_IDS.NEWEST];

  return {
    empty: filtered.length === 0,
    filtered,
    sortOption,
    isUnfiltered,
    primaryApps,
    primaryTitle,
    primarySubtitle,
    pickApps,
    restHeading: scopeLabel ? `All ${scopeLabel}` : "All tools",
  };
}

// Sits in the browse column, beside the rail.
function PrimaryResults({ data }) {
  if (data.empty) {
    return (
      <section className={clsx(styles.section, "text--center")}>
        <h2>No result</h2>
      </section>
    );
  }
  return data.isUnfiltered ? (
    <HighlightsSection
      apps={data.primaryApps}
      title={data.primaryTitle}
      subtitle={data.primarySubtitle}
    />
  ) : (
    <AllToolsSection
      apps={data.filtered}
      sortOption={data.sortOption}
      isUnfiltered={false}
      heading={data.restHeading}
      bare
    />
  );
}

// Full width, below the browse column.
function SecondarySections({ data }) {
  if (data.empty) return <SubmitCTA />;
  return (
    <>
      {data.isUnfiltered && <GuidedPathsBanner />}
      {data.isUnfiltered && <BrowseByCategorySection />}
      <MaintainerPicksSection apps={data.pickApps} />
      {data.isUnfiltered && <MoreToolsSection />}
      {data.isUnfiltered && <AllToolsReveal />}
      <SubmitCTA />
    </>
  );
}

// Open graph image for the builder tools page.
function MetaData() {
  return (
    <Head>
      <meta
        property="og:image"
        content="https://developers.cardano.org/img/og/og-builder-tools.jpg"
      />
      <meta
        name="twitter:image"
        content="https://developers.cardano.org/img/og/og-builder-tools.jpg"
      />
    </Head>
  );
}

function Showcase() {
  const data = useSectionData();

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <MetaData />
      {/* The hero is the page banner and stays outside the main landmark;
          everything else, including the CTA band ShowcaseSections renders and
          the sticky submit button, belongs inside it. The page had no <main>
          at all before, which left every section outside a landmark. */}
      <ShowcaseHeader />
      <main>
        <div className={clsx("container", styles.browse)}>
          <AppFilterPanel />
          <div className={styles.browseMain}>
            <SearchControls />
            <IntentChips />
            <PrimaryResults data={data} />
          </div>
        </div>
        <SecondarySections data={data} />
        <OpenStickyButton />
      </main>
    </Layout>
  );
}

export default Showcase;

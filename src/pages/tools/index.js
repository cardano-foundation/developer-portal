import React, { useState, useMemo, useCallback, useEffect } from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
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
import { readSearchTags } from "@site/src/components/showcase/ShowcaseTagSelect";
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
  RECENT_APPS_COUNT,
  Categories,
  CategoryList,
  LanguageList,
  InterfaceList,
} from "@site/src/data/builder-tools/showcase";

import styles from "./styles.module.css";

const TITLE = "Builder Tools";
const DESCRIPTION = "Tools to help you build on Cardano";
const HERO_DESCRIPTION =
  "Discover developer tools, SDKs, and libraries for building on Cardano. Smart contracts, transactions, indexing, wallets, and more.";

// NOTE: ShowcaseTagSelect imports prepareUserState from this module — keep it
// exported as a hoisted function declaration.
export function prepareUserState() {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }
  return undefined;
}

function restoreUserState(userState) {
  const { scrollTopPosition, focusedElementId } = userState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };
  document.getElementById(focusedElementId)?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

// Newest tools first (insertion order, last appended = newest).
const recentTools = [...Showcases.slice(-RECENT_APPS_COUNT)].reverse();
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

function readSearchName(search) {
  return new URLSearchParams(search).get(SearchNameQueryKey);
}

function sortProjects(projects, sortOption) {
  if (sortOption === SORT_IDS.ALPHABETICAL) {
    return [...projects].sort((a, b) => a.title.localeCompare(b.title));
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
  return <SiteHero title={TITLE} description={HERO_DESCRIPTION} />;
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
        placeholder="Search builder tools..."
        value={value}
        onInput={handleInput}
      />
    </div>
  );
}

function SearchControls() {
  return (
    <section className={clsx("container", styles.controls)}>
      <SearchBar />
      <div className={styles.controlsRight}>
        <AppFilterPanel />
        <ShowcaseSort />
      </div>
    </section>
  );
}

function HighlightsSection({ apps }) {
  if (apps.length === 0) return null;
  return (
    <section className={clsx("container", styles.section)}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recently added</h2>
        <span className={styles.sectionSubtitle}>
          The newest tools in the directory
        </span>
      </header>
      <AppTileCarousel apps={apps} ariaLabel="Recently added" />
    </section>
  );
}

function GuidedPathsBanner() {
  const paths = [
    { to: "/docs/get-started/", label: "Get started" },
    { to: "/docs/build/smart-contracts/overview", label: "Write smart contracts" },
    { to: "/docs/build/native-tokens/overview", label: "Create native tokens" },
    { to: "/docs/operate-a-stake-pool/", label: "Run a stake pool" },
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
      subtitle="A taste of each category. Maintainer picks first, then a sample of the rest."
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

function AllToolsSection({ apps, sortOption, isUnfiltered, heading }) {
  const visible = useMemo(
    () => (isUnfiltered ? sortProjects(SortedShowcases, sortOption) : apps),
    [isUnfiltered, sortOption, apps]
  );
  return (
    <section className={clsx("container", styles.section)}>
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
      variant="primary"
    />
  );
}

function ShowcaseSections() {
  const { filtered, sortOption, isUnfiltered, selectedTags } =
    useFilteredProjects();

  const filteredSlugs = useMemo(
    () => new Set(filtered.map((a) => a.slug)),
    [filtered]
  );

  const highlightApps = useMemo(
    () =>
      isUnfiltered
        ? recentTools
        : recentTools.filter((a) => filteredSlugs.has(a.slug)),
    [filteredSlugs, isUnfiltered]
  );

  const pickApps = useMemo(
    () =>
      isUnfiltered
        ? maintainerPicks
        : maintainerPicks.filter((a) => filteredSlugs.has(a.slug)),
    [filteredSlugs, isUnfiltered]
  );

  if (filtered.length === 0) {
    return (
      <section className="container margin-top--lg margin-bottom--xl text--center">
        <h2>No result</h2>
      </section>
    );
  }

  const scopeLabel =
    !isUnfiltered && selectedTags.length === 1
      ? Categories[selectedTags[0]]?.label
      : null;
  const restHeading = scopeLabel ? `All ${scopeLabel}` : "All tools";

  return (
    <>
      <HighlightsSection apps={highlightApps} />
      {isUnfiltered && <GuidedPathsBanner />}
      {isUnfiltered ? (
        <BrowseByCategorySection />
      ) : (
        <AllToolsSection
          apps={filtered}
          sortOption={sortOption}
          isUnfiltered={false}
          heading={restHeading}
        />
      )}
      <MaintainerPicksSection apps={pickApps} />
      {isUnfiltered && <MoreToolsSection />}
      {isUnfiltered && <AllToolsReveal />}
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
        content="https://developers.cardano.org/img/og/og-builder-tools.png"
      />
      <meta
        name="twitter:image"
        content="https://developers.cardano.org/img/og/og-builder-tools.png"
      />
    </Head>
  );
}

function Showcase() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <MetaData />
      <ShowcaseHeader />
      <IntentChips />
      <SearchControls />
      <ShowcaseSections />
      <OpenStickyButton />
    </Layout>
  );
}

export default Showcase;

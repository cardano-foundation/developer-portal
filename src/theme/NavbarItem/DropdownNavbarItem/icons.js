/**
 * Inline SVG icons for the mega menu, imported through Docusaurus's SVGR
 * pipeline so they render as React components.
 *
 * Two sets live here:
 *
 * 1. The brand set (static/img/icons/brand/): the two-tone navy-blue and
 *    amber icons exported 2026-09-22 from the design file (Devportal-EXT,
 *    component set "Icons", node 471:1941). They carry their own fills, so
 *    the tile's `currentColor` does not recolor them. File name = key;
 *    design variant names where they differ: package = Variant5,
 *    payments = Icon Temp, people = Talent, eye = CIP, dev = Dev1.
 *
 * 2. The legacy single-color line set (*-solid.svg), which inherits
 *    `currentColor`. Kept for any item without a brand mapping.
 */
import BuildIcon from '@site/static/img/icons/brand/build.svg';
import ChainIcon from '@site/static/img/icons/brand/chain.svg';
import DevIcon from '@site/static/img/icons/brand/dev.svg';
import EthIcon from '@site/static/img/icons/brand/eth.svg';
import ExchangeIcon from '@site/static/img/icons/brand/exchange.svg';
import EyeIcon from '@site/static/img/icons/brand/eye.svg';
import GearIcon from '@site/static/img/icons/brand/gear.svg';
import ListIcon from '@site/static/img/icons/brand/list.svg';
import OverviewIcon from '@site/static/img/icons/brand/overview.svg';
import PackageIcon from '@site/static/img/icons/brand/package.svg';
import PaymentsIcon from '@site/static/img/icons/brand/payments.svg';
import PeopleIcon from '@site/static/img/icons/brand/people.svg';
import ProfileIcon from '@site/static/img/icons/brand/profile.svg';
import SunIcon from '@site/static/img/icons/brand/sun.svg';
import TemplateIcon from '@site/static/img/icons/brand/template.svg';
import WalletIcon from '@site/static/img/icons/brand/wallet.svg';

import BookIcon from '@site/static/img/icons/book-solid.svg';
import BuildingIcon from '@site/static/img/icons/building-solid.svg';
import ChartLineIcon from '@site/static/img/icons/chart-line-solid.svg';
import CodeIcon from '@site/static/img/icons/code-solid.svg';
import HandshakeIcon from '@site/static/img/icons/handshake-solid.svg';
import PeopleGroupIcon from '@site/static/img/icons/people-group-solid.svg';
import PlugIcon from '@site/static/img/icons/plug-solid.svg';
import ScrollIcon from '@site/static/img/icons/scroll-solid.svg';
import ShapesIcon from '@site/static/img/icons/shapes-solid.svg';
import UsersIcon from '@site/static/img/icons/users-solid.svg';
import WrenchIcon from '@site/static/img/icons/wrench-solid.svg';

const icons = {
  // Brand set
  build: BuildIcon,
  chain: ChainIcon,
  dev: DevIcon,
  eth: EthIcon,
  exchange: ExchangeIcon,
  eye: EyeIcon,
  gear: GearIcon,
  list: ListIcon,
  overview: OverviewIcon,
  package: PackageIcon,
  payments: PaymentsIcon,
  people: PeopleIcon,
  profile: ProfileIcon,
  sun: SunIcon,
  template: TemplateIcon,
  wallet: WalletIcon,
  // Legacy line set
  book: BookIcon,
  building: BuildingIcon,
  'chart-line': ChartLineIcon,
  code: CodeIcon,
  handshake: HandshakeIcon,
  'people-group': PeopleGroupIcon,
  plug: PlugIcon,
  scroll: ScrollIcon,
  shapes: ShapesIcon,
  users: UsersIcon,
  wrench: WrenchIcon,
};

export default icons;

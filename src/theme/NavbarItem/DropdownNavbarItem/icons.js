/**
 * Inline SVG icons for the mega menu, imported through Docusaurus's SVGR
 * pipeline so they render as React components and inherit `currentColor`.
 * This replaces the old `<img src>` approach, which could only be recolored
 * with CSS filter chains.
 */
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

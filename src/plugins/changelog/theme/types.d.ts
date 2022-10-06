declare module '@theme/ChangelogPaginator';
declare module '@theme/ChangelogItem';
declare module '@theme/ChangelogItem/Header';
declare module '@theme/ChangelogItem/Header/Author';
declare module '@theme/ChangelogItem/Header/Authors';
declare module '@theme/ChangelogList';

declare module '@theme/Icon/Expand' {
  import type {ComponentProps} from 'react';

  export interface Props extends ComponentProps<'svg'> {
    expanded?: boolean;
  }

  export default function IconExpand(props: Props): JSX.Element;
}

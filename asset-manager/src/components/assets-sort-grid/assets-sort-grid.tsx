import { FC } from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import { TAsset } from '../../types/generated/ctp';
import Grid from '@commercetools-uikit/grid';
import AssetsSortGridItem from '../assets-sort-grid-item/assets-sort-grid-item';

type Props = {
  items: Array<TAsset>;
  listType: string;
  itemPerRow: number;
};

const AssetsSortGrid: FC<Props> = ({ listType, itemPerRow, items }) => {
  return (
    <Grid
      gridGap="16px"
      gridAutoColumns="1fr"
      gridTemplateColumns={`repeat(${
        listType === 'list' ? 1 : itemPerRow
      }, 1fr)`}
    >
      {items.map((value, index) => (
        <AssetsSortGridItem key={`item-${index}`} index={index} value={value} />
      ))}
    </Grid>
  );
};

export default SortableContainer(AssetsSortGrid);

import { FC, useState } from 'react';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  DataTable,
  Stack,
  type DataTableColumnItem,
  type DataTableRowItem,
} from '@commercetools/nimbus';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { TAsset } from '../../types/generated/ctp';

type Selection = 'all' | Set<string | number>;

interface Props {
  items: Array<TAsset>;
  onSelectionChange: (assets: Array<TAsset>) => void;
  onRowClick?: (row: TAsset) => void;
}

const AssetsTable: FC<Props> = ({ items, onSelectionChange, onRowClick }) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [visibleColumns, setVisibleColumns] = useState([
    'key',
    'name',
    'description',
    'url',
  ]);
  const [isCondensed, setIsCondensed] = useState(true);
  const [isTruncated, setIsTruncated] = useState(true);

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const formatLocalizedField = (field: TAsset['descriptionAllLocales']) =>
    formatLocalizedString(
      { name: transformLocalizedFieldToLocalizedString(field ?? []) },
      {
        key: 'name',
        locale: dataLocale,
        fallbackOrder: projectLanguages,
        fallback: NO_VALUE_FALLBACK,
      }
    );

  const columns: Array<DataTableColumnItem<TAsset>> = [
    {
      id: 'key',
      header: 'Key',
      accessor: (row) => row.key || NO_VALUE_FALLBACK,
    },
    {
      id: 'name',
      header: 'Name',
      accessor: (row) => formatLocalizedField(row.nameAllLocales),
    },
    {
      id: 'description',
      header: 'Description',
      accessor: (row) => formatLocalizedField(row.descriptionAllLocales),
    },
    {
      id: 'url',
      header: 'URL',
      accessor: (row) => row.sources.map((source) => source.uri).join(', '),
    },
  ];

  const handleSelectionChange = (keys: Selection) => {
    setSelectedKeys(keys);
    onSelectionChange(
      keys === 'all' ? items : items.filter((item) => keys.has(item.id))
    );
  };

  return (
    <DataTable.Root
      columns={columns}
      rows={items as Array<DataTableRowItem<TAsset>>}
      visibleColumns={visibleColumns}
      onColumnsChange={(updatedColumns) =>
        setVisibleColumns(updatedColumns.map((column) => column.id))
      }
      onSettingsChange={(action) => {
        if (action === 'toggleTextVisibility') {
          setIsTruncated((value) => !value);
        } else if (action === 'toggleRowDensity') {
          setIsCondensed((value) => !value);
        }
      }}
      density={isCondensed ? 'condensed' : 'default'}
      isTruncated={isTruncated}
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      onRowClick={onRowClick}
    >
      <Stack direction="row" justify="flex-end">
        <DataTable.Manager />
      </Stack>
      <DataTable.Table>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Table>
    </DataTable.Root>
  );
};

export default AssetsTable;

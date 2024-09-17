import { useEffect, useState } from 'react';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import DataTable, {
  TColumn,
  useRowSelection,
} from '@commercetools-uikit/data-table';
import {
  TColumnManagerProps,
  TDataTableManagerProps,
} from '@commercetools-uikit/data-table-manager/dist/declarations/src/types';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import { useDataTableSortingState } from '@commercetools-uikit/hooks';
import DataTableManager, {
  UPDATE_ACTIONS,
} from '@commercetools-uikit/data-table-manager';
import { TAsset } from '../../types/generated/ctp';

const initialVisibleColumns: Array<TColumn<TAsset>> = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'url', label: 'URL' },
];

const initialHiddenColumns: Array<TColumn<TAsset>> = [];

const initialColumnsState: Array<TColumn<TAsset>> = [
  ...initialVisibleColumns,
  ...initialHiddenColumns,
];

interface AssetTableProps {
  items: Array<TAsset>;
  onSelectionChange: React.Dispatch<React.SetStateAction<Array<TAsset>>>;
}

const AssetsTable = ({ items, onSelectionChange }: AssetTableProps) => {
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });

  const [tableData, setTableData] = useState({
    columns: initialColumnsState,
    visibleColumnKeys: initialVisibleColumns.map(({ key }) => key),
  });

  const [isCondensed, setIsCondensed] = useState<boolean>(true);
  const [isWrappingText, setIsWrappingText] = useState(false);
  const {
    rows: rowsWithSelection,
    toggleRow,
    selectAllRows,
    deselectAllRows,
    getIsRowSelected,
    getNumberOfSelectedRows,
  } = useRowSelection('checkbox', items);

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const countSelectedRows = getNumberOfSelectedRows();
  const isSelectColumnHeaderIndeterminate =
    countSelectedRows > 0 && countSelectedRows < rowsWithSelection.length;
  const handleSelectColumnHeaderChange =
    countSelectedRows === 0 ? selectAllRows : deselectAllRows;

  const mappedColumns = tableData.columns.reduce(
    (columns, column) => ({
      ...columns,
      [column.key]: column,
    }),
    {}
  );
  const visibleColumns = tableData.visibleColumnKeys.map(
    (columnKey) => mappedColumns[columnKey]
  );

  const columnsWithSelect: Array<TColumn<TAsset>> = [
    {
      key: 'checkbox',
      label: (
        <CheckboxInput
          isIndeterminate={isSelectColumnHeaderIndeterminate}
          isChecked={countSelectedRows !== 0}
          onChange={handleSelectColumnHeaderChange}
        />
      ),
      shouldIgnoreRowClick: true,
      align: 'center',
      renderItem: (row) => (
        <CheckboxInput
          isChecked={getIsRowSelected(row.id)}
          onChange={() => toggleRow(row.id)}
        />
      ),
      disableResizing: true,
    },
    ...visibleColumns,
  ];
  const onSettingChange: TDataTableManagerProps['onSettingsChange'] = (
    action,
    nextValue
  ) => {
    const {
      COLUMNS_UPDATE,
      IS_TABLE_CONDENSED_UPDATE,
      IS_TABLE_WRAPPING_TEXT_UPDATE,
    } = UPDATE_ACTIONS;

    switch (action) {
      case IS_TABLE_CONDENSED_UPDATE: {
        setIsCondensed(nextValue as boolean);
        break;
      }
      case IS_TABLE_WRAPPING_TEXT_UPDATE: {
        setIsWrappingText(nextValue as boolean);
        break;
      }
      case COLUMNS_UPDATE: {
        if (Array.isArray(nextValue)) {
          Array.isArray(nextValue) &&
            setTableData({
              ...tableData,
              columns: tableData.columns.filter((column) =>
                nextValue.includes(column.key)
              ),
              visibleColumnKeys: nextValue,
            });
        }
        break;
      }
      default:
        break;
    }
  };

  const displaySettings = {
    disableDisplaySettings: false,
    isCondensed,
    isWrappingText,
  };

  const columnManager: TColumnManagerProps = {
    areHiddenColumnsSearchable: true,
    disableColumnManager: false,
    visibleColumnKeys: tableData.visibleColumnKeys,
    hideableColumns: tableData.columns,
  };

  useEffect(() => {
    onSelectionChange(
      rowsWithSelection?.filter((row) => getIsRowSelected(row.id))
    );
  }, [countSelectedRows]);

  return (
    <DataTableManager
      columns={columnsWithSelect}
      onSettingsChange={onSettingChange}
      columnManager={columnManager}
      displaySettings={displaySettings}
    >
      <DataTable
        isCondensed
        rows={rowsWithSelection}
        columns={columnsWithSelect}
        itemRenderer={(item, column) => {
          switch (column.key) {
            case 'name':
              return formatLocalizedString(
                {
                  name: transformLocalizedFieldToLocalizedString(
                    item.nameAllLocales ?? []
                  ),
                },
                {
                  key: 'name',
                  locale: dataLocale,
                  fallbackOrder: projectLanguages,
                  fallback: NO_VALUE_FALLBACK,
                }
              );
            case 'description':
              return formatLocalizedString(
                {
                  name: transformLocalizedFieldToLocalizedString(
                    item.descriptionAllLocales ?? []
                  ),
                },
                {
                  key: 'name',
                  locale: dataLocale,
                  fallbackOrder: projectLanguages,
                  fallback: NO_VALUE_FALLBACK,
                }
              );
            case 'url':
              return item.sources.map((source) => source.uri).join(', ');
            default:
              return null;
          }
        }}
        sortedBy={tableSorting.value.key}
        sortDirection={tableSorting.value.order}
        onSortChange={tableSorting.onChange}
      />
    </DataTableManager>
  );
};

export default AssetsTable;

import { CategoryGraphql } from '@commercetools/composable-commerce-test-data/category';
import {
  ProductCatalogDataGraphql,
  ProductDataGraphql,
  ProductGraphql,
  ProductVariantGraphql,
} from '@commercetools/composable-commerce-test-data/product';
import type { TCtpAsset } from '@commercetools/composable-commerce-test-data/graphql-types';

// test-data has no Asset model, so assets are built here in the GraphQL shape
// of the fragments in src/hooks/** and handed to the test-data builders.
const localized = (values: Record<string, string>) =>
  Object.entries(values).map(([locale, value]) => ({
    __typename: 'LocalizedString' as const,
    locale,
    value,
  }));

type TAssetFixture = {
  id: string;
  key?: string | null;
  name: string;
  description?: string;
  uris?: Array<string>;
};

export const buildAsset = ({
  id,
  key = null,
  name,
  description,
  uris = [`https://example.com/${id}.png`],
}: TAssetFixture): TCtpAsset => ({
  __typename: 'Asset',
  id,
  key,
  nameAllLocales: localized({ en: name }),
  descriptionAllLocales: description ? localized({ en: description }) : null,
  tags: [],
  sources: uris.map((uri) => ({
    __typename: 'AssetSource' as const,
    key: null,
    uri,
    contentType: null,
    dimensions: null,
  })),
});

export const buildProduct = ({
  id = 'product-1',
  version = 1,
  assets = [] as Array<TCtpAsset>,
} = {}) =>
  ProductGraphql.random()
    .id(id)
    .version(version)
    .masterData(
      ProductCatalogDataGraphql.random().current(
        ProductDataGraphql.random()
          .masterVariant(
            ProductVariantGraphql.random()
              .id(1)
              .sku('sku-1')
              .key('variant-1')
              .assets(assets)
          )
          .variants([])
      )
    )
    .build();

export const buildCategory = ({
  id = 'category-1',
  version = 1,
  assets = [] as Array<TCtpAsset>,
} = {}) =>
  CategoryGraphql.random()
    .id(id)
    .key('category-key')
    .version(version)
    .assets(assets)
    .build();

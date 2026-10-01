import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import {
  fireEvent,
  screen,
  waitFor,
} from '@commercetools-frontend/application-shell/test-utils';
import { renderAssetManager } from '../../test-utils/render';
import { buildAsset, buildCategory } from '../../test-utils/fixtures';

const mockServer = setupServer();
afterEach(() => mockServer.resetHandlers());
beforeAll(() => {
  // Fail on any query or mutation that a test doesn't mock.
  mockServer.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  mockServer.close();
});

const categoryPath = '/categories/category-1/general';

const withCategory = (category: ReturnType<typeof buildCategory> | null) =>
  graphql.query('FetchCategory', (_req, res, ctx) =>
    res(ctx.data({ category }))
  );

it('should render the assets of the category', async () => {
  mockServer.use(
    withCategory(
      buildCategory({
        assets: [
          buildAsset({ id: 'a1', key: 'banner', name: 'Category banner' }),
          buildAsset({ id: 'a2', name: 'Size chart' }),
        ],
      })
    )
  );

  await renderAssetManager(categoryPath);

  await screen.findByText('Category banner');
  expect(screen.getByText('Size chart')).toBeInTheDocument();
  expect(screen.getByText('banner')).toBeInTheDocument();
});

it('should show a message when the category does not exist', async () => {
  mockServer.use(withCategory(null));

  await renderAssetManager(categoryPath);

  await screen.findByText('Category category-1 was not found in this project.');
});

it('should update a category asset in place instead of re-creating it', async () => {
  let updateVariables: Record<string, unknown> | undefined;
  mockServer.use(
    withCategory(
      buildCategory({
        version: 5,
        assets: [
          buildAsset({ id: 'a1', key: 'banner', name: 'Category banner' }),
        ],
      })
    ),
    graphql.mutation('UpdateCategory', (req, res, ctx) => {
      updateVariables = req.variables;
      return res(
        ctx.data({
          updateCategory: buildCategory({
            version: 6,
            assets: [
              buildAsset({ id: 'a1', key: 'banner', name: 'Hero banner' }),
            ],
          }),
        })
      );
    })
  );

  await renderAssetManager(categoryPath);
  fireEvent.click(await screen.findByText('Category banner'));
  await screen.findByRole('heading', { name: 'Edit asset' });

  fireEvent.change(screen.getByDisplayValue('Category banner'), {
    target: { value: 'Hero banner' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  // The category syncer would send removeAsset + addAsset here, giving the
  // asset a new ID at the end of the list.
  await waitFor(() =>
    expect(updateVariables).toMatchObject({
      id: 'category-1',
      version: 5,
      actions: [
        {
          changeAssetName: {
            name: [{ locale: 'en', value: 'Hero banner' }],
            assetId: 'a1',
          },
        },
      ],
    })
  );
  expect(updateVariables?.actions).toHaveLength(1);
  await screen.findByText('The asset has been updated.');
});

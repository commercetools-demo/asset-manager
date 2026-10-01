import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import {
  fireEvent,
  screen,
  waitFor,
  within,
} from '@commercetools-frontend/application-shell/test-utils';
import { renderAssetManager } from '../../test-utils/render';
import { buildAsset, buildProduct } from '../../test-utils/fixtures';

const mockServer = setupServer();
afterEach(() => mockServer.resetHandlers());
beforeAll(() => {
  // Fail on any query or mutation that a test doesn't mock.
  mockServer.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  mockServer.close();
});

const productPath = '/products/product-1/variants/1/images';

it('should render the assets of the product variant', async () => {
  mockServer.use(
    graphql.query('FetchProduct', (_req, res, ctx) =>
      res(
        ctx.data({
          product: buildProduct({
            assets: [
              buildAsset({ id: 'a1', key: 'manual', name: 'Product manual' }),
              buildAsset({ id: 'a2', key: 'video', name: 'Product video' }),
            ],
          }),
        })
      )
    )
  );

  await renderAssetManager(productPath);

  await screen.findByText('Assets list');
  await screen.findByText('Product manual');
  expect(screen.getByText('Product video')).toBeInTheDocument();
  expect(screen.getByText('manual')).toBeInTheDocument();
});

it('should show a message when the product does not exist', async () => {
  mockServer.use(
    graphql.query('FetchProduct', (_req, res, ctx) =>
      res(ctx.data({ product: null }))
    )
  );

  await renderAssetManager(productPath);

  await screen.findByText('Product product-1 was not found in this project.');
});

it('should show a message when the variant does not exist', async () => {
  mockServer.use(
    graphql.query('FetchProduct', (_req, res, ctx) =>
      res(ctx.data({ product: buildProduct() }))
    )
  );

  await renderAssetManager('/products/product-1/variants/2/images');

  await screen.findByText('Variant 2 was not found on product product-1.');
});

it('should show an empty state when the variant has no assets', async () => {
  mockServer.use(
    graphql.query('FetchProduct', (_req, res, ctx) =>
      res(ctx.data({ product: buildProduct() }))
    )
  );

  await renderAssetManager(productPath);

  await screen.findByText('There are no assets yet.');
});

const withProduct = (product: ReturnType<typeof buildProduct>) =>
  graphql.query('FetchProduct', (_req, res, ctx) => res(ctx.data({ product })));

it('should delete an asset of the variant', async () => {
  let updateVariables: Record<string, unknown> | undefined;
  mockServer.use(
    withProduct(
      buildProduct({
        version: 3,
        assets: [buildAsset({ id: 'a1', name: 'Product manual' })],
      })
    ),
    graphql.mutation('UpdateProduct', (req, res, ctx) => {
      updateVariables = req.variables;
      return res(ctx.data({ updateProduct: buildProduct({ version: 4 }) }));
    })
  );

  await renderAssetManager(productPath);
  await screen.findByText('Product manual');

  fireEvent.click(screen.getByRole('button', { name: 'Delete asset' }));
  await screen.findByText('You are about to delete 1 asset.');
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

  await waitFor(() =>
    expect(updateVariables).toMatchObject({
      id: 'product-1',
      version: 3,
      actions: [
        { removeAsset: { variantId: 1, staged: false, assetId: 'a1' } },
      ],
    })
  );
  await screen.findByText('The asset has been deleted.');
});

it('should rename an asset of the variant in place', async () => {
  let updateVariables: Record<string, unknown> | undefined;
  mockServer.use(
    withProduct(
      buildProduct({
        assets: [
          buildAsset({ id: 'a1', key: 'manual', name: 'Product manual' }),
        ],
      })
    ),
    graphql.mutation('UpdateProduct', (req, res, ctx) => {
      updateVariables = req.variables;
      return res(ctx.data({ updateProduct: buildProduct({ version: 2 }) }));
    })
  );

  await renderAssetManager(productPath);
  fireEvent.click(await screen.findByText('Product manual'));
  await screen.findByRole('heading', { name: 'Edit asset' });

  fireEvent.change(screen.getByDisplayValue('Product manual'), {
    target: { value: 'User guide' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() =>
    expect(updateVariables?.actions).toEqual([
      {
        changeAssetName: {
          name: [{ locale: 'en', value: 'User guide' }],
          variantId: 1,
          assetId: 'a1',
          staged: false,
        },
      },
    ])
  );
  await screen.findByText('The asset has been updated.');
});

it('should create an asset with its source', async () => {
  let updateVariables: Record<string, unknown> | undefined;
  mockServer.use(
    withProduct(buildProduct()),
    graphql.mutation('UpdateProduct', (req, res, ctx) => {
      updateVariables = req.variables;
      return res(ctx.data({ updateProduct: buildProduct({ version: 2 }) }));
    })
  );

  await renderAssetManager(productPath);
  fireEvent.click(await screen.findByRole('button', { name: 'Add an asset' }));
  await screen.findByRole('heading', { name: 'Add asset' });

  // LocalizedField labels its group with the field name and each input with
  // its locale.
  const nameField = screen.getByRole('group', { name: /^Name/ });
  fireEvent.change(within(nameField).getByRole('textbox', { name: 'EN' }), {
    target: { value: 'Product manual' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'URI *' }), {
    target: { value: 'https://example.com/manual.pdf' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() =>
    expect(updateVariables?.actions).toEqual([
      {
        addAsset: {
          variantId: 1,
          staged: false,
          asset: expect.objectContaining({
            name: [{ locale: 'en', value: 'Product manual' }],
            sources: [
              expect.objectContaining({
                uri: 'https://example.com/manual.pdf',
              }),
            ],
          }),
        },
      },
    ])
  );
  await screen.findByText('The asset has been created.');
});

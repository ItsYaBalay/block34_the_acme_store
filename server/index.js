const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  deleteFavorite,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/favorites/", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await deleteFavorite({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [moe, lucy, ethyl, superglue, paper, pen, pencil] = await Promise.all([
    createUser({ username: "moe", password: "s3cr3t" }),
    createUser({ username: "lucy", password: "s3cr3t!" }),
    createUser({ username: "ethyl", password: "shhh" }),
    createProduct({ name: "superglue" }),
    createProduct({ name: "paper" }),
    createProduct({ name: "pen" }),
    createProduct({ name: "pencil" }),
  ]);
  console.log(moe.id);
  console.log(superglue.id);

  const users = await fetchUsers();
  console.log(users);

  const products = await fetchProducts();
  console.log(products);

  const userFavorites = await Promise.all([
    createFavorite({ user_id: moe.id, product_id: superglue.id }),
    createFavorite({ user_id: moe.id, product_id: paper.id }),
    createFavorite({ user_id: ethyl.id, product_id: pen.id }),
    createFavorite({ user_id: lucy.id, product_id: pencil.id }),
  ]);

  console.log(await fetchFavorites(moe.id));
  await deleteFavorite(userFavorites[0].id);
  console.log(await fetchFavorites(moe.id));

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();

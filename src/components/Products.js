import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import "./Products.css";
import Cart from "./Cart";
import { generateCartItemsFrom } from "./Cart";



/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {

  const { enqueueSnackbar } = useSnackbar();

  const [completeProductArray, setCompleteProductArray] = useState([]);
  const [filteredProductArray, setFilteredProductArray] = useState(completeProductArray);
  const [cartItemsArray, setCartItemsArray] = useState([]);
  const [loadingState, setLoadingState] = useState(true);
  const [noProductsFoundCase, setNoProductsFoundCase] = useState(false);

  let timeOutId;


  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */

  const performAPICall = async () => {

    let returnArray = [];

    try {
      const res = await axios.get(`${config.endpoint}/products`);
      returnArray = res.data;
    }
    catch (err) {
      if (err.response) {
        enqueueSnackbar(err.response.data.message, { variant: "error" });
      }
      else {
        enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.", { variant: "error" });
      }
    }

    return returnArray;

  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */

  const performSearch = async (text) => {
    try {
      const res = await axios.get(`${config.endpoint}/products/search?value=${text}`);
      setFilteredProductArray(res.data);
      setNoProductsFoundCase(false);
    }
    catch (err) {
      if (err.response) {
        setNoProductsFoundCase(true);
      }
      else {
        enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.", { variant: "error" });
      }
    }

  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */

  const debounceSearch = (event, debounceTimeout) => {
    clearTimeout(timeOutId);

    timeOutId = setTimeout(() => {
      performSearch(event.target.value)
    }, debounceTimeout);
  };


  const searchBar = (
    <TextField
      className="search-desktop"
      placeholder="Search for items/categories"
      InputProps={{
        style: { width: "100%" },
        endAdornment: (
          <InputAdornment position="end">
            <Search />
          </InputAdornment>
        ),
      }}
      variant="outlined"
      onChange={(event) => { debounceSearch(event, 500) }}
    />
  );


  /**
     * Perform the API call to fetch the user's cart and return the response
     *
     * @param {string} token - Authentication token returned on login
     *
     * @returns { Array.<{ productId: string, qty: number }> | null }
     *    The response JSON object
     *
     * Example for successful response from backend:
     * HTTP 200
     * [
     *      {
     *          "productId": "KCRwjF7lN97HnEaY",
     *          "qty": 3
     *      },
     *      {
     *          "productId": "BW0jAAeDJmlZCF8i",
     *          "qty": 1
     *      }
     * ]
     *
     * Example for failed response from backend:
     * HTTP 401
     * {
     *      "success": false,
     *      "message": "Protected route, Oauth2 Bearer token not found"
     * }
     */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      axios.get(`${config.endpoint}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then((res) => {
          setCartItemsArray(res.data);
          return res.data;
          
        })
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };


  useEffect(() => {
    performAPICall().then(res => {
      setLoadingState(false);
      setCompleteProductArray(res);
      setFilteredProductArray(res);
    });
    fetchCart(localStorage.getItem('token'));
  }, []);


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    let isPresent = false;
    items.forEach((item) => {
      if (item.productId === productId) {
        isPresent = true;
      }

    })
    return isPresent;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {

    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", { variant: 'warning' });
    }
    else if (isItemInCart(items, productId) && options) {
      enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: 'warning' });
    }
    else {

      axios.post(`${config.endpoint}/cart`, {
        'productId': productId,
        'qty': qty
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => {
        setCartItemsArray(res.data);
      });
      
    }

  };


  return (
    <div>
      <Header hasHiddenAuthButtons={true} children={searchBar}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      <Grid container>

        <Grid item className="product-grid" xs={12} md={true}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box className="hero">
                <p className="hero-heading">
                  India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                  to your door step
                </p>
              </Box>
            </Grid>
            {(loadingState || noProductsFoundCase) ? (
              <Grid item xs={12}>
                {noProductsFoundCase ? (
                  <Box className="no-products-box">
                    <SentimentDissatisfied id="sentiment-dissatisfied" />
                    <p>No products found</p>
                  </Box>
                ) : (
                  <Box className="loading-products-box">
                    <CircularProgress id="circular-progress" />
                    <p>Loading Products...</p>
                  </Box>
                )}
              </Grid>
            ) : (filteredProductArray.map((item, index) => {
              return (
                <Grid item xs={6} md={3} key={index}>
                  <ProductCard product={item} handleAddToCart={() => addToCart(localStorage.getItem('token'), cartItemsArray, completeProductArray, item._id, 1, {preventDuplicate: true})} />
                </Grid>)
            }))
            }
          </Grid>
        </Grid>

        {localStorage.getItem('username') !== null && (<Grid item xs={12} md={3} className="cart-background">
          <Cart products={completeProductArray} items={generateCartItemsFrom(cartItemsArray, completeProductArray)} handleQuantity={addToCart} />
        </Grid>)}

      </Grid>
      <br />
      <Footer />
    </div>
  );

};

export default Products;

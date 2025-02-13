## Frontend:

Setup all the boilerplate with:
```sh
npx create-react-app app-name
```

Then install all of your dependencies:
```sh
cd app-name
npm i @mui/material @emotion/react @emotion/styled @mui/x-data-grid formik yup ...
```

After this, there are a number of boilerplate things you can delete:  
- `src/App.css` `src/App.test.js` `src/logo.svg` `src/reportWebVitals.js` `src/setupTests.js`


Start it:  
```sh
npm run start
```

## Backend:

Initialize with:
```sh
npm init -y
```

Install dependencies:
```sh
npm i express cors body-parser dotenv mongoose
```

**Connect Frontend to Backend:**  
Add this to your frontend's `package.json` after "scripts":
```js
"proxy": "http://127.0.0.1:4000",
```

Replace "scripts" in backend's package.json with:
```js
"scripts": {
    "start": "node index.js"
},
```

Start it:
```sh
npm start
```
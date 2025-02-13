# How to link up a React app With Mongo

Install a Mongo Docker container (see [here](../Docker/mongoDB_ina_container.md))

```sh
docker exec -it mongo-db mongosh
mongosh> use mydatabasename # this will create a new database "mydatabasename"
mongosh> db.createCollection("contacts")
```

Insert an element in the MongoDB shell:  
```JS
db.contacts.insertOne({id: 1, name: "Scott", email: "scott@scott.com", age: 24, phone: "917-603-0631", access: "admin"})
```

Your frontend will need axios:
```sh
npm install axios
```

Your backend will need mongoose:
```sh
npm install mongoose
```


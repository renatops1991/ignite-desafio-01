const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "Username not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const usersCreate = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(usersCreate);

  return response.status(201).json(usersCreate);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const createTodos = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(createTodos);

  return response.status(201).json(createTodos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoAlereadyExists = user.todos.find((todo) => todo.id === id);

  if (!todoAlereadyExists) {
    return response.status(404).json({ error: "Task not found" });
  }

  todoAlereadyExists.title = title;
  todoAlereadyExists.deadline = new Date(deadline);

  return response.json(todoAlereadyExists);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoAlereadyExists = user.todos.find((todo) => todo.id === id);

  if (!todoAlereadyExists) {
    return response.status(404).json({ error: "Task not found" });
  }

  todoAlereadyExists.done = true;

  return response.json(todoAlereadyExists);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoAlereadyExists = user.todos.find((todo) => todo.id === id);

  if (!todoAlereadyExists) {
    return response.status(404).json({ error: "Task not found" });
  }

  user.todos.splice(todoAlereadyExists, 1);

  return response.status(204).send();
});

module.exports = app;

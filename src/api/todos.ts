import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 1621;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const createTodo = (newTodo: Omit<Todo, 'id'>) => {
  return client.post<Todo>(`/todos`, newTodo);
};

export const deleteTodo = (todoId: number) => {
  return client.delete(`/todos/${String(todoId)}`);
};

export const updateTodo = ({ id, title, completed, userId }: Todo) => {
  return client.patch(`/todos/${id}`, { title, completed, userId });
};

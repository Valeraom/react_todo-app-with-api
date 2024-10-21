import { useCallback, useEffect, useMemo, useState } from 'react';
import { Todo } from '../types/Todo';
import * as todosService from '../api/todos';
import { getCompletedTodos } from '../utils/getCompletedTodos';
import { getActiveTodos } from '../utils/getActiveTodos';
import { FilterType } from '../types/FilterType';
import { filterTodos } from '../utils/filterTodos';
import debounce from 'lodash.debounce';
import { areAllActive } from '../utils/areAllActive';
import { areAllCompleted } from '../utils/areAllCompleted';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<FilterType>('All');
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const setErrorDebounced = useCallback(debounce(setErrorMessage, 3000), []);

  const handleAddError = (error: string) => {
    setErrorMessage(error);
    setErrorDebounced('');
  };

  const addTodo = (newTodo: Omit<Todo, 'id'>) => {
    const newTempTodo = { ...newTodo, id: 0 };

    setTempTodo(newTempTodo);
    setLoadingTodoIds(current => [...current, newTempTodo.id]);

    return todosService
      .createTodo(newTodo)
      .then(todo => {
        setTodos(currentTodos => [...currentTodos, todo]);
      })
      .catch((error: Error) => {
        handleAddError('Unable to add a todo');

        throw error;
      })
      .finally(() => {
        setLoadingTodoIds(current =>
          current.filter(loadingTodoId => loadingTodoId !== newTempTodo.id),
        );
        setTempTodo(null);
      });
  };

  const deleteTodo = (todoId: number) => {
    setLoadingTodoIds(current => [...current, todoId]);

    return todosService
      .deleteTodo(todoId)
      .then(() =>
        setTodos(current => current.filter(todo => todo.id !== todoId)),
      )
      .catch((error: Error) => {
        handleAddError('Unable to delete a todo');

        throw error;
      })
      .finally(() =>
        setLoadingTodoIds(current =>
          current.filter(loadingTodoId => loadingTodoId !== todoId),
        ),
      );
  };

  const deleteCompletedTodo = () => {
    const completedTodoIds = getCompletedTodos(todos).map(todo => todo.id);

    Promise.allSettled(completedTodoIds.map(todoId => deleteTodo(todoId)));
  };

  const updateTodo = (updatedTodo: Todo) => {
    const { id } = updatedTodo;

    setLoadingTodoIds(current => [...current, id]);

    return todosService
      .updateTodo(updatedTodo)
      .then(() => {
        setTodos(current => {
          const newTodos = [...current];

          const index = newTodos.findIndex(todo => todo.id === id);

          newTodos.splice(index, 1, updatedTodo);

          return newTodos;
        });
      })
      .catch((error: Error) => {
        handleAddError('Unable to update a todo');

        throw error;
      })
      .finally(() => {
        setLoadingTodoIds(current =>
          current.filter(loadingTodoId => loadingTodoId !== id),
        );
      });
  };

  const toggleAll = () => {
    const preparedTodos =
      areAllActive(todos) || areAllCompleted(todos)
        ? todos
        : getActiveTodos(todos);

    Promise.allSettled(
      preparedTodos.map(todo => {
        const { id, title, completed, userId } = todo;

        const updatedTodo = {
          id,
          title,
          completed: !completed,
          userId,
        };

        updateTodo(updatedTodo);
      }),
    );
  };

  const filteredTodos = useMemo(
    () => filterTodos(todos, { filter }),
    [todos, filter],
  );

  const loadTodos = () => {
    todosService
      .getTodos()
      .then(setTodos)
      .catch(() => handleAddError('Unable to load todos'));
  };

  useEffect(loadTodos, []);

  return {
    todos,
    tempTodo,
    loadingTodoIds,
    errorMessage,
    setErrorMessage,
    handleAddError,
    addTodo,
    deleteTodo,
    deleteCompletedTodo,
    updateTodo,
    filteredTodos,
    filter,
    setFilter,
    toggleAll,
  };
};

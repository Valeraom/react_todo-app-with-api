import { ChangeEvent, FC, FormEvent, useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import { Todo } from '../types/Todo';
import { USER_ID } from '../api/todos';

type Props = {
  onSubmit: (newTodo: Omit<Todo, 'id'>) => Promise<void>;
  onSetError: (error: string) => void;
  areAllCompleted: boolean;
  isLoading: boolean;
  todos: Todo[];
  errorMessage: string;
  onToggleAll: () => void;
};

export const TodoForm: FC<Props> = ({
  onSubmit,
  onSetError,
  areAllCompleted,
  isLoading,
  todos,
  errorMessage,
  onToggleAll,
}) => {
  const [todoTitle, setTodoTitle] = useState('');

  const titleField = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    if (titleField.current) {
      titleField.current.focus();
    }
  };

  useEffect(handleFocus, [todos, errorMessage]);

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSetError('');

    setTodoTitle(event.target.value.trimStart());
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!todoTitle.length) {
      onSetError('Title should not be empty');

      return;
    }

    onSetError('');

    const newTodo = {
      completed: false,
      title: todoTitle.trim(),
      userId: USER_ID,
    };

    onSubmit(newTodo)
      .then(() => setTodoTitle(''))
      .finally(handleFocus);
  };

  return (
    <header className="todoapp__header">
      {!!todos.length && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', { active: areAllCompleted })}
          data-cy="ToggleAllButton"
          onClick={onToggleAll}
        />
      )}

      <form onSubmit={handleSubmit}>
        <input
          ref={titleField}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          disabled={isLoading}
          value={todoTitle}
          onChange={handleTitleChange}
        />
      </form>
    </header>
  );
};

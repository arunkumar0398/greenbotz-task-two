import * as React from 'react';
import './todo-results.scss';
import { TodosContext } from '../../todo-context';

export const TodoResults = () => {
  const { todos, setTodos } = React.useContext(TodosContext);
  const calculateChecked = () => {
    // Fix an ability to calculate completed tasks
    const checkedTodos = todos.filter((todo) => todo.checked === true).length;
    return checkedTodos;
  };

  return (
    <div className="todo-results">
      Done:
      <span className="todo-results-count">
        {calculateChecked()}
      </span>
    </div>
  );
};

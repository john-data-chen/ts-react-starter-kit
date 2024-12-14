import { useEffect } from "react";
import { ThemeProvider } from "styled-components";
import TodoForm from "./component/TodoForm";
import TodoList from "./component/TodoList";
import { lightTheme, darkTheme, GlobalStyles } from "./theme/ThemeSets";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  addTodo,
  editTodo,
  deleteTodo,
  handleDragEnd,
  toggleComplete,
} from "./redux/todoSlice";
import { switchTheme } from "./redux/themeSlice";
import ThemeToggle from "./component/ThemeToggle";
import LanguageSelector from "./component/LanguageSelector";
import { RootState } from "./redux/store";

function App() {
  const todosSelector = useSelector((state: RootState) => state.todos.todos);
  const todoList = todosSelector;
  console.log(todoList);

  const themeSelector = useSelector(
    (state: {
      theme: {
        mode: "dark" | "light";
      };
    }) => state.theme.mode
  );
  const languageSelector = useSelector(
    (state: {
      language: {
        code: string;
      };
    }) => state.language.code
  );

  const dispatch = useDispatch();
  const isDarkMode = themeSelector === "dark";
  const handleSwitchTheme = () => {
    dispatch(switchTheme());
  };
  const { i18n, t } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(languageSelector);
  }, [i18n, languageSelector]);

  const handleAddTodo = (text: string, dueDate: Date | null) => {
    const dueDateStr = dueDate ? dueDate.toISOString() : null;
    dispatch(addTodo({ text, dueDate: dueDateStr }));
  };

  const onDragEnd = (event: DropResult) => {
    const { source, destination } = event;
    if (!destination) return;
    const newTodos = [...todoList];
    const [removed] = newTodos.splice(source.index, 1);
    newTodos.splice(destination.index, 0, removed);
    dispatch(handleDragEnd(newTodos));
  };

  const handleToggleComplete = (id: string) => {
    dispatch(toggleComplete(id));
  };

  const handleDeleteTodo = (id: string) => {
    dispatch(deleteTodo(id));
  };

  const handleEditTodo = (id: string, text: string, dueDate: Date | null) => {
    const dueDateStr = dueDate ? dueDate.toISOString() : "";
    dispatch(editTodo({ id, text, dueDate: dueDateStr }));
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyles />
      <div className="appContainer">
        <div className="topContainer">
          <ThemeToggle
            switchTheme={handleSwitchTheme}
            isDarkMode={isDarkMode}
          />
          <LanguageSelector />
        </div>
        <h1 className="appTitle">{t("app-title")}</h1>
        <TodoForm addTodo={handleAddTodo} />
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="drop-id">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {todoList.map((todo, i) => (
                  <div key={todo.id}>
                    <Draggable draggableId={todo.id} index={i} key={todo.id}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          {
                            <TodoList
                              todos={[todo]}
                              key={todo.id}
                              toggleComplete={handleToggleComplete}
                              deleteTodo={handleDeleteTodo}
                              handleEditTodo={handleEditTodo}
                            />
                          }
                        </div>
                      )}
                    </Draggable>
                  </div>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </ThemeProvider>
  );
}

export default App;

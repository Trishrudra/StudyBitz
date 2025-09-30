import React, { useState, useEffect } from "react";
import "../global.css";
import "./main.css";
import { ref, onValue, update, set, get } from "firebase/database";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const TODO_LIST_CHECK_CHANGE = 10;

function Main() {
  const [XP, setXP] = useState(0);
  const [TaskCount, setTaskCount] = useState(0);
  const [todoList, setTodoList] = useState([]);
  const [kanban, setKanban] = useState({
    not_started: [],
    in_progress: [],
    done: [],
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [theme, setTheme] = useState("default");

  // Inputs for adding new tasks
  const [newTaskName, setNewTaskName] = useState("");
  const [newKanbanTask, setNewKanbanTask] = useState("");

  function declareDefaults() {
    setXP(0);
    setTaskCount(0);
    setTodoList([]);
    setKanban({ not_started: [], in_progress: [], done: [] });
    setTheme("default");
    console.log("Defaults applied");
  }

  // Load data from Firebase
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const dataRef = ref(db, `users/${user.uid}`);

        const unsubscribeData = onValue(
          dataRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val();

              setXP(userData.xp ?? 0);
              setTaskCount(userData.task_count ?? 0);
              setTodoList(userData.tasks ?? []);

              setKanban({
                not_started: userData.kanban?.not_started ?? [],
                in_progress: userData.kanban?.in_progress ?? [],
                done: userData.kanban?.done ?? [],
              });

              setTheme(userData.theme ?? "default");
              console.log("Fetched:", userData);
            } else {
              declareDefaults();
            }
          },
          (error) => {
            console.error("Error fetching data:", error);
          }
        );

        return () => unsubscribeData();
      } else {
        declareDefaults();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // XP handling
  function change(amount) {
    const user = auth.currentUser;
    if (!user) return;

    setXP((prevXP) => {
      const newXP = prevXP + amount;
      update(ref(db, "users/" + user.uid), { xp: newXP });
      return newXP;
    });
  }

  function incrementTaskCount() {
    const user = auth.currentUser;
    if (!user) return;

    setTaskCount((prevCount) => {
      const newCount = prevCount + 1;
      update(ref(db, "users/" + user.uid), { task_count: newCount });
      return newCount;
    });
  }

  // Toggle daily task done
  function boxCheck(item2, index) {
    const newList = todoList.map((item, i) =>
      i === index ? { ...item, done: !item.done } : item
    );
    setTodoList(newList);

    const user = auth.currentUser;
    if (user) {
      set(ref(db, "users/" + user.uid + "/tasks"), newList);
    }

    const updatedItem = newList[index];
    if (updatedItem.done) {
      change(TODO_LIST_CHECK_CHANGE);
      incrementTaskCount();
    } else {
      change(-TODO_LIST_CHECK_CHANGE);
    }
  }

  // Add new daily task
  function addTask() {
    const user = auth.currentUser;
    if (!user || newTaskName.trim() === "") return;

    const newTask = { name: newTaskName.trim(), done: false };
    const newList = [...todoList, newTask];

    setTodoList(newList);
    setNewTaskName("");
    set(ref(db, "users/" + user.uid + "/tasks"), newList).catch((error) =>
      console.error("Error setting new task:", error)
    );
  }

  // Delete all daily tasks
  function deleteAllTodos() {
    const user = auth.currentUser;
    if (!user) return;

    if (!window.confirm("Delete ALL daily tasks?")) return;

    setTodoList([]);
    set(ref(db, "users/" + user.uid + "/tasks"), []).catch((error) =>
      console.error("Error deleting all tasks:", error)
    );
  }

  // Clear Kanban Done tasks
  async function clearKanbanDoneTasks() {
    const user = auth.currentUser;
    if (!user) return;
    if (kanban.done.length === 0) return;

    if (
      !window.confirm(
        `Clear the ${kanban.done.length} tasks in the 'DONE' column?`
      )
    )
      return;

    const kanbanRef = ref(db, `users/${user.uid}/kanban`);
    const newKanban = { ...kanban, done: [] };

    setKanban(newKanban);
    await update(kanbanRef, { done: [] }).catch((error) =>
      console.error("Error clearing done Kanban tasks:", error)
    );
  }

  // Add new Kanban task to not_started
  function addKanbanTask() {
    const user = auth.currentUser;
    if (!user || newKanbanTask.trim() === "") return;

    const newList = [...kanban.not_started, newKanbanTask.trim()];
    const updatedKanban = { ...kanban, not_started: newList };

    setKanban(updatedKanban);
    setNewKanbanTask("");

    update(ref(db, "users/" + user.uid + "/kanban"), {
      not_started: newList,
    }).catch((error) => console.error("Error adding Kanban task:", error));
  }

  // Move tasks in Kanban
  async function handleKankan(from, to, item, xp) {
    const user = auth.currentUser;
    if (!user) return;

    const kanbanRef = ref(db, `users/${user.uid}/kanban`);
    const snapshot = await get(kanbanRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const fromList = (data[from] || []).filter((t) => t !== item);
      const toList = [...(data[to] || []), item];

      const newKanban = {
        not_started: data.not_started || [],
        in_progress: data.in_progress || [],
        done: data.done || [],
        [from]: fromList,
        [to]: toList,
      };

      await set(kanbanRef, newKanban);
      setKanban(newKanban);
      change(xp);
    }
  }

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleTime(date) {
    let [hour, minutes, seconds] = date.toTimeString().split(" ")[0].split(":");
    hour = parseInt(hour, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    if (hour > 12) hour -= 12;
    return `${hour}:${minutes}:${seconds} ${suffix}`;
  }

  return (
    <div className={`nata main theme_${theme}`}>
      <header>
        <h1 className="heading">StudyBitz</h1>
        <section className="stats">
          <p className="current_xp">XP: {XP}</p>
          <p className="current_tasks">Tasks Completed: {TaskCount}</p>
        </section>
        <button onClick={() => (document.location = "/rewards")}>
          REWARDS
        </button>
        <button onClick={() => (document.location = "/settings")}>
          Settings
        </button>
      </header>

      <main>
        {/* Daily Tasks */}
        <section className="todo_list">
          <div className="todo_header_and_delete">
            <p className="todo_list_heading">Daily To-Do List</p>
            <button
              onClick={deleteAllTodos}
              className="delete_all_todos_button"
              disabled={todoList.length === 0}
            >
              Clear All
            </button>
          </div>

          <div className="add_todo_item">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Add new daily task"
              className="new_task_input"
            />
            <button onClick={addTask} className="add_task_button">
              +
            </button>
          </div>

          {todoList.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => boxCheck(item, index)}
              style={{
                backgroundColor: item.done
                  ? "oklch(95% 0.052 163.051)"
                  : "oklch(88.5% 0.062 18.334)",
              }}
              className="todo_list_item_container"
            >
              {item.name}
            </div>
          ))}
        </section>

        {/* Clock */}
        <section className="datetime">
          <h1>{handleTime(currentDate)}</h1>
        </section>

        {/* Big Tasks / Kanban */}
        <section className="big_tasks">
          <p className="big_tasks_heading">Big Tasks Planner</p>

          {/* Add new Kanban task */}
          <div className="add_kanban_task">
            <input
              type="text"
              value={newKanbanTask}
              onChange={(e) => setNewKanbanTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKanbanTask()}
              placeholder="Add new big task"
              className="new_task_input"
            />
            <button onClick={addKanbanTask} className="add_task_button">
              +
            </button>
          </div>

          <button
            onClick={clearKanbanDoneTasks}
            className="clear_kanban_done_button"
            disabled={kanban.done.length === 0}
          >
            Clear Completed Tasks ({kanban.done.length})
          </button>

          <div className="big_tasks_container">
            {["not_started", "in_progress", "done"].map((column) => (
              <article
                key={column}
                className={`big_tasks_container_mini ${column}`}
              >
                <p className="big_tasks_head">{column.replace("_", " ")}</p>
                <div className="tasks">
                  {(kanban[column] || []).map((item) => (
                    <div key={item} className={`big_tasks_item ${column}2`}>
                      <button
                        className="task_move"
                        onClick={() =>
                          handleKankan(
                            column,
                            column === "not_started"
                              ? "done"
                              : column === "in_progress"
                              ? "not_started"
                              : "in_progress",
                            item,
                            column === "not_started"
                              ? 100
                              : column === "in_progress"
                              ? -25
                              : -75
                          )
                        }
                      >
                        &larr;
                      </button>
                      <p className="task_name">{item}</p>
                      <button
                        className="task_move"
                        onClick={() =>
                          handleKankan(
                            column,
                            column === "not_started"
                              ? "in_progress"
                              : column === "in_progress"
                              ? "done"
                              : "not_started",
                            item,
                            column === "not_started"
                              ? 25
                              : column === "in_progress"
                              ? 75
                              : -100
                          )
                        }
                      >
                        &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Main;

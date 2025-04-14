import { CreateItemForm, EditableSpan } from "@/common/components"
import { todolistsApi } from "@/features/todolists/api/todolistsApi"
import type { Todolist } from "@/features/todolists/api/todolistsApi.types"
import { type ChangeEvent, type CSSProperties, useEffect, useState } from "react"
import Checkbox from "@mui/material/Checkbox"
import { tasksApi } from "@/features/todolists/api/tasksApi"
import { DomainTask, UpdateTaskModel } from "@/features/todolists/api/tasksApi.types"
import { error } from "console"
import { TaskStatus } from "@/common/enums/enums"

export const AppHttpRequests = () => {
  const [todolists, setTodolists] = useState<Todolist[]>([])
  const [tasks, setTasks] = useState<Record<string, DomainTask[]>>({})

  useEffect(() => {
    todolistsApi.getTodolists().then((res) => setTodolists(res.data))
  }, [])

  const createTodolist = (title: string) => {
    todolistsApi.createTodolist(title).then((res) => {
      const newTodolist = res.data.data.item
      setTodolists([newTodolist, ...todolists])
    })
  }

  const deleteTodolist = (id: string) => {
    todolistsApi.deleteTodolist(id).then(() => setTodolists(todolists.filter((todolist) => todolist.id !== id)))
  }

  const changeTodolistTitle = (id: string, title: string) => {
    todolistsApi.changeTodolistTitle({ id, title }).then(() => {
      setTodolists(todolists.map((todolist) => (todolist.id === id ? { ...todolist, title } : todolist)))
    })
  }

  // tasks
  // useEffect(() => {
  //   todolistsApi.getTodolists().then((res) => {
  //     const todolists = res.data
  //     setTodolists(todolists)
  //     todolists.forEach((todolist) => {
  //       tasksApi.getTasks(todolist.id).then((res) => {
  //         setTasks({ ...tasks, [todolist.id]: res.data.items })
  //       })
  //     })
  //   })
  // }, [])
  useEffect(() => {
    // Загружаем тудулисты
    todolistsApi.getTodolists().then((res) => {
      const todolists = res.data
      setTodolists(todolists)

      // Загружаем задачи для каждого тудулиста
      const loadTasksPromises = todolists.map((todolist) =>
        tasksApi.getTasks(todolist.id).then((res) => ({
          todolistId: todolist.id,
          tasks: res.data.items,
        })),
      )

      // Ждем завершения всех запросов
      Promise.all(loadTasksPromises).then((results) => {
        const updatedTasks: Record<string, DomainTask[]> = {} // Создаем пустой объект

        // Добавляем задачи для каждого тудулиста
        results.forEach(({ todolistId, tasks }) => {
          updatedTasks[todolistId] = tasks // Добавляем задачи в объект
        })

        // Обновляем состояние задач
        setTasks((prevTasks) => ({
          ...prevTasks,
          ...updatedTasks,
        }))
      })
    })
  }, [])

  const createTask = (todolistId: string, title: string) => {
    tasksApi
      .createTask({ todolistId, title }) // Запрос на создание таски
      .then((res) => {
        const newTask = res.data.data.item // Новая таска из ответа API

        // Обновляем состояние таски
        setTasks((prevTasks) => ({
          ...prevTasks,
          [todolistId]: [newTask, ...(prevTasks[todolistId] || [])],
        }))
      })
      .catch((error) => {
        console.error("Ошибка при создании таски: ", error)
      })
  }

  const deleteTask = (todolistId: string, taskId: string) => {
    tasksApi
      .deleteTask({ todolistId, taskId })
      .then(() => {
        setTasks({
          ...tasks,
          [todolistId]: tasks[todolistId].filter((task) => task.id !== taskId),
        })
      })
      .catch((error) => {
        console.error("Ошибка при удалении таски: ", error)
      })
  }

  const changeTaskStatus = (e: ChangeEvent<HTMLInputElement>, task: DomainTask) => {
    const todolistId = task.todoListId

    // Создаем модель для обновления задачи
    const model: UpdateTaskModel = {
      description: task.description,
      title: task.title,
      priority: task.priority,
      startDate: task.startDate,
      deadline: task.deadline,
      status: e.target.checked ? TaskStatus.Completed : TaskStatus.New,
      // Новый статус: 2 - Completed (выполнено) или 0 - New (не выполнено)
    }

    // Отправляем запрос на сервер для обновления задачи
    tasksApi
      .updateTask({ todolistId, taskId: task.id, model })
      .then(() => {
        // Обновляем локальное состояние задач
        setTasks((prevTasks) => ({
          ...prevTasks,
          [todolistId]: prevTasks[todolistId].map((t) => (t.id === task.id ? { ...t, status: model.status } : t)),
        }))
      })
      .catch((error) => {
        console.error("Ошибка при обновлении статуса таски: ", error)
      })
  }

  const changeTaskTitle = (task: DomainTask, title: string) => {
    const todolistId = task.todoListId

    tasksApi
      .changeTaskTitle({ todolistId, taskId: task.id, title })
      .then(() => {
        setTasks({
          ...tasks,
          [todolistId]: tasks[todolistId].map((t) => (t.id == task.id ? { ...t, title } : t)),
        })
      })
      .catch((error) => {
        console.error("Ошибка при обновлении title таски: ", error)
      })
  }

  return (
    <div style={{ margin: "20px" }}>
      <CreateItemForm onCreateItem={createTodolist} />
      {todolists.map((todolist) => (
        <div key={todolist.id} style={container}>
          <div>
            <EditableSpan value={todolist.title} onChange={(title) => changeTodolistTitle(todolist.id, title)} />
            <button onClick={() => deleteTodolist(todolist.id)}>x</button>
          </div>
          <CreateItemForm onCreateItem={(title) => createTask(todolist.id, title)} />
          {tasks[todolist.id]?.map((task) => (
            <div key={task.id}>
              <Checkbox checked={task.status === TaskStatus.Completed} onChange={(e) => changeTaskStatus(e, task)} />
              <EditableSpan value={task.title} onChange={(title) => changeTaskTitle(task, title)} />
              <button onClick={() => deleteTask(todolist.id, task.id)}>x</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const container: CSSProperties = {
  border: "1px solid black",
  margin: "20px 0",
  padding: "10px",
  width: "330px",
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "column",
}

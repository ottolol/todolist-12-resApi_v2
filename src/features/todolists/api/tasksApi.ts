import { instance } from "@/common/instance"
import { DomainTask, GetTasksResponse, UpdateTaskModel } from "./tasksApi.types"

export const tasksApi = {
  getTasks(todolistId: string) {
    return instance.get<GetTasksResponse>(`/todo-lists/${todolistId}/tasks`)
  },
  createTask(payload: { todolistId: string; title: string }) {
    const { todolistId, title } = payload
    return instance.post<DomainTask>(`/todo-lists/${todolistId}/tasks`, { title })
  },
  deleteTask(payload: { todolistId: string; taskId: String }) {
    const { todolistId, taskId } = payload
    return instance.delete<UpdateTaskModel>(`/todo-lists/${todolistId}/tasks/${taskId}`)
  },
  updateTask(payload: { todolistId: string; taskId: string; model: UpdateTaskModel }) {
    const { todolistId, taskId, model } = payload
    return instance.put<UpdateTaskModel>(`/todo-lists/${todolistId}/tasks/${taskId}`, { model })
  },
  changeTaskTitle(payload: { todolistId: string; taskId: string; title: string }) {
    const { todolistId, taskId, title } = payload
    return instance.put<UpdateTaskModel>(`/todo-lists/${todolistId}/tasks/${taskId}`, { title })
  },
}

<template>
	<section class="todo">
		<div class="input-group mb-3">
			<div class="input-group-prepend">
				<span class="input-group-text" id="basic-addon1">待辦事項</span>
			</div>
			<input
				type="text"
				class="form-control"
				placeholder="準備要做的任務"
				v-model="newTodo"
				@keyup.enter="addTodo"
			/>
			<div class="input-group-append">
				<button class="btn btn-primary" type="button" @click="addTodo">
					新增
				</button>
			</div>
		</div>
		<div class="card text-center">
			<div class="card-header">
				<ul class="nav nav-tabs card-header-tabs">
					<li class="nav-item">
						<a
							class="nav-link"
							:class="{ active: visibility == 'all' }"
							@click="visibility = 'all'"
							href="#"
							>全部</a
						>
					</li>
					<li class="nav-item">
						<a
							class="nav-link"
							:class="{ active: visibility == 'active' }"
							@click="visibility = 'active'"
							href="#"
							>進行中</a
						>
					</li>
					<li class="nav-item">
						<a
							class="nav-link"
							:class="{ active: visibility == 'completed' }"
							@click="visibility = 'completed'"
							href="#"
							>已完成</a
						>
					</li>
				</ul>
			</div>
			<ul class="list-group list-group-flush text-left">
				<li
					class="list-group-item"
					v-for="item in filterTodos"
					v-bind:key="item.id"
					@dblclick="edit(item)"
				>
					<!-- 正常狀況都沒點擊的話，editTodo為空的物件，item.id !== editTodo.id 自然為True -->
					<div class="d-flex" v-if="item.id !== editTodo.id">
						<div class="form-check flex-grow-1 d-flex align-items-center">
							<input
								type="checkbox"
								class="form-check-input"
								:id="item.id"
								v-model="item.completed"
							/>
							<label
								class="form-check-label ms-3"
								:class="{ completed: item.completed }"
								:for="item.id"
							>
								{{ item.task }}
							</label>
						</div>
						<div class="d-flex align-items-center">
							<p class="mb-0 me-1">{{ item.created_at }}</p>
							<button
								type="button"
								class="btn-close"
								aria-label="Close"
								@click="removeTodo(item)"
							>
								<!-- <span aria-hidden="true">&times;</span> -->
							</button>
						</div>
					</div>
					<input
						type="text"
						class="form-control"
						v-if="item.id == editTodo.id"
						@keyup.esc="cancelEdit()"
						@keyup.enter="doneEdit(item)"
						v-model="editTodo.task"
					/>
				</li>
				<!-- <li class="list-group-item">
                  <input type="text" class="form-control" />
                </li> -->
			</ul>
			<!-- <div class="card-footer d-flex justify-content-between">
				<span>還有 3 筆任務未完成</span>
				<a href="#">清除所有任務</a>
			</div> -->
		</div>
	</section>
</template>

<script>
	import gql from "graphql-tag";
	import moment from "moment";

	const GET_TODOS = gql`
		query getMyTodos {
			todo_list(order_by: { created_at: desc }, limit: 10) {
				id
				created_at
				task
			}
		}
	`;
	const ADD_TODO = gql`
		mutation ($todo: String!) {
			insert_todo_list(objects: { task: $todo }) {
				affected_rows
				returning {
					id
					task
					created_at
				}
			}
		}
	`;

	// const REMOVE_TODO = gql`
	// 	mutation removeTodo($id: Int!) {
	// 		delete_todo_list(where: { id: { _eq: $id } }) {
	// 			affected_rows
	// 		}
	// 	}
	// `;
	export default {
		name: "TodoList",
		// props: {
		// 	msg: String,
		// },
		data() {
			return {
				newTodo: "",
				todos: [],
				editTodo: {},
				editTask: "",
				visibility: "all",
			};
		},
		methods: {
			addTodo() {
				//使用者輸入內容
				//trim()刪除空白
				let value = this.newTodo.trim();
				//id
				let timesTamp = Math.floor(Date.now());
				//如果空白，則不能新增
				if (!value) {
					return;
				}
				//console.log(value, timesTamp);
				// 新增物件進todos
				this.todos.push({
					id: timesTamp,
					task: value,
					completed: false,
				});
				this.$apollo.mutate({
					mutation: ADD_TODO,
					variables: {
						todo: value,
					},
					update: (cache, { data: { insert_todo_list } }) => {
						// Read the data from our cache for this query.
						// eslint-disable-next-line
						console.log(insert_todo_list);
					},
				});
				//輸入後清除
				this.newTodo = "";
			},

			removeTodo(item) {
				let newIndex = this.todos.findIndex(function (task) {
					return item.id === task.id;
				});

				this.todos.splice(newIndex, 1);
			},

			edit(item) {
				console.log(item);
				this.editTodo = item;
				this.editTask = item.task;
			},

			cancelEdit() {
				this.editTodo = {};
			},

			doneEdit(item) {
				item.task = this.editTodo.task;
				this.editTask = ""; //輸入完清空
				this.editTodo = {};
				//沒有雙擊任何一個todo的狀況下，editTodo本來就是空的，雙擊後才會出現input，所以在input編輯完後，要跳回原本checkbox的樣子，要回到editTodo是空的狀態。
			},
		},
		computed: {
			//過濾後的todos
			filterTodos() {
				let activeTodos = [];
				if (this.visibility == "all") {
					activeTodos = this.todos;
				} else if (this.visibility == "active") {
					this.todos.forEach(function (item) {
						if (item.completed == false) {
							activeTodos.push(item);
						}
					});
				} else if (this.visibility == "completed") {
					this.todos.forEach(function (item) {
						if (item.completed == true) {
							activeTodos.push(item);
						}
					});
				}
				return activeTodos;
			},
		},
		mounted() {
			this.$apollo
				.query({
					query: GET_TODOS,
				})
				.then((data) => {
					// console.log(data.data.todo_list);
					let todoList = data.data.todo_list;
					todoList.forEach((todo) => {
						//console.log(todo.created_at);
						todo.completed = false;
						todo.created_at = moment(todo.created_at).format("Y-M-D");
					});

					this.todos = data.data.todo_list;
				});
		},
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.todo {
		max-width: 600px;
		margin: 0 auto;
	}
	.completed {
		text-decoration: line-through;
	}
</style>

import Vue from 'vue'
import App from './App.vue'
import chatbot from '../../dist/vue-beautiful-chat.umd.min.js'
import axios from '@/plugins/axios'
import vmodal from 'vue-js-modal'

Vue.use(vmodal, {dialog: true})
Vue.use(chatbot, {componentName: 'chatbot'})
Vue.use(axios)
// eslint-disable-next-line
new Vue({
  el: '#app',
  render: (h) => h(App)
})

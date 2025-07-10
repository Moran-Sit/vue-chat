<template>
  <div :style="{background: backgroundColor}">
    <div class="logo" style="text-align: center;margin-top: 150px;">
      <!-- 替代真实 Logo，可换成本地图片或其他图标 -->
      <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" alt="Google Logo">
    </div>

    <div class="search-box">
      <input type="text" placeholder="Search Google or type a URL">
    </div>

<!--    <Header :chosen-color="chosenColor" :colors="colors" />
    <p class="text-center toggle">
      <a v-if="!isChatOpen" :style="{color: linkColor}" href="#" @click.prevent="openChat()"
        >Open the chat window</a
      >
      <a v-else :style="{color: linkColor}" href="#" @click.prevent="closeChat()"
        >Close the chat window</a
      >
    </p>
    <p class="text-center colors">
      <a
        :style="{background: availableColors.blue.launcher.bg}"
        href="#"
        @click.prevent="setColor('blue')"
        >Blue</a
      >
      <a
        :style="{background: availableColors.red.launcher.bg}"
        href="#"
        @click.prevent="setColor('red')"
        >Red</a
      >
      <a
        :style="{background: availableColors.green.launcher.bg}"
        href="#"
        @click.prevent="setColor('green')"
        >Green</a
      >
      <a
        :style="{background: availableColors.dark.launcher.bg}"
        href="#"
        @click.prevent="setColor('dark')"
        >Dark</a
      >
    </p>
    <v-dialog />
    <p class="text-center messageStyling">
      <label
        >Message styling enabled?
        <input checked type="checkbox" @change="messageStylingToggled" />
      </label>
      <a href="#" @click.prevent="showStylingInfo()">info</a>
    </p>
    <TestArea
      :chosen-color="chosenColor"
      :colors="colors"
      :message-styling="messageStyling"
      :on-message="sendMessage"
      :on-typing="handleTyping"
    />
    <Footer :chosen-color="chosenColor" :colors="colors" />-->
    <chatbot
      :always-scroll-to-bottom="alwaysScrollToBottom"
      :close="closeChat"
      :colors="colors"
      :is-open="isChatOpen"
      :message-list="messageList"
      :message-styling="messageStyling"
      :new-messages-count="newMessagesCount"
      :on-message-was-sent="onMessageWasSent"
      :open="openChat"
      :participants="participants"
      :show-close-button="true"
      :show-launcher="true"
      :show-emoji="true"
      :show-file="false"
      :show-typing-indicator="showTypingIndicator"
      :show-edition="true"
      :show-deletion="true"
      :title="'VIP专属客服'"
      :title-image-url="titleImageUrl"
      :disable-user-list-toggle="false"
      @onType="handleOnType"
      @edit="editMessage"
      @remove="removeMessage"
    >
      <template v-slot:text-message-toolbox="scopedProps">
        <button
          v-if="!scopedProps.me && scopedProps.message.type === 'text'"
          @click.prevent="like(scopedProps.message.id)"
        >
          👍
        </button>
      </template>
      <template v-slot:text-message-body="scopedProps">
        <p class="sc-message--text-content" v-html="scopedProps.messageText"></p>
        <p
          v-if="scopedProps.message.data.meta"
          class="sc-message--meta"
          :style="{color: scopedProps.messageColors.color}"
        >
          {{ scopedProps.message.data.meta }}
        </p>
        <p
          v-if="scopedProps.message.isEdited || scopedProps.message.liked"
          class="sc-message--edited"
        >
          <template v-if="scopedProps.message.isEdited">✎</template>
          <template v-if="scopedProps.message.liked">👍</template>
        </p>
      </template>
      <template v-slot:system-message-body="{message}"> [System]: {{ message.text }}</template>
    </chatbot>
  </div>
</template>

<script>
import messageHistory from './messageHistory'
import chatParticipants from './chatProfiles'
import Header from './Header.vue'
import Footer from './Footer.vue'
import TestArea from './TestArea.vue'
import availableColors from './colors'
import {EventSourcePolyfill} from 'event-source-polyfill'

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    TestArea
  },
  data() {
    return {
      participants: chatParticipants,
      titleImageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png',
      messageList: messageHistory,
      newMessagesCount: 0,
      isChatOpen: false,
      showTypingIndicator: '',
      colors: null,
      availableColors,
      chosenColor: null,
      alwaysScrollToBottom: true,
      messageStyling: true,
      userIsTyping: false,
      eventSource: null
    }
  },
  computed: {
    linkColor() {
      return this.chosenColor === 'dark' ? this.colors.sentMessage.text : this.colors.launcher.bg
    },
    backgroundColor() {
      return this.chosenColor === 'dark' ? this.colors.messageList.bg : '#fff'
    }
  },
  created() {
    this.setColor('blue')
  },
  mounted() {
    this.messageList.forEach((x) => (x.liked = false))
  },
  methods: {
    sendMessage(text) {
      if (text.length > 0) {
        this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1
        this.onMessageWasSent({
          author: 'support',
          type: 'text',
          id: Math.random(),
          data: {text}
        })
      }
    },
    async autoReply(text) {
      if (text.length > 0) {
        const response = await this.axios.get('/chat?message=' + text)
        this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1
        this.onMessageWasSent({
          author: 'support',
          type: 'text',
          id: Math.random(),
          data: {text: response.data}
        })
      }
    },
    autoStreamReply(text) {
      if (text.length > 0) {
        this.showTypingIndicator = 'support'
        if (!!window.EventSource) {
          console.log('EventSource')
          const baseURL = process.env.VUE_APP_API_BASE_URL
          let url = baseURL + '/stream?message=' + text
          let source = new EventSourcePolyfill(url, {
            headers: {
              'WZ-Token':
                'b44b297983114b0d83ab428d5e642a5f_b12204515ff64e9f83a6cd62f3146404_c8b97c1e4b284ae3afd5cc661008d8a1'
            }
          })
          // 自定义类型监听匹配后端，默认message
          // source.addEventListener('custom', function(e) {
          //   console.log('Custom Event Data: ', e.data);
          //   document.getElementById('d').innerHTML += e.data + '<br>';
          //   console.log(e.data);
          //   //服务端推送结束MessageEvent中包含lastEventId则关闭EventSource事件源
          //   //e.lastEventId代表此事件最后Id，一般但不限于关闭事件源
          //   if (e.lastEventId) {
          //     source.close();
          //   }
          // });
          const id = +new Date()
          source.onmessage = (e) => {
            console.log(e)
            let message = this.messageList.find((m) => m.id === id)
            if (!message) {
              this.onMessageWasSent({
                author: 'support',
                type: 'text',
                id: id,
                data: {text: e.data}
              })
            } else {
              message.data.text += e.data
            }
            this.showTypingIndicator = ''
            // let data = eval(e.data);
            // document.getElementById('d').innerHTML = '';
            // for (let i = 0; i < data.length; i++) {
            //服务端推送结束MessageEvent中包含lastEventId则关闭EventSource事件源
            if (e.lastEventId) {
              source.close()
            }
            // }
          }
          source.onopen = function (e) {
            console.log(e)
            console.log('connected server')
          }
          source.onerror = function (e) {
            console.log(e)
            console.log('connecting error & close')
            source.close()
            // window.location.reload();
          }
        }
      }
    },
    handleTyping(text) {
      this.showTypingIndicator =
        text.length > 0 ? this.participants[this.participants.length - 2].id : ''
    },
    onMessageWasSent(message) {
      this.messageList = [...this.messageList, Object.assign({}, message, {id: message.id})]
      if (message.author === 'me') {
        this.autoStreamReply(message.data.text)
      }
    },
    openChat() {
      this.isChatOpen = true
      this.newMessagesCount = 0
    },
    closeChat() {
      this.isChatOpen = false
    },
    setColor(color) {
      this.colors = this.availableColors[color]
      this.chosenColor = color
    },
    showStylingInfo() {
      this.$modal.show('dialog', {
        title: 'Info',
        text: 'You can use *word* to <strong>boldify</strong>, /word/ to <em>emphasize</em>, _word_ to <u>underline</u>, `code` to <code>write = code;</code>, ~this~ to <del>delete</del> and ^sup^ or ¡sub¡ to write <sup>sup</sup> and <sub>sub</sub>'
      })
    },
    messageStylingToggled(e) {
      this.messageStyling = e.target.checked
    },
    handleOnType() {
      this.$root.$emit('onType')
      this.userIsTyping = true
    },
    editMessage(message) {
      const m = this.messageList.find((m) => m.id === message.id)
      m.isEdited = true
      m.data.text = message.data.text
    },
    removeMessage(message) {
      if (confirm('Delete?')) {
        const m = this.messageList.find((m) => m.id === message.id)
        m.type = 'system'
        m.data.text = 'This message has been removed'
      }
    },
    like(id) {
      const m = this.messageList.findIndex((m) => m.id === id)
      var msg = this.messageList[m]
      msg.liked = !msg.liked
      this.$set(this.messageList, m, msg)
    }
  }
}
</script>

<style>
body {
  padding: 0px;
  margin: 0px;
}

* {
  font-family: Avenir Next, Helvetica Neue, Helvetica, sans-serif;
}

.demo-description {
  max-width: 500px;
}

.demo-description img {
  max-width: 500px;
}

.demo-test-area {
  width: 300px;
  box-sizing: border-box;
}

.demo-test-area--text {
  box-sizing: border-box;
  width: 100%;
  margin: 0px;
  padding: 0px;
  resize: none;
  font-family: Avenir Next, Helvetica Neue, Helvetica, sans-serif;
  background: #fafbfc;
  color: #8da2b5;
  border: 1px solid #dde5ed;
  font-size: 16px;
  padding: 16px 15px 14px;
  margin: 0;
  border-radius: 6px;
  outline: none;
  height: 150px;
  margin-bottom: 10px;
}

.demo-monster-img {
  width: 400px;
  display: block;
  margin: 60px auto;
}

.text-center {
  text-align: center;
}

.colors a {
  color: #fff;
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 10px;
}

.toggle a {
  text-decoration: none;
}

.messageStyling {
  font-size: small;
}

.search-box {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 750px; /* 更宽 */
  height: 55px;       /* 更高 */
  border: 1px solid #dfe1e5;
  border-radius: 28px;
  padding: 0 24px;
  box-shadow: 0 1px 6px rgba(32,33,36,.28);
  margin-left: 450px;
  margin-top: 20px;
}

.search-box input {
  flex: 1;
  border: none;
  font-size: 20px;  /* 更大字体 */
  outline: none;
  height: 100%;
}
</style>
